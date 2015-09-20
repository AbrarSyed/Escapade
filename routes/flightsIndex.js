/**
 * Created by Jeff on 9/19/15.
 */
var express = require('express');
var router = express.Router();
var flights = require('../models/amadeusFlights.js');

router.get('/airportAutoComplete', function(request, response, next) {
    flights.autoComplete(request.query.text).then(function (body) {
        for (var idx = 0; idx < body.length; idx++)
        {
            var temp = body[idx];
            temp.label = temp.label.substr(0, temp.label.indexOf("[") - 1 < 0 ? 0 : temp.label.indexOf("[") - 1);
        }
        response.json(body);
    }, function (reason) {
        response.send(reason);
    });
});

module.exports = router;