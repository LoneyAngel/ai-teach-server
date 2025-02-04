/*
调用ai接口的接口层
允许用户添加其他的sdk，帮用户妥善处理
- kimi
- deepseek
- 其他的

功能
- 实现流式输出
- 实现多轮对话
*/
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const express = require("express");
const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.API_KEY, // 使用环境变量存储API密钥
  baseURL: process.env.AI_URL,
});

let messages = [
  {
    role: "system",
    content:
      "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
  },
];

/**
 * 聊天
 * 实现：上下文记忆
 * 功能：根据上下文记忆，回答，并返回回答
 *  */
async function workForConnection(input) {
  try {
    messages.push({
      role: "user",
      content: input,
    });

    const completion = await client.chat.completions.create({
      model: "moonshot-v1-auto",
      messages: messages,
      temperature: 0.3,
      presence_penalty: 1.0,
    });

    const assistantMessage = completion.choices[0].message;
    messages.push(assistantMessage); //添加ai上次的回答
    console.log(assistantMessage);
    return assistantMessage.content;
  } catch (error) {
    console.error("发生错误：", error.message);
    return null;
  }
}

//流式输出
/*
需要让前端不停的接受发送的信息
*/
async function liu() {
  const stream = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: messages,
    temperature: 0.3,
    stream: true, // <-- 注意这里，我们通过设置 stream=True 开启流式输出模式
  });

  // 当启用流式输出模式（stream=True），SDK 返回的内容也发生了变化，我们不再直接访问返回值中的 choice
  // 而是通过 for 循环逐个访问返回值中每个单独的块（chunk）
  let message = "";
  for await (const chunk of stream) {
    // 在这里，每个 chunk 的结构都与之前的 completion 相似，但 message 字段被替换成了 delta 字段
    const delta = chunk.choices[0].delta; // <-- message 字段被替换成了 delta 字段

    if (delta.content) {
      // 我们在打印内容时，由于是流式输出，为了保证句子的连贯性，我们不人为地添加
      // 换行符，因此通过设置 end="" 来取消 print 自带的换行符。
      res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
    }
  }
  res.end();
}

app.get("/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const stream = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    messages: messages,
    temperature: 0.3,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0].delta;
    if (delta.content) {
      res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
    }
  }

  res.end();
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//即添加文件处理模块
/*
1.资源不保存在服务器，挂在用户数据库下面
2.因为服务器资源的有限，所以最好是网络资源
3.前端接受资源，将资源转发到服务器进行处理
*/
// "请把这个PDF转换成Markdown";
async function workForPdfToMarkdown(filePath, message = "解释内容") {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    messages.push({
      role: "system",
      content: fileContent,
    });

    messages.push({
      role: "user",
      content: message,
    });

    const completion = await client.chat.completions.create({
      messages: messages,
      temperature: 0.3,
      model: "moonshot-v1-32k",
    });

    const text = completion.choices[0].message.content;
    messages.push(completion.choices[0].message); // 存储助手回复

    return text;
  } catch (error) {
    console.error("发生错误：", error.message);
    return null;
  }
}

//简单的实现交流
router.get("/api/:message", async (req, res) => {
  const message = req.params.message;
  console.log(message);
  try {
    const data = await workForConnection(message);
    const result = { data: data };
    console.log(result);
    res.send(result);
  } catch (error) {
    console.error("发生错误：", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
