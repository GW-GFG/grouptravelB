// var express = require('express');
// var router = express.Router();
// //To get an unique name for each photos
// const uniqid = require('uniqid');
// //import cloudinary
// const cloudinary = require('cloudinary').v2;
// const fs = require('fs');


// router.post('/upload', async(req, res) => {
//   // 'use server'
//   console.log('envoieupload')
  
//   const photoPath = `./tmp${uniqid()}.jpg`;
//   const resultMove = await req.files.image.mv(photoPath);
// //resultMove undefined mean that it worked correctly
//   if (!resultMove) {
//     const resultCloudinary = await cloudinary.uploader.upload(photoPath);
//     res.json({ result: true, url: resultCloudinary.secure_url });
//   } else {
//     res.json({ result: false, error: resultMove });
//   };
//   //To remove the tmp file
//   fs.unlinkSync(photoPath);
// });

// module.exports = router;

const express = require('express');

const cloudinary = require('cloudinary').v2;

const uniqid = require('uniqid');

const fs = require('fs');

const router = express.Router();


// Configure Cloudinary

cloudinary.config({

  // Add your Cloudinary credentials here

});


router.post('/upload', (req, res) => {

  // We can use req.body.image instead of req.files.image

  const photoPath = `./tmp${uniqid()}.jpg`;


  if (req.method === 'POST') {

    // Set the options for upload

    const options = {

      resource_type: 'image',

      unique_filename: true,

      overwrite: true

    };


    req.pipe(

      cloudinary.uploader.upload_stream(options, (error, result) => {

        if (result) {

          res.status(200).json({ result: true, url: result.secure_url });

          // Remove the tmp file

          fs.unlinkSync(photoPath);

        } else if (error) {

          // Deal with errors

          fs.unlinkSync(photoPath);

          res.status(500).json({ error: error.message });

        }

      })

    );


    // To continue saving the file locally

    // Save the uploaded file

    req.pipe(fs.createWriteStream(photoPath));


  } else {

    // Handle unsupported HTTP methods

    res.set({ 'Content-Type': 'application/json' });

    res.status(405).json({ error: 'Method not supported' });

  }

});


module.exports = router;
