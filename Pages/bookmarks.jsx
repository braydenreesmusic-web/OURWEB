//
//  bookmarks.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bookmark, Plus, Trash2, ExternalLink, Utensils, Film, 
  Video, Heart, Youtube, MoreHorizontal, Loader2 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categories = [
  { value: 'restaurant', label: 'Restaurants', icon: Utensils, color: 'from-orange-500 to-red-500' },
  { value: 'movie', label: 'Movies', icon: Film, color: 'from-purple-500 to-indigo-500' },
  { value: 'tiktok', label: 'TikToks', icon: Video, color: 'from-pink-500 to-rose-500' },
  { value: 'date_idea', label: 'Date Ideas', icon: Heart, color: 'from-pink-500 to-purple-500' },
  { value: 'youtube', label: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-gray-500 to-gray-600' }
];

export default function Bookmarks() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    category: 'other',
    notes: ''
  });
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => base44.entities.Bookmark.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Bookmark.create({
      ...data,
      added_by: user?.full_name || 'Anonymous'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      setShowAdd(false);
      setFormData({ title: '', url: '', category: 'other', notes: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Bookmark.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
  });

  const fetchUrlInfo = async () => {
    if (!formData.url) return;
    setFetching(true);
    
    const url = formData.url.toLowerCase();
    let category = 'other';
    if (url.includes('tiktok')) category = 'tiktok';
    else if (url.includes('youtube') || url.includes('youtu.be')) category = 'youtube';
    else if (url.includes('yelp') || url.includes('doordash') || url.includes('uber')) category = 'restaurant';
    else if (url.includes('imdb') || url.includes('netflix') || url.includes('hulu')) category = 'movie';

    if (!formData.title) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Given this URL: ${formData.url}
        Extract or generate a short, descriptive title (max 50 chars).
        Return only the title, nothing else.`,
        response_json_schema: {
          type: "object",
          properties: { title: { type: "string" } }
        }
      });
      setFormData(prev => ({ ...prev, title: result.title, category }));
    } else {
      setFormData(prev => ({ ...prev, category }));
    }
    setFetching(false);
  };

  const filteredBookmarks = selectedCategory === 'all' 
    ? bookmarks 
    : bookmarks.filter(b => b.category === selectedCategory);

  const getCategoryIcon = (cat) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.icon : MoreHorizontal;
  };

  const getCategoryColor = (cat) => {
    const found = categories.find(c => c.value === cat);
    return found ? found.color : 'from-gray-500 to-gray-600';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 space-y-6">
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-3xl font-bold gradient-text">Saved</h1>
        <Button
          onClick={() => setShowAdd(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full h-10 px-5"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={`rounded-full whitespace-nowrap ${
            selectedCategory === 'all' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0' 
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All
        </Button>
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.value)}
              className={`rounded-full whitespace-nowrap ${
                selectedCategory === cat.value 
                  ? `bg-gradient-to-r ${cat.color} text-white border-0` 
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredBookmarks.map((bookmark) => {
          const Icon = getCategoryIcon(bookmark.category);
          return (
            <div key={bookmark.id} className="glass-card rounded-2xl p-4 hover-lift animate-slide-up">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCategoryColor(bookmark.category)} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 font-semibold truncate">{bookmark.title}</h3>
                  {bookmark.notes && (
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{bookmark.notes}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">Added by {bookmark.added_by}</p>
                </div>
                <div className="flex gap-2">
                  {bookmark.url && (
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 smooth-transition"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(bookmark.id)}
                    className="w-9 h-9 rounded-full text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBookmarks.length === 0 && (
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No bookmarks yet</p>
          <p className="text-gray-300 text-sm mt-1">Save restaurants, movies, and more!</p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">Save Something</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Paste a link..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              onBlur={fetchUrlInfo}
              className="rounded-xl h-11"
            />
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-xl h-11"
            />
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl min-h-[80px]"
            />
            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={!formData.title || fetching}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl h-11"
            >
              {fetching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Bookmark'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}