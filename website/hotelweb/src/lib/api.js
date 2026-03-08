import apiConfig from '../config/apiConfig';

const { apiKey, apiUrl } = apiConfig;

export async function apiPost(endpoint, body) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

export async function apiFetch(endpoint) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPut(endpoint, body) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}
export async function apiPatch(endpoint, body = {}) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

export async function apiDelete(endpoint) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}
