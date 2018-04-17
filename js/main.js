"use strict";

var world = new World(options.world),
    poemSequence = [],
    poemIndex = 0,
    lr = new LoadRender();


function loadNextSet() {
    poemIndex += 1;
    if (poemIndex >= poemSequence.length) {
        poemIndex = 0;
    }
    lr.loadPoemSet(poemSequence[poemIndex][0], poemSequence[poemIndex][1]);
}

world.addEventListener('complete', function() {
    TweenLite.to(document.querySelector('.world'), options.endFade, {
        opacity : 0,
        delay : options.endDelay,
        onComplete: loadNextSet
    });
});

lr.addEventListener('config-loaded', function(evt) {
    poemSequence = evt.detail.sequence;
    poemIndex = 0;

    lr.loadPoemSet(poemSequence[poemIndex][0], poemSequence[poemIndex][1]);
});

var numLoaded = 0;
lr.addEventListener('poem-loaded', function() {
    numLoaded += 1;
    if (numLoaded < 2) {
        return;
    }
    numLoaded = 0;

    TweenLite.to(document.querySelector('.world'), options.startFade, { opacity : 1 });
    setTimeout(function() {
        world.start();
    }, (options.startFade + options.startDelay) * 1000);
});

lr.loadConfig('settings.json');
