"use strict";

function TargetLine(target, rtl){

    var self = this,
        line = target.parentNode,
        complete = function(){
            self.dispatchEvent({type:'complete'});
        },
            
        removeRemainderSurround = function(){
            // Remove the span surrounding (unwrap) the post-target/remaining text.
            while(target.nextSibling.firstChild){
                target.parentNode.appendChild(target.nextSibling.firstChild);
            }
            target.parentNode.removeChild(target.nextSibling);
        };
        
    // Line, target and target letter classes.
    line.classList.add('is-swapping');
    target.classList.add('target');
    [].forEach.call(target.children, function(letterEl){
        letterEl.classList.add('target__letter--old');
    });

    this.showLetter = function(letter, rtl){
        var tmpNodeList = target.querySelectorAll('.is-hidden'),
            targetLetterEls = [];

        // Need and Array instead of NodeList for reversal.
        [].forEach.call(tmpNodeList, function(el){
            targetLetterEls.push(el);
        });

        // Depending on direction of travel search letters in particular order.
        if(rtl === false){
            targetLetterEls.reverse();
        }

        // using [].some will stop execution after return true;
        targetLetterEls.some(function(el){
            if(el.textContent === letter){
                el.classList.remove('is-hidden');
                return true;
            }
        });
    };

    /*
     * Once target has been fully replaced, we remove extraneous surrounding 
     * elements from letters.
     * TODO - Deal with capitalisation change here.
     */
    this.clean = function(sourceStr, replacementStr){
        // Remove content of target (letters surrounded by spans)...
        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
        //...and replace with the source string.
        target.innerHTML = sourceStr;

        line.classList.remove('is-swapping');
        target.classList.remove('target');
        target.classList.add('was-target');
    };

    /*
     * When the original target word has faded insert new source word here
     * so that each letter can be revealed as it lands 
     */
    this.swap = function(sourceStr){
        var lSpan, l; 


        while (target.firstChild) {
            target.removeChild(target.firstChild);
        }
        for (var i = 0, len = sourceStr.length; i < len; i++) {
            lSpan = document.createElement('span');
            lSpan.classList.add('target__letter--new', 'is-hidden');
            l = document.createTextNode(sourceStr[i]); 
            // Used as selector later.
            lSpan.dataset['letter'] = sourceStr[i];
            lSpan.appendChild(l);
            target.appendChild(lSpan);
        }
        removeRemainderSurround();
        target.classList.remove('was-source');
    };

    /*
    this.swap = function(sourceStr, replacementStr){

        // Replace with word in flight.
        replaceTarget(sourceStr);
        target.style.opacity = 1;
        
        // If word is being replaced then hide now...
        if( sourceStr !== replacementStr){
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
    */

    this.fadeOut = function(duration, replacement){

        var childNodes = [];
        childNodes = [].map.call(target.childNodes, function(element) {
            return element;
        });
        childNodes.reverse();

        childNodes.forEach(function(el, index){
            setTimeout(function(){
                move(el)
                    .set('opacity', 0)
                    .duration(250)
                    .delay(index*100)
                    .end();
            }, 1 );
        });
    };

    this.fillSpace = function(difference, duration, replacement){

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
                .end(function(){
                    complete()
                    self.swap(replacement);
                });
        }, 1);

    };
}

EventDispatcher.prototype.apply( TargetLine.prototype );
