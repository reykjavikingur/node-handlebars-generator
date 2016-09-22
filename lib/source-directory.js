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
	this.options = _.defaults({}, options, {
		extension: 'html',
		prefix: ''
	});
	this.fileTree = new FileTree.prototype.constructor(path, {
		extension: this.options.extension
	});
}

SourceDirectory.loadAll = loadAll;

SourceDirectory.prototype = {
	load: load
};

/**
 * Loads the file data from the directory asynchronously
 * and returns promise resolving to cache object
 */
function load() {
	return new Promise(function (resolve, reject) {
		this.fileTree.load(function (err) {
			if (err) {
				reject(err);
			}
			else {
				var cache = {};
				_.each(this.fileTree.cache, function (template, name) {
					if (this.options.prefix) {
						name = this.options.prefix + '/' + name;
					}
					cache[name] = template;
				}.bind(this));
				resolve(cache);
			}
		}.bind(this));
	}.bind(this));
}

function loadAll(list) {
	var promises = _.map(list, function (sd) {
		return sd.load();
	});
	return Promise.all(promises)
		.then(function (r) {
			var allCache = {};
			_.each(r, function (cache) {
				_.each(cache, function (template, name) {
					allCache[name] = template;
				})
			});
			return allCache;
		});
}

module.exports = SourceDirectory;