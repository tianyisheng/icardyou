var TopicAttend = require('../models').TopicAttend;

exports.getTopicAttend = function (userId, topicId, callback) {
  TopicAttend.findOne({user_id: userId, topic_id: topicId}, callback);
};

exports.getTopicAttendsByUserId = function (userId, callback) {
  TopicAttend.find({user_id: userId}, callback);
};

exports.newAndSave = function (userId, topicId, callback) {
  var topic_attend = new TopicAttend();
  topic_attend.user_id = userId;
  topic_attend.topic_id = topicId;
  topic_attend.save(callback);
};

exports.remove = function (userId, topicId, callback) {
  TopicAttend.remove({user_id: userId, topic_id: topicId}, callback);
};

