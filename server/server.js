import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./configs/mongodb.js";
import { clearWebhooks } from "./controllers/webhooks.js";

// Express
const app = express();


// Database connection
await connectDB()

// middlewares
app.use(cors());

// routes
app.get('/',(req,res)=> res.send('Api working'));
app.post('/clerk', express.json(), clearWebhooks);

// Port number
const PORT = process.env.PORT || 5000 

app.listen(PORT, ()=>{
    console.log(`Server is Running on port ${PORT}`)
})

