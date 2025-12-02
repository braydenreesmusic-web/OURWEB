//
//  notestab.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { base44 } from '../../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Heart, Trash2, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function NotesTab() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.Note.list('-created_date')
  });

  const createNoteMutation = useMutation({
    mutationFn: (data) => base44.entities.Note.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setNoteText('');
    }
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.Note.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.Note.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    createNoteMutation.mutate({
      content: noteText,
      author_name: user?.full_name || 'Anonymous'
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 flex gap-3">
        <Input
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Write a love note..."
          className="flex-1 rounded-xl"
        />
        <Button
          type="submit"
          disabled={!noteText.trim() || createNoteMutation.isPending}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full w-11 h-11 p-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="glass-card rounded-2xl p-4 hover-lift animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-800 leading-relaxed mb-2">{note.content}</p>
                <p className="text-gray-400 text-xs">
                  {note.author_name} • {format(new Date(note.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
              <div className="flex gap-1 ml-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavoriteMutation.mutate({ 
                    id: note.id, 
                    isFavorite: note.is_favorite 
                  })}
                  className="rounded-full w-8 h-8"
                >
                  <Heart 
                    className="w-4 h-4" 
                    fill={note.is_favorite ? '#FF6B9D' : 'none'}
                    stroke="#FF6B9D"
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNoteMutation.mutate(note.id)}
                  className="rounded-full text-red-500 hover:bg-red-50 w-8 h-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No notes yet</p>
            <p className="text-gray-300 text-sm mt-1">Send a love note!</p>
          </div>
        )}
      </div>
    </div>
  );
}