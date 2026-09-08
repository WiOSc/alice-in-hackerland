import LoginForm from '@/components/auth/login-form';
import { LoginLayoutUI } from '@/components/ui/login-layout';

export default function AdminLoginPage() {
  return (
    <LoginLayoutUI>
      <LoginForm expectedRole="admin" />
    </LoginLayoutUI>
  );
}