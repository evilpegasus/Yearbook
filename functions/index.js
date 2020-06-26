const functions = require('firebase-functions');
const os = require('os');
const path = require('path');
const fs = require('fs');

exports.combineImages = functions.storage.object().onFinalize(event => {
    
    // ignore delete events
    if (event.data.resourceState == 'not_exists') return false;

    const filePath = event.data.name;
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(filePath);

    const oldFile = fileDir + "/old.png"
});
