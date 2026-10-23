import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import ExposureBadge from "../components/ExposureBadge";
import { LONDON_CENTRE } from "../components/RouteMap";
import { legIcon, legLabel, lineColour } from "../utils/exposure";
import { distanceMeters, legPaths } from "../utils/geo";
import { formatDistanceKm, formatDuration, formatPerKm } from "../utils/format";

const JOURNEY_KEY = "safeway_active_journey";
// close enough to the end of a leg to move on to the next one
const ARRIVAL_RADIUS_METERS = 35;

function loadJourney(state) {
    if (state?.journey) {
        try {
            sessionStorage.setItem(JOURNEY_KEY, JSON.stringify(state.journey));
        } catch {
            // storage blocked, a reload just goes back to the planner
        }
        return state.journey;
    }
    try {
        return JSON.parse(sessionStorage.getItem(JOURNEY_KEY));
    } catch {
        return null;
    }
}

// minutes between two "HH:mm" times (works past midnight)
function minutesBetween(from, to) {
    if (!from || !to) return null;
    const [h1, m1] = from.split(":").map(Number);
    const [h2, m2] = to.split(":").map(Number);
    const diff = h2 * 60 + m2 - (h1 * 60 + m1);
    return diff < 0 ? diff + 24 * 60 : diff;
}

// title for the instruction card, uses TfL's own text when there is one
function instructionTitle(leg) {
    if (leg.summary) return leg.summary;
    if (leg.isWalking) return `Walk${leg.arrivalPoint ? ` to ${leg.arrivalPoint}` : ""}`;
    return `${legLabel(leg)}${leg.arrivalPoint ? ` to ${leg.arrivalPoint}` : ""}`;
}

// moves the map to the current leg, or follows the user
function MapCamera({ points, position, following }) {
    const map = useMap();
    useEffect(() => {
        if (!following && points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 17 });
    }, [map, points, following]);
    useEffect(() => {
        if (following && position) map.setView(position, Math.max(map.getZoom(), 17));
    }, [map, position, following]);
    return null;
}

