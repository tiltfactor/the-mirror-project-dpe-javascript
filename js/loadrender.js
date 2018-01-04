"use strict";

function LoadRender(){

    var self = this,
        selectedFiles = [];

    this.loadAsync = function(){
        var files = [
            'data/pos_tags.json'
        ];

        files.forEach(function(path){
            load(path, true, function(data){
                window.options.postags = data;
            });
        });
    };

    this.loadLists = function(listFile1, listFile2){
        load(listFile1, true, function(data){
            renderFiles(data, document.querySelector('.choose .left'));
        },
        function(err){console.error("Couldn't load" + err)});

        load(listFile2, true, function(data){
            renderFiles(data, document.querySelector('.choose .right'));
        },
        function(err){console.error("Couldn't load" + err)});
    };

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

    function renderFiles(files, el){
        var docfrag = document.createDocumentFragment(),
            ul = document.createElement('ul');

        files.forEach(function(file){
            var li = document.createElement("li"),
                label = document.createElement("label"),
                cb = document.createElement("input");

            li.appendChild(label);
            label.textContent = file.filename;
            label.insertBefore(cb, label.firstChild);

            cb.type = "checkbox";
            cb.addEventListener("change", cbChangeHandler);
            cb.dataset.path = file.path;
            cb.dataset.directory = file.directory;
            cb.dataset.filename = file.filename;

            ul.appendChild(li);
        });

        docfrag.appendChild(ul);
        el.appendChild(docfrag);
    };

    function cbChangeHandler(e){
        var cb, inputs, chooseStart;

        cb = e.currentTarget;
        if(cb.checked){
            selectedFiles.push(cb);
            cb.parentNode.parentNode.classList.add('selected');
        } else {
            selectedFiles.forEach(function(selected, index){
                if(selected === cb){
                    selectedFiles.splice(index, 1);
                }
            });
            cb.parentNode.parentNode.classList.remove('selected');
        }

        chooseStart = document.querySelector('.choose-start button');
        if(selectedFiles.length >= 2){
            document.querySelector('.choose').classList.add('complete');
            inputs = document.querySelectorAll('.choose input[type="checkbox"]:not(:checked)');
            [].forEach.call(inputs, function(el) {
                el.disabled = "disabled";
            });
            chooseStart.disabled = false;
            chooseStart.addEventListener('click', startHandler);
        } else {
            document.querySelector('.choose').classList.remove('complete');
            inputs = document.querySelectorAll('.choose input[type="checkbox"]');
            [].forEach.call(inputs, function(el) {
                el.disabled = false;
            });
            chooseStart.disabled = "disabled";
            chooseStart.removeEventListener('click', startHandler);
        }
    }

    function startHandler(e){
        self.loadPoemSet(selectedFiles[0].dataset, selectedFiles[1].dataset);
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
