'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, Member, Battle, subscribeToActivity, subscribeToActivityMembers, subscribeToBattles } from '../../../lib/utils';
import Members from '../../Members';
import Battles from '../../(battles)/Battles';
import Loading from '../../../component/Loading';
import ActivityInfo from '../../ActivityInfo';
import Sidebar, { Tab } from '../../Sidebar';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/app/component/Footer';

export default function AdminPage() {
    const params = useParams();
    const router = useRouter();
    const activityId = params.activityId as string;
    const { user, loading: authLoading, logout } = useAuth();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [battles, setBattles] = useState<Battle[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('battles');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

    // 監聽登出狀態，當用戶登出時重導向到首頁
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    // 監聽活動變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeActivity = subscribeToActivity(activityId, (activityData) => {
            setActivity(activityData);
            setLoading(false);
        });

        return () => unsubscribeActivity();
    }, [activityId]);

    // 監聽成員變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeMembers = subscribeToActivityMembers(activityId, (membersData) => {
            setMembers(membersData);
        });

        return () => unsubscribeMembers();
    }, [activityId]);

    // 監聽戰鬥變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeBattles = subscribeToBattles(activityId, (battlesData) => {
            setBattles(battlesData);
        });

        return () => unsubscribeBattles();
    }, [activityId]);

    const handleMembersChange = () => {
        // 成員變化時重新載入資料
        // onSnapshot 會自動處理更新
    };

    if (loading) {
        return <Loading />;
    }

    if (!activity) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">活動不存在</h1>
                    <p className="text-gray-600">找不到指定的活動</p>
                </div>
            </div>
        );
    }

    const tabs: Tab[] = [
        { id: 'battles', label: 'Battle', icon: '🗡️' },
        { id: 'members', label: 'Entry List', icon: '👥' },
        { id: 'info', label: 'Event Info', icon: 'ℹ️' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                tabs={tabs}
                memberName={user?.displayName || ''}
                activity={activity}
                isAdmin={true}
                logout={logout}
            />
            
            <div className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 主要內容區域 */}
                    {activeTab === 'members' && (
                        <Members 
                            activity={activity}
                            onMembersChange={handleMembersChange}
                            isAdmin={true}
                        />
                    )}
                    
                    {activeTab === 'battles' && (
                        <Battles 
                            activityId={activityId}
                            members={members}
                            onMembersChange={handleMembersChange}
                            isAdmin={true}
                        />
                    )}

                    {activeTab === 'info' && (
                        <ActivityInfo 
                            activity={activity}
                            members={members}
                            battles={battles}
                        />
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
} 