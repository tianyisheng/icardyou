var mongoose = require('mongoose'); 
var Schema = mongoose.Schema;

var CounterSchema = new mongoose.Schema({
    _id: String,
    next: {type: Number, default: 1}
});

mongoose.model('Counter', CounterSchema);  
