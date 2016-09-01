# Handlebars Generator

The `handlebars-generator` module is a tool for developing static site generators that use Handlebars templates.

## Use Case

Add the module as a dependency to your Node package and create a script that does the following:

* specify source directory containing templates
* specify destination directory where files will be generated
* register pages in terms of path, template, and data

## Example

```
var HandlebarsGenerator = require('handlebars-generator');

HandlebarsGenerator.registerPage('index', 'home', { title: 'Welcome' });

HandlebarsGenerator.generate({
	src: 'templates',
	dest: 'html'
}, function(err) {
	if (err) console.error(err.message);
});
```

This example Node script would read `templates/home.html`, render it with the given data, and write `html/index.html`.

## Helpers

The `handlebars-generator` module is a singleton that uses the default `handlebars` instance.
So any helpers that you register with `handlebars` can be used in templates that `handlebars-generator` compiles.

## Partials

The `handlebars-generator` module registers partials according to the relative paths to templates
in the source directory that you specify minus the ".html" extension.

For example, if `document.html` and `component.html` are both files in your source directory,
then `document.html` can use the Handlebars partial syntax `{{>component}}` to include `component.html`.

This convention applies recursively throughout the source directory.
In other words, if your source directory contains a file at the path `theme/navigation.html`,
then you can include it with the syntax `{{>theme/navigation}}`.
