export function resolveClassByWeatherId(id) {
    if (id > 802) {
        return "clouds";
    }
    if (id == 800) {
        return "clear";
    }
    return "clouds-clear"
}

class MetricProperties {

    constructor(name, tempUnit, speedUnit){
        this.name = name;
        this.tempUnit = tempUnit;
        this.speedUnit = speedUnit;
    }
}

const metricProperties = new MetricProperties("Metric", "°C", "m/s");
const nonMetricProperties = new MetricProperties("Imperial", "°F", "feet/s");

export function getMetricProperties(isMetric) {
    console.log('Choosing metric propeties', isMetric, isMetric ? metricProperties : nonMetricProperties);
    return isMetric ? metricProperties : nonMetricProperties;
}

export async function getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
        console.log(pos)
    })
}