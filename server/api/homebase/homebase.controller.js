'use strict';

var _ = require('lodash');
var each = require('async-each-series');
var mongoose = require('mongoose');
var mongooseTypes = mongoose.Types;

var Homebase = require('./homebase.model');
var feedSocket = require('./homebase.socket');

var Group = require('../group/group.model');
var Comment = require('../comment/comment.model');
var Media = require('../media/media.model');
var Image = require('../media/media.image');
var Reference = require('../reference/reference.model');
var User = require('../user/user.model');
var Feed = require('../homebase/feed.model');
var NewFeed = require('../homebase/newfeed.model');
var FeedEntry = require('../homebase/feed.entry');
var Like = require('../comment/like.model');
var Remark = require('../remark/remark.model');
var Follow = require('./follow.model');

// Get list of homebases
exports.index = function(req, res) {
  Homebase.find(function (err, homebases) {
    if(err) { return handleError(res, err); }
    return sendJSON(res,homebases);
  });
};

// Get a single homebase
exports.show = function(req, res) {
  Homebase.findOne({ login: req.params.id}).populate('groups tags').exec(function (err, homebase) {
    if(err) { return handleError(res, err); }    
    if(!homebase) {
    	homebase = new Homebase({login: req.params.id});
    	homebase.save();
    	return sendJSON(res,{'homebase': {'login':homebase.login}, 'userIds':[]});
    }
    var following = homebase.following.map(function(f){ return f.toJSON(); });
    var groupMembers = _.map(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);}),function(m){return m.toJSON();});
    var userIds = _.uniq(following.concat(groupMembers));
//	homebase.userIds=userIds;
//	getFeed(res,homebase.login,userIds,function(feed){
//		userIds = userIds.filter(function(u) {return u._id !== homebase.login;});
	    return sendJSON(res,{'homebase': {'login':homebase.login, 'tag':homebase.tags}, 'userIds':userIds});		
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
  if(req.body.following || req.body.unfollow){
	  return updateFollowing(req, res);
  }
  Homebase.findOne({ $or : [{_id : req.params.id},{login : req.params.id}]}).populate('groups messages').exec(function (err, homebase) {
    if (err) { return handleError(res, err); }
    if(!homebase) { return res.status(404).send('Not Found'); }
    var groups = _.filter(homebase.groups,['creator',homebase.login]);
    var groupsMembers = _.flatMap(groups,'members').map(function(m){return m.id;});
    //var following = _.map(homebase.following, 'id');
    groupsMembers = _.filter(groupsMembers,function(g){return g!==homebase.login});
    if(req.body.tags){
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
    }
//    else if(req.body.unfollow){
//    	var i = homebase.following.indexOf(req.body.unfollow);
//    	if(i>-1){
//    		homebase.following.splice(i,1);
//    		homebase.save(function (err) {
//    		      if (err) { return handleError(res, err); }
//    		      return res.status(200).json(homebase);
//    		});
//    	}
//    }
  });
};

function updateFeed(owner,user,follow) {
	if(follow){
		FeedEntry.find({user:user},function(err,entries){
			var userEntries = entries.map(function(e) { return { id: e._id, user: e.user, date: e.date}});
			NewFeed.update({owner:owner},{$push: {entries: { $each: userEntries}}}, function(err,feeds){
				
			});			
		});
	} else {
		NewFeed.update({owner:owner}, {$pull: {entries: {user: user}}}, function(err,feeds){
			
		});
	}
}

exports.follow = function(req,res){
	Follow.findOneAndUpdate({user: req.params.id},{$push: {'following' : req.body}},{'new':true,upsert:true},function(err,follows){
		if(err){return handleError(res,err);}		
		updateFeed(req.params.id,req.body.id,true)
		User.findById(req.params.id, function(err,user){
			var follower = {id: user._id, name: user.name};
			Follow.update({user:req.body.id},{$push:{'followers': follower}},{upsert:true},function(err,follows){
				if(err){
					console.log("Failed update error: "+err);
				}
			});
		})
		return res.status(200).json(follows);
	})
}

exports.unfollow = function(req,res){
	Follow.findOneAndUpdate({user: req.params.id},{$pull: {'following' : {'id': req.body.id}}},{'new':true,upsert:true},function(err,follows){
		if(err){return handleError(res,err);}
		updateFeed(req.params.id,req.body.id,false)
		User.findById(req.params.id, function(err,user){
			var follower = {id: user._id, name: user.name};
			Follow.update({user:req.body.id},{$pull:{'followers': {'id': follower.id}}},{upsert:true},function(err,follows){
				if(err){
					console.log("Failed update error: "+err);
				}
			});
		})
		return res.status(200).json(follows);
	})
}

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

