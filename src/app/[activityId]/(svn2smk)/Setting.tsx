'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, ActivitySevenToSmoke, Member, subscribeToActivity, subscribeToActivityMembers, updateSevenToSmokeConfig, updateMemberSpectator } from '../../lib/utils';
import Loading from '@/app/component/Loading';

export default function Setting() {
    const params = useParams();
    const activityId = params.activityId as string;
    
    const [activity, setActivity] = useState<ActivitySevenToSmoke | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [targetScore, setTargetScore] = useState<number>(7);
    const [loading, setLoading] = useState(false);

    // 監聽活動變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeActivity = subscribeToActivity(activityId, (activityData: Activity | null) => {
            if (activityData && activityData.type === 'sevenToSmoke') {
                setActivity(activityData as ActivitySevenToSmoke);
                setTargetScore(activityData.sevenToSmokeConfig.targetScore);
            }
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

    const handleUpdateTargetScore = async () => {
        if (!activity || targetScore < 1) return;
        
        setLoading(true);
        try {
            await updateSevenToSmokeConfig(activityId, {
                targetScore: targetScore
            });
            alert('目標分數已更新！');
        } catch (error) {
            console.error('更新目標分數失敗:', error);
            alert('更新失敗，請重試');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleSpectator = async (memberId: string, currentSpectator: boolean) => {
        setLoading(true);
        try {
            await updateMemberSpectator(memberId, !currentSpectator);
        } catch (error) {
            console.error('更新成員狀態失敗:', error);
            alert('更新失敗，請重試');
        } finally {
            setLoading(false);
        }
    };

    if (!activity) {
        return <Loading />;
    }

    const participants = members.filter(member => member.spectator === false);
    const spectators = members.filter(member => member.spectator === true);

    return (
        <div className="space-y-6 pb-16">
            {/* 目標分數設定 */}
            <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-6">Seven to Smoke 規則設定</h2>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            獲勝所需分數
                        </label>
                        {activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0 && (
                            <p className="text-sm text-red-500">
                                比賽已開始，無法更新目標分數
                            </p>
                        )}
                        <div className="flex items-center space-x-4">
                            <select
                                value={targetScore}
                                onChange={(e) => setTargetScore(parseInt(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0}
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleUpdateTargetScore}
                                disabled={loading || activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '更新中...' : '更新目標分數'}
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            目前設定：{activity.sevenToSmokeConfig.targetScore} 分獲勝
                        </p>
                    </div>
                </div>
            </div>

            {/* 參賽者選擇 */}
            <div className="p-6 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-6">參賽者管理</h2>

                {activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0 && (
                    <p className="text-sm text-red-500">
                        比賽已開始，無法更動參賽者
                    </p>
                )}
                <div className="space-y-6">
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div 
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-md"
                            >
                                <span className="font-medium text-gray-800">
                                    {member.name}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={!member.spectator}
                                        onChange={() => !loading && handleToggleSpectator(member.id, member.spectator || false)}
                                        disabled={loading || activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ml-3 text-sm font-medium text-gray-500">
                                        {member.spectator ? '觀賽' : '參賽'}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            總計：{members.length} 位成員 (參賽：{participants.length} 人，觀賽：{spectators.length} 人)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}