
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Related complaint
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null
    },

    // Notification heading
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true
    },

    // Notification category
    type: {
      type: String,
      enum: [
        "complaint_submitted",
        "complaint_update",
        "new_assignment",
        "assignment_update",
        "resolution",
        "verification",
        "escalation",
        "general"
      ],
      required: true
    },

    // Read/unread status
    isRead: {
      type: Boolean,
      default: false
    },

    // When the notification was read
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Fetch notifications for a particular user
notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1
});

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
