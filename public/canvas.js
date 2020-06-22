window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // set canvas properties
    canvas.height = 800;
    canvas.width = 800;

    var painting = false;
    var offsetY = canvas.offsetTop;
    var offsetX = canvas.offsetLeft;

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
        offsetY = canvas.offsetTop;
        offsetX = canvas.offsetLeft;
    }

    // paint at the cursor's location
    function draw(e) {
        // ensure painting is enabled
        if (!painting) {
            return;
        }
        
        // set line properties
        ctx.lineWidth = 8;
        ctx.lineCap = "round";

        // draw the line
        ctx.lineTo(e.clientX - offsetX, e.clientY - offsetY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - offsetY, e.clientY - offsetY);
    }

    // clear the canvas
    const clearButton = document.getElementById("clearButton");
    clearButton.onclick = function() {
        if (confirm("Are you sure you want to clear the canvas?")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // detect and respond to user actions
    window.addEventListener("scroll", adjustOffsets);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", endPainting);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseout", endPainting);

});
