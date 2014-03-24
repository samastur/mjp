mjp
===

An opinionated Javascript micro library


How to build your own mjp
----------------------------

First, clone a copy of the main mjp git repo by running:

```bash
git clone git://github.com/samastur/mjp.git
```

Install the [grunt-cli](http://gruntjs.com/getting-started#installing-the-cli)
package if you haven't before. These should be done as global installs:

```bash
npm install -g grunt-cli
```

Also install phantomjs if you haven't yet (required only for running tests):

```bash
npm install -g phantomjs
```

Make sure you have `grunt` installed by testing:

```bash
grunt -version
```

Enter the mjp directory and install the Node dependencies, this time *without*
specifying a global(-g) install:

```bash
cd mjp && npm install
```

Then, to get a complete, minified (w/ Uglify.js), linted (w/ JSHint) version
of mjp, type the following:

```bash
grunt
```

The built version of mjp will be put in the `dist/` subdirectory, along with
the minified copy and associated map file.


Create the custom build, use the `grunt custom` option, listing the modules
to be excluded. Examples:

Exclude **ajax** functionality:

```bash
grunt custom:-ajax
```

Exclude more than one module:

```bash
grunt custom:-ajax,-deferred
```

Use +<module_name> if you want to add a module to build. Current modules are:
classes, events, deferred, ajax, ajaxplus. Or to include all:

```bash
grunt kitchensink
```
