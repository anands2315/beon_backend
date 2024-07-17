const express = require('express');
const bcryptjs = require('bcryptjs');
const User = require("../models/user");
const userRouter = express.Router();

userRouter.post('/api/signUp', async (req, res) => {
    try {
        const { name, email, password, phoneNo, package, userType = 'main' } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: "User with the same email already exists!" });
        }

        const hashedpassword = await bcryptjs.hash(password, 8);

        const packageNumber = parseInt(package, 10);

        // Set verified to true if package is 4 or user type is admin
        const verified = (packageNumber === 4 || userType === 'admin');

        let user = new User({
            email,
            password: hashedpassword,
            name,
            phoneNo,
            package: packageNumber,
            date: new Date().getTime(),
            userType,
            verified // add the verified field here
        });
        user = await user.save();
        res.json(user);

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
