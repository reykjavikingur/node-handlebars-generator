var assert = require('assert');
var _ = require('underscore');
var Promise = require('promise');
var FileTree = require('web-template-file-tree');

function PageGenerator(handlebars, partialMap) {
	assert(handlebars, 'must provide handlebars');
	this.handlebars = handlebars;
	this.partialMap = partialMap;
	_.each(partialMap, function (template, name) {
		handlebars.registerPartial(name, template);
	});
	this.pageMap = {};
}

PageGenerator.prototype = {
	render: render,
	generate: generate
};

function render(distPath, srcPath, data) {
	assert(distPath, 'must provide distPath');
	assert(srcPath, 'must provide srcPath');
	assert(this.partialMap.hasOwnProperty(srcPath), 'must have defined srcPath in partialMap');
	var srcTemplate = this.partialMap[srcPath];
	var adjustment = _adjustment(distPath);
	this.handlebars.registerHelper('asset', function (path) {
		return adjustment + path;
	});
	var output = this.handlebars.compile(srcTemplate)(data);
	this.handlebars.unregisterHelper('asset');
	this.pageMap[distPath] = output;
}

function generate(directoryPath, options) {
	assert(directoryPath, 'must provide directoryPath');
	var fileTree = new FileTree(directoryPath, {
		extension: options.extension
	});
	fileTree.cache = this.pageMap;
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
}

function _level(path) {
	var parts = path.split('/');
	return parts.length - 1;
}

function _adjustment(path) {
	var level = _level(path);
	return '../'.repeat(level);
}

module.exports = PageGenerator;