'use strict';

var _ = require('lodash');
var Reference = require('./reference.model');
var FeedEntry = require('../homebase/feed.entry');

// Get list of references
exports.index = function(req, res) {
  Reference.find(function (err, references) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(references);
  });
};

// Get a single reference
exports.show = function(req, res) {
  Reference.findById(req.params.id, function (err, reference) {
    if(err) { return handleError(res, err); }
    if(!reference) { return res.status(404).send('Not Found'); }
    return res.json(reference);
  });
};

// Creates a new reference in the DB.
exports.create = function(req, res) {
  Reference.create(req.body, function(err, reference) {
    if(err) { return handleError(res, err); }
    var entry = new FeedEntry({reference: reference._id, user: reference.user, date: reference.date});
    entry.save();	
    return res.status(201).json(reference);
  });
};

// Updates an existing reference in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Reference.findById(req.params.id, function (err, reference) {
    if (err) { return handleError(res, err); }
    if(!reference) { return res.status(404).send('Not Found'); }
    var updated = _.merge(reference, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      FeedEntry.findOne({reference: reference._id}, function(err, entry) {
      	entry.date = new Date();
      	entry.save();
      });
      return res.status(200).json(reference);
    });
  });
};

// Deletes a reference from the DB.
exports.destroy = function(req, res) {
  Reference.findById(req.params.id, function (err, reference) {
    if(err) { return handleError(res, err); }
    if(!reference) { return res.status(404).send('Not Found'); }
    reference.remove(function(err) {
      if(err) { return handleError(res, err); }
      FeedEntry.findOne({reference: reference._id}, function(err,entry){
    	  entry.remove();
      });      
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}