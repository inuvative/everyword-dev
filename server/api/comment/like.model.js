'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LikeSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User'},
  comment : {type: Schema.ObjectId, ref: 'Comment'}
});

module.exports = mongoose.model('Like', LikeSchema);
