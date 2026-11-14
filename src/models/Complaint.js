
const mongoose = require("mongoose");

// Allowed complaint categories and statuses
const complaintCategories = [
  "electrical",
  "plumbing",
  "civil",
  "cleanliness",
  "internet",
  "other",
];

const complaintStatuses = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved_pending_verification",
  "closed",
  "rejected",
  "reopened",
];

// Status history sub-schema
const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: complaintStatuses,
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    note: {
      type: String,
      trim: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Assignment history sub-schema
const assignmentHistorySchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    action: {
      type: String,
      enum: ["assigned", "accepted", "rejected", "reassigned"],
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    note: {
      type: String,
      trim: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main complaint schema
const complaintSchema = new mongoose.Schema(
  {
    // 1. Basic complaint information
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: complaintCategories,
      required: true,
    },

    // 2. Complaint images
    images: [
      {
        type: String,
      },
    ],

    // 3. Complaint location
    location: {
      building: String,
      room: String,
      description: String,

      // GeoJSON coordinates
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number],
          validate: {
            validator: function (value) {
              return (
                value.length === 2 &&
                value[0] >= -180 &&
                value[0] <= 180 &&
                value[1] >= -90 &&
                value[1] <= 90
              );
            },
            message: "Coordinates must be [longitude, latitude]",
          },
        },
      },
    },

    // 4. Student who submitted the complaint
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 5. Department assignment
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    // 6. Staff assignment
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignmentStatus: {
      type: String,
      enum: ["unassigned", "pending", "accepted", "rejected"],
      default: "unassigned",
    },

    assignmentHistory: [assignmentHistorySchema],

    // 7. AI classification
    aiClassification: {
      suggestedCategory: {
        type: String,
        enum: complaintCategories,
      },

      suggestedPriority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
      },

      suggestedDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },

      processedAt: Date,
    },

    // 8. Actual complaint priority
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    // 9. Duplicate complaint detection
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },

    duplicateStatus: {
      type: String,
      enum: ["none", "possible", "confirmed", "dismissed"],
      default: "none",
    },

    similarityScore: {
      type: Number,
      min: 0,
      max: 1,
    },

    // 10. Complaint status
    status: {
      type: String,
      enum: complaintStatuses,
      default: "submitted",
    },

    // 11. Complete status history
    statusHistory: [statusHistorySchema],

    // 12. Resolution information
    resolution: {
      description: String,

      evidence: [
        {
          type: String,
        },
      ],

      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      resolvedAt: Date,

      verifiedByReporter: {
        type: Boolean,
        default: false,
      },

      verifiedAt: Date,

      verificationNote: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
complaintSchema.index({
  status: 1,
  createdAt: -1,
});

complaintSchema.index({
  reportedBy: 1,
  createdAt: -1,
});

complaintSchema.index({
  assignedDepartment: 1,
  status: 1,
});

complaintSchema.index({
  assignedStaff: 1,
  status: 1,
});

// Geospatial index
complaintSchema.index({
  "location.coordinates": "2dsphere",
});

// Export model
module.exports = mongoose.model("Complaint", complaintSchema);
