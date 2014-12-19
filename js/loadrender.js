"use strict";

function LoadRender(){

    var self = this, 
        selectedFiles = [];

    this.force = function(file1, file2){
        file1 = {fullpath:file1 || 'data/flanagan/Insist__________repeat_.xml'};
        file2 = {fullpath:file2 || 'data/dickinson/OneSeries-IX.xml'};
        start(file1, file2);
    };

    this.init = function(content1, content2){

        load('./data/flanagan/content.json', true, function(data){
            renderFiles(data, document.querySelector('.choose .left'));
        }, 
        function(err){console.error("Couldn't load" + err)});

        load('./data/dickinson/content.json', true, function(data){
            renderFiles(data, document.querySelector('.choose .right'));
        }, 
        function(err){console.error("Couldn't load" + err)});

    }

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
            cb.dataset.fullpath = file.path;
            cb.dataset.directory = file.directory;
            cb.dataset.filename = file.filename;

            ul.appendChild(li);
        });

        docfrag.appendChild(ul);
        el.appendChild(docfrag);

        Utils.centreColumnContent(ul);
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
        start(selectedFiles[0].dataset, selectedFiles[1].dataset);
    }

    function start(file1, file2){

        var rendered = [];

        document.querySelector('.choose').style.display = 'none';
        document.querySelector('.world').style.display = 'block';

        load(file1.fullpath, false, function(data){
            self.poem1 = renderPoem(data.firstChild, true);
            rendered.push(true);
            if(rendered.length >= 2){
                self.dispatchEvent({type:'rendered'});
            }
        }, 
        function(err){console.error("Couldn't load" + err)});

        load(file2.fullpath, false, function(data){
            self.poem2 = renderPoem(data.firstChild, false);
            rendered.push(true);
            if(rendered.length >= 2){
                self.dispatchEvent({type:'rendered', files: [file1, file2]});
            }
        }, 
        function(err){console.error("Couldn't load" + err)});
    }

    function renderPoem(output, isLeft){

        var container = document.querySelector((isLeft)?'.poem1':'.poem2'),
            lines = Utils.getChildren(output.childNodes),
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

        Utils.centreColumnContent(container);

        return container;
    }

    function renderLineTags(lineEl, tags){
        var lineStr = lineEl.textContent,
            position = 0-lineStr.length;

        [].forEach.call(tags, function(tag){
            var replacement = '<span data-tag="'+tag.getAttribute('class')+'">$&</span>';
            var startStr = lineStr.substr(0, lineStr.length+position); // from start to position.
            var searchStr = lineStr.substr(position); // from position to end.
            //console.log(searchStr, position, lineStr.length+position);
            
            var index = searchStr.indexOf(tag.textContent);
            lineStr = startStr + searchStr.replace(tag.textContent, replacement);

            position= 0-(searchStr.length-(index+tag.textContent.length));

            /*
            console.log("<====");
            console.log(lineStr);
            console.log(startStr, 0, lineStr.length+position);
            console.log(searchStr, position);
            console.log("====>");
            */

        });

        lineEl.innerHTML = lineStr;
        lineEl.normalize();
    }

};

EventDispatcher.prototype.apply( LoadRender.prototype );
