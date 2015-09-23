"use strict";

function TargetLine(target, rtl){

    var self = this,
        line = target.parentNode,
        complete = function(){
            self.dispatchEvent({type:'complete'});
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

        // Need an Array instead of NodeList for reversal.
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

    this.removeExtraMarkup = function(sourceStr){

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
     * Once target has been fully replaced, we change capitlisation if necessary
     * and then remove extraneous surrounding elements from letters.
     */
    this.clean = function(sourceStr, replacementStr){

        // If capitalisation change is needed then do this first,
        // otherwise remove extra markip immediately.
        if(sourceStr !== replacementStr){
            var firstLetterDup = Utils.duplicate(target.firstChild);
            firstLetterDup.textContent = replacementStr.substr(0, 1);
            firstLetterDup.style.opacity = 0;
            target.insertBefore(firstLetterDup, target.childNodes[1]);
            target.firstChild.style.position = 'absolute';
            TweenLite.to(firstLetterDup, 0.25, { opacity: 1, delay: 0.25, onComplete: this.removeExtraMarkup, onCompleteParams:[replacementStr] });
            TweenLite.to(target.firstChild, 0.25, { opacity: 0, onComplete: function(){
                // Remove this letter once is has disappeared.
                // this = TweenLite
                this.target.parentNode.removeChild(this.target);
            }});
        } else {
            this.removeExtraMarkup(sourceStr);
        }
    };

    /*
     * Remove wrapper around post target words (that were previsouly used to
     * animate multiple words).
     */
    this.removePostTargetSurround = function(){
        // Remove the span surrounding (unwrap) the post-target/remaining text.
        while(target.nextSibling.firstChild){
            target.parentNode.appendChild(target.nextSibling.firstChild);
        }
        target.parentNode.removeChild(target.nextSibling);
    };

    /*
     * When the original target word has faded AND the words to the right of
     * the target have finished animating insert new source word letter by letter
     * so that each one can be revealed as it lands.
     */
    this.insertSourceLetters = function(sourceStr){
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

    };

    this.fadeOut = function(duration, replacement){

        var childNodes = [];
        childNodes = [].map.call(target.childNodes, function(element) {
            return element;
        });
        childNodes.reverse();

        childNodes.forEach(function(el, index){
            el.style.WebkitTransitionDelay = index*100 + 'ms';
            el.style.MozTransitionDelay = index*100 + 'ms';
            el.style.transitionDelay = index*100 + 'ms';
            el.style.opacity = 0;
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
        var completeFn = this.targetSpacingComplete;
        setTimeout(function(){
            // debugger;
            TweenLite.to(span, duration/1000, { x: 0-difference, onComplete: self.targetSpacingComplete, onCompleteScope: self, onCompleteParams:[replacement] });
        }, 1);
    };

    this.targetSpacingComplete = function(replacement){
        this.insertSourceLetters(replacement);
        this.removePostTargetSurround();
        target.classList.remove('was-source');

    };
}

EventDispatcher.prototype.apply( TargetLine.prototype );
