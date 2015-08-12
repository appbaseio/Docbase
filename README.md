# Docbase
A fast and flexible single-page documentation engine. Create documentation hubs with versioning and beautifully rendered menus; works with your existing (or new) Github hosted markdown files.

## Installation

    bower install docbase

## Usage

### Step 1: Simply change the parameters to your project's spec on the index.html file.

```js
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

### Step 2: Mapping Menus

Docbase works with zero configs. It fetches the directory structure from your github repository by default, but can be overriden by editing the ``map.json`` file.

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
