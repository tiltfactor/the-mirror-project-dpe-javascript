var gulp = require('gulp');
var fs = require('fs');
var glob = require('glob');
var path = require('path');

var writeDirectoryContent = function(directory){
    glob(directory+'/*.xml', function(er, files){

        var all = [];
        for(var i = 0, len = files.length; i < len; i++){ 
            all.push({
                path        : path.normalize(files[i]),
                filename    : path.basename(files[i]),
                directory   : path.dirname(files[i])
            });
        }

        fs.writeFile(directory+'/content.json', JSON.stringify(all), function(err){
            if(err)throw err;
            console.log('It\'s saved!');
        });
    });
};

writeDirectoryContent('./data/flanagan/');
writeDirectoryContent('./data/dickinson/');
