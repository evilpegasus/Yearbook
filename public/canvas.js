window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // create the buttons on the canvas
    const clearButton = document.querySelector("#clearButton");
    const colorSelector = document.querySelector("#colorSelector");
    const widthSelector = document.querySelector("#widthSelector");
    const toolbars = document.querySelector("#toolbars");

    // set canvas properties
    canvas.height = 2500;
    canvas.width = 1500;
    var painting = false;
    var offsetY = canvas.getBoundingClientRect().top;
    var offsetX = canvas.getBoundingClientRect().left;
    if (randomInt(1, 100) == 1) {
        document.querySelector('.title-box').style.fontVariant = 'normal';
    }
    
    // adjust the X and Y offsets of the painting
    function adjustOffsets() {
        offsetY = canvas.getBoundingClientRect().top;
        offsetX = canvas.getBoundingClientRect().left;
    }

    // enable painting
    function startPainting() {
        adjustOffsets();
        painting = true;
        canvas.focus({preventScroll: true});
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
        const canvas = document.querySelector("#canvas");
        const ctx = canvas.getContext("2d");

        if (confirm("Are you sure you want to clear what you have drawn? This action cannot be undone.")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // get the image from storage and draw it onto the canvas if user's old.png exists
        var storageRef = firebase.storage().ref();
        storageRef.child(serveID + "/old.png").getDownloadURL().then(function() {
            // old.png already exists
            getImage(false);
        }, function() {
            // old.png does not exist, draw a white background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }

    // Hide the toolbar label and show the toolbar
    toolbars.onpointerover = function() {
        document.querySelector('.canvas-toolbar-title').style.display = 'none';
        toolbars.style.bottom = '-40px';
    }

    document.querySelector('#main').onpointerover = function() {
        setTimeout(function() {
            document.querySelector('.canvas-toolbar-title').style.display = 'initial';
        }, 500);        
        toolbars.style.bottom = '-150px';
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

// Confirm user wants to leave the site with potentially unsaved changes
window.onbeforeunload = function(e) {
    return 'Are you sure you want to leave this site? Changes you have made since the last upload will not be saved.';
};
