/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Biblesvc = require('./biblesvc.model');

exports.register = function(socket) {
  Biblesvc.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Biblesvc.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('biblesvc:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('biblesvc:remove', doc);
}