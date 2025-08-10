const User = require('../Models/userModel');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv').config({
    path: path.join(__dirname, '../config.env')
});
const { promisify } = require('util');
const sendEmail = require('../utils/Email');
const crypto = require('crypto');
const cloudinary = require('../utils/Cloudinary');

// Helper function to sign JWT tokens
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Helper function to create and send tokens
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        user
    });
};

// Helper function to filter object properties
const filterObj = (obj, ...allowedFields) => {
    let newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

// Default avatar URL
const defaultAvatarUrl = 'https://t3.ftcdn.net/jpg/01/18/01/98/360_F_118019822_6CKXP6rXmVhDOzbXZlLqEM2ya4HhYzSV.jpg';

// User signup
exports.signup = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            avatar: {
                url: req.body.avatar || defaultAvatarUrl
            }
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new Error('Please provide email and password');
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            throw new Error('Incorrect email or password');
        }

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// User logout
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({
        status: 'success'
    });
};

// Protect routes - authentication middleware
exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
            token = req.cookies.jwt;
        }

        if (!token) {
            throw new Error('You are not logged in! Please log in to get access');
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            throw new Error('The user belonging to the token doesn\'t exist');
        }

        if (currentUser.changedPasswordAfter(decoded.iat)) {
            throw new Error('User recently changed the password, Please login again');
        }

        req.user = currentUser;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update user profile
exports.updateMe = async (req, res) => {
    try {
        const filteredBody = filterObj(req.body, 'name', 'email', 'phoneNumber', 'avatar');
        console.log(filteredBody);
        console.log(req.body.avatar);

        if (req.body.avatar !== undefined) {
            const result = await cloudinary.uploader.upload(req.body.avatar, {
                folder: 'avatars',
                width: 150,
                height: 150,
                crop: 'scale',
                responsive_breakpoints: {
                    create_derived: true,
                    bytes_step: 20000,
                    min_width: 200,
                    max_width: 200
                }
            });

            filteredBody.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            throw new Error('Your current password is wrong');
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        res.status(404).json({
            error: 'There is no user with this email'
        });
        return;
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:3000/user/resetPassword/${resetToken}`;

    const message = `<p>Forgot your password? Submit a PATCH request with your new password and passwordConfirm. Click the button to reset password page.: <a href="${resetURL}" style=" display: inline-block; margin:10px; padding:10px; background-color: rgb(65, 60, 60, 0.5); border-radius:5px; text-decoration:none; color:white; font-size:20px">Reset Password.</a><p>`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token valid for 10 mins',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token send to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            status: 'fail',
            message: 'There was an error sending the email. Try again later!'
        });
    }
};

// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Token is invalid or expired!');
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Update current user password
exports.updateMyPassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            throw new Error('Your current password is wrong');
        }

        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        createSendToken(user, 200, res);
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
};

// Check if user is logged in (middleware)
exports.isLoggedIn = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
            token = req.cookies.jwt;
        }

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            req.user = null;
            return next();
        }

        if (currentUser.changedPasswordAfter(decoded.iat)) {
            req.user = null;
            return next();
        }

        req.user = currentUser;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
