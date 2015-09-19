/**
 * Created by Jeff on 9/19/15.
 */
var express = require('express');
var router = express.Router();
var flights = require('../models/amadeusFlights.js');

router.get('/flights/airportAutoComplete', function(request, response, next) {
    flights.autoComplete(request.query.text).then(function (body) {
        response.send(body);
    }, function (reason) {
        response.send(reason);
    });
});

module.exports = router;