'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DailyReadingSchema = new Schema({
  day: Date,
  endDay: Date,
  testament: String,
  book: String,
  chapter: Number,
  verses: String,
  group: {type: Schema.ObjectId, ref: 'Group'}
});

module.exports = mongoose.model('DailyReading', DailyReadingSchema);