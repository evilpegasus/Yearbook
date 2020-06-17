window.addEventListener('load', () => {
    // create the canvas
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");

    // set canvas properties
    canvas.height = 800;
    canvas.width = 800;

    let painting = false;
    let yOffset = canvas.getBoundingClientRect().top;
    let xOffset = canvas.getBoundingClientRect().left;

    // enable painting
    function startPosition() {
        painting = true;
    }
    
    // disable painting
    function endPosition() {
        painting = false;
        ctx.beginPath();
    }
    
    // adjust the X and Y offsets of the painting
    function adjustOffsets() {
        yOffset = canvas.getBoundingClientRect().top;
        xOffset = canvas.getBoundingClientRect().left;
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
        ctx.lineTo(e.clientX - xOffset, e.clientY - yOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - xOffset, e.clientY - yOffset);
    }

    // detect and respond to user actions
    window.addEventListener("scroll", adjustOffsets);
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseout", endPosition);
});
