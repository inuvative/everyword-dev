'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FollowSchema = new Schema({
  user : {type: Schema.ObjectId, ref: 'User'},
  followers: [{_id: false, id: {type: Schema.ObjectId, ref: 'User'}, name: String}],
  following: [{_id: false, id: {type: Schema.ObjectId, ref: 'User'}, name: String}]
});

module.exports = mongoose.model('Follow', FollowSchema);
