var express = require('express');
var router = express.Router();
var moment = require('moment');
var _ = require('lodash');
var aHotels = require('../models/amadeusHotels');
var aFlights = require('../models/amadeusFlights');
var uber = require('../models/uber');

/* GET users listing. */
router.post('/buildTripList', function(req, res) {

    // get the request body json
    var body = req.body;

    if (
            !body ||
            !body.departLoc ||
            !body.departDate ||
            !body.returnDate ||
            !body.budget
    )
    {
        res.status(400).send("missing required fields!");
        return;
    }

    var budget = body.budget;

    body.departStartDate = body.departDate.split("--")[0];
    body.departEndDate = body.departDate.split("--")[1];

    var promise;

    // Obtain Raw Flights
    if (!body.destLoc)
    {
        // no destination? wel do inspiration

        var duration = moment(body.returnDate).diff(moment(body.departEndDate), "days") + "--" + moment(body.returnDate).diff(moment(body.departStartDate), "days");

        promise = aFlights.inspirationSearch(budget, body.departLoc, body.departDate, duration);
    }
    else
    {
        // do extensive

        var duration = moment(body.returnDate).diff(moment(body.departEndDate), "days") + "--" + moment(body.returnDate).diff(moment(body.departStartDate), "days");

        promise = aFlights.extensiveSearch(budget, body.destLoc, body.departLoc, body.departDate, duration);
    }

    promise = promise.then(function(flightsData) {

        // filter the flights by price and stuff
        var out = _.filter(flightsData.results, {return_date: body.returnDate});
        out = _.slice(out, 0, 2);
        out = _.map(out, function(flight) {
            flight.origin = flightsData.origin;
            flight.price = parseFloat(flight.price);
            return flight;
        });

        return out;
    });

    promise = promise.then(function(flights) {
        // add the airport data to each flight
        // construct list of promises
        var promises = _.map(flights, function(flight) {
            return aFlights.airportInfo(flight.destination).then(function(airportData) {
                console.log("hapenned");
                // TODO: hmm... this might not work..
                flight.destination = airportData;
                return flight;
            });
        });
        // return aggregate promise
        return Promise.all(promises);
    }, function(err) {
        throw new Error(err);
    });

    promise = promise.then(function(flights) {

        // get aggregate of hotel data
        var promises = _.map(flights, function(flight) {

            // get hotels for flight
            var nonFlightBudget = (budget - flight.price);
            var dailyRate = Math.floor(nonFlightBudget / (moment(flight.departure_date).diff(moment(flight.return_date), "day")));

            // return filterred hotels list
            // TODO: maybe use a circle search instead of the airport search
            var hotelPromise = aHotels.findHotels(flight.destination.code, flight.departure_date, flight.return_date, dailyRate).then(function(hotels) {
                // filter hotels by uber price and budget

                // get promises that adds uber data to all the hotel objects
                var uberPromises = _.map(hotels, function(hotel) {
                    return uber.estimatePrices(flight.destination.location, hotel.location).then(function(uberPrice) {
                        hotel.uberPrice = (uberPrice*2); // round trip to hotel and back
                        return hotel;
                    }, function(err) {
                        console.log("WHAT!?!?! -> "+err);
                        throw new Error(err);
                    });
                });

                // filters the hotel objects based on added uber cost
                return Promise.all(uberPromises).then(function(hotels) {
                    return _.filter(hotels, function(hotel) {
                        return (parseFloat(hotel.total_price.amount) + hotel.uberPrice) < nonFlightBudget;
                    });
                }, function(err) {
                    console.log("WHAT!?!?! -> "+err);
                    throw new Error(err);
                });

            // now build the trip objects from flight-hotel permutations
            }, function(err) {
                console.log("WHAT!?!?! -> "+err);
                throw new Error(err);
            }).then(function(hotels) {

                //console.log("ubered hotels ------------ " + hotels.length);
                //console.log(JSON.stringify(hotels));
                //console.log("------------");

                // build "trip" objects
                return _.map(hotels, function(hotel) {
                    var out = {
                        flight: flight,
                        hotel: hotel,
                        price: flight.price + parseFloat(hotel.total_price.amount) + hotel.uberPrice
                    };

                    // find the hotels ratings
                    out.hotel.rating = 0;
                    _.forEach(hotel.awards, function(award) {
                        if (isNaN(award.rating))
                        {
                            out.hotel.rating = _.max(out.hotel.rating, parseInt(award.rating));
                        }
                    });

                    //console.log("########  adding -> " + JSON.stringify(out));
                    return out;
                });
            }, function(err) {
                console.log("WHAT!?!?! -> "+err);
                throw new Error(err);
            });


            hotelPromise = hotelPromise.then(function(array) {
                // DONE!?!? why here!?!?!?
                console.log(" -- DONE -----------------------------------------------");
                return Promise.resolve(array);
            });

            return hotelPromise;
        });

        // add flights and hotels to make
        return Promise.all(promises);
    }, function(err) {
        console.log("WHAT!?!?! -> "+err);
        throw new Error(err);
    });

    promise = promise.then(function(trips) {
        trips = _.flatten(trips);
        console.log("TRIPS  ------------ ");
        console.log(JSON.stringify(trips));
        console.log("------------");
        res.json(trips);
    }, function(err) {
        console.log("WHAT!?!?! -> "+err);
        throw new Error(err);
    });
});

module.exports = router;
