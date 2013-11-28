var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 * type: 活动片，配对片
 * status: 已发，准备发，收到，回寄
 */
 
var CardSchema = new Schema({
  id:{type: Number, index: true },
  status: { type: String },
  sender_id: { type: ObjectId, index: true },
  image_url: [String],
  reciver_id: { type: ObjectId, index: true},
  feedback: {type: String},
  status: { type: Boolean, default: false },
  post_mark_time :{type: String},
  post_mark_address:{type:String},
  create_at: { type: Date, default: Date.now },
  /**回寄给**/
  reply_to:{},
  /**活动片,配对片**/
  type:{type: String }
});

mongoose.model('Card', CardSchema);
