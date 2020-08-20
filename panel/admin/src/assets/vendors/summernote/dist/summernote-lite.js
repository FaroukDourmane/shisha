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
      Dropdown��o�޹���<ԟ=����Y�?�����{v�����]ϥv���H>��C��u=#6qK���>��b�1���4��z�`d�k\D�����7���ݛQ��&��$v���k��V�����{���;�J��W�w���T�]��^�?c����J5���Gsm��5ۦ��
�6yr�n?w���h��]=�����>�2�7���R��ݻ�o,�۶�?�m����:�ݟ_��+��[��������ی���7g�w����67��{���o�l2�ۖ�gb~����G��+\|������N�z��v���%sϽB�̺Կ������>��o�g�{����8��,���~���o�:D��?���Xw&�\ۿ�������u���w}�nR$��<�v�}L���orH�/�o����V����Բ^��-����?l����Z���'F$/lFW��}��G��?]��<��r�����{x��u؎�&�WR�ݖ>��������䗇|s���E�_wl/˭�U�V�õg$W*��?�]�������Q���{���{��l����������w��ܭ����Z~���v6��2����m����_Wҹ�������T�۫����\~~��e�Z�v���/N{~��m��/�w�������V�t��7�'�㎢���Ǻ��/'�����N�-�s�����M_	\��1����*��"�W����E_�Z�j����]�?���V�S>�r�����ߟ���ж4_=������Ms����%�{�ӿ��_������m:��i�Ux߫��g��c��>u���^��4�`��!�5'�?�TN/��߾{�]|�~
~�+�}���ٙ;�^L��w>��_�'�����=o������y�Ɓ`?�)����������ٓ��������\�]�/�?��}_�ٷ�w�ty���-����m>�ϴ�����G6�����5�?zy����r����c�V��N����S?矾�����Z�ξ����_����V����Oo������������_��s�~�}�δ'�����n�w�k|�(�v;��ڠuE��n#ߘW^��zG�y�o��վ���<�����n�8/�G���Όc���Z�k+�h�;�u5�f�zV�y�zYgE��������U���������C}}����?<�^��w�޵������T�3������=�_�_����=v��Ý�f6�Л��wv�?����~���^������O��z�~����~}8���p/�����R��������|v�/�K��b�����o�oS�3��uo������?���o����}�>k-����M7G�����z���Ա���͍ڊ?���������~���K�w�����_������ȝ�b{��������}c0���Ko��������5�~�1>�}��ۈ�{_�U�q�w�9q��7�N脸�h����܎��>��ޮm�qr�t��Y'��6����ȆT�������%Ym����5{q?_�m��^-���ި�����ލ������ݚާm>�u]B~���^����|�����������B������^����ʶ��ږ�~��<���O��#�A���Ƌ�����Fn}����O6��K����5���E�z�����wgvuvV����qx�^��k���7>o����������{�3����W/�K���y��=�����16�J�{�Oz�6�_^�����M��*Ѯ��_Gۧ����x�'�l����MB�<??�IO�Ĝ������^��==IY}��[�g�]}��e�'���eSOw��=/�ae���ۿ��Q�����}�����K��7�|5���ϻ��9��j��G8�u˼=�G}�ۓ���~6�涭��z{)�׻kV�};��ZG�����}���r�~oW���[?�L��_Z{��־]=v�O�f���x���C���������g1~����3�G�����������viaN���������h;��w����۷�������߷�Փ�x���;Ҍ�~{I�_�4����q���������k7?��K�e�|��'\�'��\��3~�M=y���}}��^{�I��7{z���e�u��H���O�W���aKa-i��:^e�����ޣt�=��F����v�;����Y�5��OZnM��:�W�/��r�Ow�����-�7^w���?���1�M������6�����[���W_W���������{ӽ����������˽���߭ڛ��O��;o�r��z7��;������6���}�7h=�{��ƾ��{d�v���m�xp۟�U�;%o}�ǿq���\�nU�W�s�]w�}����|��Wx��i���<�����uVw�=���u�q���;u��ߞi���f?�ʨw��:�W��|��j��z?���G�T������o�����~����яU��e�g�'o��y��]��w��Ysy�ۮ���7��o��~��������������{�(��0`��Q��+�p�o�ֿ��eƿ�w|P6?7��qiD��θ�W������Tx	e�x֟lƛ����yoy��o��r�N������{���l��������ߺ}��oW���gl�����巈�b�����Q�����n���o��g?���ѿ�{����G麟�����������}���;{����_���K�[ >���Q�Z_�����k�=�6������60տ�?C��?��m��B����1;�rO;/�t��٤?�ϥۿ���y����k�'������~����o����M��ܸ����z�~ʉ�e�Y��y�w����#^�Vgq�z����_a]˞��z[�����5��y��G$�NjW��+?$2�0��/�3S�ٝ}�����o����Ҿ~�p����Vw������ڶ�i���C�`���]9�+֖Y]���}��?��U|*~���{嶏���u��*�u��x�.�����z���V�7���v��;���O����m�Mث�������l�?�u��&�?�-������u_,�֔��oű�ߝ�g���Ϸ
����!���t�����O��'9����Ns���r;����{�?<���ޖ~^���h��3�[������������{�{��6�̴������yG��S�
��VyͿ��[}W�z���V��|��A�����O�7|}���Wk�����w!��p�����~f����R��ٿ�|}{;�5���"�M�1/��O������Ёw��#w�_>�s�����G�t���G��_��i����J�����B�Fs�9�l1��!��ɾ�����=�?���������G��(����[�����������s��<�q�����^��������ҥ���v�~dw�߾���Vo�ƿ��^��z���������z�s�?w����տ�o���񽆹>�ݜ���ݟ{~�O��z~��u]����/�s�����ަ���ه���"��]�ݫ/ڟ/����%�Z{����v�:U��}N�r��}�ˇ����g�����m��'�=�+�����o����z�L��G���]�{�������_/�Ml��{������Q�?�g�o����s�?���Χ?�{�~��������._������~�����?��ݷO�g��p��������~��owZ+�;���3��g���/�u��:�Z۞ޯ�����ɛ��������k�z��}	vD@Ț��j�|����w�	_<�.����~��֚�/#�}:��g�F��o�7��ϋ��,��m�/?�����c������qw���}�S�����o�z��?�����~7�[�W������G������~o�?��Z�ϖ��ߘVg����q�{�������������T�ȁ�r���?uj�w�`�J8q���.�U$�>�;���?)������t���1�4���0���m9���!x��;����Q��G�'����}Uz�/��U�U�����=����|������o_��;�����Xk�����}�>�����{���s��=�Ûs��7�k���d/�_��������[�5�E��?�z��w��*�9�s�����tcher.left,
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
     * get popover con=��N������T�}[�?�N�_r���2˶�Ҿ�����K��~�����gE�[c_�d�����7�o���7�K��5��LG
����w�z]�����c��|r{W�7�^�����;�������O�ro3����<�e���r��u,���k�w�g����2�Οo�yoJ����u&����������z����Oc�������ec���/�����sv�l������wZ��c}
����	�zv���������������?�z�=����ףo_�K����o��ݼ�=�o�����}�/�z�қ��ug����}�ܻwx������#{Ӽ�/Ͽ��hy�m^�����]������^���������ڶݸnˊ���h���n'���/�����'�����w1=�;_U�=���g�����Q�~���SKOo�<�=��{f/��j�o|{�왯��wg���u����ׂ�7~��	/�h�g\��'��>�{n���<��E���ln��չZ��r��G�)�w&�u�_����_�S�oj����qr�����g7�~c�s��}���������������/������Y;��[��ǣ�s�������syz�n�����_�=���_7:�?f��v���˷�{j�/����_յ����z��������'���#�����<�����1�5��ǧ�g��N�޾~����	c���������{�+�/wz������۴N��.��;�r�F��Z�|���?�����oE�nz71�r�����������Yv�Y>�+�T]}�G�w����ʟ�/)E�O������J}MGk������O�ۤ_�Κ���m���ڬ��������{������]k�������6��*�m�ٹ�v~�������_���_�fᇿm���W]��2&����������\�w��|�����_�ܯ�׾�n�[�
��������ow�׸�^���X�y����7W�{��L��Է��)?K���>������_���g�_w��?����KϚ�}']�����f��V�m�ױOݿ�}2�Ȗgl�N}��Y���:������[9��ݟgթ���]~��ҵ����~��d�����_�q��u�����=ʡ��+�����6�u??{�{�Jc?n���]���7���?�~{k�w����X���ws��*����������ϧ�M����l�S���_�Q���!�r�ޯ�7s�߯{����G'ũ���9���y���~}%���}�]|i�����˼?�>M���E�����ö��ox����_����߶_M��g�V�=��<���S���[�?�r��-=?��u�m��{�۱۽ۿ�ߧ���׏X��z��.���*7�{����e��/�Ws��������������x����\��:��J���8�g������b?���i��9ۯ��K����<���+�7��rR�o]���[o'���f�������v�z���/������
;�]O��u=��>�_�[+��7g��w��?�C�{���;�������k2�.u��3}�f+���S�sDo��ס��zs�������s�o������4�G��������/��~;�/�}�������֐�������N����[�W���ص�߫��onux��_�w������]�-�~�T��_Ov��){v��{o]?��j{d_e�R�I����s�������k����w�������Y�����zϺվ����*Q��+m��*��W�r�������pgwJg�޽w����x��ի��=���斿n{�('�*��AlƷ�W-՟�������.��G�m؏�����K�ʻ-�J�흿��?,���ek��~����O[��w��d�h-�O6��v���;�e�"fU������o��=�����r����T�|Gz���׻ѿ�S|O��=���[�{�,|}��տ�1{������n|g����KZu��������=_����w������ީ���пa��s�6�W�>�}yV�~�}o�q��{;�[�w���V�?����?��Jh��ߵ}�3���-;X;�:���>�?�}K��k_�b��_������֍������{Z�>�~�*�����m�S+g�:p�������6�����{y����Z��I�]G:s�O���_W�n�4B彷��VG�ٛ�.��w�n���NZ�W���������y��n}]��������_����U'��7���E�z�����y��k���k�������[�v���m��y��F-��KU*Z����n;�����]�{����@��'no��OI�����wo:ݫ������/;������X�{���������ݱ��w���>�ϻ��e�;�������h��|�?�|qm������^��߲kڜ���ߟn�'����/�;����4zӨ���mQ�pI��Oe�����c�}���ub�cϵ]La��_��~"��jۧjy����g���~�ߣ5?���}�c)?מ�n�}�]_������Gy��/�~<�m��״���w������l�`w󫳏���y\߰���������������ڮд������~~���9����3���~s\���?���s����g��yO������~��g�����??��}?����u�������\����o��������ͬ�����>}��g?����>�=+��鷿�'�x&��Y��oK,�;������W�޳��vz�������;��{��{���5��s�c<L�]ou1��r�u�_OOw��c�����}��?۾I}co�����}E�|�3����{_��3��������ܿ_�����=�v�?_�������wn���Noٻ���/�̾����ݶ���v���ZOg?[����#���/���fl`�N����=�����.�'w/��\{�����?ѧ�f���st[\Cž�sΝ���{{����;����>��?��l��j�˗v>�ϼ������<�����~�����������Q�}��������/�����n?���{�w�o��3�o�={�����[[��?���/V����o�}������?�u��o�8��綿���d���W���������<��܏����u|[��/���>���[����,_w���g�~sN>�����Ǟ̿���}k�#�DWf�X���]����A+��z���~�����=����=��g�^��j�����]��=;��{s�w���~�����|�������]�����3��kt���g������:����*����_�~��X�蛿_��z'�]����[�������Y���vW�Y������y�o�m�sl������>��&���ƺ/����������c���S�ޓ7���y���G[گ�w�x����z������:��l�ï��s��_.�������׍����s��`������X����Z�n��V��k���i/�iJ�?��[�������/�~����gsN��o�؏M����{�{7��y�}�o>�~���e���^}�ͻ��~�߿Y�X���~K���M�o?�}�O߯}�[~��:e��޻�¿���x����{����+����?ۯ�{����~��>V٥����3~-�����s~i����5������_6"o������o��9���sÿ�/����빴��~�|��ϔ���~��S���ϵ����s��x%������<?��{�����y�o?�������vh�8�y�x2��W=�\���:kX{}�����r�յ���>�m�Oh�ix����K�|�_�ɺ�^�����������{����������}���_���?eT��n�I�6׿W{Ǿ�x���框��N�翍g���������;��z�{#L������7��W����u�R��}}�_vo��?�q���.��o����Ϯ+u�~�����>��7u�_O�����G��������~*^�����~яu�w���O��������׳m�i4�����Y������5����9�����;��:w��������us�߫�ߴ�}��������ni�[����k/�;�o�ี~���hR8M@��D		 ���	 I�((CN� � P(T�BJ4D:BX �Ђ��CX�
���H��0
�!H�(��!`h@�9!e�9@�C ��Bf����� ����;�}�ު�B}[��/����<���Q�玀�x�����i�}�O=3������ic�b�'�j�?�o�y�&����;��n[(6��j��-/}s�t��+9g�K��&_u���E�����׿8���,u������W������F�X�?�b=���f.6Y��K�؟�L����S�]fz��[7���ݭ*���]����{��P����}���ϯ�t�^�/{]uI���3�[��������뿋����gl��� h�
`T3<�T��	�I(�H# �,���dI �@�(��B �	�a��0� 5Za0@�4 �c� 0Xa(
4 �H.�� 4
���  c��  �H	�$���&�$�D��u��'�s���/޵���N۝��j���������+��9��}g��^r�=�AW}ބ�k���t]��w��?���������_�P���F������2�8ݫ�s]����Dw�Ƿ�����Nv�Q���#������;�:� "�(Hh��riAO�3�J �@k9	!���� de��8�$�yT�@*_-U��!���	�S`�� A�"�h" ���������`j��D�ѿ��^ ��2 � �`��`�P��)���	a�8�J�  �N�� ��"`h" 	 � UA�L :�"R�B &"�-E[��@�!� �8�T�d�8' A:�@�F@��� �j 4�FE4���C�Xp\���o/���33׷^���G����~����+�;~��g������yL�?��������?����6�%+��"U�e���.�:���'I&��Ls����agO�=��^"�s[�3,����+�ʼ��� r�E�ߋ��A�W# 8 �����0�*�� `E��r@&�`�Q O@P(���$�(��� Ԏ�c ��8�DF (( D�&`+A�<��R��Pf7����Q �兗�"!B���y���'���#'D��:V���<�-�-y/��u+�X�7Y��4��ý�c��{�՝���v���h���o�/��W��E^,���]q����Oλ�{�}��5c+f����N��{]�����O���������n����ݮ0��*ޭLv�S{�~�ͱ����\M��?v��Q{7T�z��������
�;����;מr��X��_<���I���]���]G���V���˓���W�y��N��҆�\;��I��֪��@�*!�"T���u�@@  ��1.<�"��N���b�)uI��#$�`���B	!J�T���b%�	g��	eIX �,` ��S��"�DY��`"�JL@  `���� �P"�����~k�3�ޞ���y��C^0�]��Os]��޷�z�"c�ޙ������sY[�+�+l����yd�ϝZ�<g�j����ཻ�vP�W�'�%�{����3{�O�,oL��7���q�Xu'�7[̤��Q�JE� �@� h��@:	�ar4�*�B��%����Xl&(�� b
H ��^z.@f"<��� �TBbQ	�DD ��D"��D� u�P4�IF iʞ ��A)&H�L	i�'lE�����0  aPH���)1� 4�$�X4dJ(� 
	\%��� �ҡ8�E! %���02@_�rH	��e�G�\��   L���E�N�S�%*u� @����I��k{��,�v�}�hgւ?�u7���������}DLXw���e�~s����;�T�������e�g��sd?�ћ�����Ŀ?9�ںL$}�?H�߽�2>_7߿��7����s�׻���-��n$�F� ��&!EQ`� 3�H�!)����.B��P�f�^�6 ��'�*�7a�P�R�ֽ!b��� �Ջ �!�)�t"Q�2%P �@�H�JJ
�Ȣx'H��D ƫ�vq1�_r��?�]^;Q��?;S�����ͻ��/�ǖ����x�>���w}��[��n.�n���ى��J)��խ�f'�ۚ�I��ݎ����q�K��sן�vܯ���G�/�-����D���%Ԫ�~���M��p�Н�����r���mO:xM��Vͩ�F��~�~*?����n��ǖ��=��c
���<�y%����Y�_���sI��+�]���dkj��kf�)��_�[T#�n�l�?4@�8�(@-g�� �=6� oDh�� �1 H*QC$��  V`� E��!p@0��\ ���b|V�G �((�0`��TuB�� �	~ !  $��9q ^�� �A	G�J �������_��f��g�~�Ƿ!z����}�=<@gث�J����s0����������_ś�����s��?�G�ʟ�,��%ǿ�j�_���3�����n����i}���=��ϼ���{���ǁ@bp�ND��� ��MG�P��� ���P� B!�K5d �r @:(N`&cDA �)���D"�2�-R�yP#�)љ	a($l�xY
B�r�:MH������%Hnp"��� ��<���j�ʉ��P�F
4
��E�<�@DHY�  !@E�Cѓ��u�A��\ ��ެ)D� Y# � !.R"	@%� b�B<F��NÜ��� 3Z� "!�!$�e���I�֫���}o?�[O�����;��u�O�w��{������І./?���nq��w��vϴY�}ԗ~��]vJ�w{Ow�E�L�or��T�����x��mLC�32����M��OY��*�q����0.�	��d� up��jJ1�0FE�`z1 E΀��(��"T��Jx�i��A d(����P	�hHH� 2. ���h*`�J4�� (#����D%�E���3����5�L&N@�!`��Ec��mZ��۝�74����S`^��"߫�=�ϵ�������������w���n����������Us�j�����9���u����0~y��#��=:�2������o��{I>��s��R�5�]۝�@�t�Mt{+�X��K/\D��.o�ɞ��*�[��'~�V��������:��yw{۫���!��������]��TY:�Uo݃��֭�G��Eo�_���?ýg��iyηy�������~з��y;��
�������W ��L (��A@8���tH� p��B+@!d0�1j2�K9���Ѳ8R� T�
�"Ąt0� B"�P $���@� PA؂���w\��iѩ�?A>�m�������N��U���V��_h+_{��y��?�S3��|~E~�Y��3�kn�{�����ԧ�7��]�¶��j/|5��YE�%�4+h�����%\r�#S���9������ǈPDQ ��k�qJ�
�Ӓ@(D`�g " � P�!e�!�IPM ��?pp�.�^� �""O !�P� � `D` B'!-���B0�DN���1Rx8Dq@�(a!�,��D���Xnx"��8�D���`  ΠK�-%�P��hL,��^��������Ʃ4��PI�# �`Q O� D���$1(��A�톄<< 
	2��Q��9����}����[��ϑ�<�{��מ��H�uC�nD?��i��X������˺x�\{=}�M�K&S�5$?oO���?`s��_����G�Y�v�G����9�Ԥ���4U�����z��#�C��_ۻ�5սW_�on (textRange, isStart) {
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
              lenA!�C�
IE�L$@$4ڧ D��.L�%����hN{
����E	Q,L�B��n�`QC @�Аc��H.�Q(��`��C)�8'�*@��Ձ�Q5�`�@��� 9U� �B�� G$s ��â�ȑ��`�b�,`���0P�Id��pHFA�IB @E�d���Q�r�$�Л�2[+
�	���*d���������3<�E�8��D���[�`�"�Q2�!�a�C�H��,
"�2���C�H`)X�AD ���HU�`�����!Ea ^�F��V�	� �^�J��A'�J�H$x�"BX�b@d��� h�$!XPA �C$,���  �Xh�ى �c
0��Y��܉�G�"@,�G!��d`mѐ�`�3�(�p
T���F!Eh+�uP	  $@1��	t��$��B���\���?��K v�V��$PHUeAj��*��A	��e���AMG���	�ݷ���`4B K��b�!!h�P ��h�p�1@��!1�f
ح �X���ֳ����(��"$��
�d�ga�g�F� �h��Q���4pYcN � @nP
�H�hh�B*!f�	�G ̈!�	Q�#�b� �c:xZ �f�d� ȕ�xD�y�䛰���#Bī�� �~0rz+Z0�3|sD�=X�hQ�0����d8�|�d�IR�!�P0]�X��B��ƅ��RVN-���A ddA�Ӥ�eݓm�Z��E� RRlk�p�� !D)�<A�(�Sd���(�1e �	�rnPL(&���� vn��ˍ>b���	��	iu!l���2B���Qb��m1DN��@B{�`�5�T���a !��d@
� HNH �T�P
b�_�6�@B��± �h`�ŀD E΁��TD��'!� ��	 0	&Cc�8��`�إ$h��d���Z"�H*�1 B�X�,<B0\bc 
���"8o.7�BVp� E��(H8��A�0R���E|��>��2�Ԡ
�īA����Pi��u�vC�
���V`��&�����SQP�D�0���O�l舂��b
@&�da �@�� ��FFĐd�� �$�0� -@%|���I�6�#�� P��0R`��p	A$�pL  H��t��F�HDg'1 @D�DP��(� �����` @�#�,i	�L��"��L����5A�"g!�( � �TFDDLe���� = <�������!�0X� /d ( *R��H�8@��i� ���5 ͉	h��4JP�H� @x�|\��d@4�0��;"Mcj~�eg�F�#�N�f��Q#4� "K��C�0T�*�)���x#�� D�~hRd�P�%��*�b�0d 0�� RP#rb$p% ���V����,2	&F �&�$ �H)(�l<� ���b!u�(Pd�)���\",!��%
( (�
�q�h��F���E�}(��P�h �,HMBPe`w�8�hR�"
NA(��C� Zp�h<�\)��$!z O�h�����!��b�a4Q
Tl`a��(�@@- ���UU�K%؈���.@���vr#M �l^�%o�hT2f�EAh��� ��h*p��0E(^g��J9hJ�
ŏ�j�r�i�#��$a��
� �������( DhKW%0�	���T4&�e7P
�	�7z� y����jtl�H �P1��(V�![O���Ӕ�H�c�q`q&�P�A� �<I$Đ0�R2�  J'��P0A8I��� %�@��
!$@�5�@�B�d� -�. �$�!��b��cTb�!1�l���G#ଈA�b�*�0����� ,�`E��@���lXtB���;k� ��Qd d�0P�V3[p(����~'#��`" C��V>�������/T!H�jA�#G���
�A�@QK����U؜b
AxO$	���-Gd]R"gC0_ �@�ЁdYu!��, @�J�W j��HLIfLD�@ ���0�  �k "T ���H�U �� h
 1b	 $��d��P#�V%A��"���xAB�*T VmD������hAD��9	���S��#Pb ]$ ��)� !��)�$� ` �H�0 �g�"�2��؊&0���(�b�O!�I��/B�@d�$@@��	 4@�X��*"�N �wA  @��Fր(� <��3�+K*yD ��t$`2N �#J�b�1SaC�MF�� �/��GW��^���T� R[��T� �� 2� ���TF�	^)�u�C��d�Q�DM�Y��=��D">�H�R!=�0ЅFF�Q�z�,�(�<��2�&Wx!`�+�B�"g|q5�   B")"���! �#P��yd-� �Q)�"!$�"ʆR��@p� TI B��"�k�2T�f)4j��\6" ����$��:9 20����`�#2�"�BE��A"d5�$�*����a*0WӦ��@�#�3p3#�)p	�z@C�yo�ߣ�� De(�%�dJ
�����c)*����,�0�fd��v�
�еS�$��fd�q�FZ\� ��"���p (aS���wX;oe�I9�C3@�2*�-�#C�@%;6 �A��'شwFH�%R�	�bRRW��`[Ȉ
T� `��Ri�d��Q(d�ؼ;�_ ���'�R8xv`�4$�`�A����܈�b��LP�X	��B*���A��AH
%T�H`��e����5�A���*�c`� �!�g�� M��H`��#4Bd)y���#h	 TfB#� 0�V�wa +ɥ,�8`hL482  @HJ��%0A ��+
�I��V��P HU[t�	��T  	P�@�,�M$�f���`D43Zqj��@��͵�}�#���B��*Hxg* >�fR> �0u �H��g�' �1�|�+D4.�� 	�g	C� �8+�8��h��L�@ �"RԠ�#��\��  �����(�@�E�@($���
2�RL�
�
   aV`;��f� ��E Æ������ G8!�
BA��IA}G�i)�f� 0��l�2�p��Ȉ���D�`�`(�r�*� >a8Ǎ6��4  �T�0HogSCbG�(��AB �"��R<CBƆD��U�tK�����&�0�"/���+�,:�����T_r��3��!O�9r���Ç��	'��!$F��B�!���2@�k�d�xRRV2U ��kB���L@V���8M�  ������J@ 
^"���H�X"�4t�O� �O
��	DI j@NP��� +J�\7u�(���0���5ch\8p͢��?��C/H%�8�Q�� ��� �	�	�2#RDT�<�����^4� `%e�!$�eC	v��J�+�F�D�����T��$���"��!p�-� `$ 0 s($hW��h�0�偆I�B��0w �S[�ф$r@�p���ȡ�/�j� �B���D%eC�.�-!��@ք�t���4$'�� �k�1@EP�8J	�!��-��r��E@�A��P�%A���"� d
�HZNif�(�#����XެQn�w	 1U �.��`i4�C�D
0U3�X!D��� 
�!<���9*CH@ ��R��RM�kH I�E� �A@�@) E+d
���P��\93eWE� 2- �
�TbV<#R�i|m�����OJ��?���ո��M��]y���I�s���G��ю���_n�����޺��ӹ�z�_����oV�����i����y��s�Z�n�pڱ���[WGA3���O�w���|�����[���a����!�K�%� 
/ gJ�A� G��p��Ӄ�>���(5��W�
��jF�'d;I �00 A��%@ � �b�@f!DG�@�!�����h]����1���+0�y�KqЁ�1������*I#�b�$�"9)P�u���A 	x�Y@7�L4�U��C�C �@��I8	/b�Y���� ������-��K>��Yh���A�!�
�"�mj�F  lQ����������g����_V����ݣwU���C����c5�o���w���wE�u?�=v���3nsvH���^���yLݷw�S�N�N���w_��B�k�y���~��������+���ޥ?�y~�﫱���`f;N�"K�%@n�Tb�`
f
˸3T8�A�@(6h%��`�<`�D
(p�� ��#�BE�瀁-��:&3ʃ@�, L��Lpv�MH`�$��6ͥ�/�	OЅ�(I�"��}��O��{�{�o�����_k���r���<�[��뾦��w����u���W�۪��ݿ�<�����������?g��]��N������M���tt��j��x�\��o�t޵�������o�[�w�5ɶ��������~֩7��^7�u�~���9<���?��[5���״7/�����os��G_��t�w�>��q��/q]�/Wt��g�?����=Vd~��%�Wy�*)q�gIR��:�瑃�{V���e��3}/�g�s��:��NT������X"Ԣᩬ���� JQ �� 	h��eBqA�� � !���ا�A%�FP
dx� rb$���9�(Ȓ�AA~a���ȑ�[U�Д,B9��� �H
v8��<�����vﲻ�;��}F���������]��>��H����ֺ����3�_��'�ߨ��۷k���8�^������ꏋ\����[{��������͕��|��~Εl�&���]\�*'�8���N��a����wd(��,��&��`�B�������0āH��8a��L O@h�Q pe�,I�D&�A(��a�q����"���~昨2L���6�E�lBAB�K
`�9��&p�SH���^` �QP��'��V�H �e)���� �(��C�k��$~���Y���p6�[�T0C�S���R�FF�
��F"A���
!���b�$RiAPB e@`P��*K��@�c}$&.z0@�0�,O����g����_Ϯ'��ҷ��^Y�k���h����G�7ݔ���o���N��\)������M���������ok�~3�wЮc}��}1��{��WH�o�g�O}z3����y���=��2���c���|�6t4Ej;�ˡI��`��J@�Q�Pq~*��PhD1�l��  ��� �$� 	D��RI )���D�ȃm,
c���2�Wa��H%�a�NCU�V"�uz���y�a;�$lT�g�����W�����������*=��w���o��w��o���g�o��m�O��~�?�CQ�������v~���K�ݧ7�ol���(o����R��9����	����K���w�o�	�����#�O��w�����5w����j�߻�3����������q��׋��{��~���w���|�������ծ��y������{��O�N{�6���q.�֪���N}�ǡ���׿���m�r����j<���^;���o֞�h��I��Z�a&�)���4�P�`�pr`	�@q�� ��Ke"�<�s< j  n3����� B 0$�lH=��\ G d��/f����O�0�=!2�.�7G�"����e�?޷8;,��ޮ���k�C����={�m������{LT��1�W�+��_���b1�����W��Nw3?Y�w����Fh���=��w۬[�����n}��_��I����/��Հ���}���A�=i'bPH1�L�kB�U8P�@���t�� ���8Δ}c��l�����ONL���I�M8��3����WT��̀@3I@�-Y`g�D�;r��Ni"~cHS����B $�RPƈdE�� F"1:�(E � pB� �,��%��0��蠆�%T,
��raCe�DT 	p�È��.�I�%a��i�@�(#Ȁ��7t @�Dc��|D�`�����H� $�4r#q��]T�[�����}|o�����}���L�����G��gg���7|��oTe��7�f��};}�^����~�����t�C�����~\�֬�+=�O��c���+r���YY����־�jnz_���[��m��_����n �[P�LsL� +�G��p ��lD ���4,BHb�#��*�1@F�F�Pp"��4�pQm
e��HX�. �p'r5��1t����J�`�\��Ȥ��
��r6�%4�⬩Z~������_s}o�r�V�}�h�}{�\Ot��`��r���r�����m4�֓��X�'�:��$�޾�q�kSs����+�������E�/�۟f'�۷��?�������W�������>y���̠���󺾾���_�~�;}��G��קo�'z.�_����k����f�w����o߹9��ws�^�]]���n���zḡ?��]���������9�4������k���w_A��^�����+�������H��@�9a �@��+!  1� ##H�됃W�D"D]����I�M`2�O4"�`B� ���x(@D
���Hf����`��A^�Z��Ip h� ̇*"w����k�{~k��]˵���-��e�9K�n7	��������Q��7����e��m�u�������~���ֽ��}�d�q��gj�^���������ï'��퇙�S�ew���r��]�����]��p[>��z��<����d�5��A
��0Ĥ
�P}Br)���;���Ъ +pf��I��"�­K ÐHGJ�>��_% "���d�Nd �� �+�Pp!f.�d�p0�Y�a:�
��e�F O���1�@��
!�%�Q���@�0��@2!a� B���3��A:י �A@e�� 8�+"(IY�L��U��j Vp��;�'<;C����@D����<�+B�V5�53, ���A��}��������_�����Z����<��s��k���������n|������_���^�����߾��]��o�z��������x�����̓�ݘ�3���g~߿��}&i���~�I���^���L�����zѩ��
0����������@FF" ��,`jJ%WE���Q�^$FS�@ �*����pA�S���)�H�u7aQw���ߐPd�"��F��d�`�@�
"$K�Zm�
 �$��yg��������O]����[�ߟ~������$j�0�zs��c��j�{����o`����p���*�����ޔ����Y���kQ���~����:���9�l��������/�aս}uz�}cx���|w�������tu�������a���8Z��[p�G�[���^�yu��S��̌�O�����߯��?�j�TD���������%��}羳������^���][���)����ؾߧ���Gg%�}�7���7;��׳�[�YQe ���`u��P29Ä�#��Va@���6pL� � QE��PZ�tQ8 ��Y�+�� U@]��
@	���ȏ�d�e$FLX�E�` �Tf�EFD�&��5��Bm��@b <)�@vN�rn this;
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
     * @param {Object} [options]_��V��Ol��O,}�/����=�-�bϵ��U�-���&oO��������>�������e�����?���'gc�[=�����T����b����ь�W㳑����ϖ}j�Z�q(�.�6�Sp�d�	1
	�* �d,)Y5�"E*P PED�@H`pC2(2E)F!ڠ�A�  X�� g(�$��U;���!�8�W�4�L�4�V��2�8B�lT���^Bm��
�5]@��!/�#IAP�� T�ŀ*:HL���� U�d  B�@��ꁉaFn��T�&�p4(FS� ��g#��DH� 
�X��#�B0�҂�J�@� � �`� �����u��G��P��ü���Og���JB+�WϹ�k��_�NwE�~��I7�vP�������7},�g�2=o?��g���Ö�:���]�׎��>��Q�o���v�?����z���pC��f�g��7�����]�J��!�(h�\I�!h ��2� ����A&@d�B  � @�80�cD�XV ÊkJL@6	�c���g�A2 8�Z����C(h�H��kx�D� LER ��  �!B;eB��#��҆�������]�G������~���G��^4�u=xw�ڗe��x7o��[���?�U�֚���8��>��wh���K���q�����֞�~V��Tֺ�T�]}���_�Y��c,�U�~_�Ͷ�^�����.�lĽ͇m?}���q��f���u�?;�c��/�/U�W/ϫ�����)�fZ�q�w����W���4N���ב{ۮ}��}�U��g�����_6}�����3o�G�}%������Okt���%�o�C����������a�D	���SH��X#j@�*���c h�@��MZ̐�0�N�@�}�~��Q6C pAP�  P�����*Yu!(�~�	��bk�Pإ����2�X��\ S�
�a@��;]�u��J�.�iw��{����}�?ٵfO�Z�^&��7��k����߰����GK�z�E���W�߃�������at���J��{���?��u{������n���ش��+���W��n?��*"�(BR�!�A�L`E�Dd�d�$9�"�NX�I@m��`�B �(��1l,��>�̻�E�B%Q���� @��1��`�H�9 �p��C.J �� �J@B�N
	�!� H�D6,�Jx� �a
��I�$E:#3"B�tl��U!*@!H��
` i��P( �$ɠ �R 
j�� 
2 ���
CP�z�� ]��JQ��(耊� �1��P֞���ߚ���$�?~�1����3���!�%N�u�w���f��#��W����;��?�0w��q�Z~��W��W���Ӱ�����^y��=�ݹͮ�V������N��m�����A��W��o^�f 
C @� CzB��8*$?�P��K�� �N
x�x�G6`"$
"H	�%8T S@@   PG`0�0�0@B���"�l��@ 

1�eh�R@�0�#$)U&��A ��D�������c����^L���;�~���/Z�q�yh��y9�m_;[d����N�qo���7k��
���'N��?�{��������鶼�ew��-��༿���&}�}�3��?f����ٿ��I��oe�nz��_������_e��_?v{��n�I����7/���M�����쮺��ߟ[+O����k��>&kw������خ��ĊP�?w������ǟo��O��r~w(3��,���Os������c?�z�Q�gڻ�P��,%�0 iL,h B�/8!���%�` i$P�x!�P�B�.��Fr�����A �A���%.@� �����&�0���4 N�"�A�U�B������ � ��:T4@a�]��㥷+����Kl���z���;�\[��vԧ�}O����������W߯���> ���/1�/���`(������|��.]���>w~��ԟ3z��^^����G�/}?t�����M����:q���  �� (/��1���q�$ @bư q,@ � T2&��0$�O2��A`����4�@1 ��A�� 0��P�  �4��rC� ����A 1(D,+$ �VMA\J"���  �A��_a�#��J*P�F� �@I
�� �F� ذ�(� �	( (@"/P2 ��p�+
I0Ȳ
2����bD�#�����@�'L�  �XA�ā,�t�v�z������e�*�66���6C���#���j��~o�o��[��`��'�;��W~�#�h�:�\��W���ML�#h��3�����νGY��'k��=�2�ݫ�jq�����������=\Uz_����s&
P��T�ZĄ$b��8 d��]4� 0S WB�'��{��� 5�B�@$`h�DMEMfRŃ�4r`H�S��P�C  S ��$�a�E �,o��Y�,�y��>�����φ�c����we��|����Z��$?��o��5����wm|��m�Y�o��n���wh-W���7��;�w�h�~�������^�%�-Ww�/�l]�W��W����sc��_��G�����:'|g���>��57������ݶϛ�ﯿU����_?��'���9���2?v\��������ً�>�����w77���[~����=����?���g�o�";�n�+��}����[R�k�o��������`"  �qb �[Ra`�(t�@�NĪ�=@ �R�ՂHVC�iTI$I�8(r��J�KX?rX�&.@�5;Ɉ��4�CDAZ@�O`��Q�K���,cLt LD���z��uz��.��΍uu���_�m����iF��u��]Q����e/eǜ����O����O�}�g7^�n'm���=o.��7�����E���]�_����?o'�T��d�w{7��[o�|�=^wnu3�. 3RV-p�݊�|
HAD�
!Ԑ�,"�ɀ ,�@  (��AE �VR�w%s$��Wj3#0�� �0( *@! � �P@]'T�H�'� �й�0Z� �>%� �eY4D�A�N=��2B� (�#R
�r"m��,�T�''�A i@倵\���4���q!� U �%�GG  �fB�0[ �2��.	�P��#`�
9_sL���G��r����i�����s���*�����Hoc�q2}�Z����?������m,滫W����c_��u�]|�wM�g'��~��M���;��ڿ����{�c���/���q���'������� �Fp	dY�q��Ej^SA��
  C0���B E�h�0���`Va	�����QR .^��1�d$ Ai���IR@#@  $ �O�  ��G 4 h/i�"F��"\�t�����?���v?W�`��\���7����V]���_�/��N���cn����g�;����U޿����%��>o�����o�~]���Wz��n��3�n��|��k�p��O0�ߏ�����W{��7�����.A�/֬zz��)ת���u�]���{�|��������zn��1��w�U��vǩm�������Vߓ�����?�=��t��^џ�{���^������33�Λ6���V��r���<�~��;_��R,�� D��K�I����bD@��i�BE�;�   Ck�6R<�( &R��d$ F���"�:hjDBB\//A�EU�@������NKJ�2
� J���� �+�( $8r$��0�%@sD�������"�p���T���C� �B
�JD�$`,B��,R��a�<� �(Q
4Y�! A�@ �F�D�SÖ@�(���9�d8� 8�@ =�D0���3��^_�(���+֛���%j�z��1����������߻&ߊ��J�������
�L�5��_�����/T!���\��dy�����3���{�����I��gK����q�����M��k]��_M�_�_����?.�W~��=�o8�۟��ߺs�?����.+s�kk,ێg��F�2�g~w�gC���ߥ���>�:�������Ue��z�^�~ug?��W]�8���E�OF����ow��=}%���vc���������@� �7 <`��P����Db��CZhOT59΄� �d!(�U�������"d�GL�"i��(�@����9&6to
��d��`H8 �A"&Q�a!G4 ��d��s)i��\A�q�N������T���O;w�?�vy������ƊM'<���>���;:�s5�%�΢���_�����c�,~�%�>]m�*��O姺���p��b�\&�fumƕ��i�n��5�=g_��Nַ�e�t�в�ݭ���%��@: X�i�����4 po�<@x� �!I�e�R�.� e� ��"D�C�G@� � *pG���`�B�PA0��ZD0 +:a�ʂנ)����C�X"�E%!)�!�V�u2�"% � (�
��!@�� �1a�$�"	!���D c�� �e�����]c4� IQDd�PY(AGMJl��@ �9]ptO8 �2�b	0h�)&� @��(���R���绬.�O����Y:�l�]��q����k^^fg9	��_�g�-��YZ{�<y��s\
�f�۹����Z�M߭��G�Bm��;�����u���꽻�7ܛ���}�����������v���g���i(P�hL�4	"�@D8�`$@�0�4�l�( *$��@��lB� S ����J�2�*1/�"�Ɂ�@�"b� �4�D@B8,bC�)�(]m"2LH    �8@ s��u�<��|o�|����n�sѳ�}���ל���Gr�[��=>t�����(�^x��;?|?�����_E�>Y'���=���G���?��}��q����ڵ�}~V�U�[:om���W���k�Z�����f;�S*�~���b{���=���W�^�[���Ou?�^���u�.�ͯ�߾��9�|���}�}M����;�ӿ�ռ�j����H������{���^<����[�/gA8��/�&GNc����?��zJ뷎 ��b~�A��DDq��$A�C
����D$AL�!�@�
M��I��	`�0Da�� 5�B5+0 4 	 �A @�C�nA�~+8 �J�ex A%��T`
i�"�a�4r��NƷ�)�a��.�����=�F��r���S��:�&QMƢ�����Vꧤ����ki���i^�og�ߧ��g�����J���;��ġ������uG��7���_�í��ח���^���'w�XY�Z�6	96 ���X�`&D"B@P@�F���&� 
2��`)D �p(B5cPB'�Y�`$ ����(  K��bH�
V��b��B�� ��J!!�	Df� @����S�2$��9
t
� �;�$n��dB�@(�7 ��TW �D�JbF�� �@t�P� �f@�����K�6��@p��
�0H,b�:!6 (#� Rg��A�"  @���	 $�M�P$AJZ���d�/Q� ����dwyK��?$�~?��|Wf�V-��t*�������:ѷ%���W��U�{/[Go]��g�u��;ɾW��=_lW��wr�Sn_�W���n4\v��w��ߴ�_ۭ���1�3�q<w���L�7���U�a�D��`���(�$T@
�$A������C Pc t��#�"�	Vl���
IHC!
����#�J(@&�3�	������HB�%� #t�HD b� ��B��r�@9�"����;�3��������y�#����y�?���l�龮��ϛ1�9]�}�������Ws6��_�ڲ���}\����mk{���S���=%�-���g��޾G��K�?�z������������Wd�5g��y��Sg^���1��������v�;x?������~kNJ�?oW����F�k��o���F�ov�D�2�k+w�G�}��
�������[��Z��Km}��{[�w_��§�/_���O����,)��OSf��M���Ń�=�@�22�cF�  !W� -* ��P � B ����P�� R�T�ȁ��A�F1S�(C� ��H:4H 4V��؊ �����R�"Ǉ6�������yw�,�z.�+��{�o7m�y������>/�Q���_�{����5��-�g�V�_o�����iXև~�۶s�;�e7���#}:�[�zhu�����7���'���#���G�s7}�s?�k��ֿ��m� 	�BhGxO[p�RdPA�"�������&�T 3�tH� ʮF��<\�R`
�	 C(�T�0��i����p�B0ɐB�
0|�� ඀�����i�`$�� ��@v�P�Ƅ
�6@8��Q(6�����p(!�:P@a��	8\�A �44T^`�BH�3�8 �z"� � 	��Vp@c��b"@B�N�56h�R3(x
"c��+��b�1D (��p���H &��)�KW�G��v[m'nj�o��qK�D#���Պ�[�?����G�S��G�����[�\������}�c�����~�.�>zi>^���]�F|�Wp���g�}�i[�����ϵ/�}yz��4uG>����~��9 c!�	�CIA� @��@
hAB��S�$�h�! �� ���|��٘"�\N�A4�4�)�',(d�GB	0�  � �, $ <A^���T�d��G� %�J��   	f 
(�������~+�l�_�}IJ����W���I�Ϯ=��n.���S�����Rg�^�\����;;���&l�s�����#�_�/d+���cY�ӯ�|�7��pϗ�?�^^���
��Ti������e�cŒK`�V��Ǫ��^�?���n�������vۯu��w��)���k\ߞT������t��sz����3�O�?�}�1�m�}���{������c�.�����ޟ��9Y��g'��:�u3s7�]5���_���7�v9/��zwX���I��� .V	���.!� n"A �s@������ �ф
� 
)����@�~G�+1�iY#$A LAHd��D�p���"�&�NX��
	��@���� nE 	9�����ܾ��
f�^_s���7��s�7�;6�p����t��~�W����?��jV�����{��-��7���ke�����Ό|��9t�W�}��v��{~~��Q����7k�����OfݕS���=ף*�G*hA��Lp(�9`- ���$P�i���4,AP& �F��RB
d�� AIł ���L�!����͓&�A�P,`� ��8 �0b!QH�"[��'� �H�AЉ�E �8RPC
P�H]���P2�� ���DK# D."TnI�C4jB�D�aQ��� @	2@�@�k��N�� 0A�N� S� '���(ҿh� � Lb,��!�Ɣ� �A�`��b��.��.n�/��n�}�d�?w�[w���?ڠr�F�G��F�T���Z�T�n��.�����չ�iɺ��U�������?w��������+���5�����2/��m�����K���_��>�uǪ�&ܾ���       head.parentNode;
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
  ��e�=��gw�l�8Ͽ���o�5�4~��|�`�7嵸*O�{:���O���ޖ����rî��_�>��~ʱ���?��~x�L�������h�{�ө���;}Vu]�Z��?96ݾ��Һ��-@���{^�� �|>Tq ���CMX"��	(�@20H�0G0��:�M (P
�>ZD ŀ�	�D"0DG��I0T��� A�K��5%������4%-#p�l � @� �� K�f	��(�D8 ��L��-��:M�� Yi 
�#�6�d�F!
�*I�X�,$.�`D-D�.n 0�`Jr	� @ ���A҆���� `	�# @�B`���c@�	C,���
�F��0���{��gK��ӷbN�ہ���G�W� �MwB�����3�������~f\^���^�^n3���/�Z���w�/f�-�Sn�j��כ��/�_u
q}�j�nsy�_�ٟ��諳k�����~�W�{/�O$� � $@$ #��Xu+�.M@c`�#�&H�H
fHgp�	���G�{B�XB��0�9�8�)I?�9b@� ���F�
jj�BF"CQ}0J�F  9@<B
Q. �D���}���I��7~ۻ��5���J��\���#ß�B׏êu��y�φ����w���_�}�?[��W�m�N��������_�����ܟAw%��3�c��4�����#��w��m���:ڱ{����w��q�r�}^}���E��o�տ73<�<��.O�O�����G��F����_�o�'��4��j�<�|�73��C�'�o��J!ȏ#��*�#�G��;�ώ�㷗7���������9��s_�a	$6!�l�,p!�  D�P�"��C	� �k��X�81B %�
� u�F�h 0`�� q�@@XH�QP� "�� Vȇ() �Q$�@(P �AT$�B e
���J�0����9f����G�����\o}��_o�>E�����xr���_�۲='m���^�w����9'��_ݟ+���z���t_��w���k�������W��K�ߡɬ?ެ�_�^��}���������T�_ �Z=tq�  <�(Ji�jPA��@�<<.JBTLj��	��.��B��	 j���G���I�b J!�O)� ��Fr0��5 n@<�B��2�%x�@A��%��!�2I�E�@ xV �DReH��X�M��d ����I�P1�$���.-#�Um�@$J@PT���D% Pp	�	@C���4(ˈ3 J	r]
!	X��)�� �!� ��%��}~���98���i����%S�v0M���T"o�����W����G�uF+�-����ۜ��R�S�~o���ۋ��������-�8�3��ٽ_?��֍���i��O��چ�ߍ�O�pߞZ�϶-�BQ�`D@9���6( v��� B UG ���	cM� ��,aXG�G*B*���+1Äj@M�Pm� b�L�a!��l  q3$���#�XT �K��nC CFx���"���?Uko��b�����Y�έ«߂��u�K����TݾW���Y?~�[)�W��K{g����h�վ.��;��t�O�;���ύc=���uۺ-:�5���w����R�n�z������nvK{��M������J-{,�]ʘu�7���aN�=y���[�����S*��׳����3\��������ϭRU��I��m��R����ɒ1n]���/W<����N�]嵙��V��w~�|�z'�D֖�5��FG�ޣ�G������piT�Qr
p!F�ő�c\p����yX�A ��%(%H,� �(q�@F;�"�n�C �`�@0��U�x@z�D�퇃��@S�j�(�ִz�D�& %�"D A" ��"��Z��~�w�a�w{����R<{�yy��!;�܅����睤%��En�卮�%C���6X2�R�}^�)�U��n�����,<އ�e��6m����l��Wf�����W�\����/���C�?V�܀�]��DԆ@ �@��`U&����f�8���#��>�E�,T qo$8� .H  	~� i �Pʄ+0� ���HQ�
�����@8����DL0�B1A�G�)�8 lJ2L��Ռ j���A�@+�e� �LX�9�dg9�r�
k��0�P�� �D��)1� p�A&TD+4�D���`�`	�,-� �=�01	��ZT�E���PA��
�Є
>DO)� ��0�M߷j�O]g��j��Ͼ��^���-�Ĩk���7�oo������x���{��GK��Wv��	>��ߏv?=������^[a��w��[��of�_���gn�m�9�~=q���_��tdsskY����I��B@(�G���A�'�HP��E`���0Qc�#�	D' .���8H > A�\� 
 �D�DC gD�;};��\��
H� %r	��	Y@A�$4Pb@�C" 0���`����m�o�Яe:wn F�4��;�Z�
m��iG�����_�r��<�7�ٖ����6-���o��g�G����e�5�^�#Wke&�;���7'i�y��ӻ��_�{�e���Y�6Q�dOn��º�W��7�j���_�vN�L�;X��z������*M�>?_���9���z��S~rϱ�ZտЖ�������?��Ëe�G�E��wx�og�}��v���Z��El�7�ڿ[��>͟�7�{e��>5!�!�@X�.B@dF$:��	P�%� t� �`XH��iC@�&�@ F� �*�+DӠ
Ȩ]@$�B�
� XQe+� �C�@ �8)N� d&� ��`"TQ*`t�_�)�0'	Q�?�J?.�hz�j�ǋx��]K�J����Z٭��~A8����tw{�����w�]���g����SO߻%�O���om�ֳ��O�R6�ǯ��/#��А�[���㾔�?��?��{����a��?X�����Ʌ>`���K�z��J�"��� �@���,�� �� @�8#dT��2 0j�"X�$�� @QT�$�� a� $� >D�l��H�  -�D@я5��p����`�PL� �` �`,T2�D� > �C4A�����	F���\Op.�5�$���Q@I��0E �K�%�  ��Y�$!40�Q$H�� ��� ^$�����H8j�����r���wq����m�eE'�[��V�{���oP���}����w;���uu���<�ۣ��?����&s����/��#�O���[��~���'���*���j�������݋JגĐ��4���h��� P+B�`1ap� 	#�M!�>�H0�c"@\A\!0� G��� �H�Խ�(Ȥ  
��%�as 4���,0D�Ɛ`�@�J��K@�@9>� L��5A�$�	� ������6�뻰��������^}���:�_������~�G���}���Z��s�����|G�&�3�~�K|U�7+����������e�������r��qsJ1/����]���W*�����7��v�V_��۶�im��Y��1{�6���ſ�{�/��g�ӟ�;ۇ���߮�.�������?wk�-OJ�Wc�{�ݯ�}s�G�;�����R�Kk_Y�K���ϱ�_�o�k��*�^���:��k�w��{����f����#	�`��P#@'E��BA %�!
���(Y D�U�>�1�-�h!B �"  ����/�#�M��,�#9�!�� ��9�'��@ ��cIs� X��D  e@ion = (fixedCol >= 0) ? fixedCol : actualPosition;
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
      $editable.on('keyd�t�Ͼ������,�����n�n
�]춹O|_����u��`��s������?��~��B�N:�esFk�z�{��}V��o(���c�O�#�*6��5&��ֈ\�M_��?Y���רf/���_���j���Dā�� �M �%�@ �	� " T 4�����t4� @͠�  ���\2A�
�6�)�%1P&��@`��H�i"��	� �@��Ba�h��H��@vE*x�r��\  ��R8J `2�%!P&*�p,C� ���C �E@+ ` ���(A�d�< %&1 fAP��ᅀFH
�� )��d���CH�Yb�	 A�P�,r@# � ! ����y��?�y�ew�]כ����w�I�/1��/�L�|Ϯ�5����V�]{ީ��/�H|��~|ӻ����6�>{�<������+1۵���ٽ���[�����������߱�v���w�}�=��>6��� #dX"Ƞ��@B$�16�1<X�3�b@II���&�?aY��¶+t���D� ���@H@�C� � �L&��Bd�)rm9�J��q@ D�R�a��PІ�tJ� D �D�~��_�'�g��j�����u?w������&��{{��_��}3k�����w�����Y+�]��-'�^��W�ܿ�ҿG��Ϋ�~��ws�+7׾���s;�k�߷�ܞ�5�,���w8�����z��4&�򮟿��`oݴ溜��Y��y��K�x�����[����������"��}��k��'zӴ�^��|�x�����ݛ͋U�K}_�t�qW}Uԯ��.�E_�}�"|�C����2)��A���i|�����{IMǿ��14� ����  D�J  -!%�00$�d@ (@@�Q�"@$��K�.�I��3 ��X��)4	D$0 & S�XD�EGBAB��H�`c�B+ ��JD�F� �m(���ޢS޵J/���'j�^m����FQ^�[�9��~]ڮ�}��l|�{K�u�	!طi��b�\������{�߷���#���]��^���w.��}w��T;�?�Y䴺/,������>����f;_#Pr��������il�"�d A��P Ѭ
YP� �v �	*M�f�L� .T �HP�H����PAA�B ��� 0����� �� R��@	 �5��ʠD �0P�d�`@zG���L��#B& �C�R�"Q�QQ��1$ ,EP��1u� #�J ��cL�D�
2�(� �R�A�Q@��HE�HI %�R$jG �| 
< !Dl����E �@�� �08�n&�vP2�AK�G�MO�֧k!�d�~s�z�u�_�������\�.����]�ݯ�'��9�_���گc���;�o����g�_[���`����o������ߙa�����U������)S~����^ks!���{��6�H���U_Ɓ�8 	ap�
��	�~/�$ �( I.PF	P-3&`�!�!� 0W���*D �(�"5` �<2* 0�:�."�	ii�HUf�@vD:��Z �&f�j��7ZLݼ�)��=�*�����\����ykc��z��W����?�G�;o�g��W�'��>}�����9��k�K����?WЖ����;������7��Ҷ��&7��������/ۋ�󼶿y{�㓤��V�g�9��4���(vGb�7�S�Rm7Ν���m{������+�47�|���Qp�ٟ�����=���[���{����;|�n���7��{���g���]y��������d[}����ۗ�6�[��{��_��KS@5�D�"@T���!R�� D
�!� �Z��BfB �B2% (Q�(���!&�UU:>�&i mC8HB�N�Q�KM�'x��P@$�7$ÀЪ��DRD@��X�e�44��B���i��λ��kK�Ww�I��Ԭ�+��n�?]f�m��-�_�˾��}��?+L~��{�g������d����;|z����ѭ�]�{O���kܶ�?'�^ǟ�|���{��ى�/�Ҟ��9�?�V��`T�p��,�@F�	tBBȖ�D(r�8�JI�0��h!  �z ���4da4� �0$�!` *b( û�D �8A@�@�  ���!�B��1 *D,2�"@-D�h�	E� 6@����0� �a��	� E�P]��`������l��k� 0~A�� `�X "����@(����*V�eD�J0��"Q(�XS
 Y)+�+GrS9����[]�E�^As�����>�=�;U���Z��K��pV�o���gv����������qq��7=��}Z����"1��'۟�=�]K������xo���ӵ8��ǳ���[S�m�BPa �)(�GM� 5H� . ��@������(�	� ��C@��0!m�/@@�Q:� ��EQ�)a@��0c�  "NiSMf,�%+@�� ��0$� ��!�`"!DЕ.���}���W9��x\��3<����c�}߿|����D�ǿ��|��'r+���};�����g�#b�t�w�/ΜR>~ǮgT���������6}7���������'�^dߗ����߭_r�����v靿��ｼ��_ӷ��� o��������w����SW�����������~��hw�}��k����n߮���Mt���Ӛ�/y����~��5ڹM{��_��?[?7�ۖ���>���9ƾ���s6~Z����ݕ	�AB2@�C`�*� ������c@� L0Y��&"@�A��(@(�� �D�s�)B*�1GH1�QY��E �0� �pX!D��� 3@� `@.�� 8Q��1������������;����c��Zu�Y�j���z��w�������7}wzH����7�o�����'�{�m�\��W����l�?��-K����Ͼر����<ܾ���/d��+��?w��ҧ��i�O�>���A�XġAcF�I��JD*@0����HP*�5B ��9d 	� �EqI0/B�E``0�P��	h A��Ȍ��d�A� NsE��`�41�!����B $I��T҆�0TVRH�L4�B��A�(A�$�l���m 4 ЈQ$  ��0�` F�cdPdH� �>�C$�{�.�E������Y���a��`�X��!@#(G��H��w�2F:�����۩���������P�z0���_��~��W��;������i����|v��^7�����o�����۔��l����ϻ2޻}�_�������QZΡݧ�;>��{k���.������ -�# )�!  �� ��*�"�D� �  	0�L	�F*��-�Q� w\ d�:F! h E"�����HC <���a�1qQ#��cc0�*UqX�@Pg��<�H	Ҁ��d^� ��<�-��v��|��������'�y��+w���S���=T�5^��믇�iv��5��i�]}'��ku�_�}��q���r�a?���/��x���l�q���_���k�n�]g���9O����{��}�{�n?��{?ɏi�����~���G�3�.��f�����CrF�����_��r��eod������n����nٴzC���,g�_M���|��|{�y\�{98��������q��~��r�ﹳNz�V���`f�� ����� �KBE� lh�  D  	!��BB&ڈ�(! �F�5�'f��A�e�  ��pR�@D ��	 I pք,�V��� i� Y�[� �8"D�Q�� Pء��@�[^��I�0
)@�m	F6	�$��2��@4a�@ b%��Qք^r^��`� �����&�)J�% @+������0L�1�R8Đ�@ �M5ARؤ ������@ ����L��~��ճ�����_�`ë0�=���K����B[�����.���u�����m�Vm\�����y��+q���,���������m]_�|�{�m�}�E�vϥ{��~k�k�oN����������3�w���~��������W�]�sM��_���o�)xz��y�����n�o������j�j��T�SD��-�tHg�����1s��9/�Ϲ�����Z��t�7�RW�2���^O�4�N�%����޹��Аw��(�A�3"�h�U��ș���� �E@�
BB���C$ $��hM��%l	���ԛx0��H#p�P�B��6��� IA s��d�@�HB�+F �R�P�2���!Z9 �������;���ۮ�uw��x�x�i�*�����GZ�}��:�H����r���[G����R�}+��5���z�w��S�
��Öu���=r���O�c��yϧ�ۯ~�Z�����ϰu����p���Oo^�U ��P�����8J:Q@R������XDL@F� D��@T"�  a �A���b!� `A��g\1���H�Jt���l]"����0I� �I�H�:"h
KPD5�H�RM�#@��Q*��"�Т�*�$��$T���L[V����$�LB� `��5*Iu�,�"(ї�$���F�da�	 �l�\�B�!�D�H�(�	 R��\JHT `GP�	!"���ca)�@@����g��w��W�m��췦���η����&oy(�&�|�w�ϫ����1��ǝ��5>������O��7���.��q��T�����w���5����{�r�ĭ�~�Y�~�������s��^��?x۬���X_9%:���#4�IJ�`�d d@�� M4T�Sm���(�����q� 2EO@!��� Epz
��$p@�� K��B KZh��`����i( �(��@ h� A`�p���GH�������-�t������,w*��d�����������r���3�/�ot����������o�i�'����������m�M�ȫq��=���?ל��k�yO���w%�7���ʺ?�������Ժ}�ޛ���ͦ�s���N�o�䈗����}�0�_�������ұ��g��ĺ'�cW9���ǳ��U��t���Q�z7Yr]O�I�k�n���y�ٯ�������M|_�˯�w��R)]~����[N}������滬;�G�Đ�&#�K"�)�f�(B�b5Ƞ .H)�p  �C�@� ,D# 0��z��  D�Q$0I�đ	Z!P@��"�y#
E!{� �� %H @t   Ej� LU�S	 {WV��Y�~_�w�}���ߵz�7��^�)����vb�1�;���Uz������E�����~ui��S��Ӎ����|i���h˙��[�G��۝�����i����<e�������O,�g����^��a"�	�H2�$!n�j��O(��h��D=#��t������0)�+B��cD��$ �P�A,$B0H@ �D��H� ���q��a�-&4��
�!%� �d�*�1��U�2(*�@$(JHM_ ̋�������]Á h� "�2�&�e�� Z���F:eL�����  j���p�ĥW=0� �T�8VBż P �<<�T	df$HB ˘��  ��4�z<g��Z��֨�ww�N�z����|�ފ\sWy���C�j.�]�G�'����s���<�����O�S����*ר���]�W.p��w���T��t�����vN��J��C�����wp����x���ی]�Z���@�5���NR��)���U��B$�A��� 8��/�@�Zj"(8�$����
C��3 I	�� ���0@1DP "� 	�Z)(�   ��I dd8�`��.Ю�@��x{���I��ˏ��ru���/�mN���c����oy��?��[7���_ߨ�����_S�l۾ݯ��������c̔��������Ϩ>�L�����z��\伯�m|��O���¿]��{����z��?����B�K���7k�����p����E��Go����s9�۽���q��;�8i?hv������V��w��t�{���o�;�y���볳e�w5i��Ys��{ƿ�]�����q������O֑b�����O���w�_o�zd�hA�X,��4�]A�0�Ep!e����B�3FbT�t���!()�d�c�  ��J� �D`MA1 EH�AJ�1 p[	�a`��#p����@@B���p	d!Ф@ B1�$V�L�vV��l�m��q�}�'���uտ���b���_c��o�m��K��7�:���3�������^Z�}���_��g���r��{�U���i���g��KU��[��{���#z�G�W7�G��X���v���q�wꐻ��Q�I�%$cx�B��K*Y1���� H� �*���53HH@w�
�	@�4R�:$( ��@@��d?�T9�> � � �����I�b���@	F��&��Hr4� �0 bPH�H#��*@�"�2B���1`���7=Q$. �aB]D��@����Ӕ���D Pr#-yJx 
���L-�. �Z�J6�B��D�(� �CS�|L� @�`)D���$q ��~��M�P��[�_M�G���n��}�_y7?�Ul?ו3\�?���{R�����y��>����Bw�>9��_��<g��i{�8�?�u���w�'���^�������s�Oo�g���R8�Lm�mk���5f������\�
�����bC0aP �AHW0 `�(�#�JD��d�%�!��H����!!��G��1�N"x������ �,K	�9C�P2( �\4 h��" �a����H@����������߽�L+k�{}F�zo��^~}�_o�w�}O�-͞�Ǒ��X��z���>?��we���귬�������j:P���[�J����}w���yw����W;;�O]o������F��M���gm�gͰ+����o�\����������W�����ko��F�O��I���{S��KP{G~��;y����'�$˭��f�_�ݽ5�N��[�_�*��9>���1�s��t���6���eU��T�_*?�����?�E}����L �^$���ƹ(��� �N@�솰 B I���F�#�� �L� GP�c�$��d:��
ԅ�:Un� ⑀�HFD%��"��(RJ�J�L�A��0F9�u�]��d#�-a��]�n��o�Z9��RKS�o'?u��{�z�~]-1�_K���y_���q�������k�6=[s�|���#���с���J��x�����v�����vfMb�����/??�.-�;����!��E����;�x��8FLD.$ Q�)� 6���j
� �=pSB (��Lc2�(�
` @%�/bࠚ)��/l%O$0�+H���� )�& ے 0D!�D�9B!�F"�L ^�,l��Q)�X!�	�"���U%�:� �v b�@`� -ـ�. (��ɠ�5&�+@�K8'���5y!"�l� �8AA����W� �(`l��`M "������4�EЀ�d��d9ɨO�H	%���`��z�n��[l�}��/_����g���}[?�Q���63���y��L���CV�������N����߿+�c���*����_������V}��S��{ן�:%�S���P}�o<%%�?�hy��v��{̿�o�����9�6"� @^���X4��@�Y�Q��� �@�CH���� ���m L	 ,	`a)� ��e� �@ A���c�H'� Q*��!P4P *(�a4 lBA2 � �bva!" "M( �a������w���о��Om��s3+���tQ�6���Gw)�Q��`�?�Ȗ�|}�A��l}�u�W3F�Vٽ946��E3��u�Ŏ]��w6jl��vq.V���ӷ���L��5���_���W/����?c��sW���z�i���SWn�x��t����̦����o��?_����NJ���~{��_f���݃;�x�W~�	���ߴyn������ڿ{�z��׹�Q��'K�f�/o�w��a^/Q�߱��p.{��'��٧,��Y� #؀��K�" ȳ��%��AE 2��4,�R8R0 ����1@f�L��0�R1LpD�E0 *b�*Pb (a@�#u"%�h���@�qB�,n #T* �"M1�UĠ �*��ѹ�?/o���?�'��E�v��}���_�����.����F�~����Rz~�R�����p��%��������y��T����>����'k�z}�������l���%u��}��z�o���� |j�����?��F�"p�*3�G.N
a$�`�MΠ��D �<W3�'᨞2!c(	1���	B<� �AD��#O�L�v[.m1�$p4 " @b�q��  dABHJ%�@EM��C�(���*����X�"  �� 	������NQ�IH@�@�k�.����@1���`!`)$�D�eC�
E
4B�0�(
Y P�"�����*����� iZ ���)�V��Y�#0�( u ��P�O�5y�U���C'68&.�wo�M����u����v�_�_��/�v?�]�oo|�n_�7��y�i{�n9�h{o���o�~Ώ�s�$��v�mkO�ܤ?�yX�����ǜW���3X�)p>�k��m�?�x���Sr5@# ���`@�@�*�
&!�x3�@AZlȤ�!0����
�R$�@�dZ(5��HP"d�X�Ǭ5�zD�A !I&D�1@@D�n	ą�0���DN�R	�	`�@�(�H"ȝ	�{�ׁ��n��}D��Z�b]�o{����G�����o��z�k�6߄g�wo�����yy�ZVn7ܕ_���3�ȱ��#���}~������ֽ�~�������?�d˷wo=y9���c���g����ڙ��������[���τ�WG�߾O����Z��l�����w4�6��>�c�?����(B���s%_�������֩��֌�^&������0��������߿X���_�!�V:C�ns��;�������+�!� $  ?�'̲`� �Y U|A1�(! 9��3p@  �D.�8*�hpr�`	�zZA:�J%��:�b��D��"Ȕ j R
�TB L�!DE��@ +EE : @
� B�*Z�P#��پ�C̥;�{�����z��w��jo��X��ld�+���خ{��y[����㫳���<z���+/��n�q�r!
��Ƚ&E�t���f����x�9b_���V~�{����7:�/������\w��î]���Gi
P"@�6RX��PA�uE�D�!���(
�K �'�`�Mp8bP�0G28��#@g�T� 
���� VD C���Y݊S��7@x�i�� ;�G)4	0�!-�A)T#� `I@���@�@�p�)y�` ��`@�fL<��P+$d��݇J"0��!\��I0�� �H	��@D�G>�X\1�8���& �h&*��������2X)x ?e)&Bi� $ �<o<�R�h��[�����~�l����t\����i����v-�7�j�j��<��W��.~������Җ�*w��T>'e���}w�}����Ӛ�w��oy�fh����w���?=~�l��ݿ����<K�ߝӺ����_F��
<�X	2P �PH��$j��(#�`�P��HBAA0d�P	E��$b̤�!B��D A�  �� +�ƌWBE:	IH.b<��� L�B�@��.��x(��(RD$�ğ���ZI�9�5����|�����ߝ����X�F���f�s�3YTc��O��8>������^���[������U�z3�z~7��p���4�����:��\�{��h���nrn���ޭs�W�_ִ���������e������T���ms�w����1���\���6��#�w�����m���o6t�WZ����o���e�>�o��p���k�>��E���S���=k~~?޹w�5�b�����]6�P7ﯽ_��������z���>o�~}��jC�  �QB&ʠJXz0! `I�! ���(�4�L�EM�� F-Hdab-�p

-d@�	�@��,�V�V��������F�(#� �PB����¬ �B�B +���&��Hl�脋jXk�ų���R{�΋�[�x�^ok�w�[���a7����������t�������fm�~��ty�>�Lb��+[���x����������v!:�nUoc����]�~Ww�N�f�u�ｲvg��_�֬	0@Xc��� �mԊ(  D B�Iz0 ��D 7� J�(X�L�����J r  b@
�h<UJ��� h�"��:(� �� �� �F�CPXl��@P@�@H�?t% ����*9�"d� ��  �e(�� � Ih@А��@�-Ē�/G��l� �  x hC���|eq&� 0�*Ye���X!	D B�XP!f��e!K�  ��:M�Ң��`���sO���]���k}m��u����ޫ�ܲ���l痿����볛�5��Z���E��������<���O��V��7_���p��t�V_�������[�]�M�����������w��צ��k��d���n�h��*����} �h��N +#Y��&p�tb����J�D�m:I 0Ǥ`���Io��AQ�	b(1���F�S`�B	���%e-. Kd1�B� )��i2t��p	A@	"�2�Z����^�9~��	G��1��m���}���8K���˟����Ư�~���wJ�����y����=��!Z�/5Ӊ��F���%_]�w�畿�l������_��m�-���r#�n��p{�_	;����'����N�����Ӿ��C��ܰo���w��}���K��Z��λΚ�2?��oHs��n_�tr�^����c���F�s_o/�υ5�9�-��m���?���n_'���@o��ڢ�D݆ǹd�4{�{梪<��c���:35eAY�ؤ��A�h n�4f$M"䃣�Eu��@%� ��`�# &P�dU@��� � %j�h�2 D�(�5�����=��!l�t=ѯ�BT�%�!��!����@���ֻ_r������_��������w�w:�ݟ������n�QyW���9�?-_?��'}�W� �}���yY��z�^�tF�����j�v����gx�����~�cd���Zv�)}]?�?�Z���u��� j �܅Cr#�����j���D܂���A�I	�W0�)H���jfH�R��H5tP�,Kp�4�i kIc��A�)�l�Ky�A#U�8	�Pγf��D�B`@�
�� @� �BAp�@��QpcP:�@��2��Q�b#��8�� ���0�\���D��)M�0ą)� *0Pj8�&�H�@P� 	q��T�Eb�a�@�� 	�* �  A(�7M�*h���������wj�b��~��h�#���������'����������km����?���OEתoW=������|�|���s��w��%��վU~}7:[����}ߧn���P�R������~{����s�0   var spans = style.styleNodes(rng);
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
   * @class Codev�BF��ĔB	$B*N0p�I�Z�Ƃ���' �&]�3 X"�& (@�x30�
�!0��	М ��}�5h��f�m ��&x�1 �� ,P� ɀ#ЉF��{���������������7����������;Q˭�w8�O�
�g�G�ϱ��ն���"��\;���]�;?��~?o�r�j�<V�K����_�^�����='=�?�C�_����w�������?���>�5��F{���������vݱvn���:����Ԝ��,�?��-&�����u��j~���{�ç��������+������쵬��/��ۣ.�oέxp]ĺ��_~�w�i��w�!aO��D� e*� ���
t���\EH���؄�� 1! �HP��X" F"b!`AH��`�tNHLH$�.c0� � L �,�vH�!� u 8Fc��A,LJ�� #КX@d!APA���c͇d�ۃ��zi�Z�'��e>�o��>������Հ��\�-�όn�����i��}�_z��O��p�F��W��9�w��'�y�9�?_���w[.?�����՗G�s�«�^���o����u��=�~�9K�������)��Y�D`�|@Bl� 0 �`j�)X�^��Q��� 4�h������sA�
 ?� E 0 ��2$���e�_#�
B� `��R�@�%�)�3!�!dBB� ��\�f���r��#��(��1���`� *P!bT&B (�B" dQ�I����� �˒�P������ ��;�R@(�A� f�	��c#bq���0� �ťJ!�ĐҐ@H$�����>^/�2��V����C�[X����aoxo.���9��j�qD���͋4��Un��6��x⎺����>��u�T�)6o��o�o�'��/�!Y�{o�����c������lK_��vw�����~�J v��(� @� �	W�� Ph`�` �40l�� *  )�D0@E` |�	  JTH%�%���i0Jˁ<��� �@���bs�@�g�< �P�;��K�`�!���J<�7 D7�d #�O�����<9���?���w=w��ͷ�Ϗ���Y�9��<]��{�W��_�?w瞥���8��oN��������g=�>^\w���6s�`���w'�I���tx��5�˟%�O�W�Si�������go>�m�Yտ#���WZ�{g��;3��+��:oמ3�9���앁g��?����~���{����e��俽����λY��ʽ�߻�	�������U�c��+����(��\N��{�����{{�����rJ,��K/�%���  %( "�< �
ia���S|� A�#�
�)X
N"(��-���q! 	�ɬ ���A�H j0`$�C x ʹ  0 RA0(��`#Q`�$���	b�B��(-����[�����|�=	k�)Jw���S�)�c��7�Ϧ�{�>�-�:��k�m�W^
�w�N�I?��u�U�ն�m�%�>��6�s
Kf'�G֯�U�T����ϖ�����?b�n�w;X���BЄ(������� <�A` B@E&m��
�`�P�  � �H�KR�V|�$Q�A ,*:_,�  ��!P��"$ P�h�R-���H#0( �pP�"<��(	�@P�U�d� 	�
�0�JpIp�B`< A�pa�R
�L�2&��!@��$; ��� � ��	(�B@`��d
�I$"� �
��CHpI��11�@�[ !8*�Łi9�P@�(�ط·�ݗL��/N���s�糧��	^��MYmʻn�s����}߆z򧡅�������qf���yR�6?���2�jh���ў~y�Y���<�}��_�ƝK��qw���]�~��;����,�O��� R  �H0���0�c�� ���"Ł1@ �#@�حDD,B
$EC���`�@ � ���� q���H�0U�D" @�	�* �&	�y#R�B�J��#�| �"iT�0%[��iE��}�՟�a����Sq��j���K��a��qq�՟�����������/�3���r���:k��!Z����;W�/����%�e�}~����Ҿ����{������w�=R����\��>�����L_�������/��3r��l��=7���Q��2W������b�}�~u�����/�������Y�g����'���.7��m]ke�;��m��V���C�go�Ŕ�sϿ�y���mƇe�է����j��_?���/�_w�W��/ ��bX
�)�p �2��� v!I ��HR��� ��b����( � �.8"��  nf���A�	i���@% ���!$e,��g5)]�c Y����� :A� M�T	O�
B �Q�@ET�#�~�}w��8a��uq��/�����g�/_;=�q<����֟���GǍ��w��t����)/�=�~��ά+2L�a7O'�3�K�N7W����/�{���q�Ӳ��h�uI����_��sO�䛭�ѿ��x$�B#h��3�J0���.�dZ� 	�
�.�P-^�Ġ1��
Ш�
GۅC�TR�#`�+�`@��8��@�� 0M�f6�P Щ KJ�q�"Ix�!6-H�!H �b1�A'��,��m�v�����-�̃�A���D��cS2AY&K cQ��P�	�A�
Q� BB  ���� �
����D@��:c� ����  ���R"�7H¾*  T+/ $�swO^_�iS��H�N����?4�{��?���M�՝���Z�r��w���#�1�[x�g��+n�������q�������I��65��k�w�۶�4#���{0�G��ύ_L�L����sr�3��+ �q�ڠ�$9�=w�H'�(>G�9\�� ���*��@���*���!7L@�H�C��$B��8b�!��f-�Y$��_�SP��}�$ ��F@b��BP�$ $����\W�wэ�׽g!���2����~�_@���Vv�u;-|:�q��dО/�ky����|[��s'�u+���o���B"v�i�����D�\w}k���'~k~vlO�+S�sF9O���+��G���EԜ�7z?���?V��yn�\��%����'a����]v��D������8��v�Z�g�����fO�����h����T���^߫ڲGRU��iԭt������<T?�����]�=��|��z���e�����>n�d`qfhB��� �y ����5�%�9�@!�l�. `B�!�	y� �(	���QBҁ��/� `��">E`��#�T�aP�)H��(�
�8�ꋤ@5��ȍ	��dAM�);{��D2���v���)���$ԍ\�5�`HǾϷ�d�������֏l�Dw�7|?��a%���=��po��u���:�ҜA��O��j�_ɾl>����k��\���WU����g���{��1�����e_y�������D � �: 4BP
D Q �'�����"Ĩ�". ���� Pr�d��f ���(AP� �3�Cb 0{aLc -"a�8�9 A*ъ�RPa=�8�	�r � !�
$��a KrH a�)����V@%&�"0K����2ād\,�$���	�EpH�2�0@*�!� d<Xd�� J0��b� �A�" ��"��А � ���EJ ���ʯݷ���w���{�ܻ��E���L/��߼�o8����i���&�웩'��L;S��?�v�ց@����U���n:x��[�͏/�g���Qo�����w7���dS����_N��3��t���rg���׳O���Ok6H3 ��""E(��É��4�{9ƅ%�3r(4HJ� 1�������� 
$_hZ��C��0zc�"Q1LNHLLR�'H���u8[X�C �����$)��נh��;߿-G��f��������ݟ��ׯ�}���'�?4i�W�~���h�~7>u��x�ˇ6������\�����j�����/���w�����ߟ_�������Ox����e��n����-^������W�g�潖�[��n��N�}o�㷰�����ߤݹ�~oc�;��z��������˯&�v��.�}ګU����__���N6�}��1�c�^g|�������u�+������V�kx'����������~so��W=�=ݯ� �*��QY t���R�|�����!*	k-�#$�0� �D�� 6�@^Gi
������)Kb*P���Z#�щ%W 0dd&(�a��C ͥ& �H@��dz9&��Xe��J�O���>�y�����ׯg����E����/��O�k��V6��矿���d_�/_������~;����s����������θ+�ﷳ�O��������������N���-��8��yC�ſ�Fl���~`�"`A4�`Ѩ�T0��G��0,0* ?Cge���r��-��a �[0��H&r��LdA(�43�) M�0L���hx�0�T�<���l�t4���F�c �'���A0�)�C���_ �&,2F.��B+��iИ��'p�H�%��.^ !.F4l�J6-<��t	4@�
	��(~E ��
�`�`�2S�.�
��v�_��(�h0��,!V���� ��cm��]���/�/g����}��P��ĩ����O������g���������~��ߟ�Ͻ��KM��y�K�e~[��������O����������{����ߥ��]���fiҰ�6�z��H )�Q' l�1��bB��T�YQ ɿF��P=a��EWlX���#�@`�@�DQ���? (�P����DF"���!%$A(!��vf-B	��rpa��EJ��l_�9���D��A5����-���n���ov��7�eO���W��+=����m�����k?��#�[���T�������;;���O:`���e�%=3b�}�=����;�o��������hϗ�,Gж�{���~��>�Ս����ܭ�����~�9�9���O����g����7&{��ֶ}����?�d��ŏq���v��ߊ�wb������;/?�{��;B�M��}�����k���o�r�[����fy/C�����ߵ��6R����m�w���s�R��ՈH��ph� �� ���dZ��<�d�
�8�t��` �P+�.Ip�U�`��d}V��@�(,)$TPThN� @�0@.ڄp�`3/X	�
�5�@#�D�N�D�?Wg��}��w���I����������߿F����w�����-��^������\����y�8�����ss���go������%.�75{�ח�.;��~�����/�\���'{���ˎz�S�����j#|�B`$�p���1`dm�	B����rX�`HQc`.��̀AF`x�L0e��aKDtx%�;(B! �@_|P'�1ܞ�K��(u#aBb0^�TOB�,	i�4K�e��D8�\B���dP� %C) )��� ��#qgbP���u��\ �48�3r"�3ZJn
b!����"���錊K #4�:�Qa��><�"�+Y�SB
�H�$�$3^�B ��U�r�b0�����>e����2�I��'�����o���r��wZ����+�9s�{��g���.[w7�����y=g��/�+���[��m���o���{��g��w���佶���߳��?|�{�~�׼r~W{g�������\����	2�IT�RO��o���D:`�"İ!O@D�ĩ���1 ���0(%��e ��,��u"�RAC���`F2��a7� L$ |	5 ��v�5<E�r)
 $
S�pɓj��������{�u��o���_G���+{o�V������z=��U�������=���7���_������w2��^_?~���rr}3N��k�{ƭ��W�����_�?ӭ��������w����ϼ�s��g��Z��y����d�����ϧ�_�]���]������Ư����C[{���}�M�Շ���:�{~�?�#_����ݙN�q��'������y���m�wz�������y����������wm�g�s���e�����Mۦ���u� 5�0�C@(n"���M�8� 0ig���DAiP�4= !��$&8�P�iBA'4@��ɁP8&�&څ.rW�(8 b��$	�ܓ)�S���5Zc�AaQ��)$�Z,Иtj9�_;��<��[׻�]���Q��v���}�����O��<���s�׮��~������f>����������w�������~�u�۹����ϻ�ͽ3}���<-�]����.�f��G'��W���?����7�t3 �@�@qF)���dA��82.�� ns�\SP"�0��T )�
AE'�!�>¡�@���
W�� 9�|E`�E�ۀ���0Ĉ0:J_���c"���\cp�A:��@y��LJ�b ĂU��΀7%z�E" ��Pa1w	�����"��"�5`&�E �Gq�Y *��M t��
P� �I0�Y�Tf�Lt�A!�I> 96E�� �c�)H#�q�ɋp��y��\+�����ߏz����|+�{����w۩�J���3�_����}mٹ�z�b����{>����պ���ӋU��8K�\����Yo��{���W�_iC�o��w�[��>�k���?{�c��;�?BD!D
��G
db�TTl� J��62��9@�����p"C0�#
q1�ȯ�� ����⼦��
ATa1�!��Jk��	qe��CQ#:�vH9;��E^��"�R��S����{��w��m�W������������������)�����=��;������/p�cw����ξ��ݳ^���w��_Z��a|37�w�������������ۏ���7�{�hg�4�������t~_kn������s�}�oZ������������%��mu����?���d������f���xk�������ɻ�`�-} �x���co_^�i�w���o#�{诫��?�����q{�lۻ���-�5����1MD�7T�hB�	A 1���	0R6% ��R����:(����@��	D-��(8fA T��2b"�f 1
|�\�� ��Z>��/�$�0�4�
�"NS��4X4���������_f���_�~�}���S�wP��>���������9���Y��G�6��-��i�޻���|�qC���{��m#�~��|������]a=�����������O.�O[v����O��[�R]�}�򐳔��  ����0(R#�%�P��, R��b��e�~4�DJG����̀<d�M��
�VBn0��'A9H�R��B��DP����HV��1 N��[X�v�� � �$@�˽"&!%��P�À	d�"��k�BH	 x�X���!�Fj/Q @��!jH� V@H��� �21@=0���@��Q��O���L���D��@��}��EQ%U%X 3K���p��C�v)B�*V�Jɳj}����~����~x�Ӿ������̿�ʾ�4�������}���L��ƶ.5�_}���_��v��d��+��?��|��������Y�������zvm�.��f���\o�g���9�@��������z��_Left'), 10),
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
        shortcut = shortcut.replace('CMD', '⌘').replace('SHIFT', '⇧');
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
          contents�#VV�0U(���p"�0W�&PI`&p�p���"��DŷJ�1	�H�&�QI�f�b a��X�B$�cQ 
� �
�
�P9 *� ��̓� ">BA�E����|��݋��'���g�M��|�G:-}��J�������7���T��7:�~�w�s��=������?�_u?�5gv�EO�C��W�����/_�V��ZgpDNF��#��ȣ\��}�|������{�{_�_�������߯��U�/9�j����2�=���]͖�c��������z,s��ߢ�1���w��7��s����� k��񷛿����N~��q���������/�Į:�����.�1�q�������.ױ^��?&H�()�p	�R %Hq�����-����4�� 3:�Da�-��)F" ��A ����H%�b� ���d,,��2Dy0��@8QA�=@�0 �1AX��Ü��[	�`�X����T��?���d��g�����p�G�k珼��%�����v��U����щ����r5�o-x����U[ۣ���uۧ�N�ٝ&|�K���Ϸ?�q���d�ƽuy�����_��S����L=�i�B@�GA�ralj�11�p��C&CB GTB K@�Ȉ8�UH$Y���@E��!.�"HC��F��H�\�
GS#@��$�Һ��Z & $A   !Q4P0� ��q�K����H0E L�"�����H:@� � 1{���D�t�B	����0P?��aFhQ% ��y���/ �@,y�DqPIR� 2 (3R�  �� ����̥�I�L0L�!!d ��@��(-��
7���u���F�:���fO�O7�����X��_��_�ލ��3vFCV��0��q;�]�[������H����P�o�m��~�u�.4�z'���ʆ��g˹����}jf�7��ͷ���XM�@g: 2x(��A � R�@
j�ٓ��4 ���0�l�� O��i(D2��(�Qj"0q�
�B���Hd@D�0 IN�8Iv"p  d�8�2%@*q )!�E&�?m_�|��/o�������}�P�a��J�P���~[�^������Uw�;�����\�f_�_ <�����y�!]���/���E�I��5�9���Xt;�^���������W=���}������>�ͷ�r��L���E7n�����_Q���[y�A>O������[�ƽS�߆�>������
��%п��gݱg���k7��[��٪�n�^������ߑ���"����#Y����W�c�s�y�^]{�a-��wGbf!��:!e�M�j���8n�,�%Ih�h��ȡ�� &�
F$�4K�[W	��ٱ�A 4�V8�V"*�ނD� 2�yB �CA(� �(��B�!������E2�H�~�Kser��������K/kThi��W�w6~��W�z����˲g��5��U��V�nK�{��[��6�^{^���]������4@�~�Q�N��])��+Kj��{��ב�u����G���t�tʚMjy"4�oYq �!
�2	DD*���t@Q�)V��h����`Q�Q	N8 d�(hQG��a n$�(�d0\�`�$R* U*a h �ȄP �(%�]A ´
1�`e�H�$���p�2���HHy��� JI b��vp" �(' A �R�z*��D%��	D@@�Dr?dp%���Pt�Ef�ILmʈ1BP���@�F"P�=@D|�@2(� �"�A�$" 	-!�aUE󡀀Xm���?k�����N����A�[?&=x�d�?jO�[���:����m��"��ߚC4<N���u�}�����7n=���ާ�~;O�{r_ײ�[���'>G*��)k�m���mo����*���z��� ��Y������Lj��/�(bD�x���DH� 4{"S�=��"!��(A�i ��P
�   �9	�XP,%N��T � �z����0 
��hH�30@`� �F�&�!J�I�!#㹓���zg���m�o�W�*����Ԯ���h&��wx�������ǲ��g���w2��#睹�eiߓ��W���r��q���fԚ{<㶯�����⧿H��v�o���Ƌ�w��[r����^�ͯ���wOtϽP�%�����9V��V���o���7Ɯ������Oo���ڮ��s�>�o�U~��?�i~��Zlx<�x7�#}ý��q�|��������u�q��ؓfm����r����~��r��Ϧ�?���������  �A��� �UBFA-Fx@*�E!�B%́�%I�����'�p�`�����"�D�I$����Y� H 0:$�:��Rl�L  ,@�#�S ��H�P� ��@�ԡ��B2���s�?}�3G�SO���{s߻�}�����o�ٯǗ䋵>������$���?�y��s�y[��ׯ?������1�"}6����yq�VM�ߌz�������§�~�Fw7oΓ^ľ��[wr�?���/�v���,�$Ihh�:�@�Z&�##d� `bPD�P% �Q0q��a�J!b�`
@:(��M0$d" �"�ǐU���1���ƀh H2�h
 8 %�@  �@�D�"�M���  tN�b�|�YE@PI�[ɀL�4 ���"�a���M ��aH�� D�"p� �� @�àAb��p	�R �@ H0�$�� A
m�p��P#M<����i�����6���>���������3���~��`���=�͚|�n�v���};�����չ��7[���[�㟲�v�~~�6N>��}˿��e*���&���������Ka�����w3�{�{{��������V������0�$�1���� �F#�A� ��P 5�46� `� "��5	� AAh���=J+(Y
D
,E0��"
)�&lp.f�p  �q���>�D��� d MP ��M�E� �ar������/����?����g?=��C�}-����[m�3�kߝ�7���W�
t��|��ޝg:�l훷�v��G9K����Ҋ�_ۓ@v&����:��sw�z?4�I�n{�컍{�����:_�g���T�C�ym>+���w�-��_{_�W���⦯��Ϙno����Ѳ���g��7_�]�[����o~F����z����Z����d�7����ڧ���?�����Z����}�s�E�T�p�bO!���u������rd�SCo�R�0@!P��] ,"&�@/�����:�̌m(�@"���)�\CVA�@a2r� 
 JR�/6B8�hrP�0J,M��Y��1i�Hh�0�fP`G�c��g�H`��lAPق�G&_��+;�;��<�i^�� <�j5{��^9�:�s��U|�ۃ%'�w��{��=�Կ��?,������~����������������W�z��%���=�������:���u���Z��&���GU���uX�X�����CD��6������� ��,HG
��"�L� ����� �$�`�T8A�*`9�@��Ƅ�� C� dPA�V�)D H,$�QE~� &J8 �F�L �`�P�I@4�S)z 0"" 0
,&M��M"0�Dc�(��m b9*  2B���$a�YJ  P���P��@,@�� �(�)�'w$�UL0��@ X�_�ӟ/�uvm����1���{5����������[��b�w:��\k�?���l�xow��߽���?��Q3�j���؟G�ݬÏ\��1����O�}�o3>�߷�E����T�ο�n謹���<r��"�����h.A���D	� 
qjzH(���(�����u�]��� `��	H�	��* ����bh�âDf�1q��`� ��0��Sʐ�n$�\ Nh�$W���	 & 1���w�_��n?yo7n�<��py�r�������~�U����;�������w5�䫆o5�7�1�-�����}��_�}�%����GoO�7N߮yG���ͷ�^}�/߫��c]�v]�tY��g�,[�|�T��$�}�����|u��#s�M]�����z�����ߗO��������N�w���p��5���t�����|����W����Qfߧ��T���+��a��u=��~?��<��������/�Ӽ�3?�5��l���=J�2 &+�<��f���		a0@R�8���	�#�%H��pa��M�� ����� � Ob��AK"�+�	� )P%U�P��(  ,��Z� ������ `dX*\�(t�𧮴�G�����R�������;�%.{�㧺{��o�N��@>����V~حu�����n����Zt���w}�����Wo���w�_������?������G���v����T����o;-�w��u�q����,5����TR"HV`�@(;�H Np$U
L`�\�!�-!�P�\ˁX���(���1ы��m�@!f�pQ!B@A� A�bh���CR`@l
D����
r ԄTf]1�@�bYBD��mc��@�,?�"0$T* @��@(`�$�'6z$ *�@&�%p+�6 $CI<�q�. �@[�D��#� �P ��!H0�&I�0.@R��A@�D)a�a @UjƦ ��b����7��{St̙m:���|J�o�՞�3�<Y�J��7��/���?������uZ57��2����g�s���;�9��|����{9����ھ�Wi��a���E�>�l)������G�qf�r�~A�6�+�� 2h8ZJH�!!L+��0��PBbx�VP�A�� LLM�U�$\
����LF`	y^LP���EF2�0&~�8�� $�4HteG0� ȔK@H���m��8�R w��N�y��G֎���8����f)��vs��=����M�T��x}����q�77=�wqD�#��;_\u��u��ok�n�G��?���������ù�������>����G��~ڱ�}�<���}6��Ѧ��=ֺ%֩��������i�w
��[_w��U��{֯�}�_V�"�^�ulޯ�?gO��\�W��3�/?���s�?jW'䮣?��9��n=7�m���S}>/��{z�~eO�.��_���_�~w��h����A ��� �1
����"TT 4�GA!P��P�p �"���`����i�@
 � � D!� ���A;!�ȕe3 W1��!Rbd�8	AdĂ"g	�9 j �$(��XR:�������YT}>vSy�����=m]�K�:��>�3돿���
���}�ߛ�?v�j����d�yPκ��Y�u�{\��)T��~���z�����~+�'O�yk�W�h��ͭw�����Z��u%���S8�h�Fb`��@8ԅ��'
U�!tP�� �(� ��@� b4��$)Q�$j��.by\P�yE� � � )!� D�#ɨ@X�L��#2���� ��(d���ƴ� Ht"  P!@2d��
�  4P@
Ed��R�@�D �DVʁp@�fF�^7� �ґO�U�\( [BP�A_��d�3��:�e9�� `{�@���3�I��	C���P2��c�%�����˴�^�h���ˆ�ug��EO��`����w��Κ>ԧ��~����,å���� ���/��#�e}���rV���]y����uؽ��'�	+-_y_�jo��[ۨ�����[���U_sכ�x^} ,Rc@B�-[�b��V�  ��, �A��B�
�A ��Q&��2@`�C MA���*NY>͕"�EQI c����a2�RFG@���@|�X�
A6�t #� ���D�������i���vYj��8�����8�J?�����y����o�oܿm�G�����o�#?��������?�Mg�]+��+U�N]��������^}^O_U.�s�nr��?z���ħ�Ϥ;�ߚ���}���wG��S���J��)���-{_����n�����w�$z/���V~������}��>�u���k	�Q��*;?��ﲾ�=w�^�5y�;��������ER]���i����j�3�}i?��Wt�S{
ZQ �DJeM@(� |���k�p
U�A!���b�Ш	�� ��U�D����0p��$D(Xy�8a�t"B@
  qa �B)0�9�� H�p��$@@� ����x6:�-BL�9ʁ��S�/��3�|���lYP�m���y���R�r>�'?w!c���/�2鼻�S�?����矛�e=�t��{�U�����}��_���_M��u��wI�[_~�{��������#9d}����k6��3d!K@00)��6��AM0^ ��Fp U@��g��!	�$�e@�#@z���-pbT  H��=�p. (�! a	j( N�	  G  ����@�d-:Z�ׁ
�~� �J0$�C؜@C	a8�`!�* `A ƅ ����dDb4H����@0Y���G��@
� Y���� B��Y���P�`�"E$` �P��!�0V�A�ې ���g��j�R��k��k�we>��f��/O:~���{�>������������2��6>Z�ۿ^r��z��f���_?﷤�����M������gz��7���+ź�%o㍋��~gm׎f��@������P��h�0� Ƹ �4�	!���cR���r�� ` �@�
zf��� c��\IH�4P���Q�8,( ���b��D
r� ��� 1�#� �_;* Q��@a@��v�_D(�ߝ�������������:o._O�y�������ş���O��w�e���Ω����~e�,M�;�~�]�﵏��V���Wi��_u�v�m}�?WW�M:f��]w�o��W�W�u���s�BE��y�j�LSj�Ϙ懿�ʝ��P{�M/o�˕�{�o��?_�pguw�[c<e���{w��?۽��s��&����Vؙ���}�w����w�K��;o����z{������"����bW�w�e�c?�L������'��{��.HhB B��'	 B@�@PAd���� \�H�2�> 5x*�� �*0�!p� �% �#$  �,r4��XgbP�A �� Y� 3�Z`j�`���1��� �"��H&�j�^��g˥1��f�_�w~���K*������͓���O����_�엿y����M��߶�ت�c-uw?o����O���H�D���Ϸ�u�1�鷚�Aǭm�ü��$J�o�?�o��w[����1��Oz�N�	!���iF#Z�%��$  �:�5FL �ýR�10ET+�)7q���"�0&Z��W�,"����e��"���D@�p�0�a�4������B�&CA��Ȁc�1H�+bT�Q	��)I 
�����.��Ib�50P��h IL���A@��XH�"2d}� @$a�������N/�
`L�� �*1&�SAQs��"����!x � ��ӝ/��Ӯ��|.��/����������~�U�{�����W~�����/�ָ���?e���%��^n݌yw��e���{o������ۊG`~Ǿ���~̷�Q�^��?�*�����'���>��Z���qޡ���aragraph.paragraph,
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

      `yF������`��&��Hm�����$Pddd��,A,�`<�m#h�qݭ��djA�	*�  A�ұ s|��jͣ.�s���B��� t@�l[ ��YͰ�xd�^B����o_������uN��w���?c&�9�o[����Ϲr�����r�G׮�����)(��;=k�{e��9|���ݟ������Y|���}��f�}�y��s�_�u�Ve�{{Y��������3�����u����A��������i���������묕�{/�v|����bq~�g�������=����&�_�������%���>�Ww�}�?�o���Z�l�N��ۧ��~��v���]������w��ﺿ|o�����ӽ����@%	F7�W�	 � ��A0F������$�QEa!���=���
�%�@�' 	@��@c j0��
;LT �Ζ;�JP��`R����5�E$A�(BA��� ���KA�A 0�-���͋���Q�����M	~���ݵ�2c}T��87W��涳��=�K��.�_��u�ov6�����e�^�6�����v�w�`��57�;����f��޽��v��Z�/��ގ����\Nҷ��D������0`�H���D+�,@  �t�����!�&$+4�5")k�����"�I�X"LA�@!�y�-�Y��(��'
RSO� �1�aAG�"�E���HM�.�Q0'D���P�ђ ��* FЭ��7T ^���a$"�?&6B�R�k�"L�tP5H���J�M1ED �FۙM�X9�"�PA$ mH 
�>�7)�V1>�@X	�RFP�E"Z�#���`⻳o��^o������v�n�M����g����j����wp�3����i�j��{�����߳_��z�_�������_����/�Coѽ6�N�w��������w����d���ݩ��un#��׫�����E�q"  ���,\	�P�0�T�l � ���^�K {JK$�DBA��@�������\�� bJp12�}��I�@ lD <PT8��H��$<T ��/$�R�n@7�`r8"o.���7)������������c�����ͼy���r�-f75[�7��������|�׎�o�����2���?�SO���s���j�%��=�W��s��+\h�����&����L?���o�_���ް�lݷn<�;�ǻ��_/��6������ڻ�۷;�������/����o��g����t�z���}�W������_ƶ�����z��|w������M�v������^�ovݎ#t����o{Z�k������O���HT� '� Е��+,ĉq��@d���l+N�& c� �q!p@��(���L1	�T| ��E��πQ�	�	�@�F11
�8��)���� ����U��A�tA	2�%�3c��w�{�/�+_���w�߯7��p������c�������g��ﯱ>��v�Z�W�s�WO�~���^�[��:l}V�Nc��������>��[��7������ay���ʛ\׭7�W~��slm䄄.�@�Z�@��(H�\e�փ "=�D���)�!P�$5 & 7����pc)- b���  �xP4� �B �b"x�xM�I  �0BTJ(�'��p52P#��B(ű�^ A!�����#�$�	�D x�&N ��M��h�TR)�q��A6 ˃	 M@�I˵]A��FE3@�����R���O^���њ|��!c �V�qZBZ���H���ZǠz*P�%��o�w����{�>�u�Ҿm���w��x���7y��G����{�,�{i���������=������g����6���ۭ޽�q_V�=�;�c�ſͭ������pI��Y��~�����P�?M�	�U��H "J�؀ �Y �b� @P	 �\�0��g��0��e�`.*��aaP��r�ja$&�(`���Q(Qx"e��\�U0< �����"�F^�N��@����A �� 
����V���'���}��n���W���}]�������{�/w�-���������S���yޏ>}�����˟��˾L��V����^��9cvn���v�������,_��0쳾�~㿶�S����^���J︻�.̺}1�o�w�}V��z�{kg��Oyyϧ����_���S7��}��g�joL�����m�<��������`����=Y�߼n�G����rg8w�������kW�z�����/�������]���I�u��[��sm),?������m�u� M��wנ'�A�x�Ԉ�0e�%W�H���BRef�BP��\��=J�h��6����A0qC�W*�FUi�.!� ��:>�)�� �@���I��FbD!݄QR��b��tCrF�����o���=��}Wm��I�oT|���{n�q�������<~�}MM��q~�w���\���KN�����=�߿�����y;o]�~�p�}����=��{�q����s{���r�����{����������� P9��B$C�D��F( �H1�����/E��PH`PC��ȿE�B*$G0� ��q� @�4��!PhR�0�YB P(8��B5�"� �����2�`@;����efOnd���`�̖,��C���4 ��,�( � h(f1h��1@<03��@ႂ�2 N x�%kX��k�İ�w6�T�#f�*��X�"�� Ȣ
T��ƌ!���L/GX�0/L��~��9���˿{����-{��}^��4�w�W|��Ɨ�JW��թ�O�������k�7'?�ݿ/��wl���s�y�����Qߚ�MY���_�Z��N��?����._^�;z�}>��������a�E!��Q�q����&*���A�4�4Eyӄ�hp���J�A�!L� =8y�ej�.A�H ��b��,Il�0c$�81`s��pf�%萃-J� �.� �T�0�F0��?��=������,����þ����z���ou����O���{�����>�=>��w����6���_{����w��v����w���������u[�7���^����m���it=ݾ�߼�Q����w�d�{�O�n���k���~{���_{��o~����=:<���wݪ_�y������s���z=�Vm��������s�k�7���[��Y���~����|־�]���O7��n����z��<�O_k�������y��mD��0\ 0�tH] TAbRUH� I�HB��(�6r���4�ʄ�ǅtX������P�b� p<�-��%�h�	���8&VY�Ip'�h`T \Jt��A!
�"�(��	�|�nz�h�g=��3���x���b����E��_�����i�����zk[=�������*�YR7�e��2��nqu��wy�޽/����_�/~�5�����������_������s��J�%$,<@�p"[87Pa�� A�Q\E�� �F$�H$W���Ǒ!��0���@ b2�� �kN�dhF`�q���0(/��������B$.��D5��A &_��B�4T�A�	@ �u�`{b *#8UH�E��,1[�('@ �uSI
(ɤ�@/@d�MC���5�S��"E� NGX��%0��hANG� �A�� �A�E@�	:�� |	�@� � RS����ȫ��Z������~7o=���Ǜ���~�o�G���������������g񮚿��|��J������6W����Yk7g�}u�g���s�o<��_�3��w}���T-��n��:�5���T��|�i����}5ﾭ��` ��$� � ��j ﾭ�r~��������   h ﾭ�4���   ��  
�a�d ﾭ����� ��t�7�  c ﾭސ���� ���  b ﾭ޳�� ���  ` ﾭ����� Pf ���,   _ ﾭ����� P+��   �?�^ ﾭ�����D�"x�    0n�  
uY�L  [ ﾭ�?[�[��  ���   9��L  Y ﾭ�p���h� �$ �	   V��L  V ﾭ�\����� Я������   ���L  T ﾭރ�	�����#  
L  R ﾭ����Q��8� �~�8��  P ﾭ�o����� �  T��   r>�L � O ﾭ���~�Z
�f>� P �j�   L  N ﾭ޷
�Ng� �  ��L  H ﾭ��	���� @vN�����  L  F ﾭ��z�t�� 0Ǣ   �!�E ﾭ��J�I��   L��  
L  C ﾭ�.y�I5
� � ��      B ﾭ�0	��X� �  d��L  @ ﾭ�������̴��� p  ̴? ﾭ�$��+9� p�������   h�
�> ﾭޞ���� � �}�  
�m�A ﾭ�T@����\W� � w  L  D ﾭ�?���  �������   G ﾭޑ ��� P|������   I ﾭ�J	��Q��� � ��  :���J ﾭ������� ����7  
K ﾭ�9��{>� 0�b�����   L ﾭޘ��*�UT� �� �j�  
�  M ﾭ�I���O� �/��   z� �L  Q ﾭ�5��N[� � �   ��	�   S ﾭ������ ���,��  ��U ﾭ�cY���� 0 �  
L  W ﾭ���#�����      X ﾭ�f���B� P�     Z ﾭ�C���p�   0��   � 	�  \ ﾭ�Z	�����\�  ���7�  ] ﾭގ�� ��  
�  a ﾭވA��]�   \s����e ﾭ�4�	��R� @ ���      f ﾭ�'�"�� �  ��   g ﾭ��i�6g� �ˁ����   i ﾭ�Wp��� � T��  :L  k ﾭޯ�����  hO�  l ﾭ�O� ��� � ���  
  q ﾭ�7� �lW� �2 �#  ;���s ﾭ���$!
� @
 ��  
w ﾭ�l��I��"�� � ����� � x ﾭ����k�� @d�����   ��L  | ﾭ�MU��M� `xE�_X	�} ﾭް��@����gK�K��n�K�^@��t�˴Ĵtڼk��CK����7����[���d��K�Q����� ���Q�KDdZK�	��k	�[~�F�&Ǵ��	  L1� 0�8�?8L�L-� 2g	4@$�;9t2��3� �  �	 SI  b  l  �"��"��"��"��"�Ӡ ��"��"�ܢ"��"��*��"��"�Ү.�Ӡ �� ��"�� �ޢ"��1��"�� �� ���"�� ���"��"��"��2�ڲ1�֒2��2��"��"��"��2��"�� �Ң"��"�� �ڢ"��2��"��2�� �� ��� �֠ �ڢ"�ע"��"�Ҡ �ޢ"�� ��0���"�ܢ"��"��"��2��"�� ��"������\��&� �$1   ���L  � ﾭީ:
���� �6 ��   L  � ﾭކ���0�4��&� � � l�  
L  � ﾭ�����0�  �   L  � ﾭ�D���#� � د�  
� ﾭ�P~��	� �D΁����   L  � ﾭ�3����� ��t�7  
�  � ﾭ�X���   � ﾭ��� ����  a��7  
� ﾭ������ � T1�   ��   � ﾭ���X����X����X�� p	 ��  ;L  � ﾭ�z�l� �  �7   L � � ﾭ� ����Q
�  �  
-��� ﾭ��u�o&� � P�  ; � ﾭޞ.���� @�7�����   L  � ﾭ�2 �  �7�   L  � ﾭ��[��z� � ���   T��   � ﾭ�f����� ��R�   � ﾭ�?,�d�� � h �  
��L  � ﾭހ2������� P"7L���x��  � ﾭ�z��j�j�� @"7  
� ﾭ�-��U� � �Ǳ�����   g��L  � ﾭ�2�� j� Pc������   � ﾭ���2���
� 0Q��7  
j���  � ﾭ�q��h� �P�����   � ﾭ�W�������_�� ` \��  
��L  � ﾭ�T��MS� p d1�   y��L  � ﾭ�΅�ȅ�  �{�   L � � ﾭޯ� ��������� �˪   D�7~ ﾭ�ƛ������ p˪ ﾭ�٨��{��� p6�  � ﾭ�p���  �� ﾭ޺����t� �|�7   � ﾭ�^�������� `  ���  
���L  � ﾭ������ p
  ��   �d�L � � ﾭ�i��͸� �  ��Y��L  � ﾭ�M��>� ``�
  � ﾭ����FT� � �f� ��� ﾭ�I+�q�� �aJL��  ��,   � ﾭ�>]��8� � ���     � ﾭ����j�  �~�����   � ﾭ�������  �t�7  
�  � ﾭ������� 0��  � ﾭ����������� Ћ �      � ﾭބ��]y� � (��L � � ﾭ����!� �ä�   �?�L  � ﾭޡ1��s� ���   /��� ﾭ�f[�:�� ����[�  � ﾭ�Uz���� ЍR�����   � ﾭޭ:� �� �s�D�7  
� ﾭތj��  d�   u��L   � ﾭ޴f�t��M�"��  �X  
� ﾭ�&��S�� P8��   �j�� ﾭ����0�  C  �7   L � � ﾭ���� 0�7�   L  � ﾭވx�i�� `�8�� ﾭ�5���
�   � ﾭ�yM�rb� ` ��     � ﾭ����UY� � H$   L � � ﾭ��w� ��t�7  
�  � ﾭފ��*�>��'�� ���j��  � ﾭ�G��ֽ� �) HF�   L � .body) : $editor;

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
        if (event.keyCo������������������������������������������������������������������������������nst�IUV}                                                                                                                                    :?@�lnn�����������������t���l���m���l���n���m���o���n���n���p���o���q���p���p���q���q���p���s���s���q���t���s���u���t���t���u���u���t���v���u���v���w���v���x���x���x���y���y���y���z���y���|���{���{���������������������������������������������������������������������������������������������������������������������������������������������������������������������������SZ[�3;;7                                                                                                                                    $**FKOP���������;t��]��l����������������������������������������������������������������������������� ��� ������!��� ���"���!���#���#���$���$���#���%���%���&���&���'���'���)���(���(���)���)���+���*���,���+���-���,���.���-���/���.���0���/���1���0���2���1���3���2���2���4���3���5���4���6���5���7���6���8���7���9���8���9���9���L���M���A���b�������`de�8?Ap                                                                                                                                    079n[_`�dqy�J�� T�� ]��s����������������� ��� ������!���!���"���"���"���#���#���$���$���$���%���%���&���&���(���'���'���(���(���*���)���+���*���,���+���+���,���,���.���-���/���.���0���/���1���0���2���1���1���3���2���4���3���5���4���6���5���7���6���8���7���9���8���:���9���;���:���<���;���=���<���>���=���?���>���@���?���A���@���A���C���B���A���P���T���;���u��i��gos�AJN�                                                                                                                                BNR�NW\�7d� K��Z�� _��w��!��������������� ��� ���"���!���!���"���"���$���#���#���$���$���&���%���%���&���&���'���'���)���(���(���)���)���*���*���+���+���-���,���.���-���-���.���.���/���/���0���0���1���1���3���2���4���3���5���4���6���5���7���6���8���7���9���8���:���9���;���:���<���;���=���<���>���=���?���>���@���?���A���@���B���A���B���B���A���O���W���@���{�� T��-[{�P_f�                                                                                                                            2<A�,D� <j�O��\�� a��{�� ������������!��� ��� ���!���!���#���"���"���#���#���%���$���$���%���%���'���&���&���'���'���(���(���*���)���+���*���*���+���+���,���,���-���-���/���.���0���/���/���0���0���1���1���2���2���3���3���4���4���5���5���6���6���7���7���8���8���9���9���:���:���;���;���<���<���=���=���>���>���?���?���@���@���A���C���B���D���A���M���X���D������ Y��Ez�CT`�'9K                                                                                                                            '/6�%B�?p�R��]�� a����!��� ��������� ��� ��� ���!���!���"���"���"���#���#���$���$���$���%���%���&���&���(���'���'���(���(���)���)���*���*���,���+���+���,���,���-���-���.���.���/���/���1���0���2���1���3���2���4���3���5���4���6���5���7���6���8���7���9���8���:���9���;���:���<���;���=���<���>���=���?���>���@���?���A���@���B���A���B���B���C���A���K���Y���F��� ��� [��F{�,G[� ,9                                                                                                                            	(� (F�Ct�T��]�� d�����!������������ ��� ���"���!���!���"���"���$���#���#���$���$���&���%���%���&���&���'���'���)���(���*���)���)���*���*���+���+���-���,���.���-���-���.���.���/���/���0���0���1���1���2���2���3���3���4���4���5���5���6���6���7���7���8���8���9���9���:���:���;���;���<���<���=���=���>���>���?���?���@���@���A���A���B���D���C���C���K���Z���J���#���_�� H��4Y�-6                                                                                                                             &� *L�Ex�T�� ^��f����� ���������!��� ��� ���!���!���#���"���"���#���#���%���$���$���%���%���'���&���&���'���'���(���(���)���)���+���*���*���+���+���,���,���-���-���/���.���0���/���1���0���2���1���1���2���2���3���3���4���4���5���5���6���6���7���7���8���8���9���9���:���:���;���=���<�ditor.getSelectedText');
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
        '<a href="http://summernote.org/" target="_blank">Summernote 0.8.8</a> · ',
        '<a href="https://github.com/summernote/summernote" target="_blank">Project</a> · ',
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
    ui: ui\A�
r�K�D�� .�B��� ���!�� T��f�o�(�h -E�& Ia �����&`1h� DE�Z	f�� "'�f�Е� �gFTa�j��$<� x�k' �a�
N�I`��MퟟP?��dm�����������һ�g����xo�Ws߷�$�����/���wO|������4o��|uv��������_��7�������er���������o��-|�н��Y��m<��K���s�?�[���G��~�}~�k���{={�u��=��������w�����T��x멛���=�#'67�/���E�k[��k������	�տ���&?�[��P����w|����w]�7�O�SQ���42��2,/0��2o`�h�G��nl������""�A)[����Hzt�K!`3A����*� C ����G�DI�<H
Dq�O@J��$� �0!��FB�B�8�(����������\��>�����~����ϻؿ�������������gZ���������_0Ǝ���ow�m��_g������?��mM�<����ݕ�}ܔߗw�Ϟ���[ܫ�������o�{����o�R�!�h�,#b K+�Q
�WƤN�A�Y�?�0 ��Â��E��8e"� ��,��M��X�@tl���� �7r�	D3� f'f�S�|F*e�w�������u��P�2H e�z}S�I&�J)@tT>-4
EH��b:C�c(P6}*1D2ġO�� 'p	&�1��s	b��D�t��D݁4�T1�M �� &��I6S�n/��)�$K��A����*R��{&q��&" �7��u_�O���6�g~x���_�tk��~.Y���:Ԧ��ۍ�[9�������gQ8���Z{�.߷�%�e���>���������-���m?��{�_������_)e��Gٷui��޳�W����x�_�ᗔ	<!J>)��!&�"����*�"Y���4�8�f�������Dza��0�)
5
@
a	0����Bd	�qi  
 b�Q�P�L&��jl�$&�vD�0�S$	<�8�'�ID���-ƽ�_��:\�}������.���ɷ���?��߬��_s�����M��~����V�|z�%�Ͻ��0�gֵ�;K�ߩ�ڻ�������3�I����=e������xﻣ��w�b�����|��U���r�{q�ƍ���nw����o�畳��.g��o��Q��'�_|[�i����뚼���y�!�~*�����F�������b�ӽ?���؟���-�9����W����������vx������������z~�Jg8�`����}L)�P@�tx�S�!=���Df���E���O� �D���9"�$9��& i'H B���J ��i� 0EA�GЄ,��R
���@�$		"2 D
 B#+!$k���o��}e��=Y���o�۶z��Ѽk~����:������������mV~�v������~����3c?���v����ٵj�����މ�7�>�K��Ͽ:���o���wo��,��=�m>������2.�))�0�_aF+�r	 e�Ás"�T6��ɂ
 ���^<"�B{R�Q@0�2{S6�[�B\B�p�� ��`��`Ԩ�b$»L�Ev
�A�P�P($�84��D,�/�s�bg��)@�T)��@ �H�D�aF�bB�ؠ�j|6[�L �!��D8K`D���d6m)�BQA@�_�~��,4P��PqF�T(�a,
@�������Eq%&m�D��K" А&�	��_s���_W����f�٣{�ګ����\]��������?���A}[�k�L{��۹=���������6o�g�_��;�z�}|g����?�����8o���zU��o��k�nj�w7s��q�~��H�'6|a��������mS(�P�a|����#ҡB��J)e��8���|� 2hR�eT1G?@�t�!�dC�)�2@J���]�"<$��A�8B����J�p�q�=��Qh�(�7����o����?����v=���������yϿ���������~���gO�>z����������~�k���K�}�ؽ}��c���}����X^����t�<�^����ݡ�v��`��[�~\����������wƼ���{n�۟���-�����~�oo����E�o��;�E�gݯ��O���j�������_7g��O�%T�u��v�����_v�O���Qu��~)8���|���~��W���]��ݗ׻_����.�W>{�"T#k�]3�`I)�Z���V�H�eQ��������B�T��^"y�CQ����V�6�dpEp،���P����wE�`ѷ�I(1  �8�@ mn�l������&�T�e-Y~m|�Z����y�}��sO�}s�_���{��Ou��������u������E������������x}������>�Uޏ������}����.=�N�����m�~�ߺ��}�m��kN:�h���z��[��u�D2[G`H� L[8栆�&a(@ �7P��e�.H$ �D�1"k1R
�#� nD(��� `� \.�p�0��DwP0V �c��(�(�i3�4(�AԵ�CH����� 6%x���C)��N��@@��Eb��|_tF���'%D�A�A��" ` �#TW��F���$2E��SK��a,D��4�,�!���5-D!��	�,�� p�F��� H�c aL����~������-��!S������������ܿ�o�ۭ���n��U��c������*���w#�ǎ�������9�^��:������=z�q��>ݝ��by�w��w���?2���{~�|������s����|p� #-_+.,@cDf 
p�dH > xP)D�F&)��� �@�ùTz��8�"	��-	�,�C�hE�Ml�@Z)� �@}z��>(MrT��T��B4�C Lė G�Q�!��R����W�~�-�<�߷�W�������=���[4������nS�Ƕ�����݁ٺ��ַ���'�y9�]�Um~��X_�������Y������_�_�g��������_���������}��������=�'���Ӌ�w�o�_W���k���}�����>��߾�}�aR���,�[]�~_��������ۯѩS_�UO%���sտq">�����o~��5Ty�����}{ ދ�n���#J�F�������g}��U���kYǜE4A
(���r<��P1
��l�R�"��4� �&�IA�e4���T'�����0S�@p�yd�9�G{Af ���&�"@Qg"��IA�E6T�P�NHR\@	"����FJA�@HBe�f߿��v��|��vz�����{/T���mU���ۍ�������~�=��{+�V��i�o�X5�����mן�����?��N��$������N���׿��7���v��y;�_ܿ��o{�s�q����-���L�-*��s4}��(�P	U�S3�A�H���#i��`����YX�"D�, Ԡ"cI ;8� D����2�2�C�+>I*NY�A+�Ala!>d�-)a7f� ��"A�Ž؄��L��@rkO���&��
����tb��� (/Hj!�C0$4Pf�q4$	G$%��j�$V&�E�L@"�H!p
�� F� ���̡�05�n���_�|J��ol��B8� ���=�sa����?]�.�߿{0��˿���~�7¼�������}��YT���u5��������{���������_���Ok��������kO��������˺��?���{�U�뷍�~�߿��������þ���Rb�h$0�H�,��Q ��x�4 �H .` �r��:�-IW����pO &��<��&`�&�$"$eRH �U(5Q��d.'d�8���ڜ�� ��C��	��I�<F ,��o�����m0]�W����ߡ�������V������y��?���"�M�e��=��R{Ρm߾ۭ���/+��mn��Zc(�/��Wwɛ)��.���nY1�vm}t���(<Wߏ;6ָ��LM��7����
���w�)��.t��O�5�;���x�9ycg���W�m���9�ٹ�������ie@|����봽-�������N��fw��.�o�����.?_O�^�)^6{���p�p_+5|��T��:i����ٷ������J�*����$��8�% ��*fl�@Ɇ� A�)��Xl
%I�(�'��BY �@C ���!JY�4Ā`HZ,S�( �a�A���d`<�I���MB. 	��!�8� $��{xѻ��[����m���AW?��9#}�����o󗂯������Ƈ|�ź��^��]�������ϺW�Ҳܩ���������R���=���C�Һ���Q̦�ݯ�~մ7�����;������y���}/alD(�#�B`AH�G(�!e �� J05��"1U&@-��Z�w���D K �p- F���T  ͒��8�P�*�P  	�QX2�@l���x �`j� P�h\�TC1$ TA���:���NH@�8��!��H	P��4FF���lB
!�jI,PPƕ��P��� ��2I��Ȁ	�N�@ QDT�X `�D�D�t��C �4\�,:B-E�.��̣)s�����y�V��^�i��_�A[�����?ޟW�����;m~�?_���洖﹕�\A{�ͳ��7�������ٔ���?5/n9"�����;�{�r�QuO��?mj���w��8��g�)ﶩպ�@����� @`��L�2� . N#���1F��  I*qk���bH,ЎOiB\  ����8�+>A�O�l��4 X 0�` "G̨F  CB�0@%(�͂�8\P X�	�  �v�B���>�^��׫6�a~���Mw�����ur��_���v�α��}��6�;��.�}��OZ�s������[]1�����|���_��O�۷��e��i�7�ٝ�����3�������|�����w��{'{ϋ��=��*�������w��^<��/;�����'�9II����ߕ�����zW���M��o�k�������{��u�����=����?�k����(gq׉�+����?�ʹP������}�Y�cb�KBVP�@=Js�` �P% M�pƴ`K ���ጃ1���,�p�
�@R��Z�3.  S����`$" 1 ǯ�K�P�A��؍�������o_]��XG�w_��k����&��	?����7)~	��?������}ظ����E\5$����?��qJ�Լ�[}z�w�	�_��ܼ�W��?�/��w���|o뿝����f@u����Wog��;8 `,�2�(j�5@��8 Rg ��ZD�V�!�$����8����	!�C��@ �
�
 `�!	 x��E�CPN�LJ�B�A��	F@� #  �eb!�$  �
aa$� �`����d�A��X(R,�"\���ļ�)Ab��@��^IjLea*p�HK�9 䘩&���,��`��8�  P����x�B��nh�( ���W�8���(�!G
�@��0��$B��7V��5++�Gw;�_���[O$1Z̷�tz��2��i�K.�:5H�6�����i���Wv;u��_���om�Y���w{���L����I�ۻ����������U_���~�k�������/r��ˮ�Ŷ�E��	@��K��
)r��*�Q W"�� 5�n#� �CFJJa�� ��$ n�!4GZ�3D"@8h&b �`�N�8C�
k�e� ����X` $�B�R�A G��Pk	
u��c����Q���9��>]e�v�G��Yoo��7���ߟ�/yw_�l���l�os+��;H&�s|ow�}k�/���{3B�Ⱏ_��U�=��]�8ǭNz�N|����Yپ�A�W/����6�0{�!�G���o;��7O��/�~�[/ȫ������G�fQ���s����>���jq�W��*�;uܷ}ֵk���O�� z���7�ecר��W�w,}ϥ�6������)��w�B�?�"�ϣ}ح������a�ă�0�"� ���)P��H&�@�dB`�j�;�  � 
��@P!8�^s(I4�&0t ����DK`�Y$��ü,
TB���9DLH�����f� ���g~����2&��rLQ��N�<��s�(�+�Z�]g���'W�m�n����6��v�Q0��g�4-���r[�s������';�7���\{/)���y�~?���bYU����r���ߞ�5����fz���?��w?>�w� A E�`�AH�1#�@c%\��� ���\�3ȌA� B�
B$8�V PA "5%�� �J$
b,! J�u�`g{��	�P$|�2��$ Ј�����)�,$�F��� a�h@P �=�B�����P*0 �
��d �A5A	LЉ�c�"p2D� `�d�#L&�% �EK q��IIT("i�B� *&�b qZJ
V���i��� �D��D<D` ��8��  ���Rỽ��佧���?���'z]fҾO��y��?��^�tI��5U_7���I��;�~P�=E���F�������5�����w4M#�,�b����W��_��_�m^�3\�.�w����/W_Wv��G�ߞ0�P��M�N!���	�D�
lC��K@l""@ �hM D� �H놌�P��x8R��c�"��X���LQh�E ���!P �8m� P�1�aL*0�HE��2�`88�$�>��o���O�����/�J��v-pz�����,���ֿ'T��|qb���o��}��'����.��5/�e�aޝ�`�m�o�O]�T��zQb&�K��s��3=xS=%�d��߇N;�7�g�����|iW��f��^�z�߇gWZU�'w�ի믬�,�y���z��U�-��\�ݴ���|c�
���W��T����ގi}�f�9������������Z�n��5���Sނ�[��0w�����������{�~9�A� �
CX�D�YQ,]t�G c `㘀����Q��g���Ȉb  �.##��[����I��H
Tâ�Hɡ�`���p��
�7"�1BE�_�D&$�B> %��@���}ڵ��qz�S��f�������>�Eqό�������[����ΥO�o�o��ߋ�l����ob'�7���i�#���/����O7����_������;���|'�1n������ck�#�pz��R\��l!�&�!;R��0#R I� �$�&B�����	!��Q(�!#�@*Bn�Jh"�$/BHP�L��VBL��eh�*A bE1FI�O"`������R��"��(���$��1aY�JHt\D�\ �d�@��)����bjA�� ��l�" P ǌd��HY���"	M1$�Q� ������L x��@�؄�"0H�I� ����
�X���X���