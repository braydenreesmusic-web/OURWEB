//
//  dailycheckin.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Heart, Zap, MessageCircle, X } from 'lucide-react';
import { format } from 'date-fns';

const emotions = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'stressed', emoji: '😰', label: 'Stressed' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'loved', emoji: '🥰', label: 'Loved' },
  { value: 'lonely', emoji: '😔', label: 'Lonely' },
  { value: 'energized', emoji: '⚡', label: 'Energized' }
];

const loveLanguages = [
  { value: 'words_of_affirmation', emoji: '💬', label: 'Words of Affirmation' },
  { value: 'quality_time', emoji: '⏰', label: 'Quality Time' },
  { value: 'physical_touch', emoji: '🤗', label: 'Physical Touch' },
  { value: 'acts_of_service', emoji: '🎁', label: 'Acts of Service' },
  { value: 'receiving_gifts', emoji: '🎀', label: 'Receiving Gifts' }
];

export default function DailyCheckIn({ user, onClose }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState({
    emotion: '',
    energy_level: 5,
    love_language: ''
  });

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', user?.full_name, today],
    queryFn: async () => {
      const checkIns = await base44.entities.DailyCheckIn.list('-created_date', 10);
      const todaysCheckIn = checkIns.find(c => 
        c.user_name === user?.full_name && c.date === today
      );
      if (todaysCheckIn) {
        setFormData({
          emotion: todaysCheckIn.emotion,
          energy_level: todaysCheckIn.energy_level,
          love_language: todaysCheckIn.love_language
        });
      }
      return todaysCheckIn;
    },
    enabled: !!user
  });

  const createCheckInMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyCheckIn.create({
      ...data,
      user_name: user?.full_name,
      date: today
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIn'] });
      queryClient.invalidateQueries({ queryKey: ['partnerCheckIn'] });
      onClose();
    }
  });

  const updateCheckInMutation = useMutation({
    mutationFn: (data) => base44.entities.DailyCheckIn.update(todayCheckIn.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIn'] });
      queryClient.invalidateQueries({ queryKey: ['partnerCheckIn'] });
      onClose();
    }
  });

  const handleSubmit = () => {
    if (!formData.emotion || !formData.love_language) return;
    
    if (todayCheckIn) {
      updateCheckInMutation.mutate(formData);
    } else {
      createCheckInMutation.mutate(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text">Daily Check-In</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-3 block flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              How are you feeling?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => setFormData({ ...formData, emotion: emotion.value })}
                  className={`p-3 rounded-xl text-center smooth-transition ${
                    formData.emotion === emotion.value
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{emotion.emoji}</div>
                  <div className="text-xs">{emotion.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-3 block flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Energy Level: {formData.energy_level}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy_level}
              onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600 mb-3 block flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-500" />
              What do you need today?
            </label>
            <div className="space-y-2">
              {loveLanguages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setFormData({ ...formData, love_language: lang.value })}
                  className={`w-full p-3 rounded-xl text-left smooth-transition flex items-center gap-3 ${
                    formData.love_language === lang.value
                      ? 'bg-gradient-to-br from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{lang.emoji}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!formData.emotion || !formData.love_language}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl h-12 text-base"
          >
            {todayCheckIn ? 'Update Check-In' : 'Complete Check-In'}
          </Button>
        </div>
      </div>
    </div>
  );
}