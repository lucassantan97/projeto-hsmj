import AppShell from '@/components/app-shell';
import { FirebaseClientProvider } from '@/firebase';

export default function Home() {
  return (
    <FirebaseClientProvider>
      <AppShell />
    </FirebaseClientProvider>
  );
}
