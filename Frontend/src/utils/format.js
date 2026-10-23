export function formatDuration(minutes) {
    if (minutes == null) return "-";
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatDistanceKm(km) {
    if (km == null) return "-";
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(2)} km`;
}

export function formatFare(pounds) {
    return pounds == null ? null : `£${pounds.toFixed(2)}`;
}

export function formatPerKm(value) {
    return value == null ? "Unavailable" : `${value.toFixed(1)} crimes/km`;
}

export function formatDateTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
