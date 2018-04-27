"use strict";

var world = new World(),
    lr = new LoadRender(),
    poemSequence,
    poemIndex,
    poemOutput = '',
    settings = {};


function parseConfig(rawData) {
    var data = jsyaml.load(rawData);

    settings.loggingEnabled = data.loggingEnabled;

    poemSequence = data.poem.sequence;
    poemIndex = data.poem.index;
    settings.isLooping = data.poem.looping;
    world.setWordClasses(data.poem.wordClasses);

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

    settings.fixCapitalization = data.animation.fixCapitalization;
    settings.startDelay = data.animation.startDelay;
    settings.endDelay = data.animation.endDelay;
    settings.startFade = data.animation.startFade;
    settings.endFade = data.animation.endFade;

    lr.loadPoemSet(poemSequence[poemIndex].left, poemSequence[poemIndex].right);
}

function recordPoems() {
    var poemString = '';
    document.querySelector('.poem1').childNodes.forEach(function(node) {
        poemString += (node.textContent + '\n');
    });
    poemString += '\n\n';
    document.querySelector('.poem2').childNodes.forEach(function(node) {
        poemString += (node.textContent + '\n');
    });
    poemOutput += (poemString + '\n\n\n===\n\n\n');
}

var numLoaded = 0;
lr.addEventListener('poem-loaded', function() {
    numLoaded += 1;
    if (numLoaded < 2) {
        return;
    }
    numLoaded = 0;

    TweenLite.to(document.querySelector('.world'), settings.startFade, { opacity : 1 });
    setTimeout(function() {
        world.start();
    }, (settings.startFade + settings.startDelay) * 1000);
});

function loadNextSet() {
    poemIndex += 1;
    if (poemIndex >= poemSequence.length) {
        if (settings.isLooping) {
            poemIndex = 0;
        } else {
            Utils.createDownload(poemOutput);
            return;
        }
    }
    lr.loadPoemSet(poemSequence[poemIndex].left, poemSequence[poemIndex].right);
}

world.addEventListener('complete', function() {
    if (!settings.isLooping) {
        recordPoems();
    }

    TweenLite.to(document.querySelector('.world'), settings.endFade, {
        opacity : 0,
        delay : settings.endDelay,
        onComplete: loadNextSet
    });
});

Utils.load('settings.yaml', 'text', parseConfig, console.error);
