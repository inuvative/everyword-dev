'use strict';

var _ = require('lodash');
var Message = require('./message.model');
var Homebase = require('../homebase/homebase.model');

var nodemailer = require('nodemailer');
var smtpConfig = {
	    host: 'smtp.gmail.com',
	    port: 465,
	    secure: true, // use SSL 
	    auth: {
	        user: 'everywordbible@gmail.com',
	        pass: 'artsehcro'
	    }
	};
var transporter = nodemailer.createTransport(smtpConfig);
		
//		"SMTP",{
//	   service: "Gmail",  // sets automatically host, port and connection security settings
//	   auth: {
//	       user: "everywordbible@gmail.com",
//	       pass: "artsehcro"
//	   }
//	});

//var sendmail = require("sendmail")();

// Get list of messages
exports.index = function(req, res) {
  Message.find(function (err, messages) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(messages);
  });
};

// Get a single message
exports.show = function(req, res) {
  Message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    return res.json(message);
  });
};

// Creates a new message in the DB.
exports.create = function(req, res) {
  Message.create(req.body, function(err, message) {
    if(err) { return handleError(res, err); }
    Homebase.findOne({login: req.body.to}).populate('messages').exec(function(err,home) {
    	home.messages.push(message);
    	home.save(function(err) {
    		if(err) { return handleError(res, err); }    		
    	    Message.populate(message, {path: 'to from', model: 'User'}, function(err,msg) {
    	        return res.status(201).json(msg);    	    	
    	    })
    	});
    });
//    return res.status(201).json(message);
  });
};

exports.findMessage = function(req, res) {
	  Message.findOne({to: req.body.to, from: req.body.from, subject : req.body.subject}, function (err, message) {
	    if(err) { return handleError(res, err); }
	    if(!message) { return res.send(null); }
	    return res.json(message);
	  });
};

exports.messageCount = function(req, res) {
	  var user = req.params.user;
	  Message.count({$and: [{to: user},{$or: [{'action.completed': false},{read: false}]}]},function (err, count) {
	    if(err) { return handleError(res, err); }
	    return res.json(count);
	  });
};

// Updates an existing message in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Message.findById(req.params.id, function (err, message) {
    if (err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    var updated = _.merge(message, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(message);
    });
  });
};


// Deletes a message from the DB.
exports.destroy = function(req, res) {
  Message.findById(req.params.id, function (err, message) {
    if(err) { return handleError(res, err); }
    if(!message) { return res.status(404).send('Not Found'); }
    message.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};



//Creates a new message in the DB.
exports.sendEmail = function(req, res) {
	var to = req.body.to;
	var from = req.body.from;
    var subject = req.body.subject;
    var messageBody = '';
    if(req.body.group) {
    	messageBody = from.name + ' has invited you to join their group<br/>'+ req.body.group;
    	messageBody += ' on '+ req.body.url +'.';
    	if(req.body.message) {
    		messageBody += ' With the following message:<br/> '+req.body.message;
    	}
    	messageBody += '<br/><a href="'+req.body.link+'">Join</a>'
    }
    if(req.body.resetPwd){
    	messageBody = 'Please use the following link to ';
    	messageBody += '<a href="'+req.body.link+'">reset your password.</a>';
    	messageBody += '<br/>If you did not request this password change please feel free to ignore this email.';
    	messageBody += '<br/>This password reset is only valid for the next 24 hrs.';
    	messageBody += '<br/>Thanks,<br/> Everyword Support Team<br/>';
    	messageBody += req.body.url
    }
// setup e-mail data with unicode symbols 
    var mailOptions = {
        from: 'everywordbible@gmail.com', // sender address 
//        sender: req.body.from,
        to: to, // list of receivers 
        subject: subject, // Subject line 
        html: '<p>'+ messageBody +'</p>' // plaintext body 
    };
     
    // send mail with defined transport object 
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });    
    transporter.close();
    return res.status(201).json("Success");
};

function handleError(res, err) {
  return res.status(500).send(err);
}