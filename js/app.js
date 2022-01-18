import * as storageUtil from './storage-util.js';
import * as apiUtil from './api-util.js'
import { properties } from './properties.js'
import { secret } from './secret.js'

// elements and listeners
const refreshBtn = document.getElementById("refresh-btn");
const weatherContainer = document.getElementById('cur-w-container');
const windDiv = document.getElementById('cur-w-wind');
const temperatureLabel = document.getElementById('cur-w-temp-label');
const feelsLikeLabel = document.getElementById('cur-w-feels-like');
const iconImg = document.getElementById('cur-w-icon');
const unitsBtn = document.getElementById('units-btn');
const locationLabel = document.getElementById('location-label');
const lastUpdatedLabel = document.getElementById('last-updated-label');
const searchCityInput = document.getElementById('search-city-text');
const currentLocationBtn = document.getElementById('current-location-btn');
const searchCityForm = document.getElementById('search-city-form');
document.querySelectorAll("form")
    .forEach(e => e.addEventListener('submit', event => event.preventDefault()));

// on start
setUp();

//setup
async function setUp() {
    unitsBtn.addEventListener('click', changeUnits);
    refreshBtn.addEventListener('click', refreshWeatherData);
    searchCityForm.addEventListener('submit', searchCityWeather);
    currentLocationBtn.addEventListener('click', toCurrentLocation);
    setUpUnits();
    setUpLocation()
        .then(() => refreshWeatherData());
}

function setUpLocation() {
    return new Promise((resolve) => {
        let savedLocation = storageUtil.getSavedLocation();
        if (!savedLocation) {
            storageUtil.getCurrentLocation()
                .then(pos => apiUtil.reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude))
                .then(response => {
                    console.log("Successfully got location!", response);
                    storageUtil.saveLocation(response)
                    resolve(response);
                });
        } else {
            resolve(savedLocation);
        }
    })
}

function setUpUnits() {
    unitsBtn.textContent = `To ${storageUtil.getOtherMetricProperties().name} Units`;
}

//btn handlers
function refreshWeatherData() {
    let location = storageUtil.getSavedLocation();
    var afterLocationPromise = new Promise((resolve) => {
        resolve(location);
    });
    if (!location) {
        console.log("Location is empty. Searching for current location")
        afterLocationPromise = storageUtil.getCurrentLocation()
            .then(pos => apiUtil.reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude)) 
            .then(response => storageUtil.saveLocation(response));
    }
    afterLocationPromise
        .then(location => apiUtil.getCurrentWeather(storageUtil.getCurrentMetricProperties().name.toLowerCase(), location))
        .then(response => {
            console.log({ response });
            displayCurrentWeather(response);
        });
}

function changeUnits() {
    console.log('Changing units');
    storageUtil.switchMetricProperties();
    unitsBtn.textContent = `To ${storageUtil.getOtherMetricProperties().name} Units`;
    refreshWeatherData();
}

async function searchCityWeather() {
    apiUtil.geocodeLocationName(searchCityInput.value)
        .then(response => storageUtil.saveLocation(response))
        .then(refreshWeatherData)
}

function toCurrentLocation() {
    storageUtil.getCurrentLocation()
    .then(pos => apiUtil.reverseGeocodeCoords(pos.coords.latitude, pos.coords.longitude))
    .then(response => {
        let location = storageUtil.saveLocation(response)
        searchCityInput.value = location.name;
        return location;
    })
    .then(refreshWeatherData);
}

function displayCurrentWeather({ name, weather: [weather], wind, main: { temp, feels_like }, dt }) {
    console.log({ name, weather, wind, temp, feels_like, dt });
    let date = new Date(dt * 1000);
    console.log(date);
    let location = storageUtil.getSavedLocation()
    locationLabel.textContent = location.name
    lastUpdatedLabel.textContent = `Last Updated: ${date.toLocaleString()}`
    if (weatherContainer.classList.length > 1) {
        let lastClass = weatherContainer.className.split(' ').pop();
        weatherContainer.classList.remove(lastClass);
    }
    weatherContainer.classList.add(storageUtil.resolveClassByWeatherId(weather.id));
    let currentMetricProperties = storageUtil.getCurrentMetricProperties();
    console.log('Metric properties', currentMetricProperties);
    windDiv.textContent = `${wind.speed} ${currentMetricProperties.speedUnit}`;
    temperatureLabel.textContent = `${Math.round(temp)}${currentMetricProperties.tempUnit}`;
    feelsLikeLabel.textContent = `Feels like ${Math.round(feels_like)}${currentMetricProperties.tempUnit}`;

    let imgUrl = iconImg.getAttribute("src").replace("{icon}", weather.icon);
    console.log(imgUrl);
    iconImg.setAttribute("src", imgUrl);
}