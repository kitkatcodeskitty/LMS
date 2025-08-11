import express from "express";
import { verify } from "../auth.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();


notificationRouter.use(verify);
notificationRouter.get("/", getUserNotifications);
notificationRouter.get("/unread-count", getUnreadNotificationCount);
notificationRouter.put("/:notificationId/read", markNotificationAsRead);
notificationRouter.put("/mark-all-read", markAllNotificationsAsRead);
notificationRouter.delete("/:notificationId", deleteNotification);

export default notificationRouter;
