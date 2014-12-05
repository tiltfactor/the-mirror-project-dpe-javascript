"use strict";
function PhysicsObject(el, initVy){

    var gravEl = el,
        boundBox = el.getBoundingClientRect(),
        actions = [],
        actionsToRemove = [];
    
    this.x = boundBox.left;
    this.y = boundBox.top;
    this.vx = 0;
    this.vy = initVy || 0;
    gravEl.classList.add('grav-item');
    
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

        this.y += this.vy;
        this.x += this.vx;

        gravEl.style.transform = "translate3d("
            + this.x + "px,"
            + this.y + "px, 0)";

        gravEl.style.webkitTransform = "translate3d("
            + this.x + "px,"
            + this.y + "px, 0)";
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


