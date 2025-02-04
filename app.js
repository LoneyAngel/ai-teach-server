require("dotenv").config();
const express = require("express");
const app = express();
const pinoLogger = require("./routes/modules/logger");
const routes = require("./routes"); // 引入路由文件夹
const mongoURI = process.env.MONGO_URI; // MongoDB 连接字符串
const mongoose = require("mongoose");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger"); // 引入 Swagger 配置

const port = process.env.PORT;
console.log("当前环境：", port)
console.log("时间：", new Date().toLocaleString());

// 连接 MongoDB
mongoose
  .connect(mongoURI, {
    maxPoolSize: 5, // 连接池大小（默认 5）
    serverSelectionTimeoutMS: 5000, // 连接超时时间
    socketTimeoutMS: 45000, // 操作超时时间
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app
  .use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))
  .use(cors())
  .use(pinoLogger)
  .use(express.json())
  .use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        code: statusCode,
      },
    });
  })
  .listen(port, () => {
    console.log(`server is running at http://127.0.0.1:${port}`);
  });

routes(app);

// 所有都不匹配的时候匹配这个,404
app.get("*", (req, res) => {
  global.logger.error(`404 Not Found: ${req.originalUrl}`);
  res.status(404).json({ message: "404 Not Found" });
});
