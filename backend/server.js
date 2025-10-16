const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const User = require("./User");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("❌ Missing MONGO_URI in environment variables");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.post("/users", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "username, email, and password are required" });
    }

    const newUser = new User({ username, email, password });
    const createdUser = await newUser.save();

    res.status(201).json(createdUser);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    console.error("❌ Failed to create user:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));
