'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
    Activity, 
    ActivitySevenToSmoke, 
    Member, 
    Battle, 
    vote, 
    subscribeToActivity, 
    subscribeToActivityMembers, 
    subscribeToBattles, 
    subscribeToVotes,
    updateBattleStatus,
    updateBattleWinner,
    createBattle,
    getVoteCounts,
    getWinner,
    initializeSevenToSmokeState,
    updateSevenToSmokeScores,
    updateSevenToSmokeQueue,
    updateSevenToSmokeOnStage,
    getMemberName,
    resetSevenToSmokeState,
    deleteBattle
} from '../../lib/utils';
import VotingLive from '../(voting)/VotingLive';
import Result from '../(battles)/Result';
import BattleInfo from '../(battles)/BattleInfo';
import Scoreboard from './Scoreboard';
import Loading from '@/app/component/Loading';

export default function Battles() {
    const params = useParams();
    const activityId = params.activityId as string;
    
    const [activity, setActivity] = useState<ActivitySevenToSmoke | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [battles, setBattles] = useState<Battle[]>([]);
    const [votes, setVotes] = useState<{ [battleId: string]: vote[] }>({});
    const [loading, setLoading] = useState(false);

    // 監聽活動變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeActivity = subscribeToActivity(activityId, (activityData: Activity | null) => {
            if (activityData && activityData.type === 'sevenToSmoke') {
                setActivity(activityData as ActivitySevenToSmoke);
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

    const handleStartSevenToSmoke = async () => {
        if (!activity || !members.length) return;
        
        setLoading(true);
        try {
            // 獲取參賽者（非觀賽者）
            const participants = members.filter(member => member.spectator !== true);
            
            if (participants.length < 2) {
                alert('至少需要 2 位參賽者才能開始比賽');
                return;
            }

            // 隨機打亂參賽者順序
            const shuffledParticipants = [...participants];
            for (let i = shuffledParticipants.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledParticipants[i], shuffledParticipants[j]] = [shuffledParticipants[j], shuffledParticipants[i]];
            }

            const shuffledMemberIDs = shuffledParticipants.map(p => p.id);            

            // 初始化 seven to smoke 狀態
            await initializeSevenToSmokeState(activityId, shuffledMemberIDs);
            
            // 創建第一場戰鬥
            const firstBattle: Battle = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `Round 1: ${shuffledParticipants[0].name} vs ${shuffledParticipants[1].name}`,
                description: 'Seven to Smoke 第一場對戰',
                memberIDs: [shuffledParticipants[0].id, shuffledParticipants[1].id],
                winnerID: null,
                votes: [],
                status: "PENDING",
                startTime: null,
                endTime: null
            };

            await createBattle(activityId, firstBattle);
            alert('Seven to Smoke 比賽已開始！');
        } catch (error) {
            console.error('開始比賽失敗:', error);
            alert('開始比賽失敗，請重試');
        } finally {
            setLoading(false);
        }
    };

    const handleStartBattle = async (battle: Battle) => {
        setLoading(true);
        try {
            await updateBattleStatus(activityId, battle.id, "ONGOING");
        } catch (error) {
            console.error('開始對戰失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartVoting = async (battle: Battle) => {
        setLoading(true);
        try {
            await updateBattleStatus(activityId, battle.id, "VOTING");
        } catch (error) {
            console.error('開始投票失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEndVoting = async (battle: Battle) => {
        if (!activity) return;
        
        setLoading(true);
        try {
            const battleVotes = votes[battle.id] || [];
            const voteCounts = getVoteCounts(battleVotes);
            
            await updateBattleStatus(activityId, battle.id, "VOTED");
            
            // 確定勝者
            const winner = getWinner(members, battle, voteCounts);
            await updateBattleWinner(activityId, battle.id, winner);
            console.log(winner);
            if (winner && winner !== "TIE") {
                const winnerMember = members.find(m => m.name === winner);
                if (winnerMember) {
                    // 更新分數
                    const currentScores = activity.sevenToSmokeState.scores;
                    const newScores = {
                        ...currentScores,
                        [winnerMember.id]: (currentScores[winnerMember.id] || 0) + 1
                    };
                    await updateSevenToSmokeScores(activityId, newScores);
                    
                    // 檢查是否有人達到目標分數
                    if (newScores[winnerMember.id] >= activity.sevenToSmokeConfig.targetScore) {
                        alert(`${winnerMember.name} 已達到 ${activity.sevenToSmokeConfig.targetScore} 分，獲得勝利！`);
                        return;
                    }
                }
            }
            
            // 更新隊列和下一場戰鬥
            await handleNextBattle(battle);
            
        } catch (error) {
            console.error('結束投票失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNextBattle = async (currentBattle: Battle) => {
        if (!activity) return;
        
        try {
            const currentQueue = activity.sevenToSmokeState.queue;
            const currentOnStage = activity.sevenToSmokeState.onStage;
            
            // 移除場上的選手
            const remainingQueue = currentQueue.filter(id => !currentOnStage.includes(id));
            
            // 將敗者或平手的選手加入隊列末尾
            const battleVotes = votes[currentBattle.id] || [];
            const voteCounts = getVoteCounts(battleVotes);
            const winner = getWinner(members, currentBattle, voteCounts);
            
            if (winner === "TIE") {
                // 如果平手，兩位選手都加入隊列末尾
                currentBattle.memberIDs.forEach(id => {
                    remainingQueue.push(id);
                });
            } else if (winner) {
                const winnerMember = members.find(m => m.name === winner);
                const loserMember = members.find(m => m.id === currentBattle.memberIDs.find(id => id !== winnerMember?.id));
                
                if (loserMember) {
                    remainingQueue.push(loserMember.id);
                }
            }
            
            
            // 如果隊列中還有選手，創建下一場戰鬥
            const nextOnStage: [string, string] = winner === "TIE" ? 
            [remainingQueue[0], remainingQueue[1]] : 
            [members.find(m => m.name === winner)?.id || "", remainingQueue[0]];
            await updateSevenToSmokeOnStage(activityId, nextOnStage);
            
            // 更新隊列
            await updateSevenToSmokeQueue(activityId, winner === "TIE" ? remainingQueue.slice(2) : remainingQueue.slice(1));
            
            const nextBattle: Battle = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: `Round ${battles.length + 1}: ${getMemberName(members, nextOnStage[0])} vs ${getMemberName(members, nextOnStage[1])}`,
                description: `Seven to Smoke 第 ${battles.length + 2} 場對戰`,
                memberIDs: nextOnStage,
                winnerID: null,
                votes: [],
                status: "PENDING",
                startTime: null,
                endTime: null
            };
            
            await createBattle(activityId, nextBattle);
            
        } catch (error) {
            console.error('創建下一場戰鬥失敗:', error);
        }
    };

    const handleCompleteBattle = async (battle: Battle) => {
        setLoading(true);
        try {
            await updateBattleStatus(activityId, battle.id, "COMPLETED");
        } catch (error) {
            console.error('完成對戰失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSevenToSmoke = async () => {
        if (!activity) return;
        
        const confirmReset = window.confirm('確定要重置 Seven to Smoke 比賽嗎？這將會清除所有戰鬥記錄和分數。');
        if (!confirmReset) return;
        
        setLoading(true);
        try {
            // 重置 seven to smoke 狀態
            await resetSevenToSmokeState(activityId);
            
            // 刪除所有戰鬥記錄
            const battlePromises = battles.map(battle => deleteBattle(activityId, battle.id));
            await Promise.all(battlePromises);
            
            alert('Seven to Smoke 比賽已重置！');
        } catch (error) {
            console.error('重置比賽失敗:', error);
            alert('重置比賽失敗，請重試');
        } finally {
            setLoading(false);
        }
    };

    if (!activity) {
        return <Loading />;
    }

    const participants = members.filter(member => member.spectator !== true);
    const currentBattle = battles.find(battle => ["PENDING", "ONGOING", "VOTING", "VOTED"].includes(battle.status));

    return (
        <div className="space-y-6 pb-16">
            {/* 比賽狀態 */}
            {activity.sevenToSmokeState.queue.length > 0 && (
                <Scoreboard activity={activity} members={members} />
            )}

            {/* 開始比賽按鈕 */}
            {activity.sevenToSmokeState.queue.length === 0 && battles.length === 0 && (
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <div className="pt-4">
                        <button
                            onClick={handleStartSevenToSmoke}
                            disabled={loading || participants.length < 2}
                            className="w-full px-6 py-3 bg-green-300 text-gray-700 rounded-lg hover:bg-green-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '開始中...' : `開始 Seven to Smoke 比賽 (${participants.length} 位參賽者)`}
                        </button>
                    </div>
                </div>
            )}

            {/* 當前戰鬥 */}
            {currentBattle && (
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-6">當前對戰</h2>
                    
                    <div className="space-y-4">
                        <BattleInfo battle={currentBattle} members={members} isLive={false} />
                        
                        {currentBattle.status === "VOTING" && (
                            <div className="mt-4">
                                <VotingLive 
                                    battleVotes={votes[currentBattle.id] || []} 
                                    members={members} 
                                    battle={currentBattle} 
                                    isLive={false}
                                />
                            </div>
                        )}

                        {(currentBattle.status === "VOTED" || currentBattle.status === "COMPLETED") && (
                            <div className="mt-4">
                                <Result 
                                    battle={currentBattle} 
                                    battleVotes={votes[currentBattle.id] || []} 
                                    members={members} 
                                    voteCounts={getVoteCounts(votes[currentBattle.id] || [])}
                                    isLive={false}
                                />
                            </div>
                        )}

                        {/* 管理按鈕 */}
                        <div className="flex gap-2 pt-4">
                            {currentBattle.status === "PENDING" && (
                                <button
                                    onClick={() => handleStartBattle(currentBattle)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    開始對戰
                                </button>
                            )}
                            
                            {currentBattle.status === "ONGOING" && (
                                <button
                                    onClick={() => handleStartVoting(currentBattle)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    開始投票
                                </button>
                            )}
                            
                            {currentBattle.status === "VOTING" && (
                                <button
                                    onClick={() => handleEndVoting(currentBattle)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    結束投票
                                </button>
                            )}

                            {currentBattle.status === "VOTED" && (
                                <button
                                    onClick={() => handleCompleteBattle(currentBattle)}
                                    disabled={loading}
                                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    完成
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 歷史戰鬥 */}
            {battles.filter(battle => battle.status === "COMPLETED").length > 0 && (
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-6">歷史對戰</h2>
                    
                    <div className="space-y-4">
                        {battles
                            .filter(battle => battle.status === "COMPLETED")
                            .map((battle) => (
                                <div key={battle.id} className="p-4 border rounded-lg">
                                    <BattleInfo battle={battle} members={members} isLive={false} />
                                    <Result 
                                        battle={battle} 
                                        battleVotes={votes[battle.id] || []} 
                                        members={members} 
                                        voteCounts={getVoteCounts(votes[battle.id] || [])}
                                        isLive={false}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* 重置比賽按鈕 */}
            {(activity.sevenToSmokeState.queue.length > 0 || battles.length > 0) && (
                <div className="p-6 bg-white rounded-lg shadow-sm border">
                    <div className="pt-4">
                        <button
                            onClick={handleResetSevenToSmoke}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-red-300 text-gray-700 rounded-lg hover:bg-red-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '重置中...' : '重置 Seven to Smoke 比賽'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}