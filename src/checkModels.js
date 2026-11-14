
const User = require("./models/User");
const Department = require("./models/Department");
const Complaint = require("./models/Complaint");
const Notification = require("./models/Notification");

const models = [
    User,
    Department,
    Complaint,
    Notification
];

console.log("\nCAMPUSFIX MODEL VALIDATION\n");

models.forEach((model) => {
    console.log("Model:", model.modelName);
    console.log("Collection:", model.collection.name);
    console.log("Fields:", Object.keys(model.schema.paths).length);
    console.log("-----------------------------");
});

console.log("\nAll models loaded successfully!");
