// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());

// check for params in URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
createAccount = urlParams.get('createAccount');
serveID = urlParams.get('user');
demo = serveID == 'demo';
anon = urlParams.get('anon');

// set the redirect URL preserving any URL params
var redirectLink = 'https://yearbook-hhs.web.app/app.html';

if (demo) {
  window.location.assign(redirectLink + '?user=demo');
}

if (serveID) {
  redirectLink += '?user=' + serveID;
  window.onload = function() {
    document.querySelector('#anonText').style.display = 'block';
    document.querySelector('#anonLink').style.display = 'inline';
    document.querySelector('#anonNote').style.display = 'block';
  }
}

if (anon && serveID) {
  window.location.assign(redirectLink + '&anon=true');
}

function anonRedirect() {
  if (!serveID) {
    return window.alert("You are not able to enter anonymous mode. Make sure you follow someone's sharing link!");
  }

  window.location.assign(redirectLink + '&anon=true');
}

if (createAccount) {
  document.title = 'Create Account | Yearbook 2020';
  document.querySelector('#login-text').innerHTML = 'Create Account';
  document.querySelector('#demoText').style.display = 'none';
}

var uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      if (authResult.additionalUserInfo.isNewUser) {
        if (serveID) {
          redirectLink += '&newUser=true';
        } else {
          redirectLink += '?newUser=true';
        }
      }

      window.location.assign(redirectLink);
      return false;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: redirectLink,
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: 'TOS.html',
  // Privacy policy url.
  privacyPolicyUrl: 'privacy.html'
};

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
  window.location.assign(redirectLink);
};

firebase.auth().onAuthStateChanged(function(user) {
  user ? handleSignedInUser(user) : ui.start('#firebaseui-auth-container', uiConfig);
});
