function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function openMenu() {
    document.querySelector("#sideMenu").style.left = "0";
    document.querySelector("#sideMenu").style.boxShadow = "var(--menu-shadow)";
}
  
function closeMenu() {
    document.querySelector("#sideMenu").style.left = "-250px";
    document.querySelector("#sideMenu").style.boxShadow = "none";
}

function signOut() {
    firebase.auth().signOut().then(function() {
        console.log('Signed out');
    }, function(error) {
        console.log('Error signing out');
    });
}

function goToAnotherYearbook() {
    openPromptPopup("Enter the URL of the yearbook you want to visit:", 'Yearbook URL', function(input) {    
        // Check if input is null (user didn't put a URL)
        if (!input) {
            return;
        }

        // Mavigate to the URL if it is valid
        if (input.startsWith('https://yearbook-hhs.web.app/app.html')) {
            window.location.assign(input);
        } else {
            closePromptPopup();
            openMessagePopup('Invalid URL');
        }
    });
}

function changeTheme(newTheme = themeSelector.options[themeSelector.selectedIndex].value) {
    const themeSelector = document.querySelector("#themeSelector");
    const root = document.documentElement;

    // Set the light color for random themes, 0 or 1 of the three color values can be dark
    function generateLightColor() {
        var lightColor = [];
        switch (randomInt(1, 4)) {
            case 1:
                lightColor.push(randomInt(0, 255));
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(170, 255));
                break;

            case 2:
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(0, 255));
                lightColor.push(randomInt(170, 255));
                break;

            case 3:
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(0, 255));
                break;

            case 4:
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(170, 255));
                lightColor.push(randomInt(170, 255));
                break;
        }
        return lightColor;
    }
    var lightColor = generateLightColor();
    var lightAccentColor = generateLightColor();
    var lightMenuColor = [];
    lightMenuColor.push(Math.floor(lightColor[0] * 3 / 4));
    lightMenuColor.push(Math.floor(lightColor[1] * 3 / 4));
    lightMenuColor.push(Math.floor(lightColor[2] * 3 / 4));

    // Set the dark color for random themes, 0 or 1 of the three color values can be light
    function generateDarkColor() {
        var darkColor = [];
        switch (randomInt(1, 4)) {
            case 1:
                darkColor.push(randomInt(0, 170));
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 85));
                break;

            case 2:
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 170));
                darkColor.push(randomInt(0, 85));
                break;

            case 3:
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 170));
                break;

            case 4:
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 85));
                darkColor.push(randomInt(0, 85));
                break;
        }
        return darkColor;
    }
    var darkColor = generateDarkColor();
    var darkAccentColor = generateDarkColor();
    var darkMenuColor = [];
    darkMenuColor.push(Math.floor(darkColor[0] / 2));
    darkMenuColor.push(Math.floor(darkColor[1] / 2));
    darkMenuColor.push(Math.floor(darkColor[2] / 2));

    // change css variables based on the selection
    switch (newTheme) {
        case "black":
            root.style.setProperty('--theme-color', 'black');
            root.style.setProperty('--menu-color', '#2f2f2f');
            root.style.setProperty('--text-color', 'white');
            root.style.setProperty('--title-color', '#DDD5C7');
            root.style.setProperty('--link-color', '#DDD5C7');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 20px gray');
            root.style.setProperty('--text-shadow', '0 0 5px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px gray');
            root.style.setProperty('--menu-shadow', '0 0 30px lightgray');
            break;

        case "blue":
            root.style.setProperty('--theme-color', '#003262');
            root.style.setProperty('--menu-color', '#001631');
            root.style.setProperty('--text-color', 'white');
            root.style.setProperty('--title-color', '#DDD5C7');
            root.style.setProperty('--link-color', '#DDD5C7');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 20px black');
            root.style.setProperty('--text-shadow', '0 0 5px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;

        case "green":
            root.style.setProperty('--theme-color', '#145223');
            root.style.setProperty('--menu-color', '#072611');
            root.style.setProperty('--text-color', 'white');
            root.style.setProperty('--title-color', '#DDD5C7');
            root.style.setProperty('--link-color', '#DDD5C7');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 20px black');
            root.style.setProperty('--text-shadow', '0 0 5px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;

        case "red":
            root.style.setProperty('--theme-color', '#6d1212');
            root.style.setProperty('--menu-color', '#360606');
            root.style.setProperty('--text-color', 'white');
            root.style.setProperty('--title-color', '#DDD5C7');
            root.style.setProperty('--link-color', '#DDD5C7');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 20px black');
            root.style.setProperty('--text-shadow', '0 0 5px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;

        case "white":
            root.style.setProperty('--theme-color', 'white');
            root.style.setProperty('--menu-color', '#cccccc');
            root.style.setProperty('--text-color', '#003262');
            root.style.setProperty('--title-color', '#003262');
            root.style.setProperty('--link-color', 'blue');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 5px deepskyblue');
            root.style.setProperty('--text-shadow', '0 0 1px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;

        case "light":
            root.style.setProperty('--theme-color', 'rgb(' + lightColor[0] + ', ' + lightColor[1] + ', ' + lightColor[2] + ')');
            root.style.setProperty('--menu-color', 'rgb(' + lightMenuColor[0] + ', ' + lightMenuColor[1] + ', ' + lightMenuColor[2] + ')');
            root.style.setProperty('--text-color', 'rgb(' + darkColor[0] + ', ' + darkColor[1] + ', ' + darkColor[2] + ')');
            root.style.setProperty('--title-color', 'rgb(' + darkAccentColor[0] + ', ' + darkAccentColor[1] + ', ' + darkAccentColor[2] + ')');
            root.style.setProperty('--link-color', 'blue');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 5px lightskyblue');
            root.style.setProperty('--text-shadow', '0 0 1px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;

        case "dark":
            root.style.setProperty('--theme-color', 'rgb(' + darkColor[0] + ', ' + darkColor[1] + ', ' + darkColor[2] + ')');
            root.style.setProperty('--menu-color', 'rgb(' + darkMenuColor[0] + ', ' + darkMenuColor[1] + ', ' + darkMenuColor[2] + ')');
            root.style.setProperty('--text-color', 'rgb(' + lightColor[0] + ', ' + lightColor[1] + ', ' + lightColor[2] + ')');
            root.style.setProperty('--title-color', 'rgb(' + lightAccentColor[0] + ', ' + lightAccentColor[1] + ', ' + lightAccentColor[2] + ')');
            root.style.setProperty('--link-color', 'lightskyblue');
            root.style.setProperty('--active-link-color', 'aquamarine');
            root.style.setProperty('--title-shadow', '0 0 20px black');
            root.style.setProperty('--text-shadow', '0 0 5px var(--text-color)');
            root.style.setProperty('--canvas-shadow', '0 5px 20px black');
            root.style.setProperty('--menu-shadow', '0 0 30px black');
            break;
    }

    // Update the database to match user's preferred theme
    docRef.update({
        theme: newTheme
    }).then(function() {
        console.log("Theme successfully updated to " + newTheme);
    }).catch(function(error) {
        console.log("Error updating theme: " + error);
    });
    console.log('Theme changed to ' + newTheme);
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
    openMessagePopup("Your yearbook's unique sharing URL has been copied to your clipboard. Share it with your friends!");
}

function closePopup() {
    // close new user popup
    var popup = document.querySelector("#welcomePopup");
    var popupContainer = document.querySelector("#popupContainer");
    document.body.style.overflow = 'visible';
    popup.style.height = '0';
    popup.style.width = '0';
    popup.style.padding ='0';
    popup.style.display = 'none;'
    popupContainer.style.height = '0';
    popupContainer.style.width = '0';
    popupContainer.style.display = 'none';
    document.querySelector('#closePopup').style.display = 'none';

    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    upload(false);
    assertOldExists();
}

function assertOldExists() {
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext("2d");
    var pathRef = firebase.storage().ref(serveID + '/old.png');
    pathRef.getDownloadURL().then(function(url) {
        // If old exists, we can continue with the redirect
        // check for params in URL
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        serveID = urlParams.get('user');

        if (serveID) {
            window.location.replace('https://yearbook-hhs.web.app/app.html?user=' + serveID);
        } else {
            window.location.replace('https://yearbook-hhs.web.app/app.html');
        }
    }).catch(function(error) {
        // It old doesn't exist, we wait one second and try again
        setTimeout(assertOldExists(), 1000);
    });
}
