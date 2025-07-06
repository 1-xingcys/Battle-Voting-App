'use client'

import React, { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, Member, getActivityByInviteCode, createMember, getMembers } from '../../lib/utils';

export default function JoinPage({ params }: { params: Promise<{ inviteCode: string }> }) {
    const { inviteCode } = use(params);
    const router = useRouter();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const activityData = await getActivityByInviteCode(inviteCode);
                if (activityData) {
                    setActivity(activityData);
                    const membersData = await getMembers(activityData.id);
                    setMembers(membersData);
                } else {
                    setError('無效的邀請碼');
                }
            } catch (err) {
                setError('載入活動時發生錯誤');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [inviteCode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activity || !selectedMemberId) return;

        try {
            router.push(`/${activity.id}/member?member=${selectedMemberId}`);
            // 重導向到活動頁面
            // if (activity.type === "sevenToSmoke") {
            //     router.push(`/${activity.id}/svn2smk/member?member=${selectedMemberId}`);
            // } else {
            //     router.push(`/${activity.id}/normal/member?member=${selectedMemberId}`);
            // }
        } catch (err) {
            setError('加入活動時發生錯誤');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4">載入中...</p>
                </div>
            </div>
        );
    }

    if (error || !activity) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">錯誤</h1>
                    <p className="text-gray-600">{error || '找不到活動'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-serif font-extrabold text-gray-900">
                        {activity.name}
                    </h2>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label htmlFor="member" className="sr-only">選擇成員</label>
                            <select
                                id="member"
                                name="member"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                value={selectedMemberId}
                                onChange={(e) => setSelectedMemberId(e.target.value)}
                            >
                                <option value="">請選擇你的名字</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            加入活動
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 