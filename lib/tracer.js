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
			var traces = analyze(path, pageMap[path]);
			for (let trace of traces) {
				this.traces.push(trace);
			}
		}
	}
}

function randomId() {
	return Math.floor(Math.random() * 1e9);
}

function annotate(path, template) {
	var id = randomId();
	return `<!-- BEGIN ${id} ${path} -->${template}<!-- END ${id} ${path} -->`;
}

function analyze(name, output) {
	var pattern = /<!-- BEGIN (\d+) (\S+) -->(.*?)<!-- END \1 \2 -->/g;
	var sets = [];
	var matches;
	while (matches = pattern.exec(output)) {
		let set = {
			id: matches[1],
			name: matches[2],
			output: matches[3],
		};
		sets.push(set);
		let subsets = analyze(set.name, set.output);
		for (let subset of subsets) {
			subset.parent = name;
			sets.push(subset);
		}
	}
	return sets;
}

module.exports = Tracer;
