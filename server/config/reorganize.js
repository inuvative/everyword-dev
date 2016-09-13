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
var FeedEntry = require('../api/homebase/feed.entry');
var Comment = require('../api/comment/comment.model');
var Media = require('../api/media/media.model');
var Reference = require('../api/reference/reference.model');
var Like = require('../api/comment/like.model');

/*
User.find({},function(err,users){
	users = users.filter(function(u){return u.role !=='admin';});
	each(users, function(u ,nextUser) {
		Comment.find({user: u._id}, function(err,comments){
			if(comments) {
				for(var c in comments){
					var comment = comments[c];
					var dt = comment.date;
					var entry = new FeedEntry({'comment': comment._id, 'date': dt, 'user': comment.user});
					entry.save();
				}
			}
			Media.find({user: u._id}, function(err,media){
				 if(media){
					 for(var m in media){
						 var med = media[m];
						 var entry = new FeedEntry({ 'media': med._id, 'user': med.user, 'date': med.date});
						 entry.save();
					 }				 
				 }
				 Reference.find({user: u._id}, function(err,references){
						if(references){				
							for(var r in references){
								var ref = references[r];
								var entry = new FeedEntry({ 'user': ref.user, 'date': ref.date, 'reference': ref._id});
								entry.save();
							}					
						}
						nextUser();
				 });
			});
		});		
	}, function(err) {
		console.log("users updated");
	});
});
*/
Like.find({}, function(err,likes){
	each(likes, function(l ,nextLike) {
		Comment.findById(l.comment, function(err,comment){
			if(comment){
				var i = comment.likers.indexOf(l._id);
				if(i!==-1){
					comment.likers[i]=l.user;
				} else {
					i = comment.likers.indexOf(l.user);
					if(i===-1){
						comment.likers.push(l.user);					
					}
				}
				comment.save();
			}
			nextLike();
//			Media.find({user: u._id}, function(err,media){
//				 if(media){
//					 for(var m in media){
//						 var med = media[m];
//						 var entry = new FeedEntry({ 'media': med._id, 'user': med.user, 'date': med.date});
//						 entry.save();
//					 }				 
//				 }
//				 Reference.find({user: u._id}, function(err,references){
//						if(references){				
//							for(var r in references){
//								var ref = references[r];
//								var entry = new FeedEntry({ 'user': ref.user, 'date': ref.date, 'reference': ref._id});
//								entry.save();
//							}					
//						}
//						nextUser();
//				 });
//			});
		});		
	}, function(err) {
		console.log("likes updated");
	});
	
});