exports.streamFeed = function(req,res){
	  var owner = req.params.id;  
	  var dt = req.query.after !== undefined ? new Date(req.query.after) : new Date();	
	  var mm = dt.getMonth();
	  var yyyy = dt.getFullYear();
	  var dateQuery = req.query.after === undefined ? {"$lte":dt} : {"$lt" : dt};
	  var dateCmp = req.query.after === undefined ? _.lte : _.lt;
	  var feedentry_fields = [
	                          {path: 'comment', model: 'Comment'},	                          
	                          {path: 'media', model: 'Media'},	                          
	                          {path: 'reference', model: 'Reference'},	                          
	      ];
	  
	  var userFeed=[];
	  Feed.findOne({"owner":owner},function(err,feed){
		  FeedEntry.find({_id: {$in: feed.entries}, date : dateQuery}).populate('comment media reference').sort('-date').limit(20)
		  .stream()
		  .on('data',function(e){			      
				  if(e.comment){
					  Comment.populate(e.comment, [{path: 'user', model: 'User'},{path: 'group', model: 'Group'}, {path : 'remarks', model:'Remark'}], function(err, comment){
						  Comment.populate(comment,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(comment){
							  userFeed.push({'_id': comment._id, 'user': comment.user, 'date': comment.date, 'comment' : comment, 'likes' : comment.likes});
						  });
					  });
				  }
				  else if(e.media) {
					  Media.populate(e.media,[{path: 'user', model: 'User'},{path: 'image', model: 'Image'},{path : 'remarks', model:'Remark'}], function(err,media){
						  Media.populate(media,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(med){
							  userFeed.push({'_id': med._id, 'user': med.user, 'date': med.date, 'media': med, 'likes': med.likes});
						  });
					  });
				  }
				  else if(e.reference){
					  Reference.populate(e.reference,[{path: 'user', model: 'User'},{path : 'remarks', model:'Remark'}], function(err,reference){
						 Reference.populate(reference,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(ref){
							 userFeed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref, 'likes': ref.likes});
						 });
					  });
				  }			  
		  })
		  .on('end',function(){
			  sendJSON(res,userFeed);
		  })
	  });
}

exports.getFeedNew = function(req, res){
	  var owner = req.params.id;  
	  var dt = req.query.after !== undefined ? new Date(req.query.after) : new Date();	
	  var mm = dt.getMonth();
	  var yyyy = dt.getFullYear();
	  var dateQuery = req.query.after === undefined ? {"$lte":dt} : {"$lt" : dt};
	  var dateCmp = req.query.after === undefined ? _.lte : _.lt;
	  var feedentry_fields = [
	                          {path: 'comment', model: 'Comment'},	                          
	                          {path: 'media', model: 'Media'},	                          
	                          {path: 'reference', model: 'Reference'},	                          
	      ];
	  Feed.aggregate([{"$match":{"owner":mongooseTypes.ObjectId(owner)}}, 
	                  {"$unwind":"$entries"}, 
	                  {"$match":{"entries.date":dateQuery}},
	                  {$group:{_id:"$owner",entries:{ $addToSet: "$entries"}}}],function(err,f){
	   		if(!f||f.length==0){
	   			return [];
	   		}
	   		f=f[0];
	   		var entries = _.orderBy(f.entries,'date','desc');
	   		entries = _.slice(entries,0,20);
	   		var feed=[];
	   		each(entries, function(e,next) {
	   		  Follow.findOne({user:e.user._id}).select('followers').exec(function(err,e2){
	   			  e.followers=e2 && e2.followers ? e2.followers: [];
	   			  var anno = e.comment||e.media||e.reference;
	   			  Remark.find({$or:[{comment:anno},{media:anno},{reference:anno}]}).populate('user').exec(function(err,remarks){
	   				  e.remarks=remarks||[];
					  if(e.comment){
						  Group.findOne({_id: e.comment.group}, function(err, group){
							  e.comment.group=group;
							  //feed.push(e);
							  feedSocket.sendToFeed(owner,e);
							  next();								  
						  });
					  }
					  else if(e.media) {
						  Image.findOne({_id: e.media.image}, function(err,image){
							  e.media.image=image;
//							  feed.push(e);
							  feedSocket.sendToFeed(owner,e);
							  next();
						  });
//					  }
//					  else if(e.reference){
//						  Reference.populate(e.reference,[{path: 'user', model: 'User'},{path : 'remarks', model:'Remark'}], function(err,reference){
//							 Reference.populate(reference,[{path: 'remarks.user', select: 'name', model: 'User'}]).then(function(ref){
//								 feed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref, 'likes': ref.likes});
//								 next();
//							 });
//						  });
					  } else {
//						  feed.push(e);
						  feedSocket.sendToFeed(owner,e);
						  next();						  
					  }	   				  
	   			  });
	   		  });	   			
		  },function(err){
			  console.log("Sending feed to client")
			  return sendJSON(res,feed);
		  });	   			
   		});		  
}

