'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

type RouteGuardProps = {
  children: React.ReactNode;
};

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in, redirect to sign in page
        router.push('/auth/signin');
      } else {
        // Logged in, allow access
        setAuthorized(true);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-foreground"></div>
      </div>
    );
  }

  // Show children only if authorized
  return authorized ? <>{children}</> : null;
} 