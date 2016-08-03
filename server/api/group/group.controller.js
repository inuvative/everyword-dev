'use strict';

var _ = require('lodash');
var mongooseTypes = require('mongoose').Types;
var Group = require('./group.model');
var Homebase = require('../homebase/homebase.model');
var Feed = require('../homebase/feed.model');
var FeedEntry = require('../homebase/feed.entry');
var Comment = require('../comment/comment.model');
var Media = require('../media/media.model');
var Reference = require('../reference/reference.model');
var User = require('../user/user.model');


// Get list of groups
exports.index = function(req, res) {
  Group.find(function (err, groups) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(groups);
  });
};

// Get a single group
exports.show = function(req, res) {
  Group.findById(req.params.id).populate("creator").exec(function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
//    var members = group.members.map(function(u){return u._id;});
    getFeed(res,group.creator._id,group.members,function(feed){
//		members = members.filter(function(u) {return u._id !== group.creator._id;});
	    return res.json({'name': group.name, 'creator': group.creator, 'memberIds': group.members, 'feed': feed});		
	});
//    return res.json(group);
  });
};

// Creates a new group in the DB.
exports.create = function(req, res) {
  Group.create(req.body, function(err, group) {
    if(err) { return handleError(res, err); }
    Homebase.findOne({login: req.body.creator}).populate('groups').exec(function(err,home){
    	home.groups.push(group);
    	home.save(function(err) {
    		if(err) { return handleError(res, err); }    		
    	    Group.populate(group, {path: 'members', model: 'User'}, function(err,grp) {
    	        return res.status(201).json(grp);    	    	
    	    })    		
    	})
    });
//    return res.status(201).json(group);
  });
};

// Updates an existing group in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Group.findById(req.params.id, function (err, group) {
    if (err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    _.extend(group, req.body);
    group.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(group);
    });
  });
};

// Deletes a group from the DB.
exports.destroy = function(req, res) {
  Group.findById(req.params.id, function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    group.remove(function(err) {
      if(err) { return handleError(res, err); }
	  _.forEach(group.members, function(member) {
			Homebase.findOne({ login: member},function (err, homebase) {
			    if(err) { return handleError(res, err); }    
			    if(homebase) {
			    	var i = _.findIndex(homebase.groups,group._id);
			    	if(i!==-1){
				    	homebase.groups.splice(i,1);
			    		homebase.save(function(err) {
						      if (err) { return handleError(res, err); }
					    });					    		
			    	};
			    }
		});
	});
      return res.status(204).send('No Content');
    });
  });
};


//Get a single group
exports.showMembers = function(req, res) {
  Group.findById(req.params.id).populate('members').exec(function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    return res.json(group.members);
  });
};

//Get a single group
exports.showInvited = function(req, res) {
  Group.findById(req.params.id).populate('invited').exec(function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    return res.json(group.invited);
  });
};

