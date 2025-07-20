import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connecDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

// initialize express
const app = express()

// connect to db
await connecDB()

// middlewares roidinxu ma 
app.use(cors())

// route
app.get('/', (req,res)=> res.send("api working"))
app.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhooks);


// port number
const PORT = process.env.PORT || 5000 

app.listen(PORT, ()=> console.log(`server is running on ${PORT}`))
