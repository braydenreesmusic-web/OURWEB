//
//  presence.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function PresenceIndicator({ name, status, customStatus, avatar, lastSeen }) {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  const statusText = {
    online: 'Online now',
    away: 'Away',
    offline: lastSeen ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}` : 'Offline'
  };

  const initial = name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="glass-card rounded-2xl p-4 flex items-center gap-4 smooth-transition hover-lift">
      <div className="relative">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{initial}</span>
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusColors[status]}`} />
      </div>
      
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className="text-sm text-gray-500">
          {customStatus || statusText[status]}
        </p>
      </div>
    </div>
  );
}