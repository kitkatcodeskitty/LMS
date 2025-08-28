import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { errorHandler } from "../auth.js";

// Create a new notification
export const createNotification = async (userId, title, message, type = "info", relatedCourseId = null, relatedAction = null) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedCourseId,
      relatedAction,
    });

    await notification.save();

    // Add notification to user's notifications array
    await User.findByIdAndUpdate(userId, {
      $push: { notifications: notification._id }
    });

    return notification;
  } catch (error) {
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .populate("relatedCourseId", "courseTitle courseThumbnail");

    res.json({ success: true, notifications });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // Remove notification from user's notifications array
    await User.findByIdAndUpdate(userId, {
      $pull: { notifications: notificationId }
    });

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.countDocuments({ userId, isRead: false });

    res.json({ success: true, count });
  } catch (error) {
    errorHandler(error, req, res, null);
  }
};
