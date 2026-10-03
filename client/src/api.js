async function request(method, url, body) {
  const isJson = body !== undefined && !(body instanceof FormData);

  const response = await fetch(url, {
    method,
    headers: isJson ? { 'Content-Type': 'application/json' } : undefined,
    body: isJson ? JSON.stringify(body) : body,
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? `Serveren svarte ${response.status}`);
  return data;
}

export const api = {
  getCurrentUser: () => request('GET', '/api/auth/me'),
  login: (credentials) => request('POST', '/api/auth/login', credentials),
  register: (credentials) => request('POST', '/api/auth/register', credentials),
  logout: () => request('POST', '/api/auth/logout'),

  getPlaces: () => request('GET', '/api/places'),
  createPlace: (formData) => request('POST', '/api/places', formData),
  updatePlace: (id, formData) => request('PUT', `/api/places/${id}`, formData),
  deletePlace: (id) => request('DELETE', `/api/places/${id}`),
};
