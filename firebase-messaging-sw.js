importScripts("https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js");

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBBCH7FOUvj0NBL9y7u1IhweMg24b43zrA",
  authDomain: "test-noti-web-c0cb4.firebaseapp.com",
  projectId: "test-noti-web-c0cb4",
  storageBucket: "test-noti-web-c0cb4.appspot.com",
  messagingSenderId: "8328105539",
  appId: "1:8328105539:web:e7138cc5067ee098e6cef6",
  measurementId: "G-K0JCV5K7KP",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
