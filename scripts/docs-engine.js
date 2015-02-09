/**
*
* DocBase engine
* Henrique Sa, Feb 2015
* MIT license
*
*/

/**
* Github offers an API with a very strict, non-increasable limit.
* If your docs will be for internal use or would get limited hits per IP,
* you can use this code to fetch your markdown files and itterate through them.
* As this is a very limited option, the default method on this engine is a manual spec.
*/

//$.get('map.json', mapper);

$(function(){
    var exports = this;


    /**
    * Parses title object, looking for specs such as three collums.
    * Simply make your fiirst markdown title an object to customize it.
    * Use double quotes on the markdown.
    * Example: {"title": "Actual title", "threeCollums": false}
    */

    $(this).bind('flatdoc:ready', function(){
        var element = $('[role~="flatdoc-content"] h1:first');
        var menu = $('div[role~="flatdoc-menu"]');
        var menuTitle = $( '#' + element.attr('id') + '-link' );

        var content = element.html();
        try {
            content = content.replace(/\u201D/g, '"');
            content = content.replace(/\u201C/g, '"');
            content = JSON.parse(content);
            
            element.html(content.title);
            menuTitle.html(content.title);

            if(content.threeCollums) {
                $('body').removeClass('no-literate');
            } else {
                $('body').addClass('no-literate');
            }

        } catch (e) {/* No JSON object found, keep title as-is */};

        /**
        * Default styling hides the title, display it when it's parsed.
        */
        element.addClass('visible');
        menu.addClass('visible');
    });

    /**
    * Dynamic URLs
    */

    var hash = window.location.hash;
    
    if(hash) {
        hash = hash.substring(1);
        if(hash.charAt(0) !== '/') {
            //return splashPage();
        } else {
            var hashSplit = hash.split('/');

        }
    }

    Flatdoc.run({
      fetcher: Flatdoc.file('/bower_components/flatdoc/examples/examples.md'),
    });

    function githubTree(callback){
        
        var full_path = options.gh.src_folder;
        if(full_path.charAt(0) === '/') {
            full_path = full_path.substring(1);
        }
        if(full_path.charAt(full_path.length-1) === '/'){
            full_path = full_path.substring(0, full_path.length-1);
        }

        var path = full_path.split('/');
        var deleted = path.splice(path.length-1, 1);
        path.join('/');
        deleted = deleted[0];

        var baseurl = 'https://api.github.com/repos/'
                    + options.gh.user + '/' + options.gh.repo + '/';

        var url = baseurl  + 'contents/' + path;

        $.get(url, {ref: options.branch}, function(data){
            var sha = data.filter(function(each){
                return each.name === deleted;
            })[0].sha;

            $.get(baseurl + 'git/trees/' + sha + '?recursive=1', function(tree) {
                tree = tree.tree.filter(function(each){
                    return endsWith(each.path, '.md');
                });

                var map = {};

                tree.forEach(function(each){
                    console.log(each.path)
                    var sub_path = each.path.split('/');
                    /* assuming sub_path[0] is the version,
                     * sub_path[1] is the folder,
                     * and sub_path[2] is the file.
                     */
                    var version = sub_path[0];
                    var folder = sub_path[1];
                    var file = sub_path[2].substring(0, sub_path[2].length-3);

                    // Version is new
                    if(!map[version]){
                        map[version] = [];
                    }
                    
                    // Folder is new
                    if( !map[version].filter(function(a){ return a.name === folder }).length ) {
                        map[version].push({ label: folder, name: folder, files: [] });
                    }
                    
                    // Add file
                    map[version].forEach(function(each){
                        if(each.name === folder)
                            each.files.push({name: file, label: file});
                    });

                });
                
                callback(map);

            });

        });
    }

    function endsWith(subjectString, searchString, position) {
      if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
});