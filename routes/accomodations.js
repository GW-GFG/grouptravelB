var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const { checkBody } = require('../modules/checkBody');

// GET all accomodations within a trip
router.get('/:id', (req, res) => {
    Trip.findById(req.params.id).populate('accomodations').then(data => {
        res.json({result: true, data: data.accomodations});
      });
});

// UPDATE to ADD a new accomodation in a trip
router.post('/:id/new', (req, res) => {
    // checks fields
    if (!checkBody(req.body, ['name', 'location', 'date' ])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    const newAccomodation = ({
        name: req.body.name,
        location: req.body.location,
        date: req.body.date
    });

    Trip.updateOne({_id : req.params.id}, { $push: { accomodations: newAccomodation}}).then(data => {
        res.json({result: true, data: data});
      });
});


module.exports = router;