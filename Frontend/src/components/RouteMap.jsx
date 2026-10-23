import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import { bandFor, legLabel, lineColour } from "../utils/exposure";
import { legPaths } from "../utils/geo";

export const LONDON_CENTRE = [51.5074, -0.1278];

// zooms the map to the selected journey every time it changes
function FitToJourney({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points.length > 1) map.fitBounds(points, { padding: [30, 30] });
    }, [map, points]);
    return null;
}

// follows the user when "Show my location" is on
function UserLocation({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.panTo(position);
    }, [map, position]);
    if (!position) return null;
    return (
        <CircleMarker center={position} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1A73E8", fillOpacity: 1 }}>
            <Tooltip>You are here</Tooltip>
        </CircleMarker>
    );
}

export default function RouteMap({ journey, onStart }) {
    const [following, setFollowing] = useState(false);
    const [position, setPosition] = useState(null);
    const [locationError, setLocationError] = useState(null);

    useEffect(() => {
        if (!following) {
            setPosition(null);
            return;
        }
        if (!navigator.geolocation) {
            setLocationError("Location is not supported by this browser.");
            setFollowing(false);
            return;
        }
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setLocationError(null);
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            () => {
                setLocationError("Could not get your location. Check the browser permission.");
                setFollowing(false);
            },
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, [following]);

    const paths = legPaths(journey?.legs || []);
    const legs = (journey?.legs || []).map((leg, i) => ({ ...leg, points: paths[i] }));
    const allPoints = legs.flatMap((leg) => leg.points);
    const start = allPoints[0];
    const end = allPoints[allPoints.length - 1];

    return (
        <div className="route-map">
            <MapContainer center={LONDON_CENTRE} zoom={12} scrollWheelZoom className="map">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {!following && <FitToJourney points={allPoints} />}

                {legs.map((leg, i) =>
                    leg.points.length > 1 ? (
                        <Polyline
                            key={`${journey.id}-${i}`}
                            positions={leg.points}
                            pathOptions={{
                                color: lineColour(leg),
                                weight: leg.isWalking ? (leg.exposureLevel === "higher" ? 6 : 5) : 6,
                                dashArray: leg.isWalking ? "4 8" : null,
                                opacity: 0.9,
                            }}
                        >
                            <Tooltip sticky>
                                {legLabel(leg)}
                                {leg.isWalking && leg.crimeCount != null && ` - ${leg.crimeCount} recorded crimes nearby`}
                            </Tooltip>
                        </Polyline>
                    ) : null
                )}

                {/* markers in the middle of walking legs that had crimes, coloured by band */}
                {legs
                    .filter((leg) => leg.isWalking && leg.midpoint && leg.exposureLevel !== "lower")
                    .map((leg, i) => (
                        <CircleMarker
                            key={`mid-${journey.id}-${i}`}
                            center={[leg.midpoint[1], leg.midpoint[0]]}
                            radius={7}
                            pathOptions={{ color: "#fff", weight: 2, fillColor: bandFor(leg.exposureLevel)?.color, fillOpacity: 1 }}
                        >
                            <Tooltip>{bandFor(leg.exposureLevel)?.label} on this walk</Tooltip>
                        </CircleMarker>
                    ))}

                {start && (
                    <CircleMarker center={start} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2E7D32", fillOpacity: 1 }}>
                        <Tooltip>Start</Tooltip>
                    </CircleMarker>
                )}
                {end && (
                    <CircleMarker center={end} radius={7} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1F2933", fillOpacity: 1 }}>
                        <Tooltip>Destination</Tooltip>
                    </CircleMarker>
                )}

                <UserLocation position={position} />
            </MapContainer>

            {journey && (
                <div className="map-controls">
                    {onStart && (
                        <button className="button primary" onClick={onStart}>
                            ▶ Start journey
                        </button>
                    )}
                    <button className={`button small${following ? " primary" : ""}`} onClick={() => setFollowing((f) => !f)}>
                        {following ? "Stop following me" : "Show my location"}
                    </button>
                    {locationError && <span className="error-text">{locationError}</span>}
                </div>
            )}

            <ul className="map-legend">
                <li><span className="swatch dashed" style={{ "--c": "#2E7D32" }} /> Lower</li>
                <li><span className="swatch dashed" style={{ "--c": "#B26A00" }} /> Moderate</li>
                <li><span className="swatch dashed" style={{ "--c": "#B3541E" }} /> Higher</li>
                <li><span className="swatch" style={{ "--c": "#DC241F" }} /> Bus</li>
                <li><span className="swatch" style={{ "--c": "#0098D4" }} /> Rail (line colour)</li>
            </ul>
        </div>
    );
}
