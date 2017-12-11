'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	Feed = require('./feed.model'),
	Group = require('../group/group.model'),
	Follow = require('./follow.model'),
	util = require('../../util');

var FeedEntrySchema = new Schema({
  date: {type: Date, default: Date.now},
  user: {type: Schema.ObjectId, ref: 'User'},
  comment: {type: Schema.ObjectId, ref: 'Comment'},
  media: {type: Schema.ObjectId, ref: 'Media'},
  reference: {type: Schema.ObjectId, ref: 'Reference'}
});

FeedEntrySchema.post('save', function (feedentry) {
//	console.log("feed entry saved: "+JSON.stringify(feedentry));	
//	feedentry.populate('user',function(err,fe){
		updateFeeds(feedentry,feedentry.user);
//	});
});
FeedEntrySchema.post('remove', function(feedentry){
//	console.log("feed entry removed: "+JSON.stringify(feedentry));
	feedentry.populate('user',function(err,fe){
		updateFeeds(fe,fe.user,'remove');
	});
});

function updateFeeds(entry, user, action){
	Group.find({creator:user._id}).select('members').exec(function(err,groups) {
		function getMembers(acc,curr) {
			var members = acc.members||[];
			return members.concat(curr.members);
		};
		var allMembers = groups.reduce(getMembers,{});
		Follow.findOne({user:user._id}).select('followers').exec(function(err,res){
			 var followers = res.followers||[];
			 var users = util.removeDupes([user._id].concat(allMembers).concat(followers));
			 Feed.find({owner:{ $in: users}},function(err,feeds){
					 feeds.forEach(function(feed){
						 if(action==='remove'){
							 var i = feed.entries.indedxOf(entry._id);
							 if(i>0){
								 feed.entries.splice(i,1);
							 }
//							 Feed.remove({'feedentry': entry._id});
						 } else {
//							 var f = new Feed({owner: u._id, user: user._id, feedentry: entry, date: entry.date });
//							 f.save();
							 feed.entries.push(entry._id);
						 }
						 feed.save();						 
					 });
				 })
			 });
	});
}
module.exports = mongoose.model('FeedEntry', FeedEntrySchema);
