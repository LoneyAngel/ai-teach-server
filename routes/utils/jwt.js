const jwt = require("jsonwebtoken");
const jwt_secret = "woshishui";
const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }

  try {
    const decoded = jwt.verify(token, jwt_secret);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = {auth,jwt_secret};
