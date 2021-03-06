'use strict';

var _ = require('lodash');
var DailyReading = require('./dailyreading.model');
var javascripture = require('../../components/javascripture');

// Get list of dailyreadings
exports.index = function(req, res) {
  DailyReading.find({'group': {$exists:false}},function (err, dailyreadings) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(dailyreadings);
  });
};

// Get a readings by date
exports.readingsOfDay = function(req, res) {
  var dt = new Date(req.params.date);
  dt.setHours(0,0,0,0);
  DailyReading.find({$and : [{'day': {$lte : dt}},{'endDay': {$gte : dt}}]}, function (err, dailyreadings) {
    if(err) { return handleError(res, err); }
    if(!dailyreadings) { return res.status(404).send('Not Found'); }
    return res.json(dailyreadings);
  });
};

exports.showGroupReading = function(req, res) {
	  DailyReading.find({'group': req.params.groupid}, function (err, dailyreadings) {
	    if(err) { return handleError(res, err); }
	    if(!dailyreadings) { return res.status(404).send('Not Found'); }
	    return res.json(dailyreadings);
	  });
	};

// Creates a new dailyreading in the DB.
exports.create = function(req, res) {
  DailyReading.create(req.body, function(err, dailyreading) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(dailyreading);
  });
};

exports.addReadings = function(req, res) {
	if(req.body && req.body.readings){
		var readings = req.body.readings;
        for(var r in readings){
        	var dt = new Date(r);
        	var readingList=readings[r];
        	for(var i=0; i<readingList.length;i++){
        		var v = readingList[i];
            	var tt = javascripture.api.reference.getTestament(v.book);
            	tt = (tt==='hebrew') ? 'ot' : 'nt';
            	var reading = new DailyReading({day: dt, testament:tt});
            	_.assign(reading,v);
            	reading.save();        		
        	}
        }
        return res.status(201).send("Success");
	}
	return res.status(200).send("Nothing to do");
};

// Updates an existing dailyreading in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  DailyReading.findById(req.params.id, function (err, dailyreading) {
    if (err) { return handleError(res, err); }
    if(!dailyreading) { return res.status(404).send('Not Found'); }
    var updated = _.merge(dailyreading, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(dailyreading);
    });
  });
};

// Deletes a dailyreading from the DB.
exports.destroy = function(req, res) {
  DailyReading.findById(req.params.id, function (err, dailyreading) {
    if(err) { return handleError(res, err); }
    if(!dailyreading) { return res.status(404).send('Not Found'); }
    dailyreading.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}