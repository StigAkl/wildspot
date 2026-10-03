import mapLayers from './mapLayers.json';

export const DEFAULT_BASEMAP_ID = 'kartverket-topo';

export const FEATURED_BASEMAP_IDS = [
  'kartverket-topo',
  'opentopomap',
  'maptoolkit-summer',
  'eox-s2cloudless-2025',
  'google-satellite',
  'esri-world-imagery',
  'stadia-stamen-watercolor',
  'stadia-stamen-terrain',
  'eox-terrain',
  'esri-natgeo-world-map',
  'openfreemap-liberty',
  'openfreemap-fiord',
  'stadia-stamen-toner',
  'nasa-gibs-viirs-earth-at-night',
];

const CATEGORY_NAMES = {
  '3D': '3D',
  Topographic: 'Topografiske',
  Outdoor: 'Friluft',
  Terrain: 'Terreng',
  Imagery: 'Flyfoto og satellitt',
  Street: 'Gatekart',
  Light: 'Lyse',
  Dark: 'Mørke',
  Vector: 'Vektor',
  Artistic: 'Kunstneriske',
  Marine: 'Hav',
  Nautical: 'Sjøkart',
  Cycling: 'Sykkel',
  Transport: 'Jernbane',
  Labels: 'Stedsnavn',
  Regional: 'Regionale',
};

export const basemaps = mapLayers.filter((mapLayer) => mapLayer.role === 'base');
export const overlays = mapLayers.filter((mapLayer) => mapLayer.role === 'overlay');

export function findMapLayer(id) {
  return mapLayers.find((mapLayer) => mapLayer.id === id);
}

export function groupByCategory(layers) {
  return Object.entries(CATEGORY_NAMES)
    .map(([category, name]) => ({ name, layers: layers.filter((mapLayer) => mapLayer.category === category) }))
    .filter((group) => group.layers.length > 0);
}
