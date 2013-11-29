var User = require('../proxy').User;
var Tag = require('../proxy').Tag;
var Topic = require('../proxy').Topic;
var Reply = require('../proxy').Reply;
var Relation = require('../proxy').Relation;
var TopicCollect = require('../proxy').TopicCollect;
var TopicAttend = require('../proxy').TopicAttend;
var TagCollect = require('../proxy').TagCollect;
var utility = require('utility');

var message = require('../services/message');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');

exports.index = function (req, res, next) {
  var user_name = req.params.name;
  User.getUserByName(user_name, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (recent_topics, recent_replies, relation) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      // 如果用户没有激活，那么管理员可以帮忙激活
      var token = '';
      if (!user.active && req.session.user && req.session.user.is_admin) {
        token = utility.md5(user.email + config.session_secret);
      }
      res.render('user/index', {
        user: user,
        recent_topics: recent_topics,
        recent_replies: recent_replies,
        relation: relation,
        token: token,
      });
    };

    var proxy = new EventProxy();
    proxy.assign('recent_topics', 'recent_replies', 'relation', render);
    proxy.fail(next);

    var query = {author_id: user._id};
    var opt = {limit: 5, sort: [['create_at', 'desc']]};
    Topic.getTopicsByQuery(query, opt, proxy.done('recent_topics'));

    Reply.getRepliesByAuthorId(user._id, proxy.done(function (replies) {
      var topic_ids = [];
      for (var i = 0; i < replies.length; i++) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id.toString());
        }
      }
      var query = {_id: {'$in': topic_ids}};
      var opt = {limit: 5, sort: [['create_at', 'desc']]};
      Topic.getTopicsByQuery(query, opt, proxy.done('recent_replies'));
    }));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }
  });
};

exports.show_stars = function (req, res, next) {
  User.getUsersByQuery({is_star: true}, {}, function (err, stars) {
    if (err) {
      return next(err);
    }
    res.render('user/stars', {stars: stars});
  });
};

exports.showSetting = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  User.getUserById(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (req.query.save === 'success') {
      user.success = '保存成功。';
    }
    user.error = null;
    return res.render('user/setting', user);
  });
};

