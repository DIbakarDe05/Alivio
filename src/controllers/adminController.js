
const User = require("../models/User");
const Department = require("../models/Department");

// ======================================
// CREATE STAFF ACCOUNT (ADMIN ONLY)
// ======================================

const createStaff = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      department
    } = req.body;

    // 1. Validate required fields
    if (!fullName || !email || !password || !department) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // 2. Validate input types
    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof department !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid input format"
      });
    }

    // 3. Validate password
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email cannot be empty"
      });
    }

    // 4. Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    // 5. Verify department exists
    const departmentExists = await Department.findById(
      department
    );

    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    // 6. Create staff account
    const staff = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      role: "staff",
      department: departmentExists._id,
      isActive: true,
      createdBy: req.user._id,
      mustChangePassword: true
    });

    // 7. Send response
    return res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      staff: {
        id: staff._id,
        fullName: staff.fullName,
        email: staff.email,
        role: staff.role,
        department: staff.department,
        mustChangePassword: staff.mustChangePassword
      }
    });

  } catch (error) {
    console.error("Create Staff Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create staff account"
    });
  }
};

module.exports = {
  createStaff
};
