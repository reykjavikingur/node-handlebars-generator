# Handlebars Generator

This is a tool for developing modular static site generators that use Handlebars templates.

## Use Case

Add as a dependency to your Node package and create a script that does the following:

* read Handlebars templates in a source directory
* generate data by executing scripts in the source directory
* render the templates with the respective data
* include partials referenced by paths relative to the source directory
* write document files to a destination directory


## Example

```
var HandlebarsGenerator = require('handlebars-generator');

HandlebarsGenerator.generateSite('src', 'dist')
	.then(function () {
		console.log('successfully generated pages');
	}, function (e) {
		console.error('failed to generate pages', e);
	})
;
```

This example Node script would:
 
* read every file in `src` with an extension ".html"
* register each as a partial template (which can be included by other templates)
* register a page template for each case where there is a corresponding ".js" file
* render each page template with the data exported by the ".js" file
* write a corresponding file in `dist`

Suppose the "src" directory contains the following files: component.html, index.html, index.js, faq.html, faq.js

Then the code above would generate a "dist" directory with the following files: index.html, faq.html

The file "dist/index.html" would have been generated from the template "src/index.html" with the data exported by "src/index.js".

The file "dist/faq.html" would have been generated from the template "src/faq.html" with the data exported by "src/index.js" and "src/faq.js".

NOTE: The "index.js" file in the source directory is considered site-wide data that every page template has access to but individual page data scripts can override.

The file "src/component.html" would not be compiled to any file in "dist" because it has no corresponding script file. However, any template can reference the partial `{{>component}}`.


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

### generateSite(sourcePath, distPath, [options], [callback])

* `sourcePath` {String} the path of the directory containing templates
* `distPath` {String} the path of the output directory, where page templates will be rendered as files
* `options` {Object} (optional)
    * `sourceExtension` {String} (default: "html") the file extension for templates (source files)
    * `distExtension` {String} (default: "html") the file extension for pages (output files)
* `callback` {Function} (optional) the asynchronous callback function (returns promise if not given)

Generating a site means rendering page templates in a source directory and writing page output to files in a destination directory:

* Put template files in the source directory.
* Every template will be registered as a partial.
* Make a template be registered as a page template by creating a corresponding ".js" file.
    * For example, suppose your source directory is "./src", and a file exists in the path "./src/faq.html":
    * Create "./src/faq.js" that exports data (an Object).
    * The existence of the "js" file will the template to be registered as a page and rendered with the data that it exports.
* Every page template in the source directory will be written to the same relative path in the destination directory.
* Global data (available to every page) is whatever is exported by "./src/index.js" (assuming "./src" is your source path)
* Global data also includes a variable called "pagePath" whose value is the relative path of the current page template being rendered.


## Lower-Level API

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

### registerPageFactory(pageFactory)

* `pageFactory` {Function} given a source path, should give a corresponding page path, if any

You can register pages in bulk by providing a function that maps source paths to page paths,
that is, indicates what pages should be registered for which of the source paths.

### registerDataFactory(dataFactory)

* `dataFactory` {Function} given a page path, should give an object (if any) to be combined with the data specifically registered to the page (if any)

Data factories allow bulk association of data to pages, in addition to page-specific registrations.

### generatePages(directory, options, callback)

* `directory` {String} the path to the output directory, where template renderings will be written as files according to the page registrations
* `options` {Object}
    * `extension` {String} the file extension to give to output files (default: "html")
* `callback` {Function} the asynchronous callback function (Optional; returns promise if no callback is passed in)

Generating pages produces the files in the output directory based on the registered pages.

### Example

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
