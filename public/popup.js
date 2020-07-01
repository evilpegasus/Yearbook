function openWorkingPopup() {
    var popup = document.querySelector("#workingPopup");
    var popupContainer = document.querySelector("#popupContainer");
    var animations = document.querySelectorAll(".animation");
    animations.forEach(function(animation) {
        animation.style.display = 'block';
    });
    document.querySelector('#working').style.display = 'block';
    document.body.style.overflow = 'hidden';
    popup.style.height = '200px';
    popup.style.width = '200px';
    popup.style.display = 'block';
    popupContainer.style.height = '100%';
    popupContainer.style.width = '100%';
    popupContainer.style.display = 'block';
}

function closeWorkingPopup() {
    var popup = document.querySelector("#workingPopup");
    var popupContainer = document.querySelector("#popupContainer");
    var animations = document.querySelectorAll(".animation");
    animations.forEach(function(animation) {
        animation.style.display = 'none';
    });
    document.querySelector('#working').style.display = 'none';
    document.body.style.overflow = 'visible';
    popup.style.height = '0';
    popup.style.width = '0';
    popup.style.display = 'none;'
    popupContainer.style.height = '0';
    popupContainer.style.width = '0';
    popupContainer.style.display = 'none';
}

function openMessagePopup(message) {
    var popupContainer = document.querySelector("#popupContainer");
    var popup = document.querySelector("#messagePopup");
    var messageContainer = document.querySelector('#message');
    document.body.style.overflow = 'hidden';
    popup.style.height = '200px';
    popup.style.width = '300px';
    popup.style.display = 'block';
    popupContainer.style.height = '100%';
    popupContainer.style.width = '100%';
    popupContainer.style.display = 'block';
    messageContainer.style.display = 'block';
    messageContainer.innerHTML = message;
    document.querySelector('#closePopupButton').style.display = 'inline-block';
}

function closeMessagePopup() {
    var popup = document.querySelector("#messagePopup");
    var popupContainer = document.querySelector("#popupContainer");
    document.body.style.overflow = 'visible';
    popup.style.height = '0';
    popup.style.width = '0';
    popup.style.display = 'none;'
    popupContainer.style.height = '0';
    popupContainer.style.width = '0';
    popupContainer.style.display = 'none';
    document.querySelector('#message').style.display = 'none';
    document.querySelector('#closePopupButton').style.display = 'none';
}

function openConfirmPopup(message, callback) {
    var popupContainer = document.querySelector("#popupContainer");
    var popup = document.querySelector("#confirmPopup");
    var messageContainer = document.querySelector('#confirmMessage');
    var confirmYes = document.querySelector('#confirmYes');
    document.body.style.overflow = 'hidden';
    popup.style.height = '200px';
    popup.style.width = '500px';
    popup.style.display = 'block';
    popupContainer.style.height = '100%';
    popupContainer.style.width = '100%';
    popupContainer.style.display = 'block';
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
    var popup = document.querySelector("#confirmPopup");
    var popupContainer = document.querySelector("#popupContainer");
    var confirmYes = document.querySelector('#confirmYes');
    document.body.style.overflow = 'visible';
    popup.style.height = '0';
    popup.style.width = '0';
    popup.style.display = 'none;'
    popupContainer.style.height = '0';
    popupContainer.style.width = '0';
    popupContainer.style.display = 'none';
    document.querySelector('#confirmButtonContainer').style.display = 'none';
    document.querySelector('#confirmMessage').style.display = 'none';
    confirmYes.style.display = 'none';
    document.querySelector('#confirmNo').style.display = 'none';
    confirmYes.onclick = function() {};
}