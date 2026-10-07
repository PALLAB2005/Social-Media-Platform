const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/socialmedia", {
      // These options are no longer needed in Mongoose 6+
      // but kept for backward compatibility
      // useNewUrlParser: true,    // Remove or comment out
      // useUnifiedTopology: true  // Remove or comment out
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;