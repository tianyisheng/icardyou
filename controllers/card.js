var Message = require('../proxy').Message;
var EventProxy = require('eventproxy');
var User = require('../proxy').User;
var Card = require('../proxy').Card;

exports.send = function (req, res, next) {
if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  User.getUserById(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    var sent=user.sent_count+user.send_count; 
    if(nickname)
        var nickname=user.name;
    else
        var nickname=user.nickname;
    return res.render('card/getAddress', {name:user.name,nickname:nickname, sent: sent, received:user.sent_count, send:user.send_count, allowed: user.allowed-user.send_count});
  });

};


exports.receive = function (req, res, next) {
if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  User.getUserById(req.session.user._id, function (err, user) {
    if (err) {
      return next(err);
    }
    var sent=user.sent_count+user.send_count; 
    if(nickname)
        var nickname=user.name;
    else
        var nickname=user.nickname;
    return res.render('card/receivedPost', {name:user.name,nickname:nickname, sent: sent, received:user.sent_count, send:user.send_count, allowed: user.allowed-user.send_count});
  });

};


//  implement get a address by post
exports.getAddress = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var message_id = req.body.message_id;
  Card.createCard(req.session.user._id, function (err, user) {
       if( err){      
         return res.render('card/getAddress', {error: '数据库异常，稍后再试 (v.v)',name:user.name,nickname:nickname, sent: sent, received:user.sent_count, send:user.send_count, allowed: user.allowed-user.send_count});
       }
       res.render();   
  });
};




exports.mark_all_read = function (req, res, next) {
  if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  // TODO: 直接做update，无需查找然后再逐个修改。
  Message.getUnreadMessageByUserId(req.session.user._id, function (err, messages) {
    if (messages.length === 0) {
      res.json({'status': 'success'});
      return;
    }
    var proxy = new EventProxy();
    proxy.after('marked', messages.length, function () {
      res.json({'status': 'success'});
    });
    proxy.fail(next);
    for (var i = 0; i < messages.length; i++) {
      var message = messages[i];
      message.has_read = true;
      message.save(proxy.done('marked'));
    }
  });
};
