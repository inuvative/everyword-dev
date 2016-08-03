'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  month: Number,
  year: Number
});

module.exports = mongoose.model('Feed', FeedSchema);
