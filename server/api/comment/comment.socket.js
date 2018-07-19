/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Comment = require('./comment.model');
var Follow = require('../homebase/follow.model');

exports.register = function(socket) {
  Comment.schema.post('save', function (comment) {
	Comment.findById(comment._id).populate('user remarks group').exec(function(err, comm){
		Comment.populate(comm,[{path: 'remarks.user', select: 'name', model: 'User'}], function(err, comm){
			onSave(socket, comm);
		});
	});
  });
  Comment.schema.post('remove', function (comment) {
     onRemove(socket, comment);
  });
}

function onSave(socket, comment, cb) {
	Follow.findOne({user:comment.user._id}).select('followers').lean().exec(function(err,e2){
		  comment.followers=e2 && e2.followers ? e2.followers: [];
		  
		  socket.emit('comment'+comment.user._id+':save', {_id: comment._id , comment: comment});		
	});
}

function onRemove(socket, comment, cb) {
  socket.emit('comment'+comment.user+':remove', comment);
}