import { useEffect } from 'react';
import { DEFAULT_BASEMAP_ID, findMapLayer } from './mapLayers.js';

export const TERRAIN_SOURCE_ID = 'wildspot-terrain';
export const TERRAIN_EXAGGERATION = 1.3;

const HILLSHADE_SOURCE_ID = 'wildspot-hillshade';

const TERRAIN_TILES = {
  type: 'raster-dem',
  tiles: ['https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'],
  encoding: 'terrarium',
  tileSize: 512,
  maxzoom: 16,
  attribution: '<a href="https://mapterhorn.com/attribution">© Mapterhorn</a>',
};

const HILLSHADE_LAYER = {
  id: 'wildspot-hillshade',
  type: 'hillshade',
  source: HILLSHADE_SOURCE_ID,
  paint: { 'hillshade-exaggeration': 0.3, 'hillshade-shadow-color': '#2d2a22' },
};

const SKY = {
  'sky-color': '#7fb0dd',
  'horizon-color': '#dfe9f0',
  'fog-color': '#eef2f4',
  'sky-horizon-blend': 0.6,
  'horizon-fog-blend': 0.7,
  'fog-ground-blend': 0.4,
};

export function useMapStyle(map, basemapId, overlayIds) {
  useEffect(() => {
    if (!map) return;

    const basemap = findMapLayer(basemapId) ?? findMapLayer(DEFAULT_BASEMAP_ID);
    const overlays = overlayIds.map(findMapLayer).filter(Boolean);
    loadMapStyle(map, basemap, overlays);
  }, [map, basemapId, overlayIds]);
}

function loadMapStyle(map, basemap, overlays) {
  const isFirstStyle = !map.getSource(TERRAIN_SOURCE_ID);
  const terrainEnabled = isFirstStyle || map.getTerrain() !== null;

  const addTerrainAndOverlays = (style) => ({
    ...style,
    sources: {
      ...style.sources,
      [TERRAIN_SOURCE_ID]: TERRAIN_TILES,
      [HILLSHADE_SOURCE_ID]: TERRAIN_TILES,
      ...Object.fromEntries(overlays.map((overlay) => [overlay.id, overlay.source])),
    },
    layers: [...insertBelowLabels(style.layers, HILLSHADE_LAYER), ...overlays.map(toStyleLayer)],
    ...(terrainEnabled && { terrain: { source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION } }),
    sky: SKY,
  });

  if (basemap.styleUrl) {
    map.setStyle(basemap.styleUrl, { transformStyle: (_previousStyle, nextStyle) => addTerrainAndOverlays(nextStyle) });
  } else {
    const rasterStyle = { version: 8, sources: { [basemap.id]: basemap.source }, layers: [toStyleLayer(basemap)] };
    map.setStyle(addTerrainAndOverlays(rasterStyle));
  }
}

function toStyleLayer(mapLayer) {
  return { id: mapLayer.id, source: mapLayer.id, type: 'raster', ...mapLayer.layer };
}

function insertBelowLabels(layers, newLayer) {
  const firstLabelIndex = layers.findIndex((layer) => layer.type === 'symbol');
  if (firstLabelIndex === -1) return [...layers, newLayer];
  return [...layers.slice(0, firstLabelIndex), newLayer, ...layers.slice(firstLabelIndex)];
}
