import React, { useEffect, useState } from 'react';
import { Battle, vote, Member, subscribeToBattles, subscribeToVotes, updateBattleStatus, deleteBattle, getVoteCounts, getWinner, updateBattleWinner, resetBattle } from '../../lib/utils';
import VotingLive from '../(voting)/VotingLive';
import CreateBattle from './CreateBattle';
import Result from './Result';
import BattleInfo from './BattleInfo';
import Manage from './Manage';

interface BattlesProps {
    activityId: string;
    members: Member[];
    onMembersChange: () => void;
    isAdmin: boolean;
}

export default function Battles({ activityId, members, onMembersChange, isAdmin}: BattlesProps) {
    const [battles, setBattles] = useState<Battle[]>([]);
    const [votes, setVotes] = useState<{ [battleId: string]: vote[] }>({});
    const [loading, setLoading] = useState(false);
    const [expandedBattles, setExpandedBattles] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        const unsubscribeBattles = subscribeToBattles(activityId, (battlesData) => {
            setBattles(battlesData);
        });

        return () => unsubscribeBattles();
    }, [activityId]);

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

    const handleEndVoting = async (battle: Battle, voteCounts: { 0: number, 1: number, "TIE": number }) => {
        setLoading(true);
        try {
            await updateBattleStatus(activityId, battle.id, "VOTED");
            const winner = getWinner(members, battle, voteCounts);  
            console.log(voteCounts);
            console.log(winner);
            if (winner) {
                await updateBattleWinner(activityId, battle.id, winner);
            }
        } catch (error) {
            console.error('結束投票失敗:', error);
        } finally {
            setLoading(false);
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

    const handleResetBattle = async (battle: Battle) => {
        if (!confirm('確定要重置此對戰嗎？')) {
            return;
        }
        
        setLoading(true);
        try {
            await resetBattle(activityId, battle.id);
        } catch (error) {
            console.error('重置對戰失敗:', error);
        } finally { 
            setLoading(false);
        }
    };

    const handleDeleteBattle = async (battleId: string) => {
        try {
            await deleteBattle(activityId, battleId);
        } catch (error) {
            console.error('刪除對戰失敗:', error);
        }
    };

    const toggleBattle = (battleId: string) => {
        setExpandedBattles(prev => ({
            ...prev,
            [battleId]: !prev[battleId]
        }));
    };

    return (
        <div className="mb-8">
            {isAdmin && (
                <div className="mb-4">
                    <button 
                        onClick={() => setExpandedBattles(prev => ({...prev, createBattle: !prev.createBattle}))}
                        className="w-full p-4 text-left bg-white border rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        {expandedBattles.createBattle ? '▼' : '▶'} 建立新對戰
                    </button>
                    {expandedBattles.createBattle && (
                        <CreateBattle 
                            activityId={activityId}
                            members={members}
                            onBattleCreated={() => {}}
                        />
                    )}
                </div>
            )}

            {battles.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">沒有對戰紀錄</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {battles.map((battle) => {
                        const battleVotes = votes[battle.id] || [];
                        if (!isAdmin && battle.status === "VOTING") {
                            return null;
                        }

                        return (
                            <div key={battle.id} className="bg-white border rounded-lg shadow-sm">
                                <div className="p-6">
                                    <BattleInfo battle={battle} members={members} isLive={false} />
                                    {["VOTING", "VOTED", "COMPLETED"].includes(battle.status) && (
                                        <div className="mt-4 text-blue-600 hover:text-blue-800">
                                            <button 
                                                onClick={() => toggleBattle(battle.id)}
                                                className="mt-4 text-blue-600 hover:text-blue-800"
                                            >
                                                {expandedBattles[battle.id] ? '詳細資訊 ▼' : '詳細資訊 ▶'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {expandedBattles[battle.id] && (
                                    <div className="px-6 pb-6">
                                        {battle.status === "VOTING" && (
                                            <VotingLive battleVotes={battleVotes} members={members} battle={battle} isLive={false} />
                                        )}

                                        {(battle.status === "VOTED" || battle.status === "COMPLETED") && (
                                            <Result 
                                                battle={battle} 
                                                battleVotes={battleVotes} 
                                                members={members} 
                                                voteCounts={getVoteCounts(battleVotes)}
                                                isLive={false}
                                            />
                                        )}

                                    </div>
                                )}
                                {isAdmin && (
                                    <Manage 
                                        battle={battle}
                                        loading={loading}
                                        onStartBattle={handleStartBattle}
                                        onStartVoting={handleStartVoting}
                                        onEndVoting={() => handleEndVoting(battle, getVoteCounts(battleVotes))}
                                        onCompleteBattle={handleCompleteBattle}
                                        onResetBattle={handleResetBattle}
                                        onDeleteBattle={handleDeleteBattle}
                                        voteCounts={getVoteCounts(battleVotes)}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}