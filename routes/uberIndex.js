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

    // Hard code to test
    //var params = {}
    //params.startCoord = {
    //    "longitude": -71.101857,
    //    "latitude": 42.36508
    //};

    uber.estimateTimes(params).then(function (estimate) {
        response.send({
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
        response.send({
            "price": data,
            "type": "uberX"
        });
    }, function(reason) {
        response.statusCode(500);
    });
});

module.exports = router;