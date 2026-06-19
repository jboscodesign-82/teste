export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics: string;
  createdAt: number;
  updatedAt: number;
  coverImage?: string;
}

export interface LyricLine {
  index: number;
  raw: string;
  text: string;
  normalizedText: string;
  isChord: boolean;
  isEmpty: boolean;
}

export type SyncStatus = "idle" | "listening" | "processing" | "matched" | "no-match";

export interface SyncState {
  status: SyncStatus;
  currentLineIndex: number;
  confidence: number;
  transcript: string;
  interimTranscript: string;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export type Theme = "light" | "dark";

export interface FontSize {
  label: string;
  value: string;
  tailwind: string;
}
