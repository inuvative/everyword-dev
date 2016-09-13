'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RemarkSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User'},
  remark: String,
  comment: { type: Schema.ObjectId, ref: 'Comment'},
  date: {type: Date, default: new Date()}
});

module.exports = mongoose.model('Remark', RemarkSchema);