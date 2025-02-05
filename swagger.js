const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "Your API Description",
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            ulid: {
              type: "string",
              description: "Unique identifier for the user",
            },
            account: {
              type: "string",
              description: "User account",
            },
            password: {
              type: "string",
              description: "User password",
            },
            username: {
              type: "string",
              description: "Username",
            },
            createTime: {
              type: "string",
              format: "date-time",
              description: "User creation time",
            },
          },
          required: ["account", "password"],
        },
        Resource: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Resource name",
            },
            description: {
              type: "string",
              description: "Resource description",
            },
          },
          required: ["name"],
        },
        ChatMessage: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message sender (user or assistant)",
            },
            content: {
              type: "string",
              description: "Content of the message",
            },
          },
          required: ["role", "content"],
        },
        ChatResponse: {
          type: "object",
          properties: {
            data: {
              type: "string",
              description: "Response message from the AI",
            },
          },
          required: ["data"],
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  servers: [
    {
      url: "http://localhost:3000", // 根据你的服务器地址修改
    },
  ],
  apis: ["./routes/modules/*.js"], // 指定你的路由文件路径
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};