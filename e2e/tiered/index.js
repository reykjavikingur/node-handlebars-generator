// run basic end-to-end test

var HandlebarsGenerator = require('../../');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/lib', {
	prefix: 'comps'
});

HandlebarsGenerator.registerPage('index', 'main', {});

HandlebarsGenerator.registerPage('help/faq', 'help/faq', {});

HandlebarsGenerator.generatePages(__dirname + '/dist')
	.then(function (r) {
		console.log('generated pages');
	}, function (e) {
		console.error('failed to generate pages:', e);
	})
;
