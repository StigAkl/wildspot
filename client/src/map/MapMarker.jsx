import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from './maplibre.js';

export default function MapMarker({ map, lng, lat, children }) {
  const [element] = useState(() => document.createElement('div'));

  useEffect(() => {
    const marker = new maplibregl.Marker({ element, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map);
    return () => marker.remove();
  }, [map, element, lng, lat]);

  return createPortal(children, element);
}
