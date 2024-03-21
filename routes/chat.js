var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips')
const User = require('../models/users');

router.post('/get', (req, res) => { 
    Trip.findOne({ _id: req.body.idTrip })
    .then(tripData => {
        if (!tripData) {
            return res.json({ result: false, message: 'Trip does not exist' });
        } else { 
            res.json({ result: true, message: 'Chat trouvé !', chatData : tripData.chat })
         }
    })
})

router.put('/send', (req, res) => { 
    User.findOne({token : req.body.token})
    .then(userData => {
        if (!userData) {
            return res.json({ result: false, message: 'User does not exist' });
        } else {
            const author = userData.username
            const newmessage = {
                author,
                date: Date.now(),
                message : req.body.message
            }
            Trip.updateOne({ _id: req.body.idTrip },
                { $push: {chat: newmessage}})
                .then(() => {
                    // Récupération du voyage mis à jour
                    return Trip.findOne({ _id: req.body.idTrip })
                    // .populate('members');
                })
                .then(updatedTrip => {
                    // Réponse avec succès
                    res.json({ result: true, message: 'Trip\'s Chat updatded', chat: updatedTrip.chat });
                })
                .catch(error => {
                    console.error('error add message : ', error);
                    res.json({ result: false, message: 'Internal server error' });
                });
        } 
    })
    .catch(error => {
        console.error('error add message : ', error);
        res.json({ result: false, message: 'Internal server error' });
    }); 
});



module.exports = router;