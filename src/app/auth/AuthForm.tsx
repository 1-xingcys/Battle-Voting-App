'use client'

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, displayName);

      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <h1>{isLogin ? '登入' : '註冊'}</h1>

        {!isLogin && (
          <div className="form-group">
            <label htmlFor="displayName">顯示名稱</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="請輸入顯示名稱"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">電子郵件</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="請輸入電子郵件"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">密碼</label>
          <div className="password-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '隱藏' : '顯示'}
            </button>
          </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="button" disabled={loading}>
          {loading ? (isLogin ? '登入中...' : '註冊中...') : (isLogin ? '登入' : '註冊')}
        </button>

        <p className="text-center">
          {isLogin ? '還沒有帳號？' : '已經有帳號？'}
          <button
            type="button"
            className="button-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? '立即註冊' : '立即登入'}
          </button>
        </p>
      </form>
    </div>
  );
} 