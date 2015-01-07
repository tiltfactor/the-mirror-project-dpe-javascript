"use strict";

function SourceLine(source, duplicate){

    var self = this,
        duplicateOffsetLeft,
        duplicateChildren = [],
        sourceBbox,
        delayMs = 250, variant = 0,
        thr, world = World.getInstance();

    document.body.appendChild(duplicate);
    sourceBbox = source.getBoundingClientRect();
    source.style.opacity = 0.5;

    this.throwDuplicate = function(rtl, hDistance, vDistance1, vDistance2, groundY){
        // Create array in order to reverse;.
        duplicateChildren = [].map.call(duplicate.childNodes, function(element) {
            return element;
        });
        duplicateChildren.reverse();

        duplicateOffsetLeft = duplicate.getBoundingClientRect().left;

        for(var i = 0, len = duplicateChildren.length; i < len; i++){
            var l = duplicateChildren[i], box,
                letterOffsetLeft = l.getBoundingClientRect().left-duplicateOffsetLeft,
                total = duplicateChildren.length,
                delay;

            box = new PhysicsObject(l, options);
            box.x =  sourceBbox.left + letterOffsetLeft
            box.y =  sourceBbox.top;
            box.draw();
            var gravity = new Gravity(world.g);
            box.addAction(gravity);

            variant = Math.random()*world.arcVariant;
            thr = new Throw(world.g, hDistance, vDistance1+variant, vDistance2+variant);
            // Call once not on every frame.
            thr.behave(box);

            // For calculating flight time we use the first letter to land
            // so that the landing area has been cleared in plenty of time.
            if((rtl === true && i === len-1) || (rtl === false && i === 0)){
                var thrProgress = new ThrowProgress(thr.getFlightTime());
                box.addAction(thrProgress);
                box.addEventListener('throwprogress', this.handleProgress);
            }

            var ground = new Ground(groundY, box.x+hDistance, rtl);
            box.addAction(ground);

            delay = (rtl === true) ? delayMs*(total-i) : delayMs*i;
            (function(box){
                setTimeout(function(){
                    world.animList.push(box);
                }, delay);
            }(box));

            if((rtl === false && i === len-1) || (rtl === true && i === 0)){
                box.addEventListener('ground', this.handleGround);
            }
        }

    };

    this.handleProgress = function(e){
        self.dispatchEvent({type:'progress', progress: e.progress, framesRemaining:e.framesRemaining });
    };

    this.handleGround = function(){
        self.dispatchEvent({type:'ground'});
        duplicate.parentNode.removeChild(duplicate);
    };
                        
}

EventDispatcher.prototype.apply( SourceLine.prototype );
