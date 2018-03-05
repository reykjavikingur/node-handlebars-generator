var should = require('should');
var sinon = require('sinon');
require('should-sinon');
var HandlebarsGenerator = require('../lib/handlebars-generator');
var Handlebars = require('handlebars');
var SourceDirectory = require('../lib/source-directory');
var Promise = require('promise');

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

        describe('.registerPage', function () {
            beforeEach(function () {
                sinon.spy(handlebarsGenerator.pageProcessor, 'registerPage');
            });
            afterEach(function () {
                handlebarsGenerator.pageProcessor.registerPage.restore();
            });
            it('should register page with page processor', function () {
                handlebarsGenerator.registerPage('index', 'home', {title: 'Welcome'});
                should(handlebarsGenerator.pageProcessor.registerPage).be.calledWith('index', 'home', {title: 'Welcome'});
            });
        });

        describe('.registerSourceDirectory', function () {
            beforeEach(function () {
                sinon.stub(SourceDirectory, 'create', function () {
                    return {
                        load: function () {
                            return Promise.resolve({
                                foo: 'abc'
                            });
                        }
                    };
                });
            });
            afterEach(function () {
                SourceDirectory.create.restore();
            });
            describe('invocation', function () {
                beforeEach(function (done) {
                    sinon.stub(handlebarsGenerator.pageProcessor, 'registerSourceMap');
                    handlebarsGenerator.registerSourceDirectory('src');
                    setTimeout(done);
                });
                afterEach(function () {
                    handlebarsGenerator.pageProcessor.registerSourceMap.restore();
                });
                it('should create source directory', function () {
                    should(SourceDirectory.create).be.calledWith('src');
                });
                it('should register source map with page processor', function () {
                    should(handlebarsGenerator.pageProcessor.registerSourceMap).be.calledWith({
                        foo: 'abc'
                    });
                });
                it('should add one source promise', function () {
                    should(handlebarsGenerator.sourcePromises.length).eql(1);
                });
            });

        });

        describe('.registerPageFactory', function () {
            var pageFactory;
            beforeEach(function () {
                pageFactory = function () {
                };
                sinon.spy(handlebarsGenerator.pageProcessor, 'registerPageFactory');
                handlebarsGenerator.registerPageFactory(pageFactory);
            });
            afterEach(function () {
                handlebarsGenerator.pageProcessor.registerPageFactory.restore();
            });
            it('should call pageProcessor.registerPageFactory', function () {
                should(handlebarsGenerator.pageProcessor.registerPageFactory).be.calledWith(pageFactory);
            });
        });

        describe('.registerDataFactory', function () {
            var dataFactory;
            beforeEach(function () {
                dataFactory = function () {
                };
                sinon.spy(handlebarsGenerator.pageProcessor, 'registerDataFactory');
                handlebarsGenerator.registerDataFactory(dataFactory);
            });
            afterEach(function () {
                handlebarsGenerator.pageProcessor.registerDataFactory.restore();
            });
            it('should call pageProcessor.registerDataFactory', function () {
                should(handlebarsGenerator.pageProcessor.registerDataFactory).be.calledWith(dataFactory);
            });
        });

        describe('.generatePages', function () {

            describe('without any registrations', function () {
                var promise;
                beforeEach(function (done) {
                    promise = handlebarsGenerator.generatePages('dist');
                    setTimeout(done);
                });
                it('should return something', function () {
                    should(promise).be.ok();
                });
                it('should resolve', function (done) {
                    promise.then(function (r) {
                        done();
                    }, function (e) {
                        done(new Error('rejected'));
                    });
                });
            });

            describe('with one source directory and one page', function () {
                beforeEach(function () {
                    sinon.stub(SourceDirectory, 'create', function () {
                        return {
                            load: function () {
                                return Promise.resolve({
                                    foo: 'abc'
                                });
                            }
                        };
                    });

                    handlebarsGenerator.registerSourceDirectory('src');
                    handlebarsGenerator.registerPage('pfoo', 'foo');
                });
                afterEach(function () {
                    SourceDirectory.create.restore();
                });

                describe('invocation', function () {
                    var promise;
                    beforeEach(function (done) {
                        sinon.spy(handlebarsGenerator.pageProcessor, 'generatePageMap');
                        sinon.spy(handlebarsGenerator.destinationDirectory, 'registerPageMap');
                        sinon.stub(handlebarsGenerator.destinationDirectory, 'save', function () {
                            return Promise.resolve({});
                        });
                        promise = handlebarsGenerator.generatePages('dist');
                        setTimeout(done);
                    });
                    afterEach(function () {
                        handlebarsGenerator.pageProcessor.generatePageMap.restore();
                        handlebarsGenerator.destinationDirectory.registerPageMap.restore();
                        handlebarsGenerator.destinationDirectory.save.restore();
                    });
                    it('should return promise', function () {
                        should(promise).be.ok();
                    });
                    it('should resolve', function (done) {
                        promise.then(function (r) {
                            done();
                        }, function (e) {
                            done(new Error('rejected'));
                        });
                    });
                    it('should call pageProcessor.generatePageMap', function () {
                        should(handlebarsGenerator.pageProcessor.generatePageMap).be.called();
                    });
                    it('should call destinationDirectory.registerPageMap', function () {
                        should(handlebarsGenerator.destinationDirectory.registerPageMap).be.calledWith({
                            pfoo: 'abc'
                        });
                    });
                    it('should call destinationDirectory.save', function () {
                        should(handlebarsGenerator.destinationDirectory.save).be.calledWith('dist', {
                            extension: undefined
                        });
                    });
                });
            });

        });

        describe('.generateSite', function () {
            describe('call with non-default options', function () {
                beforeEach(function () {
                    sinon.spy(handlebarsGenerator, 'registerSourceDirectory');
                    sinon.spy(handlebarsGenerator, 'generatePages');
                    var options = {sourceExtension: 'hbs', distExtension: 'php'};
                    handlebarsGenerator.generateSite('source', 'dist', options);
                });
                afterEach(function () {
                    handlebarsGenerator.sourcePromises = [];
                });
                it('should set source extension to hbs', function () {
                    should(handlebarsGenerator.registerSourceDirectory).be.calledWith('source', {extension: 'hbs'});
                });
                it('should set dist extension to php', function () {
                    should(handlebarsGenerator.generatePages).be.calledWith('dist', {extension: 'php'});
                });
            });
        });

    });

});