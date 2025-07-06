import React from 'react';
import { Battle, Member, getMemberName } from '../../lib/utils';

interface BattleInfoProps {
    battle: Battle;
    members: Member[];
    isLive: boolean;
}

export default function BattleInfo({ battle, members, isLive }: BattleInfoProps) {

    const winner = battle.winnerID ? getMemberName(members, battle.winnerID) : null;
    const member0 = getMemberName(members, battle.memberIDs[0])
    const member1 = getMemberName(members, battle.memberIDs[1])
    const member0Win = winner === member0
    const member1Win = winner === member1
    const tie = winner === "TIE"
    
    return (
        <div>
            <div className={`mb-4 p-3 rounded-lg ${
                battle.status === "PENDING" ? "bg-yellow-50" :
                battle.status === "ONGOING" ? "bg-orange-50" :
                battle.status === "VOTING" ? "bg-blue-50" :
                battle.status === "VOTED" ? "bg-purple-50" :
                "bg-green-50"
            }`}>
                <div className="w-full text-center">
                    <h3 className={`${isLive ? 'text-4xl' : 'text-xl'} font-semibold mb-2`}>{battle.name}</h3>
                    <span className={`px-3 py-1 rounded-full ${isLive ? 'text-xl' : 'text-sm'} font-medium ${
                        battle.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        battle.status === "ONGOING" ? "bg-orange-100 text-orange-800" :
                        battle.status === "VOTING" ? "bg-blue-100 text-blue-800" :
                        battle.status === "VOTED" ? "bg-purple-100 text-purple-800" :
                        "bg-green-100 text-green-800"
                    }`}>
                        {battle.status === "PENDING" ? "等待開始" :
                         battle.status === "ONGOING" ? "對戰中" :
                         battle.status === "VOTING" ? "投票中" :
                         battle.status === "VOTED" ? "投票完成" : "已結束"}
                    </span>
                </div>
            </div>

            <div className="p-3 mb-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <p className={`text-center ${isLive ? 'text-4xl' : ''}`}>
                    <span className="text-blue-600">{member0}</span>
                    <span className="text-blue-600">{member0Win ? "(WIN)" : ""}</span>
                    <span className="mx-2 text-gray-500">V.S</span>
                    <span className="text-green-600">{member1}</span> 
                    <span className="text-green-600">{member1Win ? "(WIN)" : ""}</span>
                    <span className="text-gray-500">{tie ? "(TIE)" : ""}</span>
                </p>
            </div>
        </div>
    );
}