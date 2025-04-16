'use client';

import Link from "next/link";

export default function CheckEmail() {
  return (
    <main className="py-12 px-4 md:px-8 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-8 w-8 text-green-600 dark:text-green-400"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Check Your Email</h1>
        
        <div className="bg-background rounded-lg border border-black/10 dark:border-white/10 p-6 shadow-sm mb-6">
          <p className="text-black/70 dark:text-white/70 mb-4">
            We've sent a confirmation email to the address you provided. Please click the link in the email to verify your account.
          </p>
          
          <p className="text-black/70 dark:text-white/70">
            If you don't see the email in your inbox, please check your spam folder.
          </p>
        </div>

        <div className="space-x-4">
          <Link
            href="/auth/signin"
            className="inline-block rounded-md border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Back to Sign In
          </Link>
          
          <Link
            href="/"
            className="inline-block rounded-md border border-black/10 dark:border-white/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 