import ExposureBadge from "./ExposureBadge";
import { legIcon, legLabel, lineColour } from "../utils/exposure";
import { formatDistanceKm, formatPerKm } from "../utils/format";

// step by step list of a journey, walking legs show their own exposure
export default function LegList({ journey }) {
    const breakdown = Object.entries(journey.crimeBreakdown || {}).sort((a, b) => b[1] - a[1]);

    return (
        <div className="leg-list">
            <h3>Journey steps</h3>
            <ol>
                {journey.legs.map((leg, i) => (
                    <li key={i} style={{ "--line": lineColour(leg) }}>
                        <div className="leg-head">
                            <span aria-hidden="true">{legIcon(leg)}</span>
                            <strong>{legLabel(leg)}</strong>
                            {!leg.isWalking && <span className="muted">{leg.duration} min</span>}
                        </div>
                        {leg.isWalking && leg.crimeCount != null && (
                            <div className="leg-exposure">
                                <ExposureBadge level={leg.exposureLevel} />
                                <span className="muted">
                                    {formatDistanceKm(leg.walkingKm)} · {leg.crimeCount} recorded crimes within 50 m ·{" "}
                                    {formatPerKm(leg.exposurePerKm)}
                                </span>
                            </div>
                        )}
                    </li>
                ))}
            </ol>

            {breakdown.length > 0 && (
                <>
                    <h3>Recorded crime near the walking sections</h3>
                    <table className="breakdown">
                        <tbody>
                            {breakdown.map(([category, count]) => (
                                <tr key={category}>
                                    <th scope="row">{category}</th>
                                    <td>{count}</td>
                                </tr>
                            ))}
                            <tr className="total">
                                <th scope="row">Total (each crime counted once)</th>
                                <td>{journey.totalCrimeExposure}</td>
                            </tr>
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
}
