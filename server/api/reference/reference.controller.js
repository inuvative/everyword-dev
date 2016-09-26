'use strict';

var _ = require('lodash');
var Reference = require('./reference.model');
var FeedEntry = require('../homebase/feed.entry');
var Like = require('../comment/like.model');

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
    Reference.populate(reference, {path: 'user', model: 'User'}, function(err,reference) {
	    var entry = new FeedEntry({reference: reference._id, user: reference.user, date: reference.date});
	    entry.save();	
	    return res.status(201).json(reference);
    });
  });
};

// Updates an existing reference in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Reference.findById(req.params.id).populate('user remarks').exec(function (err, reference) {
    if (err) { return handleError(res, err); }
    if(!reference) { return res.status(404).send('Not Found'); }
    var updated = _.merge(reference, req.body);
    updated.save(function (err,updatedRef) {
      if (err) { return handleError(res, err); }
      FeedEntry.findOne({reference: reference._id}, function(err, entry) {
      	entry.date = new Date();
      	entry.save();
      });
      var opts = [{path: 'user', model: 'User'},{path: 'remarks.user', model: 'User'}];
      Reference.populate(updatedRef,opts, function(err,ref) {
    	  return res.status(200).json(ref);
      });
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

exports.like = function(req, res) {
	  if(req.body._id) { delete req.body._id; }
	  Reference.findById(req.params.id).populate('likers').exec(function (err, reference) {
	    if (err) { return handleError(res, err); }
	    if(!reference) { return res.status(404).send('Not Found'); }
	    var likeEntry = new Like({user:req.body.user,reference: reference._id});
	    likeEntry.save(function(err,like){
	    	if(err) return handleError(res, err); 
	    	reference.likers.push(like.user)
	    	reference.likes += 1;
	    	reference.save(function (err, ref) {
	            if (err) { return handleError(res, err); }
	            var opts = [{path: 'user', model: 'User'},{path: 'remarks.user', model: 'User'}];
	            Reference.populate(ref,opts, function(err,ref) {
	            	return res.status(200).json(ref);    	    	
	            });
	          });    	
	    })
	});
};

function handleError(res, err) {
  return res.status(500).send(err);
}