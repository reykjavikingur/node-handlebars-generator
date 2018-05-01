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
			var traces = this.analyze(null, pageMap[path]);
			for (let trace of traces) {
				trace.output = this.deannotateString(trace.output);
				this.traces.push(trace);
			}
		}
		for (let path in pageMap) {
			pageMap[path] = this.deannotateString(pageMap[path]);
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

	deannotateString(string) {
		return string.replace(new RegExp(`<!-- \\S+ ${this.traceId} \\d+ \\S+ -->`, 'g'), '');
	}

	analyze(parent, output) {
		var pattern = new RegExp(`<!-- BEGIN ${this.traceId} (\\d+) (\\S+) -->([^]*?)<!-- END ${this.traceId} \\1 \\2 -->`, 'g');
		var sets = [];
		var matches;
		while (matches = pattern.exec(output)) {
			let set = {
				id: matches[1],
				name: matches[2],
				output: matches[3],
				parent: parent,
			};
			sets.push(set);
			let subsets = this.analyze(set.name, set.output);
			for (let subset of subsets) {
				sets.push(subset);
			}
		}
		return sets;
	}

}

module.exports = Tracer;
