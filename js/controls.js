
var settingsButton = document.getElementById('settings-button'),
    settingsPanel = document.getElementById('settings-panel'),
    fontSizeSlider = document.getElementById('font-size-slider'),
    fontSizeOutput = document.getElementById('font-size-output'),
    poemWidthSlider = document.getElementById('poem-width-slider'),
    poemWidthOutput = document.getElementById('poem-width-output'),
    bookWidthSlider = document.getElementById('book-width-slider'),
    bookWidthOutput = document.getElementById('book-width-output'),

    settingsVisible = false;

settingsButton.addEventListener('click', function() {
    settingsVisible = !settingsVisible;
    settingsPanel.style.display = settingsVisible ? 'block' : 'none';
    document.querySelectorAll('.book, .poem-container, .poem1, .poem2').forEach(
        (el) => el.classList.toggle('bordered')
    );
});

function initSlider(sliderEl, outputEl, attributes, valueFunc, changeFunc) {
    Object.keys(attributes).forEach(function(key) {
        sliderEl.setAttribute(key, this[key]);
    }, attributes);
    outputEl.value = valueFunc(sliderEl.value);
    changeFunc(sliderEl.value);
    sliderEl.addEventListener('input', function() {
        var value = valueFunc(this.value);
        outputEl.value = value;
        changeFunc(this.value);
    });
}

initSlider(fontSizeSlider, fontSizeOutput,
    {
        min : 10,
        max : 50,
        step : 1,
        value : 25
    },
    (value) => value + 'px',
    (value) => document.querySelector('body').style['font-size'] = value + 'px'
);

initSlider(poemWidthSlider, poemWidthOutput,
    {
        min : 0,
        max : 100,
        step : 1,
        value : 80
    },
    (value) => value + '%',
    function(value) {
        document.querySelectorAll('.poem1, .poem2')
                .forEach((el) => el.style.width = value + '%');
    }
);

initSlider(bookWidthSlider, bookWidthOutput,
    {
        min : 0,
        max : 100,
        step : 1,
        value : 80
    },
    (value) => value + '%',
    (value) => document.querySelector('.book').style.width = value + '%'
);
