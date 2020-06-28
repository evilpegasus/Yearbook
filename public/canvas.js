window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // create the buttons on the canvas
    const clearButton = document.querySelector("#clearButton");
    const downloadButton = document.querySelector("#downloadButton");
    const colorSelector = document.querySelector("#colorSelector");
    const widthSelector = document.querySelector("#widthSelector");

    // set canvas properties
    canvas.height = 2500;
    canvas.width = 1500;
    var painting = false;
    var offsetY = canvas.getBoundingClientRect().top;
    var offsetX = canvas.getBoundingClientRect().left;
    
    // adjust the X and Y offsets of the painting
    function adjustOffsets() {
        offsetY = canvas.getBoundingClientRect().top;
        offsetX = canvas.getBoundingClientRect().left;
    }

    // enable painting
    function startPainting() {
        adjustOffsets();
        painting = true;
    }
    
    // disable painting
    function endPainting() {
        painting = false;
        ctx.beginPath();
    }

    // paint at the cursor's location
    function draw(e) {
        // ensure painting is enabled
        if (!painting) {
            return;
        }
        
        // set line properties
        ctx.lineWidth = widthSelector.options[widthSelector.selectedIndex].value;
        ctx.lineCap = "round";
        ctx.strokeStyle = colorSelector.options[colorSelector.selectedIndex].value;

        // draw the line
        ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - offsetX, e.clientY - offsetY);
    }

    // clear the canvas
    clearButton.onclick = function() {
        if (confirm("Are you sure you want to clear what you have drawn? This action cannot be undone.")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    }

    // detect and respond to user actions
    window.addEventListener("wheel", adjustOffsets);
    window.addEventListener("scroll", adjustOffsets);
    window.addEventListener("resize", adjustOffsets);
    canvas.addEventListener("pointerdown", startPainting);
    canvas.addEventListener("pointerup", endPainting);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerout", endPainting);
});

function openMenu() {
    document.querySelector("#sideMenu").style.width = "250px";
}
  
function closeMenu() {
    document.querySelector("#sideMenu").style.width = "0";
}

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed out');
    }, function(error) {
        console.log('Error signing out');
    });
}

function goToAnotherYearbook() {
    var redirectURL = window.prompt("Enter the URL of the yearbook you want to visit:");
    
    // Check if redirectURL is null (user pressed cancel)
    if (!redirectURL) {
        return;
    }

    // Mavigate to the URL if it is valid
    if (redirectURL.startsWith('https://yearbook-hhs.web.app/app.html')) {
        window.location.assign(redirectURL);
    } else {
        window.alert('Invalid URL');
    }
}

function changeTheme() {
    const themeSelector = document.querySelector("#themeSelector");
    const stylesheet = document.querySelector("#stylesheet");
    stylesheet.href = themeSelector.options[themeSelector.selectedIndex].value;
    console.log('stylesheet changed to ' + stylesheet.href);
}

function copyURL() {
    // Create a temporary input field to copy from
    var copyText = document.createElement("input");
    copyText.setAttribute('type', 'text');
    copyText.setAttribute('value', "https://yearbook-hhs.web.app/app.html?user=" + currentUser.uid);
    document.body.appendChild(copyText);

    // Copy the URL
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");

    // Delete copyText
    document.body.removeChild(copyText);
    delete copyText;
    window.alert("Your yearbook's unique sharing URL has been copied to your clipboard. Share it with your friends!");
}

function popup() {
    // TODO: finish function
    return;
}
