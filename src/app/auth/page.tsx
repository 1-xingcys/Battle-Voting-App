'use client'

import { AuthForm } from '@/app/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../component/Footer';

export default function AuthPage() {
  const { user, loading, mounted } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="spinner-container">
        <p>載入中...</p>
      </div>
    );
  }

  if (user) {
    return null; // 會自動重導向到 profile 頁面
  }

  return (
    <main>
      <AuthForm />
      <Footer />
    </main>
  );
} 