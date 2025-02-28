import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js' 

//app config
const app = express();
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors())


// API endpoints
app.use('/api/admin',adminRouter)
// localhost:4000/api/admin/add-doctor

app.get('/', (req, res) => {
  res.send("API is working")
})



// Start the server
app.listen(port, ()=> console.log("server is running on ",port)
);
