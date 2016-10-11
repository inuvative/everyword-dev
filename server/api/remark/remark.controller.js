'use strict';

var _ = require('lodash');
var Remark = require('./remark.model');
var Comment = require('../comment/comment.model');
var Reference = require('../reference/reference.model');
var Media = require('../media/media.model');

// Get list of remarks
exports.index = function(req, res) {
  Remark.find(function (err, remarks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(remarks);
  });
};

// Get a single remark
exports.show = function(req, res) {
  Remark.findById(req.params.id, function (err, remark) {
    if(err) { return handleError(res, err); }
    if(!remark) { return res.status(404).send('Not Found'); }
    return res.json(remark);
  });
};

// Creates a new remark in the DB.
exports.create = function(req, res) {
  Remark.create(req.body, function(err, remark) {
    if(err) { return handleError(res, err); }
    if(remark.comment){
        Comment.findById(remark.comment, function(err, comm){
        	if(comm) {
            	comm.remarks.push(remark._id);
            	comm.save();    		
        	}
        });    	
    }
    if(remark.reference){
        Reference.findById(remark.reference, function(err, ref){
        	if(ref) {
            	ref.remarks.push(remark._id);
            	ref.save();    		
        	}
        });    	    	
    }
    if(remark.media){
        Media.findById(remark.media, function(err, media){
        	if(media) {
        		media.remarks.push(remark._id);
        		media.save();    		
        	}
        });    	
    }
    return res.status(201).json(remark);
  });
};

// Updates an existing remark in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Remark.findById(req.params.id, function (err, remark) {
    if (err) { return handleError(res, err); }
    if(!remark) { return res.status(404).send('Not Found'); }
    var updated = _.merge(remark, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(remark);
    });
  });
};

// Deletes a remark from the DB.
exports.destroy = function(req, res) {
  Remark.findById(req.params.id, function (err, remark) {
    if(err) { return handleError(res, err); }
    if(!remark) { return res.status(404).send('Not Found'); }
    remark.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}