import * as util from './util.js';

//prepare metric control
const localStorage = window.localStorage;
const metricUnitsKey = 'metric';
console.log(`Initial metric units ${localStorage.getItem(metricUnitsKey)}`);
console.log(localStorage.getItem(metricUnitsKey) === null);
if (localStorage.getItem(metricUnitsKey) === null) {
    localStorage.setItem(metricUnitsKey, true);
}
var currentMetricProperties = util.getMetricProperties(JSON.parse(localStorage.getItem(metricUnitsKey)));
console.log('Initial metric properties', currentMetricProperties);
util.getCurrentLocation()

// elements and listeners
const refreshBtn = document.getElementById("refresh-btn");
const weatherContainer = document.getElementById('cur-w-container');
const windDiv = document.getElementById('cur-w-wind');
const temperatureLabel = document.getElementById('cur-w-temp-label');
const feelsLikeLabel = document.getElementById('cur-w-feels-like');
const dateDiv = document.getElementById('cur-w-date');
const iconImg = document.getElementById('cur-w-icon');
const unitsBtn = document.getElementById('units-btn');

// logic variables
const weatherApiUrl = 'https://community-open-weather-map.p.rapidapi.com/weather';
const locationParam = 'q=Minsk';

console.log(`Before setup metric units ${localStorage.getItem(metricUnitsKey)}`);
// on start
setUp();

console.log(`After setup metric units ${localStorage.getItem(metricUnitsKey)}`);


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

function displayCurrentWeather({ name, weather: [weather], wind,
     main: { temp, feels_like }, dt }) {
    console.log({ name, weather, wind, temp, feels_like, dt });
    let date = new Date(dt * 1000);
    console.log(date);

    if (weatherContainer.classList.length > 1) {
        let lastClass = weatherContainer.className.split(' ').pop();
        weatherContainer.classList.remove(lastClass)
    }
    weatherContainer.classList.add(util.resolveClassByWeatherId(weather.id))
    console.log('Metric properties', currentMetricProperties);
    windDiv.textContent = `${wind.speed} ${currentMetricProperties.speedUnit}`;
    temperatureLabel.textContent = `${Math.round(temp)}${currentMetricProperties.tempUnit}`;
    feelsLikeLabel.textContent = `Feels like ${Math.round(feels_like)}${currentMetricProperties.tempUnit}`;
    dateDiv.textContent = date.toLocaleString();

    let imgUrl = iconImg.getAttribute("src").replace("{icon}", weather.icon)
    console.log(imgUrl)
    iconImg.setAttribute("src", imgUrl);

}


async function refreshWeatherData() {
    const headers = {
        "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
        "x-rapidapi-key": "---"
    };
    let unitsParam = `units=${currentMetricProperties.name.toLowerCase()}`;
    const response = await callApi(weatherApiUrl, 'GET', headers, locationParam, unitsParam);
    console.log({ response });
    displayCurrentWeather(response);
}


async function changeUnits() {
    console.log('Changing units')
    let currentIsMetric = JSON.parse(localStorage.getItem(metricUnitsKey));
    unitsBtn.textContent = `To ${currentMetricProperties.name} Units`;
    localStorage.setItem(metricUnitsKey, !currentIsMetric);
    currentMetricProperties = util.getMetricProperties(!currentIsMetric);
    console.log('New metric properties', currentMetricProperties);
    refreshWeatherData();
}

async function setUp() {
    unitsBtn.addEventListener('click', changeUnits);
    refreshBtn.addEventListener('click', refreshWeatherData);
    let currentIsMetric = JSON.parse(localStorage.getItem(metricUnitsKey));
    let oppositeMetricProperties = util.getMetricProperties(!currentIsMetric);
    unitsBtn.textContent = `To ${oppositeMetricProperties.name} Units`;
    refreshWeatherData();
}
