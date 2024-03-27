const cloudinary = require('cloudinary').v2;

const apiRoute = '/upload';

module.exports = (req, res) => {
  // We can use req.body.image instead of req.files.image
  const photoPath = `./tmp${uniqid()}.jpg`;

  if (req.method === 'POST') {
    // Configure Cloudinary
    cloudinary.config({
      // Add your Cloudinary credentials here
    });

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
}