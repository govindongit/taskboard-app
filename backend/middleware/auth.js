const jwt = require("jsonwebtoken");

// This runs on every GraphQL request
// It reads the token from the Authorization header, verifies it, returns the user payload
// The return value gets attached to GraphQL context in index.js

const getUser = (req) => {
  // Token arrives in the header as: "Bearer eyJhbGc..."
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");

    try {
      // jwt.verify checks the signature AND the expiry
      // Returns the decoded payload if valid: { id, email, iat, exp }
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Token is invalid, tampered, or expired — user is not authenticated
      return null;
    }
  }

  return null;
};

module.exports = getUser;
