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

  Card.createCard(req.session.user._id, function (err, card) {
       if( err){      
         return res.render('card/gotAddress', {error: '数据库异常，稍后再试 (v.v)'});
       }
        
       res.render('card/gotAddress',{zip:card.post_zip, name:card.post_name, id: card.receiver_id,address:card.post_mark_address});   
  });
};
