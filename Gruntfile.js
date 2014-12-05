module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            main : {
                options: {
                    port : 8000,
                    hostname : '0.0.0.0'
                },
                proxies: [
                    {
                        context: '/',
                        host: '0.0.0.0',
                        port: 8888,
                        https: false,
                        changeOrigin: false,
                        xforward: false
                    }
                ]
            }
        }
    });

    grunt.registerTask('default', ['connect:main:keepalive']);
};