exports.getFeed = function(req, res){
	  var owner = req.params.id;  
	  var dt = req.query.after !== undefined ? new Date(req.query.after) : new Date();	
	  var mm = dt.getMonth();
	  var yyyy = dt.getFullYear();
	  var dateQuery = req.query.after === undefined ? {"$lte":dt} : {"$lt" : dt};
	  var populate_fields = [{ path: 'user'}, {path: 'comment'}, {path: 'media'}, {path: 'reference'}];
	  
	  NewFeed.findOne({ owner: owner},function (err, feed) {
		  if(err||!feed){
			  return sendResponse(res,null);
		  }
//  	      followEverywordUser(homebase, function(following) {
//  			  var users = _.uniq(following.concat(_.flatMap(homebase.groups,function(g) { return g.members.concat(g.creator);})));
//  			  users = _.union([owner],users);		 
  			var entries = _.map(feed.entries, function(e){return e.id;}); 
  			 var feedEntries=[];
		  	 FeedEntry.find({_id : {$in : entries}, date: dateQuery}).lean().sort('-date').limit(20)
  			  	.populate('user comment media reference')
  			  	.stream()
  			  	.on('data',	function(e){
  		   		  Follow.findOne({user:e.user._id}).select('followers').lean().exec(function(err,e2){
  		   			  e.followers=e2 && e2.followers ? e2.followers: [];
  		   			  var anno = e.comment||e.media||e.reference;
  		   			  Remark.find({_id:{$in : anno.remarks}}).populate('user').exec(function(err,remarks){
  						  if(e.comment){
  							  e.comment.user=e.user;
  							  e.comment.remarks = remarks||[];
  							  Group.findOne({_id: e.comment.group}, function(err, group){
  								  e.comment.group=group;
  								  feedEntries.push(e);
  							  });
  						  }
  						  else if(e.media) {
  							  e.media.user=e.user;
  							  Image.findOne({_id: e.media.image}, function(err,image){
  								  e.media.image=image;
  								  e.media.remarks = remarks||[];
  								  feedEntries.push(e);
  							  });
  						  } else if(e.reference){
  							  e.reference.user = e.user;
  							  e.reference.remarks = remarks||[];
  							  feedEntries.push(e);
  						  }	   				  
  		   			  });
  		   		  });
  			  	})
  			  	.on('end',function(){
  			  		var result = _.orderBy(feedEntries,['date'],['desc']);
  			  		return sendJSON(res,result);
  			  	});  	    	  
//  	      });
	  });
}

exports.getComments = function(req, res) {
	  FeedEntry.find({ user: req.params.id}, function (err, entries) {
	    if(err) { return handleError(res, err); }    
	    return sendJSON(res,entries);
	  });
};

exports.getGroups = function(req, res) {
	  var all=req.query.all=="true" ? true : false;
	  
	  Homebase.findOne({ login: req.params.id}).populate('groups').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
		var opts =  {path: 'groups.members', model: 'User'};
		Homebase.populate(homebase, opts, function(err, hb) {
			if(!all && hb.groups.length>20){
				return sendJSON(res,{'_id': hb._id, 'groups': hb.groups.slice(0,20)});
			}
			return sendJSON(res,{'_id': hb._id, 'groups': hb.groups});
		})	    
	  });
};
var getCounts = function(user,cb){
	Follow.findOne({ user: user._id}, function (err, follow) {
		   var counts={};
		   if(follow){		
			   counts.following = follow.following? follow.following.length : 0;
			   counts.followers = follow.followers? follow.followers.length : 0;
			   FeedEntry.count({ user: user._id}, function (err, entries) {
				     counts.comments=entries;   
					  Like.count({ user: user._id},function (err, likes) {
						  counts.likes=likes;
					      cb(counts);
					  });
			  });		
		   } else {
			   cb({'following':0,'followers':0,'comments':0,'likes':0})
		   }
	});
}

