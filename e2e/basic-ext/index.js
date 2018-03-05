// run basic end-to-end test

var HandlebarsGenerator = require('../../');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src', {
    extension: 'hbs'
});

HandlebarsGenerator.registerPage('pfoo', 'foo', {});

HandlebarsGenerator.generatePages(__dirname + '/dist', {extension: 'php'})
    .then(function (r) {
        console.log('generated pages');
    }, function (e) {
        console.error('failed to generate pages:', e);
    })
;
