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

    // Delete the temporary overlay file
    bucket.file(filePath).delete().then(function() {
        // Deleted successfully
        console.log('Temp file deleted');
        return null;
    }).catch(function(error) {
        // An error occurred
        console.log(error);
    });

    // Once the image has been uploaded delete the locals file to free up disk space
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempOldPath);
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
    mailOptions.text = "Hi " + displayName + "! \nWelcome to " + APP_NAME + ". We hope you will enjoy your yearbook. To share your yearbook with your friends, send them this link: \n\n https://yearbook-hhs.web.app/app.html?user=" + uid + "\n\nAnyone with your link can draw on your page. Only send it to people you trust. \n\nIf you have any questions or concerns, please email us at yearbook2020app@gmail.com. \n\n -The Yearbook Team";
    await mailTransport.sendMail(mailOptions);
    console.log('New welcome email sent to:', email);
    return null;
}

exports.exportYearbook = functions.storage.object().onFinalize(async (object) => {    
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // Exit if file is an image
    if (contentType.startsWith('image/')) {
        return console.log('This is an image.');
    }

    // const uid = path.basename(filePath, path.extname(filePath));
    const uid = path.parse(filePath).name;
    const fileDir = path.dirname(filePath);
    const oldFile = fileDir + "/old.png";
    const oldName = path.basename(oldFile);

    // Download file from bucket
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), oldName);
    const tempPdfPath = path.join(os.tmpdir(), "old.pdf");
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log('Image downloaded locally to', tempFilePath);

    // Merge the images using ImageMagick
    await spawn('convert', [tempFilePath, tempPdfPath]);
    console.log('Image converted to PDF at', tempPdfPath);

    // delete the request file
    bucket.file(filePath).delete().then(function() {
        // Deleted successfully
        console.log('Request file deleted');
    }).catch(function(error) {
        // An error occurred
        console.log(error);
    });

    db.collection("users").doc(uid).get().then(function(doc) {
        const displayName = doc.get('displayName');
        const email = doc.get('email');
        return sendYearbookCopyEmail(email, displayName, tempFilePath, tempPdfPath);
    });
});

// Sends a copy of the yearbook to the given user.
async function sendYearbookCopyEmail(email, displayName, pngPath, pdfPath) {
     const mailOptions = {
        from: APP_NAME + " <noreply@firebase.com>",
        to: email,
        attachments: [{
            filename: 'yearbook.png',
            content: fs.createReadStream(pngPath)
        }, {
            filename: 'yearbook.pdf',
            content: fs.createReadStream(pdfPath)
        }]
    };

    // Body of the email
    mailOptions.subject = 'Your yearbook from ' + APP_NAME;
    mailOptions.text = "Hi " + displayName + "\n! Attached is your yearbook from " + APP_NAME + ". We hope you will enjoy it. If you have any questions or concerns, please email us at yearbook2020app@gmail.com. \n\n -The Yearbook Team";
    await mailTransport.sendMail(mailOptions);
    console.log('Yearbook sent to: ', email);
    
    // Delete temporary files once email is sent
    fs.unlinkSync(pngPath);
    fs.unlinkSync(pdfPath);
    return null;
}