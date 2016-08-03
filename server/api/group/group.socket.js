/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Group = require('./group.model');

exports.register = function(socket) {
  Group.schema.post('save', function (group) {
    onSave(socket, group);
  });
  Group.schema.post('remove', function (group) {
    onRemove(socket, group);
  });
}

function onSave(socket, group, cb) {
  socket.emit('group'+group.creator+':save', group);
}

function onRemove(socket, group, cb) {
  socket.emit('group'+group.creator+':remove', group);
}