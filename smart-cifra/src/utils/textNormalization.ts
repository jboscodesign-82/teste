import type { LyricLine } from "@/types";

const CHORD_PATTERN = /^[\s]*([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|\d+|\/[A-G][#b]?)*[\s]*)+[\s]*$/;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  // If more than 60% of non-space chars are chord-like, treat as chord line
  return CHORD_PATTERN.test(trimmed);
}

export function stripChordAnnotations(text: string): string {
  // Remove inline chord annotations like [Am], [C#m7], [G/B]
  return text.replace(/\[([A-G][#b]?[^\]]*)\]/g, "").replace(/\s+/g, " ").trim();
}

export function parseLyrics(lyrics: string): LyricLine[] {
  const rawLines = lyrics.split("\n");
  return rawLines.map((raw, index) => {
    const stripped = stripChordAnnotations(raw);
    const chord = isChordLine(stripped);
    const text = chord ? "" : stripped;
    return {
      index,
      raw,
      text,
      normalizedText: normalizeText(text),
      isChord: chord,
      isEmpty: raw.trim() === "",
    };
  });
}
