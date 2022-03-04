"use strict";

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

window.logStart = Date.now();
function log() {
    if (window.settings.loggingEnabled && window.console && window.console.log) {
        Function.prototype.bind.call(window.console.log, (window.console)).apply(window.console, [(Date.now() - window.logStart) + "ms", "dpe:"].concat([].slice.call(arguments, 0)));
    }
}

var Utils = Utils || {
    duplicate : function(el){
        // Duplicate outer node to retain attributes. Then empty.
        var dup = el.cloneNode();
        while(dup.firstChild){
            dup.removeChild(dup.firstChild);
        }
        // Surround each letter with span for animation.
        var str = el.textContent;
        for (var i = 0, len = str.length; i < len; i++) {
            var lSpan = document.createElement('span');
            var l = document.createTextNode(str[i]);
            lSpan.appendChild(l);
            dup.appendChild(lSpan);
        }
        return dup;
    }
};

Utils.load = function(path, fileType, success, error){
    var xhr = new XMLHttpRequest();
    xhr.responseType = fileType;
    xhr.onreadystatechange = function()
    {
        if(xhr.readyState === XMLHttpRequest.DONE){
            if (success) {
                success(xhr.response);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

// Polyfill for safari, which doesn't seem to support Node.children.
Utils.getChildren = function(childNodes){
    var children = [];
    for(var i = 0, len = childNodes.length; i < len; i++){
        // Collect only nodes that are not text, i.e. are another node.
        if(childNodes[i].nodeName !== '#text'){
            children.push(childNodes[i]);
        }
    }

    return children;
};

Utils.setHistory = function(files){
    log(encodeURIComponent(files[0].path));
    var stateObj = files;
    history.pushState(stateObj, "", encodeURIComponent(files[0].path)+'/'+encodeURIComponent(files[1].path));
};

Utils.createDownload = function(text){
    var blob = new Blob(['\ufeff', text], {type: 'text/plain'});
    document.location.href = URL.createObjectURL(blob);
    // document.location.href = 'data:text/plain,\ufeff' + encodeURIComponent(text);
}

Utils.downloadPDF = function(){

    var doc = new jsPDF(),
        poem1 = document.querySelector('.poem1'),
        poem2 = document.querySelector('.poem2'),
        poem1Lines = poem1.querySelectorAll('.poem1 .line'),
        poem2Lines = poem2.querySelectorAll('.poem2 .line'),
        poemStr = '';

    doc.setFont("times", "normal");

    console.log(poem1.dataset.filename+poem2.dataset.filename);

    doc.text(20, 20, poem1.dataset.filename+" and "+poem2.dataset.filename);
    doc.addPage();

    [].forEach.call(poem1Lines, function(el){
        poemStr += el.textContent + "\n";
    });
    doc.text(20, 20, poemStr);
    doc.addPage();

    poemStr = '';
    [].forEach.call(poem2Lines, function(el){
        poemStr += el.textContent + "\n";
    });
    doc.text(20, 20, poemStr);

    doc.save(poem1.dataset.filename+poem2.dataset.filename+'.pdf');

};
