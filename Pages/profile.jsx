//
//  profile.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//

import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Heart, Image, Music, Calendar, LogOut, Save, Edit2, Settings } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    partner1_name: '',
    partner2_name: '',
    savings_goal: 10000
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: relationshipData } = useQuery({
    queryKey: ['relationship'],
    queryFn: async () => {
      try {
        const listFn = base44?.entities?.RelationshipData?.list;
        if (typeof listFn !== 'function') return null;
        const data = await listFn();
        return data?.[0] || null;
      } catch (err) {
        console.error('RelationshipData fetch error:', err);
        return null;
      }
    }
  });

  useEffect(() => {
    if (relationshipData) {
      setFormData({
        start_date: relationshipData.start_date || '',
        partner1_name: relationshipData.partner1_name || '',
        partner2_name: relationshipData.partner2_name || '',
        savings_goal: relationshipData.savings_goal || 10000
      });
    }
  }, [relationshipData]);

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const [notes, photos, music, events] = await Promise.all([
        base44.entities.Note.list(),
        base44.entities.Photo.list(),
        base44.entities.Music.list(),
        base44.entities.Event.list()
      ]);
      return {
        notes: notes.length,
        photos: photos.length,
        music: music.length,
        events: events.length
      };
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (relationshipData) {
        return base44.entities.RelationshipData.update(relationshipData.id, data);
      } else {
        return base44.entities.RelationshipData.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
      setEditing(false);
    }
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold gradient-text">Profile</h1>
      </div>

      {/* User Card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{user?.full_name || 'User'}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <div className="glass-card rounded-2xl p-3 text-center">
            <Heart className="w-5 h-5 text-pink-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{stats.notes}</p>
            <p className="text-gray-400 text-xs">Notes</p>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center">
            <Image className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{stats.photos}</p>
            <p className="text-gray-400 text-xs">Photos</p>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center">
            <Music className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{stats.music}</p>
            <p className="text-gray-400 text-xs">Songs</p>
          </div>
          <div className="glass-card rounded-2xl p-3 text-center">
            <Calendar className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-800">{stats.events}</p>
            <p className="text-gray-400 text-xs">Events</p>
          </div>
        </div>
      )}

      {/* Relationship Settings */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <h3 className="text-gray-800 font-bold">Relationship Settings</h3>
          </div>
          {!editing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              className="rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-gray-500 text-sm mb-2 block">Anniversary Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-500 text-sm mb-2 block">Partner 1</label>
                <Input
                  placeholder="Name"
                  value={formData.partner1_name}
                  onChange={(e) => setFormData({ ...formData, partner1_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="text-gray-500 text-sm mb-2 block">Partner 2</label>
                <Input
                  placeholder="Name"
                  value={formData.partner2_name}
                  onChange={(e) => setFormData({ ...formData, partner2_name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-500 text-sm mb-2 block">Savings Goal ($)</label>
              <Input
                type="number"
                value={formData.savings_goal}
                onChange={(e) => setFormData({ ...formData, savings_goal: parseFloat(e.target.value) })}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => saveMutation.mutate(formData)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl"
              >
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Anniversary</span>
              <span className="text-gray-800 font-medium">
                {relationshipData?.start_date
                  ? new Date(relationshipData.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Partners</span>
              <span className="text-gray-800 font-medium">
                {relationshipData?.partner1_name && relationshipData?.partner2_name
                  ? `${relationshipData.partner1_name} & ${relationshipData.partner2_name}`
                  : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Savings Goal</span>
              <span className="text-gray-800 font-medium">
                ${relationshipData?.savings_goal?.toLocaleString() || '10,000'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        variant="outline"
        className="w-full rounded-2xl border-red-200 text-red-500 hover:bg-red-50 h-12"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Log Out
      </Button>
    </div>
  );
}
