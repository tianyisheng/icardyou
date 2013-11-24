var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var TopicAttendSchema = new Schema({
  user_id: { type: ObjectId },
  topic_id: { type: ObjectId },
  create_at: { type: Date, default: Date.now }
});

mongoose.model('TopicAttend', TopicAttendSchema);
