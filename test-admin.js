
try {
    const admin = require('firebase-admin');
    console.log("firebase-admin loaded successfully");
    const { initializeApp } = require('firebase-admin/app');
    console.log("firebase-admin/app loaded successfully");
} catch (e) {
    console.error("Error loading firebase-admin:", e);
}
