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

/**
 * Normalização fonética para PT-BR e EN.
 * Converte grafias diferentes que soam igual, tornando a comparação
 * resiliente a variações de pronúncia e erros do reconhecedor de voz.
 */
export function phoneticNormalize(text: string): string {
  let s = normalizeText(text);

  // --- PT-BR ---
  s = s
    .replace(/lh/g, "li")           // lhama → liama
    .replace(/nh/g, "ni")           // ninho → ninio
    .replace(/cao/g, "sam")         // coração → corosam
    .replace(/sao/g, "sam")         // são → sam
    .replace(/cao/g, "sam")
    .replace(/oes/g, "ois")         // canções → cansois
    .replace(/ao\b/g, "am")         // terminações -ão
    .replace(/\bao/g, "am")
    .replace(/ae/g, "en")           // mãe → men
    .replace(/oe/g, "oi")           // não → noi (pt oral)
    .replace(/x/g, "s")             // próximo → prosimo
    .replace(/rr/g, "r")            // terra → tera
    .replace(/ss/g, "s")            // passo → paso
    .replace(/sc/g, "s")            // nascer → nasr
    .replace(/sç/g, "s")
    .replace(/ce/g, "se")           // cedo → sedo
    .replace(/ci/g, "si")           // cinco → sinco
    .replace(/ge/g, "je")           // gente → jente
    .replace(/gi/g, "ji")           // girafa → jirava
    .replace(/ch/g, "x")            // chave → xave
    .replace(/qu/g, "k")            // que → ke
    .replace(/gu/g, "g");           // guerra → gera

  // --- English ---
  s = s
    .replace(/ph/g, "f")            // phone → fone
    .replace(/ck/g, "k")            // back → bak
    .replace(/wh/g, "w")            // what → wat
    .replace(/kn/g, "n")            // know → now
    .replace(/wr/g, "r")            // write → rite
    .replace(/ght/g, "t")           // night → nit
    .replace(/gh/g, "g")            // ghost → gost
    .replace(/th/g, "d")            // the → de (approx)
    .replace(/\bw([aeiou])/g, "v$1") // was → vas (pt speaker hearing)
    .replace(/([aeiou])r\b/g, "$1") // car → ca (rhotic drop)
    .replace(/ing\b/g, "in")        // singing → singin
    .replace(/ed\b/g, "d");         // loved → lovd

  // --- Geral ---
  s = s
    .replace(/([^aeiou\s])\1+/g, "$1") // consoantes duplas → simples
    .replace(/\s+/g, " ")
    .trim();

  return s;
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return CHORD_PATTERN.test(trimmed);
}

export function stripChordAnnotations(text: string): string {
  return text.replace(/\[([A-G][#b]?[^\]]*)\]/g, "").replace(/\s+/g, " ").trim();
}

// Marcadores de seção: [Intro], [Verso], [Refrão], [Bridge], etc.
// São exibidos normalmente mas ignorados no matching de voz.
function isSectionMarker(line: string): boolean {
  return /^\s*\[.+\]\s*$/.test(line);
}

export function parseLyrics(lyrics: string): LyricLine[] {
  const rawLines = lyrics.split("\n");
  return rawLines.map((raw, index) => {
    const stripped = stripChordAnnotations(raw);
    const chord = isChordLine(stripped);
    const section = isSectionMarker(raw.trim());
    // Marcadores de seção têm text="" para não participar do matching
    const text = (chord || section) ? "" : stripped;
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
