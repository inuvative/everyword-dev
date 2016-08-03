'use strict';

var _ = require('lodash');
var mongooseTypes = require('mongoose').Types;
var each = require('async-each-series');

var Annotation = require('./annotation.model');
var annoSocket = require('./annotation.socket');

var Footnote = require('../footnote/footnote.model');
var Comment = require('../comment/comment.model');
var Media = require('../media/media.model');
var Reference = require('../reference/reference.model');
var Feed = require('../homebase/feed.model');
var FeedEntry = require('../homebase/feed.entry');

var javascripture = require('../../components/javascripture');


// Get list of annotations
exports.index = function(req, res) {
  Annotation.find(function (err, annotations) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(annotations);
  });
};

// Get a single annotation
exports.show = function(req, res) {
  Annotation.findById(req.params.id, function (err, annotation) {
    if(err) { return handleError(res, err); }
    if(!annotation) { return res.status(404).send('Not Found'); }
    return res.json(annotation);
  });
};

// Creates a new annotation in the DB.
exports.create = function(req, res) {
  Annotation.create(req.body, function(err, annotation) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(annotation);
  });
};

// Updates an existing annotation in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Annotation.findById(req.params.id, function (err, annotation) {
    if (err) { return handleError(res, err); }
    if(!annotation) { return res.status(404).send('Not Found'); }
    _.extend(annotation, req.body);
    annotation.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(annotation);
    });
  });
};

