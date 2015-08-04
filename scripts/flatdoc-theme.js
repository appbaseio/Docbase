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