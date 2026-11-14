
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Department = require("./models/Department");

const departments = [
  {
    name: "Electrical",
    code: "ELEC",
    description: "Electrical maintenance and repair"
  },
  {
    name: "Civil",
    code: "CIV",
    description: "Building and infrastructure maintenance"
  },
  {
    name: "Plumbing",
    code: "PLUMB",
    description: "Water supply and plumbing issues"
  },
  {
    name: "IT and Networking",
    code: "IT",
    description: "Internet and network-related issues"
  },
  {
    name: "Sanitation",
    code: "SAN",
    description: "Cleaning and sanitation issues"
  },
  {
    name: "General Maintenance",
    code: "GEN",
    description: "Other campus maintenance issues"
  }
];

const seedDepartments = async () => {
  try {
    await connectDB();

    for (const department of departments) {
      await Department.findOneAndUpdate(
        { code: department.code },
        { $set: department },
        { upsert: true, new: true, runValidators: true }
      );
    }

    console.log("Departments added successfully!");

    const allDepartments = await Department.find();

    console.log(allDepartments);

  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedDepartments();
