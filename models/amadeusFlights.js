/**
 * Created by Jeff on 9/19/15.
 */

var express = require('express')();
var request = require('request');

var FLIGHTS_BASE = "https://api.sandbox.amadeus.com/v1.2/flights/";
var AIRPORTS_BASE = "https://api.sandbox.amadeus.com/v1.2/airports/";
var API_KEY = require('../config.json').amadeus.key;

function inspirationSearch(budget, origin, leavingDate)
{
    var option = {
        "url": FLIGHTS_BASE + "inspiration-search",
        "qs": {
            "origin": origin,
            "departure_date": leavingDate,
            "max_price": budget,
            "apikey": API_KEY
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
}

function extensiveSearch(budget, origin, destination, leavingDate)
{
    var option = {
        "url": FLIGHTS_BASE + "extensive-search",
        "qs": {
            "origin": origin,
            "departure_date": leavingDate,
            "max_price": budget,
            "apikey": API_KEY,
            "destination": destination
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
}

function lowFareSearch(budget, origin, destination, leavingDate)
{
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
}

function nearbyAirport(coordinate)
{
    var option = {
        "url": AIRPORTS_BASE + "nearest-relevant",
        "qs": {
            "latitude": coordinate.latitude,
            "longitude": coordinate.longitude,
            "apikey": API_KEY
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
}

function airportAutoComplete(text) {
    var option = {
        "url": AIRPORTS_BASE + "autocomplete",
        "qs": {
            "term": text,
            "apikey": API_KEY
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


module.exports = {
    "nearbyAirport": nearbyAirport,
    "inspirationSearch": inspirationSearch,
    "extensiveSearch": extensiveSearch,
    "lowFareSearch": lowFareSearch,
    "autoComplete": airportAutoComplete
};