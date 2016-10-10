var should = require('should');
var sinon = require('sinon');
require('should-sinon');
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

	describe('.create', function () {
		it('should instantiate', function () {
			should(SourceDirectory.create('src')).eql(new SourceDirectory('src'));
		});
		it('should instantiate with options', function () {
			should(SourceDirectory.create('src', {
				extension: 'hb',
				prefix: 'comp'
			})).eql(new SourceDirectory('src', {extension: 'hb', prefix: 'comp'}));
		});
	});

	describe('.load', function () {

		var instance;

		beforeEach(function () {
			instance = new SourceDirectory('src');
		});

		describe('with fileTree failing', function () {
			beforeEach(function () {
				sinon.stub(instance.fileTree, 'load', function (cb) {
					cb(new Error('fake error'));
				});
			});
			afterEach(function () {
				instance.fileTree.load.restore();
			});
			it('should reject', function (done) {
				instance.load().then(function (r) {
					done(new Error('false positive'));
				}, function (e) {
					done();
				});
			});
		});

		describe('with fileTree succeeding', function () {
			beforeEach(function () {
				sinon.stub(instance.fileTree, 'load', function (cb) {
					this.cache = {};
					cb();
				});
			});
			afterEach(function () {
				instance.fileTree.load.restore();
			});
			it('should resolve', function (done) {
				instance.load().then(function (r) {
					done();
				}, function (e) {
					done(new Error('rejected'));
				});
			});
		});

		describe('with fileTree resolving to non-empty source map', function () {
			beforeEach(function () {
				sinon.stub(instance.fileTree, 'load', function (cb) {
					this.cache = {
						foo: 'abc',
						bar: 'xyz'
					};
					cb();
				});
			});
			afterEach(function () {
				instance.fileTree.load.restore();
			});
			describe('resolution', function () {
				var result;
				beforeEach(function (done) {
					instance.load().then(function (r) {
						result = r;
						done();
					}, function (e) {
						done(new Error('rejected'));
					});
				});
				it('should be correct value', function () {
					should(result).eql({
						foo: 'abc',
						bar: 'xyz'
					});
				});
			});
		});

	});

	describe('.load with prefix', function () {
		var instance;
		beforeEach(function () {
			instance = new SourceDirectory('src', {
				prefix: 'pq'
			});
		});
		describe('with fileTree passing source map', function () {
			beforeEach(function () {
				sinon.stub(instance.fileTree, 'load', function (cb) {
					this.cache = {
						foo: 'abc',
						bar: 'xyz'
					};
					cb();
				});
			});
			afterEach(function () {
				instance.fileTree.load.restore();
			});
			describe('resolution', function () {
				var result;
				beforeEach(function (done) {
					instance.load().then(function (r) {
						result = r;
						done();
					}, function (e) {
						done(new Error('rejected'));
					});
				});
				it('should have correct values', function () {
					should(result).eql({
						'pq/foo': 'abc',
						'pq/bar': 'xyz'
					});
				});
			});
		});
	});

});