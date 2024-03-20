//import express
var express = require("express");
var router = express.Router();
//import data base connexion and DB's Users collection
require("../models/connexion");
const User = require("../models/users");
const Trip = require("../models/trips");
require("../models/trips");
//import function to check field
const { checkBody } = require("../modules/checkBody");
//Import password encryption module
const bcrypt = require("bcrypt");
//import module to create unique token
const uid2 = require("uid2");

// /* GET users listing. */
// router.get("/", (req, res) => {
//   User.find().then((data) => {
//     res.json({ result: true, data: data });
//   });
// });

//Get if current user is admin on currentTrip
router.post("/isAdmin", (req, res) => {
  if (!checkBody(req.body, ["token", "currentTripId"])) {
    res.json({ result: false, error: "Token ou currentTrip manquant" });
    return;
  }
  
  const { token, currentTripId } = req.body;

  User.findOne({ token: token })
    .then((userData) => {
      if (!userData) {
        return res.json({ result: false, error: "Utilisateur non trouvé" });
      }
      Trip.findById(currentTripId).then((currentTripData) => {
        if (!currentTripData) {
          res.json({ result: false, error: "Voyage non trouvé" });
        }
        const isAdmin =
          userData._id.toString() === currentTripData.admin.toString();
        res.json({ result: true, isAdmin: isAdmin });
      });
    })
    .catch((error) => {
      console.error("Erreur :", error);
      return res.json({ result: false, error: "Une erreur est survenue" });
    });
});

/* POST ("GET") user by token */
router.post("/getUser", (req, res) => {
  User.findOne({ token: req.body.token })
    .populate("myTrips")
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          token: data.token,
          username: data.username,
          myTrips: data.myTrips,
          userPicture: data.userPicture,
          email: data.email,
        });
      } else {
        res.json({ result: false, message: "Utilisateur non trouvé" });
      }
    });
});

//update user's profile picture
router.put("/updateOne", (req, res) => {
  if (!req.body.token || !req.body.profilPicture) {
    return res.json({ result: false, message: "Données manquantes" });
  }

  User.updateOne(
    { token: req.body.token },
    { userPicture: req.body.profilPicture }
  )
    .then(() => {
      return User.findOne({ token: req.body.token }).select("-password -_id");
    })
    //userData contains all data exept _id and password (handled by .select())
    .then((userData) => {
      if (userData) {
        res.json({ result: true });
      } else {
        res.json({ result: false, message: "Utilisateur non trouvé" });
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
      res.json({
        result: false,
        message:
          "Une erreur s'est produite lors de la mise à jour de l'utilisateur",
      });
    });
});

// /* POST ("DELETE") user by token (no use yet)*/
// router.delete("/deleteUser/:token", (req, res) => {
//   User.findOne({ token: req.params.token }).then((data) => {
//     if (data) {
//       User.deleteOne({ token: req.params.token }).then((data) => {
//         res.json({
//           result: true,
//           message: "L'utilisateur a bien été supprimé de la base de données",
//         });
//       });
//     } else {
//       res.json({ result: false, message: "Utilisateur non trouvé" });
//     }
//   });
// });

//SignUp to register a new user POST method
router.post("/signup", (req, res) => {
  //Verify that the fields are correctly filled.
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  // Check if the user has not already been registered (with case insensitive)
  User.findOne({ email: { $regex: new RegExp(req.body.email, "i") } }).then(
    (data) => {
      if (data === null) {
        //Hash the password
        const hash = bcrypt.hashSync(req.body.password, 10);
        const token = uid2(32);
        //create a new document
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: hash,
          token: uid2(32),
          userPicture: "/avatar.png",
          myTrips: [],
        });
        //save the new document in the data base
        newUser.save().then((userdata) => {
          res.json({
            result: true,
            token: userdata.token,
            username: userdata.username,
            myTrips: userdata.myTrips,
            userPicture: userdata.userPicture,
            email: userdata.email,
          });
        });
      } else {
        // User already exists in database
        res.json({ result: false, error: "User already exists" });
      }
    }
  );
});

//Signin POST method
router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ email: { $regex: new RegExp(req.body.email, "i") } })
    .then((data) => {
      //use bcrypt again to verify that the password is correct
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        //populate only if there is at least one trip in myTrips array to prevent an error
        if (data.myTrips.length > 0) {
          return User.populate(data, { path: "myTrips" });
        } else {
          return data;
        }
      } else {
        res.json({ result: false, error: "User not found or wrong password" });
      }
    })
    .then((userdata) => {
      //userdata includes myTrips populate
      if (userdata) {
        res.json({
          result: true,
          token: userdata.token,
          username: userdata.username,
          myTrips: userdata.myTrips,
          userPicture: userdata.userPicture,
          email: userdata.email,
        });
      }
    })
    .catch((error) => {
      res.json({ result: false, error: error.message });
    });
});


// route to update a newUser by invit
router.put("/updatenewuser", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }
  //hash password
  const hash = bcrypt.hashSync(req.body.password, 10);
  //modification token déjà existant
  const token = uid2(32);
  User.updateOne(
    { email: { $regex: new RegExp(req.body.email, "i") } },
    { $set: { username: req.body.username, password: hash, token: token } }
  )
    .then((data) => {
      // Si la mise à jour a réussi, renvoyer l'utilisateur mis à jour
      if (data.modifiedCount > 0) {
        return User.findOne({ email: req.body.email }); // Rechercher l'utilisateur mis à jour
      } else {
        res.json({ result: false, error: "no modification" });
      }
    })
    .then((updatedUser) => {
      res.json({ result: true, updatedUser: updatedUser });
    })
    .catch((err) => {
      console.error(err);
      res.json({ result: false, error: "An error occurred" });
    });
});

//get members
router.post("/getonetripallusername", (req, res) => {
  Trip.findOne({ _id: req.body.tripId })
    .populate("admin")
    .populate("members")
    .then((userData) => {
      const adminUsername = userData.admin.username;
      const allNameOftrip = [adminUsername];
      if (userData.members.length > 0) {
        const membersUsername = [];
        for (let member of userData.members) {
          allNameOftrip.push(member.username);
        }
      }
      res.json({ result: true, usernameData: allNameOftrip });
    });
});

module.exports = router;
