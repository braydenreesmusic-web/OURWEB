//
//  enhancedchat.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart, Sparkles, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EnhancedChat({ user, onClose }) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: notes = [] } = useQuery({
    queryKey: ['chatNotes'],
    queryFn: () => base44.entities.Note.list('-created_date', 50),
    refetchInterval: 3000
  });

  const { data: partnerCheckIn } = useQuery({
    queryKey: ['partnerMood'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const checkIns = await base44.entities.DailyCheckIn.list('-created_date');
      return checkIns.find(c => c.date === today && c.user_name !== user?.full_name);
    }
  });

  const sendNoteMutation = useMutation({
    mutationFn: (content) => base44.entities.Note.create({
      content,
      author_name: user?.full_name || 'Anonymous'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatNotes'] });
      setMessage('');
    }
  });

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);

    const context = partnerCheckIn 
      ? `Partner is feeling ${partnerCheckIn.emotion} and needs ${partnerCheckIn.love_language.replace(/_/g, ' ')}`
      : 'No mood data available';

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 4 sweet, romantic message suggestions for someone to send to their partner.
      Context: ${context}
      Make them warm, genuine, and varied in length.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: { type: "array", items: { type: "string" } }
        }
      }
    });

    setSuggestions(result.suggestions || []);
    setLoadingSuggestions(false);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendNoteMutation.mutate(message);
  };

  const useSuggestion = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notes]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl w-full max-w-md h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Love Notes</h2>
              {partnerCheckIn && (
                <p className="text-xs text-white/50">
                  Partner feels {partnerCheckIn.emotion}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[...notes].reverse().map((note) => {
            const isMe = note.author_name === user?.full_name;
            return (
              <div key={note.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  isMe 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-sm' 
                    : 'bg-white/10 text-white rounded-bl-sm'
                }`}>
                  <p className="text-sm">{note.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-white/40'}`}>
                    {format(new Date(note.created_date), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Suggestions */}
        {showSuggestions && (
          <div className="px-4 py-3 border-t border-white/10 bg-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Suggestions
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowSuggestions(false)} className="h-6 px-2 text-white/50">
                <X className="w-3 h-3" />
              </Button>
            </div>
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => useSuggestion(suggestion)}
                    className="w-full text-left text-sm bg-white/5 rounded-xl px-3 py-2 text-white/80 hover:bg-white/10 smooth-transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={generateSuggestions}
              className="rounded-full flex-shrink-0 border-white/20 text-purple-400 hover:bg-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Send a love note..."
              className="flex-1 bg-white/5 border-white/10 rounded-full text-white"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}