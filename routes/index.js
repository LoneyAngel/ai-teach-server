const test = require("./modules/Testrouter");
const ai = require("./modules/AIrouter_kimi");
const user = require("./modules/Userrouter");

module.exports = (app) => {
  app.use("/test", test); //设置访问该文件下的路由的根路由(测试路由)
  app.use("/ai", ai);
  app.use("/user", user);
};
