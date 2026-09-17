import jwt from "jsonwebtoken";

// Verify Token Middleware
export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
  


// Student Role Middleware
export const verifyStudent = (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access restricted to Students only" });
    }
    next();
};


// Teacher Role Middleware
export const verifyTeacher = (req, res, next) => {
    if (req.user.role !== "teacher") {
        return res.status(403).json({ message: "Access restricted to Teachers only" });
    }
    next();
};
