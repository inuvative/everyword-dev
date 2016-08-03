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
		    name: 'Test User',
		    email: 'test@test.com',
		    password: 'test'
		  }, {
		    provider: 'local',
		    role: 'admin',
		    name: 'Admin',
		    email: 'admin@admin.com',
		    password: 'admin'
		  }, function() {
		      console.log('finished populating users');
		    }
		  );
    } else {
    	var adminExists=false;
    	for(var u in users ){
    		if(users[u].role==='admin'){
    			adminExists=true;
    		}
    	}
    	if(!adminExists){
    		User.create({
		    provider: 'local',
		    role: 'admin',
		    name: 'Admin',
		    email: 'admin@admin.com',
		    password: 'admin'
		  }, function() {
		      console.log('Admin user created');
		    }
		  );
    	}
    }
});
