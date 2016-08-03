'use strict';

var _ = require('lodash');
var Footnote = require('./footnote.model');

// Get list of footnotes
exports.index = function(req, res) {
  Footnote.find({}).limit(15).exec(function (err, footnotes) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(footnotes);
  });
};

// Get a single footnote
exports.show = function(req, res) {
  Footnote.findById(req.params.id, function (err, footnote) {
    if(err) { return handleError(res, err); }
    if(!footnote) { return res.status(404).send('Not Found'); }
    return res.json(footnote);
  });
};

// Creates a new footnote in the DB.
exports.create = function(req, res) {
  Footnote.create(req.body, function(err, footnote) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(footnote);
  });
};

// Updates an existing footnote in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Footnote.findById(req.params.id, function (err, footnote) {
    if (err) { return handleError(res, err); }
    if(!footnote) { return res.status(404).send('Not Found'); }
    var updated = _.merge(footnote, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(footnote);
    });
  });
};

// Deletes a footnote from the DB.
exports.destroy = function(req, res) {
  Footnote.findById(req.params.id, function (err, footnote) {
    if(err) { return handleError(res, err); }
    if(!footnote) { return res.status(404).send('Not Found'); }
    footnote.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}