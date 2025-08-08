const API_BASE = '/api';

export async function ensureProfileBoard(token) {

  const headers = token ? { Authorization: `Bearer ${token}` } : {};


  const userId = getUserIdFromToken(token);
  if (!userId) throw new Error('Invalid user token');

  const listRes = await fetch(`${API_BASE}/Boards/user/${userId}`);
  if (!listRes.ok) throw new Error('Failed to load boards');
  const list = await listRes.json();
  const boards = list?.Boards || list?.boards || [];
  const profile = boards.find(b => (b.Name || b.name) === 'Profile');
  if (profile) return profile.Id || profile.id;

  const createRes = await fetch(`${API_BASE}/Boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ Name: 'Profile', Description: 'Saved pins', IsPrivate: false })
  });
  if (!createRes.ok) throw new Error('Failed to create default board');
  const created = await createRes.json();
  return created.Id || created.id;
}

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.sub || payload?.id || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch {
    return null;
  }
}

