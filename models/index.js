var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});



// models
require('./tag');
require('./user');
require('./topic');
require('./topic_tag');
require('./reply');
require('./topic_collect');
require('./topic_attend');
require('./tag_collect');
require('./relation');
require('./message');
require('./card');
require('./counter');
require('./card_supply');

exports.Tag = mongoose.model('Tag');
exports.User = mongoose.model('User');
exports.Topic = mongoose.model('Topic');
exports.TopicTag = mongoose.model('TopicTag');
exports.Reply = mongoose.model('Reply');
exports.TopicCollect = mongoose.model('TopicCollect');
exports.TopicAttend = mongoose.model('TopicAttend');
exports.TagCollect = mongoose.model('TagCollect');
exports.Relation = mongoose.model('Relation');
exports.Message = mongoose.model('Message');
exports.Card = mongoose.model('Card');
exports.Counter =mongoose.model('Counter');
exports.Card_Supply =mongoose.model('Card_Supply');
