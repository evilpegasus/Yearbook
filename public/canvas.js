window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // create the buttons on the canvas
    const clearButton = document.querySelector("#clearButton");
    const colorSelector = document.querySelector("#colorSelector");
    const widthSelector = document.querySelector("#widthSelector");

    // set canvas properties
    canvas.height = 500;
    canvas.width = 500;

    var painting = false;
    var offsetY = canvas.getBoundingClientRect().top;
    var offsetX = canvas.getBoundingClientRect().left;
    // var color = "black";
    // var size = 8;

    // set a white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        if (confirm("Are you sure you want to clear the canvas?")) {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    /*
    // change the drawing color
    function changeColor(newColor) {
        color = newColor;
        if (color === "White") {
            document.getElementById("activeColor").innerHTML = "Active tool: Eraser";
        } else {
            document.getElementById("activeColor").innerHTML = "Active color: " + newColor;
        }
    }

    blackButton.onclick = function() {
        changeColor("Black");
    }
    blueButton.onclick = function() {
        changeColor("Blue");
    }
    redButton.onclick = function() {
        changeColor("Red");
    }
    greenButton.onclick = function() {
        changeColor("Green");
    }

    // eraser tool
    const eraser = document.getElementById("eraser");
    eraser.onclick = function() {
        changeColor("White");
    }

    // size slider
    const sizeSlider = document.getElementById("sizeSlider");
    sizeSlider.oninput = function() {
        size = this.value;
        document.getElementById("thickness").innerHTML = "Thickness: " + size;
    }
    */

    // download the image
    function download() {
        var download = document.querySelector("#download");
        var image = document.querySelector("#canvas").toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
        download.setAttribute("href", image);
    }

    // detect and respond to user actions
    window.addEventListener("scroll", adjustOffsets);
    canvas.addEventListener("mousedown", startPainting);
    canvas.addEventListener("mouseup", endPainting);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseout", endPainting);

    // user actions on mobile devices
    // canvas.addEventListener("touchstart", startPainting);
    // canvas.addEventListener("touchend", endPainting);
    // canvas.addEventListener("touchmove", draw);
    // canvas.addEventListener("touchcancel", endPainting);

});
