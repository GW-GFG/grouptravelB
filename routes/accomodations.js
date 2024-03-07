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
            // Modifying dates from body
            const newDeparture = new Date(req.body.departureDate);
            const newReturn = new Date(req.body.returnDate);

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

// POST to vote for an accommodation
router.post('/vote', (req, res) => {

    // check if user already voted
    Trip.findOne({_id: req.body.tripId}).then(data => {

        const currentAccomodation = data.accomodations.find((accomodation) => accomodation.id === req.body.accomodationId);
        //singleVote.userId.toString() to convert the type "object" of objectId to string and compare it to req.body.userId that is a string
        const checkUserVote = currentAccomodation.vote.find((singleVote) => singleVote.userId.toString() === req.body.userId);

        //console.log('indexof ? ', currentAccomodation.indexOf(checkUserVote));


        if (checkUserVote) {
            // user has already voted

            // checking if he already voted the same vote
            if (checkUserVote.status.toString() === req.body.status) {
                // user has already voted the same vote
                res.json({result: false, error: 'Vous avez déjà fait ce vote'});
            } else {
                // user has already voted something different, changing his vote
                //res.json({result: true, todo: 'change vote maybe ?', data: checkUserVote});
                /*Trip.updateOne(
                    {_id: req.body.tripId, 'accomodations._id': req.body.accomodationId, 'vote._id': checkUserVote._id},
                    {'accomodations.$.vote': { $set: {'vote.$.status': req.body.status}}}).then(data => {
                    res.json({data: data});
                })*/
                console.log('cassé, code commenté pour le commit');
            }
        } else {
            // user hasn't voted yet, adding his vote
            const newVote = ({
                userId: req.body.userId,
                status: req.body.status
            });
        
            // add new vote to DB
            Trip.updateOne(
                {_id: req.body.tripId, 'accomodations._id': req.body.accomodationId}, 
                { $push: {'accomodations.$.vote': newVote}})
                .then(data => {
                    res.json({ result: true });
            });
        }
        
        
        //res.json({acco: currentAccomodation.vote, theVote: checkUserVote});



        /* OK, uncomment if user didnt vote yet 
        const newVote = ({
            userId: req.body.userId,
            status: req.body.status
        });
    
        Trip.updateOne(
            {_id: req.body.tripId, 'accomodations._id': req.body.accomodationId}, 
            { $push: {'accomodations.$.vote': newVote}})
            .then(data => {
                res.json({ result: true });
        });
        */
    });
});


module.exports = router;