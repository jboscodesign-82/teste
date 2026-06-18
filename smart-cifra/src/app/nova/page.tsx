import Link from "next/link";
import SongForm from "@/components/SongForm";
import { ArrowLeft } from "lucide-react";

export default function NovaPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Nova música</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <SongForm />
      </main>
    </div>
  );
}
