import React, { useEffect, useState } from 'react';
import { Activity, Member, createMember, deleteMember, subscribeToActivityMembers } from '../lib/utils';

interface MembersProps {
    activity: Activity;
    onMembersChange: () => void;
    isAdmin: boolean;
}

export default function Members({ activity, onMembersChange, isAdmin }: MembersProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [newMemberName, setNewMemberName] = useState('');
    const [isSpectator, setIsSpectator] = useState(false);
    const [loading, setLoading] = useState(false);

    // 監聽成員變化
    useEffect(() => {
        const unsubscribe = subscribeToActivityMembers(activity.id, (membersData) => {
            setMembers(membersData);
        });

        return () => unsubscribe();
    }, [activity.id]);

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        setLoading(true);
        try {
            const newMember: Member = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name: newMemberName.trim(),
                activityID: activity.id,
                joinTime: Date.now(),
                spectator: isSpectator,
            };

            await createMember(newMember);
            setNewMemberName('');
            setIsSpectator(false);
            onMembersChange();
        } catch (error) {
            console.error('新增成員失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('確定要刪除此成員嗎？')) return;

        setLoading(true);
        try {
            await deleteMember(memberId);
            onMembersChange();
        } catch (error) {
            console.error('刪除成員失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8">
            {isAdmin && <h2 className="text-2xl font-bold mb-4">成員管理</h2>}
            
            {/* 新增成員表單 - 僅管理員可見 */}
            {isAdmin && (
                <div className="mb-6 p-6 bg-white border rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">新增成員</h3>
                    <form onSubmit={handleAddMember} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="memberName" className="block text-sm font-medium text-gray-700 mb-1">
                                    姓名
                                </label>
                                <input
                                    type="text"
                                    id="memberName"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="輸入成員姓名"
                                    required
                                    disabled={activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0}
                                />
                                {activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0 && (
                                    <p className="mt-1 text-sm text-red-500">
                                        比賽已開始，無法新增成員
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isSpectator"
                                        checked={isSpectator}
                                        onChange={(e) => setIsSpectator(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700">觀賽</span>
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !newMemberName.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? '新增中...' : '新增成員'}
                        </button>
                    </form>
                </div>
            )}

            {/* 成員列表 */}
            <div className="bg-white border rounded-lg shadow-sm">
                
                {members.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        目前沒有成員
                    </div>
                ) : (
                    <div className="divide-y">
                        {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium">{member.name}</h4>
                                    <span className="text-xs text-gray-500">
                                        {member.spectator ? '觀賽' : '參賽'}
                                    </span>
                                </div>
                                {isAdmin && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDeleteMember(member.id)}
                                            disabled={loading || activity.type === "sevenToSmoke" && activity.sevenToSmokeState.queue.length > 0}
                                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            刪除
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <div className="px-6 py-4 border-t">
                    <h3 className="text-lg font-semibold">共 {members.length} 位成員</h3>
                </div>
            </div>
        </div>
    );
} 