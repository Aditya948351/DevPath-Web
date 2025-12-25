
try {
    const apiv2 = require('firebase-tools/lib/apiv2');
    console.log("apiv2 keys:", Object.keys(apiv2));
    console.log("apiv2.Client:", typeof apiv2.Client);
} catch (e) {
    console.error("Error:", e);
}
