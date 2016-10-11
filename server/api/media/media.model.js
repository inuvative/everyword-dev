'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MediaSchema = new Schema({
	url: String,
	name: String,
	description: String,
	date: {type: Date, default: Date.now},
	type: String,
	isPrivate: Boolean,
	image: {type: Schema.ObjectId, ref: 'Image'},
	user: { type: Schema.ObjectId, ref: 'User'},
	remarks: [{type: Schema.ObjectId, ref: 'Remark'}],
    likes: {type: Number, default: 0},
	likers : [{type: Schema.ObjectId, ref: 'Like'}]
});

module.exports = mongoose.model('Media', MediaSchema);