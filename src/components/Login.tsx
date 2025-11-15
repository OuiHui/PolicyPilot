import { useState } from 'react';
import { AuthForm } from './ui/auth-form';

type LoginProps = {
  onLogin: (email: string) => void;
};

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = (email: string, password: string) => {
    // In a real app, you would authenticate with the backend here
    // For now, we'll simulate a successful login/signup
    console.log(mode === 'login' ? 'Logging in:' : 'Signing up:', email);
    onLogin(email);
  };

  const handleGoogleAuth = () => {
    // Simulate OAuth login/signup
    onLogin('user@gmail.com');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleSubmit}
      onGoogleSignup={handleGoogleAuth}
      onToggleMode={toggleMode}
    />
  );
}
