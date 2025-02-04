/*
测试api
*/

const express = require("express");
const router = express.Router();
const random  = require("../utils/random");
router.get("/hello", (req, res) => {
  //
  //(请求，响应)
  //req.body返回的是请求体
  //req.params返回的是请求参数
  //res是响应体
  //get请求
  res.send({ id: 1, message: "Hello World!" }); //发送的是相应的数据
});

router.post("/hi/:id", (req, res) => {
  //post请求
  const { id } = req.params;
  res.send({ id: { id }, message: "Hello World!", nihao: req.body });
});

router.get("/", (req, res) => {
  //(请求，响应)
  //req.body返回的是请求体
  //req.params返回的是请求参数
  //res是响应体
  //get请求
  logger.info("Hello World!");
  res.send("Hello World!");
});

module.exports = router;



// 示例路由，生成随机中文名字
router.get("/random-name", (req, res) => {
  const randomName = random("用户",5); // 生成随机全名
  res.send(`随机生成的中文名字是：${randomName}`);
});