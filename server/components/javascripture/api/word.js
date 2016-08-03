/*globals javascripture bible*/
var word = function(javascripture) {
    javascripture.api.word = {
	getFamily: function ( strongsNumber ) {
		if ( javascripture.data.strongsObjectWithFamilies[ strongsNumber ] ) {
			return javascripture.data.strongsObjectWithFamilies[ strongsNumber ].family;
		} else {
			return strongsNumber;
		}
	}
	}
};
module.exports = word;