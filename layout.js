import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Heart, Map, User, Bookmark } from 'lucide-react';
import { createPageUrl } from './utils';

export default function Layout({ children, currentPageName }) {
  const tabs = [
    { name: 'Home', icon: Home, page: 'Dashboard' },
    { name: 'Schedule', icon: Calendar, page: 'Schedule' },
    { name: 'Media', icon: Heart, page: 'Media' },
    { name: 'Saved', icon: Bookmark, page: 'Bookmarks' },
    { name: 'Map', icon: Map, page: 'Map' },
    { name: 'Profile', icon: User, page: 'Profile' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 overflow-auto pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-gray-100 safe-bottom z-50">
        <div className="flex justify-around items-center px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPageName === tab.page;
            
            return (
              <Link
                key={tab.name}
                to={createPageUrl(tab.page)}
                className="flex flex-col items-center py-1 px-2 smooth-transition"
              >
                <div className={`p-2.5 rounded-2xl smooth-transition ${
                  isActive 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-500 shadow-lg' 
                    : 'bg-transparent'
                }`}>
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive 
                    ? 'text-pink-500' 
                    : 'text-gray-400'
                }`}>
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
