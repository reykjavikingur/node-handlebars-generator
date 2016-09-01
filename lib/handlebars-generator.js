var _ = require('underscore');
var Handlebars = require('handlebars');
var FileTree = require('web-template-file-tree');

function constructor() {
	this.pages = [];
}

constructor.prototype = {
	registerPage: registerPage,
	generate: generate,
	compilePage: compilePage
};

function registerPage(distPath, srcPath, data) {
	this.pages.push({
		distPath: distPath,
		srcPath: srcPath,
		data: data
	});
}

function generate(options, cb) {
	options = _.defaults(options, {});
	this.srcTree = new FileTree(options.src);
	this.distTree = new FileTree(options.dest);
	this.srcTree.load(function (err) {
		if (err) {
			cb(err);
		}
		else {
			var hbError;
			try {
				_.each(this.srcTree.cache, function (template, path) {
					Handlebars.registerPartial(path, template);
				}.bind(this));

				_.each(this.pages, function (page) {
					this.compilePage(page.distPath, page.srcPath, page.data);
				}.bind(this));
			}
			catch (e) {
				hbError = e;
			}

			if (hbError) {
				cb(hbError);
			}
			else {
				this.distTree.save(cb);
			}
		}
	}.bind(this));
}

function compilePage(distPath, srcPath, data) {
	if (!this.srcTree.cache.hasOwnProperty(srcPath)) {
		throw new Error('cannot find source path "' + srcPath + '" for page compilation');
	}
	var template = this.srcTree.cache[srcPath];
	var render = Handlebars.compile(template);
	var output = render(data);
	this.distTree.cache[distPath] = output;
}

module.exports = new constructor();