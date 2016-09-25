var AssetDirectory = require('../lib/asset-directory');

var ad = new AssetDirectory(__dirname + '/assets');

ad.save(__dirname + '/dist')
	.then(function (r) {
		console.log('completed copying asset directory')
	}, function (e) {
		console.error('unable to copy asset directory', e);
	});