# Handlebars Generator

This is a tool for developing modular static site generators that use Handlebars templates.

## Use Case

Add as a dependency to your Node package and create a script that does the following:

* register directories containing page templates or partial templates
* register pages in terms of path, template, and data
* specify destination directory where files will be generated from registered page template rendering output

## Example

```
var HandlebarsGenerator = require('handlebars-generator');

HandlebarsGenerator.registerSourceDirectory(__dirname + '/lib', {
    prefix: 'part',
    extension: 'hb'
});

HandlebarsGenerator.registerSourceDirectory(__dirname + '/src');

HandlebarsGenerator.registerPage('index', 'home', { title: 'Welcome' });

HandlebarsGenerator.generatePages(__dirname + '/dist', {
	extension: 'html'
}, function(err) {
	if (err) console.error(err.message);
});
```

This example Node script would read `src/home.html`, render it with the given data, and write `dist/index.html`,
registering partials for all files in `lib` with the extension `.hb`.

## Helpers

The `handlebars-generator` module is a singleton that uses the default `handlebars` instance.
So any helpers that you register with `handlebars` can be used in templates that `handlebars-generator` compiles.

The helper `asset` is defined when pages are generated
to generate the appropriate URL with a relative path
according to how each page is registered.

## Partials

The `handlebars-generator` module registers partials according to the relative paths to templates
in the source directory that you specify minus the ".html" extension.

For example, if `document.html` and `component.html` are both files in your source directory,
then `document.html` can use the Handlebars partial syntax `{{>component}}` to include `component.html`.

This convention applies recursively throughout the source directory.
In other words, if your source directory contains a file at the path `theme/navigation.html`,
then you can include it with the syntax `{{>theme/navigation}}`.

## API

### registerSourceDirectory(path, options)

* `path` {String} the name of the directory containing templates
* `options` {Object}
    * `extension` {String} the extension to assume on all template files (default: "html")
    * `prefix` {String} (optional) a namespace to prepend to the name of every template file to be registered as a partial

Registering a source directory is a convenience method to register partial templates in bulk.

For example, suppose you have a directory called `partials` containing a template file called `component.hb`.
Then, by registering that source directory, you can use the partial inclusion syntax,
`{{>component}}` to include `component.hb`.

### registerPage(filePath, templatePath, data)

* `filePath` {String} the path to the output file (without extension)
* `templatePath` {String} the path to the template in the registered source directory (without extension)
* `data` {Object} the data context with which to render the template

Registering a page means to designate that a particular template should be rendered with particular data
to generate a particular file in the eventual output directory.

### generatePages(directory, options, callback)

* `directory` {String} the path to the output directory, where template renderings will be written as files according to the page registrations
* `options` {Object}
    * `extension` {String} the file extension to give to output files (default: "html")
* `callback` {Function} the asynchronous callback function (Optional; returns promise if no callback is passed in)

Generating pages produces the files in the output directory based on the registered pages.
