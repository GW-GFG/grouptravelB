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


// router.post('/onetrip', (req, res) => {
//     Trip.findById(req.body.tripId)
//     .then(tripData => {
//         if(!tripData){
//             res.json({ result: false, error: 'No trip found' })
//         }
//         let budgetAcommodations = 0;
//         let budgetActivities = 0;
//         for (let accomodation of tripData.accomodations) {
//             if (accomodation.isFixed)
//             budgetAcommodations += accomodation.budget
//         }
        
//         for (let activity of tripData.activities) {
//             if (activity.isFixed)
//             budgetActivities += activity.budget
//         }

//         const totalBudget = budgetAcommodations+budgetActivities;

//         res.json({ result: true, tripData: tripData, tripBudget: totalBudget})
//       })
//     .catch(err => {
//         console.error(err);
//         res.json({ result: false, error: 'An error occurred' });
//     });      
// });

module.exports = router;