import React from 'react';
import { vote, Member, Battle, getMemberName } from '../../lib/utils';
import VoteCount from '../(voting)/VoteCount';

interface ResultProps {
    battle: Battle;
    battleVotes: vote[];
    members: Member[];
    voteCounts: { 0: number, 1: number, "TIE": number };
    isLive: boolean;
}

export default function Result({ battle, battleVotes, members, voteCounts, isLive }: ResultProps) {

    const winner = battle.winnerID ? getMemberName(members, battle.winnerID) : null;

    return (
        <div>
            <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                {/* <h4 className="font-medium text-purple-800 mb-2">投票結果</h4> */}
                <div className="grid grid-cols-3 gap-4 text-center mb-2">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">{voteCounts[0]}</div>
                        <div className="text-sm text-blue-600">{getMemberName(members, battle.memberIDs[0])}</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-600">{voteCounts["TIE"]}</div>
                        <div className="text-sm text-gray-600">平手</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">{voteCounts[1]}</div>
                        <div className="text-sm text-green-600">{getMemberName(members, battle.memberIDs[1])}</div>
                    </div>
                </div>
                <div className="text-center">
                    <span className="font-semibold text-purple-800">{winner === "TIE" ? "TIE" : `獲勝者：${winner}`}</span>
                </div>
            </div>

            <VoteCount battle={battle} battleVotes={battleVotes} members={members} isLive={isLive} />
        </div>
    );
} 