/*!
 * nodeclub - site index controller.
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * Copyright(c) 2012 muyuan
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Tag = require('../proxy').Tag;
var config = require('../config').config;
var EventProxy = require('eventproxy');

exports.index = function (req, res, next) {
  var p = parseInt(req.query.p, 10) || 1;
  var n=parseInt(req.query.n, 10) || 1; 
  var keyword = req.query.q || ''; // in-site search
  if (Array.isArray(keyword)) {
    keyword = keyword.join(' ');
  }
  keyword = keyword.trim();
  var limit = config.list_topic_count;

  var render = function (tags, topics, activity, hot_topics, stars, tops, no_reply_topics, topic_pages,activity_pages) {
    var all_tags = tags.slice(0);

    // 计算最热标签
    tags.sort(function (tag_a, tag_b) {
      return tag_b.topic_count - tag_a.topic_count;
    });

    // 计算最新标签
    tags.sort(function (tag_a, tag_b) {
      return tag_b.create_at - tag_a.create_at;
    });
    var recent_tags = tags.slice(0, 5);
    res.render('index', {
      tags: all_tags,
      topics: topics,
      activity:activity,
      current_page: p,
      current_activity: n,
      list_topic_count: limit,
      recent_tags: recent_tags,
      hot_topics: hot_topics,
      stars: stars,
      tops: tops,
      no_reply_topics: no_reply_topics,
      topic_pages: topic_pages,
      activity_pages:activity_pages,
      keyword: keyword
    });
  };

  var proxy = EventProxy.create('tags', 'topics', 'activity', 'hot_topics', 'stars', 'tops', 'no_reply_topics', 'topic_pages','activity_pages', render);
  proxy.fail(next);
  // 取标签
  Tag.getAllTags(proxy.done('tags'));

  var options1 = { skip: (p - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var options2 = { skip: (n - 1) * limit, limit: limit, sort: [ ['top', 'desc' ], [ 'last_reply_at', 'desc' ] ] };
  var query1 = {topic_type:"话题"};
  var query2 = {topic_type:{$ne:"话题"}};
  if (keyword) {
    keyword = keyword.replace(/[\*\^\&\(\)\[\]\+\?\\]/g, '');
    query1.title = new RegExp(keyword, 'i');
    query2.title = new RegExp(keyword, 'i');
  }
  // 取主题
  Topic.getTopicsByQuery(query1, options1, proxy.done('topics'));

  // 取活动
  Topic.getTopicsByQuery(query2, options2, proxy.done('activity'));

  // 取热门主题
  Topic.getTopicsByQuery({}, { limit: 5, sort: [ [ 'visit_count', 'desc' ] ] }, proxy.done('hot_topics'));
  // 取星标用户
  User.getUsersByQuery({ is_star: true }, { limit: 5 }, proxy.done('stars'));
  // 取排行榜上的用户
  User.getUsersByQuery({}, { limit: 10, sort: [ [ 'score', 'desc' ] ] }, proxy.done('tops'));
  // 取0回复的主题
  Topic.getTopicsByQuery({ reply_count: 0 }, { limit: 5, sort: [ [ 'create_at', 'desc' ] ] },
  proxy.done('no_reply_topics'));
  // 取话题分页数据
  Topic.getCountByQuery(query1, proxy.done(function (all_topics_count) {
    var topic_pages = Math.ceil(all_topics_count / limit);
    proxy.emit('topic_pages', topic_pages);
  }));

  // 取活动分页数据
  Topic.getCountByQuery(query2, proxy.done(function (all_topics_count) {
    var  activity_pages = Math.ceil(all_topics_count / limit);
    proxy.emit('activity_pages', activity_pages);
  }));


};
