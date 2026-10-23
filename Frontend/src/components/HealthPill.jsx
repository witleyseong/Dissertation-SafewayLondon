import { useEffect, useState } from "react";
import { api } from "../api/client";

// small pill that shows if the API and the database are up
export default function HealthPill() {
    const [status, setStatus] = useState("checking");
    const [crimes, setCrimes] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api.health()
            .then((data) => {
                if (cancelled) return;
                setStatus(data.status === "ok" ? "ok" : "error");
                setCrimes(data.crimesInDatabase ?? null);
            })
            .catch(() => !cancelled && setStatus("error"));
        return () => {
            cancelled = true;
        };
    }, []);

    const text = { checking: "Connecting...", ok: "API: ok", error: "API offline" }[status];
    const title = crimes != null ? `${crimes.toLocaleString("en-GB")} crime records loaded` : undefined;

    return (
        <span className={`health-pill health-${status}`} title={title}>
            <span className="dot" aria-hidden="true" />
            {text}
        </span>
    );
}
