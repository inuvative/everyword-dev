'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var User = require('../../api/user/user.model');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.status(401).json(error);
    if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

router.post('/forgot', function(req,res,next){
	var email = req.body.email;
	auth.findUserByEmail(email).then(function(user,error){
		if (error) return res.status(401).json(error);
		if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
	    var token = auth.signToken(user._id, user.role);
	    user.resetToken=token;
	    user.resetExpiry=new Date(Date.now() + 24*3600*1000)
	    user.save();
	    res.json({id: user._id , token: token});
	})
});
router.post('/reset', function(req,res,next){
	var uid = req.body.userid;
	var password = req.body.password;
	var token = req.body.token;
	User.findById(uid, function(error, user){
		if (error) return res.status(401).json(error);
		if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});
		if(user.resetToken===token && Date.now()<user.resetExpiry.getTime()){
			user.set('password',password);
			user.resetToken=null;
			user.resetExpiry=null;
			user.save();
		}
	    res.json({user: user});
	});
});
module.exports = router;