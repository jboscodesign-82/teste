"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Song } from "@/types";
import { getAllSongs } from "@/services/songStorage";
import { Music, ChevronRight } from "lucide-react";

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    setSongs(getAllSongs());
  }, []);

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <Music className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Nenhuma música disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {songs.map((song) => (
        <Link
          key={song.id}
          href={`/musicas/${song.id}/apresentar`}
          className="group flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
            {song.artist && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
            )}
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
        </Link>
      ))}
    </div>
  );
}
