"use client";

import type { SyncState } from "@/types";
import { Mic, MicOff, Square, Activity, Wifi, WifiOff } from "lucide-react";

interface PresentationControlsProps {
  isListening: boolean;
  syncState: SyncState;
  onStart: () => void;
  onStop: () => void;
  speechError: string | null;
  isSupported: boolean;
}

const STATUS_CONFIG = {
  idle: { label: "Parado", color: "text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
  listening: { label: "Ouvindo", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
  processing: { label: "Processando", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  matched: { label: "Sincronizado", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950" },
  "no-match": { label: "Sem correspondência", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
};

export default function PresentationControls({
  isListening,
  syncState,
  onStart,
  onStop,
  speechError,
  isSupported,
}: PresentationControlsProps) {
  const statusCfg = STATUS_CONFIG[syncState.status];
  const confidencePct = Math.round(syncState.confidence * 100);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-2xl px-4 pb-6">
        <div className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-2xl border border-gray-100 dark:border-gray-800 p-4">
          {/* Status bar */}
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 mb-3 ${statusCfg.bg}`}>
            <div className={`w-2 h-2 rounded-full ${isListening ? "animate-pulse" : ""} ${statusCfg.color} bg-current`} />
            <span className={`text-sm font-medium ${statusCfg.color}`}>{statusCfg.label}</span>
            {syncState.status === "matched" && (
              <span className="ml-auto text-xs text-gray-400">
                {confidencePct}% confiança
              </span>
            )}
          </div>

          {/* Transcript display */}
          {(syncState.interimTranscript || syncState.transcript) && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 min-h-[2.5rem]">
              <p className="text-xs text-gray-400 mb-1">Reconhecido:</p>
              <p className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                {syncState.transcript && (
                  <span>{syncState.transcript} </span>
                )}
                {syncState.interimTranscript && (
                  <span className="text-gray-400 italic">{syncState.interimTranscript}</span>
                )}
              </p>
            </div>
          )}

          {/* Error */}
          {speechError && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
              {speechError}
            </div>
          )}

          {/* Not supported */}
          {!isSupported && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
              <WifiOff className="w-4 h-4 flex-shrink-0" />
              Reconhecimento de voz não suportado. Use Chrome ou Edge.
            </div>
          )}

          {/* Main button */}
          <button
            onClick={isListening ? onStop : onStart}
            disabled={!isSupported}
            className={`
              w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all
              ${isListening
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-red-900"
                : "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900"}
            `}
          >
            {isListening ? (
              <>
                <Square className="w-5 h-5" />
                Parar acompanhamento
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Iniciar acompanhamento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
