'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ImageSchema = new Schema({
	url: String,
	type: String
});

module.exports = mongoose.model('Image', ImageSchema);