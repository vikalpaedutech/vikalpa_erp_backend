// models/Notification.model.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Receiver of notification
  concernId: String,
  concernType: String,
  concernText: String,
  concernRaisedBy: String,
  isNotified: { type: Boolean, default: true },
  isRead: { type: Boolean, default: false },
  isSomeoneReverted: { type: Boolean, default: false },
  notificationDate: { type: Date, default: Date.now },
});



export const Notification = mongoose.model("Notification", NotificationSchema);
