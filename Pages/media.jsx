//
//  media.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Image, Video, Music } from 'lucide-react';
import NotesTab from '../Components/media/notestab';
import PhotosTab from '../Components/media/photostab';
import VideosTab from '../Components/media/videotab';
import MusicTab from '../Components/media/musictab';
import AppShell from '../Components/AppShell';

export default function Media() {
  // Optionally, you can use React Query for each tab's data and loading/error states
  return (
    <AppShell
      header={
        <div className="pt-4 mb-6">
          <h1 className="text-3xl font-bold gradient-text">Memories</h1>
          <p className="text-gray-500 mt-1 text-base">All your shared moments, in one beautiful place.</p>
        </div>
      }
    >
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="glass-card w-full grid grid-cols-4 p-1 mb-8 rounded-2xl bg-gray-100 shadow-sm">
          <TabsTrigger
            value="notes"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
            aria-label="Notes"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs font-medium">Notes</span>
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-label="Photos"
          >
            <Image className="w-5 h-5" />
            <span className="text-xs font-medium">Photos</span>
          </TabsTrigger>
          <TabsTrigger
            value="videos"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label="Videos"
          >
            <Video className="w-5 h-5" />
            <span className="text-xs font-medium">Videos</span>
          </TabsTrigger>
          <TabsTrigger
            value="music"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Music"
          >
            <Music className="w-5 h-5" />
            <span className="text-xs font-medium">Music</span>
          </TabsTrigger>
        </TabsList>

        <div className="rounded-2xl glass-card p-4 mb-4 min-h-[300px] shadow-md">
          <TabsContent value="notes">
            <NotesTab emptyState={<div className="text-gray-400 text-center py-8">No notes yet.</div>} />
          </TabsContent>
          <TabsContent value="photos">
            <PhotosTab emptyState={<div className="text-gray-400 text-center py-8">No photos yet.</div>} />
          </TabsContent>
          <TabsContent value="videos">
            <VideosTab emptyState={<div className="text-gray-400 text-center py-8">No videos yet.</div>} />
          </TabsContent>
          <TabsContent value="music">
            <MusicTab emptyState={<div className="text-gray-400 text-center py-8">No music yet.</div>} />
          </TabsContent>
        </div>
      </Tabs>
    </AppShell>
  );
}