const nodemailer = require('nodemailer');

// let testAccount = nodemailer.createTestAccount();

// const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     auth: {
//         user: "micaela.jones19@ethereal.email",
//         pass: "HXGewrzK3bWfGhmKa8",
//     }
// });

// const sendOtpMail = (email, otp) => {
//     const mailOptions = {
//         from: '"Anand Singh" <micaela.jones19@ethereal.email>',
//         to: email,
//         subject: 'OTP Verification',
//         text: `Your OTP for verification is ${otp}`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             return console.log(error);
//         }
//         console.log('Email sent: ' + info.response);
//     });
// };

//// Replace this with your app-specific password
const appPassword = 'eysr wezr hjia unkc';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anandksingh098@gmail.com',
        pass: appPassword
    }
});

const sendOtpMail = (email, otp) => {
    const mailOptions = {
        from: 'anandksingh098@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP for verification is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });
};

module.exports = sendOtpMail;