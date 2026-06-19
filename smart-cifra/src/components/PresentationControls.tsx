"use client";

import type { SyncState } from "@/types";
import { Mic, Square, WifiOff } from "lucide-react";

interface PresentationControlsProps {
  isListening: boolean;
  syncState: SyncState;
  onStart: () => void;
  onStop: () => void;
  speechError: string | null;
  isSupported: boolean;
}

export default function PresentationControls({
  isListening,
  syncState,
  onStart,
  onStop,
  speechError,
  isSupported,
}: PresentationControlsProps) {
  // Modo reprodução: só o botão circular no canto inferior direito
  if (isListening) {
    return (
      <button
        onClick={onStop}
        className="fixed bottom-8 right-6 z-50 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl shadow-red-900/40 flex items-center justify-center transition-all active:scale-95 animate-scale-in"
        title="Parar acompanhamento"
      >
        <Square className="w-6 h-6" strokeWidth={1.5} fill="white" />
        <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-30" />
      </button>
    );
  }

  // Modo parado: painel completo para iniciar
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-2xl px-4 pb-6">
        <div className="rounded-4xl bg-white/95 dark:bg-surface/95 backdrop-blur-xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 flex flex-col gap-3 animate-slide-up">
          {!isSupported && (
            <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              Reconhecimento de voz não suportado. Use Chrome ou Edge.
            </div>
          )}

          {speechError && (
            <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 text-sm">
              {speechError}
            </div>
          )}

          <button
            onClick={onStart}
            disabled={!isSupported}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-ink font-bold text-lg shadow-lg shadow-brand/25 transition-all active:scale-[0.98]"
          >
            <Mic className="w-5 h-5" strokeWidth={1.5} />
            Iniciar acompanhamento
          </button>
        </div>
      </div>
    </div>
  );
}
