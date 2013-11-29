var EventProxy = require('eventproxy');

var Message = require('../models').Message;

var User = require('./user');
var Topic = require('./topic');
var Reply = require('./reply');

/**
 * 根据用户ID，创建一个新的Card，并且获得一个活跃用户的地址
 * Callback:
 * 回调函数参数列表：
 * - err, 数据库错误
 * - user, 匹配的用户 
 * @param {String} id 用户ID
 */
exports.createCard = function (id, callback) {
 
    

};


/**
 * 根据消息Id获取消息
 * Callback:
 * - err, 数据库错误
 * - message, 消息对象
 * @param {String} id 消息ID
 * @param {Function} callback 回调函数
 */
exports.getMessageById = function (id, callback) {
  Message.findOne({_id: id}, function (err, message) {
    if (err) {
      return callback(err);
    }
    if (message.type === 'reply' || message.type === 'reply2' || message.type === 'at') {
      var proxy = new EventProxy();
      proxy.assign('author_found', 'topic_found', 'reply_found', function (author, topic, reply) {
        message.author = author;
        message.topic = topic;
        message.reply = reply;
        if (!author || !topic) {
          message.is_invalid = true;
        }
        return callback(null, message);
      }).fail(callback); // 接收异常
      User.getUserById(message.author_id, proxy.done('author_found'));
      Topic.getTopicById(message.topic_id, proxy.done('topic_found'));
      Reply.getReplyById(message.reply_id, proxy.done('reply_found'));
    }

    if (message.type === 'follow') {
      User.getUserById(message.author_id, function (err, author) {
        if (err) {
          return callback(err);
        }
        message.author = author;
        if (!author) {
          message.is_invalid = true;
        }
        return callback(null, message);
      });
    }
  });
};


