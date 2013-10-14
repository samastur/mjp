module.exports = function( grunt ) {
    "use strict";

    var gzip = require( "gzip-js" ),
        readOptionalJSON = function( filepath ) {
            var data = {};
            try {
                data = grunt.file.readJSON( filepath );
            } catch(e) {}
            return data;
        },
        srcHintOptions = readOptionalJSON( "src/.jshintrc" );

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        compare_size: {
            files: [ "dist/mjp.js", "dist/mjp.min.js" ],
            options: {
                compress: {
                    gz: function( contents ) {
                        return gzip.zip( contents, {} ).length;
                    }
                },
                cache: "dist/.sizecache.json"
            }
        },
        build: {
            all: {
                dest: "dist/mjp.js",
                minimum: [
                    "core"
                ]
            }
        },
        jshint: {
            src: {
                src: [ "src/*.js" ],
                options: {
                    jshintrc: "src/.jshintrc"
                }
            },
            dist: {
                src: [ "dist/mjp.js" ],
                options: srcHintOptions
            },
            grunt: {
                src: [ "Gruntfile.js", "build/tasks/*" ],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        },
        watch: {
            files: [ "src/**/*.js", "test/**/*.html" ],
            tasks: ["test"]
        },
        "pre-uglify": {
            all: {
                files: {
                    "dist/mjp.pre-min.js": [ "dist/mjp.js" ]
                },
                options: {
                    banner: "\n\n\n\n\n\n\n\n\n\n\n\n" + // banner line size must be preserved
                        "/*! mjp v<%= pkg.version %> | " +
                        "(c) 2013 mjp Marko Samastur */\n"
                }
            }
        },
        uglify: {
            all: {
                files: {
                    "dist/mjp.min.js": [ "dist/mjp.pre-min.js" ]
                },
                options: {
                    // Keep our hard-coded banner
                    preserveComments: "some",
                    sourceMap: "dist/mjp.min.map",
                    sourceMappingURL: "mjp.min.map",
                    report: "min",
                    beautify: {
                        ascii_only: true
                    },
                    compress: {
                        hoist_funs: false,
                        join_vars: false,
                        loops: false,
                        unused: false
                    }
                }
            }
        },
        "post-uglify": {
            all: {
                src: [ "dist/mjp.min.map" ],
                options: {
                    tempFiles: [ "dist/mjp.pre-min.js" ]
                }
            }
        },
        qunit: {
            all: ["tests/**/*.html"]
        }
    });

    // Load grunt tasks from NPM packages
    grunt.loadNpmTasks( "grunt-compare-size" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-qunit" );

    // Load custom tasks
    grunt.loadTasks( "build/tasks" );

    // Short list as a high frequency watch task
    grunt.registerTask( "dev", [ "build:*:*", "jshint" ] );

    // Test
    grunt.registerTask( "test", [ "jshint", "qunit" ] );

    // Default grunt
    grunt.registerTask( "default", [ "dev", "pre-uglify", "uglify", "post-uglify", "dist:*", "compare_size" ] );
};