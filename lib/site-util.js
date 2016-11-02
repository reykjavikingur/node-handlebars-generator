var assert = require('assert');
var fs = require('fs');

function SiteUtil(options) {
	assert(options, 'requires options');
	assert(options.sourcePath, 'requires options.sourcePath');
	var sourcePath = fixPath(options.sourcePath);

	return {
		pageFactory: pageFactory,
		dataFactory: dataFactory,
		pageDataFactory: pageDataFactory,
		siteDataFactory: siteDataFactory
	};

	/**
	 * Identifies page templates according to whether there is a corresponding ".js" file for it
	 */
	function pageFactory(filePath) {
		var jsFilePath = sourcePath + '/' + filePath + '.js';
		if (fs.existsSync(jsFilePath)) {
			return filePath;
		}
	}

	/**
	 * Provides contextual data for every page.
	 */
	function dataFactory(outputFile) {
		return {
			pagePath: outputFile
		};
	}

	/**
	 * Provides the universal data for all pages.
	 */
	function siteDataFactory(outputFile) {
		// not using outputFile (yet) because "site data" is the same for every generated page (for now)
		return requireFile(sourcePath + '/index.js');
	}

	/**
	 * Provides the page specific data.
	 */
	function pageDataFactory(outputFile) {
		return requireFile(sourcePath + '/' + outputFile + '.js');
	}

}

function fixPath(path) {
	if (path.indexOf('/') === 0) {
		return path;
	}
	else {
		return './' + path;
	}
}

function requireFile(path) {
	var data;
	if (fs.existsSync(path)) {
		try {
			data = require(path);
		}
		catch (e) {
			console.error('unable to require path ' + path);
		}
	}
	return data;
}

module.exports = SiteUtil;