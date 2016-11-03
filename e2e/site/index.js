// test generating site

var HandlebarsGenerator = require('../../');

HandlebarsGenerator.generateSite(__dirname + '/src', __dirname + '/dist')
	.then(function (r) {
		console.log('generated pages');
	}, function (e) {
		console.error('failed to generate pages:', e);
	})
;
