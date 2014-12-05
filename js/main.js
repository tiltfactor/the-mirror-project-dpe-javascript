"use strict";

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
    el.style.width = max + "px";
};

var lr = new LoadRender();
lr.addEventListener('rendered', function(){
    // setTimeout(World.start, 1000);
    var startBtn = document.querySelector('.world-start button');
    startBtn.disabled = false;
    startBtn.addEventListener('click', function(e){
        e.currentTarget.disabled = 'disabled';
        World.start();
    });
    
});
lr.init('./data/flanagan/content.json', './data/dickinson/content.json');
// lr.force();

var World = World || {};
World.animList = [];
World.g = 0.025;

// FPS calc.
var frameTime = 0, lastLoop = new Date, thisLoop;
var count = 0;

var order = [
//  ['s',  't',]
    ['l1', 'r1'],
    ['r2', 'l1'],
    ['l2', 'r2'],
    ['r3', 'l2'],
    ['l3', 'r3'],
    ['r4', 'l3'],
    ['r4', 'r4'],
];

World.wordClass = "NN";
World.next = function(lastSource) {

    var tmpSource = this.sourcePoem,
        tmpTarget = this.targetPoem;

    this.sourcePoem = tmpTarget || lr.poem1 || document.querySelector('.poem1');
    this.targetPoem = tmpSource || lr.poem2 || document.querySelector('.poem2');

    var source = this.sourcePoem.querySelector('.line:not(.swapped):not(.swapping) span[data-tag="'+this.wordClass+'"]');
    var target = lastSource || this.targetPoem.querySelector('span[data-tag="'+this.wordClass+'"]');

    if(!source){
        move(lastSource)
            .set('opacity', 1)
            .duration(250)
            .end();
        return;
    }

    var instance = new SwapLines(source, target);
    instance.addEventListener('complete', function(){
        World.next(source);
    });

};


/*
setInterval(function(){
    console.log((1000/frameTime).toFixed(1));
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
    document.querySelector('.choose').style.display = 'none';
    document.querySelector('.world').style.display = 'block';
    World.next();
    World.animate();
};


// setTimout(World.start, 500);
// World.start();
