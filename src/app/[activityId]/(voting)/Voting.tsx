import React, { useEffect, useState } from 'react';
import { Battle, vote, createVote, getMembers, Member, subscribeToVotes, subscribeToBattles, getMemberName, getVoteCounts, getWinner, Activity, subscribeToActivity } from "../../lib/utils";
import VotingLive from './VotingLive';
import Result from '../(battles)/Result';
import BattleInfo from '../(battles)/BattleInfo';

// 定義 VotingProps 介面
interface VotingProps {
    activityId: string;
    memberId: string;
}

// Voting 組件 - 處理投票相關功能
export default function Voting({ activityId, memberId }: VotingProps) {
    const [votes, setVotes] = useState<vote[]>([]); // 儲存投票資料
    const [members, setMembers] = useState<Member[]>([]); // 儲存成員資料
    const [memberVote, setMemberVote] = useState<vote | null>(null); // 當前成員的投票資料
    const [loading, setLoading] = useState(false); // 載入狀態
    const [battles, setBattles] = useState<Battle[]>([]); // 所有對戰
    const [activity, setActivity] = useState<Activity | null>(null); // 活動資料

    // 監聽活動變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeActivity = subscribeToActivity(activityId, (activityData) => {
            setActivity(activityData);
        });

        return () => unsubscribeActivity();
    }, [activityId]);

    // 監聽對戰變化
    useEffect(() => {
        if (!activityId) return;

        const unsubscribeBattles = subscribeToBattles(activityId, (battlesData) => {
            setBattles(battlesData);
        });

        return () => unsubscribeBattles();
    }, [activityId]);

    // 找到當前正在進行的對戰
    const currentBattle = activity?.currentBattleID 
        ? battles.find(battle => battle.id === activity.currentBattleID)
        : battles.find(battle => ["ONGOING", "VOTING", "VOTED"].includes(battle.status));

    // 監聽投票變化
    useEffect(() => {
        if (!currentBattle) return;

        // 訂閱投票資料變化
        const unsubscribeVotes = subscribeToVotes(activityId, currentBattle.id, (votesData) => {
            setVotes(votesData);
            
            // 檢查當前成員是否已經投票
            const memberVote = votesData.find(vote => vote.memberID === memberId);
            setMemberVote(memberVote || null);
        });

        return () => unsubscribeVotes();
    }, [currentBattle, activityId, memberId]);

    // 載入成員資料
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const membersData = await getMembers(activityId);
                setMembers(membersData);
            } catch (error) {
                console.error('取得成員資料失敗:', error);
            }
        };
        fetchMembers();
    }, [activityId]);

    // 處理投票
    const handleVote = async (voteValue: 0 | 1 | "TIE") => {
        if (!currentBattle || memberVote) return;

        setLoading(true);
        try {
            // 建立新投票
            const newVote: vote = {
                memberID: memberId,
                vote: voteValue,
                timestamp: Date.now()
            };

            await createVote(activityId, currentBattle.id, newVote);
        } catch (error) {
            console.error('投票失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const isCompetitor = currentBattle?.memberIDs?.includes(memberId);

    // 如果沒有進行中的對戰，顯示提示訊息
    if (!currentBattle) {
        return (
            <div className="mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">目前沒有進行中的對戰</p>
                </div>
            </div>
        );
    }

    // 如果對戰狀態不是投票中，顯示相應狀態
    if (currentBattle.status === "ONGOING") {
        return (
            <BattleInfo battle={currentBattle} members={members} isLive={false} />
        );
    }

    if (currentBattle.status === "VOTED") {
        return (
            <div className="mb-8">
                <BattleInfo battle={currentBattle} members={members} isLive={false} />
                <div className="p-4 bg-gray-50 rounded-lg">
                    <Result battle={currentBattle} battleVotes={votes} members={members} voteCounts={getVoteCounts(votes)} isLive={false} />
                </div>
            </div>
        );
    }

    if (isCompetitor) {
        return (
            <div className="mb-8">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <BattleInfo battle={currentBattle} members={members} isLive={false} />
                    <p className="text-gray-600">參賽者無法進行投票</p>
                </div>
            </div>
        );
    }

    // 主要投票介面
    return (
        <div className="mb-8">
            <div className="p-6 bg-white border rounded-lg shadow-sm">

                <BattleInfo battle={currentBattle} members={members} isLive={false} />

                {/* 已投票狀態 */}
                {memberVote ? (
                    <div className="text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
                            您投給了 <strong>{memberVote.vote === "TIE" ? "TIE" : 
                                        getMemberName(members, currentBattle.memberIDs[memberVote.vote])}
                                    </strong> ，厲害👍
                        </div>
                        {/* 顯示即時投票結果 */}
                        {/* <VotingLive battleVotes={votes} members={members} battle={currentBattle} /> */}
                    </div>
                ) : (
                    // 投票介面
                    <div className="space-y-4">
                        <p className="text-gray-600 text-center">請投票：</p>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handleVote(0)}
                                disabled={loading}
                                className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '投票中...' : `${getMemberName(members, currentBattle.memberIDs[0])}`}
                            </button>
                            <button
                                onClick={() => handleVote("TIE")}
                                disabled={loading}
                                className="p-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '投票中...' : 'TIE'}
                            </button>
                            <button
                                onClick={() => handleVote(1)}
                                disabled={loading}
                                className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '投票中...' : `${getMemberName(members, currentBattle.memberIDs[1])}`}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 