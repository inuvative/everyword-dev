'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FollowSchema = new Schema({
  user : {type: Schema.ObjectId, ref: 'User'},
  followers: [{ type: Schema.ObjectId, ref: 'User'}],
  following: [{ type: Schema.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Follow', FollowSchema);
