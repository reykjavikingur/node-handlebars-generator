// run basic end-to-end test

var HandlebarsGenerator = require('../../');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src');

HandlebarsGenerator.registerPage('pfoo', 'foo', {});

HandlebarsGenerator.generatePages(__dirname + '/dist')
	.then(function (r) {
		console.log('generated pages');
	}, function (e) {
		console.error('failed to generate pages:', e);
	})
;
