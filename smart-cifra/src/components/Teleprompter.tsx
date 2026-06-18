"use client";

import { useCallback, useEffect, useState } from "react";
import type { Song } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLyricSync } from "@/hooks/useLyricSync";
import ChordDisplay from "./ChordDisplay";
import PresentationControls from "./PresentationControls";
import { ArrowLeft, Sun, Moon, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TeleprompterProps {
  song: Song;
}

const FONT_SIZES = ["sm", "md", "lg", "xl", "2xl"] as const;
type FontSizeKey = (typeof FONT_SIZES)[number];

export default function Teleprompter({ song }: TeleprompterProps) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState<FontSizeKey>("lg");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { lines, syncState, processTranscript, registerLineRef, setStatus, reset } =
    useLyricSync(song.lyrics);

  const handleSpeechResult = useCallback(
    (transcript: string, isFinal: boolean) => {
      processTranscript(transcript, isFinal);
    },
    [processTranscript]
  );

  const { isListening, isSupported, error, start, stop } = useSpeechRecognition({
    onResult: handleSpeechResult,
    lang: "pt-BR",
  });

  useEffect(() => {
    if (isListening) {
      setStatus("listening");
    }
  }, [isListening, setStatus]);

  function handleStart() {
    reset();
    start();
  }

  function handleStop() {
    stop();
    setStatus("idle");
  }

  function cycleFontSize(direction: "up" | "down") {
    setFontSize((prev) => {
      const idx = FONT_SIZES.indexOf(prev);
      if (direction === "up") return FONT_SIZES[Math.min(idx + 1, FONT_SIZES.length - 1)];
      return FONT_SIZES[Math.max(idx - 1, 0)];
    });
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex items-center gap-2 px-4 py-3 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">{song.title}</p>
            {song.artist && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => cycleFontSize("down")}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Diminuir fonte"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => cycleFontSize("up")}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Aumentar fonte"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Alternar tema"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Tela cheia"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Lyrics content */}
        <main className="flex-1 px-4 py-6 pb-48 max-w-2xl mx-auto w-full">
          <ChordDisplay
            lines={lines}
            fontSize={fontSize}
            highlightIndex={syncState.currentLineIndex}
            registerRef={registerLineRef}
          />
        </main>

        {/* Presentation controls */}
        <PresentationControls
          isListening={isListening}
          syncState={syncState}
          onStart={handleStart}
          onStop={handleStop}
          speechError={error}
          isSupported={isSupported}
        />
      </div>
    </div>
  );
}
