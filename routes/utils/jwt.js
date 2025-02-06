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
async function generateAccessToken(user) {
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
async function generateRefreshToken(user) {
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



//检验cookies
//如果返回的是null,则重新创建refresh-token和对应的access-token
async function refresh_token_exist(req){
  const { refreshToken } = req.cookies;
  if (!refreshToken) return null;
  // 验证 Refresh Token 是否存在
  const storedToken = await Token.findOne({
    token: refreshToken,
  });

  //不存在，则退出，应该正常登录
  if (!storedToken)  return null;

  //存在且有效，则试图使用refresh-token生成新的access-token和refresh-token

  // 验证 Refresh Token 的有效期
  if (new Date() > storedToken.expiresAt) {
    await Token.findByIdAndDelete(storedToken._id);
    return null;
  }

  // 生成新的 Access Token 和 Refresh Token
  const newAccessToken = generateAccessToken(storedToken);
  const newRefreshToken = generateRefreshToken(storedToken);

  // 更新 Refresh Token
  storedToken.token = newRefreshToken;
  storedToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await storedToken.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(
      Date.now() + parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) * 1000
    ),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

module.exports = {
  auth,
  generateAccessToken,
  generateRefreshToken,
  refresh_token_exist,
};