const nodemailer = require('nodemailer');

// Replace this with your app-specific password
const appPassword = 'eysr wezr hjia unkc';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anandksingh098@gmail.com',
        pass: appPassword
    }
});

const sendOtpMail = (email, otp) => {
    const receiver = {
        from: 'anandksingh098@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is ${otp}`
    };

    transporter.sendMail(receiver, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

const sendResetPasswordMail = (email, resetUrl) => {
    const receiver = {
        from: 'anandksingh098@gmail.com',
        to: email,
        subject: 'Reset Password',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Please click on the following link, or paste this into your browser to complete the process:\n\n
               ${resetUrl}\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(receiver, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Reset password email sent: ' + info.response);
    });
};

module.exports = {
    sendOtpMail,
    sendResetPasswordMail
};
