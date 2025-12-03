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

export default function Media() {
  return (
    <div className="container mx-auto max-w-2xl px-4 pb-24">
      <h1 className="text-3xl font-bold gradient-text pt-4 mb-6">Memories</h1>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="glass-card w-full grid grid-cols-4 p-1 mb-6 rounded-2xl bg-gray-100">
          <TabsTrigger 
            value="notes" 
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Notes</span>
          </TabsTrigger>
          <TabsTrigger 
            value="photos"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2"
          >
            <Image className="w-4 h-4" />
            <span className="text-xs">Photos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="videos"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2"
          >
            <Video className="w-4 h-4" />
            <span className="text-xs">Videos</span>
          </TabsTrigger>
          <TabsTrigger 
            value="music"
            className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white text-gray-500 flex flex-col items-center gap-1 py-2"
          >
            <Music className="w-4 h-4" />
            <span className="text-xs">Music</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <NotesTab />
        </TabsContent>

        <TabsContent value="photos">
          <PhotosTab />
        </TabsContent>

        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>

        <TabsContent value="music">
          <MusicTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}