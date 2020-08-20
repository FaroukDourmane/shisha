/**
 * Super simple wysiwyg editor v0.8.8
 * http://summernote.org/
 *
 * summernote-lite.js
 * Copyright 2013- Alan Hong. and other contributors
 * summernote may be freely distributed under the MIT license./
 *
 * Date: 2017-09-09T11:03Z
 */
(function (factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function ($) {
  'use strict';

  var isSupportAmd = typeof define === 'function' && define.amd;

  /**
   * returns whether font is installed or not.
   *
   * @param {String} fontName
   * @return {Boolean}
   */
  var isFontInstalled = function (fontName) {
    var testFontName = fontName === 'Comic Sans MS' ? 'Courier New' : 'Comic Sans MS';
    var $tester = $('<div>').css({
      position: 'absolute',
      left: '-9999px',
      top: '-9999px',
      fontSize: '200px'
    }).text('mmmmmmmmmwwwwwww').appendTo(document.body);

    var originalWidth = $tester.css('fontFamily', testFontName).width();
    var width = $tester.css('fontFamily', fontName + ',' + testFontName).width();

    $tester.remove();

    return originalWidth !== width;
  };

  var userAgent = navigator.userAgent;
  var isMSIE = /MSIE|Trident/i.test(userAgent);
  var browserVersion;
  if (isMSIE) {
    var matches = /MSIE (\d+[.]\d+)/.exec(userAgent);
    if (matches) {
      browserVersion = parseFloat(matches[1]);
    }
    matches = /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(userAgent);
    if (matches) {
      browserVersion = parseFloat(matches[1]);
    }
  }

  var isEdge = /Edge\/\d+/.test(userAgent);

  var hasCodeMirror = !!window.CodeMirror;
  if (!hasCodeMirror && isSupportAmd) {
    // Webpack
    if (typeof __webpack_require__ === 'function') { // jshint ignore:line
      try {
        // If CodeMirror can't be resolved, `require.resolve` will throw an
        // exception and `hasCodeMirror` won't be set to `true`.
        require.resolve('codemirror');
        hasCodeMirror = true;
      } catch (e) {
        // do nothing
      }
    } else if (typeof require !== 'undefined') {
      // Browserify
      if (typeof require.resolve !== 'undefined') {
        try {
          // If CodeMirror can't be resolved, `require.resolve` will throw an
          // exception and `hasCodeMirror` won't be set to `true`.
          require.resolve('codemirror');
          hasCodeMirror = true;
        } catch (e) {
          // do nothing
        }
      // Almond/Require
      } else if (typeof require.specified !== 'undefined') {
        hasCodeMirror = require.specified('codemirror');
      }
    }
  }

  var isSupportTouch =
    (('ontouchstart' in window) ||
     (navigator.MaxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));

  /**
   * @class core.agent
   *
   * Object which check platform and agent
   *
   * @singleton
   * @alternateClassName agent
   */
  var agent = {
    isMac: navigator.appVersion.indexOf('Mac') > -1,
    isMSIE: isMSIE,
    isEdge: isEdge,
    isFF: !isEdge && /firefox/i.test(userAgent),
    isPhantom: /PhantomJS/i.test(userAgent),
    isWebkit: !isEdge && /webkit/i.test(userAgent),
    isChrome: !isEdge && /chrome/i.test(userAgent),
    isSafari: !isEdge && /safari/i.test(userAgent),
    browserVersion: browserVersion,
    jqueryVersion: parseFloat($.fn.jquery),
    isSupportAmd: isSupportAmd,
    isSupportTouch: isSupportTouch,
    hasCodeMirror: hasCodeMirror,
    isFontInstalled: isFontInstalled,
    isW3CRangeSupport: !!document.createRange
  };

  /**
   * @class core.func
   *
   * func utils (for high-order func's arg)
   *
   * @singleton
   * @alternateClassName func
   */
  var func = (function () {
    var eq = function (itemA) {
      return function (itemB) {
        return itemA === itemB;
      };
    };

    var eq2 = function (itemA, itemB) {
      return itemA === itemB;
    };

    var peq2 = function (propName) {
      return function (itemA, itemB) {
        return itemA[propName] === itemB[propName];
      };
    };

    var ok = function () {
      return true;
    };

    var fail = function () {
      return false;
    };

    var not = function (f) {
      return function () {
        return !f.apply(f, arguments);
      };
    };

    var and = function (fA, fB) {
      return function (item) {
        return fA(item) && fB(item);
      };
    };

    var self = function (a) {
      return a;
    };

    var invoke = function (obj, method) {
      return function () {
        return obj[method].apply(obj, arguments);
      };
    };

    var idCounter = 0;

    /**
     * generate a globally-unique id
     *
     * @param {String} [prefix]
     */
    var uniqueId = function (prefix) {
      var id = ++idCounter + '';
      return prefix ? prefix + id : id;
    };

    /**
     * returns bnd (bounds) from rect
     *
     * - IE Compatibility Issue: http://goo.gl/sRLOAo
     * - Scroll Issue: http://goo.gl/sNjUc
     *
     * @param {Rect} rect
     * @return {Object} bounds
     * @return {Number} bounds.top
     * @return {Number} bounds.left
     * @return {Number} bounds.width
     * @return {Number} bounds.height
     */
    var rect2bnd = function (rect) {
      var $document = $(document);
      return {
        top: rect.top + $document.scrollTop(),
        left: rect.left + $document.scrollLeft(),
        width: rect.right - rect.left,
        height: rect.bottom - rect.top
      };
    };

    /**
     * returns a copy of the object where the keys have become the values and the values the keys.
     * @param {Object} obj
     * @return {Object}
     */
    var invertObject = function (obj) {
      var inverted = {};
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          inverted[obj[key]] = key;
        }
      }
      return inverted;
    };

    /**
     * @param {String} namespace
     * @param {String} [prefix]
     * @return {String}
     */
    var namespaceToCamel = function (namespace, prefix) {
      prefix = prefix || '';
      return prefix + namespace.split('.').map(function (name) {
        return name.substring(0, 1).toUpperCase() + name.substring(1);
      }).join('');
    };

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     * @param {Function} func
     * @param {Number} wait
     * @param {Boolean} immediate
     * @return {Function}
     */
    var debounce = function (func, wait, immediate) {
      var timeout;
      return function () {
        var context = this, args = arguments;
        var later = function () {
          timeout = null;
          if (!immediate) {
            func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
          func.apply(context, args);
        }
      };
    };

    return {
      eq: eq,
      eq2: eq2,
      peq2: peq2,
      ok: ok,
      fail: fail,
      self: self,
      not: not,
      and: and,
      invoke: invoke,
      uniqueId: uniqueId,
      rect2bnd: rect2bnd,
      invertObject: invertObject,
      namespaceToCamel: namespaceToCamel,
      debounce: debounce
    };
  })();

  /**
   * @class core.list
   *
   * list utils
   *
   * @singleton
   * @alternateClassName list
   */
  var list = (function () {
    /**
     * returns the first item of an array.
     *
     * @param {Array} array
     */
    var head = function (array) {
      return array[0];
    };

    /**
     * returns the last item of an array.
     *
     * @param {Array} array
     */
    var last = function (array) {
      return array[array.length - 1];
    };

    /**
     * returns everything but the last entry of the array.
     *
     * @param {Array} array
     */
    var initial = function (array) {
      return array.slice(0, array.length - 1);
    };

    /**
     * returns the rest of the items in an array.
     *
     * @param {Array} array
     */
    var tail = function (array) {
      return array.slice(1);
    };

    /**
     * returns item of array
     */
    var find = function (array, pred) {
      for (var idx = 0, len = array.length; idx < len; idx ++) {
        var item = array[idx];
        if (pred(item)) {
          return item;
        }
      }
    };

    /**
     * returns true if all of the values in the array pass the predicate truth test.
     */
    var all = function (array, pred) {
      for (var idx = 0, len = array.length; idx < len; idx ++) {
        if (!pred(array[idx])) {
          return false;
        }
      }
      return true;
    };

    /**
     * returns index of item
     */
    var indexOf = function (array, item) {
      return $.inArray(item, array);
    };

    /**
     * returns true if the value is present in the list.
     */
    var contains = function (array, item) {
      return indexOf(array, item) !== -1;
    };

    /**
     * get sum from a list
     *
     * @param {Array} array - array
     * @param {Function} fn - iterator
     */
    var sum = function (array, fn) {
      fn = fn || func.self;
      return array.reduce(function (memo, v) {
        return memo + fn(v);
      }, 0);
    };
  
    /**
     * returns a copy of the collection with array type.
     * @param {Collection} collection - collection eg) node.childNodes, ...
     */
    var from = function (collection) {
      var result = [], idx = -1, length = collection.length;
      while (++idx < length) {
        result[idx] = collection[idx];
      }
      return result;
    };

    /**
     * returns whether list is empty or not
     */
    var isEmpty = function (array) {
      return !array || !array.length;
    };
  
    /**
     * cluster elements by predicate function.
     *
     * @param {Array} array - array
     * @param {Function} fn - predicate function for cluster rule
     * @param {Array[]}
     */
    var clusterBy = function (array, fn) {
      if (!array.length) { return []; }
      var aTail = tail(array);
      return aTail.reduce(function (memo, v) {
        var aLast = last(memo);
        if (fn(last(aLast), v)) {
          aLast[aLast.length] = v;
        } else {
          memo[memo.length] = [v];
        }
        return memo;
      }, [[head(array)]]);
    };
  
    /**
     * returns a copy of the array with all false values removed
     *
     * @param {Array} array - array
     * @param {Function} fn - predicate function for cluster rule
     */
    var compact = function (array) {
      var aResult = [];
      for (var idx = 0, len = array.length; idx < len; idx ++) {
        if (array[idx]) { aResult.push(array[idx]); }
      }
      return aResult;
    };

    /**
     * produces a duplicate-free version of the array
     *
     * @param {Array} array
     */
    var unique = function (array) {
      var results = [];

      for (var idx = 0, len = array.length; idx < len; idx ++) {
        if (!contains(results, array[idx])) {
          results.push(array[idx]);
        }
      }

      return results;
    };

    /**
     * returns next item.
     * @param {Array} array
     */
    var next = function (array, item) {
      var idx = indexOf(array, item);
      if (idx === -1) { return null; }

      return array[idx + 1];
    };

    /**
     * returns prev item.
     * @param {Array} array
     */
    var prev = function (array, item) {
      var idx = indexOf(array, item);
      if (idx === -1) { return null; }

      return array[idx - 1];
    };

    return { head: head, last: last, initial: initial, tail: tail,
             prev: prev, next: next, find: find, contains: contains,
             all: all, sum: sum, from: from, isEmpty: isEmpty,
             clusterBy: clusterBy, compact: compact, unique: unique };
  })();


  var NBSP_CHAR = String.fromCharCode(160);
  var ZERO_WIDTH_NBSP_CHAR = '\ufeff';

  /**
   * @class core.dom
   *
   * Dom functions
   *
   * @singleton
   * @alternateClassName dom
   */
  var dom = (function () {
    /**
     * @method isEditable
     *
     * returns whether node is `note-editable` or not.
     *
     * @param {Node} node
     * @return {Boolean}
     */
    var isEditable = function (node) {
      return node && $(node).hasClass('note-editable');
    };

    /**
     * @method isControlSizing
     *
     * returns whether node is `note-control-sizing` or not.
     *
     * @param {Node} node
     * @return {Boolean}
     */
    var isControlSizing = function (node) {
      return node && $(node).hasClass('note-control-sizing');
    };

    /**
     * @method makePredByNodeName
     *
     * returns predicate which judge whether nodeName is same
     *
     * @param {String} nodeName
     * @return {Function}
     */
    var makePredByNodeName = function (nodeName) {
      nodeName = nodeName.toUpperCase();
      return function (node) {
        return node && node.nodeName.toUpperCase() === nodeName;
      };
    };

    /**
     * @method isText
     *
     *
     *
     * @param {Node} node
     * @return {Boolean} true if node's type is text(3)
     */
    var isText = function (node) {
      return node && node.nodeType === 3;
    };

    /**
     * @method isElement
     *
     *
     *
     * @param {Node} node
     * @return {Boolean} true if node's type is element(1)
     */
    var isElement = function (node) {
      return node && node.nodeType === 1;
    };

    /**
     * ex) br, col, embed, hr, img, input, ...
     * @see http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
     */
    var isVoid = function (node) {
      return node && /^BR|^IMG|^HR|^IFRAME|^BUTTON|^INPUT/.test(node.nodeName.toUpperCase());
    };

    var isPara = function (node) {
      if (isEditable(node)) {
        return false;
      }

      // Chrome(v31.0), FF(v25.0.1) use DIV for paragraph
      return node && /^DIV|^P|^LI|^H[1-7]/.test(node.nodeName.toUpperCase());
    };

    var isHeading = function (node) {
      return node && /^H[1-7]/.test(node.nodeName.toUpperCase());
    };

    var isPre = makePredByNodeName('PRE');

    var isLi = makePredByNodeName('LI');

    var isPurePara = function (node) {
      return isPara(node) && !isLi(node);
    };

    var isTable = makePredByNodeName('TABLE');

    var isData = makePredByNodeName('DATA');

    var isInline = function (node) {
      return !isBodyContainer(node) &&
             !isList(node) &&
             !isHr(node) &&
             !isPara(node) &&
             !isTable(node) &&
             !isBlockquote(node) &&
             !isData(node);
    };

    var isList = function (node) {
      return node && /^UL|^OL/.test(node.nodeName.toUpperCase());
    };

    var isHr = makePredByNodeName('HR');

    var isCell = function (node) {
      return node && /^TD|^TH/.test(node.nodeName.toUpperCase());
    };

    var isBlockquote = makePredByNodeName('BLOCKQUOTE');

    var isBodyContainer = function (node) {
      return isCell(node) || isBlockquote(node) || isEditable(node);
    };

    var isAnchor = makePredByNodeName('A');

    var isParaInline = function (node) {
      return isInline(node) && !!ancestor(node, isPara);
    };

    var isBodyInline = function (node) {
      return isInline(node) && !ancestor(node, isPara);
    };

    var isBody = makePredByNodeName('BODY');

    /**
     * returns whether nodeB is closest sibling of nodeA
     *
     * @param {Node} nodeA
     * @param {Node} nodeB
     * @return {Boolean}
     */
    var isClosestSibling = function (nodeA, nodeB) {
      return nodeA.nextSibling === nodeB ||
             nodeA.previousSibling === nodeB;
    };

    /**
     * returns array of closest siblings with node
     *
     * @param {Node} node
     * @param {function} [pred] - predicate function
     * @return {Node[]}
     */
    var withClosestSiblings = function (node, pred) {
      pred = pred || func.ok;

      var siblings = [];
      if (node.previousSibling && pred(node.previousSibling)) {
        siblings.push(node.previousSibling);
      }
      siblings.push(node);
      if (node.nextSibling && pred(node.nextSibling)) {
        siblings.push(node.nextSibling);
      }
      return siblings;
    };

    /**
     * blank HTML for cursor position
     * - [workaround] old IE only works with &nbsp;
     * - [workaround] IE11 and other browser works with bogus br
     */
    var blankHTML = agent.isMSIE && agent.browserVersion < 11 ? '&nbsp;' : '<br>';

    /**
     * @method nodeLength
     *
     * returns #text's text size or element's childNodes size
     *
     * @param {Node} node
     */
    var nodeLength = function (node) {
      if (isText(node)) {
        return node.nodeValue.length;
      }
      
      if (node) {
        return node.childNodes.length;
      }
      
      return 0;
      
    };

    /**
     * returns whether node is empty or not.
     *
     * @param {Node} node
     * @return {Boolean}
     */
    var isEmpty = function (node) {
      var len = nodeLength(node);

      if (len === 0) {
        return true;
      } else if (!isText(node) && len === 1 && node.innerHTML === blankHTML) {
        // ex) <p><br></p>, <span><br></span>
        return true;
      } else if (list.all(node.childNodes, isText) && node.innerHTML === '') {
        // ex) <p></p>, <span></span>
        return true;
      }

      return false;
    };

    /**
     * padding blankHTML if node is empty (for cursor position)
     */
    var paddingBlankHTML = function (node) {
      if (!isVoid(node) && !nodeLength(node)) {
        node.innerHTML = blankHTML;
      }
    };

    /**
     * find nearest ancestor predicate hit
     *
     * @param {Node} node
     * @param {Function} pred - predicate function
     */
    var ancestor = function (node, pred) {
      while (node) {
        if (pred(node)) { return node; }
        if (isEditable(node)) { break; }

        node = node.parentNode;
      }
      return null;
    };

    /**
     * find nearest ancestor only single child blood line and predicate hit
     *
     * @param {Node} node
     * @param {Function} pred - predicate function
     */
    var singleChildAncestor = function (node, pred) {
      node = node.parentNode;

      while (node) {
        if (nodeLength(node) !== 1) { break; }
        if (pred(node)) { return node; }
        if (isEditable(node)) { break; }

        node = node.parentNode;
      }
      return null;
    };

    /**
     * returns new array of ancestor nodes (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [optional] pred - predicate function
     */
    var listAncestor = function (node, pred) {
      pred = pred || func.fail;

      var ancestors = [];
      ancestor(node, function (el) {
        if (!isEditable(el)) {
          ancestors.push(el);
        }

        return pred(el);
      });
      return ancestors;
    };

    /**
     * find farthest ancestor predicate hit
     */
    var lastAncestor = function (node, pred) {
      var ancestors = listAncestor(node);
      return list.last(ancestors.filter(pred));
    };

    /**
     * returns common ancestor node between two nodes.
     *
     * @param {Node} nodeA
     * @param {Node} nodeB
     */
    var commonAncestor = function (nodeA, nodeB) {
      var ancestors = listAncestor(nodeA);
      for (var n = nodeB; n; n = n.parentNode) {
        if ($.inArray(n, ancestors) > -1) { return n; }
      }
      return null; // difference document area
    };

    /**
     * listing all previous siblings (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [optional] pred - predicate function
     */
    var listPrev = function (node, pred) {
      pred = pred || func.fail;

      var nodes = [];
      while (node) {
        if (pred(node)) { break; }
        nodes.push(node);
        node = node.previousSibling;
      }
      return nodes;
    };

    /**
     * listing next siblings (until predicate hit).
     *
     * @param {Node} node
     * @param {Function} [pred] - predicate function
     */
    var listNext = function (node, pred) {
      pred = pred || func.fail;

      var nodes = [];
      while (node) {
        if (pred(node)) { break; }
        nodes.push(node);
        node = node.nextSibling;
      }
      return nodes;
    };

    /**
     * listing descendant nodes
     *
     * @param {Node} node
     * @param {Function} [pred] - predicate function
     */
    var listDescendant = function (node, pred) {
      var descendants = [];
      pred = pred || func.ok;

      // start DFS(depth first search) with node
      (function fnWalk(current) {
        if (node !== current && pred(current)) {
          descendants.push(current);
        }
        for (var idx = 0, len = current.childNodes.length; idx < len; idx++) {
          fnWalk(current.childNodes[idx]);
        }
      })(node);

      return descendants;
    };

    /**
     * wrap node with new tag.
     *
     * @param {Node} node
     * @param {Node} tagName of wrapper
     * @return {Node} - wrapper
     */
    var wrap = function (node, wrapperName) {
      var parent = node.parentNode;
      var wrapper = $('<' + wrapperName + '>')[0];

      parent.insertBefore(wrapper, node);
      wrapper.appendChild(node);

      return wrapper;
    };

    /**
     * insert node after preceding
     *
     * @param {Node} node
     * @param {Node} preceding - predicate function
     */
    var insertAfter = function (node, preceding) {
      var next = preceding.nextSibling, parent = preceding.parentNode;
      if (next) {
        parent.insertBefore(node, next);
      } else {
        parent.appendChild(node);
      }
      return node;
    };

    /**
     * append elements.
     *
     * @param {Node} node
     * @param {Collection} aChild
     */
    var appendChildNodes = function (node, aChild) {
      $.each(aChild, function (idx, child) {
        node.appendChild(child);
      });
      return node;
    };

    /**
     * returns whether boundaryPoint is left edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isLeftEdgePoint = function (point) {
      return point.offset === 0;
    };

    /**
     * returns whether boundaryPoint is right edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isRightEdgePoint = function (point) {
      return point.offset === nodeLength(point.node);
    };

    /**
     * returns whether boundaryPoint is edge or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isEdgePoint = function (point) {
      return isLeftEdgePoint(point) || isRightEdgePoint(point);
    };

    /**
     * returns whether node is left edge of ancestor or not.
     *
     * @param {Node} node
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isLeftEdgeOf = function (node, ancestor) {
      while (node && node !== ancestor) {
        if (position(node) !== 0) {
          return false;
        }
        node = node.parentNode;
      }

      return true;
    };

    /**
     * returns whether node is right edge of ancestor or not.
     *
     * @param {Node} node
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isRightEdgeOf = function (node, ancestor) {
      if (!ancestor) {
        return false;
      }
      while (node && node !== ancestor) {
        if (position(node) !== nodeLength(node.parentNode) - 1) {
          return false;
        }
        node = node.parentNode;
      }

      return true;
    };

    /**
     * returns whether point is left edge of ancestor or not.
     * @param {BoundaryPoint} point
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isLeftEdgePointOf = function (point, ancestor) {
      return isLeftEdgePoint(point) && isLeftEdgeOf(point.node, ancestor);
    };

    /**
     * returns whether point is right edge of ancestor or not.
     * @param {BoundaryPoint} point
     * @param {Node} ancestor
     * @return {Boolean}
     */
    var isRightEdgePointOf = function (point, ancestor) {
      return isRightEdgePoint(point) && isRightEdgeOf(point.node, ancestor);
    };

    /**
     * returns offset from parent.
     *
     * @param {Node} node
     */
    var position = function (node) {
      var offset = 0;
      while ((node = node.previousSibling)) {
        offset += 1;
      }
      return offset;
    };

    var hasChildren = function (node) {
      return !!(node && node.childNodes && node.childNodes.length);
    };

    /**
     * returns previous boundaryPoint
     *
     * @param {BoundaryPoint} point
     * @param {Boolean} isSkipInnerOffset
     * @return {BoundaryPoint}
     */
    var prevPoint = function (point, isSkipInnerOffset) {
      var node, offset;

      if (point.offset === 0) {
        if (isEditable(point.node)) {
          return null;
        }

        node = point.node.parentNode;
        offset = position(point.node);
      } else if (hasChildren(point.node)) {
        node = point.node.childNodes[point.offset - 1];
        offset = nodeLength(node);
      } else {
        node = point.node;
        offset = isSkipInnerOffset ? 0 : point.offset - 1;
      }

      return {
        node: node,
        offset: offset
      };
    };

    /**
     * returns next boundaryPoint
     *
     * @param {BoundaryPoint} point
     * @param {Boolean} isSkipInnerOffset
     * @return {BoundaryPoint}
     */
    var nextPoint = function (point, isSkipInnerOffset) {
      var node, offset;

      if (nodeLength(point.node) === point.offset) {
        if (isEditable(point.node)) {
          return null;
        }

        node = point.node.parentNode;
        offset = position(point.node) + 1;
      } else if (hasChildren(point.node)) {
        node = point.node.childNodes[point.offset];
        offset = 0;
      } else {
        node = point.node;
        offset = isSkipInnerOffset ? nodeLength(point.node) : point.offset + 1;
      }

      return {
        node: node,
        offset: offset
      };
    };

    /**
     * returns whether pointA and pointB is same or not.
     *
     * @param {BoundaryPoint} pointA
     * @param {BoundaryPoint} pointB
     * @return {Boolean}
     */
    var isSamePoint = function (pointA, pointB) {
      return pointA.node === pointB.node && pointA.offset === pointB.offset;
    };

    /**
     * returns whether point is visible (can set cursor) or not.
     *
     * @param {BoundaryPoint} point
     * @return {Boolean}
     */
    var isVisiblePoint = function (point) {
      if (isText(point.node) || !hasChildren(point.node) || isEmpty(point.node)) {
        return true;
      }

      var leftNode = point.node.childNodes[point.offset - 1];
      var rightNode = point.node.childNodes[point.offset];
      if ((!leftNode || isVoid(leftNode)) && (!rightNode || isVoid(rightNode))) {
        return true;
      }

      return false;
    };

    /**
     * @method prevPointUtil
     *
     * @param {BoundaryPoint} point
     * @param {Function} pred
     * @return {BoundaryPoint}
     */
    var prevPointUntil = function (point, pred) {
      while (point) {
        if (pred(point)) {
          return point;
        }

        point = prevPoint(point);
      }

      return null;
    };

    /**
     * @method nextPointUntil
     *
     * @param {BoundaryPoint} point
     * @param {Function} pred
     * @return {BoundaryPoint}
     */
    var nextPointUntil = function (point, pred) {
      while (point) {
        if (pred(point)) {
          return point;
        }

        point = nextPoint(point);
      }

      return null;
    };

    /**
     * returns whether point has character or not.
     *
     * @param {Point} point
     * @return {Boolean}
     */
    var isCharPoint = function (point) {
      if (!isText(point.node)) {
        return false;
      }

      var ch = point.node.nodeValue.charAt(point.offset - 1);
      return ch && (ch !== ' ' && ch !== NBSP_CHAR);
    };

    /**
     * @method walkPoint
     *
     * @param {BoundaryPoint} startPoint
     * @param {BoundaryPoint} endPoint
     * @param {Function} handler
     * @param {Boolean} isSkipInnerOffset
     */
    var walkPoint = function (startPoint, endPoint, handler, isSkipInnerOffset) {
      var point = startPoint;

      while (point) {
        handler(point);

        if (isSamePoint(point, endPoint)) {
          break;
        }

        var isSkipOffset = isSkipInnerOffset &&
                           startPoint.node !== point.node &&
                           endPoint.node !== point.node;
        point = nextPoint(point, isSkipOffset);
      }
    };

    /**
     * @method makeOffsetPath
     *
     * return offsetPath(array of offset) from ancestor
     *
     * @param {Node} ancestor - ancestor node
     * @param {Node} node
     */
    var makeOffsetPath = function (ancestor, node) {
      var ancestors = listAncestor(node, func.eq(ancestor));
      return ancestors.map(position).reverse();
    };

    /**
     * @method fromOffsetPath
     *
     * return element from offsetPath(array of offset)
     *
     * @param {Node} ancestor - ancestor node
     * @param {array} offsets - offsetPath
     */
    var fromOffsetPath = function (ancestor, offsets) {
      var current = ancestor;
      for (var i = 0, len = offsets.length; i < len; i++) {
        if (current.childNodes.length <= offsets[i]) {
          current = current.childNodes[current.childNodes.length - 1];
        } else {
          current = current.childNodes[offsets[i]];
        }
      }
      return current;
    };

    /**
     * @method splitNode
     *
     * split element or #text
     *
     * @param {BoundaryPoint} point
     * @param {Object} [options]
     * @param {Boolean} [options.isSkipPaddingBlankHTML] - default: false
     * @param {Boolean} [options.isNotSplitEdgePoint] - default: false
     * @return {Node} right node of boundaryPoint
     */
    var splitNode = function (point, options) {
      var isSkipPaddingBlankHTML = options && options.isSkipPaddingBlankHTML;
      var isNotSplitEdgePoint = options && options.isNotSplitEdgePoint;

      // edge case
      if (isEdgePoint(point) && (isText(point.node) || isNotSplitEdgePoint)) {
        if (isLeftEdgePoint(point)) {
          return point.node;
        } else if (isRightEdgePoint(point)) {
          return point.node.nextSibling;
        }
      }

      // split #text
      if (isText(point.node)) {
        return point.node.splitText(point.offset);
      } else {
        var childNode = point.node.childNodes[point.offset];
        var clone = insertAfter(point.node.cloneNode(false), point.node);
        appendChildNodes(clone, listNext(childNode));

        if (!isSkipPaddingBlankHTML) {
          paddingBlankHTML(point.node);
          paddingBlankHTML(clone);
        }

        return clone;
      }
    };

    /**
     * @method splitTree
     *
     * split tree by point
     *
     * @param {Node} root - split root
     * @param {BoundaryPoint} point
     * @param {Object} [options]
     * @param {Boolean} [options.isSkipPaddingBlankHTML] - default: false
     * @param {Boolean} [options.isNotSplitEdgePoint] - default: false
     * @return {Node} right node of boundaryPoint
     */
    var splitTree = function (root, point, options) {
      // ex) [#text, <span>, <p>]
      var ancestors = listAncestor(point.node, func.eq(root));

      if (!ancestors.length) {
        return null;
      } else if (ancestors.length === 1) {
        return splitNode(point, options);
      }

      return ancestors.reduce(function (node, parent) {
        if (node === point.node) {
          node = splitNode(point, options);
        }

        return splitNode({
          node: parent,
          offset: node ? dom.position(node) : nodeLength(parent)
        }, options);
      });
    };

    /**
     * split point
     *
     * @param {Point} point
     * @param {Boolean} isInline
     * @return {Object}
     */
    var splitPoint = function (point, isInline) {
      // find splitRoot, container
      //  - inline: splitRoot is a child of paragraph
      //  - block: splitRoot is a child of bodyContainer
      var pred = isInline ? isPara : isBodyContainer;
      var ancestors = listAncestor(point.node, pred);
      var topAncestor = list.last(ancestors) || point.node;

      var splitRoot, container;
      if (pred(topAncestor)) {
        splitRoot = ancestors[ancestors.length - 2];
        container = topAncestor;
      } else {
        splitRoot = topAncestor;
        container = splitRoot.parentNode;
      }

      // if splitRoot is exists, split with splitTree
      var pivot = splitRoot && splitTree(splitRoot, point, {
        isSkipPaddingBlankHTML: isInline,
        isNotSplitEdgePoint: isInline
      });

      // if container is point.node, find pivot with point.offset
      if (!pivot && container === point.node) {
        pivot = point.node.childNodes[point.offset];
      }

      return {
        rightNode: pivot,
        container: container
      };
    };

    var create = function (nodeName) {
      return document.createElement(nodeName);
    };

    var createText = function (text) {
      return document.createTextNode(text);
    };

    /**
     * @method remove
     *
     * remove node, (isRemoveChild: remove child or not)
     *
     * @param {Node} node
     * @param {Boolean} isRemoveChild
     */
    var remove = function (node, isRemoveChild) {
      if (!node || !node.parentNode) { return; }
      if (node.removeNode) { return node.removeNode(isRemoveChild); }

      var parent = node.parentNode;
      if (!isRemoveChild) {
        var nodes = [];
        var i, len;
        for (i = 0, len = node.childNodes.length; i < len; i++) {
          nodes.push(node.childNodes[i]);
        }

        for (i = 0, len = nodes.length; i < len; i++) {
          parent.insertBefore(nodes[i], node);
        }
      }

      parent.removeChild(node);
    };

    /**
     * @method removeWhile
     *
     * @param {Node} node
     * @param {Function} pred
     */
    var removeWhile = function (node, pred) {
      while (node) {
        if (isEditable(node) || !pred(node)) {
          break;
        }

        var parent = node.parentNode;
        remove(node);
        node = parent;
      }
    };

    /**
     * @method replace
     *
     * replace node with provided nodeName
     *
     * @param {Node} node
     * @param {String} nodeName
     * @return {Node} - new node
     */
    var replace = function (node, nodeName) {
      if (node.nodeName.toUpperCase() === nodeName.toUpperCase()) {
        return node;
      }

      var newNode = create(nodeName);

      if (node.style.cssText) {
        newNode.style.cssText = node.style.cssText;
      }

      appendChildNodes(newNode, list.from(node.childNodes));
      insertAfter(newNode, node);
      remove(node);

      return newNode;
    };

    var isTextarea = makePredByNodeName('TEXTAREA');

    /**
     * @param {jQuery} $node
     * @param {Boolean} [stripLinebreaks] - default: false
     */
    var value = function ($node, stripLinebreaks) {
      var val = isTextarea($node[0]) ? $node.val() : $node.html();
      if (stripLinebreaks) {
        return val.replace(/[\n\r]/g, '');
      }
      return val;
    };

    /**
     * @method html
     *
     * get the HTML contents of node
     *
     * @param {jQuery} $node
     * @param {Boolean} [isNewlineOnBlock]
     */
    var html = function ($node, isNewlineOnBlock) {
      var markup = value($node);

      if (isNewlineOnBlock) {
        var regexTag = /<(\/?)(\b(?!!)[^>\s]*)(.*?)(\s*\/?>)/g;
        markup = markup.replace(regexTag, function (match, endSlash, name) {
          name = name.toUpperCase();
          var isEndOfInlineContainer = /^DIV|^TD|^TH|^P|^LI|^H[1-7]/.test(name) &&
                                       !!endSlash;
          var isBlockNode = /^BLOCKQUOTE|^TABLE|^TBODY|^TR|^HR|^UL|^OL/.test(name);

          return match + ((isEndOfInlineContainer || isBlockNode) ? '\n' : '');
        });
        markup = $.trim(markup);
      }

      return markup;
    };

    var posFromPlaceholder = function (placeholder) {
      var $placeholder = $(placeholder);
      var pos = $placeholder.offset();
      var height = $placeholder.outerHeight(true); // include margin

      return {
        left: pos.left,
        top: pos.top + height
      };
    };

    var attachEvents = function ($node, events) {
      Object.keys(events).forEach(function (key) {
        $node.on(key, events[key]);
      });
    };

    var detachEvents = function ($node, events) {
      Object.keys(events).forEach(function (key) {
        $node.off(key, events[key]);
      });
    };

    /**
     * @method isCustomStyleTag
     *
     * assert if a node contains a "note-styletag" class,
     * which implies that's a custom-made style tag node
     *
     * @param {Node} an HTML DOM node
     */
    var isCustomStyleTag = function (node) {
      return node && !dom.isText(node) && list.contains(node.classList, 'note-styletag');
    };

    return {
      /** @property {String} NBSP_CHAR */
      NBSP_CHAR: NBSP_CHAR,
      /** @property {String} ZERO_WIDTH_NBSP_CHAR */
      ZERO_WIDTH_NBSP_CHAR: ZERO_WIDTH_NBSP_CHAR,
      /** @property {String} blank */
      blank: blankHTML,
      /** @property {String} emptyPara */
      emptyPara: '<p>' + blankHTML + '</p>',
      makePredByNodeName: makePredByNodeName,
      isEditable: isEditable,
      isControlSizing: isControlSizing,
      isText: isText,
      isElement: isElement,
      isVoid: isVoid,
      isPara: isPara,
      isPurePara: isPurePara,
      isHeading: isHeading,
      isInline: isInline,
      isBlock: func.not(isInline),
      isBodyInline: isBodyInline,
      isBody: isBody,
      isParaInline: isParaInline,
      isPre: isPre,
      isList: isList,
      isTable: isTable,
      isData: isData,
      isCell: isCell,
      isBlockquote: isBlockquote,
      isBodyContainer: isBodyContainer,
      isAnchor: isAnchor,
      isDiv: makePredByNodeName('DIV'),
      isLi: isLi,
      isBR: makePredByNodeName('BR'),
      isSpan: makePredByNodeName('SPAN'),
      isB: makePredByNodeName('B'),
      isU: makePredByNodeName('U'),
      isS: makePredByNodeName('S'),
      isI: makePredByNodeName('I'),
      isImg: makePredByNodeName('IMG'),
      isTextarea: isTextarea,
      isEmpty: isEmpty,
      isEmptyAnchor: func.and(isAnchor, isEmpty),
      isClosestSibling: isClosestSibling,
      withClosestSiblings: withClosestSiblings,
      nodeLength: nodeLength,
      isLeftEdgePoint: isLeftEdgePoint,
      isRightEdgePoint: isRightEdgePoint,
      isEdgePoint: isEdgePoint,
      isLeftEdgeOf: isLeftEdgeOf,
      isRightEdgeOf: isRightEdgeOf,
      isLeftEdgePointOf: isLeftEdgePointOf,
      isRightEdgePointOf: isRightEdgePointOf,
      prevPoint: prevPoint,
      nextPoint: nextPoint,
      isSamePoint: isSamePoint,
      isVisiblePoint: isVisiblePoint,
      prevPointUntil: prevPointUntil,
      nextPointUntil: nextPointUntil,
      isCharPoint: isCharPoint,
      walkPoint: walkPoint,
      ancestor: ancestor,
      singleChildAncestor: singleChildAncestor,
      listAncestor: listAncestor,
      lastAncestor: lastAncestor,
      listNext: listNext,
      listPrev: listPrev,
      listDescendant: listDescendant,
      commonAncestor: commonAncestor,
      wrap: wrap,
      insertAfter: insertAfter,
      appendChildNodes: appendChildNodes,
      position: position,
      hasChildren: hasChildren,
      makeOffsetPath: makeOffsetPath,
      fromOffsetPath: fromOffsetPath,
      splitTree: splitTree,
      splitPoint: splitPoint,
      create: create,
      createText: createText,
      remove: remove,
      removeWhile: removeWhile,
      replace: replace,
      html: html,
      value: value,
      posFromPlaceholder: posFromPlaceholder,
      attachEvents: attachEvents,
      detachEvents: detachEvents,
      isCustomStyleTag: isCustomStyleTag
    };
  })();

  /**
   * @param {jQuery} $note
   * @param {Object} options
   * @return {Context}
   */
  var Context = function ($note, options) {
    var self = this;

    var ui = $.summernote.ui;
    this.memos = {};
    this.modules = {};
    this.layoutInfo = {};
    this.options = options;

    /**
     * create layout and initialize modules and other resources
     */
    this.initialize = function () {
      this.layoutInfo = ui.createLayout($note, options);
      this._initialize();
      $note.hide();
      return this;
    };

    /**
     * destroy modules and other resources and remove layout
     */
    this.destroy = function () {
      this._destroy();
      $note.removeData('summernote');
      ui.removeLayout($note, this.layoutInfo);
    };

    /**
     * destory modules and other resources and initialize it again
     */
    this.reset = function () {
      var disabled = self.isDisabled();
      this.code(dom.emptyPara);
      this._destroy();
      this._initialize();

      if (disabled) {
        self.disable();
      }
    };

    this._initialize = function () {
      // add optional buttons
      var buttons = $.extend({}, this.options.buttons);
      Object.keys(buttons).forEach(function (key) {
        self.memo('button.' + key, buttons[key]);
      });

      var modules = $.extend({}, this.options.modules, $.summernote.plugins || {});

      // add and initialize modules
      Object.keys(modules).forEach(function (key) {
        self.module(key, modules[key], true);
      });

      Object.keys(this.modules).forEach(function (key) {
        self.initializeModule(key);
      });
    };

    this._destroy = function () {
      // destroy modules with reversed order
      Object.keys(this.modules).reverse().forEach(function (key) {
        self.removeModule(key);
      });

      Object.keys(this.memos).forEach(function (key) {
        self.removeMemo(key);
      });
      // trigger custom onDestroy callback
      this.triggerEvent('destroy', this);
    };

    this.code = function (html) {
      var isActivated = this.invoke('codeview.isActivated');

      if (html === undefined) {
        this.invoke('codeview.sync');
        return isActivated ? this.layoutInfo.codable.val() : this.layoutInfo.editable.html();
      } else {
        if (isActivated) {
          this.layoutInfo.codable.val(html);
        } else {
          this.layoutInfo.editable.html(html);
        }
        $note.val(html);
        this.triggerEvent('change', html);
      }
    };

    this.isDisabled = function () {
      return this.layoutInfo.editable.attr('contenteditable') === 'false';
    };

    this.enable = function () {
      this.layoutInfo.editable.attr('contenteditable', true);
      this.invoke('toolbar.activate', true);
      this.triggerEvent('disable', false);
    };

    this.disable = function () {
      // close codeview if codeview is opend
      if (this.invoke('codeview.isActivated')) {
        this.invoke('codeview.deactivate');
      }
      this.layoutInfo.editable.attr('contenteditable', false);
      this.invoke('toolbar.deactivate', true);

      this.triggerEvent('disable', true);
    };

    this.triggerEvent = function () {
      var namespace = list.head(arguments);
      var args = list.tail(list.from(arguments));

      var callback = this.options.callbacks[func.namespaceToCamel(namespace, 'on')];
      if (callback) {
        callback.apply($note[0], args);
      }
      $note.trigger('summernote.' + namespace, args);
    };

    this.initializeModule = function (key) {
      var module = this.modules[key];
      module.shouldInitialize = module.shouldInitialize || func.ok;
      if (!module.shouldInitialize()) {
        return;
      }

      // initialize module
      if (module.initialize) {
        module.initialize();
      }

      // attach events
      if (module.events) {
        dom.attachEvents($note, module.events);
      }
    };

    this.module = function (key, ModuleClass, withoutIntialize) {
      if (arguments.length === 1) {
        return this.modules[key];
      }

      this.modules[key] = new ModuleClass(this);

      if (!withoutIntialize) {
        this.initializeModule(key);
      }
    };

    this.removeModule = function (key) {
      var module = this.modules[key];
      if (module.shouldInitialize()) {
        if (module.events) {
          dom.detachEvents($note, module.events);
        }

        if (module.destroy) {
          module.destroy();
        }
      }

      delete this.modules[key];
    };

    this.memo = function (key, obj) {
      if (arguments.length === 1) {
        return this.memos[key];
      }
      this.memos[key] = obj;
    };

    this.removeMemo = function (key) {
      if (this.memos[key] && this.memos[key].destroy) {
        this.memos[key].destroy();
      }

      delete this.memos[key];
    };

    /**
     *Some buttons need to change their visual style immediately once they get pressed
     */
    this.createInvokeHandlerAndUpdateState = function (namespace, value) {
      return function (event) {
        self.createInvokeHandler(namespace, value)(event);
        self.invoke('buttons.updateCurrentStyle');
      };
    };

    this.createInvokeHandler = function (namespace, value) {
      return function (event) {
        event.preventDefault();
        var $target = $(event.target);
        self.invoke(namespace, value || $target.closest('[data-value]').data('value'), $target);
      };
    };

    this.invoke = function () {
      var namespace = list.head(arguments);
      var args = list.tail(list.from(arguments));

      var splits = namespace.split('.');
      var hasSeparator = splits.length > 1;
      var moduleName = hasSeparator && list.head(splits);
      var methodName = hasSeparator ? list.last(splits) : list.head(splits);

      var module = this.modules[moduleName || 'editor'];
      if (!moduleName && this[methodName]) {
        return this[methodName].apply(this, args);
      } else if (module && module[methodName] && module.shouldInitialize()) {
        return module[methodName].apply(module, args);
      }
    };

    return this.initialize();
  };

  $.fn.extend({
    /**
     * Summernote API
     *
     * @param {Object|String}
     * @return {this}
     */
    summernote: function () {
      var type = $.type(list.head(arguments));
      var isExternalAPICalled = type === 'string';
      var hasInitOptions = type === 'object';

      var options = hasInitOptions ? list.head(arguments) : {};

      options = $.extend({}, $.summernote.options, options);

      // Update options
      options.langInfo = $.extend(true, {}, $.summernote.lang['en-US'], $.summernote.lang[options.lang]);
      options.icons = $.extend(true, {}, $.summernote.options.icons, options.icons);
      options.tooltip = options.tooltip === 'auto' ? !agent.isSupportTouch : options.tooltip;

      this.each(function (idx, note) {
        var $note = $(note);
        if (!$note.data('summernote')) {
          var context = new Context($note, options);
          $note.data('summernote', context);
          $note.data('summernote').triggerEvent('init', context.layoutInfo);
        }
      });

      var $note = this.first();
      if ($note.length) {
        var context = $note.data('summernote');
        if (isExternalAPICalled) {
          return context.invoke.apply(context, list.from(arguments));
        } else if (options.focus) {
          context.invoke('editor.focus');
        }
      }

      return this;
    }
  });


  var Renderer = function (markup, children, options, callback) {
    this.render = function ($parent) {
      var $node = $(markup);

      if (options && options.contents) {
        $node.html(options.contents);
      }

      if (options && options.className) {
        $node.addClass(options.className);
      }

      if (options && options.data) {
        $.each(options.data, function (k, v) {
          $node.attr('data-' + k, v);
        });
      }

      if (options && options.click) {
        $node.on('click', options.click);
      }

      if (children) {
        var $container = $node.find('.note-children-container');
        children.forEach(function (child) {
          child.render($container.length ? $container : $node);
        });
      }

      if (callback) {
        callback($node, options);
      }

      if (options && options.callback) {
        options.callback($node);
      }

      if ($parent) {
        $parent.append($node);
      }

      return $node;
    };
  };

  var renderer = {
    create: function (markup, callback) {
      return function () {
        var children = $.isArray(arguments[0]) ? arguments[0] : [];
        var options = typeof arguments[1] === 'object' ? arguments[1] : arguments[0];
        if (options && options.children) {
          children = options.children;
        }
        return new Renderer(markup, children, options, callback);
      };
    }
  };

  var tooltip = (function () {
    var Tooltip = function ($node, options) {
      var self = this;
  
      this.init = function (options) {
        this.options = $.extend({}, {
          title: '',
          target: 'body',
          trigger: 'hover focus',
          placement: 'bottom'
        }, options);
  
        // create tooltip node
        this.$tooltip = $([
          '<div class="note-tooltip in">',
          '  <div class="note-tooltip-arrow"/>',
          '  <div class="note-tooltip-content"/>',
          '</div>'
        ].join(''));
  
        // define event
        if (this.options.trigger !== 'manual') {
          this.options.trigger.split(' ').forEach(function (eventName) {
            if (eventName === 'hover') {
              $node.off('mouseenter mouseleave');
  
              $node.on('mouseenter', function () {
                self.show($node);
              }).on('mouseleave', function () {
                self.hide($node);
              });
            } else if (eventName === 'click')  {
              $node.on('click', function () {
                self.toggle($node);
              });
            } else if (eventName === 'focus') {
              $node.on('focus', function () {
                self.show($node);
              }).on('blur', function () {
                self.hide($node);
              });
            }
          });
        }
      };
  
      this.show = function () {
        var offset = $node.offset();
  
        var $tooltip = this.$tooltip;
        var title = this.options.title || $node.attr('title') || $node.data('title');
        var placement = this.options.placement || $node.data('placement');
  
        $tooltip.addClass(placement);
        $tooltip.addClass('in');
        $tooltip.find('.note-tooltip-content').text(title);
        $tooltip.appendTo(this.options.target);
  
        var nodeWidth = $node.outerWidth();
        var nodeHeight = $node.outerHeight();
        var tooltipWidth = $tooltip.outerWidth();
        var tooltipHeight = $tooltip.outerHeight();
  
        if (placement === 'bottom') {
          $tooltip.css({
            top: offset.top + nodeHeight,
            left: offset.left + (nodeWidth / 2 - tooltipWidth / 2)
          });
        } else if (placement === 'top') {
          $tooltip.css({
            top: offset.top - tooltipHeight,
            left: offset.left + (nodeWidth / 2 - tooltipWidth / 2)
          });
        } else if (placement === 'left') {
          $tooltip.css({
            top: offset.top + (nodeHeight / 2 - tooltipHeight / 2),
            left: offset.left - tooltipWidth
          });
        } else if (placement === 'right') {
          $tooltip.css({
            top: offset.top + (nodeHeight / 2 - tooltipHeight / 2),
            left: offset.left + nodeWidth
          });
        }
      };
  
      this.hide = function () {
        this.$tooltip.removeClass('in');
        this.$tooltip.remove();
      };
  
      this.toggle = function () {
        if (this.$tooltip.hasClass('in')) {
          this.hide();
        } else {
          this.show();
        }
      };
  
      this.init(options);
    };

    return {
      create: function ($node, options) {
        return new Tooltip($node, options);
      }
    };
  })();


  var dropdown = (function () {

    var Dropdown = function ($node, options) {
      var self = this;

      this.init = function () {
        this.$button = $node;
        this.setEvent();
      };

      this.setEvent = function () {
        this.$button.on('click', function () {
          self.toggle(); 
        });
      };

      this.clear = function () {
        var $parent = $('.note-btn-group.open');
        $parent.find('.note-btn.active').removeClass('active');
        $parent.removeClass('open');
      };

      this.show = function () {
        this.$button.addClass('active');
        this.$button.parent().addClass('open');

        var $dropdown = this.$button.next();
        var offset = $dropdown.offset();
        var width = $dropdown.outerWidth();
        var windowWidth = $(window).width();
        var bodyMarginRight = parseFloat($('body').css('margin-right'));

        if (offset.left + width > windowWidth - bodyMarginRight) {
          $dropdown.css('margin-left', windowWidth - bodyMarginRight - (offset.left + width));
        } else {
          $dropdown.css('margin-left', '');
        }
      };

      this.hide = function () {
        this.$button.removeClass('active');
        this.$button.parent().removeClass('open');
      };

      this.toggle = function () {
        var isOpened = this.$button.parent().hasClass('open');

        this.clear();

        if (isOpened) {
          this.hide();
        } else {
          this.show();
        }
      };

      this.init(options);
    };

    return {
      create: function ($node, options) {
        return new Dropdown($node, options);
      }
    };
  })();

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.note-btn-group').length) {
      $('.note-btn-group.open').removeClass('open');
    }
  });

  $(document).on('click.note-dropdown-menu', function (e) {
    $(e.target).closest('.note-dropdown-menu').parent().removeClass('open');
  });


  var modal = (function () {
    var Modal = function ($node, options) {
      var self = this;

      this.init = function (options) {
        this.options = $.extend({}, {
          target: 'body'
        }, options);

        this.$modal = $node;
        this.$backdrop = $('<div class="note-modal-backdrop" />');

      };

      this.show = function () {
        if (this.options.target === 'body') {
          this.$backdrop.css('position', 'fixed');
          this.$modal.css('position', 'fixed');
        } else {
          this.$backdrop.css('position', 'absolute');
          this.$modal.css('position', 'absolute');
        }

        this.$backdrop.appendTo(this.options.target).show();
        this.$modal.appendTo(this.options.target).addClass('open').show();

        this.$modal.trigger('note.modal.show');
        this.$modal.off('click', '.close').on('click', '.close', function () {
          self.hide();
        });
      };

      this.hide = function () {
        this.$modal.removeClass('open').hide();
        this.$backdrop.hide();
        this.$modal.trigger('note.modal.hide');
      };

      this.init(options);
    };

    return {
      create: function ($node, options) {
        return new Modal($node, options);
      }
    };
  })();

  var editor = renderer.create('<div class="note-editor note-frame"/>');
  var toolbar = renderer.create('<div class="note-toolbar"/>');
  var editingArea = renderer.create('<div class="note-editing-area"/>');
  var codable = renderer.create('<textarea class="note-codable"/>');
  var editable = renderer.create('<div class="note-editable" contentEditable="true"/>');
  var statusbar = renderer.create([
    '<div class="note-statusbar">',
    '  <div class="note-resizebar">',
    '    <div class="note-icon-bar"/>',
    '    <div class="note-icon-bar"/>',
    '    <div class="note-icon-bar"/>',
    '  </div>',
    '</div>'
  ].join(''));

  var airEditor = renderer.create('<div class="note-editor"/>');
  var airEditable = renderer.create('<div class="note-editable" contentEditable="true"/>');

  var buttonGroup = renderer.create('<div class="note-btn-group">');
  var button = renderer.create('<button type="button" class="note-btn">', function ($node, options) {
    // set button type
    if (options && options.tooltip) {
      TooltipUI.create($node, {
        title: options.tooltip
      });
    }
    if (options.contents) {
      $node.html(options.contents);
    }
    
    if (options && options.data && options.data.toggle === 'dropdown') {
      DropdownÙë¼o¦Ş¹÷·ú<ÔŸ=¹¦¶Yü?ùñÏÛÜ{vøŸßé×]Ï¥vùşÖH>¦ËCšïu=#6qK­±‚>«çbŸ1†åºõ4ÿİzû`d•k\D¿ğ§­ş¤…7åÍÛİ›Qæ¿û&¶ı$v÷çk¨úV¹®íåï{¿™ı;®JŞÿWıw÷ÛßTá]İğ­£^‰?cæîŞçJ5§ß‹GsmĞü5Û¦µ¿
6yr÷n?w÷°ùhï¿÷Ó]=Ÿ‘üïü>¹2Û7şúıRóİ»¿o,İÛ¶õ?ímúîíş:»İŸ_ßê+úÿ[Öóõú†¿§ÏÛŒïÅî7gï®w¡§Ïî¯67¿{ÿæ¹íoól2ÿÛ–Ögb~ÏÿıËGíò+\|ÿöĞŞşßNãzÿ¯v§ìÏ%sÏ½Bì·ÌºÔ¿òÜÇış’>½çoågı{ğöïı8óï,ûÿì~ùïêo¯:Dß÷?ûïûXw&ı\Û¿öŸ÷íüßÔu¿Îïw}ÜnR$éÇ<ívíŒ}LçÓûorHö/×o¼’ÇòVŞÿà—Ô²^Á¨-Ùù™¾?lÎõïïZîÒç'F$/lFWİú}°«Gÿû?]ŸÓ<îßrŸ÷ïßì¯{xöœuØÿ&şWRÿİ–>ß÷½ÿùû¥»ä—‡|s¡üçEï_wl/Ë­úUöVËÃµg$W*û¶?ù]í÷¾œÜãQö–¿{¥ıµ{¬ÛlÜş­×ç½îûº¹ùw¾¸Ü­ıà¾ÜıZ~Íıïv6ïñ2¿½İŞmÀ÷ÿù_WÒ¹ëÿ÷ºşûıT¯Û«¿¨ş\~~®­e±Zñv¼¾ÿ/N{~¹ümô½/ãw»¿ıüşŞşVÓt¿ÿ7ğ'®ã¢¶ÿãÇº½ó/'ı¼÷õûNö-‹só·úİÍüM_	\ıù1«Çİò*½¾"W¶ÔıÿE_»Z³jÜëßò]é?½Ê•V—S>ìr§§©÷íßŸîÉïĞ¶4_=½™•«À¿MsşÖçü%›{ñÓ¿½¹_Ùü®õæÓm:öûi½Uxß«¾•gºİcâŞ>u½îî^æ§Ä4ÿ`œè!¯5'§?ÃTN/¡ãß¾{®]|í~
~ +ş}ÓŞÿÙ™;‘^LÍw>–Í_ş'çäûçŞ=o¥àŠ–ÇyÿÆ`?Ü)Üø¯—ıŸÙÕÇëÙ“ö·ŸÃ÷õ·Ÿ\á]õ/ë?»}_£Ù·¯wıty§¾Û-æıÛÜm>çÏ´–úÏõıG6şÍÿş¿5®?zyşşÿñr¿ÖßócÚVÑïN§İíáS?çŸ¾¶şßï®÷Z÷Î¾·ÿ×ß_óßşî­VşßûşOoÿ¯¿Ùş™şçûò¿ÿ_İÿså~¯}“Î´'¿ù©¢Ánæw¾k|…(›v;¹Ú uEÖÕn#ß˜W^öüzGõyÏoûñÕ¾ñ×â<ƒ¿¶‹ánÌ8/ÒG¸¥¯ÎŒcòòöZ×k+—hŞ;Şu5fÛzVÒyzYgEıåàÍàÿÈşUÚØö¤«÷õÚÿC}}»Äûó¼?<û^°—wÛŞµ³ûÿ¹âåTö3÷à£ŞÎÇı=ß_ó¬_¿­ö÷=v“ëÃí¾·f6ƒĞ›ËòwvŞ?úÏùï~ñşÓ^ëı‡«¶úOõò½zç~÷İó—ÿ~}8Æÿªp/½´úó·“şRú¯÷½ñÍşş|vç/¿Kí÷bş­üıûoŸoSÿ3Óî·uoÿö¾úïş?³íçoüÑ÷ï}«>k-îÿñ÷M7G‰ïßç×zŸè¿ÛÔ±úıóÍÚŠ?ÿûú¬õû¿—~êŞí¼¸K‹wÌ÷“­º_ï—“’¿ó÷ûÿÈïb{ÿŸëû¿÷ïÿ}c0¿»½KoŸ­âÿîØşÿ5İ~û1>ß}ËÍÛˆ¿{_ÿUæqÑw¿9qì˜ï7ùNè„¸÷h®×úµÜ·>¯ÿŞ®mßqrt–ùY'îÿ6·ùæßÈ†Tèş¸¯ûõ›%Ym»ñÏÁ5{q?_m»^-ëúùŞ¨·“İğÿŞûÆãß¿¶İšŞ§m>×u]B~ÛÓÿ^Å¹„ï|úßÿÿşïú¾è÷ÂB»öÇõ¿÷^ïï¾ÚÿÊ¶¼şÚ–‡~ëß<®ó®»òOâç#¾A¶êó±Æ‹ßÿşåÏFn}ÛåÙıO6«ıKÚş­å5ú…ßE¥zşÏïï×wgvuvVËş¹øqx^ñ½kïµÚÿ7>oıŞİû¼ßÔÿïı{¾3ÿÚÙïW/ÿKõÿºyàÖ=ıÚáğæ16ßJî{ÿOzş6ì_^ßİ÷«MşÄ*Ñ®Üë¿_GÛ§ñÿ‡³xª'›l¯®ïüMBÖ<??šIOˆÄœ”¹„ş¤™^çî==IY}·ù[Óg¿]}·şe›'½†ßeSOw¿¿=/ÿaeóŸ›å‡İÛ¿ÒÉQ†ÿš}·¯ùı£K´×7¯|5¾¬‘Ï»å¦ï9Àıjš±G8ıuË¼=êG}êÛ“ııƒ~6êæ¶­ğÿz{)×»kV÷};°ıZGí£×ÆÛË}“ıïrû~oW»ö¼[?ûL÷Ç_Z{ıôÖ¾]=v¬O÷fóıÚx˜òÇCáü· ü¶›ıñg1~ë¿Åñÿ3ŞG¾ÿü—õÛúßõôviaN¹şıÿ÷ı¯İh;ãÁw­÷·ûÛ·şçüÿÿÿß·›Õ“ìx×÷;ÒŒú~{IÇ_ô4ÂØø»qËÏşæşâÿ×™k7?µöKïe¯|µÕ'\ï'¿Ê\æÓ3~›M=yßç¿ß}}·ï^{äIëı7{z·şüeıu÷ÆH¯š·OĞWš®aKa-i·õ:^eûËÿ³Ş£tÆ=½áFıÿ®Ìv;ï™“»ìş›Yë®5şÀOZnMôİ:®Wó/Êşr§OwÏ×şó-¤7^w¿ü¯?ßùû1³M¯¿»ÖëŞ6ùŞãşí[õæıW_W½ö¼Äöºëêß{Ó½ÿ¾ûı–¯ÿ¾êË½ï™»º¸Ÿß­Ú›®ÏOÊÄ;o¢rÿ¾z7œş;úıïşÛø6óûÿ}ò—7h=»{á¯ıÆ¾ÿï{dûvÿÃêmÿxpÛŸşU÷;%o}™Ç¿qÛöÍ\ÇnUıW·sÿ]wş}¾£úß|û÷Wxµí˜i«Îß<Í÷ôõŞuVwê=ùæ®ıuïq¨şó;u¹µßiş¨şf?“Ê¨w‹œ:íWçÿ|ó÷jöÙz?øïóG÷Tÿ»ï¿èë¾îo¾ÿ¾ïú~ÄîÛëÑUÿıeñgù'o¶æyËí]Ÿÿwø“Ysy²Û®–áñ7Úäo·ş~æïÁ½òâìøø¯õ¿ú{ë(óÎ0`‡ÿQçÏ+ÈpŸo½Ö¿ûeÆ¿şw|P6?7óŸqiDÜİÎ¸ÿWŞÓ¿÷‡å¥Tx	eşxÖŸlÆ›İÿéîyoyßÅo³ãrNÛûÉæïë{›ûl•şùûèÿÿºßº}ÚçoWÃû÷glÿ¥ÿëå·ˆıb¸„£ıÍQ˜ÏÃ÷ï¹n¹şßoß÷g?®šşÑ¿Ï{‡ßßÛGï§³¹ûüÏõú¢ÿßÓ}æñ¦ß;{œÚŞ÷_½÷ÿKâ[ >ıßÍQşZ_‘—­¯îkı=Ÿ6Íçú¿ÿ60Õ¿İ?Cª­?Áªm÷ë•B¿îßÚ1;ˆrO;/ÀtÆïÙ¤?óÏ¥Û¿ÒõÏyÕÃûkì'¿óşµİû~åÏŞıo¿üÿî¸•ÿMÆÒÜ¸Õÿßözâ~Ê‰ÖeÁY—çy¼wéóÍü#^¿Vgqïzíÿşõ_a]Ëız[÷ÿ¾åÿ5Ûæy®‹G$ıNjWéû+?$2ß0ñí/‘3S¶Ù}ŠÏËoåıëÎÒ¾~úpÿ˜›ıVwßú¾«Ì›Ú¶³iµËÇCç`ùÏğ]9»+Ö–Y]½½Ç}Ïş?Ÿ¶U|*~§¿ÿ{å¶òÏÇuú÷*ùu£ßxÙ.û¿ŞóëzÓóıV«7Ÿÿvû©;ü¯ãOıí¿ïÿm¶MØ«–í›æ¿ùüÍlï?ÿuëû&ÿ?ü-×åËïïòu_,·Ö”ñ¯üoÅ±ØßògüóŸåÏ·
¨ÿŞû!ÿÛÎt®ÿÿÿ½O°'9™ş»şNsÏğ‹r;ÿ›öï{ñ?<ı÷ÚŞ–~^§†Îhİÿ3ö[ÖİßúıùêÕûíû{§{÷Ù6ÉÌ´ëçÍûï×yGîßSï
ÚóVyÍ¿çê[}WœzšÿÿVŸï»|³¬AÒÖÉÿ÷Oï7|}…ˆïWkåó·×ÿôw!¾úp£õïìö~f÷¯ÿ«Rè¯Ù¿¿|}{;Ó5íïó"óM®1/ç¸óOÔßÿıèıĞwë›#wï£_>üs¤¹ÿÛèGĞtöï¾ë“Gıò_–ºi­ÿ³óJúÎÚöóBßFsØ9Ël1Úú!ÿŸÉ¾şıû•ù=ú?†¿ëó¿œıÿ÷×÷Gÿ¾(şı¿í[òı¿¿ıû§ş‘êsîú<Êqª£ÿ¯Ç^º·üÀßŞ×íÒ¥ÿûûv÷~dwûß¾¾ÚıVo¿Æ¿ûò^è÷zåïêĞí½ÚÚïz÷sØ?wÿıËÕ¿ÿoÿçñ½†¹>ÌİœÚÿÊİŸ{~ùOÅøz~·¾u]ÿîíá/Ûs©Áÿ¿ÿŞ¦¯ÿêÙ‡çÆú"šı]ëİ«/ÚŸ/õ›£û%ÿZ{Âô›¹vÂ:Uøí¯}N®rÿİ}é‹Ë‡šàèã¿g¿ÙëÛğmÈç'š=ß+®ÿ¡—o™úÉézãLıÔGÿäö]”{÷ïñşäıÕ_/“Ml³î{ÙüšéÿÿQû?ïgæoøœŸûs?ÿãÉÎ§?«{¿~éş³ıŞÙëí._ìİêõœŒ~Úıÿÿı?úÿİ·O³g¿pÅÿşŸáÿï¿ö~ó¿íowZ+Ï;§¯õ3¹®g‹ïÓ/şuşç:êZÛŞ¯èûÇëÑî»¸É›×üøşµù÷¥kûzúÏ}	vD@Èš¯äj·|ÏÙÑÿwŞ	_<Ü.¹¹÷§~ÿ¬Öšì/#ç}:ÛägìFëèoã7­åÏ‹ëŸö,¿ïmÜ/?»éï¢™ÛÍÏcúÿÿÜçÙqw÷õû}ì–SÿÿºæòoÛzÓê?«óÙÕÿ~7÷[ìWøÿïÛÜÃGÿñ×şŸî~o¡?Ÿ“ZëÏ–Æöß˜Vg¯ºşøqİ{Ìõ¨ßæäïÿİû›¢TêÈêrˆö¶?uj™wÏ`§J8qÿÏí¯¿.ûU$ó¤›>ñ†;¿”ş?)–‡ûÿ¯Îtò“Éå1Ú4ñÒö0ÿş¹m9ø»ù!x½é;‰¿ìëQıœGŞ'îÿ‡ç}Uz®/éûUÿU‡ûŸûÿ=¼Åı½|×ÿÿ·¾õo_ûû;®ıÿúûXkä„ıíºõ}‡>ÊÛÓõ´{ŞÁïsîİ=ñÃ›sŸı7×kş½ıd/¾_ç÷¤Ûşñõñ[ş5ÎEÁß?ŞzŸúw˜÷*û9ùsŞÛûœötcher.left,
        y: event.pageY - posCatcher.top
      };
    } else {
      posOffset = {
        x: event.offsetX,
        y: event.offsetY
      };
    }

    var dim = {
      c: Math.ceil(posOffset.x / PX_PER_EM) || 1,
      r: Math.ceil(posOffset.y / PX_PER_EM) || 1
    };

    $highlighted.css({ width: dim.c + 'em', height: dim.r + 'em' });
    $catcher.data('value', dim.c + 'x' + dim.r);

    if (3 < dim.c && dim.c < col) {
      $unhighlighted.css({ width: dim.c + 1 + 'em'});
    }

    if (3 < dim.r && dim.r < row) {
      $unhighlighted.css({ height: dim.r + 1 + 'em'});
    }

    $dimensionDisplay.html(dim.c + ' x ' + dim.r);
  };

  var tableDropdownButton = function (opt) {

    return buttonGroup([
      button({
        className: 'dropdown-toggle',
        contents: opt.title + ' ' + icon('note-icon-caret'),
        tooltip: opt.tooltip,
        data: {
          toggle: 'dropdown'
        }
      }),
      dropdown({
        className: 'note-table',
        items: [
          '<div class="note-dimension-picker">',
          '  <div class="note-dimension-picker-mousecatcher" data-event="insertTable" data-value="1x1"/>',
          '  <div class="note-dimension-picker-highlighted"/>',
          '  <div class="note-dimension-picker-unhighlighted"/>',
          '</div>',
          '<div class="note-dimension-display">1 x 1</div>'
        ].join('')
      })
    ], {
      callback: function ($node) {
        var $catcher = $node.find('.note-dimension-picker-mousecatcher');
        $catcher.css({
          width: opt.col + 'em',
          height: opt.row + 'em'
        })
        .mousedown(opt.itemClick)
        .mousemove(function (e) {
          tableMoveHandler(e, opt.col, opt.row);
        });
      }
    }).render();
  };

  var palette = renderer.create('<div class="note-color-palette"/>', function ($node, options) {
    var contents = [];
    for (var row = 0, rowSize = options.colors.length; row < rowSize; row++) {
      var eventName = options.eventName;
      var colors = options.colors[row];
      var buttons = [];
      for (var col = 0, colSize = colors.length; col < colSize; col++) {
        var color = colors[col];
        buttons.push([
          '<button type="button" class="note-btn note-color-btn"',
          'style="background-color:', color, '" ',
          'data-event="', eventName, '" ',
          'data-value="', color, '" ',
          'title="', color, '" ',
          'data-toggle="button" tabindex="-1"></button>'
        ].join(''));
      }
      contents.push('<div class="note-color-row">' + buttons.join('') + '</div>');
    }
    $node.html(contents.join(''));

    $node.find('.note-color-btn').each(function () {
      TooltipUI.create($(this));
    });

  });

  var colorDropdownButton = function (opt, type) {

    return buttonGroup({
      className: 'note-color',
      children: [
        button({
          className: 'note-current-color-button',
          contents: opt.title,
          tooltip: opt.lang.color.recent,
          click: opt.currentClick,
          callback: function ($button) {
            var $recentColor = $button.find('.note-recent-color');

            if (type !== 'foreColor') {
              $recentColor.css('background-color', '#FFFF00');
              $button.attr('data-backColor', '#FFFF00');
            }

          }
        }),
        button({
          className: 'dropdown-toggle',
          contents: icon('note-icon-caret'),
          tooltip: opt.lang.color.more,
          data: {
            toggle: 'dropdown'
          }
        }),
        dropdown({
          items: [
            '<div>',
            '<div class="note-btn-group btn-background-color">',
            '  <div class="note-palette-title">' + opt.lang.color.background + '</div>',
            '  <div>',
            '<button type="button" class="note-color-reset note-btn note-btn-block" ' +
            ' data-event="backColor" data-value="inherit">',
            opt.lang.color.transparent,
            '    </button>',
            '  </div>',
            '  <div class="note-holder" data-event="backColor"/>',
            '</div>',
            '<div class="note-btn-group btn-foreground-color">',
            '  <div class="note-palette-title">' + opt.lang.color.foreground + '</div>',
            '  <div>',
            '<button type="button" class="note-color-reset note-btn note-btn-block" ' +
            ' data-event="removeFormat" data-value="foreColor">',
            opt.lang.color.resetToDefault,
            '    </button>',
            '  </div>',
            '  <div class="note-holder" data-event="foreColor"/>',
            '</div>',
            '</div>'
          ].join(''),
          callback: function ($dropdown) {
            $dropdown.find('.note-holder').each(function () {
              var $holder = $(this);
              $holder.append(palette({
                colors: opt.colors,
                eventName: $holder.data('event')
              }).render());
            });

            if (type === 'fore') {
              $dropdown.find('.btn-background-color').hide();
              $dropdown.css({ 'min-width': '210px' });
            } else if (type === 'back') {
              $dropdown.find('.btn-foreground-color').hide();
              $dropdown.css({ 'min-width': '210px' });
            }
          },
          click: function (event) {
            var $button = $(event.target);
            var eventName = $button.data('event');
            var value = $button.data('value');

            if (eventName && value) {
              var key = eventName === 'backColor' ? 'background-color': 'color';
              var $color = $button.closest('.note-color').find('.note-recent-color');
              var $currentButton = $button.closest('.note-color').find('.note-current-color-button');

              $color.css(key, value);
              $currentButton.attr('data-' + eventName, value);

              if (type === 'fore') {
                opt.itemClick('foreColor', value);
              } else if (type === 'back') {
                opt.itemClick('backColor', value);
              } else {
                opt.itemClick(eventName, value);
              }
            }
          }
        })
      ]
    }).render();
  };

  var dialog = renderer.create('<div class="note-modal" tabindex="-1"/>', function ($node, options) {
    if (options.fade) {
      $node.addClass('fade');
    }
    $node.html([
      '  <div class="note-modal-content">',
      (options.title ?
      '    <div class="note-modal-header">' +
      '      <button type="button" class="close"><i class="note-icon-close"></i></button>' +
      '      <h4 class="note-modal-title">' + options.title + '</h4>' +
      '    </div>' : ''
      ),
      '    <div class="note-modal-body">' + options.body + '</div>',
      (options.footer ?
      '    <div class="note-modal-footer">' + options.footer + '</div>' : ''
      ),
      '  </div>'
    ].join(''));

    $node.data('modal', ModalUI.create($node, options));
  });

  var videoDialog = function (opt) {

    var body = '<div class="note-form-group">' +
      '<label class="note-form-label">' +
      opt.lang.video.url + ' <small class="text-muted">' +
      opt.lang.video.providers + '</small>' +
      '</label>' +
      '<input class="note-video-url note-input" type="text" />' +
      '</div>';
    var footer = [
      '<button type="button" href="#" class="note-btn note-btn-primary note-video-btn disabled" disabled>',
      opt.lang.video.insert,
      '</button>'
    ].join('');

    return dialog({
      title: opt.lang.video.insert,
      fade: opt.fade,
      body: body,
      footer: footer
    }).render();
  };

  var imageDialog = function (opt) {
    var body = '<div class="note-form-group note-group-select-from-files">' +
      '<label class="note-form-label">' + opt.lang.image.selectFromFiles + '</label>' +
      '<input class="note-note-image-input note-input" type="file" name="files" accept="image/*" multiple="multiple" />' +
      opt.imageLimitation +
      '</div>' +
      '<div class="note-form-group" style="overflow:auto;">' +
      '<label class="note-form-label">' + opt.lang.image.url + '</label>' +
      '<input class="note-image-url note-input" type="text" />' +
      '</div>';
    var footer = [
      '<button href="#" type="button" class="note-btn note-btn-primary note-btn-large note-image-btn disabled" disabled>',
      opt.lang.image.insert,
      '</button>'
    ].join('');

    return dialog({
      title: opt.lang.image.insert,
      fade: opt.fade,
      body: body,
      footer: footer
    }).render();
  };

  var linkDialog = function (opt) {
    var body = '<div class="note-form-group">' +
      '<label class="note-form-label">' + opt.lang.link.textToDisplay + '</label>' +
      '<input class="note-link-text note-input" type="text" />' +
      '</div>' +
      '<div class="note-form-group">' +
      '<label class="note-form-label">' + opt.lang.link.url + '</label>' +
      '<input class="note-link-url note-input" type="text" value="http://" />' +
      '</div>' +
      (!opt.disableLinkTarget ?
        '<div class="checkbox">' +
        '<label>' + '<input type="checkbox" checked> ' + opt.lang.link.openInNewWindow + '</label>' +
        '</div>' : ''
      );
    var footer = [
      '<button href="#" type="button" class="note-btn note-btn-primary note-link-btn disabled" disabled>',
      opt.lang.link.insert,
      '</button>'
    ].join('');

    return dialog({
      className: 'link-dialog',
      title: opt.lang.link.insert,
      fade: opt.fade,
      body: body,
      footer: footer
    }).render();
  };

  var popover = renderer.create([
    '<div class="note-popover bottom">',
    '  <div class="note-popover-arrow"/>',
    '  <div class="note-popover-content note-children-container"/>',
    '</div>'
  ].join(''), function ($node, options) {
    var direction = typeof options.direction !== 'undefined' ? options.direction : 'bottom';

    $node.addClass(direction).hide();

    if (options.hideArrow) {
      $node.find('.note-popover-arrow').hide();
    }
  });

  var checkbox = renderer.create('<div class="checkbox"></div>', function ($node, options) {
    $node.html([
      ' <label' + (options.id ? ' for="' + options.id + '"' : '') + '>',
      ' <input type="checkbox"' + (options.id ? ' id="' + options.id + '"' : ''),
      (options.checked ? ' checked' : '') + '/>',
      (options.text ? options.text : ''),
      '</label>'
    ].join(''));
  });

  var icon = function (iconClassName, tagName) {
    tagName = tagName || 'i';
    return '<' + tagName + ' class="' + iconClassName + '"/>';
  };

  var ui = {
    editor: editor,
    toolbar: toolbar,
    editingArea: editingArea,
    codable: codable,
    editable: editable,
    statusbar: statusbar,
    airEditor: airEditor,
    airEditable: airEditable,
    buttonGroup: buttonGroup,
    button: button,
    dropdown: dropdown,
    dropdownCheck: dropdownCheck,
    dropdownButton: dropdownButton,
    dropdownButtonContents: dropdownButtonContents,
    dropdownCheckButton: dropdownCheckButton,
    paragraphDropdownButton: paragraphDropdownButton,
    tableDropdownButton: tableDropdownButton,
    colorDropdownButton: colorDropdownButton,
    palette: palette,
    dialog: dialog,
    videoDialog: videoDialog,
    imageDialog: imageDialog,
    linkDialog: linkDialog,
    popover: popover,
    checkbox: checkbox,
    icon: icon,

    toggleBtn: function ($btn, isEnable) {
      $btn.toggleClass('disabled', !isEnable);
      $btn.attr('disabled', !isEnable);
    },

    toggleBtnActive: function ($btn, isActive) {
      $btn.toggleClass('active', isActive);
    },

    check: function ($dom, value) {
      $dom.find('.checked').removeClass('checked');
      $dom.find('[data-value="' + value + '"]').addClass('checked');
    },

    onDialogShown: function ($dialog, handler) {
      $dialog.one('note.modal.show', handler);
    },

    onDialogHidden: function ($dialog, handler) {
      $dialog.one('note.modal.hide', handler);
    },

    showDialog: function ($dialog) {
      $dialog.data('modal').show();
    },

    hideDialog: function ($dialog) {
      $dialog.data('modal').hide();
    },

    /**
     * get popover con=¾£NïèÌÏ÷‡TÍ}[›?üNæ_r¯2Ë¶ÊÒ¾ÖÎÛ¤ÄK¤î~óıùºügEÏ[c_Ëdíÿã»ÿÿ7šo‚ñğ7şKúÿ5—ÿLG
Åÿ½îwŞz]ş¬éßócéı|r{W½7œ^ÿ¬Ğç;İî¼÷×ô»OÑro3×â¿ú°<¿e®ÇÀrûıu,¦ı«kŸwßgÿö½¸2İÎŸo÷yoJ·ÿ÷ÿu&õñéùßıÅ÷Íz¥ı¶öOcïçÿ¯şÎÿecæçş/—ŸÿıúsvÿlçÛı«ø­wZ¿c}
ßóû½	çzvúıÓ‰ÇßİóÍûëöìşÛ?ëzÿ=üóùë×£o_÷K×ûªÏoÿßİ¼¿=Ûo½½óŞî}Ş/z“Ò›şıugÛÿº}ôÜ»wx³¹¼ÿñç#{Ó¼³/Ï¿¿hyÿm^¾Úÿ…ı]ıóøë¯÷í^÷ï¿ıü¿ûñÿïÚ¶İ¸nËŠËüÿhÿ²în'õ÷Ô/ôù·÷¿'³ìõ³w1=ğ;_Uş=‹‹é¿gÉöÏÓşQë~Òğ¾ÿSKOo®<·=åé{f/´ßjÙo|{ïì™¯Ö÷wgªşúuíŞÖÿ×‚±7~ÆŞ	/ªh‘g\¦´'æğ>û{nûû…<²ÿEïõïln“÷Õ¹Z§ırêÉGï)ñw&§u¸_şŒïß_ÛSşojœÿáúqrÕïú¿¿g7Ÿ~cÏsæû}ñú¿î¹«¿Ú×Ëù·‡äş/œşõ¿µY;ıı[úÂÇ£ósÎşıü°ßÏsyz¿nşÿ‘¿²_ÿ=ö¿¾_7:í?f¿èvçéóË·µ{j½/‘öóû_ÕµéÿöûzøïëŞç¦õõÇ'Ÿ‘¯#ïµÃÿÿÅ<óğĞïë1ì5ùÉÇ§‹gÿ÷NÛŞ¾~õ‹ëœ	cî¯èş¶¿©¬ú{ò+á¯/wz¯Üêæ÷ÆÛ´NşŞ.óó«;Ør»FóéZû|ÛÁ·?½¼ºÿÿoE³nz71ïrîï”ö¢ö»ãÉõ¼›Yv¨Y>ï+½T]}ÛGÿwü×ÍÕÊŸõ/)EßOÙù¾ôşJ}MGkü¬·›ŒóOÿÛ¤_•Îšê³õímç¼Ø÷Ú¬÷Óÿ÷çİ÷¿{¯¾ñîú]k¸øü§6šÛ*ùmşÙ¹Òv~ÓÁÿ¬¿óß_ÿîß_¦fá‡¿m¿ÙW]·á2&çışŞÿ×êşùÙ\ÿwé»ü|£û‡Ïï_çÜ¯÷×¾ônÿ[ş
ÿîı³Ïèúôowû×¸ë^ÿÿ»XyüíÇé7W÷{ô¤L®¾Ô·ïß)?KÅõë>ÜìïÛßí_ï¿ş®gô_w÷ß?ÎşãñKÏšÇ}']íİÿÛúfšıVŸmÆ×±Oİ¿¥}2¯È–glÿN}­Y«ÿê¾:§¼¿Ÿ‡í[9ó—ôİŸgÕ©£úå]~ö«Òµúôîû~º‡dúÆ°ı¬_ïqúìuä³Íäßó=Ê¡Şÿ+ÏùÿÑï6Ùu??{Æ{¸Jc?n¿Âñ]úÛÿ7¿îú?ı~{kà¹w…Üï¹ûX÷ç­Úws½«*ŞÎöøı·ıü—ÿÏ§÷M¿˜“ël”S‡úş_QÓÄş!ørŞ¯û7s¯ß¯{ô˜ù™G'Å©î¡şÜ9ÿßÅyéÇæ~}%«Âİ}ò‰]|iïóœøÇË¼?Û>Mû–ÎE¦Ö×õìÃ¶µÃoxŸ·ëõ_ù£şûß¶_MŞûgøVç=µú<¿™­S¿ñï[•?·r·ï-=?¹¸ußm¿ÿ{¶Û±Û½Û¿ßß§ÿïñ»×Xç©ñzÃÓ.Êÿ­*7‹{öç¯øÎeŸò/¿WsıÿşËİó§ûæ«çîÁÿçxçÿ÷¾\ûÒ:µıJ—¿õ8ğg÷íÆöïë“b?õ·×iùç9Û¯‘“K¯›—<ı‰ö+Ë7­³rRëo]î¯Õİ[o'ûÎÆfÿ¥ùıûvÿz´½/çÜÛşûÇ
;º]O§»u=¹¯>¿_á[+ÿÿ7g·¶w›»?÷CâŸ{âüå;Åö‡ÿêİ×k2©.uŸú3}¾f+íšãçS÷sDoãñ¸×¡ıßzsş†÷ÈıûÔsoÛü¯óíÛ4ªGïÏí÷¾ÿûì/³ÿ~;İ/÷}ş¾ÿüı«ì¿Ö‹Îıÿ²âşN·ºï×[»Wî½¶ëÈÿØµæß«ş÷onuxûí¯_ıw¿ïóÇİ÷]¯-Ç~¾Tü¾_Ovş³){v³¿{o]?ûój{d_e÷RËI—œÉùs¿¹»Îçáëk—é¾ßûw×şûÇÛÛõYí§›÷ãòúzÏºÕ¾«´ØÍ*Q¹+mşû*şWÏrÿğÙëûëúpgwJgŞ½w®ìÙëx¿³Õ«ùÜ=ÑíÆæ–¿n{å('ï*ÿAlÆ·ğW-ÕŸ×ÿ¯’©Äİ.·ŠGÿmØªşºçKäÊ»-ÅJôí¿ŞÛ?,şıÿek÷Ò~ßûúâ•O[™çw÷ñdîh-ò¿O6ú¿vì—å;ˆe«"fU÷ÿÁóº×ñoşÒ=¾Ìû®ŞràííØTï«|Gz­ûÆ×»Ñ¿£S|O¹¿=ãœöë[¾{ó,|}°îÕ¿ú1{¼ëãßúÏn|gÿëß÷KZuº¾°£ı—éş=_ÿ×îŞwßÿ«÷û÷Ş©ıæ¼ûĞ¿aÿñ¦sş6ó­W¶>ó¹}yVû~Û}oµqçÂ{;É[õwïÃŞVÚ?ßÏåó?ôíJh£Ÿßµ}“3¿¿İ-;X;ï:íşî>²?»}K¦İk_™bòœä_şÜ÷¯¹ÆÖûúŞáİŞ{Z·>µ~ì¾*ı’¿ÖŞmî»S+gœîŸŒ:p†û¨ÙÔ©²6İçØœæ{yı¾‚óZÛËIï]G:sÔOßï×Â_Wãn•4Bå½·‹ïVGÇÙ›í.şÿwã©n÷½¹NZòW¡şœóêîû»Ëyç£ûn}]ö›ÿùöÿ½ş_ïÍÕ÷U'çÔ7äß÷EÿzıÛÿ¶íyÿÓkÏüøkïëõüòù×[ßv¹ìïmÍ´yËËF-ş¿KU*Z»¿ô¼n;šÿ›Ôï]î{ûí¾ï¿É@óı'no¶õOIÑşÑş»wo:İ«¯ïıïö/;ûõŞïÿıX¿{ŸÑ÷¯ı¹şêÏİ±±¯wŞïÛ>İÏ»ÛÓeï;ÿóèÿÛëÿhôØ|ï?Ï|qmÈööú¿^ÿïß²kÚœıƒÍßŸn­'ŞÕõß/‹;íÏï4zÓ¨¿ÿÕmQ¯pIŸçOeüƒı÷ïcÿ}äÓûubócÏµ]La†ß_~"ÿİjÛ§jyê›Úÿógóïã~ùß£5?ÿ×é}İc)?×nØ}¥]_öı‚ûßôGy¯¿/õ~<ÓmÓı×´¶Îûw¸ß÷¾¢¾ló`wó«³ı‘ßy\ß°¡¢°İßİÖûûúåÛó—ûõÚ®Ğ´¬¯¿ó×í³~~óÿî9ÿıñ3ìıì~s\ÑÿÚ?ÿ÷ï•sı»¼¿gêçyOéİãâşº~ÿ›gíÑş??Ïÿ}?àõ·ûuÖıª«çí—ğ\ûöş²oÕû§ûİø’®Í¬»±ûöÏ>}¯½g?ÁäÎş>¥=+ìæ—é·¿®'ÿx&ûßY¹¿oK,Ë;îı‡âïİWãŞ³ô¿vz·¿ùÑî»òù;¾Æ{ş»{âË×5µÓsóc<L£]ou1û­rÓu÷_OOw­ïc™ïîÏô}Ÿâ?Û¾I}coÿ·Ô}Eã|Œ3ÿĞìï{_™·3—î¾ÍıŸŸùğ‘Ü¿_çÿòıÎ=ºvç?_Ÿñ¿ŸÌ×Çİÿwn¿ÏúNoÙ»­·ï/×Ì¾¸²‹İ¶¢µòv«¯¼ZOg?[û¾ºş#›—Á/·Şûfl`²NúııÕ=¯ŸóÏÍ.ÿ'w/ÿÛ\{ŞÌıßó?Ñ§ùf¿µ÷st[\CÅ¾úsÎşù›{{»ÿş·;íïûü>Ÿ”?á¿ílßÅj¹Ë—v>şÏ¼º½ş¿ûü<êçŸûıë¯~İßí‡øÓ÷ğ¿º¼ıó¯Që}ÿ÷ëí»ù·ó¾/·şıÏn?…ù{î¼w¿o‹ç3·oÿ={«¬¿½ÿ[[íï?ÿØà/VßûÖåoç}êºÓÿßÕ?¬uíçoÍ8½ùç¶¿ô·Ùd†ÇÇWşêàÇòùãùó<¿°Üö³Õæu|[ïÕ/û“>ÿûğ[¤´Ãİ,_wµÇ×gÏ~sN>·ŸöıÇÌ¿µü˜}kë#ÈDWf÷XÛß÷]—ùş¬A+üßzóßõ~¿üİş=ÏşÛç¯=øñ–gß^óûjô÷û©×]•½=;Ïï{s¾wİç¯ß~õ¿í¾ûÎ|›ÿ¯ùıû°]ş“Õöş3ÿÿktşº²gïş•Şöÿ:»ıØı*«ô¼_Á~ïëX»è›¿_÷ız'ÿ]ó¯¶ê[œíô¹¿ËßYÿößvWßYùÏÎÿŞßyıoãm§sl³åû¿ü‡>ıµ&ÿ¯âÆº/êÏïÍ÷øã»ıÆÇcÿœûSõŞ“7¯ÿyÓ÷ŞG[Ú¯ûwÿx÷ßÑÆzÊâšìşª:ÇßlÿÃ¯øÿsÜö_.®¯ï÷Ÿ›Û×íµôûås¹`«ÿşÇúXòàïïZİn•ëVÇÓk¥»Şi/ıiJä­?¶ÿ[¿ßöçÏÿú/¾~ò—Óÿ×gsNòæo¾ØMºş“Ö{«{7õÚyş}o>‹~û»ÿeşßî^}ÆÍ»ßê~Ëß¿Y·Xó¥ÿ~Kÿç­ÒMão?µ}ãOß¯}³[~ü›:e³öŞ»ŞÂ¿øÇŞxœÿ¾Ÿ{áú÷Ì+ëï÷¾?Û¯Æ{çÎî¿~š¨>VÙ¥çûÊ3~-û•ûò¿»Ús~i‘ïÏï5¿ßöùÎò_6"oÓÿŞşõãoŸÿ9¾·ĞsÃ¿·/²§¿÷ë¹´¶ƒ~|™öÏ”ú­û~¾÷S½¼ÙÏµ·ÿæÿs¿ÿx%ïû¦»ô·<?µ£{½®Ì÷ïyÎo?¯­áİÃ²şvhÛ8ÿyŸx2İüW=ñ\üõä:kX{}‡íÇÓår¸ÕµûØ×>ŒmµOhşixŸàñ÷Kæ|ç·_ÛÉºÍ^‡ïùş§õ×÷ıõ²{âşÿöïóÿ™ïû}û¹Á_×ìÒ?eTçÿnõIò6×¿W{Ç¾òxõö‚æ¡†ÙıNç¿g»ÿÉÿíòøûİ;—ˆz·{#Léöúšÿë7¿ÿWÿÏíßu÷Rû­}}ı_voüí¸?¿qşãÿ.»ÿoŸçığÏ®+u¼~ïÑíÿ>ÿë7uû_OîÿãóÿGş¯¿äôÛó×~*^åõûÛç~ÑuşwÊÅÿO¸ßÚşìõ¶í×³mïi4ÿúÛğèY½¡—ûïÕ5û»µ9ÙıÅñå;ßê:wÑ½ó÷½ßù½us÷ß«¿ß´¿}õíøßş·İniï[÷¹¹úk/ıÍ¾çoçà¸µ~ùßhR8M@„ÀD		 ’Ú	 I‚((CN‚ „ P(T¡BJ4D:BX ¸Ğ‚¢‰CX‹
¢ŒH‰à0
†!H—(¹Œ!`h@€9!e„9@‚C ‘ÂBf¡ñ…à †Ëÿû;÷}ÖŞª½B}[Ÿ¥/÷è®¿<¦ïØQÇç€ÖxÄ÷ïûçiı}İO=3ßûïİ÷·icÿb×'ùjÚ?÷Âo¹y»&—Ú×îŸ;Ïón[(6åşjşı-/}sùt·í¶+9g×Kşı&_uåıÅEŸı¹¨ïš×¿8·êí,uøğÂøçÿWÜ÷ò»ş»ÛFÕXÓ?õb=Ææüf.6Y‚ÛK÷ØŸœLæñùøS÷]fzıñ[7éöåİ­*ç÷ö]ÿä¿ö¤{ÆßPç÷§½}°—÷Ï¯‹tï^ß/{]uIõ¯ë3ï[íıİê‰íÇò¹Õë¿‹ÉË‰³glÃßÀ h¬
`T3<êTÂÀ	‡I(ÈH# ¢,¢İdI À@À(¡‘B ˆ	ÂaâÉ0 5Za0@à4 Õc  0Xa(
4 „H.¡áˆ 4
ÏêÀ  c±Œ  ÀH	„$€ˆ…&»$ƒDŒ©uÑ˜'®sÆİß/ŞµÌŒéNÛı×j•ı–°ßüı«+÷¥9õŞ}gÃß^rò“=ï´AW}Ş„»k£ùût]§²w‹Ö?½ı¾½«üıû_»PÅı¸Fµöş÷Êí2ï8İ«Üs]‘¶ıDwªÇ·ÿşíûÿNvÛQıÿ#×Ùûö÷¹;˜: "°(Hh‚‚riAOˆ3ËJ Ä@k9	!À‘é de‡Ä8‚$ìyT¢@*_-U¾Ù!°èì	ˆS` A…"Àh" šÄáØè ©`j€€D Ñ¿Á’^ „À2 È `è`ÀPÀ)’¨È	a•8«J  ÌN ğ “ˆ"`h" 	  UA¡L :ä"R˜B &"„-E[Ò•@À!’ Š8¡T€d‡8' A:œ@ F@ÁÀ j 4¬FE4°ÇñCôXp\ş÷€o/‡£ì33×·^‹¸¯Góÿç÷~ˆ÷¦Ç+«;~¬àgïÍıò‘íyLİ?ìù«İúØùß?µ©²î6»%+óÖ"Uäe¥°¼.ï‹:´Ñå¹'I&ó÷Ls»”§şagO÷=äİ^"»s[ì3,ãËóŞ+ÿÊ¼»Ó÷ r¸Eß‹€AœW# 8 ”€š¡¢0*øƒ `EÈàr@&`£Q O@P(ñÚç“$Ò(õ¢ä Ô„c à‡8‡DF (( D¤&`+A¨<éR¤„Pf7‚Êà‰Q Àå…—Á"!B÷®y¾‚‡'¬–î†#'D÷·:Všæÿ<ÿ-ó¯-y/ıºu+æX‹7YŸï4ÿÑÃ½Ôcäâ{ÿÕıŞõv­ö×h÷¶òoë/ıW»¸E^,öŸå]q×ÿÿŠOÎ»²{¾}è÷5c+fşë…ñ®Nşë{]™óÙûæO»Ÿ–´Ÿ»±Ënßû¨šİ®0¿ê*Ş­LvÙS{Û~µÍ±ÿÇü÷\M§÷?vŒÿQ{7TçªzÿËçß÷µï´Á
ß;ÛÙß×;×rïÿXûÃ_<˜äÚIæÃû]îü÷]GÛûÌV¶ÛßË“ıßWâyßİNÿíÒ†Ş\;½­IÿöÖªû¿@À*!™"T¨…²u@@  ¨ 1.<Â"ô–NÂ€ àËb )uIÀÃ#$À`‰ĞäB	!JœT¦ˆ‚b%Œ	gÕ¨	eIX €,` €‰SŒ€"‹DY‘‹`"‚JL@  `Œ¶ê P"éêûñ~kò3ÖŞÎê¶yÁ—C^0÷]½Os]ò«¯ûŞ·¤z»"cãŞ™ûÍö¿íçsY[—+ä+l‰±ÙydÏZù<gçj—¿Ş÷à½»½vPõWÓ'í%¿{ŸëÁü3{±O—,oLîõ7ö•ÖqïXu'Í7[Ì¤ÀàQ°JEÀ ‰@ú h€„@:	ar4ü*ŠBšƒ%ÀÓˆ Xl&(°Ä b
H ˜Å^z.@f"<”šĞ ŒTBbQ	ÂDD ”‚D"’¡D´ u®P4IF iÊ €ĞA)&H€L	i†'lE Í‘ÌÒ0  aPH¨Ñ)1” 4‡$ıX4dJ(  
	\%¸ğÚ İÒ¡8E! %°È02@_€rH	ÁÒeÅG‚\ÖÈ   L–€‚E³NáSÀ%*uĞ @­ŞÇI·¼k{¸ã,øvÉ}—hgÖ‚?ïu7–ÿ¨Ÿ²·÷å}DLXwº›¼e~sõşóÿ;ïT¿£ğ÷­ıäeùg“sd?ï·Ñ›·ªûåÄ¿?9ÿÚºL$}ïƒ?Hñ—ß½³2>_7ß¿„û7¦Ôÿœsç¾×»Úÿ¹-¯±n$ØFæ ¤‡&!EQ`‡ 3„H¶!)€¨÷.Bˆâ˜Pˆf…^ƒ6 €Ñ'ø*¼7a“PRÕÖ½!b¶Á €Õ‹ !“)€t"QĞ2%P @€HÊJJ
ÇÈ¢x'HŸ„D Æ«×vq1Õ_r¹¯?Ï]^;Q¶?;SÊÅû—ªÍ»á/µÇ–©íûÏxÖ>ççıw}÷÷[ïín.¯nÕÅöÙ‰™äJ)’İÕ­Öf'ä®Ûš”Ißöİ¶³ŞÅqßK¼Çs×ŸÿvÜ¯ÿñêGû/‹-Êó²ÁÿDëîò%Ôªß~¹ûMúõp­Ğ‹¸¿“¿róÅşmO:xM®¯VÍ©ºFğ~ó~*?šŞğınÎèÇ–ïÃ=åíc
İÒú<úy%«ßÓ²Yı_üı¶sIğ¼+ş]ñÛødkj¥kf¶)çÓ_ô[T#·nÉl»?4@ 8¢(@-g€ƒ Ä=6² oDh„÷ Å1 H*QC$¤³  V`à E œ!p@0–\ ˆ b|VG ä((¤0`š…TuBˆˆ ¤	~ !  $‚À9q ^¸­ ƒA	GÃJ ÷÷»ÖıëŒ_—»fåĞgÄ~åÇ·!zî÷îá}û=<@gØ«ŸJØÔ¿ãs0ãıè¿ÿìûåîÅ_Å›õ÷÷¥µsøú?ŠG¹ÊŸâ,Éş%Ç¿Öjû_¶èâ3€÷·«Änİí§¿i}ôø=ÁÏ¼ÂİÕ{Éú™Ç@bp„NDÀÈÀ ¡ÄMG€P’¤ˆ ƒ‘”P˜ B!ÀK5d ©r @:(N`&cDA °) •D"Ä2-RyP#ƒ)Ñ™	a($l‰xY
Bëˆr€:MH˜‚ƒ €%Hnp" ¢¸ °™<ŒšÈj¬Ê‰šãP€F
4
¦¹Eİ<‘@DHYÇ  !@EüCÑ“…Ğu‡A¼\ °„Ş¬)Dá Y# À !.R"	@%Ò bùB<F¢ÔNÃœœ£ˆ 3ZÁ "!÷!$eßóÏIùÖ«ûÿú}o?û[O¼şİë‘ÿ;Ÿ÷ušO¿wŠ¹{úóíàçñ¦·Ğ†./?ñÚßnï‰qÏïwæå°vÏ´Yï}Ô—~ºù]vJãw{Owô‚EÖL·or­¹TÁ¬çïxı¿mLC¦32ÿ¤½ïMüÿOYŸ*Úqíƒúş0.„	€ğd” upãÂjJ1é0FEÉ`z1 EÎ€€²(ğ…"TÁÃJxˆi„›A d(„¦’áP	ÄhHH« 2. ˆ¤Ïh*`ÈJ4€¨ (#˜€®’D%éE’ ü3¥¨‚‡5€L&N@€!`ş—Ec¢ŞmZ„ËÛ½74è‹ö£ÿS`^×ó¸…"ß«Ş=½ÏµçòÙú×ôÎîÎçÿwˆ´Ôn†¶™×ïùª¦ı¶Usâ•j¯ñçÛ 9‡›uÀ³ó„ö0~yî¾æ#íû=:ı2çç¿ÏÏéóoçû{I>úÏsÿŸRÕ5¼]Ûö@ˆtŸMt{+şXÿK/\DÅş.oöÉæû*õ[Ÿ«'~ÿV³ÿ÷ó÷¦âë:µëyw{Û«ÕÿØ!ŸÁœïÿïõó£]ÕîTY:î¶Uoİƒ¿ïÖ­ÙG§òEo¼_À¸¿?Ã½g¯‹iyÎ·yø¥—ºùïô~Ğ·Õêy; ä
Š‘²úˆ”W ¨¤L ( ‚A@8ˆ€°tH‡ pª„B+@!d0“1j2ÆK9ÀªÛÑ²8RÒ T²
Ö"Ä„t0Á B"àP $¥‰„@” PAØ‚‚Ğßw\îØiÑ©·?A>ï‹¥»m¼µ·¯ú¿ÿN¦úUŸ÷²Vòó_h+_{µíyôı?ûS3ù•|~E~ßYïë3àknÛ{¦©¶“Ô§Ë7ëÛ]îÂ¶¢j/|5÷ˆYEŸ%æ4+hºîçşû%\rÚ#S™×Ê9Øç¯ëüïÍÇˆPDQ ì°kàqJ„
‹Ó’@(D`Œg " – P!e€!¦IPM €“?pp.à^ …""O !€P¤ ¬ `D` B'!-È£ˆB0„DN¬Ä€1Rx8Dq@¤(a!Š,„ÔD€¶ªXnx"‚8ŒD”‡ˆ`  Î Kˆ-%‡P…éhL,¹€^Ó™ˆ¡æ„ Æ©4€…PIË# Ê`Q O° D‰æ…$1(°¤A™í†„<< 
	2‘”Q“’9ä¿Í×ä½}ôîü³[ñ»ŞÏ‘Ï<Õ{›ö×“¹H§uCÔnD?èî´i¾½XğÏö•ŸîËºx³\{=}ûM´K&S•5$?oOüÊï¿?`s¾ü_µîøéGİY›vŞGòÿ´Ï9­Ô¤Ïîş4UëöÁ¥ÿzëó#¯Cû _Û»ñ5Õ½W_ãon (textRange, isStart) {
      var container = textRange.parentElement(), offset;
  
      var tester = document.body.createTextRange(), prevContainer;
      var childNodes = list.from(container.childNodes);
      for (offset = 0; offset < childNodes.length; offset++) {
        if (dom.isText(childNodes[offset])) {
          continue;
        }
        tester.moveToElementText(childNodes[offset]);
        if (tester.compareEndPoints('StartToStart', textRange) >= 0) {
          break;
        }
        prevContainer = childNodes[offset];
      }
  
      if (offset !== 0 && dom.isText(childNodes[offset - 1])) {
        var textRangeStart = document.body.createTextRange(), curTextNode = null;
        textRangeStart.moveToElementText(prevContainer || container);
        textRangeStart.collapse(!prevContainer);
        curTextNode = prevContainer ? prevContainer.nextSibling : container.firstChild;
  
        var pointTester = textRange.duplicate();
        pointTester.setEndPoint('StartToStart', textRangeStart);
        var textCount = pointTester.text.replace(/[\r\n]/g, '').length;
  
        while (textCount > curTextNode.nodeValue.length && curTextNode.nextSibling) {
          textCount -= curTextNode.nodeValue.length;
          curTextNode = curTextNode.nextSibling;
        }
  
        /* jshint ignore:start */
        var dummy = curTextNode.nodeValue; // enforce IE to re-reference curTextNode, hack
        /* jshint ignore:end */
  
        if (isStart && curTextNode.nextSibling && dom.isText(curTextNode.nextSibling) &&
            textCount === curTextNode.nodeValue.length) {
          textCount -= curTextNode.nodeValue.length;
          curTextNode = curTextNode.nextSibling;
        }
  
        container = curTextNode;
        offset = textCount;
      }
  
      return {
        cont: container,
        offset: offset
      };
    };
    
    /**
     * return TextRange from boundary point (inspired by google closure-library)
     * @param {BoundaryPoint} point
     * @return {TextRange}
     */
    var pointToTextRange = function (point) {
      var textRangeInfo = function (container, offset) {
        var node, isCollapseToStart;
  
        if (dom.isText(container)) {
          var prevTextNodes = dom.listPrev(container, func.not(dom.isText));
          var prevContainer = list.last(prevTextNodes).previousSibling;
          node =  prevContainer || container.parentNode;
          offset += list.sum(list.tail(prevTextNodes), dom.nodeLength);
          isCollapseToStart = !prevContainer;
        } else {
          node = container.childNodes[offset] || container;
          if (dom.isText(node)) {
            return textRangeInfo(node, 0);
          }
  
          offset = 0;
          isCollapseToStart = false;
        }
  
        return {
          node: node,
          collapseToStart: isCollapseToStart,
          offset: offset
        };
      };
  
      var textRange = document.body.createTextRange();
      var info = textRangeInfo(point.node, point.offset);
  
      textRange.moveToElementText(info.node);
      textRange.collapse(info.collapseToStart);
      textRange.moveStart('character', info.offset);
      return textRange;
    };
    
    /**
     * Wrapped Range
     *
     * @constructor
     * @param {Node} sc - start container
     * @param {Number} so - start offset
     * @param {Node} ec - end container
     * @param {Number} eo - end offset
     */
    var WrappedRange = function (sc, so, ec, eo) {
      this.sc = sc;
      this.so = so;
      this.ec = ec;
      this.eo = eo;
  
      // nativeRange: get nativeRange from sc, so, ec, eo
      var nativeRange = function () {
        if (agent.isW3CRangeSupport) {
          var w3cRange = document.createRange();
          w3cRange.setStart(sc, so);
          w3cRange.setEnd(ec, eo);

          return w3cRange;
        } else {
          var textRange = pointToTextRange({
            node: sc,
            offset: so
          });

          textRange.setEndPoint('EndToEnd', pointToTextRange({
            node: ec,
            offset: eo
          }));

          return textRange;
        }
      };

      this.getPoints = function () {
        return {
          sc: sc,
          so: so,
          ec: ec,
          eo: eo
        };
      };

      this.getStartPoint = function () {
        return {
          node: sc,
          offset: so
        };
      };

      this.getEndPoint = function () {
        return {
          node: ec,
          offset: eo
        };
      };

      /**
       * select update visible range
       */
      this.select = function () {
        var nativeRng = nativeRange();
        if (agent.isW3CRangeSupport) {
          var selection = document.getSelection();
          if (selection.rangeCount > 0) {
            selection.removeAllRanges();
          }
          selection.addRange(nativeRng);
        } else {
          nativeRng.select();
        }
        
        return this;
      };

      /**
       * Moves the scrollbar to start container(sc) of current range
       *
       * @return {WrappedRange}
       */
      this.scrollIntoView = function (container) {
        var height = $(container).height();
        if (container.scrollTop + height < this.sc.offsetTop) {
          container.scrollTop += Math.abs(container.scrollTop + height - this.sc.offsetTop);
        }

        return this;
      };

      /**
       * @return {WrappedRange}
       */
      this.normalize = function () {

        /**
         * @param {BoundaryPoint} point
         * @param {Boolean} isLeftToRight
         * @return {BoundaryPoint}
         */
        var getVisiblePoint = function (point, isLeftToRight) {
          if ((dom.isVisiblePoint(point) && !dom.isEdgePoint(point)) ||
              (dom.isVisiblePoint(point) && dom.isRightEdgePoint(point) && !isLeftToRight) ||
              (dom.isVisiblePoint(point) && dom.isLeftEdgePoint(point) && isLeftToRight) ||
              (dom.isVisiblePoint(point) && dom.isBlock(point.node) && dom.isEmpty(point.node))) {
            return point;
          }

          // point on block's edge
          var block = dom.ancestor(point.node, dom.isBlock);
          if (((dom.isLeftEdgePointOf(point, block) || dom.isVoid(dom.prevPoint(point).node)) && !isLeftToRight) ||
              ((dom.isRightEdgePointOf(point, block) || dom.isVoid(dom.nextPoint(point).node)) && isLeftToRight)) {

            // returns point already on visible point
            if (dom.isVisiblePoint(point)) {
              return point;
            }
            // reverse direction 
            isLeftToRight = !isLeftToRight;
          }

          var nextPoint = isLeftToRight ? dom.nextPointUntil(dom.nextPoint(point), dom.isVisiblePoint) :
                                          dom.prevPointUntil(dom.prevPoint(point), dom.isVisiblePoint);
          return nextPoint || point;
        };

        var endPoint = getVisiblePoint(this.getEndPoint(), false);
        var startPoint = this.isCollapsed() ? endPoint : getVisiblePoint(this.getStartPoint(), true);

        return new WrappedRange(
          startPoint.node,
          startPoint.offset,
          endPoint.node,
          endPoint.offset
        );
      };

      /**
       * returns matched nodes on range
       *
       * @param {Function} [pred] - predicate function
       * @param {Object} [options]
       * @param {Boolean} [options.includeAncestor]
       * @param {Boolean} [options.fullyContains]
       * @return {Node[]}
       */
      this.nodes = function (pred, options) {
        pred = pred || func.ok;

        var includeAncestor = options && options.includeAncestor;
        var fullyContains = options && options.fullyContains;

        // TODO compare points and sort
        var startPoint = this.getStartPoint();
        var endPoint = this.getEndPoint();

        var nodes = [];
        var leftEdgeNodes = [];

        dom.walkPoint(startPoint, endPoint, function (point) {
          if (dom.isEditable(point.node)) {
            return;
          }

          var node;
          if (fullyContains) {
            if (dom.isLeftEdgePoint(point)) {
              lenA!šC•
IEÀL$@$4Ú§ D.LÆ%¡šˆ¶hN{
€E	Q,L€BŒµnµ`QC @ìĞcèH.„Q(‹‚` æC)8'‡*@§¬Õ¡Q5É`@Ò›Á 9UÃ Bã G$s …Ã¢ È‘À¡`šbà,`¤À0PºId‚pHFAÊIB @E€dÀˆQ¡r†$‚Ğ›2[+
Ì	‰´‚*dÀƒìÁ–€¡3<EÕ8€ÙDÄ”ì±[ñ`È"œQ2é!Àa÷C·Háø,
"‚2ÊÔÌC€H`)XÎAD „ÚäHU™`”¨€¡!Ea ^ğFŠ°V˜	Ê À^ŒJ¨ŠA'ÊJâH$xÑ"BXb@d‡á h $!XPA »C$, „€  ¿XhØÙ‰ ƒc
0„ƒYàäÜ‰ÅG°"@,G!…Ád`mÑ¸`¨3…(€p
T°ÈF!Eh+€uP	  $@1 „	t¡$ÓÀBÅÄÀ\†‰É?õK v­VÉí$PHUeAj£¨*ÆæA	©èe ‡ÅAMG‘–Ÿ	‘İ·²¢„`4B KŞ†b†!!hœP š…hpâ1@Ä–!1ãf
Ø­ ¸XÔÀÖ³¦ÌĞè(Ÿ„"$ñ€
„dêgaàg×F± ‰hçQÁà…4pYcN   @nP
…Â€Hhh¨B*!f 	ÖG Ìˆ!	Q±#´b„ ”c:xZ Ùf¬d” È•íxD€yÒä›°Æ¦Ä#BÄ«›ˆ „~0rz+Z0Ø3|sD¤=XÚhQ¡0¼à·ëd8„|ÈdšIRÿ!P0]¸X¢ÜB§‹Æ…ÀˆRVN-™– A ddAÂÓ¤Çeİ“mZ¹œE¡ RRlk’p‚á !D)Œ<A×(·SdÇÏ(È1e ¦	¸rnPL(&‚Œ€’ vnÏğË>b†”Ğ	¬¥	iu!l¡ˆÆ2BÄ‡QbˆÃm1DN‘–@B{Š`€5›T¤€“a !ˆ²d@
„ HNH †TÅP
b_È6Ê@B¦†Â± €h`±Å€D EÎ†ºTDˆÎ'!ƒ „Â	 0	&Ccª8¯°`“Ø¥$h²ÚdÃ „Z"…H*µ1 BòXå,<B0\bc 
Áá"8o.7šBVp¡ EõÑ(H8‚áA”0R …ÚE|ˆ•>¤2ÄÔ 
ÀÄ«A”µÔï‚PiÃşu¯vC¶
ƒàñV`ÆĞ&ã¡×ÒÁSQPĞDÈ0ƒˆ´Oªlèˆ‚¥b
@&ƒda Ş@‰° °§FFÄd¦” ì‰$°0… -@%|ÎÆ€IÀ6ä#ğ‚ P†ù0R`ÙÈp	A$±pL  Hˆ‹tˆF€HDg'1 @D„DP§à(  ´Œˆ‘` @Ù# ,i	L‚ˆ"ôLˆ–Ò5A…"g!”(   €TFDDLeÆá¹¦ = <ú¡Á„çĞ”!°0X‘ /d ( *R Hˆ8@ŒŠiü €‰¤5 Í‰	hÅñ4JPèHÊ @x‚|\àÚd@4ñ0‚‹;"Mcj~¾egÏF°#äNÊf½Q#4© "K©ŞCà0T‡*ˆ)¼Ûàx#Õ D’~hRd†PÈ%Š­*±b‡0d 0ÔÒ RP#rb$p% åƒ²V‚¸”–,2	&F ‚&€$ ĞH)(€l<€ ±€b!u (Pdµ)‰à©\",!Œ%
( (‚
‰qÛhĞŒF‘”ŒE}(‚¨PÀh ç,HMBPe`wÄ8²hRê›"
NA(”§C Zp‹h<´\)‡¥$!z O«h°‘ˆ÷¥!„šb”a4Q
Tl`aáºÏ(Â@@- ‰€‡UU°K%Øˆšü.@˜ûİvr#M Øl^”%ohT2f¬EAhƒ”â¡ ğ€h*p»Ğ0E(^g©†J9hJÉ
Å´jÈr²iœ#¦‹$a´Õ
É €ˆ‚²Ï¡Ó( DhKW%0ˆ	¥T4&˜e7P
Â	±7z€ y‘‚Ù×jtl´H ”P1ş˜(VÇ![OÈÊâÓ”ÚHècƒq`q&ÁP³A¤ À<I$Ä0ÀR2Œ  J'”¼P0A8I²‚À %Ò@œ 
!$@²5Ø@€B˜dÌ -Á. À$„!ˆÀb—âcTb‡!1Íl‚íG#à¬ˆAñ™b³*0²Ÿˆˆ ,˜`E—€@áÀªlXtB„ƒˆ;kĞ “™Qd d 0PÃV3[p( ³˜Â~'#Ü`" C¸ªV>ºŒÀˆ/T!HˆjA©#GÀ¡â
ÙA¤@QK°ù ¾UØœb
AxO$	¢•’-Gd]R"gC0_ Ğ@ªĞdYu!€°, @J¡W j´ÙHLIfLD–@ ‘€¡0¤  ½k "T ÄÄH†U •¨ h
 1b	 $€¡dôP#ÄV%A–Ã"„°ğxAB„*T VmDàÀ€ÅšœhAD°­9	¤¸æˆS „#Pb ]$ ¥Ÿ)¨ !Èˆ)Š$Œ ` ÂHâ°0 Èg¶"š2‡³ØŠ&0”´„(€bØO!èI¨ò/Bã@d†$@@ş¦	 4@XØ*"ÅN ŠwA  @›ğFÖ€(› <ÑË3¨+K*yD ¡Ût$`2N û#Jb¥1SaC’MFÜÅ Ä/ ‹GW†«^ª‚üTŸ R[™ĞTé Â 2 ±àÔTF…	^)³uÊC díQÁDMöYÎÆ=¯ĞD">’H¡R!=ø0Ğ…FF§Q–z¤,è(…<°–2 &Wx!`‚+èBÌ"g|q5Ñ   B")"ÒçÄ! ‚#P‰áyd-¹ °Q)À"!$Ğ"Ê†R‰@pŠ TI BĞò’"€kÀ2TÖf)4jä‚\ÂŠ6" ’œ‘Œ$ƒ¡:9 20–œ…”`ï#2Á"‘BE‡±A"d5°$‚*æ °ˆa*0WÓ¦¨•@¬#¬3p3#è)p	 z@CÀyoÀß£„² De(%°dJ
äÄË½Ùc)*¢¢¯Ñ,À0ªfd¦§vÓ
ÁĞµSÊ$€Æfd‘q”FZ\ê ˜Ç"Ø„œp (aS’Ä’wX;oe I9°C3@¹2*Ã-é#Cƒ@%;6 ‚A¢Â'Ø´wFH×%Rˆ	¥bRRWÅí¾`[Èˆ
Tè ` ˆRi÷dÁQ(dĞØ¼;¸_ ”•‚'ÒR8xv`€4$ƒ`ŒA‰…›Üˆœb­â©LPèX	Œ´B*€‘ÉAÚ±AH
%T…H`¶†eØˆ¦¡5ˆAàœ*Åc` Œ!†g†‚ M‘H`’ä€#4Bd)y¢¤€#h	 TfB#¦ 0õV…wa +É¥,•8`hL482  @HJ«ø%0A ½í+
°IŒÖV¦£P HU[t”	‚ÅT  	PÅ@Ó,‡M$ËfÁœã`D43Zqjè@àíÍµ‚}#»ëB…’*Hxg* >ÈfR> €0u ÈH”Œg£' 1È|¤+D4.˜Ä 	ºg	C´ ”8+Š8 ²h©‚LĞ@ €"RÔ À#Ğ…\”„   Æ(À@¢E‰@($€ğÊÂ
2ÄRLÄ
©
   aV`;¢¤fñ ¬ÄE Ã†ŠÉ‡‚‰Œ G8!€
BA·IA}G°i)¤f¹ 0ˆ¦l˜2pŠÅÈˆ¤°ÙD`€`(€r€*İ >a8Ç6š…4  T’0HogSCbG“(¨áAB ˆ"ÑÎR<CBÆ†DUğ¡tK£¬ø€&¤0…"/À¶­+‚,:¶­ªT_r£Æ3¢!O˜9rªô³Ã‡’‹	'¢‰!$F…—B!°ˆƒ2@‘ké£d¯xRRV2U ˜ÀkB¨ƒÎL@VŒŸˆ8M¤  ²‰¤¨½îJ@ 
^"Ö‡ÀHŠX"4tÈO¤ €O
¡«	DI j@NPÒ¦ +J¨\7uÁ(’€0©„„5ch\8pÍ¢±ñ?’C/H%€8àQ¤ ™ ”		Ì2#RDT´<‚†è¤^4â `%e”!$ë¤eC	v„¡J†+´F DĞëê¨’TÑª$Á‹à"‚¦!p€-š `$ 0 s($hWˆÔh‹0Èå†IB†ò0w ÚS[ÀÑ„$r@Åpƒè‡È¡¢/„j¤ ãBÇ£ÑD%eCÇ.ˆ-!Ğì@Ö„ÑtÜÀ 4$'€” Ôk…1@EPÆ8J	!¨¨-Ár¨ĞE@²Aº¢P‚%A°ÂÌ"Â d
ˆHZNifÀ(ˆ#«øÉXŞ¬Qn±w	 1U ¨.°ƒ`i4 C D
0U3X!Dƒ°Ñ 
 !<ÒÅÊ9*CH@ Á R€æRMkH I€E• àA@…@) E+d
Ñ¦P¤È\93eWE¢ 2- â
òTbV<#Rıi|mÜë¬åûñ¬OJÕÇ?ÕıÙÕ¸«óMã×]yŸºãIşsÇŞç¾G¼úÑ…éó_níÿşçïŞºóÖÓ¹şz¶_ÌÜÖıoVÌÿ×õi‚ûşŒy¥ÚsÿZÙnÁpÚ±½šª[WGA3ÿş¿O¿w¹ô|¿ëÆîâ[Œóaû—ë!˜K%„ 
/ gJÂ‚°A  G°£p”âÓƒÄ>…À(5’W²
ÈÅjFÓ'd;I ›00 AÈ©%@ Ì ¥b @f!DGÙ@°!ü¨‘‹ùh]¥£Ö¢1‘¨+0¨yKqĞô1Š£Àˆ§*I#¦bå‘$Å"9)Påuø ©AÂ 	x‹Y@7ÊL4ŠU„×C„C ©@³ƒI8	/b¡Y°ıâÍ …Á›í˜„-‰ÌK>‘ÔYhÀàÅA!˜
ñ"mjÁF  lQ¯ÿ»«ö¹’úùŸgÿÙÆİ_VüÙºøİ£wUıçûC¾ÿöùc5¿o”÷öwş­²wEğu?½=vÆú¢3nsvH½ñÿ^äÓëyLİ·wÒS­NòNÏíÚw_§Bık»y–éõ~öûûç®çÛŞŞ+õç‹ÿŞ¥?ëy~üï«±ÿ«É`f;N©"K¢%@n¤Tb„`
f
Ë¸3T8€Aš@(6h%¤Ì`ˆ<`ØD
(pÌ ’Ã#øBE‚ç€-°¢:&3Êƒ@¢, L­ÉLpvêMH`·$»Ñ6Í¥Æ/ˆ	OĞ…Ö(IÀ"Šû}¿ïO¿Ş{›{Ño÷˜ö°_kÌÿ‰róÒß<ı[úòë¾¦ÑÄw·÷ËÇu§ëWÏÛªãÒİ¿Ã<Îñû™ÿÏüòççÛ?gùç]şÿNå÷ìëÿ¯MïÿŞtt±ájóíxµ\åÍoñtŞµ÷Üõ©»ö¥oï[şwß5É¶áËôÛÍÚïÿ~Ö©7ŸÏ^7¾uû~Şóı9<½’õ?·¾[5Òïö×´7/ò¿öÙÏÿos÷»G_­ßtŞw™>ùşqÏä/q]¾/Wtáßgş?»ÿìÏ=Vd~¿Ü%³Wyï*)qægIR®Í:ûç‘ƒ—{VÇüİe‘Ÿ3}/ıg•s¿Ï:ã´NTµ‚ø‚ìX"Ô¢á©¬…ã¹Â•À JQ ˜ 	h•–eBqA™©   !€ı’Ø§µA%ËFP
dx’ rb$±À´9ƒ(È’ÒAA~aœ¨ÍÈ‘ [UĞ”,B9Êì ›H
v8Àà<®Ûÿ¿Ávï²»¿;¦¯}Fµşµï‡ßäïı»®]ãû>ôH¼şØİÖº÷ÿ¶3î_¾¥'Îß¨üğÛ·k¦çÿ8í^çÍÿçºıâê‹\äÿœó[{‡û×üÿ¬îÕÍ•ùñ—|õ–~Î•l›&¹Îç]\İ*'ÿ8ÿßúNËùaçü‘Ûwd(Âš,…è&áò`†Bˆ…°Ëê´°0ÄHĞå8aÌĞL O@hÀQ peø,I¼D&ÀA(¨Ğa‡qİÏş"”´~æ˜¨2LÎÀ6ğ¶E…Â™lBABĞK
`¨9Ñ&p„SHŠ©Ä^` ›QPô¨'˜VÙH Æe)…¤…ˆ à(’´C‚kØ$~˜¦Yˆ¤p6¨[–T0C‘Sğ€RŠFFæ
”ÄF"Aì
!¤Œb–$RiAPB e@`P•İ*K›à@âc}$&.z0@—0 ,O»³êûgû‘ó_Ï®'®İÒ·ï^Yµk£ñóh‡ş¾ÎG¯7İ”óëÎoŸ£±NŞŞ\)ù«äÖğßMáïèûõÿşÿokí~3‰wĞ®c}÷}1şí{»¿WH¹oÿg‘O}z3·úõÊyúíÙ=­ù2¹ÿßc÷½Ó|Ä6t4Ej;ŠË¡I‚…`ÑğJ@óQ•Pq~*¢ĞPhD1Âl‚Î  €ÂÈ ”$„ 	DŒ RI )ã ÉDÈƒm,
cå¸‡2ÅWa±‘H%€aNCU„V"âuzˆ¢yÀa;ƒ$lT¶g²Ïÿÿ»W×ëÿí¾ûöşœ¯—è*=ÕŞw§ïüo²„wÿğo²Óìgçoïém¾O¿¾~ó²?ôCQúçÔ¿÷ºµv~ô½ÇK÷İ§7öol«îß(oÍîûÓRóù9»ŸşÏ	‹üÇŞKüèêwî•o¹	ó÷ßëï#ûOô·w÷üûÂİ5wÿíĞjøß»¯3ÿÎîèûûìïïÎq¸î×‹Ïç{ıÃ~ùÌw°îï|®õİè«ÿâÿÕ®ÿøyÎû÷˜¸ß{ùÿOşN{®6Ïïîq.ÿÖª¿´ßN}öÇ¡ªşç×¿î½¶m¿r«ıÕ÷j<«™ß^;·ÇüoÖğhÖŠI€„Z›a&È)‘‚4ÃPà`Æpr`	†@qèèƒ —˜Ke"À<Ês< j  n3’œÂ¤ B 0$°lH=’\ G d/f…ŸƒO²0¥=!2.ˆ7G"°ÿğ÷eÎ?Ş·8;,¯òŞ®í²íækêCÑÛÍ×={ÿmùº¶øô{LT÷ş1øWÿ+õÒ_¸şb1ôõïÿ¿WıÿNw3?Y­wÉé÷ıFhóıï=¿íwÛ¬[¦¿Òåón}ïó_ÏûIû¢÷¬/öÿÕ€åÙñ¯}«¹ŞAé®=i'bPH1ÄLûkBU8PÒ@ÌËÓtÑä –€8Î”}c¡ƒl‘¬€‚ÁONL­¨µI€M8à ã3ÁÃÁWT€Ì€@3I@Ğ-Y`g‰DÃ;r×êNi"~cHS´ÁÃB $§RPÆˆdE½â F"1:Ë(E  pB€ Ø,£–%’¡0Ğèè †°%T,
ÚÙraCe‰DT 	p¢ÃˆŠ¡.İIğ %a “i›@À(#È€‘Ñ7t @µDc»Ğ|DÈ`¨µˆ ŠHĞ $İ4r#qçÖ]Tø[½ÿøşö}|oÏßÓ÷ü}³û¼LíışşÇGõéggÓöµ7|ÓoTeûæ7ãfüŸ};}»^»•õ¾~÷ŞïÏët·Cïßõ÷Í~\ÍÖ¬ı+=¾Oíûc¦Ÿ¶+rû›õYYÿû«ÿÖ¾•jnz_Òè®ß[¿Ömï«ç_ö­À÷n ‚[P»LsL¹ + G”Æp ÄlD …Ù4,BHb­#*Ô1@FœF¡Pp"âÑ4ÁpQm
e­èHXÑ. ğp'r5ª¸1t€€Jà`®\šÑÈ¤íâ
„¸r6‘%4Îâ¬©Z~úØ×üßı_s}o­rßVí}îhİ}{Ó\Ot·Ÿ`çşr´ÓŞr÷›Ñêëm4¼Ö“ñŞXğ'û:ï$šŞ¾·qûkSsû¿çÅ+óŸ¾íı¾»”ëEù/ìÛŸf'‡Û·’ï?—Šœ—îæíWŸş­ÿ„÷îµ>y½öÿÌ §ûòóº¾¾ùÖé_~Â;}íçGºğ×§oç'z.Í_¾ÿöñk¯²ù·fúwûûÿoß¹9îØwsı^İ]î‹«]úşnóÇùzá¸¡?÷]ó÷¢öÖÿŸßÇ9ş4şï¯½ÿâ…ÿûkÍşãw_A¼ı^ÿ½¹®§+ş·§¯Ëï¢H€Â@”9a ó°@°¾+!  1ò ##HëƒW¬D"D]‚ÈÑéI‚M`2€O4"¨`B˜ £ñ„Óx(@D
‰ó äHf¢’”¤`A^“Z ĞIp hÌ Ì‡*"wûÏÿèkî{~kçí]Ëµ›ı×-ó·Ûeï9K§n7	¾¾§Óïö’Qü¿7×ûîïeù»mÍu÷«Ïşë÷Û~¿ëÖÖ½ëı}Íd×qóÏgjÎ^•îÿçßı¥ùÿÃ¯'Ÿñí‡™ÜSğew¯ïÛrâß]î»Ìîÿ†]“ÿp[>Æ÷zü<Ñ¨‹dÖ5ÂØA
´‰0Ä¤
‹P}Br)›€Å; ¸ Ğª +pfı¨Iˆ­"Â­K ÃHGJÆ>û _% "ˆ÷íd¨Nd ¥ ¤+ãPp!f.²d¸p0ĞY´a:…
 ¸eùF O†˜‘1ˆ@–¤
!Ø%±Q€ŠÊ@”0œÄ@2!a— B› À3à€A:×™ òA@e‚× 8Ø+"(IY™L¨áUœƒj Vp€¹;¨'<;C‰¤ƒ¦@DÀ‡À<Ğ+B€V5–53, ¥¦A÷}òÜ÷ùû‡ş·_÷×Ê÷ûZÿ—¿í¾<½ósıíkü×ùÎû¿èón|îô£õ©ı_ùß^—ùñüÿß¾Ûû]ºßoÍzµÿÏé‡éûÿx¢ì¹ò•ßÌ“ßİ˜£3µı»g~ß¿Ïü}&iôæç~ûIÛŞş^÷­·LïÆüßëzÑ©ïÁ
0Ï†ƒ†šƒŒ““Ï@FF" •ƒ,`jJ%WE‚§ Qˆ^$FSÑ@ Ğ*¸‡¶¶pAÂS€‰)¢H‘u7aQwÅ‰ÂßPdˆ"ªæ‘FÊ¢d…`è@ 
"$K‘Zm
 °$Ûöygşßûÿ¸ÿÛO]¸ëş‡[ùßŸ~úşûº½÷$jı0ßzsÛøcşjı{¯—½Òo`ÌËõöp¿˜ß*¹İÎÿóŞ”ıºßúYÕäì±kQêÒÿ~íÙÙŞ:ÒÓã9Ïl·ÿı×Ïÿõ/óaÕ½}uz·}cx»»ï¿|w½·æïÖÒïtu¶Óú»îœÿóaû§‚8Zõ¼[p÷Gç[ŠòÇ^ıyuÙí‹S÷»ÌŒûOÎïãóşß¯¿×?÷jŸTDşãşıË÷îşÍ%ó§ÿ}ç¾³îËâšëÿ^óû»][²ù¹)ÿìûÿØ¾ß§û»¿Gg%ı}İ7ÛûÏ7;öê×³ÿ[¾YQe €ÁĞ`u™—P29Ã„À#”Va@‚‡¬6pL± ¨ QEŒ˜PZ¤tQ8 Œ†YÊ+˜€ U@]‡ì
@	“€ÃÈí˜dÆe$FLX€E†` ğTfˆEFD›&­”5Œ€BmÉÉ@b <)È@vN˜rn this;
        }

        var startPoint = dom.prevPointUntil(endPoint, function (point) {
          return !dom.isCharPoint(point);
        });

        if (findAfter) {
          endPoint = dom.nextPointUntil(endPoint, function (point) {
            return !dom.isCharPoint(point);
          });
        }

        return new WrappedRange(
          startPoint.node,
          startPoint.offset,
          endPoint.node,
          endPoint.offset
        );
      };
  
      /**
       * create offsetPath bookmark
       *
       * @param {Node} editable
       */
      this.bookmark = function (editable) {
        return {
          s: {
            path: dom.makeOffsetPath(editable, sc),
            offset: so
          },
          e: {
            path: dom.makeOffsetPath(editable, ec),
            offset: eo
          }
        };
      };

      /**
       * create offsetPath bookmark base on paragraph
       *
       * @param {Node[]} paras
       */
      this.paraBookmark = function (paras) {
        return {
          s: {
            path: list.tail(dom.makeOffsetPath(list.head(paras), sc)),
            offset: so
          },
          e: {
            path: list.tail(dom.makeOffsetPath(list.last(paras), ec)),
            offset: eo
          }
        };
      };

      /**
       * getClientRects
       * @return {Rect[]}
       */
      this.getClientRects = function () {
        var nativeRng = nativeRange();
        return nativeRng.getClientRects();
      };
    };

  /**
   * @class core.range
   *
   * Data structure
   *  * BoundaryPoint: a point of dom tree
   *  * BoundaryPoints: two boundaryPoints corresponding to the start and the end of the Range
   *
   * See to http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Position
   *
   * @singleton
   * @alternateClassName range
   */
    return {
      /**
       * create Range Object From arguments or Browser Selection
       *
       * @param {Node} sc - start container
       * @param {Number} so - start offset
       * @param {Node} ec - end container
       * @param {Number} eo - end offset
       * @return {WrappedRange}
       */
      create: function (sc, so, ec, eo) {
        if (arguments.length === 4) {
          return new WrappedRange(sc, so, ec, eo);
        } else if (arguments.length === 2) { //collapsed
          ec = sc;
          eo = so;
          return new WrappedRange(sc, so, ec, eo);
        } else {
          var wrappedRange = this.createFromSelection();
          if (!wrappedRange && arguments.length === 1) {
            wrappedRange = this.createFromNode(arguments[0]);
            return wrappedRange.collapse(dom.emptyPara === arguments[0].innerHTML);
          }
          return wrappedRange;
        }
      },

      createFromSelection: function () {
        var sc, so, ec, eo;
        if (agent.isW3CRangeSupport) {
          var selection = document.getSelection();
          if (!selection || selection.rangeCount === 0) {
            return null;
          } else if (dom.isBody(selection.anchorNode)) {
            // Firefox: returns entire body as range on initialization.
            // We won't never need it.
            return null;
          }

          var nativeRng = selection.getRangeAt(0);
          sc = nativeRng.startContainer;
          so = nativeRng.startOffset;
          ec = nativeRng.endContainer;
          eo = nativeRng.endOffset;
        } else { // IE8: TextRange
          var textRange = document.selection.createRange();
          var textRangeEnd = textRange.duplicate();
          textRangeEnd.collapse(false);
          var textRangeStart = textRange;
          textRangeStart.collapse(true);

          var startPoint = textRangeToPoint(textRangeStart, true),
          endPoint = textRangeToPoint(textRangeEnd, false);

          // same visible point case: range was collapsed.
          if (dom.isText(startPoint.node) && dom.isLeftEdgePoint(startPoint) &&
              dom.isTextNode(endPoint.node) && dom.isRightEdgePoint(endPoint) &&
              endPoint.node.nextSibling === startPoint.node) {
            startPoint = endPoint;
          }

          sc = startPoint.cont;
          so = startPoint.offset;
          ec = endPoint.cont;
          eo = endPoint.offset;
        }

        return new WrappedRange(sc, so, ec, eo);
      },

      /**
       * @method 
       * 
       * create WrappedRange from node
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNode: function (node) {
        var sc = node;
        var so = 0;
        var ec = node;
        var eo = dom.nodeLength(ec);

        // browsers can't target a picture or void node
        if (dom.isVoid(sc)) {
          so = dom.listPrev(sc).length - 1;
          sc = sc.parentNode;
        }
        if (dom.isBR(ec)) {
          eo = dom.listPrev(ec).length - 1;
          ec = ec.parentNode;
        } else if (dom.isVoid(ec)) {
          eo = dom.listPrev(ec).length;
          ec = ec.parentNode;
        }

        return this.create(sc, so, ec, eo);
      },

      /**
       * create WrappedRange from node after position
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNodeBefore: function (node) {
        return this.createFromNode(node).collapse(true);
      },

      /**
       * create WrappedRange from node after position
       *
       * @param {Node} node
       * @return {WrappedRange}
       */
      createFromNodeAfter: function (node) {
        return this.createFromNode(node).collapse();
      },

      /**
       * @method 
       * 
       * create WrappedRange from bookmark
       *
       * @param {Node} editable
       * @param {Object} bookmark
       * @return {WrappedRange}
       */
      createFromBookmark: function (editable, bookmark) {
        var sc = dom.fromOffsetPath(editable, bookmark.s.path);
        var so = bookmark.s.offset;
        var ec = dom.fromOffsetPath(editable, bookmark.e.path);
        var eo = bookmark.e.offset;
        return new WrappedRange(sc, so, ec, eo);
      },

      /**
       * @method 
       *
       * create WrappedRange from paraBookmark
       *
       * @param {Object} bookmark
       * @param {Node[]} paras
       * @return {WrappedRange}
       */
      createFromParaBookmark: function (bookmark, paras) {
        var so = bookmark.s.offset;
        var eo = bookmark.e.offset;
        var sc = dom.fromOffsetPath(list.head(paras), bookmark.s.path);
        var ec = dom.fromOffsetPath(list.last(paras), bookmark.e.path);

        return new WrappedRange(sc, so, ec, eo);
      }
    };
  })();

  /**
   * @class core.async
   *
   * Async functions which returns `Promise`
   *
   * @singleton
   * @alternateClassName async
   */
  var async = (function () {
    /**
     * @method readFileAsDataURL
     *
     * read contents of file as representing URL
     *
     * @param {File} file
     * @return {Promise} - then: dataUrl
     */
    var readFileAsDataURL = function (file) {
      return $.Deferred(function (deferred) {
        $.extend(new FileReader(), {
          onload: function (e) {
            var dataURL = e.target.result;
            deferred.resolve(dataURL);
          },
          onerror: function () {
            deferred.reject(this);
          }
        }).readAsDataURL(file);
      }).promise();
    };
  
    /**
     * @method createImage
     *
     * create `<image>` from url string
     *
     * @param {String} url
     * @return {Promise} - then: $image
     */
    var createImage = function (url) {
      return $.Deferred(function (deferred) {
        var $img = $('<img>');

        $img.one('load', function () {
          $img.off('error abort');
          deferred.resolve($img);
        }).one('error abort', function () {
          $img.off('load').detach();
          deferred.reject($img);
        }).css({
          display: 'none'
        }).appendTo(document.body).attr('src', url);
      }).promise();
    };

    return {
      readFileAsDataURL: readFileAsDataURL,
      createImage: createImage
    };
  })();

  /**
   * @class editing.History
   *
   * Editor History
   *
   */
  var History = function ($editable) {
    var stack = [], stackOffset = -1;
    var editable = $editable[0];

    var makeSnapshot = function () {
      var rng = range.create(editable);
      var emptyBookmark = {s: {path: [], offset: 0}, e: {path: [], offset: 0}};

      return {
        contents: $editable.html(),
        bookmark: (rng ? rng.bookmark(editable) : emptyBookmark)
      };
    };

    var applySnapshot = function (snapshot) {
      if (snapshot.contents !== null) {
        $editable.html(snapshot.contents);
      }
      if (snapshot.bookmark !== null) {
        range.createFromBookmark(editable, snapshot.bookmark).select();
      }
    };

    /**
    * @method rewind
    * Rewinds the history stack back to the first snapshot taken.
    * Leaves the stack intact, so that "Redo" can still be used.
    */
    this.rewind = function () {
      // Create snap shot if not yet recorded
      if ($editable.html() !== stack[stackOffset].contents) {
        this.recordUndo();
      }

      // Return to the first available snapshot.
      stackOffset = 0;

      // Apply that snapshot.
      applySnapshot(stack[stackOffset]);
    };

    /**
    * @method reset
    * Resets the history stack completely; reverting to an empty editor.
    */
    this.reset = function () {
      // Clear the stack.
      stack = [];

      // Restore stackOffset to its original value.
      stackOffset = -1;

      // Clear the editable area.
      $editable.html('');

      // Record our first snapshot (of nothing).
      this.recordUndo();
    };

    /**
     * undo
     */
    this.undo = function () {
      // Create snap shot if not yet recorded
      if ($editable.html() !== stack[stackOffset].contents) {
        this.recordUndo();
      }

      if (0 < stackOffset) {
        stackOffset--;
        applySnapshot(stack[stackOffset]);
      }
    };

    /**
     * redo
     */
    this.redo = function () {
      if (stack.length - 1 > stackOffset) {
        stackOffset++;
        applySnapshot(stack[stackOffset]);
      }
    };

    /**
     * recorded undo
     */
    this.recordUndo = function () {
      stackOffset++;

      // Wash out stack after stackOffset
      if (stack.length > stackOffset) {
        stack = stack.slice(0, stackOffset);
      }

      // Create new snapshot and push it to the end
      stack.push(makeSnapshot());
    };
  };

  /**
   * @class editing.Style
   *
   * Style
   *
   */
  var Style = function () {
    /**
     * @method jQueryCSS
     *
     * [workaround] for old jQuery
     * passing an array of style properties to .css()
     * will result in an object of property-value pairs.
     * (compability with version < 1.9)
     *
     * @private
     * @param  {jQuery} $obj
     * @param  {Array} propertyNames - An array of one or more CSS properties.
     * @return {Object}
     */
    var jQueryCSS = function ($obj, propertyNames) {
      if (agent.jqueryVersion < 1.9) {
        var result = {};
        $.each(propertyNames, function (idx, propertyName) {
          result[propertyName] = $obj.css(propertyName);
        });
        return result;
      }
      return $obj.css.call($obj, propertyNames);
    };

    /**
     * returns style object from node
     *
     * @param {jQuery} $node
     * @return {Object}
     */
    this.fromNode = function ($node) {
      var properties = ['font-family', 'font-size', 'text-align', 'list-style-type', 'line-height'];
      var styleInfo = jQueryCSS($node, properties) || {};
      styleInfo['font-size'] = parseInt(styleInfo['font-size'], 10);
      return styleInfo;
    };

    /**
     * paragraph level style
     *
     * @param {WrappedRange} rng
     * @param {Object} styleInfo
     */
    this.stylePara = function (rng, styleInfo) {
      $.each(rng.nodes(dom.isPara, {
        includeAncestor: true
      }), function (idx, para) {
        $(para).css(styleInfo);
      });
    };

    /**
     * insert and returns styleNodes on range.
     *
     * @param {WrappedRange} rng
     * @param {Object} [options]_äüV·ÍOlè“çO,}/ïíã›Ê=ï-ñbÏµ»ÓUï-ë›ö&oOÜÖìöíŸ—Øß>ì†ãÏıÿÖØeÁ£şÃå?Ãô'gc[=İû—ÿ÷T—öàbøºõ£ÑŒ÷Wã³‘³×ÿïÏ–}jò©Zíq(ñ.í¡6ûSp«d§	1
	Â* d,)Y5Á"E*P PEDİ@H`pC2(2E)F!Ú °AÉ  X” g(ƒ$¢ U;§¨‚!É8İW€4äL„4’VÀ¡2°8B•lT€¬€^Bmà‚
5]@åÓ!/Ó#IAP¥œ TÒÅ€*:HL™àŒÅ Ud  B‰@“âê‰aFnÓÄTŞ&Óp4(FSó €Œg#€ĞDH˜ 
ÄXàœ#ƒB0”Ò‚€J¡@µ é– ¤`Û ±æÍîñu½µGŸÛP–öÃ¼ö±éOg­äïJB+õWÏ¹Ókæè_á½NwEï~éìI7¿vPİşœş‡ÿñ7},Ág‘2=o?úîgûóÛÃ–ö:ÿåö]ï©×ûû>‹şQâoßÍûv­?êûõˆzûÿµpCûÎfûg¥Ö7¯ÔÿıÛ]õJÑÀ! (h‘\I™!h ‘ˆ2² šõÈäˆA&@d”B  œ @80ácDÇXV ÃŠkJL@6	cÈ‘ÁgˆA2 8 Zİ”øŠC(hÎHĞákx¤D„ LER ˆœ  Ñ!B;eB€À#‘ƒÒ†üÿ¾ÿ·ï]½Gñù¤”İ~¢ıëG÷¶^4õu=xw×Ú—eÜÆx7oöÓ[Ïó?ùUñÖš÷ÒŞ8×ÿ>Şùwh·ä£ıK÷ä¿İqü¿·ûßÖ·~Vî×TÖºşT]}Åå—Ç_ãšYÇñŸc,îŒUî~_³Í¶Ï^î×Ş¦Ù.ülÄ½Í‡m?}âôõqÿËf¯İ¾uß?;c½ı/ß/U¯W/Ï«´ßô—¿)şfZŞq–wÉñó÷Wü¾³4NŒÒÆ×‘{Û®}»ş}úUâËgıö“ëó_6}ßÿÿ×æ3oëGü}%¾½×ß÷ßOkt´¼İ%õo¶Cİêïç×ö˜ëïùašD	“ù˜SH»“X#j@*°¼øc h¬@€ÂMZÌ‡0ŒNš@}¶~±¬Q6C pAP“  P£¬© *Yu!(õ~Æ	Èñbk•PØ¥À­„Ò2óX†®\ SÁ
èša@ğ;]âuï³øJù.Ôiwô³{õüõû}é?ÙµfOûZÎ^&­Ç7û§k‹îïìß°©ôñå¯GK«z×Eó­ô—Wûßƒ›§Éöÿ¬Ÿat³÷£J³¿{ø¿?ëæu{çó÷ËûnëÿØØ´±å+û¯ÍWÿn?¸å*"ÿ(BRÙ!ˆA L`EDd“d¨$9ƒ"ÑNX†I@mğ¢å`”B …(‚à1l,‰˜>³Ì»¬E¨B%Q€ƒ®À @éÙ1ĞÒ` H«9 ‡pÀ“C.J À€ ŠJ@BàN
	!’ HØD6,’JxÏ ¹a
„ñˆI×$E:#3"BÈtl²’U!*@!H‚œ
` iŸÁP( $É  R 
jŠ† 
2 ¡Á€
CP€z’ ]ÔæJQÁ”(è€Š² À1‚ŸPÖ¹Ÿ´ßšùõ$¹?~ë1ŸíÛÉ3¿ı!ü%Nóuÿwá»ûfŞğ#ŞæWµÿï¾ò;…?¾0wÚ¼qÕZ~óÏWØîWóïéÓ°”ô£û´^y÷ı=³İ¹Í®´V¤–û¦ŸNšımÿŞÿã·ïAŸ¥W—÷o^ï…f 
C @Ö CzBò„8*$?¤P‚K€• ÉN
x€xˆG6`"$
"H	Ã%8T S@@   PG`0ƒ00@Bğ‚Ô"ÂlÆ›@ 

1°eh˜R@‘0ñ#$)U&„ÑA èDö½şş¾®c¯ô´”^LÛÅï;ã‚~Ëüµ/Z÷qÍyhÛÏy9“m_;[dœó×ÛNşqo®ï×7k÷´
•Ÿô'NûŞ?§{¿÷ğ»Ûÿş’ûé¶¼óew·-´ûà¼¿«æ×&}·}ñ3ùÿ?f¾¿ÿûÙ¿ìüIúßoeÚnz¿ë_›ó´ëÿù_eûë_?v{¯§nßIÄó‡şÖ7/–ŞÉMªú‡ÕÛì®ºıŞßŸ[+OâËö•k¹ë>&kw÷·¾óéÆØ®¼–ÄŠPì»?w·¶¶ùûüÇŸoÜïO«…r~w(3½Î,ßáæOs³¼®çûc?óz»Q¾gÚ»ÏP‚,%’0 iL,h B/8!ËÂÄ%` i$P¼x!€PÈBó¶.¦„FrÁÈş’¨A ‰A†¢‚%.@Ì Œ…¡„Ø&0£€ 4 N"á€AˆUĞBÂ€ˆ€²ûØÁ ´ ß:T4@aû]¶üã¥·+³€¾ŞKlÙö­zÜ¶²;õ\[ÿèvÔ§ë®}O×ÏşŸ³ı¦ıèîWß¯øÏğ˜> Ÿ»÷/1¿/çÿŞ`(—ÒãÆï|‰.]ıîâ>w~ãÊÔŸ3zûş^^ş×‡ÿG›/}?t†¿ÙîóM¹¹ÑÛ:qÁ•Ñ  ™  (/¤Š1†ˆq…$ @bÆ° q,@ — T2&„0$æO2ñÀA`ˆ€4à@1 é³A° 0ÄÀP›  ‚4±ò€¬rCÌ İû A 1(D,+$ ¢VMA\J"¥ÉÒ  áAÀ€_aÉ#¡ùJ*PôF¹  @I
’ ğF€ Ø°ˆ(ƒ Ğ	( (@"/P2 Àâp€+
I0È²
2øáè¥bDĞ#°…ÀĞ¥@Â'LÑ  èXA°Ä,út›vèzßÕåÇÃÑeß*Ÿ66§•õ6C÷şñ#ûÿîj÷İ~oå¿oïó[»¿`úÜ'º;ÿ¯W~å#‡h÷:º\À°WïşMLë#hüü3ÄÏúîÙÎ½GY×û'k³=ª2÷İ«ßjq©·ÿŸ¨çòïÙ÷Ü=\Uz_®‡¸ös&
P’ T¡ZÄ„$b ª8 d’È]4€ 0S WB´'˜‰{ƒæà 5€BĞ@$`hˆDMEMfRÅƒÄ4r`H€S—PÂÂ…C  S ¥$„a…E €,o¢Yˆ,Öyÿ>ü·©øÏ†‹c÷ûÒÒweÇş|—¿üğ»Zû¾$?±³o¯½5ºÏÜİwm|³ŞmÙY›o¯ÿnÇÏówh-Wö¯Š7©ã;Ówà­h¾~ÌÿåÿıöÇ^Ù%Û-Wwù/­l]ÎWı»W¶öïÅsc¾·_çÒG¼Ï—ùÚ:'|g¯ıá>ò57·õ½ëÏèİ¶Ï›Õï¯¿U÷­½´_?øÿ'¶²9«™£2?v\°ŠÿûıóËÙ‹–>óòâÕğ¯w77¶ğÛ[~ïÍ÷=ÿ½×Â?Ğïgâoü";÷nš+·ß}³ó§ïû[R»kæ³o½¾ñ—ú·ôåÛ`"  Øqb ñ[Ra`©(t€@àNÄª¯=@ ŒR…Õ‚HVC‰iTI$I’8(r™şJ²KX?rX©&.@Å5;Éˆ´…4ªCDAZ@„O`€ŞQòK×…â,cLt LDßı¾z‹ºuzòÎ.çıÎuuëõ³_ÆmôÓûûiF×ÿuóÕ]Qÿø§³e/eÇœ÷»ıÿO»•ºæOï}İg7^ÿn'mö×ö=o.şş7§¸ŸÛØEõóµË]ÿ_¨˜ïñ?o'½TşÍd×w{7ªä¾[oñ|«=^wnu3›. 3RV-pŒİŠÒ|
HAD¡
!Ô•,"ÈÉ€ ,“@  (Æ¸AE ŠVRŠw%s$Ú˜Wj3#0– Ğ0( *@!  ñP@]'TƒHŒ'Œ  Ğ¹Ì0Z’ ­>%Æ ØeY4D¡AN=ˆƒ2B  (¤#R
…r"m¦ß,İT¸''A i@å€µ\†äÀ4Š°Éq!É U ¢%GG  fB‚0[ €2Ãò .	ÆPÀ²#`™
9_sLÚãó¾§Gò¿÷r¦ñçşi³ïâ¹ôÎs³ö·*úê¿®é²ÿHocíq2}ïZ¯äŸóç?ÄÁ²ıïõm,æ»«W÷ßğùc_½»uŸ]|îwMşg'ï»ó~û¼MĞçÜ;ÿÚ¿—ñÿì{êcûüı/ßöòŸqÿåË'‹·ÔúŸ×È “Fp	dYâq¡ÆEj^SAà¼
  C0¤˜‚B E”hà0ä‚í`Va	ØÊÈúQR .^„Ÿ1‚d$ Ai ÕÎIR@#@  $ „O‚  İ„G 4 h/iÇ"F™¨"\Ùt€¦ªÜï?ÛËv?Wú`ßÀ\üş7ñ¯óïáV]ŸùÏ_ï/öÁN½î¬óïŸ•cnùığï¯gı;©õá÷UŞ¿ñÿÕë%“Ÿ>o¾Ÿ·‡îo²~]†Ÿ—Wzóón©¿3Ün¯ÿ|îäk¤pû¿O0†ßéû”ïÚW{•ı7Íëÿõé.A•/Ö¬zzµ³)×ªöùéuü]õ¹½{ş|µİ­³›÷ûµî«·znŸ§1ıwşUß×vÇ©mù¶ëßáóíVß“ÖàïÎß?·=±×tî’ÿ^ÑŸş{ú¢û^ßïíáÿæ33ç¿Î›6¥·VùÅrßÍû<ÿ~×Â;_û§R,­ú Då¤€K“IÀÀ–ÒbD@ŒÇiÁBE;‘   Ckà6R<Å( &R´ªd$ FÀ›÷"À:hjDBB\//A‰EU¢@¸Ä„à˜NKJµ2
‚ Jìõû¬ Ø+â( $8r$ƒ0‡%@sDƒ¢…À½¤¢"ápƒ¥ŒTÁ¬ Câ ¢B
³JD¤$`,Bœ,R«Ğa™<Ö á(Q
4Y¡! A¦@ ŒFàDÄSÃ–@‘(À¤€9üd8– 8†@ =ĞD0€ÌÄ3¿Ö^_¾(œ÷ó+Ö›å¼û¦%j¾zÆö1ÔŞ÷¦ı¿ÄüŸÆß»&ßŠ§J¹¯ö“ÂŸ¾±ü
ŞLò5‹Ò_ÿ¥ûş·/T!‘Ûß\ÙædyÚÿ«ç¿ş3ú›Ä{¾ûñÔ÷IûîgKöã¬qõ§ÀÿßMéåk]ğ¯_MÕ_ª_íïôô?.¸W~›ß=İo8ıÛŸŞ¯ßºsí?âîñæ.+sÿkk,Ûg‹íF©2ûg~wùgCãê×ß¥¢åµ>á:íø¬ÏıúçUeİüz´^Ç~ug?´¿W]Ï8şşĞEïOFşÏÿow¿¯=}%÷îÅvc“ôÕı·õåšÏ@° €7 <`…Â‰ÕPˆÅÀDbÀ„CZhOT59Î„×  d!(ÂUÀ«‰Á€ "d‰GL€"i…€(Ù@ª€9&6to
†dÕñ„`H8 ¸A"&Q°a!G4 ¢Âd¤‡s)iˆƒ\Aq“NÍß÷çµÏÿTÿ¨O;w½?™vyõœÜ«—ÆŠM'<ôæ•ç>òÜö;:×s5›%ßÎ¢ıŸİ_’¾„¥“cÛ,~óŸ%Ä>]mğ*Ô÷Oå§º¼ŸæpçÅbÇ\&çfumÆ•İÑión²š5÷=g_ÕÛNÖ·¿e·t›Ğ²¾İ­€…²%…‘@: X¼i …À¤4 po‹<@x· â!I€e³R„.‚ e¡ ‹©"D€C”G@˜ – *pG®¦Ò`B™PA0À¥ZD0 +:a…Ê‚× )‚……éCÇX"E%!)À!“Vu2ğ"% Ü (‰
”¨!@ª  ¬1aĞ$Ö"	!¡€ÈD cŠ” ˜e‚’¼Ğ‰]c4à IQDdøPY(AGMJlƒÏ@ ™9]ptO8 2Äb	0h“)&¬ @†€(¼İûRÿ·Îç»¬.ÛOòêüÒY:¥l¿]°•q®¿íşk^^fg9	Îÿ_÷g”-ÕÜYZ{÷<y±ãs\
ıfÛ¹ßşïZ—Mß­ÿÈGöBm‹ê;•«û÷üu··ê½»ú7Ü›ÿŞÜ}»¶ıªù¿¿õÅÍv²Áÿg¹¯¾i(PŠhL¡4	"ä@D8`$@ 04l‚( *$¬€@ÈÀlB¤ S ’ˆ´˜Jˆ2À*1/•"¨ÉÀ@•"b€ „4„D@B8,bCÄ)ˆ(]m"2LH    ¹8@ s€ uš<¿İ|o«|²üÙÓnòsÑ³×}Çúï×œîÓßGrı[÷¿=>t×ôò¯Ÿ(ï^x‹÷;?|?şíø¿ä_E¼>Y'à»=âü»G€„×?ğ™ï}Éíq¾ëõŠÚµº}~VÛU[:omıÿóWùŸíkãZ‹·ëÙßf;•S*Ñ~ãş÷b{ôÿò=äŞøW¿^[ùŒáOu?ï^çäÿu¾.íÍ¯óß¾¾É9í|û—Ş}÷}Mşùµ×;öÓ¿ãÕ¼£jïğüHÿ¿ŞúÇõ{·ê^<áíç­û[»/gA8äİ/ó›&GNcå½ûŞù?ùÁzJë· æĞb~A… DDq¤‹$A‚C
ˆ” D$AL!ª@Ò
M¼ÂIà‘	`Î0DaêÉ 5ŠB5+0 4 	 ªA @ÂCËnAˆ~+8 ŠJÏex A%¼T`
i•"ÌaÀ4r½¿NÆ·¢)»a„¶.™½÷şô=ÚF­¿rÛåÀSÉ:ì&QMÆ¢Í¿ñõVê§¤ı×ÿ¿kiİò·—Åi^ó‹og›ß§½™gæßîûıJúµï;·íÄ¡Ÿö·ººçuGü×7Óÿ•_ğÃ­Şí×—½šı^ô¼ì'wíXY÷ZØ6	96 ØØX¬`&D"B@P@ì˜F à&ˆ 
2À€`)D „p(B5cPB'ÚY€`$ ‚ŠĞÂ°(  K„bHÈ
Vá²b¨òBÄˆ Ü°J!!Å	Df @òÀÀáSà2$”À9
t
· Ñ;Ú$n´‰dB‚@(Ä7 âÂTW €D¤JbF¥€ ‚@tÂP  Ëf@ğ†€ÆK‘6¡’@p†Ø
Í0H,bñ:!6 (#À Rg°ÑAù"  @¡’	 $‚M¨P$AJZ®Òd/Qà À×ùÔdwyK¯˜?$û~?ïë|Wf÷V-Ûò¾t*¾ÖËğçğ:Ñ·%ÅÂW–ºUÇ{/[Go]‘ïŸg»uüï·;É¾Wïş=_lW™ŞwrüSn_ÕWëåÍn4\vıï»wÈÔß´Û_Û­ãÒ÷1ï3½q<w»ú¯LÓ7åùÎUÒa‡D°‚`ˆ ƒ(€$T@
Â$A€Šƒª˜C Pc t‚…#§"ä	Vl¢¶‚
IHC!
Œ€íà#ĞJ(@&€3°	„¨àÂÀ¨HB”% #t¨HD b€ ¢ªBrÒ@9ƒ"Ğä½æ¾;á3ÿ÷Ç÷ÿ¾¦—y¸#°÷Áßy?ÿøl÷é¾®¶ÖÏ›1«9]ı}Úá¼çıßóºÿWs6ò¾ş_æÚ²ßå×}\‰³®mk{µáSÛú×=%è-±õşgŸ½Ş¾G¼ÍKÔ?¶zèö²öÇî¥À“éÿWd¦5g­ïy¿×Sg^—Îè1åÏßıóÿ£vÇ;x?ü¾¯—Û÷~kNJş?oWÙöóşFİkëßo¿ıï£FûovÔDÇ2¾k+wGÿ}»»
ğÇüÿ§«±[ÒıZÿıKm}ü›{[ÿw_ª½Â§Ï/_¿ğæO¾ÂÉù,)÷ïOSfğÈMâ€îÅƒº=•@ñ„ˆ22cF‚  !W† -*  ¤P ‚ B ˆˆğPËÄ RÌT‚È‘ĞAˆF1S(CÅ   H:4H 4V ÀØŠ À´¢‚ñ‘R¤"Ç‡6Ì‰Â¨·¼ywçœ,ùz.õ+¾ò{½o7mÓyø»½ßõÒ>/²QÍÿì_ƒ{º†¯ö5Ÿ×-ªgßVæ_o¥û–¢iXÖ‡~·Û¶s“;Ÿe7ÿ·®#}:ã[Ëzhu¯ş·şî7¨ïÓ'ü³¥#ù©ÏGşs7}ís?ÏkûËÖ¿mù 	¦BhGxO[pˆRdPAí"è€€Ã…±‹œ&àT 3’tHÀ Ê®F¸ª<\˜R`
È	 C(¨T€0Ä°i „±’p‹B0ÉB—
0|‡ à¶€ä€Õ¨€ iª`$áã œĞ@vP‹Æ„
Õ6@8€‚Q(6ˆ°–˜´p(!À:P@aÁ¸	8\€A 44T^`¦BHù3€8 Âz"Œ ¡ 	ŠVp@c°äb"@B¬NÒ56hÖR3(x
"c©‚+„Áb‚1D (…Áp§¶ÀH &ÈÈ)‚KWG÷óv[m'njÛo¿ÎqKşD#ıí×ÕŠö[Å?™®½ÛG¶Sÿ¡GËæ–ı»Ÿ[\£äôı½÷}´cõ×æÏ÷~º.É>zi>^¶¶ø]ÚF|ÈWp­·‡gû}×i[ëÎúÿ°Ïµ/ı}yzß×4uG>ÇÛûô~ßÍ9 c!ê	ÚCIAÒ @‘°@
hAB³S€$áhå! À‚ „€°|¢³Ù˜"–\N„A4¡4Œ)Ó',(dÂGB	0Ä  ‰ ‹, $ <A^³„ÇTÇd¡’GÖ %ÀJÀš   	f 
(  êÕçå~+ÿlè_Õ}IJÿúğçWªıµI›Ï®=®Ûn.÷‡ïSûÛö¹¼Rgş^æ\üÏïÛ;;·ğÌ&lÚs»¯·®º#ü_ù/d+§÷ŸcYüÓ¯Ù|‚7ºùpÏ—ü?¿^^‰»ä
–ıTi¯åÿ§ˆ¿eñcÅ’K`µV»õÇª¯Ñ^ê?ÇëÏn¾ü›åû¯ívÛ¯u®èwã§ì¯)³“k\ßTù½Ùı“tû÷szı’ê©Ã3÷OÜ?¬}ç1İm½}ë÷ö{ÂıÕÿüôcí.üçûÿ”ŞŸığ9Y¯ßg'½ß:ßu3s7İ]5“òù_ö˜î7év9/¿«zwX†ÑÀIÀÈ„ .V	‘ƒ†.!¬ n"A ‚s@§ê §ƒ ®Ñ„
 
)¤¤ÀŠ@à~GÄ+1‡iY#$A LAHd¢ÛDÈpÂÑÂ"‡&NXÏÉ
	@€˜¢´ nE 	9ÿûÆûûÜ¾©ñ
fû^_sıòô7Û×s¤7ô;6ßp–ÔëÚt›Ô~¹W×òø?÷î¿jVıçêı·{®Ş-¿¥7×¯keÁÌá÷ÎŒ|¶É9t³Wï}¹¬v¨ø{~~ğòQú“«Ã7k¥¯¯ÿãOfİ•SÔ±·=×£*‘G*hA‚²Lp(9`- °„‰$Pİi“²ƒ4,AP& ÒF„—RB
dà„ AIÅ‚ à‚L‚!•¨€Í“&”A‘P,`” ’´8 §0b!QHÊ"[¢€'À •H×AĞ‰‹E Ä8RPC
P€H]ÆÄÀP2Š ˜„DK# D."TnIÈC4jBáDaQ«‚ @	2@‚@¸kæßN€Å 0A‘N¨ S  'Á„Â(Ò¿hˆ ’ Lb,ëÀ!Æ”˜ ®AÀ`ˆb“ç©.œı.nî/Ôçn·}÷dõ?wÈ[w‰”æ¥?Ú r›F‰G´ŠFÇTÔ÷ÕZé±Tšnï.¥öŠ‘ÒÕ¹¶iÉºæóUùæÏİıÌş?w™üş¾™şÖÿ+÷›û5ï÷•¹¬2/Ïïmş·‰æúKÿıí_ıò>ÿuÇªÏ&Ü¾ÏúÕ       head.parentNode;
        var lastList = headList.childNodes.length > 1 ? dom.splitTree(headList, {
          node: last.parentNode,
          offset: dom.position(last) + 1
        }, {
          isSkipPaddingBlankHTML: true
        }) : null;

        var middleList = dom.splitTree(headList, {
          node: head.parentNode,
          offset: dom.position(head)
        }, {
          isSkipPaddingBlankHTML: true
        });

        paras = isEscapseToBody ? dom.listDescendant(middleList, dom.isLi) :
                                  list.from(middleList.childNodes).filter(dom.isLi);

        // LI to P
        if (isEscapseToBody || !dom.isList(headList.parentNode)) {
          paras = paras.map(function (para) {
            return dom.replace(para, 'P');
          });
        }

        $.each(list.from(paras).reverse(), function (idx, para) {
          dom.insertAfter(para, headList);
        });

        // remove empty lists
        var rootLists = list.compact([headList, middleList, lastList]);
        $.each(rootLists, function (idx, rootList) {
          var listNodes = [rootList].concat(dom.listDescendant(rootList, dom.isList));
          $.each(listNodes.reverse(), function (idx, listNode) {
            if (!dom.nodeLength(listNode)) {
              dom.remove(listNode, true);
            }
          });
        });

        releasedParas = releasedParas.concat(paras);
      });

      return releasedParas;
    };
  };


  /**
   * @class editing.Typing
   *
   * Typing
   *
   */
  var Typing = function () {

    // a Bullet instance to toggle lists off
    var bullet = new Bullet();

    /**
     * insert tab
     *
     * @param {WrappedRange} rng
     * @param {Number} tabsize
     */
    this.insertTab = function (rng, tabsize) {
      var tab = dom.createText(new Array(tabsize + 1).join(dom.NBSP_CHAR));
      rng = rng.deleteContents();
      rng.insertNode(tab, true);

      rng = range.create(tab, tabsize);
      rng.select();
    };

    /**
     * insert paragraph
     */
    this.insertParagraph = function (editable) {
      var rng = range.create(editable);

      // deleteContents on range.
      rng = rng.deleteContents();

      // Wrap range if it needs to be wrapped by paragraph
      rng = rng.wrapBodyInlineWithPara();

      // finding paragraph
      var splitRoot = dom.ancestor(rng.sc, dom.isPara);

      var nextPara;
      // on paragraph: split paragraph
      if (splitRoot) {
        // if it is an empty line with li
        if (dom.isEmpty(splitRoot) && dom.isLi(splitRoot)) {
          // toogle UL/OL and escape
          bullet.toggleList(splitRoot.parentNode.nodeName);
          return;
        // if it is an empty line with para on blockquote
        } else if (dom.isEmpty(splitRoot) && dom.isPara(splitRoot) && dom.isBlockquote(splitRoot.parentNode)) {
          // escape blockquote
          dom.insertAfter(splitRoot, splitRoot.parentNode);
          nextPara = splitRoot;
        // if new line has content (not a line break)
        } else {
          nextPara = dom.splitTree(splitRoot, rng.getStartPoint());

          var emptyAnchors = dom.listDescendant(splitRoot, dom.isEmptyAnchor);
          emptyAnchors = emptyAnchors.concat(dom.listDescendant(nextPara, dom.isEmptyAnchor));

          $.each(emptyAnchors, function (idx, anchor) {
            dom.remove(anchor);
          });

          // replace empty heading, pre or custom-made styleTag with P tag
          if ((dom.isHeading(nextPara) || dom.isPre(nextPara) || dom.isCustomStyleTag(nextPara)) && dom.isEmpty(nextPara)) {
            nextPara = dom.replace(nextPara, 'p');
          }
        }
      // no paragraph: insert empty paragraph
      } else {
        var next = rng.sc.childNodes[rng.so];
        nextPara = $(dom.emptyPara)[0];
        if (next) {
          rng.sc.insertBefore(nextPara, next);
        } else {
          rng.sc.appendChild(nextPara);
        }
      }

      range.create(nextPara, 0).normalize().select().scrollIntoView(editable);
    };
  };


  /**
   * @class Create a virtual table to create what actions to do in change.
   * @param {object} startPoint Cell selected to apply change.
   * @param {enum} where  Where change will be applied Row or Col. Use enum: TableResultAction.where
   * @param {enum} action Action to be applied. Use enum: TableResultAction.requestAction
   * @param {object} domTable Dom element of table to make changes.
   */
  var TableResultAction = function (startPoint, where, action, domTable) {
    var _startPoint = { 'colPos': 0, 'rowPos': 0 };
    var _virtualTable = [];
    var _actionCellList = [];

    //////////////////////////////////////////////
    // Private functions
    //////////////////////////////////////////////

    /**
     * Set the startPoint of action.
     */
    function setStartPoint() {
      if (!startPoint || !startPoint.tagName || (startPoint.tagName.toLowerCase() !== 'td' && startPoint.tagName.toLowerCase() !== 'th')) {
        console.error('Impossible to identify start Cell point.', startPoint);
        return;
      }
      _startPoint.colPos = startPoint.cellIndex;
      if (!startPoint.parentElement || !startPoint.parentElement.tagName || startPoint.parentElement.tagName.toLowerCase() !== 'tr') {
        console.error('Impossible to identify start Row point.', startPoint);
        return;
      }
      _startPoint.rowPos = startPoint.parentElement.rowIndex;
    }

    /**
     * Define virtual table position info object.
     * 
     * @param {int} rowIndex Index position in line of virtual table.
     * @param {int} cellIndex Index position in column of virtual table.
     * @param {object} baseRow Row affected by this position.
     * @param {object} baseCell Cell affected by this position.
     * @param {bool} isSpan Inform if it is an span cell/row.
     */
    function setVirtualTablePosition(rowIndex, cellIndex, baseRow, baseCell, isRowSpan, isColSpan, isVirtualCell) {
      var objPosition = {
        'baseRow': baseRow,
        'baseCell': baseCell,
        'isRowSpan': isRowSpan,
        'isColSpan': isColSpan,
        'isVirtual': isVirtualCell
      };
      if (!_virtualTable[rowIndex]) {
        _virtualTable[rowIndex] = [];
      }
      _virtualTable[rowIndex][cellIndex] = objPosition;
    }

    /**
     * Create action cell object.
     * 
     * @param {object} virtualTableCellObj Object of specific position on virtual table.
     * @param {enum} resultAction Action to be applied in that item.
     */
    function getActionCell(virtualTableCellObj, resultAction, virtualRowPosition, virtualColPosition) {
      return {
        'baseCell': virtualTableCellObj.baseCell,
        'action': resultAction,
        'virtualTable': {
          'rowIndex': virtualRowPosition,
          'cellIndex': virtualColPosition
        }
      };
    }

    /**
     * Recover free index of row to append Cell.
     * 
     * @param {int} rowIndex Index of row to find free space.
     * @param {int} cellIndex Index of cell to find free space in table.
     */
    function recoverCellIndex(rowIndex, cellIndex) {
      if (!_virtualTable[rowIndex]) {
        return cellIndex;
      }
      if (!_virtualTable[rowIndex][cellIndex]) {
        return cellIndex;
      }

      var newCellIndex = cellIndex;
      while (_virtualTable[rowIndex][newCellIndex]) {
        newCellIndex++;
        if (!_virtualTable[rowIndex][newCellIndex]) {
          return newCellIndex;
        }
      }
    }

    /**
     * Recover info about row and cell and add information to virtual table.
     * 
     * @param {object} row Row to recover information.
     * @param {object} cell Cell to recover information.
     */
    function addCellInfoToVirtual(row, cell) {
      var cellIndex = recoverCellIndex(row.rowIndex, cell.cellIndex);
      var cellHasColspan = (cell.colSpan > 1);
      var cellHasRowspan = (cell.rowSpan > 1);
      var isThisSelectedCell = (row.rowIndex === _startPoint.rowPos && cell.cellIndex === _startPoint.colPos);
      setVirtualTablePosition(row.rowIndex, cellIndex, row, cell, cellHasRowspan, cellHasColspan, false);

      // Add span rows to virtual Table.
  óe´=æÍgwÕl§8Ï¿õæşoŸ5ğ4~»÷|ı`ö7åµ¸*Oö{:®§ŸOİÖÇŞ–ø¤¾ŞrÃ®şÙ_Ê>ºÄ~Ê±×üã?ò~xŞLîâ×ñû÷¼hó{×Ó©¾±­;}Vu]¦Z¦‡?96İ¾»÷Òº´Í-@Ëú¾{^âó  |>Tq Â¢ÍCMX"„‹	( @20HĞ0G0Ô:ËM (P
©>ZD Å€æ	”D"0DG‚¥I0T¤Æ… AŞK€é5%˜¨ˆ´¨Ô4%-#p…l  @Ñ È Kˆf	²€(¬D8 ÎLŒ´-¥è:M…ˆ Yi 
 #6dŒF!
ğ*IáX,$.Õ`D-DÀ.n 0‘`Jr	  @ ğ§AÒ†¡ÅÂ `	Ù# @ÿB`Ñµc@é	C,¨‚¢
‰F…±0¸{ÅëgKèÏÓ·bNÊÛçÕé“Gä½W şMwBşóïÛ÷3¨¬ïñ°ğ~f\^ïığ^ø^n3××Ô/ÏZ§úøwß/fë-÷Sní¾«j‹Ó×›ÿÔ/¼_u
q}Şj©nsyø_‚ÙŸŸè«³kƒÿØïé~Wù{/O$º ¢ $@$ #ˆèXu+’.M@c`²#‡&HŒH
fHgpˆ	†¬G£{B–XB²°0ª9®8À)I?Ä9b@À Ëğ€F‚
jjòBF"CQ}0J°F  9@<B
Q. ÓD„Ïí}‚—’I§ô7~Û»ç×5ù¯şJ­\ÿù³#ÃŸòB×Ãªu’¿yŞÏ†ó¶õßwß•_Š}ğ?[ŸŞW‚mîN§ô÷ë¶ú˜«ä_é¤ÿı§çÜŸAw%Ÿ•3÷cÇÿ4÷Úé÷#Ÿôw¥˜m£µÂ:Ú±{ß¢ÿw¼qñrë·}^}á÷ÍEµŞoßÕ¿73<Ä<›Ÿ.OÆOÛÙßİõGØ÷Fïëı™_Óoï'ô‰Ù4´şjË<‘|ù73­ÚCÓ'ïo°ÿJ!È#çØ*¯#²G¿¦;ÚÏÿã·—7÷õö¼ÿ¯ÿÿá9şİs_÷a	$6!álÁ,p!Ñ  D€PØ"’C	Á ¨kÁ…X81B %†
… uÒF˜h 0`¢Ğ q€@@XHŠQP‰ "ğ‚ VÈ‡() ˜Q$@(P €AT$ØB e
ÈÊJ…0õ÷¾Â9fîçŸıG·şê½ıÖ\o}ßû_oö>EŸùÒÏóxrÛïõ_ìÛ²='m·ß^ŞwÅŞå‚ó9'°ì_İŸ+Şæözú½ãt_ç¯ÇwÇ÷òkËûŸ¯êÏïW×øKï›ß¡É¬?Ş¬·_€^æ›é}ãÂÏáßş’İ»Tœ_ Z=tq   <Ä(Ji€jPAˆ@Š<<.JBTLj±€	¡³.˜B“©	 jÓşÂG„Á Ib J!ÀO)Ö €ØFr0¢«5 n@<‰BÃ2è%x@A¤¬%ˆˆ!Å2IÈEÈ@ xV ñ†DReH±âXĞM†…d ‚ú§¢I’P1 $ ¬Š.-#UmŠ@$J@PTªú…D% Pp	§	@C‚áğ¯4(Ëˆ3 J	r]
!	XØÈ)à– ‘!ˆ ¡%Á—}~Ÿ«98œÿÃiòı÷½%S×v0Mªÿ©T"oëßßûÓWÄçŞG—uF+ô-ïı¿õÛœ•ıRıSä~oôùçÛ‹úùÖÿÈü³Ï-ÿ8æ3ÛşÙ½_?§èÖ†ïÿiøñOûßÚ†–ßüOşpßZÿÏ¶-ºBQŸ`D@9˜©”6( v¤ÅÀ B UG ‘£À	cMÄ šÆ,aXGÄG*B*‰¢À+1Ã„j@M¤Pm¨ b©LÑa!…²l  q3$Íş¶#òŒXT ÉK´ƒnC CFx¦€‰"µÎÒ?Uko…Ÿb»ààÇYºÎ­Â«ß‚ıøuÍKÿÿüïTİ¾W‡Y?~º[)İW£·K{g’„³ºh³Õ¾.°¿;½Át«O¼;¿ÇúÏc=îÔ£uÛº-:˜5çàúwéçõ¥Rºnôzş§¯÷çÛnvK{ŸãMùÖíùºJ-{,ä]Ê˜uò7ö¨ÏaNë=y¯ö­[éöŞÈøS*ú×³çĞò½Â3\îôüÓû¶°–Ï­RU•½I±ŞmğíR¬ÿ÷ŞÉ’1n]í÷‰/W<¡½õ®N»]åµ™¯ÙV€ëw~ÿ|÷z'÷DÖ–û5ÌÿFG‡Ş£³GëûßĞ™piTQr
p!FİÅ‘ c\p„´ÀyXÃA %(%H,¯ ‚(q®@F;Š"¢nàC Ã`Œ@0ÖUñ˜x@z€Dòí‡ƒ€„@SÊj‚(‹Ö´z…D¾& %¶"D A" ”€"ÙàZÚî~ÈwëºaŞw{ÔÒûùR<{ûyyÛá!;¯Ü…ÇÙÿ¿ç¤%›î§Enò¿å®›%C¿µ¿6X2ùRù}^½)ûUîÇn¼µ´÷Ÿ,<Ş‡±eù×6mû•óól‘àWfíŞãòûWÊ\ñ½û/µÜ×CÙ?VÏÜ€ù]úï±DÔ†@ È@Àˆ`U&€ü¥°f”8‹°#³Ä>‹E¬,T qo$8š .H  	~ˆ i «PÊ„+0‚ ÈÙŒHQ€
„Á¹ÜË@8Ä²ƒ¡DL0¨B1AˆG’)Ä8 lJ2L©ŒÕŒ j˜¦AĞ@+ğe LX¢9èdg9•r´
k º0‚P“… ‰DÈ)1€ p†A&TD+4¡D€¢`ˆ`	Ë,-° à=01	‘ĞZT…EÄí‚PA‘
“Ğ„
>DO)Á €î0ÄMß·jO]gÙÎj‘ôÏ¾¯ô^¹®œ-ÕÄ¨k÷Ãæ7ôoo©ı‡õü™xÍşõ{ŸGK¿şWv¹ê	>àùßv?=åÿşûÿç^[aä×wñ¯ş[³ãofá_ö½ìgnˆmû9‚~=qß“ö_çÛtdsskY»šÑIŠôB@(¸GĞÂAƒ'‘HP„ E`…’¨0Qc–#€	D' .Áõ¨8H > AÒ\ 
 ¦D´DC gD€;};âÈ\¡ˆ
HŠ %r	À´	Y@AÚ$4Pb@…C" 0°É£`ùÏûİmÚoÍĞ¯e:wn Fù4ïÿ;şZò¸
m»ãiG×÷íëÛ_ñrÿÇ<û7­Ù–ÿîÑã6-ûÿşoòì¯gúG‡¯ìµõeû5¥^È#Wke&÷;õ•7'iîyºÛÓ»µî_Ô{ÖeİèYß6QÙdOnôæÂºWŸÚ7j©‰Û_®vNßLİ;X™ëz¬ª¨ï¿†*Mã>?_´ÿŞ9“ñ›ízõ¯S~rÏ±üZÕ¿Ğ–›²›ÿíş¡?ëÑÃ‹eG×Eôî¾wx–og×}ç¤v»şûZøá³Elÿ7µÚ¿[ïê>ÍŸ÷7á{eÂò>5!“!Ñ@X.B@dF$:ªÀ	Pœ%„ t ¢`XHÆ²iC@Æ&…@ F• …*€+DÓ 
È¨]@$ĞB€
â XQe+¤ ÀC”@ †8)N¸ d& ŠŒ`"TQ*`t”_†)ˆ0'	Q½?ïJ?.ïhz£j–Ç‹xö¹]KôJ›ùïûZÙ­Îï‘~A8æıå¦øtw{ù­¿îùwû]îÚÔgşÿòıSOß»%íOşªÓom³Ö³€ÕO¨R6ÛÇ¯¼Æ/#ŞãĞ®[ÊÚßã¾”î?¶ê?‹Ì{¿½æa¿¯?X´åø¿ï¢É…>`ÜäØK‚zÇÑJˆ"´„’ ”@ÔÂ¢,‚Œ ¡€ @à8#dTƒ 2 0j…"X‘$ƒÄ @QT¥$ƒ… a© $— >DálŒÛH€  -ŠD@Ñ5€Âp¼˜¡`‚PL° ¸` Â`,T2D > ‹C4A ¨¸ƒ¢	F•€Ä\Op.¥5„$¤ ĞQ@IÈ€0E ÀK¥%°  •€Y©$!40¤Q$HÀ¨ ²¡€ ^$‚†ªšÀH8jˆªÀ¯ğr­†çwqõ‘¥ÏmŞeE'å[„ãVö{ö‡»oPÓûì}üÿûçw;îîşuu¯·Û<¿Û£Ûú?­î¯ß&s¸ÍÎÔ/úë³#ËOÿúÖ[ßû~áó'â¹Ôê*ş¶‰jÏı÷íÿËİ‹J×’Ä½Û4è¿Ãïh¯ïÏ P+B `1ap¨ 	#øM!ì>„H0€c"@\A\!0 G˜ ‘H±Ô½‚(È¤  
¶ú%°as 4ƒ£‹,0DÎÆ`Ò@€JàK@†@9>Ü L…”5A£$Œ	‚ ›ÿÃÏ÷6·ë»°Øÿ¢½¾µïğ^}²º¾:ƒ_Ï¿«àéı~ŸG÷øı}¶ı¾Zùæs¶®Ûß×|Gû&3ã”~ËK|Uû7+¯ïÁÛáûå¿Öøeó÷ô¿ş¼Šr¿í¶qsJ1/ÎÿÙ]³ü¿W*Şæ÷Úú7ï³vÊV_¦çÛ¶Ÿim¹óYÔÿ1{ş6§ßòÅ¿{‹/ı«gäÓŸÿ;Û‡óëß®ù.Ñçÿ¸½í•ø?wkò-OJñWcÕ{·İ¯ş}sİGÈ;ñúøıŸRßKk_YñKëÓÙÏ±Ú_õoÌkø¼*Ç^¿íö:ÿÏk²wşæ{şËõüfô·ûÇ#	é`ÀªP#@'E¤‡BA %!
¢â(Y D„UÙ> 1è-€h!B ‰"  €­¦ˆ/è #¨M’€,ã#9!À’  á9à'’Â@ ¶ÀcIs´ X˜£D  e@ion = (fixedCol >= 0) ? fixedCol : actualPosition;
        var row = _virtualTable[rowPosition];
        if (!row) {
          canContinue = false;
          return _actionCellList;
        }
        var cell = row[colPosition];
        if (!cell) {
          canContinue = false;
          return _actionCellList;
        }

        // Define action to be applied in this cell
        var resultAction = TableResultAction.resultAction.Ignore;
        switch (action) {
          case TableResultAction.requestAction.Add:
            resultAction = getAddResultActionToCell(cell);
            break;
          case TableResultAction.requestAction.Delete:
            resultAction = getDeleteResultActionToCell(cell);
            break;
        }
        _actionCellList.push(getActionCell(cell, resultAction, rowPosition, colPosition));
        actualPosition++;
      }

      return _actionCellList;
    };

    init();
  };
  /**
  * 
  * Where action occours enum.
  */
  TableResultAction.where = { 'Row': 0, 'Column': 1 };
  /**
  * 
  * Requested action to apply enum.
  */
  TableResultAction.requestAction = { 'Add': 0, 'Delete': 1 };
  /**
  * 
  * Result action to be executed enum.
  */
  TableResultAction.resultAction = { 'Ignore': 0, 'SubtractSpanCount': 1, 'RemoveCell': 2, 'AddCell': 3, 'SumSpanCount': 4 };

  /**
   * 
   * @class editing.Table
   *
   * Table
   *
   */
  var Table = function () {
    /**
     * handle tab key
     *
     * @param {WrappedRange} rng
     * @param {Boolean} isShift
     */
    this.tab = function (rng, isShift) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      var table = dom.ancestor(cell, dom.isTable);
      var cells = dom.listDescendant(table, dom.isCell);

      var nextCell = list[isShift ? 'prev' : 'next'](cells, cell);
      if (nextCell) {
        range.create(nextCell, 0).select();
      }
    };

    /**
     * Add a new row
     *
     * @param {WrappedRange} rng
     * @param {String} position (top/bottom)
     * @return {Node}
     */
    this.addRow = function (rng, position) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);

      var currentTr = $(cell).closest('tr');
      var trAttributes = this.recoverAttributes(currentTr);
      var html = $('<tr' + trAttributes + '></tr>');

      var vTable = new TableResultAction(cell, TableResultAction.where.Row,
        TableResultAction.requestAction.Add, $(currentTr).closest('table')[0]);
      var actions = vTable.getActionList();

      for (var idCell = 0; idCell < actions.length; idCell++) {
        var currentCell = actions[idCell];
        var tdAttributes = this.recoverAttributes(currentCell.baseCell);
        switch (currentCell.action) {
          case TableResultAction.resultAction.AddCell:
            html.append('<td' + tdAttributes + '>' + dom.blank + '</td>');
            break;
          case TableResultAction.resultAction.SumSpanCount:
            if (position === 'top') {
              var baseCellTr = currentCell.baseCell.parent;
              var isTopFromRowSpan = (!baseCellTr ? 0 : currentCell.baseCell.closest('tr').rowIndex) <= currentTr[0].rowIndex;
              if (isTopFromRowSpan) {
                var newTd = $('<div></div>').append($('<td' + tdAttributes + '>' + dom.blank + '</td>').removeAttr('rowspan')).html();
                html.append(newTd);
                break;
              }
            }
            var rowspanNumber = parseInt(currentCell.baseCell.rowSpan, 10);
            rowspanNumber++;
            currentCell.baseCell.setAttribute('rowSpan', rowspanNumber);
            break;
        }
      }

      if (position === 'top') {
        currentTr.before(html);
      }
      else {
        var cellHasRowspan = (cell.rowSpan > 1);
        if (cellHasRowspan) {
          var lastTrIndex = currentTr[0].rowIndex + (cell.rowSpan - 2);
          $($(currentTr).parent().find('tr')[lastTrIndex]).after($(html));
          return;
        }
        currentTr.after(html);
      }
    };

    /**
     * Add a new col
     *
     * @param {WrappedRange} rng
     * @param {String} position (left/right)
     * @return {Node}
     */
    this.addCol = function (rng, position) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      var row = $(cell).closest('tr');
      var rowsGroup = $(row).siblings();
      rowsGroup.push(row);

      var vTable = new TableResultAction(cell, TableResultAction.where.Column,
        TableResultAction.requestAction.Add, $(row).closest('table')[0]);
      var actions = vTable.getActionList();

      for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        var currentCell = actions[actionIndex];
        var tdAttributes = this.recoverAttributes(currentCell.baseCell);
        switch (currentCell.action) {
          case TableResultAction.resultAction.AddCell:
            if (position === 'right') {
              $(currentCell.baseCell).after('<td' + tdAttributes + '>' + dom.blank + '</td>');
            } else {
              $(currentCell.baseCell).before('<td' + tdAttributes + '>' + dom.blank + '</td>');
            }
            break;
          case TableResultAction.resultAction.SumSpanCount:
            if (position === 'right') {
              var colspanNumber = parseInt(currentCell.baseCell.colSpan, 10);
              colspanNumber++;
              currentCell.baseCell.setAttribute('colSpan', colspanNumber);
            } else {
              $(currentCell.baseCell).before('<td' + tdAttributes + '>' + dom.blank + '</td>');
            }
            break;
        }
      }
    };

    /*
    * Copy attributes from element.
    *
    * @param {object} Element to recover attributes.
    * @return {string} Copied string elements.
    */
    this.recoverAttributes = function (el) {
      var resultStr = '';

      if (!el) {
        return resultStr;
      }

      var attrList = el.attributes || [];

      for (var i = 0; i < attrList.length; i++) {
        if (attrList[i].name.toLowerCase() === 'id') {
          continue;
        }

        if (attrList[i].specified) {
          resultStr += ' ' + attrList[i].name + '=\'' + attrList[i].value + '\'';
        }
      }

      return resultStr;
    };

    /**
     * Delete current row
     *
     * @param {WrappedRange} rng
     * @return {Node}
     */
    this.deleteRow = function (rng) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      var row = $(cell).closest('tr');
      var cellPos = row.children('td, th').index($(cell));
      var rowPos = row[0].rowIndex;

      var vTable = new TableResultAction(cell, TableResultAction.where.Row,
        TableResultAction.requestAction.Delete, $(row).closest('table')[0]);
      var actions = vTable.getActionList();

      for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        if (!actions[actionIndex]) {
          continue;
        }

        var baseCell = actions[actionIndex].baseCell;
        var virtualPosition = actions[actionIndex].virtualTable;
        var hasRowspan = (baseCell.rowSpan && baseCell.rowSpan > 1);
        var rowspanNumber = (hasRowspan) ? parseInt(baseCell.rowSpan, 10) : 0;
        switch (actions[actionIndex].action) {
          case TableResultAction.resultAction.Ignore:
            continue;
          case TableResultAction.resultAction.AddCell:
            var nextRow = row.next('tr')[0];
            if (!nextRow) { continue; }
            var cloneRow = row[0].cells[cellPos];
            if (hasRowspan) {
              if (rowspanNumber > 2) {
                rowspanNumber--;
                nextRow.insertBefore(cloneRow, nextRow.cells[cellPos]);
                nextRow.cells[cellPos].setAttribute('rowSpan', rowspanNumber);
                nextRow.cells[cellPos].innerHTML = '';
              } else if (rowspanNumber === 2) {
                nextRow.insertBefore(cloneRow, nextRow.cells[cellPos]);
                nextRow.cells[cellPos].removeAttribute('rowSpan');
                nextRow.cells[cellPos].innerHTML = '';
              }
            }
            continue;
          case TableResultAction.resultAction.SubtractSpanCount:
            if (hasRowspan) {
              if (rowspanNumber > 2) {
                rowspanNumber--;
                baseCell.setAttribute('rowSpan', rowspanNumber);
                if (virtualPosition.rowIndex !== rowPos && baseCell.cellIndex === cellPos) { baseCell.innerHTML = ''; }
              } else if (rowspanNumber === 2) {
                baseCell.removeAttribute('rowSpan');
                if (virtualPosition.rowIndex !== rowPos && baseCell.cellIndex === cellPos) { baseCell.innerHTML = ''; }
              }
            }
            continue;
          case TableResultAction.resultAction.RemoveCell:
            // Do not need remove cell because row will be deleted.
            continue;
        }
      }
      row.remove();
    };

    /**
     * Delete current col
     *
     * @param {WrappedRange} rng
     * @return {Node}
     */
    this.deleteCol = function (rng) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      var row = $(cell).closest('tr');
      var cellPos = row.children('td, th').index($(cell));

      var vTable = new TableResultAction(cell, TableResultAction.where.Column,
        TableResultAction.requestAction.Delete, $(row).closest('table')[0]);
      var actions = vTable.getActionList();

      for (var actionIndex = 0; actionIndex < actions.length; actionIndex++) {
        if (!actions[actionIndex]) {
          continue;
        }
        switch (actions[actionIndex].action) {
          case TableResultAction.resultAction.Ignore:
            continue;
          case TableResultAction.resultAction.SubtractSpanCount:
            var baseCell = actions[actionIndex].baseCell;
            var hasColspan = (baseCell.colSpan && baseCell.colSpan > 1);
            if (hasColspan) {
              var colspanNumber = (baseCell.colSpan) ? parseInt(baseCell.colSpan, 10) : 0;
              if (colspanNumber > 2) {
                colspanNumber--;
                baseCell.setAttribute('colSpan', colspanNumber);
                if (baseCell.cellIndex === cellPos) { baseCell.innerHTML = ''; }
              } else if (colspanNumber === 2) {
                baseCell.removeAttribute('colSpan');
                if (baseCell.cellIndex === cellPos) { baseCell.innerHTML = ''; }
              }
            }
            continue;
          case TableResultAction.resultAction.RemoveCell:
            dom.remove(actions[actionIndex].baseCell, true);
            continue;
        }
      }
    };

    /**
     * create empty table element
     *
     * @param {Number} rowCount
     * @param {Number} colCount
     * @return {Node}
     */
    this.createTable = function (colCount, rowCount, options) {
      var tds = [], tdHTML;
      for (var idxCol = 0; idxCol < colCount; idxCol++) {
        tds.push('<td>' + dom.blank + '</td>');
      }
      tdHTML = tds.join('');

      var trs = [], trHTML;
      for (var idxRow = 0; idxRow < rowCount; idxRow++) {
        trs.push('<tr>' + tdHTML + '</tr>');
      }
      trHTML = trs.join('');
      var $table = $('<table>' + trHTML + '</table>');
      if (options && options.tableClassName) {
        $table.addClass(options.tableClassName);
      }

      return $table[0];
    };

    /**
     * Delete current table
     *
     * @param {WrappedRange} rng
     * @return {Node}
     */
    this.deleteTable = function (rng) {
      var cell = dom.ancestor(rng.commonAncestor(), dom.isCell);
      $(cell).closest('table').remove();
    };
  };


  var KEY_BOGUS = 'bogus';

  /**
   * @class Editor
   */
  var Editor = function (context) {
    var self = this;

    var $note = context.layoutInfo.note;
    var $editor = context.layoutInfo.editor;
    var $editable = context.layoutInfo.editable;
    var options = context.options;
    var lang = options.langInfo;

    var editable = $editable[0];
    var lastRange = null;

    var style = new Style();
    var table = new Table();
    var typing = new Typing();
    var bullet = new Bullet();
    var history = new History($editable);

    this.initialize = function () {
      // bind custom events
      $editable.on('keydºt¾Ï¾“¾ıú¿ï,ïäõªïnûn
ö]ì¶¹O|_íş„×uäö`ıùsßËöÿåœÇ?ï÷~ôÇB¹N:ÃesFkßzï{äâ}Vùo(¿ŒñcúOÇ#²*6‹õ5&ßÀÖˆ\úM_ûŸ?YöºÁ×¨f/­ÿİ_Ùı÷jÿ¾‹DÄŠÓ M €% @ ¤	€ " T 4Ä€œ”t4Œ @Í †  €À©\2A°
„6‚)è‚%1P&Š@`…Häi"£ø	à Ô@À Ba‚h€„HËÈ@vE*xˆr€à\  ‘‡R8J `2¡%!P&*Àp,C’ Ô‚èC ÂE@+ ` ›°¶(AÂd < %&1 fAPƒĞá…€FH
ØÑ )„ØdÀ‹‘CHÀYb”	 AŠPÅ,r@# Ş ! €ğÚà¢yúÉ?üyÎew÷]×›Ë÷£öwÿI™/1ü/İL…|Ï®ã5·ü³VÕ]{Ş©Íç/“H|íá~|Ó»ô”‹6>{÷<é™’üıÍ+1Ûµÿ¾ÙÙ½Ñ¤ÿ[ØûîúşÖô§‡¶üß±Òv·ìÔwŞ}ï=Øş>6èõô #dX"È ¢á@B$”16‹1<X®3b@II’Œ&¨?aYŒ¢Â¶+tÀ‚D™ Š„@H@¢C¦ À åL&”ãBdè)rm9ˆJÁq@ DäRØa¢„PĞ†°tJ€ D ùD¨~ôş_ñ'¨g jùÅ÷óİu?wÓşš¾éî&ıĞ{{Ïñ_ßú}3k×üšÿíwÇä…óµçëY+Ş]Çß-'Ú^ëÖWŞÜ¿òÒ¿GšéÎ«ß~Åüwsÿ+7×¾­›s;ık±ß·«Üç5†,ñÇîw8ù÷ÿ“ÿz¯4&óò®Ÿ¿­×`oİ´ï§‹ïÏY´üyëÿKÎx¿û÷¶ó[óÏõòõòş¿¿ú"·¾}ê³Ùkˆ‘'zÓ´ı^ÿï|ÜxüÑïíñİ›Í‹UïK}_ñt½qW}UÔ¯Ÿõ.õE_ù}£"|‹C·©èç2)½ÛAòïëi|÷÷ğï¿ı{IMÇ¿ ø14€ €±¤Š  D„J  -!%00$¬d@ (@@ãQ°"@$‘áKˆ.‚I3 ÅX¤ƒ)4	D$0 & SXDğEGBAB½åHì`cÇB+ —ÀJDÊF‚ Ğm(ˆ—“Ş¢SŞµJ/šåß'jı^m—ÿ·ŒFQ^ú[Ù9‡ğ~]Ú®ı}³l|·{Kéu×	!Ø·i·bé\±õ‚‡…Õ{îß·Š½Ç#¹Ô÷]—û^ö„½w.ÿõ}wãÿT;µ?ûYä´º/,»æœÿó›Ï>úÿ»¿f;_#Prÿ¿µ¹†ğ‰il"òd AŠƒP Ñ¬
YPˆ Ôv †	*M»fL– .T ”HPH€â‚™ˆPAAˆB æ°§ 0´À€€À ˆâ R€@	 è5£¢Ê D Ô0PÂdÎ`@zG¢Ì¢Lş€#B& ‡CÂRÀ"QˆQQ1$ ,EP¤1uÆ #ãJ €ŒcLéDŒ
2‘(ò ˆR€A†Q@ˆ€HEœHI %ĞR$jG €| 
< !Dl˜Šº‡E ¥@¬Ÿ åµ08€n&…vP2¡AKæGï¯MO»Ö§k!ìdï~sßzÉu³_±şõı§ı¾\å.ÏÒô‡Ü]İ¯Ë'Öı9İ_ÇúÖÚ¯cûÜÒ;Îoúçùógò_[»åÆ`ú½ô³où‚ışıÿß™a†ïŞÍæ¼Uÿõ¿›öñ)S~ÌïõÊ^ks!¯‰æ{øë­6ãH’¤ªU_Æ8 	apÂ
°ˆ	–~/”$ „( I.PF	P-3&`ì!¤!À 0W…”*D Á(À"5` Á<2* 0«:€."¨	iiHUf@vD:¤ïZ ¤&f„jÅà7ZLİ¼š)˜Ï=æ*ôşÍÿß\µ»ûûykcù¾zóµÑW½¿ëË?G¦;o®g¯ûWÿ'ûï>}»Şû»ñ9ƒÖkŸKœ…·?WĞ–ßô²™;Îëïìó…ü7æ’ãÒ¶òÌ&7½ıöºî˜ì‚óí/Û‹±ó¼¶¿y{Ÿã“¤³ñVûgì9ã©ß4¾³²(vGbÈ7ÜSÑRm7Î½üúm{íİÿ³ûö+É47õ|­ûşQpóÙŸßéûõ´=Üıë[í¸¢…{ë´£÷;|ë¯nËÙÛ7Üÿ{ü¿ïg–»ï]yÿÉíöö«öñd[}ÓØóıÛ—¾6ï[Şü{™Ç_Ïí´KS@5ÁDƒ"@TÂ¸!R€Á D
¡!Ø €ZĞÈBfB ƒB2% (Q•(°ƒ‚!&¨UU:>©&i mC8HB NÂQ’KMƒ'xæôP@$Ø7$Ã€Ğª€DRD@Á¿Xˆe44÷şB­ÿ½iâŞÎ»ÿ±kKÒWwšI››Ô¬§+ûÿnâ¹?]f¾m¬±-º_ûË¾åÎ}÷÷?+L~öÏ{ßgùëéÿïÛd­Çá;|zïäÜÙÑ­íŸ]Œ{O½ÿkÜ¶¿?'Ï^ÇŸİ|úßï¾{ßûÙ‰Œ/ÒúÁ9»?ÿV“ˆ`Tçp±‚,Î@FÂˆØ	tBBÈ–ÑD(r¤8ˆJI¼0‡‡h!  åz ‹À–4da4’ À0$€!` *b( Ã»¸D 8A@@º  ğğÅ!êBÔÀ1 *D,2‰"@-DÊhµ	E’ 6@ˆ‘€0  „a„Œ	ä EÑP]ª`†‚€•™Šlº‘k 0~A `X "„¨€Ğ@(ĞÃÂÀ*V£eD¡J0Ğˆ"Q(€XS
 Y)+î½+GrS9—ó‹û…[]ÇEø^Asõ¶ëîÛ>µ=É;Uü¯ÅZİKó¶’ÏpVûoûÏõgvşşîıï¯üâ«çqqöö7=÷“}ZëÎÿ‘"1…í'ÛŸó=Ÿ]KœİæãğxoÚæåÓµ8şÇ³Çôú[SßmÑBPa È)(’GMÀ 5H‰ .  @áğàŒ(ä	Ñ ƒÑC@Ğ0!m€/@@ÀQ:„ EQ´)a@²¥0c…  "NiSMf,æ%+@š ”Ä0$‚ ÕÈ!á`"!DĞ•.øÇÏ}§Ñ×W9³äx\¶ß3<ÿåÇÛc¡}ß¿|¶½æµD±Ç¿£º|ÿİ'r+ÕËÿ};ÇôÃæÕgï#bµtwÏ/ÎœR>~Ç®gT÷¿³õŸóÿıè6}7î¿÷ü¶¿ç÷šî'ü^dß—“ëæÚß­_rÍ™ºêïvé¿ğ×ï½¼­í_Ó·÷ïß oıİÓÏííÛÌwû·ßSW­¼øîãßıâÌı~¿şhwú}Ü÷kîİúúnß®¿ÏßMt–œ‡ÓšÎ/y¿¿ßı~ÜÎ5Ú¹M{Òò_ïÿ?[?7öÛ–ü¿ß>…¬9Æ¾»õçs6~Z·÷±ñİ•	€AB2@™C`‰*’ ˜ãÒ “Ñc@Ê L0Y ‘&"@°A(@(ˆˆ ñDŠsº)B*°1GH1àQY˜ÂE É0ˆ ‡pX!D¢¢‚ 3@€ `@.«Ç 8Qˆ€1Š µõÿÏÿı­íşÏ;—ÏêûcöùZu¹Y¿j½åæz‡ÜwíÙùìøªÛ7}wzH§šÇß7÷o®¿åîı'Ü{¹mê\õé¯WûÜÿŞlŸ?¼¿-Kõ¹¼ıÏ¾Ø±íÊü»<Ü¾ƒ¾¿/dÊê+ÒÕ?wÈŞÒ§ğïi¾O÷>®Ö˜AÁXÄ¡AcFI‚óJD*@0†¤‚HP*à5B ”€9d 	™ €EqI0/BÈE``0ˆP‰°	h A´„ÈŒødÄA¨ NsEª`Ó41è!ˆ¬€ğB $I¨ƒTÒ† 0TVRH€L4¥B¡±A¤(A†$ÒlÑ¥‘m 4 ĞˆQ$  Éø0‚` F“cdPdHˆ Ò>çC$’{€.‡Eˆœõ¡À…Y’„a¤„`ÌX¯„!@#(Gğ‚Hû¿w¢2F:–¹ö¾éÛ©û›¿ƒƒî‡ïæ¿Póz0òòë_®Ë~ŸíW½‹;ø—îÿÖóºi½£ñ£×|v¶Ç^7ëÿËÙÿoï÷ßİöÛ”õülşÿÿÓÏ»2Ş»}³_ÜìŞòÎõ»QZÎ¡İ§²;>ìÔ{k¶Ÿï.ºº•ƒ¸ˆ -„# )”!  ²€ ”„*ˆ"ÀD¾ Ò  	0ÈL	ÇF*à”-ˆQ€ w\ dˆ:F! h E"‘ƒÁ¨šHC <„ ÌaÅ1qQ#Š¢cc0É*UqXÀ@PgÀ„<ÇH	Ò€˜d^¢ íô<Í-ïÿvï¼|ÅÏÿÖî÷ÿË'öyÃë+wóßÿS¤şß=Tû5^ñŸõë¯‡°ivåÿ5üóiİ]}'ıªku_í¾}ü›q§âÄrõa?´Ş·/™öxï·öëlßq—é·ï_õØök·n†]gÚÔ×9O·öìä{®ÿ}ë{İn?²ö{?ÉiŸõ¹·÷~¯á«G›3ø.·µfÖŞÿ½óCrF“÷¯ïÆ_úä¿rşíeodÓê§õ®·÷n¥ÛÜßnÙ´zC½¶’,g¸_Mş¡Ì|¡½|{îy\ÿ{98·û·ºú§ùòqô÷~ír›ï¹³NzÄVÿ¯ò`fƒœ †©ˆô€ „KBE¬ lhÉ  D  	!Œ…BB&Úˆ‘(! ‚F‰5š'fÒ”AÓe®  –pRà@D ¨À	 I pÖ„,¹V¸‚¨ i² Y˜[ ˆ8"DğQ˜‡ PØ¡@¤[^¤IÁ0
)@äm	F6	¥$‘2  @4aÂ@ b%—’QÖ„^r^¨`† ¨ò¸¸£&ğ)JÎ% @+ ·ÃúÃ0L¸1ÇR8Äµ@ ¶M5ARØ¤ ¨Á‚Œİ€@ ë—¿±×Lİã~²şÕ³»ûÿÿ_¿`Ã«0ÿ=²şßKÿ«ıñB[÷òıßİ.Åù½uãû×íßmşVm\ª±Û÷‰y÷¶+q‰õ÷,÷³¬ÿ¶üÿïÙm]_Ÿ|Å{›mû}½E×vÏ¥{ÌÓ~kßk±oN³ããÿÇÿû§ø—3ôw½úş~Œçõ–şÎÌ§W×]õsMš¯_ô÷ÿoÿ)xzîáyúã–şÊnÃoĞûï÷ïëj®jÖãTâSD½Ş-ótHg§½æõÊ1sßí9/»Ï¹öúÎÿ½Z¿²tï¼7RW·2ı…Å^Oü4ïNõ%ºõ½ÛŞ¹÷¥Ğw¦(´A‚3"“hˆU”™È™€Àô  E@´
BBšÀC$ $“¤hM€¤%l	™‚Ô›x0Œ§H#p„PñB¡6‰‘ò IA s ædè@€HB‹+F ÔRPè2”œø!Z9 Öéşìõğ;ûíÔÛ®äuw·öx™xóiÿ*»‹ÿéïGZü}ùî:ÅH¦õ­ºrı†ò[Gêş®ÎR¯}+êÉ5é¿ù±zªwßãSç
ıºÃ–uó·ïß=rŸşëOcı•yÏ§ºÛ¯~şZ«úßùÏ°uıŠêóp½÷ÊOo^éU ‹ÑP¢‚²8J:Q@R‹”‘±«ÀXDL@Fˆ Dˆ‹@T"Ş  a ÕA¡à”b!‰ `Aˆ±g\1«ã„HJtàĞÖl]"ÀĞä±«0I¨ ®IÁHÂ:"h
KPD5£H”RM˜#@¾ÂQ*Àº"ìĞ¢ƒ*á$Ì¸$T‰¦L[V´ĞìÀ$ˆLBˆ `Ø5*IuÊ,È"(Ñ—Ø$ÁŒFÀda	 §lš\šB«!çD”H¦(›	 R¸Ê\JHT `GP	!"°õca)¤@@¢¯À…gõûwöäWŞmÓëì·¦ï¿íöÎ·êü‚û&oy(ı&ı|çwıÏ«ÿÛÚş1ïÇûî5>½üùŸÕšO¼Û7¹ßû.¨»qßáT’ŸëûÜw÷¿ö5œÚÜ×{Ìr·Ä­ø~âYğ~µøóçÚğósŸœ^ìÂ?xÛ¬…çØX_9%:¬™À#4†IJ¨`†d d@À˜ M4TSm²‰(—€†¸q 2EO@!†¸­ Epz
Àª$p@Á¢ K°“B KZhäÎ`†°ÈÀi( è(Äô@ h… A`‘pÄÀäGHÉ®Şÿÿ¶ø-ût·Íùşíú,w*ûßd¡ëïõ°ü·ÿşãÏrÊå·ÿ3ã/ûot“÷Øëø‘îîóÃoúi·'´÷èâÓÏÿ±ŸçmîM¥È«qÆõ=Ç÷ı?×œøºkçyO¹Ü÷w%É7“ÿó›Êº?À¼ÿêßıßÔº}¯Ş›Íñ½şÍ¦Şs¬ßÿNùoşäˆ—®îúÉ}”0ç_ú—ïûóÿıÒ±şğµgîŞÄº'øcW9¿Ç³ÒûUºÅtÍú¿Q‚z7Yr]O²IÿkÓnî¿ÛûyŸÙ¯ûï·Óñ¯õõúM|_ûË¯wÜR)]~úå‹÷·[N}óÇßæÛêæ»¬;¶G©Ä™&#üK"‰)«f¨(Bºb5È  .H)Äp  ˆC¼@­ ,D# 0‚Çz‡‘  D€Q$0I€Ä‘	Z!P@–¨"y#
E!{© †Â %H @t   Ej¨ LU S	 {WVõäYÂÛ~_w¶}íÑİßµzÿ7ªÃ^÷)şëû¥vbŞ1ú;ó¡ªâÿUzÏØûš÷…Eşÿ¯òù~ui¹üSŞÓİ¾ÇÖ|iùıúhË™û½[²GÇçÛé®áïñi½…ŸÜ<e¾Üû„çñO,†gØÏ÷ı^ùÜa" 	‡H2Œ$!nöj‚œO( ±hš‘DÂ‡=#€‚tˆÂÍ‚À0)ˆ+B¸€cD„€$ ¦P¬A,$B0H@ €D¡èH —©°q€¢aâŒ-&4 ¨
„!%  „d¬*€1òÊU°2(*ƒ@$(JHM_ Ì‹˜ÈàĞâ¬Æˆ]Ã h“ "Ä2Œ&ŒeÚØ Z¤‘ÒF:eLºÛÅĞù  jÀ¡¤p™Ä¥W=0‰ ©Tƒ8VBÅ¼ P Æ<<ÈT	df$HB Ë˜ƒè  ˆ4‚z<g¿íµZ×øÖ¨áwwİNøz·Ÿï“ø|¢ŞŠ\sWy»÷ûC¯j.ÿ]•GÎ'ßúı¿sîêé<û«Ãø¸O­S‘»‡î*×¨İïó]»W.pÁãwìùÇTÚÎtşöó°úßvN•šJçíCÅÒî¹Çë»wpİş÷‚xşñÛŒ]»ZÜÑ@¨5§Œ‘NR“)‰‚§UÀÑB$ÑA²°‚ 8ˆ¡/ˆ@ Zj"(8$„‘Àª
C”Ø3 I	ú€ æø0@1DP "ñ  	 Z)(Ö   ½áI dd8Ú`˜©.Ğ®Á@‰¡x{ˆ™€I”œËßŞru¹·®/ímN­í²ïc§ıÔùoy¿ı?õø[7—¾¿_ß¨Ÿã·Ûíõ_S±lÛ¾İ¯½µÿ„«¸õcÌ”·£ÿÌÊíÅìÏ¨>»LıÖûÿ±zşÛ\ä¼¯ım|¾óO»×şÂ¿]İ—{º›’òzËğ«?ûıëÆB÷K¿ûÌ7kËåéïÊpÆÜËÜE÷µGoïñÏâs9»Û½¶ïïq÷—;©8i?hvªìÿ÷ıõVôøwÇÓt÷{µ¿—oÂ;íyş¬ùë³³eİw5iİÓYs±ÿ{Æ¿«]´·ıÿËqÚı¿»’ßOÖ‘b’ëâÎüOøäw»_ozdÜhA¡X,€4¡]A£0ÄEp!eÁÈB3FbT†t¡„ä!()ãdÚc¢  ˆÀJÈ ½D`MA1 EHÊAJá1 p[	Ğa`€#pƒÀŒ@@B•Âàp	d!Ğ¤@ B1’$VïLßvV·l¬mÓüqö}ö'ÿ¯ßuÕ¿æòãb…×û_c½üoÓmÉËKûè¿7ÿ:ùÛõ3Ë÷şÿøÏû^Zï}÷Œ‘_×Şg×ÿİrİè{§UşÊíi¶«¶gúšKUë³ó[ş{ëÍÿ#zËG™W7¥G«¿Xö¿èvø­ıqÑwê»ÿÀQ‰I¥%$cx‘B€´K*Y1ÁÀ‰Š HË À*™´53HH@w¨
Ñ	@²4R®:$( €†@@¡‰d?„T9ˆ> ƒ … š©‚½I¤b‘°€@	F€²&„ÔHr4‘ ´0 bPHàH#”¤*@ê"Í2B¢€ê1`ˆˆ7=Q$. ¨aB]D‘Ÿ@…À€ Ó”À¦D Pr#-yJx 
àƒL-±. ĞZÃJ6¡B¢‰DÇ(Ï äCSÃ|L  @…`)D‚­ò$q ±‹~ŒÎMÿPŞÒ[û_MÔGÌîá†n§ñ}_y7?šUl?×•3\§?éöä{RŸëøşñyßÓ>¶¹÷üBwî›>9½®_ªï<gÄßi{û8ú?İuûŞwÚ'ı¿ö^ù›÷ÉêÃıs×Ooåg¯º¾R8òLmämkßı¯5fÿš—ôîÕ\¥
˜™’ˆbC0aP óAHW0 `”(#‚JD™€dŒ%„!Œ”HÑä„!!€Gˆƒ1€N"x´Ä€ÏˆŸ Í,K	ö9CŒP2( è\4 hˆ¤" Õa€“ÑÒH@ÿÂŞñèøöõºß½ÉL+kÓ{}Fızo¸û^~}µ_o›wı}Oı-ÍÄÇ‘êºÛXüízÓıß>?ÇûweÇßîê·¬¯òúÜ×åıj:P÷Íü[İJóû÷ø}w­¯üywÙşßïW;;ÂO]oÖïÏßıÒF¼şMô’½gm±gÍ°+ººöëoß\ıüıÛğß÷¿÷ŞWŸİÅÛò´koµûFóOµ»I·şÄ{SÙüKP{G~ÿ;yÉúîï'£$Ë­óÚf÷_Öİ½5¹N›ş[é_ú*¥û9>¦ïö1ğ¿™sÚıtş§ç6§Ã±eUåÙT¿_*?Ñıµã§Ï?ñE}ıÙíÇL Ü^$Á¤¢Æ¹(¸äò ÌN@ìì†° B IâÛF#Ù ä€L€ GP„cƒ$“€d:À
Ô…ğ:Un â‘€ÏHFD%Šö"„ˆ(RJ€JL¶A Š0F9u„]¢‹d#À-aÕì]–nïÛoõZ9§şRKSo'?uîõ{Ïzæ~]-1ü_K¯¯·y_¿“öqó¿§Ùú¶çŠÿükµ6=[s¾|ã¶éÇ#§³ŒÑæ¾åÇJ¾÷xÿõÑö·v†ğ–äóÎvfMb«Ùäéñ¾/??ı.-ı;ûûÿ‹!îÿE±ÿß÷;Òx¬Ø8FLD.$ Q‚)‹ 6«Òj
• é=pSB (ˆÊLc2¼(¶
` @%/bà š)Äæ/l%O$0§+H„œÕŒ )¦& Û’ 0D!’D§9B!ÑF"ÅL ^­,l‰ÀQ)øX!§	Ä"µŒŠU%¶:ˆ Ìv b–@`Œ -Ù€ğ. (Ò É 5&Ş+@ÓK8'°´5y!"‚lë É8AA¨¬ˆ–WŒ (`lˆ®`M "±ÒàòàÀ4©EĞ€¤d€ƒd9É¨OÀH	%Ââ¶À`ƒzînÇÿ[lÎ}—í/_÷³Ğ÷gº¯Ñ}[?½Qî»Şí¶¾63¯øy¾ñLıùÎCVõıŞÖóş¾NŒîş¿ß¿+­c¹·ı*‰»Ú÷_Ä¯öı£V}çïSßş{×Ÿ×:%»S‡ºïP}øo<%%½?Éhy¼·vÖê{Ì¿ïo¯•·¯9˜6"“ @^‰‡†X4ğÊ@õY³QÂ Â@ÁCH€šÀ  “àĞm L	 ,	`a)Ğ  ’e¤ ¨@ A˜„cH'À Q*‡¢!P4P *(Àa4 lBA2 Ô €bva!" "M( ‚a²ííòıî·wì©úŞĞ¾øÙOm»ÿs3+»÷tQ¿6¡“»Gw)¾QÿÉ`ø?çÈ–Î|}óAıùl}ŞuİW3FÕVÙ½946ÖéE3¡¶uÛÅ]×Ïw6jl³×vq.VöşÅÓ·Ò÷ï¶Lßü5Öö·_çÏöW/ŸÛîİ?c…æsWÿÇÿzói½ÚÓSWnåxí×tº•ÎõÌ¦¿øûßoœÏ?_ªçÏÙNJæ÷±~{üû_f²í½İƒ;ÛxæW~´	ÿïöß´ynÏşîÁÈğÚ¿{Ûî—«z¿ğ×¹ãQ‰œ'KûfÓ/oï¦wµ´a^/Qöß±şßp.{»ø'ÛÙ§,´¢Y‘ #Ø€ºÀK…" È³„’%™AE 2« 4,R8R0 ªÀ‰1@f‚Lˆá0¢R1LpDƒE0 *bë*Pb (a@ñ#u"%Äh”íâ¤@ÂqBˆ,n #T* €"M1UÄ  Œ*óŸÑ¹ü?/oÜûÓ?ı'ŸÅE÷v³ÿ}Œîá_£üÿëí.¿ßÌÁFä~Üó÷úRz~çR·ß÷çpıÆ%ÿÛ£ößıâyúıT¡Ïñõ>èé±ûÎ'kãz}İÍßèÿî£ålíøœ%uíù}ÏÑzŸoƒ¡¾ó |j³¹Âëß?ø·F«"pŒ*3¶G.N
a$Ì`°MÎ æéD å<W3ƒ'á¨2!c(	1Œı	B<– ‰AD¦#OĞL€v[.m1°$p4 " @b‰q   dABHJ%ÿ@EM ‹C‚(ˆ¶*±°ĞXÈ"  „Ğ 	ÇÜÕ™±­NQÈIH@ú@”k².„ˆÁì@1ˆ€­`!`)$D¢eCì
E
4B¢0Ó(
Y P‘"ƒ°”†*™™‚ iZ õ„Í)¾Vê¢Y¤#0‘( u ¦ŒP‡Oì5yÔUÿ½ıC'68&.½woçMåÓİìu¦¿½õvÿ_ï_Õá/ûv?İ]oo|ìn_ß7îíy¾i{‡n9ÿh{oëûoÂ~ÎësÊ$ú‘v¥mkOñÜ¤?ûyXŞÿÁÿµÇœWë·öï3Xß)p>á¹kş¼m«?ÎxæÏÖSr5@# ‰¸˜`@¢@¦*œ
&!Éx3¢@AZlÈ¤Ö!0‡àè
äR$ì‰@ñ‚dZ(5HP"d¡XˆÇ¬5äzD€A !I&D•1@@Dn	Ä…0´‹íDNşR	à	`À@Ø(³H"È	ö{Í×®½nçü}D¯ñZ¿b]ço{—¬êë¿Gëÿœ¥÷oÿzçk™6ß„güwoùµ½»yyûZVn7Ü•_ëñ­¿Ÿ3±È±Úö#®úü}~¿‰û¯¹ßÖ½“~î·ğøıëô÷?±dË·wo=y9Ş÷Øcş±ügûœôİÚ™şï¦ÒîÏç¾Ø[Ûÿ¯Ï„÷WG½ß¾OüôşùZ¤›lû¸áï‘ñw4Î6³İ>Ïcÿ?Çõïó(Bşü¯s%_êÉüÛëúòÖ©ş”ÖŒ³^&û³ùÿûú0Éîöÿï÷Í÷ß¿Xÿ„¿_!ÍV:CÓnsïß;üÓóô³ïÕ+ !€ $  ?–'Ì²`± ŠY U|A1œ(! 9±3p@  £D.8* hpr `	ùzZA:‚J%¤„:€b®šD³´"È” j R
œTB LĞ!DE¹£@ +EE : @
Ä Bš*Z€P#şÈÙ¾şCÌ¥;ò{Ÿ„Öİÿz¸éwüÿjoò×X©»ld¾+½¼–Ø®{½Æy[ıËÜ×ã«³©öû<zİïü+/—İnôq‰r!
íşÈ½&EÿtÇ÷fñ™÷Şİxä¿9b_ßãíV~ÿ{¼·¿Ø7:/¤÷÷²ûú\wşõÃ®]îõöGi
P"@’6RX‰€PA€uEğD„!òÁÎ(
‹K ¶'Å`€Mp8bPÒ0G28°#@gTÄ 
Œá‚Àà VD CƒÁ–YİŠS¹’7@x…iœ€ ;’G)4	0€!-ƒA)T#€ `I@ÁŠ…@¯@€pœ)yğ` ¡“`@„fL<¸€P+$d İ‡J"0¸ˆ!\‰I0•Í „H	ŠÀ@D€G>‹X\1ı8ÉÈÊ& Íh&*Š” ‹£ğğÂ2X)x ?e)&Bi  $ à<o<–RÖhşÈ[íëßÖÕ~lŸíÅït\òÑ÷¿iÈÕëöv-Ò7×jŸjıÈ<òÙW©û.~üµÎø—ô†Ò–ï*wóêT>'eÈÿş}w”}äïÖ÷Óš¼wûå¾oy•fhõ¿‡İw§?=~·l—İ¿‹¿ı<KşßÓºÿ¿¿´_FôÒ
<X	2P ‰PH²ì$j»Ä(#ö`’P««HBAA0dßP	E¥Å$bÌ¤‘!Bˆ„D AŒ  „ +ĞÆŒWBE:	IH.b<Í‚€ LĞBé@„Æ.‚¢x(‰Ô(RD$ ÄŸ©×ç¶ZI9Ä5ı¦ÜŞ|ßçÔ÷ßôºçÜXöF¿òfësı3YTc¿ÇOó•ÿ8>¦¥«š²µ^ãÿÎ[ƒĞèû¸×Uîz3•z~7“ñpÿğ÷4ıııöÎ:ü\¼{¦÷h˜µşnrnûĞïŞ­s÷Wã_Ö´õúŒûµ¯èÓeş÷åÿø¿Tö«Õms´wÙı¬ı1öèû\½ûğ6Ã¨#ÿw³®½™ºmğïo6t¦WZûûüoóÿ·e£>ğoÿÏpû±ëk³>ÖúEû¥ÂSğ×á=k~~?Ş¹wğ5Êb¿Íÿşï]6ùP7ï¯½_óãøõ»îï×zìûÿ>oö~}ÃİjC‚  „QB&Ê JXz0! `IÑ! €ˆ’(°4éL°EM Ü F-Hdab-¦p

-d@„	@±”,ˆV»VŒ˜„ ˆ‰äF€(#é ÀPBŠ‘‡ Â¬ ½B¢B +”¦„&ˆğHl²è„‹jXkÚÅ³‡©‰R{çœÎ‹º[ÿxù^okúwï[æû´a7ÿİ÷„÷»İèÁî»tù–Üæ¾·ÚfmÓ~õë»ty“>ÜLbòÿ+[Öüxúÿ§íıÿ¿ÿ–ÿv!:ÍnUoc¦ıôÿ]İ~î—‡WwÍNŒfu¸ï½²î”¾vgŸû_÷Ö¬	0@Xc·¸„ mÔŠ(  D B„Iz0  ‘D 7Ğ JÀ(XL‚†¸ J r  b@
à¢h<UJ¨€² hÍ"á:(½ ä ÀÂ  F‚CPXl˜‘@P@—@Hè?t% ¢è‘ÀÀ*9¦"d€ ô‘  Áe(©Å Ğ Ih@Ğ…ˆ@Ä-Ä’˜/GôlÀ ·  x hCŠ|eq&• 0Ò*Ye¤À›X!	D BÉXP!f‚ğ´e!K  ¿‚:M²Ò¢ÁÂ`¹±²sOûÿ£]÷ÿ±k}mø¾uÿíòøŞ«ÿÜ²½Óélç—¿õİÙ÷ë³›ñ5÷ç½Z¿ö«E³çóû…ïı<ÿ·×O©ŸV–ò7_ã—ûæp˜²t¿V_ÆÜıû—öâ·[ÿ]M½­³ÿÿæÏÿ¯•üwù±×¦ıškêÿdÿúßnßh€Ï*€Ñäü} €h¬N +#Y‚ø&pŠtbÈ×ÀJŠDm:I 0Ç¤`™ ÌIo¸è¥AQ€	b(1ˆª•F¾S`ÏB	œ‚€%e-. Kd1àB¢ )´Ài2tƒp	A@	"¢2ÓZ½Õÿ¶^Õ9~§Ç	G¶µ1ì½Óm÷öö}éâæ8K¶åŸó¥ËŸ¸©şÆ¯Ô~şığwJßïÿ¿ûy¸÷ßä=Š©!Z´/5Ó‰ïFÿæµÉ%_]ñ¯wšç•¿Ïlò±ùööğŸú_úƒm¡-ëêÀr#ßnø£p{·_	;ï³ÿËß'´ßí£õNÿæşâ‡Ó¾ÏïCÚíÜ°oÙïã£w¿â}ş½ÄK·ïZ‡ÖÎ»Îšé2?»ıoHsáÙn_ãtr÷^™—¹Ÿc±ßÚFÿs_o/èÏ…5ü9›-ü×m¤è»î?ÿû·n_'ú×ï@oÚßÚ¢öDİ†Ç¹dö4{ü{æ¢ª<ÍŞc‰Õè:35eAY‘Ø¤ƒÑAÆh n¥4f$M"äƒ£ŸEu€ @%¥ ÀÌ`²# &P“dU@„˜‹ Ş %j€hª2 Dƒ(æ5¢¡—”=€Œ!lt=Ñ¯ØBT´%Ï!Á€! œàÑ@…˜ÀÖ»_r¹÷·©ºÿ_¦¦şßşú»œwíw:ªİŸíúôûşän÷QyWÚİù9Î?-_?õÍ'}ŞWÊ ù}÷‹İyYøşzÛ^îtF¿ùÜßjÓvÿŸùgxäÏè¦ÿæ…~ó»cd¥ÚßZvÖ)}]?æ±?ıZÑùÃuôö¥ j Ü…Cr#ˆˆ›èäjù €DÜ‚¢™¯A‘I	¦W0À)H‚§ÈjfHÒR‚ĞH5tPá,KpÀ4«i kIcÖA¤)úlKy˜A#Uˆ8	”PÎ³fŠŒDåB`@„
»è @˜ êBApÂ@‰QpcP:¬@À‡2Œ¤Qb#ÂÔ8›¬ ©±0é\¨èè¨DÑÈ)M 0Ä…)Å *0Pj8ş&¢H¨@Pˆ 	q€T•Ebèaƒ@µˆ 	Ô* Ä  A(‚7M“*h¾ÜİÛï·îëıüwjç„b—û~şé¥h¹#–×ûöÊÏşËú'òõÿ½çßÿÏkmüØßé?ğáOE×ªoW=ıóÕæ«|§|¯ÇısúéwçØ%¹îÕ¾U~}7:[º†îÍ}ß§n¥ú½PÏRı´ÿ¨Úû~{¿ğÿó·sù0   var spans = style.styleNodes(rng);
        var firstSpan = list.head(spans);

        $(spans).css({
          'font-size': value + 'px'
        });

        // [workaround] added styled bogus span for style
        //  - also bogus character needed for cursor position
        if (firstSpan && !dom.nodeLength(firstSpan)) {
          firstSpan.innerHTML = dom.ZERO_WIDTH_NBSP_CHAR;
          range.createFromNodeAfter(firstSpan.firstChild).select();
          $editable.data(KEY_BOGUS, firstSpan);
        }
      } else {
        beforeCommand();
        $(style.styleNodes(rng)).css({
          'font-size': value + 'px'
        });
        afterCommand();
      }
    };

    /**
     * insert horizontal rule
     */
    this.insertHorizontalRule = this.wrapCommand(function () {
      var hrNode = this.createRange().insertNode(dom.create('HR'));
      if (hrNode.nextSibling) {
        range.create(hrNode.nextSibling, 0).normalize().select();
      }
    });
    context.memo('help.insertHorizontalRule', lang.help.insertHorizontalRule);

    /**
     * remove bogus node and character
     */
    this.removeBogus = function () {
      var bogusNode = $editable.data(KEY_BOGUS);
      if (!bogusNode) {
        return;
      }

      var textNode = list.find(list.from(bogusNode.childNodes), dom.isText);

      var bogusCharIdx = textNode.nodeValue.indexOf(dom.ZERO_WIDTH_NBSP_CHAR);
      if (bogusCharIdx !== -1) {
        textNode.deleteData(bogusCharIdx, 1);
      }

      if (dom.isEmpty(bogusNode)) {
        dom.remove(bogusNode);
      }

      $editable.removeData(KEY_BOGUS);
    };

    /**
     * lineHeight
     * @param {String} value
     */
    this.lineHeight = this.wrapCommand(function (value) {
      style.stylePara(this.createRange(), {
        lineHeight: value
      });
    });

    /**
     * unlink
     *
     * @type command
     */
    this.unlink = function () {
      var rng = this.createRange();
      if (rng.isOnAnchor()) {
        var anchor = dom.ancestor(rng.sc, dom.isAnchor);
        rng = range.createFromNode(anchor);
        rng.select();

        beforeCommand();
        document.execCommand('unlink');
        afterCommand();
      }
    };

    /**
     * create link (command)
     *
     * @param {Object} linkInfo
     */
    this.createLink = this.wrapCommand(function (linkInfo) {
      var linkUrl = linkInfo.url;
      var linkText = linkInfo.text;
      var isNewWindow = linkInfo.isNewWindow;
      var rng = linkInfo.range || this.createRange();
      var isTextChanged = rng.toString() !== linkText;

      // handle spaced urls from input
      if (typeof linkUrl === 'string') {
        linkUrl = linkUrl.trim();
      }

      if (options.onCreateLink) {
        linkUrl = options.onCreateLink(linkUrl);
      } else {
        // if url doesn't match an URL schema, set http:// as default
        linkUrl = /^[A-Za-z][A-Za-z0-9+-.]*\:[\/\/]?/.test(linkUrl) ?
          linkUrl : 'http://' + linkUrl;
      }

      var anchors = [];
      if (isTextChanged) {
        rng = rng.deleteContents();
        var anchor = rng.insertNode($('<A>' + linkText + '</A>')[0]);
        anchors.push(anchor);
      } else {
        anchors = style.styleNodes(rng, {
          nodeName: 'A',
          expandClosestSibling: true,
          onlyPartialContains: true
        });
      }

      $.each(anchors, function (idx, anchor) {
        $(anchor).attr('href', linkUrl);
        if (isNewWindow) {
          $(anchor).attr('target', '_blank');
        } else {
          $(anchor).removeAttr('target');
        }
      });

      var startRange = range.createFromNodeBefore(list.head(anchors));
      var startPoint = startRange.getStartPoint();
      var endRange = range.createFromNodeAfter(list.last(anchors));
      var endPoint = endRange.getEndPoint();

      range.create(
        startPoint.node,
        startPoint.offset,
        endPoint.node,
        endPoint.offset
      ).select();
    });

    /**
     * returns link info
     *
     * @return {Object}
     * @return {WrappedRange} return.range
     * @return {String} return.text
     * @return {Boolean} [return.isNewWindow=true]
     * @return {String} [return.url=""]
     */
    this.getLinkInfo = function () {
      var rng = this.createRange().expand(dom.isAnchor);

      // Get the first anchor on range(for edit).
      var $anchor = $(list.head(rng.nodes(dom.isAnchor)));
      var linkInfo = {
        range: rng,
        text: rng.toString(),
        url: $anchor.length ? $anchor.attr('href') : ''
      };

      // Define isNewWindow when anchor exists.
      if ($anchor.length) {
        linkInfo.isNewWindow = $anchor.attr('target') === '_blank';
      }

      return linkInfo;
    };

    /**
     * setting color
     *
     * @param {Object} sObjColor  color code
     * @param {String} sObjColor.foreColor foreground color
     * @param {String} sObjColor.backColor background color
     */
    this.color = this.wrapCommand(function (colorInfo) {
      var foreColor = colorInfo.foreColor;
      var backColor = colorInfo.backColor;

      if (foreColor) { document.execCommand('foreColor', false, foreColor); }
      if (backColor) { document.execCommand('backColor', false, backColor); }
    });

    /**
     * Set foreground color
     *
     * @param {String} colorCode foreground color code
     */
    this.foreColor = this.wrapCommand(function (colorInfo) {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('foreColor', false, colorInfo);
    });

    /**
     * insert Table
     *
     * @param {String} dimension of table (ex : "5x5")
     */
    this.insertTable = this.wrapCommand(function (dim) {
      var dimension = dim.split('x');

      var rng = this.createRange().deleteContents();
      rng.insertNode(table.createTable(dimension[0], dimension[1], options));
    });

     /**
     * @method addRow
     *
     *
     */
    this.addRow = function (position) {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        beforeCommand();
        table.addRow(rng, position);
        afterCommand();
      }
    };

     /**
     * @method addCol
     *
     *
     */
    this.addCol = function (position) {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        beforeCommand();
        table.addCol(rng, position);
        afterCommand();
      }
    };

    /**
     * @method deleteRow
     *
     *
     */
    this.deleteRow = function () {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        beforeCommand();
        table.deleteRow(rng);
        afterCommand();
      }
    };

    /**
     * @method deleteCol
     *
     *
     */
    this.deleteCol = function () {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        beforeCommand();
        table.deleteCol(rng);
        afterCommand();
      }
    };

    /**
     * @method deleteTable
     *
     *
     */
    this.deleteTable = function () {
      var rng = this.createRange($editable);
      if (rng.isCollapsed() && rng.isOnCell()) {
        beforeCommand();
        table.deleteTable(rng);
        afterCommand();
      }
    };

    /**
     * float me
     *
     * @param {String} value
     */
    this.floatMe = this.wrapCommand(function (value) {
      var $target = $(this.restoreTarget());
      $target.toggleClass('note-float-left', value === 'left');
      $target.toggleClass('note-float-right', value === 'right');
      $target.css('float', value);
    });

    /**
     * resize overlay element
     * @param {String} value
     */
    this.resize = this.wrapCommand(function (value) {
      var $target = $(this.restoreTarget());
      $target.css({
        width: value * 100 + '%',
        height: ''
      });
    });

    /**
     * @param {Position} pos
     * @param {jQuery} $target - target element
     * @param {Boolean} [bKeepRatio] - keep ratio
     */
    this.resizeTo = function (pos, $target, bKeepRatio) {
      var imageSize;
      if (bKeepRatio) {
        var newRatio = pos.y / pos.x;
        var ratio = $target.data('ratio');
        imageSize = {
          width: ratio > newRatio ? pos.x : pos.y / ratio,
          height: ratio > newRatio ? pos.x * ratio : pos.y
        };
      } else {
        imageSize = {
          width: pos.x,
          height: pos.y
        };
      }

      $target.css(imageSize);
    };

    /**
     * remove media object
     */
    this.removeMedia = this.wrapCommand(function () {
      var $target = $(this.restoreTarget()).detach();
      context.triggerEvent('media.delete', $target, $editable);
    });

    /**
     * returns whether editable area has focus or not.
     */
    this.hasFocus = function () {
      return $editable.is(':focus');
    };

    /**
     * set focus
     */
    this.focus = function () {
      // [workaround] Screen will move when page is scolled in IE.
      //  - do focus when not focused
      if (!this.hasFocus()) {
        $editable.focus();
      }
    };

    /**
     * returns whether contents is empty or not.
     * @return {Boolean}
     */
    this.isEmpty = function () {
      return dom.isEmpty($editable[0]) || dom.emptyPara === $editable.html();
    };

    /**
     * Removes all contents and restores the editable instance to an _emptyPara_.
     */
    this.empty = function () {
      context.invoke('code', dom.emptyPara);
    };
  };

  var Clipboard = function (context) {
    var self = this;

    var $editable = context.layoutInfo.editable;

    this.events = {
      'summernote.keydown': function (we, e) {
        if (self.needKeydownHook()) {
          if ((e.ctrlKey || e.metaKey) && e.keyCode === key.code.V) {
            context.invoke('editor.saveRange');
            self.$paste.focus();

            setTimeout(function () {
              self.pasteByHook();
            }, 0);
          }
        }
      }
    };

    this.needKeydownHook = function () {
      return (agent.isMSIE && agent.browserVersion > 10) || agent.isFF;
    };

    this.initialize = function () {
      // [workaround] getting image from clipboard
      //  - IE11 and Firefox: CTRL+v hook
      //  - Webkit: event.clipboardData
      if (this.needKeydownHook()) {
        this.$paste = $('<div tabindex="-1" />').attr('contenteditable', true).css({
          position: 'absolute',
          left: -100000,
          opacity: 0
        });
        $editable.before(this.$paste);

        this.$paste.on('paste', function (event) {
          context.triggerEvent('paste', event);
        });
      } else {
        $editable.on('paste', this.pasteByEvent);
      }
    };

    this.destroy = function () {
      if (this.needKeydownHook()) {
        this.$paste.remove();
        this.$paste = null;
      }
    };

    this.pasteByHook = function () {
      var node = this.$paste[0].firstChild;

      var src = node && node.src;
      if (dom.isImg(node) && src.indexOf('data:') === 0) {
        var decodedData = atob(node.src.split(',')[1]);
        var array = new Uint8Array(decodedData.length);
        for (var i = 0; i < decodedData.length; i++) {
          array[i] = decodedData.charCodeAt(i);
        }

        var blob = new Blob([array], { type: 'image/png' });
        blob.name = 'clipboard.png';

        context.invoke('editor.restoreRange');
        context.invoke('editor.focus');
        context.invoke('editor.insertImagesOrCallback', [blob]);
      } else {
        var pasteContent = $('<div />').html(this.$paste.html()).html();
        context.invoke('editor.restoreRange');
        context.invoke('editor.focus');

        if (pasteContent) {
          context.invoke('editor.pasteHTML', pasteContent);
        }
      }

      this.$paste.empty();
    };

    /**
     * paste by clipboard event
     *
     * @param {Event} event
     */
    this.pasteByEvent = function (event) {
      var clipboardData = event.originalEvent.clipboardData;
      if (clipboardData && clipboardData.items && clipboardData.items.length) {
        var item = list.head(clipboardData.items);
        if (item.kind === 'file' && item.type.indexOf('image/') !== -1) {
          context.invoke('editor.insertImagesOrCallback', [item.getAsFile()]);
        }
        context.invoke('editor.afterCommand');
      }
    };
  };

  var Dropzone = function (context) {
    var $document = $(document);
    var $editor = context.layoutInfo.editor;
    var $editable = context.layoutInfo.editable;
    var options = context.options;
    var lang = options.langInfo;
    var documentEventHandlers = {};

    var $dropzone = $([
      '<div class="note-dropzone">',
      '  <div class="note-dropzone-message"/>',
      '</div>'
    ].join('')).prependTo($editor);

    var detachDocumentEvent = function () {
      Object.keys(documentEventHandlers).forEach(function (key) {
        $document.off(key.substr(2).toLowerCase(), documentEventHandlers[key]);
      });
      documentEventHandlers = {};
    };

    /**
     * attach Drag and Drop Events
     */
    this.initialize = function () {
      if (options.disableDragAndDrop) {
        // prevent default drop event
        documentEventHandlers.onDrop = function (e) {
          e.preventDefault();
        };
        $document.on('drop', documentEventHandlers.onDrop);
      } else {
        this.attachDragAndDropEvent();
      }
    };

    /**
     * attach Drag and Drop Events
     */
    this.attachDragAndDropEvent = function () {
      var collection = $(),
          $dropzoneMessage = $dropzone.find('.note-dropzone-message');

      documentEventHandlers.onDragenter = function (e) {
        var isCodeview = context.invoke('codeview.isActivated');
        var hasEditorSize = $editor.width() > 0 && $editor.height() > 0;
        if (!isCodeview && !collection.length && hasEditorSize) {
          $editor.addClass('dragover');
          $dropzone.width($editor.width());
          $dropzone.height($editor.height());
          $dropzoneMessage.text(lang.image.dragImageHere);
        }
        collection = collection.add(e.target);
      };

      documentEventHandlers.onDragleave = function (e) {
        collection = collection.not(e.target);
        if (!collection.length) {
          $editor.removeClass('dragover');
        }
      };

      documentEventHandlers.onDrop = function () {
        collection = $();
        $editor.removeClass('dragover');
      };

      // show dropzone on dragenter when dragging a object to document
      // -but only if the editor is visible, i.e. has a positive width and height
      $document.on('dragenter', documentEventHandlers.onDragenter)
        .on('dragleave', documentEventHandlers.onDragleave)
        .on('drop', documentEventHandlers.onDrop);

      // change dropzone's message on hover.
      $dropzone.on('dragenter', function () {
        $dropzone.addClass('hover');
        $dropzoneMessage.text(lang.image.dropImage);
      }).on('dragleave', function () {
        $dropzone.removeClass('hover');
        $dropzoneMessage.text(lang.image.dragImageHere);
      });

      // attach dropImage
      $dropzone.on('drop', function (event) {
        var dataTransfer = event.originalEvent.dataTransfer;

        if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
          event.preventDefault();
          $editable.focus();
          context.invoke('editor.insertImagesOrCallback', dataTransfer.files);
        } else {
          $.each(dataTransfer.types, function (idx, type) {
            var content = dataTransfer.getData(type);

            if (type.toLowerCase().indexOf('text') > -1) {
              context.invoke('editor.pasteHTML', content);
            } else {
              $(content).each(function () {
                context.invoke('editor.insertNode', this);
              });
            }
          });
        }
      }).on('dragover', false); // prevent default dragover event
    };

    this.destroy = function () {
      detachDocumentEvent();
    };
  };


  var CodeMirror;
  if (agent.hasCodeMirror) {
    if (agent.isSupportAmd) {
      require(['codemirror'], function (cm) {
        CodeMirror = cm;
      });
    } else {
      CodeMirror = window.CodeMirror;
    }
  }

  /**
   * @class CodevÀBFÀŠÄ”B	$B*N0pIƒZ”Æ‚”ªŠ' ‡&]¸3 X"& (@¡x30€
„!0Çé	Ğœ ø‹}‡5hˆfâm ÈÀ&xà1 ¸Ä ,P† É€#Ğ‰FÄö{‡´î²Ëºÿ¿ô×Ï·ö‹¯³7›–èã÷º›û§²;QË­éw8æO¸
ògûGïÏ±ŸõÕ¶¯³ş"ÿ¿\;İİŞ]õ;?åã~?oßrËjñ<VûK¾²õî_ı^¾áºø§û='=ø?ÓCÿ_Õü¼wîµÉ÷×÷À»?‡şå>Ú5·²F{Œ‰ñÃæŞû¸úvİ±vn­ó:ëÇşîÔœÊş,Ï?Š®-&ÿ¿Èßuúûj~¾ï©ÿ{êÃ§òğ¿™¯àï×ê§+šòİŞòàìµ¬¦×/ÖßÛ£.ÚoÎ­xp]Äºùí_~ºwûi®™wß!aO³¿DÂ e*‚ ÀˆÔ
tˆ€Å\EHƒØ„ø˜ 1! ÄHP±ÛX" F"b!`AH˜€`€tNHLH$†.c0 „ L ğ,ˆvH˜!Œ u 8FcÀÀA,LJ„à #ĞšX@d!APAš®¹cÍ‡dÑÛƒåÇzi¶ZÊ'»”e>ÑoÕü>¼™›ííÕ€»ù\è-ÒÏŒn˜üõæi¬÷}å_z‚¸O¿şpûF‹W¯×9ıwÏì'Ïy³9Ô?_óõ¹w[.?—ÄóÿÕ—G¢súÂ«¬^¸§î²o»çú·uóÑ=ù~İ9K …ˆ‚Ğ…‰)‰YD`À|@Bl¦ 0 ˆ`j¥)XÌ^«ğQšÀ¸ 4ğhõ†Š‘²sA¦
 ?• E 0 †‘2$¤„°e…_#€
BÊ `‰Rê@·%Ä)°3!ú!dBBƒ „Á\€f€ˆ¨r¤Œ#°À(À½1’ÁĞ`À *P!bT&B (ĞB" dQÁI€‘…Ğõ €Ë’¢P˜±™·  Â€¸;¬R@(‹A fÀ	¤c#bq€‘€0‚ ¨Å¥J!äÄÒ@H$ëÿŸ¿¼>^/©2—VÒóñåCñ[X‚¥Øò‹aoxo.ñşÿ9ÿŞj»qDŸß×Í‹4ßUnÏ÷6Î½xâºÍÍüß>ÙúuTş)6o›ËoóoÎ'»é/Û!YÚ{oíŸô×ç¯cƒ†·’öïlK_ù÷vwìæ®ÇÓÚ~»J v€(§ @² 	W‰¡ Ph`€` °40l±Ğ *  )ŒD0@E` |€	  JTH%ˆ%ŒÛi0JË<»’€ †@±²bs£@Àg‰< PÂ;±ŒK¥`!‰ÁJ<ğ7 D7¡d #¯Oû›Ñç¼<9…‰ë”?µ©­w=w˜†Í·ïÏÑßY–9îÛ<]çó{ıWÍÛ_ö?wç¥ó¯¹Æ8î·ÜoNíøŒûùçÿg=ó>^\w›šÊ6sû`ÿêÛw'¯Iùñìªtx³ã5•ËŸ%ßO×WïSi¡ş£•í÷ógo>ÍmÙYÕ¿#æŞÚWZñ{gò†×;3Ò×+÷œ:o×3·9úù‡ì•gÙô?³ïàñ~úÀ¦{Ê××üeùıä¿½ÉôœÑÎ»YçÅÊ½Çß»Ñ	şœßÙÍÏõUècó×+¯ÚÇø(¯õ\N¿ï{³éì¿äò{{Ã‘ô—¹rJ,ÌüK/Ä%´ “  %( "È<  
ia€²”S| AÒ#À
ğ¤)X
N"(„-ÔØŒq! 	¯É¬ ªŠÈAÂH j0`$áC x Í´  0 RA0(ŠÉ`#Q`à$‚¨	b‘B†Ø(-ÁÔı¾[ÿ‘ºÜï|«=	kñ•)Jwï÷ÜS—)ºc¿¿7¾Ï¦ª{š>æ-ï:í•Ükëm¥W^
¼wêN³I?‘îuİUèÕ¶ÿmï%§>òÇ6ùs
Kf'ıGÖ¯ÎUüTó÷®ÑÏ–¿¾øœó?bèœnğºw;X„ü±BĞ„(À„€‚€ <¡A` B@E&m €
‚`P…  • …H¨KR…V|‡$Q„A ,*:_,  ÂÁ!PÀ•"$ PœhÃR-ÀÅĞH#0( ÁpP¨"<€ğ(	 @P„UôdÆ 	¶
á±0£JpIpàB`< A³pa™R
ĞLö2&¸Á!@ŒŒ$; à ¤ ¨ €…	(B@`ÁÎd
ÄI$" ¨
¤ˆCHpI€À11Ç@[ !8*‚Åi9ÒP@…(‘Ø·Î‡«İ—Lß»/N…òàsûï¥»æé	^şİMYmÊ»n¥sÖç¼Ñÿ}ß†zò§¡…²çÙ´Üìâqf­é¾yRÖ6?¨×û2Ëjh”Ñ~yíYêï÷<í}õ×_ãÆKˆ qw¿Ï÷]´~·à;ù™Şã,åOö«‘ R  úH0‘ƒ‚0”c“æ €‘€"Å1@ °#@¢Ø­DD,B
$ECˆÀÁ`@  †ê‹Ê q¡ŠĞH0U…D" @Ğ	ƒ* È&	ğy#R”B…Jˆ# | Ğ"iTÃ0%[‡˜iEîÛ}ïÕŸ‹aü‘·ÏSq÷ìj€ÓØKÙÙa¦qqİÕŸö…÷¯õòéó·ëòò¿/û3ş×ïr¦ıõ:kÇË!Zù·µ½;Wµ/“ëÍù%ïe»}~‡›ŸïÒ¾ñü©ô‹{µÇÚå÷¯wŞ=RïŒ÷ãï\úÇ>œşöŸÿL_ù¿½¡—ìï/üñ3r»¼lµë=7ÇËËQı2WİãÿŸãó†bç}Û~uÙäßëï/³Ùòîºúõ”YÅgı¾ĞÓ'ñÿã.7ÿím]keïÍ¾ßîmÔÏVÆşËCìgoËÅ”äsÏ¿£y§÷÷mÆ‡eğœÕ§çñÈ×jóô_?ø¾Ÿ/ô_wÂW×/ ˆ‘bX
€)àp Û2À¨„ v!I ŒHR†•  °¤béü‚( À Œ.8"“¡  nfğ© A¨	i® @% ‚‚À!$e,g5)]ëc Y¨€Ğè¸ :Aá M…T	O”
B †Qâ@ET“#Î~µ}wİù8a¾×uq©±/Åö°×óg¶/_;=q<†½íÿÖŸıÍÏGÇèøwÇÖt¯ñşÒ)/œ=ï~Í÷Î¬+2LÊa7O'¯3ÙKÿN7W÷ÏÃÔ/¸{şêöqãÓ²ï³ÍhèuIµÚîÿ_íïsO°ä›­ÉÑ¿ø°x$ØB#h€3ÜJ0ğºÀ . dZ– 	Š
 .ˆP-^Ä 1¤’
Ğ¨Œ
GÛ…C³TRÊ#`à+§`@€Ù8”Å@š£ 0M»f6ÁP Ğ© KJ”q®"IxÉ!6-H‚!H šb1€A'¾,Àİmµv†€¤À€-¤ÌƒˆA¤”ˆD„šcS2AY&K cQ¤ŠP	ŒA€
Q¶ BB   €´Ê Ğ
›À D@…à:cÒ œğòĞ  ——ÁR"ê7HÂ¾*  T+/ $×swO^_ÎiSıóH—Nÿ›Õí?4Å{Ëû?ÿæèM×Õ¾ş®Z›ró¿ØwÛøÿ#Ë1Ÿ[x—g‡•+nËøãıöïğ¦qÿö½ÿ¶šéIİÇ65ŞÖk·wéÛ¶ïª4#ö§å{0†GÿÏ_L¯Lù¯…srù3õß+ ƒqÒÚ  $9Æ=w•H'¤(>G½9\¢¤ …*¬‚@È´ˆ*†…‹!7L@¢HÂC$B˜†8b‰!¶”f-Y$ˆ°_ÄSPô²}€$ ‚ÀF@båBP¿$ $«ıõş\W»wÑ¥×½g!î¾Ù‰2ï÷¤Ó~_@¿ßøVv©u;-|:äqÿødĞ/ßkyˆóÑï¿|[½ês'®u+¯³Ëo²ÿ¢B"vÇi¿ÌÆÁöDó\w}kÌÎß'~k~vlOï«+SÆsF9O»ƒì+ÕæGı×æEÔœÎ7z?æäè?V¶yné\Şû%õé³'a¶¿Çê]v–ºDÙî÷ƒÕÆú8ïÿvªZßgüş¯şÆfOêöÿ®çhş¦£èTßåÄ^ß«Ú²GRU«êiÔ­tıÔßØÂÙ<T?şù¬Ší]¸=şí|Ëàzı…¨eøÃûØø>nçŸd`qfhB Æ ˆy “ˆŠ¨5„%À9¸@! lƒ. `BÈ!Ã	yÁ ¹(	€ƒQBÒ†Ğ/ç `”„">E`˜€#€TÂaP¥)HÜÀ(…
8ˆê‹¤@5€È	¤œdAM©);{¥ÄD2¾ô²vü¬â)ø÷ß$Ô\½5Ä`HÇ¾Ï·Çd¼¿¿¿ı÷ÖlÎDwù7|?ØÆa%çÉ¬=€ápoê³×uÀ·ó:¿ÒœAûŸO¯¶jü_É¾l>¿øàÇk¾ó\•½êWU©÷êàg´Ÿí{»Ñ1‰ÚÿÙÙe_yÖçäèÃÀ™D ® Ñ: 4BP
D Q †'ˆˆá¬è"Ä¨¡". ª’ˆ© Pr¨dÂÑf „¢À(AP¨ Œ3 Cb 0{aLc -"a 8„9 A*ÑŠ’RPa=£8¸	‘r ° !€
$ö a KrH aÑ)ÇÀ ÛV@%&¢"0K”àÙè2Äd\,Š$Ò‚š	°EpH2Œ0@*Ô!š d<Xd Œ J0”‚b¹ ‚AÀ" ƒ–"ÌúĞ ° †‰€EJ „¤íÊ¯İ·û†ùwå¿ÕÖ{ÁÜ»ÕûEı·ŸL/ö½ß¼ıo8İ÷ïÿiÑûì&Ñì›©'ÿ»L;SñÛ?›vå—Ö@ıïæğUãèén:xüÿ[ûÍ/ßg¿ÕøQoœ¨ßßw7¹û¨dSÕÏëºæ_Nû3íütÿßírg£¹Û×³Oı°’Ok6H3 Ì¬""E(À‚Ã‰†4â{9Æ…%°3r(4HJ– 1ƒ²§¢«ÁÉ 
$_hZ€ĞC£Ê0zc¤"Q1LNHLLRƒ'H˜ƒŠu8[XÁC ˜¨ƒœ”$)ÀË× h‘ÿ;ß¿-GÇïfçéãòËùïÚİŸÍë×¯î}·¯ı'å½?4iÛWî~¾ÕhÛ~7>u¯ıxáË‡6šÛ÷ùû\ø›¿³Éjë—ú•÷î/ßùÿwÏ÷­ë®ßßŸ_‹½üêıÿ¯OxÛóı÷eïÿn©Ÿûï-^ûƒŸöÑıWïg®æ½–ú[íÿnöûNÿ}oì¿ã·°ïßğßŞß¤İ¹ú~ocŸ;™¯z·µ›Ÿı÷¸Ë¯&ùvµ³.}Ú«Uû­õ´__‹÷·N6Ş}™ú1Õc÷^g|–ÿ¾»î¹êÓuû+îì§Èû¿V§kx'ÿÅõ‚å¶ûÀÏıÿ~so‚ÆW=Ô=İ¯­ ˆ*°˜QY t¥ÇÔR†|€¥ı€ä!*	k-é#$ô0ç ŠD‹  6€@^Gi
€¶ãÚàÇ)Kb*Pˆ·ÒZ#ªÑ‰%W 0dd&(³aŠÒC Í¥& ÀH@ä˜dz9&ğXeÿJóOûåÁ>¿yÁıÍ×ö×¯gßŞ÷î—E·´ıÿ/çèO®kçÿV6ŞÓçŸ¿”÷ùd_ù/_´“¦îÂÎ~;Æàä­èsıÿşş¹ÇîÛãÜÎ¸+äŸï·³ÍO÷ú¼Êğøúïş¥éıÿŸN‡ï-¿ş8ïÿyCï»Å¿Flººß~`"`A4 `Ñ¨™T0€™G’0,0* ?Cge©š€r”¡-¶—a ‚[0µèH&r¾LdA(”43Œ) M–0Là€Ğhxà0­T‰<ÊğlÅt4éƒ˜Fƒc ¬'‡•¦A0«)€CèÔ_ ™&,2F.„õB+´¨iĞ˜¯‰'p”H‘%„£.^ !.F4lâ“J6-<Òât	4@‹
	¯¨(~E †ğ
È`À`˜2S .Ò
Œ°vÊ_ÔÄ(Òh0† ,!V–ÔÁÎ  ûcmãñ]à³Çÿ/Ÿ/gŸ÷ıø}ñÿPùÄ©ÿ÷ÇùOû¿õßşşg±ÿ²æä¯Óİ‘·~ÿßŸÕÏ½ûşKM¾×yßKºe~[ıÎö¡şú÷óO–Úøÿü·ıßçù{Ïöÿíß¥Ïü]ßã†ëfiÒ°ã6«zÿïH )¦Q' lá1±bBÀÈTàYQ É¿F•å¢P=a ’EWlXğíè¢#ˆ@`·@ªDQÖéÔ? (˜P€»¤ÕDF"¨‰«!%$A(!ª¦vf-B	°¡rpa½€EJĞÅl_€9›•ç”DÁØA5 œ€™-ëè¿önâı¹ov÷¾7¹eOï¿öÂW±œ+=İÿ“§m½İóÿşk?Ÿ«#ş[ÿ¦éT²şï¾áóû¥;;í¿ÜÇO:`¼÷Ïeñ%=3bœ}¨=ÿ÷¹¼;èoíŸı¨¨ú¹ïähÏ—ÿ,GĞ¶î¦­{ïû¿~ıÓ>ÇÕõïñ½ÇÜ­ÏïÎÿ˜~ú9ù9çı­OŞşòègøı»Ï7&{˜ÿÖ¶}úÒâï?òd÷óÅqîÿõv·í­ßŠÎwbÁ‰ù´ú;/?è{ïø;BüMÄû}ÿÿßæÿkÙûûoër»[ıïíŸúfy/C¿úûßßµçÇ6RÿÜâïmáwëêûsËR¿œÕˆHèÀph„ à” „à‡dZˆĞ<“dÜ
Ş8ìt­€` ÊP+ğ.Ip€U`€d}VÀ‡@œ(,)$TPThN€ @Ì0@.Ú„pÉ`3/X	 
æ5Ë@#ìDóN±DÅ?WgÖÖ}ıàwóııIíÿ³ÿüıõö÷¸ß¿F§ë£ç¾wÜÈëÿÿ-Ôî¾^üÏŞÛÿé\û¯ÿ×yù8ÿÑôĞ¼ss·ııgoş»û£³÷%.ş75{û×—ü.;š¿~¾õ÷µú/ş\óèÍ'{ÿıÏËzÏSï÷—âój#|B`$ˆp€À1`dmé	B¬¢‹‘rX“`HQc`.ª°Ì€AF`xšL0eÉàaKDtx%„;(B! Ä@_|P'•1ÜKˆñ(u#aBb0^—TOBà,	i†4Ke²ÒD8Ì\BîˆdPÈ %C) ) °Æ °#qgbP£™u€•\ ‚48ì3r"Î3ZJn
b!Œîõ‚"ƒàéŒŠK #4‡:‚QaáÁ><Å"†+Y‚SB
¤H’$Œ$3^B ³¥UÀr‡b0§°Éáş>e÷ïÿ2—IÏ'ô²Ê÷Ûoó»·÷î©rœüwZÓÿíú+ƒ9s†{ª«gı÷¿.[w7œŸ½µ³y=gıÿ/õ+õ°Í[ó—ïmÎèúo»ïø{²ógş½w‹ü÷ä½¶ûèõß³Âë?|ş{’~ø×¼r~W{gêÿ·ôëış\ôµïî	2ÇITáRO‰Ëo†€–D:`¬"Ä°!O@D¦Ä©•ˆÛ1 …µ‰0(%àùe Íô,ˆ¢u"†RAC£ Å`F2ª”a7¹ L$ |	5 ˜Œv5<EÊr)
 $
Sä»pÉ“jáıÕéĞø¹»{½uíå§o×ÎÎ_G¿ÿû+{oßVîßîâğğz=íµ×U¹¶±·ß÷=ùşß7«ûï_ªù¯¾õöw2¿ÿ^_?~×÷ÿrr}3N§şkÿ{Æ­İé‡W¼ôüûş_Ö?Ó­óË÷—Åñóûw³ÿÓïÏ¼æsşãgûÖZûÔy¾ıŸ÷dùşòßÏÏ§ı_ö]Óö¯]öÿä›ÿ¾õÆ¯ö÷¶C[{õ‹æ}ÛMíÕ‡ğïÂ:ï{~Â?ç#_×ı”óİ™NËqõÿ'Ïßûñ÷©y÷şømÅwz¨Çøí¿ßÊïy÷¼»çùšäûºêwmóg±sÌÿúe­ïô¿ñMÛ¦ºÿŞuÄ 50·C@(n"„ MÊ8ğ 0ig¸‚DAiPÔ4= !ØÉ$&8®P“iBA'4Â‚@²‚ÉP8&€&Ú….rWĞ(8 bñº $	ğÜ“)ùS¤—‰5Zc¸AaQÁ€)$…Z,Ğ˜tj9ÿ_;Şü<õ¼[×»ï]ø÷¿QŸüvÖßï}ï¯îÿÕç‹Oçí<õÍÇsï¾×®ñ~ı‰ö™üÿf>ïİóÙãêÿ»ö÷wÿîïÓçîë~«uæÛ¹úşÛüÏ»ûÍ½3}ù±ï­<-Ç]çÆìË.ífòìG'ï÷Wç½÷ó?Ùßı÷7 t3 è@ÂÖ@qF)Ä°’dAà82.²ƒ ns—\SP"‚0„ØT )À
AE'„!¤>Â¡†@¦Óİ
Wƒ€ 9‚|E`€E„Û€“Øî0Äˆ0:J_„ÆÀc"¦Š¡\cp€A:´Œ@yã”ÈLJšb Ä‚Uƒ°Î€7%z‚E" ÕÜPa1w	€º®Ô"† "5`&İE ÁGq©Y *’–M t¼ğ
P… ¼I0áYéTfñLt€A!I> 96Eã¤ Ác‘)H#Œq€É‹p›¼yşä«\+ÍÒÿ½ßz«Òÿş|+“{Œ‘wÛ©ÛJËßû3½_ğñïğ}mÙ¹¿zãb¯½µë{>óÿìÿÕºîñãÓ‹U÷î8K¨\öõòÿYoñø{¯ÕûW¹_iC¿o•Æwû[ÿ›>Ùk›ãÚ?{ÛcÛü;Ê?BD!D
ğ—G
dbâTTl§ J€62ø°9@àšÁ¢‚p"C0á#
q1—È¯Ğ” °¬ÔĞâ¼¦¸À
ATa1û!§JkÀØ	qe–ƒCQ#:¡vH9;€„E^‚à"‹RÊÀSòÒïï{·Œw³ãmşWö÷“ğõ×òØë÷·ü»÷ÿşı·)ø÷©·é=¼»;ï¹ÍïœûŸõ/pücw›¿ëÏÎ¾²õİ³^ÖãıwŞç_ZÌóa|37³wëì—£ú»éŞÜçôÿóÛşıÛ7•{úhgò4ø¿Çïÿ‹î‡t~_knµ¯êï·ÛØsí}ÿoZŸùüÙííÜ×èåßÏ%ÿËmuş¨Å?¿ö³dşïÃççùfÿø¹xk£óû“ş¼ıÉ»ß`ÿ-} ë¿xöçî®üco_^çiÿwÇûo#«{è¯«ÃÚ?ù­³Ñåq{—lÛ»øÿû-5—ıÓñ1MD–7T¢hBÚ	A 1²œ	0R6% À¬Rº˜€ :( Á†Ç@öˆ	D-À§(8fA T¨2b"¤f 1
|À\€  Š‰Z>©´/¥$0’4Õ
”"NSÇƒ4X4ºÀÖÚÑÑÄë_fõØÏ_Ü~—}”ŸãSùwPÛ™>‡èÙöõú÷›ı9õŸìYÇ¿GŞ6¾£-Ëğ·ißŞ»ıùğ|ÛqC—ÛÃ{ÂÛm#·~æÛ|üßõ÷ıã]a=ï­ëöûºÏõÇõ¾ıO.†O[vóıı¹Oñî[ôR]¿}øò³”¬  À¯©Ç0(R#–%¤P‘, R«¡b„”eà~4”DJG„‹·Ì€<dÈM’º
„VBn0‰ƒ'A9H‘RƒàB£DPª°û„HV Ô1 NÁ¡[X‡vÇôŒ ˜ À$@²Ë½"&!%‡¸PˆÃ€	dĞ"†§k‚BH	 xÀXš•!ƒFj/Q @•!jH‹ V@H£‰à ğ21@=0—š¼@ İQ¸¤O’L°»D‚Æ@±™}š€EQ%U%X 3Kµ†‘p“CÄv)B*V€JÉ³j}şèëÿ~¿öíÿ~x¿Ó¾éó÷ÿ²üÌ¿ÚÊ¾Ö4™Øãÿ¯ï¯ş}ÿëæLëåÆ¶.5ø_}×ÿÕ_­µvŸéšdü¼+úŞ?ÿó|”ßõïîÿÉøY–ş¯Şßíózvmâ.¯f÷Ÿù\oÊg±ùô9ö@¹¹µŸ±åözüÎ_Left'), 10),
          top: position.top + parseInt($image.css('marginTop'), 10)
        };

        // exclude margin
        var imageSize = {
          w: $image.outerWidth(false),
          h: $image.outerHeight(false)
        };

        $selection.css({
          display: 'block',
          left: pos.left,
          top: pos.top,
          width: imageSize.w,
          height: imageSize.h
        }).data('target', $image); // save current image element.

        var sizingText = imageSize.w + 'x' + imageSize.h;
        $selection.find('.note-control-selection-info').text(sizingText);
        context.invoke('editor.saveTarget', target);
      } else {
        this.hide();
      }

      return isImage;
    };

    /**
     * hide
     *
     * @param {jQuery} $handle
     */
    this.hide = function () {
      context.invoke('editor.clearTarget');
      this.$handle.children().hide();
    };
  };

  var AutoLink = function (context) {
    var self = this;
    var defaultScheme = 'http://';
    var linkPattern = /^([A-Za-z][A-Za-z0-9+-.]*\:[\/\/]?|mailto:[A-Z0-9._%+-]+@)?(www\.)?(.+)$/i;

    this.events = {
      'summernote.keyup': function (we, e) {
        if (!e.isDefaultPrevented()) {
          self.handleKeyup(e);
        }
      },
      'summernote.keydown': function (we, e) {
        self.handleKeydown(e);
      }
    };

    this.initialize = function () {
      this.lastWordRange = null;
    };

    this.destroy = function () {
      this.lastWordRange = null;
    };

    this.replace = function () {
      if (!this.lastWordRange) {
        return;
      }

      var keyword = this.lastWordRange.toString();
      var match = keyword.match(linkPattern);

      if (match && (match[1] || match[2])) {
        var link = match[1] ? keyword : defaultScheme + keyword;
        var node = $('<a />').html(keyword).attr('href', link)[0];

        this.lastWordRange.insertNode(node);
        this.lastWordRange = null;
        context.invoke('editor.focus');
      }

    };

    this.handleKeydown = function (e) {
      if (list.contains([key.code.ENTER, key.code.SPACE], e.keyCode)) {
        var wordRange = context.invoke('editor.createRange').getWordRange();
        this.lastWordRange = wordRange;
      }
    };

    this.handleKeyup = function (e) {
      if (list.contains([key.code.ENTER, key.code.SPACE], e.keyCode)) {
        this.replace();
      }
    };
  };

  /**
   * textarea auto sync.
   */
  var AutoSync = function (context) {
    var $note = context.layoutInfo.note;

    this.events = {
      'summernote.change': function () {
        $note.val(context.invoke('code'));
      }
    };

    this.shouldInitialize = function () {
      return dom.isTextarea($note[0]);
    };
  };

  var Placeholder = function (context) {
    var self = this;
    var $editingArea = context.layoutInfo.editingArea;
    var options = context.options;

    this.events = {
      'summernote.init summernote.change': function () {
        self.update();
      },
      'summernote.codeview.toggled': function () {
        self.update();
      }
    };

    this.shouldInitialize = function () {
      return !!options.placeholder;
    };

    this.initialize = function () {
      this.$placeholder = $('<div class="note-placeholder">');
      this.$placeholder.on('click', function () {
        context.invoke('focus');
      }).text(options.placeholder).prependTo($editingArea);

      this.update();
    };

    this.destroy = function () {
      this.$placeholder.remove();
    };

    this.update = function () {
      var isShow = !context.invoke('codeview.isActivated') && context.invoke('editor.isEmpty');
      this.$placeholder.toggle(isShow);
    };
  };

  var Buttons = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var $toolbar = context.layoutInfo.toolbar;
    var options = context.options;
    var lang = options.langInfo;

    var invertedKeyMap = func.invertObject(options.keyMap[agent.isMac ? 'mac' : 'pc']);

    var representShortcut = this.representShortcut = function (editorMethod) {
      var shortcut = invertedKeyMap[editorMethod];
      if (!options.shortcuts || !shortcut) {
        return '';
      }

      if (agent.isMac) {
        shortcut = shortcut.replace('CMD', 'âŒ˜').replace('SHIFT', 'â‡§');
      }

      shortcut = shortcut.replace('BACKSLASH', '\\')
                         .replace('SLASH', '/')
                         .replace('LEFTBRACKET', '[')
                         .replace('RIGHTBRACKET', ']');

      return ' (' + shortcut + ')';
    };

    this.initialize = function () {
      this.addToolbarButtons();
      this.addImagePopoverButtons();
      this.addLinkPopoverButtons();
      this.addTablePopoverButtons();
      this.fontInstalledMap = {};
    };

    this.destroy = function () {
      delete this.fontInstalledMap;
    };

    this.isFontInstalled = function (name) {
      if (!self.fontInstalledMap.hasOwnProperty(name)) {
        self.fontInstalledMap[name] = agent.isFontInstalled(name) ||
          list.contains(options.fontNamesIgnoreCheck, name);
      }

      return self.fontInstalledMap[name];
    };

    this.addToolbarButtons = function () {
      context.memo('button.style', function () {
        return ui.buttonGroup([
          ui.button({
            className: 'dropdown-toggle',
            contents: ui.dropdownButtonContents(ui.icon(options.icons.magic), options),
            tooltip: lang.style.style,
            data: {
              toggle: 'dropdown'
            }
          }),
          ui.dropdown({
            className: 'dropdown-style',
            items: context.options.styleTags,
            template: function (item) {

              if (typeof item === 'string') {
                item = { tag: item, title: (lang.style.hasOwnProperty(item) ? lang.style[item] : item) };
              }

              var tag = item.tag;
              var title = item.title;
              var style = item.style ? ' style="' + item.style + '" ' : '';
              var className = item.className ? ' class="' + item.className + '"' : '';

              return '<' + tag + style + className + '>' + title + '</' + tag +  '>';
            },
            click: context.createInvokeHandler('editor.formatBlock')
          })
        ]).render();
      });

      context.memo('button.bold', function () {
        return ui.button({
          className: 'note-btn-bold',
          contents: ui.icon(options.icons.bold),
          tooltip: lang.font.bold + representShortcut('bold'),
          click: context.createInvokeHandlerAndUpdateState('editor.bold')
        }).render();
      });

      context.memo('button.italic', function () {
        return ui.button({
          className: 'note-btn-italic',
          contents: ui.icon(options.icons.italic),
          tooltip: lang.font.italic + representShortcut('italic'),
          click: context.createInvokeHandlerAndUpdateState('editor.italic')
        }).render();
      });

      context.memo('button.underline', function () {
        return ui.button({
          className: 'note-btn-underline',
          contents: ui.icon(options.icons.underline),
          tooltip: lang.font.underline + representShortcut('underline'),
          click: context.createInvokeHandlerAndUpdateState('editor.underline')
        }).render();
      });

      context.memo('button.clear', function () {
        return ui.button({
          contents: ui.icon(options.icons.eraser),
          tooltip: lang.font.clear + representShortcut('removeFormat'),
          click: context.createInvokeHandler('editor.removeFormat')
        }).render();
      });

      context.memo('button.strikethrough', function () {
        return ui.button({
          className: 'note-btn-strikethrough',
          contents: ui.icon(options.icons.strikethrough),
          tooltip: lang.font.strikethrough + representShortcut('strikethrough'),
          click: context.createInvokeHandlerAndUpdateState('editor.strikethrough')
        }).render();
      });

      context.memo('button.superscript', function () {
        return ui.button({
          className: 'note-btn-superscript',
          contentsè#VV¡0U(õ’p"äœ0WÆ&PI`&p’p…ÀÆ"‘«DÅ·J©1	ĞH¨&èQI‹fÜb a°X¢B$ÀcQ 
 
Ä
‚P9 *‚ €ÀÌ“Ã ">BAÃE‰€¨€|ª³İ‹¿ê½'—™gÿMè²|ÚG:-}×ËJû¢ÿÖı©·7ÿ¿ÿT¾ï7:ñ¯~ówösÓü=¿»ÿŸÏú?º_u?÷5gv·EOïªCÚÛWïëÚòİ/_ËVŒòZgpDNFâï#ø÷È£\û}£|Ïÿ™Çñç{ï¥{_¶_·„¦Öü¿óß¯õÚU–/9ÿjµ÷×Ú2ó=èòÚ]Í–²cû§â”˜ışß÷z,sñéß¢â1ñÈÑwïë7‚½sÿ«ÆûÅ k¥ßñ·›¿ú¬ñî¾N~³íqŞåúöÊŞ÷Ş/¶Ä®:µ·ÚóÌ.ã1Éq·÷×ßúº‡.×±^î€?&H‹()Îp	¤R %Hq€±€à-ÀñäÆ4ÜŠ 3:¹Da‡-€‡)F" Ú€A …  •H%Øb± ÀŒéd,,Œ¶2Dy0ø¦@8QA =@­0 Ğ1AX”Ãœ€é[	’`ÓXõ©Óì‰T¦·?áœödügú÷§ôıpäGÒkç¼Œñ%Î¯ÿşŞv£ÓU”º·Ñ‰ıáÉŞr5öo-x‡ÿØñU[Û£ÿ¿İuÛ§ñ¹NéÙ&|ùKÕû©Ï·?øqæËúdÚÆ½uyçìİïñ_êÂS°ÿêÒL=ùiôB@ÁGA†ralj11†p¢C&CB GTB K@Èˆ8UH$YÒÔì@E™ó!.„"HC¬‚F´ÙH¢\Û
GS#@€Š$‚Òº‰ƒZ & $A   !Q4P0˜ ˆ¦q’Kòˆ±H0E L"ˆÀ ‰…H:@Ê € 1{ €¤Dèt¹B	°¬ˆÂ0P? aFhQ% „ yÒ„ä/ Ì@,yÈDqPIR± 2 (3R’  †„ ˜ñôÌ¥•IÀL0LĞ!!d Ğò@ €(-‡’
7»³¯uüÿÚF:ú‘ÆfOîO7İ÷û¿X—Ú_´Ø_ÿŞôâ3vFCV¦Ñ0­Ûq;õ]ù[³áá³ÿ²÷HüşÜÕP¬om†›~uù.4Óz'¹÷å‡Ê†ßßgË¹ÿŞÚ´}jfÄ7ÿüÍ·ÈŸXMÂ@g: 2x(€˜A ’ R…@
j‚Ù“Êë‘4 œ 0€l„È OŒi(D2”¸(üQj"0qÉ
§Bã€Hd@D€0 INç8Iv"p  d€8ñ2%@*q )!®E&Ï?m_å|Äö/oó®éâÏÿ•}ÁPæ§a¬½JÇPô¶‡~[È^…ÜöçÉUw¾;­¶ıÚÅ\öf_·_ <†ŸûöŞy®!]£›/ø¬òEëIîı5¬9½ÿXt;¶^÷ê¯ßğ—òµë–«W=İñë}¹ò×ø®ë>ÚÍ·Îr·L‹ËùE7nşı÷ù_Qºïİ[yA>O×ûû¶–÷[ïÆ½S®ß†İ>ıü†ò÷¯
Ìı%Ğ¿îgİ±gÿºòk7ãó[ŞÓÙªşn¾^ü·ğğé÷ß‘¥Üæ"óßÍ#Y“ö½WÕcós÷yô^]{ıa-ş¹wGbf!„Á:!e¡MÀj£’à8n’,Â%IhÔh†‰È¡‡É &ğ
F$¶4K[W	€‚Ù± A 4•V8€V"*ÀŞ‚Dá 2ÈyB CA(È À(š©B˜!Œğ¥®•E2’H¦~ŸKser¿£œÅçç»¯K/kThiÿıWÖw6~—ıWÿzÿóıæË²gıÏ5û“U§ÙV¶nKó¿¿{û¦[ßÎ6×^{^Øİ]ö¿¾4@Ÿ~ÿQ«N½ğ])¶ç+KjÿÍ{Åş×‘‘uúéş÷Gë½û—tàtÊšMjy"4ĞoYq Ä!
á2	DD*˜”t@Qš)Vù°h¥¶Œ–`QÕQ	N8 d¶(hQG Ša n$ˆ(Ãd0\‘`âŸ$R* U*a h ÄÈ„P (%‚]A Â´
1£`e”H$ˆæèpà2”£“HHy¨Ã JI b‡¡vp" ª(' A ÆR†z*’ˆD%¾Ä	D@@ñ…Dr?dp%° ƒPtEf”ILmÊˆ1BP’’ˆ@„F"P°=@D|@2(” Ä"Aˆ$" 	-!aUEó¡€€Xmú·ß?k×ß®ñîNù»³ğA¾[?&=xüdï?jOÊ[êßè:ÓŞãñm•Î"ï½ßßšC4<N³Ğ÷uß}»§ùÅõ7n=ı½ïŞ§ş~;OŸ{r_×²š[¼ßï'>G*ë)kÏmªß×mo°äßë*õözÿËò ÏşYã¥ñ½ôÀ¥ó Lj¼è/¬(bD§x†äÁDHÄ 4{"SÄ=€™"!©É(A€i ¢ËP
¨   Ã9	°XP,%N‚ÁT È €z ˜İ0 
¼ÄhHÊ30@`ˆ ‚F¨&Ê!JàI¶!#ã¹“ÿáızg÷ómÙo´Wú*‡¿ÆíÔ®òÈÕh&×ÏwxËİÕØßëÿÇ²¹úgÚôïw2…Æ#ç¹Ûeiß“·İW³Üår·‡qÿºäfÔš{<ã¶¯áô¥ÀÍâ§¿Hö¯vëo‹ÇÆ‹—w“¾[ráçÑå·^¦Í¯›ÓîwOtÏ½Pÿ%œ·»×ü9VŸ®V¿ÙÿoûÇô7ÆœÿóÿœõñOoÉÎßÚ®åôsç>½oîU~óÃ?›i~ÙüZlx<Üx7‡#}Ã½ú¿qº|õéôûµœİÿu¿q÷ïØ“fmïúôÓrÖ÷õò¶~ı†rßóÏ¦Ê?úéÿÿ÷çîõ€  ŠA‹éğ ÀUBFA-Fx@*¢E!öB%Ì%I… °„¼'Ìpˆ`€ù¼ùŒ"ñDäI$Ù°õÀYĞ H 0:$Ï:„Rl˜L  ,@†#‡S «ÕH²P  ¤ø@‰Ô¡¢ÑB2˜™ós¿?}ç3GíSO÷¿í{sß»æ}¿ÿíõ¿oıÙ¯Ç—ä‹µ>äãşˆÃ$á÷¿?øyÏøsÿy[ïß×¯?§×ü´éÃ1ı"}6×ış¼yq¸VMßßŒzÃ“¯ı°‡½Â§İ~òFw7oÎ“^Ä¾ÿ³[wr¶?ïõö/ŞvêøòºŠ,š$Ihh“:@¤Z&á##d… `bPD³P% ‚Q0qÄâa¨J!b¢`
@:( ĞÂ˜M0$d" °"è†ÇU‘„¨1€Æ€h H2€h
 8 % @  €@ˆD‘"M›À¤  tNÄb†|ĞYE@PIä[É€Lä4 ³„â"‘a†ÒM ĞÃaH¡” DÈ"p€ ÏÅ @€Ã AbÃp	‚R «@ H0$— A
m”p€„P#M<ğüiàõÇö6ûÿÜ>²òñß×âÇæë·3»Ïú~‰³`Òê¯=ÅÍš|ûnæv»ÛÇ};¬©¦ÍÍÕ¹ûé7[ú™Ÿ[…ãŸ²ïvî~~î6N>éû}Ë¿Ïíe*ş¾ñ&ûùÉÁ¼³ö€KaÏÿ¯ÿ”w3÷{ñ{{ÿ…»ìÓşÛ×Vı§³¯ÒÄ0‚$Á1„À‚€ ¸F#¹Aˆ P 5‚46À `ò "—5	Â AAh–€Ä=J+(Y
D
,E0Æ"
)Š&lp.f„p  q®¤¶>ŠDÔç€ d MP €°M€E§ Šar™€¬¿åæ/Ÿõÿö?¹ßòÂg?=ÎßC–}-ïîû÷[mß3õkßğ7óşöW¿
tîÏ|‡ÍŞg:ßlí›·şvßòG9K‡õ÷ÿÒŠõ_Û“@v&ëÿÏÜ:³µsw¾z?4õI¥n{…ì»{÷¬—ïŸÉ:_Ïgş¯ïºT÷Cşym>+ßÿÎw¶-êÚ_{_ÎWÿ÷ïâ¦¯ÖĞÏ˜noƒ³çíÑ²×óçgªÿ7_ı]Ú[Ÿğ¸Ûo~F—û—òzıõş”Z¯Ñıìd¸7œ·½ÏÚ§ÿ·Ø?Í®íá·ÎZ’Óİò}½s™E§Tçp¿bO!ÕÔûuàõíøÿ¿rd­SCo˜R0@!PŒˆ] ,"&Á@/Ôğ˜´‚:ÌŒm(@"³¦)´\CVAƒ@a2r‡ 
 JR”/6B8ŒhrPè0J,M‚YÀ1i•Hhô0…fP`G˜c™ˆgØH`ÉÀlAPÙ‚ÚG&_åû+;«;£™<êi^ş <Ôj5{›Ú^9ş:ís±¦U|ßÛƒ%'ÇwèˆÛ{úş=ÄÔ¿óÅ?,ïıÎöåû~»ÿïûëùõçïí÷íÏó¢Wòzıç%»ş»=ìş°¯¼÷Û:¸·¯u°§¬Zÿö&şúüGUŸšæuXúXí€™ŠCDÌ€6œ¦¬€†ƒÆ €É,HG
¬´"ÒLÆ ‡™ƒÆ» ¬$Ë`—T8Aä€*`9‚@ÁÁÆ„ˆÌ CÔ dPA©V…)D H,$ˆQE~ˆ &J8 ÚFàL ƒ`äPâI@4…S)z 0"" 0
,&M ıM"0Dcê(â‰m b9*  2B‰  $aĞYJ  Pà€P°Ñ@,@§É ¥(‘)”'w$ÊUL0èÈ@ Xò_”ÓŸ/ÿuvmŸôÿï1éı{5§ãÒ×÷®ğ›¯é¸ıÚ[÷­bûw:ıß\kò?ÈùßlŞxowü¿ß½ø¿?ı¿Q3Üjïá®íØŸG÷İ¬Ã\œÏ1¿ğïÊO˜}ío3>Üß··Eÿ„öT×Î¿ênïª¿ÿƒ¶<r¼ˆ"€ˆ˜ˆh.Aí‰D	‘ 
qjzH(˜ê¬(•àÆˆuš] ƒÀ `ãà°	H 	“Ò* ˜ÀÀˆbh•Ã¢Df–1q‚±`† ¥å0’ŒSÊ„n$Ä\ Nhì$W¢„‚	 & 1˜¨®wê_ø³n?yo7n½<·Şpy¿rİüüÿ¼şü~½Uîíü;œ³ù¿Ùô¥w5íä«†o5»7õ1ô-™­¿‡§}ÿÎ_İ}Ò%³ÑıöGoOç7Nß®yG§ÄãÍ·ë^}“/ß«ïâc]—v]›tYĞøgô,[¿|ç…Tßö$–}¯»û½»|uÓÿ#s×M]òÔßÿ—z·µıš×ß—OÒøãËÎôîïNøw¿÷ïpÃâ5¥½ït—·ö¡ü|¾·ù³W½âÇıQfß§ˆüTíóé+×ÿaü½u=æï~?ıú<íÕ†ÿ·÷Ü/÷Ó¼«3?ë½5ßlØãı=Jø2 &+ô<‚èf’¬À		a0@Rˆ8¡—‚	Ê#˜%H‹ˆpa…˜Mâ„ £À±à ò ObÁAK"°+ğ	  )P%UƒP™‡(  ,ÏĞZ °€˜‚„Š `dX*\º(tãğ§®´òGàİş×ìR¼¿ßîşîÜ;ä%.{ÿã§º{ôoÃN³ÿ@>üêş³V~Ø­uÕÃõù¯n£—¶ÇZtÑ»Ûw}’íÿ¤ºWoÿ†õwì½_şÿßş¿¾?ıûô–şGï¥ÙívŸŞ÷öT×û“ío;-¿wïõuìq²™€‚,5„…‘˜TR"HV`¬@(;€H Np$U
L`\ö!†-!½Pæ\ËX¡™(ƒ€£1Ñ‹âÖmÚ@!fˆpQ!B@AÑ Abh…€ÀCR`@l
D¿€
r Ô„Tf]1®@œbYBD†¡mcÀˆ@€,?Æ"0$T* @£ˆ@(`´$Ù'6z$ *@&¼%p+£6 $CI<€q˜. ê@[àD˜’#   P º !H0¥&IÆ0.@R‚ÜA@ªD)aòa @UjÆ¦ ¬•bèÿ¿‡7úü{StÌ™m:¼¼·|J°o»ÕÓ3·<Y˜JÁä±7ƒÜ/ïÓêŸ?³ÓñÛìÆuZ57Ìó2öš‡½g‹s²İã²;¿9íî|úõ£û{9şûÇĞÚ¾ıWiá¿ãaŸöËE–>ÿl)÷îÿÙÚîGqf™rı~A6©+€À 2h8ZJH€!!L+ğâ0’ÄPBbxˆVPİAƒª LLM¥U$\
¢¤…LF`	y^LPàˆEF2µ0&~‘8¸¤ $ƒ4HteG0’ È”K@H¡ƒÑmŠ 8ŒR w“×NïyşßGÖùÍŞ8òÔòöf)ËîvsÛ“=õÿÿóMİTîíx}†ã­õíqì77=òwqD¦#ßî—;_\uõÙu½ëokïnëGÿõ?ÿï¿çó™Ùç×îêÃ¹ãú½Õæş–>ûİóéGİî~Ú±ö}ú<ûÍı}6“°Ñ¦Ô÷=Öº%Ö©ü¾ÿ–¿«ßäi¿w
«ÿ[_wû¯U¸{Ö¯¾}ï_VÜ"•^£ulŞ¯á?gO¾õ\ªW¾—3”/?ßïësû?jW'ä®£?·ş9Ÿn=7şmÂí·óS}>/Ïß{z~eOû.æâ_µû¾_º~wïîhİÿ£“A °“‚ ¨1
§¨¸÷"TT 4ÂGA!P‚€Pæp ©"€†„`ä€‚iĞ@
 à à D!„ Àˆ A;!È•e3 W1ˆ‚!RbdŠ8	AdÄ‚"g	â9 j š$(‘ÊXR:ˆïç÷ïÅöYT}>vSyµ²ïğİ=m]ÆKÓ:µû>í3ë¿íëØ
»ç‘ó¼²}Ñß›Í?vôj¼ú¥ğ¾dûyPÎº¿ç¦Yšuß{\ş÷)TìÍ~ßüßzÏùŸòÿ~+ı'OÿykWËhö¤Í­w¿úïü½Z–Æu%·¸§S8€hFb`÷µ@8Ô…‚Ù'
U†!tPö  ( ’@¨ b4Œ‚$)Q‰$jŒ€.by\PÎyE¿ ‚ ¢ )!¡ D€#É¨@X‹L´±#2˜‚›‰  ¨(d‹ÊşÆ´™ Ht"  P!@2d”
‘  4P@
Ed‚R¸@D „DVÊp@¶fF’^7Ğ —Ò‘OÃUÄ\( [BPˆA_€d 3€Ğ:‹e9¦¥ `{ô@Š‚Ô3ôI€	C€£‡P2¬c‚%šËÿ«Ë´§^ãhéÊÚË†ÒugõÎEOÕò`×éç¦ùwßöÎš>Ô§£~îİş›,Ã¥ÑÂ­õŞ š›É/ü×#·e}õñÇrVûŸê]yµôêuØ½ûæ'İ	+-_y_ûjoı¥[Û¨ùµòÇ[²üÖU_s×›Öx^} ,Rc@B¥-[‘b ¦V˜  Ëá, ÜAÀ£B¾
ˆA €ƒQ&°‰2@`ÜC MAĞø*NY>Í•"§EQI cÀÀˆÜa2±RFG@‹²Â@|€XŞ
A6€t #‚ ¿àÿD­¯şı Ø±i÷¶İvYjŸû8ïôïÅ8æJ?±ÿİëşy»şŸ›oÙoÜ¿mûGáÜÍíıoÓ#?Õöï¼öÛÿ£ù?ÄMg•]+óÜ+UÙN]ï¯ïÍÃÀ÷ïò^}^O_U.çsŞnrÑÔ?zíÛÏÄ§×Ï¤;ïßš¸º×}ïúÂwG¾ïSåúüJŸş)ÖÒø-{_ıÙ÷nßé›ÿ»‘w„$z/÷ÍıV~Õÿ¼Èßæ}ûÏ>ÛuŞ‹¿k	îQ÷¶*;?·â¯ï²¾¾=wã^ÿ5yş;øÌÓæ¾¦ıER]÷—éiÏÑäçjú3ë}i?şıWté±S{
ZQ ˆDJeM@(­ |¼Ôk‡p
U…A!‹‚¢bÀĞ¨	È ˆÊUƒDÀ˜¤0pŠ¤$D(Xy 8aˆt"B@
  qa B)0²9€ H°p„œ$@@  âÁ‰“x6:Š-BLƒ9ÊõSå/—÷3·|úºŸlYPömíÿŒy÷ª¯RÕr>é'?w!cŞÜß/œ2é¼»¿S?üÆõ‘çŸ›¶e=ût·ç{üUŠÏßÓÿ}ëÖ_ûíò_M¼ÍuóëwI·[_~ÿ{şÔêôçÚşÓ#9d}¹ô¿‰k6ïé3d!K@00)—à6€ÁAM0^ ¢áˆFp U@¹”gğ‰!	—$„e@š#@zà€-pbT  H°²=°p. (‘! a	j( Né	  G  ƒ¢‘@ƒd-:Z‚×
~š ˜J0$ŠCØœ@C	a8`!å* `A Æ… ¸àÀ‚dDb4H¦è€@0Y¤°èG‘@
œ Y€²áƒ BÀ Yº  P˜`"E$` ˆP°€!â0V…AˆÛ ª·õgßñjãRú›k’Æk÷we>ÓÈfš§/O:~Úôş{İ>ÿ·úëö·ü³ë½ßßú2›û6>Z¾Û¿^r­çzíÇfÿàºğ_?ï·¤ô¿µŒÍMû«Ÿıİgzšï¾7¾«¿+ÅºŠ%oã‹¿õ~gm×fœ»@·ç§÷÷¿›P˜‹h0 Æ¸ Æ4¤	!ƒªcRŒµÇrÄ ` æ@Âˆ
zf’‰Ğ céÁ\IH±4PŠ—ÜQÔ8,( ±€œb‚†D
rª  †¢ 1„#Â ğ¨_;* QŠ®@a@¡Äv€_D(ôßê¿ğø²úÙüã›û÷õıû:o._Oòyœ›±Ãßú¦ÅŸçıûO÷®wÃeÃŞçÎ©ßû¥Õ~e,Mÿ;í¿¿~¼]çïµö¯VÆëóWi÷ë¼_uŞvúm}ş?WWöM:fªº]w¥oÛûW¨WÛu§ÌÿsBEóïyÿj’LSjÎÏ˜æ‡¿ÊÍıP{ïM/o²Ë•ş{ëoÿû?_¿pguw÷[c<eæ¿Û{wŞı?Û½¶İsÿÒ&ÛïçÿVØ™«®ë}¸wááïıw÷KÓÿ;o¿¾İïz{îßÍåöß"òÇı¶bWó‡wıeİc?´L‘ÏÃíÛçª'‚Ş{¼.HhB BÍ'	 B@ö@PAdàˆ¢Á \®H2€> 5x*—ë  *0°!p˜ Ö% €#$  ‚,r4‚”XgbPôA õ‰ Yì 3Z`j€`ˆÃ²1„§ø ™"è H&¦jş^ßîgË¥1Ëçfƒ_¿w~•÷¬K*“ÿÿ§ÆôÍ“±—ãOû­“ï_Şì—¿y´»íÿM¿ñ¯ß¶÷Øª½c-uw?oÿõ½«OŠ®÷HüDŸåÑÏ·åuï“1Ëé·šæAÇ­mìÃ¼Øí$Jşoÿ?³oùšw[ÎÿŞ1‡ªOzŸNà	!À‚ iF#Z%¢$  ‚:¤5FL è½Ã½RØ10ET+ì)7q‹“¨"€0&Z¢±W³," Ô Èeàò"§ÁÓD@ĞpŠ0âaÁ4¤€°‚ÀB˜&CA©ÒÈ€cóˆ1H€+bTøQ	ÀŒ)I 
Ä’ŠĞÑ.…ä´Ib 50P…Šh IL²ŠèA@´ÁXH€"2d} @$a€½’‘ÔÁ¥N/â¢
`Lá à*1&ŠSAQs¤À"€†˜à!x ˆ ´¿Ó/ÏßÓ®ëŞ|.ÿê/¡İõèıüÙï÷‹~æUù{…ñÏßîW~ßãœòáö/¥Ö¸Úî×?eû³ô%¾ı^nİŒywşŸeÿ½¾{o¼ºßùóŞÛŠG`~Ç¾ŸæÛ~Ì·öQÚ^®ù?ü*İúû·»'é»ÈÌ>ÉöZíæ°qŞ¡“İèaragraph.paragraph,
            data: {
              toggle: 'dropdown'
            }
          }),
          ui.dropdown([
            ui.buttonGroup({
              className: 'note-align',
              children: [justifyLeft, justifyCenter, justifyRight, justifyFull]
            }),
            ui.buttonGroup({
              className: 'note-list',
              children: [outdent, indent]
            })
          ])
        ]).render();
      });

      context.memo('button.height', function () {
        return ui.buttonGroup([
          ui.button({
            className: 'dropdown-toggle',
            contents: ui.dropdownButtonContents(ui.icon(options.icons.textHeight), options),
            tooltip: lang.font.height,
            data: {
              toggle: 'dropdown'
            }
          }),
          ui.dropdownCheck({
            items: options.lineHeights,
            checkClassName: options.icons.menuCheck,
            className: 'dropdown-line-height',
            click: context.createInvokeHandler('editor.lineHeight')
          })
        ]).render();
      });

      context.memo('button.table', function () {
        return ui.buttonGroup([
          ui.button({
            className: 'dropdown-toggle',
            contents: ui.dropdownButtonContents(ui.icon(options.icons.table), options),
            tooltip: lang.table.table,
            data: {
              toggle: 'dropdown'
            }
          }),
          ui.dropdown({
            className: 'note-table',
            items: [
              '<div class="note-dimension-picker">',
              '  <div class="note-dimension-picker-mousecatcher" data-event="insertTable" data-value="1x1"/>',
              '  <div class="note-dimension-picker-highlighted"/>',
              '  <div class="note-dimension-picker-unhighlighted"/>',
              '</div>',
              '<div class="note-dimension-display">1 x 1</div>'
            ].join('')
          })
        ], {
          callback: function ($node) {
            var $catcher = $node.find('.note-dimension-picker-mousecatcher');
            $catcher.css({
              width: options.insertTableMaxSize.col + 'em',
              height: options.insertTableMaxSize.row + 'em'
            }).mousedown(context.createInvokeHandler('editor.insertTable'))
              .on('mousemove', self.tableMoveHandler);
          }
        }).render();
      });

      context.memo('button.link', function () {
        return ui.button({
          contents: ui.icon(options.icons.link),
          tooltip: lang.link.link + representShortcut('linkDialog.show'),
          click: context.createInvokeHandler('linkDialog.show')
        }).render();
      });

      context.memo('button.picture', function () {
        return ui.button({
          contents: ui.icon(options.icons.picture),
          tooltip: lang.image.image,
          click: context.createInvokeHandler('imageDialog.show')
        }).render();
      });

      context.memo('button.video', function () {
        return ui.button({
          contents: ui.icon(options.icons.video),
          tooltip: lang.video.video,
          click: context.createInvokeHandler('videoDialog.show')
        }).render();
      });

      context.memo('button.hr', function () {
        return ui.button({
          contents: ui.icon(options.icons.minus),
          tooltip: lang.hr.insert + representShortcut('insertHorizontalRule'),
          click: context.createInvokeHandler('editor.insertHorizontalRule')
        }).render();
      });

      context.memo('button.fullscreen', function () {
        return ui.button({
          className: 'btn-fullscreen',
          contents: ui.icon(options.icons.arrowsAlt),
          tooltip: lang.options.fullscreen,
          click: context.createInvokeHandler('fullscreen.toggle')
        }).render();
      });

      context.memo('button.codeview', function () {
        return ui.button({
          className: 'btn-codeview',
          contents: ui.icon(options.icons.code),
          tooltip: lang.options.codeview,
          click: context.createInvokeHandler('codeview.toggle')
        }).render();
      });

      context.memo('button.redo', function () {
        return ui.button({
          contents: ui.icon(options.icons.redo),
          tooltip: lang.history.redo + representShortcut('redo'),
          click: context.createInvokeHandler('editor.redo')
        }).render();
      });

      context.memo('button.undo', function () {
        return ui.button({
          contents: ui.icon(options.icons.undo),
          tooltip: lang.history.undo + representShortcut('undo'),
          click: context.createInvokeHandler('editor.undo')
        }).render();
      });

      context.memo('button.help', function () {
        return ui.button({
          contents: ui.icon(options.icons.question),
          tooltip: lang.options.help,
          click: context.createInvokeHandler('helpDialog.show')
        }).render();
      });
    };

    /**
     * image : [
     *   ['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
     *   ['float', ['floatLeft', 'floatRight', 'floatNone' ]],
     *   ['remove', ['removeMedia']]
     * ],
     */
    this.addImagePopoverButtons = function () {
      // Image Size Buttons
      context.memo('button.imageSize100', function () {
        return ui.button({
          contents: '<span class="note-fontsize-10">100%</span>',
          tooltip: lang.image.resizeFull,
          click: context.createInvokeHandler('editor.resize', '1')
        }).render();
      });
      context.memo('button.imageSize50', function () {
        return  ui.button({
          contents: '<span class="note-fontsize-10">50%</span>',
          tooltip: lang.image.resizeHalf,
          click: context.createInvokeHandler('editor.resize', '0.5')
        }).render();
      });
      context.memo('button.imageSize25', function () {
        return ui.button({
          contents: '<span class="note-fontsize-10">25%</span>',
          tooltip: lang.image.resizeQuarter,
          click: context.createInvokeHandler('editor.resize', '0.25')
        }).render();
      });

      // Float Buttons
      context.memo('button.floatLeft', function () {
        return ui.button({
          contents: ui.icon(options.icons.alignLeft),
          tooltip: lang.image.floatLeft,
          click: context.createInvokeHandler('editor.floatMe', 'left')
        }).render();
      });

      context.memo('button.floatRight', function () {
        return ui.button({
          contents: ui.icon(options.icons.alignRight),
          tooltip: lang.image.floatRight,
          click: context.createInvokeHandler('editor.floatMe', 'right')
        }).render();
      });

      context.memo('button.floatNone', function () {
        return ui.button({
          contents: ui.icon(options.icons.alignJustify),
          tooltip: lang.image.floatNone,
          click: context.createInvokeHandler('editor.floatMe', 'none')
        }).render();
      });

      // Remove Buttons
      context.memo('button.removeMedia', function () {
        return ui.button({
          contents: ui.icon(options.icons.trash),
          tooltip: lang.image.remove,
          click: context.createInvokeHandler('editor.removeMedia')
        }).render();
      });
    };

    this.addLinkPopoverButtons = function () {
      context.memo('button.linkDialogShow', function () {
        return ui.button({
          contents: ui.icon(options.icons.link),
          tooltip: lang.link.edit,
          click: context.createInvokeHandler('linkDialog.show')
        }).render();
      });

      context.memo('button.unlink', function () {
        return ui.button({
          contents: ui.icon(options.icons.unlink),
          tooltip: lang.link.unlink,
          click: context.createInvokeHandler('editor.unlink')
        }).render();
      });
    };

    /**
     * table : [
     *  ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
     *  ['delete', ['deleteRow', 'deleteCol', 'deleteTable']]
     * ],
     */
    this.addTablePopoverButtons = function () {
      context.memo('button.addRowUp', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.rowAbove),
          tooltip: lang.table.addRowAbove,
          click: context.createInvokeHandler('editor.addRow', 'top')
        }).render();
      });
      context.memo('button.addRowDown', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.rowBelow),
          tooltip: lang.table.addRowBelow,
          click: context.createInvokeHandler('editor.addRow', 'bottom')
        }).render();
      });
      context.memo('button.addColLeft', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.colBefore),
          tooltip: lang.table.addColLeft,
          click: context.createInvokeHandler('editor.addCol', 'left')
        }).render();
      });
      context.memo('button.addColRight', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.colAfter),
          tooltip: lang.table.addColRight,
          click: context.createInvokeHandler('editor.addCol', 'right')
        }).render();
      });
      context.memo('button.deleteRow', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.rowRemove),
          tooltip: lang.table.delRow,
          click: context.createInvokeHandler('editor.deleteRow')
        }).render();
      });
      context.memo('button.deleteCol', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.colRemove),
          tooltip: lang.table.delCol,
          click: context.createInvokeHandler('editor.deleteCol')
        }).render();
      });
      context.memo('button.deleteTable', function () {
        return ui.button({
          className: 'btn-md',
          contents: ui.icon(options.icons.trash),
          tooltip: lang.table.delTable,
          click: context.createInvokeHandler('editor.deleteTable')
        }).render();
      });
    };

    this.build = function ($container, groups) {
      for (var groupIdx = 0, groupLen = groups.length; groupIdx < groupLen; groupIdx++) {
        var group = groups[groupIdx];
        var groupName = group[0];
        var buttons = group[1];

        var $group = ui.buttonGroup({
          className: 'note-' + groupName
        }).render();

        for (var idx = 0, len = buttons.length; idx < len; idx++) {
          var button = context.memo('button.' + buttons[idx]);
          if (button) {
            $group.append(typeof button === 'function' ? button(context) : button);
          }
        }
        $group.appendTo($container);
      }
    };

    /**
     * @param {jQuery} [$container]
     */
    this.updateCurrentStyle = function ($container) {
      var $cont = $container || $toolbar;
      
      var styleInfo = context.invoke('editor.currentStyle');
      this.updateBtnStates($cont, {
        '.note-btn-bold': function () {
          return styleInfo['font-bold'] === 'bold';
        },
        '.note-btn-italic': function () {
          return styleInfo['font-italic'] === 'italic';
        },
        '.note-btn-underline': function () {
          return styleInfo['font-underline'] === 'underline';
        },
        '.note-btn-subscript': function () {
          return styleInfo['font-subscript'] === 'subscript';
        },
        '.note-btn-superscript': function () {
          return styleInfo['font-superscript'] === 'superscript';
        },
        '.note-btn-strikethrough': function () {
          return styleInfo['font-strikethrough'] === 'strikethrough';
        }
      });

      if (styleInfo['font-family']) {
        var fontNames = styleInfo['font-family'].split(',').map(function (name) {
          return name.replace(/[\'\"]/g, '')
            .replace(/\s+$/, '')
            .replace(/^\s+/, '');
        });
        var fontName = list.find(fontNames, self.isFontInstalled);

        $cont.find('.dropdown-fontname a').each(function () {
          var $item = $(this);
          // always compare string to avoid creating another func.
          var isChecked = ($item.data('value') + '') === (fontName + '');
          $item.toggleClass('checked', isChecked);
        });
        $cont.find('.note-current-fontname').text(fontName);
      }

      if (styleInfo['font-size']) {
        var fontSize = styleInfo['font-size'];
        $cont.find('.dropdown-fontsize a').each(function () {
          var $item = $(this);
          // always compare with string to avoid creating another func.
          var isChecked = ($item.data('value') + '') === (fontSize + '');
          $item.toggleClass('checked', isChecked);
        });
        $cont.find('.note-current-fontsize').text(fontSize);
      }

      if (styleInfo['line-height']) {
        var lineHeight = styleInfo['line-height'];
        $cont.find('.dropdown-line-height li a').each(function () {
          // always compare with string to avoid creating another func.
          var isChecked = ($(this).data('value') + '') === (lineHeight + '');
          this.className = isChecked ? 'checked' : '';
        });
      }
    };

    this.updateBtnStates = function ($container, infos) {
      $.each(infos, function (selector, pred) {
        ui.toggleBtnActive($container.find(selector), pred());
      });
    };

    this.tableMoveHandler = function (event) {
      var PX_PER_EM = 18;
      var $picker = $(event.target.parentNode); // target is mousecatcher
      var $dimensionDisplay = $picker.next();
      var $catcher = $picker.find('.note-dimension-picker-mousecatcher');
      var $highlighted = $picker.find('.note-dimension-picker-highlighted');
      var $unhighlighted = $picker.find('.note-dimension-picker-unhighlighted');

      var posOffset;
      // HTML5 with jQuery - e.offsetX is undefined in Firefox
      if (event.offsetX === undefined) {
        var posCatcher = $(event.target).offset();
        posOffset = {
          x: event.pageX - posCatcher.left,
          y: event.pageY - posCatcher.top
        };
      } else {
        posOffset = {
          x: event.offsetX,
          y: event.offsetY
        };
      }

      var dim = {
        c: Math.ceil(posOffset.x / PX_PER_EM) || 1,
        r: Math.ceil(posOffset.y / PX_PER_EM) || 1
      };

      $highlighted.css({ width: dim.c + 'em', height: dim.r + 'em' });
      $catcher.data('value', dim.c + 'x' + dim.r);

      if (3 < dim.c && dim.c < options.insertTableMaxSize.col) {
        $unhighlighted.css({ width: dim.c + 1 + 'em'});
      }

      if (3 < dim.r && dim.r < options.insertTableMaxSize.row) {
        $unhighlighted.css({ height: dim.r + 1 + 'em'});
      }

      $dimensionDisplay.html(dim.c + ' x ' + dim.r);
    };
  };

  var Toolbar = function (context) {
    var ui = $.summernote.ui;

    var $note = context.layoutInfo.note;
    var $editor = context.layoutInfo.editor;
    var $toolbar = context.layoutInfo.toolbar;
    var options = context.options;

    this.shouldInitialize = function () {
      return !options.airMode;
    };

    this.initialize = function () {
      options.toolbar = options.toolbar || [];

      if (!options.toolbar.length) {
        $toolbar.hide();
      } else {
        context.invoke('buttons.build', $toolbar, options.toolbar);
      }

      if (options.toolbarContainer) {
        $toolbar.appendTo(options.toolbarContainer);
      }

      this.changeContainer(false);

      $note.on('summernote.keyup summernote.mouseup summernote.change', function () {
        context.invoke('buttons.updateCurrentStyle');
      });

      context.invoke('buttons.updateCurrentStyle');
    };

    this.destroy = function () {
      $toolbar.children().remove();
    };

    this.changeContainer = function (isFullscreen) {
      if (isFullscreen) {
        $toolbar.prependTo($editor);
      } else {
        if (options.toolbarContainer) {
          $toolbar.appendTo(options.toolbarContainer);
        }
      }
    };

    this.updateFullscreen = function (isFullscreen) {
      ui.toggleBtnActive($toolbar.find('.btn-fullscreen'), isFullscreen);

      `yF¡ÍìÀ€Å`Á &İèHmè—•¢¸„$Pddd€ˆ,A,‰`<‰m#hqİ­ğ¬djAò 	*õ  A„Ò± s|§ëjÍ£.às¨ÍñBåÒˆ t@´l[ ®«YÍ°Èxd ^B‚÷ûüo_ßú§ÛıõuNûŸwÿ½Ÿ?c&Ë9éo[şŞÿ÷Ï¹r¿ûôİ×rG×®ƒ”ù—ç)(Öù;=k·{eİ9|ÎêÏİŸ¬ì¿Ë«üùY|ı†ì}¾îfô}çyøÿsÃ_ïuÿVeÀ{{Y³÷ÚãÿİÂê3úû½¿­uŠäÇÿAøîöõÿ·Ó×iïş¼Çû¥ëõºë¬•ş{/·v|îñİÍbq~íg—§÷ğ¶øŸï=ïßùï&ù_›óş¿¿»×%Ÿşİ>ÇWwº}ï?÷o“»–ZŞléN¸ªÛ§ÿÙ~ÄævŸš]ëİşşŸöwğÿïº¿|o×ûöóàÓ½ £€œ@%	F7¡W„	 … ÂÄA0Fá•¶­$ÚQEa!‘ˆ…=œ­ä
”%Ç@‡' 	@Ê«@c j0È
;LT ˆÎ–;ªJP‚ƒ`R¡â¤Ù5âE$A¡(BAô¤Ş  „KA—A 0½-²öôÍ‹ÔïıQÃû·î»ôM	~ı½ªİµç2c}T÷Ó87Wíİæ¶³™ÿ=ëKŠ™.±_øïu·ov6ÃşÆÿ¿e»^Ô6Ïû—ü¶vûwÜ`ÿ57æ;‹Õøçf·÷Ş½¯ÿvûóZæ/ä“ËŞıïùó\NÒ·¾ïDı½½ï„™0`¢HŠ‡éD+á,@  töÀäÄç!Š&$+4„5")k†°Š´à" I€X"LAƒ@!äy„-¹Y†‚(†”'
RSOƒ Ø1¨aAGœ"ÕE‚ˆ€HMÂ.‰Q0'D® ŠP˜Ñ’ ö¥* FĞ­ÒÊ7T ^ğ êa$"À?&6BÂR¹kù"L‡tP5H¢„÷J’M1ED ÁFÛ™M‡X9Ü"ÄPA$ mH 
>¶7)V1>‚@X	ŒRFPE"ZÂ#—âÃ`â»³oñ^oş’›ÿõñv±nûMğÏşågïÁúîjßêÿêwpë3ÿõÿ›iÿjÚö{»şàîïß³_û­zú_ÿ•ıÿŸÕî§_ı¿îï/ûCoÑ½6¡Nòwäßö¬ú½ş«w½¾×Ùd×ıûİ©ÿ£un#îí×«¾ÿôëàE½q"  Òø…,\	P‚0ÀT‚l ™ ğ‡±^K {JK$¤DBAÃÑ@ãáğ„„’¨\µÁ bJp12æ}ÖÀI®@ lD <PT8”ˆH„‚$<T –´/$ÎR¸n@7Š`r8"o.„ëîµ7)ÿÃïıÿİ×ü¿şÿ¾cû÷·ÿıÍ¼yû¡Ôrş-f75[¿ï™»7¿»ş÷—ìı|Ô×½oüĞò¿ïŸ±µª2»èÿ?ºSOÚÿîsÖüjë%ÿû=½Wİ÷sçªñš+\h½¿—í¿&Èÿ÷“L?Ÿí÷o™_¿½ûŞ°lİ·n<ú;ëÇ»Ùÿ_/ÿŞ6ûÿóœ·èéËÚ»ÿÛ·;ÿßû÷ÿ¿Ç/®ÿºÕoÿ§göí³š¿—t¹zúÿË}¶Wıÿ´öõñ_Æ¶—‚çÕózÏû|w×Û÷ÙôüMÏvû¿¨ôÜò^şovİ#t÷øíßo{ZÎk¸ï°ôšëOû÷õHTÙ '² Ğ•ÀÄ+,Ä‰q‹ª@dƒçl+N•& c„ «q!p@´€(à°¤L1	…T| ¡àE¥Ï€Q¥	é	ä§@¸F11
Š8¾†)±¢›¥ ‹†‡ÌU‘…A‘tA	2š%ÿ3cî®ÿwè{Ï/+_°½çwüß¯7‘•p÷ÿê÷ÿcÖïãö¶¿ôgÕêï¯±>ß÷vóZíW¿sÿWO’~ıˆş^ë[Ûş:l}V®NcòúÍË×İ÷÷>şÍ[ş÷7úûì½ıÿç—ay÷³şÊ›\×­7¿W~÷ºslmä„„.À@¦Z†@¶‰(HØ\eÀÖƒ "=œD€)Ğ!P¤$5 & 7€€½àpc)- bÔˆ¦  ÀxP4Â ÀB ƒb"x“xMòI  ‚0BTJ(Õ'¤ˆp52P#”á°B(Å±ì^ A! „¶Æ#‚$€	õD x‡&N ‹€M˜ëhÒTR)Âq›„A6 Ëƒ	 M@‘IËµ]A¬°FE3@‘€€äR£¤O^–ˆÑš|Œ˜!c ÁVâqZBZ¤±€H¬”‡ZÇ z*P‘%˜ŸoÈwëïüÇ{Ü>Öu¾Ò¾m¶ßûwûï™•xßÿß7y´G¾ş¥{÷,û{iÛÅûäıŸÿåŞ=»ßóÿï÷g¿¿ç6¯÷ßÛ­Ş½¿q_Vß=¾;cÕÅ¿Í­²Öõÿ§pIâŸşYÒ~ïí´ÿñPİ?Mÿ	÷Uû¡H "JÈØ€ ”Y Ğb¡ @P	 •\É0ÀŠg€„0ÒÀe€`.*‰€aaP‡„rja$&Š(`€‚ÁQ(Qx"e›‘\€U0< â‰¢Ş"‘F^¤N¦¹@Ú„ŒšA –‹ 
¬¦ŒVÀ»ğ'şÿİ}İın½¬şWüßı}]Ûııêı¾Ç{Ş/wÿ-òÇòü¯¿ş›İSŸöÕyŞ>}Ûıö¿¾ËŸ¹«Ë¾LôşV‡ÎïÅ^ÿï9cvn¯¯vØõÿ»ÿ¿ó,_üß0ì³¾ïœ~ã¿¶¾Sæ»êû¿^÷ÿİJï¸»ò.Ìº}1íoŞwÃ}V«¦zÓ{kgÍõOyyÏ§òÖö¯_şõS7îş}ïg§joL÷çŞûÕmÇ<ªµœóş±ª½`üÓüÜ=Yòß¼nŸGõÿûårg8w¶ÄôúïöıkWŞzüë÷¬¼/ıšÿ¬ëıŸ]¡§şIãuƒµ[¯åsm),?ûú»Œ©muÜ MÍôw× 'A¤xÌÔˆ„0e’%W¬H¯‹¡BRefˆBPİÈ\§Œ=J²hïÂ6ö»ÅA0qCØW*ŠFUi™.!±  ²:>ƒ)‡£ ¤@ìÄâI²ñFbD!İ„QRœ¬b† tCrF¿ş™ûØoü†¿=ú¶}WmşÏIÔoT|ıÿù{nøqõ›ş½æ×í<~›}MMıŒq~¿wæøñ\ÚçåKNíøëÛí=Õß¿§Éÿİäy;o]£~¾p·}ıïÆò=Îõ{íq¹Ûíıs{ï¦á÷rõßÖîŞ{ª¼ÿ®õ¿ê¾İ‘¡´ P9ã„B$C D„ÆF( âH1‘‚¯Ä/EÆèPH`PC„‹È¿EƒB*$G0ˆ °ƒq‡ @‹4Áª!PhR‘0ØYB P(8‡ÒB5¥"† ³‚• ”2`@;•°ºefOnd˜¶¡`‚Ì–,¬ C‰Å4 ìâ,Ä( ¡ h(f1h±Š1@<03„Ç@á‚‚ø2 N x°%kX†ˆk•Ä°Öw6ĞTÚ#fâ*”„X°"ÈÜ È¢
T€¨ÆŒ!€™”L/GX°0/Lâ ş~ò9âşË¿{óïúï-{÷÷}^û»4ïw¾W|ö¯Æ—×JWóóÕ©“OëÑÛÿ“ùèkİ7'?šİ¿/™ÿwlÎÕŞs–y÷áÛÿûQßšúMYşïı_óZï¶ïNçÙ?ÿãÿ×._^ÿ;z²}>¹÷óº¾€ƒ£ÜaøE!œøQ®qÔÃú‹&*¥‚ÀAÜ4ó²4EyÓ„ hp€‚´J’Ağ!L” =8y¸ej².AäH „‘b÷¤,Ilğ0c$ä81`só‰ĞpfŒ%èƒ-Jâ À.Ë ÂT¨0™F0—•?ï©÷=üÙÿíû‡,§»ı¿Ã¾ıéÚÛz¯òÿouõ£ÛÎOÿÿ¿{ÿ“¥ÿÖ>ş=>¿øwş£±ß6Ëıú_{éùıÓwö•vşÿñ×wøµ¯Ÿš›òöu[¶7ëÅû^ò”îçŞmß÷½it=İ¾ıß¼¯Qù·ôwÿdü{œOÿnÿ¾·kÚ÷‡~{ï›ë_{¿­o~şŞÜí=:<êíãwİª_Ÿyè÷÷Ÿç»sä‹ÿäz=üVmõ×ñüÚó‡÷ásÿkİ7İşÖ[ÁÌYïï¬î¿~ö¿Ûı|Ö¾Û]úÃûO7ônƒùÎ÷z¿ê<ıO_kúéõª»ÁÿyøømD „0\ 0‹tH] TAbRUHÃ I HB¬ğ(ä„6rÁÑ…4ÇÊ„³Ç…tX‚±²”‹ÑPáb„ p<À-™‚%¹h 	èĞ˜8&VYŠIp'´h`T \Jt¡àA!
„"®(¿³	ö|Õî®¿nzåhÎg=í½ß3íîùxØç¿øbŞéíñŠŒE¾–_¹¥çÄ÷iÔçûÿzk[=÷ÿ»Ïãÿ›*½YR7öe÷ì2ÛØnquæŞwyçŞ½/óóÊÖ_÷/~ş5ÿ÷ş¿ÿç¯ÍÛéòó_ï¸úüµşsÛë¨Jü%$,<@˜p"[87Pa…€ A¹Q\E€  ¤F$ªH$W‚‚îÇ‘!ª’0Í@ b2²ò ±kN¤dhF`±qƒô0(/ÀÀ—‚ ù½B$.€ôD5Á÷A &_º™BÌ4TèAÀ	@ ƒu¢`{b *#8UH«E‘µ,1[Œ('@ ¥uSI
(É¤‘@/@d§MCı€5©S–ô"Eâ NGX›€%0ĞÜhANGá šA­¥  AØE@¨	:ñÈ |	¥@À  RS å¥È«»ÿZúÁòïµ~7o=…õşÇ›ïüş~áo÷G×ŞóïŞÕÍÓÿ§‚ÿóÿÉgñ®š¿ßÚ|÷ÙJÀ˜íé»ÿ‘6W²Ç÷±Yk7gŞ}uœgşés«o<øö_î3Ëüw}¾ûıT-Öönôû:ñ5áÿûT›×|òi–×÷«}5ï¾­Şå` €—$€ à ø˜j ï¾­Şr~€õ¦€ÿÿÿÿ   h ï¾­Ş4€ÿÙ   †î  
ña€d ï¾­Ş€³ûÙ °Ût²7Ì  c ï¾­ŞûÙ–Ø €ÛÌ  b ï¾­Ş³ûÙ ÛÌ  ` ï¾­ŞÍò€€ Pf ˜ğñ,   _ ï¾­Şß€á€ P+©“   Ç?€^ ï¾­ŞÍÅ€€D€"x€    0nß  
uY€L  [ ï¾­Ş?[€[Ğ€  €“   9€L  Y ï¾­ŞpàÙûh€ Ğ$ 	   Vÿ€L  V ï¾­Ş\—€ûÙ€ Ğ¯±ÿÿÿ“   Ââ€L  T ï¾­Şƒ¨	€äÙà#  
L  R ï¾­ŞÔì€Q½€8€ ğ~ì8øÌ  P ï¾­ŞoÙ€Ê÷€   Tºİ   r>€L € O ï¾­Ş·€~€Z
€f>€ P Ìjä   L  N ï¾­Ş·
€Ng€ À  ‡İL  H ï¾­ŞÇ	€ºŸ€ @vN€ÿÿÿ“  L  F ï¾­ŞËz€tò€ 0Ç¢   ¬!€E ï¾­Ş÷J€IŞ€   L¹÷  
L  C ï¾­Ş.y€I5
€ ° ¤ó      B ï¾­Ş0	€ÉX€ °  dæîL  @ ï¾­Ş÷£€…ä€Ì´…ä€ p  Ì´? ï¾­Ş$¦€+9€ pÿ€ÿÿÿ“   h‚
€> ï¾­Ş³Ùç€  Ì}ó  
Ğm€A ï¾­ŞT@€¢Æ€\W€ à w  L  D ï¾­Ş?€é€  ş»ÿÿÿ“   G ï¾­Ş‘ €˜€ P|·ÿÿÿ“   I ï¾­ŞJ	€ÌQ€á€   ø»  :èÇ€J ï¾­ŞöÈ€¤€  Ç¬±7  
K ï¾­Ş9Ù{>€ 0ûbÿÿÿ“   L ï¾­Ş˜€ğ*€UT€ °È ”jü  
Ì  M ï¾­ŞI€–O€ €/Ÿ“   zŠ €L  Q ï¾­Ş5ß€N[€ ° Ç   ÷Ó	€   S ï¾­Şÿ·€Ä€ €ÜË,¦è  ”€U ï¾­ŞcY€œê€ 0 ş  
L  W ï¾­Şâ€#€ÿÿÿÿ      X ï¾­Şf‰ØÿB€ P¥     Z ï¾­ŞC»€¡p€   0½ô    	€  \ ï¾­ŞZ	€„ƒ€Ï\€  ã˜±7Ì  ] ï¾­ŞûÙ  Û  
Ì  a ï¾­ŞˆAØÚ]Ù   \sİ€e ï¾­Ş4÷	€R€ @ ¬Æõ      f ï¾­Ş'€"†€ €  üæ   g ï¾­ŞïiÙ6g€ ğËÿÿÿ“   i ï¾­ŞWp€¥€  T²ö  :L  k ï¾­Ş¯½€‘Û€  hO“  l ï¾­ŞO— €Ë€ ğ ¼—î  
  q ï¾­Ş7ß €lW€  2 ´#  ;°è€s ï¾­ŞÛ€$!
€ @
 à­ä  
w ï¾­Şlä€I’€"ç€   „öè€Ì „ x ï¾­Şô©€k€ @dÿÿÿ“   ¹€L  | ï¾­ŞMU€‹M€ `xE“_X	€} ï¾­Ş°»ş@»ì´gKËK·‡nÌK¹^@»üt¬Ë´Ä´tÚ¼k¾à»CK»›¼»7äÌ»ñ¾[ª¼¼dµ»K±Q»à»¿û ë«´Q¼KDdZK²	±›k	¶[~ûF¿&Ç´»î	  L1Å 0ñ8³?8LîL-È 2g	4@$;9t2Å€3Å €  °	 SI  b  l  ¢"ªã¢"‹ã¢"Šâ¢"‹ã¢"‹Ó  Šê¢"‹ã‚"„Ü¢"‹ó¢"«ãª*Šâ¢"‹ã²"«Ò®.‹Ó  Šê  ‹î¢"«ã  ŠŞ¢"«ã¢1ªâ²"™ò  ªê  Šú¢"«â  Šú¢"ªâ¢"«ã¢"‹ã¢2ŠÚ²1ŠÖ’2‹â’2‹ó¢"Šó¢"ªã¢"«ã¢2«ã¢"‹ó  ªÒ¢"«ã¢"‹ã  šÚ¢"‹ã²2‹ã¢"Šâ¢2‹ã  ªî  ªş  ŠÖ  ŠÚ¢"‹×¢"«ã²"ŠÒ  ªŞ¢"‹ã  Ší 0Šö‚"„Ü¢"‹ã¢"‹ã¡"‹ã¢2Šâ¢"‹ã  ªê¢"‹ãÆÌ€ş\€Š&€  $1   ‘€L  » ï¾­Ş©:
€¿†€ €6 ¬ö   L  ¹ ï¾­Ş†›€ò0€4ù€&† €  l  
L  ¸ ï¾­Şâø€œ0€  Ğ   L  ¶ ï¾­ŞDá€ü#€ Ğ Ø¯ø  
µ ï¾­ŞP~€„	€ àDÎÿÿÿ“   L  ´ ï¾­Ş3š€ûûÙ Ğæt²7  
Ì  ³ ï¾­ŞX¿Ø€   ± ï¾­Ş÷û €™¸€  a¬±7  
° ï¾­Şú®€ñ€ ° T1ğ   ‚€   ¯ ï¾­Ş‘€X¶Ù‘€X¶Ù‘€X¶Ù p	 àö  ;L  ­ ï¾­Şz€l€   ®7   L € ¬ ï¾­Ş €³Õ€Q
€  °  
-€« ï¾­Ş×u€o&€ Ğ P…  ; ª ï¾­Ş.€öûÙ @é7ÿÿÿ“   L  ¦ ï¾­Ş2 €  é7“   L  ¤ ï¾­ŞÏ[€èz€ Ğ ÔÒø   T±€   £ ï¾­Şf€€Õù€ ĞÊR“   ¢ ï¾­Ş?,€d»€  h ã  
ó€L   ï¾­Ş€2€÷Ö€ÔûÙ P"7LñÜ£x€Ì  – ï¾­Şz€ÙjÙjóÙ @"7  
• ï¾­Ş-‘€UÁ € °Ç±ÿÿÿ“   gé€L   ï¾­Ş2Á€ j€ Pc³ÿÿÿ“    ï¾­ŞĞ€2à€ë
€ 0Q¬±7  
jÕ€Ì   ï¾­Şq€ºh€ ÀPÿÿÿ“    ï¾­ŞW¨€€ÖÒ€_èØ ` \óò  
à€L  ‰ ï¾­ŞTç€MS€ p d1ğ   yÇ€L  … ï¾­ŞÎ…€È…€  ¸{ö   L € € ï¾­Ş¯¨ €ôğ€€İûÙ €Ëª   D²7~ ï¾­ŞÆ›€ÜûÙ×€ pËª ï¾­ŞÙ¨€{€€ p6Ì   ï¾­Şp€€  Ô‚ ï¾­ŞºÍ€û€t€ ğ“|½7   ƒ ï¾­Ş^Æ€ñçÙ–Û€ `  ¾Ş  
‡Å€L  „ ï¾­ŞÒØ¡–Ù p
  Óá   êd€L € † ï¾­Şiİ€Í¸€ À  ´©Y¨€L  ‡ ï¾­ŞMØÑ>€ ``ü
  ˆ ï¾­ŞÖÎ€FT€ à Øfì ³€Š ï¾­ŞI+ÙqÍ€ ĞaJLñÜ  ¯€,   ‹ ï¾­Ş>]€•8€ Ğ ¤Œö     Œ ï¾­ŞÖñ€j€  û~ÿÿÿ“   ‘ ï¾­ŞêûÙÃ€  Çt²7  
Ì  ’ ï¾­Şş€€éûÙ 0ÇÌ  “ ï¾­ŞÂ€üü€Â€üü€ Ğ‹ è      ” ï¾­Ş„Ö€]y€ € (ïàL „ — ï¾­Şşì€!€ ĞÃ¤“   ¶?ÙL  ˜ ï¾­Ş¡1€ÚsÙ ó˜“   /†€™ ï¾­Şf[€:İÙ ğÅÿÜ[ù  š ï¾­ŞUzØŒ÷€ ĞRÿÿÿ“   › ï¾­Ş­:€ Æ€ ğsªD²7  
œ ï¾­ŞŒj€€  d°   u‡€L    ï¾­Ş´fØtèØM€"©€  ªX  
Ÿ ï¾­Ş&ï€SÎ€ P8•“   ƒj€  ï¾­Şæ€¿0€  C  ®7   L € ¡ ï¾­ŞÎûÙ 0é7“   L  ¥ ï¾­Şˆx€iµ€ `Ë8“§ ï¾­Ş5Ó€ã
€   ¨ ï¾­ŞyM€rbØ ` ¸Ü     © ï¾­Şú‰€UY€  H$   L € ® ï¾­ŞÕwØ Àæt²7  
Ì  ² ï¾­ŞŠ€*€>—€'´Ù  Ç”jüÌ  · ï¾­ŞG€Ö½€ €) HFà   L € .body) : $editor;

      var imageLimitation = '';
      if (options.maximumImageFileSize) {
        var unit = Math.floor(Math.log(options.maximumImageFileSize) / Math.log(1024));
        var readableSize = (options.maximumImageFileSize / Math.pow(1024, unit)).toFixed(2) * 1 +
                           ' ' + ' KMGTP'[unit] + 'B';
        imageLimitation = '<small>' + lang.image.maximumFileSize + ' : ' + readableSize + '</small>';
      }

      var body = '<div class="form-group note-form-group note-group-select-from-files">' +
                   '<label class="note-form-label">' + lang.image.selectFromFiles + '</label>' +
                   '<input class="note-image-input form-control note-form-control note-input" '+
                   ' type="file" name="files" accept="image/*" multiple="multiple" />' +
                   imageLimitation +
                 '</div>' + 
                 '<div class="form-group note-group-image-url" style="overflow:auto;">' +
                   '<label class="note-form-label">' + lang.image.url + '</label>' +
                   '<input class="note-image-url form-control note-form-control note-input ' +
                   ' col-md-12" type="text" />' +
                 '</div>';
      var footer = '<button href="#" class="btn btn-primary note-btn note-btn-primary ' +
      'note-image-btn disabled" disabled>' + lang.image.insert + '</button>';

      this.$dialog = ui.dialog({
        title: lang.image.insert,
        fade: options.dialogsFade,
        body: body,
        footer: footer
      }).render().appendTo($container);
    };

    this.destroy = function () {
      ui.hideDialog(this.$dialog);
      this.$dialog.remove();
    };

    this.bindEnterKey = function ($input, $btn) {
      $input.on('keypress', function (event) {
        if (event.keyCode === key.code.ENTER) {
          $btn.trigger('click');
        }
      });
    };

    this.show = function () {
      context.invoke('editor.saveRange');
      this.showImageDialog().then(function (data) {
        // [workaround] hide dialog before restore range for IE range focus
        ui.hideDialog(self.$dialog);
        context.invoke('editor.restoreRange');

        if (typeof data === 'string') { // image url
          context.invoke('editor.insertImage', data);
        } else { // array of files
          context.invoke('editor.insertImagesOrCallback', data);
        }
      }).fail(function () {
        context.invoke('editor.restoreRange');
      });
    };

    /**
     * show image dialog
     *
     * @param {jQuery} $dialog
     * @return {Promise}
     */
    this.showImageDialog = function () {
      return $.Deferred(function (deferred) {
        var $imageInput = self.$dialog.find('.note-image-input'),
            $imageUrl = self.$dialog.find('.note-image-url'),
            $imageBtn = self.$dialog.find('.note-image-btn');

        ui.onDialogShown(self.$dialog, function () {
          context.triggerEvent('dialog.shown');

          // Cloning imageInput to clear element.
          $imageInput.replaceWith($imageInput.clone()
            .on('change', function () {
              deferred.resolve(this.files || this.value);
            })
            .val('')
          );

          $imageBtn.click(function (event) {
            event.preventDefault();

            deferred.resolve($imageUrl.val());
          });

          $imageUrl.on('keyup paste', function () {
            var url = $imageUrl.val();
            ui.toggleBtn($imageBtn, url);
          }).val('').trigger('focus');
          self.bindEnterKey($imageUrl, $imageBtn);
        });

        ui.onDialogHidden(self.$dialog, function () {
          $imageInput.off('change');
          $imageUrl.off('keyup paste keypress');
          $imageBtn.off('click');

          if (deferred.state() === 'pending') {
            deferred.reject();
          }
        });

        ui.showDialog(self.$dialog);
      });
    };
  };


  /**
   * Image popover module
   *  mouse events that show/hide popover will be handled by Handle.js.
   *  Handle.js will receive the events and invoke 'imagePopover.update'.
   */
  var ImagePopover = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var $editable = context.layoutInfo.editable;
    var editable = $editable[0];
    var options = context.options;

    this.events = {
      'summernote.disable': function () {
        self.hide();
      }
    };

    this.shouldInitialize = function () {
      return !list.isEmpty(options.popover.image);
    };

    this.initialize = function () {
      this.$popover = ui.popover({
        className: 'note-image-popover'
      }).render().appendTo('body');
      var $content = this.$popover.find('.popover-content,.note-popover-content');

      context.invoke('buttons.build', $content, options.popover.image);
    };

    this.destroy = function () {
      this.$popover.remove();
    };

    this.update = function (target) {
      if (dom.isImg(target)) {
        var pos = dom.posFromPlaceholder(target);
        var posEditor = dom.posFromPlaceholder(editable);

        this.$popover.css({
          display: 'block',
          left: pos.left,
          top: Math.min(pos.top, posEditor.top)
        });
      } else {
        this.hide();
      }
    };

    this.hide = function () {
      this.$popover.hide();
    };
  };

  var TablePopover = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var options = context.options;

    this.events = {
      'summernote.mousedown': function (we, e) {
        self.update(e.target);
      },
      'summernote.keyup summernote.scroll summernote.change': function () {
        self.update();
      },
      'summernote.disable': function () {
        self.hide();
      }
    };

    this.shouldInitialize = function () {
      return !list.isEmpty(options.popover.table);
    };

    this.initialize = function () {
      this.$popover = ui.popover({
        className: 'note-table-popover'
      }).render().appendTo('body');
      var $content = this.$popover.find('.popover-content,.note-popover-content');

      context.invoke('buttons.build', $content, options.popover.table);

      // [workaround] Disable Firefox's default table editor
      if (agent.isFF) {
        document.execCommand('enableInlineTableEditing', false, false);
      }
    };

    this.destroy = function () {
      this.$popover.remove();
    };

    this.update = function (target) {
      if (context.isDisabled()) {
        return false;
      }

      var isCell = dom.isCell(target);

      if (isCell) {
        var pos = dom.posFromPlaceholder(target);
        this.$popover.css({
          display: 'block',
          left: pos.left,
          top: pos.top
        });
      } else {
        this.hide();
      }

      return isCell;
    };

    this.hide = function () {
      this.$popover.hide();
    };
  };

  var VideoDialog = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var $editor = context.layoutInfo.editor;
    var options = context.options;
    var lang = options.langInfo;

    this.initialize = function () {
      var $container = options.dialogsInBody ? $(document.body) : $editor;

      var body = '<div class="form-group note-form-group row-fluid">' +
          '<label class="note-form-label">' + lang.video.url + ' <small class="text-muted">' + lang.video.providers + '</small></label>' +
          '<input class="note-video-url form-control  note-form-control note-input span12" ' + 
          ' type="text" />' +
          '</div>';
      var footer = '<button href="#" class="btn btn-primary note-btn note-btn-primary ' + 
      ' note-video-btn disabled" disabled>' + lang.video.insert + '</button>';

      this.$dialog = ui.dialog({
        title: lang.video.insert,
        fade: options.dialogsFade,
        body: body,
        footer: footer
      }).render().appendTo($container);
    };

    this.destroy = function () {
      ui.hideDialog(this.$dialog);
      this.$dialog.remove();
    };

    this.bindEnterKey = function ($input, $btn) {
      $input.on('keypress', function (event) {
        if (event.keyCoÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿÿİİİÿ´´´ÿ’““ÿnstöIUV}                                                                                                                                    :?@Ëlnnÿÿ²²²ÿ§«¬ÿŠ§µÿt ¸ÿl”«ÿm–®ÿl•­ÿn˜¯ÿm–®ÿo˜¯ÿn˜°ÿn˜¯ÿp™±ÿo˜°ÿqš±ÿpš±ÿp™±ÿq›²ÿqš²ÿpš±ÿsœ´ÿsœ´ÿqœ²ÿtµÿsœ´ÿu¶ÿtµÿtµÿu¶ÿu¶ÿtµÿvŸ·ÿu¶ÿv ·ÿw ¸ÿvŸ·ÿx¢¹ÿx¡¹ÿx¢¸ÿy¢ºÿy¢¹ÿy£»ÿz£»ÿy£ºÿ|¥¼ÿ{¤»ÿ{¦½ÿ‹«¾ÿ“¯¿ÿ•±Áÿ•°Àÿ•±Áÿ–±Áÿ•±Áÿ˜³Ãÿ—²Âÿ˜´Äÿ˜´Ãÿ˜³ÃÿšµÅÿ™µÄÿš¶Æÿš¶Åÿš¶Åÿ¸Èÿ›·Æÿ¹Éÿ¸Èÿ¸Èÿ¹Éÿ¹ÉÿŸºÉÿŸºÊÿŸºÊÿ »ÊÿŸºÊÿ¢½Ìÿ »Ëÿ¢½Ìÿ¢½Ìÿ¢½Ìÿ¤¿Îÿ¢½Ìÿ§ÄÔÿÆåñÿÇÛâÿÇÉÊÿ¨¨¨ÿ‚ÿSZ[ã3;;7                                                                                                                                    $**FKOPğƒƒƒÿœ¢ÿ;tšÿ]£ÿl¾ÿŠãÿ‡áÿˆâÿˆâÿ‰áÿ‰ãÿˆãÿŠäÿŠäÿ‹ãÿ‹åÿŠåÿŒæÿŒæÿçÿçÿçÿèÿèÿêÿéÿéÿêÿêÿ’ëÿ ‘ëÿ “ìÿ’ìÿ!’ìÿ ”íÿ"“íÿ!•îÿ#”îÿ#–ïÿ$•ïÿ$•ñÿ#—ğÿ%–ğÿ%˜ñÿ&—ñÿ&™óÿ'˜òÿ'šôÿ)™óÿ(›õÿ(šôÿ)šöÿ)œõÿ+›õÿ*÷ÿ,œöÿ+øÿ-÷ÿ,Ÿùÿ.øÿ- úÿ/Ÿùÿ.¡ûÿ0 úÿ/¢üÿ1¢ûÿ0¡ûÿ2£ıÿ1¢üÿ3¤şÿ2£ıÿ2¥ÿÿ4¤ÿÿ3¦şÿ5¥ÿÿ4§ÿÿ6¦ÿÿ5¨ÿÿ7§ÿÿ6©ÿÿ8¨ÿÿ7ªÿÿ9ªÿÿ8«ÿÿ9ªÿÿ9ªÿÿLºÿÿM·ÿÿA£íÿb›¼ÿ•–ÿ`deú8?Ap                                                                                                                                    079n[_`údqyÿJ…ÿ T›ÿ ]¨ÿsÅÿåÿäÿâÿäÿäÿ åÿ ‘åÿäÿ!æÿ!‘æÿ"‘çÿ"“çÿ"’æÿ#’èÿ#“çÿ$“éÿ$•éÿ$”êÿ%”êÿ%•éÿ&•ëÿ&—ëÿ(–ìÿ'˜ìÿ'—íÿ(™íÿ(˜îÿ*˜îÿ)šîÿ+™ïÿ*›ïÿ,šğÿ+œğÿ+›ñÿ,ñÿ,œòÿ.œòÿ-ôÿ/óÿ.Ÿõÿ0ôÿ/ ôÿ1Ÿõÿ0¡õÿ2 öÿ1¢öÿ1¡÷ÿ3£÷ÿ2¢ùÿ4¤øÿ3£úÿ5¥ùÿ4¤ûÿ6¦úÿ5¥üÿ7§ûÿ6¦ıÿ8¦üÿ7¨şÿ9§ıÿ8©ÿÿ:¨şÿ9ªÿÿ;©ÿÿ:«ÿÿ<ªÿÿ;¬ÿÿ=«ÿÿ<­ÿÿ>¬ÿÿ=®ÿÿ?­ÿÿ>¯ÿÿ@®ÿÿ?°ÿÿA¯ÿÿ@±ÿÿA°ÿÿC²ÿÿB±ÿÿA°ÿÿP½ÿÿT¿ÿÿ;¦ûÿuÆÿi¡ÿgosüAJN›                                                                                                                                BNR„NW\ù7dÿ K‡ÿZŸÿ _©ÿwÈÿ!äÿãÿâÿâÿäÿ ãÿ åÿ"äÿ!‘äÿ!æÿ"’åÿ"‘çÿ$‘æÿ#“èÿ#’çÿ$”çÿ$“éÿ&“èÿ%•êÿ%”éÿ&–ëÿ&•êÿ'—êÿ'–ëÿ)–ëÿ(—íÿ(—ìÿ)™îÿ)˜íÿ*šïÿ*™îÿ+›îÿ+šïÿ-œïÿ,›ğÿ.›ğÿ-òÿ-œñÿ.óÿ.òÿ/Ÿôÿ/óÿ0 õÿ0Ÿôÿ1¡öÿ1 õÿ3¢÷ÿ2¡öÿ4£öÿ3¢÷ÿ5¤÷ÿ4£øÿ6¥øÿ5¤ùÿ7¦ùÿ6¥úÿ8¥úÿ7§ûÿ9¦ûÿ8¨ıÿ:§üÿ9©şÿ;¨ıÿ:ªÿÿ<©şÿ;«şÿ=ªşÿ<¬şÿ>«ÿÿ=­ÿÿ?¬ÿÿ>®ÿÿ@­ÿÿ?¯ÿÿA®ÿÿ@°ÿÿB¯ÿÿA±ÿÿB°ÿÿB±ÿÿA±ÿÿO¼ÿÿWÁÿÿ@ªûÿ{Èÿ T›ÿ-[{÷P_f­                                                                                                                            2<Aš,Dñ <jÿO‹ÿ\¡ÿ aªÿ{Íÿ çÿâÿäÿãÿ!ãÿ åÿ äÿ!‘æÿ!åÿ#’åÿ"‘çÿ"‘æÿ#“èÿ#’çÿ%”éÿ$“èÿ$“èÿ%•éÿ%”éÿ'–ëÿ&•êÿ&—ìÿ'–ëÿ'–íÿ(˜ìÿ(—ìÿ*™íÿ)˜íÿ+šïÿ*™îÿ*›ğÿ+šïÿ+œñÿ,›ğÿ,›òÿ-ñÿ-œñÿ/òÿ.òÿ0Ÿóÿ/óÿ/ ôÿ0Ÿôÿ0¡öÿ1 õÿ1¢÷ÿ2¡öÿ2£øÿ3¢÷ÿ3¤ùÿ4£øÿ4¥úÿ5¤ùÿ5¦ûÿ6¥úÿ6¥üÿ7§ûÿ7¦ıÿ8¨üÿ8§üÿ9©ıÿ9¨ıÿ:ªÿÿ:©şÿ;«şÿ;ªşÿ<¬ÿÿ<«ÿÿ=­ÿÿ=¬ÿÿ>®ÿÿ>­ÿÿ?¯ÿÿ?®ÿÿ@°ÿÿ@¯ÿÿA±ÿÿC°ÿÿB²ÿÿD±ÿÿA°ÿÿM¼ÿÿXÃÿÿD­ıÿ€Íÿ YÿEzøCT`¾'9K                                                                                                                            '/6¨%Bö?pÿRÿ]¢ÿ a®ÿÒÿ!‘çÿ äÿãÿåÿ äÿ äÿ ‘æÿ!åÿ!’çÿ"‘æÿ"‘æÿ"“çÿ#’çÿ#”éÿ$“èÿ$“êÿ$•éÿ%”ëÿ%–êÿ&•êÿ&—ìÿ(–ëÿ'–íÿ'˜ìÿ(—îÿ(™íÿ)˜ïÿ)šîÿ*™îÿ*›ïÿ,šïÿ+œğÿ+›ğÿ,›òÿ,ñÿ-œóÿ-òÿ.ôÿ.Ÿóÿ/õÿ/ ôÿ1Ÿöÿ0¡õÿ2 õÿ1¢öÿ3¡öÿ2£÷ÿ4¢÷ÿ3¤øÿ5£øÿ4¥ùÿ6¤ùÿ5¦úÿ7¥úÿ6§üÿ8¦ûÿ7¦ıÿ9¨üÿ8§şÿ:©ıÿ9¨ÿÿ;ªşÿ:©şÿ<«şÿ;ªşÿ=¬ÿÿ<«ÿÿ>­ÿÿ=¬ÿÿ?®ÿÿ>­ÿÿ@¯ÿÿ?®ÿÿA°ÿÿ@¯ÿÿB±ÿÿA°ÿÿB²ÿÿB±ÿÿC³ÿÿA°ÿÿK¹ÿÿYÄÿÿF°ÿÿ …Óÿ [¡ÿF{û,G[¶ ,9                                                                                                                            	(ˆ (FùCtÿT“ÿ]¤ÿ d¯ÿÔÿ!èÿãÿåÿäÿ æÿ ‘åÿ"åÿ!’çÿ!‘æÿ"‘èÿ"“çÿ$’éÿ#”èÿ#“èÿ$“êÿ$•éÿ&”ëÿ%–êÿ%•ìÿ&—ëÿ&–ëÿ'–ìÿ'˜ìÿ)—îÿ(™íÿ*˜ïÿ)šîÿ)™ğÿ*›ïÿ*šñÿ+œğÿ+›òÿ-›ñÿ,ñÿ.œòÿ-òÿ-óÿ.Ÿóÿ.õÿ/ ôÿ/Ÿöÿ0¡õÿ0 ÷ÿ1¢öÿ1¡øÿ2£÷ÿ2¢ùÿ3¤øÿ3£úÿ4¥ùÿ4¤ûÿ5¦úÿ5¥üÿ6§ûÿ6¦ûÿ7¦üÿ7¨üÿ8§ıÿ8©ıÿ9¨ÿÿ9ªşÿ:©şÿ:«şÿ;ªÿÿ;¬ÿÿ<«ÿÿ<­ÿÿ=¬ÿÿ=®ÿÿ>­ÿÿ>¯ÿÿ?®ÿÿ?°ÿÿ@¯ÿÿ@°ÿÿA°ÿÿA±ÿÿB±ÿÿD²ÿÿC²ÿÿC²ÿÿK¹ÿÿZÇÿÿJ³ÿÿ#ŠÙÿ_¥ÿ H€ı4Y¡-6                                                                                                                             & *LüExÿT–ÿ ^¥ÿf³ÿ†Úÿ ‘æÿäÿäÿ!æÿ ‘åÿ çÿ!’æÿ!‘æÿ#‘çÿ"“çÿ"’éÿ#”èÿ#“êÿ%“éÿ$•éÿ$”êÿ%–êÿ%•ìÿ'—ëÿ&–íÿ&–ìÿ'˜îÿ'—íÿ(™íÿ(˜îÿ)šîÿ)™ïÿ+›ïÿ*šñÿ*œğÿ+›òÿ+›ñÿ,óÿ,œòÿ-ôÿ-óÿ/Ÿõÿ.ôÿ0 ôÿ/Ÿõÿ1¡õÿ0 öÿ2¢öÿ1¡÷ÿ1£÷ÿ2¢øÿ2¤øÿ3£úÿ3¥ùÿ4¤ûÿ4¦úÿ5¥üÿ5¥ûÿ6¦ıÿ6¦üÿ7¨şÿ7§ıÿ8©ÿÿ8¨şÿ9ªşÿ9©şÿ:«şÿ:ªÿÿ;¬ÿÿ=«ÿÿ<­ditor.getSelectedText');
      context.invoke('editor.saveRange');
      this.showVideoDialog(text).then(function (url) {
        // [workaround] hide dialog before restore range for IE range focus
        ui.hideDialog(self.$dialog);
        context.invoke('editor.restoreRange');

        // build node
        var $node = self.createVideoNode(url);

        if ($node) {
          // insert video node
          context.invoke('editor.insertNode', $node);
        }
      }).fail(function () {
        context.invoke('editor.restoreRange');
      });
    };

    /**
     * show image dialog
     *
     * @param {jQuery} $dialog
     * @return {Promise}
     */
    this.showVideoDialog = function (text) {
      return $.Deferred(function (deferred) {
        var $videoUrl = self.$dialog.find('.note-video-url'),
            $videoBtn = self.$dialog.find('.note-video-btn');

        ui.onDialogShown(self.$dialog, function () {
          context.triggerEvent('dialog.shown');

          $videoUrl.val(text).on('input', function () {
            ui.toggleBtn($videoBtn, $videoUrl.val());
          }).trigger('focus');

          $videoBtn.click(function (event) {
            event.preventDefault();

            deferred.resolve($videoUrl.val());
          });

          self.bindEnterKey($videoUrl, $videoBtn);
        });

        ui.onDialogHidden(self.$dialog, function () {
          $videoUrl.off('input');
          $videoBtn.off('click');

          if (deferred.state() === 'pending') {
            deferred.reject();
          }
        });

        ui.showDialog(self.$dialog);
      });
    };
  };

  var HelpDialog = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var $editor = context.layoutInfo.editor;
    var options = context.options;
    var lang = options.langInfo;

    this.createShortCutList = function () {
      var keyMap = options.keyMap[agent.isMac ? 'mac' : 'pc'];
      return Object.keys(keyMap).map(function (key) {
        var command = keyMap[key];
        var $row = $('<div><div class="help-list-item"/></div>');
        $row.append($('<label><kbd>' + key + '</kdb></label>').css({
          'width': 180,
          'margin-right': 10
        })).append($('<span/>').html(context.memo('help.' + command) || command));
        return $row.html();
      }).join('');
    };

    this.initialize = function () {
      var $container = options.dialogsInBody ? $(document.body) : $editor;

      var body = [
        '<p class="text-center">',
        '<a href="http://summernote.org/" target="_blank">Summernote 0.8.8</a> Â· ',
        '<a href="https://github.com/summernote/summernote" target="_blank">Project</a> Â· ',
        '<a href="https://github.com/summernote/summernote/issues" target="_blank">Issues</a>',
        '</p>'
      ].join('');

      this.$dialog = ui.dialog({
        title: lang.options.help,
        fade: options.dialogsFade,
        body: this.createShortCutList(),
        footer: body,
        callback: function ($node) {
          $node.find('.modal-body,.note-modal-body').css({
            'max-height': 300,
            'overflow': 'scroll'
          });
        }
      }).render().appendTo($container);
    };

    this.destroy = function () {
      ui.hideDialog(this.$dialog);
      this.$dialog.remove();
    };

    /**
     * show help dialog
     *
     * @return {Promise}
     */
    this.showHelpDialog = function () {
      return $.Deferred(function (deferred) {
        ui.onDialogShown(self.$dialog, function () {
          context.triggerEvent('dialog.shown');
          deferred.resolve();
        });
        ui.showDialog(self.$dialog);
      }).promise();
    };

    this.show = function () {
      context.invoke('editor.saveRange');
      this.showHelpDialog().then(function () {
        context.invoke('editor.restoreRange');
      });
    };
  };

  var AirPopover = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var options = context.options;

    var AIR_MODE_POPOVER_X_OFFSET = 20;

    this.events = {
      'summernote.keyup summernote.mouseup summernote.scroll': function () {
        self.update();
      },
      'summernote.disable summernote.change summernote.dialog.shown': function () {
        self.hide();
      },
      'summernote.focusout': function (we, e) {
        // [workaround] Firefox doesn't support relatedTarget on focusout
        //  - Ignore hide action on focus out in FF.
        if (agent.isFF) {
          return;
        }

        if (!e.relatedTarget || !dom.ancestor(e.relatedTarget, func.eq(self.$popover[0]))) {
          self.hide();
        }
      }
    };

    this.shouldInitialize = function () {
      return options.airMode && !list.isEmpty(options.popover.air);
    };

    this.initialize = function () {
      this.$popover = ui.popover({
        className: 'note-air-popover'
      }).render().appendTo('body');
      var $content = this.$popover.find('.popover-content');

      context.invoke('buttons.build', $content, options.popover.air);
    };

    this.destroy = function () {
      this.$popover.remove();
    };

    this.update = function () {
      var styleInfo = context.invoke('editor.currentStyle');
      if (styleInfo.range && !styleInfo.range.isCollapsed()) {
        var rect = list.last(styleInfo.range.getClientRects());
        if (rect) {
          var bnd = func.rect2bnd(rect);
          this.$popover.css({
            display: 'block',
            left: Math.max(bnd.left + bnd.width / 2, 0) - AIR_MODE_POPOVER_X_OFFSET,
            top: bnd.top + bnd.height
          });
          context.invoke('buttons.updateCurrentStyle', this.$popover);
        }
      } else {
        this.hide();
      }
    };

    this.hide = function () {
      this.$popover.hide();
    };
  };

  var HintPopover = function (context) {
    var self = this;
    var ui = $.summernote.ui;

    var POPOVER_DIST = 5;
    var hint = context.options.hint || [];
    var direction = context.options.hintDirection || 'bottom';
    var hints = $.isArray(hint) ? hint : [hint];

    this.events = {
      'summernote.keyup': function (we, e) {
        if (!e.isDefaultPrevented()) {
          self.handleKeyup(e);
        }
      },
      'summernote.keydown': function (we, e) {
        self.handleKeydown(e);
      },
      'summernote.disable summernote.dialog.shown': function () {
        self.hide();
      }
    };

    this.shouldInitialize = function () {
      return hints.length > 0;
    };

    this.initialize = function () {
      this.lastWordRange = null;
      this.$popover = ui.popover({
        className: 'note-hint-popover',
        hideArrow: true,
        direction: ''
      }).render().appendTo('body');

      this.$popover.hide();

      this.$content = this.$popover.find('.popover-content,.note-popover-content');

      this.$content.on('click', '.note-hint-item', function () {
        self.$content.find('.active').removeClass('active');
        $(this).addClass('active');
        self.replace();
      });
    };

    this.destroy = function () {
      this.$popover.remove();
    };

    this.selectItem = function ($item) {
      this.$content.find('.active').removeClass('active');
      $item.addClass('active');

      this.$content[0].scrollTop = $item[0].offsetTop - (this.$content.innerHeight() / 2);
    };

    this.moveDown = function () {
      var $current = this.$content.find('.note-hint-item.active');
      var $next = $current.next();

      if ($next.length) {
        this.selectItem($next);
      } else {
        var $nextGroup = $current.parent().next();

        if (!$nextGroup.length) {
          $nextGroup = this.$content.find('.note-hint-group').first();
        }

        this.selectItem($nextGroup.find('.note-hint-item').first());
      }
    };

    this.moveUp = function () {
      var $current = this.$content.find('.note-hint-item.active');
      var $prev = $current.prev();

      if ($prev.length) {
        this.selectItem($prev);
      } else {
        var $prevGroup = $current.parent().prev();

        if (!$prevGroup.length) {
          $prevGroup = this.$content.find('.note-hint-group').last();
        }

        this.selectItem($prevGroup.find('.note-hint-item').last());
      }
    };

    this.replace = function () {
      var $item = this.$content.find('.note-hint-item.active');

      if ($item.length) {
        var node = this.nodeFromItem($item);
        // XXX: consider to move codes to editor for recording redo/undo.
        this.lastWordRange.insertNode(node);
        range.createFromNode(node).collapse().select();

        this.lastWordRange = null;
        this.hide();
        context.triggerEvent('change', context.layoutInfo.editable.html(), context.layoutInfo.editable);
        context.invoke('editor.focus');
      }

    };

    this.nodeFromItem = function ($item) {
      var hint = hints[$item.data('index')];
      var item = $item.data('item');
      var node = hint.content ? hint.content(item) : item;
      if (typeof node === 'string') {
        node = dom.createText(node);
      }
      return node;
    };

    this.createItemTemplates = function (hintIdx, items) {
      var hint = hints[hintIdx];
      return items.map(function (item, idx) {
        var $item = $('<div class="note-hint-item"/>');
        $item.append(hint.template ? hint.template(item) : item + '');
        $item.data({
          'index': hintIdx,
          'item': item
        });

        if (hintIdx === 0 && idx === 0) {
          $item.addClass('active');
        }
        return $item;
      });
    };

    this.handleKeydown = function (e) {
      if (!this.$popover.is(':visible')) {
        return;
      }

      if (e.keyCode === key.code.ENTER) {
        e.preventDefault();
        this.replace();
      } else if (e.keyCode === key.code.UP) {
        e.preventDefault();
        this.moveUp();
      } else if (e.keyCode === key.code.DOWN) {
        e.preventDefault();
        this.moveDown();
      }
    };

    this.searchKeyword = function (index, keyword, callback) {
      var hint = hints[index];
      if (hint && hint.match.test(keyword) && hint.search) {
        var matches = hint.match.exec(keyword);
        hint.search(matches[1], callback);
      } else {
        callback();
      }
    };

    this.createGroup = function (idx, keyword) {
      var $group = $('<div class="note-hint-group note-hint-group-' + idx + '"/>');
      this.searchKeyword(idx, keyword, function (items) {
        items = items || [];
        if (items.length) {
          $group.html(self.createItemTemplates(idx, items));
          self.show();
        }
      });

      return $group;
    };

    this.handleKeyup = function (e) {
      if (list.contains([key.code.ENTER, key.code.UP, key.code.DOWN], e.keyCode)) {
        if (e.keyCode === key.code.ENTER) {
          if (this.$popover.is(':visible')) {
            return;
          }
        }
      } else {
        var wordRange = context.invoke('editor.createRange').getWordRange();
        var keyword = wordRange.toString();
        if (hints.length && keyword) {
          this.$content.empty();

          var bnd = func.rect2bnd(list.last(wordRange.getClientRects()));
          if (bnd) {

            this.$popover.hide();

            this.lastWordRange = wordRange;

            hints.forEach(function (hint, idx) {
              if (hint.match.test(keyword)) {
                self.createGroup(idx, keyword).appendTo(self.$content);
              }
            });

            // set position for popover after group is created
            if (direction === 'top') {
              this.$popover.css({
                left: bnd.left,
                top: bnd.top - this.$popover.outerHeight() - POPOVER_DIST
              });
            } else {
              this.$popover.css({
                left: bnd.left,
                top: bnd.top + bnd.height + POPOVER_DIST
              });
            }

          }
        } else {
          this.hide();
        }
      }
    };

    this.show = function () {
      this.$popover.show();
    };

    this.hide = function () {
      this.$popover.hide();
    };
  };


  $.summernote = $.extend($.summernote, {
    version: '0.8.8',
    ui: ui\AÈ
r K²DˆÖ .˜B¨üø ôÔÎ!³„ TÀªf×o›(Óh -EĞ& Ia …ù¦ÕÁ&`1h“ DEäZ	fĞÌ "'ò“°f‘Ğ•Ã ½gFTaèj½ $< xøk' ÉaŒ
NõI`øŞMíŸŸP?ñßdmñØÖıåÿ™¿şüîÒ»ïgûÿôxoõWsß·ß$Ëı…îİ/ò×ëwO|¾ª¯ùÜõ4oÿı|uv·œı×Ùıî¸ûÊ_ÿã7Ÿ¯õî¯Öûerşöşî¿ùÿÆıÙo¿à-|ıĞ½à±ÚYûşm<ìëK¯ßÖsî?‡[ßÏó¿®GÅïš›ş~÷}~ÿkêŞÓ{={ûuîïº=ï×÷²ËôÏéw»ïû‡ÜT³ùxë©›ßÖï=ş#'67/ŸßîEêk[éÓkîŒÿúÿ«Õ	ÔÕ¿·´ş&?û[ÛçP½ûŸ§w|ßÏûüw]¿7ŸOÓSQèï›è½42å”2,/0˜Á2o`…hG…ˆnl…Á‡Áûá""šA)[¸–ÎHztªK!`3Aèˆî«ä‰*Í C ¢ĞÒñGæ´DIˆ<H
DqäƒO@J€$Œ Ë0!ÇFBÏBº8€(ïó÷ï¾©êÿÿş\¯Ÿ>‹¾Ÿßû~»·ı­Ï»Ø¿ş¥Ëæ‘ÛïÖşİûÿÿŞgZ÷Ëßßÿ¿¯ı÷_0ÆûŸ²ow÷mıß_gïÿû¼ıù?ŞömMë<ıŸ˜İ•í}Ü”ß—wÏçéû[Ü«ÿ˜¾ıçİÿo³{¿£ÿïoÜR‚!ˆh”,#b K+‚Q
•WÆ¤NèA–Y€?Ò0 £„Ã‚ÙôE” 8e"ˆ „ô,âÈMŠƒXÀ@tl¢‰«ñŒ ‹7r©	D3‚ f'fÌSÀ|F*eÎwáÀÊ²€…ƒu„ÁPë2H e z}S®I&‘J)@tT>-4
EHŒÒb:C·c(P6}*1D2Ä¡O€ 'p	&´1°¹s	b’•Dğt˜Dİ4­T1¼M ñôˆ &¤I6S¦n/ ‚)°$KšAÂáÈÀ*RÇá{&q·Â&" Ä7ìÿu_ÕO§¯Ş6Úg~xÑÎ_Ÿtk¯ö~.Yß÷:Ô¦úûÛÙ[9û»ëúİãûgQ8ÿŸïZ{—.ß·Œ%çe÷å¾ÿ>Ÿòì›ßÿ‹•¾Î-×Êßm?Ïç{İ_ãıµ¾·¿_)eö×GÙ·uiúÎŞ³íWç½öß÷xı_ï¡á—”	<!J>)Àí‰!&İ"ÙÀ£Ó*Ä"YÂ˜4³8‚f–à‚€Š’DzaÆ0Œ)
5
@
a	0«ƒ™Bd	¢qi  
 b°QêPŒL&€äjl•$&‘vD”0 S$	<€8õ'—ID¦‹»-Æ½¿_öó¤:\÷}ÿú®ïƒıñ.ış™É·×î¦«îú?‚Ùß¬Şı_sÿ×÷³šMú…~»óçïV®|zã%íÏ½ş¸0ÖgÖµê;K­ß©×Ú»¿ÿ·íçïï3½I¿Ãÿî=e½ßîÉÿÇxï»£«äwÓbóõïç³|ãçU¿÷rÕ{q½Æªş­nwŸ¿úÌo÷ç•³ş“.g‰ƒoë¯ÌQÿ'ï_|[·iâèÿóëš¼÷ûßyó!ú~*½¿›ıŞFö£ÿ·ûÁ±bßÓ½?ñÌÛØŸ»³ƒ-ö9÷º¹ıWõ¥–ÿ÷é¢Œ¾ÁúvxŸöêÆíõ©üüİÚöz~íJg8™`ËÒòšÆ}L)±P@ˆtxÁS©!=Àâ˜¾Df«ŒE‰áO£ ßD€°ò¦9"ˆ$9Ââ& i'H B¥ĞìJ ¢äi‘ 0EAàGĞ„,ÌëR
¨îà£@•$		"2 D
 B#+!$kı¤ÿo¿ç}eïó=YÿççoÜÛ¶zŸüÑ¼k~û½¾õ:›¿ë÷Şóú¹ûªúÿmV~ûvõÕÕùö×~ş¯ã3c?şëÿv¯¿µÑÙµj°ïïİÆŞ‰ş7ğ>ÓKó¾¾äÏ¿:Ü÷İoÛ×öwoşÿ,¹ş=¾m>ìı¿çô2.Ã))0ú_aF+ r	 eÀÃs"ÑT6Æ¦É‚
 Á‡…^<"B{RôQ@0­2{S6±[ÆB\BÎpÕÂ âØ` •`Ô¨”b$Â»LÔEv
’AÌPØP($„84•D,É/±sÄbg£)@T)Ù±@ ĞHÄD©aFübBØ Çj|6[ L ä!‰„D8K`D–áÏd6m)€BQA@¸_Á~À¢,4PˆÂPqF™T(†a,
@•ğˆ ÎØEq%&mÀDÆ¬K" Ğ&Ø	»_sŞñï_W¿ìÇşfÛÙ£{ŞÚ«‡ñ›ÿÚ\]ş½ŞÿïğßÏ?ûßïA}[»k£L{ÿñÛ¹=ó¾’Èÿïó½ıÛó6o÷gÿ_ïí;ßzû}|g»úşı?ûÜçÏú8oôûzUñîoëÿkênj¼w7sëíqÿ~ÿæHş'6|a¸èğÂøÎ×²mS(ôPŒa|Ô“€Ò#Ò¡B˜‰J)e‡Ô8Ã°Ò|ò  2hR‡eT1G?@‚tü!­dC‹)ä2@J«ññ]•"<$ƒèAñ8B–¶´¶J p…qà=ÄÙQh›(Ù7ÍéİÛo¹úí¾ş?÷¾¬ªv=ïšÂû¾ç½¿şñyÏ¿²¸û·ı×øÌö~¿û÷gO>zÿ«½ûû´şñş×~ÿk’ÊŒK¯}·Ø½}×ûcûı¿}ñŞşÿX^ëó¿şªtç<ø^ñøıİ¡³vù¿`ıç£[Ü~\ü÷ıïÕÿş»óçwÆ¼÷¯«{næÛŸ÷öû-©¿íû½~÷ooúÜÿÿEôoâì;…EÕgİ¯ò½çO¿ÿòjß½ûüóë·_7gŞúOë%TÇuÕËvÜùû¯ç_v•O¶»ıQuŸË~)8îÒÔ|”ô°~ÿ»Wÿ–]´î»İ—×»_ßã¼ÚÌ.şW>{Ó"T#k§]3Ä`I)Z‚ÀVÄH’eQ’¥Õì¤›B‚T‰Æ^"yCQ„©„İV£6†dpEpØŒƒ«”P‡”ˆ¼wEè`Ñ·ªI(1  ´8–@ mnÓlÆğÓƒ¾á€&€T“e-Y~m|¼Zäî§ïíyı}şósOû}sı_±îŒü{çîOußı¿ı­õæİu»íïşİşEŸ¾æıïôÒşëüìïx}†ÿ¿şÏ»>ıUŞûë÷ÖÇù}Ûåİ÷.=ûNóæ§®ømø~“ßº¿ª}ümıÏkN:ÕhÏñ§úzÿ÷[¡ßuÕD2[G`H L[8æ †°&a(@  7P‚e„.H$ †DĞ1"k1R
Ò#¡ nD(œóš `œ \.ñpü0„‘DwP0V Êc¢å(Ÿ(ài3–4(ËAÔµ®CHŸÊ¨‹ 6%x‡‚ôC)©¸N”@@² EbÏà|_tFº´Ê'%D¥AèA“" ` ”#TWİ½F÷œ$2E¨’SKÁ†a,D¤4«,ğ!ˆ…£5-D!¢Ä	€,à páF©ÍÀ HÒc aL×Şí~¡ºÅËÑç-êÏ!SõÎËïóÿ®¯İåüµÜ¿½oëÛ­­÷ùníÜU´şc—ç­ıÖì¼Õ*ÿÿÿw#—Ç«Øê×ü¸ï9¶^÷ó:¿ŸóİÖÛ=zÿqÉì>İôßby·wóïw¯şû?2óûå{~»|Ìÿ¬¾÷¾s×ÿ¾Ÿ|p‰ #-_+.,@cDf 
p‡dH > xP)DÍF&)¢Á„ @ÉÃ¹TzÄæ8 "	œ-	Ú,Cñ hEÓMlÀ@Z)Â Ä@}zªÄ>(MrTëÃTü‰B4ŸC LÄ— GŒQ!ô²RÀ«ÊöW×~ó-ü<İß·üWşßÜş¾‹¹=ÿÿù[4ÚğÜã÷ÿnSŞÇ¶¿õÏİëİÙº¿öÖ·ışÙ'·y9å]Um~´X_Ôçÿº†éÿYÙÙŞøçï_ß_¼gÀåïÿ†×ûß_ı–ë™íÿù«ßû}¶ÿüÍŸÏÖì=òŸ'¼¹ÙÓ‹ßw»oçš_Wõ÷ÒkÛïê}‘¶ş¯ë>ÓÖß¾½}¯aRßş™,¿[]~_Ú×ù»´ÙıîÛ¯Ñ©S_UO%ÎúßsÕ¿q">Øï¿ÿïßo~®æ5Tyô¯ïşö}{ Ş‹çn¶°½#JîFÏò÷êÎé¼Şg}÷öUÏ÷ì®kYÇœE4A
(Ÿ…r<¬P1
˜†l×R„"ÒÀ4œ  &…IAÁe4…çşT'‘¦Å•À0S´@pydâ9ÀG{Af Ã’&´"@Qg"‹¡IAúE6T…P°NHR\@	"‡ÑÀ“FJAË@HBeúfß¿œÕvî¿|¯İvzÿìŞñş{/TôßÕmU÷ıßÛµ÷úõÿ‡š~ß=¥­{+íV›ïi¯o£X5ı÷ÿÌí°m×Ÿ§ñßé×?¿ºNŸ÷$¿ìõ·¬ÿNõõÙ×¿şá7¼¾ÎvÏÆy;ó_Ü¿ûóo{ßsûqùß›á-¾²øLŠ-*Êûs4}©˜(ˆP	UäS3àAáHò—–#i’`À‰ŒÅYXà"Dû, Ô "cI ;8„ D¿€›°2¡2ªC‘+>I*NYõA+ËAla!>d™-)a7f Í"A‡Å½Ø„¿L°é@rkOˆ¤Å&ÒÅ
¨°–tbŒ©À (/Hj!àC0$4Pf”q4$	G$%ŠájÓ$V&ÄEêL@"ÎH!p
Ûš Fƒ õÆëÌ¡05¢n‰Úå_ˆ|Jú˜olà„B8‰ Àƒˆ=òsaö¡ç›?]î.ïß¿{0Æ÷Ë¿ÛÓÛ~˜7Â¼ÓßÎŞç•Óæ}úğYTÙ÷ÿu5êşÿÿÚÛó¶ş{®«Õçÿ‚Ÿéó_âÿùOkùçÿûıçşkOïöıöÓı÷çËºßß?¨óü{íU½ë·ş~÷ß¿ÿ¾ïº×Şî¿òó¹Ã¾ÕÀRbá®h$0¡H€,ˆğ¬Q  ¬x4  H .` r‚¸:Ñ-IW‘°¯pO &ò<‡°&`‚&¤$"$eRH ‚U(5Q¬Åd.'dÁ8ÀğÚœ€¸ ±ƒC¥	¨ÀI“<F ,ˆûoá÷÷äëm0]ñ®Wçü·î­ß¡æı¿ÕÏ÷üV¡›°ÓïßyÙÃ?õûŒ"óMÚeğß=îÎR{Î¡mß¾Û­‘­¸/+§•mnşêZc(û/ğWwÉ›)¿â.·¦ÏnY1ßvm}tóúø(<Wß;6Ö¸»òLM‡Î7ŞÏòı
ş¯™wÜ)ô¥.t““O¿5¿;ô½–x9ycg³ó÷W²m‹®½9ÉÙ¹»õÛåŸüÿêie@|çÿÉÇë´½-Ïü»ïÿ¶é¯N«—fwù•.oıÿ•õ°.?_Où^)^6{¯îİp³p_+5|Œ×Tôÿ:içÊİÙ·µô±ÈİıJÊ*¬ˆ€$ËĞ8€% € *flÃ@É†˜ A‘) „Xl
%IÁ(Ñ'„ÂBY µ@C ƒ€”!JYÉ4Ä€`HZ,S£( €a¼A¨ö†d`<òIêÂMB. 	‹€!•8ˆ $²‚{xÑ»—÷[ûşïÌmŸßÿAW?Ú9#}»òãşï¿oó—‚¯°ÌïºûÃÃÆ‡|ÛÅº×ÿ^º¡]şÛûÅñüùÏºWıÒ²Ü©ÏÎÖ÷«²¼ÀïRËÿÛ=ıĞĞCÑÒº¿ıöQÌ¦çİ¯Î~Õ´7¶ğœĞ;Åÿãã×ÿy¿ºÿ}/alD(Œ#ÂB`AHĞG(°!e –Ğ J05¤"1U&@-Ñ‚Z…wƒ¬ˆD K Äp- FƒÁŠT  Í’„‚8€Pò*ÆP  	ÈQX2Ä@l‰ğx €`jÖ P„h\ñTC1$ TA€€Ä: °£NH@˜8„Ç!ˆ¡H	P¡”4FF° €lB
!jI,PPÆ•PÃò£ ‚›2I„™È€	NÌ@ QDTÍX `D DØt€C Î4\€,:B-Eˆ.¶ıÌ£)s¿û¿ÚÀy‹V—°^ŞiºÆ_âA[¯÷ßı˜?ŞŸWÿö¹˜ğ;m~ª?_Áı”æ´–ï¹•ù\A{šÍ³ßí¿7›ïøı›í³Ù”«Ïû?5/n9"¶¤ÿÅÉ;—{¤rªQuO§?mj·²÷wíî8ÜŞg÷)ï¶©Õº‰@ƒ¶ş” @`ñ€L¨2’ . N# ™1Fƒ–  I*qkÂÀbH,ĞOiB\  ±ú¥„8+>AšOÀl‰ƒ4 X 0¢` "GÌ¨F  CBØ0@%(ÒÍ‚â±8\P Xˆ	¥  váB“¿î·–>ú^Œ…×«6Öa~âüœMwêÜõ˜ûur£¦_Ÿ°¼v«Î±¸Û}¦¦6É;Ÿ¹.¿}£ªOZÏsÔí¬ˆŞÆãï[]1«ıùñõ|¶ış_Ç¿OÿÛ·ƒ™eë®i­7àÙ»ßÙü3ÿ½÷ÒòË|Ó×Ø¹w¯ò{'{Ï‹õº=şí*÷í‘öÚã‡ıÏw§š^<Üá/;ÜÔßó‚Ó'×9IIö¿ûÏß•şÑí÷ŒzWïÿûM¯”oükòùå»Ûù{îÌu¿÷ãŸûß=øÛöØ?÷k³š÷ÿ(gq×‰Æ+ş¡Ùç?·Í´P­ÀåÊ„ } YğcbÁKBVP@=Js‚` P% MÀpÆ´`K °Àë…áŒƒ1ù’,¾p‚
¨@RÀàZ‡3.  S†„Ø`$" 1 Ç¯‘K P¸AŠ¸Øïóîùæïûo_]úÿXGïw_ÿƒk³ßïÒ&¼™	?õ¾µı7)~	·Ø?ù¿›×îä™}Ø¸×õ§«E\5$¯ßÚá?ïşqJşÔ¼ó[}zï±wç	ô_ÔßÜ¼ÕWşš?·/¸÷wûÈ—|oë¿™¯“³f@u£İÉóWog÷ï;8 `,Ê2…(jË5@‚ï8 Rg €¨ZD˜Vˆ!¥$–¶ Â8Íõ‘	!’C¤ô„@ Œ

 `°!	 x¤àEƒCPN¤LJ€BîAÂ¾	F@À #  …eb!Ò$  ”
aa$Ğ `¤°Š†dóA•ÁX(R,€"\„©ÊÄ¼É)Abî…@ãè^IjLea*pĞHK¨9 ä˜©&—È,€‡`Ôˆ8µ  PÄÀæ¤ÀxâB§¯nh( °¤ÀW€8³°¡(Ú!G
‚@ÀÀ0Éñ$BÕæ7Vø5++ïGw;İ_áóò[O$1ZÌ·¿tzÎÚ2’ÿiùK.û:5Hş6ı¢¸†×iéÌúWv;uò‰_ÌïİomùYÕû¾w{ïÜÙLü½¾ñIıÛ»¾øØúâŞÛüöò­U_ßêÊ~îk¥ú»¯«şş/rô Ë®™Å¶úEğˆ	@ù¸KˆŒ
)r‚‘*äQ W" ã 5n#ò‰ CFJJa£ˆ Í$ nÌ!4GZ‚3D"@8h&b  `€Nµ8C”
k‰e€ ¡ÂĞX` $‡B‰RÖA G° Pk	
u€cŞŞéîšQÔá¢õ9Ùí>]eÿv¹GüïYooÿ¾7ëÿßßŸä/yw_×lŒ÷ŸlÄos+½¯;H&Ğs|ow»}k¾/­ÿ­{3Bªâ°Ÿ_û÷Uÿ=ìŞ]½8Ç­NzõN|ûËÿYÙ¾çAÇW/Òö®õ6ª0{İ!GÿÛıo;·ı7OÊÌ/‡~Õ[/È«¼¤üÔïºùGêfQï÷®sâÿ÷¿>©åòjqôW½*ú;uÜ·}ÖµkÿşºO¢Ù zƒ¿½7şec×¨àßWöw,}Ï¥ñ6şØÊöĞä)ÎëwïBı?Ù"éÏ£}Ø­«ÿäºî‰éa‡Äƒ„0Ô"Ğ †€Ê)P¢‚H&ƒ@²dB` j¤;â  È 
’È@P!8ğ^s(I4ˆ&0t  ™à—DK`ÑY$´‘Ã¼,
TB«² 9DLH¸€‰Šf‘ Œ™€g~…Ò„ˆ2&”ˆrLQ–õN‡î¢<Æğsı(ë+ÇZ¢]gÚçû'Wî½mn÷çâ½İ6Ÿ—vûQ0×ÿg°4-óƒ¾r[¼s¸¹ëÌõŞ';ù7Ï¿û\{/)õÏÒy©~?°ı³bYU½÷ùïr¦¦×ßÁ5é¼ûıfz·ûı?ößw?>ùwß A E`²AH€1#İ@c%\ÚĞ …³é\¸3ÈŒAˆ B
B$8€V PA "5%³† åJ$
b,! JÎu°`g{¡À	ïP$|ƒ2¶$ Ğˆ¬ÀÁ€)–,$ÃF¢Ì a‹h@P €=ÆBÀ’Š¢P*0 €
€Äd ÑA5A	LĞ‰c"p2D† `°dÄ#L&€% ¬EK qˆ†IIT("i‘Bê *&‚b qZJ
V€Ñi°Æ DŠ€D<D` ¥È8Ä  ûüñRá»½ÿ÷ä½§³‚¯?‡¡ı'z]fÒ¾OŸœy¾È?ùş^åtIôİ5U_7ı»IÍí«´;×~PÍ=E•ÿÿF™¶½ÍöæÜ5ÓøÿîÏw4M#ë,±b¨ù†òWÿü_¹Ş_İm^¾3\·.ÚwşóÖÖ/W_Wv™úGûß0 P€ĞM¥N!Œ€	€Dƒ
lC€ÉK@l""@ €hM D˜ ˆHë†Œ‰P àx8R„Èc´"«ÀX–¤ªLQh E ¸í!P Ç8mÀ P 1ÄaL*0HEƒƒ2`88Ô$ò>¿¼o½‘òO§ïõŸ¯/¨Jÿÿv-pzößÿãÏ,ı¾İÖ¿'T§ò|qb‘÷Üoñû}éÜ'–¶Çç.«²5/ò¸eÏaŞÿ`Úmó—oìO]ğTüùzQb&‰Kè­ûsÚã3=xS=%ïd¤ÿß‡N;ó7íg³›‚ãÌ|iWÿ f«ƒ^Şzß‡gWZUù'wÚÕ«ë¯¬ó,šy®êázÿ¿Uå-ÜÁ\¿İ´­˜Û|cã
õÇİW³µT¸ÇÿÿŞi}äfé9Ÿÿâ÷½ü¯­ï÷û¯Z¾n÷õ5ø¾SŞ‚Ë[öÄ0wï½ı–Ÿöşñ÷ÜÄÌ{¿~9¼A¡ ‡
CX€DÔYQ,]tâ®G c `ã˜€”¬¢Qæ gÀ¢Èˆb  Â.##€´[¤˜‰˜Ià…H
TÃ¢ˆHÉ¡‰`À Îp‚€
…7"1BE€_ãD&$ÀB> %ÈÊ@ƒ½÷}Úµœ³qzûSæ¹†f˜¥•‡´çŸ>á»EqÏŒöï¯÷×îÍ[¹¿÷Î¥Oío®oëÿß‹¾lÿã¼²çob'ó7ùÿóiÓ#ûí/÷ûŸ“O7ÜîÖí_±ÿ«½ØË;»şÑ|'õ1nù»˜‡ãckô#÷pzÅïR\²–l!°&Ğ!;R¦Š0#R IŞ $¦&B‘©	!€¡Q(È!#´@*BnÅJh"$/BHPÂL±·VBLºŠeh *A bE1FIä¢O"`œØŒğR€ñ"ƒĞ(øˆ™$Áñ1aY‰JHt\D¡\ d‘@˜¾)„€„bjA«ù šÔlä" P ÇŒd‹HYˆŠœ"	M1$€Q‡  Å»Á‹ñL x¸„@ÏØ„€"0H‚IØ •şÂè
ÌX‡¡£XŠÒ