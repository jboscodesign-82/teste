"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
          <Music className="w-8 h-8 text-brand" strokeWidth={1.5} />
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
          {/* Capa: foto se disponível, ícone genérico caso não */}
          <div className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105">
            {song.coverImage ? (
              <Image
                src={song.coverImage}
                alt={song.artist || song.title}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/25 to-brand/5 flex items-center justify-center">
                <Music className="w-6 h-6 text-brand" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white truncate">{song.title}</p>
            {song.artist && (
              <p className="text-sm text-gray-400 truncate mt-0.5">{song.artist}</p>
            )}
          </div>

          {/* Botão play outline circular */}
          <div className="w-11 h-11 rounded-full border-2 border-brand flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-brand group-active:scale-95">
            <Play
              className="w-5 h-5 text-brand group-hover:text-ink translate-x-0.5 transition-colors"
              strokeWidth={1.5}
              fill="none"
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
