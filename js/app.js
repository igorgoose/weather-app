import * as storageUtil from './storage-util.js';
import * as apiUtil from './api-util.js'

class TopBarSlider {

    constructor() {
        this.container = document.getElementById('top-bar-slider');
        this.items = document.querySelectorAll('#top-bar-slider > .top-bar-item:not(#slide-left, #slide-right)');
        this.slideLeft = document.getElementById('slide-left');
        this.slideRight = document.getElementById('slide-right');
        this.left = 0;
        this.afterRight = this.items.length;
        this.drawFromLeft();
    }

    drawFromLeft(start = 0) {
        console.log('drawFromLeft', start, this);
        let fullWidth = this.container.clientWidth;
        console.log("Full width", fullWidth);
        this.showAllItems();
        let sumItemsWidth = start == 0 ? 0 : this.computeItemWidth(this.slideLeft);
        for (let index = start; index < this.items.length; index++) {
            const element = this.items[index];
            let elementWidth = this.computeItemWidth(element);
            sumItemsWidth += elementWidth;
            console.log(sumItemsWidth);
            if (sumItemsWidth > fullWidth) {
                this.displayItems(start, index);
                return;
            }
        }
        this.displayItems(start, this.items.length);
    }

    drawFromRight(end = this.items.length) {
        console.log('drawFromRight', end, this);
        let fullWidth = this.container.clientWidth;
        console.log("Full width", fullWidth);
        this.showAllItems();
        let sumItemsWidth = end == this.items.lengt ? 0 : this.computeItemWidth(this.slideRight);
        for (let index = end - 1; index >= 0; index--) {
            const element = this.items[index];
            let elementWidth = this.computeItemWidth(element);
            sumItemsWidth += elementWidth;
            console.log(sumItemsWidth);
            if (sumItemsWidth > fullWidth) {
                this.displayItems(index, end);
                return;
            }
        }
        this.displayItems(0, end);
    }

    showAllItems() {
        this.items.forEach(i => i.hidden = false);
        this.slideLeft.hidden = false;
        this.slideRight.hidden = false;
    }

    displayItems(start = 0, end = this.items.length) {
        console.log('Displaying top bar items', start, end);
        for (let index = 0; index < this.items.length; index++) {
            const element = this.items[index];
            element.hidden = index < start || index >= end;
            // element.style.display = index < start || index >= end ? 'none' : null;
        }
        // this.slideLeft.style.display = start == 0 ? 'none' : null;
        // this.slideRight.style.display = end == this.items.length ? 'none' : null;
        this.slideLeft.hidden = start == 0;
        this.slideRight.hidden = end == this.items.length;
        this.left = start;
        this.afterRight = end;
    }

    computeItemWidth(item) {
        let style = item.currentStyle || window.getComputedStyle(item);
        console.log(style.marginLeft, style.borderWidth, item.clientWidth, style.marginRight);
        return parseInt(style.marginLeft) + parseInt(style.borderWidth) 
            + parseInt(item.clientWidth) + parseInt(style.marginRight);
    }

    doSlideRight = () => {
        if (this.afterRight == this.items.length) {
            return;
        }
        this.drawFromLeft(this.afterRight);
    }

    doSlideLeft = () => {
        if (this.left == 0) {
            return;
        }
        this.drawFromRight(this.left);
    }

}

// elements and listeners
const refreshBtn = document.getElementById('refresh-btn');
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
document.querySelectorAll('form')
    .forEach(e => e.addEventListener('submit', event => event.preventDefault()));
const topBarSlider = new TopBarSlider();
console.log(topBarSlider);
const slideLeftBtn = document.getElementById('slide-left-btn');
const slideRightBtn = document.getElementById('slide-right-btn');
slideLeftBtn.addEventListener('click', topBarSlider.doSlideLeft);
slideRightBtn.addEventListener('click', topBarSlider.doSlideRight);

// on start
setUp();

//setup
async function setUp() {
    unitsBtn.addEventListener('click', changeUnits);
    refreshBtn.addEventListener('click', refreshWeatherData);
    searchCityForm.addEventListener('submit', searchCityWeather);
    currentLocationBtn.addEventListener('click', toCurrentLocation);
    console.log('Width', currentLocationBtn.clientWidth);
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
                    console.log('Successfully got location!', response);
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
    let afterLocationPromise = new Promise((resolve) => {
        resolve(location);
    });
    if (!location) {
        console.log('Location is empty. Searching for current location')
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

function displayCurrentWeather(weatherData) {
    let { current : {weather: [weather], wind_speed, temp, feels_like, dt}} = weatherData;
    console.log({ weather, wind_speed, temp, feels_like, dt });
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
    windDiv.textContent = `${wind_speed} ${currentMetricProperties.speedUnit}`;
    temperatureLabel.textContent = `${Math.round(temp)}${currentMetricProperties.tempUnit}`;
    feelsLikeLabel.textContent = `Feels like ${Math.round(feels_like)}${currentMetricProperties.tempUnit}`;

    let imgUrl = iconImg.getAttribute('src').replace('{icon}', weather.icon);
    console.log(imgUrl);
    iconImg.setAttribute('src', imgUrl);
}

function displayHourlyWeather(hourlyWeatherData) {
    
}
