'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FeedSchema = new Schema({
  owner: {type: Schema.ObjectId, ref: 'User'},
//  user: {type: Schema.ObjectId, ref: 'User'},
  entries: [
            {
            	id : { type: Schema.ObjectId, ref: 'FeedEntry'},
            	user : { type: Schema.ObjectId, ref: 'User'},
            	date : Date
            }],
  date: {type: Date, default: Date.now}
});

FeedSchema.index({owner:1});

module.exports = mongoose.model('Feed', FeedSchema);
