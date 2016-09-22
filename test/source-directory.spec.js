var should = require('should');
var sinon = require('sinon');
var SourceDirectory = require('../lib/source-directory');
var FileTree = require('web-template-file-tree');


describe('SourceDirectory', function () {

	it('should be a function', function () {
		should(SourceDirectory).be.a.Function();
	});

	it('should fail without arguments', function () {
		should(function () {
			new SourceDirectory();
		}).throw();
	});

	it('should instantiate with one argument', function () {
		should(new SourceDirectory('src')).be.an.instanceOf(SourceDirectory);
	});

	it('should instantiate with two arguments', function () {
		should(new SourceDirectory('src', {extension: 'hb', prefix: 'part'})).be.an.instanceOf(SourceDirectory);
	});

	describe('instance with default options', function () {
		var instance;
		beforeEach(function () {
			instance = new SourceDirectory('src');
		});
		it('should set path', function () {
			should(instance.path).equal('src');
		});
		it('should set default extention option', function () {
			should(instance.options.extension).equal('html');
		});
		it('should set default prefix option', function () {
			should(instance.options.prefix).not.be.ok();
		});
	});

	describe('instance with non-default options', function () {
		var instance;
		beforeEach(function () {
			instance = new SourceDirectory('src', {
				extension: 'hb',
				prefix: 'ns'
			});
		});
		it('should set extension option', function () {
			should(instance.options.extension).equal('hb');
		});
		it('should set prefix option', function () {
			should(instance.options.prefix).equal('ns');
		});
	});

	describe('.fileTree', function () {
		var instance;
		beforeEach(function () {
			instance = new SourceDirectory('src');
		});
		it('should set fileTree', function () {
			should(instance.fileTree).be.an.instanceOf(FileTree);
		});
	});

});