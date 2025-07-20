import { Webhook } from "svix";
import User from "../models/User.js";

// wahahahah aleave me alone 

export const clerkWebhooks = async ()=> {
    try {
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        await whook.verify(JSON.stringify(req.body),{
            "svix-id" : req.headers['svix-id'],
            'svix-timestamp': req.headers["svix-timestamp"],
            'svix-signature': req.headers["svix-signature"],
        })

        const {data, type} = req.body

        switch(type){
            case 'user.created':{
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_addresses,
                    name:data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }

                await User.create(userData)
                resizeBy.json({})
                break
            }

            case 'user.updated' : {
                    const userData = {
                    email: data.email_addresses[0].email_addresses,
                    name:data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id,userData)
                res.send({})
                breakl
            }

            case "user.deleted" : {
                await User.findByIdAndDelete(data.id)
                res.json({})
                break;
            }

            default:
                break;
        }
        
    } catch (error) {
        res.json({success : false, message: error.message})
    }
}