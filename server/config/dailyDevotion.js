var load = function() {
	var each = require('async-each-series');
	var _ = require('lodash');
	
	var devotionals = require('../api/devotional/daily_devotions.json');
	var User = require('../api/user/user.model');
	var Devotional = require('../api/devotional/devotional.model');
	var Comment = require('../api/comment/comment.model');
	var Annotation = require('../api/annotation/annotation.model');
	
	each(Object.keys(devotionals), function(key ,next) {
		var day = parseInt(key);
		var d = devotionals[key];
		User.findOne({email: d.email}, function(err,user){
			if(!user){
				user = new User({
			    provider: 'local',
			    role: 'user',
			    name: d.Commenter,
			    email: d.email,
			    password: 'guest'
			  });
			  user.save(function(err, user) {
					if(err){
						next();						
					} else {
						var comment = new Comment({ user: user._id, text:d.comments, date: new Date(), isPrivate: false });
						comment.save(function(err,comment){
							for(var s=0; s<d.scriptures.length;s++){
				        		 var reference = d.scriptures[s];
				        		 var start = 1;
				        		 if(references.verses){
				        			 var vs = reference.verses.split("-");
				        			 start = parseInt(vs[0])||1;
				        		 }
					             var anno= new Annotation({ book: reference.book, chapter: reference.chapter, verse: start, comments: [comment._id] });
					             anno.save();
					             var devotion = new Devotional({day: day, book: reference.book, chapter: reference.chapter, verses: reference.verses, 
					            	 							user: user._id,
					            	 							comment: comment._id});
					             devotion.save(function(err,dev){
					            	 if(err){
					            		 console.log("error on devotion save"+ err);
					            	 } else {
					            		 console.log("devation saved");
					            	 }
					             });
				        	}
							next();				
						});					
					}
				})
			} else {
				var comment = new Comment({ user: user._id, text:d.comments, date: new Date(), isPrivate: false });
				comment.save(function(err,comment){
					for(var s=0; s<d.scriptures.length;s++){
		        		 var reference = d.scriptures[s];
		        		 var vs = reference.verses.split("-");
		     		  	 var start = parseInt(vs[0])||1;
			             var anno= new Annotation({ book: reference.book, chapter: reference.chapter, verse: start, comments: [comment._id] });
			             anno.save();
			             var devotion = new Devotional({day: day, book: reference.book, chapter: reference.chapter, verses: reference.verses, 
			            	 							user: user._id,
			            	 							comment: comment._id});
			             devotion.save(function(err,dev){
			            	 if(err){
			            		 console.log("error on devotion save"+ err);
			            	 } else {
			            		 console.log("devation saved");
			            	 }
			             });
		        	}
					next();				
				});					
			}
		})
		
	}, function(err) {
		console.log("devotionals loaded");
	});
};
module.exports = load;