"use client";

import type { LyricLine } from "@/types";

interface ChordDisplayProps {
  lines: LyricLine[];
  fontSize?: string;
  highlightIndex?: number;
  registerRef?: (index: number, el: HTMLElement | null) => void;
}

const FONT_SIZES: Record<string, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
};

export default function ChordDisplay({
  lines,
  fontSize = "md",
  highlightIndex,
  registerRef,
}: ChordDisplayProps) {
  const textSize = FONT_SIZES[fontSize] ?? FONT_SIZES.md;

  return (
    <div className={`font-mono leading-relaxed ${textSize}`}>
      {lines.map((line) => {
        const isHighlighted = line.index === highlightIndex;
        return (
          <div
            key={line.index}
            ref={registerRef ? (el) => registerRef(line.index, el) : undefined}
            className={`
              px-2 py-0.5 rounded transition-all duration-300
              ${line.isEmpty ? "h-4" : ""}
              ${line.isChord
                ? "text-indigo-500 dark:text-indigo-400 font-bold"
                : "text-gray-800 dark:text-gray-100"}
              ${isHighlighted && !line.isChord && !line.isEmpty
                ? "bg-yellow-100 dark:bg-yellow-900/40 text-gray-900 dark:text-yellow-100 scale-[1.01] shadow-sm"
                : ""}
            `}
          >
            {line.isEmpty ? " " : line.raw}
          </div>
        );
      })}
    </div>
  );
}
