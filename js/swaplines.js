"use strict";

function SwapLines(source, target){

    var self = this,
        targetDup,
        sourceBbox, targetBbox,
        delayMs = 250, arcHeight = 200,
        rtl;

    sourceBbox = source.getBoundingClientRect();
    targetBbox = target.getBoundingClientRect();

    // Direction of travel.
    rtl = sourceBbox.left > targetBbox.left;

    // Ensure arcHeight will reach target if it is above source.
    arcHeight = (arcHeight-(sourceBbox.top-targetBbox.top)<0)
        ? sourceBbox.top-targetBbox.top+1 : arcHeight;

    var vDistance1 = arcHeight,
        vDistance2 = arcHeight-(sourceBbox.top-targetBbox.top),
        hDistance = targetBbox.left-sourceBbox.left;

    targetDup = Utils.duplicate(target);
    target.parentNode.insertBefore(targetDup, target);
    target.parentNode.removeChild(target);

    var targetLine = new TargetLine(targetDup);

    var sourceLine = new SourceLine(source, Utils.duplicate(source));
    sourceLine.throwDuplicate(rtl, hDistance, vDistance1, vDistance2, targetBbox.top);

    sourceLine.addEventListener('progress', handleProgress);
    sourceLine.addEventListener('progress', function(e){
        if(e.progress >= 100){
            self.dispatchEvent({type:'complete'});
        }
    });

    sourceLine.addEventListener('ground', function(e){
       targetLine.swap(source.textContent);
    });

    function handleProgress(e){
        if(e.progress >= 50){
            targetLineAnimations(e.framesRemaining);
            this.removeEventListener('progress', handleProgress);
        }
    }

    function targetLineAnimations(framesRemaining){
        var fps = (1000/frameTime).toFixed(1),
            flightTimeRemaining = (framesRemaining/fps)*1000,
            difference = targetBbox.width-sourceBbox.width;

        // If rtl and difference is minus (i.e. we're creating space for the 
        // incoming word) then animation needs to be complete by the time
        // the first letter lands.

        targetLine.fillSpace(difference, flightTimeRemaining);
        targetLine.fadeOut(rtl, flightTimeRemaining);
    }

};

EventDispatcher.prototype.apply( SwapLines.prototype );
