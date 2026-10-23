import RouteOverview from "./RouteOverview";
import { bandFor } from "../utils/exposure";
import { formatDistanceKm, formatDuration, formatFare, formatPerKm } from "../utils/format";

// how this route compares with the lowest exposure option of the same search
function comparisonText(journey, lowestPerKm) {
    if (journey.exposurePerKm == null) return "No walking to measure";
    if (lowestPerKm == null || journey.exposurePerKm <= lowestPerKm) return "Lowest of these options";
    if (lowestPerKm === 0) return "More than the lowest option";
    const pct = ((journey.exposurePerKm - lowestPerKm) / lowestPerKm) * 100;
    return `${pct.toFixed(0)}% more than the lowest option`;
}

export default function JourneyCard({ journey, badges, lowestPerKm, selected, onSelect, onStart }) {
    const walkingSegments = journey.legs.filter((leg) => leg.isWalking).length;
    const fare = formatFare(journey.fare);
    const band = bandFor(journey.exposureLevel);

    return (
        <div className={`journey-card${selected ? " selected" : ""}`}>
            <button className="card-select" onClick={onSelect} aria-pressed={selected}>
                <div className="card-top">
                    <div className="badges">
                        {badges.map((badge) => (
                            <span key={badge} className={`badge badge-${badge.toLowerCase().replace(" ", "-")}`}>
                                {badge}
                            </span>
                        ))}
                    </div>
                    {fare && <span className="muted">{fare}</span>}
                </div>

                <div className="card-time">
                    <strong>{formatDuration(journey.duration)}</strong>
                    <span className="muted">
                        {journey.departureTime} - {journey.arrivalTime}
                    </span>
                </div>

                <RouteOverview legs={journey.legs} />

                <dl className="metrics">
                    <div>
                        <dt>Walking</dt>
                        <dd>{formatDistanceKm(journey.totalWalkingKm)}</dd>
                        <dd className="metric-note">{walkingSegments} segment{walkingSegments === 1 ? "" : "s"}</dd>
                    </div>
                    <div>
                        <dt>Historical exposure</dt>
                        <dd>{formatPerKm(journey.exposurePerKm)}</dd>
                        <dd className="metric-note">{comparisonText(journey, lowestPerKm)}</dd>
                    </div>
                    <div>
                        <dt>London-wide band</dt>
                        <dd>
                            {band ? (
                                <span className="band-text" style={{ "--band": band.color }}>
                                    <span className="dot" aria-hidden="true" />
                                    {band.label.replace(" exposure", "")}
                                </span>
                            ) : (
                                "-"
                            )}
                        </dd>
                        <dd className="metric-note">vs. other London journeys</dd>
                    </div>
                </dl>

                <div className="card-bottom muted">
                    <span>{journey.numChanges > 0 ? `${journey.numChanges} change${journey.numChanges === 1 ? "" : "s"}` : "Direct"}</span>
                    <span>{selected ? "Shown on the map" : "Show on map"}</span>
                </div>
            </button>
            {selected && (
                <button className="button primary block start-button" onClick={onStart}>
                    ▶ Start journey
                </button>
            )}
        </div>
    );
}
