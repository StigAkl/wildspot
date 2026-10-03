import { useEffect, useState } from 'react';
import maplibregl from './maplibre.js';
import { TERRAIN_EXAGGERATION, TERRAIN_SOURCE_ID } from './mapStyle.js';

const JOTUNHEIMEN = { center: [8.35, 61.55], zoom: 11, pitch: 65, bearing: -25 };
const EMPTY_STYLE = { version: 8, sources: {}, layers: [] };

export function useMapLibre(containerRef) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const newMap = new maplibregl.Map({
      container: containerRef.current,
      style: EMPTY_STYLE,
      ...JOTUNHEIMEN,
      maxPitch: 85,
      hash: true,
    });

    newMap.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));
    newMap.addControl(new maplibregl.TerrainControl({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION }));
    newMap.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }),
    );
    newMap.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    setMap(newMap);
    return () => newMap.remove();
  }, [containerRef]);

  return map;
}

export function elevationAt(map, { lng, lat }) {
  const terrain = map.getTerrain();
  const elevation = terrain ? map.queryTerrainElevation([lng, lat]) : null;
  return elevation === null ? null : Math.round(elevation / terrain.exaggeration);
}
