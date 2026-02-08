const mongoose = require('mongoose');
const uriTemplate = "mongodb+srv://hariniprithiyangarahp06:PASSWORD@cluster0.md2c37u.mongodb.net/";

async function testPassword(password) {
    const uri = uriTemplate.replace('PASSWORD', password);
    console.log(`Testing password: '${password}'...`);
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`✅ SUCCESS! Password '${password}' is correct.`);
        await mongoose.disconnect();
        return true;
    } catch (err) {
        console.log(`❌ Failed with password '${password}': ${err.message}`);
        return false;
    }
}

async function run() {
    // Try 'mysecure'
    if (await testPassword('mysecure')) process.exit(0);

    // Try 'mysecurepass123' (what was in the brackets)
    if (await testPassword('mysecurepass123')) process.exit(0);

    // Try 'mysecurepass' (common variation)
    if (await testPassword('mysecurepass')) process.exit(0);

    console.log("⚠️ All attempted passwords failed.");
    process.exit(1);
}

run();
