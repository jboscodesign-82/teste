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

    const LOOK_AHEAD = 6; // linhas à frente para antecipar o scroll
    const TOP_OFFSET = 0.28; // posição da linha atual: 28% do topo da tela

    const allIndices = Array.from(lineRefs.current.keys()).sort((a, b) => a - b);
    const currentPos = allIndices.indexOf(lineIndex);
    const lookAheadPos = Math.min(currentPos + LOOK_AHEAD, allIndices.length - 1);
    const hasAhead = lookAheadPos > currentPos;

    if (hasAhead) {
      // Posiciona linha atual a ~28% do topo, revelando conteúdo futuro abaixo
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      const targetY = absoluteTop - window.innerHeight * TOP_OFFSET;
      window.scrollTo({ top: Math.max(0, targetY), behavior: SCROLL_BEHAVIOR });
    } else {
      // Últimas linhas: centraliza normalmente
      el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: "center" });
    }
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

      // Usa só as últimas palavras faladas: ao virar de estrofe, evita que
      // o texto acumulado da estrofe anterior puxe o match de volta.
      const words = transcript.trim().split(/\s+/);
      const recent = words.slice(-8).join(" ");

      const result = findBestMatch(
        recent,
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
