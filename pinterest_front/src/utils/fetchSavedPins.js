const API_BASE = '/api';
import { getSavedPins as getLocalSavedPins } from './savedPinsStorage';

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

function normalizePins(rawPins, fallbackAuthor) {
  return rawPins.map((p) => {
    let image = p.ImageUrl || p.imageUrl || p.image;
    if (image && !/^https?:\/\//.test(image)) {
      if (!image.startsWith('/')) image = '/images/' + image.replace(/^.*[\\\/]/, '');
    }
    const rawTags = p.Tags ?? p.tags ?? '';
    const tags = Array.isArray(rawTags)
      ? rawTags.map((t) => String(t).trim()).filter(Boolean)
      : String(rawTags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
    return {
      id: p.Id || p.id,
      image,
      title: p.Title || p.title,
      description: p.Description || p.description,
      author: p.UserName || p.userName || fallbackAuthor,
      tags,
    };
  });
}

export async function fetchSavedPins(token, fallbackAuthor) {

  const rawPins = getLocalSavedPins();
  return normalizePins(rawPins, fallbackAuthor);
}


