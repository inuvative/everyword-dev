'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HomebaseSchema = new Schema({
  login:  {
    type: Schema.ObjectId,
    ref: 'User'
  },
  avator: {type: Schema.ObjectId, ref: 'Image'},
  lastPlace : { book: Number, verse: [Number]},
  notebook : {},
  groups: [ {type: Schema.ObjectId, ref: 'Group'}],
  following : [{ type: Schema.ObjectId, ref: 'User'}],
  tags : [{type: Schema.ObjectId, ref: 'Tag'}],
  preferences : { },
  comments : [{type: Schema.ObjectId, ref:'Comment'}],
  messages : [{type: Schema.ObjectId, ref: 'Message'}],
});

module.exports = mongoose.model('Homebase', HomebaseSchema);
