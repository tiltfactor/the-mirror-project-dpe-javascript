"use strict";

var world = new World(),
    lr = new LoadRender(),
    poemSequence,
    poemIndex,
    poemOutput = '',
    settings = {};


function parseConfig(rawData) {
    var data = jsyaml.load(rawData);

    settings.fileExportEnabled = data.fileExportEnabled;
    settings.loggingEnabled = data.loggingEnabled;

    poemSequence = data.poem.sequence;
    // If we are exporting to file, ignore the poem index
    poemIndex = settings.fileExportEnabled ? 0 : data.poem.index;
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

function collectPoem(parentElement) {
    var poemLines = Array.from(parentElement.childNodes, node => node.textContent);
    poemLines[0] = '[[' + poemLines[0] + ']]';
    return poemLines.join('\n');
}

function recordPoems() {
    var poemString = collectPoem(document.querySelector('.poem1'));
    poemString += '\n\n\n';
    poemString += collectPoem(document.querySelector('.poem2'));
    poemString += '\n\n\n===\n\n\n';
    poemOutput += poemString;
}

var numLoaded = 0;
lr.addEventListener('poem-loaded', function() {
    numLoaded += 1;
    if (numLoaded < 2) {
        return;
    }
    numLoaded = 0;

    if (settings.fileExportEnabled) {
        world.start();
    } else {
        TweenLite.to(document.querySelector('.world'), settings.startFade, { opacity : 1 });
        setTimeout(function() {
            world.start();
        }, (settings.startFade + settings.startDelay) * 1000);
    }
});

function loadNextSet() {
    poemIndex += 1;
    if (poemIndex >= poemSequence.length) {
        if (settings.fileExportEnabled) {
            Utils.createDownload(poemOutput);
            return;
        } else if (!settings.isLooping) {
            return;
        } else {
            poemIndex = 0;
        }
    }
    lr.loadPoemSet(poemSequence[poemIndex].left, poemSequence[poemIndex].right);
}

world.addEventListener('complete', function() {
    if (settings.fileExportEnabled) {
        recordPoems();
        loadNextSet();
    } else {
        TweenLite.to(document.querySelector('.world'), settings.endFade, {
            opacity : 0,
            delay : settings.endDelay,
            onComplete: loadNextSet
        });
    }
});

Utils.load('settings.yaml', 'text', parseConfig, console.error);
