'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FollowingSchema = new Schema({
  follower: { type: Schema.ObjectId, ref: 'User'},
  following: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Following', FollowingSchema);
