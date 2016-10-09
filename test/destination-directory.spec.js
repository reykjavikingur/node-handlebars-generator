var should = require('should');
var sinon = require('sinon');
var Promise = require('promise');
require('should-sinon');
var FileTree = require('web-template-file-tree');

var DestinationDirectory = require('../lib/destination-directory');

describe('DestinationDirectory', function () {

	it('should be defined', function () {
		should(DestinationDirectory).be.ok();
	});

	it('should be a function', function () {
		should(DestinationDirectory).be.a.Function();
	});

	describe('.save', function () {

		var fileTree;

		beforeEach(function () {
			fileTree = {};
		});

		describe('resolution', function () {
			var promise;
			beforeEach(function () {
				fileTree.save = sinon.stub().callsArgWith(0, null);
				promise = DestinationDirectory.save(fileTree);
			});

			it('should return something', function () {
				should(promise).be.ok();
			});

			it('should call fileTree.save', function () {
				should(fileTree.save).be.called();
			});

			it('should resolve', function (done) {
				promise.then(function (r) {
					done();
				}, function (e) {
					done(e);
				});
			});

		});

		describe('rejection', function () {
			var promise;
			beforeEach(function () {
				fileTree.save = sinon.stub().callsArgWith(0, new Error('fake error'));
				promise = DestinationDirectory.save(fileTree);
			});
			it('should reject', function (done) {
				promise.then(function (r) {
					done(new Error('false positive'));
				}, function (e) {
					done();
				});
			});
		});

	});

	describe('instantiation', function () {

		var instance;

		beforeEach(function () {
			instance = new DestinationDirectory();
		});

		it('should be an instance of the constructor', function () {
			should(instance).be.an.instanceOf(DestinationDirectory);
		});

		describe('.registerPageMap', function () {

			var pageMap;

			beforeEach(function () {
				pageMap = {
					'pfoo': 'abc'
				};
				instance.registerPageMap(pageMap);
			});

			it('should set pageMap property', function () {
				should(instance.pageMap).eql(pageMap);
			});

			describe('.save', function () {

				var promise;

				beforeEach(function () {
					sinon.stub(DestinationDirectory, 'save').returns({});
					promise = instance.save('fake-dist', {});
				});
				afterEach(function () {
					DestinationDirectory.save.restore();
				});

				it('should return promise', function () {
					should(promise).be.ok();
				});

				it('should call static method', function () {
					should(DestinationDirectory.save).be.called();
				});

				it('should pass fileTree to static method', function () {
					var fileTree = new FileTree('fake-dist', {});
					fileTree.cache = pageMap;
					should(DestinationDirectory.save).be.calledWith(fileTree);
				});

			});

			describe('.save failure', function () {

				var promise;

				beforeEach(function () {
					sinon.stub(DestinationDirectory, 'save').returns(Promise.reject(new Error('fake error')));
					promise = instance.save('fake-dist', {});
				});
				afterEach(function () {
					DestinationDirectory.save.restore();
				});

				it('should return promise', function () {
					should(promise).be.ok();
				});
				it('should reject', function (done) {
					promise.then(function (r) {
						done(new Error('false positive'));
					}, function (e) {
						done();
					});
				});
			});

			describe('.save success', function(){

				var promise;

				beforeEach(function () {
					sinon.stub(DestinationDirectory, 'save').returns(Promise.resolve({}));
					promise = instance.save('fake-dist', {});
				});
				afterEach(function () {
					DestinationDirectory.save.restore();
				});

				it('should return promise', function () {
					should(promise).be.ok();
				});
				it('should resolve', function (done) {
					promise.then(function (r) {
						done();
					}, function (e) {
						done(e);
					});
				});
			});

		});

	});

});