exports.setting = function (req, res, next) {
  if (!req.session.user) {
    res.redirect('home');
    return;
  }

  // post
  var action = req.body.action;
  if (action === 'change_setting') {
    var name = sanitize(req.body.name).trim();
    name = sanitize(name).xss();
    var email = sanitize(req.body.email).trim();
    email = sanitize(email).xss();
    var url = sanitize(req.body.url).trim();
    url = sanitize(url).xss();
    var profile_image_url = sanitize(sanitize(req.body.profile_image_url).trim()).xss();
    // i card you
    var country = sanitize(req.body.country).trim();
    country = sanitize(country).xss();
    var region =sanitize(req.body.region).trim();
    region =  sanitize(region).xss();
   
    var zip =sanitize(req.body.zip).trim();
    zip =  sanitize(zip).xss();

    var nickname =sanitize(req.body.nickname).trim();
    nickname =  sanitize(nickname).xss();

    var post_address =sanitize(req.body.post_address).trim();
    post_address =  sanitize(post_address).xss();

    var post_name =sanitize(req.body.post_name).trim();
    post_name =  sanitize(post_name).xss();
    if(!post_name)
     {post_name=' ';}
    if(!post_address)
     {post_address=' ';}
    if(!zip)
     {zip=' ';}
   
   

    var signature = sanitize(req.body.signature).trim();
    signature = sanitize(signature).xss();
    var profile = sanitize(req.body.profile).trim();
    profile = sanitize(profile).xss();
    var weibo = sanitize(req.body.weibo).trim();
    weibo = sanitize(weibo).xss();
    var gender = sanitize(req.body.gender).trim();
    gender=sanitize(gender).xss();
    var renren = sanitize(req.body.renren).trim();
    renren = sanitize(renren).xss();
    var receive_at_mail = req.body.receive_at_mail === 'on';
    var receive_reply_mail = req.body.receive_reply_mail === 'on';

    if (nickname) {
      try {
        check(nickname, '昵称为长度为2-9').len(2,18);
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
          nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }


    if (url !== '') {
      try {
        if ((url.indexOf('http://') < 0) && (url.indexOf('https://') < 0)) {
          url = 'http://' + url;
        }
        check(url, '不正确的网址。').isUrl();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
          nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }
    if (weibo) {
      try {
        if (weibo.indexOf('http://') < 0) {
          weibo = 'http://' + weibo;
        }
        check(weibo, '不正确的微博地址。').isUrl();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
         nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          renren:renren,
          gender:gender,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }

    if (renren) {
      try {
        if (renren.indexOf('http://') < 0) {
          renren = 'http://' + renren;
        }
        check(renren, '不正确renren地址。').isUrl();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
         nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }

    if (post_name) {
      try {
        check(post_name, '名字过短或者过长').len(2,15);
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
         nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }

    if (zip) {
      try {
     
        check(zip, '邮编应该是5-6位数字').len(5,6).isInt();
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
         nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }




    if (post_address) {
      try {
        check(post_address, '地址长度过长或过短').len(6, 50);
      } catch (e) {
        res.render('user/setting', {
          error: e.message,
          name: name,
          email: email,
          url: url,
          profile_image_url: profile_image_url,
          post_address:post_address,
          post_name:post_name,
          zip:zip,
          country:country,
          region:region,
         nickname:nickname,
          signature: signature,
          profile: profile,
          weibo: weibo,
          gender:gender,
          renren:renren,
          receive_at_mail: receive_at_mail,
          receive_reply_mail: receive_reply_mail
        });
        return;
      }
    }

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      user.url = url;
      user.profile_image_url = profile_image_url;
          user.post_address = post_address,
          user.post_name = post_name,
          user.zip = zip,
          user.country = country,
          user.region =region,
      user.signature = signature;
      user.profile = profile;
      user.weibo = weibo;
      user.nickname=nickname;
      user.renren= renren;
      user.gender= gender;
      user.receive_at_mail = receive_at_mail;
      user.receive_reply_mail = receive_reply_mail;
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/setting?save=success');
      });
    });

  }

  if (action === 'change_password') {
    var old_pass = sanitize(req.body.old_pass).trim();
    var new_pass = sanitize(req.body.new_pass).trim();

    User.getUserById(req.session.user._id, function (err, user) {
      if (err) {
        return next(err);
      }
      var md5sum = crypto.createHash('md5');
      md5sum.update(old_pass);
      old_pass = md5sum.digest('hex');

      if (old_pass !== user.pass) {
        res.render('user/setting', {
          error: '当前密码不正确。',
          name: user.name,
          email: user.email,
          url: user.url,
          profile_image_url: user.profile_image_url,
          post_address: user.post_address,
          post_name: user.post_name,
          zip : user.zip,
          country : user.country,
          region : user.region,
         nickname:user.nickname,
          signature: user.signature,
          profile: user.profile,
          weibo: user.weibo,
          gender:user.gender,
          renren:user.renren,
          receive_at_mail: user.receive_at_mail,
          receive_reply_mail: user.receive_reply_mail
        });
        return;
      }

      md5sum = crypto.createHash('md5');
      md5sum.update(new_pass);
      new_pass = md5sum.digest('hex');

      user.pass = new_pass;
      user.save(function (err) {
        if (err) {
          return next(err);
        }
        res.render('user/setting', {
          success: '密码已被修改。',
          name: user.name,
          email: user.email,
          url: user.url,
          profile_image_url: user.profile_image_url,
          post_address : user.post_address,
          post_name : user.post_name,
          zip : user.zip,
          country : user.country,
          region : user.region,
         nickname: user.nickname,
          signature: user.signature,
          profile: user.profile,
          weibo: user.weibo,
          gender: user.gender,
          renren: user.renren,
          receive_at_mail: user.receive_at_mail,
          receive_reply_mail: user.receive_reply_mail
        });
        return;

      });
    });
  }
};

exports.follow = function (req, res, next) {
  var follow_id = req.body.follow_id;
  User.getUserById(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
    }

    var proxy = EventProxy.create('relation_saved', 'message_saved', function () {
      res.json({status: 'success'});
    });
    proxy.fail(next);
    Relation.getRelation(req.session.user._id, user._id, proxy.done(function (doc) {
      if (doc) {
        return proxy.emit('relation_saved');
      }

      // 新建关系并保存
      Relation.newAndSave(req.session.user._id, user._id);
      proxy.emit('relation_saved');

      User.getUserById(req.session.user._id, proxy.done(function (me) {
        me.following_count += 1;
        me.save();
      }));

      user.follower_count += 1;
      user.save();

      req.session.user.following_count += 1;
    }));

    message.sendFollowMessage(follow_id, req.session.user._id);
    proxy.emit('message_saved');
  });
};

