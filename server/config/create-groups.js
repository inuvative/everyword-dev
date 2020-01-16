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
var Homebase = require('../api/homebase/homebase.model');
var Follow = require('../api/homebase/follow.model');
var Group = require('../api/group/group.model');

//Get all groups with members
//For each group get comments, media, references, remarks, likes, following, followers, feedentries
//Create database for group and insert the above entities
//close db connection
function createGroups() {
    Group.find({}).populate('creator members').exec(function(err, groups) {
        if(err){
            console.log(err);
            return;
        }
        if(groups){
            each(groups, function(group ,nextGroup) {
                populateCollection(User,allMembers,group,nextGroup);
            }, function(err) {
                console.log("users updated");
            })
        }
    });
}

function populateCollection(model,docs,group,callback){
    return new Promise(function(resolve,reject){
        
    })
}

