import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No token provided");
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

    if (!token) {
      console.error("Invalid token format");
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid token format" });
    }

    // Verify Token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT Verification Failed:", err.message);
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
      }
      req.userId = decoded.userId; // ✅ Correctly store decoded userId in req
      next();
    });
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};

export default authUser;
