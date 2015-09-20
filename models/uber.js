/**
 * Created by Jeff on 9/19/15.
 */
var express = require('express');
var request = require('request');
var config = require('../config.json');
var router = express.Router();

var options = {
    headers: {
        "Authorization": "Token " + config['uber']['server_token'],
    },
    method: "GET"
}

function makeOptions(url)
{
    return {
        "url": url,
        "headers": {
            "Authorization": "Token " + config['uber']['server_token'],
        }
    };
}

var endpoint = 'https://api.uber.com/';

function callUberAPI(url)
{
    var options = makeOptions(url);
    if (!url) {
        return new Promise(function (resolve, reject) {
            reject(new Error("invalid endpoint"));
        });
    } else {
        return new Promise(function (resolve, reject) {
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(error);
                }
            });
        })
    }
}

/**
 * Hits the Uber Time estimate endpoint
 * @param startCoord dict for the longitude and latitude of the place to search
 * @param startCoord.longitude {float} Longitude of the starting Coordinate
 * @param startCoord.latitude {float} latitude of the starting coordinate
 * @returns { "estimate": int (seconds), "type": "uberX" }
 */

module.exports = {
    "estimateTimes": function(startCoord) {
        var version = "v1";
        var type = "estimates/time";
        var queryString = "start_latitude=" + startCoord['latitude'] + "&" +
            "start_longitude=" + startCoord['longitude'];

        var url = endpoint + version + "/" + type + "?" + queryString;

        return new Promise(function (resolve, reject) {
            callUberAPI(url).then(function(data) {
                var ret = JSON.parse(data);
                var estimate = 0;
                var filter = "uberx";

                for (var i = 0; i < ret.times.length; i++) {
                    if (ret.times[i].display_name.toLowerCase() === filter) {
                        estimate = ret.times[i].estimate;
                        break;
                    }
                }

                resolve(estimate);
            }, function(reason) {
                reject(reason);
            });
        })
    },
    "estimatePrices": function(startCoord, endCoord) {
        var version = "v1";
        var type = "estimates/price";
        var queryString = "start_latitude=" + startCoord['latitude'] + "&" +
            "start_longitude=" + startCoord['longitude'] + "&" +
            "end_latitude=" + endCoord['latitude'] + "&" +
            "end_longitude=" + endCoord['longitude'];

        var url = endpoint + version + "/" + type + "?" + queryString;

        return new Promise(function (resolve, reject) {
            callUberAPI(url).then(function (data) {
                var ret = JSON.parse(data);
                var cheapest = 99999.99;

                // find the average price of all uberx's
                for (var idx = 0; idx < ret['prices'].length; idx++) {

                    var temp = ret['prices'][idx];

                    var surge = temp['surge_multiplier'];

                    var cheapTemp = temp['low_estimate'] * 1/surge;
                    cheapTemp += temp['high_estimate'] * 1/surge;
                    cheapTemp /= 2;

                    if (cheapTemp < cheapest) {
                        cheapest = cheapTemp;
                    }
                }

                resolve(cheapest); // Calculate the average price over all uberX's with no surge and return
            }, function (reason) {
                reject(reason);
            });
        });
    }
};
