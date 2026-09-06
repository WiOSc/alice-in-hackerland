import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div>
      <h1>Team Login</h1>
      <LoginForm expectedRole="team" />
    </div>
  );
}  //for testing 