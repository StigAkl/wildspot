import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import PlaceDetails from '../components/PlaceDetails.jsx';
import PlaceDialog from '../components/PlaceDialog.jsx';
import Sidebar from '../components/Sidebar.jsx';
import TopBar from '../components/TopBar.jsx';
import { getCurrentPosition } from '../geolocation.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { usePlaces } from '../hooks/usePlaces.js';
import { useToast } from '../hooks/useToast.js';
import MapMarker from '../map/MapMarker.jsx';
import MapPopup from '../map/MapPopup.jsx';
import { DEFAULT_BASEMAP_ID, findMapLayer } from '../map/mapLayers.js';
import { useMapStyle } from '../map/mapStyle.js';
import { elevationAt, useMapLibre } from '../map/useMapLibre.js';
import { PLACE_KINDS } from '../places/places.js';

const BasemapGallery = lazy(() => import('../components/BasemapGallery.jsx'));

export default function MapPage({ user, onLogout }) {
  const mapContainerRef = useRef(null);
  const map = useMapLibre(mapContainerRef);

  const [basemapId, setBasemapId] = useLocalStorage('wildspot.basemap', DEFAULT_BASEMAP_ID);
  const [overlayIds, setOverlayIds] = useLocalStorage('wildspot.overlays', []);
  useMapStyle(map, basemapId, overlayIds);

  const { places, savePlace, deletePlace } = usePlaces();
  const [filter, setFilter] = useState('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [placeBeingEdited, setPlaceBeingEdited] = useState(null);
  const [isPickingPosition, setIsPickingPosition] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, showToast] = useToast();

  const visiblePlaces = filter === 'all' ? places : places.filter((place) => place.kind === filter);
  const selectedPlace = places.find((place) => place.id === selectedPlaceId);

  useEffect(() => {
    if (!map || !isPickingPosition) return;

    function handleMapClick({ lngLat }) {
      setIsPickingPosition(false);
      setPlaceBeingEdited({ kind: 'visited', lat: lngLat.lat, lng: lngLat.lng, elevation: elevationAt(map, lngLat) });
    }

    function handleEscape(event) {
      if (event.key === 'Escape') setIsPickingPosition(false);
    }

    map.on('click', handleMapClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      map.off('click', handleMapClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [map, isPickingPosition]);

  async function locate() {
    const position = await getCurrentPosition();
    return { ...position, elevation: position.elevation ?? elevationAt(map, position) };
  }

  function showPlace(place) {
    setSelectedPlaceId(place.id);
    setIsSidebarOpen(false);
    map.easeTo({ center: [place.lng, place.lat], zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }

  function startAddingPlace() {
    setIsPickingPosition(true);
    setIsSidebarOpen(false);
  }

  async function addTentSpotHere() {
    try {
      const position = await locate();
      setIsSidebarOpen(false);
      setPlaceBeingEdited({ kind: 'tent_spot', title: 'Mulig teltplass', ...position });
    } catch (error) {
      showToast(error.message);
    }
  }

  async function handleSave(id, formData) {
    const place = await savePlace(id, formData);
    setPlaceBeingEdited(null);
    showPlace(place);
    showToast(`${PLACE_KINDS[place.kind].icon} ${place.title} er lagret`);
  }

  async function handleDelete(place) {
    try {
      await deletePlace(place.id);
      setSelectedPlaceId(null);
      showToast(`${place.title} er slettet`);
    } catch (error) {
      showToast(error.message);
    }
  }

  async function handleLogout() {
    await api.logout();
    onLogout();
  }

  function selectBasemap(id) {
    setBasemapId(id);
    setIsGalleryOpen(false);
  }

  return (
    <div className="app">
      <TopBar
        user={user}
        basemapName={findMapLayer(basemapId)?.name ?? 'Kart'}
        overlayIds={overlayIds}
        onOverlayIdsChange={setOverlayIds}
        onOpenBasemaps={() => setIsGalleryOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        onLogout={handleLogout}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        places={places}
        filter={filter}
        onFilterChange={setFilter}
        onAddPlace={startAddingPlace}
        onAddTentSpotHere={addTentSpotHere}
        onSelectPlace={showPlace}
      />

      <main className={isPickingPosition ? 'map-wrap is-picking' : 'map-wrap'}>
        <div ref={mapContainerRef} className="map" />

        {isPickingPosition && (
          <div className="pick-hint">
            Klikk i kartet for å plassere stedet
            <button type="button" className="btn btn--ghost btn--small" onClick={() => setIsPickingPosition(false)}>
              Avbryt
            </button>
          </div>
        )}

        {map &&
          visiblePlaces.map((place) => (
            <MapMarker key={place.id} map={map} lng={place.lng} lat={place.lat}>
              <button
                type="button"
                className={`marker marker--${place.kind}`}
                title={place.title}
                onClick={() => showPlace(place)}
              >
                <span className="marker__pin">
                  <span>{PLACE_KINDS[place.kind].icon}</span>
                </span>
              </button>
            </MapMarker>
          ))}

        {map && selectedPlace && (
          <MapPopup map={map} lng={selectedPlace.lng} lat={selectedPlace.lat} onClose={() => setSelectedPlaceId(null)}>
            <PlaceDetails
              key={selectedPlace.id}
              place={selectedPlace}
              onEdit={() => setPlaceBeingEdited(selectedPlace)}
              onDelete={() => handleDelete(selectedPlace)}
            />
          </MapPopup>
        )}
      </main>

      {placeBeingEdited && (
        <PlaceDialog
          place={placeBeingEdited}
          onLocate={locate}
          onSave={handleSave}
          onClose={() => setPlaceBeingEdited(null)}
        />
      )}

      {isGalleryOpen && (
        <Suspense>
          <BasemapGallery selectedId={basemapId} onSelect={selectBasemap} onClose={() => setIsGalleryOpen(false)} />
        </Suspense>
      )}

      {toast && (
        <p className="toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}
