const should = require('should');
const Tracer = require('../lib/tracer');
const PageProcessor = require('../lib/page-processor');

describe.only('Tracer', () => {

	var tracer, pageProcessor;
	beforeEach(() => {
		tracer = new Tracer();
		pageProcessor = new PageProcessor();
	});

	it('should instantiate', () => {
		should(tracer).be.ok();
	});

	it('should initialize 0 traces', () => {
		should(tracer.traces).eql([]);
	});

	describe('given simple source map', () => {
		beforeEach(() => {
			var sourceMap, pageMap;
			sourceMap = {
				'index': 'Hello',
			};
			tracer.annotateSourceMap(sourceMap);
			pageProcessor.registerSourceMap(sourceMap);
			pageProcessor.registerPage('index', 'index', {});
			pageMap = pageProcessor.generatePageMap();
			tracer.analyzePageMap(pageMap);
		});

		it('should have 1 trace', () => {
			should(tracer.traces.length).eql(1);
		});

		describe('the trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces[0];
			});
			it('should have correct name', () => {
				should(trace.name).eql('index');
			});
			it('should have correct output', () => {
				should(trace.output).eql('Hello');
			});
		});

	});

	describe('given source map with one inclusion', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'Welcome to {{>widget}}.',
				'widget': 'the place',
			};
			tracer.annotateSourceMap(sourceMap);
			pageProcessor.registerSourceMap(sourceMap);
			pageProcessor.registerPage('index', 'index', {});
			var pageMap = pageProcessor.generatePageMap();
			tracer.analyzePageMap(pageMap);
		});

		it('should have 2 traces', () => {
			should(tracer.traces.length).eql(2);
		});

		describe('the index trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'index');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(deannotate(trace.output)).eql('Welcome to the place.');
			});
		});

		describe('the widget trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'widget');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('the place');
			});
		});

	});

	describe('given source map with page including two partials', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'List: (1) {{>foo}} (2) {{>bar}} (+)',
				'foo': 'First',
				'bar': 'Second',
			};
			tracer.annotateSourceMap(sourceMap);
			pageProcessor.registerSourceMap(sourceMap);
			pageProcessor.registerPage('index', 'index', {});
			var pageMap = pageProcessor.generatePageMap();
			tracer.analyzePageMap(pageMap);
		});
		it('should have 3 traces', () => {
			should(tracer.traces.length).eql(3);
		});
		describe('the index trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'index');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(deannotate(trace.output)).eql('List: (1) First (2) Second (+)');
			});
		});
		describe('the foo trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'foo');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('First');
			});
		});
		describe('the bar trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'bar');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('Second');
			});
		});
	});

});

function deannotate(output) {
	return String(output).replace(/<!--.*?-->/g, '');
}
