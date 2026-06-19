"use client";

import { useEffect, useRef } from "react";

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);
  const activeRef = useRef(true); // false quando o componente desmonta

  async function acquire() {
    if (!("wakeLock" in navigator)) return;
    if (!activeRef.current) return;
    if (document.visibilityState !== "visible") return;

    try {
      // Libera lock anterior se ainda existir
      if (lockRef.current) {
        await lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }

      const sentinel = await navigator.wakeLock.request("screen");
      lockRef.current = sentinel;

      // Re-adquire automaticamente se o browser liberar o lock
      // (acontece ao minimizar o app, trocar de aba, economia de bateria, etc.)
      sentinel.addEventListener("release", () => {
        if (activeRef.current && document.visibilityState === "visible") {
          acquire();
        }
      });
    } catch {
      // Silencia: iOS antigo, modo privado, economia de bateria forçada
    }
  }

  useEffect(() => {
    activeRef.current = true;
    acquire();

    // Ao voltar de background, re-adquire (o lock é sempre liberado ao esconder)
    function onVisibilityChange() {
      if (document.visibilityState === "visible") acquire();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      activeRef.current = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, []);
}
