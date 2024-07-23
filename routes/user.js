const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require("../models/user");
const crypto = require('crypto');
const Otp = require('../models/otp');
const sendOtpMail = require('../utils/mailer');
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

        res.json(user._doc);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.get("/api/user", async (req, res) => {
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


userRouter.post('/api/addUser', async (req, res) => {
    try {
        const { name, email, password, phoneNo, userId } = req.body;

        const mainUser = await User.findById(userId);
        if (!mainUser) {
            return res.status(404).json({ msg: "Main user not found!" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with same email already exists!" });
        }

        const hashedPassword = await bcryptjs.hash(password, 8);

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

        await User.findByIdAndUpdate(userId, { $push: { addedUsers: addedUser._id } });

        res.json(addedUser);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.get("/api/addUser", async (req, res) => {
    try {
        const addedBy = req.query.addedBy;
        const addedUsers = await User.find({ addedBy: addedBy });
        res.json(addedUsers);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

userRouter.delete('/api/deleteAddedUser/:userId', async (req, res) => {
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
