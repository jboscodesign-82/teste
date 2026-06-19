import SongList from "@/components/SongList";
import { Music2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-10 bg-ink/80 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-5 pt-6 pb-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Music2 className="w-5 h-5 text-ink" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-gray-400 leading-none">Bem-vindo ao</p>
              <h1 className="text-xl font-extrabold tracking-tight text-white">SingFlow</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        <div className="mb-7 animate-slide-up">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Suas <span className="text-brand">músicas</span>
          </h2>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Toque em uma música para apresentar com auto-scroll por voz
          </p>
        </div>
        <SongList />
      </main>
    </div>
  );
}
