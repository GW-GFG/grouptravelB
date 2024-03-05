var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody');

router.post('/new', (req, res) => {
    // check if name, location & dates fields aren't empty
    if (!checkBody(req.body, ['name', 'location', 'departureDate', 'returnDate' ])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    //check if dateDeparture > dateReturn
    // Transform req.body dates with new Date to compare
    const newDeparture = new Date(req.body.departureDate)
    const newReturn = new Date(req.body.returnDate)
    
    if(req.body.departureDate >= req.body.returnDate) {
        res.json({ result: false, error: 'Date of return must be after date of departure' });
        return;  
    }
    // check if a trip for the users is already exist on those dates
    User.findOne({ token: req.body.token })
        .populate('myTrips')
        .then(user => {
            // if myTrips no empty For each trips in user.myTrip check dates are ok
            for (let trip of user.myTrips) {
                const tripDeparture = new Date(trip.dates.departure);
                const tripReturn = new Date(trip.dates.return);
            // comparaison des dates
                if ((newDeparture >= tripDeparture && newDeparture <= tripReturn) ||
                    (newReturn >= tripDeparture && newReturn <= tripReturn)) {
                    res.json({ result: false, error: 'Trip conflicts with existing trip dates' });
                    return;
                }
            }
            // Declaration new trip for bdd
            const newTrip = new Trip({
                name: req.body.name,
                location: req.body.location,
                dates: {
                    departure: newDeparture,
                    return: newReturn
                },
                budget: 0,
                admin: user.id,
                members: [],
                activities: [],
                accommodations: [],
                chat: []
            });
            // save newtrip + Update myTrips with newTrip.id
            newTrip.save()
                .then(newDoc => {
                    res.json({ result: true, newTrip: newDoc });
                    return User.updateOne(
                        { token: req.body.token },
                        { $push: { myTrips: newTrip.id } }
                    );
                })
                .then(() => {
                    return User.findOne({ token: req.body.token })
                        .populate('myTrips');
                })
                .then(updatedUser => {
                    console.log(updatedUser.myTrips);
                })
                .catch(err => {
                    console.error(err);
                    res.json({ result: false, error: 'An error occurred' });
                });
        })
        .catch(err => {
            console.error(err);
            res.json({ result: false, error: 'An error occurred' });
        });
});



module.exports = router;