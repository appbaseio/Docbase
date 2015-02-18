/**
*
* Docbase engine
* Appbase
* Henrique Sa, Feb '15
* MIT license
*
*/

!(function ($, angular){
    
    var jWindow = $(window);
    var angApp;

    var exports = this;
    var Docbase = exports.Docbase = {};
    var Events = Docbase.events = {};
    var Route = Docbase.route = {};

    /**
    * Github offers an API with a very strict, non-increasable limit for the client side.
    * Docbase uses this API to make a map of your markdown files, and then fetches
    * them through get requests to GitHub Pages, not the API. As there is a small chance
    * the GitHub quota will be exceeded before the docs are mapped, keep a map file (JSON)
    * in the root of your site so that can be fetched.
    * Only use HTML5 mode if you're hosting it yourself, requires server config.
    */

    Docbase.methods = ['file', 'github'];

    Docbase.run = function(options) {
        var defaults = {
            method: 'github',
            path: 'docs',
            map: {
                file: 'map.json',
                path: 'docs'
            },
            github: {
                /*user: 'user',
                repo: 'repo',*/
                path: '/',
                branch: 'gh-pages',
                editGithubBtn: true
            },
            html5mode: false,
            indexType: 'html',
            indexSrc: 'v1/path/index.md',
            indexHtml: 'html/main.html',
            flatdocHtml: 'html/flatdoc.html',
            angularAppName: 'docbaseApp'
        };

        options = $.extend({}, defaults, options);

        if(options.method === 'github') {
            if(!options.github.user || !options.github.repo) {
                throw 'Missing GitHub user/repo info.';
            }
        }

        // Removes trailing '/'s.
        Docbase.methods.forEach(function(method){
            var properties = options[method];
            Object.keys(properties).forEach(function(key){
                properties[key] = cutTrailingSlashes(properties[key]);
            });
        });
        options.map.path = cutTrailingSlashes(options.map.path);
        options.path = cutTrailingSlashes(options.path);

        Docbase.options = options;

        Events.bind();

        angApp = angular
            .module(options.angularAppName, ['ngRoute'])
            .factory('FlatdocService', ['$q', '$route', '$location', '$anchorScroll', Route.fetch])
            .controller('URLCtrl', ['$scope', '$location', 'data', Route.URLCtrl])
            .controller('MainCtrl', ['$location', Route.mainCtrl])
            .config(['$routeProvider', '$locationProvider', Route.config])
            .run(
                ['$rootScope', '$location', '$routeParams', '$anchorScroll',
                '$route', Route.anchorConfig]
            );

        Docbase[options.method](options[options.method]);
    }

    Docbase.github = function(options) {
        githubTree(options, function(error, map){
            if(error) {
                Docbase.file(Docbase.options.map);
            } else if(checkSchema(map)){
                Docbase.map = map;
                jWindow.trigger('mapped');
                Events.bind();
            } else {
                throw 'GitHub tree mapping error.';
            }
        });
    }

    Docbase.file = function(options) {
        $.get(options.path + '/' + options.file)
        .success(function(map){
            if(checkSchema(map)){
                var v = Object.keys(map);
                if(v.length &&  map[v[0]][0].files.length && map[v[0]][0].files[0].name){
                    Docbase.map = map;
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
        if(request.status === 403 && Docbase.options.method === 'github') {
            console.error('Github API quota exceeded.');
        }
    }

    /**
    * Parses title object, looking for specs such as three columns.
    * Simply make your fiirst markdown title an object to customize it.
    * Use double quotes on the markdown.
    * Example: {"title": "Actual title", "threeColumns": false}
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

            if(content.threeColumns) {
                $('body').removeClass('no-literate');
            } else {
                $('body').addClass('no-literate');
            }

            Events.parsed = true;

        } catch (e) {
            // No JSON object found, keep title as-is, but disable three-collums
            if(!Events.parsed) {
                $('body').addClass('no-literate');
            }
        };
        
        Events.ready();
    };

    Route.config = function($routeProvider, $location, $rootScope, $anchorScroll){
        var flatdocURL = Docbase.options.flatdocHtml;
        var mainURL = Docbase.options.indexHtml;
        var resolve = {
            data: function(FlatdocService) {
                return FlatdocService.getData().then(function(data){
                    return data;
                });
            }
        }

        $routeProvider
        .when('/:version/:folder/:file', {
            templateUrl: flatdocURL,
            controller: 'URLCtrl',
            resolve: resolve
        })
        .when('/:version/:folder', {
            templateUrl: flatdocURL,
            controller: 'URLCtrl',
            resolve: resolve
        })
        .when('/:version', {
            templateUrl: flatdocURL,
            controller: 'URLCtrl',
            resolve: resolve
        })
        .when('/', {
            templateUrl: mainURL,
            controller: 'MainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
        $location.html5Mode(Docbase.options.html5mode);
    }

    Route.anchorConfig = function($rootScope, $location, $routeParams, $anchorScroll, $route){
        
        /**
        * Hack to prevent route reload when hash is changed.
        * Makes sure only the hash was change and intercepts the event.
        */

        $rootScope.$on('$locationChangeStart', function(evnt, newRoute, oldRoute){ 
            var firstRoute = newRoute.split('#');
            var hash = firstRoute[firstRoute.length-1];

            firstRoute.splice(firstRoute.length-1, 1);
            firstRoute = firstRoute.join('#');

            var secondRoute = oldRoute.split('#');
            secondRoute.splice(secondRoute.length === 2 ? 2 : secondRoute.length-1, 1);
            secondRoute = secondRoute.join('#');

            if(firstRoute === secondRoute && (newRoute !== oldRoute)) {
                
                $location.hash(hash);
                var lastRoute = $route.current;
                var unbind = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    unbind();
                });
                $anchorScroll();
            }
        });

        /**
        * Initial scroll to hash on page load.
        */

        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            jWindow.on('docbase:ready', function(){
                $anchorScroll();
                $('.content').find('pre code').each(function() {
                    $(this).addClass("prettyprint");
                });
                prettyPrint();
            });
        });
    }

    Route.fetch = function($q, $route, $location, $anchorScroll){
        function fetcher() {
            var deferred = $q.defer();
            var options = Docbase.options;

            if(Docbase.map) {
                mapLoaded();
            } else {
                jWindow.on('mapped', mapLoaded);
            }

            function mapLoaded(){
                var map = Docbase.map;
                var retObj = {};
                var currentVersion = $route.current.params.version;
                var versions = Object.keys(map);
                var location = Route.updatePath($route.current.params);

                retObj.versions = versions;
                retObj.currentVersion = currentVersion || versions[versions.length-1];
                retObj.map = map;
                retObj.locationPath = location.path;

                if(!location.fail){
                    var options = Docbase.options;
                    var gh = Docbase.options.github;

                    var url = 'https://github.com/'
                    + gh.user + '/' + gh.repo
                    + '/tree/' + gh.branch + '/'
                    + options.path + location.path + '.md';

                    retObj.github = url;

                    Events.parsed = false;

                    Flatdoc.file(options.path + location.path + '.md')(function(err, markdown){
                        var data = Flatdoc.parser.parse(markdown, function(code){
                            return Flatdoc.highlighters.generic(code)
                        });
                        retObj.markdown = data;
                        deferred.resolve(retObj);
                    });

                } else {
                    retObj.github = false;
                    deferred.resolve(retObj);
                }
            }
            return deferred.promise;
        }

        return {
            getData: function(){
                return new fetcher();
            }
        }
    };

    Route.URLCtrl = function($scope, $location, data){
        $location.path(data.locationPath);

        if(!data.fail){
            $scope.versions = data.versions;
            $scope.currentVersion = data.currentVersion;
            $scope.map = data.map;
            $scope.github = data.github;
            
            var content = data.markdown;

            $('[role="flatdoc-content"]').html(content.content.find('>*'));
            $('[role="flatdoc-menu"]').html(Flatdoc.menuView(content.menu));

            jWindow.trigger('flatdoc:ready');
        }
    };

    Route.mainCtrl = function($location){
        if(Docbase.options.indexType === 'markdown') {
            var path = Docbase.options.indexSrc;
            if(endsWith(path, '.md')){
                path = path.substring(0, path.length-3);
            }
            if(path.charAt(0) !== '/'){
                path = '/' + path;
            }

            $location.path(path);
        }
    };

    Route.updatePath = function(params){
        var map = Docbase.map;
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

        folder = folder || map[version][0].name;
        var folderObj = map[version].filter(function(each){
            return each.name === folder;
        })[0];
        file = file || folderObj.files[0].name;

        var path = '/' + version + '/' + folder + '/' + file;

        return {path: path, fail: false};
    };

    function cutTrailingSlashes(value){
        if(!angular.isString(value)){
            return value;
        }

        value = value.charAt(0) === '/' ? value.substring(1) : value;
        return endsWith(value, '/') ? value.substring(0, value.length-1) : value;
    }

    function checkSchema(map){
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

        $.get(url, {ref: options.branch})
        .success(function(data){
            var sha = data.filter(function(each){
                return each.name === deleted;
            })[0].sha;

            $.get(baseurl + 'git/trees/' + sha + '?recursive=1')
            .success(function(tree) {
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
                    if(sub_path.length >= 3){
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
                    }
                });
                
                callback(null, map);

            })
            .error(function(error){
                callback(error);
            });
        })
        .error(function(error){
            callback(error);
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