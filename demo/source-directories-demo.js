var SourceDirectory = require('../lib/source-directory');

var sd1 = new SourceDirectory(__dirname + '/lib', {
	extension: 'hb',
	prefix: 'components'
});

var sd2 = new SourceDirectory(__dirname + '/src', {
	extension: 'hb',
	prefix: 'partials'
});

SourceDirectory.loadAll([sd1, sd2])
	.then(function (r) {
		console.log('loaded all source directories:', r);
	}, function (e) {
		console.error('unable to load:', e);
	});