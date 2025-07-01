// models/Notification.model.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Receiver of notification,
  role: {type: String},
  concernId: String,
  concernType: String,
  concernText: String,
  concernRaisedBy: String,
  isNotified: { type: Boolean, default: true },
  isRead: { type: Boolean, default: false },
  isSomeoneReverted: { type: Boolean, default: false },
  notificationDate: { type: Date, default: Date.now },
  uri1: {type: String, default:"NA"},
  uri2: {type: String, default:"NA"},
  uri3: {type: String, default: "NA"}
});



export const Notification = mongoose.model("Notification", NotificationSchema);
