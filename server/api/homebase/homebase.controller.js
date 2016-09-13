'use strict';

var _ = require('lodash');
var each = require('async-each-series');
var mongoose = require('mongoose');

var Homebase = require('./homebase.model');
var Group = require('../group/group.model');
var Comment = require('../comment/comment.model');
var Media = require('../media/media.model');
var Reference = require('../reference/reference.model');
var User = require('../user/user.model');
var Feed = require('../homebase/feed.model');
var FeedEntry = require('../homebase/feed.entry');
var Like = require('../comment/like.model');
var Remark = require('../remark/remark.model');

// Get list of homebases
exports.index = function(req, res) {
  Homebase.find(function (err, homebases) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(homebases);
  });
};

// Get a single homebase
exports.show = function(req, res) {
  Homebase.findOne({ login: req.params.id}).populate('groups tags').exec(function (err, homebase) {
    if(err) { return handleError(res, err); }    
    if(!homebase) {
    	homebase = new Homebase({login: req.params.id});
    	homebase.save();
    	return res.json({'homebase': {'login':homebase.login}, 'userIds':[]});
    }
    var following = homebase.following;//.map(function(u){return u._id;});
	var userIds = _.uniq(following.concat(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);})));
//	homebase.userIds=userIds;
//	getFeed(res,homebase.login,userIds,function(feed){
//		userIds = userIds.filter(function(u) {return u._id !== homebase.login;});
	    return res.json({'homebase': {'login':homebase.login, 'tag':homebase.tags}, 'userIds':userIds});		
//	});
  });
};

// Creates a new homebase in the DB.
exports.create = function(req, res) {
  Homebase.create(req.body, function(err, homebase) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(homebase);
  });
};

// Updates an existing homebase in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Homebase.findOne({ $or : [{_id : req.params.id},{login : req.params.id}]}).populate('following groups tags messages').exec(function (err, homebase) {
    if (err) { return handleError(res, err); }
    if(!homebase) { return res.status(404).send('Not Found'); }
    var groups = _.filter(homebase.groups,['creator',homebase.login]);
    var groupsMembers = _.flatMap(groups,'members').map(function(m){return m.id;});
    var following = _.map(homebase.following, 'id');
    groupsMembers = _.filter(groupsMembers,function(g){return g!==homebase.login});
    if(req.body.following || req.body.tags){
	    _.extend(homebase, req.body);
	    homebase.save(function (err) {
	      if (err) { return handleError(res, err); }
	      return res.status(200).json(homebase);
	    });    		
    }
  });
};

