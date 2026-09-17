import express from 'express';
import { UserModel } from '../models/userModel.js';
import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';

// import middlewares
import { verifyToken, verifyStudent, verifyTeacher } from '../middlewares/authMiddleware.js';

export const userRoute = express.Router();

const { sign } = jwt;


// REGISTER

userRoute.post('/register', async (req, res) => {
    try {
        let newUser = req.body;

        // email uniqueness check
        let userInDB = await UserModel.findOne({ email: newUser.email });
        if (userInDB) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // hash password
        let hashedPassword = await hash(newUser.password, 12);
        newUser.password = hashedPassword;

        // save new user
        let newUserDoc = new UserModel(newUser);
        await newUserDoc.save();

        res.status(200).json({ message: "User Registered Successfully" });

    } catch (err) {
        res.status(400).json({ message: "Registration error", reason: err.message });
    }
});


// LOGIN

userRoute.post('/login', async (req, res) => {
    try {
      const userData = req.body;
  
      const userInDB = await UserModel.findOne({ email: userData.email });
      if (!userInDB) {
        return res.status(400).json({ message: "Invalid Email - user not found" });
      }
  
      const isEqual = await compare(userData.password, userInDB.password);
      if (!isEqual) {
        return res.status(400).json({ message: "Invalid Password" });
      }
  
      const encodedToken = sign(
        {
          id: userInDB._id,
          email: userInDB.email,
          role: userInDB.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      // ✅ SET TOKEN IN HTTPONLY COOKIE
      res.cookie("token", encodedToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });
  
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: userInDB._id,
          name: userInDB.name,
          email: userInDB.email,
          role: userInDB.role
        }
      });
  
    } catch (err) {
      res.status(400).json({ message: "Login error", reason: err.message });
    }
  });
  


// PROTECTED ROUTES (Examples)
// Logout
userRoute.post("/logout", (req, res) => {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
  
    res.status(200).json({ message: "Logged out successfully" });
  });
  




// Common for both
userRoute.get("/profile", verifyToken, async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id)
        .select("name email role");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile loaded",
        user
      });
    } catch (err) {
      res.status(400).json({
        message: "Failed to load profile"
      });
    }
  });
  

  
