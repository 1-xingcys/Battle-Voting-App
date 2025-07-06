'use client'

import React from 'react';
import { Activity } from '../lib/utils';

interface ActivityListProps {
  activities: Activity[];
  onDelete: (id: string) => void;
  onEnterActivity: (id: string, activityType: string) => void;
  onCopyInviteLink: (inviteCode: string) => void;
}

export default function ActivityList({ 
  activities, 
  onDelete, 
  onEnterActivity, 
  onCopyInviteLink 
}: ActivityListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="divide-y">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors relative"
            onClick={() => onEnterActivity(activity.id, activity.type)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{activity.name}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
                  <span>
                    {activity.type === 'sevenToSmoke' ? 'Seven to Smoke' : 'Independent Battle'}
                  </span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(activity.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors absolute top-2 right-2"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 