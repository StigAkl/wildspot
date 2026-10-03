import { describePlace, PLACE_KINDS } from '../places/places.js';

const FILTERS = [
  { value: 'all', label: 'Alle' },
  { value: 'visited', label: '📍 Besøkt' },
  { value: 'tent_spot', label: '⛺ Teltplasser' },
];

export default function Sidebar({
  isOpen,
  places,
  filter,
  onFilterChange,
  onAddPlace,
  onAddTentSpotHere,
  onSelectPlace,
}) {
  const visiblePlaces = filter === 'all' ? places : places.filter((place) => place.kind === filter);
  const tentSpotCount = places.filter((place) => place.kind === 'tent_spot').length;

  return (
    <aside className={isOpen ? 'sidebar is-open' : 'sidebar'}>
      <div className="sidebar__actions">
        <button type="button" className="btn btn--primary" onClick={onAddPlace}>
          ＋ Nytt sted
        </button>
        <button
          type="button"
          className="btn"
          title="Lagre en mulig teltplass der du står nå"
          onClick={onAddTentSpotHere}
        >
          ⛺ Teltplass her
        </button>
      </div>

      <div className="filters">
        {FILTERS.map(({ value, label }) => (
          <button
            type="button"
            key={value}
            className={value === filter ? 'chip is-active' : 'chip'}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="place-count muted small">
        {places.length} steder · {tentSpotCount} mulige teltplasser
      </p>

      {visiblePlaces.length === 0 ? (
        <p className="empty">
          Ingen steder her ennå. Trykk «Nytt sted» og klikk i kartet, eller «Teltplass her» når du er ute på tur.
        </p>
      ) : (
        <ul className="place-list">
          {visiblePlaces.map((place) => (
            <li key={place.id}>
              <button type="button" className="place-item" onClick={() => onSelectPlace(place)}>
                <span className="place-item__icon">{PLACE_KINDS[place.kind].icon}</span>
                <span className="place-item__text">
                  <strong>{place.title}</strong>
                  <small>{describePlace(place)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
