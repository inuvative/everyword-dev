var javascripture = {};
//module.exports = javascripture;
javascripture.data = {};
javascripture.data.kjv = require('./data/kjvdwyer7');
javascripture.data.web = require('./data/web3');
javascripture.data.greek = require('./data/greek4');
javascripture.data.hebrew = require('./data/hebrew-with-morph5');
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