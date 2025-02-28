import mongoose from 'mongoose';
import dotenv from 'dotenv'; 

dotenv.config(); 

const connectDB = async () => {
  
  mongoose.connection.on('connected', () => console.log("Database connected"))

  await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`)

}


export default connectDB;




  // try {
  //   // Check if DB_CONNECT is properly loaded
  //   if (!process.env.DB_CONNECT) {
  //     console.error("DB_CONNECT is undefined. Check your .env file.");
  //     return;
  //   }
  // } catch (err) {
  //   console.error('Error connecting to MongoDB:', err.message);
  //   process.exit(1); 
  // }