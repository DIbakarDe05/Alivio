
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    // Department name
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // Short department code
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    // Department description
    description: {
      type: String,
      trim: true
    },

    // Department head
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // Staff members belonging to this department
    staffMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    // Department availability
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Department",
  departmentSchema
);
