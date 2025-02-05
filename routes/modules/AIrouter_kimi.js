/*
调用ai接口的接口层
允许用户添加其他的sdk，帮用户妥善处理
- kimi
- deepseek
- 其他的
*/
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const express = require("express");
const router = express.Router();
const upload = require("./modules/chat_records");

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
 *  */
async function no_stream_output(input,record_name) {
  //测试用ulid,注意不是_id
  const ulid = "01JJVV15WJM5WAVPWJSBXDZR93";
  
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
    messages.push(assistantMessage);
    //进行聊天记录的保存,从前端获取当前窗口的标识
    upload(
      [
        {
          role: "user",
          content: input,
        },
        assistantMessage,
      ],
      record_name,
      ulid
    );
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
async function stream_output(input, res,record_name) {
  const ulid = "01JJVV15WJM5WAVPWJSBXDZR93";
  try {
    messages.push({
      role: "user",
      content: input,
    });
    const stream = await client.chat.completions.create({
      model: "moonshot-v1-auto",
      messages: messages,
      temperature: 0.3,
      presence_penalty: 1.0,
      stream: true, // <-- 注意这里，我们通过设置 stream=True 开启流式输出模式
    });

    // 当启用流式输出模式（stream=True），SDK 返回的内容也发生了变化，我们不再直接访问返回值中的 choice
    // 而是通过 for 循环逐个访问返回值中每个单独的块（chunk）
    let message = "";
    for await (const chunk of stream) {
      // 在这里，每个 chunk 的结构都与之前的 completion 相似，但 message 字段被替换成了 delta 字段
      const delta = chunk.choices[0].delta; // <-- message 字段被替换成了 delta 字段

      if (delta.content) {
        message += delta.content;
        // 我们在打印内容时，由于是流式输出，为了保证句子的连贯性，我们不人为地添加
        // 换行符，因此通过设置 end="" 来取消 print 自带的换行符。
        res.write(`data: ${JSON.stringify({ content: delta.content })}\n\n`);
      }
    }
    res.end();
    // console.log(message)
    messages.push({
      role: "assistant",
      content: message,
    });
    upload(
      [
        {
          role: "user",
          content: input,
        },
        {
          role: "assistant",
          content: message,
        },
      ],
      record_name,
      ulid
    );
    return messages;
  } catch (error) {
    console.error("发生错误：", error.message);
    return null;
  }
}

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

/**
 * @swagger
 * /stream/{message}:
 *   get:
 *     summary: Stream chat response from AI
 *     description: Stream chat response from AI with the given message
 *     parameters:
 *       - in: path
 *         name: message
 *         required: true
 *         schema:
 *           type: string
 *         description: The message to send to the AI
 *     responses:
 *       '200':
 *         description: A stream of chat messages
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *       '500':
 *         description: Internal Server Error
 */
router.get("/stream/:message", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  // const record_name = req.params.record_name;
  try {
    stream_output(req.params.message, res,"temp");
    // res.send(stream_output(req.params.message));
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @swagger
 * /api/{message}:
 *   get:
 *     summary: Get chat response from AI
 *     description: Get chat response from AI with the given message
 *     parameters:
 *       - in: path
 *         name: message
 *         required: true
 *         schema:
 *           type: string
 *         description: The message to send to the AI
 *     responses:
 *       '200':
 *         description: Chat response from AI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       '500':
 *         description: Internal Server Error
 */
router.get("/api/:message", async (req, res) => {
  const message = req.params.message;
  // const record_name = req.params.record_name;
  try {
    const data = await no_stream_output(message,"temp");
    const result = { data: data };
    res.send(result);
  } catch (error) {
    console.error("发生错误：", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;