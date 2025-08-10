const STORAGE_KEY = 'savedPins';

export function notifySavedPinsChanged() {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('savedPinsChanged'));
    }
  } catch {}
}

export function getSavedPins() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) return list;
    return [];
  } catch {
    return [];
  }
}

export function isPinSaved(pinId) {
  const idStr = (pinId || '').toString();
  return getSavedPins().some((p) => (p.id || '').toString() === idStr);
}

export function savePin(pin) {
  if (!pin || !pin.id) return;
  const idStr = (pin.id || '').toString();
  const current = getSavedPins();
  if (current.some((p) => (p.id || '').toString() === idStr)) return;
  const next = [{ ...pin }, ...current].slice(0, 500);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifySavedPinsChanged();
}

export function unsavePin(pinId) {
  const idStr = (pinId || '').toString();
  const next = getSavedPins().filter((p) => (p.id || '').toString() !== idStr);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  notifySavedPinsChanged();
}


