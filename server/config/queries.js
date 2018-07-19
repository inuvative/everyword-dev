/**
 * queries to populate and mongodb collections
 */
function populateFeed(u) {
	var groupMembers = db.groups.find({	$or : [ {creator : u._id}, {members : u._id	} ]	}, {members : 1	}).toArray();
	var reducer = function(acc, curr) {
		var members = acc.members || [];
		return members.concat(curr.members);
	};
	var allMembers = groupMembers.reduce(reducer, {});
	var remove_dupes = function(arr) {
		var seen = {};
		var ret_arr = [];
		for (var i = 0; i < arr.length; i++) {
			if (!(arr[i] in seen)) {
				ret_arr.push(arr[i]);
				seen[arr[i]] = true;
			}
		}
		return ret_arr;
	};
	var following = db.follows.find({user : u._id}, {following : 1}).toArray();
	following = following.length ? following[0].following : [];
	var uniqUsers = remove_dupes([ u._id ].concat(allMembers).concat(following));		
	var fe = db.feedentries.find({user:{$in:uniqUsers}}).toArray();
	var entries=[];
	var oldfeed = db.newfeeds.find({owner:u._id}).toArray();
	oldfeed = oldfeed.length != 0 ? oldfeed[0].entries.map(function(e){return e.id;}) : [];
	for(var n in fe) {
		var f = fe[n];
		if (oldfeed.indexOf(f._id) === -1) {
			var user = db.users.count({_id : f.user});
			if(user===0)continue;
			
			var entry = {
				id : f._id,
				user : f.user,
				date : f.date
			};
			
			entries.push(entry);
		}
	}
    if(entries.length>0){
    	print("inserting feed of size: "+entries.length+" for user "+u.name);
    	var fc = db.newfeeds.count({owner:u._id});
    	if(fc===0){
    		db.newfeeds.insert({owner:u._id, entries: entries});
    	} else {
    		db.newfeeds.update({owner:u._id},{ $push : { entries: { $each: entries } } });
    	}    	
    }
			
}

function populateGroupFeed(g){
	var group = db.groups.find({_id: g._id},{creator:1,members:1}).toArray()[0]
	var creator = group.creator;
	var members = (group.members || []);
	if(members.indexOf(creator) == -1){
		members.push(creator)
	}
	
}

function populateFollowing(u) {
	db.follows.remove({user:u._id});
    var following = db.homebases.find({login: u._id},{following: 1}).toArray(); 
    following = following.length ? following[0].following : [];
    following = db.users.find({_id:{$in: following}},{name:1}).toArray();
    following = following.map(function(f){return {"id":f._id,"name":f.name}})
    var followers = db.homebases.find({following: u._id},{login:1}).toArray();
    followers = followers.length?followers.map(function(f){return f.login;}):[];
    followers = db.users.find({_id:{$in: followers}},{name:1}).toArray();
    followers = followers.map(function(f){return {"id":f._id,"name":f.name}})
    print("inserting followers for user "+u._id +" : "+u.name);
    db.follows.insert({user:u._id, following: following, followers:followers});
}

function populateFollowing2(u) {
	print("populating user: "+u._id);
    var follows = db.follows.find({user: u._id}).toArray(); 
    var following = follows.length ? follows[0].following : [];
    following = following.filter(function(f){return f.id!==undefined}).filter(function(f){return f.name !== undefined}).map(function(f){return f.id});
    following = db.users.find({_id:{$in: following}},{name:1}).toArray();
    following = following.map(function(f){return {id:f._id, name:f.name}});
    var followers = follows.length ? follows[0].followers : [];
    followers = followers.filter(function(f){return f.id!==undefined}).filter(function(f){return f.name !== undefined}).map(function(f){return f.id});
    followers = db.users.find({_id:{$in: followers}},{name:1}).toArray();
    followers = followers.map(function(f){return {id:f._id, name:f.name}});
    db.follows.remove({user:u._id});
    print("inserting followers for user "+u._id +" : "+u.name);
    db.follows.insert({user:u._id, following: following, followers:followers});
}

function cleanUpFollows(u) {
    var follows = db.follows.find({user: u._id}).toArray(); 
    var following = follows.length ? follows[0].following : [];
    following = following.map(function(f){return {id:f.id, name:f.name}});
    following = following.filter(function(f){ return f.id !== undefined && f.name !== undefined})
    var followers = follows.length ? follows[0].followers : [];
    followers = followers.map(function(f){return {id:f.id, name:f.name}});
    followers = followers.filter(function(f){ return f.id !== undefined && f.name !== undefined})
    db.follows.remove({user:u._id});
    print("inserting followers for user "+u._id +" : "+u.name);
    db.follows.insert({user:u._id, following: following, followers:followers});	
}

