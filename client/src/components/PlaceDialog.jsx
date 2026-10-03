import { useEffect, useRef, useState } from 'react';
import { formatCoordinates, PLACE_KINDS, today } from '../places/places.js';

export default function PlaceDialog({ place, onLocate, onSave, onClose }) {
  const dialogRef = useRef(null);
  const [position, setPosition] = useState({ lat: place.lat, lng: place.lng, elevation: place.elevation });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isNew = !place.id;

  useEffect(() => {
    if (!dialogRef.current.open) dialogRef.current.showModal();
  }, []);

  async function handleUseMyPosition() {
    try {
      setPosition(await onLocate());
    } catch (locateError) {
      setError(locateError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      await onSave(place.id, new FormData(event.currentTarget));
    } catch (saveError) {
      setError(saveError.message);
      setIsSaving(false);
    }
  }

  return (
    <dialog ref={dialogRef} onClose={onClose}>
      <form className="place-form" onSubmit={handleSubmit}>
        <h2>{isNew ? 'Nytt sted' : 'Rediger sted'}</h2>

        <fieldset className="kind-picker">
          {Object.entries(PLACE_KINDS).map(([kind, { label, icon }]) => (
            <label key={kind}>
              <input type="radio" name="kind" value={kind} defaultChecked={place.kind === kind} /> {icon} {label}
            </label>
          ))}
        </fieldset>

        <label>
          Navn
          <input
            name="title"
            defaultValue={place.title}
            required
            maxLength={120}
            placeholder="F.eks. Gjende, nordsiden"
          />
        </label>
        <label>
          Beskrivelse
          <textarea
            name="description"
            rows={4}
            defaultValue={place.description}
            placeholder="Underlag, vann i nærheten, le for vind, utsikt …"
          />
        </label>

        <div className="row">
          <label>
            Vurdering
            <select name="rating" defaultValue={place.rating ?? ''}>
              <option value="">–</option>
              {[5, 4, 3, 2, 1].map((stars) => (
                <option key={stars} value={stars}>
                  {'★'.repeat(stars)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Dato
            <input type="date" name="visited_on" defaultValue={isNew ? today() : (place.visited_on ?? '')} />
          </label>
        </div>

        <label>
          {isNew ? 'Bilder' : 'Legg til bilder'}
          <input type="file" name="photos" accept="image/*" multiple />
        </label>

        <div className="position">
          <span className="muted small">
            {formatCoordinates(position)}
            {position.elevation !== null && ` · ${position.elevation} moh.`}
          </span>
          <button type="button" className="btn btn--ghost btn--small" onClick={handleUseMyPosition}>
            Bruk min posisjon
          </button>
        </div>
        <input type="hidden" name="lat" value={position.lat} />
        <input type="hidden" name="lng" value={position.lng} />
        <input type="hidden" name="elevation" value={position.elevation ?? ''} />

        <p className="error" role="alert">
          {error}
        </p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current.close()}>
            Avbryt
          </button>
          <button type="submit" className="btn btn--primary" disabled={isSaving}>
            Lagre
          </button>
        </div>
      </form>
    </dialog>
  );
}
