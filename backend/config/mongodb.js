import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI; // Ensure this is correctly set in .env
    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in .env file");
    }

    await mongoose.connect(mongoURI, {
      dbName: "prescripto",  // Specify database name explicitly
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Database connected successfully");
  } catch (err) {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
