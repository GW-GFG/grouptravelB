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
    if (!checkBody(req.body, ['name', 'departureDate', 'returnDate'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }

    // checks if name is already taken for this accomodation
    Trip.findOne({ accomodations: { $elemMatch: {name: {$regex: new RegExp(req.body.name, 'i')} } } }).then(data => {
        if (data !== null) {
            res.json({ result: false, error: 'Le nom du logement existe déjà, il en faut un nouveau'})
        } else {
            // Checking if end date is after start date
            if(req.body.departureDate >= req.body.returnDate) {
                res.json({ result: false, error: 'La date de fin doit être antérieure à la date de début' });
                return;  
            }

            // Modifying dates from body to compare
            const newDeparture = new Date(req.body.departureDate);
            const newReturn = new Date(req.body.returnDate);

            // Checking if accommodation dates are within trip dates
            /*Uncomment when trip Dates are available from reducer
            const tripDeparture = new Date(req.body.tripDeparture);
            const tripReturn = new Date(req.body.tripReturn);
            if ((newDeparture < tripDeparture && newDeparture > tripReturn) ||
                    (newReturn > tripDeparture && newReturn < tripReturn)) {
                    res.json({ result: false, error: 'Trip conflicts with existing trip dates' });
                    return;
                }
            */

            // newAccomodation to be added to database
            const newAccomodation = ({
                name: req.body.name,
                location: req.body.location,
                dates: {
                    departure: newDeparture,
                    return: newReturn
                },
                picture: req.body.picture,
                url: req.body.url,
                description: req.body.description,
                budget: req.body.budget,
                vote: [],
                isFixed: false,
            });
        
            Trip.updateOne({_id: req.body.tripId}, { $push: { accomodations: newAccomodation}}).then(data => {
                res.json({result: true, data: data, message: 'Logement ajouté avec succès !'});
              });
        }
    });
});


module.exports = router;