var _ = require('underscore');
var Promise = require('promise');
var FileTree = require('web-template-file-tree');

/**
 * Representation of source directory containing files for template partials
 */
function SourceDirectory(path, options) {
	if (!path) {
		throw new Error('not yet implemented');
	}
	this.path = path;
	const DEFAULTS = {
        extension: 'html',
        prefix: '',
	};
	this.options = _.defaults({}, options, DEFAULTS);
	this.fileTree = new FileTree.prototype.constructor(path, {
		extension: this.options.extension
	});
}

SourceDirectory.create = SourceDirectory_create;

SourceDirectory.prototype = {
	load: load
};

function SourceDirectory_create(path, options) {
	return new SourceDirectory(path, options);
}

/**
 * Loads the file data from the directory asynchronously
 * and returns promise resolving to cache object
 * with keys as file basenames and values as file contents
 */
function load() {

	return new Promise(function (resolve, reject) {
		this.fileTree.load(function(err) {
			if (err) {
				reject(err);
			}
			else {
				resolve(_createSourceMap(this.fileTree.cache, this.options.prefix));
			}
		}.bind(this));
	}.bind(this));

}

function _createSourceMap(cache, prefix) {
	var sourceMap = {};
	_.each(cache, function(template, name) {
		if (prefix) {
			name = prefix + '/' + name;
		}
		sourceMap[name] = template;
	});
	return sourceMap;
}

module.exports = SourceDirectory;