// Deletes a homebase from the DB.
exports.destroy = function(req, res) {
  Homebase.findById(req.params.id, function (err, homebase) {
    if(err) { return handleError(res, err); }
    if(!homebase) { return res.status(404).send('Not Found'); }
    homebase.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

exports.getFeed = function(req, res){
	  var owner = req.params.id;  
	  var dt = req.query.after !== undefined ? new Date(req.query.after) : new Date();
	  var mm = dt.getMonth();
	  var yyyy = dt.getFullYear();
	  var dateQuery = req.query.after === undefined ? {$lte:dt} : {$lt : dt};
	  
	  Homebase.findOne({ login: owner}).populate('groups').exec(function (err, homebase) {
		  var feed = [];
  	      var following = homebase.following;
		  var users = _.uniq(following.concat(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);})));
		  //users.push(owner);
		  FeedEntry.find({user : {$in : users}, date: dateQuery}).sort('-date').limit(20)
		  	.populate('user comment media reference').exec(function(err,entries){
				  each(entries, function(e ,next) {
					  if(e.comment){
						  Comment.populate(e.comment, [{path: 'user', model: 'User'},{path: 'group', model: 'Group'}, {path : 'remarks', model:'Remark'}], function(err, comment){
							  Comment.populate(comment,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(comment){
								  feed.push({'_id': comment._id, 'user': comment.user, 'date': comment.date, 'comment' : comment});
								  next();								  
							  });
						  });
					  }
					  else if(e.media) {
						  Media.populate(e.media,[{path: 'user', model: 'User'},{path: 'image', model: 'Image'}], function(err,med){
							  feed.push({'_id': med._id, 'user': med.user, 'date': med.date, 'media': med});
							  next();
						  });
					  }
					  else if(e.reference){
						  Reference.populate(e.reference,{path: 'user', model: 'User'}, function(err,ref){
							 feed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref});
							 next();
						  });
					  } else {
						  next();						  
					  }
				  },function(err){
					  return res.json(feed);
				  });
		  });
//		  Comment.find({user : { $in : users}, date: dateQuery}).sort('-date').limit(10).populate('user group').exec(function(err,comments){
//			  if(comments){
//				  for(var c in comments){
//					  var comment = comments[c];
//					  feed.push({'_id': comment._id, 'user': comment.user, 'date': comment.date, 'comment' : comment});
//				  }			  
//			  }
//			  Media.find({user: {$in: users}, date: dateQuery}).sort('-date').limit(10).populate('user image').exec(function(err,media){
//				 if(media){
//					 for(var m in media){
//						 var med = media[m];
//						 feed.push({'_id': med._id, 'user': med.user, 'date': med.date, 'media': med});
//					 }				 
//				 }
//				 Reference.find({user: { $in: users}, date: dateQuery}).limit(10).sort('-date').populate('user').exec(function(err,references){
//					if(references){				
//						for(var r in references){
//							var ref = references[r];
//							feed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref});
//						}					
//					}
//					return res.json(feed);
//				 });
//			  });
//		  });
	  });
}

exports.getComments = function(req, res) {
	  Homebase.findOne({ login: req.params.id}).populate('comments').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
	    return res.json(homebase.comments);
	  });
};

exports.getGroups = function(req, res) {
	  var all=req.query.all=="true" ? true : false;
	  
	  Homebase.findOne({ login: req.params.id}).populate('groups').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
		var opts =  {path: 'groups.members', model: 'User'};
		Homebase.populate(homebase, opts, function(err, hb) {
			if(!all && hb.groups.length>20){
				return res.json({'_id': hb._id, 'groups': hb.groups.slice(0,20)});
			}
			return res.json({'_id': hb._id, 'groups': hb.groups});
		})	    
	  });
};

exports.getFollowing = function(req, res) {
    var all=req.query.all=="true" ? true : false;

	Homebase.findOne({ login: req.params.id}).populate('following').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }  
	    User.findById(req.params.id, function(err,user){
	    	if(user.role==='guest' && homebase.following.length===0){
	    		User.find({role:'user'}).limit(20).exec(function(err,users){
	    			homebase.following = users;
	    			homebase.save();
	    			return res.json(homebase.following);
	    		})
	    	} else {
			    if(!all && homebase.following.length>20){
			    	return res.json(homebase.following.slice(0,20));
			    }
			    return res.json(homebase.following);	    		
	    	}
	    })
	  });
};

exports.getMessages = function(req, res) {
	  Homebase.findOne({ login: req.params.id}).populate('messages').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
		var opts =  {path: 'messages.to messages.from', model: 'User'};
		Homebase.populate(homebase, opts, function(err, hb) {			
			return res.json(hb.messages);
		})	    
	  });
};

exports.getTags = function(req, res) {
	  var all = req.query.all=="true" ? true : false;
	  
	  Homebase.findOne({ login: req.params.id}).populate('tags').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
	    if(!all && homebase.tags.length>20){
	    	return res.json(homebase.tags.slice(0,20));
	    }
	    return res.json(homebase.tags);
	  });
};

exports.getLikes = function(req, res) {	  
	  Like.find({ user: req.params.id},function (err, likes) {
	    if(err) { return handleError(res, err); }    
	    if(likes){
	    	var comments=[];
	    	for(var l in likes) {
	    		comments.push(likes[l].comment);
	    	}
	    	return res.json(comments);
	    }
	  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}