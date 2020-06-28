// check if user is signed in
var currentUser;
var serveID;

firebase.auth().onAuthStateChanged(function(user) {
    // check for params in URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    serveID = urlParams.get('user');
    var newUser = urlParams.get('newUser');

    if (user) {
        // User is signed in.
        currentUser = firebase.auth().currentUser;
        console.log("displayName: " + currentUser.displayName); // TODO get rid of these console prints
        console.log("email: " + currentUser.email);
        console.log("uid: " + currentUser.uid);
        console.log('https://yearbook-hhs.web.app/app.html?user=' + currentUser.uid); // unique URL for user <======================= USE THIS TO SEND TO FRIENDS
    } else {
        // No user is signed in. Kick them out to login screen preserving any URL params
        if (serveID) {
            window.location.replace('https://yearbook-hhs.web.app/index.html?user=' + serveID);
        } else {
            window.location.replace('https://yearbook-hhs.web.app/index.html');
        }
    }

    // handle params in URL
    if (!serveID || serveID == currentUser.uid) {
        // Viewing own page
        serveID = currentUser.uid;
        document.getElementById('owner').innerHTML = "You are viewing your own yearbook. Share this link to let your friends sign it:";
        document.getElementById('sharingLink').innerHTML = "<a href='https://yearbook-hhs.web.app/app.html?user=" + currentUser.uid + "'>https://yearbook-hhs.web.app/app.html?user=" + currentUser.uid + "</a>";
        // get the image from storage and draw it onto the canvas if user is not new
        if (!newUser) {
            getImage(false);
        } else {
            // Create a white background if serveID/old.png does not exist yet
            var storageRef = firebase.storage().ref();
            const canvas = document.querySelector("#canvas");
            const ctx = canvas.getContext("2d");
            storageRef.child(serveID + "/old.png").getDownloadURL().then(function() {
                // old.png already exists
            }, function() {
                // old.png does not exist, draw a white background
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            })
        }
    } else {
        document.getElementById('owner').innerHTML = "You are viewing someone else's yearbook. Sign away!";
        document.getElementById('sharingLink').innerHTML = " Return to your own page: <a href='https://yearbook-hhs.web.app/app.html'>https://yearbook-hhs.web.app/app.html</a>";
        document.getElementById('downloadButton').remove();
        // get the image from storage and draw it onto the canvas
        getImage(false);
    }
});

function upload(alert = true) {
    try {
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");

        // Create a root reference
        var storageRef = firebase.storage().ref();
        
        canvas.toBlob(function(blob){

            var uploadTask;
            // Create old.png if first time uploading, otherwise write to temp.png
            storageRef.child(serveID + "/old.png").getDownloadURL().then(function() {
                // old.png already exists, write to temp.png
                uploadTask = storageRef.child(serveID + '/temp.png').put(blob);
            }, function() {
                // old.png does not exist, create it
                uploadTask = storageRef.child(serveID + '/old.png').put(blob);
            }).then(function() {
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
                        
                        // Move canvas contents to background image so they can't be cleared
                        getImage(false);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        if (alert) {
                            window.alert("Upload successful");
                        }
                    });
                });
            });
        });
    } catch(error) {
        window.alert("Something went wrong while uploading your image:\n" + error.message);
        console.log(error);
    }
};

function getImage(alert = true) {
    try {
        const canvas = document.querySelector("#canvas");
        const backgroundImage = document.querySelector("#backgroundImage");
    
        // Create a reference with an initial file path and name
        var storage = firebase.storage();
        var pathReference = storage.ref(serveID + '/old.png');
    
        // Get the download URL
        pathReference.getDownloadURL().then(function(url) {
    
            // Draw the png file onto the canvas
            var drawing = new Image();
            drawing.src = url;
            drawing.onload = function() {
                backgroundImage.src = url; // can also be a remote URL e.g. http://
                canvas.style.backgroundColor = "transparent";
                backgroundImage.style.display = "inline-block";
                if (alert) {
                    window.alert("Image retrieved successfully");
                }
                console.log("Image from server drawn onto canvas. URL = ", url);
            }
        }).catch(function(error) {
            console.log("Failed to get image from the server.");
            console.log(error);
            window.alert("Something went wrong while getting your image:\n" + error.message);
    
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
    } catch(error) {
        window.alert("Something went wrong while getting your image:\n" + error.message);
        console.log(error);
    }
}

function download() {
    var storage = firebase.storage();
    var pathReference = storage.ref(currentUser.uid + '/old.png');

    pathReference.getDownloadURL().then(function(url) {
        var link = document.createElement("a");
        link.setAttribute("download", "yearbook.png");
        link.setAttribute("target", "_blank");
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        delete link;
    });
}

function resetYearbook() {
    // Confirm yearbook should be reset
    if (!confirm("Are you sure you want to reset your yearbook? This action cannot be undone.")) {
        return;
    }

    // Reset yearbook
    var storageRef = firebase.storage().ref();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    const backgroundImage = document.querySelector("#backgroundImage");
    
    // Delete image in storage
    var imageRef = storageRef.child(serveID + '/old.png');
    imageRef.delete().then(function() {
        console.log("Yearbook deleted successfully");
    }).catch(function(error) {
        console.log(error);
    });

    // Clear client image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    backgroundImage.src = "//:0";
    canvas.style.backgroundColor = "white";
}