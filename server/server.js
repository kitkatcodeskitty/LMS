import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connecDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'

// initialize express
const app = express()

// connect to db
await connecDB()

// middlewares
app.use(cors())
app.use(express.json()); 

app.post('/clerk', clerkWebhooks);

app.post('/clerk',express.json(), clerkWebhooks)
// route
app.get('/', (req,res)=> res.send("api working"))


// port number
const PORT = process.env.PORT || 5000 

app.listen(PORT,()=>{
    console.log(`server is runing on ${PORT}`)
})

