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
router.put("/fixOne", (req, res) => {
  const { isAdmin, activityId, date, isFixed } = req.body
  if(!req.body || !activityId || !isFixed){
    res.json({ result: false, error: "Nothing to update" });
    return;
  }
  if(!isAdmin){
    res.json({ result: false, error: "Only admin can update" });
  }
    //the filter is req activityId
    const filter = { "activities._id": activityId};
    //$set allow to updating only some fields (here isFixed first beacause is always require)
    const update = { $set: { "activities.$.isFixed": isFixed } };
    //then, only if there is a date in req body, i add it to my update const
    if (date){
      update.$set["activities.$.date"] = new Date(date);
    }
    //I use the filter and the params defined before
    Trip.updateOne(filter, update)
    .then(data => {
      console.log('updatdata : ', JSON.stringify(data))
      if (data.modifiedCount > 0) {
//update is ok i want tu return the activity data to front
        Trip.findOne({ "activities._id": activityId})
        .then(trip => {
          const updatedActivity = trip.activities.find(activity => activity._id.equals(activityId))
          return res.json({ result: true, updatedActivity });
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
