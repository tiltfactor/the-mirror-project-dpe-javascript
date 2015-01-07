"use strict";

function PhysicsObject(el, options){

    var self = this,
        boundBox = el.getBoundingClientRect(),
        actions = [],
        actionsToRemove = [],
        mode = options.animationMode || "dom";

    var createCanvasHTMLCopy = function(el){
        // Use handy library for copy any HTML element to canvas.
        html2canvas(el, {
            onrendered: function(canvas){
                self.canvas = canvas;
                // Hide duplicate el.
                el.style.opacity = 0;
            }
        });
    },

    createCanvasText = function(el){
        // Create element dynamically.
        this.canvas = document.createElement('canvas');
        this.canvas.width = boundBox.width;
        this.canvas.height = boundBox.height;
        var boxCtx = this.canvas.getContext('2d');

        boxCtx.textBaseline="bottom"; 
        boxCtx.translate(0, boundBox.height);
        boxCtx.clearRect(0,0, boundBox.width, boundBox.height);
        // TODO - Get this from CSS.
        boxCtx.font = "25px fenixregular";
        boxCtx.fillStyle = "Black";
        boxCtx.fillText(el.textContent, 0, 0);

        // DEBUG:
        // boxCtx.fillStyle = '#09F';
        // boxCtx.fillRect(0, 0, boundBox.width, boundBox.height);
        
        // Hide duplicate el.
        el.style.opacity = 0;

    };

    
    this.x = boundBox.left;
    this.y = boundBox.top;
    this.vx = 0;
    this.vy = 0;

    el.classList.add('grav-item');

    // If this is either of canvas modes then we prerender canvas 
    // once at the start and copy it later for performance.
    if(mode.toLowerCase() === "canvas:copy"){
        createCanvasHTMLCopy(el);
    } else if(mode.toLowerCase() === "canvas:text"){
        createCanvasText(el);
    }

    this.el = function(){
        return el;
    };

    this.removeActionType = function(Action){
        var i = actions.length;
        while(i--){
            // console.log(Action, actions[i] instanceof Action);
            if(actions[i] instanceof Action){
                actions.splice(i, 1);
            }
        }
    };

    this.removeAction = function(action){
        var i = actions.length;
        while(i--){
            if(actions[i] === action){
                actions.splice(i, 1);
            }
        }
    };

    this.removeQueuedActions = function(){
        var i = actionsToRemove.length;
        while(i--){
            var action = actionsToRemove.splice(i, 1);
            this.removeAction(action[0]);
        };
    };

    this.addAction = function(action, once){
        actions.push(action);
        if(once === true){
            actionsToRemove.push(action);
        }
    };

    this.behaveAll = function(count){
        for(var i = 0, len = actions.length; i < len; i++){
            actions[i].behave(this, count);
        }
        this.removeQueuedActions();
    };

    this.draw = function(){

        var ctx, thresholdW = 0, thresholdH = 0;

        if(mode.toLowerCase() === "canvas:copy"){
            ctx = world.getAnimContext();
        } else if(mode.toLowerCase() === "canvas:text"){
            ctx = world.getAnimContext();
            thesholdW = 1;
            thesholdH = 2;
        }

        // If this is canvas mode and canvas exists.
        if(mode.split(":")[0].toLowerCase() === "canvas" && this.canvas){
            // Clear previous canvas area.
            ctx.clearRect(this.x-thresholdW, this.y-thresholdH, this.canvas.width+(2*thresholdW), this.canvas.height+(2*thresholdH));
        }

        // Calculate position based on velocity.
        this.y += this.vy;
        this.x += this.vx;

        if(mode.split(":")[0].toLowerCase() === "canvas" && this.canvas){
            // Draw new image position.
            ctx.drawImage(this.canvas, (0.5 + this.x) | 0 , (0.5 +  this.y) | 0);
        }

        // If we aren't using canvas we assume DOM manipulation.
        if(mode.split(":")[0].toLowerCase() !== "canvas"){
            el.style.transform = "translate3d("
                + this.x + "px,"
                + this.y + "px, 0)";

            el.style.webkitTransform = "translate3d("
                + this.x + "px,"
                + this.y + "px, 0)";
        }
    };
}

EventDispatcher.prototype.apply( PhysicsObject.prototype );

function Ground(y, x, rtl){
    var threshold = 2;

    this.behave = function(pO){
        if(pO.y+threshold >= y && (rtl && pO.x-threshold <= x) || (!rtl && pO.x+threshold >= x)){
            pO.vx = 0;
            pO.vy = 0;
            pO.y = y;
            pO.x = x;
            pO.removeActionType(Gravity);
            pO.removeAction(this);
            pO.detach = true;
            pO.dispatchEvent({type:'ground'});
        }
    };
}

function Gravity(g){
    this.behave = function(pO){
        pO.vy += g;
    };
}

function ThrowProgress(flightTime){

    this.percent = 0;
    flightTime = Math.round(flightTime);

    this.behave = function(pO, count){

        if(this.percent < 100){

            var thisPercent = 0, endCount;

            this.startCount = this.startCount || count;
            thisPercent = Math.round(((count-this.startCount)/flightTime)*100);
            if(this.percent < thisPercent){
                this.percent = thisPercent;
                pO.dispatchEvent({type:'throwprogress', progress: this.percent, framesRemaining: count-this.startCount});
            }

            // if(this.percent >= 100){
               // pO.removeAction(this);
            //}
        }
    }

}

function Throw(g, hDistance, vDistance1, vDistance2){
    
    vDistance2 = vDistance2 || vDistance1;

    this.g = g;
    this.getFlightTime = function(){
        return this.totalFlightTime(vDistance1, vDistance2);
    };

    this.behave = function(pO){

        // Throw this Physics object by h and v distance.
        var flightTime, vx, vy;

        flightTime = this.getFlightTime();
        vx = this.horizontalVelocityToTravelDistance(hDistance, flightTime);
        vy = this.verticalVelocityToReachHeight(vDistance1);

        pO.vx = vx;
        pO.vy = 0-vy;
        
    };

};

Throw.prototype.verticalVelocityToReachHeight = function(h) {
    // Same as equation to find velocity at point of impact for a body
    // dropped from a given height.
    // http://en.wikipedia.org/wiki/Equations_for_a_falling_body
    return Math.sqrt(2 * this.g * h);
}

Throw.prototype.horizontalVelocityToTravelDistance = function(d, t) {
    // Speed = distance / time, there is no acceleration horizontally
    return d / t;
}

Throw.prototype.timeToFallHeight = function(h){
    // Just the time to travel a given distance from stationary under a
    // constant acceleration (g).
    // http://en.wikipedia.org/wiki/Equations_for_a_falling_body
    return Math.sqrt((2 * h) / this.g);
}

Throw.prototype.totalFlightTime = function(upH, downH) {
    // Just add the times for the upwards and downwards journeys separately
    return this.timeToFallHeight(upH) + this.timeToFallHeight(downH);
}


