'use strict';

var _ = require('lodash');
var each = require('async-each-series');

var User = require('../user/user.model');
var Comment = require('../comment/comment.model');
var Media = require('../media/media.model');
var Image = require('../media/media.image');
var Annotation = require('../annotation/annotation.model');
var Devotional = require('./devotional.model');
var Homebase = require('../homebase/homebase.model');
var FeedEntry = require('../homebase/feed.entry');
var Follow = require('../homebase/follow.model');
// Get list of devotionals
exports.index = function(req, res) {
  Devotional.find({}).limit(15).exec(function (err, devotionals) {
    if(err) { return handleError(res, err); }    
    return res.status(200).json(devotionals);
  });
};

// Get a single devotional
exports.show = function(req, res) {
  Devotional.findById(req.params.id, function (err, devotional) {
    if(err) { return handleError(res, err); }
    if(!devotional) { return res.status(404).send('Not Found'); }
    return res.json(devotional);
  });
};

exports.findByDay = function(req, res) {
	  Devotional.find({day: parseInt(req.params.day)}, function (err, devotional) {
	    if(err) { return handleError(res, err); }
	    if(!devotional) { return res.status(404).send('Not Found'); }
	    return res.json(devotional);
	  });
	};

// Creates a new devotional in the DB.
exports.create = function(req, res) {
  Devotional.findOne({day: parseInt(req.body.day)}).populate('user comment media').lean().exec(function(err , devotional) {
	    if(err) { return handleError(res, err); }
	    if(!devotional) { 
	    	createDevotional(req.body,function(errors, devotionals){
			    if(devotionals.length>0){
				    var opts = [{path: 'user', model: 'User'},{path: 'comment', model: 'Comment'}, {path: 'media', model: 'Media'}];
				    Devotional.populate(devotionals[0],opts, function(err, devotional){
				    	Follow.findOne({user:devotional.user._id},function(err,u){
				    		var followers = u && u.followers ? u.followers:[];
					    	if(devotional.comment && devotional.media){
						    	Comment.populate(devotional.comment, {path: 'user', model: 'User'}, function(err, comm){
						    		comm.followers=followers;
								    devotional.comment = comm;
						    		Media.populate(devotional.media, [{path: 'user', model: 'User'},{path: 'image', model: 'Image'}], function(err, media){
						    			media.followers = followers;
						    			devotional.media = media;
						    			return res.status(201).json(devotional);
						    		})
						    	})					    		
					    	} else {
					    		if(devotional.comment){
							    	Comment.populate(devotional.comment, {path: 'user', model: 'User'}, function(err, comm){
							    		comm.followers=followers;
									    devotional.comment = comm;
							    		return res.status(201).json(devotional);			    				    		
							    	})				    		
						    	} else if(devotional.media){
						    		Media.populate(devotional.media, [{path: 'user', model: 'User'},{path: 'image', model: 'Image'}], function(err, media){
						    			media.followers = followers;
						    			devotional.media = media;
						    			return res.status(201).json(devotional);
						    		})
						    	}					    		
					    	}
				    	});
				    });			    	
			    } else {
				    if(errors && errors.length>0) {
				    	return handleError(res, JSON.stringify(errors)); 
				    }		
//				    return res.status(400).send()
			    }
	    	});
	    } else {
	    	Follow.findOne({user:devotional.user._id},function(err,u){
	    		var followers = u && u.followers ? u.followers:[];
		    	if(devotional.comment && devotional.media){
			    	Comment.populate(devotional.comment, {path: 'user', model: 'User'}, function(err, comm){
			    		comm.followers=followers;
					    devotional.comment = comm;
			    		Media.populate(devotional.media, [{path: 'user', model: 'User'},{path: 'image', model: 'Image'}], function(err, media){
			    			media.followers = followers;
			    			devotional.media = media;
			    			return res.status(201).json(devotional);
			    		})
			    	})					    		
		    	} else {
		    		if(devotional.comment){
				    	Comment.populate(devotional.comment, {path: 'user', model: 'User'}, function(err, comm){
				    		comm.followers=followers;
						    devotional.comment = comm;
				    		return res.status(201).json(devotional);			    				    		
				    	})				    		
			    	} else if(devotional.media){
			    		Media.populate(devotional.media, [{path: 'user', model: 'User'},{path: 'image', model: 'Image'}], function(err, media){
			    			media.followers = followers;
			    			devotional.media = media;
			    			return res.status(201).json(devotional);
			    		})
			    	}					    		
		    	}
	    	});
	    }
  })
};

// Updates an existing devotional in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Devotional.findById(req.params.id, function (err, devotional) {
    if (err) { return handleError(res, err); }
    if(!devotional) { return res.status(404).send('Not Found'); }
    var updated = _.merge(devotional, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(devotional);
    });
  });
};

