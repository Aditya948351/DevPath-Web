
const client = require('firebase-tools');

async function test() {
    try {
        console.log("Attempting to list projects via firebase-tools...");
        const projects = await client.projects.list();
        console.log("Projects:", projects.length);

        // Try to get access token
        // client.login is not a standard public API, but let's check what we have
        // The CLI uses 'google-auth-library' internally.

        console.log("Firebase Tools API seems accessible.");

    } catch (e) {
        console.error("Error:", e);
    }
}

test();
