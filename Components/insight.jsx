//
//  insight.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Heart, Calendar, MessageCircle, Lightbulb, Loader2, RefreshCw, X } from 'lucide-react';

export default function RelationshipInsights({ relationshipData, onClose }) {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);

  const { data: insights = [] } = useQuery({
    queryKey: ['insights'],
    queryFn: () => base44.entities.RelationshipInsight.list('-created_date', 10)
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ['allCheckIns'],
    queryFn: () => base44.entities.DailyCheckIn.list('-created_date', 14)
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['recentNotes'],
    queryFn: () => base44.entities.Note.list('-created_date', 10)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['recentEvents'],
    queryFn: () => base44.entities.Event.list('date', 5)
  });

  const createInsightMutation = useMutation({
    mutationFn: (data) => base44.entities.RelationshipInsight.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insights'] })
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.RelationshipInsight.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insights'] })
  });

  const generateInsights = async () => {
    setGenerating(true);
    
    const context = {
      relationship_days: relationshipData?.start_date 
        ? Math.floor((new Date() - new Date(relationshipData.start_date)) / (1000 * 60 * 60 * 24))
        : 0,
      recent_emotions: checkIns.map(c => ({ user: c.user_name, emotion: c.emotion, love_language: c.love_language })),
      recent_notes_count: notes.length,
      upcoming_events: events.map(e => e.title),
      savings_progress: relationshipData?.current_savings && relationshipData?.savings_goal 
        ? (relationshipData.current_savings / relationshipData.savings_goal * 100).toFixed(0)
        : 0
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on this couple's relationship data, generate 3 personalized insights/tips.
      
      Context:
      - Together for ${context.relationship_days} days
      - Recent emotional check-ins: ${JSON.stringify(context.recent_emotions)}
      - Upcoming events: ${context.upcoming_events.join(', ') || 'None'}
      - Savings goal progress: ${context.savings_progress}%
      - Recent notes exchanged: ${context.recent_notes_count}
      
      Generate insights that are:
      1. A communication tip based on their love languages
      2. A date suggestion based on their mood patterns
      3. A relationship pattern observation
      
      Be warm, supportive, and specific to their situation.`,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                title: { type: "string" },
                content: { type: "string" }
              }
            }
          }
        }
      }
    });

    for (const insight of result.insights || []) {
      await createInsightMutation.mutateAsync(insight);
    }
    
    setGenerating(false);
  };

  const getIcon = (type) => {
    const icons = {
      communication_tip: MessageCircle,
      date_suggestion: Calendar,
      pattern: TrendingUp,
      milestone: Heart,
      weekly_summary: Sparkles
    };
    return icons[type] || Lightbulb;
  };

  const getColor = (type) => {
    const colors = {
      communication_tip: 'from-blue-500 to-cyan-500',
      date_suggestion: 'from-pink-500 to-rose-500',
      pattern: 'from-purple-500 to-violet-500',
      milestone: 'from-amber-500 to-orange-500',
      weekly_summary: 'from-green-500 to-emerald-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const unreadCount = insights.filter(i => !i.is_read).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text">Insights</h2>
              {unreadCount > 0 && (
                <p className="text-xs text-white/50">{unreadCount} new</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Button
          onClick={generateInsights}
          disabled={generating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl h-12 mb-6"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><RefreshCw className="w-5 h-5 mr-2" /> Generate New Insights</>
          )}
        </Button>

        <div className="space-y-4">
          {insights.map((insight) => {
            const Icon = getIcon(insight.type);
            return (
              <div 
                key={insight.id} 
                className={`rounded-2xl p-4 smooth-transition cursor-pointer ${
                  insight.is_read ? 'bg-white/5' : 'bg-white/10 shadow-lg'
                }`}
                onClick={() => !insight.is_read && markReadMutation.mutate(insight.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColor(insight.type)} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{insight.title}</h3>
                      {!insight.is_read && (
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                      )}
                    </div>
                    <p className="text-sm text-white/60 mt-1">{insight.content}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {insights.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-white/20" />
              <p className="text-white/40">No insights yet</p>
              <p className="text-white/30 text-sm mt-1">Generate some!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}