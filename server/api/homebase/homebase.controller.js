'use strict';

var _ = require('lodash');
var each = require('async-each-series');
var mongoose = require('mongoose');
var mongooseTypes = mongoose.Types;

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
    var following = homebase.following.map(function(f){ return f.toJSON(); });
    var groupMembers = _.map(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);}),function(m){return m.toJSON();});
    var userIds = _.uniq(following.concat(groupMembers));
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
  Homebase.findOne({ $or : [{_id : req.params.id},{login : req.params.id}]}).populate('groups messages').exec(function (err, homebase) {
    if (err) { return handleError(res, err); }
    if(!homebase) { return res.status(404).send('Not Found'); }
    var groups = _.filter(homebase.groups,['creator',homebase.login]);
    var groupsMembers = _.flatMap(groups,'members').map(function(m){return m.id;});
    //var following = _.map(homebase.following, 'id');
    groupsMembers = _.filter(groupsMembers,function(g){return g!==homebase.login});
    if(req.body.following || req.body.tags){
	    _.assignWith(homebase, req.body, function(oldVal,newVal){
	    	if(_.isArray(oldVal)) {
	    		return oldVal.concat(newVal);
	    	} else {
	    		return newVal;
	    	}});
	    homebase.save(function (err) {
	      if (err) { return handleError(res, err); }
	      return res.status(200).json(homebase);
	    });    		
    } else if(req.body.unfollow){
    	var i = homebase.following.indexOf(req.body.unfollow);
    	if(i>-1){
    		homebase.following.splice(i,1);
    		homebase.save(function (err) {
    		      if (err) { return handleError(res, err); }
    		      return res.status(200).json(homebase);
    		});
    	}
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
		  if(err||!homebase){
			  return res.json(feed);
		  }
  	      followEverywordUser(homebase, function(following) {
  			  var users = _.uniq(following.concat(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);})));
  			  users = _.union([owner],users);
  			  FeedEntry.find({user : {$in : users}, date: dateQuery}).sort('-date').limit(20)
  			  	.populate('user comment media reference').exec(function(err,entries){
  					  each(entries, function(e ,next) {
  						  if(e.comment){
  							  Comment.populate(e.comment, [{path: 'user', model: 'User'},{path: 'group', model: 'Group'}, {path : 'remarks', model:'Remark'}], function(err, comment){
  								  Comment.populate(comment,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(comment){
  									  feed.push({'_id': comment._id, 'user': comment.user, 'date': comment.date, 'comment' : comment, 'likes' : comment.likes});
  									  next();								  
  								  });
  							  });
  						  }
  						  else if(e.media) {
  							  Media.populate(e.media,[{path: 'user', model: 'User'},{path: 'image', model: 'Image'},{path : 'remarks', model:'Remark'}], function(err,media){
  								  Media.populate(media,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(med){
  									  feed.push({'_id': med._id, 'user': med.user, 'date': med.date, 'media': med, 'likes': med.likes});
  									  next();
  								  });
  							  });
  						  }
  						  else if(e.reference){
  							  Reference.populate(e.reference,[{path: 'user', model: 'User'},{path : 'remarks', model:'Remark'}], function(err,reference){
  								 Reference.populate(reference,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(ref){
  									 feed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref, 'likes': ref.likes});
  									 next();
  								 });
  							  });
  						  } else {
  							  next();						  
  						  }
  					  },function(err){
  						  return res.json(feed);
  					  });
  			  });  	    	  
  	      });
	  });
}

exports.getComments = function(req, res) {
	  FeedEntry.find({ user: req.params.id}, function (err, entries) {
	    if(err) { return handleError(res, err); }    
	    return res.json(entries);
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
var getCounts = function(user,res){
	Homebase.findOne({ login: user._id}, function (err, homebase) {
		   var counts={};
		   if(homebase){		
			   counts.following = homebase.following? homebase.following.length : 0;
			   counts.followers = homebase.followers? homebase.followers.length : 0;
			   FeedEntry.count({ user: user._id}, function (err, entries) {
				     counts.comments=entries;   
					  Like.count({ user: user._id},function (err, likes) {
						  counts.likes=likes;
					      res(counts);
					  });
			  });		
		   } else {
			   res({'following':0,'followers':0,'comments':0,'likes':0})
		   }
	});
}

exports.getFollowing = function(req, res) {
    var all=req.query.all=="true" ? true : false;
    var lastId=req.query.lastid;
    var name=req.query.name;
	Homebase.findOne({ login: req.params.id}).exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }
	    if(!homebase) return res.send(null);
	    User.findById(req.params.id, function(err,user){
	    	if(user.role==='guest' || homebase.following.length==0){
	    		Comment.aggregate(
	    			    [
	    			        // Grouping pipeline
	    			        { "$group": { 
	    			            "_id": "$user", 
	    			            "count": { "$sum": 1 }
	    			        }},
	    			        {"$match" : { "_id": { "$ne" : null}}},
	    			        // Sorting pipeline
	    			        { "$sort": { "count": -1 } },
	    			        // Optionally limit results
	    			        { "$limit": 20 }
	    			    ],
	    			    function(err,result) {
	    			       if(result){
	    			    	   var following = _.filter(result,function(u){
	    			    		   return u && u._id && !u._id.equals(user.id)
	    			    		   });
		    			       User.find({$or: [{_id:{ $in : following }},{email:'everywordbible@gmail.com'}]}, function(err,users){
		    		    			homebase.following = users;
		    		    			homebase.save(function(err,hb){
		    		    				Homebase.populate(hb, 'following', function(err,hb) {
				    		    			return res.json(hb.following);		    		    					
		    		    				});
		    		    			});
		    		    		})
		    			       // Result is an array of documents	    			    	   
	    			       }
	    			    }
	    			);
	    	} else {
	    		var following = homebase.following;
	    		var query = lastId ? {_id:{ $in: following, $gt: mongooseTypes.ObjectId(lastId)}} : {_id: { $in: following}};
	    		if(name){
	    			query.name = {$regex: name, $options: 'i' };
	    		}
	    		var limit = !all && following.length>20 ? 20 : 0;	    		
	    		User.find(query, '-salt -hashedPassword').sort({_id: 1}).limit(limit).lean().exec(function (err, users) {
	    		    if(err) return res.status(500).send(err);
	    		    if(!users){
	    		    	return res.status(200).json([]);
	    		    } else {
	    		    	each(users, function(u ,next) {
	    		    		getCounts(u,function(counts){
	    		    			_.assign(u,counts);
	    		    		    next();	    	
	    		    		});
	    				  },function(err){
	    					  return res.status(200).json(users);
	    				  });
	    		    }	    			
	    		});
	    	}
	    })
	  });
};

exports.getFollowers = function(req, res) {
    var all=req.query.all=="true" ? true : false;

	Homebase.find({ following: req.params.id}).populate('login').exec(function (err, homebases) {
	    if(err) { return handleError(res, err); }  
	    	return res.json(homebases);	    		
	    });
//	  });
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
	    	var entries=[];
	    	for(var l in likes) {
	    		entries.push(likes[l].comment || likes[l].media || likes[l].reference);
	    	}
	    	return res.json(entries);
	    }
	  });
};

function followEverywordUser(homebase, cb){
	User.findOne({email: 'everywordbible@gmail.com'}, function(err, user){
		if(err || !user){
			cb(homebase.following);
		} else {
			if(homebase.following.indexOf(user._id)===-1){
				homebase.following.push(user._id);
				homebase.save();
			}
			cb(homebase.following);
		}
	});
}
function handleError(res, err) {
  return res.status(500).send(err);
}