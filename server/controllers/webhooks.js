import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  const headers = {
    "svix-id": req.headers["svix-id"],
    "svix-timestamp": req.headers["svix-timestamp"],
    "svix-signature": req.headers["svix-signature"],
  };

  const payload = req.body; // raw body (Buffer)
  const body = payload.toString(); // convert Buffer to string
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(body, headers);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return res.status(400).json({ error: "Invalid webhook signature." });
  }

  const { data, type } = evt;

  try {
    if (type === "user.created") {
      const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        imageUrl: data.image_url,
      };
      await User.create(userData);
      return res.status(200).json({ success: true });
    }

    if (type === "user.updated") {
      const userData = {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        imageUrl: data.image_url,
      };
      await User.findByIdAndUpdate(data.id, userData);
      return res.status(200).json({ success: true });
    }

    if (type === "user.deleted") {
      await User.findByIdAndDelete(data.id);
      return res.status(200).json({ success: true });
    }

    return res.status(200).json({ success: true }); // for unhandled types
  } catch (err) {
    console.error("Error processing webhook:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
