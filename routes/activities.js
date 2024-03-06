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
            // if no trip is found
            if (!data) {
                res.json({ result: false, error: 'Trip not found' })
                return
            }
            // if a trip is found, create a new activity
            const { name, date, url, description, budget } = req.body
            // TODO : check if date activity is inside trip date
            const departureDate = data.dates.departure
            const returnDate = data.dates.return
            
            const newActivity = { name, date, url, description, budget }
            // TODO : empty fields : default value ? into model?
            data.activities.push(newActivity)
            data.save()
                .then(newDoc => {
                    res.json({result: true, newActivity: newDoc})
                })
        })
})

module.exports = router;