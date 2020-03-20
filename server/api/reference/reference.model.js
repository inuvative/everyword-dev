'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReferenceSchema = new Schema({
	url: String,
	description: String,
	date: {type: Date, default: Date.now},
	user: { type: Schema.ObjectId, ref: 'User'},
	isPrivate: Boolean,
	likes: {type: Number, default: 0},
	likers : [{type: Schema.ObjectId, ref: 'Like'}],
	remarks: [{type: Schema.ObjectId, ref: 'Remark'}]
});

module.exports = mongoose.model('Reference', ReferenceSchema);