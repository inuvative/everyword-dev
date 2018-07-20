'use strict';

function remove_dupes(arr) {
	var seen = {};
	var ret_arr = [];
	for (var i = 0; i < arr.length; i++) {
		if (!seen[arr[i]]) {
			ret_arr.push(arr[i]);
			seen[arr[i]] = true;
		}
	}
	return ret_arr;
}

module.exports = {
		removeDupes : remove_dupes
};