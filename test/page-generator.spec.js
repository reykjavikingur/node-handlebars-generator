var should = require('should');
var sinon = require('sinon');
var PageGenerator = require('../lib/page-generator');
var Handlebars = require('handlebars');

describe('PageGenerator', function () {

	it('should be a function', function () {
		should(PageGenerator).be.a.Function();
	});

	it('should instantiate with two arguments', function () {
		var instance = new PageGenerator(Handlebars.create(), {comp: 'foo'});
		should(instance).be.an.instanceOf(PageGenerator);
	});

	describe('instantiation', function () {
		var handlebars, instance;
		beforeEach(function () {
			handlebars = Handlebars.create();
			sinon.spy(handlebars, 'registerPartial');
			instance = new PageGenerator(handlebars, {comp: 'foo'});
		});
		it('should register partial', function () {
			sinon.assert.calledWith(handlebars.registerPartial, 'comp', 'foo');
		});

		describe('.render', function () {
			beforeEach(function () {
				sinon.spy(handlebars, 'compile');
				instance.render('page', 'comp', {});
			});
			it('should compile template', function () {
				sinon.assert.calledWith(handlebars.compile, 'foo');
			});
		});

	});

	describe('instance with assets', function () {

		var instance;

		beforeEach(function () {
			instance = new PageGenerator(Handlebars.create(), {
				'doc': 'Click {{asset "logo.png"}} to continue'
			});
		});

		it('should locate asset correctly in file at top level', function () {
			instance.render('file', 'doc', {});
			should(instance.pageMap['file']).equal('Click logo.png to continue');
		});

		it('should locate asset correctly in file within directory', function () {
			instance.render('dir/file', 'doc', {});
			should(instance.pageMap['dir/file']).equal('Click ../logo.png to continue');
		});

	});

});