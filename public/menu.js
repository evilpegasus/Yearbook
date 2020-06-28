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
    const root = document.documentElement;

    // change css variables based on the selection
    switch (themeSelector.options[themeSelector.selectedIndex].value) {
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
    }
    console.log('theme changed to ' + themeSelector.options[themeSelector.selectedIndex].value);
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