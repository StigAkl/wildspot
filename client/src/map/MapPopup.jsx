import { useEffect, useEffectEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from './maplibre.js';

export default function MapPopup({ map, lng, lat, onClose, children }) {
  const [element] = useState(() => document.createElement('div'));
  const handleClose = useEffectEvent(onClose);

  useEffect(() => {
    const popup = new maplibregl.Popup({ maxWidth: '340px', offset: 34 })
      .setLngLat([lng, lat])
      .setDOMContent(element)
      .addTo(map);

    popup.on('close', handleClose);
    return () => {
      popup.off('close', handleClose);
      popup.remove();
    };
  }, [map, element, lng, lat]);

  return createPortal(children, element);
}