// Deletes a devotional from the DB.
exports.destroy = function(req, res) {
  Devotional.findById(req.params.id, function (err, devotional) {
    if(err) { return handleError(res, err); }
    if(!devotional) { return res.status(404).send('Not Found'); }
    devotional.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function createDevotional(devotional,callback){
	User.findOne({email: devotional.email}, function(err,user){
		if(!user){
			user = new User({
			    provider: 'local',
			    role: 'user',
			    name: devotional.Commenter,
			    email: devotional.email,
			    password: 'guest'
			});
		  user.save(function(err, user) {
				if(err){
					callback(err);
				} else {
					insertUserRecords(user,devotional,callback);
				}
			  });
		} else {
			insertUserRecords(user,devotional,callback);
		}
	})	
}

exports.verseOftheDay = function(req,res) {
	var request = require('request');
	request('https://www.biblegateway.com/votd/get?format=json&version=KJV', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		  body = JSON.parse(body);
	    return res.status(200).json(body);
	  } else {
		  return handleError(res, error);
	  }
	});
}

function insertUserRecords(user,devotional,callback){
	var day = parseInt(devotional.day);
	var d = devotional;	
	Homebase.findOne({ login: user._id},function (err, homebase) {
	    if(err) { return handleError(res, err); }    
	    if(!homebase) {
	    	homebase = new Homebase({login: user._id});
	    	homebase.save();
	    }
	    var comment = (d.comments && d.comments.length>0) ? new Comment({ user: user._id, text:d.comments, date: new Date(), isPrivate: false }) : null;
	    var media = null;
	    if(d.media){
	    	var image = new Image({url: d.media.url, type: d.media.type});
			image.save();
			media = new Media({user: user._id, url:'', type: d.media.type, image: image._id, date: new Date()})
	    }	    
	    var rec = comment || media;	  
	    if(!rec) {
	    	callback(null,[]);
	    } else {
	    	var pr=[];
	    	if(comment){
	    		comment.save(function(err,comm){
	    			var entry = new FeedEntry({date: comm.date, user: comm.user, comment: comm._id});
	    			entry.save();										    			
	    		});
	    	}
	    	if(media){
	    		media.save(function(err,med){
	    			var entry = new FeedEntry({date: med.date, user: med.user, media: med._id});
	    			entry.save();										    				    			
	    		});
	    	}
	    	saveRecord(d,user,comment,media).then(function(values){
	    		var errors=[];
	    		var devotionals=[];
	    		if(values && values.length>0){
	    			for(var v=0; v<values.length;v++){
	    				if(values[v].errors){
	    					_.concat(errors,values[v].errors);
	    				}
	    				if(values[v].devotionals){
	    					_.concat(devotionals,values[v].devotionals);
	    				}
	    			}
	    		}
	    		callback(errors,devotionals);
	    	})
	    }
	});	
}

function saveRecord(devotional,user,comment,media){
	return new Promise(function(res,rej){
		var devotionals=[];
		var errors=[];
		each(devotional.scriptures, function(s, next){
	   		 var reference = s;
	   		 var start = 1;
	   		 if(reference.verses){
	   			 var vs = reference.verses.split("-");
	   			 start = parseInt(vs[0])||1;
	   		 }
            var devotion = new Devotional({day: parseInt(devotional.day),topic:devotional.Topic, book: reference.book, chapter: reference.chapter, verses: reference.verses,user: user._id});
            if(comment){
           	 devotion.comment = comment._id;
            } 
            if(media) {
           	 devotion.media = media._id
            }
			devotion.save(function(err,dev){
				if(err){
					errors.push(err);
					console.log("error on devotional save"+ err);								       
				} else {
					devotionals.push(dev);
					console.log("devotional saved");
		    		 
	        		 Annotation.findOne({ book: reference.book, chapter: reference.chapter, verse: start}, function(err, anno) {
	        			 if(err){
	        				 console.log(err);
	        			 }
	        			 if(!anno){
	        				 anno= new Annotation({ book: reference.book, chapter: reference.chapter, verse: start});
	        				 if(comment){
	        					 anno.comments= [comment._id]; 
	        				 } 
	        				 if(media){
	        					 anno.media=[media._id];
	        				 }
	        			 } else {
	        				 if(comment){
	        					 anno.comments.push(comment._id); 
	        				 }
	        				 if(media){
	        					 anno.media.push(media._id);
	        				 }
	        			 }
			             anno.save(function(err,a) {
			            	 if(err){
			            		 console.log("error on annotation save"+ err);
			            	 }
							next();
	            		  });
	        		 });
				}
				
			});
	   	}, function(err) {
	   		res({"errors": errors.length!==0? errors : null, "devotionals": devotionals});
	   		console.log("devotionals created");        		
	   	});
	});
}

function handleError(res, err) {
  return res.status(500).send(err);
}