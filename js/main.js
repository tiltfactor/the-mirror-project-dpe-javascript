"use strict";

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
        line.style.display = 'inline';
        bounds = line.getBoundingClientRect();
        max = Math.max(max, bounds.width);
        line.style.display = 'block';
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
        config.cb.call(World, this.value); 
        val.innerHTML = this.value;
    });
};

Utils.initPoemControls = function(all, selected, el, callback){

    // Word classes.
    var tpl = el.querySelector('.wc-checkbox'),
        wcEl = el.querySelector('.word-classes'),
        clone, cb, label;

    all.forEach(function(cl){
        clone = tpl.cloneNode(true);
        cb = clone.querySelector('input[type="checkbox"]');

        clone.setAttribute('for', cl);
        // clone.insertBefore(document.createTextNode(cl), clone.firstChild);
        clone.appendChild(document.createTextNode(cl));

        cb.name = cl;
        cb.value = cl;
        cb.id = cl;
        if(selected.indexOf(cl) >= 0){
            cb.checked = true;
        }
        wcEl.appendChild(clone);

        cb.addEventListener('change', function(e){
            callback.call(World, e.target.id, e.target.checked);
        });
    });
};

Utils.setHistory = function(files){
    log(encodeURIComponent(files[0].fullpath));
    var stateObj = files;
    history.pushState(stateObj, "", encodeURIComponent(files[0].fullpath)+'/'+encodeURIComponent(files[1].fullpath));
};

var lr = new LoadRender();
lr.addEventListener('rendered', function(data){
    // log(data);
    // Utils.setHistory(data.files);

    // setTimeout(World.start, 1000);
    var startBtn = document.querySelector('.world-start button');
    startBtn.disabled = false;
    startBtn.addEventListener('click', function(e){
        e.currentTarget.disabled = 'disabled';
        World.start();
    });
    
});


lr.init('./data/flanagan/content.json', './data/dickinson/content.json');
lr.force('./data/flanagan/Insubstantial_Stuff_of_Pure_Being_.xml', './data/dickinson/OneSeries-IX.xml');
// lr.force();

var World = World || {};
World.animList = [];
World.g = 0.035;
World.arcHeight = 200;
World.arcVariant = 10;

World.setWordClass = function(wc, checked){
    log(wc, checked);
    if(checked === false){
        this.wordClasses.splice(this.wordClasses.indexOf(wc));
    } else {
        this.wordClasses.push(wc);
    }
}

World.setArcVariant = function(h){
    this.arcVariant = parseInt(h);
}

World.setArcHeight = function(h){
    this.arcHeight = parseInt(h);
}

World.setGravity = function(g){
    this.g = parseFloat(g);
}

// FPS calc.
var frameTime = 0, lastLoop = new Date, thisLoop;
var count = 0;

World.wordClassIndex = 0;
World.allWordClasses = ['NN', 'DT', 'IN', 'NNP', 'JJ', 'NNS', 'PRP', 'VBZ', 'RB', 'VBP', 'VB', 'CC', 'PRP$', 'TO', 'VBD', 'VBN', 'VBG', 'WRB', 'MD', 'CD', 'WP', 'EX', 'RP', 'JJR', 'WDT', 'JJS', 'RBR', 'WP$'];
World.wordClasses = ['NN', 'DT', 'IN'];

World.nextClass = function() {

    // Resetting lines for next pass/class.
    var lines = document.querySelectorAll('.world .line');
    log(lines);
    [].forEach.call(lines, function(line){
        log(line);
        line.classList.remove('swapped', 'swapping');
    });

    // Are there any more classes?
    if(this.wordClassIndex < this.wordClasses.length){
        this.wordClassIndex++;
        log('Next class: ', this.wordClasses[this.wordClassIndex]);
        this.next();
    } else {
        // No? Then we stop.
        log('fin');
        // TODO - Store resulting poems or offer PDF download.
    }
};

World.next = function(lastSource) {

    var tmpSource = this.sourcePoem,
        tmpTarget = this.targetPoem,
        wordClass = this.wordClasses[this.wordClassIndex],
        source, target, swap;
    log(this.wordClasses);

    // Swap source and target or set them in the first instance.
    this.sourcePoem = tmpTarget || lr.poem1 || document.querySelector('.poem1');
    this.targetPoem = tmpSource || lr.poem2 || document.querySelector('.poem2');

    // Get the next source that hasn't been swapped during this pass/class.
    source = this.sourcePoem.querySelector('.line:not(.swapped):not(.swapping) span[data-tag="'+wordClass+'"]');
    target = lastSource || this.targetPoem.querySelector('span[data-tag="'+wordClass+'"]');

    // Do we have a viable swap? (we need both source and target, fo' sho').
    if(!source || !target){
        // If we have no swap and have the previous source we fade that
        // back in and then start the process with a new class.
        if(lastSource){
            move(lastSource)
                .set('opacity', 1)
                .duration(250)
                .end(function(){
                    World.nextClass.call(World);
                });
        } else {
            // log('nextClass', source, target);
            // If there is no last source then we may have just
            // started a new class and immediately found no viable swaps.
            log('Nothing found for: ', wordClass);
            World.nextClass();
        }
        return;
    }

    // Instance of a line swap. Listening for completion.
    swap = new SwapLines(source, target);
    swap.addEventListener('complete', function(){
        // We recursively call next() here and pass the last source
        // incase we discover there is no viable swap and need to fade
        // the last source back in.
        World.next(source);
    });

};


/*
setInterval(function(){
    log((1000/frameTime).toFixed(1));
},250); 
*/

World.animate = function() {
    // FPS calc.
    var thisFrameTime = (thisLoop=new Date) - lastLoop;
    frameTime += (thisFrameTime - frameTime) / 25;
    lastLoop = thisLoop;
    count++;

    requestAnimationFrame( World.animate );
    World.draw();
}

World.draw = function() {
    for (var i = 0, len = World.animList.length; i < len; i++) {
        World.animList[i].behaveAll(count);
        World.animList[i].draw();
    }

    var j = World.animList.length;
    while(j--){
        if(World.animList[j].detach){
            World.animList.splice(j, 1);
        }
    }
}

World.start = function(){

    var controls = document.querySelectorAll('.controls');
    [].forEach.call(controls, function(el){
       el.classList.remove('is-active'); 
    });

    document.querySelector('.choose').style.display = 'none';
    document.querySelector('.world').style.display = 'block';

    World.next();
    World.animate();
};

var slidersConfig = [
    { title:"Gravity", cb: World.setGravity, value: World.g, min: 0.01, max : 0.2, step: 0.005 },
    { title:"Arc height", cb: World.setArcHeight, value: World.arcHeight, min: 50, max : 300, step: 1 },
    { title:"Arc height variant", cb: World.setArcVariant, value: World.arcVariant, min: 0, max : 50, step: 1 } 
];

var sliderTemplate = document.querySelector('.slider'),
    controlsFlight = document.querySelector('.controls--flight'),
    controlsPoem = document.querySelector('.controls--poem');

[].forEach.call(slidersConfig, function(config){
    var clone = sliderTemplate.cloneNode(true);
    controlsFlight.appendChild(clone);
    Utils.initSlider(clone, config);
});

Utils.initPoemControls(World.allWordClasses, World.wordClasses, controlsPoem, World.setWordClass);

