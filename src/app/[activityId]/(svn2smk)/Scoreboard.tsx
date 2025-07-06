'use client'

import React from 'react';
import { ActivitySevenToSmoke, Member, getMemberName } from '../../lib/utils';

interface ScoreboardProps {
    activity: ActivitySevenToSmoke;
    members: Member[];
    isLive?: boolean;
}

export default function Scoreboard({ activity, members, isLive = false }: ScoreboardProps) {
    const participants = members.filter(member => member.spectator !== true);
    
    // 檢查是否有獲勝者
    const winner = participants.find(member => 
        (activity.sevenToSmokeState.scores[member.id] || 0) >= activity.sevenToSmokeConfig.targetScore
    );

    if (activity.sevenToSmokeState.queue.length === 0) {
        return (
            <div className={`${isLive ? 'p-8' : 'p-6'} bg-white rounded-lg shadow-sm border`}>
                <h2 className={`${isLive ? 'text-4xl' : 'text-xl'} font-semibold mb-6`}>Seven to Smoke 比賽狀態</h2>
                <div className="p-4 bg-gray-50 rounded-md text-center">
                    <p className={`${isLive ? 'text-xl' : ''} text-gray-500`}>比賽尚未開始</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${isLive ? 'p-8' : 'p-6'} bg-white rounded-lg shadow-sm border`}>
            <h2 className={`${isLive ? 'text-4xl' : 'text-xl'} font-semibold mb-6`}>Seven to Smoke 比賽狀態</h2>
            
            <div className="space-y-4">
                {/* 獲勝者顯示 */}
                {winner && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <h3 className={`${isLive ? 'text-4xl' : 'text-2xl'} font-bold text-yellow-800 mb-4 text-center`}>🏆 Winner {winner.name}</h3>
                        {/* <p className={`${isLive ? 'text-lg' : 'text-sm'} text-yellow-700 mt-1`}>
                            已達到目標分數 {activity.sevenToSmokeConfig.targetScore} 分
                        </p> */}
                    </div>
                )}

                {/* 分數顯示 */}
                <div>
                    <h3 className={`${isLive ? 'text-2xl' : 'text-lg'} font-medium text-gray-700 mb-3`}>目前分數</h3>
                    {participants.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-md text-center">
                            <p className={`${isLive ? 'text-xl' : ''} text-gray-500`}>目前沒有參賽者</p>
                        </div>
                    ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isLive ? 'md:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-3 lg:grid-cols-4'} gap-3`}>
                            {participants.map((member) => {
                                const score = activity.sevenToSmokeState.scores[member.id] || 0;
                                const isWinner = score >= activity.sevenToSmokeConfig.targetScore;
                                const isCloseToWin = score === activity.sevenToSmokeConfig.targetScore - 1;
                                
                                return (
                                    <div key={member.id} className={`p-3 rounded-md ${
                                        isWinner ? 'bg-yellow-50 border-2 border-yellow-200' : 
                                        isCloseToWin ? 'bg-orange-50 border-2 border-orange-200' : 
                                        'bg-gray-50'
                                    }`}>
                                        <div className={`${isLive ? 'text-xl' : ''} font-medium text-gray-800`}>{member.name}</div>
                                        <div className={`${isLive ? 'text-3xl' : 'text-2xl'} font-bold ${
                                            isWinner ? 'text-yellow-600' : 
                                            isCloseToWin ? 'text-orange-600' : 
                                            'text-blue-600'
                                        }`}>
                                            {score}
                                        </div>
                                        {isWinner && (
                                            <div className={`${isLive ? 'text-sm' : 'text-xs'} text-yellow-600 font-medium`}>🏆 Win</div>
                                        )}
                                        {isCloseToWin && (
                                            <div className={`${isLive ? 'text-sm' : 'text-xs'} text-orange-600 font-medium`}>🔥 最後一分</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 目標分數顯示 */}
                <div>
                    <div className="p-3 bg-blue-50 rounded-md">
                        <div className={`${isLive ? 'text-lg' : 'text-sm'} text-gray-600`}>獲勝分數</div>
                        <div className={`${isLive ? 'text-4xl' : 'text-2xl'} font-bold text-blue-600`}>
                            {activity.sevenToSmokeConfig.targetScore} 分
                        </div>
                    </div>
                </div>

                {/* 隊列顯示 */}
                <div>
                    <h3 className={`${isLive ? 'text-2xl' : 'text-lg'} font-medium text-gray-700 mb-3`}>排隊順序</h3>
                    {activity.sevenToSmokeState.queue.length === 0 ? (
                        <div className="p-3 bg-gray-50 rounded-md text-center">
                            <p className={`${isLive ? 'text-xl' : ''} text-gray-500`}>目前沒有等待中的選手</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {activity.sevenToSmokeState.queue.map((memberId, index) => {
                                const isFirst = index === 0;
                                const isSecond = index === 1;
                                const bgColorClass = isFirst ? 'bg-green-100' : isSecond ? 'bg-red-100' : 'bg-blue-100';
                                const textColorClass = isFirst ? 'text-green-800' : isSecond ? 'text-red-800' : 'text-blue-800';
                                const textSizeClass = isLive ? 'text-lg' : 'text-sm';

                                return (
                                    <span 
                                        key={memberId} 
                                        className={`px-3 py-1 ${bgColorClass} ${textColorClass} rounded-full ${textSizeClass}`}
                                    >
                                        {index + 1}. {getMemberName(members, memberId)}
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 