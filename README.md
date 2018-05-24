The Mirror Project: Dynamic Poem Environment
=============================================

This project displays a pair of poems and slowly moves words between the two.
Words may be switched if they are the same part of speech. The animation goes
through several pairs of poems in this way.


## Usage

This is intended to be used with a poem parser which reads plain text poems and
labels the part of speech for each word. The output files are saved in the XML
format used by this project. However, you may wish to create the XML files
manually, particularly if the text is not in English. Examples of the XML format
can be found in the `data/` directory.

For each poem to be included in the animation, create an XML file as described
above. Then, define the sequence of poems in the `settings.yaml` file. The
settings file is also where you can specify which parts of speech should be
moved.
