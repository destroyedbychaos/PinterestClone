

const STORAGE_KEY_PREFIX = 'savedPins_';

/**
 * 
 * @param {string} userId 
 * @returns {string} 
 */
function getStorageKey(userId) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/**
 *
 * @param {string} token 
 * @returns {string|null} 
 */
function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return (
      payload?.sub ||
      payload?.id ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    );
  } catch {
    return null;
  }
}

/**
 * 
 * @returns {string|null} 
 */
function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return getUserIdFromToken(token);
}

export function notifySavedPinsChanged() {
  try {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new Event('savedPinsChanged'));
    }
  } catch {}
}

export function getSavedPins(userId = null) {
  try {
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) return [];
    
    const storageKey = getStorageKey(currentUserId);
    const raw = localStorage.getItem(storageKey);
    const list = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) return list;
    return [];
  } catch {
    return [];
  }
}

export function isPinSaved(pinId, userId = null) {
  const idStr = (pinId || '').toString();
  return getSavedPins(userId).some((p) => (p.id || '').toString() === idStr);
}

export function savePin(pin, userId = null) {
  if (!pin || !pin.id) return;
  
  const currentUserId = userId || getCurrentUserId();
  if (!currentUserId) return;
  
  const idStr = (pin.id || '').toString();
  const current = getSavedPins(currentUserId);
  if (current.some((p) => (p.id || '').toString() === idStr)) return;
  
  const next = [{ ...pin }, ...current].slice(0, 500);
  const storageKey = getStorageKey(currentUserId);
  localStorage.setItem(storageKey, JSON.stringify(next));
  notifySavedPinsChanged();
}

export function unsavePin(pinId, userId = null) {
  const currentUserId = userId || getCurrentUserId();
  if (!currentUserId) return;
  
  const idStr = (pinId || '').toString();
  const next = getSavedPins(currentUserId).filter((p) => (p.id || '').toString() !== idStr);
  const storageKey = getStorageKey(currentUserId);
  localStorage.setItem(storageKey, JSON.stringify(next));
  notifySavedPinsChanged();
}

/**
 * 
 * @param {string} userId
 */
export function clearSavedPins(userId = null) {
  const currentUserId = userId || getCurrentUserId();
  if (!currentUserId) return;
  
  const storageKey = getStorageKey(currentUserId);
  localStorage.removeItem(storageKey);
  notifySavedPinsChanged();
}

/**
 *
 * @param {string} userId
 */
export function testSavedPinsSystem(userId = null) {
  const testUserId = userId || getCurrentUserId();
  if (!testUserId) {
    console.log('No user ID available for testing');
    return;
  }
  
  console.log('Testing saved pins system for user:', testUserId);
  
  const testPin = {
    id: 'test-pin-1',
    image: '/test-image.jpg',
    title: 'Test Pin',
    description: 'This is a test pin',
    author: 'Test Author',
    tags: ['test', 'demo']
  };
  
  savePin(testPin, testUserId);
  console.log('Saved test pin:', testPin.id);
  
  const isSaved = isPinSaved(testPin.id, testUserId);
  console.log('Is pin saved:', isSaved);
  

  const savedPins = getSavedPins(testUserId);
  console.log('All saved pins:', savedPins);
  
  unsavePin(testPin.id, testUserId);
  console.log('Removed test pin');
  

  const isStillSaved = isPinSaved(testPin.id, testUserId);
  console.log('Is pin still saved:', isStillSaved);
  
  console.log('Test completed successfully');
}


