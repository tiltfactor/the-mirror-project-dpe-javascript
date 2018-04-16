"use strict";

function LoadRender(){

    var self = this,
        selectedFiles = [];

    this.loadSequence = function(seqFile) {
        load(seqFile, true, function(data) {
            var evt = new CustomEvent('sequence-loaded', { detail : { sequence : data } });
            self.dispatchEvent(evt);
        }, function(err) { console.error(err); });
    };

    function load(path, isJSON, success, error){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState === XMLHttpRequest.DONE){
                if(xhr.status === 200) {
                    if(success && isJSON){
                        success(JSON.parse(xhr.responseText));
                    } else {
                        success(xhr.responseXML);
                    }
                } else {
                    if(error){
                        error(xhr);
                    }
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    }

    this.loadPoemSet = function(file1, file2) {
        loadPoem(file1, document.querySelector('.poem1'));
        loadPoem(file2, document.querySelector('.poem2'));
    }

    function loadPoem(file, container){
        load(file.path, false, function(data){
            var fileName = file.path.split('/').pop();
            renderPoem(data.firstChild, container);
            container.setAttribute('data-filename', fileName.replace('.xml', ''));
            self.dispatchEvent({type:'poem-loaded'});
        }, function(err){ console.error("Couldn't load" + err); });
    }

    function renderPoem(data, container){

        var lines = Utils.getChildren(data.childNodes),
            lineEl, original, tags;

        container.innerHTML = "";
        [].forEach.call(lines, function(line, index){
            original = line.getElementsByTagName('original')[0];
            tags = Utils.getChildren(line.getElementsByTagName('tags')[0].childNodes);
            lineEl = document.createElement('span');
            lineEl.classList.add('line');
            lineEl.textContent = original.textContent || "&nbsp;";
            container.appendChild(lineEl);

            renderLineTags(lineEl, tags);
        });

        return container;
    }

    function renderLineTags(lineEl, tags){
        var lineStr = lineEl.textContent,
            position = 0-lineStr.length;

        [].forEach.call(tags, function(tag){
            var replacement = '<span data-tag="'+tag.getAttribute('class')+'">$&</span>';
            var startStr = lineStr.substr(0, lineStr.length+position); // from start to position.
            var searchStr = lineStr.substr(position); // from position to end.

            var index = searchStr.indexOf(tag.textContent);
            lineStr = startStr + searchStr.replace(tag.textContent, replacement);

            position= 0-(searchStr.length-(index+tag.textContent.length));
        });

        lineEl.innerHTML = lineStr;
        lineEl.normalize();
    }

};

EventDispatcher.prototype.apply( LoadRender.prototype );
