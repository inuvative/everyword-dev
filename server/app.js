/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = 9001;

var express = require('express');
var mongoose = require('mongoose');
//mongoose.set('debug', true);
var config = require('./config/environment');
var mockdb = null;
// Connect to database
if(process.env.NODE_ENV==='test'){
	var mockgoose = require('mockgoose');
	mockgoose(mongoose).then(function(mockgoose_uri) {
		mockdb = mockgoose_uri;
		mongoose.connect(config.mongo.uri, config.mongo.options);
		mongoose.connection.on('error', function(err) {
			console.error('MongoDB connection error: ' + err);
			process.exit(-1);
			}
		);
	}, function(reason){
		console.log(reason);
	});
} else {
	mongoose.connect(config.mongo.uri, config.mongo.options);
	mongoose.connection.on('error', function(err) {
		console.error('MongoDB connection error: ' + err);
		process.exit(-1);
		}
	);	
}
// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: config.env !== 'production',
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

function exitHandler(options, err) {
    if (options.cleanup) {
    	console.log('clean');
    	if(mockdb){
    		mongoose.unmock(function(){
    			console.log('Unmocking db');
    		});
    	}
    	if(mockgoose){
    		mockgoose.reset(function(err){
    			console.log("reseting mockgoose")
    			if(err){
    				console.log(err);
    			}
    		});
    	}
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit(-1);
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

// Expose app
exports = module.exports = app;
