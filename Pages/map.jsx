//
//  map.js
//  webbb
//
//  Created by Brayden Rees on 12/2/25.
//

import React, { useState, useEffect } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Navigation, Loader2, Heart, Camera, Trash2, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const heartIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #FF6B9D, #C96DD8); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 15px rgba(255,107,157,0.4); border: 2px solid white;"><span style="transform: rotate(45deg); font-size: 14px;">💕</span></div>`,
  className: 'custom-heart-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const locationIcon = new L.DivIcon({
  html: `<div style="background: linear-gradient(135deg, #3B82F6, #06B6D4); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 3px 12px rgba(59,130,246,0.4);"></div>`,
  className: 'custom-location-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 14);
  }, [center, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function Map() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [showAddPin, setShowAddPin] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [newPin, setNewPin] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [activeTab, setActiveTab] = useState('memories');
  const [selectedPin, setSelectedPin] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.LocationShare.list('-last_updated'),
    refetchInterval: 15000
  });

  const { data: memoryPins = [] } = useQuery({
    queryKey: ['memoryPins'],
    queryFn: () => base44.entities.MemoryPin.list('-created_date')
  });

  const { data: photosWithLocation = [] } = useQuery({
    queryKey: ['photosWithLocation'],
    queryFn: async () => {
      const photos = await base44.entities.Photo.list('-created_date');
      return photos.filter(p => p.latitude && p.longitude);
    }
  });

  const shareLocationMutation = useMutation({
    mutationFn: async (coords) => {
      const existingLocation = locations.find(loc => loc.user_name === user?.full_name);
      if (existingLocation) {
        return base44.entities.LocationShare.update(existingLocation.id, {
          latitude: coords.latitude,
          longitude: coords.longitude,
          is_active: true,
          last_updated: new Date().toISOString()
        });
      } else {
        return base44.entities.LocationShare.create({
          user_name: user?.full_name || 'Anonymous',
          latitude: coords.latitude,
          longitude: coords.longitude,
          is_active: true,
          last_updated: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setSharing(false);
    }
  });

  const createPinMutation = useMutation({
    mutationFn: (data) => base44.entities.MemoryPin.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryPins'] });
      setShowAddPin(false);
      setNewPin({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
      setClickedLocation(null);
    }
  });

  const deletePinMutation = useMutation({
    mutationFn: (id) => base44.entities.MemoryPin.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memoryPins'] });
      setSelectedPin(null);
    }
  });

  const handleShareLocation = () => {
    if (!navigator.geolocation) return;
    setSharing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setCurrentLocation([coords.latitude, coords.longitude]);
        shareLocationMutation.mutate(coords);
      },
      () => setSharing(false)
    );
  };

  const handleMapClick = (latlng) => {
    if (activeTab === 'memories') {
      setClickedLocation(latlng);
      setShowAddPin(true);
    }
  };

  const handleCreatePin = () => {
    if (!clickedLocation || !newPin.title) return;
    createPinMutation.mutate({
      ...newPin,
      latitude: clickedLocation.lat,
      longitude: clickedLocation.lng
    });
  };

  const activeLocations = locations.filter(loc => {
    if (!loc.is_active) return false;
    const lastUpdated = new Date(loc.last_updated);
    const diffMinutes = (new Date() - lastUpdated) / 1000 / 60;
    return diffMinutes < 5;
  });

  const defaultCenter = memoryPins[0]
    ? [memoryPins[0].latitude, memoryPins[0].longitude]
    : activeLocations[0]
    ? [activeLocations[0].latitude, activeLocations[0].longitude]
    : [40.7128, -74.0060];

  return (
    <div className="h-screen flex flex-col pb-24">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 space-y-3 bg-gradient-to-b from-white to-transparent">
        <h1 className="text-3xl font-bold gradient-text pt-2">Our Map</h1>
        
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'memories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('memories')}
            className={`flex-1 rounded-xl h-10 ${
              activeTab === 'memories' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                : 'border-gray-200'
            }`}
          >
            <Heart className="w-4 h-4 mr-2" />
            Memories
          </Button>
          <Button
            variant={activeTab === 'live' ? 'default' : 'outline'}
            onClick={() => setActiveTab('live')}
            className={`flex-1 rounded-xl h-10 ${
              activeTab === 'live' 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                : 'border-gray-200'
            }`}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Live
          </Button>
        </div>

        {activeTab === 'live' && (
          <Button
            onClick={handleShareLocation}
            disabled={sharing}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl h-11"
          >
            {sharing ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating...</>
            ) : (
              <><Navigation className="w-5 h-5 mr-2" /> Share My Location</>
            )}
          </Button>
        )}

        {activeTab === 'memories' && (
          <p className="text-sm text-gray-400 text-center">Tap anywhere on the map to pin a memory 💕</p>
        )}
      </div>

      {/* Memory Pins List */}
      {activeTab === 'memories' && memoryPins.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {memoryPins.map((pin) => (
              <button
                key={pin.id}
                onClick={() => {
                  setSelectedPin(pin);
                  setCurrentLocation([pin.latitude, pin.longitude]);
                }}
                className="glass-card rounded-xl p-3 min-w-[140px] flex-shrink-0 text-left hover:shadow-md smooth-transition"
              >
                <p className="font-semibold text-gray-800 text-sm truncate">{pin.title}</p>
                <p className="text-gray-400 text-xs mt-1">{pin.date ? format(new Date(pin.date), 'MMM d, yyyy') : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Locations List */}
      {activeTab === 'live' && activeLocations.length > 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {activeLocations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setCurrentLocation([loc.latitude, loc.longitude])}
                className="glass-card rounded-xl p-3 min-w-[140px] flex-shrink-0 text-left"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="font-semibold text-gray-800 text-sm">{loc.user_name}</p>
                </div>
                <p className="text-gray-400 text-xs mt-1">{loc.last_updated ? new Date(loc.last_updated).toLocaleTimeString() : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative rounded-t-3xl overflow-hidden mx-2 shadow-lg">
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0 rounded-t-3xl">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapUpdater center={currentLocation} />
          {activeTab === 'memories' && <MapClickHandler onMapClick={handleMapClick} />}
          
          {/* Memory Pins */}
          {activeTab === 'memories' && memoryPins.map((pin) => (
            <Marker key={pin.id} position={[pin.latitude, pin.longitude]} icon={heartIcon}>
              <Popup className="custom-popup">
                <div className="text-center p-1 min-w-[150px]">
                  {pin.photo_url && (
                    <img src={pin.photo_url} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <p className="font-bold text-gray-800">{pin.title}</p>
                  {pin.description && <p className="text-sm text-gray-500 mt-1">{pin.description}</p>}
                  {pin.date && <p className="text-xs text-gray-400 mt-2">{format(new Date(pin.date), 'MMM d, yyyy')}</p>}
                  <button
                    onClick={() => deletePinMutation.mutate(pin.id)}
                    className="mt-2 text-red-500 text-xs hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Photo Locations */}
          {activeTab === 'memories' && photosWithLocation.map((photo) => (
            <Marker key={photo.id} position={[photo.latitude, photo.longitude]} icon={heartIcon}>
              <Popup>
                <div className="text-center p-1">
                  <img src={photo.url} alt="" className="w-28 h-28 object-cover rounded-lg mb-2" />
                  <p className="text-sm text-gray-700">{photo.caption || 'Photo Memory'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Live Locations */}
          {activeTab === 'live' && activeLocations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={locationIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{loc.user_name}</p>
                  <p className="text-xs text-gray-500">{loc.last_updated ? new Date(loc.last_updated).toLocaleString() : ''}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Add Button */}
        {activeTab === 'memories' && (
          <button
            onClick={() => {
              if (currentLocation) {
                setClickedLocation({ lat: currentLocation[0], lng: currentLocation[1] });
                setShowAddPin(true);
              }
            }}
            className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg flex items-center justify-center z-[1000]"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Add Pin Dialog */}
      <Dialog open={showAddPin} onOpenChange={setShowAddPin}>
        <DialogContent className="glass-card max-w-sm">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Pin a Memory
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              placeholder="What happened here?"
              value={newPin.title}
              onChange={(e) => setNewPin({ ...newPin, title: e.target.value })}
              className="rounded-xl h-11"
            />
            <Textarea
              placeholder="Tell the story..."
              value={newPin.description}
              onChange={(e) => setNewPin({ ...newPin, description: e.target.value })}
              className="rounded-xl min-h-[80px]"
            />
            <Input
              type="date"
              value={newPin.date}
              onChange={(e) => setNewPin({ ...newPin, date: e.target.value })}
              className="rounded-xl h-11"
            />
            <Button
              onClick={handleCreatePin}
              disabled={!newPin.title}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl h-11"
              loading={addPinMutation.isPending}
            >
              <Heart className="w-5 h-5 mr-2" /> Save Memory
            </Button>
          </div>
        </DialogContent>
      </Dialog>
