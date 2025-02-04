// 处理聊天记录相关的

const CR = require("../class/chat_record");

// 实现聊天记录的创建判断，（是否需要创建一个新的）上传，根据ulid,name找到对应的聊天块进行信息添加，如果找不到就创建新的
/**
 * ulid: 用户的ulid
 * messages: 聊天记录
 * name: 此聊天记录的标识
 */
async function hanshu(messages, name,ulid) {
  try {
    // 查找是否存在该用户的聊天记录
    let chatRecord = await CR.findOne({ ulid });

    if (!chatRecord) {
      // 如果不存在，则创建新的聊天记录
      chatRecord = new CR({
        ulid,
        records: [
          {
            name: name || Date.now().toString(),
            messages: messages,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
      });
    } else {
      // 如果存在，则更新聊天记录
      const recordIndex = chatRecord.records.findIndex(
        (record) => record.name === name
      );
      if (recordIndex === -1) {
        // 如果找不到对应的聊天块，则创建新的聊天块
        chatRecord.records.push({
          name: name || Date.now().toString(),
          messages: messages,
          created_at: new Date(),
          updated_at: new Date(),
        });
      } else {
        // 如果找到对应的聊天块，则更新该聊天块
        chatRecord.records[recordIndex].messages.push(...messages);
        chatRecord.records[recordIndex].updated_at = new Date();
      }
    }

    // 保存聊天记录
    await chatRecord.save();
    return chatRecord;
  } catch (error) {
    console.log("Error handling chat record:", error);
    throw error;
  }
}

module.exports = hanshu;
