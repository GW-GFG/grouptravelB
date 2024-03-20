var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips')
const User = require('../models/users');
const { checkBody } = require('../modules/checkBody');

router.post('/recuperation', (req, res) => { 
    Trip.findOne({ _id: req.body.idTrip })
    .then(tripData => {
        if (!tripData) {
            return res.json({ result: false, Msg: 'Trips does not exist' });
        } else { 
            res.json({ result: true, Msg: 'Chat trouvé !', chatData : tripData.chat })
         }
    })
})

router.put('/sendmsg', (req, res) => { 
    User.findOne({token : req.body.token})
    .then(userData => {
        if (!userData) {
            return res.json({ result: false, Msg: 'User does not exist' });
        } else {
            const author = userData.username
            const newMsg = {
                author,
                date: Date.now(),
                message : req.body.message
            }
            Trip.updateOne({ _id: req.body.idTrip },
                { $push: {chat: newMsg}})
                .then(() => {
                    // Récupération du voyage mis à jour
                    return Trip.findOne({ _id: req.body.idTrip })
                    // .populate('members');
                })
                .then(updatedTrip => {
                    // Réponse avec succès
                    res.json({ result: true, Msg: 'Trip\'s Chat updatded', chat: updatedTrip.chat });
                });
        } }) 
})



module.exports = router;