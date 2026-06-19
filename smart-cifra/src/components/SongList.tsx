"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Song } from "@/types";
import { getAllSongs } from "@/services/songStorage";
import { Music, Play } from "lucide-react";

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSongs(getAllSongs());
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-surface-light flex items-center justify-center">
          <Music className="w-8 h-8 text-brand" />
        </div>
        <p className="text-lg font-medium text-gray-300">Nenhuma música disponível</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 stagger">
      {songs.map((song) => (
        <Link
          key={song.id}
          href={`/musicas/${song.id}/apresentar`}
          className="group flex items-center gap-4 rounded-3xl bg-surface border border-white/5 p-3.5 transition-all duration-300 hover:bg-surface-light hover:border-white/10 active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand/25 to-brand/5 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
            <Music className="w-6 h-6 text-brand" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{song.title}</p>
            {song.artist && (
              <p className="text-sm text-gray-400 truncate mt-0.5">{song.artist}</p>
            )}
          </div>

          <div className="w-11 h-11 rounded-full bg-brand flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand/20 transition-all duration-300 group-hover:scale-110 group-active:scale-95">
            <Play className="w-5 h-5 text-ink fill-ink translate-x-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}
