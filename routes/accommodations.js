var express = require("express");
var router = express.Router();
require("../models/connexion");
const Trip = require("../models/trips");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

// "GET" all accommodations within a trip by body.id
// router.post('/', (req, res) => {
//     Trip.findById(req.body.id).populate('accommodations').then(data => {
//         res.json({result: true, data: data.accommodations});
//       });
// });

//ADD a new accommodation in a trip
router.post("/new", (req, res) => {
  // checks fields
  if (!checkBody(req.body, ["name", "departureDate", "returnDate"])) {
    res.json({
      result: false,
      error: "Pense à choisir un nom, et des dates pour ta proposition !",
    });
    return;
  }

  // checks if name is already taken for this accommodation
  Trip.findOne({
    accommodations: {
      $elemMatch: { name: { $regex: new RegExp(req.body.name, "i") } },
    },
  }).then((data) => {
    if (data !== null) {
      res.json({
        result: false,
        error: "Le nom du logement existe déjà, il en faut un nouveau",
      });
    } else {
      // Modifying dates from body
      const newDeparture = new Date(req.body.departureDate);
      const newReturn = new Date(req.body.returnDate);

      // newAccommodation to be added to database
      const newAccommodation = {
        name: req.body.name,
        location: {
          name: req.body.location.name,
          lat: req.body.location.lat,
          lng: req.body.location.lng,
        },
        dates: {
          departure: newDeparture,
          return: newReturn,
        },
        photos: req.body.photos,
        url: req.body.url,
        description: req.body.description,
        budget: req.body.budget,
        vote: [],
        isFixed: false,
      };

      Trip.updateOne(
        { _id: req.body.tripId },
        { $push: { accommodations: newAccommodation } }
      ).then((data) => {
        Trip.findOne({
          accommodations: {
            $elemMatch: { name: { $regex: new RegExp(req.body.name, "i") } },
          },
        }).then((data) => {
          res.json({
            result: true,
            newAccommodation: data,
            message: "Logement ajouté avec succès !",
          });
        });
      });
    }
  });
});

// POST to vote for an accommodation
router.post("/vote", (req, res) => {
  console.log("reqbody " + req.body);
  // get userId based on req.body.userToken to put userId in DB
  User.findOne({ token: req.body.userToken }).then((userData) => {
    // dbUserId = matching ID for req.body.userToken
    const dbUserId = userData._id.toString();

    // check if user already voted in this trip
    Trip.findOne({ _id: req.body.tripId }).then((data) => {
      const currentAccommodation = data.accommodations.find(
        (accommodation) => accommodation.id === req.body.accommodationId
      );
      const checkUserVote = currentAccommodation.vote.find(
        (singleVote) => singleVote.userId.toString() === dbUserId
      );

      if (checkUserVote) {
        Trip.findOneAndUpdate(
          {
            _id: req.body.tripId,
            "accommodations._id": req.body.accommodationId,
            "accommodations.vote._id": checkUserVote.id,
          },
          {
            $set: {
              "accommodations.$[accommodation].vote.$[thisVote].status":
                req.body.status,
            },
          },
          {
            arrayFilters: [
              { "accommodation._id": req.body.accommodationId },
              { "thisVote._id": checkUserVote.id },
            ],
            new: true,
          }
        )
          .then((updatedTrip) => {
            if (updatedTrip) {
              res.json({
                result: true,
                message: "Vote changé",
                newStatus: req.body.status,
              });
            } else {
              res.json({ result: false, error: "Trip or accommodation or vote not found" });
            }
          })
          .catch((error) => {
            console.error(error);
            res.json({ result: false, error: "Server error" });
          });
      } else {
        // user hasn't voted yet, adding his vote
        const newVote = {
          userId: dbUserId,
          status: req.body.status,
          userToken: req.body.userToken,
        };

        // add new vote to DB
        Trip.updateOne(
          {
            _id: req.body.tripId,
            "accommodations._id": req.body.accommodationId,
          },
          { $push: { "accommodations.$.vote": newVote } }
        ).then((data) => {
          res.json({
            result: true,
            message: "Vote ajouté",
            newStatus: req.body.status,
          });
        })
        .catch((error) => {
            console.error(error);
            res.json({ result: false, error: "Server error" });
        });
      }
    });
  });
});

//update trip with form fields date, isFixed
router.put("/fixOne", (req, res) => {
  console.log("route", req.body);
  const { isAdmin, accommodationId, dates, isFixed } = req.body;
  console.log(JSON.stringify(req.body));
  if (!isAdmin) {
    res.json({ result: false, error: "Only admin can update" });
  }

  //the filter is req accommodationId
  const filter = { "accommodations._id": accommodationId };
  //$set allow to updating only some fields (here isFixed first beacause is always require)
  const update = { $set: { "accommodations.$.isFixed": isFixed } };
  //then, only if there is a dates in req body, i add it to my update const
  if (dates) {
    update.$set["accommodations.$.date.departure"] = new Date(dates.departure);
    update.$set["accommodations.$.date.return"] = new Date(dates.return);
  }

  //I use the filter and the params defined before
  Trip.updateOne(filter, update)
    .then((data) => {
      if (data.modifiedCount > 0) {
        //update is ok i want tu return the accommodation data to front

        Trip.findOne({ "accommodations._id": accommodationId }).then((trip) => {
          const updatedAccommodation = trip.accommodations.find(
            (accommodation) => accommodation._id.equals(accommodationId)
          );
          return res.json({ result: true, updatedAccommodation });
        });
      } else {
        return res.json({ result: false, error: "Not found or not updated" });
      }
    })
    .catch((error) => {
      console.error("Error updating trip:", error);
      return res.json({ result: false, error: "An error occured" });
    });
});

module.exports = router;
