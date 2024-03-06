var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips')
const { checkBody } = require('../modules/checkBody')

// GET all activities within a trip
router.get('/', (req, res) => {
})

// POST an activity into a trip
router.post('/new', (req, res) => {
    const keysToCheck = ['name', 'date', 'url', 'description', 'budget']
    // check that all fields are not empty
    if (!checkBody(req.body, keysToCheck)) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    // find the trip with his ID
    Trip.findById(req.body.tripId)
        .then(data => {
            // if no trip is found, return error
            if (!data) {
                res.json({ result: false, error: 'Trip not found' })
                return
            }
            console.log('trip :', data)
            const { name, date, url, description, budget } = req.body
            // TODO : check if date activity is inside trip date
            const departureDate = new Date(data.dates.departure)
            const returnDate = new Date(data.dates.return)
            const activityDate = new Date(date)
            console.log(departureDate, returnDate, activityDate)
            if (activityDate >= departureDate && activityDate <= returnDate) {
                // if a trip is found and it is wihin trip's date, create a new activity
            const newActivity = { name, date, url, description, budget }
            // TODO : empty fields : default value ? into model?
            data.activities.push(newActivity)
            data.save()
                .then(newDoc => {
                    res.json({result: true, newActivity: newDoc})
                })
            } else {
                res.json({ result: false, error: "Activity date is not included within trip's date" })
            }
        })
})

module.exports = router;