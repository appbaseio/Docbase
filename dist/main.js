
// FILE: scripts/docbase.js
/**
 *
 * Docbase engine
 * Appbase
 * Henrique Sa, Feb '15
 * MIT license
 *
 */

(function($, angular) {

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

    Docbase.methods = ['file', 'github', 'generic'];

    Docbase.run = function(options) {
        var defaults = {
            method: 'github',
            map: {
                file: 'map.json',
                path: ''
            },
            file: {
                path: 'docs'
            },
            github: {
                /*user: 'user',
                repo: 'repo',*/
                path: '/',
                branch: 'gh-pages',
                editGithubBtn: true
            },
            generic: {
                baseurl: '',
                path: '/'
            },
            html5mode: false,
            indexType: 'html',
            indexSrc: 'v1/path/index.md',
            indexHtml: 'html/main.html',       // dochub entry page
            flatdocHtml: 'html/flatdoc.html',  // top navbar, and markdown layouts
            angularAppName: 'docbaseApp'
        };

        options = $.extend({}, defaults, options);

        if (options.method === 'github') {
            if (!options.github.user || !options.github.repo) {
                throw 'Missing GitHub user/repo info.';
            }
        }

        // Removes trailing '/'s.
        Docbase.methods.forEach(function(method) {
            var properties = options[method];
            Object.keys(properties).forEach(function(key) {
                properties[key] = cutTrailingSlashes(properties[key]);
            });
        });
        options.map.path = cutTrailingSlashes(options.map.path);

        Docbase.options = options;

        Events.bind();

        angApp = angular
            .module(options.angularAppName, ['ngRoute'])
            .factory('FlatdocService', ['$q', '$route', '$location', '$anchorScroll', '$http', Route.fetch])
            .controller('URLCtrl', ['$scope', '$location','$filter', 'data', 'commits', Route.URLCtrl])
            .controller('MainCtrl', ['$scope', '$location', '$timeout', Route.mainCtrl])
            .config(['$routeProvider', '$locationProvider', Route.config])
            .run(
                ['$rootScope', '$location', '$routeParams', '$anchorScroll',
                    '$route', Route.anchorConfig
                ]
            );

        if (options.method === 'file') {
          Docbase.file(options.map);
        } else if (options.method === 'github') {
          Docbase.github(options.github);
        } else {
          Docbase.file(options.map);
        }
    };

    Docbase.github = function(options) {
        githubTree(options, function(error, map) {
            if (error) {
                Docbase.file(Docbase.options.map);
            } else if (checkSchema(map)) {
                Docbase.map = map;
                $.get(Docbase.options.map.path + '/' + Docbase.options.map.file)
                    .success(function(fileMap) {
                        var ghMap = Docbase.map;
                        var fileMapVer = Object.keys(fileMap);
                        fileMapVer.forEach(function(fileVer) {
                            if (ghMap[fileVer]) {
                                ghMap[fileVer].forEach(function(category) {
                                    var categoryM = fileMap[fileVer].filter(function(_category) {
                                        return _category.name === category.name;
                                    })[0];
                                    if (categoryM && categoryM.label) {
                                        category.label = categoryM.label;

                                        category.files.forEach(function(file) {
                                            var fileM = categoryM.files.filter(function(_file) {
                                                return _file.name === file.name;
                                            })[0];
                                            if (fileM && fileM.label) file.label = fileM.label;
                                        });
                                    }

                                });
                            }
                        });
                        jWindow.trigger('mapped');
                        Events.bind();
                    })
                    .error(function(error) {
                        // no map available for labels
                        jWindow.trigger('mapped');
                        Events.bind();
                    });
            } else {
                throw 'GitHub tree mapping error.';
            }
        });

    };

    Docbase.file = Docbase.generic = function(options) {
        $.get(options.path + '/' + options.file)
            .success(function(map) {
                if (checkSchema(map)) {
                    var v = Object.keys(map);
                    if (v.length && map[v[0]][0].files.length && map[v[0]][0].files[0].name) {
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
            .error(function(error) {
                throw error;
            });
    };


    Events.switchBind = function(state) {
        jWindow[state]('flatdoc:ready', Events.ready);
        jWindow[state]('ajaxError', Events.ajaxError);
    };

    Events.bind = function() {
        Events.switchBind('on');
    };

    Events.unbind = function() {
        Events.switchBind('off');
    };

    Events.ready = function() {
        jWindow.trigger('docbase:ready');
    };

    Events.ajaxError = function(event, request) {
        if (request.status === 403 && Docbase.options.method === 'github') {
            console.error('Github API quota exceeded.');
        }
    };

    Route.config = function($routeProvider, $location, $rootScope, $anchorScroll) {
        var flatdocURL = Docbase.options.flatdocHtml;
        var mainURL = Docbase.options.indexHtml;
        var resolve = {
            data: function(FlatdocService) {
                return FlatdocService.getData().then(function(data) {
                    return data;
                });
            },
            commits:function(FlatdocService){
                return FlatdocService.getCommits();
            }
        };

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
    };

    Route.anchorConfig = function($rootScope, $location, $routeParams, $anchorScroll, $route) {

        /**
         * Hack to prevent route reload when hash is changed.
         * Makes sure only the hash was change and intercepts the event.
         */

        $rootScope.$on('$locationChangeStart', function(evnt, newRoute, oldRoute) {
            var firstRoute = newRoute.split('#');
            var hash = firstRoute[firstRoute.length - 1];

            firstRoute.splice(firstRoute.length - 1, 1);
            firstRoute = firstRoute.join('#');

            var secondRoute = oldRoute.split('#');
            secondRoute.splice(secondRoute.length === 2 ? 2 : secondRoute.length - 1, 1);
            secondRoute = secondRoute.join('#');

            if (firstRoute === secondRoute && (newRoute !== oldRoute)) {

                $location.hash(hash);
                var lastRoute = $route.current;
                var unbind = $rootScope.$on('$locationChangeSuccess', function() {
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
            jWindow.on('docbase:ready', function() {
                $anchorScroll();
                $('.content').find('pre code').each(function() {
                    $(this).addClass("prettyprint");
                });
                prettyPrint();
            });
        });
    };

    Route.fetch = function($q, $route, $location, $anchorScroll, $http) {
        function fetcher() {
            var deferred = $q.defer();
            var options = Docbase.options;

            if (Docbase.map) {
                mapLoaded();
            } else {
                jWindow.on('mapped', mapLoaded);
            }

            function mapLoaded() {
                var map = Docbase.map;
                var retObj = {};
                var currentVersion = $route.current.params.version;
                var versions = Object.keys(map);
                var location = Route.updatePath($route.current.params);

                retObj.versions = versions;
                retObj.currentVersion = currentVersion || versions[versions.length - 1];
                retObj.map = map;
                retObj.locationPath = location.path;

                if (!location.fail) {
                    var options = Docbase.options;
                    var gh = Docbase.options.github;
                    var url = 'https://github.com/' + gh.user + '/' + gh.repo + '/tree/' + gh.branch + '/' + gh.path + location.path + '.md';

                    // file URL should be fetched remotely if hosted on github or elsewhere.
                    var fileURL = options.file.path + location.path + '.md';
                    if (options.method === 'github')
                        fileURL = 'https://raw.githubusercontent.com/' + gh.user + '/' + gh.repo + '/' + gh.branch + '/' + gh.path + location.path + '.md';
                    else if (options.method === 'generic')
                        fileURL = options.generic.baseurl + '/' + options.generic.path + location.path + '.md';
                    retObj.github = url;

                    Events.parsed = false;
                    console.log(fileURL);
                    Flatdoc.file(fileURL)(function(err, markdown) {
                        markdown = markdown.split('\n');
                        var obj = markdown.shift();
                        obj = obj.replace(/\u201D/g, '"');
                        obj = obj.replace(/\u201C/g, '"');

                        try {
                            obj = JSON.parse(obj);
                        } catch (e) {
                            markdown.unshift(obj);
                            obj = {
                                'threeColumns': false
                            };
                        }

                        markdown = markdown.join('\n');

                        if (obj.threeColumns) {
                            $('body').removeClass('no-literate');
                        } else {
                            $('body').addClass('no-literate');
                        }
                        if (obj.bigh3) {
                            $('body').addClass('big-h3');
                        } else {
                            $('body').removeClass('big-h3');
                        }
                        if (obj.largeBrief) {
                            $('body').addClass('large-brief');
                        } else {
                            $('body').removeClass('large-brief');
                        }

                        var data = Flatdoc.parser.parse(markdown, function(code) {
                            return Flatdoc.highlighters.generic(code);
                        });
                        retObj.markdown = data;
                        deferred.resolve(retObj);
                    });

                } 
                else {
                    retObj.github = false;
                    deferred.resolve(retObj);
                }
            }
            return deferred.promise;
        }

        return {
            getData: function() {
                return new fetcher();
            },
            getCommits: function(){
                var options = Docbase.options;
                var file_path = $route.current.params;
                var full_path = options.github.path+'/'+file_path.version+'/'+file_path.folder+'/'+file_path.file;
                return $http.get('https://api.github.com/repos/'+ options.github.user +'/'+ options.github.repo+'/commits?path='+full_path+'.md');
            }
        };
    };

    Route.URLCtrl = function($scope, $location,$filter, data, commits) {
        $location.path(data.locationPath);
        if (!data.fail) {
            $scope.versions = data.versions;
            $scope.currentVersion = data.currentVersion;
            $scope.map = data.map;
            $scope.github = data.github;

            var content = data.markdown;
            var contribut_array = [];
            $('[role="flatdoc-content"]').html(content.content.find('>*'));
            $('[role="flatdoc-menu"]').html(Flatdoc.menuView(content.menu));

            jWindow.trigger('flatdoc:ready');
        }

        var extra_container = $("<div>").addClass('extra_container');
        if(commits.status == 200){
            var commits_data = commits.data;
            var commiter_data = $filter('date')(commits.data[0].commit.committer.date, 'mediumDate');
            var last_date = $('<span>').addClass('pull-right modified-date').html('Last Modified On : <a href="'+commits.data[0].html_url+'">'+commiter_data+'</a>');
        
            var contributors_data = commits_data;
            var contributors = $('<div>').addClass('contributor-container');
            for(var i =0; i < contributors_data.length; i++ ){
                var contributor_d = contributors_data[i].committer;
                if(jQuery.inArray(contributor_d.login, contribut_array) == -1)
                {
                    contribut_array.push(contributor_d.login);
                    var contributor_img = $('<img>').addClass('contributor_img img-rounded').attr({
                        'src':contributor_d.avatar_url,
                        'alt':contributor_d.login
                    });
                    var contributor = $('<a>').addClass('contributor').attr({
                        'href':contributor_d.html_url,
                        'title':contributor_d.login,
                        'target':'_blank'
                    }).append(contributor_img);
                    contributors.append(contributor);            
                }
            }
            var contributors_header = $('<div>').addClass('contributors_header').append('Contributors').append(last_date);
            $(extra_container).prepend(contributors).prepend(contributors_header);
        

        }
            
        var div2 = $('<div>').addClass('clearFix');
        $('[role="flatdoc-content"]').prepend(div2).prepend(extra_container);

    };

    Route.mainCtrl = function($scope, $location, $timeout) {
        if (Docbase.options.indexType === 'markdown') {
            var path = Docbase.options.indexSrc;
            if (endsWith(path, '.md')) {
                path = path.substring(0, path.length - 3);
            }
            if (path.charAt(0) !== '/') {
                path = '/' + path;
            }

            $location.path(path);
        } else {
            var onMapped = function() {
                $timeout(function() {
                    $scope.map = Docbase.map;
                    $scope.versions = Object.keys($scope.map);
                    $scope.currentVersion = $scope.versions[0];
                });
            };
            if (Docbase.map) {
                onMapped();
            } else {
                jWindow.on('mapped', onMapped);
            }
        }
    };

    Route.updatePath = function(params) {
        var map = Docbase.map;
        var version = params.version;
        var folder = params.folder;
        var file = params.file;

        if (!map[version]) {
            console.error('Version not mapped.');
            return {
                path: '/',
                fail: true
            };
        }

        var mapFolder;
        if (folder) {
            mapFolder = map[version].filter(function(folders) {
                return folders.name === folder;
            });
            if (!mapFolder.length) {
                console.error('Folder not mapped.');
                return {
                    path: '/' + version,
                    fail: true
                };
            }
        }
        if (file) {
            var mapFile = mapFolder[0].files.filter(function(files) {
                return files.name === file;
            });
            if (!mapFile.length) {
                console.error('File not mapped.');
                return {
                    path: '/' + version + '/' + file,
                    fail: true
                };
            }
        }

        folder = folder || map[version][0].name;
        var folderObj = map[version].filter(function(each) {
            return each.name === folder;
        })[0];

        // allow files in TL menu
        file = file || (folderObj.files && folderObj.files[0].name);
        var path = '/' + version + '/' + folder + '/' + file;
        if (typeof(file) === "undefined")
            path = '/' + version + '/' + folder;

        return {
            path: path,
            fail: false
        };
    };

    function cutTrailingSlashes(value) {
        if (!angular.isString(value)) {
            return value;
        }

        value = value.charAt(0) === '/' ? value.substring(1) : value;
        return endsWith(value, '/') ? value.substring(0, value.length - 1) : value;
    }

    function checkSchema(map) {
        return schema({
            '*': Array.of(schema({
                name: String,
                label: String/*,
                files: Array.of(schema({
                    name: String,
                    label: String
                }))*/
            }))
        })(map);
    }

    function githubTree(options, callback) {
        var full_path = options.path;

        var path = full_path.split('/');
        var deleted = path.splice(path.length - 1, 1);
        path.join('/');
        deleted = deleted[0];

        var baseurl = 'https://api.github.com/repos/' + options.user + '/' + options.repo + '/';

        var url = baseurl + 'contents/' + path;

        $.get(url, {
                ref: options.branch
            })
            .success(function(data) {
                var sha = data.filter(function(each) {
                    return each.name === deleted;
                })[0].sha;

                $.get(baseurl + 'git/trees/' + sha + '?recursive=1')
                    .success(function(tree) {
                        tree = tree.tree.filter(function(each) {
                            return endsWith(each.path, '.md');
                        });

                        var map = {};

                        tree.forEach(function(each) {
                            var sub_path = each.path.split('/');
                            /* assuming sub_path[0] is the version,
                             * sub_path[1] is the folder,
                             * and sub_path[2] is the file.
                             */
                            if (sub_path.length >= 3) {
                                var version = sub_path[0];
                                var folder = sub_path[1];
                                var file = sub_path[2].substring(0, sub_path[2].length - 3);

                                // Version is new
                                if (!map[version]) {
                                    map[version] = [];
                                }

                                // Folder is new
                                if (!map[version].filter(function(a) {
                                        return a.name === folder;
                                    }).length) {
                                    map[version].push({
                                        label: folder,
                                        name: folder,
                                        files: []
                                    });
                                }

                                // Add file
                                map[version].forEach(function(each) {
                                    if (each.name === folder)
                                        each.files.push({
                                            name: file,
                                            label: file
                                        });
                                });
                            }
                        });

                        callback(null, map);

                    })
                    .error(function(error) {
                        callback(error);
                    });
            })
            .error(function(error) {
                callback(error);
            });
    }

    /**
     * endsWith polyfill, from MDN
     * Created by Ripter, last edited by Mathias Bynens
     */
    function endsWith(subjectString, searchString, position) {
        if (position === undefined || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    }
})(window.jQuery, window.angular);


// FILE: scripts/docbase.min.js
!function(t,e){function n(t){return e.isString(t)?(t="/"===t.charAt(0)?t.substring(1):t,a(t,"/")?t.substring(0,t.length-1):t):t}function r(t){return schema({"*":Array.of(schema({name:String,label:String}))})(t)}function o(e,n){var r=e.path,o=r.split("/"),i=o.splice(o.length-1,1);o.join("/"),i=i[0];var l="https://api.github.com/repos/"+e.user+"/"+e.repo+"/",c=l+"contents/"+o;t.get(c,{ref:e.branch}).success(function(e){var r=e.filter(function(t){return t.name===i})[0].sha;t.get(l+"git/trees/"+r+"?recursive=1").success(function(t){t=t.tree.filter(function(t){return a(t.path,".md")});var e={};t.forEach(function(t){var n=t.path.split("/");if(n.length>=3){var r=n[0],o=n[1],a=n[2].substring(0,n[2].length-3);e[r]||(e[r]=[]),e[r].filter(function(t){return t.name===o}).length||e[r].push({label:o,name:o,files:[]}),e[r].forEach(function(t){t.name===o&&t.files.push({name:a,label:a})})}}),n(null,e)}).error(function(t){n(t)})}).error(function(t){n(t)})}function a(t,e,n){(void 0===n||n>t.length)&&(n=t.length),n-=e.length;var r=t.indexOf(e,n);return-1!==r&&r===n}var i,l=t(window),c=this,s=c.Docbase={},u=s.events={},h=s.route={};s.methods=["file","github","generic"],s.run=function(r){var o={method:"github",map:{file:"map.json",path:""},file:{path:"docs"},github:{path:"/",branch:"gh-pages",editGithubBtn:!0},generic:{baseurl:"",path:"/"},html5mode:!1,indexType:"html",indexSrc:"v1/path/index.md",indexHtml:"html/main.html",flatdocHtml:"html/flatdoc.html",angularAppName:"docbaseApp"};if(r=t.extend({},o,r),!("github"!==r.method||r.github.user&&r.github.repo))throw"Missing GitHub user/repo info.";s.methods.forEach(function(t){var e=r[t];Object.keys(e).forEach(function(t){e[t]=n(e[t])})}),r.map.path=n(r.map.path),s.options=r,u.bind(),i=e.module(r.angularAppName,["ngRoute"]).factory("FlatdocService",["$q","$route","$location","$anchorScroll","$http",h.fetch]).controller("URLCtrl",["$scope","$location","$filter","data","commits",h.URLCtrl]).controller("MainCtrl",["$scope","$location","$timeout",h.mainCtrl]).config(["$routeProvider","$locationProvider",h.config]).run(["$rootScope","$location","$routeParams","$anchorScroll","$route",h.anchorConfig]),"file"===r.method?s.file(r.map):"github"===r.method?s.github(r.github):s.file(r.map)},s.github=function(e){o(e,function(e,n){if(e)s.file(s.options.map);else{if(!r(n))throw"GitHub tree mapping error.";s.map=n,t.get(s.options.map.path+"/"+s.options.map.file).success(function(t){var e=s.map,n=Object.keys(t);n.forEach(function(n){e[n]&&e[n].forEach(function(e){var r=t[n].filter(function(t){return t.name===e.name})[0];r&&r.label&&(e.label=r.label,e.files.forEach(function(t){var e=r.files.filter(function(e){return e.name===t.name})[0];e&&e.label&&(t.label=e.label)}))})}),l.trigger("mapped"),u.bind()}).error(function(){l.trigger("mapped"),u.bind()})}})},s.file=s.generic=function(e){t.get(e.path+"/"+e.file).success(function(t){if(!r(t))throw"Map file schema error. Check the documentation.";var e=Object.keys(t);if(!(e.length&&t[e[0]][0].files.length&&t[e[0]][0].files[0].name))throw"Map does not have a file entry. Check the documentation";s.map=t,l.trigger("mapped"),u.bind()}).error(function(t){throw t})},u.switchBind=function(t){l[t]("flatdoc:ready",u.ready),l[t]("ajaxError",u.ajaxError)},u.bind=function(){u.switchBind("on")},u.unbind=function(){u.switchBind("off")},u.ready=function(){l.trigger("docbase:ready")},u.ajaxError=function(t,e){403===e.status&&"github"===s.options.method&&console.error("Github API quota exceeded.")},h.config=function(t,e){var n=s.options.flatdocHtml,r=s.options.indexHtml,o={data:function(t){return t.getData().then(function(t){return t})},commits:function(t){return t.getCommits()}};t.when("/:version/:folder/:file",{templateUrl:n,controller:"URLCtrl",resolve:o}).when("/:version/:folder",{templateUrl:n,controller:"URLCtrl",resolve:o}).when("/:version",{templateUrl:n,controller:"URLCtrl",resolve:o}).when("/",{templateUrl:r,controller:"MainCtrl"}).otherwise({redirectTo:"/"}),e.html5Mode(s.options.html5mode)},h.anchorConfig=function(e,n,r,o,a){e.$on("$locationChangeStart",function(t,r,i){var l=r.split("#"),c=l[l.length-1];l.splice(l.length-1,1),l=l.join("#");var s=i.split("#");if(s.splice(2===s.length?2:s.length-1,1),s=s.join("#"),l===s&&r!==i){n.hash(c);var u=a.current,h=e.$on("$locationChangeSuccess",function(){a.current=u,h()});o()}}),e.$on("$routeChangeSuccess",function(){l.on("docbase:ready",function(){o(),t(".content").find("pre code").each(function(){t(this).addClass("prettyprint")}),prettyPrint()})})},h.fetch=function(e,n,r,o,a){function i(){function r(){var e=s.map,r={},a=n.current.params.version,i=Object.keys(e),l=h.updatePath(n.current.params);if(r.versions=i,r.currentVersion=a||i[i.length-1],r.map=e,r.locationPath=l.path,l.fail)r.github=!1,o.resolve(r);else{var c=s.options,f=s.options.github,p="https://github.com/"+f.user+"/"+f.repo+"/tree/"+f.branch+"/"+f.path+l.path+".md",d=c.file.path+l.path+".md";"github"===c.method?d="https://raw.githubusercontent.com/"+f.user+"/"+f.repo+"/"+f.branch+"/"+f.path+l.path+".md":"generic"===c.method&&(d=c.generic.baseurl+"/"+c.generic.path+l.path+".md"),r.github=p,u.parsed=!1,console.log(d),Flatdoc.file(d)(function(e,n){n=n.split("\n");var a=n.shift();a=a.replace(/\u201D/g,'"'),a=a.replace(/\u201C/g,'"');try{a=JSON.parse(a)}catch(i){n.unshift(a),a={threeColumns:!1}}n=n.join("\n"),a.threeColumns?t("body").removeClass("no-literate"):t("body").addClass("no-literate"),a.bigh3?t("body").addClass("big-h3"):t("body").removeClass("big-h3"),a.largeBrief?t("body").addClass("large-brief"):t("body").removeClass("large-brief");var l=Flatdoc.parser.parse(n,function(t){return Flatdoc.highlighters.generic(t)});r.markdown=l,o.resolve(r)})}}{var o=e.defer();s.options}return s.map?r():l.on("mapped",r),o.promise}return{getData:function(){return new i},getCommits:function(){var t=s.options,e=n.current.params,r=t.github.path+"/"+e.version+"/"+e.folder+"/"+e.file;return a.get("https://api.github.com/repos/"+t.github.user+"/"+t.github.repo+"/commits?path="+r+".md")}}},h.URLCtrl=function(e,n,r,o,a){if(n.path(o.locationPath),!o.fail){e.versions=o.versions,e.currentVersion=o.currentVersion,e.map=o.map,e.github=o.github;var i=o.markdown,c=[];t('[role="flatdoc-content"]').html(i.content.find(">*")),t('[role="flatdoc-menu"]').html(Flatdoc.menuView(i.menu)),l.trigger("flatdoc:ready")}var s=t("<div>").addClass("extra_container");if(200==a.status){for(var u=a.data,h=r("date")(a.data[0].commit.committer.date,"mediumDate"),f=t("<span>").addClass("pull-right modified-date").html('Last Modified On : <a href="'+a.data[0].html_url+'">'+h+"</a>"),p=u,d=t("<div>").addClass("contributor-container"),m=0;m<p.length;m++){var g=p[m].committer;if(-1==jQuery.inArray(g.login,c)){c.push(g.login);var b=t("<img>").addClass("contributor_img img-rounded").attr({src:g.avatar_url,alt:g.login}),v=t("<a>").addClass("contributor").attr({href:g.html_url,title:g.login,target:"_blank"}).append(b);d.append(v)}}var C=t("<div>").addClass("contributors_header").append("Contributors").append(f);t(s).prepend(d).prepend(C)}var y=t("<div>").addClass("clearFix");t('[role="flatdoc-content"]').prepend(y).prepend(s)},h.mainCtrl=function(t,e,n){if("markdown"===s.options.indexType){var r=s.options.indexSrc;a(r,".md")&&(r=r.substring(0,r.length-3)),"/"!==r.charAt(0)&&(r="/"+r),e.path(r)}else{var o=function(){n(function(){t.map=s.map,t.versions=Object.keys(t.map),t.currentVersion=t.versions[0]})};s.map?o():l.on("mapped",o)}},h.updatePath=function(t){var e=s.map,n=t.version,r=t.folder,o=t.file;if(!e[n])return console.error("Version not mapped."),{path:"/",fail:!0};var a;if(r&&(a=e[n].filter(function(t){return t.name===r}),!a.length))return console.error("Folder not mapped."),{path:"/"+n,fail:!0};if(o){var i=a[0].files.filter(function(t){return t.name===o});if(!i.length)return console.error("File not mapped."),{path:"/"+n+"/"+o,fail:!0}}r=r||e[n][0].name;var l=e[n].filter(function(t){return t.name===r})[0];o=o||l.files&&l.files[0].name;var c="/"+n+"/"+r+"/"+o;return"undefined"==typeof o&&(c="/"+n+"/"+r),{path:c,fail:!1}}}(window.jQuery,window.angular);

// FILE: scripts/flatdoc-theme.js
/**
 * Official flatdoc theme
 * modified
 */

(function($) {
  var $window = $(window);
  var $document = $(document);

  $window.on('docbase:ready', runTheme);

  function runTheme() {

    $("h2, h3").scrollagent({
      offset: 100
    }, function(cid, pid, currentElement, previousElement) {
      if (pid) {
        $("[pref='#" + pid + "']").removeClass('active');
      }
      if (cid) {
        $("[pref='#" + cid + "']").addClass('active');
      }
    });

    $('.menu a').each(function() {
      var el = $(this);
      var href = el.attr('href');

      if (href && !el.attr('pref')) {
        var location = window.location.href.split('#');
        if (location.length <= 2) {
          location = location.join('#') + href;
        } else {
          location[location.length - 1] = href.substring(1);
          location = location.join('#');
        }
        el.attr('href', location);
        el.attr('pref', href);
      }
    });

    var $sidebar = $('.menubar');
    var elTop;

    $window
      .on('resize.sidestick', function() {
        $sidebar.removeClass('fixed');
        elTop = $sidebar.offset().top;
        $window.trigger('scroll.sidestick');
      })
      .on('scroll.sidestick', function() {
        var scrollY = $window.scrollTop();
        $sidebar.toggleClass('fixed', (scrollY >= elTop - 35));
      })
      .trigger('resize.sidestick');

  }

})(window.jQuery);


/*! jQuery.scrollagent (c) 2012, Rico Sta. Cruz. MIT License.
 *  https://github.com/rstacruz/jquery-stuff/tree/master/scrollagent */

// Call $(...).scrollagent() with a callback function.
//
// The callback will be called everytime the focus changes.
//
// Example:
//
//      $("h2").scrollagent(function(cid, pid, currentElement, previousElement) {
//        if (pid) {
//          $("[href='#"+pid+"']").removeClass('active');
//        }
//        if (cid) {
//          $("[href='#"+cid+"']").addClass('active');
//        }
//      });

(function($) {

  $.fn.scrollagent = function(options, callback) {
    var $window = $(window);

    // Account for $.scrollspy(function)
    if (typeof callback === 'undefined') {
      callback = options;
      options = {};
    }

    var $sections = $(this);
    var $parent = options.parent || $(window);

    // Find the top offsets of each section
    var offsets = [];
    $sections.each(function(i) {
      var offset = ($(this).attr('data-anchor-offset') ?
        parseInt($(this).attr('data-anchor-offset'), 10) :
        (options.offset || 0));

      offsets.push({
        id: $(this).attr('id'),
        index: i,
        el: this,
        offset: offset
      });
    });

    // State
    var current = null;
    var height = null;
    var range = null;

    // Save the height. Do this only whenever the window is resized so we don't
    // recalculate often.
    function refreshSize() {
      height = $parent.height();
      range = $(document).height();
    }

    // Find the current active section every scroll tick.
    function refreshScroll() {
      var y = $parent.scrollTop();
      y += height * (0.3 + 0.7 * Math.pow(y / range, 2));

      var latest = null;

      for (var i in offsets) {
        if (offsets.hasOwnProperty(i)) {
          var offset = offsets[i];
          if ($(offset.el).offset().top + offset.offset < y) latest = offset;
        }
      }

      if (latest && (!current || (latest.index !== current.index))) {
        callback.call($sections,
          latest ? latest.id : null,
          current ? current.id : null,
          latest ? latest.el : null,
          current ? current.el : null);
        current = latest;
      }
    }

    $window.on('scroll', $.throttle(50, refreshScroll));
    $window.on('resize', $.throttle(250, refreshSize));

    refreshSize();
    refreshScroll();

    return this;
  };

})(jQuery);

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b, c) {
  var $ = b.jQuery || b.Cowboy || (b.Cowboy = {}),
    a;
  $.throttle = a = function(e, f, j, i) {
    var h, d = 0;
    if (typeof f !== "boolean") {
      i = j;
      j = f;
      f = c;
    }

    function g() {
      var o = this,
        m = +new Date() - d,
        n = arguments;

      function l() {
        d = +new Date();
        j.apply(o, n);
      }

      function k() {
        h = c;
      }
      if (i && !h) {
        l();
      }
      h && clearTimeout(h);// jshint ignore:line
      if (i === c && m > e) {
        l();
      } else {
        if (f !== true) {
          h = setTimeout(i ? k : l, i === c ? e - m : e);
        }
      }
    }
    if ($.guid) {
      g.guid = j.guid = j.guid || $.guid++;
    }
    return g;
  };
  $.debounce = function(d, e, f) {
    return f === c ? a(d, e, false) : a(d, f, e !== false);
  };
})(this);

// FILE: scripts/polyfill.js
if (!Function.prototype.bind) {
    Function.prototype.bind = function bind(that) { // .length is 1
        var slice = [].slice;
        var Empty = function() {};
        var target = this;
        if (typeof target != "function") {
            throw new TypeError("Function.prototype.bind called on incompatible " + target);
        }
        var args = slice.call(arguments, 1); // for normal call
        var bound = function() {

            if (this instanceof bound) {

                var result = target.apply(
                    this,
                    args.concat(slice.call(arguments))
                );
                if (Object(result) === result) {
                    return result;
                }
                return this;

            } else {
                return target.apply(
                    that,
                    args.concat(slice.call(arguments))
                );

            }

        };
        if (target.prototype) {
            Empty.prototype = target.prototype;
            bound.prototype = new Empty();
            Empty.prototype = null;
        }
        return bound;
    };
}