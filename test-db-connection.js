const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    const uri = process.env.MONGO_URI;
    console.log("Testing connection to:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

    try {
        console.log("Attempting to connect...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ Connection SUCCESSFUL! MongoDB is running and accessible.");
        await mongoose.disconnect();
    } catch (error) {
        console.error("\n❌ Connection FAILED.");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);

        if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
            console.log("\n⚠️  DIAGNOSIS: The MongoDB server is reachable, but the PASSWORD or USERNAME is incorrect.");
            console.log("   The URI currently uses a placeholder password like '<mysecurepass123>'.");
            console.log("   You MUST replace <mysecurepass123> with your actual MongoDB Atlas password.");
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.log("\n⚠️  DIAGNOSIS: The MongoDB server is NOT reachable.");
            console.log("   - Check your internet connection.");
            console.log("   - Check if the Cluster is paused in MongoDB Atlas.");
            console.log("   - Check if your IP address is whitelisted in MongoDB Atlas Network Access.");
        }
    }
}

testConnection();
