var models = require('../models');
var Counter = models.Counter;

exports.increment = function (counter, callback) {
    return Counter.findOneAndUpdate({_id:counter}, { $inc: { next: 1 } }, {new: true, upsert: true, select: {next: 1}}, callback);
};

