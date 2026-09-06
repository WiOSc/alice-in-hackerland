import LoginForm from '@/components/auth/login-form';

export default function AdminLoginPage() {
  return (
    <div>
      <h1>Admin Login</h1>
      <LoginForm expectedRole="admin" />
    </div>
  );
} //for testing 