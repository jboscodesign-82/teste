"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LyricLine, SyncState } from "@/types";
import { findBestMatch } from "@/utils/similarityScore";
import { parseLyrics } from "@/utils/textNormalization";

const CONFIDENCE_THRESHOLD = 0.15;
const SCROLL_BEHAVIOR = "smooth" as const;

export function useLyricSync(lyrics: string) {
  const [lines, setLines] = useState<LyricLine[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    currentLineIndex: 0,
    confidence: 0,
    transcript: "",
    interimTranscript: "",
  });

  const currentLineIndexRef = useRef(0);
  const lineRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    setLines(parseLyrics(lyrics));
    setSyncState({
      status: "idle",
      currentLineIndex: 0,
      confidence: 0,
      transcript: "",
      interimTranscript: "",
    });
    currentLineIndexRef.current = 0;
  }, [lyrics]);

  const registerLineRef = useCallback((index: number, el: HTMLElement | null) => {
    if (el) {
      lineRefs.current.set(index, el);
    } else {
      lineRefs.current.delete(index);
    }
  }, []);

  const scrollToLine = useCallback((lineIndex: number) => {
    const el = lineRefs.current.get(lineIndex);
    if (!el) return;
    el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: "center" });
  }, []);

  const processTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (!transcript.trim() || lines.length === 0) return;

      setSyncState((prev) => ({
        ...prev,
        status: "processing",
        interimTranscript: isFinal ? "" : transcript,
        transcript: isFinal ? transcript : prev.transcript,
      }));

      const result = findBestMatch(
        transcript,
        lines,
        currentLineIndexRef.current
      );

      if (result.score >= CONFIDENCE_THRESHOLD) {
        currentLineIndexRef.current = result.lineIndex;
        setSyncState((prev) => ({
          ...prev,
          status: "matched",
          currentLineIndex: result.lineIndex,
          confidence: result.score,
          transcript: isFinal ? transcript : prev.transcript,
          interimTranscript: isFinal ? "" : transcript,
        }));
        scrollToLine(result.lineIndex);
      } else {
        setSyncState((prev) => ({
          ...prev,
          status: "no-match",
          confidence: result.score,
          transcript: isFinal ? transcript : prev.transcript,
          interimTranscript: isFinal ? "" : transcript,
        }));
      }
    },
    [lines, scrollToLine]
  );

  const setStatus = useCallback((status: SyncState["status"]) => {
    setSyncState((prev) => ({ ...prev, status }));
  }, []);

  const reset = useCallback(() => {
    currentLineIndexRef.current = 0;
    setSyncState({
      status: "idle",
      currentLineIndex: 0,
      confidence: 0,
      transcript: "",
      interimTranscript: "",
    });
  }, []);

  return {
    lines,
    syncState,
    processTranscript,
    registerLineRef,
    setStatus,
    reset,
  };
}
