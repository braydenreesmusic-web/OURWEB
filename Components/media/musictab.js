//
//  musictab.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//


import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '../../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, Trash2, Music as MusicIcon, Play, Pause, Plus, Radio, Users, X, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function MusicTab() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playingPreview, setPlayingPreview] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState('all');
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const { data: songs = [] } = useQuery({
    queryKey: ['music'],
    queryFn: () => base44.entities.Music.list('-created_date')
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => base44.entities.Playlist.list('-created_date')
  });

  const { data: activeSession } = useQuery({
    queryKey: ['listeningSession'],
    queryFn: async () => {
      const sessions = await base44.entities.ListeningSession.list('-created_date', 1);
      return sessions.find(s => s.is_active) || null;
    },
    refetchInterval: 2000
  });

  const createPlaylistMutation = useMutation({
    mutationFn: (name) => base44.entities.Playlist.create({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setNewPlaylistName('');
      setShowPlaylistDialog(false);
    }
  });

  const addSongMutation = useMutation({
    mutationFn: (songData) => base44.entities.Music.create({
      ...songData,
      added_by: user?.full_name || 'Anonymous'
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music'] })
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }) => 
      base44.entities.Music.update(id, { is_favorite: !isFavorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music'] })
  });

  const deleteSongMutation = useMutation({
    mutationFn: (id) => base44.entities.Music.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music'] })
  });

  const startListeningSession = useMutation({
    mutationFn: async (song) => {
      const sessions = await base44.entities.ListeningSession.list();
      for (const s of sessions.filter(x => x.is_active)) {
        await base44.entities.ListeningSession.update(s.id, { is_active: false });
      }
      return base44.entities.ListeningSession.create({
        song_id: song.id,
        song_title: song.title,
        song_artist: song.artist,
        preview_url: song.preview_url,
        cover_art: song.cover_art,
        is_playing: true,
        is_active: true,
        started_by: user?.full_name
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listeningSession'] })
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ListeningSession.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['listeningSession'] })
  });

  const searchiTunes = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(searchQuery)}&media=music&limit=10`
    );
    const data = await response.json();
    setSearchResults(data.results || []);
    setSearching(false);
  };

  const handleAddSong = (track) => {
    addSongMutation.mutate({
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      cover_art: track.artworkUrl100?.replace('100x100', '600x600'),
      preview_url: track.previewUrl,
      itunes_url: track.trackViewUrl,
      spotify_search_url: `https://open.spotify.com/search/${encodeURIComponent(track.trackName + ' ' + track.artistName)}`
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const playPreview = (previewUrl, songId) => {
    if (audioRef.current) audioRef.current.pause();
    if (playingPreview === songId) {
      setPlayingPreview(null);
      return;
    }
    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => setPlayingPreview(null);
    audioRef.current = audio;
    setPlayingPreview(songId);
  };

  const filteredSongs = selectedPlaylist === 'all' 
    ? songs 
    : selectedPlaylist === 'favorites'
    ? songs.filter(s => s.is_favorite)
    : songs.filter(s => s.playlist_id === selectedPlaylist);

  return (
    <div className="space-y-4">
      {/* Active Listening Session */}
      {activeSession && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 animate-pulse" />
            <span className="font-semibold text-sm">Listening Together</span>
          </div>
          <div className="flex items-center gap-3">
            {activeSession.cover_art ? (
              <img src={activeSession.cover_art} alt="" className="w-14 h-14 rounded-xl shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <MusicIcon className="w-6 h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{activeSession.song_title}</p>
              <p className="text-white/70 text-sm truncate">{activeSession.song_artist}</p>
            </div>
            <Button
              onClick={() => updateSessionMutation.mutate({ 
                id: activeSession.id, 
                data: { is_playing: !activeSession.is_playing } 
              })}
              className="rounded-full bg-white/20 hover:bg-white/30 w-11 h-11 p-0"
            >
              {activeSession.is_playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => updateSessionMutation.mutate({ id: activeSession.id, data: { is_active: false } })}
            className="w-full mt-3 text-white/70 hover:text-white hover:bg-white/10 text-sm h-8"
          >
            End Session
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for songs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchiTunes()}
            className="flex-1 rounded-xl h-11"
          />
          <Button
            onClick={searchiTunes}
            disabled={searching}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl px-5 h-11"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 max-h-64 overflow-y-auto space-y-2 border-t pt-3">
            {searchResults.map((track) => (
              <div key={track.trackId} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                <img src={track.artworkUrl60} alt="" className="w-12 h-12 rounded-lg shadow" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium text-sm truncate">{track.trackName}</p>
                  <p className="text-gray-500 text-xs truncate">{track.artistName}</p>
                </div>
                <Button
                  onClick={() => handleAddSong(track)}
                  className="bg-pink-500 hover:bg-pink-600 text-white rounded-full h-9 w-9 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant={selectedPlaylist === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedPlaylist('all')}
          className={`rounded-full whitespace-nowrap text-sm h-9 ${
            selectedPlaylist === 'all' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0' 
              : 'border-gray-200 text-gray-600'
          }`}
        >
          All Songs
        </Button>
        <Button
          variant={selectedPlaylist === 'favorites' ? 'default' : 'outline'}
          onClick={() => setSelectedPlaylist('favorites')}
          className={`rounded-full whitespace-nowrap text-sm h-9 ${
            selectedPlaylist === 'favorites' 
              ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0' 
              : 'border-gray-200 text-gray-600'
          }`}
        >
          ❤️ Favorites
        </Button>
        {playlists.map((pl) => (
          <Button
            key={pl.id}
            variant={selectedPlaylist === pl.id ? 'default' : 'outline'}
            onClick={() => setSelectedPlaylist(pl.id)}
            className={`rounded-full whitespace-nowrap text-sm h-9 ${
              selectedPlaylist === pl.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0' 
                : 'border-gray-200 text-gray-600'
            }`}
          >
            {pl.name}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={() => setShowPlaylistDialog(true)}
          className="rounded-full border-gray-200 text-gray-600 h-9 w-9 p-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Songs List */}
      <div className="space-y-2">
        {filteredSongs.map((song) => (
          <div 
            key={song.id} 
            className="glass-card rounded-xl p-3 flex items-center gap-3 hover-lift cursor-pointer"
            onClick={() => setSelectedSong(song)}
          >
            {song.cover_art ? (
              <img src={song.cover_art} alt="" className="w-14 h-14 rounded-xl object-cover shadow" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <MusicIcon className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-semibold truncate">{song.title}</p>
              <p className="text-gray-500 text-sm truncate">{song.artist || 'Unknown'}</p>
            </div>

            <div className="flex items-center gap-1">
              {song.is_favorite && <Heart className="w-4 h-4 text-pink-500" fill="#FF6B9D" />}
              {song.preview_url && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    playPreview(song.preview_url, song.id);
                  }}
                  className="rounded-full w-10 h-10"
                >
                  {playingPreview === song.id ? (
                    <Pause className="w-5 h-5 text-pink-500" />
                  ) : (
                    <Play className="w-5 h-5 text-gray-400" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSongs.length === 0 && (
        <div className="text-center py-12">
          <MusicIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">No songs yet</p>
          <p className="text-gray-300 text-sm mt-1">Search to add music!</p>
        </div>
      )}

      {/* Song Detail Dialog */}
      <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-white rounded-2xl">
          {selectedSong && (
            <div>
              <div className="relative bg-gradient-to-br from-pink-500 to-purple-600 p-6 pb-8">
                <button
                  onClick={() => setSelectedSong(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="text-center">
                  {selectedSong.cover_art ? (
                    <img src={selectedSong.cover_art} alt="" className="w-36 h-36 rounded-2xl mx-auto shadow-2xl object-cover" />
                  ) : (
                    <div className="w-36 h-36 rounded-2xl mx-auto bg-white/20 flex items-center justify-center">
                      <MusicIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 -mt-4 relative">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{selectedSong.title}</h3>
                  <p className="text-gray-500">{selectedSong.artist}</p>
                  {selectedSong.album && <p className="text-gray-400 text-sm">{selectedSong.album}</p>}
                </div>

                {selectedSong.preview_url && (
                  <div className="space-y-2 mb-4">
                    <Button
                      onClick={() => playPreview(selectedSong.preview_url, selectedSong.id)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl h-11"
                    >
                      {playingPreview === selectedSong.id ? (
                        <><Pause className="w-5 h-5 mr-2" /> Pause</>
                      ) : (
                        <><Play className="w-5 h-5 mr-2" /> Play Preview</>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => startListeningSession.mutate(selectedSong)}
                      variant="outline"
                      className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl h-11"
                    >
                      <Users className="w-5 h-5 mr-2" /> Listen Together
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {selectedSong.itunes_url && (
                    <a
                      href={selectedSong.itunes_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-gray-900 text-white rounded-xl py-2.5 font-medium text-sm"
                    >
                      🍎 Apple
                    </a>
                  )}
                  {selectedSong.spotify_search_url && (
                    <a
                      href={selectedSong.spotify_search_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-2.5 font-medium text-sm"
                    >
                      🎧 Spotify
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      toggleFavoriteMutation.mutate({ id: selectedSong.id, isFavorite: selectedSong.is_favorite });
                      setSelectedSong(prev => ({ ...prev, is_favorite: !prev.is_favorite }));
                    }}
                    className={`flex-1 rounded-xl h-10 ${
                      selectedSong.is_favorite 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                        : 'bg-pink-50 hover:bg-pink-100 text-pink-600'
                    }`}
                  >
                    <Heart className="w-4 h-4 mr-1" fill={selectedSong.is_favorite ? 'white' : 'none'} />
                    {selectedSong.is_favorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      deleteSongMutation.mutate(selectedSong.id);
                      setSelectedSong(null);
                    }}
                    className="rounded-xl h-10 border-red-200 text-red-500 hover:bg-red-50 px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Playlist Dialog */}
      <Dialog open={showPlaylistDialog} onOpenChange={setShowPlaylistDialog}>
        <DialogContent className="glass-card">
          <div className="space-y-4">
            <h3 className="text-lg font-bold gradient-text">Create Playlist</h3>
            <Input
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="rounded-xl h-11"
            />
            <Button
              onClick={() => createPlaylistMutation.mutate(newPlaylistName)}
              disabled={!newPlaylistName.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl h-11"
            >
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
