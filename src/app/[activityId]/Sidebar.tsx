import React, { useEffect } from 'react';
import Footer from '../component/Footer';
import { Activity } from '../lib/utils';

export interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    tabs: Tab[];
    memberName: string;
    activity: Activity;
    isAdmin?: boolean;
    logout?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse, tabs, memberName, activity, isAdmin = false, logout }: SidebarProps) {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const sidebar = document.getElementById('sidebar');
            if (!isCollapsed && sidebar && !sidebar.contains(event.target as Node)) {
                onToggleCollapse();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCollapsed, onToggleCollapse]);

    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
        if (!isCollapsed) {
            onToggleCollapse();
        }
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-md z-40 px-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:h-16">
                    <div className="flex items-center justify-between py-3 sm:py-0 w-full">
                        <button
                            onClick={onToggleCollapse}
                            className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                            title="開啟選單"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div className="flex flex-col sm:flex-row items-center w-full">
                            <h2 className="text-lg font-bold text-gray-800 font-['Noto Sans TC'] text-center mb-2 sm:hidden bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{activity.name}</h2>
                            <div className="flex-1 flex justify-center">
                                <h2 className="text-lg font-bold text-gray-800 font-mono text-center">{tabs.find(tab => tab.id === activeTab)?.label}</h2>
                            </div>
                            <h2 className="hidden sm:block text-lg font-bold text-gray-800 font-['Noto Sans TC'] text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{activity.name}</h2>
                        </div>
                        <div className="w-8 sm:hidden"></div>
                    </div>
                </div>
            </div>
            
            <div id="sidebar" className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out z-50 flex flex-col ${
                isCollapsed ? '-translate-x-full' : 'translate-x-0 w-72'
            }`}>
                <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 font-['Noto Sans TC']">{memberName + " " + (isAdmin ? "(HOST)" : "")}</h2>
                        <button
                            onClick={onToggleCollapse}
                            className="p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95"
                            title="收合側邊欄"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="space-y-2.5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabClick(tab.id)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-blue-100 text-blue-700 shadow-sm border-r-2 border-blue-500'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <span className="mr-3.5">{tab.icon}</span>
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                {isAdmin ? (
                    <>
                        <a
                            href="/dashboard"
                            className="mx-4 flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 active:scale-95 font-medium shadow-sm mb-3 border border-gray-200"
                        >
                            返回
                        </a>
                        <button
                            onClick={logout}
                            className="mx-4 flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 active:scale-95 font-medium shadow-sm mb-16 border border-gray-200"
                        >
                            登出
                        </button>
                    </>
                ) : (
                    <a
                        href={`/join/${activity.inviteCode}`}
                        className="mx-4 flex items-center justify-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 active:scale-95 font-medium shadow-sm mb-16 border border-gray-200"
                    >
                        登出
                    </a>
                )}
                <Footer />
            </div>
            {!isCollapsed && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onToggleCollapse}></div>
            )}
        </>
    );
}