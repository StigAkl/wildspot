import { useEffect, useState } from 'react';
import { api } from '../api.js';

export function usePlaces() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    api.getPlaces().then(({ places }) => setPlaces(places));
  }, []);

  async function savePlace(id, formData) {
    const { place } = id ? await api.updatePlace(id, formData) : await api.createPlace(formData);
    setPlaces((current) => [place, ...current.filter((existing) => existing.id !== place.id)]);
    return place;
  }

  async function deletePlace(id) {
    await api.deletePlace(id);
    setPlaces((current) => current.filter((place) => place.id !== id));
  }

  return { places, savePlace, deletePlace };
}
