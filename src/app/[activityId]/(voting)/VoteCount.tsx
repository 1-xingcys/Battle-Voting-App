import React, { useState } from 'react';
import { vote, Member, Battle, getMemberName } from '../../lib/utils';

interface VoteCountProps {
    battle: Battle;
    battleVotes: vote[];
    members: Member[];
    isLive: boolean;
}

export default function VoteCount({ battle, battleVotes, members, isLive }: VoteCountProps) {
    const [isExpanded, setIsExpanded] = useState(isLive);

    if (battleVotes.length === 0) {
        return null;
    }

    // 找出沒投票的成員
    const nonVotingMembers = members.filter(member => 
        !battle.memberIDs.includes(member.id)
    );

    return (
        <div className="mb-4">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <div>
                    <h4 className="font-medium">投票記錄：</h4>
                    <p className="text-sm text-gray-600">總投票數：{`${battleVotes.length} / ${members.length - battle.memberIDs.length}`}</p>
                </div>
                <svg 
                    className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isExpanded && (
                <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                    {battleVotes.map((vote, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span>{getMemberName(members, vote.memberID)}</span>
                            <span className="font-medium">
                                {vote.vote === 0 ? `投給${getMemberName(members, battle.memberIDs[0])}` : 
                                 vote.vote === 1 ? `投給${getMemberName(members, battle.memberIDs[1])}` : `TIE`}
                            </span>
                        </div>
                    ))}
                    {nonVotingMembers.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                            <div className="text-sm text-gray-500">沒投票：</div>
                            {nonVotingMembers.map((member) => (
                                <div key={member.id} className="text-sm text-gray-500">
                                    {getMemberName(members, member.id)}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 