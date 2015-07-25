module.exports = function(grunt) {
	grunt.initConfig({
		docbase: {
			def: {
				options: {
					generatePath: "dist/",
					baseUrl : "/Docbase/"
				}
			}
		},
		connect: {
			server: {
				options: {
					port: 9001,
					base: './'
				}
			}
		},
		'gh-pages': {
			options: {
				base: 'dist'
			},
			src: ['**']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-docbase');
	grunt.loadNpmTasks('grunt-gh-pages');
	//grunt.loadTasks('node_modules/grunt-docbase/tasks');
	// Default task.
	grunt.registerTask('default', ['connect', 'docbase']);
};