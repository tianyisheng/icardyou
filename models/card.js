var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
  
/*
 * type:
 * 发送中: xx 回复了你的话题
 * 已收到: xx 在话题中回复了你
 */
 
var MessageSchema = new Schema({
  status: { type: String },
  sender_id: { type: ObjectId, index: true },
  reciver_id: { type: ObjectId, index: true},
  url:{type:},
  status: { type: Boolean, default: false },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('Message', MessageSchema);
