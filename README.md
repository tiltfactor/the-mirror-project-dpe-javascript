The Mirror Project: Dynamic Poem Environment
=============================================

This project displays a pair of poems and slowly moves words between the two.
Words may be switched if they are the same part of speech. The animation goes
through several pairs of poems in this way.


## Usage

This is intended to be used with the [Poem
Parser](https://github.com/garethfoote/the-mirror-project), which reads plain
text poems and labels the part of speech for each word. The output files are
saved in the XML format used by this project. However, you may wish to create
the XML files manually, particularly if the text is not in English. Examples
of the XML format can be found in the `data/` directory.

For each poem to be included in the animation, create an XML file as described
above. Then, define the sequence of poems in the `settings.json` file. The
settings file is also where you can specify which parts of speech should be
moved.


## Settings

Various options can be managed via the settings file `settings.json`. The file
is divided into several sections, as follows.

### Poem Settings

 - looping: true/false (when the end of the sequence is reached, will it loop?)
 - index: number between 0 and (length of the sequence - 1)
 - wordClasses: array of labels, matching the labels used in the poem files
 - sequence: an array of poem pairs. Each poem is specified by its location

### Layout

 - fontSize: ##px
 - innerMargin: ##px (the distance between the center of the page and the inside
   edges of the poems)
 - outerMargin: ##px (the distance between the edge of the page and the outside
   edges of the poems)
 - topMargin: ##px (the distance between the top of the page and the top of the
   poems)

### Animation

 - animationMode: one of "canvas:copy", "canvas:text", or "dom"
 - gravity: number (the speed at which letters fall)
 - arcHeight: number (the height of each letter's arc)
 - arcVariant: number (the amount by which letters may vary from the arc height)
 - fixCapitalization: true/false (whether the capitalization of source words are
   changed to match the target words)
 - startDelay: number of seconds (the delay between when a poem is shown and
   when words begin to move)
 - endDelay: number of seconds (the delay between when words finish moving and
   when the poem is hidden)
 - startFade: number of seconds (duration of the fade-in before a poem starts)
 - endFade: number of seconds (duration of the fade-out after a poem ends)

### [Uncategorized]

 - loggingEnabled: true/false (whether debugging info will be written to the
   web console)
