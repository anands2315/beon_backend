const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require("../models/user");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Otp = require('../models/otp');
const { sendOtpMail, sendResetPasswordMail } = require('../utils/mailer');
const auth = require('../middleware/auth');
const userRouter = express.Router();

userRouter.post('/api/signUp', async (req, res) => {
    try {
        const { name, email, password, phoneNo, package, userType = 'main' } = req.body;

        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord || !otpRecord.otpVerified) {
            return res.status(400).json({ msg: "Email not verified. Please verify your email before signing up." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with the same email already exists!" });
        }

        const hashedPassword = await bcryptjs.hash(password, 8);

        const packageNumber = parseInt(package, 10);

        const verified = (packageNumber === 4 || userType === 'admin');

        let user = new User({
            email,
            password: hashedPassword,
            name,
            phoneNo,
            package: packageNumber,
            date: new Date().getTime(),
            userType,
            verified
        });

        user = await user.save();

        await Otp.deleteOne({ email });

        res.json(user);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/sendOtp', async (req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with the same email already exists!" });
        }

        const existingOtp = await Otp.findOne({ email });
        if (existingOtp) {
            return res.status(200).json({ msg: "Verification in progress. Please check your email for OTP." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        let otpRecord = new Otp({
            email,
            otp,
            otpExpires,
            otpVerified: false
        });

        await otpRecord.save();
        sendOtpMail(email, otp);

        res.json({ msg: "OTP sent to your email. Please verify to complete the sign-up." });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/verifyOtp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord || otpRecord.otp !== otp || otpRecord.otpExpires < Date.now()) {
            return res.status(400).json({ msg: "Invalid or expired OTP." });
        }

        otpRecord.otpVerified = true;
        await otpRecord.save();

        res.json({ msg: "Email verified successfully." });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


userRouter.post('/api/resendOtp', async (req, res) => {
    try {
        const { email } = req.body;
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ msg: "User not found. Please sign up first." });
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        otpRecord.otp = otp;
        otpRecord.otpExpires = otpExpires;

        await otpRecord.save();
        sendOtpMail(email, otp);

        res.json({ msg: "OTP resent successfully. Please check your email." });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "User with this email does not exist!" });
        }

        const isMatch = await bcryptjs.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Incorrect password." });
        }

        const token = jwt.sign({ id: user._id }, "passwordKey");

        res.json({ token, ...user._doc });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/forgetPassword', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "User with this email does not exist!" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpires;

        await user.save();

        // const resetUrl = `http://${req.headers.host}/api/resetPassword/${resetToken}`;
        // sendResetPasswordMail(email, resetUrl);

        // const resetUrl = `https://beonbusiness.netlify.app/resetPassword/${resetToken}`;
        // sendResetPasswordMail(email, resetUrl);

        // const resetUrl = `https://businessbeon.netlify.app/resetPassword/${resetToken}`;
        // sendResetPasswordMail(email, resetUrl);

        const resetUrl = `https://beonbusiness.com/resetPassword/${resetToken}`;
        sendResetPasswordMail(email, resetUrl);


        res.json({ msg: "Password reset token sent to your email." });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.post('/api/resetPassword/:resetToken', async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { newPassword } = req.body;
        console.log(newPassword);

        const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ msg: "Invalid or expired reset token." });
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 8);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ msg: "Password reset successfully." });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.get("/api/user",  async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.put('/api/updateUser/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNo, package, verified, blacklisted } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ msg: "User not found!" });
        }

        // Update fields only if they are provided
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phoneNo !== undefined) user.phoneNo = phoneNo;
        if (package !== undefined) user.package = package;
        if (verified !== undefined) user.verified = verified; // Set verified field
        if (blacklisted !== undefined) user.blacklisted = blacklisted;

        await user.save();

        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



userRouter.delete("/api/deleteUser/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ msg: "User not found!" });
        }
        res.json({ msg: "User deleted successfully!" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


userRouter.post('/api/addUser', auth,async (req, res) => {
    try {
        const { name, email, password, phoneNo, userId } = req.body;

        // Check if OTP is verified
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord || !otpRecord.otpVerified) {
            return res.status(400).json({ msg: "Email not verified. Please verify your email before adding a user." });
        }

        // Find the main user
        const mainUser = await User.findById(userId);
        if (!mainUser) {
            return res.status(404).json({ msg: "Main user not found!" });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with the same email already exists!" });
        }

        // Hash the password
        const hashedPassword = await bcryptjs.hash(password, 8);

        // Create the added user
        let addedUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNo,
            package: mainUser.package,
            addedBy: userId,
            userType: 'added'
        });

        addedUser = await addedUser.save();

        // Update the main user with the added user's ID
        await User.findByIdAndUpdate(userId, { $push: { addedUsers: addedUser._id } });

        // Delete the OTP record after verification
        await Otp.deleteOne({ email });

        res.json(addedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


userRouter.get("/api/addUser", auth,async (req, res) => {
    try {
        const addedBy = req.query.addedBy;
        const addedUsers = await User.find({ addedBy: addedBy });
        res.json(addedUsers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.delete('/api/deleteAddedUser/:userId', auth,async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: mainUserId } = req.body;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ msg: "User not found!" });
        }

        await User.findByIdAndUpdate(mainUserId, { $pull: { addedUsers: userId } });

        res.json({ msg: "User deleted successfully!" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



module.exports = userRouter;