exports.getFollowing = function(req, res) {
    var all=req.query.all=="true" ? true : false;
    var lastId=req.query.lastid;
    var name=req.query.name;
    var avail=(req.query.available=="true");
    var userId=req.params.id;
	Follow.find({ user:userId }).exec(function (err, follow) {
	    if(err) { return handleError(res, err); }
	    if(!follow||follow.length===0) return res.send(null);
	    follow=follow[0];
	    User.findById(userId, function(err,user){
	    	if(user.role==='guest' || follow.following.length==0){
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
	    			       var following=[]
	    			       if(result){
	    			    	   var users = _.filter(result,function(u){
	    			    		   return u && u._id && !u._id.equals(user.id)
	    			    		   });
		    			       User.find({$or: [{_id:{ $in : users }},{email:'everywordbible@gmail.com'}]})
		    			       .stream()
		    			       .on('data',function(user) {
		    			    	   following.push(user);
//		    		    			follow.following = _.sortBy(_.map(users, function(u){return {id:u._id, name: u.name};}),'id');
		    		    		})
		    	  			  	.on('end',function(){
		    	  			  		following = _.sortBy(following,'_id');
		    	  			  		follow.following=_.map(following, function(f){return {"id":f._id,"name":f.name}});
		    	  			  		follow.save();
		    	  			  		return sendJSON(res,following);
		    	  			  	});  	    	  
		    			       // Result is an array of documents	    			    	   
	    			       }
	    			    }
	    			);
	    	} else {
	    		var following = follow.following;	 
	    		var results=[]
	    		if(avail){
	    			var ids = _.map(following,'id');
		    		var query = lastId ? {_id:{ $nin: ids, $gt: mongooseTypes.ObjectId(lastId)}} : {_id: {$nin: ids}};
		    		if(name){
		    			query.name = {$regex: name, $options: 'i' };
		    		}
	    			limit=20;
		    		User.find(query, '-salt -hashedPassword').sort({_id: 1}).limit(limit).lean()
		    		.stream()
		    		.on('data',function (user) {
		    		    if(user){
    		    			results.push(user)
		    		    }	    			
		    		})
		    		.on('end', function(){
	  			  		results = _.sortBy(results,'_id');
	    		    	each(results, function(u ,next) {
	    		    		getCounts(u,function(counts){
	    		    			_.assign(u,counts);
	    		    		    next();	    	
	    		    		});
    				  },function(err){
    					  return sendJSON(res,results);		    			
    				  });
		    		});
	    		} else {
	    			var results=[]
		    		var limit = !all && following.length>20 ? 20 : following.length;
		    		if(lastId){
		    			following = _.filter(following,function(f){return _.gt(f.id,mongooseTypes.ObjectId(lastId))});
		    		}
		    		if(name){
//		    			query.name = {$regex: name, $options: 'i' };
		    			following = _.filter(following,function(f){return new RegExp(name, 'i').test(f.name)});
		    		}
	    			following = _.sortBy(_.slice(following,0,limit),'id'); 
	    			ids = _.map(following,'id');
	    			User.find({_id : {$in: ids}}, '-salt -hashedPassword').sort({_id: 1}).limit(limit).lean()
	    			.stream()
	    			.on('data',function (user) {
	    				if(user){
    		    			results.push(user);	    					
	    				}
	    			})
	    			.on('end',function(){
	  			  		results = _.sortBy(results,'_id');
		    			each(results, function(u ,next) {
	    		    		getCounts(u,function(counts){
	    		    			_.assign(u,counts);
	    		    		    next();	    	
	    		    		});
    				  },function(err){
	  			  			return sendJSON(res,results);	    				
    				  });	    				
	    			});
	    		}
	    	}
	    })
	  });
};

exports.getFollowers = function(req, res) {
    var all=req.query.all=="true" ? true : false;

	Follow.findOne({ user: req.params.id},function (err, followers) {
	    if(err) { return handleError(res, err); }  
	    	return sendJSON(res,followers);	    		
	    });
//	  });
};

exports.getMessages = function(req, res) {
	  Homebase.findOne({ login: req.params.id}).populate('messages').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
		var opts =  {path: 'messages.to messages.from', model: 'User'};
		Homebase.populate(homebase, opts, function(err, hb) {			
			return sendJSON(res,hb.messages);
		})	    
	  });
};

exports.getTags = function(req, res) {
	  var all = req.query.all=="true" ? true : false;
	  
	  Homebase.findOne({ login: req.params.id}).populate('tags').exec(function (err, homebase) {
	    if(err) { return handleError(res, err); }    
	    if(!all && homebase.tags.length>20){
	    	return sendJSON(res,homebase.tags.slice(0,20));
	    }
	    return sendJSON(res,homebase.tags);
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
	    	return sendJSON(res,entries);
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

function sendResponse(res,data){
	return res.status(200).send(data);
}
function sendJSON(res,data){
	return res.status(200).json(data);
}
function handleError(res, err) {
  return res.status(500).send(err);
}