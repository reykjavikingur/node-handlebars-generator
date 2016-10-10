// test every e2e case

var cp = require('child_process');
var execFileSync = cp.execFileSync;

runTest('basic');
runTest('tiered');

function runTest(path) {
	var dir = __dirname + '/' + path;
	execFileSync('rm', ['-rf', dir + '/dist']);
	execFileSync('node', [dir + '/index.js']);
	var diffError;
	try {
		execFileSync('/usr/bin/diff', ['-r', dir + '/expected', dir + '/dist'], {encoding:'utf8'});
	}
	catch (e) {
		diffError = e;
	}
	if (diffError) {
		console.error('differences detected in "' + path + '" case');
	}
	else {
		console.log('case "' + path + '" passed');
	}
}