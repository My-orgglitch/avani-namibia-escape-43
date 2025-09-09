import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

const InteractiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  // Guesthouse coordinates (Windhoek, Namibia area)
  const guesthouseCoords: [number, number] = [17.0658, -22.5749];

  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: guesthouseCoords,
        zoom: 12,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add marker for guesthouse
      const marker = new mapboxgl.Marker({
        color: '#2563eb'
      })
        .setLngLat(guesthouseCoords)
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-sm">Namibia Guesthouse</h3>
              <p class="text-xs text-gray-600">123 Safari Road, Windhoek</p>
            </div>
          `)
        )
        .addTo(map.current);

      map.current.on('load', () => {
        setIsMapReady(true);
      });

    } catch (error) {
      console.error('Error loading map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setIsMapReady(false);
    }
  };

  if (!mapboxToken) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <MapPin className="w-12 h-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold">Interactive Map</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To display the interactive map, please enter your Mapbox public token.
              Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
            </p>
            <form onSubmit={handleTokenSubmit} className="space-y-3">
              <Input
                type="text"
                placeholder="Enter your Mapbox public token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="text-sm"
              />
              <Button type="submit" size="sm" className="w-full">
                Load Map
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          <div 
            ref={mapContainer} 
            className="w-full h-64 rounded-lg"
            style={{ minHeight: '256px' }}
          />
          {!isMapReady && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveMap;