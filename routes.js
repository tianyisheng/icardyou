/*!
 * nodeclub - route.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sign = require('./controllers/sign');
var site = require('./controllers/site');
var user = require('./controllers/user');
var message = require('./controllers/message');
var tag = require('./controllers/tag');
var topic = require('./controllers/topic');
var reply = require('./controllers/reply');
var rss = require('./controllers/rss');
var upload = require('./controllers/upload');
var assets = require('./controllers/static');
var tools = require('./controllers/tools');
var auth = require('./midderwares/auth');
var limit = require('./midderwares/limit');
var status = require('./controllers/status');
var card = require('./controllers/card');

module.exports = function (app) {
  // home page
  app.get('/', site.index);

  // sign up, login, logout
  app.get('/signup', sign.showSignup);
  app.post('/signup', sign.signup);
  app.get('/signout', sign.signout);
  app.get('/signin', sign.showLogin);
  app.post('/signin', sign.login);
  app.get('/active_account', sign.active_account);

  // password
  app.get('/search_pass', sign.showSearchPass);
  app.post('/search_pass', sign.updateSearchPass);
  app.get('/reset_pass', sign.reset_pass);
  app.post('/reset_pass', sign.update_pass);

  // user
  app.get('/user/:name', auth.signinRequired, user.index); //update here
  app.get('/setting', auth.signinRequired,user.showSetting);
  app.post('/setting', auth.signinRequired,user.setting);
  app.get('/stars', auth.signinRequired,user.show_stars);
  app.get('/users/top100', auth.signinRequired, user.top100);
  app.get('/user/:name/tags', auth.signinRequired, user.get_collect_tags);
  app.get('/user/:name/collections', auth.signinRequired,user.get_collect_topics);
  app.get('/user/:name/activities', auth.signinRequired,user.get_attend_topics);
  app.get('/my/messages', message.index);
  app.get('/my/messages/send', message.send);
  app.get('/messages/sent', message.indexSent);
  app.get('/user/:name/follower', auth.signinRequired, user.get_followers);
  app.get('/user/:name/following', auth.signinRequired, user.get_followings);
  app.get('/user/:name/topics', auth.signinRequired, user.list_topics);
  app.get('/user/:name/replies', auth.signinRequired, user.list_replies);
  app.get('/user/:name/init', auth.signinRequired, user.list_init);
  app.get('/user/:name/attend', auth.signinRequired, user.list_attend);
  app.post('/user/follow', auth.userRequired, user.follow);
  app.post('/user/un_follow', user.un_follow);
  app.post('/user/set_star', user.toggle_star);
  app.post('/user/cancel_star', user.toggle_star);
  app.post('/user/send_msg', auth.signinRequired, user.send_msg);

  // message
  app.post('/messages/mark_read', auth.signinRequired, message.mark_read);
  app.post('/messages/mark_all_read', auth.signinRequired, message.mark_all_read);
  app.post('/my/messages/send', auth.signinRequired, message.post);

  // card
  app.get('/card/sendpostcard', auth.signinRequired, card.send);
  app.get('/card/receivepostcard', auth.signinRequired, card.receive);
  app.post('/card/getAddress', auth.signinRequired, card.getAddress);
  app.post('/card/receivepostcard', auth.signinRequired, card.receive);

  //供求
  app.get('/supply', auth.signinRequired, card.supply);
  app.post('/supply', auth.signinRequired, card.postSupply);

  // tag
  app.get('/tags/edit', tag.edit_tags);
  app.get('/tag/:name', tag.list_topic);
  // 编辑界面
  app.get('/tag/:name/edit', auth.adminRequired, tag.edit);
  app.get('/tag/:name/delete', auth.adminRequired, tag.delete);
  app.post('/tag/add', auth.adminRequired, tag.add);
  // 更新
  app.post('/tag/:id', auth.adminRequired, tag.update);
  app.post('/tag/collect', tag.collect);
  app.post('/tag/de_collect', auth.userRequired, tag.de_collect);
  app.post('/tag/attend', tag.attend);
  app.post('/tag/de_attend', auth.userRequired, tag.de_attend);

  // topic
  // 新建文章界面
  app.get('/topic/create', auth.signinRequired, topic.create);//create topic
  app.get('/topic/create2', auth.signinRequired, topic.create2); // create a pure topic
  app.get('/topic/:tid', topic.index);
  app.get('/topic/:tid/top/:is_top?', topic.top);
  app.get('/topic/:tid/edit', topic.showEdit);

  // Po-Ying Chen <poying.me@gmail.com>: 當 "非" 作者的使用者在留言的地方貼上一個網址為
  // http://[domain name]/topic/[topic id]/delete 的圖片之後，只要作者一看到圖片，文章就會被刪除了，
  // 可能需要將刪除的方法改成 post 來避免此問題
  app.post('/topic/:tid/delete', topic.delete);

  // 保存新建的文章
  // TODO: 如果创建文章的过程太长，导致session过期，界面的内容会丢失
  // FIXME: 采用前端来判断，不通过跳转的形式来解决
  app.post('/topic/create', auth.signinRequired, limit.postInterval, topic.put);
  app.post('/topic/:tid/edit', topic.update);
  app.post('/topic/collect', auth.userRequired, topic.collect);
  app.post('/topic/de_collect', auth.userRequired, topic.de_collect);
 app.post('/topic/attend', auth.userRequired, topic.attend);
  app.post('/topic/de_attend', auth.userRequired, topic.de_attend);

  // reply
  // 回复
  app.post('/:topic_id/reply', auth.userRequired, limit.postInterval, reply.add);
  app.post('/:topic_id/reply2', auth.userRequired, limit.postInterval, reply.add_reply2);
  app.post('/reply/:reply_id/delete', reply.delete);

  // upload
  app.post('/upload/image',auth.signinRequired, upload.uploadImage);

  // tools
  app.get('/site_tools', tools.run_site_tools);

  // static
  app.get('/about', assets.about);
  app.get('/faq', assets.faq);

  //rss
  app.get('/rss', rss.index);

  // site status
  app.get('/status', status.status);
};
