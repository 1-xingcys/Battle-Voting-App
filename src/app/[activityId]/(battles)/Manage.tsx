import React from 'react';
import { Battle, updateBattleStatus } from '../../lib/utils';

interface ManageProps {
    battle: Battle;
    loading: boolean;
    voteCounts: { 0: number, 1: number, "TIE": number };
    onStartBattle: (battle: Battle) => void;
    onStartVoting: (battle: Battle) => void;
    onEndVoting: (battle: Battle) => void;
    onCompleteBattle: (battle: Battle) => void;
    onResetBattle: (battle: Battle) => void;
    onDeleteBattle: (battleId: string) => void;
}

export default function Manage({ 
    battle, 
    loading, 
    voteCounts,
    onStartBattle,
    onStartVoting, 
    onEndVoting, 
    onCompleteBattle,
    onResetBattle,
    onDeleteBattle
}: ManageProps) {
    return (
        <div className="flex gap-2 p-4 border-t border-gray-200">
            {battle.status === "PENDING" && (
                <button
                    onClick={() => onStartBattle(battle)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                    {loading ? '處理中...' : '開始對戰'}
                </button>
            )}
            {battle.status === "ONGOING" && (
                <button
                    onClick={() => onStartVoting(battle)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                    {loading ? '處理中...' : '開始投票'}
                </button>
            )}
            {battle.status === "VOTING" && (
                <button
                    onClick={() => onEndVoting(battle)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                    {loading ? '處理中...' : '結束投票'}
                </button>
            )}
            {battle.status === "VOTED" && (
                <button
                    onClick={() => onCompleteBattle(battle)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                >
                    {loading ? '處理中...' : '完成對戰'}
                </button>
            )}
            {["COMPLETED"].includes(battle.status) && (
                <button
                    onClick={() => onResetBattle(battle)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
                    >
                    {loading ? '處理中...' : '重置對戰'}
                </button>
            )}

            <button
                onClick={() => onDeleteBattle(battle.id)}
                disabled={loading}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 ease-in-out shadow-sm hover:shadow-md"
            >
                {loading ? '處理中...' : '刪除對戰'}
            </button>
        </div>
    );
} 