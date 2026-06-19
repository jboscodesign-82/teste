"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Song } from "@/types";
import { getSongById } from "@/services/songStorage";
import { parseLyrics } from "@/utils/textNormalization";
import ChordDisplay from "@/components/ChordDisplay";
import SongForm from "@/components/SongForm";
import { ArrowLeft, Play, Sun, Moon } from "lucide-react";

export default function SongPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const isEditing = searchParams.get("edit") === "1";

  useEffect(() => {
    const s = getSongById(params.id as string);
    if (!s) {
      router.push("/");
      return;
    }
    setSong(s);
  }, [params.id, router]);

  if (!song) return null;

  const lines = parseLyrics(song.lyrics);

  if (isEditing) {
    return (
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
              <Link
                href={`/musicas/${song.id}`}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar música</h1>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-6">
            <SongForm song={song} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-white dark:bg-ink">
        <header className="sticky top-0 z-10 bg-white/90 dark:bg-ink/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 animate-fade-in">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
            <Link
              href="/"
              className="p-2.5 rounded-full text-gray-500 dark:text-gray-300 bg-gray-100/60 dark:bg-surface-light hover:bg-gray-200 dark:hover:bg-surface-lighter transition-colors active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 min-w-0 px-1">
              <p className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
              {song.artist && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
              )}
            </div>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-light transition-colors active:scale-95"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 pb-28 animate-fade-in">
          <ChordDisplay lines={lines} fontSize="md" />
        </main>

        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-10">
          <Link
            href={`/musicas/${song.id}/apresentar`}
            className="flex items-center gap-2 rounded-3xl bg-brand hover:bg-brand-dark px-8 py-4 text-ink font-bold text-lg shadow-xl shadow-brand/25 transition-all active:scale-95 animate-slide-up"
          >
            <Play className="w-5 h-5 fill-ink" />
            Apresentar com voz
          </Link>
        </div>
      </div>
    </div>
  );
}
