import React, { useState } from 'react';
import { Activity, Member, Battle, copyInviteLink, updateActivityInfo } from '../lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface ActivityInfoProps {
    activity: Activity;
    members: Member[];
    battles: Battle[];
}

export default function ActivityInfo({ activity, members, battles }: ActivityInfoProps) {
    const { user } = useAuth();
    const inviteUrl = `${window.location.origin}/join/${activity.inviteCode}`;
    const [description, setDescription] = useState(activity.description || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isAdmin = activity.adminID === user?.uid;

    const handleSaveDescription = async () => {
        if (!isAdmin) return;
        
        setIsSaving(true);
        try {
            await updateActivityInfo({
                ...activity,
                description: description
            });
            setIsEditing(false);
        } catch (error) {
            console.error('更新活動描述失敗:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setDescription(activity.description || '');
        setIsEditing(false);
    };

    return (
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h3 className="font-medium text-gray-700 mb-2">{activity.name} ‼️</h3>
                </div>

                {/* 活動描述 */}
                <div>
                    {isAdmin && !isEditing && (
                        <div className="flex items-center justify-end">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    編輯
                                </button>
                        </div>
                    )}
                    
                    {isEditing ? (
                        <div className="space-y-3">
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="請輸入活動描述..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveDescription}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {isSaving ? '儲存中...' : '儲存'}
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {description ? (
                                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
                            ) : (
                                <p className="text-gray-500 italic">尚未設定活動描述</p>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inviteUrl}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-50 border rounded-lg text-gray-600"
                            />
                            <button
                                onClick={() => copyInviteLink(activity.inviteCode)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                            >
                                <ClipboardDocumentIcon className="h-5 w-5" />
                                複製
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}