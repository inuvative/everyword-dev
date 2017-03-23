'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupRequestSchema = new Schema({
	from: {type: Schema.ObjectId, ref: 'User'},
	group: {type: Schema.ObjectId, ref: 'Group'},
	message: {type: Schema.ObjectId, ref: 'Message'}
});

module.exports = mongoose.model('GroupRequest', GroupRequestSchema);