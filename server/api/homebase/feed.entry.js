'use strict';

var _ = require('lodash');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
	Feed = require('./newfeed.model'),
	Group = require('../group/group.model'),
	Follow = require('./follow.model'),
	util = require('../../util');
var mongooseTypes = mongoose.Types;

var FeedEntrySchema = new Schema({
  date: {type: Date, default: Date.now},
  user: {type: Schema.ObjectId, ref: 'User'},
  comment: {type: Schema.ObjectId, ref: 'Comment'},
  media: {type: Schema.ObjectId, ref: 'Media'},
  reference: {type: Schema.ObjectId, ref: 'Reference'}
});

FeedEntrySchema.post('save', function (feedentry) {
//	console.log("feed entry saved: "+JSON.stringify(feedentry));	
	feedentry.populate('user comment media reference',function(err,fe){
		updateFeeds(fe,fe.user);
	});
});
FeedEntrySchema.post('remove', function(feedentry){
//	console.log("feed entry removed: "+JSON.stringify(feedentry));
	feedentry.populate('user',function(err,fe){
		updateFeeds(fe,fe.user,'remove');
	});
});

function updateFeeds(entry, user, action){
	var user = user.toObject()
	Group.find({creator:user._id},'members').lean().exec(function(err,groups) {
		function getMembers(acc,curr) {
			var members = acc.members || [];
		    console.log("initial members: "+members);
		    if(curr.members){
		      members = members.concat(curr.members);
			  console.log("added members: "+members);
		    }
			return {"members": members};
		};
		var allMembers = groups.reduce(getMembers,{}).members || [];
		Follow.findOne({user:user._id},'followers').lean().exec(function(err,res){
			 if(!res)return;
			 var followers = res.followers.map(function(f){return f.id})||[];
			 var users = util.removeDupes([user._id].concat(allMembers).concat(followers));
			 if(action==='remove'){
				 Feed.update({owner:{ $in: users}}, {$pull: {entries: {id: entry._id}}}, {multi: true}, function(err,feeds){
					 console.log((feeds||[]).length + " feeds updated");
				 });
			 } else {
				 Feed.update({owner:{ $in: users}},{"$push": {entries: { id: entry._id, user: user._id, date: entry.date}}},{multi:true}, function(err,feeds){
					 console.log((feeds||[]).length + " feeds updated");
//					 if(feeds){
//						 feeds.forEach(function(feed){
//							 if(action==='remove'){
//								 _.remove(feed.entries, function(e){
//									return e===entry._id; 
//								 });
//							 } else {
//								 var newEntry={
//									user: {_id: entry.user._id, name:entry.user.name},
//								 	date: entry.date
//								 }
//								 var f = new Feed({owner: u._id, user: user._id, feedentry: entry, date: entry.date });
//								 f.save();
//								 if(entry.comment){
//									newEntry._id=entry.comment._id;
//									newEntry.likes=entry.comment.likes;
//									newEntry.remarks=entry.comment.remarks;
//									newEntry.isPrivate=entry.comment.isPrivate;
//									newEntry.comment= { group: entry.comment.group, text: entry.comment.text};
//								 }
//								 if(entry.media){
//									 newEntry._id=entry.media._id;
//									 newEntry.url=entry.media.url;
//									 newEntry.name=entry.media.name;
//									 newEntry.description=entry.media.description;
//									 newEntry.type=entry.media.type;
//									 newEntry.image=entry.media.image;
//									 newEntry.likes=entry.comment.likes;
//									 newEntry.remarks=entry.comment.remarks;
//									 newEntry.isPrivate=entry.comment.isPrivate;
//								 }
//								 if(entry.reference){
//									 newEntry._id=entry.reference._id;
//									 newEntry.url=entry.reference.url;
//									 newEntry.description=entry.reference.description;
//									 newEntry.likes=entry.comment.likes;
//									 newEntry.remarks=entry.comment.remarks;
//									 newEntry.isPrivate=entry.comment.isPrivate;								 
//								 }
//								 feed.entries.push(entry._id);
//							 }
//							 feed.save();						 
//						 });					 
//					 }
				 });				 
			 }
		});
	});
}
module.exports = mongoose.model('FeedEntry', FeedEntrySchema);
