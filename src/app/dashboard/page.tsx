import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/admin';
import CreateTeamForm from '@/components/admin/create-team-form';

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

  return (
    <div>
      <h1>Dashboard</h1>
      {decoded.role === 'admin' && (
        <>
          <h2>Create Team Account</h2>
          <CreateTeamForm />
        </>
      )}
      {decoded.role === 'team' && (
        <p>Welcome, team member. Team ID: {decoded.teamId ?? 'N/A'}</p>
      )}
    </div>
  );
}  //for testing