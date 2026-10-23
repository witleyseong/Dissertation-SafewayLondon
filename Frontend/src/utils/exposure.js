// exposure bands shown to the user
// the backend sends exposureLevel as "lower" | "moderate" | "higher"
// (never call these "safe" or "dangerous", it is past recorded crime only)

export const EXPOSURE_BANDS = {
    lower: { label: "Lower exposure", color: "#2E7D32" },
    moderate: { label: "Moderate exposure", color: "#B26A00" },
    higher: { label: "Higher exposure", color: "#B3541E" },
};

export function bandFor(exposureLevel) {
    return EXPOSURE_BANDS[exposureLevel] || null;
}

// official TfL colours, matched on the route name
const LINE_COLOURS = [
    ["bakerloo", "#B36305"],
    ["central", "#E32017"],
    ["circle", "#FFD300"],
    ["district", "#00782A"],
    ["hammersmith", "#F3A9BB"],
    ["jubilee", "#A0A5A9"],
    ["metropolitan", "#9B0056"],
    ["northern", "#000000"],
    ["piccadilly", "#003688"],
    ["victoria", "#0098D4"],
    ["waterloo", "#95CDBA"],
    ["elizabeth", "#7156A5"],
    ["dlr", "#00A4A7"],
    ["tram", "#84B817"],
];

const MODE_COLOURS = {
    bus: "#DC241F",
    overground: "#EE7C0E",
    "elizabeth-line": "#7156A5",
    dlr: "#00A4A7",
};

const DEFAULT_COLOUR = "#1D4E89";

export function lineColour(leg) {
    if (leg.isWalking) return bandFor(leg.exposureLevel)?.color || "#5F6B7A";
    if (MODE_COLOURS[leg.modeId]) return MODE_COLOURS[leg.modeId];
    const name = (leg.routeName || "").toLowerCase();
    const match = LINE_COLOURS.find(([key]) => name.includes(key));
    return match ? match[1] : DEFAULT_COLOUR;
}

// "Walk 5 min", "Bus 24", "Victoria line"
export function legLabel(leg) {
    if (leg.isWalking) return `Walk ${leg.duration ?? "?"} min`;
    if (leg.modeId === "bus" && leg.routeName) return `Bus ${leg.routeName}`;
    if (leg.modeId === "tube" && leg.routeName) return `${leg.routeName} line`;
    return leg.routeName || leg.mode;
}

export function legIcon(leg) {
    if (leg.isWalking) return "🚶";
    if (leg.modeId === "bus") return "🚌";
    if (leg.modeId === "tube" || leg.modeId === "dlr" || leg.modeId === "elizabeth-line" || leg.modeId === "overground") return "🚇";
    return "➜";
}

// how much lower (in %) the exposure per km of `other` is compared to `journey`
// null if it is not actually lower or can't be worked out
export function exposureReduction(journey, other) {
    const base = journey?.exposurePerKm;
    const value = other?.exposurePerKm;
    if (base == null || value == null || base <= 0) return null;
    const pct = ((base - value) / base) * 100;
    return pct > 0 ? pct : null;
}
