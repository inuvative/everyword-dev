/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');

User.find({}, function (err, users) {
    if(!users){
	  User.create({
		    provider: 'local',
		    role: 'guest',
		    name: 'Guest',
		    email: 'guest@guest.com',
		    password: 'guest'
		  }, {
		    provider: 'local',
		    role: 'admin',
		    name: 'Everyword Administrator',
		    email: 'everywordbible@gmail.com',
		    password: 'artsehcro'
		  }, function() {
		      console.log('finished populating users');
		    }
		  );
    } else {
    	var adminExists=false;
    	var guestExists=false;
    	for(var u in users ){
    		if(users[u].role==='admin' && users[u].email==='everywordbible@gmail.com'){
    			adminExists=true;
    		}
    		if(users[u].role==='guest'){
    			guestExists=true;
    		}
    	}
    	if(!adminExists){
    		User.create({
		    provider: 'local',
		    role: 'admin',
		    name: 'Everyword Administrator',
		    email: 'everywordbible@gmail.com',
		    password: 'artsehcro'
		  }, function() {
		      console.log('Admin user created');
		    }
		  );
    	}
    	if(!guestExists){
    		User.create({
		    provider: 'local',
		    role: 'guest',
		    name: 'Guest',
		    email: 'guest@guest.com',
		    password: 'guest'
		  }, function() {
		      console.log('Guest user created');
		    }
		  );
    	}
    	
    }
});
