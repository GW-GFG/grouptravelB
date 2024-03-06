var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const { checkBody } = require('../modules/checkBody');

// "GET" all accomodations within a trip by body.id
router.post('/', (req, res) => {
    Trip.findById(req.body.id).populate('accomodations').then(data => {
        res.json({result: true, data: data.accomodations});
      });
});

// UPDATE to ADD a new accomodation in a trip
router.post('/new', (req, res) => {
    // checks fields
    if (!checkBody(req.body, ['name', 'date'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    // checks if name is already taken for this accomodation
    Trip.findOne({ accomodations: { $elemMatch: {name: {$regex: new RegExp(req.body.name, 'i')} } } }).then(data => {
        console.log('trying to find accomodation : ' + data);
        if (data !== null) {
            console.log('name taken soz');
            res.json({ result: false, error: 'Accomodation name already taken'})
        } else {
            console.log('name open yay');
            const newAccomodation = ({
                name: req.body.name,
                location: req.body.location,
                date: req.body.date,
                picture: req.body.picture,
                url: req.body.url,
                description: req.body.description,
                budget: req.body.budget,
                vote: [],
                isFixed: false,
            });
        
            Trip.updateOne({_id: req.body.tripId}, { $push: { accomodations: newAccomodation}}).then(data => {
                console.log('trip found');
                res.json({result: true, data: data});
              });
        }
    });
});


module.exports = router;