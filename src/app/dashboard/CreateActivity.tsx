'use client'

import React, { useRef } from 'react';
import { Activity, ActivitySevenToSmoke, ActivitySingle, createActivity, generateInviteCode } from '../lib/utils';
import { useAuth } from '@/hooks/useAuth';

// 定義 CreateActivity 組件的 props 介面
interface CreateActivityProps {
  onActivityCreated: () => void;
}

// CreateActivity 組件 - 用於建立新活動
export default function CreateActivity({ onActivityCreated }: CreateActivityProps) {
  const { user } = useAuth();
  // 用於重置表單的 ref
  const formRef = useRef<HTMLFormElement>(null);

  // 處理表單提交
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const activityName = formData.get('activityName') as string;
    const activityType = formData.get('activityType') as string;

    // 建立新活動
    const baseActivity = {
      id: crypto.randomUUID().slice(0, 10), // 生成唯一ID
      adminID: user?.uid || '',
      name: activityName,
      memberIDs: [], // 初始成員列表為空
      currentBattleID: null, // 當前戰鬥ID初始為空
      inviteCode: generateInviteCode(), // 生成邀請碼
      description: '',
      type: activityType as "single" | "sevenToSmoke"
    };

    if (activityType === 'sevenToSmoke') {
      await createActivity({
        ...baseActivity,
        sevenToSmokeConfig: {
          targetScore: 7
        },
        sevenToSmokeState: {
          queue: [],
          onStage: ['', ''],
          scores: {}
        },
      } as ActivitySevenToSmoke);
    } else {
      await createActivity(baseActivity as ActivitySingle);
    }

    // 清空表單
    if (formRef.current) {
      formRef.current.reset();
    }

    // 通知父組件活動已建立
    onActivityCreated();
  };

  return (
    <div>
      <form 
        onSubmit={handleSubmit} 
        ref={formRef} 
        className="bg-white p-8 rounded-xl shadow-lg mt-8 mb-8 max-w-3xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">新增活動</h2>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">活動類型</label>
            <select
              name="activityType"
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              required
            >
              <option value="single">Independent Battle</option>
              <option value="sevenToSmoke">Seven to Smoke</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">活動名稱</label>
            <input 
              type="text" 
              name="activityName" 
              placeholder="請輸入活動名稱" 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              required
            />
          </div>
          
        </div>

        <div className="mt-8">
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            建立新活動
          </button>
        </div>
      </form>
    </div>
  );
} 