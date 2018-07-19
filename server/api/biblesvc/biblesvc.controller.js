'use strict';

var _ = require('lodash');
var each = require('async-each-series');
var Biblesvc = require('./biblesvc.model');
var bibleSocket = require('./biblesvc.socket');

var bible = require('../../components/holy-bible');
var javascripture = require('../../components/javascripture');

var OT = require('./testaments/ot.json');
var NT = require('./testaments/nt.json');

var TESTAMENTS = {
		'ot':OT,
		'nt':NT
};

// Get list of biblesvcs
exports.index = function(req, res) {
  var book = req.params.book;
  var chapter = req.params.chapter;
  var chapters = getSurroundingChapters(book,chapter);
  var tt = javascripture.api.reference.getTestament(book);
  tt = (tt==='hebrew') ? 'ot' : 'nt';
  bible.get(book+' '+chapter, 'kjv').then(function (verse) {
	  if(req.body && req.body.userId){
		  each(verse.text, function(v,next) {
			  bibleSocket.sendVerse(req.body.userId,v)
			  next();
		  },function(err){
			  console.log("Sending verses to client")
			  return res.status(200).send({'prev':chapters.prev, 'next':chapters.next, 'testament': tt});
		  });		  
	  } else {
	     return res.status(200).send({'prev':chapters.prev, 'next':chapters.next, 'verses': verse.text, 'testament': tt});		  
	  }
  }, function(reason) {
      return handleError(res, reason);
  });
};

//Get list of biblesvcs
exports.changeVersion = function(req, res) {
  var version = req.params.version;
  var book = req.params.book;
  var chapter = req.params.chapter;
  var chapters = getSurroundingChapters(book,chapter);
  bible.get(book+' '+chapter, version.toLowerCase()).then(function (verse) {
	  if(req.body && req.body.userId){
		  each(verse.text, function(v,next) {
			  bibleSocket.sendVerse(req.body.userId,v)
			  next();
		  },function(err){
			  console.log("Sending verses to client")
			  return res.status(200).send({'prev':chapters.prev, 'next':chapters.next});
		  });		  
	  } else {		  
		 return res.status(200).send({'prev':chapters.prev, 'next':chapters.next, 'verses': verse.text});
	  }
  }, function(reason) {
      return handleError(res, reason);
  });
};

function getSurroundingChapters(book,chapter) {
	var reference = {};
	reference.leftVersion='original';
	reference.rightData='kjv';
	reference.rightVersion='kjv';
	reference.book = book;
	reference.chapter = chapter;
//	var chapters = javascripture.api.reference.getThreeChapters(reference).chapters;
	var prev = javascripture.api.reference.getOffsetChapter(reference,-1);
	var next = javascripture.api.reference.getOffsetChapter(reference,1);
	if(!prev.book){
		prev=undefined;
	}
	if(!next.book){
		next=undefined;
	}
	return {'prev': prev, 'next': next};
}

exports.getBooks = function(req, res) {
	  var tt = req.params.testament || 'ot';
	  var books = TESTAMENTS[tt];
	  if(!books) { return res.status(404).send('Not Found');}
	  return res.json(books); 
};

exports.getOffsetChapter = function(req,res){
	  var version = req.params.version;
	  var book = req.params.book;
	  var chapter = parseInt(req.params.chapter);
	  var tt = req.params.testament;//javascripture.api.reference.getTestament(book);	
//	  tt = (tt==='hebrew') ? 'ot' : 'nt';
	  var offset = parseInt(req.params.offset); 
	  var reference = {};
	  if(tt==='ot'){
		  reference.leftData='hebrew';
	  } else {
		  reference.leftData='greek';
	  }
	  reference.leftVersion='original';
	  reference.rightData='kjv';
	  reference.rightVersion='kjv';
	  reference.book = book;
	  reference.chapter = chapter;
	  var offsetChapter = javascripture.api.reference.getOffsetChapter(reference,offset);
	  bible.get(offsetChapter.book+' '+offsetChapter.chapter, version.toLowerCase()).then(function (verse) {
		    return res.status(200).send(verse.text);
	  }, function(reason) {
		      return handleError(res, reason);
	  });
};

//exports.getFootnotes = function(req, res) {
//	  var testament = req.body.testament || 'ot';
//	  if(testament==='ot'){
//		  req.body.leftData='hebrew';
//		  req.body.leftVersion='original';
//	  }
//	  req.body.rightData=req.body.version;
//	  req.body.rightVersion=req.body.version;
//	  var book = req.body.book;
//	  var chapter = req.body.chapter;
//	  var verse = req.body.verse;
//	  var data = javascripture.api.reference.getChapterData(req.body);
//	  var footnotes = data.right[verse-1];
//	  _.forEach(footnotes,function(note){
//		    var word = note[0];
//		    var strongsNumbers = _.split(note[1],' ');
//		    var morphNumber = note[2];
//		    _.forEach(strongsNumbers, function(strongsNumber) {
//			    if('undefined' !== typeof javascripture.data.strongsDictionary[ strongsNumber ]){
////			    	var strongsEntry = javascripture.data.strongsDictionary[ strongsNumber ];
//					var family = javascripture.api.word.getFamily( strongsNumber );
//					//convert
//					var osidStrongsNumber = strongsNumber;
//					var osidEntry = javascripture.data.strongsDictionary[ osidStrongsNumber ];
//					var lemma = javascripture.modules.hebrew.stripPointing( osidEntry.lemma );
//					var strongsDef = osidEntry.strongs_def;
//					var derivation = osidEntry.derivation;
//					var transliteration = osidEntry.xlit;
//					var pronounciation = osidEntry.pron;
//					var kjvDefArray = osidEntry.kjv_def.split( ',' );		    	
//
//			    }
//		    });
//	  });
//	  if(!books) { return res.status(404).send('Not Found');}
//	  return res.json(books); 
//};

// Get a single biblesvc
exports.show = function(req, res) {
  Biblesvc.findById(req.params.id, function (err, biblesvc) {
    if(err) { return handleError(res, err); }
    if(!biblesvc) { return res.status(404).send('Not Found'); }
    return res.json(biblesvc);
  });
};

// Creates a new biblesvc in the DB.
exports.create = function(req, res) {
  Biblesvc.create(req.body, function(err, biblesvc) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(biblesvc);
  });
};

// Updates an existing biblesvc in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Biblesvc.findById(req.params.id, function (err, biblesvc) {
    if (err) { return handleError(res, err); }
    if(!biblesvc) { return res.status(404).send('Not Found'); }
    var updated = _.merge(biblesvc, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(biblesvc);
    });
  });
};

// Deletes a biblesvc from the DB.
exports.destroy = function(req, res) {
  Biblesvc.findById(req.params.id, function (err, biblesvc) {
    if(err) { return handleError(res, err); }
    if(!biblesvc) { return res.status(404).send('Not Found'); }
    biblesvc.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
