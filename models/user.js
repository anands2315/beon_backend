const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true,
        validate: {
            validator: (value) => {
                const re = /^\d{10}$/;
                return re.test(value);
            },
            message: "Please enter a valid 10-digit phone number",
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: (value) => {
                const re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return value.match(re);
            },
            message: "Please Enter a Valid Email Address",
        }
    },
    package: {
        type: Number,
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    addedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userType: {
        type: String,
        enum: ['main', 'added', 'admin'],
        default: 'main'
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
});

const User = mongoose.model("User", userSchema);
module.exports = User;
