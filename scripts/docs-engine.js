/**
*
* DocBase engine
* Appbase
* Henrique Sa, Feb '15
* MIT license
*
*/

!(function ($, angular){
    
    var jWindow = $(window);
    var angApp;

    var exports = this;
    var DocBase = exports.DocBase = {};
    var Events = DocBase.events = {};
    var Route = DocBase.route = {};

    /**
    * Github offers an API with a very strict, non-increasable limit for the client side.
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
                src: 'map.json',
                path: 'docs'
            },
            github: {
                user: 'user',
                repo: 'docs',
                path: 'docs',
                branch: 'master'
            },
            html5mode: false,
            angularAppName: 'docBaseApp'
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

        angApp = angular
            .module(opts.angularAppName, ['ngRoute'])
            .controller('URLCtrl', ['$scope', '$routeParams', '$location', '$timeout', Route.URLCtrl])
            .config(['$routeProvider', '$locationProvider', Route.config]);

        DocBase[opts.method]( opts[opts.method] || defaultOptions[opts.method] );
    }

    DocBase.github = function(options) {
        githubTree(options, function(map){
            if(checkSchema(map)){
                DocBase.map = map;
                jWindow.trigger('mapped');
                Events.bind();
            } else {
                throw 'GitHub tree fetching error.';
            }
        });
    }

    DocBase.file = function(options) {
        $.get(options.src)
        .success(function(map){
            if(checkSchema(map)){
                var v = Object.keys(map);
                if(v.length &&  map[v[0]][0].files.length && map[v[0]][0].files[0].name){
                    DocBase.map = map;
                    jWindow.trigger('mapped');
                    Events.bind();
                } else {
                    throw 'Map does not have a file entry. Check the documentation';
                }
            } else {
                throw 'Map file schema error. Check the documentation.';
            }
        })
        .error(function(error){
            throw error;
        });
    }

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

    Events.ready = function(){
        jWindow.trigger('docbase:ready');
    }

    Events.ajaxError = function(event, request){
        if(request.status === 403 && DocBase.options.method === 'github') {
            throw 'GitHub API quota exceeded.';
        }
    }

    /**
    * Parses title object, looking for specs such as three collums.
    * Simply make your fiirst markdown title an object to customize it.
    * Use double quotes on the markdown.
    * Example: {"title": "Actual title", "threeCollums": false}
    */
    Events.parseTitle = function(){
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
        
        Events.ready();
    };

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
        })
        .otherwise({
            redirectTo: '/'
        });

        $locationProvider.html5Mode(DocBase.options.html5mode);
    }

    Route.file = function(path){
        var options = DocBase.options.file;
        Flatdoc.run({
          fetcher: Flatdoc.file(options.path + path + '.md')
        });
    };

    Route.github = function(path){
        var options = DocBase.options.github;
        var ghRepo = options.user + '/' + options.repo;
        var ghPath = options.path + path + '.md';
        var branch = options.branch;

        Flatdoc.run({
            fetcher: Flatdoc.github(ghRepo, ghPath, branch)
        }); 
    };

    Route.URLCtrl = function($scope, $routeParams, $location, $timeout){
        if(DocBase.map || file) {
            mapLoaded();
        } else {
            jWindow.on('mapped', mapLoaded);
        }

        function mapLoaded(){
            var map = DocBase.map;
            var currentVersion = $routeParams.version;
            var versions = Object.keys(map);

            $timeout(function(){
                $scope.versions = versions;
                $scope.currentVersion = currentVersion || versions[versions.length-1];
                $scope.map = map;
            });
            
            var location = Route.updatePath($routeParams);
            $location.path(location.path);
            if(!location.fail){
                Route[DocBase.options.method](location.path);
            }
        }
    };

    Route.updatePath = function(params){
        var map = DocBase.map;
        var version = params.version;
        var folder = params.folder;
        var file = params.file;

        if(!map[version]){
            console.error('Version not mapped.');
            return {path: '/', fail: true};
        } 

        var mapFolder;
        if(folder){
            mapFolder = map[version].filter(function(folders){
                return folders.name === folder;
            });
            if(!mapFolder.length){
                console.error('Folder not mapped.');
                return {path: '/' + version, fail: true};
            }
        }
        if(file){
            var mapFile = mapFolder[0].files.filter(function(files){
                return files.name === file;
            });
            if(!mapFile.length){
                console.error('File not mapped.');
                return {path: '/' + version + '/' + file, fail: true};
            }
        }

        var path = '/' + version + '/';
        path += folder || map[version][0].name;
        path += '/';
        path += file || map[version][0].files[0].name;

        return {path: path, fail: false};
    }

    function checkSchema(map) {
        return validate = schema({
            '*': Array.of(schema({
                name: String,
                label: String,
                files: Array.of(schema({
                    name: String,
                    label: String
                }))
            }))
        })(map);
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

    /**
    * endsWith polyfill, from MDN
    * Created by Ripter, last edited by Mathias Bynens
    */
    function endsWith(subjectString, searchString, position){
      if(position === undefined || position > subjectString.length){
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    }
})(window.jQuery, window.angular);
