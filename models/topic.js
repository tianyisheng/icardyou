var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicSchema = new Schema({
  title: { type: String },
  topic_type:{type: String},
  send_type:{type:String},
  request_type:{type:String},
  content: { type: String },
  number_limit:{type:Number,default:1000},
  number_attendent:{type:Number,default:0},
  pic_url:[],
  author_id: { type: ObjectId },
  top: { type: Boolean, default: false },
  reply_count: { type: Number, default: 0 },
  visit_count: { type: Number, default: 0 },
  collect_count: { type: Number, default: 0 },
  attend_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  last_reply: { type: ObjectId },
  last_reply_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean }
});

mongoose.model('Topic', TopicSchema);
