"use strict";

function SourceLine(wordEl){

    // TODO: Make configurable.
    this.delayMs = 250;
    this.wordEl = wordEl;
    this.letterEls = [],
    this.world = World.getInstance();

    // Create array in order to reverse;.
    this.letterEls = [].map.call(wordEl.childNodes, function(element) {
        return element;
    });
    this.letterEls.reverse();

    document.body.appendChild(wordEl);
}

SourceLine.prototype.throw = function(rtl, h, v1, v2, groundY){

    var delay, 
        variant,
        parentBounds = this.wordEl.getBoundingClientRect(),
        startX,
        l,
        box, 
        gravity,
        ground,
        thrProgress,
        thrComplete,
        thr;

    for(var i = 0, len = this.letterEls.length; i < len; i++){

        l = this.letterEls[i];
        startX = l.getBoundingClientRect().left-parentBounds.left;

        box = new PhysicsObject(l, options);
        box.draw();

        gravity = new Gravity(world.g);
        box.addAction(gravity);

        variant = Math.random()*world.arcVariant;
        thr = new Throw(world.g, h, v1+variant, v2+variant);
        // Call once not on every frame.
        thr.behave(box);

        // For calculating flight time we use the first letter to land
        // so that the landing area has been cleared in plenty of time.
        if((rtl === true && i === len-1) || (rtl === false && i === 0)){
            thrProgress = new ThrowProgress(thr.getFlightTime(), thr.getFlightTime()/2);
            box.addAction(thrProgress);
            box.addEventListener('throwprogress', this.handleProgress.bind(this));
        }

        ground = new Ground(groundY, box.x+h, rtl);
        box.addAction(ground);
        box.addEventListener('ground', this.handleGroundLetter.bind(this));

        delay = (rtl === true) ? this.delayMs*(len-i) : this.delayMs*i;
        (function(box){
            setTimeout(function(){
                world.animList.push(box);
            }, delay);
        }(box));

        if((rtl === false && i === len-1) || (rtl === true && i === 0)){
            box.addEventListener('ground', this.handleComplete.bind(this));
        }
    }
};

SourceLine.prototype.handleGroundLetter = function(e){
    this.dispatchEvent({type:'ground-letter', pO: e.target});
};

SourceLine.prototype.handleProgress = function(e){
    this.dispatchEvent({type:'progress', framesRemaining:e.framesRemaining });
};

SourceLine.prototype.handleComplete = function(e){
    this.dispatchEvent({type:'complete'});
};


EventDispatcher.prototype.apply( SourceLine.prototype );
