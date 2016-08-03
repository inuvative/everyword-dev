/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Comment = require('./comment.model');

exports.register = function(socket) {
  Comment.schema.post('save', function (comment) {
	Comment.findOne(comment).populate('user').exec(function(err, comm){
	    onSave(socket, comm);
	});
  });
  Comment.schema.post('remove', function (comment) {
     onRemove(socket, comment);
  });
}

function onSave(socket, comment, cb) {
  socket.emit('comment'+comment.user._id+':save', comment);
}

function onRemove(socket, comment, cb) {
  socket.emit('comment'+comment.user+':remove', comment);
}