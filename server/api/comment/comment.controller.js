'use strict';

var _ = require('lodash');
var Like = require('./like.model');
var Comment = require('./comment.model');
var Homebase  = require('../homebase/homebase.model');
var FeedEntry = require('../homebase/feed.entry');


// Get list of comments
exports.index = function(req, res) {
  Comment.find(//)
//  .populate('user')
//  .exec(function (err, comments) {
//	    if(err) { return handleError(res, err); }
//	    if(!comments) { return res.send(null); }
//	    return res.status(200).json(comments);
//  });

  function (err, comments) {
	
    if(err) { return handleError(res, err); }
    return res.status(200).json(comments);
  });
};

// Get a single comment
exports.show = function(req, res) {
  Comment.findById(req.params.id, function (err, comment) {
    if(err) { return handleError(res, err); }
    if(!comment) { return res.status(404).send('Not Found'); }
    return res.json(comment);
  });
};

// Creates a new comment in the DB.
exports.create = function(req, res) {
  Comment.create(req.body, function(err, comment) {
    if(err) { return handleError(res, err); }
    Comment.populate(comment, {path: 'user', model: 'User'}, function(err,comm) {
		var entry = new FeedEntry({comment: comm._id, date: comm.date, user: comm.user});
		entry.save();									
    	return res.status(201).json(comm);    	    	
    });
  });
};

// Updates an existing comment in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Comment.findById(req.params.id).populate('user remarks').exec(function (err, comment) {
    if (err) { return handleError(res, err); }
    if(!comment) { return res.status(404).send('Not Found'); }
    var updated = _.merge(comment, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      FeedEntry.findOne({comment: comment._id}, function(err,entry){
    	  entry.date = new Date();
    	  entry.save();
      });
      var opts = [{path: 'user', model: 'User'},{path: 'remarks.user', model: 'User'}];
      Comment.populate(comment,opts, function(err,comm) {
      	return res.status(200).json(comm);    	    	
      });
//      return res.status(200).json(comment);
    });
  });
};

//Updates an existing comment in the DB.
exports.like = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Comment.findById(req.params.id).populate('likers').exec(function (err, comment) {
    if (err) { return handleError(res, err); }
    if(!comment) { return res.status(404).send('Not Found'); }
    var likeEntry = new Like({user:req.body.user,comment: comment._id});
    likeEntry.save(function(err,like){
    	if(err) return handleError(res, err); 
    	comment.likers.push(like.user)
    	comment.likes += 1;
        comment.save(function (err, comm) {
            if (err) { return handleError(res, err); }
            var opts = [{path: 'user', model: 'User'},{path: 'remarks.user', model: 'User'}];
            Comment.populate(comm,opts, function(err,comm) {
            	return res.status(200).json(comm);    	    	
            });
//            return res.status(200).json(comment);
          });    	
    })
  });
};

// Deletes a comment from the DB.
exports.destroy = function(req, res) {
  Comment.findById(req.params.id).populate('remarks likers').exec(function (err, comment) {
    if(err) { return handleError(res, err); }
    if(!comment) { return res.status(404).send('Not Found'); }
    var remarks = comment.remarks = [];
    var likers = comment.likers || [];
    comment.remove(function(err) {
      if(err) { return handleError(res, err); }
      _.forEach(remarks, function(rem) {
    	  rem.remove();
      });
      _.forEach(likers, function(like) {
    	 like.remove(); 
      });
      FeedEntry.findOne({comment: comment._id}, function(err,entry){
    	  entry.remove();
      });
      return res.status(200).send(req.params.id);
    });
  });
};

//exports.getComments = function(req,res) {
//	Comment.find({'scriptures.book': req.params.book, 'scriptures.verses.number': req.params.verse }, 
//		function (err, comment) {
//		    if(err) { return handleError(res, err); }
//		    if(!comment) { return res.status(404).send('Not Found'); }
//		    return res.json(comment);
//	  });
//};

function handleError(res, err) {
  return res.status(500).send(err);
}