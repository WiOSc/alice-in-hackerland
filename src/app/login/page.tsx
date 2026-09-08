import LoginForm from '@/components/auth/login-form';
import { LoginLayoutUI } from '@/components/ui/login-layout';

export default function LoginPage() {
  return (
    <LoginLayoutUI>
      <LoginForm expectedRole="team" />
    </LoginLayoutUI>
  );
}