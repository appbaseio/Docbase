# Docbase
A fast and flexible single-page documentation engine. Create documentation hubs with versioning and beautifully rendered menus; works with your existing (or new) Github hosted markdown files.

### Used by:

[![](http://app.zeedhi.com/teknisa/docs/images/log.png)](http://app.zeedhi.com/teknisa/docs/#/) [![](http://i.imgur.com/0MwyOZL.png?1)](http://docs.appbase.io)

## Installation

    bower install docbase

## Usage

### Step 1: Configuring Index.html

Copy the index.html file from docbase's root folder. You can change the parameters for your project's spec in this file.

```js
index.html

.
.
.
  <script type="text/javascript">
    Docbase.run({
      method: 'github',
      map: {        // mapping file location relative to the project directory
          file: 'map.json',
          path: ''
      },
      github: {     // github option has to be present if method is github
          user: 'appbaseio',
          repo: 'Docs',
          path: 'src',
          branch: 'master',
          editGithubBtn: true
      },
      file: {
          path: 'docs'
      },
      generic: {
          baseurl: "https://raw.githubusercontent.com/appbaseio/Docs/master",
          path: "src"
      },
      indexHtml: 'entry.html',
      flatdocHtml: '/bower_components/docbase/html/flatdoc.html',
      html5mode: false
    });
  </script>
```

where,  
* ``method`` indicates the source of markdown files and can be one of "github", "file" or "generic".
* ``map`` is the mapping file location - A map is like a sitemap, showing the directory structure layout and allows adding pretty labels to folder and file names.
* ``github`` is a top level field that is relevant when the selected method is ``github``. It has obvious parameters such as ``user``, ``repo``, ``branch`` and ``editGithubBtn``.
* ``file`` similarly is a top level field that is relevant when the selected method is ``file``. It only has one parameter ``path``, a relative / absolute location from the root directory where the docs are hosted.
* ``generic`` is a top level field that is relevant when the selected method is ``generic``. This can take markdown files hosted anywhere - github, bitbucket, dropbox, your own servers. It only needs a ``baseurl`` and a relative path under which the docs are kept.

### Step 2: Configuring map.json

map.json is an optional file (if you host docs on github) that allows specifying the docs directory structure and adding pretty labels, specified under the ``map`` field in the index.html configs.

It looks something like this:

```js
map.json

{ 
  "version_name": [
      {
        "name": "folder1_name",
        "label": "folder1_label",
        "files": [
            {
                "name": "innerFile1_name",
                "label": "innerFile1_label"
            }
        ]
      }, {
        "name": "rootFile1_name",
        "label": "rootFile1_label"
      }
  ],
  "other_version_name": [ ... 
  ]
}
```

where,  
``version_name`` is the top level field indicating the mapping for a particular documentation version, like v1.0.  
A version can contain folders and files. ``name`` is the actual 

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

v0.0.2 Aug 7 '15
- All flatdoc theme options supported
- Customizable root path

v0.0.1 Feb 10 '15
Initial release

## Credits

Henrique Sa (@henriquesa), Appbase

## License

MIT
