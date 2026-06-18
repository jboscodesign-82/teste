"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SpeechRecognitionState } from "@/types";

interface UseSpeechRecognitionOptions {
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  lang?: string;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { onResult, onError, lang = "pt-BR" } = options;

  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: "",
    interimTranscript: "",
    error: null,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setState((prev) => ({ ...prev, isSupported: !!SpeechRecognitionAPI }));
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setState((prev) => ({
        ...prev,
        error: "Reconhecimento de voz não suportado neste navegador.",
      }));
      return;
    }

    if (isListeningRef.current) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setState((prev) => ({ ...prev, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      setState((prev) => ({
        ...prev,
        transcript: final ? final : prev.transcript,
        interimTranscript: interim,
      }));

      if (final) onResult?.(final, true);
      else if (interim) onResult?.(interim, false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMsg =
        event.error === "not-allowed"
          ? "Permissão de microfone negada."
          : event.error === "network"
          ? "Erro de rede no reconhecimento de voz."
          : `Erro: ${event.error}`;
      setState((prev) => ({ ...prev, error: errorMsg, isListening: false }));
      isListeningRef.current = false;
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      // Auto-restart if we're supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch {
          isListeningRef.current = false;
          setState((prev) => ({ ...prev, isListening: false }));
        }
      } else {
        setState((prev) => ({ ...prev, isListening: false }));
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error: "Não foi possível iniciar o reconhecimento de voz.",
      }));
    }
  }, [lang, onResult, onError]);

  const stop = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setState((prev) => ({ ...prev, isListening: false, interimTranscript: "" }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, transcript: "", interimTranscript: "" }));
  }, []);

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  return { ...state, start, stop, reset };
}
