# Docbase
[![Build Status](https://travis-ci.org/appbaseio/Docbase.svg?branch=master)](https://travis-ci.org/appbaseio/Docbase) [![NPM](https://nodei.co/npm/grunt-docbase.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/grunt-docbase/)

### We are no longer actively maintaining Docbase, we instead recommend using [gatsbyjs](https://gatsbyjs.org).

Turn .md files into a beautiful documentation hub with versioning and beautifully rendered menus. 

* Docbase can read files that are hosted on github, locally or a http:// server.
* It can publish documentation hubs to github pages (via travis) or locally which can be served with as static files with a http:// server.

Docbase comes with a yeoman generator that turns the installation and configuration process into a piece of cake.

![A rendered documentation site](http://g.recordit.co/Odu27H3nAm.gif)

### Example Hubs built with Docbase

1. [Airbnb JS Style guide](https://farhan687.github.io/airbnb)  
2. [Redis Docs](https://farhan687.github.io/redis)  
3. [EmberJS Guide](https://farhan687.github.io/emberjs)

## Installation

```
1. npm install -g yo

█████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

2. npm install -g generator-docbase

██████████▒▒▒▒▒▒▒▒▒▒

3. yo docbase

Welcome to
    .___           ___.
  __| _/____   ____\_ |__ _____    ______ ____
 / __ |/  _ \_/ ___\| __ \\__  \  /  ___// __ \
/ /_/ (  <_> )  \___| \_\ \/ __ \_\___ \\  ___/
\____ |\____/ \___  >___  (____  /____  >\___  >
     \/           \/    \/     \/     \/     \/
        generator!

...

████████████████████

Docbase is live at: http://127.0.0.1:1234
```

##  [Read the manual](https://appbaseio.github.io/docbase-manual) [![](http://businessxlerator.com/wp-content/themes/busxl-2015/images/content/icons/book.png)](https://appbaseio.github.io/docbase-manual)

The manual walks through the generator options, and explains docbase options and features. The manual itself is served with docbase.


### Who uses docbase

- [appbase.io](https://docs.appbase.io)
- [Reactive Maps](https://opensource.appbase.io/reactivemaps/manual)

Send a PR with your name here.


## History

v0.3.0 Feb 27 '17
- Phantom.js dependency upgrade
- Compatibility with Node v6.9.x
- Uses scroll in code blocks
- Fixes mobile read view
- Adds a feature to see other pages in the directory

v0.2.56 Apr 2 '16
- Comes with a yeoman generator ``yo docbase``
- Resizable mobile navigation menu
- Realtime search with an offline search index
- No 404s when navigating to folders
- Updates markdown parser
- Show github contributors on each documentation page
- Colorful themes baked in

.  
.  (54 more releases)  
.  

v0.0.2 Aug 7 '15
- All flatdoc theme options supported
- Customizable root path

v0.0.1 Feb 10 '15  
- Initial release

## Credits

Henrique Sa (@henriquesa),  
Mateus Freira (@mateusfreira),  
Farhan Chauhan (@farhan687),  
Siddharth Kothari (@siddharthlatest)  

## License

MIT
