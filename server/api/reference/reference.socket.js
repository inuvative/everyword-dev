/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Reference = require('./reference.model');

exports.register = function(socket) {
  Reference.schema.post('save', function (doc) {
    Reference.findById(doc._id).populate('user remarks').exec(function(err,reference){
    	Reference.populate(reference,[{path: 'remarks.user', select: 'name', model: 'User'}], function(err, ref){
        	onSave(socket, ref);
		});
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