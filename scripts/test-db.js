const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 1. Manually read .env file to avoid dependencies
const envPath = path.resolve(__dirname, '../.env');
console.log(`[Test] Reading .env from: ${envPath}`);

let uri = '';
try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match && match[1]) {
        uri = match[1].trim();
        // Remove comments if any
        if (uri.includes('#')) {
            uri = uri.split('#')[0].trim();
        }
    }
} catch (err) {
    console.error('[Error] Failed to read .env file:', err.message);
    process.exit(1);
}

if (!uri) {
    console.error('[Error] MONGODB_URI not found in .env file');
    process.exit(1);
}

// Mask password for logging
const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
console.log(`[Test] Connection String: ${maskedUri}`);

// 2. Attempt Connection
async function testConnection() {
    console.log('[Test] Connecting to MongoDB...');
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 10000,
        });
        console.log('\n✅ [SUCCESS] Successfully connected to MongoDB!');
        console.log(`   - Database Name: ${mongoose.connection.name}`);
        console.log(`   - Host: ${mongoose.connection.host}`);
        console.log(`   - Port: ${mongoose.connection.port}`);
        console.log('\n[Test] Closing connection...');
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('\n❌ [FAILED] Could not connect to MongoDB.');
        console.error('   Error Name:', err.name);
        console.error('   Error Message:', err.message);

        if (err.message.includes('bad auth')) {
            console.error('\n--> Diagnosis: Incorrect Username or Password.');
        } else if (err.message.includes('ETIMEDOUT') || err.message.includes('querySrv ETIMEOUT')) {
            console.error('\n--> Diagnosis: Network Timeout / Firewall Block.');
            console.error('    Please check if your IP address is whitelisted in MongoDB Atlas.');
        } else if (err.message.includes('SSL')) {
            console.error('\n--> Diagnosis: SSL/TLS Handshake Error.');
        }

        process.exit(1);
    }
}

testConnection();
