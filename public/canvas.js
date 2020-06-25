// check if user is signed in
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
    } else {
      // No user is signed in.
      window.location.replace('index.html')
    }
  });

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
    canvas.height = 500;
    canvas.width = 500;
    var painting = false;
    var offsetY = canvas.getBoundingClientRect().top;
    var offsetX = canvas.getBoundingClientRect().left;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // enable painting
    function startPainting() {
        painting = true;
    }
    
    // disable painting
    function endPainting() {
        painting = false;
        ctx.beginPath();
    }
    
    // adjust the X and Y offsets of the painting
    function adjustOffsets() {
        offsetY = canvas.getBoundingClientRect().top;
        offsetX = canvas.getBoundingClientRect().left;
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
    }

    // download the image
    downloadButton.onclick = function() {
        var image = canvas.toDataURL().replace("image/png", "image/octet-stream");
        document.querySelector("#download").setAttribute("href", image);
    }

    // detect and respond to user actions
    window.addEventListener("wheel", adjustOffsets);
    window.addEventListener("scroll", adjustOffsets);
    canvas.addEventListener("pointerdown", startPainting);
    canvas.addEventListener("pointerup", endPainting);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerout", endPainting);
});
