"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LyricLine, SyncState } from "@/types";
import { findBestMatch } from "@/utils/similarityScore";
import { parseLyrics } from "@/utils/textNormalization";

const CONFIDENCE_THRESHOLD = 0.15;
const SCROLL_BEHAVIOR = "smooth" as const;

// Após este silêncio (ms), libera reposicionamento livre (voltar / pular longe)
const SILENCE_REPOSITION_MS = 3500;

// Máximo de linhas que pode avançar de uma vez durante fala ativa
const MAX_FORWARD_JUMP = 5;

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
  // Marca o momento da última fala recebida para detectar silêncio
  const lastSpeechRef = useRef<number>(0);

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
    lastSpeechRef.current = 0;
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

    const LOOK_AHEAD = 6;
    const TOP_OFFSET = 0.28;

    const allIndices = Array.from(lineRefs.current.keys()).sort((a, b) => a - b);
    const currentPos = allIndices.indexOf(lineIndex);
    const lookAheadPos = Math.min(currentPos + LOOK_AHEAD, allIndices.length - 1);
    const hasAhead = lookAheadPos > currentPos;

    if (hasAhead) {
      const rect = el.getBoundingClientRect();
      const absoluteTop = rect.top + window.scrollY;
      const targetY = absoluteTop - window.innerHeight * TOP_OFFSET;
      window.scrollTo({ top: Math.max(0, targetY), behavior: SCROLL_BEHAVIOR });
    } else {
      el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: "center" });
    }
  }, []);

  const processTranscript = useCallback(
    (transcript: string, isFinal: boolean) => {
      if (!transcript.trim() || lines.length === 0) return;

      const now = Date.now();
      // Silêncio desde a última fala — libera reposicionamento livre
      const silenceDuration = lastSpeechRef.current === 0 ? 0 : now - lastSpeechRef.current;
      const allowReposition = silenceDuration > SILENCE_REPOSITION_MS;
      lastSpeechRef.current = now;

      setSyncState((prev) => ({
        ...prev,
        status: "processing",
        interimTranscript: isFinal ? "" : transcript,
        transcript: isFinal ? transcript : prev.transcript,
      }));

      // Apenas as últimas palavras para não arrastar contexto de estrofes passadas
      const words = transcript.trim().split(/\s+/);
      const recent = words.slice(-8).join(" ");

      const result = findBestMatch(recent, lines, currentLineIndexRef.current);

      if (result.score < CONFIDENCE_THRESHOLD) {
        setSyncState((prev) => ({
          ...prev,
          status: "no-match",
          confidence: result.score,
          transcript: isFinal ? transcript : prev.transcript,
          interimTranscript: isFinal ? "" : transcript,
        }));
        return;
      }

      // --- Modo trilho: restrições durante fala ativa ---
      if (!allowReposition) {
        const lyricsLines = lines.filter((l) => !l.isChord && !l.isEmpty);
        const currentPos = lyricsLines.findIndex((l) => l.index >= currentLineIndexRef.current);
        const resultPos  = lyricsLines.findIndex((l) => l.index >= result.lineIndex);
        const delta = resultPos - currentPos;

        // Bloqueia movimento para trás
        if (delta < 0) return;

        // Bloqueia saltos muito grandes para frente
        if (delta > MAX_FORWARD_JUMP) return;
      }

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
    },
    [lines, scrollToLine]
  );

  const setStatus = useCallback((status: SyncState["status"]) => {
    setSyncState((prev) => ({ ...prev, status }));
  }, []);

  const reset = useCallback(() => {
    currentLineIndexRef.current = 0;
    lastSpeechRef.current = 0;
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
