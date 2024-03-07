var express = require('express');
var router = express.Router();
require('../models/connexion');
require('../models/trips');
const User = require('../models/users');

router.get('/:token', (req, res) => {
    const token = req.params.token;
    User.findOne({token}).then(userData => {
        if (userData) {
            // Utilisateur trouvé  
            res.status(200).send('Confirmation réussie !')            
            // Renvoyer une réponse indiquant que la confirmation a réussi
            ;
        } else {
            // Aucun utilisateur trouvé
            // Renvoyer une réponse indiquant que le token est invalide
            res.status(404).send('Lien de confirmation invalide.');
        }
    })
    .catch(err => {
        // Une erreur s'est produite lors de la recherche ou de la mise à jour de l'utilisateur
        // Renvoyer une réponse d'erreur générique
        console.error(err);
        res.status(500).send('Une erreur est survenue lors de la confirmation.');
    });   
  });


module.exports = router;