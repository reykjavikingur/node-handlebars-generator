var HandlebarsGenerator = require('../lib/handlebars-generator');

HandlebarsGenerator.registerAssetDirectory(__dirname + '/assets');

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

HandlebarsGenerator.registerPage('detail/about', 'about', {});

HandlebarsGenerator.generatePages(__dirname + '/dist', {
	extension: 'html'
}).then(function (r) {
	console.log('generated pages');
}, function (e) {
	console.error('unable to generate pages:', e);
});