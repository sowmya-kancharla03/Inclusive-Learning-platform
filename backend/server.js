import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { userRoute } from "./APIs/userAPI.js";
import { courseRoute } from "./APIs/courseAPI.js";
import { studentRoute } from "./APIs/studentAPI.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://inclusive-learning-platform.vercel.app"
  ],
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/user-api", userRoute);
app.use("/course-api", courseRoute);
app.use("/student-api", studentRoute);
app.use("/uploads", express.static("uploads"));


// Connect DB and Start Server
async function connectToDBAndStartServer() {
  try {

    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.log("Error in connection:", err.message);
  }
}

connectToDBAndStartServer();
