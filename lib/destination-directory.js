var assert = require('assert');
var _ = require('underscore');
var Promise = require('promise');
var FileTree = require('web-template-file-tree');

function DestinationDirectory() {

}

DestinationDirectory.save = function DestinationDirectory_save(fileTree) {
	assert(fileTree);
	return new Promise(function (resolve, reject) {
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
	var fileTree = new FileTree(outputPath, options);
	return DestinationDirectory.save(fileTree);
}

module.exports = DestinationDirectory;