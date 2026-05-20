// Distance + geocoding helpers.
// Geocoding hits OpenStreetMap's free Nominatim API (no key needed).
// Per their TOS we set a descriptive User-Agent and only request on demand.

const NOMINATIM_USER_AGENT = "ThePack-Platform/1.0 (k9 community app)";

const EARTH_RADIUS_MILES = 3958.7613;

// Great-circle distance in miles between two lat/lng points.
export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Geocode a freeform location string. Server-side only.
// Returns { lat, lng } or null when the location can't be resolved.
export async function geocode(
  query: string
): Promise<{ lat: number; lng: number } | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const url =
    "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
    encodeURIComponent(trimmed);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT },
      // Cache identical lookups for a day to be polite to OSM and fast for users.
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return null;
    const data: Array<{ lat: string; lon: string }> = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (!isFinite(lat) || !isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
