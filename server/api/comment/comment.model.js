'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User'},
  text: String,
  media: { type: Schema.ObjectId, ref: 'Media'},
  date: {type: Date, default: Date.now},
  isPrivate: Boolean,
  likes: {type: Number, default: 0},
  likers : [{type: Schema.ObjectId, ref: 'Like'}],
  remarks: [{type: Schema.ObjectId, ref: 'Remark'}],
  group: {type: Schema.ObjectId, ref: 'Group'}
});

module.exports = mongoose.model('Comment', CommentSchema);
