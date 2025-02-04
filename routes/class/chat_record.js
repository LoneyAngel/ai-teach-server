//建立资源模型

const mongoose = require("mongoose");
const chat_records_Schema = new mongoose.Schema({
  ulid: {
    //对应用户的uid
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  records: [
    //我希望一个blocks对应一个聊天记录
    {
      name: {
        type: String,
        required: false,
        default: Date.now.toString(),
      },
      messages: [
        {
          role: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
        },
      ],
      created_at: {
        type: Date,
        default: Date.now,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Chat_Records", chat_records_Schema);
