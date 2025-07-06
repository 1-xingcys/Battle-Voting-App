'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Loading from './component/Loading';

export default function HomePage() {
  const router = useRouter();
  const { user, loading, mounted } = useAuth();

  useEffect(() => {
    if (user && mounted && !loading) {
      router.push('/dashboard');
    }
  }, [user, router, mounted, loading]);
  
  if (!mounted || loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-gray-900 mb-2">
            投票系統
          </h1>
          <p className="text-center text-gray-600">
            建立活動，邀請成員，進行投票
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">開始使用</h2>
                <p className="text-gray-600 mt-1">登入以建立活動或加入現有活動</p>
              </div>
              
              <button
                onClick={() => router.push('/auth')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
                登入 / 註冊
              </button>
            </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            主辦方可以建立活動並生成邀請碼，成員透過邀請碼加入後即可參與投票
          </p>
        </div>
      </div>
    </div>
  );
}
