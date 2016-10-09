var should = require('should');
var sinon = require('sinon');
require('should-sinon');
var PageProcessor = require('../lib/page-processor');
var Handlebars = require('handlebars');

describe('PageProcessor', function () {

	it('should be a function', function () {
		should(PageProcessor).be.a.Function();
	});

	describe('instantiation with handlebars instance', function () {

		var hb, instance;

		beforeEach(function () {
			hb = Handlebars.create();
			should(hb).not.equal(Handlebars); // sanity check
			instance = new PageProcessor(hb);
		});
		it('should set handlebars', function () {
			should(instance.handlebars).equal(hb);
		});
	});

	describe('instantiation', function () {

		var instance;

		beforeEach(function () {
			instance = new PageProcessor();
		});

		it('should initialize empty sourceMap', function () {
			should(instance.sourceMap).eql({});
		});

		it('should set handlebars', function () {
			should(instance.handlebars).equal(Handlebars);
		});

		describe('.registerSourceMap', function () {

			describe('single call', function () {
				var sourceMap;
				beforeEach(function () {
					sourceMap = {
						'comp': 'xyz'
					};
					instance.registerSourceMap(sourceMap);
				});
				it('should set sourceMap', function () {
					should(instance.sourceMap).eql(sourceMap);
				});
			});

			describe('double call', function () {
				beforeEach(function () {
					instance.registerSourceMap({
						'comp': 'xyz'
					});
					instance.registerSourceMap({
						'widg': 'a1b2'
					});
				});
				it('should merge subsequent sourceMap values', function () {
					should(instance.sourceMap).eql({
						'comp': 'xyz',
						'widg': 'a1b2'
					});
				});
			});

			describe('to register partial', function () {
				beforeEach(function () {
					sinon.spy(instance.handlebars, 'registerPartial');
					instance.registerSourceMap({
						widget: 'button'
					});
				});
				afterEach(function () {
					instance.handlebars.registerPartial.restore();
				});
				it('should call handlebars.registerPartial', function () {
					should(instance.handlebars.registerPartial).be.calledWith('widget', 'button');
				});
			});

		});

		describe('.generatePageMap', function () {

			it('should initialize return empty object', function () {
				should(instance.generatePageMap()).eql({});
			});

			describe('for one page', function () {
				var pageMap;
				beforeEach(function () {
					sinon.spy(instance.handlebars, 'compile');
					instance.registerSourceMap({
						'foo': 'abc'
					});
					instance.registerPage('pfoo', 'foo', {});
					pageMap = instance.generatePageMap();
				});
				afterEach(function () {
					instance.handlebars.compile.restore();
				});
				it('should have the one page', function () {
					should(pageMap).eql({
						'pfoo': 'abc'
					});
				});
				it('should use handlebars', function () {
					should(instance.handlebars.compile).be.calledWith('abc');
				});
			});

			describe('for one page with data', function () {
				var pageMap;
				beforeEach(function () {
					instance.registerSourceMap({
						greeting: 'Hello, {{name}}.'
					});
					instance.registerPage('welcome', 'greeting', {name: 'Cir'});
					pageMap = instance.generatePageMap();
				});
				it('should have the one page', function () {
					should(pageMap['welcome']).be.ok();
				});
				it('should render the correct content', function () {
					should(pageMap['welcome']).equal('Hello, Cir.');
				});
			});

			describe('for two pages', function () {
				var pageMap;
				beforeEach(function () {
					instance.registerSourceMap({
						foo: 'abc',
						bar: 'zyx'
					});
					instance.registerPage('pfoo', 'foo');
					instance.registerPage('pbar', 'bar');
					pageMap = instance.generatePageMap();
				});
				it('should render both pages', function () {
					should(pageMap).eql({
						pfoo: 'abc',
						pbar: 'zyx'
					});
				});
			});

			describe('for one page including another', function () {
				beforeEach(function () {
					instance.registerSourceMap({
						'main': 'wotd: {{>word}}',
						'word': 'festivus'
					});
					instance.registerPage('presentation', 'main');
				});
				it('should render with partial', function () {
					should(instance.generatePageMap()).eql({
						'presentation': 'wotd: festivus'
					});
				});
			});

		});
	});

});