//
//  photostab.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { base44 } from '../../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, Heart, Trash2, Loader2, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';

export default function PhotosTab() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: photos = [] } = useQuery({
    queryKey: ['photos'],
    queryFn: () => base44.entities.Photo.list('-created_date')
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ file }) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Photo.create({
        url: file_url,
        uploaded_by: user?.full_name || 'Anonymous'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setUploading(false);
    }
  });

  const updateCaptionMutation = useMutation({
    mutationFn: ({ id, caption }) => base44.entities.Photo.update(id, { caption }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] })
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.Photo.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      if (selectedPhoto) {
        setSelectedPhoto(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
      }
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: (id) => base44.entities.Photo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setSelectedPhoto(null);
    }
  });

  const generateAIDescription = async (photo) => {
    setGeneratingAI(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Describe this couple's photo in a romantic, heartfelt way. Keep it short (2-3 sentences).`,
      file_urls: [photo.url],
      response_json_schema: {
        type: "object",
        properties: { description: { type: "string" } }
      }
    });
    
    await base44.entities.Photo.update(photo.id, { ai_description: result.description });
    queryClient.invalidateQueries({ queryKey: ['photos'] });
    setSelectedPhoto({ ...photo, ai_description: result.description });
    setGeneratingAI(false);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    uploadPhotoMutation.mutate({ file });
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover-lift smooth-transition border-2 border-dashed border-pink-200 hover:border-pink-400">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-2" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-2">
            <Upload className="w-6 h-6 text-white" />
          </div>
        )}
        <p className="font-semibold text-gray-700">
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </p>
        <p className="text-gray-400 text-sm mt-1">Add to your memories</p>
      </label>

      {/* Polaroid Grid */}
      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="animate-slide-up cursor-pointer"
            style={{ 
              transform: `rotate(${(index % 2 === 0 ? -2 : 2)}deg)`,
              animationDelay: `${index * 0.05}s`
            }}
            onClick={() => setSelectedPhoto(photo)}
          >
            <div className="bg-white p-2 pb-12 rounded-sm shadow-lg hover:shadow-xl hover:scale-105 hover:rotate-0 smooth-transition relative">
              <img
                src={photo.url}
                alt={photo.caption || 'Photo'}
                className="w-full aspect-square object-cover"
              />
              {photo.is_favorite && (
                <div className="absolute top-4 right-4 bg-pink-500 rounded-full p-1.5 shadow-md">
                  <Heart className="w-3 h-3 text-white" fill="white" />
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <input
                  type="text"
                  placeholder="Add caption..."
                  defaultValue={photo.caption || ''}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    if (e.target.value !== photo.caption) {
                      updateCaptionMutation.mutate({ id: photo.id, caption: e.target.value });
                    }
                  }}
                  className="w-full text-gray-600 bg-transparent border-none outline-none placeholder:text-gray-300 text-center"
                  style={{ fontFamily: 'Caveat, cursive', fontSize: '16px' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && !uploading && (
        <div className="text-center py-12">
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No photos yet</p>
          <p className="text-gray-300 text-sm mt-1">Upload your first memory!</p>
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-2xl">
          {selectedPhoto && (
            <div>
              <div className="relative">
                <img src={selectedPhoto.url} alt="" className="w-full max-h-[50vh] object-cover" />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 smooth-transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5 space-y-4">
                {selectedPhoto.caption && (
                  <p className="text-gray-700 text-lg text-center" style={{ fontFamily: 'Caveat, cursive' }}>
                    "{selectedPhoto.caption}"
                  </p>
                )}

                <p className="text-gray-400 text-sm text-center">
                  {selectedPhoto.uploaded_by} • {format(new Date(selectedPhoto.created_date), 'MMM d, yyyy')}
                </p>

                {/* AI Memory Section - Darker background for visibility */}
                {selectedPhoto.ai_description ? (
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold text-sm">AI Memory</span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed">{selectedPhoto.ai_description}</p>
                  </div>
                ) : (
                  <Button
                    onClick={() => generateAIDescription(selectedPhoto)}
                    disabled={generatingAI}
                    className="w-full rounded-xl h-11 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  >
                    {generatingAI ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Generate AI Memory</>
                    )}
                  </Button>
                )}

                {/* Action Buttons - More visually appealing */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    onClick={() => toggleFavoriteMutation.mutate({ id: selectedPhoto.id, isFavorite: selectedPhoto.is_favorite })}
                    className={`rounded-xl h-12 font-medium ${
                      selectedPhoto.is_favorite 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                        : 'bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200'
                    }`}
                  >
                    <Heart className="w-5 h-5 mr-2" fill={selectedPhoto.is_favorite ? 'white' : 'none'} />
                    {selectedPhoto.is_favorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    onClick={() => deletePhotoMutation.mutate(selectedPhoto.id)}
                    className="rounded-xl h-12 font-medium bg-red-50 hover:bg-red-100 text-red-500 border border-red-200"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}