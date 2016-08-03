'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MediaSchema = new Schema({
	url: String,
	name: String,
	description: String,
	date: {type: Date, default: Date.now},
	type: String,
	image: {type: Schema.ObjectId, ref: 'Image'},
	user: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Media', MediaSchema);