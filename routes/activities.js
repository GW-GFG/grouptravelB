var express = require("express");
var router = express.Router();
require("../models/connexion");
const Trip = require("../models/trips");
const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");

// POST an activity into a trip
router.post("/new", (req, res) => {
  const keysToCheck = ["name", "date"];
  // check that name and date fields are not empty
  if (!checkBody(req.body, keysToCheck)) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  // find the trip with his ID
  Trip.findById(req.body.tripId)
    .then((data) => {
      // if no trip is found, return error
      if (!data) {
        res.json({ result: false, error: "Voyage non trouvé" });
        return;
      }
      // check if date activity is inside trip date
      const departureDate = data.dates.departure;
      const returnDate = data.dates.return;
      const activityDate = new Date(req.body.date);
      console.log(departureDate, returnDate, activityDate);
      // check if activity is within trip's date or not
      if (activityDate > returnDate || activityDate < departureDate) {
        res.json({
          result: false,
          error:
            "Attention: la date de l'activité n'est pas incluse dans les dates du voyage !",
        });
        return;
      }
      const newActivity = {
        name: req.body.name,
        location: req.body.location,
        date: req.body.date,
        picture: req.body.picture,
        url: req.body.url,
        description: req.body.description,
        budget: req.body.budget,
        participation: [],
        isFixed: false,
      };

      data.activities.push(newActivity);
      data.save().then((newActivity) => {
        res.json({
          result: true,
          newActivity,
          message: "Activité ajoutée avec succès !",
        });
      });
    })
    .catch((error) => {
      console.error(error);
      res.json({ result: false, error: "Server error" });
    });
});

// POST to vote for an activity
router.post("/vote", (req, res) => {
  // get userId based on req.body.userToken to put userId in DB
  User.findOne({ token: req.body.userToken }).then((userData) => {
    // dbUserId = matching ID for req.body.userToken
    const dbUserId = userData._id.toString();

    // check if user already voted
    Trip.findOne({ _id: req.body.tripId }).then((data) => {
      const currentActivity = data.activities.find(
        (activity) => activity.id === req.body.activityId
      );
      //singleVote.userId.toString() to convert the type "object" of objectId to string and compare it to req.body.userId that is a string
      const checkUserVote = currentActivity.participation.find(
        (singleVote) => singleVote.userId.toString() === dbUserId
      );

      if (checkUserVote) {
        Trip.findOneAndUpdate(
          {
            _id: req.body.tripId,
            "activities._id": req.body.activityId,
            "activities.participation._id": checkUserVote.id,
          },
          {
            $set: {
              "activities.$[outer].participation.$[inner].status":
                req.body.status,
            },
          },
          {
            arrayFilters: [
              { "outer._id": req.body.activityId },
              { "inner._id": checkUserVote.id },
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
              res.json({ result: false, error: "Trip or activity or vote not found" });
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
          { _id: req.body.tripId, "activities._id": req.body.activityId },
          { $push: { "activities.$.participation": newVote } }
        ).then((data) => {
          res.json({
            result: true,
            message: "Vote ajouté",
            newStatus: req.body.status,
          });
        });
      }
    });
  });
});

module.exports = router;
