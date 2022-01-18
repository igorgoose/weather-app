import { properties } from './properties.js'
import { secret } from './secret.js'

const unitsParamName = 'units';
const latParamName = 'lat';
const lonParamName = 'lon';

async function callApi(url, method, headers, ...params) {
    console.log(`calling ${url}?${params}`);
    const fullUrl = url + '?' + params.join('&');
    console.log(fullUrl);
    const response = await fetch(fullUrl, {
        "method": method,
        "headers": headers
    });
    return response.json();
}

export async function getCurrentWeather(units, {latitude, longitude}) {
    let unitsParam = `${unitsParamName}=${units}`;
    console.log(latitude, longitude)
    let latParam = `${latParamName}=${latitude}`;
    let lonParam = `${lonParamName}=${longitude}`;
    return callApi(properties.weatherApi.url, 'GET', secret.weatherApi.headers, unitsParam, latParam, lonParam);
}

export async function geocodeLocationName(locationName) {
    let keyParam = `key=${secret.geocodingApi.key}`
    let locationParam = `location=${locationName}`.replace(' ', '+');
    return callApi(properties.geocodingApi.url, 'GET', {}, keyParam, locationParam)
        .then(response => {
            let location = response.results[0].locations[0];
            let latitude = location.latLng.lat;
            let longitude = location.latLng.lng;
            let name = formatLocationName(location);
            return {latitude, longitude, name}
        });
}

export async function reverseGeocodeCoords(lat, lon) {
    let keyParam = `key=${secret.geocodingApi.key}`
    let locationParam = `location=${lat},${lon}`.replace(' ', '+');
    return callApi(properties.reverseGeocodingApi.url, 'GET', {}, keyParam, locationParam)
        .then(response => {
            console.log(`Reverse geocoded ${lat}, ${lon}`, response);
            let location = response.results[0].locations[0];
            let latitude = location.latLng.lat;
            let longitude = location.latLng.lng;
            let name = formatLocationName(location);
            return {latitude, longitude, name}
        }).catch(e => console.log(e));
}

function formatLocationName(location) {
    let area5 = location.adminArea5;
    let area4 = location.adminArea4;
    let area3 = location.adminArea3;
    let area1 = location.adminArea1;
    let areas = [area5, area4, area3, area1];
    return areas.filter((str) => str.length != 0).join(", ");
}