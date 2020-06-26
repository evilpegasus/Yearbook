'use strict';

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

// App name to include in the emails
const APP_NAME = 'Yearbook 2020';

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    const email = user.email; // The email of the user
    const displayName = user.displayName; // The display name of the user
    const uid = user.uid; // The unique uid of the user

    return sendWelcomeEmail(email, displayName, uid);
});

// Sends a welcome email to the given user.
async function sendWelcomeEmail(email, displayName, uid) {
     const mailOptions = {
        from: '${APP_NAME} <noreply@firebase.com>',
        to: email,
    };

    // Body of the email
    mailOptions.subject = 'Welcome to ${APP_NAME}!';
    mailOptions.text = "Hey ${displayName || ''}! Welcome to ${APP_NAME}. We hope you will enjoy your yearbook. To share your yearbook with your friends, send them this link: https://yearbook-hhs.web.app/app.html?user=${uid} \n\n If you have any question or issues, please email us at yearbook2020app@gmail.com. \n\n -The Yearbook Team";
    await mailTransport.sendMail(mailOptions);
    console.log('New welcome email sent to:', email);
    return null;
}