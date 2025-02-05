# 项目架构

- /app.js 项目入口文件
- /routes
  - /index.js 一级路由
  - /class 定义和数据库交互的对象模型
  - /modules 定义其他路由
  - /utils 开发常见的必要组件
  - /log 日志记录

- /swagger.js

# 运行项目

npm install 安装所需的依赖包
npm run dev 运行开发版本
npm run start 运行生产版本

# 须知

- 访问http://127.0.0.1:3000/api-docs获取对应的api文档（并没有搭建完全）
- 本项目使用 expressjs 框架，使用 mongoose 作为数据库连接，使用 restfulapi 文档规范，使用 pino 搭建简易轮转日志

- 注意自己把对应的环境变量换成自己的配置
