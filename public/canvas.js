// create variable to track if unsaved changes exit confirmation has been added
var exitListenerAdded = false;

// confirm page exit if unsaved changes exist
function confirmPageExit(e) {
    e.preventDefault();
    e.returnValue = '';
}

// create the undo and redo arrays
var undo = [];
var redo = [];

window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // Create variables to hold points for undo
    var currentLine = [];
    var mouseX;
    var mouseY;

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
    ctx.lineCap = "round";
    ctx.lineJoin = 'round';
    if (randomInt(1, 100) == 1) {
        document.querySelector('.title-box').style.fontVariant = 'normal';
    }
    
    // adjust the X and Y offsets of the painting
    function adjustOffsets() {
        offsetY = canvas.getBoundingClientRect().top;
        offsetX = canvas.getBoundingClientRect().left;
    }

    // enable painting
    function startPainting(e) {
        adjustOffsets();
        painting = true;
        canvas.focus({preventScroll: true});
        ctx.beginPath();

        // set line properties
        ctx.lineWidth = widthSelector.options[widthSelector.selectedIndex].value;
        ctx.strokeStyle = colorSelector.options[colorSelector.selectedIndex].value;
        mouseX = e.clientX - offsetX;
        mouseY = e.clientY - offsetY;

        // Add start point to current line
        currentLine.push({
            x: mouseX,
            y: mouseY,
            color: ctx.strokeStyle,
            width: ctx.lineWidth
        });
    }
    
    // disable painting
    function endPainting(e) {
        painting = false;
        ctx.beginPath();

        // Add the previous line to the undo stack and clear the current line array
        if (currentLine.length > 1) {
            undo.push(currentLine);
            redo = [];

            redoButton.setAttribute('data-link-disabled', 'true');
            undoButton.setAttribute('data-link-disabled', 'false');
        }
        
        currentLine = [];
    }

    // paint at the cursor's location
    function draw(e) {
        // ensure painting is enabled
        if (!painting) {
            return;
        }

        mouseX = e.clientX - offsetX;
        mouseY = e.clientY - offsetY;

        // draw the line
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);

        // Add point to current line
        currentLine.push({
            x: mouseX,
            y: mouseY
        });

        // add unsaved changes exit confirmation
        if (!exitListenerAdded) {
            window.addEventListener('beforeunload', confirmPageExit);
            exitListenerAdded = true;
        }
    }

    function redrawAll() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < undo.length; i++) {
            ctx.beginPath();
            ctx.moveTo(undo[i][0].x, undo[i][0].y);
            ctx.lineWidth = undo[i][0].width;
            ctx.strokeStyle = undo[i][0].color;
            
            for (var j = 1; j < undo[i].length; j++) {
                ctx.lineTo(undo[i][j].x, undo[i][j].y);
            }
            ctx.stroke();
        };

        if (undo.length === 0) {
            window.removeEventListener('beforeunload', confirmPageExit);
            exitListenerAdded = false;
        }
    }

    var redoButton = document.querySelector('#redo');
    var undoButton = document.querySelector('#undo');
    var redoDisabled;
    var undoDisabled;

    function undoLast() {
        redoDisabled = (redoButton.getAttribute('data-link-disabled') == 'true');
        undoDisabled = (undoButton.getAttribute('data-link-disabled') == 'true');

        if (undo.length === 0 || undoDisabled) {
            return;
        }

        redo.push(undo.pop());

        if (undo.length === 0) {
            undoButton.setAttribute('data-link-disabled', 'true');
        }

        if (redoDisabled) {
            redoButton.setAttribute('data-link-disabled', 'false');
        }

        redrawAll();
    }

    function redoLast() {
        redoDisabled = (redoButton.getAttribute('data-link-disabled') == 'true');
        undoDisabled = (undoButton.getAttribute('data-link-disabled') == 'true');

        if (redo.length === 0 || redoDisabled) {
            return;
        }

        undo.push(redo.pop());

        if (redo.length === 0) {
            redoButton.setAttribute('data-link-disabled', 'true');
        }

        if (undoDisabled) {
            undoButton.setAttribute('data-link-disabled', 'false');
        }

        redrawAll();
    }

    // bind undo and redo to the buttons
    undoButton.onclick = function() { undoLast() }
    redoButton.onclick = function() { redoLast() }

    // clear the canvas
    clearButton.onclick = function() {
        openConfirmPopup("Are you sure you want to clear what you have drawn? This action cannot be undone.", function() {
            const canvas = document.querySelector("#canvas");
            const ctx = canvas.getContext("2d");

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            undo = [];
            redo = [];
            undoButton.setAttribute('data-link-disabled', 'true');
            redoButton.setAttribute('data-link-disabled', 'true');
            
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

            // remove unsaved changes exit confirmation
            if (exitListenerAdded) {
                window.removeEventListener('beforeunload', confirmPageExit);
                exitListenerAdded = false;
            }
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
        }, 200);        
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

    // bind ctrl+z and ctrl+y to undo and redo if no prompt popup is open
    var ctrlTime;
    window.addEventListener('keydown', function(e) {
        var timeBetween = 1000;

        if (e.ctrlKey) {
            ctrlTime = Date.now();
        }

        if (e.ctrlKey && e.key === 'z' && !promptPopupOpen && Date.now() - ctrlTime < timeBetween) {
            undoLast();
        } else if (e.ctrlKey && e.key === 'y' && !promptPopupOpen && Date.now() - ctrlTime < timeBetween) {
            redoLast();
        }
    });
});
