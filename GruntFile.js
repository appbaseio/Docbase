module.exports = function(grunt) {
	var srcPath = "scripts/**/*.js"
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
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-docbase');
	grunt.loadNpmTasks('grunt-gh-pages');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
};