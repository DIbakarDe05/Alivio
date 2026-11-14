
const express = require("express");
const router = express.Router();

// Admin controller
const {
  createStaff
} = require("../controllers/adminController");

// Authentication middleware
const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

// ======================================
// CREATE STAFF ACCOUNT
// ADMIN ONLY
// ======================================

router.post(
  "/staff",
  protect,
  authorize("admin"),
  createStaff
);

module.exports = router;
