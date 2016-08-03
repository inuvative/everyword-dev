process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var each = require('async-each-series');
var _ = require('lodash');

var config = require('./environment');
//Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error('MongoDB connection error: ' + err);
	process.exit(-1);
	}
);

var User = require('../api/user/user.model');
var Feed = require('../api/homebase/feed.model');
var FeedEntry = require('../api/homebase/feed.entry');
var Comment = require('../api/comment/comment.model');
var Group = require('../api/group/group.model');
var Homebase= require('../api/homebase/homebase.model');

var users = User.find({}).exec();
users.then(function(users){
	users = users.filter(function(u){return u.role !=='admin';});
	return function(callback){
	 each(users, function(u ,nextUser) {
		Feed.find({user: u._id}, function(err,feeds){
//			if(feeds && feeds.length>0){
				each(feeds || [], function(feed,nextFeed){
//					var feed = feeds[f];
					var mm = feed.month;
					var yyyy = feed.year;
					FeedEntry.find({feed: feed._id, comment: {$exists: true}}, function(err,entries){
						var comms = (entries) ?  entries.map(function(e){return e.comment}) : [];
						Comment.find({user: u._id, _id : { $nin:comms } }, function(err,comments){
							if(comments){
								for(var c in comments){
									var comment = comments[c];
									var dt = comment.date;
									if(dt.getMonth()===mm && dt.getFullYear()===yyyy){
										var entry = new FeedEntry({feed: feed._id, comment: comment._id, date: dt, user: comment.user});
										entry.save();
									}
								}								
							}
							nextFeed();
						});
					});					
				},function(err){
//					nextUser();
					console.log('feeds complete: '+err);
					Comment.find({user: u._id}, function(err,comments){
						if(comments){
							each(comments, function(comment,nextComment){
								var dt = comment.date;
								Feed.findOne({user: u._id, month: dt.getMonth(), year: dt.getFullYear()}, function(err,feed){
									if(!feed){
										feed = new Feed({user: u._id, month: dt.getMonth(), year: dt.getFullYear()});
										feed.save();
									}
									FeedEntry.findOne({feed: feed._id, comment: comment._id}, function(err,entry){
										if(!entry){
											entry = new FeedEntry({feed: feed._id, comment: comment._id, date: dt, user: comment.user});
											entry.save();
										}
										nextComment();
									});
								});
							},function(err){
								nextUser();
								console.log('comments complete: '+err);
							});
						}
//					next();
				});
//			}
//			next();
		});
	});
	}, function(err){
		console.log("users complete: "+err);
		Homebase.find({}).populate('following groups').exec(callback);		
	});
}})
.then(function(usersDone){
	usersDone(function(err, homebases){
		each(homebases,function(home, nextHome){
		    var following = home.following.map(function(u){return u._id;});
			var userIds = _.uniq(following.concat(_.flatMap(home.groups,function(g) { return g.members.concat(g.creator);})));
			userIds = userIds.filter(function(uid) {
				return uid.id !== home.login.id;
				});
			Feed.find({user: home.login}, function(err,feeds){
				var feedIds = feeds.map(function(f){ return f._id});
				FeedEntry.find({feed:{$in : feedIds}, comment: {$exists: true}}, function(err,entries){
					var comms = (entries)? entries.map(function(e){return e.comment}) : [];
					Comment.find({user: {$in: userIds}, _id: {$nin: comms}}, function(err,comments){
						if(comments){
							each(comments,function(comment,nextComment){
								var dt = comment.date;
								Feed.findOne({user: home.login, month: dt.getMonth(), year: dt.getFullYear()}, function(err,feed){
									if(!feed){
										feed = new Feed({user: home.login, month: dt.getMonth(), year: dt.getFullYear()});
										feed.save();
									}
									var entry = new FeedEntry({feed: feed._id, comment: comment._id, date: dt, user: comment.user});
									entry.save();									
									nextComment();
								});
							}, function(err){
								nextHome();
								console.log("comments complete: "+err);
							});
						}
					});
				});
			});
//			});
		}, function(err){
		   console.log("homebases complete: "+err)
		});
	})
}).
then(undefined, function(err){
	console.log("data reorg complete:" + err);
});



