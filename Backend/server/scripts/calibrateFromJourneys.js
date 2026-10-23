// plans real TfL journeys between places around central London and prints the
// crimes per km percentiles of the journeys and of their walking legs.
// calibrateThresholds.js uses random lines, but real walks start and end at busy
// stations and stops, so their numbers are a lot higher. This one is used to pick
// the exposure thresholds. Run: node scripts/calibrateFromJourneys.js
const pool = require("../db");
const { planJourneys } = require("../services/journeyService");

// stations, high streets and residential areas inside the area load-crimes.sh keeps
const PLACES = {
    victoria: "51.4952,-0.1441",
    liverpoolStreet: "51.5178,-0.0823",
    kingsCross: "51.5308,-0.1238",
    waterloo: "51.5036,-0.1143",
    paddington: "51.5154,-0.1755",
    oxfordCircus: "51.5152,-0.1419",
    londonBridge: "51.5052,-0.0864",
    camdenTown: "51.5392,-0.1426",
    brixton: "51.4627,-0.1145",
    shoreditch: "51.5233,-0.0752",
    hammersmith: "51.4927,-0.2240",
    greenwich: "51.4781,-0.0149",
    claphamCommon: "51.4618,-0.1384",
    angel: "51.5322,-0.1058",
    southKensington: "51.4941,-0.1738",
    canaryWharf: "51.5054,-0.0235",
    nottingHill: "51.5094,-0.1967",
    elephantCastle: "51.4943,-0.1001",
    holborn: "51.5174,-0.1201",
    hampstead: "51.5560,-0.1780",
    batterseaPark: "51.4791,-0.1566",
    peckham: "51.4740,-0.0690",
    fulham: "51.4730,-0.2050",
    bow: "51.5280,-0.0240",
    dulwich: "51.4450,-0.0860",
    highbury: "51.5460,-0.1030",
    kilburn: "51.5370,-0.1920",
    vauxhall: "51.4861,-0.1253",
};

const PAIR_COUNT = 60;
const DELAY_MS = 1500; // stay under the TfL rate limit for requests without a key

function percentile(sorted, p) {
    if (sorted.length === 0) return NaN;
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function summary(label, values) {
    const s = [...values].sort((a, b) => a - b);
    const fmt = (p) => percentile(s, p).toFixed(0);
    console.log(`${label} (n=${s.length}) -> p25=${fmt(0.25)} p33=${fmt(0.33)} p50=${fmt(0.5)} p66=${fmt(0.66)} p75=${fmt(0.75)} p90=${fmt(0.9)}`);
}

// same pairs every run so the numbers can be repeated
function pairs() {
    const names = Object.keys(PLACES);
    const result = [];
    for (let i = 0; result.length < PAIR_COUNT; i++) {
        const a = names[i % names.length];
        const b = names[(i * 7 + 3) % names.length];
        if (a !== b) result.push([a, b]);
    }
    return result;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
    const journeyPerKm = [];
    const legPerKm = [];
    let failed = 0;

    for (const [a, b] of pairs()) {
        try {
            const journeys = await planJourneys(PLACES[a], PLACES[b]);
            for (const journey of journeys) {
                if (journey.exposurePerKm !== null) journeyPerKm.push(journey.exposurePerKm);
                for (const leg of journey.legs) {
                    if (leg.isWalking && leg.exposurePerKm !== null) legPerKm.push(leg.exposurePerKm);
                }
            }
            process.stdout.write(".");
        } catch (err) {
            failed++;
            process.stdout.write("x");
        }
        await sleep(DELAY_MS);
    }

    console.log(`\n${PAIR_COUNT} origin/destination pairs, ${failed} failed`);
    summary("journey crimes per km", journeyPerKm);
    summary("walking leg crimes per km", legPerKm);
    await pool.end();
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
