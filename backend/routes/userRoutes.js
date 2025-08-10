const express = require('express');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

// 🔐 User Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// 👤 User Profile Routes
router.get('/me', authController.protect, authController.getMe);
router.patch('/updateMe', authController.protect, authController.updateMe);
router.patch('/updateMyPassword', authController.protect, authController.updateMyPassword);

// 🏠 Property Routes
router.post('/newAccommodation', authController.protect, propertyController.createProperty);
router.get('/myAccommodation', authController.isLoggedIn, propertyController.getMyAccommodation);
router.get('/getUsersProperties', authController.protect, propertyController.getUsersProperties);

// 💳 Checkout Route
router.post('/checkout-session', authController.protect, bookingController.getCheckOutSession);

// 📅 Booking Routes
router.get('/booking', authController.protect, bookingController.getUserBookings);
router.get('/booking/:bookingId', authController.protect, bookingController.getBookingDetails);
// router.get('/booking/new', authController.protect, bookingController.createBookings);
router.post('/booking/new', authController.protect, bookingController.createBookings);

module.exports = router;
