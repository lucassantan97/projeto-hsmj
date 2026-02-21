'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AppShell from '@/components/app-shell';
import FullPageLoader from '@/components/ui/loader';
import { useEffect } from 'react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return <FullPageLoader />;
  }
  
  return <AppShell />;
}
