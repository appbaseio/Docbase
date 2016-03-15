module.exports = function(grunt) {
	var srcPath = ["scripts/**/*.js"];
	var stylePath = ["styles/main.css", "styles/docs.css"];
	var testePath = "spec/*Spec.js";
	var libPaths = ['polyfills/polyfill.js', 'bower_components/jquery/dist/jquery.min.js', 'bower_components/flatdoc/legacy.js', 'bower_components/flatdoc/flatdoc.js', 'scripts/flatdoc-theme.js', 'bower_components/angular/angular.js', 'bower_components/angular-route/angular-route.js', 'bower_components/js-schema/js-schema.min.js', 'bower_components/google-code-prettify/bin/prettify.min.js', 'bower_components/bootstrap/dist/js/bootstrap.min.js'];
	grunt.initConfig({
		concat: {
			default: {
				options: {
					process: function(src, filepath) {
						return '\n' + '// FILE: ' + filepath + '\n' + src;
					}
				},
				src: srcPath,
				dest: 'dist/js/main.js',
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
					'dist/js/main.min.js': [srcPath]
				}
			},
			unicfile: {
				files: {
					'dist/js/main.unique.js': libPaths.concat([srcPath])
				}
			}
		},
		cssmin: {
			dev: {
				options: {
					report: "min"
				},
				src: stylePath,
				dest: "dist/css/main.min.css",
			}
		},
		jasmine: {
			pivotal: {
				src: [srcPath],
				options: {
					specs: testePath,
					helpers: 'spec/*Helper.js',
					vendor: libPaths,
					/*
										 template: require('grunt-template-jasmine-istanbul'),
										 templateOptions: {
												 coverage: 'bin/coverage/coverage.json',
												 report: 'bin/coverage',
												 thresholds: {// we will use this soon
														 lines: 100,
														 statements: 100,
														 branches: 100,
														 functions: 100
												 }
										 }*/
				}
			}
		},
		watch: {
			scripts: {
				files: [srcPath, testePath],
				tasks: ['jshint', 'uglify', 'concat', 'jasmine'],
				options: {
					spawn: false,
				},
			},
		},
		bump: {
			options: {
				files: ['bower.json'],
				commitFiles: ["-a"],
				push: false
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.registerTask('default', ['jshint', 'jasmine', 'concat:default', 'uglify', 'cssmin']);
};