var jsonfile = require('jsonfile');

var file = 'strongs-hebrew-dictionary.json';

jsonfile.readFile(file, function(err, obj) {
	//console.log(obj['H1']);
});

var jsonStream = require('JSONStream');

var fs = require("fs");
var result=[];
 
var pipeline = fs.createReadStream(file).pipe(jsonStream.parse('rows.*.doc'));
pipeline.on("data", function(chunk) {
	result.push({val: chunk});
});
pipeline.on("end", function() {
	console.log(result[0]);
});



