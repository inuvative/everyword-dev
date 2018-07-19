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

function onRemoveFromFeed(socket, doc, cb) {
  socket.emit('feed'+doc.user._id+':remove', doc);
}

exports.sendToFeed = function(userId,fe) {
	io.emit('feed'+userId+':new', fe);
}

exports.sendFeedDone = function(userId){
	io.emit('feed'+userId+':done');
}

exports.sendFollowing = function(userId, ff){
	io.emit('feed'+userId+':following',ff);
}

exports.sendAvailable = function(userId,u){
	io.emit('feed'+userId+':available',u);
}