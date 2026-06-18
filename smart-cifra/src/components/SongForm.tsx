"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Song } from "@/types";
import { saveSong, updateSong } from "@/services/songStorage";

interface SongFormProps {
  song?: Song;
}

const EXAMPLE_LYRICS = `[Intro] Am  G  C  F

[Verso]
Am              G
Hoje cedo acordei
C                  F
E olhei para o céu azul

Am            G
O sol já brilhava
C               F
E eu pensei em você

[Refrão]
F              G
Você é tudo pra mim
Am             E
Não tem como esquecer
F              G
Cada momento contigo
Am
Vai pra sempre ficar`;

export default function SongForm({ song }: SongFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(song?.title ?? "");
  const [artist, setArtist] = useState(song?.artist ?? "");
  const [lyrics, setLyrics] = useState(song?.lyrics ?? "");
  const [saving, setSaving] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !lyrics.trim()) return;
    setSaving(true);
    if (song) {
      updateSong(song.id, { title: title.trim(), artist: artist.trim(), lyrics });
      router.push(`/musicas/${song.id}`);
    } else {
      const saved = saveSong({ title: title.trim(), artist: artist.trim(), lyrics });
      router.push(`/musicas/${saved.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Título *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nome da música"
          required
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Artista
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Nome do artista ou banda"
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Letra e Cifras *
          </label>
          {!song && (
            <button
              type="button"
              onClick={() => setLyrics(EXAMPLE_LYRICS)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Carregar exemplo
            </button>
          )}
        </div>
        <textarea
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder={"Cole aqui a letra com cifras...\n\nExemplo:\nAm        G\nHoje cedo acordei"}
          required
          rows={20}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm resize-y"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cole a cifra no formato texto. Linhas com acordes (Am, G, C) são detectadas automaticamente.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim() || !lyrics.trim()}
          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 text-white font-medium transition-colors"
        >
          {saving ? "Salvando..." : song ? "Salvar alterações" : "Salvar música"}
        </button>
      </div>
    </form>
  );
}
