/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Footnote = require('./footnote.model');

exports.register = function(socket) {
  Footnote.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Footnote.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('footnote:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('footnote:remove', doc);
}

function onFind(socket,doc,cb) {
	socket.emit('footnote:find', doc);
}