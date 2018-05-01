const should = require('should');
const Tracer = require('../lib/tracer');
const PageProcessor = require('../lib/page-processor');
const Handlebars = require('handlebars');

describe('Tracer', () => {

	var tracer, pageProcessor;
	beforeEach(() => {
		tracer = new Tracer();
		pageProcessor = new PageProcessor();
		tracer.registerHelpers(Handlebars);
	});

	it('should instantiate', () => {
		should(tracer).be.ok();
	});

	it('should initialize 0 traces', () => {
		should(tracer.traces).eql([]);
	});

	describe('annotate helper', () => {
		it('should work properly', () => {
			var template = '{{#annotate name="index"}}<div>content</div>{{/annotate}}';
			var output = Handlebars.compile(template)({});
			should(output).match(/<!-- BEGIN (\d+) (\d+) index --><div>content<\/div><!-- END \1 \2 index -->/);
		});
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
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
			});
		});

	});

	describe('given simple source map with line break', () => {
		beforeEach(() => {
			var sourceMap, pageMap;
			sourceMap = {
				'index': 'Hello\nworld.',
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
				should(trace.output).eql('Hello\nworld.');
			});
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
			});
		});

	});

	describe('given source map with one inclusion', () => {
		var sourceMap, pageMap;
		beforeEach(() => {
			sourceMap = {
				'index': 'Welcome to {{>widget}}.',
				'widget': 'the place',
			};
			tracer.annotateSourceMap(sourceMap);
			pageProcessor.registerSourceMap(sourceMap);
			pageProcessor.registerPage('index', 'index', {});
			pageMap = pageProcessor.generatePageMap();
			tracer.analyzePageMap(pageMap);
		});

		it('should have 2 traces', () => {
			should(tracer.traces.length).eql(2);
		});

		it('should remove annotations from page map', () => {
			should(pageMap.index).eql('Welcome to the place.');
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
				should(trace.output).eql('Welcome to the place.');
			});
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
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
			it('should have correct parent', () => {
				should(trace.parent).eql('index');
			});
		});

	});

	describe('given source map with one inclusion having complex name', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'Welcome to {{>par_dir/spec-widget}}.',
				'par_dir/spec-widget': 'the place',
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
				should(trace.output).eql('Welcome to the place.');
			});
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
			});
		});

		describe('the widget trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'par_dir/spec-widget');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('the place');
			});
			it('should have correct parent', () => {
				should(trace.parent).eql('index');
			});
		});

	});

	describe('given source map with page including two different partials', () => {
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
				should(trace.output).eql('List: (1) First (2) Second (+)');
			});
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
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
			it('should have correct parent', () => {
				should(trace.parent).eql('index');
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
			it('should have correct parent', () => {
				should(trace.parent).eql('index');
			});
		});
	});

	describe('given source map with page including two of same partial', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'Example {{>widget}}, {{>widget}}',
				'widget': 'Blank',
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
				should(trace.output).eql('Example Blank, Blank');
			});
			it('should have no parent', () => {
				should(trace.parent).not.be.ok();
			});
		});
		describe('the widget traces', () => {
			var traces;
			beforeEach(() => {
				traces = tracer.traces.filter(trace => trace.name === 'widget');
			});
			it('should have length 2', () => {
				should(traces.length).eql(2);
			});
		});
	});

	describe('given source map with page including two of same partial with dynamic differences', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'Example {{>widget 101}}, {{>widget 201}}',
				'widget': 'Number {{this}}',
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
				should(trace.output).eql('Example Number 101, Number 201');
			});
		});
		describe('the widget traces', () => {
			var traces;
			beforeEach(() => {
				traces = tracer.traces.filter(trace => trace.name === 'widget');
			});
			it('should have length 2', () => {
				should(traces.length).eql(2);
			});
			it('should have correct first output', () => {
				should(traces[0].output).eql('Number 101');
			});
			it('should have correct second output', () => {
				should(traces[1].output).eql('Number 201');
			});
			it('should have correct first parent', () => {
				should(traces[0].parent).eql('index');
			});
			it('should have correct second parent', () => {
				should(traces[1].parent).eql('index');
			});

		});
	});

	describe('given source map with more than one inclusion level', () => {
		beforeEach(() => {
			var sourceMap = {
				'index': 'Site {{>header}} (c)',
				'header': 'Head {{>logo}} Er',
				'logo': 'Logo',
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
				should(trace.output).eql('Site Head Logo Er (c)');
			});
			it('should not have parent', () => {
				should(trace.parent).not.be.ok();
			});
		});
		describe('the header trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'header');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('Head Logo Er');
			});
			it('should have correct parent', () => {
				should(trace.parent).eql('index');
			});
		});
		describe('the logo trace', () => {
			var trace;
			beforeEach(() => {
				trace = tracer.traces.find(trace => trace.name === 'logo');
			});
			it('should exist', () => {
				should(trace).be.ok();
			});
			it('should have correct output', () => {
				should(trace.output).eql('Logo');
			});
			it('should have correct parent', () => {
				should(trace.parent).eql('header');
			});
		});
	});

	describe('source map with recursion', () => {
		beforeEach(() => {
			var sourceMap = {
				'list': '{{#each this}}{{#if this.items}}({{>list this.items}}){{else}}:{{this}}{{/if}}{{/each}}',
				'index': 'start {{>list stuff}} over',
			};
			tracer.annotateSourceMap(sourceMap);
			pageProcessor.registerSourceMap(sourceMap);
			pageProcessor.registerPage('index', 'index', {
				stuff: [
					'foo',
					'bar',
					{
						items: ['baz', 'quux']
					},
					'corge'
				]
			});
			var pageMap = pageProcessor.generatePageMap();
			tracer.analyzePageMap(pageMap);
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
				should(trace.output).eql('start :foo:bar(:baz:quux):corge over');
			});
			it('should not have parent', () => {
				should(trace.parent).not.be.ok();
			});
		});
		describe('the list traces', () => {
			var traces;
			beforeEach(() => {
				traces = tracer.traces.filter(trace => trace.name === 'list');
			});
			it('should have length 2', () => {
				should(traces.length).eql(2);
			});
			describe('the first list trace', () => {
				var trace;
				beforeEach(() => {
					trace = traces[0];
				});
				it('should have correct output', () => {
					should(trace.output).eql(':foo:bar(:baz:quux):corge');
				});
				it('should have correct parent', () => {
					should(trace.parent).eql('index');
				});
			});
			describe('the second list trace', () => {
				var trace;
				beforeEach(() => {
					trace = traces[1];
				});
				it('should have correct output', () => {
					should(trace.output).eql(':baz:quux');
				});
				it('should have correct parent', () => {
					should(trace.parent).eql('list');
				});
			});
		});
	});

});
