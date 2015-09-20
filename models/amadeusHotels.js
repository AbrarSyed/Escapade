var request = require('request');

// constants
var BASE_URL = "https://api.sandbox.amadeus.com/v1.2/hotels/";

var API_KEYS = require('../config.json').amadeus.keys;
var keyIndex = 0;
function getApiKey()
{
    var out = API_KEYS[keyIndex];
    keyIndex = (keyIndex+1) % API_KEYS.length; // bump key
    return out;
}

/**
 * Hits the Amaadeus hotel API
 * @param airportCode Airport code, eg 'BOS' or 'ORD'
 * @param checkInDate date in format "YYYY-MM-DD"
 * @param checkOutDate date in format "YYYY-MM-DD"
 * @param maxRate maximum nightly rate, default is $500
 * @param amenities array of amenities: POOL, PARKING, RESTAURANT, PETS_ALLOWED
 * @returns {Promise}
 */
function findHotels(airportCode, checkInDate, checkOutDate, maxRate, amenities)
{
    return new Promise(function (resolve, reject) {
        var options = {
            url: BASE_URL+"search-airport",
            method: "GET",
            qs: {
                apikey: getApiKey(),
                location: airportCode,
                check_in: checkInDate,
                check_out: checkOutDate,
                lang: "EN",
                currency: "USD"
            },
            arrayFormat: "repeat"
        }

        if (maxRate)
        {
            options.qs.max_rate = maxRate;
        }
        if (amenities)
        {
            options.qs.amenity = amenities;
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body).results);
            } else {
                console.log("ERROR -> "+error);
                console.log("status-code -> "+response.statusCode);
                console.log("data -> "+body);
                reject(error);
            }
        });
    })
}

function getHotel(hotelCode)
{
    return new Promise(function (resolve, reject) {
        var options = {
            url: BASE_URL+hotelCode,
            method: "GET",
            qs: {
                apikey: getApiKey(),
                location: airportCode,
                check_in: checkInDate,
                check_out: checkOutDate,
                lang: "EN",
                currency: "USD"
            },
            arrayFormat: "repeat"
        }

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(error);
            }
        });
    })
}

module.exports = {
    findHotels: function(airportCode, checkInDate, checkOutDate, maxRate, amenities) {
        return findHotels(airportCode, checkInDate, checkOutDate, maxRate, amenities);
    },
    getHotel: function(hotelCode) {
        return findHotels(hotelCode);
    },
}