"use strict";

function PhysicsObject(el, options){

    this.el = el;
    this.boundBox = el.getBoundingClientRect();
    this.actions = [];
    this.actionsToRemove = [];
    this.actionsTypeToRemove = [];
    this.mode = options.world.animationMode || "dom";

    this.x = this.boundBox.left;
    this.y = this.boundBox.top;
    this.vx = 0;
    this.vy = 0;

    el.classList.add('grav-item');
}

PhysicsObject.prototype.render = function(Action){

    var self = this;

    var createCanvasHTMLCopy = function(el){
        // Use handy library for copy any HTML element to canvas.
        html2canvas(el, {
            onrendered: function(canvas){
                self.canvas = canvas;
                self.drawInit();
                self.dispatchEvent({type:'rendered'});
            }
        });
    },

    createCanvasText = function(el){
        var boxCtx;
        // Create element dynamically.
        self.canvas = document.createElement('canvas');
        self.canvas.width = self.boundBox.width;
        self.canvas.height = self.boundBox.height;
        boxCtx = self.canvas.getContext('2d');

        boxCtx.textBaseline="bottom"; 
        boxCtx.translate(0, self.boundBox.height);
        boxCtx.clearRect(0,0, self.boundBox.width, self.boundBox.height);
        // TODO - Get this from CSS.
        boxCtx.font = "25px fenixregular";
        boxCtx.fillStyle = "Black";
        boxCtx.fillText(el.textContent, 0, 0);

        // DEBUG:
        // boxCtx.fillStyle = '#09F';
        // boxCtx.fillRect(0, 0, boundBox.width, boundBox.height);
        
        self.el.classList.add('is-offscreen');
    };


    // If this is either of canvas modes then we prerender canvas 
    // once at the start and copy it later for performance.
    if(this.mode.toLowerCase() === "canvas:copy"){
        createCanvasHTMLCopy(this.el);
    } else if(this.mode.toLowerCase() === "canvas:text"){
        createCanvasText(this.el);
        self.dispatchEvent({type:'rendered'});
    } else {
        self.dispatchEvent({type:'rendered'});
    }
};


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

    var j = this.actionsTypeToRemove.length;
    while(j--){
        var Action = this.actionsTypeToRemove.splice(j, 1)[0];
        this.removeActionType(Action);
    }
};

PhysicsObject.prototype.addAction = function(action, once){
    this.actions.push(action);
    if(once === true){
        this.actionsToRemove.push(action);
    }
};

PhysicsObject.prototype.behaveAll = function(count){
    for(var i = this.actions.length; i--; ){
        this.actions[i].behave(this, count);
    }
    this.removeQueuedActions();
};

PhysicsObject.prototype.drawInit = function(){

    var vx = this.vx, 
        vy = this.vy;

    this.x = this.boundBox.left;
    this.y = this.boundBox.top;
    this.vx = 0;
    this.vy = 0;
    this.draw();
    this.vx = vx;
    this.vy = vy;

};

PhysicsObject.prototype.clear = function(){

    var ctx;

    // If this is canvas mode and canvas exists.
    if(this.canvas){
        ctx = world.getAnimContext();
        // Clear previous canvas area.
        // Add 1px to all sides of rect in case of float calculations.
        ctx.clearRect(this.x-1, this.y-1, this.canvas.width+2, this.canvas.height+2);
    }

};

PhysicsObject.prototype.draw = function(){
    var ctx, thresholdW = 0, thresholdH = 0;

    if(!this.canvas){
        return;
    } else {
        this.clear();
    }

    ctx = world.getAnimContext();

    // Calculate position based on velocity.
    this.y += this.vy;
    this.x += this.vx;

    if(this.canvas){
        // Draw new image position.
        ctx.drawImage(this.canvas, (0.5 + this.x) | 0 , (0.5 +  this.y) | 0);
    } else { 
        // If we aren't using canvas we assume DOM manipulation.
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
    var threshold = 0;

    this.behave = function(pO){
        if((rtl && pO.y >= y && pO.x-threshold <= x) || (!rtl && pO.y >= y && pO.x >= x)){
            pO.vx = 0;
            pO.vy = 0;
            pO.actionsToRemove.push(this);
            pO.actionsTypeToRemove.push(Gravity);
            pO.actionsTypeToRemove.push(Throw);
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

