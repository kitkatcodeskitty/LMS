// controllers/webhooks.js
import { Webhook } from "svix";
import User from "../models/user.model.js"; // Make sure path is correct

export const clerkWebhooks = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined in env");
    }

    const svix = new Webhook(WEBHOOK_SECRET);
    const payload = req.body;
    const headers = req.headers;

    // Verify signature
    const event = svix.verify(payload, headers);

    const { id, email_addresses, first_name, last_name } = event.data;

    if (event.type === "user.created") {
      // Check if user already exists (avoid duplicates)
      const existingUser = await User.findById(id);
      if (!existingUser) {
        const newUser = new User({
          _id: id,
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          email: email_addresses[0].email_address,
        });

        await newUser.save();
        console.log("✅ User saved:", newUser);
      } else {
        console.log("ℹ️ User already exists:", existingUser.email);
      }
    }

    res.status(200).json({ message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(400).json({ error: "Webhook handler failed" });
  }
};
