
try {
    const auth = require('firebase-tools/lib/auth');
    const account = auth.getGlobalDefaultAccount();
    console.log("Account:", JSON.stringify(account, null, 2));

    if (auth.getAccessToken) {
        console.log("getAccessToken exists");
    } else {
        console.log("getAccessToken MISSING");
    }
} catch (e) {
    console.error("Error:", e);
}
