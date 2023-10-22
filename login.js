const firebaseConfig = {
  apiKey: "AIzaSyAGmUAViFiecU-O8sxpJXrisDONlmsaZD4",
  authDomain: "checks-d2001.firebaseapp.com",
  projectId: "checks-d2001",
  storageBucket: "checks-d2001.appspot.com",
  messagingSenderId: "574565931185",
  appId: "1:574565931185:web:2cb1c936a69d573b282a90",
  measurementId: "G-XQE0J9VF6F"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Initialize variables
const auth = firebase.auth()
const database = firebase.database()

// Set up our register function
function register() {
  // Get all our input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value
  full_name = document.getElementById('full_name').value

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    swal("", "Email or Password is Outta Line!!", "warning")
    return
    // Don't continue running the code
  }
  if (validate_field(full_name) == false) {
    swal("", "One or More Extra Fields is Outta Line!!", "warning")
    return
  }

  // Move on with Auth
  auth.createUserWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      var user = auth.currentUser

      // Add this user to Firebase Database
      var database_ref = database.ref()

      // Create User data
      var user_data = {
        email: email,
        full_name: full_name,
        last_login: Date.now(),
        score:0
      }

      // Push to Firebase Database
      database_ref.child('users/' + user.uid).set(user_data)

      // DOne
      swal("User Created", "Please Login", "success")
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code
      var error_message = error.message

      swal("", error_message, "warning")
    })
}

// Set up our login function
function login() {
  // Get all our input fields
  email = document.getElementById('email').value
  password = document.getElementById('password').value

  // Validate input fields
  if (validate_email(email) == false || validate_password(password) == false) {
    swal("", "Email or Password is Outta Line!!", "warning")
    return
    // Don't continue running the code
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(function () {
      // Declare user variable
      var user = auth.currentUser

      // Add this user to Firebase Database
      var database_ref = database.ref()

      // Create User data
      var user_data = {
        last_login: Date.now()
      }

      // Push to Firebase Database
      database_ref.child('users/' + user.uid).update(user_data)

      // DOne
      //Navigate to  Home.html
      window.location.href = "index1.html"
    })
    .catch(function (error) {
      // Firebase will use this to alert of its errors
      var error_code = error.code
      var error_message = error.message

      swal("", error_message, "error")
    })
}




// Validate Functions
function validate_email(email) {
  expression = /^[^@]+@\w+(\.\w+)+\w$/
  if (expression.test(email) == true) {
    // Email is good
    return true
  } else {
    // Email is not good
    return false
  }
}

function validate_password(password) {
  // Firebase only accepts lengths greater than 6
  if (password < 6) {
    return false
  } else {
    return true
  }
}

function validate_field(field) {
  if (field == null) {
    return false
  }

  if (field.length <= 0) {
    return false
  } else {
    return true
  }
}

window.onload=function () {
  check();
};



