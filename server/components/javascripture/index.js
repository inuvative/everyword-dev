var fs = require('fs');
var path = require('path');

var javascripture = {};
//module.exports = javascripture;
javascripture.data = {};
javascripture.data.kjv = { text : kjvText};
javascripture.data.web = { text: webText};
javascripture.data.greek = {text: greekText};
javascripture.data.hebrew = {text : hebrewText};
javascripture.data.bible = require('./data/bible');
javascripture.data.strongsObject = require('./data/strongsObjectRoots');
javascripture.data.strongsObjectWithFamilies = require('./data/strongsObjectWithFamilies2');
javascripture.data.strongsDictionary = require('./data/strongs-dictionary');

javascripture.modules = {};
javascripture.modules.hebrew = require('./modules/hebrew');

javascripture.api = {};
require('./api/word')(javascripture);
require('./api/searchApi')(javascripture);
require('./api/reference')(javascripture);

module.exports = javascripture;

//const used = process.memoryUsage().heapUsed / 1024 / 1024;
//console.log('This script used approx. '+Math.round(used*100)/100+' MB');
function kjvText(){
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data/kjv.json')));
}
function webText() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data/web.json')));//require('./data/web3');
}
function greekText() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data/greek.json')));//require('./data/greek4');
}
function hebrewText() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data/hebrew.json')));//require('./data/hebrew-with-morph5');
}