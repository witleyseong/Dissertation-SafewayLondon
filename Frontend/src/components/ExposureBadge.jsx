import { bandFor } from "../utils/exposure";

export default function ExposureBadge({ level }) {
    const band = bandFor(level);
    if (!band) return <span className="exposure-badge muted">No walking to measure</span>;
    return (
        <span className="exposure-badge" style={{ "--band": band.color }}>
            <span className="dot" aria-hidden="true" />
            {band.label}
        </span>
    );
}
