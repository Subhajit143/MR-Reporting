import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT);
    req.user = decoded; // ✅ now req.user.id will be available
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
