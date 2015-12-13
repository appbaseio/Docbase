module.exports = function(grunt) {
	var srcPath = "scripts/**/*.js"
	var testePath = "spec/*Spec.js";
	var libPaths = ['bower_components/jquery/dist/jquery.min.js', 'bower_components/flatdoc/legacy.js' ,'bower_components/flatdoc/flatdoc.js', 'scripts/flatdoc-theme.js', 'bower_components/angular/angular.js', 'bower_components/angular-route/angular-route.js', 'bower_components/js-schema/js-schema.min.js', 'bower_components/google-code-prettify/bin/prettify.min.js', 'bower_components/bootstrap/dist/js/bootstrap.min.js']
	grunt.initConfig({
		concat: {
			default: {
				options: {
					process: function(src, filepath) {
						return '\n' + '// FILE: ' + filepath + '\n' + src;
					}
				},
				src: [srcPath],
				dest: 'dist/main.js',
			},
			uniqueFile: {
				options: {
					process: function(src, filepath) {
						return '\n' + '// FILE: ' + filepath + '\n' + src;
					}
				},
				src: libPaths.concat([srcPath]),
				dest: 'dist/main.unique.js',
			}
		},
		jshint: {
			all: ['Gruntfile.js', srcPath]
		},
		uglify: {
			options: {
				mangle: false,
				compress: false,
				report: 'min',
				// the banner is inserted at the top of the output
				banner: '/*! <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/main.min.js': [srcPath]
				}
			}
		},
		jasmine: {
	     pivotal: {
	       src: [srcPath],
	       options: {
	         specs: testePath,
	         helpers: 'spec/*Helper.js',
					vendor : libPaths,
					 template: require('grunt-template-jasmine-istanbul'),
					 templateOptions: {
							 coverage: 'bin/coverage/coverage.json',
							 report: 'bin/coverage',
							 /*thresholds: {// we will use this soon
									 lines: 75,
									 statements: 75,
									 branches: 75,
									 functions: 90
							 }*/
					 }
	       }
	     }
	  },
		watch: {
			scripts: {
				files: [srcPath, testePath],
				tasks: ['jshint', 'uglify', 'concat','jasmine' ],
				options: {
					spawn: false,
				},
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.registerTask('default', ['jshint', 'jasmine', 'concat:default', 'uglify']);
};
