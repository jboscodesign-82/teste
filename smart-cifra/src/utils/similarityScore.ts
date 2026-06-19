import type { LyricLine } from "@/types";
import { normalizeText, phoneticNormalize } from "./textNormalization";

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function wordOverlapScore(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.split(" ").filter(Boolean));
  const wordsB = new Set(b.split(" ").filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });
  return (overlap * 2) / (wordsA.size + wordsB.size);
}

function levenshteinScore(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}

function containsScore(transcript: string, line: string): number {
  if (!transcript || !line) return 0;
  const tWords = transcript.split(" ").filter(Boolean);
  const lWords = line.split(" ").filter(Boolean);
  if (tWords.length === 0 || lWords.length === 0) return 0;

  let maxRun = 0;
  let currentRun = 0;
  let tIdx = 0;
  for (const lw of lWords) {
    if (tIdx < tWords.length && tWords[tIdx] === lw) {
      currentRun++;
      tIdx++;
      maxRun = Math.max(maxRun, currentRun);
    } else {
      currentRun = 0;
    }
  }
  return maxRun / Math.max(tWords.length, lWords.length);
}

export function computeScore(transcript: string, lineText: string): number {
  if (!lineText) return 0;

  // Camada 1: normalização textual padrão
  const normT = normalizeText(transcript);
  const normL = normalizeText(lineText);
  if (!normL) return 0;

  const overlap   = wordOverlapScore(normT, normL);
  const lev       = levenshteinScore(normT, normL);
  const contains  = containsScore(normT, normL);

  // Camada 2: normalização fonética (PT-BR + EN)
  const phonT = phoneticNormalize(transcript);
  const phonL = phoneticNormalize(lineText);

  const phonOverlap  = wordOverlapScore(phonT, phonL);
  const phonContains = containsScore(phonT, phonL);

  // Score composto: 80% texto + 20% fonética
  // A camada fonética desempata quando a grafia difere mas o som é similar
  return (
    overlap        * 0.35 +
    lev            * 0.15 +
    contains       * 0.30 +
    phonOverlap    * 0.10 +
    phonContains   * 0.10
  );
}

export interface MatchResult {
  lineIndex: number;
  score: number;
}

/**
 * Viés de posição: música progride pra frente, então favorecemos a próxima
 * linha/estrofe. Sem isso, ao pausar no fim de uma estrofe a linha atual
 * "segura" o destaque e o avanço para a linha de baixo demora.
 */
function positionBias(delta: number): number {
  if (delta === 0) return 0.04;             // estabilidade na linha atual
  if (delta > 0) {
    // avanço: pico nas 1-3 linhas seguintes, decai gradualmente
    return Math.max(0, 0.16 - (delta - 1) * 0.018);
  }
  // voltar é menos comum (repetição de refrão): bônus pequeno
  return Math.max(0, 0.03 - Math.abs(delta) * 0.008);
}

export function findBestMatch(
  transcript: string,
  lines: LyricLine[],
  currentLineIndex: number,
  windowSize = 20
): MatchResult {
  if (!transcript.trim()) return { lineIndex: currentLineIndex, score: 0 };

  const lyricsLines = lines.filter((l) => !l.isChord && !l.isEmpty);
  if (lyricsLines.length === 0) return { lineIndex: 0, score: 0 };

  const currentLyricIdx = lyricsLines.findIndex((l) => l.index >= currentLineIndex);
  const safeIdx = currentLyricIdx === -1 ? 0 : currentLyricIdx;

  const start = Math.max(0, safeIdx - Math.floor(windowSize / 2));
  const end = Math.min(lyricsLines.length - 1, safeIdx + Math.ceil(windowSize / 2));
  const candidates = lyricsLines.slice(start, end + 1);

  let best: MatchResult = { lineIndex: currentLineIndex, score: 0 };

  for (const line of candidates) {
    const textScore = computeScore(transcript, line.text);
    if (textScore <= 0) continue; // sem nenhuma semelhança textual, não considera

    const delta = lyricsLines.indexOf(line) - safeIdx;
    const score = textScore + positionBias(delta);

    if (score > best.score) {
      best = { lineIndex: line.index, score };
    }
  }

  return best;
}

