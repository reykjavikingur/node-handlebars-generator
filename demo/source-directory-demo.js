var SourceDirectory = require('../lib/source-directory');

var sd = new SourceDirectory(__dirname + '/src', {
	extension: 'hb',
	prefix: 'comp'
});

sd.load().then(function (r) {
	console.log('loaded source directory: ', r);
}, function (e) {
	console.error('unable to load source directory: ', e);
});