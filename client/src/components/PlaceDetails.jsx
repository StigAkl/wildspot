import { useState } from 'react';
import { describePlace, formatCoordinates, PLACE_KINDS } from '../places/places.js';

export default function PlaceDetails({ place, onEdit, onDelete }) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const kind = PLACE_KINDS[place.kind];

  return (
    <div className="place-popup">
      <span className={`badge badge--${place.kind}`}>
        {kind.icon} {kind.label}
      </span>
      <h3>{place.title}</h3>
      <p className="muted small">{describePlace(place)}</p>
      {place.description && <p className="place-popup__desc">{place.description}</p>}

      {place.photos.length > 0 && (
        <div className="photos">
          {place.photos.map((photo) => (
            <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">
              <img src={photo.url} alt="" loading="lazy" />
            </a>
          ))}
        </div>
      )}

      <p className="muted small">{formatCoordinates(place)}</p>

      <div className="place-popup__actions">
        <button type="button" className="btn btn--small" onClick={onEdit}>
          Rediger
        </button>
        {isConfirmingDelete ? (
          <button type="button" className="btn btn--small btn--danger" onClick={onDelete}>
            Ja, slett
          </button>
        ) : (
          <button type="button" className="btn btn--small btn--danger" onClick={() => setIsConfirmingDelete(true)}>
            Slett
          </button>
        )}
      </div>
    </div>
  );
}
