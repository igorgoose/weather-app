const localStorage = window.localStorage;

//location
const locationKey = 'location';

//units
const metricUnitsKey = 'metric';

//todo move this
export function resolveClassByWeatherId(id) {
    if (id > 802) {
        return "clouds";
    }
    if (id == 800) {
        return "clear";
    }
    return "clouds-clear"
}

//locations
export function getCurrentLocation(options = { enableHighAccuracy: true, timeout: 1000, maximumAge: 0 }) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

export function getSavedLocation() {
    let savedCoords = localStorage.getItem(locationKey);
    if (!savedCoords) {
        return null;
    }
    savedCoords = savedCoords.split(':');
    var result = { latitude: savedCoords[0], longitude: savedCoords[1], name: savedCoords[2] };
    console.log("Saved location", result);
    return result;
}

export function saveLocation({latitude, longitude, name}) {
    console.log("Saving new location", latitude, longitude, name);
    if (!name) {
        name = "";
    }
    localStorage.setItem(locationKey, `${latitude}:${longitude}:${name}`);
    return {latitude, longitude, name};
}


// units
class MetricProperties {

    constructor(name, tempUnit, speedUnit) {
        this.name = name;
        this.tempUnit = tempUnit;
        this.speedUnit = speedUnit;
    }
}

const metricProperties = new MetricProperties("Metric", "°C", "m/s");
const nonMetricProperties = new MetricProperties("Imperial", "°F", "feet/s");

const metricPropertiesMap = {
    true: metricProperties,
    false: nonMetricProperties
}

var currentIsMetric = null;

export function getCurrentMetricProperties() {
    return metricPropertiesMap[getCurrentIsMetric()];
}

export function getOtherMetricProperties() {
    return metricPropertiesMap[!getCurrentIsMetric()];
}

export function switchMetricProperties() {
    currentIsMetric = !getCurrentIsMetric();
    localStorage.setItem(metricUnitsKey, currentIsMetric);
}

function getCurrentIsMetric() {
    if (currentIsMetric === null) {
        let isMetric = localStorage.getItem(metricUnitsKey);
        if (isMetric === null) {
            localStorage.setItem(metricUnitsKey, true);
            currentIsMetric = true;
        } else {
            currentIsMetric = JSON.parse(isMetric);
        }
    }
    return currentIsMetric;
}



