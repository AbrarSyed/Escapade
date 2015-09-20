/**
 * Created by Jeff on 9/19/15.
 */
var express = require('express');
var request = require('request');
var router = express.Router();
var uber = require('../models/uber');

router.get("/uberXtime", function(request, response, next) {
    var params = {
        longitude: request.query.longitude,
        latitude: request.query.latitude
    };

    uber.estimateTimes(params).then(function (estimate) {
        response.json({
            "estimate": estimate,
            "type": "uberX",
        });
    })
});

router.get("/uberXPrice", function(request, response, next) {
    var params = request.query;
    var startCoord = {
        "latitude": params.start_latitude,
        "longitude": params.start_longitude
    };
    var endCoord = {
        "latitude": params.end_latitude,
        "longitude": params.end_longitude
    }


    uber.estimatePrices(startCoord, endCoord).then(function (data) {
        response.json({
            "price": data,
            "type": "uberX"
        });
    }, function(reason) {
        response.statusCode(500);
    });
});

module.exports = router;