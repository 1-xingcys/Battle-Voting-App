'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Activity, Member, Battle, subscribeToActivity, subscribeToActivityMembers, subscribeToBattles, getMemberName } from '../../lib/utils';
import Voting from '../(voting)/Voting';
import Loading from '../../component/Loading';
import ActivityInfo from '../ActivityInfo';
import Members from '../Members';
import Battles from '../(battles)/Battles';
import Sidebar, { Tab } from '../Sidebar';
import Footer from '@/app/component/Footer';
import Scoreboard from '../(svn2smk)/Scoreboard';

export default function MemberPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const activityId = params.activityId as string;
    const memberId = searchParams.get('member') as string;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [battles, setBattles] = useState<Battle[]>([]);
    const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('voting');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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
            
            // 找到當前正在投票的戰鬥
            const votingBattle = battlesData.find(battle => ["ONGOING", "VOTING"].includes(battle.status));
            setCurrentBattle(votingBattle || null);
        });

        return () => unsubscribeBattles();
    }, [activityId]);

    const renderContent = () => {
        switch (activeTab) {
            case 'voting':
                return (
                    <div className="mb-8">
                        <Voting 
                            activityId={activityId}
                            memberId={memberId}
                        />
                    </div>
                );
            case 'info':
                return (
                    <div className="mb-8">
                        <ActivityInfo 
                            activity={activity!}
                            members={members}
                            battles={battles}
                        />
                    </div>
                );
            case 'history':
                return (
                    <div className="mb-8">
                        <Battles 
                            activityId={activityId}
                            members={members}
                            onMembersChange={() => {}}
                            isAdmin={false}
                        />
                    </div>
                );
            case 'members':
                return (
                    <div className="mb-8">
                        <Members 
                            activity={activity!}
                            onMembersChange={() => {}}
                            isAdmin={false}
                        />
                    </div>
                );
            case 'scoreboard':
                return activity && activity.type === 'sevenToSmoke' ? (
                    <div className="mb-8">
                        <Scoreboard 
                            activity={activity}
                            members={members}
                        />
                    </div>
                ) : (
                    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border">
                        <p className="text-gray-500 text-center">此活動類型不支援計分板</p>
                    </div>
                );
            default:
                return null;
        }
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

    if (!memberId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">成員ID無效</h1>
                    <p className="text-gray-600">請提供有效的成員ID</p>
                </div>
            </div>
        );
    }

    const tabs: Tab[] = [
        { id: 'voting', label: 'Currrent Battle', icon: '🗳️' },
        ...(activity.type === 'sevenToSmoke' ? [{ id: 'scoreboard', label: 'Scoreboard', icon: '🏆' }] : []),
        { id: 'info', label: 'Event Info', icon: 'ℹ️' },
        { id: 'history', label: 'Battle Logs', icon: '⚔️' },
        { id: 'members', label: 'Entry List', icon: '👥' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* 側邊欄 */}
            <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                tabs={tabs}
                memberName={getMemberName(members, memberId)}
                activity={activity}
            />
            
            {/* 主要內容區域 */}
            <div className="flex-1 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* 活動標題
                    <div className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{activity.name}</h1>
                                <p className="mt-2 text-gray-600">{activity.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-4 right-4 border border-gray-200 rounded-lg p-2">
                        <p className="text-gray-600">您好，{getMemberName(members, memberId)}</p>
                    </div> */}

                    {/* 動態內容 */}
                    {renderContent()}
                    <Footer />
                </div>
            </div>
        </div>
    );
} 