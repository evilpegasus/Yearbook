var newUserPopupClosed = !onAppPage || !(demo || anon || newUser);

function openPopup(selector, height, width) {
    var popup = document.querySelector(selector);
    var popupContainer = document.querySelector("#popupContainer");
    popup.style.height = height;
    popup.style.width = width;
    popup.style.display = 'block';
    popupContainer.style.height = '100%';
    popupContainer.style.width = '100%';
    popupContainer.style.display = 'block';
}

function closePopup(selector) {
    var popup = document.querySelector(selector);
    var popupContainer = document.querySelector("#popupContainer");
    popup.style.height = '0';
    popup.style.width = '0';
    popup.style.display = 'none;'
    if (newUserPopupClosed) {
        popupContainer.style.height = '0';
        popupContainer.style.width = '0';
        popupContainer.style.display = 'none';
    }
}

function openWorkingPopup() {
    openPopup('#workingPopup', '200px', '200px');
    var animations = document.querySelectorAll(".animation");
    animations.forEach(function(animation) {
        animation.style.display = 'block';
    });
    document.querySelector('#working').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeWorkingPopup() {
    closePopup('#workingPopup');
    var animations = document.querySelectorAll(".animation");
    animations.forEach(function(animation) {
        animation.style.display = 'none';
    });
    document.querySelector('#working').style.display = 'none';
    document.body.style.overflow = 'visible';
}

function openMessagePopup(message) {
    openPopup('#messagePopup', '200px', '300px');
    var messageContainer = document.querySelector('#message');
    document.body.style.overflow = 'hidden';
    messageContainer.style.display = 'block';
    messageContainer.innerHTML = message;
    document.querySelector('#closePopupButton').style.display = 'inline-block';
}

function closeMessagePopup() {
    closePopup('#messagePopup');
    document.body.style.overflow = 'visible';
    document.querySelector('#message').style.display = 'none';
    document.querySelector('#closePopupButton').style.display = 'none';
}

function openConfirmPopup(message, callback) {
    openPopup('#confirmPopup', '200px', '500px');
    var messageContainer = document.querySelector('#confirmMessage');
    var confirmYes = document.querySelector('#confirmYes');
    document.body.style.overflow = 'hidden';
    messageContainer.style.display = 'block';
    messageContainer.innerHTML = message;
    document.querySelector('#confirmButtonContainer').style.display = 'block';
    confirmYes.style.display = 'inline-block';
    document.querySelector('#confirmNo').style.display = 'inline-block';
    confirmYes.onclick = function() {
        callback();
        closeConfirmPopup();
    }
}

function closeConfirmPopup() {
    closePopup('#confirmPopup');
    var confirmYes = document.querySelector('#confirmYes');
    document.body.style.overflow = 'visible';
    document.querySelector('#confirmButtonContainer').style.display = 'none';
    document.querySelector('#confirmMessage').style.display = 'none';
    confirmYes.style.display = 'none';
    document.querySelector('#confirmNo').style.display = 'none';
    confirmYes.onclick = function() {};
}

function openPromptPopup(message, label, callback) {
    openPopup('#promptPopup', '200px', '700px');
    var messageContainer = document.querySelector('#promptMessage');
    var submitPrompt = document.querySelector('#submitPrompt');
    var url = document.querySelector('#url');
    document.body.style.overflow = 'hidden';
    messageContainer.style.display = 'block';
    messageContainer.innerHTML = message;
    url.placeholder = label;
    url.style.display = 'initial';
    document.querySelector('#promptButtonContainer').style.display = 'block';
    submitPrompt.style.display = 'inline-block';
    document.querySelector('#cancelPrompt').style.display = 'inline-block';
    submitPrompt.onclick = function() {
        callback(url.value);
        closePromptPopup();
    }
}

function closePromptPopup() {
    closePopup('#promptPopup');
    var submitPrompt = document.querySelector('#submitPrompt');
    var url = document.querySelector('#url');
    document.body.style.overflow = 'visible';
    document.querySelector('#promptButtonContainer').style.display = 'none';
    document.querySelector('#promptMessage').style.display = 'none';
    submitPrompt.style.display = 'none';
    document.querySelector('#cancelPrompt').style.display = 'none';
    url.value = '';
    url.style.display = 'none';
    submitPrompt.onclick = function() {};
}

function closeNewUserPopup() {
    newUserPopupClosed = true;
    closePopup('#welcomePopup');
    var welcomeText = document.querySelectorAll(".welcomeText");
    welcomeText.forEach(function(welcomeText) {
        welcomeText.style.display = 'none';
    });
    document.body.style.overflow = 'visible';
    document.querySelector('#welcomePopup').style.padding ='0';
    document.querySelector('#closePopup').style.display = 'none';

    if (currentUser) {
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        upload(false);
        assertOldExists();
    }
}

function assertOldExists() {
    // const canvas = document.querySelector("#canvas");
    // const ctx = canvas.getContext("2d");

    // This function is only called when the user is signed in, so we can use currentUser.uid
    var pathRef = firebase.storage().ref(currentUser.uid + '/old.png');
    pathRef.getDownloadURL().then(function(url) {
        // If old exists, we can continue with the redirect
        // check for params in URL
        const urlParams = new URLSearchParams(window.location.search);
        serveID = urlParams.get('user');

        if (serveID) {
            window.location.replace('https://yearbook-hhs.web.app/app.html?user=' + serveID);
        } else {
            window.location.replace('https://yearbook-hhs.web.app/app.html');
        }
    }).catch(function(error) {
        // If old doesn't exist, we wait one second and try again
        setTimeout(assertOldExists(), 1000);
    });
}
