var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 * type: 活动片，配对片
 * status: 准备发，已发，收到，回寄
 */
 
var CardSchema = new Schema({
  ID:{type: Number, index: true },
  status: { type: String, default:'准备发' },
  sender_id: { type: ObjectId, index: true },
  image_url: [String],
  receiver_id: { type: ObjectId, index: true},
  feedback: {type: String},
  status: { type: Boolean, default: false },
  /**收信人姓名**/
  post_name :{type: String},
  post_mark_time :{type: String},
  /**收信人邮编**/
  post_zip:{type:Number},
  /**收信人地址**/
  post_mark_address:{type:String},
  create_at: { type: Date, default: Date.now },
  /**回寄给**/
  reply_to:{type: Number},
  /**活动片,配对片**/
  type:{type: String }
});
mongoose.model('Card', CardSchema);

