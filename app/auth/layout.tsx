'use client';

import Link from "next/link";
import Footer from "../components/Footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] font-[family-name:var(--font-geist-sans)]">
      <header className="py-6 px-4 md:px-8 border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold text-xl">Leftover</Link>
          </div>
          <Link 
            href="/" 
            className="font-medium hover:text-black/70 dark:hover:text-white/70 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>
      
      {children}
      
      <Footer />
    </div>
  );
} 