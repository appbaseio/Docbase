/**
*
* DocBase engine
* Henrique Sa, Feb 2015
* MIT license
*
*/

Flatdoc.run({
  fetcher: Flatdoc.file('/bower_components/flatdoc/examples/examples.md'),
});

$(function(){

    /**
    * Parses title object, looking for specs such as three collums.
    * Simply make your fiirst markdown title an object to customize it.
    * Use double quotes on the markdown.
    * Example: {"title": "Actual title", "threeCollums": false}
    */

    $(this).bind('flatdoc:ready', function(){
        var element = $('[role~="flatdoc-content"] h1:first');
        var content = element.html();
        try {
            content = content.replace(/\u201D/g, '"');
            content = content.replace(/\u201C/g, '"');
            content = JSON.parse(content);
            
            element.html(content.title);

            if(content.threeCollums) {
                $('body').removeClass('no-literate');
            } else {
                $('body').addClass('no-literate');
            }

        } catch (e) {/* No JSON object found, keep title as-is */};

        /**
        * Default styling hides the title, display it when it's parsed.
        */
        element.css({display: 'block'});
    });
});