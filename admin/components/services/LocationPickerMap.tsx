'use client';

import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';

interface PinHandlerProps {
  interactive: boolean;
  onPick: (lat: number, lng: number) => void;
}

function PinHandler({ interactive, onPick }: PinHandlerProps) {
  useMapEvents({
    click(e) {
      if (!interactive) return;
      onPick(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
}

interface MapViewportSyncProps {
  center: [number, number];
  zoom: number;
}

function MapViewportSync({ center, zoom }: MapViewportSyncProps) {
  const map = useMap();

  useEffect(() => {
    try {
      map.flyTo(center, zoom, { animate: true, duration: 1 });
    } catch {}
  }, [center, map, zoom]);

  return null;
}

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onPick: (lat: number, lng: number) => void;
  interactive?: boolean;
}

export default function LocationPickerMap({
  lat,
  lng,
  onPick,
  interactive = true,
}: LocationPickerMapProps) {
  const hasPin = (typeof lat === 'number' && !isNaN(lat) && lat !== 0) ||
                 (typeof lng === 'number' && !isNaN(lng) && lng !== 0);
  const center: [number, number] = hasPin ? [lat, lng] : [25.2048, 55.2708]; // Dubai default

  const markerIcon = useMemo(() => {
    try {
      return L.icon({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
    } catch {
      return undefined;
    }
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={hasPin ? 12 : 5}
      className="z-0 h-80 w-full rounded-[inherit]"
      scrollWheelZoom={interactive}
    >
      <MapViewportSync center={center} zoom={hasPin ? 12 : 5} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PinHandler interactive={interactive} onPick={onPick} />
      {hasPin && (
        <Marker
          position={[lat, lng]}
          icon={markerIcon}
          draggable={interactive}
          eventHandlers={{
            dragend(event) {
              try {
                const nextPosition = event.target.getLatLng();
                onPick(
                  parseFloat(nextPosition.lat.toFixed(6)),
                  parseFloat(nextPosition.lng.toFixed(6)),
                );
              } catch {}
            },
          }}
        />
      )}
    </MapContainer>
  );
}
