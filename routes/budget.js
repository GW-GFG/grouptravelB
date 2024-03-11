var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const User = require('../models/users');

router.post('/:tripId', (req, res) => {
    Trip.findOne({_id: req.params.tripId})
    .then(tripData => {
        if(!tripData){
            res.json({ result: false, error: 'No trip found' })
        }
        console.log(tripData);
        res.json({ result: true, budget: tripData.budget })
      })
    .catch(err => {
        console.error(err);
        res.json({ result: false, error: 'An error occurred' });
    });
})


module.exports = router;