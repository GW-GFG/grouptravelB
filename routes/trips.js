var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const User = require('../models/users')
const { checkBody } = require('../modules/checkBody');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//import module to create unique token
const uid2 = require('uid2');




router.post('/new', (req, res) => {
    // check if name, location & dates fields aren't empty
    if (!checkBody(req.body, ['name', 'location', 'departureDate', 'returnDate' ])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
    }
    
    // Transform req.body dates with new Date to compare
    const newDeparture = new Date(req.body.departureDate)
    const newReturn = new Date(req.body.returnDate)
    //check if dateDeparture > date now
    if(req.body.departureDate < new Date()){
        res.json({ result: false, error: 'Date of departure cant be before today' });
        return;  
    }
    //check if dateDeparture > dateReturn
    if(req.body.departureDate >= req.body.returnDate) {
        res.json({ result: false, error: 'Date of return must be after date of departure' });
        return;  
    }
    // check if a trip for the users is already exist on those dates
    User.findOne({ token: req.body.token })
        .populate('myTrips')
        .then(user => {
            // if myTrips no empty For each trips in user.myTrip check dates are ok
            for (let trip of user.myTrips) {
                const tripDeparture = new Date(trip.dates.departure);
                const tripReturn = new Date(trip.dates.return);
            // comparaison des dates
                if ((newDeparture >= tripDeparture && newDeparture <= tripReturn) ||
                    (newReturn >= tripDeparture && newReturn <= tripReturn)) {
                    res.json({ result: false, error: 'Trip conflicts with existing trip dates' });
                    return;
                }
            }
            // Declaration new trip for bdd
            const newTrip = new Trip({
                name: req.body.name,
                location: req.body.location,
                dates: {
                    departure: newDeparture,
                    return: newReturn
                },
                budget: 0,
                admin: user.id,
                members: [],
                activities: [],
                accommodations: [],
                chat: []
            });
            // save newtrip + Update myTrips with newTrip.id
            newTrip.save()
                .then(newDoc => {
                    res.json({ result: true, newTrip: newDoc });
                    return User.updateOne(
                        { token: req.body.token },
                        { $push: { myTrips: newTrip.id } }
                    );
                })
                .then(() => {
                    return User.findOne({ token: req.body.token })
                        .populate('myTrips');
                })
                .then(updatedUser => {
                    console.log(updatedUser.myTrips);
                })
                .catch(err => {
                    console.error(err);
                    res.json({ result: false, error: 'An error occurred' });
                });
        })
        .catch(err => {
            console.error(err);
            res.json({ result: false, error: 'An error occurred' });
        });
});

// Router get Data of one Trip
router.get('/data', (req, res) => {
    Trip.findOne({_id: req.body.tripId})
    .then(tripData => {
        if(!tripData){
            res.json({ result: false, error: 'No trip found' })
        }
        console.log(tripData);
        res.json({ result: true, tripData: tripData })
      })
    .catch(err => {
        console.error(err);
        res.json({ result: false, error: 'An error occurred' });
    });      
});

// Router get all dataTrip for a user
router.get('/alldata/:token', (req, res) => {
    User.findOne({token: req.params.token})
    .populate('myTrips')
    .then(userData => {
        // console.log(userData)
        if(userData.myTrips != null){
            res.json({ result: true, allTripData: userData.myTrips })
        } else {
            res.json({ result: false, error: 'No Trip declared for this user'})
        }
    })
});

// ROUTE ADD USER WITH THIS MAIL /
// fonction sendEmail
const sendEmail = async (to, htmlContent) => {
    try {
      const msg = {
        to,
        from: 'group.travel.lacapsule@gmail.com', 
        subject: 'Invitation à rejoindre un voyage',
        html: htmlContent,
      };
      await sgMail.send(msg);
      console.log('E-mail envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      throw new Error('Erreur lors de l\'envoi de l\'e-mail');
    }
  };

router.put('/adduser/:idTrip',(req, res) => {
    //use checkbody
    if (!checkBody(req.body, ['email'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
      }
      
    User.findOne({ email: { $regex: new RegExp(req.body.email, 'i') } }).then(data => {
        console.log('data findOne : ' + data)
        if (!data) {
    //create a new document user with @ et myTripId
            const newUser = new User({
                username: '',
                email: req.body.email,
                password: '',
                token: uid2(32),        
                userPicture: '',
                myTrips: [req.params.idTrip]
            });   
    //save the new user in the data base + update member with users member
            newUser.save()
                .then(userdata => {
                    res.json({ result: true, newUser: userdata });
                    return Trip.updateOne(
                        { _id : req.params.idTrip },
                        { $push: { members: newUser.id } }
                    )
                })
                .then(() => {
                    return Trip.findOne({ _id : req.params.idTrip })
                        .populate('members');
                })
                .then(updatedTrip => {
                    const htmlContent = `<p>Bienvenue sur notre plateforme ! Voici le lien pour rejoindre le voyage : http://localhost:3000/confirmation/${newUser.token}`;
                    sendEmail(req.body.email, htmlContent)
                    console.log(updatedTrip);

                })
                
                .catch(err => {
                    console.error(err);
                    res.json({ result: false, error: 'An error occurred' });
                });
                
                
        } else {
    // User already exists in database
            if(!data.myTrips.some((e) => e.id === req.params.idTrip)) {
                console.log(data.token)
                const htmlContent = `<p>Bienvenue sur notre plateforme ! Voici le lien pour rejoindre le voyage : http://localhost:3000/confirmation/${data.token}/${req.params.idTrip}/`;
                sendEmail(req.body.email, htmlContent)  
                res.json({ result: true, Msg: 'User already exists, mail was send' });
            } else {
                res.json({ result: false, Msg: 'User already exists & it\s already includes in trips' }); 
            }
        }
      });
})


module.exports = router;