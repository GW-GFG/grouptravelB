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
                res.json({ result: false, error: 'Voyage non trouvé' })
                return
            }
            console.log('trip :', data)
            // check if date activity is inside trip date
            const departureDate = data.dates.departure
            const returnDate = data.dates.return
            const activityDate = new Date(req.body.date)
            console.log(departureDate, returnDate, activityDate)
            // check if activity is within trip's date or not
            if (activityDate > returnDate || activityDate < departureDate) {
                res.json({ result: false, error: "Attention: la date de l'activité n'est pas incluse dans les dates du voyage !" })
                return
            }
            const newActivity = ({
                name: req.body.name,
                place: req.body.place,
                date: req.body.date,
                picture: req.body.picture,
                url: req.body.url,
                description: req.body.description,
                budget: req.body.budget,
                vote: [],
                isFixed: false,
            })
            Trip.updateOne({_id: req.body.tripId}, { $push: { activities: newActivity}}).then(data => {
                res.json({result: true, data: data, message: 'Activité ajoutée avec succès !'});
              })
        })
})

module.exports = router;