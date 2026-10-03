export const PLACE_KINDS = {
  visited: { label: 'Besøkt sted', icon: '📍' },
  tent_spot: { label: 'Mulig teltplass', icon: '⛺' },
};

export function describePlace(place) {
  return [
    place.elevation !== null && `${place.elevation} moh.`,
    place.visited_on && formatDate(place.visited_on),
    place.rating && '★'.repeat(place.rating),
    place.photos.length > 0 && `${place.photos.length} 📷`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export function formatCoordinates({ lat, lng }) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
