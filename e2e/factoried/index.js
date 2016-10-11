var HandlebarsGenerator = require('../../');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src');

HandlebarsGenerator.registerPageFactory(function (sourcePath) {
	if (sourcePath.indexOf('pages/') === 0) {
		return sourcePath.replace('pages/', '');
	}
});

HandlebarsGenerator.registerDataFactory(function (pagePath) {
	return {
		title: 'Wayward Site'
	};
});

HandlebarsGenerator.registerDataFactory(function (pagePath) {
	if (pagePath == 'foo') {
		return {
			f: 5
		};
	}
	else if (pagePath == 'bar') {
		return {
			b: 6
		};
	}
	else if (pagePath == 'baz') {
		return {
			title: 'Unknowable'
		};
	}
});

HandlebarsGenerator.generatePages(__dirname + '/dist')
	.then(function (r) {
		console.log('success');
	}, function (e) {
		console.error('failure:', e);
	});
