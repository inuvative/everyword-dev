'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FootnoteSchema = new Schema({
	strongs_num: String,
	strongs_def: String,
	derivation: String,
	pronounciation: String,
	lemma: String,
	family: String,
	transliteration: String,
	kjv_def: { type: String, text : true}
});

FootnoteSchema.path('kjv_def').index({text : true});

module.exports = mongoose.model('Footnote', FootnoteSchema);