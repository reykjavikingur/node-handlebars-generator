var assert = require('assert');
var _ = require('underscore');
var Promise = require('promise');
var ncp = require('ncp');

function AssetDirectory(path, options) {
	assert(path, 'must provide path');
	options = _.defaults({}, options, {
		prefix: ''
	});
	this.path = path;
	this.options = options;
}

AssetDirectory.saveAll = saveAll;

AssetDirectory.prototype = {
	save: save
};

function save(path) {
	return new Promise(function (resolve, reject) {
		ncp(this.path, path, {}, function (err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	}.bind(this));
}

function saveAll(path, list) {
	var promises = _.map(list, function (ad) {
		ad.save(path);
	}.bind(this));
	return Promise.all(promises);
}

module.exports = AssetDirectory;