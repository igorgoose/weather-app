export const properties = {
     weatherApi: {
        url: "https://community-open-weather-map.p.rapidapi.com/weather",
        params: ["lat", "lon", "units"]
    },
    geocodingApi: {
        url: "http://www.mapquestapi.com/geocoding/v1/address",
        params: ["key", "location"]
    },
    reverseGeocodingApi: {
        url: "http://open.mapquestapi.com/geocoding/v1/reverse"
    }
}