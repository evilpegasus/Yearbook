function upload() {
    const canvas = document.querySelector("#canvas");

    // Create a root reference
    var storageRef = firebase.storage().ref();
    
    canvas.toBlob(function(blob){
        var image = new Image();
        image.src = blob;
        var uploadTask = storageRef.child(test).put(blob);
      }); 
}