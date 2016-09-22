var should = require('should');
var index = require('../');
var HandlebarsGenerator = require('../lib/handlebars-generator');

describe('index', function () {

	it('should be HandlebarsGenerator', function(){
		should(index).eql(HandlebarsGenerator);
	});

});