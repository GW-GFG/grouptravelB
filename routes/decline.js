var express = require('express');
var router = express.Router();
require('../models/connexion');
const Trip = require('../models/trips');
const User = require('../models/users');

router.put('/invitatedUser/:tripId', async (req, res) => {
    // Recherche de l'utilisateur par le jeton
    User.findOne({ token: req.body.token })
        .then(userData => {
            if (!userData) {
                return res.json({ result: false, message: 'User not found' });
            }
            // Suppression de l'utilisateur du voyage
            return Trip.updateOne(
                { _id: req.params.tripId },
                { $pull: { members: userData._id } }
            ).then(tripUpdateResult => {
                console.log(tripUpdateResult)
                if (tripUpdateResult.modifiedCount > 0) {
                    // Suppression permanente de l'utilisateur
                    return User.deleteOne({ _id: userData._id })
                        .then(deleteUserResult => {
                            if (!deleteUserResult.deletedCount) {
                                return res.json({ result: false, message: 'Failed to delete user' });
                            }
                            // Envoi de la réponse si tout s'est bien passé
                            res.json({ result: true, message: 'User has been deleted' });
                        })
                        .catch(error => {
                            console.error('Error deleting user:', error);
                            res.json({ result: false, message: 'Internal server error' });
                        });
                } else {
                    return res.json({ result: false, message: 'Failed to remove user from trip' });
                }
            }).catch(error => {
                console.error('Error updating trip:', error);
                res.json({ result: false, message: 'Internal server error' });
            });
        }).catch(error => {
            console.error('Error finding user:', error);
            res.json({ result: false, message: 'Internal server error' });
        });
});

router.put('/invitation/:tripId', (req, res) => { 
    User.updateOne({token : req.body.token},
        { $pull: { myTrips: req.params.tripId } }
        )
        .then(userUpdateResult => {
            if (!userUpdateResult.modifiedCount > 0) {
                return res.json({ result: false, message: 'Failed to remove user from trip' });
            } 
            res.json({ result: true, message: 'Trip invitation has been declined' });
        })
})

module.exports = router;