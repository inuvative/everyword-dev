'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LDSSchema = new Schema({
  volume_id: Number,
  book_id: Number,
  chapter_id: Number,
  verse_id: Number,
  volume_title: String,
  book_title: String,
  volume_long_title: String,
  book_long_title: String,
  volume_subtitle: String,
  book_subtitle: String,
  volume_short_title: String,
  book_short_title: String,
  volume_lds_url: String,
  book_lds_url: String,
  chapter_number: Number,
  verse_number: Number,
  scripture_text: String,
  verse_title: String,
  verse_short_title: String
});

module.exports = mongoose.model('lds_scripture', LDSSchema);