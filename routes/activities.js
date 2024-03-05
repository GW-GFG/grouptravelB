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
    // check that all fields are not empty
    if (!checkBody(req.body, ['name', 'place', 'date', 'picture', 'url', 'description', 'budget'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
    // find the trip with his ID
    const tripId = ''
    Trip.findById(tripId, trip => {
        if (!trip) {
            res.json({ result: false, error: 'Trip not found' })
            return
        }
        
    })
    const { name, place, date, picture, url, description, budget } = req.body
})

module.exports = router;