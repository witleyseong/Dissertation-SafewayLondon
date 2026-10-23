import { EXPOSURE_BANDS } from "../utils/exposure";

export default function AboutPage() {
    return (
        <div className="page prose">
            <h1>About the data</h1>
            <p className="muted">How crime data is used in this application.</p>

            <h2>What we show</h2>
            <p>
                SafeWay London compares historical exposure to recorded crime along the walking sections of multimodal routes.
                It uses police-recorded crime data from the Metropolitan Police Service, published through{" "}
                <a href="https://data.police.uk/" target="_blank" rel="noreferrer">data.police.uk</a>.
            </p>

            <h2>What we do not show</h2>
            <p>
                This application does not predict real-time safety. Routes are never labelled as "safe" or "dangerous".
                The data is historical and approximate.
            </p>

            <h2>How it is calculated</h2>
            <ol>
                <li>Route options come from the TfL Journey Planner API.</li>
                <li>For every walking leg, a 50 m buffer is drawn around the path using PostGIS.</li>
                <li>
                    Recorded crimes inside the buffer are counted (violence and sexual offences, robbery, theft from the person,
                    public order, anti-social behaviour and possession of weapons), each crime once per journey.
                </li>
                <li>The count is divided by the walking distance to give crimes per km, so longer walks are not penalised just for being longer.</li>
            </ol>

            <h2>How to read the bands</h2>
            <ul className="band-list">
                <li><span className="dot" style={{ background: EXPOSURE_BANDS.lower.color }} /> <strong>Lower exposure</strong>: up to 1,250 recorded crimes per km walked</li>
                <li><span className="dot" style={{ background: EXPOSURE_BANDS.moderate.color }} /> <strong>Moderate exposure</strong>: 1,250 to 2,500 per km</li>
                <li><span className="dot" style={{ background: EXPOSURE_BANDS.higher.color }} /> <strong>Higher exposure</strong>: more than 2,500 per km</li>
            </ul>

            <p>
                These limits split 182 real TfL journeys across central London into three groups of about the same size, so
                the band says how a route compares with other London journeys. Walks that start or end at big stations usually
                land in the higher band because those areas are very busy. When comparing options for the same trip, look at the
                crimes per km and the "Lowest exposure" label.
            </p>

            <h2>Data source and coverage</h2>
            <p>
                Street-level crime data from June 2023 to May 2026. Locations are anonymised by UK Police to nearby public points,
                so they may not reflect the exact place of an incident, and high counts may simply mean a busy public area.
            </p>

            <div className="callout">
                <strong>Important</strong>
                <p>
                    Historical crime data does not predict future safety. Use this application as an informative tool, but always
                    practise personal safety and stay aware of your surroundings.
                </p>
            </div>
        </div>
    );
}
