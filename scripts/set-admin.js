const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env');
  process.exit(1);
}

const userEmail = process.argv[2];

if (!userEmail) {
    console.error('Usage: node scripts/set-admin.js <email>');
    process.exit(1);
}

async function setAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // We don't have the model compiled here usually, so we define a basic schema or use valid collection access
    const UserSchema = new mongoose.Schema({
        email: String,
        role: String
    }, { strict: false });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const user = await User.findOneAndUpdate(
        { email: userEmail },
        { $set: { role: 'admin' } },
        { new: true }
    );

    if (user) {
        console.log(`Successfully set ${userEmail} as admin.`);
        console.log(user);
    } else {
        console.log(`User ${userEmail} not found.`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

setAdmin();
