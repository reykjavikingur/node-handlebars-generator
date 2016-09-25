var should = require('should');
var sinon = require('sinon');
var HandlebarsGenerator = require('../lib/handlebars-generator');
var Handlebars = require('handlebars');
var FileTree = require('web-template-file-tree');

describe('HandlebarsGenerator', function () {

	describe('.create', function () {

		it('should return something', function () {
			should(HandlebarsGenerator.create()).be.ok();
		});

		it('should instantiate the correct type', function () {
			var instance = HandlebarsGenerator.create();
			should(instance).be.an.instanceOf(HandlebarsGenerator.constructor);
		});

		it('should use the Handlebars singleton', function () {
			var handlebarsGenerator = HandlebarsGenerator.create();
			should(handlebarsGenerator.handlebars).equal(Handlebars);
		});

		it('should use given handlebars instance', function () {
			var handlebars = Handlebars.create();
			var handlebarsGenerator = HandlebarsGenerator.create(handlebars);
			should(handlebarsGenerator.handlebars).equal(handlebars);
		});

	});

	describe('instance', function () {

		var handlebarsGenerator;

		beforeEach(function () {
			handlebarsGenerator = HandlebarsGenerator.create(Handlebars.create());
		});

		it('should be truthy', function () {
			should(handlebarsGenerator).be.ok();
		});

		it('should initially have 0 pages', function () {
			should(handlebarsGenerator.pages).eql([]);
		});

		describe('.registerPage', function () {
			beforeEach(function () {
				handlebarsGenerator.registerPage('index', 'home', {title: 'Welcome'});
			});
			it('should add 1 page', function () {
				should(handlebarsGenerator.pages.length).equal(1);
			});
		});

		describe('.registerSourceDirectory', function () {
			beforeEach(function () {
				handlebarsGenerator.registerSourceDirectory('src');
			});
			it('should add 1 source directory', function () {
				should(handlebarsGenerator.sourceDirectories.length).equal(1);
			});
		});

		describe('.registerAssetDirectory', function () {
			beforeEach(function () {
				handlebarsGenerator.registerAssetDirectory('misc');
			});
			it('should add 1 asset directory', function () {
				should(handlebarsGenerator.assetDirectories.length).equal(1);
			});
		});

	});

});