/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;

var at = require('../services/at');
var User = require('../proxy').User;
var Topic = require('../proxy').Topic;
var Tag = require('../proxy').Tag;
var Relation = require('../proxy').Relation;
var TopicTag = require('../proxy').TopicTag;
var TopicCollect = require('../proxy').TopicCollect;
var TopicAttend = require('../proxy').TopicAttend;

var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var fs = require('fs');
var path = require('path');
var ndir = require('ndir');
var config = require('../config').config;
/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
exports.index = function (req, res, next) {
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.render('notify/notify', {
      error: '此话题不存在或已被删除。'
    });
  }
  var events = ['topic', 'other_topics', 'no_reply_topics', 'get_relation', '@user'];
  var ep = EventProxy.create(events, function (topic, other_topics, no_reply_topics, relation) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      relation : relation,
      topic_type:topic.topic_type
    });
  });

  ep.fail(next);

  ep.once('topic', function (topic) {
    if (topic.content_is_html) {
      return ep.emit('@user');
    }
    at.linkUsers(topic.content, ep.done(function (content) {
      topic.content = content;
      ep.emit('@user');
    }));
  });

  Topic.getFullTopic(topic_id, ep.done(function (message, topic, tags, author, replies) {
    if (message) {
      ep.unbind();
      return res.render('notify/notify', { error: message });
    }

    topic.visit_count += 1;
    topic.save(ep.done(function () {
      // format date
      topic.friendly_create_at = Util.format_date(topic.create_at, true);
      topic.friendly_update_at = Util.format_date(topic.update_at, true);

      topic.tags = tags;
      topic.author = author;
      topic.replies = replies;

      if (!req.session.user) {
        ep.emit('topic', topic);
      } else {
        TopicCollect.getTopicCollect(req.session.user._id, topic._id, ep.done(function (doc) {
          topic.in_collection = doc;
          ep.emit('topic', topic);
            }));
        TopicAttend.getTopicAttend(req.session.user._id, topic._id, ep.done(function (doc) {
          topic.in_activity = doc;
          ep.emit('topic', topic);
        }));
      }
    }));

    // get author's relationship
    if (req.session.user && req.session.user._id) {
      Relation.getRelation(req.session.user._id, topic.author_id, ep.done('get_relation'));
    } else {
      ep.emit('get_relation', null);
    }

    // get author other topics
    var options = { limit: 5, sort: [ [ 'last_reply_at', 'desc' ] ]};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    Topic.getTopicsByQuery(query, options, ep.done('other_topics'));

    // get no reply topics
    var options2 = { limit: 5, sort: [ ['create_at', 'desc'] ] };
    Topic.getTopicsByQuery({reply_count: 0}, options2, ep.done('no_reply_topics'));
  }));
};

//对应的是get方法
exports.create = function (req, res, next) {
  Tag.getAllTags(function (err, tags) {
    if (err) {
      return next(err);
    }
    res.render('topic/edit', {tags: tags,topic_type:'发片'});
  });
};

//对应的是get方法
exports.create2 = function (req, res, next) {
  console.log('create2');
  Tag.getAllTags(function (err, tags) {
    if (err) {
      return next(err);
    }
    res.render('topic/edit', {tags: tags, topic_type:'话题'});
  });
};


