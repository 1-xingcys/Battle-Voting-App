'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Activity, Member, Battle, vote, subscribeToActivity, subscribeToActivityMembers, subscribeToBattles, subscribeToVotes, getVoteCounts } from '../../lib/utils';
import Loading from '../../component/Loading';
import BattleInfo from '../(battles)/BattleInfo';
import VotingLive from '../(voting)/VotingLive';
import Result from '../(battles)/Result';
import Scoreboard from '../(svn2smk)/Scoreboard';

export default function LivePage() {
    const params = useParams();
    const activityId = params.activityId as string;
    const [activity, setActivity] = useState<Activity | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [battles, setBattles] = useState<Battle[]>([]);
    const [votes, setVotes] = useState<{ [battleId: string]: vote[] }>({});
    const [loading, setLoading] = useState(true);

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

    // 監聽投票變化
    useEffect(() => {
        const unsubscribes: (() => void)[] = [];

        battles.forEach(battle => {
            const unsubscribe = subscribeToVotes(activityId, battle.id, (votesData) => {
                setVotes(prev => ({
                    ...prev,
                    [battle.id]: votesData
                }));
            });
            unsubscribes.push(unsubscribe);
        });

        return () => {
            unsubscribes.forEach(unsubscribe => unsubscribe());
        };
    }, [battles, activityId]);

    if (loading) {
        return <Loading />;
    }

    if (!activity) {
        return (
            <div className="w-screen h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">活動不存在</h1>
                    <p className="text-gray-600">找不到指定的活動</p>
                </div>
            </div>
        );
    }

    // 找到當前正在進行的對戰
    const currentBattle = activity.currentBattleID 
        ? battles.find(battle => battle.id === activity.currentBattleID)
        : battles.find(battle => ["ONGOING", "VOTING", "VOTED"].includes(battle.status));

    return (
        <div className="w-screen h-screen bg-gray-50">
            <div className="w-full h-full">
                <div className="h-full bg-white p-8 flex flex-col">
                    <h2 className="text-5xl font-semibold mb-8 text-center">{activity.name}</h2>
                    <div className="flex-grow flex flex-col justify-center">
                        {/* 如果是 seven to smoke 活動類型，顯示 scoreboard 和對戰資訊並排 */}
                        {activity.type === 'sevenToSmoke' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Scoreboard */}
                                <div>
                                    <Scoreboard 
                                        activity={activity}
                                        members={members}
                                        isLive={true}
                                    />
                                </div>
                                
                                {/* 對戰資訊 */}
                                <div>
                                    {currentBattle ? (
                                        <>
                                            <BattleInfo battle={currentBattle} members={members} isLive={true}/>
                                            
                                            {currentBattle.status === "VOTING" && (
                                                <div className="mt-8">
                                                    <VotingLive 
                                                        battleVotes={votes[currentBattle.id] || []} 
                                                        members={members} 
                                                        battle={currentBattle} 
                                                        isLive={true}
                                                    />
                                                </div>
                                            )}
                                            
                                            {["VOTED", "COMPLETED"].includes(currentBattle.status) && (
                                                <div className="mt-8">
                                                    <Result 
                                                        battle={currentBattle} 
                                                        battleVotes={votes[currentBattle.id] || []} 
                                                        members={members} 
                                                        voteCounts={getVoteCounts(votes[currentBattle.id] || [])}
                                                        isLive={true}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-3xl text-gray-600">目前沒有進行中的對戰</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* 一般活動類型，只顯示對戰資訊 */
                            currentBattle ? (
                                <>
                                    <BattleInfo battle={currentBattle} members={members} isLive={true}/>
                                    
                                    {currentBattle.status === "VOTING" && (
                                        <div className="mt-8">
                                            <VotingLive 
                                                battleVotes={votes[currentBattle.id] || []} 
                                                members={members} 
                                                battle={currentBattle} 
                                                isLive={true}
                                            />
                                        </div>
                                    )}
                                    
                                    {["VOTED", "COMPLETED"].includes(currentBattle.status) && (
                                        <div className="mt-8">
                                            <Result 
                                                battle={currentBattle} 
                                                battleVotes={votes[currentBattle.id] || []} 
                                                members={members} 
                                                voteCounts={getVoteCounts(votes[currentBattle.id] || [])}
                                                isLive={true}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <p className="text-3xl text-gray-600">目前沒有進行中的對戰</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}