
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      required: true,
      default: "student",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    permissions: [
      {
        type: String,
        enum: [
          "manage_users",
          "manage_departments",
          "manage_complaints",
          "view_analytics",
          "manage_assignments",
        ],
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    mustChangePassword: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Validate department
userSchema.pre("validate", function () {
  if (this.role === "staff" && !this.department) {
    this.invalidate(
      "department",
      "Staff must belong to a department"
    );
  }

  if (this.role !== "staff" && this.department) {
    this.invalidate(
      "department",
      "Only staff members can belong to a department"
    );
  }
});

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
