const pino = require("pino");
const fs = require("fs");
const path = require("path");
const rfs = require("rotating-file-stream");

// 创建旋转日志流
const rotatingFileStream = rfs.createStream("combined.log", {
  size: "10M", // 按文件大小轮转
  compress: "gzip", // 使用 gzip 压缩旧日志文件
  maxFiles: 7, // 保留最近 7 个轮转文件
  path: path.join(__dirname, "../log"), // 日志文件夹路径
});

// 创建 logger 实例并将日志写入文件
global.logger = pino(rotatingFileStream); // 将 logger 设置为全局变量

// 确保日志流在应用程序结束时关闭
process.on("SIGINT", () => {
  global.logger.info("Received SIGINT. Shutting down...");
  rotatingFileStream.end();
  process.exit(0);
});

process.on("SIGTERM", () => {
  global.logger.info("Received SIGTERM. Shutting down...");
  rotatingFileStream.end();
  process.exit(0);
});

// 使用 pino.final 确保日志流在请求结束时正确关闭
function pinoLogger(req, res, next) {
  const time = new Date();
  global.logger.info(
    {
      method: req.method,
      url: req.url,
      timestamp: time.toLocaleString(),
    },
    "Request received"
  );

  res.on("finish", () => {
    const endTime = new Date();
    global.logger.info(
      {
        method: req.method,
        url: req.url,
        timestamp: endTime.toLocaleString(),
        responseTime: endTime - time,
      },
      "Request finished"
    );
  });

  // 添加错误处理，确保错误日志也能写入文件
  res.on("error", (err) => {
    global.logger.error(
      {
        method: req.method,
        url: req.url,
        timestamp: new Date().toLocaleString(),
        error: err.message,
      },
      "Request error"
    );
  });
  next();
}

// 添加一个简单的测试函数来验证文件写入功能
//测试成功
// function testLogWrite() {
//   const testStream = rfs.createStream("test.log", {
//     size: "10M",
//     compress: "gzip",
//     maxFiles: 7,
//     path: path.join(__dirname, "log"),
//   });
//   testStream.write("This is a test log entry.\n");
//   testStream.end();
// }
// // 调用测试函数
// testLogWrite();

module.exports = pinoLogger;
