/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Homebase = require('./homebase.model');
var FeedEntry = require('./feed.entry');

exports.register = function(socket) {
  Homebase.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Homebase.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  FeedEntry.schema.post('save', function (doc) {
	    FeedEntry.findOne(doc).populate('feed').exec(function(err,fe){
	    	onSaveToFeed(socket, fe);
	    });
  });
  FeedEntry.schema.pre('remove', function (next) {
	    FeedEntry.findOne(this).populate('feed').exec(function(err,fe){
	    	onRemoveFromFeed(socket, fe);
	    	next();
	    });
  });

  
}

function onSave(socket, doc, cb) {
  socket.emit('homebase:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('homebase:remove', doc);
}

function onSaveToFeed(socket, doc, cb) {
	  socket.emit('feed'+doc.feed._id+':save', doc);
}

function onRemoveFromFeed(socket, doc, cb) {
  socket.emit('feed'+doc.feed._id+':remove', doc);
}
