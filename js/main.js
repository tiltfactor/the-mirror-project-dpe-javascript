"use strict";

var world = new World(),
    lr = new LoadRender(),
    poemSequence,
    poemIndex = 0,
    isLooping = true;


function parseConfig(data) {
    poemSequence = data.poem.sequence;
    poemIndex = data.poem.index;
    isLooping = data.poem.looping;

    document.body.style['font-size'] = data.layout.fontSize;
    document.querySelector('.book').style['margin-top'] = data.layout.topMargin;
    var poem1 = document.querySelector('.poem1');
    poem1.style['margin-left'] = data.layout.outerMargin;
    poem1.style['margin-right'] = data.layout.innerMargin;
    var poem2 = document.querySelector('.poem2');
    poem2.style['margin-left'] = data.layout.innerMargin;
    poem2.style['margin-right'] = data.layout.outerMargin;

    world.setAnimationMode(data.animation.animationMode);
    world.setGravity(data.animation.gravity);
    world.setArcHeight(data.animation.arcHeight);
    world.setArcVariant(data.animation.arcVariant);

    lr.loadPoemSet(poemSequence[poemIndex][0], poemSequence[poemIndex][1]);
}

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

function loadNextSet() {
    poemIndex += 1;
    if (poemIndex >= poemSequence.length) {
        if (isLooping) {
            poemIndex = 0;
        } else {
            return;
        }
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


Utils.load('settings.json', true, parseConfig, console.error);
