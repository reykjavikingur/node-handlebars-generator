class Tracer {

	constructor() {
		this.traces = [];
		this.traceId = this.randomId();
	}

	registerHelpers(Handlebars) {
		var self = this;
		Handlebars.registerHelper('annotate', function (options) {
			return new Handlebars.SafeString(
				self.annotateString(options.hash.name, options.fn(this))
			);
		});
	}

	annotateSourceMap(sourceMap) {
		for (let path in sourceMap) {
			sourceMap[path] = this.annotateTemplate(path, sourceMap[path]);
		}
	}

	analyzePageMap(pageMap) {
		for (let path in pageMap) {
			var traces = this.analyze(path, pageMap[path]);
			for (let trace of traces) {
				this.traces.push(trace);
			}
		}
	}

	// INTERNAL METHODS

	randomId() {
		return Math.floor(Math.random() * 1e9);
	}

	annotateTemplate(name, template) {
		return `{{#annotate name='${name}'}}${template}{{/annotate}}`;
	}

	annotateString(path, string) {
		var id = this.randomId();
		return `<!-- BEGIN ${this.traceId} ${id} ${path} -->${string}<!-- END ${this.traceId} ${id} ${path} -->`;
	}

	analyze(name, output) {
		var pattern = new RegExp(`<!-- BEGIN ${this.traceId} (\\d+) (\\S+) -->([^]*?)<!-- END ${this.traceId} \\1 \\2 -->`, 'g');
		var sets = [];
		var matches;
		while (matches = pattern.exec(output)) {
			let set = {
				id: matches[1],
				name: matches[2],
				output: matches[3],
			};
			sets.push(set);
			let subsets = this.analyze(set.name, set.output);
			for (let subset of subsets) {
				subset.parent = name;
				sets.push(subset);
			}
		}
		return sets;
	}

}

module.exports = Tracer;
