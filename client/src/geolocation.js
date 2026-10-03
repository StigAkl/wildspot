export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Nettleseren din støtter ikke posisjon'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
          elevation: coords.altitude === null ? null : Math.round(coords.altitude),
        }),
      (error) => reject(new Error(`Fikk ikke posisjon: ${error.message}`)),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 10_000 },
    );
  });
}
