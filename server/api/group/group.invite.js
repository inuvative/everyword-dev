'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupInviteSchema = new Schema({
	to: {type: Schema.ObjectId, ref: 'User'},
	email: String,
	group: {type: Schema.ObjectId, ref: 'Group'},
	message: {type: Schema.ObjectId, ref: 'Message'}
});

module.exports = mongoose.model('GroupInvite', GroupInviteSchema);