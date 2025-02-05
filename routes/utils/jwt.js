const jwt = require("jsonwebtoken");
const Refresh = require("../class/refresh_token");
const jwt_secret = process.env.ACCESS_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRATION = "15m"; // 15 分钟
const REFRESH_TOKEN_EXPIRATION = "7d"; // 7 天

//目前的token只包含用户id
//验证使用access-token
//刷新使用refresh-token



const auth = (req, res, next) => {
  const token = req.header("Authorization");//是access-token

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



// 生成 Access Token
function generateAccessToken(user) {
  return jwt.sign(
    { 
      userId: user.id
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    }
  );
}

// 生成 Refresh Token
function generateRefreshToken(user) {
  const refreshToken = jwt.sign(
    { 
      userId: user.id
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    }
  );
  const tokenExpireDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Refresh.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: tokenExpireDate,
  });

  return refreshToken;
}


module.exports = {
  auth,
  generateAccessToken,
  generateRefreshToken,
};
