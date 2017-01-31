/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Dailyreading = require('./dailyreading.model');

exports.register = function(socket) {
  Dailyreading.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Dailyreading.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('dailyreading:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('dailyreading:remove', doc);
}