'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DailyReadingSchema = new Schema({
  day: Date,
  testament: String,
  book: String,
  chapter: Number,
  verses: String,
});

module.exports = mongoose.model('DailyReading', DailyReadingSchema);