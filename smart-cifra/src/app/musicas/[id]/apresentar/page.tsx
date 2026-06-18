"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Song } from "@/types";
import { getSongById } from "@/services/songStorage";
import Teleprompter from "@/components/Teleprompter";

export default function ApresentarPage() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);

  useEffect(() => {
    const s = getSongById(params.id as string);
    if (!s) {
      router.push("/");
      return;
    }
    setSong(s);
  }, [params.id, router]);

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Teleprompter song={song} />;
}
