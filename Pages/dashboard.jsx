//
//  dashboard.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//

import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DaysCounter from '../Components/dayscounter';
import PresenceIndicator from '../Components/presence';
import SavingsGoal from '../Components/savingsgoal';
import DailyCheckIn from '../Components/dailycheckin';
import MemoryConstellation from '../Components/memory';
import RelationshipInsights from '../Components/insight';
import EnhancedChat from '../Components/enhancedchat';
import { Heart, Calendar, MessageCircle, Loader2, Sparkles, TrendingUp, Music, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import AppShell from '../Components/AppShell';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await base44.auth.me();
        console.log('[Dashboard] auth.me()', u);
        setUser(u);
      } catch (err) {
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Update presence every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const updatePresence = async () => {
      const presences = await base44.entities.UserPresence.list();
      const myPresence = presences.find(p => p.user_name === user.full_name);
      
      if (myPresence) {
        await base44.entities.UserPresence.update(myPresence.id, {
          status: 'online',
          last_seen: new Date().toISOString()
        });
      } else {
        await base44.entities.UserPresence.create({
          user_name: user.full_name,
          status: 'online',
          last_seen: new Date().toISOString()
        });
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    // Set offline on unmount
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const { data: relationshipData, error: relationshipError } = useQuery({
    queryKey: ['relationship'],
    queryFn: async () => {
      try {
        const listFn = base44?.entities?.RelationshipData?.list;
        if (typeof listFn !== 'function') return null;
        const data = await listFn();
        console.log('[Dashboard] RelationshipData.list()', data);
        return data?.[0] || null;
      } catch (err) {
        console.error('RelationshipData fetch error:', err);
        return null;
      }
    }
  });

  const { data: presenceData, error: presenceError } = useQuery({
    queryKey: ['presence'],
    queryFn: async () => {
      const allPresences = await base44.entities.UserPresence.list('-last_seen');
      // Check if presence is recent (within 2 minutes)
      const now = new Date();
      return allPresences.map(p => {
        const lastSeen = new Date(p.last_seen);
        const diffMinutes = (now - lastSeen) / 1000 / 60;
        return {
          ...p,
          status: diffMinutes < 2 ? 'online' : diffMinutes < 10 ? 'away' : 'offline'
        };
      });
    },
    refetchInterval: 15000
  });

  const { data: latestNote, error: notesError } = useQuery({
    queryKey: ['latestNote'],
    queryFn: async () => {
      const notes = await base44.entities.Note.list('-created_date', 1);
      return notes[0] || null;
    }
  });

  const { data: upcomingEvents, error: eventsError } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: async () => {
      const events = await base44.entities.Event.list('date', 3);
      const now = new Date();
      return events.filter(e => new Date(e.date) >= now);
    }
  });

  const { data: partnerCheckIn } = useQuery({
    queryKey: ['partnerCheckIn', user?.full_name],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkIns = await base44.entities.DailyCheckIn.list('-created_date');
      return checkIns.find(c => c.date === today && c.user_name !== user?.full_name);
    },
    refetchInterval: 60000,
    enabled: !!user
  });

  const { data: activeSession } = useQuery({
    queryKey: ['listeningSession'],
    queryFn: async () => {
      const sessions = await base44.entities.ListeningSession.list('-created_date', 1);
      return sessions.find(s => s.is_active) || null;
    },
    refetchInterval: 3000
  });

  const { data: allMemories } = useQuery({
    queryKey: ['allMemories'],
    queryFn: async () => {
      const [notes, photos, events] = await Promise.all([
        base44.entities.Note.list('-created_date'),
        base44.entities.Photo.list('-created_date'),
        base44.entities.Event.list('-created_date')
      ]);
      return [...notes, ...photos, ...events];
    }
  });

  const updateSavingsMutation = useMutation({
    mutationFn: (newAmount) =>
      base44.entities.RelationshipData.update(relationshipData.id, {
        current_savings: newAmount
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relationship'] });
    }
  });

  if (relationshipError) {
    return (
      <AppShell header={<h1 className="text-3xl font-bold gradient-text">Welcome Home</h1>}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-red-500 font-semibold mb-2">Failed to load relationship data.</p>
          <Button onClick={() => window.location.reload()} className="rounded-xl">Retry</Button>
        </div>
      </AppShell>
    );
  }

  if (!relationshipData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-4 max-w-sm">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto" />
          <div>
            <p className="text-gray-700 font-semibold">No relationship data yet</p>
            <p className="text-gray-500 text-sm">Create your anniversary and partner info to get started.</p>
          </div>
          <Link to={createPageUrl('Profile')}>
            <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl">
              Go to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter to only show real online users (not current user)
  const onlinePartners = presenceData?.filter(p =>
    p.status === 'online' && p.user_name !== user?.full_name
  ) || [];

  return (
    <AppShell
      header={
        <div className="pt-2 animate-slide-up">
          <h1 className="text-3xl font-bold gradient-text">Welcome Home</h1>
          <p className="text-gray-500 mt-1">{user?.full_name} 💕</p>
        </div>
      }
    >
      {showCheckIn && <DailyCheckIn user={user} onClose={() => setShowCheckIn(false)} />}
      {showConstellation && allMemories && (
        <MemoryConstellation memories={allMemories} onClose={() => setShowConstellation(false)} />
      )}
      {showInsights && (
        <RelationshipInsights relationshipData={relationshipData} onClose={() => setShowInsights(false)} />
      )}
      {showChat && <EnhancedChat user={user} onClose={() => setShowChat(false)} />}

      {/* Active Listening Session Banner */}
      {activeSession && (
        <Link to={createPageUrl('Media')} className="block">
          <div className="glass-card rounded-2xl p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="relative">
                {activeSession.cover_art ? (
                  <img src={activeSession.cover_art} alt="" className="w-14 h-14 rounded-xl" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Radio className="w-2 h-2 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-purple-600 font-medium">🎧 Listening Together</p>
                <p className="text-gray-800 font-semibold truncate">{activeSession.song_title}</p>
                <p className="text-gray-500 text-sm">{activeSession.song_artist}</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 animate-slide-up">
        <button
          onClick={() => setShowCheckIn(true)}
          className="glass-card rounded-2xl p-4 text-left hover-lift focus:outline-none focus:ring-2 focus:ring-pink-400"
          aria-label="Open Daily Check-In"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-gray-800 font-semibold">Check-In</h3>
          <p className="text-gray-400 text-sm">Share how you feel</p>
        </button>
        
        <button
          onClick={() => setShowConstellation(true)}
          className="glass-card rounded-2xl p-4 text-left hover-lift focus:outline-none focus:ring-2 focus:ring-purple-400"
          aria-label="Open Memory Galaxy"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-gray-800 font-semibold">Memory Galaxy</h3>
          <p className="text-gray-400 text-sm">Explore together</p>
        </button>
        
        <button
          onClick={() => setShowInsights(true)}
          className="glass-card rounded-2xl p-4 text-left hover-lift focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label="Open Insights"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-gray-800 font-semibold">Insights</h3>
          <p className="text-gray-400 text-sm">AI relationship tips</p>
        </button>
        
        <button
          onClick={() => setShowChat(true)}
          className="glass-card rounded-2xl p-4 text-left hover-lift focus:outline-none focus:ring-2 focus:ring-cyan-400"
          aria-label="Open Love Notes"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-gray-800 font-semibold">Love Notes</h3>
          <p className="text-gray-400 text-sm">Send a message</p>
        </button>
      </div>

      {/* Partner Check-In */}
      {partnerCheckIn && (
        <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-pink-50 to-purple-50 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <h3 className="text-gray-800 font-bold">Partner's Mood</h3>
            </div>
            <span className="text-xs text-gray-400">
              {format(new Date(partnerCheckIn.created_date), 'MMM d, h:mm a')}
            </span>
          </div>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-semibold">{partnerCheckIn.user_name}</span> is feeling{' '}
              <span className="font-semibold text-pink-600">{partnerCheckIn.emotion}</span>
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  style={{ width: `${partnerCheckIn.energy_level * 10}%` }}
                />
              </div>
              <span className="text-gray-500 text-sm">{partnerCheckIn.energy_level}/10 ⚡</span>
            </div>
            <div className="bg-white/60 rounded-xl p-3">
              <p className="text-sm text-gray-500">They need today:</p>
              <p className="text-gray-800 font-semibold mt-1">
                💝 {partnerCheckIn.love_language.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Days Counter */}
      <DaysCounter startDate={relationshipData.start_date} />

      {/* Online Presence - Only Real Users */}
      {presenceError ? (
        <div className="text-red-500 text-center py-4">Failed to load presence.</div>
      ) : !presenceData ? (
        <div className="animate-pulse h-8 bg-gray-100 rounded-xl my-4" />
      ) : presenceData.length > 0 && (
        <div className="space-y-3 animate-slide-up">
          <h2 className="text-lg font-bold text-gray-800 px-1">Presence</h2>
          {presenceData.map((presence) => (
            <PresenceIndicator
              key={presence.id}
              name={presence.user_name}
              status={presence.status}
              customStatus={presence.custom_status}
              lastSeen={presence.last_seen}
            />
          ))}
        </div>
      )}

      {/* Savings Goal */}
      <SavingsGoal
        current={relationshipData.current_savings}
        goal={relationshipData.savings_goal}
        onUpdate={(amount) => updateSavingsMutation.mutate(amount)}
      />

      {/* Latest Note */}
      {notesError ? (
        <div className="text-red-500 text-center py-4">Failed to load notes.</div>
      ) : latestNote === undefined ? (
        <div className="animate-pulse h-24 bg-gray-100 rounded-2xl my-4" />
      ) : latestNote ? (
        <div className="glass-card rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            <h3 className="text-gray-800 font-bold">Latest Note</h3>
          </div>
          <p className="text-gray-700 leading-relaxed mb-2">{latestNote.content}</p>
          <p className="text-gray-400 text-sm">
            {latestNote.author_name} • {format(new Date(latestNote.created_date), 'MMM d, h:mm a')}
          </p>
          <Link
            to={createPageUrl('Media')}
            className="text-pink-500 font-medium mt-3 inline-block text-sm"
          >
            View all notes →
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-5 text-center text-gray-400 animate-slide-up">
          No notes yet. Start a conversation!
        </div>
      )}

      {/* Upcoming Events */}
      {eventsError ? (
        <div className="text-red-500 text-center py-4">Failed to load events.</div>
      ) : upcomingEvents === undefined ? (
        <div className="animate-pulse h-24 bg-gray-100 rounded-2xl my-4" />
      ) : upcomingEvents && upcomingEvents.length > 0 ? (
        <div className="glass-card rounded-2xl p-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-pink-500" />
            <h3 className="text-gray-800 font-bold">Upcoming</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-medium text-white/80">
                    {format(new Date(event.date), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-white">
                    {format(new Date(event.date), 'd')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold">{event.title}</p>
                  {event.time && (
                    <p className="text-gray-500 text-sm">{event.time}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Link
            to={createPageUrl('Schedule')}
            className="text-pink-500 font-medium mt-4 inline-block text-sm"
          >
            View calendar →
          </Link>
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-5 text-center text-gray-400 animate-slide-up">
          No upcoming events.
        </div>
      )}
    </AppShell>
  );
}
