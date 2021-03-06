var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config').config;

var UserSchema = new Schema({
  name: { type: String, index: true },
  loginname: { type: String, unique: true },
  pass: { type: String },
  email: { type: String, unique: true },
  url: { type: String },
  profile_image_url: {type: String},
  location: { type: String },
  signature: { type: String },
  profile: { type: String },
  weibo: { type: String },
  renren: { type: String },
  avatar: { type: String },

  score: { type: Number, default: 0 },
  topic_count: { type: Number, default: 0 },
  reply_count: { type: Number, default: 0 },
  follower_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  collect_tag_count: { type: Number, default: 0 },
  collect_topic_count: { type: Number, default: 0 },
  attend_topic_count: { type: Number, default: 0 },
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  is_star: { type: Boolean },
  level: { type: String },
  active: { type: Boolean, default: true },

/** i card you**/
  /**已发送且被收到数目**/
  sent_count: { type: Number, default: 0 },
  /**已经收到的数量**/
  received_count: { type: Number, default: 0 },
  /**即将发送的数目，最多为allowed_count**/
  send_count:{ type: Number, default: 0 },

  /**允许发送的最大数目，目前设为**/
  allowed:{ type: Number, default: 5 },

  last_sent_time:{type:Number, type: Date},
  /**地址是否审核通过**/
  audit:{type:Boolean,default: false},
  gender: {type: String},
  country: {type: String},
  region: {type: String},
  post_address: {type: String},
  zip: {type: Number},
  post_name: {type: String},
  nickname: {type:String},

/**end of i card you**/

  receive_reply_mail: {type: Boolean, default: false },
  receive_at_mail: { type: Boolean, default: false },
  from_wp: { type: Boolean },

  retrieve_time : {type: Number},
  retrieve_key : {type: String}
});

UserSchema.virtual('avatar_url').get(function () {
  var url = this.profile_image_url || this.avatar || config.site_static_host + '/public/images/user_icon&48.png';
  return url.replace('http://www.gravatar.com/', 'http://gravatar.qiniudn.com/');
});

mongoose.model('User', UserSchema);
