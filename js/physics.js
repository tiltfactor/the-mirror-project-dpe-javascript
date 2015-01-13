"use strict";

function PhysicsObject(el, options){

    var self = this;

    var createCanvasHTMLCopy = function(el){
        // Use handy library for copy any HTML element to canvas.
        html2canvas(el, {
            onrendered: function(canvas){
                self.canvas = canvas;
                // Hide duplicate el.
                this.el.style.opacity = 0;
            }
        });
    },

    createCanvasText = function(el){
        var boxCtx;
        // Create element dynamically.
        self.canvas = document.createElement('canvas');
        self.canvas.width = this.boundBox.width;
        self.canvas.height = this.boundBox.height;
        boxCtx = self.canvas.getContext('2d');

        boxCtx.textBaseline="bottom"; 
        boxCtx.translate(0, this.boundBox.height);
        boxCtx.clearRect(0,0, this.boundBox.width, this.boundBox.height);
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

    this.el = el;
    this.boundBox = el.getBoundingClientRect();
    this.actions = [];
    this.actionsToRemove = [];
    this.mode = options.animationMode || "dom";

    this.x = this.boundBox.left;
    this.y = this.boundBox.top;
    this.vx = 0;
    this.vy = 0;

    // console.log(this.x, el);

    el.classList.add('grav-item');

    // If this is either of canvas modes then we prerender canvas 
    // once at the start and copy it later for performance.
    if(this.mode.toLowerCase() === "canvas:copy"){
        createCanvasHTMLCopy(el);
    } else if(this.mode.toLowerCase() === "canvas:text"){
        createCanvasText(el);
    }

}

PhysicsObject.prototype.el = function(){
    return el;
}

PhysicsObject.prototype.removeActionType = function(Action){
    var i = this.actions.length;
    while(i--){
        // console.log(Action, actions[i] instanceof Action);
        if(this.actions[i] instanceof Action){
            this.actions.splice(i, 1);
        }
    }
};

PhysicsObject.prototype.removeAction = function(action){
    var i = this.actions.length;
    while(i--){
        if(this.actions[i] === action){
            this.actions.splice(i, 1);
        }
    }
};

PhysicsObject.prototype.removeQueuedActions = function(){
    var i = this.actionsToRemove.length;
    while(i--){
        var action = this.actionsToRemove.splice(i, 1);
        this.removeAction(action[0]);
    };
};

PhysicsObject.prototype.addAction = function(action, once){
    this.actions.push(action);
    if(once === true){
        this.actionsToRemove.push(action);
    }
};

PhysicsObject.prototype.behaveAll = function(count){
    for(var i = 0, len = this.actions.length; i < len; i++){
        this.actions[i].behave(this, count);
    }
    this.removeQueuedActions();
};

PhysicsObject.prototype.draw = function(){

    var ctx, thresholdW = 0, thresholdH = 0;

    if(this.mode.toLowerCase() === "canvas:copy"){
        ctx = world.getAnimContext();
    } else if(this.mode.toLowerCase() === "canvas:text"){
        ctx = world.getAnimContext();
        thresholdW = 1;
        thresholdH = 2;
    }

    // If this is canvas mode and canvas exists.
    if(this.mode.split(":")[0].toLowerCase() === "canvas" && this.canvas){
        // Clear previous canvas area.
        ctx.clearRect(this.x-thresholdW, this.y-thresholdH, this.canvas.width+(2*thresholdW), this.canvas.height+(2*thresholdH));
    }

    // Calculate position based on velocity.
    this.y += this.vy;
    this.x += this.vx;

    if(this.mode.split(":")[0].toLowerCase() === "canvas" && this.canvas){
        // Draw new image position.
        ctx.drawImage(this.canvas, (0.5 + this.x) | 0 , (0.5 +  this.y) | 0);
    }

    // If we aren't using canvas we assume DOM manipulation.
    if(this.mode.split(":")[0].toLowerCase() !== "canvas"){
        this.el.style.transform = "translate3d("
            + ((0.5 + this.x) | 0) + "px,"
            + ((0.5 + this.y) | 0) + "px, 0)";

        this.el.style.webkitTransform = "translate3d("
            + ((0.5 + this.x) | 0) + "px,"
            + ((0.5 + this.y) | 0) + "px, 0)";
    }
};

EventDispatcher.prototype.apply( PhysicsObject.prototype );

function Ground(y, x, rtl){
    var threshold = 2;

    this.behave = function(pO){
        if(pO.y+threshold >= y && (rtl && pO.x-threshold <= x) || (!rtl && pO.x+threshold >= x)){
            pO.vx = 0;
            pO.vy = 0;
            pO.y = y;
            pO.x = x;
            pO.actionsToRemove.push(this);
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

function ThrowProgress(flightTime, dispatchAt){

    this.flightTime = ((0.5 + flightTime) | 0);
    this.dispatchAt = ((0.5 + dispatchAt) | 0);

    this.behave = function(pO, count){
        this.startCount = this.startCount || count;
        if(count-this.startCount >= this.dispatchAt){
            pO.dispatchEvent({type:'throwprogress', framesRemaining: count-this.startCount});
            pO.actionsToRemove.push(this);
        }
    };

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


