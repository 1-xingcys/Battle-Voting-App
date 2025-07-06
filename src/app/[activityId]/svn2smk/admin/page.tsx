'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Activity, Member, Battle, subscribeToActivity, subscribeToActivityMembers, subscribeToBattles } from '../../../lib/utils';
import Members from '../../Members';
import Battles from '../../(svn2smk)/Battles';
import Scoreboard from '../../(svn2smk)/Scoreboard';
import Loading from '../../../component/Loading';
import ActivityInfo from '../../ActivityInfo';
import Sidebar, { Tab } from '../../Sidebar';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/app/component/Footer';
import Setting from '../../(svn2smk)/Setting';
import Link from 'next/link';

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

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (!activityId) return;

        const unsubscribeActivity = subscribeToActivity(activityId, (activityData) => {
            setActivity(activityData);
            setLoading(false);
            
            // 如果活動不是 sevenToSmoke 類型且當前 activeTab 是 scoreboard，則改為 battles
            if (activityData && activityData.type !== 'sevenToSmoke' && activeTab === 'scoreboard') {
                setActiveTab('battles');
            }
        });

        return () => unsubscribeActivity();
    }, [activityId, activeTab]);

    useEffect(() => {
        if (!activityId) return;

        const unsubscribeMembers = subscribeToActivityMembers(activityId, (membersData) => {
            setMembers(membersData);
        });

        return () => unsubscribeMembers();
    }, [activityId]);

    useEffect(() => {
        if (!activityId) return;

        const unsubscribeBattles = subscribeToBattles(activityId, (battlesData) => {
            setBattles(battlesData);
        });

        return () => unsubscribeBattles();
    }, [activityId]);

    const handleMembersChange = () => {
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
        ...(activity && activity.type === 'sevenToSmoke' ? [{ id: 'scoreboard', label: 'Scoreboard', icon: '📊' }] : []),
        { id: 'members', label: 'Entry List', icon: '👥' },
        { id: 'info', label: 'Event Info', icon: 'ℹ️' },
        { id: 'setting', label: 'Setting', icon: '⚙︎' },
        { id: 'live', label: 'Live', icon: '🔥' }
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
                    {activeTab === 'members' && (
                        <Members 
                            activity={activity}
                            onMembersChange={handleMembersChange}
                            isAdmin={true}
                        />
                    )}
                    
                    {activeTab === 'battles' && (
                        <Battles />
                    )}

                    {activeTab === 'scoreboard' && activity && activity.type === 'sevenToSmoke' && (
                        <Scoreboard 
                            activity={activity}
                            members={members}
                        />
                    )}

                    {activeTab === 'info' && (
                        <ActivityInfo 
                            activity={activity}
                            members={members}
                            battles={battles}
                        />
                    )}

                    {activeTab === 'setting' && (
                        <Setting />
                    )}

                    {activeTab === 'live' && (
                        <Link href={`/${activityId}/live`} target="_blank" rel="noopener noreferrer" className="block w-full p-6 text-center bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 font-bold text-xl tracking-wider shadow-md">
                            🔥 開啟即時戰況頁面 🔥
                        </Link>
                    )}
                </div>
                <Footer />
            </div>
        </div>
    );
}