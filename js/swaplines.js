"use strict";

function SwapLines(source, target){

    var self = this,
        targetDup,
        sourceBbox, targetBbox,
        world = World.getInstance(),
        delayMs = 250, arcHeight = world.arcHeight,
        rtl;

    sourceBbox = source.getBoundingClientRect();
    targetBbox = target.getBoundingClientRect();

    var firstLetterSource = source.textContent.substr(0,1),
        firstLetterTarget = target.textContent.substr(0,1),
        isSourceCapitalised = firstLetterSource === firstLetterSource.toUpperCase(),
        isTargetCapitalised = firstLetterTarget === firstLetterTarget.toUpperCase();
    
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
        var replacement = source.textContent,
            isStringChanging = false, letter;

        // If the capitalisation is different.
        if(isSourceCapitalised !== isTargetCapitalised){
            letter = source.textContent.substr(0,1);
            replacement = (isSourceCapitalised) ? letter.toLowerCase() : letter.toUpperCase();
            replacement += source.textContent.substr(1) 
            isStringChanging = true;
        }

       targetLine.swap(source.textContent, replacement);
    });

    function handleProgress(e){
        if(e.progress >= 50){
            targetLineAnimations(e.framesRemaining);
            this.removeEventListener('progress', handleProgress);
        }
    }

    function targetLineAnimations(framesRemaining){
        var fps = (1000/world.frameTime).toFixed(1),
            flightTimeRemaining = (framesRemaining/fps)*1000,
            difference = targetBbox.width-sourceBbox.width;

        // If rtl and difference is minus (i.e. we're creating space for the 
        // incoming word) then animation needs to be complete by the time
        // the first letter lands.

        targetLine.fillSpace((0.5 + difference) | 0, (0.5 + flightTimeRemaining) | 0);
        targetLine.fadeOut(rtl, flightTimeRemaining);
    }

};

EventDispatcher.prototype.apply( SwapLines.prototype );
