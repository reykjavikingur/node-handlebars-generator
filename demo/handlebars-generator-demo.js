var HandlebarsGenerator = require('../lib/handlebars-generator');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src', {
	extension: 'hb',
	prefix: 'comp'
});

HandlebarsGenerator.registerSourceDirectory(__dirname + '/lib', {
	extension: 'hb'
});

HandlebarsGenerator.registerSourceDirectory(__dirname + '/pages', {
	extension: 'hb'
});

HandlebarsGenerator.registerPage('index', 'home', {title: 'Site'});

HandlebarsGenerator.generatePages(__dirname + '/dist', {
	extension: 'html'
}).then(function (r) {
	console.log('generated pages', r);
}, function (e) {
	console.error('unable to generate pages:', e);
});