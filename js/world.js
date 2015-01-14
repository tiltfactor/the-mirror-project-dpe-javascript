"use strict";

/* Singleton */
var World = (function(){

    function WorldObject( options )  {
        // Set options to the options supplied
        // or an empty object if none are provided.
        options = options || {};
     
        // FPS calc.
        var self = this, 
            lastLoop = new Date, 
            thisLoop,
            count = 0,
            animContext;

        // Options.
        this.g = options.g || 0.035;
        this.arcHeight = options.arcHeight || 200;
        this.arcVariant = options.arcVariant || 10;

        this.frameTime = 0;
        this.animList = [];

        this.wordClassIndex = 0;
        this.allWordClasses = ['NN', 'DT', 'IN', 'NNP', 'JJ', 'NNS', 'PRP', 'VBZ', 'RB', 'VBP', 'VB', 'CC', 'PRP$', 'TO', 'VBD', 'VBN', 'VBG', 'WRB', 'MD', 'CD', 'WP', 'EX', 'RP', 'JJR', 'WDT', 'JJS', 'RBR', 'WP$'];
        this.wordClasses = ['NN'];

        this.setWordClass = function(target){
            var wc = target.id;
            if(target.checked === false){
                this.wordClasses.splice(this.wordClasses.indexOf(wc), 1);
            } else {
                this.wordClasses.push(wc);
            }
        }

        this.nextClass = function() {

            // Resetting lines for next pass/class.
            var lines = document.querySelectorAll('.world .line');
            [].forEach.call(lines, function(line){
               	line.classList.remove('was-target', 'is-swapping');
            });

            // Are there any more classes?
            if(this.wordClassIndex < this.wordClasses.length-1){
                this.wordClassIndex++;
                log('Next class: ', this.wordClasses[this.wordClassIndex]);
                this.dispatchEvent({
                    type:'classchange', 
                    newClass: this.wordClasses[this.wordClassIndex] 
                });
                this.next();
            } else {
                // No? Then we stop.
                this.dispatchEvent({type:'complete'});
            }
        };

        this.next = function(lastSource) {

            var tmpSource = this.sourcePoem,
                tmpTarget = this.targetPoem,
                wordClass = this.wordClasses[this.wordClassIndex],
                source, target, swap, lineIndex;

            // Swap source and target or set them in the first instance.
            this.sourcePoem = tmpTarget || lr.poem1 || document.querySelector('.poem1');
            this.targetPoem = tmpSource || lr.poem2 || document.querySelector('.poem2');

            // Get line index.
            lineIndex = parseInt(this.sourcePoem.dataset.lastIndex || 0);

            // Get the next source that hasn't been swapped during this pass/class.
            source = this.sourcePoem.querySelector('.line:not(.is-swapping):nth-child(n+'+(lineIndex+1)+') span[data-tag="'+wordClass+'"]:not(.was-target)');
            if(!source){
                source = this.sourcePoem.querySelector('.line:not(.is-swapping):nth-child(n+1) span[data-tag="'+wordClass+'"]:not(.was-target)');
            }
            target = lastSource || this.targetPoem.querySelector('span[data-tag="'+wordClass+'"]');

            // Do we have a viable swap? (we need both source and target, fo' sho').
            if(!source || !target){
                // If we have no swap and have the previous source we fade that
                // back in and then start the process with a new class.
                if(lastSource){
                    move(lastSource)
                        .set('opacity', 1)
                        .duration(250)
                        .end(this.nextClass.bind(this));
                } else {
                    // log('nextClass', source, target);
                    // If there is no last source then we may have just
                    // started a new class and immediately found no viable swaps.
                    log('Nothing found for: ', wordClass);
                    this.nextClass();
                }
                return;
            } else {
                // Set the source line index.
                var k = 1, e = source.parentNode;
                while (e = e.previousSibling) { ++k;}
                this.sourcePoem.dataset['lastIndex'] = k;
            }

            // Instance of a line swap. Listening for completion.
            swap = new SwapLines(source, target);
            swap.addEventListener('complete', function(){
                // We recursively call next() here and pass the last source
                // incase we discover there is no viable swap and need to fade
                // the last source back in.
                self.next.call(self, source);
            });

        };


        /*
        setInterval(function(){
            log((1000/frameTime).toFixed(1));
        },250); 
        */

        this.animate = function() {
            // FPS calc.
            var thisFrameTime = (thisLoop=new Date) - lastLoop;
            this.frameTime += (thisFrameTime - this.frameTime) / 25;
            lastLoop = thisLoop;
            count++;

            requestAnimationFrame( this.animate.bind(this) );
            this.draw();
        }

        this.draw = function() {

            var j = this.animList.length;
            while(j--){
                if(this.animList[j].detach){
                    // Clears any remaining canvas gumph.
                    this.animList[j].clear();
                    this.animList.splice(j, 1);
                }
            }

            for (var i = 0, len = this.animList.length; i < len; i++) {

                // Behaviours make calculations on velocity, etc.
                this.animList[i].behaveAll(count);

                // Clear only acts on canvas mode.
                this.animList[i].clear();
                // Draw renders.
                this.animList[i].draw();

            }

        }

        this.start = function(){

            var controls = document.querySelectorAll('.controls'),
                worldEl = document.querySelector('.world');

            [].forEach.call(controls, function(el){
               el.classList.remove('is-active'); 
            });

            document.querySelector('.choose').style.display = 'none';
            worldEl.style.display = 'block';
            // Add mode to body.
            document.body.classList.add(options.animationMode.split(":")[0]);

            this.next();
            this.animate();
        };

        this.setArcVariant = function(h){
            this.arcVariant = parseInt(h);
        }

        this.setArcHeight = function(h){
            this.arcHeight = parseInt(h);
        }

        this.setGravity = function(g){
            this.g = parseFloat(g);
        }

        this.getAnimContext = function(){
            var canvas;
            if(!animContext){
                canvas = document.getElementById('animations');
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                animContext = canvas.getContext('2d');
            }
            return animContext;
        };
    }

    // The instance holder
    var instance;

    // An emulation of static variables and methods
    var _static  = {

        name:  "World",

        // Method for getting an instance. It returns
        // a singleton instance of a singleton object
        getInstance:  function( options ) {
            if( instance  ===  undefined )  {
                EventDispatcher.prototype.apply( WorldObject.prototype );
                instance = new WorldObject( options );
            }

            return  instance;

        }
    };

    return  _static;

})();

