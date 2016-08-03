'use strict';

var _ = require('lodash');
var Media = require('./media.model');
var Image = require('./media.image');
var multiparty = require('multiparty');
var Feed = require('../homebase/feed.model');
var FeedEntry = require('../homebase/feed.entry');

// Get list of medias
exports.index = function(req, res) {
  Media.find(function (err, medias) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(medias);
  });
};

// Get a single media
exports.show = function(req, res) {
  Media.findById(req.params.id, function (err, media) {
    if(err) { return handleError(res, err); }
    if(!media) { return res.status(404).send('Not Found'); }
    return res.json(media);
  });
};

// Creates a new media in the DB.
exports.create = function(req, res) {
  var form = new multiparty.Form();	 
  form.parse(req, function(err, fields, files) {
	  var body = {
				url: fields.url[0],
				name: fields.name[0],
				description: fields.description[0],
				type: fields.type[0],
				user: fields.user[0]
	  }
	  if(fields.type[0].match('image.*')){
		  var url = fields.url[0];
		  var type = fields.type[0];
		  var image = new Image({url: url, type: type});
		  image.save(function(err){
			  if(err) handleError(res, err);
			  body.url='';
			  body.image = image._id;
			  Media.create(body, function(err, media) {
				    if(err) { return handleError(res, err); }
			    	updateFeed(media);
				    media.populate('image', function(err,media){
					    return res.status(201).json(media);				    	
				    })
				  });
		  });
	  }	else {
		  Media.create(body, function(err, media) {
			    if(err) { return handleError(res, err); }
			    updateFeed(media);
			    return res.status(201).json(media);
			 });		  
	  }  
  });
};

// Updates an existing media in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Media.findById(req.params.id, function (err, media) {
    if (err) { return handleError(res, err); }
    if(!media) { return res.status(404).send('Not Found'); }
    var updated = _.merge(media, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(media);
    });
  });
};

// Deletes a media from the DB.
exports.destroy = function(req, res) {
  Media.findById(req.params.id, function (err, media) {
    if(err) { return handleError(res, err); }
    if(!media) { return res.status(404).send('Not Found'); }
    media.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

function updateFeed(media) {
    var dt = new Date();
    var mm = dt.getMonth();
    var yyyy = dt.getFullYear();
    Feed.findOne({user: media.user, month: mm, year: yyyy}, function(err1,feed) {
    		if(err1) { return handleError(res, err1); }
    		if(!feed){
    			feed = new Feed({user: media.user, month: mm, year: yyyy});
    			feed.save(function(err) {
    				if(err) return handleError(err);
    			});
    		}
    		var entry = new FeedEntry({feed: feed._id, media: media._id, user: media.user, date: media.date});
    		entry.save(function(err2){
    			if(err2) return handleError(err2);
    		});
    	});
	
}