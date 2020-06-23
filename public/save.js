function upload() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var imageJSON = JSON.stringify(imageData);

    // Create a root reference
    var storageRef = firebase.storage().ref();
    
    imageJSON.toBlob(function(blob){
        var uploadTask = storageRef.child('test').put(blob);

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
            console.log('Upload is paused');
            break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
            console.log('Upload is running');
            break;
        }
        }, function(error) {
            console.log("Failed to upload image to the server.");
            console.log(error);
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
            case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;

            case 'storage/canceled':
                // User canceled the upload
                break;

            case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
        }
        }, function() {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        console.log('File available at', downloadURL);
        window.alert("Upload successful");
        });
        });
    });
};
function getImage() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // Create a reference with an initial file path and name
    var storage = firebase.storage();
    var pathReference = storage.ref('test');

    // Get the download URL
    pathReference.getDownloadURL().then(function(url) {

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = function(event) {
            var blob = xhr.response;

            // Draw the png file onto the canvas
            var drawing = JSON.parse(blob);
            // drawing.setAttribute('crossOrigin', 'use-credentials');
            // drawing.src = url; // can also be a remote URL e.g. http://
            // var timestamp = new Date().getTime();
            drawing.onload = function() {
            ctx.drawImage(drawing,0,0);
            };
            console.log("Image from server drawn onto canvas. URL = ", url);
        };
        xhr.open('GET', url);
        xhr.send();
    }).catch(function(error) {
        console.log("Failed to get image from the server.");
        console.log(error);

        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        switch (error.code) {
        case 'storage/object-not-found':
            // File doesn't exist
            break;
    
        case 'storage/unauthorized':
            // User doesn't have permission to access the object
            break;
    
        case 'storage/canceled':
            // User canceled the upload
            break;
    
        case 'storage/unknown':
            // Unknown error occurred, inspect the server response
            break;
        }
    });
}