export default function NavigationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [journey] = useState(() => loadJourney(location.state));
    const [index, setIndex] = useState(0);
    const [arrived, setArrived] = useState(false);
    const [position, setPosition] = useState(null);
    const [following, setFollowing] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [autoAdvanced, setAutoAdvanced] = useState(false);

    const legs = journey?.legs || [];
    const paths = useMemo(() => legPaths(legs), [journey]);
    const leg = legs[index];
    const nextLeg = legs[index + 1];
    const isLast = index === legs.length - 1;
    // TfL times include the waits between legs, the leg durations don't
    const remainingMinutes =
        minutesBetween(leg?.departureTime, journey?.arrivalTime) ??
        legs.slice(index).reduce((sum, l) => sum + (l.duration || 0), 0);

    // live location for the whole time the screen is open
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Location is not available in this browser.");
            return;
        }
        const id = navigator.geolocation.watchPosition(
            (pos) => {
                setLocationError(null);
                setPosition([pos.coords.latitude, pos.coords.longitude]);
            },
            () => setLocationError("Location is off. Use Next step to move through the journey."),
            { enableHighAccuracy: true }
        );
        return () => navigator.geolocation.clearWatch(id);
    }, []);

    // when the user reaches the end of the current leg, go to the next one
    useEffect(() => {
        if (!position || arrived) return;
        const end = paths[index]?.[paths[index].length - 1];
        if (end && distanceMeters(position, end) <= ARRIVAL_RADIUS_METERS) {
            if (isLast) setArrived(true);
            else {
                setIndex((i) => i + 1);
                setAutoAdvanced(true);
            }
        }
    }, [position]);

    // arrow keys move between steps (handy on a laptop)
    useEffect(() => {
        function onKey(e) {
            if (e.key === "ArrowRight") next();
            if (e.key === "ArrowLeft") previous();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    });

    if (!journey) return <Navigate to="/" replace />;

    function next() {
        setAutoAdvanced(false);
        if (isLast) setArrived(true);
        else setIndex((i) => i + 1);
    }

    function previous() {
        setAutoAdvanced(false);
        setArrived(false);
        setIndex((i) => Math.max(0, i - 1));
    }

    function end() {
        navigate("/");
    }

    const currentPoints = paths[index] || [];

    return (
        <div className="nav-screen">
            <MapContainer center={LONDON_CENTRE} zoom={15} className="nav-map" zoomControl={false}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapCamera points={currentPoints} position={position} following={following} />

                {legs.map((l, i) => {
                    const points = paths[i];
                    if (points.length < 2) return null;
                    const isPast = i < index || arrived;
                    const isCurrent = i === index && !arrived;
                    return (
                        <Polyline
                            key={i}
                            positions={points}
                            pathOptions={{
                                color: isPast ? "#9aa5b1" : lineColour(l),
                                weight: isCurrent ? 8 : 5,
                                opacity: isPast ? 0.6 : isCurrent ? 1 : 0.55,
                                dashArray: l.isWalking ? "4 10" : null,
                            }}
                        />
                    );
                })}

                {currentPoints.length > 0 && !arrived && (
                    <CircleMarker
                        center={currentPoints[currentPoints.length - 1]}
                        radius={9}
                        pathOptions={{ color: "#fff", weight: 3, fillColor: "#1F2933", fillOpacity: 1 }}
                    >
                        <Tooltip permanent direction="top" offset={[0, -8]}>
                            {leg.arrivalPoint || (isLast ? "Destination" : "Next stop")}
                        </Tooltip>
                    </CircleMarker>
                )}

                {position && (
                    <CircleMarker center={position} radius={9} pathOptions={{ color: "#fff", weight: 3, fillColor: "#1A73E8", fillOpacity: 1 }}>
                        <Tooltip>You are here</Tooltip>
                    </CircleMarker>
                )}
            </MapContainer>

            {arrived ? (
                <div className="nav-card nav-top arrived">
                    <div className="nav-icon" aria-hidden="true">🏁</div>
                    <h1>You have arrived</h1>
                    <p className="muted">
                        {legs[legs.length - 1]?.arrivalPoint || "Destination"} · {formatDuration(journey.duration)} journey ·{" "}
                        {formatDistanceKm(journey.totalWalkingKm)} walked
                    </p>
                    <div className="nav-actions">
                        <button className="button" onClick={previous}>Back to last step</button>
                        <Link className="button primary" to="/">Plan another journey</Link>
                    </div>
                </div>
            ) : (
                <div className="nav-card nav-top" aria-live="polite">
                    <div className="nav-step-head">
                        <span className="nav-icon" style={{ "--line": lineColour(leg) }} aria-hidden="true">
                            {legIcon(leg)}
                        </span>
                        <div>
                            <div className="muted small">
                                Step {index + 1} of {legs.length}
                                {leg.departureTime && ` · ${leg.departureTime} - ${leg.arrivalTime}`}
                                {` · ${leg.duration} min`}
                            </div>
                            <h1>{instructionTitle(leg)}</h1>
                            {leg.detailedInstruction && leg.detailedInstruction !== leg.summary && (
                                <div className="muted">{leg.detailedInstruction}</div>
                            )}
                        </div>
                    </div>

                    {autoAdvanced && <div className="nav-note">You reached the end of the last step.</div>}

                    {leg.isWalking && leg.crimeCount != null && (
                        <div className="nav-exposure">
                            <ExposureBadge level={leg.exposureLevel} />
                            <span className="muted small">
                                {leg.crimeCount} recorded crimes within 50 m · {formatPerKm(leg.exposurePerKm)}
                            </span>
                        </div>
                    )}

                    {leg.isWalking && leg.steps?.length > 0 && (
                        <ol className="nav-steps">
                            {leg.steps.map((step, i) => (
                                <li key={i}>
                                    <strong>{step.heading}</strong> {step.description}
                                </li>
                            ))}
                        </ol>
                    )}

                    {!leg.isWalking && leg.stops?.length > 0 && (
                        <details className="nav-stops">
                            <summary>
                                {leg.stops.length} stop{leg.stops.length === 1 ? "" : "s"}
                                {leg.arrivalPoint && `, get off at ${leg.arrivalPoint}`}
                            </summary>
                            <ol>
                                {leg.stops.map((stop, i) => (
                                    <li key={i}>{stop}</li>
                                ))}
                            </ol>
                        </details>
                    )}

                    {nextLeg && (
                        <div className="nav-then muted small">
                            Then: {legIcon(nextLeg)} {instructionTitle(nextLeg)}
                        </div>
                    )}
                </div>
            )}

            <div className="nav-card nav-bottom">
                <div className="nav-progress" aria-hidden="true">
                    {legs.map((l, i) => (
                        <span key={i} className={i < index || arrived ? "done" : i === index ? "current" : ""} />
                    ))}
                </div>
                <div className="nav-eta">
                    {!arrived && (
                        <>
                            <span>
                                <strong>{formatDuration(remainingMinutes)}</strong> left
                            </span>
                            {journey.arrivalTime && <span className="muted">Arrive {journey.arrivalTime}</span>}
                        </>
                    )}
                    <button
                        className={`button small${following ? " primary" : ""}`}
                        onClick={() => setFollowing((f) => !f)}
                        disabled={!position}
                        title={position ? "" : "Waiting for your location"}
                    >
                        {following ? "Following" : "Follow me"}
                    </button>
                </div>
                {locationError && <div className="muted small">{locationError}</div>}
                <div className="nav-actions">
                    <button className="button danger" onClick={end}>End</button>
                    <button className="button" onClick={previous} disabled={index === 0 && !arrived}>
                        ← Back
                    </button>
                    {!arrived && (
                        <button className={`button ${isLast ? "success" : "primary"} grow`} onClick={next}>
                            {isLast ? "✓ Arrive" : "Next step →"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