//Get a single group
exports.showRequests = function(req, res) {
  Group.findById(req.params.id).populate('requests').exec(function (err, group) {
    if(err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    return res.json(group.requests);
  });
};

//Updates an existing group in the DB.
exports.updateMembers = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Group.findById(req.params.id,function (err, group) {
    if (err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    var invited = group.invited;
    var requests = group.requests;
    if(req.body.members){
    	for(var i in req.body.members) {
    		var member =  req.body.members[i];
    		var memberId = mongooseTypes.ObjectId(member);
    		var index = _.findIndex(invited, memberId);
    		if(index > -1){
    			invited.splice(index,1);
    		} else {
    			index = _.findIndex(requests, memberId);
    			if(index > -1){
    				requests.splice(index,1);
    			}
    		}
        	if(!req.body.rejected) {
        		group.members.push(memberId);
        	}
    	}
        group.save(function (err) {
            if (err) { return handleError(res, err); }
      		if(!req.body.rejected) {
      	    	_.forEach(group.members, function(member) {
      				Homebase.findOne({ login: member},function (err, homebase) {
      				    if(err) { return handleError(res, err); }    
      				    if(homebase) {
      				    	if(_.findIndex(homebase.groups,group._id)===-1){
      					    	homebase.groups.push(group._id);
      				    		homebase.save(function(err) {
      							      if (err) { return handleError(res, err); }
      						    });					    		
      				    	};
      				    }
      				});
      	    	});
      		}
            return res.status(200).json(group);
       });
    }
  });
};

//Updates an existing group in the DB.
exports.removeMembers = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Group.findById(req.params.id,function (err, group) {
    if (err) { return handleError(res, err); }
    if(!group) { return res.status(404).send('Not Found'); }
    if(req.body.members){
    	for(var i in req.body.members) {
    		var member = req.body.members[i];
    		var memberId = mongooseTypes.ObjectId(member);
    		var index = _.findIndex(group.members, memberId);
    		if(index !== -1){
    			group.members.splice(index,1);
				Homebase.findOne({ login: member},function (err, homebase) {
				    if(err) { return handleError(res, err); }    
				    if(homebase) {
				    	var gIdx =_.findIndex(homebase.groups,group._id); 
				    	if(gIdx !==-1){
					    	homebase.groups.splice(gIdx,1);
				    		homebase.save(function(err) {
							      if (err) { return handleError(res, err); }
						    });					    		
				    	};
				    }
				});
    		}
    	}
        group.save(function (err) {
            if (err) { return handleError(res, err); }
            return res.status(200).json(group);
        });
    } else {
    	return res.status(204).send('No Content');
    }
  });
};

function getFeed(res, owner,users,callback){
	  var dt = new Date();
	  var mm = dt.getMonth();
	  var yyyy = dt.getFullYear();
	  var feed = [];
	  users.push(owner);
	  Comment.find({user : { $in : users}, date: {$lte: dt}}).sort('-date').populate('user').exec(function(err,comments){
		  if(comments){
			  for(var c in comments){
				  var comment = comments[c];
     			  feed.push({'_id': comment._id, 'user': comment.user, 'date': comment.date, 'comment' : comment});
			  }			  
		  }
		  Media.find({user: {$in: users}, date: {$lte: dt}}).sort('-date').populate('user image').exec(function(err,media){
			 if(media){
				 for(var m in media){
					 var med = media[m];
					 feed.push({'_id': med._id, 'user': med.user, 'date': med.date, 'media': med});
				 }				 
			 }
			 Reference.find({user: { $in: users}, date: {$lte: dt}}).sort('-date').populate('user').exec(function(err,references){
				if(references){				
					for(var r in references){
						var ref = references[r];
						feed.push({'_id': ref._id, 'user': ref.user, 'date': ref.date, 'reference': ref});
					}					
				}
				callback(feed);
			 });
		  });
	  });
};

function addToFeed(res,owner,users){
	FeedEntry.find({user: {$in: users}}, function(err,entries){
		for(var e in entries){
			var entry = entries[e];
			var dt = entry.date;
			var mm = dt.getMonth();
			var yyyy = dt.getFullYear();
			Feed.find({user: owner},function(err,feeds){
				for(var f in feeds){
					var ff = feeds[f];
					if(ff.month===mm && ff.year===yyyy){
						var newEntry = entry;
						newEntry.isNew=true;
						newEntry.feed = ff._id;
						newEntry.save(function(err){
							return handleError(res,err);
						})
					}
				}
			});
		}
	});
};

function removeFromFeed(res,owner,users){
	Feed.find({ user: owner}, function (err, feeds) {	
		FeedEntry.find({feed:{$in : feeds}, user: {$in: users}}, function(err,entries){
			for(var e in entries){
				var entry = entries[e];
				entry.remove(function(err){
					if(err){
						return handleError(res,err);
					}
				})
			}
		});
	});	
};

function handleError(res, err) {
  return res.status(500).send(err);
}