//app的post  topic/create
exports.put = function (req, res, next) {    

  var title = sanitize(req.body.title).trim();
  title = sanitize(title).xss();
  var content = req.body.t_content;
  var topic_tags = [];
  var topic_type;
  if(req.body.send=='on')
       topic_type='发片';
  else
      if( req.body.req=='on')
       topic_type='求片';
  else
      if( req.body.exc=='on')
       topic_type='交换';
  else
      if(req.body.topic=='on')
       topic_type='话题';
  else
      if(req.body.share=='on')
       topic_type='晒片';
  console.log(topic_type);
  var send_type=req.body.send_type;
  var request_type=req.body.request_type;
  var number_limit=req.body.number_limit;
   console.log(send_type);
   console.log(request_type);
   console.log(number_limit);
  var pic_url=[];
  if (req.body.topic_tags !== '') {
    topic_tags = req.body.topic_tags.split(',');
  }

  if (title === '') {
    Tag.getAllTags(function (err, tags) {
      if (err) {
        return next(err);
      }
      for (var i = 0; i < topic_tags.length; i++) {
        for (var j = 0; j < tags.length; j++) {
          if (topic_tags[i] === tags[j]._id) {
            tags[j].is_selected = true;
          }
        }
      }
      res.render('topic/edit', {tags: tags, edit_error: '标题不能是空的。', content: content,topic_type:topic_type,send_type:send_type,request_type:request_type,number_limit:number_limit});
    });
  } else if (title.length < 3 || title.length > 100) {
    Tag.getAllTags(function (err, tags) {
      if (err) {
        return next(err);
      }
      for (var i = 0; i < topic_tags.length; i++) {
        for (var j = 0; j < tags.length; j++) {
          if (topic_tags[i] === tags[j]._id) {
            tags[j].is_selected = true;
          }
        }
      }
      res.render('topic/edit', {tags: tags, edit_error: '标题字数太多或太少', title: title, content: content,topic_type:topic_type,send_type:send_type,request_type:request_type,number_limit:number_limit});
    });
  } else {
    
   for (var i in req.files) {
     if (req.files[i].size == 0||req.files[i].size>=307200000){
      // 删除一个文件
      fs.unlink(req.files[i].path,function (err) {
         if (err) console.log("fail to unlink");
       });
      } 
      else {
     //console.log('begin to process!'); 
        var file=req.files[i];
        var uid = req.session.user._id.toString();
        var userDir = path.join(config.upload_dir, uid);
        ndir.mkdir(userDir, function (err) {
             if (err) {
                   return console.log("error in mkdir");
                }
              var filename = Date.now() + '_' + file.name;
              var savepath = path.resolve(path.join(userDir, filename));
              if (savepath.indexOf(path.resolve(userDir)) !== 0) {
                     return console.log('forbidden');
                   }
              fs.rename(file.path, savepath, function (err) {
              if (err) {
                    return console.log(err);
               }
               pic_url.push('/user_data/images/' + uid + '/' + encodeURIComponent(filename));
               });
         }); 
     }
    }
    Topic.newAndSave(title, topic_type,send_type,request_type, number_limit,pic_url, content, req.session.user._id, function (err, topic) {
      if (err) {
        return next(err);
      }

      var proxy = new EventProxy();
      var render = function () {
        res.redirect('/topic/' + topic._id);
      };

      proxy.assign('tags_saved', 'score_saved', render);
      proxy.fail(next);
      // 话题可以没有标签
      if (topic_tags.length === 0) {
        proxy.emit('tags_saved');
      }
      var tags_saved_done = function () {
        proxy.emit('tags_saved');
      };
      proxy.after('tag_saved', topic_tags.length, tags_saved_done);
      //save topic tags
      topic_tags.forEach(function (tag) {
        TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
        Tag.getTagById(tag, proxy.done(function (tag) {
          tag.topic_count += 1;
          tag.save();
        }));
      });
      User.getUserById(req.session.user._id, proxy.done(function (user) {
        user.score += 5;
        user.topic_count += 1;
        user.save();
        req.session.user.score += 5;
        proxy.emit('score_saved');
      }));

      //发送at消息
      at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
});
  }
};

exports.showEdit = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    if (String(topic.author_id) === req.session.user._id || req.session.user.is_admin) {
      Tag.getAllTags(function (err, all_tags) {
        if (err) {
          return next(err);
        }
        for (var i = 0; i < tags.length; i++) {
          for (var j = 0; j < all_tags.length; j++) {
            if (tags[i].id === all_tags[j].id) {
              all_tags[j].is_selected = true;
            }
          }
        }

        res.render('topic/edit', {action: 'edit', topic_id: topic._id, title: topic.title, content: topic.content, tags: all_tags});
      });
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

//app的post  topic/edit
exports.update = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }

    if (String(topic.author_id) === req.session.user._id || req.session.user.is_admin) {
      var title = sanitize(req.body.title).trim();
      title = sanitize(title).xss();
      var content = req.body.t_content;
      var topic_tags = [];
      if (req.body.topic_tags !== '') {
        topic_tags = req.body.topic_tags.split(',');
      }

      if (title === '') {
        Tag.getAllTags(function (err, all_tags) {
          if (err) {
            return next(err);
          }
          for (var i = 0; i < topic_tags.length; i++) {
            for (var j = 0; j < all_tags.length; j++) {
              if (topic_tags[i] === all_tags[j]._id) {
                all_tags[j].is_selected = true;
              }
            }
          }
          res.render('topic/edit', {action: 'edit', edit_error: '标题不能是空的。', topic_id: topic._id, content: content, tags: all_tags,topic_type:topic_type,send_type:send_type,request_type:request_type,number_limit:number_limit});
        });
      } else {
        //保存话题
        //删除topic_tag，标签topic_count减1
        //保存新topic_tag
        topic.title = title;
        topic.content = content;
        
        var topic_type;
        if(req.body.send=='on')
           topic_type='发片';
        else
           if( req.body.req=='on')
             topic_type='求片';
        else
          if( req.body.exc=='on')
             topic_type='交换';
        else
            if(req.body.topic=='on')
             topic_type='话题';
         else
           if(req.body.share=='on')
              topic_type='晒片';
 
       topic.send_type=req.body.send_type;
       topic.request_type=req.body.request_type;
       topic.number_limit=req.body.number_limit;

        topic.update_at = new Date();
        topic.save(function (err) {
          if (err) {
            return next(err);
          }

          var proxy = new EventProxy();
          var render = function () {
            res.redirect('/topic/' + topic._id);
          };
          proxy.assign('tags_removed_done', 'tags_saved_done', render);
          proxy.fail(next);

          // 删除topic_tag
          var tags_removed_done = function () {
            proxy.emit('tags_removed_done');
          };
          TopicTag.getTopicTagByTopicId(topic._id, function (err, docs) {
            if (docs.length === 0) {
              proxy.emit('tags_removed_done');
            } else {
              proxy.after('tag_removed', docs.length, tags_removed_done);
              // delete topic tags
              docs.forEach(function (doc) {
                doc.remove(proxy.done(function () {
                  Tag.getTagById(doc.tag_id, proxy.done(function (tag) {
                    proxy.emit('tag_removed');
                    tag.topic_count -= 1;
                    tag.save();
                  }));
                }));
              });
            }
          });
          // 保存topic_tag
          var tags_saved_done = function () {
            proxy.emit('tags_saved_done');
          };
          //话题可以没有标签
          if (topic_tags.length === 0) {
            proxy.emit('tags_saved_done');
          } else {
            proxy.after('tag_saved', topic_tags.length, tags_saved_done);
            //save topic tags
            topic_tags.forEach(function (tag) {
              TopicTag.newAndSave(topic._id, tag, proxy.done('tag_saved'));
              Tag.getTagById(tag, proxy.done(function (tag) {
                tag.topic_count += 1;
                tag.save();
              }));
            });
          }
          //发送at消息
          at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
        });
      }
    } else {
      res.render('notify/notify', {error: '对不起，你不能编辑此话题。'});
    }
  });
};

exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_tag，标签topic_count减1
  //删除topic_collect，用户collect_topic_count减1
 // 删除topic_attend
  if (!req.session.user || !req.session.user.is_admin) {
    return res.send({success: false, message: '无权限'});
  }
  var topic_id = req.params.tid;
  if (topic_id.length !== 24) {
    return res.send({ success: false, error: '此话题不存在或已被删除。' });
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ success: false, message: err.message });
    }
    if (!topic) {
      return res.send({ success: false, message: '此话题不存在或已被删除。' });
    }
    topic.remove(function (err) {
      if (err) {
        return res.send({ success: false, message: err.message });
      }
      res.send({ success: true, message: '话题已被删除。' });
    });
  });
};

exports.top = function (req, res, next) {
  if (!req.session.user.is_admin) {
    res.redirect('home');
    return;
  }
  var topic_id = req.params.tid;
  var is_top = req.params.is_top;
  if (topic_id.length !== 24) {
    res.render('notify/notify', {error: '此话题不存在或已被删除。'});
    return;
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render('notify/notify', {error: '此话题不存在或已被删除。'});
      return;
    }
    topic.top = is_top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已经被置顶。' : '此话题已经被取消置顶。';
      res.render('notify/notify', {success: msg});
    });
  });
};

exports.collect = function (req, res, next) {
   console.log('collect');
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }

    TopicCollect.getTopicCollect(req.session.user._id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }

      TopicCollect.newAndSave(req.session.user._id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_topic_count += 1;
        user.save();
      });

      req.session.user.collect_topic_count += 1;
      topic.collect_count += 1;
      topic.save();
    });
  });
};


exports.attend = function (req, res, next) {
  console.log('attend');
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }

    TopicAttend.getTopicAttend(req.session.user._id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 'success'});
        return;
      }

      TopicAttend.newAndSave(req.session.user._id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 'success'});
      });
      User.getUserById(req.session.user._id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.attend_topic_count += 1;
        user.save();
      });

      req.session.user.attend_topic_count += 1;
      topic.attend_count += 1;
      topic.save();
    });
  });
};

exports.de_collect = function (req, res, next) {
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }
    TopicCollect.remove(req.session.user._id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.collect_topic_count -= 1;
      user.save();
    });

    topic.collect_count -= 1;
    topic.save();

    req.session.user.collect_topic_count -= 1;
  });
};


exports.de_attend = function (req, res, next) {
  console.log('de_attend');
  var topic_id = req.body.topic_id;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 'failed'});
    }
    TopicAttend.remove(req.session.user._id, topic._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.attend_topic_count -= 1;
      user.save();
    });

    topic.attend_count -= 1;
    topic.save();

    req.session.user.attend_topic_count -= 1;
  });
};

