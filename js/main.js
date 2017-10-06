"use strict";

var world = World.getInstance(options.world);
world.addEventListener('classchange', function(data){
    Utils.setActiveCb(data.newClass);
});

world.addEventListener('complete', function(){
    var controlsPDF = document.querySelector('.controls--pdf');
    controlsPDF.classList.add('is-active');
});

var lr = new LoadRender();
/*
lr.addEventListener('rendered', function(data){
    // Utils.setHistory(data.files);
    var startBtn = document.querySelector('.world-start button');
    startBtn.disabled = false;
    startBtn.addEventListener('click', function(e){
        e.currentTarget.disabled = 'disabled';
        world.start();
        // log(world.allWordClasses.diff(world.wordClasses));
        Utils.hideUnusedCb(world.allWordClasses.diff(world.wordClasses));
        Utils.setActiveCb(world.wordClasses[0]);
    });
});
*/
lr.addEventListener('rendered', function() {
    TweenLite.to(document.querySelector('.world'), options.startFade, { opacity : 1 });
    setTimeout(function() {
        world.start();
        Utils.hideUnusedCb(world.allWordClasses.diff(world.wordClasses));
        Utils.setActiveCb(world.wordClasses[0]);
    }, (options.startFade + options.startDelay) * 1000);
});


// lr.force('./data/dickinson/OneSeries-VIII.xml', './data/flanagan/On_Being_From_.xml');
// lr.loadLists('./data/test/content.json', './data/test/content.json');
lr.loadSequence('./data/sequence.json');
// lr.loadAsync();

/*
 * CONTROLS and SETTINGS
 * TODO: Move to seperate module.
 */

// Physics and animation config.
var setGravity = world.setGravity.bind(world),
    setArcHeight = world.setArcHeight.bind(world),
    setArcVariant = world.setArcVariant.bind(world),
    slidersConfig = [
        { title:"Gravity", cb: setGravity, value: world.g, min: 0.001, max : 0.2, step: 0.001 },
        { title:"Arc height", cb: setArcHeight, value: world.arcHeight, min: 50, max : 300, step: 1 },
        { title:"Arc height variant", cb: setArcVariant, value: world.arcVariant, min: 0, max : 50, step: 1 }
];

// Animation mode.
var animModes = ['dom', 'canvas:copy', 'canvas:text'],
    controlsAnimMode = document.querySelector('.controls--anim-mode .anim-mode');
Utils.initCheckboxes(animModes, options.world.animationMode, controlsAnimMode, function(target){
    options.world.animationMode = target.value;
});

// Word classes.
var setWordClass = world.setWordClass.bind(world),
    sliderTemplate = document.querySelector('.slider'),
    controlsFlight = document.querySelector('.controls--flight'),
    controlsWordClasses = document.querySelector('.controls--poem .word-classes'),
    controlsWCDebug = document.querySelector('.controls--poem .debug'),
    to;

[].forEach.call(slidersConfig, function(config){
    var clone = sliderTemplate.cloneNode(true);
    controlsFlight.appendChild(clone);
    Utils.initSlider(clone, config);
});
Utils.initCheckboxes(world.allWordClasses, world.wordClasses, controlsWordClasses, setWordClass);
var labels = controlsWordClasses.querySelectorAll('label');
[].forEach.call(labels, function(label){
    label.addEventListener('mouseover', function(){
        if(window.options.postags){
            var id = this.getElementsByTagName('input')[0].id;
            controlsWCDebug.innerHTML = window.options.postags[id];
            controlsWCDebug.style.opacity = 1;
            clearTimeout(to);
            to = setTimeout(function(){
                controlsWCDebug.style.opacity = 0;
            }, 10000);
        }
    });
});

// Download PDF
var downloadBtn = document.getElementById('pdf-download');
downloadBtn.addEventListener('click', function(){
    this.parentNode.classList.remove('is-active');
    Utils.downloadPDF();
});
