var _ = require('underscore');
var Promise = require('promise');
var Handlebars = require('handlebars');
var SourceDirectory = require('./source-directory');
var PageGenerator = require('./page-generator');

function constructor(handlebars) {
	this.handlebars = handlebars || Handlebars;
	this.sourceDirectories = [];
	this.pages = [];
}

constructor.prototype = {
	create: create,
	registerSourceDirectory: registerSourceDirectory,
	registerPage: registerPage,
	generatePages: generatePages
};

function create(handlebars) {
	return new constructor(handlebars);
}

function registerSourceDirectory(srcPath, options) {
	this.sourceDirectories.push(new SourceDirectory(srcPath, options));
}

function registerPage(distPath, srcPath, data) {
	this.pages.push({
		distPath: distPath,
		srcPath: srcPath,
		data: data
	});
}

function generatePages(distPath, options, callback) {

	var sourcePromise = SourceDirectory.loadAll(this.sourceDirectories)
			.then(function (sourceMap) {
				var pageGenerator = new PageGenerator(this.handlebars, sourceMap);
				_.each(this.pages, function (page) {
					pageGenerator.render(page.distPath, page.srcPath, page.data);
				});
				return pageGenerator.generate(distPath, {
					extension: options.extension
				});
			}.bind(this))
		;

	var promise = Promise.all(assetPromise, sourcePromise);

	if (callback) {
		promise.then(function (r) {
			callback(null, r);
		}, function (e) {
			callback(e);
		});
	}
	else {
		return promise;
	}
}

module.exports = new constructor();