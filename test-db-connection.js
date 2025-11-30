const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/policypilot";

console.log('\n🔍 Testing MongoDB connection...');
console.log('Using URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('\n✅ Successfully connected to MongoDB!');
        console.log('📊 Database:', mongoose.connection.db.databaseName);
        console.log('🌐 Host:', mongoose.connection.host);
        console.log('\n🎉 Your MongoDB connection is working! The delete functionality should work now.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ MongoDB connection failed!');
        console.error('📝 Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Possible causes:');
            console.error('   1. MongoDB Atlas cluster is PAUSED - Go to https://cloud.mongodb.com and resume it');
            console.error('   2. Wrong connection string in .env file');
            console.error('   3. Network/firewall blocking the connection');
        } else if (error.message.includes('authentication failed')) {
            console.error('\n💡 Authentication issue:');
            console.error('   - Check your username/password in MONGODB_URI');
        } else if (error.message.includes('not authorized') || error.message.includes('IP')) {
            console.error('\n💡 IP Address not whitelisted:');
            console.error('   - Go to MongoDB Atlas → Network Access');
            console.error('   - Add your current IP or use 0.0.0.0/0 (allow all) for testing');
        }

        console.error('\n🔧 Next steps:');
        console.error('   1. Check https://cloud.mongodb.com - ensure cluster is running');
        console.error('   2. Verify Network Access settings');
        console.error('   3. Double-check connection string in .env file');

        process.exit(1);
    });
