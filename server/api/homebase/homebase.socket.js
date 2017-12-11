/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Homebase = require('./homebase.model');
var FeedEntry = require('./feed.entry');
var io = null;

exports.register = function(socket) {
  Homebase.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Homebase.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  io=socket;
//  FeedEntry.schema.post('save', function (doc) {
//	    FeedEntry.findOne(doc).populate('comment media reference user').exec(function(err,fe){
//	    	onSaveToFeed(socket, fe);
//	    });
//  });
//  FeedEntry.schema.pre('remove', function (next) {
//	    FeedEntry.findOne(this).populate('comment media reference user').exec(function(err,fe){
//	    	onRemoveFromFeed(socket, fe);
//	    	next();
//	    });
//  });

  
}

function onSave(socket, doc, cb) {
  socket.emit('homebase:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('homebase:remove', doc);
}

exports.sendToFeed = function(user,fe) {
	io.emit('feed'+user._id+':response', fe);
}

function onRemoveFromFeed(socket, doc, cb) {
  socket.emit('feed'+doc.user._id+':remove', doc);
}
