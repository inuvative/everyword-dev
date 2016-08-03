/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Remark = require('./remark.model');

exports.register = function(socket) {
  Remark.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Remark.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('remark:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('remark:remove', doc);
}