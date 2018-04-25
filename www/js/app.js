angular.module('ionic-firebase-seed', ['ionic', 'firebase'])

// TODO: Replace this with your own Firebase URL: https://firebase.com/signup
.constant('FBURL', 'https://ionic-seed-d416d.firebaseio.com/')

.factory('Auth', function($firebaseAuth, FBURL, $window) {
  return $firebaseAuth();
})

.factory('Messages', function($firebaseArray, FBURL, $window) {
    var services = {
      getMsgs: function () {
        var ref = firebase.database().ref();
        var messagesRef = ref.child("messages");
        var query = messagesRef.orderByChild("timestamp").limitToLast(30);
        return $firebaseArray(query);
      }
    }
    return services;
})

.controller('AppCtrl', function($scope, Auth, Messages, $ionicScrollDelegate) {

  // EMAIL & PASSWORD AUTHENTICATION

  // Check for the user's authentication state
  Auth.$onAuthStateChanged(function(authData) {
    console.log('authData: ', authData);
    if (authData) {
      $scope.loggedInUser = authData;
      $scope.messages = Messages.getMsgs();
      $scope.messages.$watch(function(event) {
        console.log(event);
        $ionicScrollDelegate.scrollBottom();
      });
    } else {
      $scope.loggedInUser = null;
    }
  });

  // Create a new user, called when a user submits the signup form
  $scope.createUser = function(user) {
    Auth.$createUserWithEmailAndPassword(user.email, user.pass).then(function() {
      // User created successfully, log them in
      return Auth.$signInWithEmailAndPassword(user.email, user.pass);
    }).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $scope.loggedInUser = authData;
    }).catch(function(error) {
      console.log('Error: ', error);
    });
  };

  // Login an existing user, called when a user submits the login form
  $scope.login = function(user) {
    Auth.$signInWithEmailAndPassword(user.email, user.pass).then(function(authData) {
      console.log('Logged in successfully as: ', authData.uid);
      $scope.loggedInUser = authData;
      $scope.messages = Messages.getMsgs();
    }).catch(function(error) {
      console.log('Error: ', error);
    });
  };

  // Log a user out
  $scope.logout = function() {
    $scope.loggedInUser = null;
    Auth.$signOut();
  };


  // Add a message to a synchronized array using $add with $firebaseArray
  $scope.addMessage = function(message) {
    if ($scope.loggedInUser) {
      Messages.getMsgs().$add({
        email: $scope.loggedInUser.email,
        text: message.text
      });
      message.text = "";
    }
  };

})

.run(function($ionicPlatform, FBURL) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (FBURL === "https://xxx.firebaseio.com/") {
      angular.element(document.getElementById('app-content')).html('<h1>Please configure your Firebase URL in www/js/app.js before running!</h1>');
    }
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.filter('split', function() {
        return function(input, splitChar, splitIndex) {
            if (input) return input.split(splitChar)[splitIndex];
        }
})
