import type { Song } from "@/types";
import { DEFAULT_SONGS } from "@/data/defaultSongs";

const STORAGE_KEY = "smart-cifra-songs";

function getUserSongs(): Song[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getAllSongs(): Song[] {
  const userSongs = getUserSongs();
  const defaultIds = new Set(DEFAULT_SONGS.map((s) => s.id));
  const filtered = userSongs.filter((s) => !defaultIds.has(s.id));
  return [...DEFAULT_SONGS, ...filtered];
}

export function getSongById(id: string): Song | null {
  return getAllSongs().find((s) => s.id === id) ?? null;
}

export function saveSong(song: Omit<Song, "id" | "createdAt" | "updatedAt">): Song {
  const songs = getAllSongs();
  const now = Date.now();
  const newSong: Song = {
    ...song,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newSong, ...songs]));
  return newSong;
}

export function updateSong(id: string, data: Partial<Omit<Song, "id" | "createdAt">>): Song | null {
  const songs = getAllSongs();
  const idx = songs.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  const updated: Song = { ...songs[idx], ...data, updatedAt: Date.now() };
  songs[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  return updated;
}

export function deleteSong(id: string): boolean {
  const songs = getAllSongs();
  const filtered = songs.filter((s) => s.id !== id);
  if (filtered.length === songs.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
