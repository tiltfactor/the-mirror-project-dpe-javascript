"use strict";

function TargetLine(target, rtl){

    var self = this,
        line = target.parentNode,
        complete = function(){
            self.dispatchEvent({type:'complete'});
        },
            
        replaceTarget = function(sourceStr){
            
            // Remove content of target (letters surrounded by spans)...
            while (target.firstChild) {
                target.removeChild(target.firstChild);
            }
            //...and replace with the source string.
            target.innerHTML = sourceStr;
            
        }, 
            
        removeRemainderSurround = function(){
            // Remove the span surrounding (unwrap) the post-target/remaining text.
            while(target.nextSibling.firstChild){
                target.parentNode.appendChild(target.nextSibling.firstChild);
            }
            target.parentNode.removeChild(target.nextSibling);
        },
        
        changeClasses = function(){
            line.classList.remove('swapping');
            // FIX: May no longer be necessary.
            line.classList.add('swapped');

            target.classList.remove('target');
            target.classList.add('swapped');
        };

    line.classList.add('swapping');
    target.classList.add('target');

    this.swap = function(sourceStr, replacementStr){

        // Replace with word in flight.
        replaceTarget(sourceStr);
        target.style.opacity = 1;
        
        // If word is being replaced then hide now...
        if(sourceStr !== replacementStr){
            // ... and wait for transition to end.
            target.addEventListener('transitionend', function(){

                replaceTarget(replacementStr);
                target.classList.remove('is-replacing');

                changeClasses();
            });
            // Starts the transition that we're listening for.
            target.classList.add('is-replacing');
            // Remove surround now otherwise we get a jump.
            removeRemainderSurround();
            // Prevent remainder from execution until end of transition.
            return;
        }

        removeRemainderSurround();
        changeClasses();

    };

    this.fadeOut = function(rtl, duration){

        var childNodes = [];
        childNodes = [].map.call(target.childNodes, function(element) {
            return element;
        });

        if(rtl !== true){
            childNodes.reverse();
        }

        var animMaxDuration = (childNodes.length*200)+250;
        for(var i = 0, len = childNodes.length; i < len; i++){
            (function(index){
                setTimeout(function(){
                    move(childNodes[index])
                        .set('opacity', 0)
                        .duration(250)
                        .delay(index*100)
                        .end();
                }, 1 );
            }(i));
            // console.log((i+1)*0.25+'s');
        }
    };

    this.fillSpace = function(difference, duration){

        var childNodes = line.childNodes,
            nodesToRight = [],
            found = false;

        // Surround remaining words with span  for animation 
        // by duplicating textnodes within.
        var span = document.createElement('span');
        for(var i = 0, len = childNodes.length; i < len; i++){
            if(found === true){
                span.appendChild(childNodes[i].cloneNode(true));
                nodesToRight.push(childNodes[i]);
            } else {
                found = childNodes[i] === target;
            }
        }

        // Swap textnode with duplicate.
        line.appendChild(span);
        for(var j = 0, len = nodesToRight.length; j < len; j++){
            line.removeChild(nodesToRight[j]);
        }
        span.style.display = "inline-block";

        // Animate
        setTimeout(function(){
            // debugger;
            move(span)
                .translate(0-difference, 0)
                .duration(duration)
                .end(complete);
        }, 1);

    };
}

EventDispatcher.prototype.apply( TargetLine.prototype );
