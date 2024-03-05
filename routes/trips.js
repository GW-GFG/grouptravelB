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
    if(req.body.departureDate > req.body.returnDate) {
        res.json({ result: false, error: 'Date of return must be after date of departure' });
        return;  
    }
    // check if a trip for the users is already exist on those dates
    User.findOne({ token : '7Az44VwjhOvapTcIHhyQH_IwYk04BDQG' })
        // user.token  
         .populate('myTrips')
         .then(data => {
            console.log(data)
            console.log(data.id)
            // if(data.myTrips.lenght > 0) {
            // populate('myTrips')
            // }
            // check if departureDate or returnDate not includes in a existing trip Or if no Trip
            if (!data.myTrips.some(e => {
                return req.body.departureDate >= e.departureDate && req.body.returnDate <= e.returnDate;
            }) || data === null ) {
                const newTrip = new Trip({
                    name : req.body.name,
                    location : req.body.location,
                    dates : {
                        departure: req.body.departureDate,
                        return: req.body.returnDate},
                    budget : 0,
                    admin :  data.id, 
                    members : [],
                    activities : [],    
                    accomodations :[], 
                    chat : []
                })
                newTrip.save().then(newDoc => {
                    res.json({ result: true, newTrip: newDoc })
                });
                User.updateOne(
                    { token: '7Az44VwjhOvapTcIHhyQH_IwYk04BDQG' }, { $push: {myTrips: newTrip.id}}
                   ).then(() => {
                    User.findOne({ token: '7Az44VwjhOvapTcIHhyQH_IwYk04BDQG' }).then(data => {
                      console.log(data);
                    });
                   });    
            } else {
            // Trips for user is thoses dates already exists in database
            res.json({ result: false, error: 'Trip was already declared for those dates' });
            }
    })
});


module.exports = router;