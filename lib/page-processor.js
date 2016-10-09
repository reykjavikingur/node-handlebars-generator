var _ = require('underscore');
var Handlebars = require('handlebars');

function PageProcessor(handlebars) {
	this.sourceMap = {};
	this.registrations = [];
	this.handlebars = handlebars || Handlebars;
}

PageProcessor.prototype = {
	registerSourceMap: registerSourceMap,
	registerPage: registerPage,
	generatePageMap: generatePageMap
};

function registerSourceMap(sourceMap) {
	_.each(sourceMap, function(template, path) {
		this.sourceMap[path] = template;
		this.handlebars.registerPartial(path, template);
	}.bind(this));
}

function registerPage(pagePath, sourcePath, data) {
	this.registrations.push({
		pagePath: pagePath,
		sourcePath: sourcePath,
		data: data
	});
}

function generatePageMap() {
	var pageMap = {};
	_.each(this.registrations, function(registration) {
		var source = this.sourceMap[registration.sourcePath];
		var render = this.handlebars.compile(source);
		var content = render(registration.data);
		pageMap[registration.pagePath] = content;
	}.bind(this));
	return pageMap;
}

module.exports = PageProcessor;
