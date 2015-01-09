"use strict";

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function log() {
    if (window.options.logging && window.console && window.console.log) {
        Function.prototype.bind.call(window.console.log, (window.console)).apply(window.console, [(Date.now() - window.logStart) + "ms", "dpe:"].concat([].slice.call(arguments, 0)));
    }
}

if(window.options && window.options.logging){
    window.logging = true;
    window.logStart = Date.now();
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

Utils.centreColumnContent = function(el){
    var max = 0, bounds, viewportW = document.documentElement.clientWidth;

    [].forEach.call(el.children, function(line){

        line.style['min-width'] = 0;
        bounds = line.getBoundingClientRect();

        var theCSSprop = window.getComputedStyle(line,null).getPropertyValue("min-width");
        var display = window.getComputedStyle(line,null).getPropertyValue("display");
        // console.log(line, bounds.width, max, theCSSprop, display);
        max = Math.max(bounds.width, max);

        line.style['min-width'] = null;
    });

    max = Math.min(max, viewportW);
    el.style['width'] = max + "px";
};


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


Utils.initSlider = function(slider, config){
    var input = slider.querySelector('input[type="range"]'),
        val   = slider.querySelector('.slider-value'),
        label   = slider.getElementsByTagName('label')[0];

    input.setAttribute('min', config.min);
    input.setAttribute('max', config.max);
    input.setAttribute('value', config.value);
    input.setAttribute('step', config.step);

    val.innerHTML = config.value;
    label.innerHTML = config.title;

    input.addEventListener('input', function(e){
        config.cb(this.value); 
        val.innerHTML = this.value;
    });
};

Utils.cloneInputs = function(all, selected, container, callback){

};


Utils.initCheckboxes = function(all, selected, container, callback){

    // Word classes.
    var tpl = container.querySelector('.input-template'),
        clone, input, label;

    all.forEach(function(cl){
        clone = tpl.cloneNode(true);

        input = clone.querySelector('input');

        clone.classList.remove('input-template');
        clone.classList.add(input.getAttribute('type'));

        clone.setAttribute('for', cl);
        // clone.insertBefore(document.createTextNode(cl), clone.firstChild);
        clone.appendChild(document.createTextNode(cl));

        if(input.getAttribute('type') === "checkbox"){
            input.name = cl;
        }
        input.value = cl;
        input.id = cl;
        if(selected.indexOf(cl) >= 0){
            input.checked = true;
        }
        container.appendChild(clone);

        input.addEventListener('change', function(e){
            callback(e.target);
        });
    });
};

Utils.setHistory = function(files){
    log(encodeURIComponent(files[0].fullpath));
    var stateObj = files;
    history.pushState(stateObj, "", encodeURIComponent(files[0].fullpath)+'/'+encodeURIComponent(files[1].fullpath));
};

Utils.hideUnusedCb = function(activeClasses){

    activeClasses.forEach(function(cl){
        var label = document.querySelector('.controls--poem label[for="'+cl+'"]');
        label.classList.add('is-unused');
    });

};

Utils.setActiveCb = function(newClass){

    var activeLabel = document.querySelector('.controls--poem label.is-active'),
        label = document.querySelector('.controls--poem label[for="'+newClass+'"]');

    if(activeLabel){
        activeLabel.classList.remove('is-active');
    }

    label.classList.add('is-active');
    log( newClass, label);

};

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
