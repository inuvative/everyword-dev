'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupSchema = new Schema({
  name: String,
  info: String,
  creator: {type: Schema.ObjectId, ref: 'User'},
  members: [{type: Schema.ObjectId, ref: 'User'}],
  invited: [{type: Schema.ObjectId, ref: 'User'}],
  requests: [{type: Schema.ObjectId, ref: 'User'}],
  emails: [String],
  active: Boolean
});

module.exports = mongoose.model('Group', GroupSchema);