"use client";

import { useEffect, useRef } from "react";

/**
 * Mantém a tela acesa enquanto o componente está montado.
 * Re-adquire o lock automaticamente ao voltar de background
 * (o navegador libera o lock quando a aba vai pra segundo plano).
 */
export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  async function acquire() {
    if (!("wakeLock" in navigator)) return;
    try {
      lockRef.current = await navigator.wakeLock.request("screen");
    } catch {
      // Silencia: alguns browsers negam silenciosamente em http ou modo privado
    }
  }

  useEffect(() => {
    acquire();

    // Wake lock é liberado automaticamente ao esconder a aba; re-adquire ao voltar
    function onVisibilityChange() {
      if (document.visibilityState === "visible") acquire();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      lockRef.current?.release().catch(() => {});
    };
  }, []);
}
