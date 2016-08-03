'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BiblesvcSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Biblesvc', BiblesvcSchema);