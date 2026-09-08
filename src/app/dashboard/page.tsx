import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/admin';
import DashboardClient from './client';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;

  if (!session) {
    redirect('/login');
  }

  let decoded;
  try {
    decoded = await adminAuth.verifySessionCookie(session);
  } catch {
    redirect('/login');
  }

  return <DashboardClient decoded={decoded} />;
}