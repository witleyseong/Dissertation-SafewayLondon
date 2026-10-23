import { legIcon, lineColour } from "../utils/exposure";

// walk 5m > Bus 24 > walk 3m > Victoria > walk 2m
export default function RouteOverview({ legs }) {
    return (
        <ol className="route-overview">
            {legs.map((leg, i) => (
                <li key={i}>
                    <span aria-hidden="true">{legIcon(leg)}</span>
                    {leg.isWalking ? (
                        <span className="muted">{leg.duration}m</span>
                    ) : (
                        <span className="line-chip" style={{ "--line": lineColour(leg) }}>
                            {leg.routeName || leg.mode}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}
