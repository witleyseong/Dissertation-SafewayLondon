// the backend sends [lng, lat] (GeoJSON order), Leaflet wants [lat, lng]
export function toLatLng(lineString = []) {
    return lineString.map(([lng, lat]) => [lat, lng]);
}

// points to draw for each leg. Some short transfer walks come without a line,
// so join the end of the previous leg to the start of the next one
export function legPaths(legs) {
    const paths = legs.map((leg) => toLatLng(leg.lineString));
    return paths.map((points, i) => {
        if (points.length >= 2) return points;
        const prev = paths.slice(0, i).reverse().find((p) => p.length > 0);
        const next = paths.slice(i + 1).find((p) => p.length > 0);
        const start = prev?.[prev.length - 1];
        const end = next?.[0];
        return start && end ? [start, end] : [];
    });
}

// metres between two [lat, lng] points
export function distanceMeters([lat1, lng1], [lat2, lng2]) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
