# Docbase
[![Build Status](https://travis-ci.org/appbaseio/Docbase.svg?branch=master)](https://travis-ci.org/appbaseio/Docbase)

A fast and flexible single-page documentation engine. Create documentation hubs with versioning and beautifully rendered menus; works with your existing (or new) Github hosted markdown files.

### Used by:

[![](http://app.zeedhi.com/teknisa/docs/images/log.png)](http://app.zeedhi.com/teknisa/docs/#/) [![](http://i.imgur.com/0MwyOZL.png?1)](http://docs.appbase.io)

## Installation

    bower install docbase --save

## Usage

### Step 1: Configuring Index.html

Copy the index.html file from docbase's root folder. You can change the parameters for your project's spec in this file.

```bash
  mv bower_components/docbase/sample-index.html index.html

```
Now Copy the sample-docbase-config.js to your project, it is the configeration file of your documentation project!


```bash
 mv bower_components/docbase/sample-docbase-config.js docbase-config.js
```

where,  
* ``method`` indicates the source of markdown files and can be one of "github", "file" or "generic".
* ``github`` is a top level field that is relevant when the selected method is ``github``. It has obvious parameters such as ``user``, ``repo``, ``branch`` and ``editGithubBtn``.
* ``file`` similarly is a top level field that is relevant when the selected method is ``file``. It only has one parameter ``path``, a relative / absolute location from the root directory where the docs are hosted.
* ``generic`` is a top level field that is relevant when the selected method is ``generic``. This can take markdown files hosted anywhere - github, bitbucket, dropbox, your own servers. It only needs a ``baseurl`` and a relative path under which the docs are kept.
* ``versions`` is where you specify the docs directory structure and can add pretty labels.
** It looks something like this:
```js
"map" : {
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

see sample-docbase-config.js to see how to create your own configs.
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
