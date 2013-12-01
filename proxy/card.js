var EventProxy = require('eventproxy');
var models = require('../models');
var Card = models.Card;
var Counter =  require('./counter');
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
 
// TO DO: change getActiveUser method
  User.getActiveUser(id, function(err, user) {
        if (err) {
          return callback(err, null);
        }
       

        Counter.increment('card',function(err1,result){
           if(err)
           {
              console.error('counter on photo save error:'+err);
              return callback(err1, null);
           }
             var card =new Card(); 
             console.log(err1);
             console.log(result);           
             card.sender_id=id;
             card.post_name = user.post_name;
             card.receiver_id=user._id;
             card.post_mark_address=user.post_address;
             card.post_zip=user.zip;
             card.ID=result.next;
             card.save(callback);               
         });

  });
              
};
