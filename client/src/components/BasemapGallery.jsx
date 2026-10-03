import { useEffect, useRef, useState } from 'react';
import { basemaps, FEATURED_BASEMAP_IDS, findMapLayer, groupByCategory } from '../map/mapLayers.js';

const featuredBasemaps = FEATURED_BASEMAP_IDS.map(findMapLayer);
const basemapGroups = [{ name: '⭐ Utvalgte', layers: featuredBasemaps }, ...groupByCategory(basemaps)];

export default function BasemapGallery({ selectedId, onSelect, onClose }) {
  const dialogRef = useRef(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
  }, []);

  const query = search.trim().toLowerCase();
  const visibleGroups = query
    ? [{ name: 'Treff', layers: basemaps.filter((basemap) => matchesSearch(basemap, query)) }]
    : basemapGroups;

  return (
    <dialog ref={dialogRef} className="gallery" onClose={onClose}>
      <header className="gallery__header">
        <h2>Bakgrunnskart</h2>
        <input
          type="search"
          placeholder="Søk: satellitt, topo, mørk …"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          autoFocus
        />
        <button type="button" className="icon-btn" aria-label="Lukk" onClick={() => dialogRef.current.close()}>
          ✕
        </button>
      </header>

      <div className="gallery__body">
        {visibleGroups.map((group) => (
          <section key={group.name} className="gallery__section">
            <h3>{group.name}</h3>
            <div className="gallery__grid">
              {group.layers.map((basemap) => (
                <BasemapCard
                  key={basemap.id}
                  basemap={basemap}
                  isSelected={basemap.id === selectedId}
                  onClick={() => onSelect(basemap.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </dialog>
  );
}

function BasemapCard({ basemap, isSelected, onClick }) {
  const [hasThumbnail, setHasThumbnail] = useState(true);

  return (
    <button
      type="button"
      className={isSelected ? 'map-card is-active' : 'map-card'}
      title={basemap.description}
      onClick={onClick}
    >
      <span className="map-card__thumb">
        {hasThumbnail ? (
          <img src={`/thumbs/${basemap.id}.jpg`} alt="" loading="lazy" onError={() => setHasThumbnail(false)} />
        ) : (
          <span className="map-card__placeholder">🗺️</span>
        )}
      </span>
      <span className="map-card__name">{basemap.name}</span>
      <span className="map-card__provider">{basemap.provider}</span>
    </button>
  );
}

function matchesSearch(basemap, query) {
  return [basemap.name, basemap.provider, basemap.category, basemap.description]
    .join(' ')
    .toLowerCase()
    .includes(query);
}
