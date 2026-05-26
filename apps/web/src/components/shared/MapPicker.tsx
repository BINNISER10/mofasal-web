'use client';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';
import { MapPin, Crosshair, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MapPickerProps {
  lat?: number;
  lng?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  height?: number;
  className?: string;
}

export function MapPicker({
  lat: initialLat = 24.7136,
  lng: initialLng = 46.6753,
  onLocationChange,
  height = 400,
  className,
}: MapPickerProps) {
  const { isRTL } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        if (!mapRef.current || mapRef.current.getAttribute('data-loaded')) return;

        const map = L.map(mapRef.current).setView([currentLat, currentLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

        marker.on('dragend', async () => {
          const pos = marker.getLatLng();
          setCurrentLat(pos.lat);
          setCurrentLng(pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });

        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          setCurrentLat(e.latlng.lat);
          setCurrentLng(e.latlng.lng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        });

        mapRef.current.setAttribute('data-loaded', 'true');
      } catch (err) {
        console.error('Map loading error:', err);
      }
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.removeAttribute('data-loaded');
      }
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${isRTL ? 'ar' : 'en'}`
      );
      const data = await res.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addr);
      onLocationChange(lat, lng, addr);
    } catch {
      const addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addr);
      onLocationChange(lat, lng, addr);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLng(pos.coords.longitude);
          reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const L = require('leaflet');
          if (mapRef.current) {
            const map = mapRef.current as any;
            map.flyTo([pos.coords.latitude, pos.coords.longitude], 15);
          }
        },
        (err) => console.error('Geolocation error:', err)
      );
    }
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&accept-language=${isRTL ? 'ar' : 'en'}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        setCurrentLat(parseFloat(lat));
        setCurrentLng(parseFloat(lon));
        setAddress(display_name);
        onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
            placeholder={isRTL ? 'ابحث عن عنوان...' : 'Search address...'}
            className="w-full pr-9 pl-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button size="sm" variant="primary" onClick={searchAddress}>
          {isRTL ? 'بحث' : 'Search'}
        </Button>
        <Button size="sm" variant="outline" onClick={getCurrentLocation}>
          <Crosshair size={16} />
        </Button>
      </div>

      <div
        ref={mapRef}
        style={{ height }}
        className="rounded-xl border border-gray-200 overflow-hidden"
      />

      {address && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <MapPin size={16} className="text-primary-600 mt-0.5 flex-shrink-0" />
          <span>{address}</span>
        </div>
      )}
    </div>
  );
}
