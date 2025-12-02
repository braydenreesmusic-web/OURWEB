//
//  videotab.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect } from 'react';
import { base44 } from '../../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, Trash2, Loader2, Video } from 'lucide-react';

export default function VideosTab() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: videos = [] } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list('-created_date')
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return base44.entities.Video.create({
        url: file_url,
        uploaded_by: user?.full_name || 'Anonymous'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setUploading(false);
    }
  });

  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.Video.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos'] })
  });

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    uploadVideoMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <label className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover-lift smooth-transition">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-12 h-12 text-pink-400 animate-spin mb-3" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-3">
            <Upload className="w-8 h-8 text-white" />
          </div>
        )}
        <p className="font-semibold text-white">
          {uploading ? 'Uploading...' : 'Upload Video'}
        </p>
        <p className="text-white/40 text-sm mt-1">Share your moments</p>
      </label>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="glass-card rounded-2xl overflow-hidden hover-lift animate-slide-up">
            <video
              src={video.url}
              controls
              className="w-full aspect-video object-cover"
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{video.title || 'Video'}</p>
                <p className="text-white/40 text-sm">{video.uploaded_by}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteVideoMutation.mutate(video.id)}
                className="rounded-full text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && !uploading && (
        <div className="text-center py-16">
          <Video className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <p className="text-white/40">No videos yet</p>
          <p className="text-white/30 text-sm mt-1">Upload your first video!</p>
        </div>
      )}
    </div>
  );
}