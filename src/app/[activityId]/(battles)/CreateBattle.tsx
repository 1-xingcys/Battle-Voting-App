import React, { useRef, useState } from 'react';
import { Battle, createBattle, Member } from '../../lib/utils';

interface CreateBattleProps {
    activityId: string;
    members: Member[];
    onBattleCreated: () => void;
}

export default function CreateBattle({ activityId, members, onBattleCreated }: CreateBattleProps) {
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const handleCreateBattle = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const description = formData.get('description') as string;
            const member1 = formData.get('member1') as string;
            const member2 = formData.get('member2') as string;

            if (member1 === member2) {
                alert("參賽者不能相同");
                setLoading(false);
                return;
            }

            const battle: Battle = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                name,
                description,
                memberIDs: [member1, member2],
                winnerID: null,
                votes: [],
                status: "PENDING",
                startTime: null,
                endTime: null
            };

            await createBattle(activityId, battle);
            onBattleCreated();
            formRef.current?.reset();
        } catch (error) {
            console.error('建立對戰失敗:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            
            <div className="mb-4 p-6 bg-white border rounded-lg shadow-sm">
                <form onSubmit={handleCreateBattle} ref={formRef}>
                    <h2 className="text-xl font-bold mb-4">新增對戰</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">對戰名稱</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700">描述</label>
                            <textarea
                                name="description"
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div> */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">參賽者 1</label>
                                <select
                                    name="member1"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">選擇參賽者</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">參賽者 2</label>
                                <select
                                    name="member2"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">選擇參賽者</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {loading ? '處理中...' : '建立'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
} 