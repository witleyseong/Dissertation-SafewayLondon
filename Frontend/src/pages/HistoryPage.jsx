import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { formatDateTime, formatDistanceKm, formatDuration, formatPerKm } from "../utils/format";

const STATUS_TEXT = {
    complete: "Complete",
    pending: "Pending",
    ambiguous: "Location not confirmed",
    error: "Failed",
};

// past searches of the logged in user, saved by the backend
export default function HistoryPage() {
    const navigate = useNavigate();
    const [history, setHistory] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.history()
            .then((data) => setHistory(data.history))
            .catch((err) => setError(err.message));
    }, []);

    function searchAgain(entry) {
        navigate("/", { state: { repeat: { from: entry.originText, to: entry.destinationText } } });
    }

    return (
        <div className="page">
            <h1>Journey history</h1>
            <p className="muted">Your last 20 searches and the routes that were compared.</p>

            {error && <p className="error-text" role="alert">{error}</p>}
            {!history && !error && <p className="muted">Loading...</p>}
            {history && history.length === 0 && <p className="muted">No journeys yet. Plan one to see it here.</p>}

            {history?.map((entry) => (
                <article key={entry.journeyRequestId} className="card history-entry">
                    <header>
                        <div>
                            <h2>{entry.originText} → {entry.destinationText}</h2>
                            <span className="muted">
                                {formatDateTime(entry.requestedAt)} · {STATUS_TEXT[entry.status] || entry.status}
                            </span>
                        </div>
                        <button className="button small" onClick={() => searchAgain(entry)}>Search again</button>
                    </header>

                    {entry.routes.length > 0 && (
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Route</th>
                                        <th>Time</th>
                                        <th>Walking</th>
                                        <th>Crimes nearby</th>
                                        <th>Exposure</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entry.routes.map((route) => (
                                        <tr key={route.routeOptionId}>
                                            <td>
                                                {route.summary}
                                                {route.isFastest && <span className="badge badge-fastest">Fastest</span>}
                                                {route.isRecommended && <span className="badge badge-lowest-exposure">Lowest exposure</span>}
                                            </td>
                                            <td>{formatDuration(route.totalDurationSeconds)}</td>
                                            <td>{formatDistanceKm(route.totalWalkingDistanceM / 1000)}</td>
                                            <td>{route.crimeCount ?? "-"}</td>
                                            <td>{formatPerKm(route.exposurePerKm == null ? null : Number(route.exposurePerKm))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}
