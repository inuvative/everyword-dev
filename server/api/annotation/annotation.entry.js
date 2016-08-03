'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AnnotationEntrySchema = new Schema({
  annotationId: {type: Schema.ObjectId, ref: 'Annotation'},
  isComment: Boolean,
  isMedia: Boolean,
  isReference: Boolean,
  content: Schema.ObjectId, 
  date: Date, 
  user: {type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('AnnotationEntry', AnnotationEntrySchema);
