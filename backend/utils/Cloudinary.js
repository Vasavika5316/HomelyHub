const cloudinary = require('cloudinary').v2;
const path = require('path');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '../config.env')
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_KEY_SECRET
});

module.exports = cloudinary;
