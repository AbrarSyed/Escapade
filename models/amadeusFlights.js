var request = require('request');

var BASE_URL = "https://api.sandbox.amadeus.com/v1.2/";
var FLIGHTS_BASE = BASE_URL + "flights/";
var AIRPORTS_BASE = BASE_URL + "airports/";
var API_KEYS = require('../config.json').amadeus.keys;

var keyIndex = 0;
function getApiKey()
{
    var out = API_KEYS[keyIndex];
    keyIndex = (keyIndex+1) % API_KEYS.length; // bump key
    return out;
}

var airportGeoCache = {};

module.exports = {
    "nearbyAirport": function (coordinate) {
        var option = {
            "url": AIRPORTS_BASE + "nearest-relevant",
            "qs": {
                "latitude": coordinate.latitude,
                "longitude": coordinate.longitude,
                "apikey": getApiKey()
            },
            "method": "GET",
        };

        return new Promise(function (resolve, reject) {
            request(option, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            });
        });
    },
    "airportInfo": function (code) {

        if (airportGeoCache[code])
        {
            console.log("Cahce HIT!");
            return Promise.resolve(airportGeoCache[code]);
        }

        var option = {
            "url": BASE_URL + "location/"+code,
            "qs": {
                "apikey": getApiKey()
            },
            "method": "GET"
        };

        return new Promise(function (resolve, reject) {
            request(option, function (error, response, json) {
                if (!error && response.statusCode == 200) {
                    var body = JSON.parse(json);
                    if (body.Info)
                    {
                        reject(new Error(body.Info));
                    }
                    else
                    {
                        airportGeoCache[code] = body.airports[0];
                        resolve(body.airports[0]);
                    }
                } else {
                    console.log("ERROR -> "+error);
                    console.log("status-code -> "+response.statusCode);
                    reject(new Error(error));
                }
            });
        });
    },
    "inspirationSearch": function(budget, origin, leavingDate, duration) {
        var option = {
            "url": FLIGHTS_BASE + "inspiration-search",
            "qs": {
                "origin": origin,
                "departure_date": leavingDate,
                "max_price": budget,
                "apikey": getApiKey(),
                "duration": duration,
            },
            "method": "GET",
        };

        return new Promise(function (resolve, reject) {
            request(option, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            });
        });
    },
    "extensiveSearch": function(budget, origin, destination, leavingDate, duration) {

        var option = {
            "url": FLIGHTS_BASE + "extensive-search",
            "qs": {
                "origin": origin,
                "departure_date": leavingDate,
                "max_price": budget,
                "apikey": getApiKey(),
                "destination": destination,
                "duration": duration,
            },
            "method": "GET",
        };

        return new Promise(function (resolve, reject) {
            request(option, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            })
        })
    },
    "lowFareSearch": function (budget, origin, destination, leavingDate) {

        var option = {
            "url": FLIGHTS_BASE + "low-fare-search",
            "qs": {
                "origin": origin,
                "destination": destination,
                "leavingDate": leavingDate,
                "travel_class": "ECONOMY",
                "max_price": budget,
            },
            "method": "GET"
        };

        return new Promise(function (resolve, reject) {
            request(option, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            });
        });
    },
    "autoComplete": function (text) {

        var option = {
            "url": AIRPORTS_BASE + "autocomplete",
            "qs": {
                "term": text,
                "apikey": getApiKey()
            },
            "method": "GET"
        };

        return new Promise(function (resolve, reject) {
            request(option, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                } else {
                    reject(error);
                }
            });
        });

    }
};