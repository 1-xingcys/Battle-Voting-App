import React from 'react';
import { vote, Member, Battle } from '../../lib/utils';
import { getMemberName } from '../../lib/utils';
import VoteCount from './VoteCount';

interface VotingLiveProps {
    battleVotes: vote[];
    members: Member[];
    battle: Battle;
    isLive: boolean;
}

export default function VotingLive({ battleVotes, members, battle, isLive }: VotingLiveProps) {
    const getVoteCounts = (votes: vote[]) => {
        const counts = { 0: 0, 1: 0, "TIE": 0 };
        votes.forEach(vote => {
            counts[vote.vote]++;
        });
        return counts;
    };

    const voteCounts = getVoteCounts(battleVotes);

    return (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className={`font-medium text-blue-800 mb-2 ${isLive ? 'text-4xl' : ''}`}>即時投票進度</h4>
            {isLive ? (
                <div className="text-center">   
                    <div className={`text-6xl font-bold text-gray-600 mb-4 ${isLive ? 'text-4xl' : ''}`}>
                    {`${battleVotes.length} / ${members.length - battle.memberIDs.length}`}
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className={`font-bold text-blue-600 ${isLive ? 'text-4xl' : 'text-2xl'}`}>{voteCounts[0]}</div>
                            <div className={`text-blue-600 ${isLive ? 'text-2xl' : 'text-sm'}`}>{getMemberName(members, battle.memberIDs[0])}</div>
                        </div>
                        <div>
                            <div className={`font-bold text-gray-600 ${isLive ? 'text-4xl' : 'text-2xl'}`}>{voteCounts["TIE"]}</div>
                            <div className={`text-gray-600 ${isLive ? 'text-2xl' : 'text-sm'}`}>TIE</div>
                        </div>
                        <div>
                            <div className={`font-bold text-green-600 ${isLive ? 'text-4xl' : 'text-2xl'}`}>{voteCounts[1]}</div>
                            <div className={`text-green-600 ${isLive ? 'text-2xl' : 'text-sm'}`}>{getMemberName(members, battle.memberIDs[1])}</div>
                        </div>
                    </div>
                    <div className={`mt-2 text-center text-gray-600 ${isLive ? 'text-2xl' : 'text-sm'}`}>
                        總投票數：{`${battleVotes.length} / ${members.length - battle.memberIDs.length}`}
                    </div>
                    <VoteCount battle={battle} battleVotes={battleVotes} members={members} isLive={isLive} />
                </>
            )}
        </div>
    );
} 