'use client';

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { usePathname } from "next/navigation";

const Header = () => {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  
  // Don't show auth links on auth pages
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <header className="py-6 px-4 md:px-8 border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-semibold text-xl">Leftover</Link>
        </div>
        
        {!user && !isAuthPage ? (
          <>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="font-medium hover:text-black/70 dark:hover:text-white/70 transition-colors">
                Home
              </Link>
              <Link href="#features" className="font-medium hover:text-black/70 dark:hover:text-white/70 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="font-medium hover:text-black/70 dark:hover:text-white/70 transition-colors">
                How It Works
              </Link>
              <a href="https://easy-paneer-e5a.notion.site/Leftover-Changelog-1df36dfb0ae38008a707fbccb444240d" target="_blank" className="font-medium hover:text-black/70 dark:hover:text-white/70 transition-colors">
                Changelog
            </a>
            </nav>
            <div className="flex items-center gap-3">
              <Link 
                href="/auth/signin" 
                className="rounded-full border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-sm text-black/70 dark:text-white/70 hidden md:block">
              {user?.email}
            </div>
            <a href="https://easy-paneer-e5a.notion.site/Leftover-Changelog-1df36dfb0ae38008a707fbccb444240d" target="_blank">
                Changelog
            </a>
            <button
              onClick={() => signOut()}
              className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 