var assert = require('assert');
var _ = require('underscore');
var Promise = require('promise');
var FileTree = require('web-template-file-tree');

function DestinationDirectory() {

}

DestinationDirectory.save = function DestinationDirectory_save(fileTree) {
	assert(fileTree);
	return new Promise(function (resolve, reject) {
		debugger;
		fileTree.save(function (err) {
			if (err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
};

DestinationDirectory.prototype = {
	registerPageMap: registerPageMap,
	save: save
};

function registerPageMap(pageMap) {
	this.pageMap = pageMap;
}

function save(outputPath, options) {
	const DEFAULTS = {};
	options = _.defaults({}, options, DEFAULTS);
	var fileTree = new FileTree(outputPath, {
		extension: options.extension || 'html'
	});
	fileTree.cache = this.pageMap;
	return DestinationDirectory.save(fileTree);
}

module.exports = DestinationDirectory;