module.exports = function(grunt) {
	// Do grunt-related things in here
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
        'jshint': {
            'plugin':['src/js/jquery.slidemenu.js']
        },
        'jsbeautifier': {
            files: ['src/**','examples/**'],
            options: {
                indentWithTabs: true,
                css: {
                    fileTypes: [".less"]
                }
            }
        },
        'uglify': {
            base_plugin: {
                options:{
                    sourceMap:true,
                    preserveComments:false,
                    compress:{
                        unsafe:true
                    }
                },
                files: {
                   'dist/js/jquery.slidemenu.min.js':['src/js/jquery.slidemenu.js']
                }
            }
        },
		'less' : {
			development: {
				options: {
					paths:["src/less"]
				},
				files: {
					"dist/css/slidemenu.css":"src/less/slidemenu.less"
				}
			},
			production: {
				options: {
					paths:["src/less"],
					cleancss:true
				},
				files: {
					"dist/css/slidemenu.min.css":"src/less/slidemenu.less"
				}
			}
		},
		copy: {
			development: {
				files: [{
					cwd: 'src/js/',
					src: 'jquery.slidemenu.js',
					dest: 'dist/js/',
					expand: true
				}]
			},
			examples: {
				files: [{
					cwd: 'src/js/',
					src: 'jquery.slidemenu.js',
					dest: 'examples/',
					expand: true
				},{
					cwd: 'dist/css/',
					src: 'slidemenu.css',
					dest: 'examples/',
					expand: true
				}]
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jsbeautifier');
	grunt.registerTask('default',['jshint','jsbeautifier','uglify','less','copy']);
    grunt.registerTask('test', ['jshint','jsbeautifier','uglify','less']);
};