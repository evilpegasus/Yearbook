// check if user is signed in or in demo or anonymous mode
var currentUser;
var serveID;
var newUser;
var demo = false;
var anon;

const onAppPage = (window.location.pathname == '/app.html');

// set firestore information
const dbRef = firebase.firestore().collection("users");
var docRef;

// set up cloud functions for download
var functions = firebase.functions();

firebase.auth().onAuthStateChanged(function(user) {
    // If user signed in anonymously, this function is already executing and we can exit
    if (user && user.isAnonymous) {
        return;
    }

    // check for params in URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    serveID = urlParams.get('user');
    newUser = urlParams.get('newUser');
    demo = (serveID == 'demo');
    anon = urlParams.get('anon');

    newUserPopupClosed = !onAppPage || !(demo || anon || newUser);
    
    // User is considered signed in if they signed in to the website, are using the demo, in anonymous mode with a serveID provided, or visiting FAQ or About pages
    if (!user && !demo && !(anon && serveID) && onAppPage) {
        // No user is signed in, kick them out to login screen preserving any URL params
        if (serveID) {
            window.location.replace('https://yearbook-hhs.web.app/index.html?user=' + serveID);
        } else {
            window.location.replace('https://yearbook-hhs.web.app/index.html');
        }
    }

    if (user) {
        // User is signed in
        currentUser = firebase.auth().currentUser;
        docRef = dbRef.doc(currentUser.uid);
    }

    // If user is signed in and new, add their info to Cloud Firestore database
    if (user && newUser) {
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

    if (demo || anon || newUser) {
        // show new user popup
        openPopup('#welcomePopup', 'fit-content', '68%');
        var popup = document.querySelector("#welcomePopup");
        popup.style.padding = '2%';
        var welcomeText = document.querySelectorAll(".welcomeText");
        welcomeText.forEach(function(welcomeText) {
            welcomeText.style.display = 'block';
        });
        document.querySelector('#closePopup').style.display = 'block';
    }

    if (user) {
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
    }

    if (onAppPage) {
        // handle params in URL
        if (currentUser && (!serveID || serveID == currentUser.uid)) {
            // Viewing own page
            serveID = currentUser.uid;
            document.querySelector('#owner').innerHTML = "You are viewing your own yearbook.";
        } else {
            document.querySelector('#owner').innerHTML = "You are viewing someone else's yearbook. Sign away!";
            document.title = "Someone Else's Yearbook | Yearbook 2020";
            document.querySelector('#downloadButton').disabled = true;

            function getOwnerName() {
                dbRef.doc(serveID).get().then(function(doc) {
                    if (doc.exists) {
                        let name = doc.get('displayName');
                        console.log("Name retrieved successfully.");
                        document.querySelector('#owner').innerHTML = "You are viewing <strong>" + name + "</strong>'s yearbook. Sign away!";
                        document.title = name + "'s Yearbook | Yearbook 2020";
                    } else {
                        console.log("No such document exists.");
                    }
                }).catch(function(error) {
                    console.log("Error retrieving document: " + error);
                });
            }

            if (!demo) {
                // Sign in anonymously if in anonymous mode to get access to database
                if (anon) {
                    firebase.auth().signInAnonymously().then(function() {
                        getOwnerName();
                    }).catch(function(error) {
                        console.log(error);
                    });
                } else {
                    getOwnerName();                
                }
            } else {
                document.querySelector('#owner').innerHTML = "You are viewing a <strong>demo</strong> yearbook. Sign away!";
                document.title = "Demo Yearbook | Yearbook 2020";
            }
        }
    }

    // Disable some menu buttons in demo (if not signed in) and anonymous modes and on FAQ and About pages if not signed in
    if ((demo && !user) || anon || (!onAppPage && !user)) {
        document.querySelector('#goToYourYearbookButton').disabled = true;
        document.querySelector('#yourYearbookLink').href = '#';
        document.querySelector('#shareButton').disabled = true;
        document.querySelector('#signOutButton').innerHTML = 'Create Account';
        document.querySelector('#signOutButton').onclick = function() { window.location.assign('https://yearbook-hhs.web.app/?createAccount=true') }
    }

    // Disable the go to another yearbook button on demo mode if not signed in
    if (demo && !user) {
        document.querySelector('#goToAnotherYearbookButton').disabled = true;
    }

    if (onAppPage) {
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
    }
});

function upload(alert = true) {
    // alert = false only used in new user initial upload

    openWorkingPopup();

    try {
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");

        // Create a root reference
        var storageRef = firebase.storage().ref();
        
        canvas.toBlob(function(blob){

            var uploadTask;
            // if new user set serveID to current uid to prevent yearbook clearing
            if (!alert && currentUser) {
                serveID = currentUser.uid;
            }
            
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
                    // Close the working popup
                    closeWorkingPopup();

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
                        
                        if (alert) {
                            // Move canvas contents to background image so they can't be cleared and get image after five seconds to allow for image merge
                            setTimeout(assertTempDeleted(), 5000);
                        } else {
                            // Close the working popup
                            closeWorkingPopup();

                            // Draw the image and clear the canvas
                            getImage(false, false);
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            undo = [];
                            redo = [];

                            let redoButton = document.querySelector('#redo');
                            let undoButton = document.querySelector('#undo');
                            undoButton.setAttribute('data-link-disabled', 'true');
                            redoButton.setAttribute('data-link-disabled', 'true');
                        }
                    });
                });
            });
        });
    } catch(error) {
        // Close the working popup
        closeWorkingPopup();

        openMessagePopup("Something went wrong while uploading your image. Please try again later.");
        console.log(error);
    }
};

