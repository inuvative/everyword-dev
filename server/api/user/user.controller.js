'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var mongooseTypes = require('mongoose').Types;
var _ = require('lodash');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

//var testUsers =[];
//for(var i=1;i<=500;i++){
//	var testUser = new User({'name' : 'TestUser000'+i, 'email': 'testUser000'+i+'@test.com', 'password': 'test', 'provider':'local'});
//	testUser.save();
//}

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
	  var query = req.query.lastId ? {"_id":{$gt: mongooseTypes.ObjectId(req.query.lastId)}} : {};
	  var limit = req.query.limit || 0;
	  if(req.query.name){
		  query.name= {$regex: req.query.name, $options: 'i' };
	  }
	  User.find(query, '-salt -hashedPassword').sort({_id: 1}).limit(limit).exec(function (err, users) {
	    if(err) return res.status(500).send(err);
	    if(!users){
	    	res.status(200).json([]);
	    } else {
		    res.status(200).json(users);	    	
	    }
	  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
	User.findOne({email: req.body.email},'-salt -hashedPassword', function (err, user) {
		  if(err){
			  res.status(400);
		  }
		  if(user !== null){
			  res.json({user: user});
			  return;
		  }
		  var newUser = new User(req.body);
		  newUser.provider = 'local';
		  newUser.role = 'user';
		  newUser.save(function(err, user) {
		    if (err) return validationError(res, err);
		    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
		    res.json({ user: user, token: token });
		  });		
	});
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id || req.user._id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(null);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.status(204).send('No Content');
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.status(200).send('OK');
      });
    } else {
      res.status(403).send('Forbidden');
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.status(401).send('Unauthorized');
    res.json(user);
  });
};

exports.checkEmail = function(req, res, next) {
	  var email = req.body.email;
	  User.findOne({
	    email: email
	  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
	    if (err) return next(err);
	    if (!user){
	    	return res.send(null);
	    }
	    return res.json(user);
	  });
};


/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
