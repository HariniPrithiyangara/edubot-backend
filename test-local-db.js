const mongoose = require('mongoose');

async function testLocalConnection() {
    const uri = 'mongodb://127.0.0.1:27017/edubot';
    console.log("Testing connection to LOCAL MongoDB:", uri);

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
        console.log("✅ SUCCESS! Connected to LOCAL MongoDB.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ FAILED to connect to LOCAL MongoDB.");
        console.error(error.message);
    }
}

testLocalConnection();
