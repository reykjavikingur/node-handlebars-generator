const _ = require('underscore');
const Promise = require('promise');
const Handlebars = require('handlebars');
const SourceDirectory = require('./source-directory');
const PageProcessor = require('./page-processor');
const DestinationDirectory = require('./destination-directory');
const SiteUtil = require('./site-util');
const Tracer = require('./tracer');

class HandlebarsGenerator {

	constructor(handlebars) {
		this.handlebars = handlebars || Handlebars;
		this.pageProcessor = new PageProcessor(this.handlebars);
		this.sourcePromises = [];
		this.destinationDirectory = new DestinationDirectory();
	}

	create(handlebars) {
		return new HandlebarsGenerator(handlebars);
	}

	registerSourceDirectory(srcPath, options) {
		var promise = SourceDirectory.create(srcPath, options).load()
			.then(r => {
				if (this.tracer) {
					this.tracer.annotateSourceMap(r);
				}
				this.pageProcessor.registerSourceMap(r);
			});
		this.sourcePromises.push(promise);
	}

	registerPage(distPath, srcPath, data) {
		this.pageProcessor.registerPage(distPath, srcPath, data);
	}

	registerPageFactory(pageFactory) {
		this.pageProcessor.registerPageFactory(pageFactory);
	}

	registerDataFactory(dataFactory) {
		this.pageProcessor.registerDataFactory(dataFactory);
	}

	generatePages(distPath, options, callback) {

		const DEFAULTS = {};
		options = _.defaults({}, options, DEFAULTS);

		var promise = Promise.all(this.sourcePromises)
			.then(r => {
				var pageMap = this.pageProcessor.generatePageMap();
				if (this.tracer) {
					this.tracer.analyzePageMap(pageMap);
				}
				this.destinationDirectory.registerPageMap(pageMap);
				return this.destinationDirectory.save(distPath, {
					extension: options.extension
				});
			});

		if (callback) {
			promise.then(r => callback(null, r), e => callback(e));
		}
		else {
			return promise;
		}
	}

	generateSite(sourcePath, distPath, options, callback) {

		var instance = new HandlebarsGenerator(this.handlebars);

		// reassign parameters in case of signature (sourceDirectory, destinationDirectory, callback)
		if (!callback && typeof options === 'function') {
			callback = options;
			options = null;
		}

		const DEFAULTS = {
			sourceExtension: 'html',
			distExtension: 'html',
		};

		options = _.defaults({}, options, DEFAULTS);

		var siteUtil = SiteUtil({
			sourcePath: sourcePath
		});

		if (options.trace) {
			instance.tracer = new Tracer();
			instance.tracer.registerHelpers(instance.handlebars);
		}

		instance.registerSourceDirectory(sourcePath, {extension: options.sourceExtension});
		instance.registerPageFactory(siteUtil.pageFactory);
		instance.registerDataFactory(siteUtil.dataFactory);
		instance.registerDataFactory(siteUtil.siteDataFactory);
		instance.registerDataFactory(siteUtil.pageDataFactory);

		return instance.generatePages(distPath, {extension: options.distExtension}, callback);

	}

}

module.exports = new HandlebarsGenerator();