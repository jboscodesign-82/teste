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
              px-3 py-0.5 rounded-xl transition-all duration-300
              ${line.isEmpty ? "h-4" : ""}
              ${line.isChord
                ? "text-brand-dark dark:text-brand font-bold"
                : "text-gray-800 dark:text-gray-100"}
              ${isHighlighted && !line.isChord && !line.isEmpty
                ? "bg-brand/15 dark:bg-brand/15 text-gray-900 dark:text-white border-l-2 border-brand scale-[1.01]"
                : "border-l-2 border-transparent"}
            `}
          >
            {line.isEmpty ? " " : line.raw}
          </div>
        );
      })}
    </div>
  );
}
