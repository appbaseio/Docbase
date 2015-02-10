/**
*
* DocBase engine
* Henrique Sa, Feb 2015
* MIT license
*
*/

!(function ($, angular){
    
    var jWindow = $(window);
    var angApp = angular.module('docBaseApp', ['ngRoute']);

    var exports = this;
    var DocBase = exports.DocBase = {};
    var Render = DocBase.render = {};
    var Events = DocBase.events = {};
    var Route = DocBase.route = {};

    /**
    * Github offers an API with a very strict, non-increasable limit.
    * If your docs will be for internal use or would get limited hits per IP,
    * you can use gh to fetch your markdown files and itterate through them.
    * As this is a very limited option, the default method on this engine is a manual spec.
    */

    DocBase.methods = ['file', 'github'];

    DocBase.run = function(opts) {
        Events.bind();

        var defaultOptions = {
            method: 'file',
            file: {
                src: '/map.json',
                path: 'docs/'
            },
            github: {
                user: 'user',
                repo: 'docs/',
                path: '/docs',
                branch: 'master'
            }
        };

        $.extend(defaultOptions, opts);
        opts = defaultOptions;

        // Removes trailing '/'s.
        DocBase.methods.forEach(function(method){
            var options = opts[method];
            Object.keys(options).forEach(function(key){
                var value = options[key];
                value = value.charAt(0) === '/' ? value.substring(1) : value;
                value = endsWith(value, '/') ? value.substring(0, value.length-1) : value;
                options[key] = value;
            });
        });

        DocBase.options = opts;

        angApp
            .controller('URLCtrl', ['$scope', '$routeParams', '$location', Route.URLCtrl])
            .config(['$routeProvider', '$locationProvider', Route.config]);

        DocBase[opts.method]( opts[opts.method] || defaultOptions[opts.method] );
    }

    DocBase.github = function(options) {
        githubTree(options, function(map){
            DocBase.map = map;
            jWindow.trigger('mapped');
            Render.navbar(map);
        });
    }

    DocBase.file = function(options) {
        $.get(options.src)
        .success(function(map){
            DocBase.map = map;
            jWindow.trigger('mapped');
            Render.navbar(map);
        })
        .error(function(error){
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

    Render.navbar = function(map){
        var _elVersionList = $('[version-list]');
        var _elCurrentVersion = $('[current-version]');

        var versions = [];
        for(version in map) {
            versions.push(version);
        }

        _elVersionList.html(' ');
        _elCurrentVersion.html(versions[versions.length-1]);

        versions.forEach(function(version){
            _elVersionList.append('<li><a href="#/'+version+'" ver>'+version+'</a></li>');
        });

        Events.bind();
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

    Events.switchBind = function(state){
        jWindow[state]('flatdoc:ready', Events.parseTitle);
        jWindow[state]('ajaxError', Events.ajaxError);
    }

    Events.bind = function(){
        Events.switchBind('on');
    };

    Events.unbind = function(){
        Events.switchBind('off');
    }

    Events.ajaxError = function(event, request){
        if(request.status === 403 && DocBase.options.method === 'github') {
            console.error('GitHub API quota exceeded.');
        } else if (request.status === 404 && DocBase.options.method === 'file') {
            console.error('Mapped file not found.');
        }
    }

    Route.config = function($routeProvider, $locationProvider){
        $routeProvider
        .when('/:version/:folder/:file', {
            templateUrl: '/html/flatdoc.html',
            controller: 'URLCtrl'
        })
        .when('/:version/:folder', {
            templateUrl: '/html/flatdoc.html',
            controller: 'URLCtrl'
        })
        .when('/:version', {
            templateUrl: '/html/flatdoc.html',
            controller: 'URLCtrl'
        })
        .when('/', {
            templateUrl: '/html/main.html'
        });
        //$locationProvider.html5Mode(true);
    }

    Route.file = function(path){
        Flatdoc.run({
          fetcher: Flatdoc.file(DocBase.options.file.path + path + '.md')
        });
    };

    Route.github = function(path){
        var ghRepo = DocBase.options.github.user + '/' + DocBase.options.github.repo;
        var ghPath = DocBase.options.github.path + path + '.md';
        var branch = DocBase.options.github.branch;

        Flatdoc.run({
            fetcher: Flatdoc.github(ghRepo, ghPath, branch)
        }); 
    };

    Route.URLCtrl = function($scope, $routeParams, $locationProvider){
        var version = $routeParams.version;
        var folder = $routeParams.folder;
        var file = $routeParams.file;

        if(DocBase.map || file) {
            var path = Route.updatePath(DocBase.map, version, folder, file);
            $locationProvider.path(path);
            Route[DocBase.options.method](path);
        } else {
            jWindow.on('mapped', function(){
                var path = Route.updatePath(DocBase.map, version, folder);
                $locationProvider.path(path);
                Route[DocBase.options.method](path);
            });
        }
    };

    Route.mainCtrl = function(){

    };

    Route.updatePath = function(map, version, folder, file){

        if(!map[version]){
            throw 'Version not mapped.';
        }

        var mapFolder;
        if(folder){
            mapFolder = map[version].filter(function(folders){
                return folders.name === folder;
            });
            if(!mapFolder.length){
                throw 'Folder not mapped.';
            }
        }
        if(file){
            var mapFile = mapFolder[0].files.filter(function(files){
                return files.name === file;
            });
            console.log(file, map, mapFile, mapFolder)
            if(!mapFile.length){
                throw 'File not mapped.';
            }
        }

        var path = '/' + version + '/';
        path += folder || map[version][0].name;
        path += '/';
        path += file || map[version][0].files[0].name;

        return path;
    }

    function githubTree(options, callback){
        var full_path = options.path;

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
})(window.jQuery, window.angular);

DocBase.run();
