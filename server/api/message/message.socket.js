/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Message = require('./message.model');

exports.register = function(socket) {
  Message.schema.post('save', function (message) {
    Message.findById(message._id).populate('to').exec(function(err,msg) {
    	onSave(socket, msg);
    });
  });
  Message.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, msg, cb) {
  socket.emit('message'+msg.to._id+':save', msg);
}

function onRemove(socket, doc, cb) {
  socket.emit('message:remove', doc);
}