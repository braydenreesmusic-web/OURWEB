//
//  memory.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState } from 'react';
import { X, Heart, MessageCircle, Calendar, Image, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function MemoryConstellation({ memories, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredMemories = memories.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return m.is_favorite;
    if (filter === 'photos') return m.url;
    if (filter === 'notes') return m.content && !m.url;
    return true;
  }).sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const selectedMemory = selectedIndex !== null ? filteredMemories[selectedIndex] : null;

  const getMemoryIcon = (memory) => {
    if (memory.url) return Image;
    if (memory.content) return MessageCircle;
    if (memory.date) return Calendar;
    return Heart;
  };

  const getMemoryPreview = (memory) => {
    if (memory.url) return memory.url;
    return null;
  };

  const getMemoryText = (memory) => {
    return memory.content || memory.title || memory.caption || 'Memory';
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-pink-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Memory Galaxy</h1>
            <p className="text-white/60 text-sm">{filteredMemories.length} memories</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 smooth-transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="relative z-10 px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'favorites', label: '❤️ Favorites' },
            { value: 'photos', label: '📷 Photos' },
            { value: 'notes', label: '💬 Notes' }
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap smooth-transition ${
                filter === f.value
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Grid */}
      <div className="relative z-10 px-4 pb-24 h-[calc(100vh-180px)] overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {filteredMemories.map((memory, index) => {
            const Icon = getMemoryIcon(memory);
            const preview = getMemoryPreview(memory);
            
            return (
              <button
                key={memory.id || index}
                onClick={() => setSelectedIndex(index)}
                className={`aspect-square rounded-2xl overflow-hidden relative group smooth-transition hover:scale-105 ${
                  memory.is_favorite ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-transparent' : ''
                }`}
              >
                {preview ? (
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500/30 to-purple-500/30 backdrop-blur flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white/70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 smooth-transition" />
                {memory.is_favorite && (
                  <div className="absolute top-2 right-2">
                    <Heart className="w-4 h-4 text-pink-400" fill="#F472B6" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 smooth-transition">
                  <p className="text-white text-xs truncate">
                    {format(new Date(memory.created_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {filteredMemories.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-white/50">No memories in this category</p>
          </div>
        )}
      </div>

      {/* Selected Memory Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Navigation */}
            {selectedIndex > 0 && (
              <button
                onClick={() => setSelectedIndex(selectedIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedIndex < filteredMemories.length - 1 && (
              <button
                onClick={() => setSelectedIndex(selectedIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-white/20"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <div className="bg-white rounded-3xl overflow-hidden">
              {selectedMemory.url ? (
                <img src={selectedMemory.url} alt="" className="w-full max-h-[50vh] object-cover" />
              ) : (
                <div className="h-40 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  {React.createElement(getMemoryIcon(selectedMemory), { className: 'w-16 h-16 text-white/50' })}
                </div>
              )}
              
              <div className="p-5">
                <p className="text-gray-800 text-lg leading-relaxed mb-3">
                  {getMemoryText(selectedMemory)}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{format(new Date(selectedMemory.created_date), 'MMMM d, yyyy')}</span>
                  {selectedMemory.is_favorite && (
                    <span className="flex items-center gap-1 text-pink-500">
                      <Heart className="w-4 h-4" fill="#FF6B9D" /> Favorite
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => setSelectedIndex(null)}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl h-11"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}