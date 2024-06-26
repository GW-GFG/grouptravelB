var express = require('express');
var router = express.Router();
//To get an unique name for each photos
const uniqid = require('uniqid');
//import cloudinary
const cloudinary = require('cloudinary').v2;
const fs = require('fs');


router.post('/upload', async(req, res) => {
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

// router.post('/upload', async (req, res) => {
//   try {
//     if (req.files.image.size > 5000000) { // check if the file size is within the limit
//       return res.status(413).json({ result: false, error: 'File size is too large (5Mb max).' });
//     }
//     console.log('req.files.image', req.files.image)
//     console.log('req.files.image.data', req.files.image.data)
//     const result = await cloudinary.uploader.upload(req.files.image.path);
//     res.json({ result: true, url: result.secure_url });
//   } catch (error) {
//     console.log('Error:', error);
//     res.status(500).json({ result: false, error: 'An error occurred while uploading the file.' });
//   }
// });
// //
module.exports = router;

