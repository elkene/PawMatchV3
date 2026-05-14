'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LocationMap({ onLocationSelect, initialLocation }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mounted, setMounted] = useState(false);

  const getPositionArray = (loc) => {
    if (!loc) return [-23.2237, -106.5899];
    if (Array.isArray(loc)) return loc;
    return [loc.latitude, loc.longitude];
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !mapContainer.current || map.current) return;

    const position = getPositionArray(initialLocation);

    map.current = L.map(mapContainer.current).setView(position, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    const defaultIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
    });

    if (initialLocation && !Array.isArray(initialLocation)) {
      const markerPos = [initialLocation.latitude, initialLocation.longitude];
      marker.current = L.marker(markerPos, { icon: defaultIcon })
        .addTo(map.current)
        .bindPopup('Ubicacion seleccionada');
    }

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      const location = {
        latitude: lat,
        longitude: lng,
        address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      };

      if (marker.current) {
        marker.current.setLatLng([lat, lng]);
      } else {
        marker.current = L.marker([lat, lng], { icon: defaultIcon })
          .addTo(map.current)
          .bindPopup('Ubicacion seleccionada');
      }

      onLocationSelect(location);
    };

    map.current.on('click', handleMapClick);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (map.current) {
            map.current.setView([latitude, longitude], 13);
          }
        },
        () => {
          console.log('No se pudo obtener ubicacion actual');
        }
      );
    }

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
        map.current.remove();
        map.current = null;
      }
    };
  }, [mounted]);

  if (!mounted) {
    return <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">Cargando mapa...</div>;
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-300"
      style={{ height: '24rem' }}
    />
  );
}
