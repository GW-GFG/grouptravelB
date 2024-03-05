//import express
var express = require('express');
var router = express.Router();
//import data base connexion and DB's Users collection 
require('../models/connexion');
const User = require('../models/users');
require('../models/trips');
//import function to check field
const { checkBody } = require('../modules/checkBody');
//Import password encryption module
const bcrypt = require('bcrypt');
//import module to create unique token
const uid2 = require('uid2');



/* GET users listing. */
router.get('/', (req, res) => {
  User.find().then(data => {
   res.json({result: true, data: data});
 });
});

//SignUp to register a new user POST method
router.post('/signup', (req, res) => {
//Verify that the fields are correctly filled.
  if (!checkBody(req.body, ['username', 'password', 'email'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

// Check if the user has not already been registered (with case insensitive)
  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
    console.log('data findOne : ' + data)
    if (data === null) {
//Hash the password
      const hash = bcrypt.hashSync(req.body.password, 10);
      const token = uid2(32)
//create a new document
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: uid2(32),        
        userPicture: '',
        myTrips: []
      });
//save the new document in the data base
      newUser.save().then(userdata => {
        res.json({ result: true, token: userdata.token, username: userdata.username, myTrips: userdata.myTrips, userPicture: userdata.userPicture, email: userdata.email });
      });
    } else {
// User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
});

//Signin POST method
router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    console.log(req.body)
    return;
  }

  User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
//use bcrypt again to verify that the password is correct
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      console.log("password ok, data : " + data)
//populate only if there is at least one trip in myTrips array to prevent an error
        if (data.myTrips.length > 0) {
          return User.populate(data, { path: 'myTrips' });
        } else {
          return data;
        }
      
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  })
  .then(userdata => {
    console.log('userdata : ' + userdata)
    //userdata includes myTrips populate
    if(userdata){
    res.json({ result: true, token: userdata.token, username: userdata.username, myTrips: userdata.myTrips, userPicture: userdata.userPicture, email: userdata.email})
    }
  })
  .catch(error => {
    res.json({ result: false, error: error.message})
  })
});





module.exports = router;
