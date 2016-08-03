'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MessageSchema = new Schema({
	to :  {
	    type: Schema.ObjectId,
	    ref: 'User'
	  },
	from :  {
	    type: Schema.ObjectId,
	    ref: 'User'
	  },
	subject: String,
	body : String,
	hasAction: Boolean,
	action: { requestType: String, url: String, requestBody: {}, completed: false}
//	attachment : mediaObj
});

module.exports = mongoose.model('Message', MessageSchema);