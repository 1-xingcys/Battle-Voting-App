'use client'

import React, { useEffect, useState } from 'react';
import { Activity, getActivities, deleteActivity, copyInviteLink } from '../lib/utils';
import CreateActivity from './CreateActivity';
import ActivityList from './ActivityList';
import { useRouter } from 'next/navigation';
import Loading from '../component/Loading';
import { useAuth } from '@/hooks/useAuth';
import Footer from '../component/Footer';

export default function Dashboard() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showLogout, setShowLogout] = useState(false);
    const router = useRouter();
    const { user, logout, loading: authLoading } = useAuth();

    const fetchActivities = async () => {
        try {
            console.log(user?.uid);
            const activitiesData = await getActivities(user?.uid || '');
            setActivities(activitiesData);
        } catch (error) {
            console.error('取得活動資料失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchActivities();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const handleActivityUpdate = () => {
        fetchActivities();
    };

    const handleDelete = async (activityId: string) => {
        if (!confirm('確定要刪除此活動嗎？')) return;
        
        try {
            await deleteActivity(activityId);
            await fetchActivities();
        } catch (error) {
            console.error('刪除活動失敗:', error);
        }
    };

    const handleEnterActivity = (activityId: string, activityType: string) => {
        if (activityType === 'sevenToSmoke') {
            router.push(`/${activityId}/svn2smk/admin`);
        } else {
            router.push(`/${activityId}/normal/admin`);
        }
    };

    if (loading || authLoading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-screen-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 px-4 sm:px-0 gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">活動管理</h1>
                        <p className="text-gray-500 mt-2">歡迎回來，{user?.displayName || '使用者'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={logout}
                            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>登出</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                    
                    <ActivityList 
                        activities={activities}
                        onDelete={handleDelete}
                        onEnterActivity={handleEnterActivity}
                        onCopyInviteLink={copyInviteLink}
                    />

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg text-base font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                        >
                            新增活動
                        </button>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <CreateActivity 
                    onActivityCreated={handleActivityUpdate}
                />
            )}
            <Footer />
        </div>
    );
} 