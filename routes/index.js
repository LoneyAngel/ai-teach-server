const test = require("./modules/testRouter");
const ai = require("./modules/aIRouter_kimi");
const user = require("./modules/userRouter");

module.exports = (app) => {
  app.use("/test", test); //设置访问该文件下的路由的根路由(测试路由)
  app.use("/ai", ai);
  app.use("/user", user);
};
