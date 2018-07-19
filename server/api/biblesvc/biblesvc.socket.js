/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Biblesvc = require('./biblesvc.model');
var io=null;
exports.register = function(socket) {
  Biblesvc.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Biblesvc.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
  io=socket;
}

function onSave(socket, doc, cb) {
  socket.emit('biblesvc:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('biblesvc:remove', doc);
}

exports.sendVerse = function(userId, verse) {
	io.emit('reading'+userId+':verse',verse);
};