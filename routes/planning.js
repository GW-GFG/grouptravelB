var express = require("express");
var router = express.Router();
require("../models/connexion");
const Trip = require("../models/trips");

//Fixed activities
router.post("/areFixed", (req, res) => {
  const { userToken, currentTripId } = req.body;
  if (!userToken || !currentTripId) {
    return res.json({ result: false, error: "Token ou id Trip manquant" });
  }
  Trip.findById(currentTripId)
    .then((trip) => {
      if (!trip) {
        return res.json({
          result: false,
          error: "Le tripId ne correspond pas",
        });
      }
      //poupulate only if isFixed to extract username
      return Trip.populate(trip, {
        path: "activities",
        match: { isFixed: true },
        populate: {
          path: "participation.userId",
          select: "-_id username",
        },
      });
    })
    .then((populatedTrip) => {
      const fixedActivities = populatedTrip.activities.filter(
        (activity) => activity.isFixed
      );
      res.json({ result: true, data: fixedActivities });
    })
    .catch((data) => {
      res.json({ result: false, error: data.message });
    });
});


//Not fixed activities
router.post("/areNotFixed", (req, res) => {
  console.log('back rebody', JSON.stringify(req.body))
  const { userToken, currentTripId } = req.body;
  if (!userToken || !currentTripId) {
    return res.json({ result: false, error: "Token ou id Trip manquant" });
  }
  Trip.findById(currentTripId)
    .then((trip) => {
      if (!trip) {
        return res.json({
          result: false,
          error: "Le tripId ne correspond pas",
        });
      }

      return Trip.populate(trip, {
        path: "activities",
        match: { isFixed: false },
        populate: {
          path: "participation.userId",
          select: "-_id username",
        },
      });
    })
    .then((populatedTrip) => {
      const notFixedActivities = populatedTrip.activities.filter(
        (activity) => !activity.isFixed
      );
      res.json({ result: true, data: notFixedActivities });
    })

    .catch((data) => {
      res.json({ result: false, error: data.message });
    });
});

//update trip with form fields date, isFixed
router.put("/fixOne", (req, res) => {});

module.exports = router;
