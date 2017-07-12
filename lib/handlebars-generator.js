var _ = require('underscore');
var Promise = require('promise');
var Handlebars = require('handlebars');
var SourceDirectory = require('./source-directory');
var PageProcessor = require('./page-processor');
var DestinationDirectory = require('./destination-directory');
var SiteUtil = require('./site-util');

function constructor(handlebars) {
	this.handlebars = handlebars || Handlebars;
	this.pageProcessor = new PageProcessor(this.handlebars);
	this.sourcePromises = [];
	this.destinationDirectory = new DestinationDirectory();
}

constructor.prototype = {
	create: create,
	registerSourceDirectory: registerSourceDirectory,
	registerPage: registerPage,
	registerPageFactory: registerPageFactory,
	registerDataFactory: registerDataFactory,
	generatePages: generatePages,
	generateSite: generateSite
};

function create(handlebars) {
	return new constructor(handlebars);
}

function registerSourceDirectory(srcPath, options) {
	var promise = SourceDirectory.create(srcPath, options).load()
		.then(function (r) {
			this.pageProcessor.registerSourceMap(r);
		}.bind(this));
	this.sourcePromises.push(promise);
}

function registerPage(distPath, srcPath, data) {
	this.pageProcessor.registerPage(distPath, srcPath, data);
}

function registerPageFactory(pageFactory) {
	this.pageProcessor.registerPageFactory(pageFactory);
}

function registerDataFactory(dataFactory) {
	this.pageProcessor.registerDataFactory(dataFactory);
}

function generatePages(distPath, options, callback) {

	options = _.defaults(options, {});

	var promise = Promise.all(this.sourcePromises)
		.then(function (r) {
			var pageMap = this.pageProcessor.generatePageMap();
			this.destinationDirectory.registerPageMap(pageMap);
			return this.destinationDirectory.save(distPath, {
				extension: options.extension
			});
		}.bind(this));

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

function generateSite(sourcePath, distPath, options, callback) {

	// reassign parameters in case of signature (sourceDirectory, destinationDirectory, callback)
	if (!callback && typeof options === 'function') {
		callback = options;
		options = null;
	}

	options = _.defaults(options, {
		sourceExtension: 'html',
		distExtension: 'html'
	});

	var siteUtil = SiteUtil({
		sourcePath: sourcePath
	});

	this.registerSourceDirectory(sourcePath, {extension: options.sourceExtension});
	this.registerPageFactory(siteUtil.pageFactory);
	this.registerDataFactory(siteUtil.dataFactory);
	this.registerDataFactory(siteUtil.siteDataFactory);
	this.registerDataFactory(siteUtil.pageDataFactory);

	return this.generatePages(distPath, {extension: options.distExtension}, callback);

}

module.exports = new constructor();