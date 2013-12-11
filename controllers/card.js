var Message = require('../proxy').Message;
var EventProxy = require('eventproxy');
var User = require('../proxy').User;
var Card = require('../proxy').Card;
var Card_Supply = require('../proxy').Card_Supply;
var config = require('../config').config;
var check = require('validator').check;
var sanitize = require('validator').sanitize;

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


/**获取limit 条 用户发布的供求信息 **/
exports.mysupply = function (req, res, next) {
 if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }
  var query={author:req.session.user._id};
  var option={limit: config.list_topic_count}
  Card_Supply.getCardSupplyByQuery(query,option, function(err,docs){
      if(err)
          {
            res.render('card/mysupply',{error:err});
            return;
          }
    res.render('card/mysupply',docs)
        
});
};

/**保存用户发布的供求信息 **/
exports.savesupply = function (req, res, next) {
 if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var type = sanitize(req.body.type).trim();
  type = sanitize(type).xss();
  console.log(type);
  var url = sanitize(req.body.url).trim();
  url = sanitize(url).xss();

  var info = sanitize(req.body.info).trim();
  info = sanitize(info).xss();

  var author=req.session.user._id;
  try{
    if ((url.indexOf('http://') < 0) && (url.indexOf('https://') < 0)) {
          url = 'http://' + url;
        }
        check(url, '不正确的网址。').isUrl();
    }catch(e)
    {
         res.render('card/mysupply',{error: e.message});
     };
   try{
         check(info,"说明过长").len(1,70);
      }
      catch(e){
       
          res.render('card/mysupply',
          {error: e.message});
     }
    
  Card_Supply.newAndSave(type,url,info, author, function(err,docs){
      if(err)
          {
            res.render('card/mysupply',{error:err});
            return;
          }
    res.redirect('/mysupply')
        
});
};

/**删除用户指定删除的供求信息 **/
exports.deletesupply = function (req, res, next) {
 if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  } 

 var id = sanitize(req.body.id).trim();
  id = sanitize(id).xss();


  var query={_id:id, author:req.session.user._id};
  Card_Supply.deleteCardSupplyByQuery(query, function(err,docs){
      if(err)
          {
            res.render('card/mysupply',{error:err});
            return;
          }
    res.render('card/mysupply')
        
});
};



/**获取所有的用户供求信息**/
exports.supply = function (req, res, next) {
if (!req.session || !req.session.user) {
    res.send('forbidden!');
    return;
  }

  var p = parseInt(req.query.p, 10) || 1;
  var limit = config.list_topic_count*2;

  var render = function (card_supply, card_pages) {
    res.render('card/supply', {
      card_supply: card_supply,
      current_page: p,
      list_topic_count: limit,
      card_pages: card_pages
    });
  };

  var proxy = EventProxy.create('card_supply', 'card_pages', render);
  // 取标签
  var options1 = { skip: (p - 1) * limit, limit: limit, sort: [ 'created_at', 'desc' ] };
  var query1 = {};
  // 取card supply 信息
  Card_Supply.getCardSupplyByQuery(query1, options1, proxy.done('card_supply'));

// 取分页数据
  Card_Supply.getCountByQuery(query1, proxy.done(function (all_topics_count) {
    var  card_pages = Math.ceil(all_topics_count / limit);
    proxy.emit('card_pages', card_pages);
  }));


};

