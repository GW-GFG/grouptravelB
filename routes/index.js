var express = require('express');
var router = express.Router();
//To get an unique name for each photos
const uniqid = require('uniqid');
//import cloudinary
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


router.post('/upload', async(req, res) => {
  // 'use server'
  console.log('envoieupload')
  
  const photoPath = `./tmp${uniqid()}.jpg`;
  const resultMove = await req.files.image.mv(photoPath);
//resultMove undefined mean that it worked correctly
  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    res.json({ result: true, url: resultCloudinary.secure_url });
  } else {
    res.json({ result: false, error: resultMove });
  };
  //To remove the tmp file
  fs.unlinkSync(photoPath);
});

module.exports = router;

