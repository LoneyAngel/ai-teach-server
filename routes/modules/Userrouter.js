/*
和用户数据库进行交互的部分（直接交互）
*/
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { ulid } = require("ulid");
const User = require("../class/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth, jwt_secret } = require("../utils/jwt");

// 提取时间戳（登陆的时间）
// const timestamp = ulid.decodeTime(id);
// console.log("创建时间:", new Date(timestamp).toISOString());

/*
 * 尽量数据库访问直接获取正确的信息
 */
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 用户管理
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: 注册
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Server error
 */

// 注册
router.post("/register", async (req, res) => {
  try {
    const { account, password } = req.query;
    console.log(account, password);
    // 检查用户是否存在
    const userExists = await User.findOne({ account });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10); //加密
    const hashedPassword = await bcrypt.hash(password.toString(), salt);
    const id = ulid();
    const user = new User({
      ulid: id,
      account: account,
      password: hashedPassword,
      username: id.substring(16, 25),
      createTime: new Date().toLocaleString(),
    });

    await user.save();
    let _ = user.toObject();

    res.json({
      message: "User registered successfully",
      data: _,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: 登录
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
// 登录
router.post("/login", async (req, res) => {
  try {
    const { account, password } = req.query;
    console.log(account, password);
    const user = await User.findOne({ account });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // 生成 JWT
    const token = jwt.sign({ userId: user.id }, jwt_secret, {
      expiresIn: "24h",
    });
    console.log("token", token);
    res.json({
      message: "登录成功",
      data: user.toObject(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: 获取当前用户的信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// 获取当前用户信息
router.get("/me", auth, async (req, res) => {
  try {
    console.log("Authorization header:", req.headers.authorization);

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error("Authorization header missing");
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const userId = req.user.userId;
    if (!userId) {
      console.error("Invalid token");
      return res.status(401).json({ message: "Invalid token" });
    }

    console.log("User ID from token:", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      data: user,
    });
  } catch (err) {
    console.error("Error in /me route:", err.message);
    res.status(500).json({ message: err.message });
  }
});

/**
 * 测试api
 */
router.get("/create/:name", async (req, res) => {
  const name = req.query.name;
  try {
    const user = await User.create({ name });
    res.json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user" });
  }
});

/**
 * @swagger
 * /user/getall:
 *   get:
 *     summary: 获取所有用户信息(admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
//对于管理员而言
router.get("/getall", auth, async (req, res) => {
  //表示此中间件对这个函数生效
  try {
    const users = await User.find({});
    res.json({ data: users }); // 使用res.json返回JSON格式的数据
  } catch (err) {
    res.status(500).json({ message: "Error retrieving users" });
  }
});

module.exports = router;