function assertTempDeleted() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    var pathRef = firebase.storage().ref(serveID + '/temp.png');
    pathRef.getDownloadURL().then(function(url) {
        // If temp still exists, wait one second and run the function again
        setTimeout(assertTempDeleted(), 1000);
    }).catch(function(error) {
        // If temp doesn't exist, the cloud function has finished executing and we can draw the image on the canvas

        // Close the working popup
        closeWorkingPopup();

        // Draw the image and clear the canvas
        getImage(false, true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        undo = [];
        redo = [];

        let redoButton = document.querySelector('#redo');
        let undoButton = document.querySelector('#undo');
        undoButton.setAttribute('data-link-disabled', 'true');
        redoButton.setAttribute('data-link-disabled', 'true');

        // remove unsaved changes exit confirmation
        if (exitListenerAdded) {
            window.removeEventListener('beforeunload', confirmPageExit);
            exitListenerAdded = false;
        }
    });
}

function getImage(alert = true, uploadAlert = false) {
    // show working popup
    openWorkingPopup();

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
                console.log("Image from server drawn onto canvas. URL = ", url);

                // Close the working popup
                closeWorkingPopup();

                if (alert) {
                    openMessagePopup("Page updated successfully");
                }
                if (uploadAlert) {
                    openMessagePopup('Upload successful');
                }
            }
        }).catch(function(error) {
            // Close the working popup
            closeWorkingPopup();

            console.log("Failed to get image from the server.");
            console.log(error);
            openMessagePopup("Something went wrong while updating the page. Please try again later.");
    
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
        // Close the working popup
        closeWorkingPopup();

        openMessagePopup("Something went wrong while updating the page. Please try again later.");
        console.log(error);
    }
}

function download() {
    var storage = firebase.storage();
    var pathReference = storage.ref(currentUser.uid + '/old.png');

    // get the download url and email it to the user
    pathReference.getDownloadURL().then(function(url) {
        var downloadEmail = firebase.functions().httpsCallable('exportYearbook');
        downloadEmail({url: url}).then(function(result) {
            console.log(result.data.status);
            openMessagePopup("A copy of your yearbook will be emailed to you soon!");
        }).catch(function(error) {
            var code = error.code;
            var message = error.message;
            var details = error.details;
            console.log("An error occurred: " + code + " " + message + " " + details);
            openMessagePopup('An error occurred. Please try again later.');
        });
    });
}

function resetYearbook() {
    // Confirm yearbook should be reset
    openConfirmPopup("Are you sure you want to reset your yearbook? This action cannot be undone.", function() {
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
    });
}
