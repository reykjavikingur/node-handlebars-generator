class Tracer {

	constructor() {
		this.traces = [];
	}

	annotateSourceMap(sourceMap) {
		for (let path in sourceMap) {
			sourceMap[path] = annotate(path, sourceMap[path]);
		}
	}

	analyzePageMap(pageMap) {
		for (let path in pageMap) {
			var traces = analyze(pageMap[path]);
			for (let trace of traces) {
				this.traces.push(trace);
			}
		}
	}
}

function annotate(path, template) {
	return `<!-- BEGIN ${path} -->${template}<!-- END ${path} -->`
}

function analyze(page) {
	var pattern = /<!-- BEGIN (.+?) -->(.*?)<!-- END \1 -->/g;
	var sets = [];
	var matches;
	while (matches = pattern.exec(page)) {
		let set = {
			name: matches[1],
			output: matches[2],
		};
		sets.push(set);
		let subsets = analyze(set.output);
		for (let subset of subsets) {
			sets.push(subset);
		}
	}
	return sets;
}

module.exports = Tracer;