// Deletes a annotation from the DB.
exports.destroy = function(req, res) {
  Annotation.findById(req.params.id, function (err, annotation) {
    if(err) { return handleError(res, err); }
    if(!annotation) { return res.status(404).send('Not Found'); }
    annotation.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

exports.annotationCount = function(req, res){
	  Annotation.findOne({ 'book': req.params.book, 'chapter': Number(req.params.chapter), 'verse' : Number(req.params.verse)})
	  .populate('comments references media').exec(function (err, annotation) {
		    if(err) { return handleError(res, err); }    
		    if(!annotation) { return res.send(null); }
		    var comments = annotation.comments.filter(function(c) {
		    	return !c.isPrivate || c.user.id===mongooseTypes.ObjectId(req.params.user).id;
		    });
		    var count = comments.length + annotation.references.length + annotation.media.length;
		    
		    return res.json({ 'count' : count});
	  });	
};

exports.findAnnotation = function(req, res) {
	  var annoEntryId = req.query.annoEntryId;
      var query={ $or: [{'comments': annoEntryId},{'media': annoEntryId}, {'references': annoEntryId}]};
      Annotation.findOne(query, function(err, anno) {
		    if(!anno){return res.send(null);}
		    var tt = javascripture.api.reference.getTestament(anno.book);	
		    tt = (tt==='hebrew') ? 'ot' : 'nt';
	    	return res.status(200).json({testament: tt, book: anno.book, chapter: anno.chapter, verse: anno.verse});
      });
};

exports.findComments = function(req, res) {
	  Annotation.findOne({ 'book': req.params.book, 'chapter': Number(req.params.chapter), 'verse' : Number(req.params.verse)})
	    .populate('comments')
	    .exec(function (err, annotation) {
		    if(err) { return handleError(res, err); }    
		    if(!annotation) { return res.send(null); }
		    var opts = [{path: 'comments.user', model: 'User'}, 
		                {path: 'comments.remarks', model: 'Remark'},
		                ];
		    Annotation.populate(annotation, opts, function(err, anno) {
		    	var opts = [{path: 'remarks.user', select: 'name', model: 'User'}];
		    	Comment.populate(anno.comments, opts).then(function(comments){
		    		anno.comments = comments;
		    		return res.status(200).json(anno);
		    	}).end();		    	
		    });	    
	  });
};

exports.findFootnotes = function(req, res) {
	  Annotation.findOne({ 'book': req.params.book, 'chapter': Number(req.params.chapter), 'verse' : Number(req.params.verse)})
	    .populate('footnotes')
	    .exec(function (err, annotation) {
		    if(err) { return handleError(res, err); }    
		    if(!annotation || !annotation.footnotes || annotation.footnotes.length===0){
		    	if(!annotation) {
		    		annotation = new Annotation({ book: req.params.book, 
		    			                          chapter: Number(req.params.chapter), 
		    			                          verse : Number(req.params.verse)});
		    		
		    	}
		    	if(!annotation.footnotes){
		    		annotation.footnotes=[];
		    	}
		    	if(req.body.version){	
//		    		var testament = req.body.testament;
//		    		var re = testament === 'ot' ? /(H\d+)/ : /(G\d+)/;
//		    		var words = req.body.text.replace(/[^a-zA-Z0-9 ]+/g,"").split(" ");
//		    		words = _.uniqBy(words,_.lowerCase);
		    		var footnotes = getFootnotes(req);
		    		each(footnotes, function(fn ,next) {
//			    		Footnote.find().and([{ $text: { $search: w} },{strongs_num: re}]).lean().exec(function(err,footnotes){
		    			var word = fn.word;
		    			var footnoteIds=[];
//		    			each(fn.notes, function(n,next){
//		    				var note = n;
//		    				Footnote.create(note, function(err, footnote) {
//					    		for(var ii=0; ii<footnotes.length;ii++){
//					    			footnoteIds.push(footnote._id);
//				    		    }
//					    		if(footnotes.length>0){
//					    			var fn = {word : w, notes : footnoteIds};
//				    			    annotation.footnotes.push(fn);
//					    		}
//					    		next();
//			    		    });
//		    		    });

	    			    if(fn.notes.length !== 0) {
		    			    annotation.footnotes.push(fn);
//	    			    	annoSocket.io().emit('annotation:footnotes',fn);
	    			    }
	    			    next();
		    		}, function(err) { 
	        			console.log(err); 
//	        			annotation.save(function (err) {
//	        				if (err) { return handleError(res, err); }
//	        				return res.status(200).send(annotation.id);
//	        			});
	        			return res.status(200).json({"annotation": annotation, "footnotes" : footnotes});
		    		});
		    		
		    	} else {
		    		return res.status(204).send('No Content')
		    	}
		    }	
	  });
};

exports.findReferences = function(req, res) {
	  Annotation.findOne({ 'book': req.params.book, 'chapter': Number(req.params.chapter), 'verse' : Number(req.params.verse)})
	    .populate('references')
	    .exec(function (err, annotation) {
		    if(err) { return handleError(res, err); }    
		    if(!annotation) { return res.send(null); }
	    	return res.json(annotation);
	  });
};

exports.findMedia = function(req, res) {
	  Annotation.findOne({ 'book': req.params.book, 'chapter': Number(req.params.chapter), 'verse' : Number(req.params.verse)})
	    .populate('media')
	    .exec(function (err, annotation) {
		    if(err) { return handleError(res, err); }    
		    if(!annotation) { return res.send(null); }
		    var opts = [{path: 'user', model: 'User'}, 
		                {path: 'image', model: 'Image'},
		                ];
		    	Media.populate(annotation.media, opts).then(function(media){
		    		annotation.media = media;
		    		return res.status(200).json(annotation);
		    	}).end();		    	
		    });	    
};


function getFootnotes(req){
	  var reference = {};
	  var footnotes = [];
	  var testament = req.body.testament || 'ot';
	  if(testament==='ot'){
		  reference.leftData='hebrew';
	  } else {
		  reference.leftData='greek';
	  }
	  reference.leftVersion='original';
	  reference.rightData='kjv';
	  reference.rightVersion='kjv';
	  reference.book = req.params.book;
	  reference.chapter = req.params.chapter;
	  reference.verse = req.params.verse;
	  var data = javascripture.api.reference.getChapterData(reference);
	  var notes = data.right[req.params.verse-1];
	  var orig = data.left[req.params.verse-1];
	  orig = _.keyBy(orig, function(o){
		  var key = o[1];
		  return key.substring(key.lastIndexOf('/')+1);
	  });
	  _.forEach(notes,function(note){
		    var word = note[0];
		    var fn = {};
		    fn.word = word;
		    fn.notes = [];
		    var strongsNumbers = _.split(note[1],' ');
		    var morphNumber = note[2];
		    _.forEach(strongsNumbers, function(strongsNumber) {
			    if('undefined' !== typeof javascripture.data.strongsDictionary[ strongsNumber ]){
//			    	var strongsEntry = javascripture.data.strongsDictionary[ strongsNumber ];
				    var origEntry = orig[strongsNumber];
					var family = javascripture.api.word.getFamily( strongsNumber );
					//convert
					var osidStrongsNumber = strongsNumber;
					var osidEntry = javascripture.data.strongsDictionary[ osidStrongsNumber ];
					var lemma = javascripture.modules.hebrew.stripPointing( osidEntry.lemma );
					var strongsDef = osidEntry.strongs_def;
					var derivation = osidEntry.derivation;
					var transliteration = osidEntry.xlit;
					var pronounciation = osidEntry.pron;
					var kjvDef = osidEntry.kjv_def;//.split( ',' );		    	
					fn.notes.push( {
						    'word' : fn.word,
							'strongs_num' : strongsNumber,
							'strongs_def' : strongsDef,
							'original' : origEntry ? origEntry[0] : '',
							'lemma' : lemma,
							'derivation' : derivation,
							'transliteration' : transliteration,
							'pronounciation' : pronounciation,
							'kjv_def' : kjvDef
					});
			    }
		    });
		    if(fn.word.length !== 0 && fn.notes.length !== 0) {
		    	footnotes.push(fn);
		    }		    
	  });
	 return footnotes;
}


function handleError(res, err) {
  return res.status(500).send(err);
}