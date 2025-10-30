// ===========================================================
// 🌟 SERVER.JS — BACKEND BUỔI 5: USER MANAGEMENT FULL
// ===========================================================

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// 🌟 Import các routes
const authRoutes = require(path.join(__dirname, "routes", "auth"));
const userRoutes = require(path.join(__dirname, "routes", "user"));

// 🌟 Khởi tạo app Express
const app = express();
const PORT = process.env.PORT || 4000;

// ===========================================================
// ⚙️ CẤU HÌNH CORS CHUẨN (Local + Ngrok)
// ===========================================================
const allowedOrigins = [
  "http://localhost:3001", // ✅ React local
  "https://microelectronic-corrin-strung.ngrok-free.dev", // ✅ Ngrok
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Cho phép Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("🚫 Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

// ✅ Áp dụng CORS cho toàn bộ app
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Cho phép preflight

// ===========================================================
// 🧰 Middleware khác
// ===========================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Debug log
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    console.log("   📦 Body:", req.body);
  }
  if (req.headers.origin) {
    console.log("   🌐 Origin:", req.headers.origin);
  }
  if (req.headers.authorization) {
    console.log("   🔑 Token:", req.headers.authorization);
  }
  next();
});

// ===========================================================
// 🏠 Route cơ bản
// ===========================================================
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully with Authentication + CRUD!");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongooseReadyState: mongoose.connection.readyState,
  });
});

// ===========================================================
// 🗄️ KẾT NỐI MONGODB
// ===========================================================
mongoose.set("strictQuery", false);
mongoose.set("bufferTimeoutMS", 60000);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
// Mount routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);

    // Khởi động server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log("🧠 mongoose.readyState =", mongoose.connection.readyState);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// ===========================================================
// ⚙️ Middleware xử lý lỗi
// ===========================================================
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.error("❌ CORS Error:", req.headers.origin);
    return res.status(403).json({ message: "CORS: Origin not allowed" });
  }
  console.error("❌ Server Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});