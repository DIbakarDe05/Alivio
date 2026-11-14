
const express = require("express");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");


// ======================================
// REGISTRATION AND LOGIN
// ======================================

router.post("/register", register);

router.post("/login", login);


// ======================================
// AUTHENTICATED USER PROFILE
// ======================================

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user
  });
});


// ======================================
// STUDENT TEST ROUTE
// ======================================

router.get(
  "/student-test",
  protect,
  authorize("student"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Student access granted"
    });
  }
);


// ======================================
// STAFF TEST ROUTE
// ======================================

router.get(
  "/staff-test",
  protect,
  authorize("staff"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Staff access granted"
    });
  }
);


// ======================================
// ADMIN TEST ROUTE
// ======================================

router.get(
  "/admin-test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted"
    });
  }
);


module.exports = router;
