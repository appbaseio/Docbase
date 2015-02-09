/**
*
* DocBase engine
* Henrique Sa, Feb 2015
* MIT license
*
*/

!(function ($){
    
    var jWindow = $(window);

    var exports = this;
    var DocBase = exports.DocBase = {};
    var Render = DocBase.render = {};
    var Events = DocBase.events = {};

    /**
    * Github offers an API with a very strict, non-increasable limit.
    * If your docs will be for internal use or would get limited hits per IP,
    * you can use gh to fetch your markdown files and itterate through them.
    * As this is a very limited option, the default method on this engine is a manual spec.
    */

    DocBase.run = function(options) {
        Events.bind();
        var defaultOptions = {
            method: 'file',
            file: {
                src: 'map.json',
                path: 'docs'
            },
            github: {
                user: 'user',
                repo: 'docs',
                path: 'docs',
                branch: 'master'
            }
        };
        options = options || defaultOptions;
        DocBase[options.method]( options[options.method] || defaultOptions[options.method] );
    }

    DocBase.github = function(options) {
        githubTree(options, Render.navbar);
    }

    DocBase.file = function(options) {
        $.get(options.src).success(Render.navbar).error(function(error){
            throw error;
        });
    }

    Render.items = '[role~="flatdoc-content"], [role~="flatdoc-menu"]';

    Render.hide = function(){
        $(Render.items).addClass('hidden');
    }

    Render.show = function(){
        $(Render.items).removeClass('hidden');
    }

    Render.navbar = function(tree){
        var versions = [];
        for(version in tree) {
            versions.push(version);
        }
        Events.bind();
        Flatdoc.run({
          fetcher: Flatdoc.file('/bower_components/flatdoc/examples/examples.md'),
        });
    }

    /**
    * Parses title object, looking for specs such as three collums.
    * Simply make your fiirst markdown title an object to customize it.
    * Use double quotes on the markdown.
    * Example: {"title": "Actual title", "threeCollums": false}
    */
    Events.parseTitle = function(){
        Render.hide();
        var element = $('[role~="flatdoc-content"] h1:first');
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

        Render.show();
    };

    Events.hashChange = function(){
        var hash = window.location.hash;
        if(hash) {
            handleHash(hash);
        }
    };

    Events.switchBind = function(state){
        jWindow[state]('flatdoc:ready', Events.parseTitle);
        jWindow[state]('hashchange', Events.hashChange);
    }

    Events.bind = function(){
        Events.switchBind('on');
    };

    Events.unbind = function(){
        Events.switchBind('off');
    }


    function handleHash(hash){
        if(hash) {
            hash = hash.substring(1);
            if(hash.charAt(0) !== '/') {
                //return splashPage();
            } else {
                var hashSplit = hash.split('/');

            }
        }
    }

    function githubTree(options, callback){
        
        var full_path = options.src;
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
                    + options.user + '/' + options.repo + '/';

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
})(window.jQuery);

DocBase.run();