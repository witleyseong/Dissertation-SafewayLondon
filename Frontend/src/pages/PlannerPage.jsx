import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import DisambiguationModal from "../components/DisambiguationModal";
import DisclaimerBar from "../components/DisclaimerBar";
import JourneyCard from "../components/JourneyCard";
import LegList from "../components/LegList";
import RouteMap from "../components/RouteMap";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { exposureReduction } from "../utils/exposure";

const CURRENT_LOCATION = "Current location";

const STORAGE_KEY = "safeway_planner";

// the backend marks every route that ties for fastest / lowest exposure
function badgesFor(journey, allSameExposure) {
    const badges = [];
    if (journey.isFastest) badges.push("Fastest");
    // no point saying "lowest" when every route has the same exposure
    if (journey.isLowestExposure && !allSameExposure) badges.push("Lowest exposure");
    return badges.length > 0 ? badges : ["Balanced"];
}

// keeps the results when the user goes to the navigation screen and comes back
function loadSaved() {
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("Location is not supported by this browser."));
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
            () => reject(new Error("Could not get your location. Allow location access or type a starting point.")),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

export default function PlannerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { searches, addSearch, clearAll } = useRecentSearches();

    const [saved] = useState(loadSaved);
    const [fromText, setFromText] = useState(saved.fromText || "");
    const [toText, setToText] = useState(saved.toText || "");
    const [journeys, setJourneys] = useState(saved.journeys || []);
    const [selectedId, setSelectedId] = useState(saved.selectedId || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [disambiguation, setDisambiguation] = useState(null);
    // the texts/coordinates actually sent, used when the user resolves a disambiguation
    const [lastQuery, setLastQuery] = useState(null);

    async function search(from, to, labels = { from, to }) {
        setLoading(true);
        setError(null);
        setMessage(null);
        setLastQuery({ from, to, labels });
        try {
            const data = await api.planJourney(from, to);
            if (data.disambiguation) {
                setDisambiguation(data.disambiguation);
                return;
            }
            setJourneys(data.journeys);
            setSelectedId(data.journeys[0]?.id ?? null);
            if (data.journeys.length === 0) setMessage(data.message || "No routes found for these locations.");
            else if (labels.from !== CURRENT_LOCATION) addSearch(labels.from, labels.to);
        } catch (err) {
            setJourneys([]);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const from = fromText.trim();
        const to = toText.trim();
        if (!from || !to) {
            setError("Please enter a starting point and a destination.");
            return;
        }
        if (from === CURRENT_LOCATION) {
            try {
                const coords = await getCurrentPosition();
                return search(coords, to, { from, to });
            } catch (err) {
                return setError(err.message);
            }
        }
        search(from, to);
    }

    // the user picked a place, send its coordinates instead of the text
    function handleResolve(origin, destination) {
        setDisambiguation(null);
        const from = origin ? `${origin.lat},${origin.lon}` : lastQuery.from;
        const to = destination ? `${destination.lat},${destination.lon}` : lastQuery.to;
        search(from, to, lastQuery.labels);
    }

    function swap() {
        setFromText(toText);
        setToText(fromText);
    }

    useEffect(() => {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ fromText, toText, journeys, selectedId }));
        } catch {
            // storage blocked, results are just not kept
        }
    }, [fromText, toText, journeys, selectedId]);

    function startJourney(journey) {
        navigate("/navigate", { state: { journey } });
    }

    // "Search again" from the history page
    useEffect(() => {
        const repeat = location.state?.repeat;
        if (repeat) {
            setFromText(repeat.from);
            setToText(repeat.to);
            search(repeat.from, repeat.to);
            navigate(".", { replace: true, state: null });
        }
    }, []);

    const measured = journeys.filter((j) => j.exposurePerKm != null).map((j) => j.exposurePerKm);
    const lowestPerKm = measured.length > 0 ? Math.min(...measured) : null;
    const allSameExposure = measured.length > 1 && measured.every((v) => Math.round(v) === Math.round(measured[0]));
    const fastest = journeys.find((j) => j.isFastest);
    const lowest = journeys.find((j) => j.isLowestExposure);
    const reduction = fastest && lowest && !fastest.isLowestExposure ? exposureReduction(fastest, lowest) : null;
    const selected = journeys.find((j) => j.id === selectedId) || null;

    return (
        <div className="planner">
            <section className="planner-panel">
                <form className="search-form card" onSubmit={handleSubmit}>
                    <h1>Plan a journey</h1>
                    <label>
                        From
                        <div className="input-row">
                            <input
                                value={fromText}
                                onChange={(e) => setFromText(e.target.value)}
                                placeholder="e.g. Victoria Station"
                                maxLength={200}
                            />
                            <button type="button" className="button small" onClick={() => setFromText(CURRENT_LOCATION)} title="Use my current location">
                                📍
                            </button>
                        </div>
                    </label>
                    <button type="button" className="swap" onClick={swap} aria-label="Swap from and to">⇅</button>
                    <label>
                        To
                        <input
                            value={toText}
                            onChange={(e) => setToText(e.target.value)}
                            placeholder="e.g. Liverpool Street Station"
                            maxLength={200}
                        />
                    </label>
                    <button className="button primary block" disabled={loading}>
                        {loading ? "Comparing routes..." : "Compare routes"}
                    </button>
                    {error && <p className="error-text" role="alert">{error}</p>}
                    {message && <p className="muted">{message}</p>}
                </form>

                {journeys.length === 0 && searches.length > 0 && (
                    <div className="card recent">
                        <div className="recent-head">
                            <h2>Recent searches</h2>
                            <button className="link-button" onClick={clearAll}>Clear</button>
                        </div>
                        <ul>
                            {searches.map((s) => (
                                <li key={`${s.from}|${s.to}`}>
                                    <button
                                        className="link-button"
                                        onClick={() => {
                                            setFromText(s.from);
                                            setToText(s.to);
                                            search(s.from, s.to);
                                        }}
                                    >
                                        {s.from} → {s.to}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {journeys.length > 0 && (
                    <>
                        {allSameExposure && (
                            <div className="summary card neutral">
                                <strong>Same exposure on every option</strong>
                                <span className="muted">These routes share the same walking sections, so pick the one that suits your time.</span>
                            </div>
                        )}
                        {!allSameExposure && fastest?.isLowestExposure && (
                            <div className="summary card">
                                <strong>Best route</strong>
                                <span className="muted">The fastest option also has the lowest recorded-crime exposure</span>
                            </div>
                        )}
                        {reduction != null && (
                            <div className="summary card">
                                <strong>{reduction.toFixed(0)}% less exposure</strong>
                                <span className="muted">by choosing the lower-exposure route instead of the fastest one</span>
                            </div>
                        )}
                        <div className="journey-list">
                            {journeys.map((journey) => (
                                <JourneyCard
                                    key={journey.id}
                                    journey={journey}
                                    badges={badgesFor(journey, allSameExposure)}
                                    lowestPerKm={lowestPerKm}
                                    selected={journey.id === selectedId}
                                    onSelect={() => setSelectedId(journey.id)}
                                    onStart={() => startJourney(journey)}
                                />
                            ))}
                        </div>
                    </>
                )}
                <DisclaimerBar />
            </section>

            <section className="planner-map">
                <RouteMap journey={selected} onStart={selected ? () => startJourney(selected) : null} />
                {selected && <LegList journey={selected} />}
            </section>

            {disambiguation && (
                <DisambiguationModal
                    disambiguation={disambiguation}
                    onResolve={handleResolve}
                    onCancel={() => setDisambiguation(null)}
                />
            )}
        </div>
    );
}
