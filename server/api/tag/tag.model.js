'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User'},
  tag: String,
  date: {type: Date, default: Date.now}
  
});

module.exports = mongoose.model('Tag', TagSchema);