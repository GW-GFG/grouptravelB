var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

// "GET" all accomodations within a trip by body.id
router.post('/', (req, res) => {
    Trip.findById(req.body.id).populate('accomodations').then(data => {
        res.json({result: true, data: data.accomodations});
      });
});

//ADD a new accomodation in a trip
router.post('/new', (req, res) => {
    // checks fields
    if (!checkBody(req.body, ['name', 'departureDate', 'returnDate'])) {
        res.json({ result: false, error: 'Pense à choisir un nom, et des dates pour ta proposition !' });
        return;
    }
    
    // checks if name is already taken for this accomodation
    Trip.findOne({ accomodations: { $elemMatch: {name: {$regex: new RegExp(req.body.name, 'i')} } } })
    .then(data => {
        if (data !== null) {
            res.json({ result: false, error: 'Le nom du logement existe déjà, il en faut un nouveau'})
        } else {
            // Modifying dates from body
            const newDeparture = new Date(req.body.departureDate);
            const newReturn = new Date(req.body.returnDate);


            // newAccomodation to be added to database
            const newAccomodation = ({
                name: req.body.name,
                location: {
                    name: req.body.location.name,
                    lat: req.body.location.lat,
                    lng: req.body.location.lng,
                },
                dates: {
                    departure: newDeparture,
                    return: newReturn
                },
                photos: req.body.photos,
                url: req.body.url,
                description: req.body.description,
                budget: req.body.budget,
                vote: [],
                isFixed: false,
            });
        
            Trip.updateOne({_id: req.body.tripId}, { $push: { accomodations: newAccomodation}}).then(data => {
                // Kevin: à priori pas besoin de "data" ?
                // Antoine : rajout de la fonction pour update champs budget du trip
                if (req.body.budget > 0) {
                Trip.updateOne({_id: req.body.tripId}, { $inc: { budget: req.body.budget}}).then(data => {
                });
                }
                Trip.findOne({ accomodations: { $elemMatch: {name: {$regex: new RegExp(req.body.name, 'i')} } } })
                .then(data => {
                    res.json({result: true, newAccomodation: data, message: 'Logement ajouté avec succès !'});
                });
            });
        }
    });
});

// POST to vote for an accommodation
router.post('/vote', (req, res) => {
    console.log('reqbody ' + req.body)
    // get userId based on req.body.userToken to put userId in DB
    User.findOne({token: req.body.userToken}).then(userData => {
        // dbUserId = matching ID for req.body.userToken
        const dbUserId = userData._id.toString();

        // check if user already voted in this trip
        Trip.findOne({_id: req.body.tripId}).then(data => {

            const currentAccomodation = data.accomodations.find((accomodation) => accomodation.id === req.body.accomodationId);
            const checkUserVote = currentAccomodation.vote.find((singleVote) => singleVote.userId.toString() === dbUserId);

            if (checkUserVote) {
                // user has already voted

                // checking if he already voted the same vote
                if (checkUserVote.status.toString() === req.body.status) {
                    // user has already voted the same vote

                    // deleting precedent user vote
                    Trip.findOneAndUpdate(
                        { 
                            _id: req.body.tripId, 
                            'accomodations._id': req.body.accomodationId
                        },
                        { 
                            $pull: { 'accomodations.$[outer].vote': { _id: checkUserVote.id } }
                        },
                        { 
                            arrayFilters: [{ 'outer._id': req.body.accomodationId }], 
                            new: true 
                        }
                    )
                    .then(updatedTrip => {
                        if (updatedTrip) {
                            res.json({result: true, message: 'Vote annulé', newStatus: null});
                        } else {
                            res.status(404).json({result: false, error: 'Trip or accommodation not found' });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: 'Server error' });
                    });
                } else {
                    // user has already voted something different, changing his vote status
                    Trip.findOneAndUpdate(
                        { 
                            _id: req.body.tripId, 
                            'accomodations._id': req.body.accomodationId,
                            'accomodations.vote._id': checkUserVote.id
                        },
                        { 
                            $set: { 'accomodations.$[outer].vote.$[inner].status': req.body.status } 
                        },
                        { 
                            arrayFilters: [{ 'outer._id': req.body.accomodationId }, { 'inner._id': checkUserVote.id}], 
                            new: true 
                        }
                    )
                    .then(updatedTrip => {
                        if (updatedTrip) {
                            res.json({ result: true, message: "Vote changé", newStatus: req.body.status});
                        } else {
                            res.status(404).json({ error: 'Trip or accommodation or vote not found' });
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        res.status(500).json({ error: 'Server error' });
                    });
                    
                }
            } else {
                // user hasn't voted yet, adding his vote
                const newVote = ({
                    userId: dbUserId,
                    status: req.body.status,
                    userToken: req.body.userToken
                });
            
                // add new vote to DB
                Trip.updateOne(
                    {_id: req.body.tripId, 'accomodations._id': req.body.accomodationId}, 
                    { $push: {'accomodations.$.vote': newVote}})
                    .then(data => {
                        res.json({ result: true, message: "Vote ajouté", newStatus: req.body.status});
                });
            }
        });
    });
});

//update trip with form fields date, isFixed
router.put("/fixOne", (req, res) => {
    const { isAdmin, accommodationId, dates, isFixed } = req.body
    if(!req.body || !accommodationId || !isFixed){
      res.json({ result: false, error: "Nothing to update" });
      return;
    }
    if(!isAdmin){
      res.json({ result: false, error: "Only admin can update" });
    }
      //the filter is req accommodationId
      const filter = { "accomodations._id": accommodationId};
      //$set allow to updating only some fields (here isFixed first beacause is always require)
      const update = { $set: { "accomodations.$.isFixed": isFixed } };
      //then, only if there is a dates in req body, i add it to my update const
      if (dates){
        update.$set["accomodations.$.date.departure"] = new Date(dates.departure);
        update.$set["accomodations.$.date.return"] = new Date(dates.return);
      }
      //I use the filter and the params defined before
      Trip.updateOne(filter, update)
      .then(data => {
        if (data.modifiedCount > 0) {
  //update is ok i want tu return the accommodation data to front
          Trip.findOne({ "accomodations._id": accommodationId})
          .then(trip => {
            const updatedAccommodation = trip.accomodations.find(accommodation => accommodation._id.equals(accommodationId))
            return res.json({ result: true, updatedAccommodation });
          })
        } else {
          return res.json({ result: false, error: "Not found or not updated" });
        }
      })
      .catch (error => {
        console.error("Error updating trip:", error);
        return res.json({ result: false, error: "An error occured" });
      })  
    });


module.exports = router;