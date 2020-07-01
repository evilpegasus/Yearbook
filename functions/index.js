'use strict';

// imports for combineImages
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

// imports for sendWelcomeEmail
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

// variables for sendYearbookCopyEmail
const db = admin.firestore();

// App name to include in the emails
const APP_NAME = 'Yearbook 2020';

exports.combineImages = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    
    // Exit if this is triggered on a file that is not an image
    if (!contentType.startsWith('image/')) {
        return console.log('This is not an image.');
    }

    // Get the file name and the old image
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    const oldFile = fileDir + "/old.png";
    const oldName = path.basename(oldFile);

    // Exit if the triggering image is old.png
    if (fileName.startsWith('old')) {
        return console.log('Already merged the image');
    }

    // Download file from bucket
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const tempOldPath = path.join(os.tmpdir(), oldName);
    const metadata = {
        contentType: contentType,
    };
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log('Image downloaded locally to', tempFilePath);
    await bucket.file(oldFile).download({destination: tempOldPath});
    console.log('Old image downloaded locally to', tempOldPath);

    // Merge the images using ImageMagick
    await spawn('composite', [tempFilePath, tempOldPath, tempOldPath]);
    console.log('Images merged at', tempOldPath);

    // Name the merged image 'old' and store it
    const newFileName = oldName;
    const newFilePath = path.join(path.dirname(filePath), newFileName);

    // Uploading the thumbnail
    await bucket.upload(tempOldPath, {
        destination: newFilePath,
        metadata: metadata,
    });

    // Once the image has been uploaded delete the local files to free up disk space
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempOldPath);

    // Delete the temporary overlay file
    bucket.file(filePath).delete().then(function() {
        // Deleted successfully
        console.log('Temp file deleted');
        return null;
    }).catch(function(error) {
        // An error occurred
        console.log(error);
    });

    return null;
});

exports.sendWelcomeEmail = functions.auth.user().onCreate((user) => {
    const email = user.email; // The email of the user
    const displayName = user.displayName; // The display name of the user
    const uid = user.uid; // The unique uid of the user

    return sendWelcomeEmail(email, displayName, uid);
});

// Sends a welcome email to the given user.
async function sendWelcomeEmail(email, displayName, uid) {
     const mailOptions = {
        from: APP_NAME + " <noreply@firebase.com>",
        to: email,
    };

    // Body of the email
    mailOptions.subject = 'Welcome to ' + APP_NAME + '!';
    mailOptions.text = "Hi " + displayName + "! \n\nWelcome to " + APP_NAME + ". We hope you will enjoy your yearbook. To share your yearbook with your friends, send them this link: \n\n https://yearbook-hhs.web.app/app.html?user=" + uid + "\n\nAnyone with your link can draw on your page. Only send it to people you trust. \n\nIf you have any questions or concerns, please email us at yearbook2020app@gmail.com. \n\n -The Yearbook 2020 Team";
    await mailTransport.sendMail(mailOptions);
    console.log('New welcome email sent to:', email);
    return null;
}

exports.exportYearbook = functions.https.onCall((data, context) => {    
    const name = context.auth.token.name;
    const email = context.auth.token.email;
    const url = data.url;

    sendYearbookCopyEmail(email, name, url);

    return {status: 'sent'};
});

// Sends a copy of the yearbook to the given user.
async function sendYearbookCopyEmail(email, displayName, url) {
    const mailOptions = {
        from: APP_NAME + " <noreply@firebase.com>",
        to: email,
    };

    // Body of the email
    mailOptions.subject = 'Your ' + APP_NAME + 'Download Link is Ready';
    mailOptions.text = "Hi " + displayName + "! \n\nHere is a download link to your yearbook from " + APP_NAME + ": \n\n" + url + "\n\nTo download your page follow these steps: \n 1. Open the download link in a browser \n 2. Right click the image that appears and select \"Save image as...\" \n 3. Select your download location and save the image to your computer \n\nIf you have any questions, please email us at yearbook2020app@gmail.com. \n\n -The Yearbook 2020 Team";
    
    await mailTransport.sendMail(mailOptions);
    console.log('Yearbook sent to: ', email);
    return null;
}
