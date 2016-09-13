'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedEntrySchema = new Schema({
  date: {type: Date, default: Date.now},
  user: {type: Schema.ObjectId, ref: 'User'},
  comment: {type: Schema.ObjectId, ref: 'Comment'},
  media: {type: Schema.ObjectId, ref: 'Media'},
  reference: {type: Schema.ObjectId, ref: 'Reference'}
});

module.exports = mongoose.model('FeedEntry', FeedEntrySchema);
