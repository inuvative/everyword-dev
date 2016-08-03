/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Reference = require('./reference.model');

exports.register = function(socket) {
  Reference.schema.post('save', function (doc) {
    Reference.findOne(doc).populate('user').exec(function(err,ref){
    	onSave(socket, ref);
    });
  });
  Reference.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('reference'+doc.user._id+':save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('reference:remove', doc);
}