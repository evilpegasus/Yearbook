// check if user is signed in
var currentUser;
var serveID;

// set firestore information
const dbRef = firebase.firestore().collection("users");
var docRef;

firebase.auth().onAuthStateChanged(function(user) {
    // check for params in URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    serveID = urlParams.get('user');
    var newUser = urlParams.get('newUser');

    if (user) {
        // User is signed in.
        currentUser = firebase.auth().currentUser;
        docRef = dbRef.doc(currentUser.uid);

        // If new user, add their info to Cloud Firestore database
        if (newUser) {
            docRef.set({
                displayName: currentUser.displayName,
                email: currentUser.email,
                theme: themeSelector.options[themeSelector.selectedIndex].value,
                userID: currentUser.uid,
                pfpURL: ""
            }).then(function() {
                console.log("Document successfully written");
            }).catch(function(error) {
                console.log("Error adding document " + error);
            });
        }
    } else {
        // No user is signed in. Kick them out to login screen preserving any URL params
        if (serveID) {
            window.location.replace('https://yearbook-hhs.web.app/index.html?user=' + serveID);
        } else {
            window.location.replace('https://yearbook-hhs.web.app/index.html');
        }
    }

    // get the database entry for currentUser theme to set the website theme
    docRef.get().then(function(doc) {
        if (doc.exists) {
            // Change the theme to user's preferred theme
            var preferredTheme = doc.get('theme');
            changeTheme(preferredTheme);

            // Update the menu theme selector
            document.querySelector('#themeSelector [value="' + preferredTheme + '"]').selected = true;
        } else {
            console.log("No such document exists.");
        }
    }).catch(function(error) {
        console.log("Error getting document: " + error);
    });

    // handle params in URL
    if (!serveID || serveID == currentUser.uid) {
        // Viewing own page
        serveID = currentUser.uid;
        document.getElementById('owner').innerHTML = "You are viewing your own yearbook.";
    } else {
        // Get the name of the yearbook's owner
        dbRef.doc(serveID).get().then(function(doc) {
            if (doc.exists) {
                var name = doc.get('displayName');
                console.log("Name retrieved successfully.");
                document.querySelector('#owner').innerHTML = "You are viewing " + name + "'s yearbook. Sign away!";
            }
            console.log("No such document exists.");
        }).catch(function(error) {
            console.log("Error retrieving document: " + error);
        });
        document.querySelector('#owner').innerHTML = "You are viewing someone else's yearbook. Sign away!";
        document.querySelector('#downloadButton').remove();
        document.querySelector('#toolbars').style.width = "600px";
    }

    // get the image from storage and draw it onto the canvas if user's old.png exists
    var storageRef = firebase.storage().ref();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    storageRef.child(serveID + "/old.png").getDownloadURL().then(function() {
        // old.png already exists
        getImage(false);
    }, function() {
        // old.png does not exist, draw a white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
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
                        
                        // Move canvas contents to background image so they can't be cleared and get image after half a second to allow for image merge
                        setTimeout(getImage(false), 500);
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
    
    /*
    // Create a reference with an initial file path and name
    var storageRef = firebase.storage().ref();
    var uploadTask = storageRef.child(serveID + '/' + serveID).putString(serveID).then(function() {
        window.alert("A copy of your yearbook will be emailed to you soon!");
    }).catch(function(error) {
        window.alert('An error occurred, please try again later.');
    });
    */
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