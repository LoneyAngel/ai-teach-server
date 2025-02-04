//建立资源模型

const mongoose = require("mongoose");
const resourceSchema = new mongoose.Schema({
  ulid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Resource", resourceSchema);