var should = require('should');
var HandlebarsGenerator = require('../');
var Handlebars = require('handlebars');
var FileTree = require('web-template-file-tree');

describe('HandlebarsGenerator', function () {

	it('should be truthy', function () {
		should(HandlebarsGenerator).be.ok();
	});

	it('should initially have 0 pages', function () {
		should(HandlebarsGenerator.pages).eql([]);
	});

	describe('.registerPage', function () {
		beforeEach(function () {
			HandlebarsGenerator.registerPage('index', 'home', {title: 'Welcome'});
		});
		it('should add 1 page', function () {
			should(HandlebarsGenerator.pages.length).equal(1);
		});
	});

	describe('.compilePage', function () {

		var template, data;

		beforeEach(function () {
			// create stubs
			template = 'You are at the {{title}} site.';
			data = {title: 'Welcome'};

			HandlebarsGenerator.srcTree = new FileTree('src');
			HandlebarsGenerator.srcTree.cache = {
				'home': template
			};
			HandlebarsGenerator.distTree = new FileTree('dist');
			HandlebarsGenerator.distTree.cache = {};
		});

		beforeEach(function(){
			HandlebarsGenerator.compilePage('index', 'home', data);
		});

		it('should render template', function () {
			var actual = HandlebarsGenerator.distTree.cache['index'];
			var expected = Handlebars.compile(template)(data);
			should(actual).equal(expected);
		});

	});

});