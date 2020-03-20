'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AnnotationSchema = new Schema({
  book: String,
  chapter: Number,
  verse: Number,
  footnotes: [{
	word : String,
	notes : [{type: Schema.ObjectId, ref: 'Footnote'}]
  }],
  references: [{type: Schema.ObjectId, ref: 'Reference'}],
  comments: [{type: Schema.ObjectId, ref: 'Comment'}],
  media: [{type: Schema.ObjectId, ref: 'Media'}]
});

module.exports = mongoose.model('Annotation', AnnotationSchema);
