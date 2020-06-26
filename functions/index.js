'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');

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

    // Exit if the image is already a thumbnail
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
    filePath.delete().then(function() {
        // Deleted successfully
        console.log('Temp file deleted');
    }).catch(function(error) {
        // An error occurred
        console.log(error);
    });

    // Once the thumbnail has been uploaded delete the local file to free up disk space
    return fs.unlinkSync(tempFilePath);
});
