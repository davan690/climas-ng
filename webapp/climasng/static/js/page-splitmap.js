(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

require('./mapview/main');
require('./menusandpanels');

$(function() {
    // $('header').disableSelection(); // unpopular but still better
    $('nav > ul').mspp({});
});

},{"./mapview/main":2,"./menusandpanels":6}],2:[function(require,module,exports){
(function() {
  var AppView;

  if (!window.console) {
    window.console = {
      log: function() {
        return {};
      }
    };
  }

  AppView = require('./views/app');

  $(function() {
    var appview;
    appview = new AppView();
    return appview.render();
  });

}).call(this);

},{"./views/app":5}],3:[function(require,module,exports){
(function() {
  var MapLayer;

  MapLayer = Backbone.Model.extend({
    constructor: function(shortName, longName, path) {
      this.shortName = shortName;
      this.longName = longName;
      this.path = path;
      return null;
    }
  });

  module.exports = MapLayer;

}).call(this);

},{}],4:[function(require,module,exports){
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fn, scope) {
      var i, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(__indexOf.call(this, i) >= 0 ? fn.call(scope, this[i], i, this) : void 0);
      }
      return _results;
    };
  }

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = this.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this[i] === needle) {
          return i;
        }
      }
      return -1;
    };
  }

}).call(this);

},{}],5:[function(require,module,exports){
(function() {
  var AppView, MapLayer, debug,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  MapLayer = require('../models/maplayer');

  require('../util/shims');


  /* jshint -W093 */

  debug = function(itemToLog, itemLevel) {
    var levels, messageNum, threshold, thresholdNum;
    levels = ['verydebug', 'debug', 'message', 'warning'];
    threshold = 'message';
    if (!itemLevel) {
      itemLevel = 'debug';
    }
    thresholdNum = levels.indexOf(threshold);
    messageNum = levels.indexOf(itemLevel);
    if (thresholdNum > messageNum) {
      return;
    }
    if (itemToLog + '' === itemToLog) {
      return console.log("[" + itemLevel + "] " + itemToLog);
    } else {
      return console.log(itemToLog);
    }
  };

  AppView = Backbone.View.extend({
    tagName: 'div',
    className: 'splitmap showforms',
    id: 'splitmap',
    speciesDataUrl: window.mapConfig.speciesDataUrl,
    biodivDataUrl: window.mapConfig.biodivDataUrl,
    rasterApiUrl: window.mapConfig.rasterApiUrl,
    trackSplitter: false,
    trackPeriod: 100,
    events: {
      'click .btn-change': 'toggleForms',
      'click .btn-compare': 'toggleSplitter',
      'click .btn-copy.left-valid-map': 'copyMapLeftToRight',
      'click .btn-copy.right-valid-map': 'copyMapRightToLeft',
      'leftmapupdate': 'leftSideUpdate',
      'rightmapupdate': 'rightSideUpdate',
      'change select.left': 'leftSideUpdate',
      'change select.right': 'rightSideUpdate',
      'change input.left': 'leftSideUpdate',
      'change input.right': 'rightSideUpdate',
      'change #sync': 'toggleSync'
    },
    tick: function() {
      if (false) {
        debug(this.leftInfo.scenario);
      } else {
        debug('tick');
      }
      return setTimeout(this.tick, 1000);
    },
    initialize: function() {
      debug('AppView.initialize');
      _.bindAll.apply(_, [this].concat(_.functions(this)));
      this.namesList = [];
      this.speciesSciNameList = [];
      this.speciesInfoFetchProcess = this.fetchSpeciesInfo();
      this.biodivList = [];
      return this.biodivInfoFetchProcess = this.fetchBiodivInfo();
    },
    render: function() {
      debug('AppView.render');
      this.$el.append(AppView.templates.layout({
        leftTag: AppView.templates.leftTag(),
        rightTag: AppView.templates.rightTag(),
        leftForm: AppView.templates.leftForm(),
        rightForm: AppView.templates.rightForm()
      }));
      $('#contentwrap').append(this.$el);
      this.map = L.map('map', {
        center: [0, 0],
        zoom: 3
      });
      this.map.on('move', this.resizeThings);
      L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/{type}/{mapID}/{scheme}/{z}/{x}/{y}/{size}/{format}?app_id={app_id}&app_code={app_code}&lg={language}', {
        attribution: 'Map &copy; 2016 <a href="http://developer.here.com">HERE</a>',
        subdomains: '1234',
        base: 'aerial',
        type: 'maptile',
        scheme: 'terrain.day',
        app_id: 'l2Rye6zwq3u2cHZpVIPO',
        app_code: 'MpXSlNLcLSQIpdU6XHB0TQ',
        mapID: 'newest',
        maxZoom: 18,
        language: 'eng',
        format: 'png8',
        size: '256'
      }).addTo(this.map);
      this.leftForm = this.$('.left.form');
      this.buildLeftForm();
      this.rightForm = this.$('.right.form');
      this.buildRightForm();
      this.leftTag = this.$('.left.tag');
      this.rightTag = this.$('.right.tag');
      this.splitLine = this.$('.splitline');
      this.splitThumb = this.$('.splitthumb');
      this.leftSideUpdate();
      this.rightSideUpdate();
      return this.toggleSplitter();
    },
    resolvePlaceholders: function(strWithPlaceholders, replacements) {
      var ans, key, re, value;
      ans = strWithPlaceholders;
      ans = ans.replace(/\{\{\s*location.protocol\s*\}\}/g, location.protocol);
      ans = ans.replace(/\{\{\s*location.host\s*\}\}/g, location.host);
      ans = ans.replace(/\{\{\s*location.hostname\s*\}\}/g, location.hostname);
      for (key in replacements) {
        value = replacements[key];
        re = new RegExp("\\{\\{\\s*" + key + "\\s*\\}\\}", "g");
        ans = ans.replace(re, value);
      }
      return ans;
    },
    copyMapLeftToRight: function() {
      debug('AppView.copyMapLeftToRight');
      if (!this.leftInfo) {
        return;
      }
      this.$('#rightmapspp').val(this.leftInfo.speciesName);
      this.$('#rightmapyear').val(this.leftInfo.year);
      this.$('input[name=rightmapscenario]').each((function(_this) {
        return function(index, item) {
          return $(item).prop('checked', $(item).val() === _this.leftInfo.scenario);
        };
      })(this));
      this.$('#rightmapgcm').val(this.leftInfo.gcm);
      return this.rightSideUpdate();
    },
    copyMapRightToLeft: function() {
      debug('AppView.copyMapRightToLeft');
      if (!this.rightInfo) {
        return;
      }
      this.$('#leftmapspp').val(this.rightInfo.speciesName);
      this.$('#leftmapyear').val(this.rightInfo.year);
      this.$('input[name=leftmapscenario]').each((function(_this) {
        return function(index, item) {
          return $(item).prop('checked', $(item).val() === _this.rightInfo.scenario);
        };
      })(this));
      this.$('#leftmapgcm').val(this.rightInfo.gcm);
      return this.leftSideUpdate();
    },
    sideUpdate: function(side) {
      var atCurrent, currInfo, mapValidQuery, newInfo, _ref;
      debug('AppView.sideUpdate (' + side + ')');
      newInfo = {
        speciesName: this.$('#' + side + 'mapspp').val(),
        degs: this.$('#' + side + 'mapdegs').val(),
        range: this.$('input[name=' + side + 'maprange]:checked').val(),
        confidence: this.$('#' + side + 'mapconfidence').val(),
        year: this.$('#' + side + 'mapyear').val(),
        scenario: this.$('input[name=' + side + 'mapscenario]:checked').val(),
        gcm: this.$('#' + side + 'mapgcm').val()
      };
      atCurrent = newInfo.degs === 'current';
      this.$(['input[name=' + side + 'maprange]', '#' + side + 'mapconfidence'].join(',')).prop('disabled', atCurrent);
      this.$('.' + side + '.side.form fieldset').removeClass('disabled');
      this.$('input[name^=' + side + ']:disabled, [id^=' + side + ']:disabled').closest('fieldset').addClass('disabled');
      mapValidQuery = '.' + side + '-valid-map';
      if (_ref = newInfo.speciesName, __indexOf.call(this.namesList, _ref) >= 0) {
        this.$(mapValidQuery).removeClass('disabled').prop('disabled', false);
      } else {
        this.$(mapValidQuery).addClass('disabled').prop('disabled', true);
        return false;
      }
      currInfo = side === 'left' ? this.leftInfo : this.rightInfo;
      if (currInfo && _.isEqual(newInfo, currInfo)) {
        return false;
      }
      if (currInfo && newInfo.speciesName === currInfo.speciesName && newInfo.degs === currInfo.degs && newInfo.degs === 'current') {
        return false;
      }
      if (side === 'left') {
        this.leftInfo = newInfo;
      } else {
        this.rightInfo = newInfo;
      }
      this.addMapLayer(side);
      return this.addMapTag(side);
    },
    leftSideUpdate: function() {
      this.sideUpdate('left');
      if (this.$('#sync')[0].checked) {
        debug('Sync checked - syncing right side', 'message');
        return this.copySppToRightSide();
      }
    },
    rightSideUpdate: function() {
      return this.sideUpdate('right');
    },
    copySppToRightSide: function() {
      this.$('#rightmapspp').val(this.$('#leftmapspp').val());
      return this.rightSideUpdate();
    },
    addMapTag: function(side) {
      var dispLookup, info, tag;
      debug('AppView.addMapTag');
      if (side === 'left') {
        info = this.leftInfo;
      }
      if (side === 'right') {
        info = this.rightInfo;
      }
      tag = "<b><i>" + info.speciesName + "</i></b>";
      dispLookup = {
        '0disp': 'no range adaptation',
        '50disp': '50 years of range adaptation',
        '100disp': '100 years of range adaptation'
      };
      if (info.degs === 'current') {
        tag = "current " + tag + " distribution";
      } else {
        tag = "<b>" + info.confidence + "</b> percentile projections for " + tag + " at <b>+" + info.degs + "&deg;C</b> with <b>" + dispLookup[info.range] + "</b>";
      }
      if (side === 'left') {
        this.leftTag.find('.leftlayername').html(tag);
      }
      if (side === 'right') {
        return this.rightTag.find('.rightlayername').html(tag);
      }
    },
    addMapLayer: function(side) {
      var futureModelPoint, isBiodiversity, layer, loadClass, mapUrl, sideInfo, sppFileName, val, zipUrl, _ref;
      debug('AppView.addMapLayer');
      if (side === 'left') {
        sideInfo = this.leftInfo;
      }
      if (side === 'right') {
        sideInfo = this.rightInfo;
      }
      isBiodiversity = (_ref = sideInfo.speciesName, __indexOf.call(this.biodivList, _ref) >= 0);
      futureModelPoint = '';
      mapUrl = '';
      zipUrl = '';
      if (isBiodiversity) {
        futureModelPoint = ['biodiversity/deciles/biodiversity', sideInfo.scenario, sideInfo.year, sideInfo.gcm].join('_');
        if (sideInfo.year === 'baseline') {
          futureModelPoint = 'biodiversity/biodiversity_current';
        }
        mapUrl = [
          this.resolvePlaceholders(this.biodivDataUrl, {
            sppGroup: sideInfo.speciesName
          }), futureModelPoint + '.tif'
        ].join('/');
        zipUrl = [
          this.resolvePlaceholders(this.biodivDataUrl, {
            sppGroup: sideInfo.speciesName
          }), 'biodiversity', sideInfo.speciesName + '.zip'
        ].join('/');
        this.$('#' + side + 'mapdl').attr('href', mapUrl);
      } else {
        sppFileName = ['TEMP', sideInfo.degs, sideInfo.confidence + '.' + sideInfo.range].join('_');
        if (sideInfo.degs === 'current') {
          sppFileName = 'current';
        }
        mapUrl = [
          this.resolvePlaceholders(this.speciesDataUrl, {
            sppUrl: this.speciesUrls[sideInfo.speciesName]
          }), sppFileName + '.tif'
        ].join('/');
        this.$('#' + side + 'mapdl').attr('href', mapUrl);
      }
      layer = L.tileLayer.wms(this.resolvePlaceholders(this.rasterApiUrl), {
        DATA_URL: mapUrl,
        layers: 'DEFAULT',
        format: 'image/png',
        transparent: true
      });
      loadClass = '' + side + 'loading';
      layer.on('loading', (function(_this) {
        return function() {
          return _this.$el.addClass(loadClass);
        };
      })(this));
      layer.on('load', (function(_this) {
        return function() {
          return _this.$el.removeClass(loadClass);
        };
      })(this));
      if (side === 'left') {
        if (this.leftLayer) {
          this.map.removeLayer(this.leftLayer);
        }
        this.leftLayer = layer;
      }
      if (side === 'right') {
        if (this.rightLayer) {
          this.map.removeLayer(this.rightLayer);
        }
        this.rightLayer = layer;
      }
      layer.addTo(this.map);
      this.resizeThings();
      if (window.location.hostname === 'localhost') {
        console.log('map URL is: ', mapUrl);
      }
      if (ga && typeof ga === 'function') {
        if (sideInfo.year === 'baseline') {
          val = 1990;
        } else {
          val = parseInt(sideInfo.year, 10);
        }
        val = val + {
          'tenth': 0.1,
          'fiftieth': 0.5,
          'ninetieth': 0.9
        }[sideInfo.gcm];
        return ga('send', {
          'hitType': 'event',
          'eventCategory': 'mapshow',
          'eventAction': sideInfo.speciesName,
          'eventLabel': sideInfo.scenario,
          'eventValue': val
        });
      }
    },
    centreMap: function(repeatedlyFor) {
      var later, recentre, _i, _results;
      debug('AppView.centreMap');
      if (!repeatedlyFor) {
        repeatedlyFor = 500;
      }
      recentre = (function(_this) {
        return function() {
          _this.map.invalidateSize(false);
          return _this.resizeThings();
        };
      })(this);
      _results = [];
      for (later = _i = 0; _i <= repeatedlyFor; later = _i += 25) {
        _results.push(setTimeout(recentre, later));
      }
      return _results;
    },
    toggleForms: function() {
      debug('AppView.toggleForms');
      this.$el.toggleClass('showforms');
      return this.centreMap();
    },
    toggleSplitter: function() {
      debug('AppView.toggleSplitter');
      this.$el.toggleClass('split');
      if (this.$el.hasClass('split')) {
        this.activateSplitter();
      } else {
        this.deactivateSplitter();
      }
      return this.centreMap();
    },
    toggleSync: function() {
      debug('AppView.toggleSync');
      if (this.$('#sync')[0].checked) {
        this.$('.rightmapspp').prop('disabled', true);
        return this.copySppToRightSide();
      } else {
        return this.$('.rightmapspp').prop('disabled', false);
      }
    },
    fetchSpeciesInfo: function() {
      debug('AppView.fetchSpeciesInfo');
      return $.ajax({
        url: '/data/species',
        dataType: 'json'
      }).done((function(_this) {
        return function(data) {
          var commonNameWriter, speciesLookupList, speciesSciNameList, speciesUrls;
          speciesLookupList = [];
          speciesSciNameList = [];
          speciesUrls = {};
          commonNameWriter = function(sciName) {
            var sciNamePostfix;
            sciNamePostfix = " (" + sciName + ")";
            return function(cnIndex, cn) {
              return speciesLookupList.push({
                label: cn + sciNamePostfix,
                value: sciName
              });
            };
          };
          $.each(data, function(sciName, sppInfo) {
            speciesSciNameList.push(sciName);
            speciesUrls[sciName] = sppInfo.path;
            if (sppInfo.commonNames) {
              return $.each(sppInfo.commonNames, commonNameWriter(sciName));
            } else {
              return speciesLookupList.push({
                label: sciName,
                value: sciName
              });
            }
          });
          _this.speciesLookupList = speciesLookupList;
          _this.speciesSciNameList = speciesSciNameList;
          return _this.speciesUrls = speciesUrls;
        };
      })(this));
    },
    fetchBiodivInfo: function() {
      debug('AppView.fetchBiodivInfo');
      return $.ajax({
        url: '/data/biodiversity',
        dataType: 'json'
      }).done((function(_this) {
        return function(data) {
          var biodivList, biodivLookupList;
          biodivList = [];
          biodivLookupList = [];
          $.each(data, function(biodivName, biodivInfo) {
            var biodivCapName;
            biodivCapName = biodivName.replace(/^./, function(c) {
              return c.toUpperCase();
            });
            biodivList.push(biodivName);
            return biodivLookupList.push({
              label: "Biodiversity of " + biodivCapName,
              value: biodivName
            });
          });
          _this.biodivList = biodivList;
          return _this.biodivLookupList = biodivLookupList;
        };
      })(this));
    },
    buildLeftForm: function() {
      debug('AppView.buildLeftForm');
      return $.when(this.speciesInfoFetchProcess, this.biodivInfoFetchProcess).done((function(_this) {
        return function() {
          var $leftmapspp;
          $leftmapspp = _this.$('#leftmapspp');
          _this.namesList = _this.biodivList.concat(_this.speciesSciNameList);
          return $leftmapspp.autocomplete({
            source: _this.biodivLookupList.concat(_this.speciesLookupList),
            close: function() {
              return _this.$el.trigger('leftmapupdate');
            }
          });
        };
      })(this));
    },
    buildRightForm: function() {
      debug('AppView.buildRightForm');
      return $.when(this.speciesInfoFetchProcess, this.biodivInfoFetchProcess).done((function(_this) {
        return function() {
          var $rightmapspp;
          $rightmapspp = _this.$('#rightmapspp');
          _this.namesList = _this.biodivList.concat(_this.speciesSciNameList);
          return $rightmapspp.autocomplete({
            source: _this.biodivLookupList.concat(_this.speciesLookupList),
            close: function() {
              return _this.$el.trigger('rightmapupdate');
            }
          });
        };
      })(this));
    },
    startSplitterTracking: function() {
      debug('AppView.startSplitterTracking');
      this.trackSplitter = true;
      this.splitLine.addClass('dragging');
      return this.locateSplitter();
    },
    locateSplitter: function() {
      debug('AppView.locateSplitter');
      if (this.trackSplitter) {
        this.resizeThings();
        if (this.trackSplitter === 0) {
          this.trackSplitter = false;
        } else if (this.trackSplitter !== true) {
          this.trackSplitter -= 1;
        }
        return setTimeout(this.locateSplitter, this.trackPeriod);
      }
    },
    resizeThings: function() {
      var $mapBox, bottomRight, layerBottom, layerTop, leftLeft, leftMap, mapBounds, mapBox, newLeftWidth, rightMap, rightRight, splitPoint, splitX, topLeft;
      debug('AppView.resizeThings');
      if (this.leftLayer) {
        leftMap = $(this.leftLayer.getContainer());
      }
      if (this.rightLayer) {
        rightMap = $(this.rightLayer.getContainer());
      }
      if (this.$el.hasClass('split')) {
        newLeftWidth = this.splitThumb.position().left + (this.splitThumb.width() / 2.0);
        mapBox = this.map.getContainer();
        $mapBox = $(mapBox);
        mapBounds = mapBox.getBoundingClientRect();
        topLeft = this.map.containerPointToLayerPoint([0, 0]);
        splitPoint = this.map.containerPointToLayerPoint([newLeftWidth, 0]);
        bottomRight = this.map.containerPointToLayerPoint([$mapBox.width(), $mapBox.height()]);
        layerTop = topLeft.y;
        layerBottom = bottomRight.y;
        splitX = splitPoint.x - mapBounds.left;
        leftLeft = topLeft.x - mapBounds.left;
        rightRight = bottomRight.x;
        this.splitLine.css('left', newLeftWidth);
        this.leftTag.attr('style', "clip: rect(0, " + newLeftWidth + "px, auto, 0)");
        if (this.leftLayer) {
          leftMap.attr('style', "clip: rect(" + layerTop + "px, " + splitX + "px, " + layerBottom + "px, " + leftLeft + "px)");
        }
        if (this.rightLayer) {
          return rightMap.attr('style', "clip: rect(" + layerTop + "px, " + rightRight + "px, " + layerBottom + "px, " + splitX + "px)");
        }
      } else {
        this.leftTag.attr('style', 'clip: inherit');
        if (this.leftLayer) {
          leftMap.attr('style', 'clip: inherit');
        }
        if (this.rightLayer) {
          return rightMap.attr('style', 'clip: rect(0,0,0,0)');
        }
      }
    },
    stopSplitterTracking: function() {
      debug('AppView.stopSplitterTracking');
      this.splitLine.removeClass('dragging');
      return this.trackSplitter = 5;
    },
    activateSplitter: function() {
      debug('AppView.activateSplitter');
      this.splitThumb.draggable({
        containment: $('#mapwrapper'),
        scroll: false,
        start: this.startSplitterTracking,
        drag: this.resizeThings,
        stop: this.stopSplitterTracking
      });
      return this.resizeThings();
    },
    deactivateSplitter: function() {
      debug('AppView.deactivateSplitter');
      this.splitThumb.draggable('destroy');
      return this.resizeThings();
    }
  }, {
    templates: {
      layout: _.template("<div clas=\"ui-front\"></div>\n<div class=\"splitline\">&nbsp;</div>\n<div class=\"splitthumb\"><span>&#x276e; &#x276f;</span></div>\n<div class=\"left tag\"><%= leftTag %></div>\n<div class=\"right tag\"><%= rightTag %></div>\n<div class=\"left side form\"><%= leftForm %></div>\n<div class=\"right side form\"><%= rightForm %></div>\n<div class=\"left loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div class=\"right loader\"><img src=\"/static/images/spinner.loadinfo.net.gif\" /></div>\n<div id=\"mapwrapper\"><div id=\"map\"></div></div>"),
      leftTag: _.template("<div class=\"show\">\n    <span class=\"leftlayername\">plain map</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"left syncbox\"></label>\n    <input id=\"leftmapspp\" class=\"left\" type=\"text\" name=\"leftmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      rightTag: _.template("<div class=\"show\">\n    <span class=\"rightlayername\">(no distribution)</span>\n    <br>\n    <button class=\"btn-change\">settings</button>\n    <button class=\"btn-compare\">show/hide comparison map</button>\n</div>\n<div class=\"edit\">\n    <label class=\"right syncbox\"><input id=\"sync\" type=\"checkbox\" value=\"sync\" checked=\"checked\" /> same as left side</label>\n    <input id=\"rightmapspp\" type=\"text\" class=\"right\" name=\"rightmapspp\" placeholder=\"&hellip; species or group &hellip;\" />\n</div>"),
      leftForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"left\" id=\"leftmapdegs\">\n        <option value=\"current\">current</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"Highly sensitive environment\">\n            <option value=\"6.5\">6.5 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><span>none</span> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><span>50y</span> <input name=\"leftmaprange\" class=\"left\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"left\" id=\"leftmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <option value=\"33\">33rd percentile</option>\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <option value=\"66\">66th percentile</option>\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy right-valid-map\">copy right map &laquo;</button>\n    <a id=\"leftmapdl\" class=\"download left-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<20Mb GeoTIFF)</a>\n</fieldset>\n"),
      rightForm: _.template("<fieldset>\n    <legend>temperature change</legend>\n    <select class=\"right\" id=\"rightmapdegs\">\n        <option value=\"current\">current</option>\n        <option value=\"1.5\">1.5 &deg;C</option>\n        <option value=\"2\">2.0 &deg;C</option>\n        <option value=\"2.7\">2.7 &deg;C</option>\n        <option value=\"3.2\">3.2 &deg;C</option>\n        <option value=\"4.5\">4.5 &deg;C</option>\n        <optgroup label=\"Highly sensitive environment\">\n            <option value=\"6.5\">6.5 &deg;C</option>\n        </optgroup>\n    </select>\n</fieldset>\n<fieldset>\n    <legend>adaptation via range shift</legend>\n    <label><span>none</span> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"no.disp\" checked=\"checked\"> species cannot shift ranges</label>\n    <label><span>50y</span> <input name=\"rightmaprange\" class=\"right\" type=\"radio\" value=\"real.disp\"> allow range adaptation</label>\n</fieldset>\n<fieldset>\n    <legend>model summary</legend>\n    <select class=\"right\" id=\"rightmapconfidence\">\n        <option value=\"10\">10th percentile</option>\n        <option value=\"33\">33rd percentile</option>\n        <option value=\"50\" selected=\"selected\">50th percentile</option>\n        <option value=\"66\">66th percentile</option>\n        <option value=\"90\">90th percentile</option>\n    </select>\n</fieldset>\n<fieldset class=\"blank\">\n    <button type=\"button\" class=\"btn-change\">hide settings</button>\n    <button type=\"button\" class=\"btn-compare\">hide/show right map</button>\n    <button type=\"button\" class=\"btn-copy right-valid-map\">copy right map &laquo;</button>\n    <a id=\"rightmapdl\" class=\"download right-valid-map\" href=\"\" disabled=\"disabled\">download just this map<br>(<20Mb GeoTIFF)</a>\n</fieldset>\n")
    }
  });

  module.exports = AppView;

}).call(this);

},{"../models/maplayer":3,"../util/shims":4}],6:[function(require,module,exports){

// jQuery plugin
// author: Daniel Baird <daniel@danielbaird.com>
// version: 0.1.20140205

//
// This manages menus, submenus, panels, and pages.
// Like this:
// ---.--------------------------------------------------------.----------------------.------------------------.---
//    |                                                        |                      |                        |
//    |  Selected Main Menu Item   .-----------. .---------.   |  Alt Main Menu Item  |  Third Main Menu Item  |
//    |                           /  Subitem 1  \ Subitem 2 \  |                      |                        |
// ---'--------------------------'               '-------------'----------------------'------------------------'---
//       |                                                                                                 |
//       |   Panel for Subitem 1, this is Page 1                                                           |
//       |                                                                                                 |
//       |   Each Panel can have multiple pages, one page showing at a time.  Buttons on pages switch      |
//       |   between pages.  Panel height adjusts to the height of the page.                               |
//       |                                                                                                 |
//       |   [ see page 2 ]                                                                                |
//       |                                                                                                 |
//       '-------------------------------------------------------------------------------------------------'
//
// - menus are always <ul> tags; each <li> is a menu item
// - a main menu <li> must contain an <a> tag and may also contain a <ul> submenu
// - a submenu <li> must contain an <a> tag with a data-targetpanel attribute set
// - There is always a single selected main menu item
// - A main menu item may either link to another webpage, or have a submenu
// - Selecting a main menu item will show its submenu, if it has one
// - A submenu always has a single item selected
// - Clicking an inactive submenu item will show its panel
// - Clicking a selected submenu item will toggle its panel showing <-> hiding ((( NB: not yet implemented )))
// - A panel initially shows its first page
// - Switching pages in a panel changes the panel height to suit its current page
// - A panel is a HTML block element with the class .mspp-panel (can be overridden via option)
// - If a panel contains pages, one page should have the class .current (can be overridden via option)
// - A page is a HTML block element with the class .mspp-page (can be overridden via option)
// - <button> or <a> tags in pages that have a data-targetpage attribute set will switch to the indicated page
//
//
// The HTML should look like this:
//
//  <ul class="menu">                   <!-- this is the main menu -->
//      <li class="current">            <!-- this is a main menu item, currently selected -->
//          <a>First Item</a>           <!-- the first item in the main menu -->
//          <ul>                        <!-- a submenu in the first main menu item -->
//              <li class="current">    <!-- the currently selected submenu item -->
//                                      <!-- .paneltrigger and the data-panelid attribute are required -->
//                  <a data-targetpanel="panel1">do the panel1 thing</a>
//              </li>
//              <li>...</li>            <!-- another submenu item -->
//          </ul>
//      </li>
//      <li> <a href="another_page.html">another page</a> </li>
//      <li> <a>whatever</a> </li>
//  </ul>
//
//  <div id="panel1" class="mspp-panel">
//      <div id="page11" class="mspp-page current">
//          This is the current page on panel 1.
//          <button type="button" data-targetpage="page12">show page 2</button>
//      </div>
//      <div id="page12" class="mspp-page">
//          This is the other page on panel 1.
//          <a data-targetpage="page11">see the first page again</a>
//      </div>
//  </div>
//  <div id="panel2" class="mspp-panel">
//      <div id="page21" class="mspp-page current">
//          This is the current page on panel 2.
//          <button type="button" data-targetpage="page22">show page 2</button>
//      </div>
//      <div id="page22" class="mspp-page">
//          This is the other page on panel 2.
//          <a data-targetpage="page21">see the first page again</a>
//      </div>
//  </div>


;( function($, window, document, undefined) {

    // namespace climas, widget name mspp
    // second arg is used as the widget's "prototype" object
    $.widget( "climas.mspp" , {

        //Options to be used as defaults
        options: {
            animationFactor: 2,

            mainMenuClass: 'mspp-main-menu',

            panelClass: 'mspp-panel',
            pageClass: 'mspp-page',

            clearfixClass: 'mspp-clearfix',
            activeClass: 'current'
        },
        // ----------------------------------------------------------
        //Setup widget (eg. element creation, apply theming
        // , bind events etc.)
        _create: function() {

            var base = this;
            var opts = this.options;

            // populate some convenience variables
            var $menu = this.element;
            this.mainMenuItems = $menu.children('li');
            this.panels = $('.' + opts.panelClass);

            // disappear while we sort things out
            $menu.css({ opacity: 0 });
            this.panels.css({ opacity: 0 });

            // make some DOM mods
            $menu.addClass(opts.mainMenuClass);
            $menu.addClass(opts.clearfixClass);
            this.panels.addClass(opts.clearfixClass);

            // layout the menu
            this._layoutMenu();

            // layout the panels
            this._layoutPanels();

            // hook up click handling etc
            $menu.on('msppshowmenu', this._showMenu);
            $menu.on('msppshowsubmenu', this._showSubMenu);
            $menu.on('msppshowpanel', this._showPanel);
            $menu.on('msppshowpage', this._showPage);

            // attach handlers to the menu-triggers
            this.mainMenuItems.each( function(index, item) {
                // the li menu item has a child a that is it's trigger
                $(item).children('a').click( function(event) {
                    base._trigger('showmenu', event, {
                        menuitem: item,
                        widget: base
                    });
                });
                // attach handlers to the submenu items
                $(item).find('li').each( function(index, subMenuItem) {
                    $(subMenuItem).find('a').click( function(event) {
                        base._trigger('showsubmenu', event, {
                            menuitem: item,
                            submenuitem: subMenuItem,
                            widget: base
                        });
                    });
                });
            });

            // attach handlers to the panel triggers
            $menu.find('[data-targetpanel]').each( function(index, trigger) {
                var $trigger =$(trigger);
                $trigger.click( function(event) {
                    base._trigger('showpanel', event, {
                        panel: $('#' + $trigger.data('targetpanel')).first(),
                        widget: base
                    });
                });
            });

            // attach handlers to the page switchers
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.find('[data-targetpage]').click( function(event) {
                    base._trigger('showpage', event, {
                        panel: $panel,
                        page: $('#' + $(this).data('targetpage')),
                        widget: base
                    });
                });
            });

            // activate the current menus, panels etc
            var $currentMain = this.mainMenuItems.filter('.' + opts.activeClass);
            $currentMain.removeClass(opts.activeClass).children('a').click();

            // finally, fade back in
            $menu.animate({ opacity: 1 }, 'fast');

            // panels stay invisible
        },
        // ----------------------------------------------------------
        _switchClassOption: function(className, newClass) {
            var oldClass = this.options[className];
            if (oldClass !== newClass) {
                var group = this.element.find('.' + oldClass);
                this.options[className] = newClass;
                group.removeClass(oldClass);
                group.addClass(newClass);
            }
        },
        // ----------------------------------------------------------
        // Respond to any changes the user makes to the
        // option method
        _setOption: function(key, value) {
            switch (key) {
                case "mainMenuClass":
                case "clearfixClass":
                case "activeClass":
                    this._switchClassOption(key, value);
                    break;

                default:
                    this.options[key] = value;
                    break;
                // it's okay that there's no } here
            }
            // remember to call our super's _setOption method
            this._super( "_setOption", key, value );
        },
        // ----------------------------------------------------------
        // Destroy an instantiated plugin and clean up
        // modifications the widget has made to the DOM
        _destroy: function() {
            this.element.removeClass(this.options.mainMenuClass);
            this.element.removeClass(this.options.clearfixClass);
            this.panels.removeClass(this.options.clearfixClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutMenu: function() {
            // go through each submenu and record its width
            this.element.find('ul').each( function(index, subMenu) {
                var $sm = $(subMenu);
                $sm.css({width: 'auto'});
                $sm.data('originalWidth', $sm.width());

                // leave each submenu hidden, with width 0
                $sm.css({ width: 0, display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _showMenu: function(event, data) {
            var $item = $(data.menuitem);
            var base = data.widget;
            // $item is a clicked-on menu item..
            if ($item.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                base.mainMenuItems.removeClass(base.options.activeClass);
                var $newSubMenu = $item.find('ul');
                var $oldSubMenus = base.element.find('ul').not($newSubMenu);
                var newWidth = $newSubMenu.data('originalWidth');

                $oldSubMenus.animate({ width: 0 }, (50 * base.options.animationFactor), function() {
                    $oldSubMenus.css({ display: 'none' });
                });
                $item.addClass(base.options.activeClass);
                $newSubMenu
                    .css({display: 'block' })
                    .animate({ width: newWidth }, (125 * base.options.animationFactor), function() {
                        $newSubMenu.css({ width: 'auto' }).removeAttr('style');
                        base._trigger('menushown', event, { item: $item, widget: base });
                    })
                ;
                // if the new submenu has an active item, click it
                $newSubMenu.find('.' + base.options.activeClass + ' a').click();
            }
        },
        // ----------------------------------------------------------
        _showSubMenu: function(event, data) {
            // de-activeify all the submenu items
            $(data.menuitem).find('li').removeClass(data.widget.options.activeClass);
            // active-ify the one true submenu item
            $(data.submenuitem).addClass(data.widget.options.activeClass);
        },
        // ----------------------------------------------------------
        // do the layout calculations
        _layoutPanels: function() {

            var $pages = this.panels.find('.' + this.options.pageClass);

            // go through each page and record its height
            $pages.each( function(index, page) {
                var $page = $(page);
                $page.css({height: 'auto'});
                $page.data('originalHeight', $page.outerHeight());

                // leave each page hidden, with height 0
                $page.css({ height: 0, display: 'none' });
            });

            // go through each panel and hide it
            this.panels.each( function(index, panel) {
                var $panel = $(panel);
                $panel.css({ display: 'none' });
            });
        },
        // ----------------------------------------------------------
        _hidePanels: function() {
            this.panels.removeClass(this.options.activeClass).css({ display: 'none', height: 0 });
        },
        // ----------------------------------------------------------
        _showPanel: function(event, data) {
            var $panel = $(data.panel);
            var base = data.widget;
            // $panel is a panel to show..
            if ($panel.hasClass(base.options.activeClass)) {
                // ??
            } else {
                base._hidePanels();
                $panel.addClass(base.options.activeClass);
                $panel.css({ display: 'block', opacity: 1 });
                var $page = $($panel.find('.' + base.options.pageClass + '.' + base.options.activeClass));
                base._trigger('showpage', event, { panel: $panel, page: $page, widget: base });
            }
        },
        // ----------------------------------------------------------
        _showPage: function(event, data) {
            var base = data.widget;
            var $panel = $(data.panel);
            var $page = $(data.page);
            var newHeight = $page.data('originalHeight');

            // fix the panel's current height
            $panel.css({height: $panel.height() });

            // deal with the page currently being displayed
            var $oldPage = $panel.find('.' + base.options.pageClass + '.' + base.options.activeClass).not($page);
            if ($oldPage.length > 0) {
                $oldPage.data('originalHeight', $oldPage.outerHeight());
                $oldPage.removeClass(base.options.activeClass).fadeOut((50 * base.options.animationFactor), function() {
                    $oldPage.css({ height: 0 });
                });
            }

            // switch on the new page and grow the opanel to hold it
            $page.css({ height: 'auto' }).addClass(base.options.activeClass).fadeIn((100 * base.options.animationFactor), function() {
                $page.removeAttr('style');
            });
            var animTime = ($oldPage.length > 0 ? (100 * base.options.animationFactor) : (150 * base.options.animationFactor)); // animate faster if it's switching pages
            $panel.animate({ height: newHeight }, animTime, function() {
                $panel.removeAttr('style');
            });

        },
        // ----------------------------------------------------------
        _: null // no following comma
    });

})(jQuery, window, document);













},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL2Zha2VfMmZjYTAzNWYuanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21haW4uanMiLCIvVXNlcnMvcHZyZHdiL3Byb2plY3RzL2NsaW1hcy1nbG9iYWwvd2ViYXBwL2NsaW1hc25nL3NyYy9qcy9tYXB2aWV3L21vZGVscy9tYXBsYXllci5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdXRpbC9zaGltcy5qcyIsIi9Vc2Vycy9wdnJkd2IvcHJvamVjdHMvY2xpbWFzLWdsb2JhbC93ZWJhcHAvY2xpbWFzbmcvc3JjL2pzL21hcHZpZXcvdmlld3MvYXBwLmpzIiwiL1VzZXJzL3B2cmR3Yi9wcm9qZWN0cy9jbGltYXMtZ2xvYmFsL3dlYmFwcC9jbGltYXNuZy9zcmMvanMvbWVudXNhbmRwYW5lbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdpQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG5yZXF1aXJlKCcuL21hcHZpZXcvbWFpbicpO1xucmVxdWlyZSgnLi9tZW51c2FuZHBhbmVscycpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICAgIC8vICQoJ2hlYWRlcicpLmRpc2FibGVTZWxlY3Rpb24oKTsgLy8gdW5wb3B1bGFyIGJ1dCBzdGlsbCBiZXR0ZXJcbiAgICAkKCduYXYgPiB1bCcpLm1zcHAoe30pO1xufSk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBBcHBWaWV3O1xuXG4gIGlmICghd2luZG93LmNvbnNvbGUpIHtcbiAgICB3aW5kb3cuY29uc29sZSA9IHtcbiAgICAgIGxvZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgQXBwVmlldyA9IHJlcXVpcmUoJy4vdmlld3MvYXBwJyk7XG5cbiAgJChmdW5jdGlvbigpIHtcbiAgICB2YXIgYXBwdmlldztcbiAgICBhcHB2aWV3ID0gbmV3IEFwcFZpZXcoKTtcbiAgICByZXR1cm4gYXBwdmlldy5yZW5kZXIoKTtcbiAgfSk7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBNYXBMYXllcjtcblxuICBNYXBMYXllciA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKHNob3J0TmFtZSwgbG9uZ05hbWUsIHBhdGgpIHtcbiAgICAgIHRoaXMuc2hvcnROYW1lID0gc2hvcnROYW1lO1xuICAgICAgdGhpcy5sb25nTmFtZSA9IGxvbmdOYW1lO1xuICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBNYXBMYXllcjtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmZvckVhY2gpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGZuLCBzY29wZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmLCBfcmVzdWx0cztcbiAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICBmb3IgKGkgPSBfaSA9IDAsIF9yZWYgPSB0aGlzLmxlbmd0aDsgMCA8PSBfcmVmID8gX2kgPD0gX3JlZiA6IF9pID49IF9yZWY7IGkgPSAwIDw9IF9yZWYgPyArK19pIDogLS1faSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKF9faW5kZXhPZi5jYWxsKHRoaXMsIGkpID49IDAgPyBmbi5jYWxsKHNjb3BlLCB0aGlzW2ldLCBpLCB0aGlzKSA6IHZvaWQgMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfTtcbiAgfVxuXG4gIGlmICghQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKG5lZWRsZSkge1xuICAgICAgdmFyIGksIF9pLCBfcmVmO1xuICAgICAgZm9yIChpID0gX2kgPSAwLCBfcmVmID0gdGhpcy5sZW5ndGg7IDAgPD0gX3JlZiA/IF9pIDw9IF9yZWYgOiBfaSA+PSBfcmVmOyBpID0gMCA8PSBfcmVmID8gKytfaSA6IC0tX2kpIHtcbiAgICAgICAgaWYgKHRoaXNbaV0gPT09IG5lZWRsZSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgQXBwVmlldywgTWFwTGF5ZXIsIGRlYnVnLFxuICAgIF9faW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG4gIE1hcExheWVyID0gcmVxdWlyZSgnLi4vbW9kZWxzL21hcGxheWVyJyk7XG5cbiAgcmVxdWlyZSgnLi4vdXRpbC9zaGltcycpO1xuXG5cbiAgLyoganNoaW50IC1XMDkzICovXG5cbiAgZGVidWcgPSBmdW5jdGlvbihpdGVtVG9Mb2csIGl0ZW1MZXZlbCkge1xuICAgIHZhciBsZXZlbHMsIG1lc3NhZ2VOdW0sIHRocmVzaG9sZCwgdGhyZXNob2xkTnVtO1xuICAgIGxldmVscyA9IFsndmVyeWRlYnVnJywgJ2RlYnVnJywgJ21lc3NhZ2UnLCAnd2FybmluZyddO1xuICAgIHRocmVzaG9sZCA9ICdtZXNzYWdlJztcbiAgICBpZiAoIWl0ZW1MZXZlbCkge1xuICAgICAgaXRlbUxldmVsID0gJ2RlYnVnJztcbiAgICB9XG4gICAgdGhyZXNob2xkTnVtID0gbGV2ZWxzLmluZGV4T2YodGhyZXNob2xkKTtcbiAgICBtZXNzYWdlTnVtID0gbGV2ZWxzLmluZGV4T2YoaXRlbUxldmVsKTtcbiAgICBpZiAodGhyZXNob2xkTnVtID4gbWVzc2FnZU51bSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoaXRlbVRvTG9nICsgJycgPT09IGl0ZW1Ub0xvZykge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiW1wiICsgaXRlbUxldmVsICsgXCJdIFwiICsgaXRlbVRvTG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKGl0ZW1Ub0xvZyk7XG4gICAgfVxuICB9O1xuXG4gIEFwcFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG4gICAgdGFnTmFtZTogJ2RpdicsXG4gICAgY2xhc3NOYW1lOiAnc3BsaXRtYXAgc2hvd2Zvcm1zJyxcbiAgICBpZDogJ3NwbGl0bWFwJyxcbiAgICBzcGVjaWVzRGF0YVVybDogd2luZG93Lm1hcENvbmZpZy5zcGVjaWVzRGF0YVVybCxcbiAgICBiaW9kaXZEYXRhVXJsOiB3aW5kb3cubWFwQ29uZmlnLmJpb2RpdkRhdGFVcmwsXG4gICAgcmFzdGVyQXBpVXJsOiB3aW5kb3cubWFwQ29uZmlnLnJhc3RlckFwaVVybCxcbiAgICB0cmFja1NwbGl0dGVyOiBmYWxzZSxcbiAgICB0cmFja1BlcmlvZDogMTAwLFxuICAgIGV2ZW50czoge1xuICAgICAgJ2NsaWNrIC5idG4tY2hhbmdlJzogJ3RvZ2dsZUZvcm1zJyxcbiAgICAgICdjbGljayAuYnRuLWNvbXBhcmUnOiAndG9nZ2xlU3BsaXR0ZXInLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5sZWZ0LXZhbGlkLW1hcCc6ICdjb3B5TWFwTGVmdFRvUmlnaHQnLFxuICAgICAgJ2NsaWNrIC5idG4tY29weS5yaWdodC12YWxpZC1tYXAnOiAnY29weU1hcFJpZ2h0VG9MZWZ0JyxcbiAgICAgICdsZWZ0bWFwdXBkYXRlJzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdyaWdodG1hcHVwZGF0ZSc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBzZWxlY3QubGVmdCc6ICdsZWZ0U2lkZVVwZGF0ZScsXG4gICAgICAnY2hhbmdlIHNlbGVjdC5yaWdodCc6ICdyaWdodFNpZGVVcGRhdGUnLFxuICAgICAgJ2NoYW5nZSBpbnB1dC5sZWZ0JzogJ2xlZnRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgaW5wdXQucmlnaHQnOiAncmlnaHRTaWRlVXBkYXRlJyxcbiAgICAgICdjaGFuZ2UgI3N5bmMnOiAndG9nZ2xlU3luYydcbiAgICB9LFxuICAgIHRpY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGZhbHNlKSB7XG4gICAgICAgIGRlYnVnKHRoaXMubGVmdEluZm8uc2NlbmFyaW8pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVidWcoJ3RpY2snKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMudGljaywgMTAwMCk7XG4gICAgfSxcbiAgICBpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmluaXRpYWxpemUnKTtcbiAgICAgIF8uYmluZEFsbC5hcHBseShfLCBbdGhpc10uY29uY2F0KF8uZnVuY3Rpb25zKHRoaXMpKSk7XG4gICAgICB0aGlzLm5hbWVzTGlzdCA9IFtdO1xuICAgICAgdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgIHRoaXMuc3BlY2llc0luZm9GZXRjaFByb2Nlc3MgPSB0aGlzLmZldGNoU3BlY2llc0luZm8oKTtcbiAgICAgIHRoaXMuYmlvZGl2TGlzdCA9IFtdO1xuICAgICAgcmV0dXJuIHRoaXMuYmlvZGl2SW5mb0ZldGNoUHJvY2VzcyA9IHRoaXMuZmV0Y2hCaW9kaXZJbmZvKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcucmVuZGVyJyk7XG4gICAgICB0aGlzLiRlbC5hcHBlbmQoQXBwVmlldy50ZW1wbGF0ZXMubGF5b3V0KHtcbiAgICAgICAgbGVmdFRhZzogQXBwVmlldy50ZW1wbGF0ZXMubGVmdFRhZygpLFxuICAgICAgICByaWdodFRhZzogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRUYWcoKSxcbiAgICAgICAgbGVmdEZvcm06IEFwcFZpZXcudGVtcGxhdGVzLmxlZnRGb3JtKCksXG4gICAgICAgIHJpZ2h0Rm9ybTogQXBwVmlldy50ZW1wbGF0ZXMucmlnaHRGb3JtKClcbiAgICAgIH0pKTtcbiAgICAgICQoJyNjb250ZW50d3JhcCcpLmFwcGVuZCh0aGlzLiRlbCk7XG4gICAgICB0aGlzLm1hcCA9IEwubWFwKCdtYXAnLCB7XG4gICAgICAgIGNlbnRlcjogWzAsIDBdLFxuICAgICAgICB6b29tOiAzXG4gICAgICB9KTtcbiAgICAgIHRoaXMubWFwLm9uKCdtb3ZlJywgdGhpcy5yZXNpemVUaGluZ3MpO1xuICAgICAgTC50aWxlTGF5ZXIoJ2h0dHA6Ly97c30ue2Jhc2V9Lm1hcHMuY2l0LmFwaS5oZXJlLmNvbS9tYXB0aWxlLzIuMS97dHlwZX0ve21hcElEfS97c2NoZW1lfS97en0ve3h9L3t5fS97c2l6ZX0ve2Zvcm1hdH0/YXBwX2lkPXthcHBfaWR9JmFwcF9jb2RlPXthcHBfY29kZX0mbGc9e2xhbmd1YWdlfScsIHtcbiAgICAgICAgYXR0cmlidXRpb246ICdNYXAgJmNvcHk7IDIwMTYgPGEgaHJlZj1cImh0dHA6Ly9kZXZlbG9wZXIuaGVyZS5jb21cIj5IRVJFPC9hPicsXG4gICAgICAgIHN1YmRvbWFpbnM6ICcxMjM0JyxcbiAgICAgICAgYmFzZTogJ2FlcmlhbCcsXG4gICAgICAgIHR5cGU6ICdtYXB0aWxlJyxcbiAgICAgICAgc2NoZW1lOiAndGVycmFpbi5kYXknLFxuICAgICAgICBhcHBfaWQ6ICdsMlJ5ZTZ6d3EzdTJjSFpwVklQTycsXG4gICAgICAgIGFwcF9jb2RlOiAnTXBYU2xOTGNMU1FJcGRVNlhIQjBUUScsXG4gICAgICAgIG1hcElEOiAnbmV3ZXN0JyxcbiAgICAgICAgbWF4Wm9vbTogMTgsXG4gICAgICAgIGxhbmd1YWdlOiAnZW5nJyxcbiAgICAgICAgZm9ybWF0OiAncG5nOCcsXG4gICAgICAgIHNpemU6ICcyNTYnXG4gICAgICB9KS5hZGRUbyh0aGlzLm1hcCk7XG4gICAgICB0aGlzLmxlZnRGb3JtID0gdGhpcy4kKCcubGVmdC5mb3JtJyk7XG4gICAgICB0aGlzLmJ1aWxkTGVmdEZvcm0oKTtcbiAgICAgIHRoaXMucmlnaHRGb3JtID0gdGhpcy4kKCcucmlnaHQuZm9ybScpO1xuICAgICAgdGhpcy5idWlsZFJpZ2h0Rm9ybSgpO1xuICAgICAgdGhpcy5sZWZ0VGFnID0gdGhpcy4kKCcubGVmdC50YWcnKTtcbiAgICAgIHRoaXMucmlnaHRUYWcgPSB0aGlzLiQoJy5yaWdodC50YWcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lID0gdGhpcy4kKCcuc3BsaXRsaW5lJyk7XG4gICAgICB0aGlzLnNwbGl0VGh1bWIgPSB0aGlzLiQoJy5zcGxpdHRodW1iJyk7XG4gICAgICB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgICB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlU3BsaXR0ZXIoKTtcbiAgICB9LFxuICAgIHJlc29sdmVQbGFjZWhvbGRlcnM6IGZ1bmN0aW9uKHN0cldpdGhQbGFjZWhvbGRlcnMsIHJlcGxhY2VtZW50cykge1xuICAgICAgdmFyIGFucywga2V5LCByZSwgdmFsdWU7XG4gICAgICBhbnMgPSBzdHJXaXRoUGxhY2Vob2xkZXJzO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5wcm90b2NvbFxccypcXH1cXH0vZywgbG9jYXRpb24ucHJvdG9jb2wpO1xuICAgICAgYW5zID0gYW5zLnJlcGxhY2UoL1xce1xce1xccypsb2NhdGlvbi5ob3N0XFxzKlxcfVxcfS9nLCBsb2NhdGlvbi5ob3N0KTtcbiAgICAgIGFucyA9IGFucy5yZXBsYWNlKC9cXHtcXHtcXHMqbG9jYXRpb24uaG9zdG5hbWVcXHMqXFx9XFx9L2csIGxvY2F0aW9uLmhvc3RuYW1lKTtcbiAgICAgIGZvciAoa2V5IGluIHJlcGxhY2VtZW50cykge1xuICAgICAgICB2YWx1ZSA9IHJlcGxhY2VtZW50c1trZXldO1xuICAgICAgICByZSA9IG5ldyBSZWdFeHAoXCJcXFxce1xcXFx7XFxcXHMqXCIgKyBrZXkgKyBcIlxcXFxzKlxcXFx9XFxcXH1cIiwgXCJnXCIpO1xuICAgICAgICBhbnMgPSBhbnMucmVwbGFjZShyZSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGFucztcbiAgICB9LFxuICAgIGNvcHlNYXBMZWZ0VG9SaWdodDogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jb3B5TWFwTGVmdFRvUmlnaHQnKTtcbiAgICAgIGlmICghdGhpcy5sZWZ0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNyaWdodG1hcHNwcCcpLnZhbCh0aGlzLmxlZnRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFweWVhcicpLnZhbCh0aGlzLmxlZnRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPXJpZ2h0bWFwc2NlbmFyaW9dJykuZWFjaCgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuICQoaXRlbSkucHJvcCgnY2hlY2tlZCcsICQoaXRlbSkudmFsKCkgPT09IF90aGlzLmxlZnRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwZ2NtJykudmFsKHRoaXMubGVmdEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLnJpZ2h0U2lkZVVwZGF0ZSgpO1xuICAgIH0sXG4gICAgY29weU1hcFJpZ2h0VG9MZWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmNvcHlNYXBSaWdodFRvTGVmdCcpO1xuICAgICAgaWYgKCF0aGlzLnJpZ2h0SW5mbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLiQoJyNsZWZ0bWFwc3BwJykudmFsKHRoaXMucmlnaHRJbmZvLnNwZWNpZXNOYW1lKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXB5ZWFyJykudmFsKHRoaXMucmlnaHRJbmZvLnllYXIpO1xuICAgICAgdGhpcy4kKCdpbnB1dFtuYW1lPWxlZnRtYXBzY2VuYXJpb10nKS5lYWNoKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gJChpdGVtKS5wcm9wKCdjaGVja2VkJywgJChpdGVtKS52YWwoKSA9PT0gX3RoaXMucmlnaHRJbmZvLnNjZW5hcmlvKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIHRoaXMuJCgnI2xlZnRtYXBnY20nKS52YWwodGhpcy5yaWdodEluZm8uZ2NtKTtcbiAgICAgIHJldHVybiB0aGlzLmxlZnRTaWRlVXBkYXRlKCk7XG4gICAgfSxcbiAgICBzaWRlVXBkYXRlOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgYXRDdXJyZW50LCBjdXJySW5mbywgbWFwVmFsaWRRdWVyeSwgbmV3SW5mbywgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnNpZGVVcGRhdGUgKCcgKyBzaWRlICsgJyknKTtcbiAgICAgIG5ld0luZm8gPSB7XG4gICAgICAgIHNwZWNpZXNOYW1lOiB0aGlzLiQoJyMnICsgc2lkZSArICdtYXBzcHAnKS52YWwoKSxcbiAgICAgICAgZGVnczogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZGVncycpLnZhbCgpLFxuICAgICAgICByYW5nZTogdGhpcy4kKCdpbnB1dFtuYW1lPScgKyBzaWRlICsgJ21hcHJhbmdlXTpjaGVja2VkJykudmFsKCksXG4gICAgICAgIGNvbmZpZGVuY2U6IHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGNvbmZpZGVuY2UnKS52YWwoKSxcbiAgICAgICAgeWVhcjogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFweWVhcicpLnZhbCgpLFxuICAgICAgICBzY2VuYXJpbzogdGhpcy4kKCdpbnB1dFtuYW1lPScgKyBzaWRlICsgJ21hcHNjZW5hcmlvXTpjaGVja2VkJykudmFsKCksXG4gICAgICAgIGdjbTogdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZ2NtJykudmFsKClcbiAgICAgIH07XG4gICAgICBhdEN1cnJlbnQgPSBuZXdJbmZvLmRlZ3MgPT09ICdjdXJyZW50JztcbiAgICAgIHRoaXMuJChbJ2lucHV0W25hbWU9JyArIHNpZGUgKyAnbWFwcmFuZ2VdJywgJyMnICsgc2lkZSArICdtYXBjb25maWRlbmNlJ10uam9pbignLCcpKS5wcm9wKCdkaXNhYmxlZCcsIGF0Q3VycmVudCk7XG4gICAgICB0aGlzLiQoJy4nICsgc2lkZSArICcuc2lkZS5mb3JtIGZpZWxkc2V0JykucmVtb3ZlQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICB0aGlzLiQoJ2lucHV0W25hbWVePScgKyBzaWRlICsgJ106ZGlzYWJsZWQsIFtpZF49JyArIHNpZGUgKyAnXTpkaXNhYmxlZCcpLmNsb3Nlc3QoJ2ZpZWxkc2V0JykuYWRkQ2xhc3MoJ2Rpc2FibGVkJyk7XG4gICAgICBtYXBWYWxpZFF1ZXJ5ID0gJy4nICsgc2lkZSArICctdmFsaWQtbWFwJztcbiAgICAgIGlmIChfcmVmID0gbmV3SW5mby5zcGVjaWVzTmFtZSwgX19pbmRleE9mLmNhbGwodGhpcy5uYW1lc0xpc3QsIF9yZWYpID49IDApIHtcbiAgICAgICAgdGhpcy4kKG1hcFZhbGlkUXVlcnkpLnJlbW92ZUNsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kKG1hcFZhbGlkUXVlcnkpLmFkZENsYXNzKCdkaXNhYmxlZCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGN1cnJJbmZvID0gc2lkZSA9PT0gJ2xlZnQnID8gdGhpcy5sZWZ0SW5mbyA6IHRoaXMucmlnaHRJbmZvO1xuICAgICAgaWYgKGN1cnJJbmZvICYmIF8uaXNFcXVhbChuZXdJbmZvLCBjdXJySW5mbykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKGN1cnJJbmZvICYmIG5ld0luZm8uc3BlY2llc05hbWUgPT09IGN1cnJJbmZvLnNwZWNpZXNOYW1lICYmIG5ld0luZm8uZGVncyA9PT0gY3VyckluZm8uZGVncyAmJiBuZXdJbmZvLmRlZ3MgPT09ICdjdXJyZW50Jykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdEluZm8gPSBuZXdJbmZvO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yaWdodEluZm8gPSBuZXdJbmZvO1xuICAgICAgfVxuICAgICAgdGhpcy5hZGRNYXBMYXllcihzaWRlKTtcbiAgICAgIHJldHVybiB0aGlzLmFkZE1hcFRhZyhzaWRlKTtcbiAgICB9LFxuICAgIGxlZnRTaWRlVXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2lkZVVwZGF0ZSgnbGVmdCcpO1xuICAgICAgaWYgKHRoaXMuJCgnI3N5bmMnKVswXS5jaGVja2VkKSB7XG4gICAgICAgIGRlYnVnKCdTeW5jIGNoZWNrZWQgLSBzeW5jaW5nIHJpZ2h0IHNpZGUnLCAnbWVzc2FnZScpO1xuICAgICAgICByZXR1cm4gdGhpcy5jb3B5U3BwVG9SaWdodFNpZGUoKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIHJpZ2h0U2lkZVVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zaWRlVXBkYXRlKCdyaWdodCcpO1xuICAgIH0sXG4gICAgY29weVNwcFRvUmlnaHRTaWRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJCgnI3JpZ2h0bWFwc3BwJykudmFsKHRoaXMuJCgnI2xlZnRtYXBzcHAnKS52YWwoKSk7XG4gICAgICByZXR1cm4gdGhpcy5yaWdodFNpZGVVcGRhdGUoKTtcbiAgICB9LFxuICAgIGFkZE1hcFRhZzogZnVuY3Rpb24oc2lkZSkge1xuICAgICAgdmFyIGRpc3BMb29rdXAsIGluZm8sIHRhZztcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcFRhZycpO1xuICAgICAgaWYgKHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICBpbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIGluZm8gPSB0aGlzLnJpZ2h0SW5mbztcbiAgICAgIH1cbiAgICAgIHRhZyA9IFwiPGI+PGk+XCIgKyBpbmZvLnNwZWNpZXNOYW1lICsgXCI8L2k+PC9iPlwiO1xuICAgICAgZGlzcExvb2t1cCA9IHtcbiAgICAgICAgJzBkaXNwJzogJ25vIHJhbmdlIGFkYXB0YXRpb24nLFxuICAgICAgICAnNTBkaXNwJzogJzUwIHllYXJzIG9mIHJhbmdlIGFkYXB0YXRpb24nLFxuICAgICAgICAnMTAwZGlzcCc6ICcxMDAgeWVhcnMgb2YgcmFuZ2UgYWRhcHRhdGlvbidcbiAgICAgIH07XG4gICAgICBpZiAoaW5mby5kZWdzID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgdGFnID0gXCJjdXJyZW50IFwiICsgdGFnICsgXCIgZGlzdHJpYnV0aW9uXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0YWcgPSBcIjxiPlwiICsgaW5mby5jb25maWRlbmNlICsgXCI8L2I+IHBlcmNlbnRpbGUgcHJvamVjdGlvbnMgZm9yIFwiICsgdGFnICsgXCIgYXQgPGI+K1wiICsgaW5mby5kZWdzICsgXCImZGVnO0M8L2I+IHdpdGggPGI+XCIgKyBkaXNwTG9va3VwW2luZm8ucmFuZ2VdICsgXCI8L2I+XCI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHRoaXMubGVmdFRhZy5maW5kKCcubGVmdGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJpZ2h0VGFnLmZpbmQoJy5yaWdodGxheWVybmFtZScpLmh0bWwodGFnKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGFkZE1hcExheWVyOiBmdW5jdGlvbihzaWRlKSB7XG4gICAgICB2YXIgZnV0dXJlTW9kZWxQb2ludCwgaXNCaW9kaXZlcnNpdHksIGxheWVyLCBsb2FkQ2xhc3MsIG1hcFVybCwgc2lkZUluZm8sIHNwcEZpbGVOYW1lLCB2YWwsIHppcFVybCwgX3JlZjtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFkZE1hcExheWVyJyk7XG4gICAgICBpZiAoc2lkZSA9PT0gJ2xlZnQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5sZWZ0SW5mbztcbiAgICAgIH1cbiAgICAgIGlmIChzaWRlID09PSAncmlnaHQnKSB7XG4gICAgICAgIHNpZGVJbmZvID0gdGhpcy5yaWdodEluZm87XG4gICAgICB9XG4gICAgICBpc0Jpb2RpdmVyc2l0eSA9IChfcmVmID0gc2lkZUluZm8uc3BlY2llc05hbWUsIF9faW5kZXhPZi5jYWxsKHRoaXMuYmlvZGl2TGlzdCwgX3JlZikgPj0gMCk7XG4gICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJyc7XG4gICAgICBtYXBVcmwgPSAnJztcbiAgICAgIHppcFVybCA9ICcnO1xuICAgICAgaWYgKGlzQmlvZGl2ZXJzaXR5KSB7XG4gICAgICAgIGZ1dHVyZU1vZGVsUG9pbnQgPSBbJ2Jpb2RpdmVyc2l0eS9kZWNpbGVzL2Jpb2RpdmVyc2l0eScsIHNpZGVJbmZvLnNjZW5hcmlvLCBzaWRlSW5mby55ZWFyLCBzaWRlSW5mby5nY21dLmpvaW4oJ18nKTtcbiAgICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICBmdXR1cmVNb2RlbFBvaW50ID0gJ2Jpb2RpdmVyc2l0eS9iaW9kaXZlcnNpdHlfY3VycmVudCc7XG4gICAgICAgIH1cbiAgICAgICAgbWFwVXJsID0gW1xuICAgICAgICAgIHRoaXMucmVzb2x2ZVBsYWNlaG9sZGVycyh0aGlzLmJpb2RpdkRhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcEdyb3VwOiBzaWRlSW5mby5zcGVjaWVzTmFtZVxuICAgICAgICAgIH0pLCBmdXR1cmVNb2RlbFBvaW50ICsgJy50aWYnXG4gICAgICAgIF0uam9pbignLycpO1xuICAgICAgICB6aXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMuYmlvZGl2RGF0YVVybCwge1xuICAgICAgICAgICAgc3BwR3JvdXA6IHNpZGVJbmZvLnNwZWNpZXNOYW1lXG4gICAgICAgICAgfSksICdiaW9kaXZlcnNpdHknLCBzaWRlSW5mby5zcGVjaWVzTmFtZSArICcuemlwJ1xuICAgICAgICBdLmpvaW4oJy8nKTtcbiAgICAgICAgdGhpcy4kKCcjJyArIHNpZGUgKyAnbWFwZGwnKS5hdHRyKCdocmVmJywgbWFwVXJsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwcEZpbGVOYW1lID0gWydURU1QJywgc2lkZUluZm8uZGVncywgc2lkZUluZm8uY29uZmlkZW5jZSArICcuJyArIHNpZGVJbmZvLnJhbmdlXS5qb2luKCdfJyk7XG4gICAgICAgIGlmIChzaWRlSW5mby5kZWdzID09PSAnY3VycmVudCcpIHtcbiAgICAgICAgICBzcHBGaWxlTmFtZSA9ICdjdXJyZW50JztcbiAgICAgICAgfVxuICAgICAgICBtYXBVcmwgPSBbXG4gICAgICAgICAgdGhpcy5yZXNvbHZlUGxhY2Vob2xkZXJzKHRoaXMuc3BlY2llc0RhdGFVcmwsIHtcbiAgICAgICAgICAgIHNwcFVybDogdGhpcy5zcGVjaWVzVXJsc1tzaWRlSW5mby5zcGVjaWVzTmFtZV1cbiAgICAgICAgICB9KSwgc3BwRmlsZU5hbWUgKyAnLnRpZidcbiAgICAgICAgXS5qb2luKCcvJyk7XG4gICAgICAgIHRoaXMuJCgnIycgKyBzaWRlICsgJ21hcGRsJykuYXR0cignaHJlZicsIG1hcFVybCk7XG4gICAgICB9XG4gICAgICBsYXllciA9IEwudGlsZUxheWVyLndtcyh0aGlzLnJlc29sdmVQbGFjZWhvbGRlcnModGhpcy5yYXN0ZXJBcGlVcmwpLCB7XG4gICAgICAgIERBVEFfVVJMOiBtYXBVcmwsXG4gICAgICAgIGxheWVyczogJ0RFRkFVTFQnLFxuICAgICAgICBmb3JtYXQ6ICdpbWFnZS9wbmcnLFxuICAgICAgICB0cmFuc3BhcmVudDogdHJ1ZVxuICAgICAgfSk7XG4gICAgICBsb2FkQ2xhc3MgPSAnJyArIHNpZGUgKyAnbG9hZGluZyc7XG4gICAgICBsYXllci5vbignbG9hZGluZycsIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLiRlbC5hZGRDbGFzcyhsb2FkQ2xhc3MpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgICAgbGF5ZXIub24oJ2xvYWQnLCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwucmVtb3ZlQ2xhc3MobG9hZENsYXNzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICAgIGlmIChzaWRlID09PSAnbGVmdCcpIHtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sZWZ0TGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGVmdExheWVyID0gbGF5ZXI7XG4gICAgICB9XG4gICAgICBpZiAoc2lkZSA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5yaWdodExheWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJpZ2h0TGF5ZXIgPSBsYXllcjtcbiAgICAgIH1cbiAgICAgIGxheWVyLmFkZFRvKHRoaXMubWFwKTtcbiAgICAgIHRoaXMucmVzaXplVGhpbmdzKCk7XG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhvc3RuYW1lID09PSAnbG9jYWxob3N0Jykge1xuICAgICAgICBjb25zb2xlLmxvZygnbWFwIFVSTCBpczogJywgbWFwVXJsKTtcbiAgICAgIH1cbiAgICAgIGlmIChnYSAmJiB0eXBlb2YgZ2EgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgaWYgKHNpZGVJbmZvLnllYXIgPT09ICdiYXNlbGluZScpIHtcbiAgICAgICAgICB2YWwgPSAxOTkwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbCA9IHBhcnNlSW50KHNpZGVJbmZvLnllYXIsIDEwKTtcbiAgICAgICAgfVxuICAgICAgICB2YWwgPSB2YWwgKyB7XG4gICAgICAgICAgJ3RlbnRoJzogMC4xLFxuICAgICAgICAgICdmaWZ0aWV0aCc6IDAuNSxcbiAgICAgICAgICAnbmluZXRpZXRoJzogMC45XG4gICAgICAgIH1bc2lkZUluZm8uZ2NtXTtcbiAgICAgICAgcmV0dXJuIGdhKCdzZW5kJywge1xuICAgICAgICAgICdoaXRUeXBlJzogJ2V2ZW50JyxcbiAgICAgICAgICAnZXZlbnRDYXRlZ29yeSc6ICdtYXBzaG93JyxcbiAgICAgICAgICAnZXZlbnRBY3Rpb24nOiBzaWRlSW5mby5zcGVjaWVzTmFtZSxcbiAgICAgICAgICAnZXZlbnRMYWJlbCc6IHNpZGVJbmZvLnNjZW5hcmlvLFxuICAgICAgICAgICdldmVudFZhbHVlJzogdmFsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgY2VudHJlTWFwOiBmdW5jdGlvbihyZXBlYXRlZGx5Rm9yKSB7XG4gICAgICB2YXIgbGF0ZXIsIHJlY2VudHJlLCBfaSwgX3Jlc3VsdHM7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5jZW50cmVNYXAnKTtcbiAgICAgIGlmICghcmVwZWF0ZWRseUZvcikge1xuICAgICAgICByZXBlYXRlZGx5Rm9yID0gNTAwO1xuICAgICAgfVxuICAgICAgcmVjZW50cmUgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIF90aGlzLm1hcC5pbnZhbGlkYXRlU2l6ZShmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChsYXRlciA9IF9pID0gMDsgX2kgPD0gcmVwZWF0ZWRseUZvcjsgbGF0ZXIgPSBfaSArPSAyNSkge1xuICAgICAgICBfcmVzdWx0cy5wdXNoKHNldFRpbWVvdXQocmVjZW50cmUsIGxhdGVyKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgfSxcbiAgICB0b2dnbGVGb3JtczogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVGb3JtcycpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3Nob3dmb3JtcycpO1xuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy50b2dnbGVTcGxpdHRlcicpO1xuICAgICAgdGhpcy4kZWwudG9nZ2xlQ2xhc3MoJ3NwbGl0Jyk7XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgdGhpcy5hY3RpdmF0ZVNwbGl0dGVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRlYWN0aXZhdGVTcGxpdHRlcigpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuY2VudHJlTWFwKCk7XG4gICAgfSxcbiAgICB0b2dnbGVTeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnRvZ2dsZVN5bmMnKTtcbiAgICAgIGlmICh0aGlzLiQoJyNzeW5jJylbMF0uY2hlY2tlZCkge1xuICAgICAgICB0aGlzLiQoJy5yaWdodG1hcHNwcCcpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgICAgIHJldHVybiB0aGlzLmNvcHlTcHBUb1JpZ2h0U2lkZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCgnLnJpZ2h0bWFwc3BwJykucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmZXRjaFNwZWNpZXNJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoU3BlY2llc0luZm8nKTtcbiAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB1cmw6ICcvZGF0YS9zcGVjaWVzJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgfSkuZG9uZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgY29tbW9uTmFtZVdyaXRlciwgc3BlY2llc0xvb2t1cExpc3QsIHNwZWNpZXNTY2lOYW1lTGlzdCwgc3BlY2llc1VybHM7XG4gICAgICAgICAgc3BlY2llc0xvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgICBzcGVjaWVzU2NpTmFtZUxpc3QgPSBbXTtcbiAgICAgICAgICBzcGVjaWVzVXJscyA9IHt9O1xuICAgICAgICAgIGNvbW1vbk5hbWVXcml0ZXIgPSBmdW5jdGlvbihzY2lOYW1lKSB7XG4gICAgICAgICAgICB2YXIgc2NpTmFtZVBvc3RmaXg7XG4gICAgICAgICAgICBzY2lOYW1lUG9zdGZpeCA9IFwiIChcIiArIHNjaU5hbWUgKyBcIilcIjtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihjbkluZGV4LCBjbikge1xuICAgICAgICAgICAgICByZXR1cm4gc3BlY2llc0xvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgICAgbGFiZWw6IGNuICsgc2NpTmFtZVBvc3RmaXgsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHNjaU5hbWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH07XG4gICAgICAgICAgJC5lYWNoKGRhdGEsIGZ1bmN0aW9uKHNjaU5hbWUsIHNwcEluZm8pIHtcbiAgICAgICAgICAgIHNwZWNpZXNTY2lOYW1lTGlzdC5wdXNoKHNjaU5hbWUpO1xuICAgICAgICAgICAgc3BlY2llc1VybHNbc2NpTmFtZV0gPSBzcHBJbmZvLnBhdGg7XG4gICAgICAgICAgICBpZiAoc3BwSW5mby5jb21tb25OYW1lcykge1xuICAgICAgICAgICAgICByZXR1cm4gJC5lYWNoKHNwcEluZm8uY29tbW9uTmFtZXMsIGNvbW1vbk5hbWVXcml0ZXIoc2NpTmFtZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNwZWNpZXNMb29rdXBMaXN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGxhYmVsOiBzY2lOYW1lLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY2lOYW1lXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIF90aGlzLnNwZWNpZXNMb29rdXBMaXN0ID0gc3BlY2llc0xvb2t1cExpc3Q7XG4gICAgICAgICAgX3RoaXMuc3BlY2llc1NjaU5hbWVMaXN0ID0gc3BlY2llc1NjaU5hbWVMaXN0O1xuICAgICAgICAgIHJldHVybiBfdGhpcy5zcGVjaWVzVXJscyA9IHNwZWNpZXNVcmxzO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgZmV0Y2hCaW9kaXZJbmZvOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmZldGNoQmlvZGl2SW5mbycpO1xuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHVybDogJy9kYXRhL2Jpb2RpdmVyc2l0eScsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIH0pLmRvbmUoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGJpb2Rpdkxpc3QsIGJpb2Rpdkxvb2t1cExpc3Q7XG4gICAgICAgICAgYmlvZGl2TGlzdCA9IFtdO1xuICAgICAgICAgIGJpb2Rpdkxvb2t1cExpc3QgPSBbXTtcbiAgICAgICAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24oYmlvZGl2TmFtZSwgYmlvZGl2SW5mbykge1xuICAgICAgICAgICAgdmFyIGJpb2RpdkNhcE5hbWU7XG4gICAgICAgICAgICBiaW9kaXZDYXBOYW1lID0gYmlvZGl2TmFtZS5yZXBsYWNlKC9eLi8sIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGMudG9VcHBlckNhc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmlvZGl2TGlzdC5wdXNoKGJpb2Rpdk5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGJpb2Rpdkxvb2t1cExpc3QucHVzaCh7XG4gICAgICAgICAgICAgIGxhYmVsOiBcIkJpb2RpdmVyc2l0eSBvZiBcIiArIGJpb2RpdkNhcE5hbWUsXG4gICAgICAgICAgICAgIHZhbHVlOiBiaW9kaXZOYW1lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBfdGhpcy5iaW9kaXZMaXN0ID0gYmlvZGl2TGlzdDtcbiAgICAgICAgICByZXR1cm4gX3RoaXMuYmlvZGl2TG9va3VwTGlzdCA9IGJpb2Rpdkxvb2t1cExpc3Q7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBidWlsZExlZnRGb3JtOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmJ1aWxkTGVmdEZvcm0nKTtcbiAgICAgIHJldHVybiAkLndoZW4odGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcywgdGhpcy5iaW9kaXZJbmZvRmV0Y2hQcm9jZXNzKS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRsZWZ0bWFwc3BwO1xuICAgICAgICAgICRsZWZ0bWFwc3BwID0gX3RoaXMuJCgnI2xlZnRtYXBzcHAnKTtcbiAgICAgICAgICBfdGhpcy5uYW1lc0xpc3QgPSBfdGhpcy5iaW9kaXZMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QpO1xuICAgICAgICAgIHJldHVybiAkbGVmdG1hcHNwcC5hdXRvY29tcGxldGUoe1xuICAgICAgICAgICAgc291cmNlOiBfdGhpcy5iaW9kaXZMb29rdXBMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzTG9va3VwTGlzdCksXG4gICAgICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfdGhpcy4kZWwudHJpZ2dlcignbGVmdG1hcHVwZGF0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcykpO1xuICAgIH0sXG4gICAgYnVpbGRSaWdodEZvcm06IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuYnVpbGRSaWdodEZvcm0nKTtcbiAgICAgIHJldHVybiAkLndoZW4odGhpcy5zcGVjaWVzSW5mb0ZldGNoUHJvY2VzcywgdGhpcy5iaW9kaXZJbmZvRmV0Y2hQcm9jZXNzKS5kb25lKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyICRyaWdodG1hcHNwcDtcbiAgICAgICAgICAkcmlnaHRtYXBzcHAgPSBfdGhpcy4kKCcjcmlnaHRtYXBzcHAnKTtcbiAgICAgICAgICBfdGhpcy5uYW1lc0xpc3QgPSBfdGhpcy5iaW9kaXZMaXN0LmNvbmNhdChfdGhpcy5zcGVjaWVzU2NpTmFtZUxpc3QpO1xuICAgICAgICAgIHJldHVybiAkcmlnaHRtYXBzcHAuYXV0b2NvbXBsZXRlKHtcbiAgICAgICAgICAgIHNvdXJjZTogX3RoaXMuYmlvZGl2TG9va3VwTGlzdC5jb25jYXQoX3RoaXMuc3BlY2llc0xvb2t1cExpc3QpLFxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuJGVsLnRyaWdnZXIoJ3JpZ2h0bWFwdXBkYXRlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSxcbiAgICBzdGFydFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RhcnRTcGxpdHRlclRyYWNraW5nJyk7XG4gICAgICB0aGlzLnRyYWNrU3BsaXR0ZXIgPSB0cnVlO1xuICAgICAgdGhpcy5zcGxpdExpbmUuYWRkQ2xhc3MoJ2RyYWdnaW5nJyk7XG4gICAgICByZXR1cm4gdGhpcy5sb2NhdGVTcGxpdHRlcigpO1xuICAgIH0sXG4gICAgbG9jYXRlU3BsaXR0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcubG9jYXRlU3BsaXR0ZXInKTtcbiAgICAgIGlmICh0aGlzLnRyYWNrU3BsaXR0ZXIpIHtcbiAgICAgICAgdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICAgICAgaWYgKHRoaXMudHJhY2tTcGxpdHRlciA9PT0gMCkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHJhY2tTcGxpdHRlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgIHRoaXMudHJhY2tTcGxpdHRlciAtPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KHRoaXMubG9jYXRlU3BsaXR0ZXIsIHRoaXMudHJhY2tQZXJpb2QpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzaXplVGhpbmdzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkbWFwQm94LCBib3R0b21SaWdodCwgbGF5ZXJCb3R0b20sIGxheWVyVG9wLCBsZWZ0TGVmdCwgbGVmdE1hcCwgbWFwQm91bmRzLCBtYXBCb3gsIG5ld0xlZnRXaWR0aCwgcmlnaHRNYXAsIHJpZ2h0UmlnaHQsIHNwbGl0UG9pbnQsIHNwbGl0WCwgdG9wTGVmdDtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LnJlc2l6ZVRoaW5ncycpO1xuICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgIGxlZnRNYXAgPSAkKHRoaXMubGVmdExheWVyLmdldENvbnRhaW5lcigpKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgcmlnaHRNYXAgPSAkKHRoaXMucmlnaHRMYXllci5nZXRDb250YWluZXIoKSk7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy4kZWwuaGFzQ2xhc3MoJ3NwbGl0JykpIHtcbiAgICAgICAgbmV3TGVmdFdpZHRoID0gdGhpcy5zcGxpdFRodW1iLnBvc2l0aW9uKCkubGVmdCArICh0aGlzLnNwbGl0VGh1bWIud2lkdGgoKSAvIDIuMCk7XG4gICAgICAgIG1hcEJveCA9IHRoaXMubWFwLmdldENvbnRhaW5lcigpO1xuICAgICAgICAkbWFwQm94ID0gJChtYXBCb3gpO1xuICAgICAgICBtYXBCb3VuZHMgPSBtYXBCb3guZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHRvcExlZnQgPSB0aGlzLm1hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgICAgICBzcGxpdFBvaW50ID0gdGhpcy5tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoW25ld0xlZnRXaWR0aCwgMF0pO1xuICAgICAgICBib3R0b21SaWdodCA9IHRoaXMubWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFskbWFwQm94LndpZHRoKCksICRtYXBCb3guaGVpZ2h0KCldKTtcbiAgICAgICAgbGF5ZXJUb3AgPSB0b3BMZWZ0Lnk7XG4gICAgICAgIGxheWVyQm90dG9tID0gYm90dG9tUmlnaHQueTtcbiAgICAgICAgc3BsaXRYID0gc3BsaXRQb2ludC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIGxlZnRMZWZ0ID0gdG9wTGVmdC54IC0gbWFwQm91bmRzLmxlZnQ7XG4gICAgICAgIHJpZ2h0UmlnaHQgPSBib3R0b21SaWdodC54O1xuICAgICAgICB0aGlzLnNwbGl0TGluZS5jc3MoJ2xlZnQnLCBuZXdMZWZ0V2lkdGgpO1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoMCwgXCIgKyBuZXdMZWZ0V2lkdGggKyBcInB4LCBhdXRvLCAwKVwiKTtcbiAgICAgICAgaWYgKHRoaXMubGVmdExheWVyKSB7XG4gICAgICAgICAgbGVmdE1hcC5hdHRyKCdzdHlsZScsIFwiY2xpcDogcmVjdChcIiArIGxheWVyVG9wICsgXCJweCwgXCIgKyBzcGxpdFggKyBcInB4LCBcIiArIGxheWVyQm90dG9tICsgXCJweCwgXCIgKyBsZWZ0TGVmdCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJpZ2h0TGF5ZXIpIHtcbiAgICAgICAgICByZXR1cm4gcmlnaHRNYXAuYXR0cignc3R5bGUnLCBcImNsaXA6IHJlY3QoXCIgKyBsYXllclRvcCArIFwicHgsIFwiICsgcmlnaHRSaWdodCArIFwicHgsIFwiICsgbGF5ZXJCb3R0b20gKyBcInB4LCBcIiArIHNwbGl0WCArIFwicHgpXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmxlZnRUYWcuYXR0cignc3R5bGUnLCAnY2xpcDogaW5oZXJpdCcpO1xuICAgICAgICBpZiAodGhpcy5sZWZ0TGF5ZXIpIHtcbiAgICAgICAgICBsZWZ0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IGluaGVyaXQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yaWdodExheWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHJpZ2h0TWFwLmF0dHIoJ3N0eWxlJywgJ2NsaXA6IHJlY3QoMCwwLDAsMCknKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgc3RvcFNwbGl0dGVyVHJhY2tpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ0FwcFZpZXcuc3RvcFNwbGl0dGVyVHJhY2tpbmcnKTtcbiAgICAgIHRoaXMuc3BsaXRMaW5lLnJlbW92ZUNsYXNzKCdkcmFnZ2luZycpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhY2tTcGxpdHRlciA9IDU7XG4gICAgfSxcbiAgICBhY3RpdmF0ZVNwbGl0dGVyOiBmdW5jdGlvbigpIHtcbiAgICAgIGRlYnVnKCdBcHBWaWV3LmFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoe1xuICAgICAgICBjb250YWlubWVudDogJCgnI21hcHdyYXBwZXInKSxcbiAgICAgICAgc2Nyb2xsOiBmYWxzZSxcbiAgICAgICAgc3RhcnQ6IHRoaXMuc3RhcnRTcGxpdHRlclRyYWNraW5nLFxuICAgICAgICBkcmFnOiB0aGlzLnJlc2l6ZVRoaW5ncyxcbiAgICAgICAgc3RvcDogdGhpcy5zdG9wU3BsaXR0ZXJUcmFja2luZ1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdGhpcy5yZXNpemVUaGluZ3MoKTtcbiAgICB9LFxuICAgIGRlYWN0aXZhdGVTcGxpdHRlcjogZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnQXBwVmlldy5kZWFjdGl2YXRlU3BsaXR0ZXInKTtcbiAgICAgIHRoaXMuc3BsaXRUaHVtYi5kcmFnZ2FibGUoJ2Rlc3Ryb3knKTtcbiAgICAgIHJldHVybiB0aGlzLnJlc2l6ZVRoaW5ncygpO1xuICAgIH1cbiAgfSwge1xuICAgIHRlbXBsYXRlczoge1xuICAgICAgbGF5b3V0OiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzPVxcXCJ1aS1mcm9udFxcXCI+PC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwic3BsaXRsaW5lXFxcIj4mbmJzcDs8L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJzcGxpdHRodW1iXFxcIj48c3Bhbj4mI3gyNzZlOyAmI3gyNzZmOzwvc3Bhbj48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IHRhZ1xcXCI+PCU9IGxlZnRUYWcgJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCB0YWdcXFwiPjwlPSByaWdodFRhZyAlPjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImxlZnQgc2lkZSBmb3JtXFxcIj48JT0gbGVmdEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBzaWRlIGZvcm1cXFwiPjwlPSByaWdodEZvcm0gJT48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJsZWZ0IGxvYWRlclxcXCI+PGltZyBzcmM9XFxcIi9zdGF0aWMvaW1hZ2VzL3NwaW5uZXIubG9hZGluZm8ubmV0LmdpZlxcXCIgLz48L2Rpdj5cXG48ZGl2IGNsYXNzPVxcXCJyaWdodCBsb2FkZXJcXFwiPjxpbWcgc3JjPVxcXCIvc3RhdGljL2ltYWdlcy9zcGlubmVyLmxvYWRpbmZvLm5ldC5naWZcXFwiIC8+PC9kaXY+XFxuPGRpdiBpZD1cXFwibWFwd3JhcHBlclxcXCI+PGRpdiBpZD1cXFwibWFwXFxcIj48L2Rpdj48L2Rpdj5cIiksXG4gICAgICBsZWZ0VGFnOiBfLnRlbXBsYXRlKFwiPGRpdiBjbGFzcz1cXFwic2hvd1xcXCI+XFxuICAgIDxzcGFuIGNsYXNzPVxcXCJsZWZ0bGF5ZXJuYW1lXFxcIj5wbGFpbiBtYXA8L3NwYW4+XFxuICAgIDxicj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNoYW5nZVxcXCI+c2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPnNob3cvaGlkZSBjb21wYXJpc29uIG1hcDwvYnV0dG9uPlxcbjwvZGl2PlxcbjxkaXYgY2xhc3M9XFxcImVkaXRcXFwiPlxcbiAgICA8bGFiZWwgY2xhc3M9XFxcImxlZnQgc3luY2JveFxcXCI+PC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJsZWZ0bWFwc3BwXFxcIiBjbGFzcz1cXFwibGVmdFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgbmFtZT1cXFwibGVmdG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgcmlnaHRUYWc6IF8udGVtcGxhdGUoXCI8ZGl2IGNsYXNzPVxcXCJzaG93XFxcIj5cXG4gICAgPHNwYW4gY2xhc3M9XFxcInJpZ2h0bGF5ZXJuYW1lXFxcIj4obm8gZGlzdHJpYnV0aW9uKTwvc3Bhbj5cXG4gICAgPGJyPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5zZXR0aW5nczwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+c2hvdy9oaWRlIGNvbXBhcmlzb24gbWFwPC9idXR0b24+XFxuPC9kaXY+XFxuPGRpdiBjbGFzcz1cXFwiZWRpdFxcXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cXFwicmlnaHQgc3luY2JveFxcXCI+PGlucHV0IGlkPVxcXCJzeW5jXFxcIiB0eXBlPVxcXCJjaGVja2JveFxcXCIgdmFsdWU9XFxcInN5bmNcXFwiIGNoZWNrZWQ9XFxcImNoZWNrZWRcXFwiIC8+IHNhbWUgYXMgbGVmdCBzaWRlPC9sYWJlbD5cXG4gICAgPGlucHV0IGlkPVxcXCJyaWdodG1hcHNwcFxcXCIgdHlwZT1cXFwidGV4dFxcXCIgY2xhc3M9XFxcInJpZ2h0XFxcIiBuYW1lPVxcXCJyaWdodG1hcHNwcFxcXCIgcGxhY2Vob2xkZXI9XFxcIiZoZWxsaXA7IHNwZWNpZXMgb3IgZ3JvdXAgJmhlbGxpcDtcXFwiIC8+XFxuPC9kaXY+XCIpLFxuICAgICAgbGVmdEZvcm06IF8udGVtcGxhdGUoXCI8ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+dGVtcGVyYXR1cmUgY2hhbmdlPC9sZWdlbmQ+XFxuICAgIDxzZWxlY3QgY2xhc3M9XFxcImxlZnRcXFwiIGlkPVxcXCJsZWZ0bWFwZGVnc1xcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCJjdXJyZW50XFxcIj5jdXJyZW50PC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxLjVcXFwiPjEuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjJcXFwiPjIuMCAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjIuN1xcXCI+Mi43ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMy4yXFxcIj4zLjIgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI0LjVcXFwiPjQuNSAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRncm91cCBsYWJlbD1cXFwiSGlnaGx5IHNlbnNpdGl2ZSBlbnZpcm9ubWVudFxcXCI+XFxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNi41XFxcIj42LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8L29wdGdyb3VwPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD5hZGFwdGF0aW9uIHZpYSByYW5nZSBzaGlmdDwvbGVnZW5kPlxcbiAgICA8bGFiZWw+PHNwYW4+bm9uZTwvc3Bhbj4gPGlucHV0IG5hbWU9XFxcImxlZnRtYXByYW5nZVxcXCIgY2xhc3M9XFxcImxlZnRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48c3Bhbj41MHk8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJsZWZ0bWFwcmFuZ2VcXFwiIGNsYXNzPVxcXCJsZWZ0XFxcIiB0eXBlPVxcXCJyYWRpb1xcXCIgdmFsdWU9XFxcInJlYWwuZGlzcFxcXCI+IGFsbG93IHJhbmdlIGFkYXB0YXRpb248L2xhYmVsPlxcbjwvZmllbGRzZXQ+XFxuPGZpZWxkc2V0PlxcbiAgICA8bGVnZW5kPm1vZGVsIHN1bW1hcnk8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwibGVmdFxcXCIgaWQ9XFxcImxlZnRtYXBjb25maWRlbmNlXFxcIj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjEwXFxcIj4xMHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMzXFxcIj4zM3JkIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjUwXFxcIiBzZWxlY3RlZD1cXFwic2VsZWN0ZWRcXFwiPjUwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNjZcXFwiPjY2dGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiOTBcXFwiPjkwdGggcGVyY2VudGlsZTwvb3B0aW9uPlxcbiAgICA8L3NlbGVjdD5cXG48L2ZpZWxkc2V0PlxcbjxmaWVsZHNldCBjbGFzcz1cXFwiYmxhbmtcXFwiPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jaGFuZ2VcXFwiPmhpZGUgc2V0dGluZ3M8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29tcGFyZVxcXCI+aGlkZS9zaG93IHJpZ2h0IG1hcDwvYnV0dG9uPlxcbiAgICA8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImJ0bi1jb3B5IHJpZ2h0LXZhbGlkLW1hcFxcXCI+Y29weSByaWdodCBtYXAgJmxhcXVvOzwvYnV0dG9uPlxcbiAgICA8YSBpZD1cXFwibGVmdG1hcGRsXFxcIiBjbGFzcz1cXFwiZG93bmxvYWQgbGVmdC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MjBNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKSxcbiAgICAgIHJpZ2h0Rm9ybTogXy50ZW1wbGF0ZShcIjxmaWVsZHNldD5cXG4gICAgPGxlZ2VuZD50ZW1wZXJhdHVyZSBjaGFuZ2U8L2xlZ2VuZD5cXG4gICAgPHNlbGVjdCBjbGFzcz1cXFwicmlnaHRcXFwiIGlkPVxcXCJyaWdodG1hcGRlZ3NcXFwiPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiY3VycmVudFxcXCI+Y3VycmVudDwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiMS41XFxcIj4xLjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyXFxcIj4yLjAgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIyLjdcXFwiPjIuNyAmZGVnO0M8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjMuMlxcXCI+My4yICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPG9wdGlvbiB2YWx1ZT1cXFwiNC41XFxcIj40LjUgJmRlZztDPC9vcHRpb24+XFxuICAgICAgICA8b3B0Z3JvdXAgbGFiZWw9XFxcIkhpZ2hseSBzZW5zaXRpdmUgZW52aXJvbm1lbnRcXFwiPlxcbiAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjYuNVxcXCI+Ni41ICZkZWc7Qzwvb3B0aW9uPlxcbiAgICAgICAgPC9vcHRncm91cD5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+YWRhcHRhdGlvbiB2aWEgcmFuZ2Ugc2hpZnQ8L2xlZ2VuZD5cXG4gICAgPGxhYmVsPjxzcGFuPm5vbmU8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwibm8uZGlzcFxcXCIgY2hlY2tlZD1cXFwiY2hlY2tlZFxcXCI+IHNwZWNpZXMgY2Fubm90IHNoaWZ0IHJhbmdlczwvbGFiZWw+XFxuICAgIDxsYWJlbD48c3Bhbj41MHk8L3NwYW4+IDxpbnB1dCBuYW1lPVxcXCJyaWdodG1hcHJhbmdlXFxcIiBjbGFzcz1cXFwicmlnaHRcXFwiIHR5cGU9XFxcInJhZGlvXFxcIiB2YWx1ZT1cXFwicmVhbC5kaXNwXFxcIj4gYWxsb3cgcmFuZ2UgYWRhcHRhdGlvbjwvbGFiZWw+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQ+XFxuICAgIDxsZWdlbmQ+bW9kZWwgc3VtbWFyeTwvbGVnZW5kPlxcbiAgICA8c2VsZWN0IGNsYXNzPVxcXCJyaWdodFxcXCIgaWQ9XFxcInJpZ2h0bWFwY29uZmlkZW5jZVxcXCI+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIxMFxcXCI+MTB0aCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCIzM1xcXCI+MzNyZCBwZXJjZW50aWxlPC9vcHRpb24+XFxuICAgICAgICA8b3B0aW9uIHZhbHVlPVxcXCI1MFxcXCIgc2VsZWN0ZWQ9XFxcInNlbGVjdGVkXFxcIj41MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjY2XFxcIj42NnRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgICAgIDxvcHRpb24gdmFsdWU9XFxcIjkwXFxcIj45MHRoIHBlcmNlbnRpbGU8L29wdGlvbj5cXG4gICAgPC9zZWxlY3Q+XFxuPC9maWVsZHNldD5cXG48ZmllbGRzZXQgY2xhc3M9XFxcImJsYW5rXFxcIj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY2hhbmdlXFxcIj5oaWRlIHNldHRpbmdzPC9idXR0b24+XFxuICAgIDxidXR0b24gdHlwZT1cXFwiYnV0dG9uXFxcIiBjbGFzcz1cXFwiYnRuLWNvbXBhcmVcXFwiPmhpZGUvc2hvdyByaWdodCBtYXA8L2J1dHRvbj5cXG4gICAgPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJidG4tY29weSByaWdodC12YWxpZC1tYXBcXFwiPmNvcHkgcmlnaHQgbWFwICZsYXF1bzs8L2J1dHRvbj5cXG4gICAgPGEgaWQ9XFxcInJpZ2h0bWFwZGxcXFwiIGNsYXNzPVxcXCJkb3dubG9hZCByaWdodC12YWxpZC1tYXBcXFwiIGhyZWY9XFxcIlxcXCIgZGlzYWJsZWQ9XFxcImRpc2FibGVkXFxcIj5kb3dubG9hZCBqdXN0IHRoaXMgbWFwPGJyPig8MjBNYiBHZW9USUZGKTwvYT5cXG48L2ZpZWxkc2V0PlxcblwiKVxuICAgIH1cbiAgfSk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBBcHBWaWV3O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiXG4vLyBqUXVlcnkgcGx1Z2luXG4vLyBhdXRob3I6IERhbmllbCBCYWlyZCA8ZGFuaWVsQGRhbmllbGJhaXJkLmNvbT5cbi8vIHZlcnNpb246IDAuMS4yMDE0MDIwNVxuXG4vL1xuLy8gVGhpcyBtYW5hZ2VzIG1lbnVzLCBzdWJtZW51cywgcGFuZWxzLCBhbmQgcGFnZXMuXG4vLyBMaWtlIHRoaXM6XG4vLyAtLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0uLS0tXG4vLyAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICB8ICBTZWxlY3RlZCBNYWluIE1lbnUgSXRlbSAgIC4tLS0tLS0tLS0tLS4gLi0tLS0tLS0tLS4gICB8ICBBbHQgTWFpbiBNZW51IEl0ZW0gIHwgIFRoaXJkIE1haW4gTWVudSBJdGVtICB8XG4vLyAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgLyAgU3ViaXRlbSAxICBcXCBTdWJpdGVtIDIgXFwgIHwgICAgICAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vIC0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScgICAgICAgICAgICAgICAnLS0tLS0tLS0tLS0tLSctLS0tLS0tLS0tLS0tLS0tLS0tLS0tJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSctLS1cbi8vICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgIFBhbmVsIGZvciBTdWJpdGVtIDEsIHRoaXMgaXMgUGFnZSAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBFYWNoIFBhbmVsIGNhbiBoYXZlIG11bHRpcGxlIHBhZ2VzLCBvbmUgcGFnZSBzaG93aW5nIGF0IGEgdGltZS4gIEJ1dHRvbnMgb24gcGFnZXMgc3dpdGNoICAgICAgfFxuLy8gICAgICAgfCAgIGJldHdlZW4gcGFnZXMuICBQYW5lbCBoZWlnaHQgYWRqdXN0cyB0byB0aGUgaGVpZ2h0IG9mIHRoZSBwYWdlLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbi8vICAgICAgIHwgICBbIHNlZSBwYWdlIDIgXSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuLy8gICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4vLyAgICAgICAnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSdcbi8vXG4vLyAtIG1lbnVzIGFyZSBhbHdheXMgPHVsPiB0YWdzOyBlYWNoIDxsaT4gaXMgYSBtZW51IGl0ZW1cbi8vIC0gYSBtYWluIG1lbnUgPGxpPiBtdXN0IGNvbnRhaW4gYW4gPGE+IHRhZyBhbmQgbWF5IGFsc28gY29udGFpbiBhIDx1bD4gc3VibWVudVxuLy8gLSBhIHN1Ym1lbnUgPGxpPiBtdXN0IGNvbnRhaW4gYW4gPGE+IHRhZyB3aXRoIGEgZGF0YS10YXJnZXRwYW5lbCBhdHRyaWJ1dGUgc2V0XG4vLyAtIFRoZXJlIGlzIGFsd2F5cyBhIHNpbmdsZSBzZWxlY3RlZCBtYWluIG1lbnUgaXRlbVxuLy8gLSBBIG1haW4gbWVudSBpdGVtIG1heSBlaXRoZXIgbGluayB0byBhbm90aGVyIHdlYnBhZ2UsIG9yIGhhdmUgYSBzdWJtZW51XG4vLyAtIFNlbGVjdGluZyBhIG1haW4gbWVudSBpdGVtIHdpbGwgc2hvdyBpdHMgc3VibWVudSwgaWYgaXQgaGFzIG9uZVxuLy8gLSBBIHN1Ym1lbnUgYWx3YXlzIGhhcyBhIHNpbmdsZSBpdGVtIHNlbGVjdGVkXG4vLyAtIENsaWNraW5nIGFuIGluYWN0aXZlIHN1Ym1lbnUgaXRlbSB3aWxsIHNob3cgaXRzIHBhbmVsXG4vLyAtIENsaWNraW5nIGEgc2VsZWN0ZWQgc3VibWVudSBpdGVtIHdpbGwgdG9nZ2xlIGl0cyBwYW5lbCBzaG93aW5nIDwtPiBoaWRpbmcgKCgoIE5COiBub3QgeWV0IGltcGxlbWVudGVkICkpKVxuLy8gLSBBIHBhbmVsIGluaXRpYWxseSBzaG93cyBpdHMgZmlyc3QgcGFnZVxuLy8gLSBTd2l0Y2hpbmcgcGFnZXMgaW4gYSBwYW5lbCBjaGFuZ2VzIHRoZSBwYW5lbCBoZWlnaHQgdG8gc3VpdCBpdHMgY3VycmVudCBwYWdlXG4vLyAtIEEgcGFuZWwgaXMgYSBIVE1MIGJsb2NrIGVsZW1lbnQgd2l0aCB0aGUgY2xhc3MgLm1zcHAtcGFuZWwgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIElmIGEgcGFuZWwgY29udGFpbnMgcGFnZXMsIG9uZSBwYWdlIHNob3VsZCBoYXZlIHRoZSBjbGFzcyAuY3VycmVudCAoY2FuIGJlIG92ZXJyaWRkZW4gdmlhIG9wdGlvbilcbi8vIC0gQSBwYWdlIGlzIGEgSFRNTCBibG9jayBlbGVtZW50IHdpdGggdGhlIGNsYXNzIC5tc3BwLXBhZ2UgKGNhbiBiZSBvdmVycmlkZGVuIHZpYSBvcHRpb24pXG4vLyAtIDxidXR0b24+IG9yIDxhPiB0YWdzIGluIHBhZ2VzIHRoYXQgaGF2ZSBhIGRhdGEtdGFyZ2V0cGFnZSBhdHRyaWJ1dGUgc2V0IHdpbGwgc3dpdGNoIHRvIHRoZSBpbmRpY2F0ZWQgcGFnZVxuLy9cbi8vXG4vLyBUaGUgSFRNTCBzaG91bGQgbG9vayBsaWtlIHRoaXM6XG4vL1xuLy8gIDx1bCBjbGFzcz1cIm1lbnVcIj4gICAgICAgICAgICAgICAgICAgPCEtLSB0aGlzIGlzIHRoZSBtYWluIG1lbnUgLS0+XG4vLyAgICAgIDxsaSBjbGFzcz1cImN1cnJlbnRcIj4gICAgICAgICAgICA8IS0tIHRoaXMgaXMgYSBtYWluIG1lbnUgaXRlbSwgY3VycmVudGx5IHNlbGVjdGVkIC0tPlxuLy8gICAgICAgICAgPGE+Rmlyc3QgSXRlbTwvYT4gICAgICAgICAgIDwhLS0gdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1haW4gbWVudSAtLT5cbi8vICAgICAgICAgIDx1bD4gICAgICAgICAgICAgICAgICAgICAgICA8IS0tIGEgc3VibWVudSBpbiB0aGUgZmlyc3QgbWFpbiBtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICAgICAgPGxpIGNsYXNzPVwiY3VycmVudFwiPiAgICA8IS0tIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgc3VibWVudSBpdGVtIC0tPlxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwhLS0gLnBhbmVsdHJpZ2dlciBhbmQgdGhlIGRhdGEtcGFuZWxpZCBhdHRyaWJ1dGUgYXJlIHJlcXVpcmVkIC0tPlxuLy8gICAgICAgICAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhbmVsPVwicGFuZWwxXCI+ZG8gdGhlIHBhbmVsMSB0aGluZzwvYT5cbi8vICAgICAgICAgICAgICA8L2xpPlxuLy8gICAgICAgICAgICAgIDxsaT4uLi48L2xpPiAgICAgICAgICAgIDwhLS0gYW5vdGhlciBzdWJtZW51IGl0ZW0gLS0+XG4vLyAgICAgICAgICA8L3VsPlxuLy8gICAgICA8L2xpPlxuLy8gICAgICA8bGk+IDxhIGhyZWY9XCJhbm90aGVyX3BhZ2UuaHRtbFwiPmFub3RoZXIgcGFnZTwvYT4gPC9saT5cbi8vICAgICAgPGxpPiA8YT53aGF0ZXZlcjwvYT4gPC9saT5cbi8vICA8L3VsPlxuLy9cbi8vICA8ZGl2IGlkPVwicGFuZWwxXCIgY2xhc3M9XCJtc3BwLXBhbmVsXCI+XG4vLyAgICAgIDxkaXYgaWQ9XCJwYWdlMTFcIiBjbGFzcz1cIm1zcHAtcGFnZSBjdXJyZW50XCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBjdXJyZW50IHBhZ2Ugb24gcGFuZWwgMS5cbi8vICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UxMlwiPnNob3cgcGFnZSAyPC9idXR0b24+XG4vLyAgICAgIDwvZGl2PlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTEyXCIgY2xhc3M9XCJtc3BwLXBhZ2VcIj5cbi8vICAgICAgICAgIFRoaXMgaXMgdGhlIG90aGVyIHBhZ2Ugb24gcGFuZWwgMS5cbi8vICAgICAgICAgIDxhIGRhdGEtdGFyZ2V0cGFnZT1cInBhZ2UxMVwiPnNlZSB0aGUgZmlyc3QgcGFnZSBhZ2FpbjwvYT5cbi8vICAgICAgPC9kaXY+XG4vLyAgPC9kaXY+XG4vLyAgPGRpdiBpZD1cInBhbmVsMlwiIGNsYXNzPVwibXNwcC1wYW5lbFwiPlxuLy8gICAgICA8ZGl2IGlkPVwicGFnZTIxXCIgY2xhc3M9XCJtc3BwLXBhZ2UgY3VycmVudFwiPlxuLy8gICAgICAgICAgVGhpcyBpcyB0aGUgY3VycmVudCBwYWdlIG9uIHBhbmVsIDIuXG4vLyAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMjJcIj5zaG93IHBhZ2UgMjwvYnV0dG9uPlxuLy8gICAgICA8L2Rpdj5cbi8vICAgICAgPGRpdiBpZD1cInBhZ2UyMlwiIGNsYXNzPVwibXNwcC1wYWdlXCI+XG4vLyAgICAgICAgICBUaGlzIGlzIHRoZSBvdGhlciBwYWdlIG9uIHBhbmVsIDIuXG4vLyAgICAgICAgICA8YSBkYXRhLXRhcmdldHBhZ2U9XCJwYWdlMjFcIj5zZWUgdGhlIGZpcnN0IHBhZ2UgYWdhaW48L2E+XG4vLyAgICAgIDwvZGl2PlxuLy8gIDwvZGl2PlxuXG5cbjsoIGZ1bmN0aW9uKCQsIHdpbmRvdywgZG9jdW1lbnQsIHVuZGVmaW5lZCkge1xuXG4gICAgLy8gbmFtZXNwYWNlIGNsaW1hcywgd2lkZ2V0IG5hbWUgbXNwcFxuICAgIC8vIHNlY29uZCBhcmcgaXMgdXNlZCBhcyB0aGUgd2lkZ2V0J3MgXCJwcm90b3R5cGVcIiBvYmplY3RcbiAgICAkLndpZGdldCggXCJjbGltYXMubXNwcFwiICwge1xuXG4gICAgICAgIC8vT3B0aW9ucyB0byBiZSB1c2VkIGFzIGRlZmF1bHRzXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIGFuaW1hdGlvbkZhY3RvcjogMixcblxuICAgICAgICAgICAgbWFpbk1lbnVDbGFzczogJ21zcHAtbWFpbi1tZW51JyxcblxuICAgICAgICAgICAgcGFuZWxDbGFzczogJ21zcHAtcGFuZWwnLFxuICAgICAgICAgICAgcGFnZUNsYXNzOiAnbXNwcC1wYWdlJyxcblxuICAgICAgICAgICAgY2xlYXJmaXhDbGFzczogJ21zcHAtY2xlYXJmaXgnLFxuICAgICAgICAgICAgYWN0aXZlQ2xhc3M6ICdjdXJyZW50J1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vU2V0dXAgd2lkZ2V0IChlZy4gZWxlbWVudCBjcmVhdGlvbiwgYXBwbHkgdGhlbWluZ1xuICAgICAgICAvLyAsIGJpbmQgZXZlbnRzIGV0Yy4pXG4gICAgICAgIF9jcmVhdGU6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgb3B0cyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICAgICAgLy8gcG9wdWxhdGUgc29tZSBjb252ZW5pZW5jZSB2YXJpYWJsZXNcbiAgICAgICAgICAgIHZhciAkbWVudSA9IHRoaXMuZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMubWFpbk1lbnVJdGVtcyA9ICRtZW51LmNoaWxkcmVuKCdsaScpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMgPSAkKCcuJyArIG9wdHMucGFuZWxDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGRpc2FwcGVhciB3aGlsZSB3ZSBzb3J0IHRoaW5ncyBvdXRcbiAgICAgICAgICAgICRtZW51LmNzcyh7IG9wYWNpdHk6IDAgfSk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5jc3MoeyBvcGFjaXR5OiAwIH0pO1xuXG4gICAgICAgICAgICAvLyBtYWtlIHNvbWUgRE9NIG1vZHNcbiAgICAgICAgICAgICRtZW51LmFkZENsYXNzKG9wdHMubWFpbk1lbnVDbGFzcyk7XG4gICAgICAgICAgICAkbWVudS5hZGRDbGFzcyhvcHRzLmNsZWFyZml4Q2xhc3MpO1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuYWRkQ2xhc3Mob3B0cy5jbGVhcmZpeENsYXNzKTtcblxuICAgICAgICAgICAgLy8gbGF5b3V0IHRoZSBtZW51XG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRNZW51KCk7XG5cbiAgICAgICAgICAgIC8vIGxheW91dCB0aGUgcGFuZWxzXG4gICAgICAgICAgICB0aGlzLl9sYXlvdXRQYW5lbHMoKTtcblxuICAgICAgICAgICAgLy8gaG9vayB1cCBjbGljayBoYW5kbGluZyBldGNcbiAgICAgICAgICAgICRtZW51Lm9uKCdtc3Bwc2hvd21lbnUnLCB0aGlzLl9zaG93TWVudSk7XG4gICAgICAgICAgICAkbWVudS5vbignbXNwcHNob3dzdWJtZW51JywgdGhpcy5fc2hvd1N1Yk1lbnUpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93cGFuZWwnLCB0aGlzLl9zaG93UGFuZWwpO1xuICAgICAgICAgICAgJG1lbnUub24oJ21zcHBzaG93cGFnZScsIHRoaXMuX3Nob3dQYWdlKTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBtZW51LXRyaWdnZXJzXG4gICAgICAgICAgICB0aGlzLm1haW5NZW51SXRlbXMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAvLyB0aGUgbGkgbWVudSBpdGVtIGhhcyBhIGNoaWxkIGEgdGhhdCBpcyBpdCdzIHRyaWdnZXJcbiAgICAgICAgICAgICAgICAkKGl0ZW0pLmNoaWxkcmVuKCdhJykuY2xpY2soIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ3Nob3dtZW51JywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiBiYXNlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIGF0dGFjaCBoYW5kbGVycyB0byB0aGUgc3VibWVudSBpdGVtc1xuICAgICAgICAgICAgICAgICQoaXRlbSkuZmluZCgnbGknKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgc3ViTWVudUl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgJChzdWJNZW51SXRlbSkuZmluZCgnYScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3N1Ym1lbnUnLCBldmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVpdGVtOiBpdGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1Ym1lbnVpdGVtOiBzdWJNZW51SXRlbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBhdHRhY2ggaGFuZGxlcnMgdG8gdGhlIHBhbmVsIHRyaWdnZXJzXG4gICAgICAgICAgICAkbWVudS5maW5kKCdbZGF0YS10YXJnZXRwYW5lbF0nKS5lYWNoKCBmdW5jdGlvbihpbmRleCwgdHJpZ2dlcikge1xuICAgICAgICAgICAgICAgIHZhciAkdHJpZ2dlciA9JCh0cmlnZ2VyKTtcbiAgICAgICAgICAgICAgICAkdHJpZ2dlci5jbGljayggZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhbmVsJywgZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsOiAkKCcjJyArICR0cmlnZ2VyLmRhdGEoJ3RhcmdldHBhbmVsJykpLmZpcnN0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXR0YWNoIGhhbmRsZXJzIHRvIHRoZSBwYWdlIHN3aXRjaGVyc1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMuZWFjaCggZnVuY3Rpb24oaW5kZXgsIHBhbmVsKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQocGFuZWwpO1xuICAgICAgICAgICAgICAgICRwYW5lbC5maW5kKCdbZGF0YS10YXJnZXRwYWdlXScpLmNsaWNrKCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLl90cmlnZ2VyKCdzaG93cGFnZScsIGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5lbDogJHBhbmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogJCgnIycgKyAkKHRoaXMpLmRhdGEoJ3RhcmdldHBhZ2UnKSksXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IGJhc2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYWN0aXZhdGUgdGhlIGN1cnJlbnQgbWVudXMsIHBhbmVscyBldGNcbiAgICAgICAgICAgIHZhciAkY3VycmVudE1haW4gPSB0aGlzLm1haW5NZW51SXRlbXMuZmlsdGVyKCcuJyArIG9wdHMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgJGN1cnJlbnRNYWluLnJlbW92ZUNsYXNzKG9wdHMuYWN0aXZlQ2xhc3MpLmNoaWxkcmVuKCdhJykuY2xpY2soKTtcblxuICAgICAgICAgICAgLy8gZmluYWxseSwgZmFkZSBiYWNrIGluXG4gICAgICAgICAgICAkbWVudS5hbmltYXRlKHsgb3BhY2l0eTogMSB9LCAnZmFzdCcpO1xuXG4gICAgICAgICAgICAvLyBwYW5lbHMgc3RheSBpbnZpc2libGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc3dpdGNoQ2xhc3NPcHRpb246IGZ1bmN0aW9uKGNsYXNzTmFtZSwgbmV3Q2xhc3MpIHtcbiAgICAgICAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9uc1tjbGFzc05hbWVdO1xuICAgICAgICAgICAgaWYgKG9sZENsYXNzICE9PSBuZXdDbGFzcykge1xuICAgICAgICAgICAgICAgIHZhciBncm91cCA9IHRoaXMuZWxlbWVudC5maW5kKCcuJyArIG9sZENsYXNzKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNbY2xhc3NOYW1lXSA9IG5ld0NsYXNzO1xuICAgICAgICAgICAgICAgIGdyb3VwLnJlbW92ZUNsYXNzKG9sZENsYXNzKTtcbiAgICAgICAgICAgICAgICBncm91cC5hZGRDbGFzcyhuZXdDbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gUmVzcG9uZCB0byBhbnkgY2hhbmdlcyB0aGUgdXNlciBtYWtlcyB0byB0aGVcbiAgICAgICAgLy8gb3B0aW9uIG1ldGhvZFxuICAgICAgICBfc2V0T3B0aW9uOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtYWluTWVudUNsYXNzXCI6XG4gICAgICAgICAgICAgICAgY2FzZSBcImNsZWFyZml4Q2xhc3NcIjpcbiAgICAgICAgICAgICAgICBjYXNlIFwiYWN0aXZlQ2xhc3NcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3dpdGNoQ2xhc3NPcHRpb24oa2V5LCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy8gaXQncyBva2F5IHRoYXQgdGhlcmUncyBubyB9IGhlcmVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHJlbWVtYmVyIHRvIGNhbGwgb3VyIHN1cGVyJ3MgX3NldE9wdGlvbiBtZXRob2RcbiAgICAgICAgICAgIHRoaXMuX3N1cGVyKCBcIl9zZXRPcHRpb25cIiwga2V5LCB2YWx1ZSApO1xuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIC8vIERlc3Ryb3kgYW4gaW5zdGFudGlhdGVkIHBsdWdpbiBhbmQgY2xlYW4gdXBcbiAgICAgICAgLy8gbW9kaWZpY2F0aW9ucyB0aGUgd2lkZ2V0IGhhcyBtYWRlIHRvIHRoZSBET01cbiAgICAgICAgX2Rlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnJlbW92ZUNsYXNzKHRoaXMub3B0aW9ucy5tYWluTWVudUNsYXNzKTtcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgICAgICB0aGlzLnBhbmVscy5yZW1vdmVDbGFzcyh0aGlzLm9wdGlvbnMuY2xlYXJmaXhDbGFzcyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgLy8gZG8gdGhlIGxheW91dCBjYWxjdWxhdGlvbnNcbiAgICAgICAgX2xheW91dE1lbnU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gZ28gdGhyb3VnaCBlYWNoIHN1Ym1lbnUgYW5kIHJlY29yZCBpdHMgd2lkdGhcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5maW5kKCd1bCcpLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBzdWJNZW51KSB7XG4gICAgICAgICAgICAgICAgdmFyICRzbSA9ICQoc3ViTWVudSk7XG4gICAgICAgICAgICAgICAgJHNtLmNzcyh7d2lkdGg6ICdhdXRvJ30pO1xuICAgICAgICAgICAgICAgICRzbS5kYXRhKCdvcmlnaW5hbFdpZHRoJywgJHNtLndpZHRoKCkpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGVhdmUgZWFjaCBzdWJtZW51IGhpZGRlbiwgd2l0aCB3aWR0aCAwXG4gICAgICAgICAgICAgICAgJHNtLmNzcyh7IHdpZHRoOiAwLCBkaXNwbGF5OiAnbm9uZScgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd01lbnU6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGRhdGEubWVudWl0ZW0pO1xuICAgICAgICAgICAgdmFyIGJhc2UgPSBkYXRhLndpZGdldDtcbiAgICAgICAgICAgIC8vICRpdGVtIGlzIGEgY2xpY2tlZC1vbiBtZW51IGl0ZW0uLlxuICAgICAgICAgICAgaWYgKCRpdGVtLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICAgICAgICAvLyA/P1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLl9oaWRlUGFuZWxzKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5tYWluTWVudUl0ZW1zLnJlbW92ZUNsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgdmFyICRuZXdTdWJNZW51ID0gJGl0ZW0uZmluZCgndWwnKTtcbiAgICAgICAgICAgICAgICB2YXIgJG9sZFN1Yk1lbnVzID0gYmFzZS5lbGVtZW50LmZpbmQoJ3VsJykubm90KCRuZXdTdWJNZW51KTtcbiAgICAgICAgICAgICAgICB2YXIgbmV3V2lkdGggPSAkbmV3U3ViTWVudS5kYXRhKCdvcmlnaW5hbFdpZHRoJyk7XG5cbiAgICAgICAgICAgICAgICAkb2xkU3ViTWVudXMuYW5pbWF0ZSh7IHdpZHRoOiAwIH0sICg1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJG9sZFN1Yk1lbnVzLmNzcyh7IGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgICAgICAgICRuZXdTdWJNZW51XG4gICAgICAgICAgICAgICAgICAgIC5jc3Moe2Rpc3BsYXk6ICdibG9jaycgfSlcbiAgICAgICAgICAgICAgICAgICAgLmFuaW1hdGUoeyB3aWR0aDogbmV3V2lkdGggfSwgKDEyNSAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRuZXdTdWJNZW51LmNzcyh7IHdpZHRoOiAnYXV0bycgfSkucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuX3RyaWdnZXIoJ21lbnVzaG93bicsIGV2ZW50LCB7IGl0ZW06ICRpdGVtLCB3aWRnZXQ6IGJhc2UgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBuZXcgc3VibWVudSBoYXMgYW4gYWN0aXZlIGl0ZW0sIGNsaWNrIGl0XG4gICAgICAgICAgICAgICAgJG5ld1N1Yk1lbnUuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MgKyAnIGEnKS5jbGljaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93U3ViTWVudTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIC8vIGRlLWFjdGl2ZWlmeSBhbGwgdGhlIHN1Ym1lbnUgaXRlbXNcbiAgICAgICAgICAgICQoZGF0YS5tZW51aXRlbSkuZmluZCgnbGknKS5yZW1vdmVDbGFzcyhkYXRhLndpZGdldC5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgIC8vIGFjdGl2ZS1pZnkgdGhlIG9uZSB0cnVlIHN1Ym1lbnUgaXRlbVxuICAgICAgICAgICAgJChkYXRhLnN1Ym1lbnVpdGVtKS5hZGRDbGFzcyhkYXRhLndpZGdldC5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAvLyBkbyB0aGUgbGF5b3V0IGNhbGN1bGF0aW9uc1xuICAgICAgICBfbGF5b3V0UGFuZWxzOiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyICRwYWdlcyA9IHRoaXMucGFuZWxzLmZpbmQoJy4nICsgdGhpcy5vcHRpb25zLnBhZ2VDbGFzcyk7XG5cbiAgICAgICAgICAgIC8vIGdvIHRocm91Z2ggZWFjaCBwYWdlIGFuZCByZWNvcmQgaXRzIGhlaWdodFxuICAgICAgICAgICAgJHBhZ2VzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyICRwYWdlID0gJChwYWdlKTtcbiAgICAgICAgICAgICAgICAkcGFnZS5jc3Moe2hlaWdodDogJ2F1dG8nfSk7XG4gICAgICAgICAgICAgICAgJHBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnLCAkcGFnZS5vdXRlckhlaWdodCgpKTtcblxuICAgICAgICAgICAgICAgIC8vIGxlYXZlIGVhY2ggcGFnZSBoaWRkZW4sIHdpdGggaGVpZ2h0IDBcbiAgICAgICAgICAgICAgICAkcGFnZS5jc3MoeyBoZWlnaHQ6IDAsIGRpc3BsYXk6ICdub25lJyB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBnbyB0aHJvdWdoIGVhY2ggcGFuZWwgYW5kIGhpZGUgaXRcbiAgICAgICAgICAgIHRoaXMucGFuZWxzLmVhY2goIGZ1bmN0aW9uKGluZGV4LCBwYW5lbCkge1xuICAgICAgICAgICAgICAgIHZhciAkcGFuZWwgPSAkKHBhbmVsKTtcbiAgICAgICAgICAgICAgICAkcGFuZWwuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgX2hpZGVQYW5lbHM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5wYW5lbHMucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKS5jc3MoeyBkaXNwbGF5OiAnbm9uZScsIGhlaWdodDogMCB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfc2hvd1BhbmVsOiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAgICAgdmFyICRwYW5lbCA9ICQoZGF0YS5wYW5lbCk7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IGRhdGEud2lkZ2V0O1xuICAgICAgICAgICAgLy8gJHBhbmVsIGlzIGEgcGFuZWwgdG8gc2hvdy4uXG4gICAgICAgICAgICBpZiAoJHBhbmVsLmhhc0NsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykpIHtcbiAgICAgICAgICAgICAgICAvLyA/P1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLl9oaWRlUGFuZWxzKCk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcyk7XG4gICAgICAgICAgICAgICAgJHBhbmVsLmNzcyh7IGRpc3BsYXk6ICdibG9jaycsIG9wYWNpdHk6IDEgfSk7XG4gICAgICAgICAgICAgICAgdmFyICRwYWdlID0gJCgkcGFuZWwuZmluZCgnLicgKyBiYXNlLm9wdGlvbnMucGFnZUNsYXNzICsgJy4nICsgYmFzZS5vcHRpb25zLmFjdGl2ZUNsYXNzKSk7XG4gICAgICAgICAgICAgICAgYmFzZS5fdHJpZ2dlcignc2hvd3BhZ2UnLCBldmVudCwgeyBwYW5lbDogJHBhbmVsLCBwYWdlOiAkcGFnZSwgd2lkZ2V0OiBiYXNlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIF9zaG93UGFnZTogZnVuY3Rpb24oZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gZGF0YS53aWRnZXQ7XG4gICAgICAgICAgICB2YXIgJHBhbmVsID0gJChkYXRhLnBhbmVsKTtcbiAgICAgICAgICAgIHZhciAkcGFnZSA9ICQoZGF0YS5wYWdlKTtcbiAgICAgICAgICAgIHZhciBuZXdIZWlnaHQgPSAkcGFnZS5kYXRhKCdvcmlnaW5hbEhlaWdodCcpO1xuXG4gICAgICAgICAgICAvLyBmaXggdGhlIHBhbmVsJ3MgY3VycmVudCBoZWlnaHRcbiAgICAgICAgICAgICRwYW5lbC5jc3Moe2hlaWdodDogJHBhbmVsLmhlaWdodCgpIH0pO1xuXG4gICAgICAgICAgICAvLyBkZWFsIHdpdGggdGhlIHBhZ2UgY3VycmVudGx5IGJlaW5nIGRpc3BsYXllZFxuICAgICAgICAgICAgdmFyICRvbGRQYWdlID0gJHBhbmVsLmZpbmQoJy4nICsgYmFzZS5vcHRpb25zLnBhZ2VDbGFzcyArICcuJyArIGJhc2Uub3B0aW9ucy5hY3RpdmVDbGFzcykubm90KCRwYWdlKTtcbiAgICAgICAgICAgIGlmICgkb2xkUGFnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJG9sZFBhZ2UuZGF0YSgnb3JpZ2luYWxIZWlnaHQnLCAkb2xkUGFnZS5vdXRlckhlaWdodCgpKTtcbiAgICAgICAgICAgICAgICAkb2xkUGFnZS5yZW1vdmVDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmZhZGVPdXQoKDUwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkb2xkUGFnZS5jc3MoeyBoZWlnaHQ6IDAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN3aXRjaCBvbiB0aGUgbmV3IHBhZ2UgYW5kIGdyb3cgdGhlIG9wYW5lbCB0byBob2xkIGl0XG4gICAgICAgICAgICAkcGFnZS5jc3MoeyBoZWlnaHQ6ICdhdXRvJyB9KS5hZGRDbGFzcyhiYXNlLm9wdGlvbnMuYWN0aXZlQ2xhc3MpLmZhZGVJbigoMTAwICogYmFzZS5vcHRpb25zLmFuaW1hdGlvbkZhY3RvciksIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRwYWdlLnJlbW92ZUF0dHIoJ3N0eWxlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBhbmltVGltZSA9ICgkb2xkUGFnZS5sZW5ndGggPiAwID8gKDEwMCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpIDogKDE1MCAqIGJhc2Uub3B0aW9ucy5hbmltYXRpb25GYWN0b3IpKTsgLy8gYW5pbWF0ZSBmYXN0ZXIgaWYgaXQncyBzd2l0Y2hpbmcgcGFnZXNcbiAgICAgICAgICAgICRwYW5lbC5hbmltYXRlKHsgaGVpZ2h0OiBuZXdIZWlnaHQgfSwgYW5pbVRpbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICRwYW5lbC5yZW1vdmVBdHRyKCdzdHlsZScpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICBfOiBudWxsIC8vIG5vIGZvbGxvd2luZyBjb21tYVxuICAgIH0pO1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIl19
