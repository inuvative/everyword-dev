'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LikeSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User'},
  comment : {type: Schema.ObjectId, ref: 'Comment'},
  reference : {type: Schema.ObjectId, ref: 'References'},
  media : {type: Schema.ObjectId, ref: 'Media'}
});

module.exports = mongoose.model('Like', LikeSchema);
