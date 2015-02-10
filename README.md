# DocBase
A fast and flexible single-page documentation engine.
With your existing (or new) markdown files, organize them in a simpe version/category folder structure and have dynamically generated menus and links.

## Installation

    bower install docbase

## Usage

Simply change the parameters to your project's spec on the index.html file. The map.json structure is the following:

    { "version_name": [
      {
        "name": "folder1_name",
        "label": "folder1_label"
      }, {
        "name": "folder2_name",
        "label": "folder2_label"
      }],
      "other_version_name": [ ... ]
    }

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

v0.1.0 Feb 10 '15
Initial release

## Credits

Henrique Sa (@henriquesa), Appbase

## License

MIT