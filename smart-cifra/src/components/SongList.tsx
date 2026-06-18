"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Song } from "@/types";
import { deleteSong, getAllSongs } from "@/services/songStorage";
import { Music, Trash2, Play, Edit3, ChevronRight } from "lucide-react";

export default function SongList() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setSongs(getAllSongs());
  }, []);

  function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir "${title}"?`)) return;
    setDeleting(id);
    deleteSong(id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
          <Music className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Nenhuma música ainda</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Adicione sua primeira cifra para começar</p>
        </div>
        <Link
          href="/nova"
          className="mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white font-medium transition-colors"
        >
          Adicionar música
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {songs.map((song) => (
        <div
          key={song.id}
          className="group flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-indigo-500" />
          </div>

          <Link href={`/musicas/${song.id}`} className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{song.title}</p>
            {song.artist && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{song.artist}</p>
            )}
          </Link>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/musicas/${song.id}/apresentar`}
              className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
              title="Apresentar"
            >
              <Play className="w-4 h-4" />
            </Link>
            <Link
              href={`/musicas/${song.id}?edit=1`}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Editar"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleDelete(song.id, song.title)}
              disabled={deleting === song.id}
              className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              title="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Link href={`/musicas/${song.id}`} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ))}
    </div>
  );
}
