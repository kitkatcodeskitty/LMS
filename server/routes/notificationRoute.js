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

// All routes require authentication
notificationRouter.use(verify);

// Get user notifications
notificationRouter.get("/", getUserNotifications);

// Get unread notification count
notificationRouter.get("/unread-count", getUnreadNotificationCount);

// Mark notification as read
notificationRouter.put("/:notificationId/read", markNotificationAsRead);

// Mark all notifications as read
notificationRouter.put("/mark-all-read", markAllNotificationsAsRead);

// Delete notification
notificationRouter.delete("/:notificationId", deleteNotification);

export default notificationRouter;
