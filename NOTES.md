2016-10-09

Refactoring to separate processing into three distinct phases:

* reading input
* processing synchronously in memory
* write output

This will make automated testing easier.

The input phase will still involve SourceDirectory,
but it will convert directories on the file system
to source maps -- objects whose keys are the paths
and whose values are the contents.

The output phase will involve DestinationDirectory,
which takes a page map (objects mapping path strings to values).
Just as SourceDirectory uses web-template-file-tree for input,
DestinationDirectory will use it for output.

The intermediate processing phase will be the main subject under testing.

# PageProcessor

* registerSourceMap(sourceMap)
* registerPage(outputPath, inputPath, data)
* generatePageMap()