exports.un_follow = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  var follow_id = req.body.follow_id;
  User.getUserById(follow_id, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.json({status: 'failed'});
      return;
    }
    // 删除关系
    Relation.remove(req.session.user._id, user._id, function (err) {
      if (err) {
        return next(err);
      }
      res.json({status: 'success'});
    });

    User.getUserById(req.session.user._id, function (err, me) {
      if (err) {
        return next(err);
      }
      me.following_count -= 1;
      if (me.following_count < 0) {
        me.following_count = 0;
      }
      me.save();
    });

    user.follower_count -= 1;
    if (user.follower_count < 0) {
      user.follower_count = 0;
    }
    user.save();

    req.session.user.following_count -= 1;
    if (req.session.user.following_count < 0) {
      req.session.user.following_count = 0;
    }
  });
};


// TO DO: render send message page, need to include the receiver id
exports.send_msg = function (req, res,next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
   console.log('send msg');
   var reciver = req.params.reciver_id;
  var sender = req.params.sender_id;
  res.render('message/send', {reciver:reciver,sender:sender});
 return
};


exports.toggle_star = function (req, res, next) {
  if (!req.session.user || !req.session.user.is_admin) {
    res.send('forbidden!');
    return;
  }
  var user_id = req.body.user_id;
  User.getUserById(user_id, function (err, user) {
    if (err) {
      return next(err);
    }
    user.is_star = !!user.is_star;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.json({ status: 'success' });
    });
  });
};

exports.get_collect_tags = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    TagCollect.getTagCollectsByUserId(user._id, function (err, docs) {
      if (err) {
        return next(err);
      }
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].tag_id);
      }
      Tag.getTagsByIds(ids, function (err, tags) {
        if (err) {
          return next(err);
        }
        res.render('user/collect_tags', { tags: tags, user: user });
      });
    });
  });
};

exports.get_collect_topics = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }

    var page = Number(req.query.page) || 1;
    var limit = config.list_topic_count;

    var render = function (topics, pages) {
      res.render('user/collect_topics', {
        topics: topics,
        current_page: page,
        pages: pages,
        user: user
      });
    };

    var proxy = EventProxy.create('topics', 'pages', render);
    proxy.fail(next);

    TopicCollect.getTopicCollectsByUserId(user._id, proxy.done(function (docs) {
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].topic_id);
      }
      var query = { _id: { '$in': ids } };
      var opt = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [ [ 'create_at', 'desc' ] ]
      };
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));
  });
};


exports.get_attend_topics = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }

    var page = Number(req.query.page) || 1;
    var limit = config.list_attend_count;

    var render = function (topics, pages) {
      res.render('user/attend_topics', {
        topics: topics,
        current_page: page,
        pages: pages,
        user: user
      });
    };

    var proxy = EventProxy.create('topics', 'pages', render);
    proxy.fail(next);

    TopicAttend.getTopicAttendsByUserId(user._id, proxy.done(function (docs) {
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].topic_id);
      }
      var query = { _id: { '$in': ids } };
      var opt = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [ [ 'create_at', 'desc' ] ]
      };
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));
      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));
  });
};


exports.get_followings = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    Relation.getFollowings(user._id, function (err, docs) {
      if (err) {
        return next(err);
      }
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].follow_id);
      }
      User.getUsersByIds(ids, function (err, users) {
        if (err) {
          return next(err);
        }
        res.render('user/followings', { users: users, user: user });
      });
    });
  });
};

exports.get_followers = function (req, res, next) {
  var name = req.params.name;
  User.getUserByName(name, function (err, user) {
    if (err || !user) {
      return next(err);
    }
    var proxy = new EventProxy();
    proxy.fail(next);
    Relation.getRelationsByUserId(user._id, proxy.done(function (docs) {
      var ids = [];
      for (var i = 0; i < docs.length; i++) {
        ids.push(docs[i].user_id);
      }
      User.getUsersByIds(ids, proxy.done(function (users) {
        res.render('user/followers', {users: users, user: user});
      }));
    }));
  });
};

exports.top100 = function (req, res, next) {
  var opt = {limit: 100, sort: [['score', 'desc']]};
  User.getUsersByQuery({}, opt, function (err, tops) {
    if (err) {
      return next(err);
    }
    res.render('user/top100', {users: tops});
  });
};

exports.list_topics = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/topics', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    var query = {'author_id': user._id};
    var opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
    Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }

    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      proxy.emit('pages', pages);
    }));
  });
};

//to-do list all activities by the user
exports.list_init = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/topics', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    var query = {'author_id': user._id};
    var opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
    Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }

    Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
      var pages = Math.ceil(all_topics_count / limit);
      proxy.emit('pages', pages);
    }));
  });
};


exports.list_replies = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/replies', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    Reply.getRepliesByAuthorId(user._id, proxy.done(function (replies) {
      // 获取所有有评论的主题
      var topic_ids = [];
      for (var i = 0; i < replies.length; i++) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id);
        }
      }
      var query = {'_id': {'$in': topic_ids}};
      var opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }
  });
};

//to-do list all the activities the user attend
exports.list_attend = function (req, res, next) {
  var user_name = req.params.name;
  var page = Number(req.query.page) || 1;
  var limit = config.list_topic_count;

  User.getUserByName(user_name, function (err, user) {
    if (!user) {
      res.render('notify/notify', {error: '这个用户不存在。'});
      return;
    }

    var render = function (topics, relation, pages) {
      user.friendly_create_at = Util.format_date(user.create_at, true);
      res.render('user/replies', {
        user: user,
        topics: topics,
        relation: relation,
        current_page: page,
        pages: pages
      });
    };

    var proxy = new EventProxy();
    proxy.assign('topics', 'relation', 'pages', render);
    proxy.fail(next);

    Reply.getRepliesByAuthorId(user._id, proxy.done(function (replies) {
      // 获取所有有评论的主题
      var topic_ids = [];
      for (var i = 0; i < replies.length; i++) {
        if (topic_ids.indexOf(replies[i].topic_id.toString()) < 0) {
          topic_ids.push(replies[i].topic_id);
        }
      }
      var query = {'_id': {'$in': topic_ids}};
      var opt = {skip: (page - 1) * limit, limit: limit, sort: [['create_at', 'desc']]};
      Topic.getTopicsByQuery(query, opt, proxy.done('topics'));

      Topic.getCountByQuery(query, proxy.done(function (all_topics_count) {
        var pages = Math.ceil(all_topics_count / limit);
        proxy.emit('pages', pages);
      }));
    }));

    if (!req.session.user) {
      proxy.emit('relation', null);
    } else {
      Relation.getRelation(req.session.user._id, user._id, proxy.done('relation'));
    }
  });
};
