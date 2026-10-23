// settings used by exposureService.js and journeyService.js

// only crimes within 50 meters of the walk are counted
const WALK_BUFFER_METERS = 50;

// only these crime types are counted (the ones that matter when walking)
const WALKING_RELEVANT_CATEGORIES = Object.freeze([
    "Violence and sexual offences",
    "Robbery",
    "Theft from the person",
    "Public order",
    "Anti-social behaviour",
    "Possession of weapons",
])

// months of crime data that are loaded
const CRIME_DATA_EARLIEST_MONTH = "2023-06"
const CRIME_DATA_LATEST_MONTH = "2026-05"

// very short walks would give huge crimes/km, so use the buffer size as the minimum distance
const MIN_DENOMINATOR_KM = WALK_BUFFER_METERS / 1000;

// crimes per km limits for lower / moderate / higher
// terciles of 182 real TfL journeys between 60 origin/destination pairs
// (scripts/calibrateFromJourneys.js: p33 = 1262, p66 = 2543), so each band holds
// about a third of real journeys. Real walks start and end at busy stations, which
// is why these are much higher than the random-line numbers of calibrateThresholds.js
const EXPOSURE_LOWER_MAX_PER_KM = 1250;
const EXPOSURE_MODERATE_MAX_PER_KM = 2500;

// score is based on crimes per km, not the total count
// 100 = no crimes, and the lower/moderate limit gives 50
const EXPOSURE_SCORE_HALF_LIFE_PER_KM = EXPOSURE_LOWER_MAX_PER_KM;


// turns the old risk level into an exposure level
const RISK_TO_EXPOSURE_LEVEL = Object.freeze({
    safe:"lower",
    low:"lower",
    moderate:"moderate",
    high:"higher"
})

module.exports = {
  WALK_BUFFER_METERS,
  WALKING_RELEVANT_CATEGORIES,
  CRIME_DATA_EARLIEST_MONTH,
  CRIME_DATA_LATEST_MONTH,
  MIN_DENOMINATOR_KM,
  EXPOSURE_LOWER_MAX_PER_KM,
  EXPOSURE_MODERATE_MAX_PER_KM,
  EXPOSURE_SCORE_HALF_LIFE_PER_KM,
  RISK_TO_EXPOSURE_LEVEL,
};