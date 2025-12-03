import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Music2, Bookmark, MapPin, User } from 'lucide-react';

const tabs = [
  { to: '/schedule', label: 'Schedule', icon: Calendar },
  { to: '/media', label: 'Media', icon: Music2 },
  { to: '/bookmarks', label: 'Saved', icon: Bookmark },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomTabs() {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md bg-white/80 backdrop-blur border border-white/40 rounded-2xl shadow-lg">
      <ul className="flex items-center justify-between px-3 py-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => [
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-colors',
                isActive ? 'text-primary' : 'text-gray-600 hover:text-gray-800'
              ].join(' ')}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
