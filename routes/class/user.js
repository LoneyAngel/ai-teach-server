const mongoose = require("mongoose");
//建立用户数据模型

//使用id属性作为检索，使用uid来对用户进行明面上的安全标识
//时间倒序
const userSchema = new mongoose.Schema({
  ulid: {//用户id候补,一般直接使用_id
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  account: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  createTime: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    default: 18,
  },
  sex: {
    type: Number,
    enum: [0, 1],
  },
  role: {
    type: Number,
    enum: [0, 1, 2],//学生，老师，管理员
    default: 0,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },

  updateTime: {
    type: Date,
  },
  lastLoginTime: {
    type: Date,
  },
  lastLoginIp: {
    type: String,
  },
  lastLoginLocation: {
    type: String,
  },
  lastLoginDevice: {
    type: String,
  },
});



module.exports = mongoose.model("User", userSchema);
