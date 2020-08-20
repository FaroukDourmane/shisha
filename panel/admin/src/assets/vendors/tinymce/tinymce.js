// 4.6.4 (2017-06-13)
(function () {

var defs = {}; // id -> {dependencies, definition, instance (possibly undefined)}

// Used when there is no 'main' module.
// The name is probably (hopefully) unique so minification removes for releases.
var register_3795 = function (id) {
  var module = dem(id);
  var fragments = id.split('.');
  var target = Function('return this;')();
  for (var i = 0; i < fragments.length - 1; ++i) {
    if (target[fragments[i]] === undefined)
      target[fragments[i]] = {};
    target = target[fragments[i]];
  }
  target[fragments[fragments.length - 1]] = module;
};

var instantiate = function (id) {
  var actual = defs[id];
  var dependencies = actual.deps;
  var definition = actual.defn;
  var len = dependencies.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances[i] = dem(dependencies[i]);
  var defResult = definition.apply(null, instances);
  if (defResult === undefined)
     throw 'module [' + id + '] returned undefined';
  actual.instance = defResult;
};

var def = function (id, dependencies, definition) {
  if (typeof id !== 'string')
    throw 'module id must be a string';
  else if (dependencies === undefined)
    throw 'no dependencies for ' + id;
  else if (definition === undefined)
    throw 'no definition function for ' + id;
  defs[id] = {
    deps: dependencies,
    defn: definition,
    instance: undefined
  };
};

var dem = function (id) {
  var actual = defs[id];
  if (actual === undefined)
    throw 'module [' + id + '] was undefined';
  else if (actual.instance === undefined)
    instantiate(id);
  return actual.instance;
};

var req = function (ids, callback) {
  var len = ids.length;
  var instances = new Array(len);
  for (var i = 0; i < len; ++i)
    instances.push(dem(ids[i]));
  callback.apply(null, callback);
};

var ephox = {};

ephox.bolt = {
  module: {
    api: {
      define: def,
      require: req,
      demand: dem
    }
  }
};

var define = def;
var require = req;
var demand = dem;
// this helps with minificiation when using a lot of global references
var defineGlobal = function (id, ref) {
  define(id, [], function () { return ref; });
};
/*jsc
["tinymce.core.api.Main","tinymce.core.api.Tinymce","tinymce.core.Register","tinymce.core.geom.Rect","tinymce.core.util.Promise","tinymce.core.util.Delay","tinymce.core.Env","tinymce.core.dom.EventUtils","tinymce.core.dom.Sizzle","tinymce.core.util.Tools","tinymce.core.dom.DomQuery","tinymce.core.html.Styles","tinymce.core.dom.TreeWalker","tinymce.core.html.Entities","tinymce.core.dom.DOMUtils","tinymce.core.dom.ScriptLoader","tinymce.core.AddOnManager","tinymce.core.dom.RangeUtils","tinymce.core.html.Node","tinymce.core.html.Schema","tinymce.core.html.SaxParser","tinymce.core.html.DomParser","tinymce.core.html.Writer","tinymce.core.html.Serializer","tinymce.core.dom.Serializer","tinymce.core.util.VK","tinymce.core.dom.ControlSelection","tinymce.core.dom.BookmarkManager","tinymce.core.dom.Selection","tinymce.core.Formatter","tinymce.core.UndoManager","tinymce.core.EditorCommands","tinymce.core.util.URI","tinymce.core.util.Class","tinymce.core.util.EventDispatcher","tinymce.core.util.Observable","tinymce.core.WindowManager","tinymce.core.NotificationManager","tinymce.core.EditorObservable","tinymce.core.Shortcuts","tinymce.core.Editor","tinymce.core.util.I18n","tinymce.core.FocusManager","tinymce.core.EditorManager","tinymce.core.util.XHR","tinymce.core.util.JSON","tinymce.core.util.JSONRequest","tinymce.core.util.JSONP","tinymce.core.util.LocalStorage","tinymce.core.api.Compat","tinymce.core.util.Color","tinymce.core.ui.Api","tinymce.core.util.Arr","tinymce.core.dom.Range","tinymce.core.dom.StyleSheetLoader","tinymce.core.dom.NodeType","tinymce.core.caret.CaretContainer","tinymce.core.text.Zwsp","ephox.katamari.api.Fun","tinymce.core.dom.RangePoint","tinymce.core.caret.CaretBookmark","tinymce.core.caret.CaretPosition","ephox.sugar.api.dom.Compare","ephox.sugar.api.node.Element","tinymce.core.dom.ScrollIntoView","tinymce.core.dom.TridentSelection","tinymce.core.selection.FragmentReader","tinymce.core.dom.ElementUtils","tinymce.core.util.Fun","tinymce.core.fmt.Preview","tinymce.core.fmt.Hooks","tinymce.core.undo.Levels","tinymce.core.delete.DeleteCommands","tinymce.core.InsertContent","global!document","tinymce.core.ui.Window","tinymce.core.ui.MessageBox","tinymce.core.ui.Notification","tinymce.core.EditorSettings","tinymce.core.init.Render","tinymce.core.Mode","tinymce.core.ui.Sidebar","tinymce.core.util.Uuid","tinymce.core.ErrorReporter","tinymce.core.LegacyInput","tinymce.core.ui.Selector","tinymce.core.ui.Collection","tinymce.core.ui.ReflowQueue","tinymce.core.ui.Control","tinymce.core.ui.Factory","tinymce.core.ui.KeyboardNavigation","tinymce.core.ui.Container","tinymce.core.ui.DragHelper","tinymce.core.ui.Scrollable","tinymce.core.ui.Panel","tinymce.core.ui.Movable","tinymce.core.ui.Resizable","tinymce.core.ui.FloatPanel","tinymce.core.ui.Tooltip","tinymce.core.ui.Widget","tinymce.core.ui.Progress","tinymce.core.ui.Layout","tinymce.core.ui.AbsoluteLayout","tinymce.core.ui.Button","tinymce.core.ui.ButtonGroup","tinymce.core.ui.Checkbox","tinymce.core.ui.ComboBox","tinymce.core.ui.ColorBox","tinymce.core.ui.PanelButton","tinymce.core.ui.ColorButton","tinymce.core.ui.ColorPicker","tinymce.core.ui.Path","tinymce.core.ui.ElementPath","tinymce.core.ui.FormItem","tinymce.core.ui.Form","tinymce.core.ui.FieldSet","tinymce.core.ui.FilePicker","tinymce.core.ui.FitLayout","tinymce.core.ui.FlexLayout","tinymce.core.ui.FlowLayout","tinymce.core.ui.FormatControls","tinymce.core.ui.GridLayout","tinymce.core.ui.Iframe","tinymce.core.ui.InfoBox","tinymce.core.ui.Label","tinymce.core.ui.Toolbar","tinymce.core.ui.MenuBar","tinymce.core.ui.MenuButton","tinymce.core.ui.MenuItem","tinymce.core.ui.Throbber","tinymce.core.ui.Menu","tinymce.core.ui.ListBox","tinymce.core.ui.Radio","tinymce.core.ui.ResizeHandle","tinymce.core.ui.SelectBox","tinymce.core.ui.Slider","tinymce.core.ui.Spacer","tinymce.core.ui.SplitButton","tinymce.core.ui.StackLayout","tinymce.core.ui.TabPanel","tinymce.core.ui.TextBox","ephox.katamari.api.Arr","global!Array","global!Error","ephox.katamari.api.Future","ephox.katamari.api.Futures","ephox.katamari.api.Result","tinymce.core.geom.ClientRect","tinymce.core.caret.CaretCandidate","tinymce.core.text.ExtendingChar","ephox.sand.api.Node","ephox.sand.api.PlatformDetection","ephox.sugar.api.search.Selectors","global!console","ephox.sugar.api.dom.Insert","ephox.sugar.api.dom.Replication","ephox.sugar.api.node.Fragment","ephox.sugar.api.node.Node","tinymce.core.dom.ElementType","tinymce.core.dom.Parents","tinymce.core.selection.SelectionUtils","tinymce.core.undo.Fragments","tinymce.core.delete.BlockBoundaryDelete","tinymce.core.delete.BlockRangeDelete","tinymce.core.delete.CefDelete","tinymce.core.delete.InlineBoundaryDelete","tinymce.core.caret.CaretWalker","tinymce.core.dom.RangeNormalizer","tinymce.core.InsertList","tinymce.core.data.ObservableObject","tinymce.core.ui.DomUtils","tinymce.core.ui.BoxUtils","tinymce.core.ui.ClassList","global!window","tinymce.core.init.Init","tinymce.core.PluginManager","tinymce.core.ThemeManager","tinymce.core.content.LinkTargets","tinymce.core.fmt.FontInfo","ephox.katamari.api.Option","global!String","ephox.katamari.api.LazyValue","ephox.katamari.async.Bounce","ephox.katamari.async.AsyncValues","ephox.sand.util.Global","ephox.katamari.api.Thunk","ephox.sand.core.PlatformDetection","global!navigator","ephox.sugar.api.node.NodeTypes","ephox.sugar.api.search.Traverse","ephox.sugar.api.properties.Attr","ephox.sugar.api.dom.InsertAll","ephox.sugar.api.dom.Remove","ephox.katamari.api.Options","tinymce.core.undo.Diff","tinymce.core.delete.BlockBoundary","tinymce.core.delete.MergeBlocks","tinymce.core.delete.DeleteUtils","tinymce.core.caret.CaretUtils","tinymce.core.delete.CefDeleteAction","tinymce.core.delete.DeleteElement","tinymce.core.caret.CaretFinder","tinymce.core.keyboard.BoundaryCaret","tinymce.core.keyboard.BoundaryLocation","tinymce.core.keyboard.BoundarySelection","tinymce.core.keyboard.InlineUtils","tinymce.core.data.Binding","tinymce.core.init.InitContentBody","global!Object","global!setTimeout","ephox.katamari.api.Resolve","ephox.sand.core.Browser","ephox.sand.core.OperatingSystem","ephox.sand.detect.DeviceType","ephox.sand.detect.UaString","ephox.sand.info.PlatformInfo","ephox.katamari.api.Type","ephox.katamari.api.Struct","ephox.sugar.alien.Recurse","ephox.katamari.api.Obj","ephox.sugar.api.search.PredicateFind","tinymce.core.dom.Empty","ephox.katamari.api.Adt","tinymce.core.text.Bidi","tinymce.core.caret.CaretContainerInline","tinymce.core.caret.CaretContainerRemove","tinymce.core.util.LazyEvaluator","ephox.katamari.api.Cell","tinymce.core.caret.CaretContainerInput","tinymce.core.EditorUpload","tinymce.core.ForceBlocks","tinymce.core.keyboard.KeyboardOverrides","tinymce.core.NodeChange","tinymce.core.SelectionOverrides","tinymce.core.util.Quirks","ephox.katamari.api.Global","ephox.sand.detect.Version","ephox.katamari.api.Strings","ephox.katamari.data.Immutable","ephox.katamari.data.MixedBag","ephox.sugar.api.node.Body","ephox.sugar.impl.ClosestOrAncestor","ephox.sugar.api.search.SelectorExists","tinymce.core.file.Uploader","tinymce.core.file.ImageScanner","tinymce.core.file.BlobCache","tinymce.core.file.UploadStatus","tinymce.core.keyboard.ArrowKeys","tinymce.core.keyboard.DeleteBackspaceKeys","tinymce.core.keyboard.EnterKey","tinymce.core.keyboard.SpaceKey","tinymce.core.caret.FakeCaret","tinymce.core.caret.LineUtils","tinymce.core.DragDropOverrides","tinymce.core.EditorView","tinymce.core.keyboard.CefUtils","tinymce.core.dom.NodePath","global!Number","ephox.katamari.str.StrAppend","ephox.katamari.str.StringParts","ephox.katamari.util.BagUtils","ephox.sugar.api.search.SelectorFind","tinymce.core.file.Conversions","global!URL","tinymce.core.keyboard.CefNavigation","tinymce.core.keyboard.MatchKeys","tinymce.core.keyboard.InsertSpace","tinymce.core.dom.Dimensions","tinymce.core.dom.MousePosition","ephox.sugar.api.properties.Css","tinymce.core.caret.LineWalker","ephox.katamari.api.Merger","ephox.sugar.impl.Style"]
jsc*/
/**
 * Rect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains various tools for rect/position calculation.
 *
 * @class tinymce.geom.Rect
 */
define(
  'tinymce.core.geom.Rect',
  [
  ],
  function () {
    "use strict";

    var min = Math.min, max = Math.max, round = Math.round;

    /**
     * Returns the rect positioned based on the relative position name
     * to the target rect.
     *
     * @method relativePosition
     * @param {Rect} rect Source rect to modify into a new rect.
     * @param {Rect} targetRect Rect to move relative to based on the rel option.
     * @param {String} rel Relative position. For example: tr-bl.
     */
    function relativePosition(rect, targetRect, rel) {
      var x, y, w, h, targetW, targetH;

      x = targetRect.x;
      y = targetRect.y;
      w = rect.w;
      h = rect.h;
      targetW = targetRect.w;
      targetH = targetRect.h;

      rel = (rel || '').split('');

      if (rel[0] === 'b') {
        y += targetH;
      }

      if (rel[1] === 'r') {
        x += targetW;
      }

      if (rel[0] === 'c') {
        y += round(targetH / 2);
      }

      if (rel[1] === 'c') {
        x += round(targetW / 2);
      }

      if (rel[3] === 'b') {
        y -= h;
      }

      if (rel[4] === 'r') {
        x -= w;
      }

      if (rel[3] === 'c') {
        y -= round(h / 2);
      }

      if (rel[4] === 'c') {
        x -= round(w / 2);
      }

      return create(x, y, w, h);
    }

    /**
     * Tests various positions to get the most suitable one.
     *
     * @method findBestRelativePosition
     * @param {Rect} rect Rect to use as source.
     * @param {Rect} targetRect Rect to move relative to.
     * @param {Rect} constrainRect Rect to constrain within.
     * @param {Array} rels Array of relative positions to test against.
     */
    function findBestRelativePosition(rect, targetRect, constrainRect, rels) {
      var pos, i;

      for (i = 0; i < rels.length; i++) {
        pos = relativePosition(rect, targetRect, rels[i]);

        if (pos.x >= constrainRect.x && pos.x + pos.w <= constrainRect.w + constrainRect.x &&
          pos.y >= constrainRect.y && pos.y + pos.h <= constrainRect.h + constrainRect.y) {
          return rels[i];
        }
      }

      return null;
    }

    /**
     * Inflates the rect in all directions.
     *
     * @method inflate
     * @param {Rect} rect Rect to expand.
     * @param {Number} w Relative width to expand by.
     * @param {Number} h Relative height to expand by.
     * @return {Rect} New expanded rect.
     */
    function inflate(rect, w, h) {
      return create(rect.x - w, rect.y - h, rect.w + w * 2, rect.h + h * 2);
    }

    /**
     * Returns the intersection of the specified rectangles.
     *
     * @method intersect
     * @param {Rect} rect The first rectangle to compare.
     * @param {Rect} cropRect The second rectangle to compare.
     * @return {Rect} The intersection of the two rectangles or null if they don't intersect.
     */
    function intersect(rect, cropRect) {
      var x1, y1, x2, y2;

      x1 = max(rect.x, cropRect.x);
      y1 = max(rect.y, cropRect.y);
      x2 = min(rect.x + rect.w, cropRect.x + cropRect.w);
      y2 = min(rect.y + rect.h, cropRect.y + cropRect.h);

      if (x2 - x1 < 0 || y2 - y1 < 0) {
        return null;
      }

      return create(x1, y1, x2 - x1, y2 - y1);
    }

    /**
     * Returns a rect clamped within the specified clamp rect. This forces the
     * rect to be inside the clamp rect.
     *
     * @method clamp
     * @param {Rect} rect Rectangle to force within clamp rect.
     * @param {Rect} clampRect Rectable to force within.
     * @param {Boolean} fixedSize True/false if size should be fixed.
     * @return {Rect} Clamped rect.
     */
    function clamp(rect, clampRect, fixedSize) {
      var underflowX1, underflowY1, overflowX2, overflowY2,
        x1, y1, x2, y2, cx2, cy2;

      x1 = rect.x;
      y1 = rect.y;
      x2 = rect.x + rect.w;
      y2 = rect.y + rect.h;
      cx2 = clampRect.x + clampRect.w;
      cy2 = clampRect.y + clampRect.h;

      underflowX1 = max(0, clampRect.x - x1);
      underflowY1 = max(0, clampRect.y - y1);
      overflowX2 = max(0, x2 - cx2);
      overflowY2 = max(0, y2 - cy2);

      x1 += underflowX1;
      y1 += underflowY1;

      if (fixedSize) {
        x2 += underflowX1;
        y2 += underflowY1;
        x1 -= overflowX2;
        y1 -= overflowY2;
      }

      x2 -= overflowX2;
      y2 -= overflowY2;

      return create(x1, y1, x2 - x1, y2 - y1);
    }

    /**
     * Creates a new rectangle object.
     *
     * @method create
     * @param {Number} x Rectangle x location.
     * @param {Number} y Rectangle y location.
     * @param {Number} w Rectangle width.
     * @param {Number} h Rectangle height.
     * @return {Rect} New rectangle object.
     */
    function create(x, y, w, h) {
      return { x: x, y: y, w: w, h: h };
    }

    /**
     * Creates a new rectangle object form a clientRects object.
     *
     * @method fromClientRect
     * @param {ClientRect} clientRect DOM ClientRect object.
     * @return {Rect} New rectangle object.
     */
    function fromClientRect(clientRect) {
      return create(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
    }

    return {
      inflate: inflate,
      relativePosition: relativePosition,
      findBestRelativePosition: findBestRelativePosition,
      intersect: intersect,
      clamp: clamp,
      create: create,
      fromClientRect: fromClientRect
    };
  }
);

/**
 * Promise.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * Promise polyfill under MIT license: https://github.com/taylorhakes/promise-polyfill
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/* eslint-disable */
/* jshint ignore:start */

/**
 * Modifed to be a feature fill and wrapped as tinymce module.
 */
define(
  'tinymce.core.util.Promise',
  [],
  function () {
    if (window.Promise) {
      return window.Promise;
    }

    // Use polyfill for setImmediate for performance gains
    var asap = Promise.immediateFn || (typeof setImmediate === 'function' && setImmediate) ||
      function (fn) { setTimeout(fn, 1); };

    // Polyfill for Function.prototype.bind
    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }

    var isArray = Array.isArray || function (value) { return Object.prototype.toString.call(value) === "[object Array]"; };

    function Promise(fn) {
      if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function') throw new TypeError('not a function');
      this._state = null;
      this._value = null;
      this._deferreds = [];

      doResolve(fn, bind(resolve, this), bind(reject, this));
    }

    function handle(deferred) {
      var me = this;
      if (this._state === null) {
        this._deferreds.push(deferred);
        return;
      }
      asap(function () {
        var cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (me._state ? deferred.resolve : deferred.reject)(me._value);
          return;
        }
        var ret;
        try {
          ret = cb(me._value);
        }
        catch (e) {
          deferred.reject(e);
          return;
        }
        deferred.resolve(ret);
      });
    }

    function resolve(newValue) {
      try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === this) throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          var then = newValue.then;
          if (typeof then === 'function') {
            doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
            return;
          }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
      } catch (e) { reject.call(this, e); }
    }

    function reject(newValue) {
      this._state = false;
      this._value = newValue;
      finale.call(this);
    }

    function finale() {
      for (var i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
      }
      this._deferreds = null;
    }

    function Handler(onFulfilled, onRejected, resolve, reject) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.resolve = resolve;
      this.reject = reject;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, onFulfilled, onRejected) {
      var done = false;
      try {
        fn(function (value) {
          if (done) return;
          done = true;
          onFulfilled(value);
        }, function (reason) {
          if (done) return;
          done = true;
          onRejected(reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        onRejected(ex);
      }
    }

    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };

    Promise.prototype.then = function (onFulfilled, onRejected) {
      var me = this;
      return new Promise(function (resolve, reject) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
      });
    };

    Promise.all = function () {
      var args = Array.prototype.slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

      return new Promise(function (resolve, reject) {
        if (args.length === 0) return resolve([]);
        var remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              var then = val.then;
              if (typeof then === 'function') {
                then.call(val, function (val) { res(i, val); }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (var i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };

    Promise.resolve = function (value) {
      if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
      }

      return new Promise(function (resolve) {
        resolve(value);
      });
    };

    Promise.reject = function (value) {
      return new Promise(function (resolve, reject) {
        reject(value);
      });
    };

    Promise.race = function (values) {
      return new Promise(function (resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
          values[i].then(resolve, reject);
        }
      });
    };

    return Promise;
  }
);

/* jshint ignore:end */
/* eslint-enable */
/**
 * Delay.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for working with delayed actions like setTimeout.
 *
 * @class tinymce.util.Delay
 */
define(
  'tinymce.core.util.Delay',
  [
    "tinymce.core.util.Promise"
  ],
  function (Promise) {
    var requestAnimationFramePromise;

    function requestAnimationFrame(callback, element) {
      var i, requestAnimationFrameFunc = window.requestAnimationFrame, vendors = ['ms', 'moz', 'webkit'];

      function featurefill(callback) {
        window.setTimeout(callback, 0);
      }

      for (i = 0; i < vendors.length && !requestAnimationFrameFunc; i++) {
        requestAnimationFrameFunc = window[vendors[i] + 'RequestAnimationFrame'];
      }

      if (!requestAnimationFrameFunc) {
        requestAnimationFrameFunc = featurefill;
      }

      requestAnimationFrameFunc(callback, element);
    }

    function wrappedSetTimeout(callback, time) {
      if (typeof time != 'number') {
        time = 0;
      }

      return setTimeout(callback, time);
    }

    function wrappedSetInterval(callback, time) {
      if (typeof time != 'number') {
        time = 1; // IE 8 needs it to be > 0
      }

      return setInterval(callback, time);
    }

    function wrappedClearTimeout(id) {
      return clearTimeout(id);
    }

    function wrappedClearInterval(id) {
      return clearInterval(id);
    }

    function debounce(callback, time) {
      var timer, func;

      func = function () {
        var args = arguments;

        clearTimeout(timer);

        timer = wrappedSetTimeout(function () {
          callback.apply(this, args);
        }, time);
      };

      func.stop = function () {
        clearTimeout(timer);
      };

      return func;
    }

    return {
      /**
       * Requests an animation frame and fallbacks to a timeout on older browsers.
       *
       * @method requestAnimationFrame
       * @param {function} callback Callback to execute when a new frame is available.
       * @param {DOMElement} element Optional element to scope it to.
       */
      requestAnimationFrame: function (callback, element) {
        if (requestAnimationFramePromise) {
          requestAnimationFramePromise.then(callback);
          return;
        }

        requestAnimationFramePromise = new Promise(function (resolve) {
          if (!element) {
            element = document.body;
          }

          requestAnimationFrame(resolve, element);
        }).then(callback);
      },

      /**
       * Sets a timer in ms and executes the specified callback when the timer runs out.
       *
       * @method setTimeout
       * @param {function} callback Callback to execute when timer runs out.
       * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
       * @return {Number} Timeout id number.
       */
      setTimeout: wrappedSetTimeout,

      /**
       * Sets an interval timer in ms and executes the specified callback at every interval of that time.
       *
       * @method setInterval
       * @param {function} callback Callback to execute when interval time runs out.
       * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
       * @return {Number} Timeout id number.
       */
      setInterval: wrappedSetInterval,

      /**
       * Sets an editor timeout it's similar to setTimeout except that it checks if the editor instance is
       * still alive when the callback gets executed.
       *
       * @method setEditorTimeout
       * @param {tinymce.Editor} editor Editor instance to check the removed state on.
       * @param {function} callback Callback to execute when timer runs out.
       * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
       * @return {Number} Timeout id number.
       */
      setEditorTimeout: function (editor, callback, time) {
        return wrappedSetTimeout(function () {
          if (!editor.removed) {
            callback();
          }
        }, time);
      },

      /**
       * Sets an interval timer it's similar to setInterval except that it checks if the editor instance is
       * still alive when the callback gets executed.
       *
       * @method setEditorInterval
       * @param {function} callback Callback to execute when interval time runs out.
       * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
       * @return {Number} Timeout id number.
       */
      setEditorInterval: function (editor, callback, time) {
        var timer;

        timer = wrappedSetInterval(function () {
          if (!editor.removed) {
            callback();
          } else {
            clearInterval(timer);
          }
        }, time);

        return timer;
      },

      /**
       * Creates debounced callback function that only gets executed once within the specified time.
       *
       * @method debounce
       * @param {function} callback Callback to execute when timer finishes.
       * @param {Number} time Optional time to wait before the callback is executed, defaults to 0.
       * @return {Function} debounced function callback.
       */
      debounce: debounce,

      // Throttle needs to be debounce due to backwards compatibility.
      throttle: debounce,

      /**
       * Clears an interval timer so it won't execute.
       *
       * @method clearInterval
       * @param {Number} Interval timer id number.
       */
      clearInterval: wrappedClearInterval,

      /**
       * Clears an timeout timer so it won't execute.
       *
       * @method clearTimeout
       * @param {Number} Timeout timer id number.
       */
      clearTimeout: wrappedClearTimeout
    };
  }
);

/**
 * Env.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class tinymce.Env
 * @static
 */
define(
  'tinymce.core.Env',
  [
  ],
  function () {
    var nav = navigator, userAgent = nav.userAgent;
    var opera, webkit, ie, ie11, ie12, gecko, mac, iDevice, android, fileApi, phone, tablet, windowsPhone;

    function matchMediaQuery(query) {
      return "matchMedia" in window ? matchMedia(query).matches : false;
    }

    opera = window.opera && window.opera.buildNumber;
    android = /Android/.test(userAgent);
    webkit = /WebKit/.test(userAgent);
    ie = !webkit && !opera && (/MSIE/gi).test(userAgent) && (/Explorer/gi).test(nav.appName);
    ie = ie && /MSIE (\w+)\./.exec(userAgent)[1];
    ie11 = userAgent.indexOf('Trident/') != -1 && (userAgent.indexOf('rv:') != -1 || nav.appName.indexOf('Netscape') != -1) ? 11 : false;
    ie12 = (userAgent.indexOf('Edge/') != -1 && !ie && !ie11) ? 12 : false;
    ie = ie || ie11 || ie12;
    gecko = !webkit && !ie11 && /Gecko/.test(userAgent);
    mac = userAgent.indexOf('Mac') != -1;
    iDevice = /(iPad|iPhone)/.test(userAgent);
    fileApi = "FormData" in window && "FileReader" in window && "URL" in window && !!URL.createObjectURL;
    phone = matchMediaQuery("only screen and (max-device-width: 480px)") && (android || iDevice);
    tablet = matchMediaQuery("only screen and (min-width: 800px)") && (android || iDevice);
    windowsPhone = userAgent.indexOf('Windows Phone') != -1;

    if (ie12) {
      webkit = false;
    }

    // Is a iPad/iPhone and not on iOS5 sniff the WebKit version since older iOS WebKit versions
    // says it has contentEditable support but there is no visible caret.
    var contentEditable = !iDevice || fileApi || userAgent.match(/AppleWebKit\/(\d*)/)[1] >= 534;

    return {
      /**
       * Constant that is true if the browser is Opera.
       *
       * @property opera
       * @type Boolean
       * @final
       */
      opera: opera,

      /**
       * Constant that is true if the browser is WebKit (Safari/Chrome).
       *
       * @property webKit
       * @type Boolean
       * @final
       */
      webkit: webkit,

      /**
       * Constant that is more than zero if the browser is IE.
       *
       * @property ie
       * @type Boolean
       * @final
       */
      ie: ie,

      /**
       * Constant that is true if the browser is Gecko.
       *
       * @property gecko
       * @type Boolean
       * @final
       */
      gecko: gecko,

      /**
       * Constant that is true if the os is Mac OS.
       *
       * @property mac
       * @type Boolean
       * @final
       */
      mac: mac,

      /**
       * Constant that is true if the os is iOS.
       *
       * @property iOS
       * @type Boolean
       * @final
       */
      iOS: iDevice,

      /**
       * Constant that is true if the os is android.
       *
       * @property android
       * @type Boolean
       * @final
       */
      android: android,

      /**
       * Constant that is true if the browser supports editing.
       *
       * @property contentEditable
       * @type Boolean
       * @final
       */
      contentEditable: contentEditable,

      /**
       * Transparent image data url.
       *
       * @property transparentSrc
       * @type Boolean
       * @final
       */
      transparentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",

      /**
       * Returns true/false if the browser can or can't place the caret after a inline block like an image.
       *
       * @property noCaretAfter
       * @type Boolean
       * @final
       */
      caretAfter: ie != 8,

      /**
       * Constant that is true if the browser supports native DOM Ranges. IE 9+.
       *
       * @property range
       * @type Boolean
       */
      range: window.getSelection && "Range" in window,

      /**
       * Returns the IE document mode for non IE browsers this will fake IE 10.
       *
       * @property documentMode
       * @type Number
       */
      documentMode: ie && !ie12 ? (document.documentMode || 7) : 10,

      /**
       * Constant that is true if the browser has a modern file api.
       *
       * @property fileApi
       * @type Boolean
       */
      fileApi: fileApi,

      /**
       * Constant that is true if the browser supports contentEditable=false regions.
       *
       * @property ceFalse
       * @type Boolean
       */
      ceFalse: (ie === false || ie > 8),

      /**
       * Constant if CSP mode is possible or not. Meaning we can't use script urls for the iframe.
       */
      canHaveCSP: (ie === false || ie > 11),

      desktop: !phone && !tablet,
      windowsPhone: windowsPhone
    };
  }
);

/**
 * EventUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint loopfunc:true*/
/*eslint no-loop-func:0 */

/**
 * This class wraps the browsers native event logic with more convenient methods.
 *
 * @class tinymce.dom.EventUtils
 */
define(
  'tinymce.core.dom.EventUtils',
  [
    "tinymce.core.util.Delay",
    "tinymce.core.Env"
  ],
  function (Delay, Env) {
    "use strict";

    var eventExpandoPrefix = "mce-data-";
    var mouseEventRe = /^(?:mouse|contextmenu)|click/;
    var deprecated = {
      keyLocation: 1, layerX: 1, layerY: 1, returnValue: 1,
      webkitMovementX: 1, webkitMovementY: 1, keyIdentifier: 1
    };

    // Checks if it is our own isDefaultPrevented function
    var hasIsDefaultPrevented = function (event) {
      return event.isDefaultPrevented === returnTrue || event.isDefaultPrevented === returnFalse;
    };

    // Dummy function that gets replaced on the delegation state functions
    var returnFalse = function () {
      return false;
    };

    // Dummy function that gets replaced on the delegation state functions
    var returnTrue = function () {
      return true;
    };

    /**
     * Binds a native event to a callback on the speified target.
     */
    function addEvent(target, name, callback, capture) {
      if (target.addEventListener) {
        target.addEventListener(name, callback, capture || false);
      } else if (target.attachEvent) {
        target.attachEvent('on' + name, callback);
      }
    }

    /**
     * Unbinds a native event callback on the specified target.
     */
    function removeEvent(target, name, callback, capture) {
      if (target.removeEventListener) {
        target.removeEventListener(name, callback, capture || false);
      } else if (target.detachEvent) {
        target.detachEvent('on' + name, callback);
      }
    }

    /**
     * Gets the event target based on shadow dom properties like path and deepPath.
     */
    function getTargetFromShadowDom(event, defaultTarget) {
      var path, target = defaultTarget;

      // When target element is inside Shadow DOM we need to take first element from path
      // otherwise we'll get Shadow Root parent, not actual target element

      // Normalize target for WebComponents v0 implementation (in Chrome)
      path = event.path;
      if (path && path.length > 0) {
        target = path[0];
      }

      // Normalize target for WebComponents v1 implementation (standard)
      if (event.deepPath) {
        path = event.deepPath();
        if (path && path.length > 0) {
          target = path[0];
        }
      }

      return target;
    }

    /**
     * Normalizes a native event object or just adds the event specific methods on a custom event.
     */
    function fix(originalEvent, data) {
      var name, event = data || {}, undef;

      // Copy all properties from the original event
      for (name in originalEvent) {
        // layerX/layerY is deprecated in Chrome and produces a warning
        if (!deprecated[name]) {
          event[name] = originalEvent[name];
        }
      }

      // Normalize target IE uses srcElement
      if (!event.target) {
        event.target = event.srcElement || document;
      }

      // Experimental shadow dom support
      if (Env.experimentalShadowDom) {
        event.target = getTargetFromShadowDom(originalEvent, event.target);
      }

      // Calculate pageX/Y if missing and clientX/Y available
      if (originalEvent && mouseEventRe.test(originalEvent.type) && originalEvent.pageX === undef && originalEvent.clientX !== undef) {
        var eventDoc = event.target.ownerDocument || document;
        var doc = eventDoc.documentElement;
        var body = eventDoc.body;

        event.pageX = originalEvent.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
          (doc && doc.clientLeft || body && body.clientLeft || 0);

        event.pageY = originalEvent.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) -
          (doc && doc.clientTop || body && body.clientTop || 0);
      }

      // Add preventDefault method
      event.preventDefault = function () {
        event.isDefaultPrevented = returnTrue;

        // Execute preventDefault on the original event object
        if (originalEvent) {
          if (originalEvent.preventDefault) {
            originalEvent.preventDefault();
          } else {
            originalEvent.returnValue = false; // IE
          }
        }
      };

      // Add stopPropagation
      event.stopPropagation = function () {
        event.isPropagationStopped = returnTrue;

        // Execute stopPropagation on the original event object
        if (originalEvent) {
          if (originalEvent.stopPropagation) {
            originalEvent.stopPropagation();
          } else {
            originalEvent.cancelBubble = true; // IE
          }
        }
      };

      // Add stopImmediatePropagation
      event.stopImmediatePropagation = function () {
        event.isImmediatePropagationStopped = returnTrue;
        event.stopPropagation();
      };

      // Add event delegation states
      if (hasIsDefaultPrevented(event) === false) {
        event.isDefaultPrevented = returnFalse;
        event.isPropagationStopped = returnFalse;
        event.isImmediatePropagationStopped = returnFalse;
      }

      // Add missing metaKey for IE 8
      if (typeof event.metaKey == 'undefined') {
        event.metaKey = false;
      }

      return event;
    }

    /**
     * Bind a DOMContentLoaded event across browsers and executes the callback once the page DOM is initialized.
     * It will also set/check the domLoaded state of the event_utils instance so ready isn't called multiple times.
     */
    function bindOnReady(win, callback, eventUtils) {
      var doc = win.document, event = { type: 'ready' };

      if (eventUtils.domLoaded) {
        callback(event);
        return;
      }

      function isDocReady() {
        // Check complete or interactive state if there is a body
        // element on some iframes IE 8 will produce a null body
        return doc.readyState === "complete" || (doc.readyState === "interactive" && doc.body);
      }

      // Gets called when the DOM is ready
      function readyHandler() {
        if (!eventUtils.domLoaded) {
          eventUtils.domLoaded = true;
          callback(event);
        }
      }

      function waitForDomLoaded() {
        if (isDocReady()) {
          removeEvent(doc, "readystatechange", waitForDomLoaded);
          readyHandler();
        }
      }

      function tryScroll() {
        try {
          // If IE is used, use the trick by Diego Perini licensed under MIT by request to the author.
          // http://javascript.nwbox.com/IEContentLoaded/
          doc.documentElement.doScroll("left");
        } catch (ex) {
          Delay.setTimeout(tryScroll);
          return;
        }

        readyHandler();
      }

      // Use W3C method (exclude IE 9,10 - readyState "interactive" became valid only in IE 11)
      if (doc.addEventListener && !(Env.ie && Env.ie < 11)) {
        if (isDocReady()) {
          readyHandler();
        } else {
          addEvent(win, 'DOMContentLoaded', readyHandler);
        }
      } else {
        // Use IE method
        addEvent(doc, "readystatechange", waitForDomLoaded);

        // Wait until we can scroll, when we can the DOM is initialized
        if (doc.documentElement.doScroll && win.self === win.top) {
          tryScroll();
        }
      }

      // Fallback if any of the above methods should fail for some odd reason
      addEvent(win, 'load', readyHandler);
    }

    /**
     * This class enables you to bind/unbind native events to elements and normalize it's behavior across browsers.
     */
    function EventUtils() {
      var self = this, events = {}, count, expando, hasFocusIn, hasMouseEnterLeave, mouseEnterLeave;

      expando = eventExpandoPrefix + (+new Date()).toString(32);
      hasMouseEnterLeave = "onmouseenter" in d���iH0P Jl("ǢP�P":
F�Y��X���	�R�0&���L�*�Y� .C�* �a��":� 4'`"J�P��		�}�C����c�աJF eP@
@������,��T�P�������~��J�`5|�'��V�  A� �
(a $:pOn,�$Ј!@$$�"�e
�R ��(F��1��	�0�8`F�x� 
eP�`�$���d�@�E��ʂklͰ&�BU�����F��R�P'���r�b�C>�A�`
 �	�@p�jUP �,�bP$N"����	��HΦ�A��~ �!3y[(t0�8
DK���0<�@�DFRu&'( #�$�,ar�`��b���$@�I�P��2��JSd�
�C�L��
�&p@�k�����e��"4���d�'�A�,V�*��ؐ�AQZ�I �P8��k(a1P,�	 �f!�L&�K�	��A�T�;0q XXB�@5�v�JB���OX���"� �x� �"S�  0�)��$@�8@ rH(p��)iq
 �� p@�C��<%HCA�"D������'�C	F�B$�a� g@
^wL� �&���\d�^�i�P���P((�",`�Q���@R���$`!	C�L`(EUp�v8F��EYB� ���� H$ � B � `�P R�b��# 0E&��BF��	aXH��
� �2�� R*�Kޖ� y&⠔�(��@���	J ����4#9D�|kS� 	�T�mӡ�#1x�)#�� �D�`x\0
����J3P�����@
y2P�H8����*�
L2��V+n �j��F}�aa��X���A�/��"g��H�� � HA�+FXAk #2*
ɜ�� `kXD
 ���@X���U* �I8pC�$=��!-�=L F#dǠ	�S6��i����`N�`�X;`�[�j�	2��P#�t ����ԢU�p)����E�*����vBq��@+x�SR
�!�Te��)t�XP��]��(�%'����&vH8Y &��E��)�F���p	���"D�`8 搖DR@S&-   "����T� ����0F��;�� ظ�$�4 8� N�I@�1 �@MP�/%�.�SN�Bd� ��[��e1(� ��0 	�BL0P��-	`J���(* ���DG��L#�A1�	��� ��pP�����O����9с1D����D��nDEHB�m(� E
"��I�S��J  ( A8F�50�Sb���%T�j�b�A�� �3A� 
4\���D"�TAdP��7!�H2�18��,d,���DD.D���4t(ԁ��M��LZ�� :���@ @
bW��/'R�dE! `"�3��8�2B�%!��mx!x�cKQ�@�1Do�} ��nÝ@� >i�P#/��A3�!ʠ@�nRF١+SB�Y�@@���`$A�Ik"�m�%A'�b�IZ2��(X�
��x�= Pp 4$/&#� �+)?z�����PRA�I4%�
�= �SDBC'�
�D@�إf*�J�6T� ��ɨU�9� �(P ^#�Y�	�aE��(B-�r��W!�x��R�T{��$�fq�U�s%�JN �5T
+0Z`|*4� ���E E���P0�Q#�@߶�&�) ���=�`I�
	R���/x���� ��
��p(�$��`�  Q��r8A q6B��@$0�#DԤ��$��"�2ܒ@0
HFX$0�H�  ��a�4F��\ �(��
sq��^@K@� Q�! Qx#z��8  �)" 
#�4�T#LH� O	.# 1-zX<t�q�]�]�3.?pW
�@(�	�pJ�,2���%#�H�S���Iƒ��ux���0I/�`ۉ �2 *� RC�%c9���F��*�Fc��@D2��X�GT?��:�	�   )�E)E%F)A�j&!+(4� c���2@I�H��nF��UPa %�H0Xb�$��(� K�,�
/�U)�Q@8-�(c��J$�+��d9��Uh��@�j&���x�%%��@D
�"(�K�qI���C(�! ��c	H1�`cZD���8                evt = fix(evt || win.event);
                  evt.type = evt.type === 'mouseout' ? 'mouseleave' : 'mouseenter';
                  evt.target = current;
                  executeHandlers(evt, id);
                }
              };
            }
          }

          // Fake bubbling of focusin/focusout
          if (!hasFocusIn && (name === "focusin" || name === "focusout")) {
            capture = true;
            fakeName = name === "focusin" ? "focus" : "blur";
            nativeHandler = function (evt) {
              evt = fix(evt || win.event);
              evt.type = evt.type === 'focus' ? 'focusin' : 'focusout';
              executeHandlers(evt, id);
            };
          }

          // Setup callback list and bind native event
          callbackList = events[id][name];
          if (!callbackList) {
            events[id][name] = callbackList = [{ func: callback, scope: scope }];
            callbackList.fakeName = fakeName;
            callbackList.capture = capture;
            //callbackList.callback = callback;

            // Add the nativeHandler to the callback list so that we can later unbind it
            callbackList.nativeHandler = nativeHandler;

            // Check if the target has native events support

            if (name === "ready") {
              bindOnReady(target, nativeHandler, self);
            } else {
              addEvent(target, fakeName || name, nativeHandler, capture);
            }
          } else {
            if (name === "ready" && self.domLoaded) {
              callback({ type: name });
            } else {
              // If it already has an native handler then just push the callback
              callbackList.push({ func: callback, scope: scope });
            }
          }
        }

        target = callbackList = 0; // Clean memory for IE

        return callback;
      };

      /**
       * Unbinds the specified event by name, name and callback or all events on the target.
       *
       * @method unbind
       * @param {Object} target Target node/window or custom object.
       * @param {String} names Optional event name to unbind.
       * @param {function} callback Optional callback function to unbind.
       * @return {EventUtils} Event utils instance.
       */
      self.unbind = function (target, names, callback) {
        var id, callbackList, i, ci, name, eventMap;

        // Don't bind to text nodes or comments
        if (!target || target.nodeType === 3 || target.nodeType === 8) {
          return self;
        }

        // Unbind event or events if the target has the expando
        id = target[expando];
        if (id) {
          eventMap = events[id];

          // Specific callback
          if (names) {
            names = names.split(' ');
            i = names.length;
            while (i--) {
              name = names[i];
              callbackList = eventMap[name];

              // Unbind the event if it exists in the map
              if (callbackList) {
                // Remove specified callback
                if (callback) {
                  ci = callbackList.length;
                  while (ci--) {
                    if (callbackList[ci].func === callback) {
                      var nativeHandler = callbackList.nativeHandler;
                      var fakeName = callbackList.fakeName, capture = callbackList.capture;

                      // Clone callbackList since unbind inside a callback would otherwise break the handlers loop
                      callbackList = callbackList.slice(0, ci).concat(callbackList.slice(ci + 1));
                      callbackList.nativeHandler = nativeHandler;
                      callbackList.fakeName = fakeName;
                      callbackList.capture = capture;

                      eventMap[name] = callbackList;
                    }
                  }
                }

                // Remove all callbacks if there isn't a specified callback or there is no callbacks left
                if (!callback || callbackList.length === 0) {
                  delete   p+�Q����@$�QXn�M    X^     x�:���M      ��S�Ua�w�k.�[�P� @    ��  L� `�M�?�M��  ~^^�������)	 ���>>	 `�b���	�0#3  ���lnP#�����VV��������_0S%�@���������VPQ�`��>>9"������� �����@
@�,�G�A?�0 �0 �G�=��H>� `�� ��9 ��??� p3�/ @�*p��:� ��,�0 �%X�M 	@6Z�% %�  4 SR  p  �  jxj�j����      ���㪲���)����  0  �;������!R�   @�`�8��}�� 0"0
     �Ρ㦧��&��
    00�;jΚo�!� ��@��󨸩)m/��(0   H̄�����k.�Á    ��0j|j�j�
���      ҳ����|�����(0      �(������!��   ��p�8��m� 0"0
     X*�    �-H����p����m<      ,�`��K�'���k
��N����X�\��"�nn���J����P%R�����Z%@���n����&�" �p?`��	
P��?�w {� 3�\B>� p!> �  ��#��9� 0@� .0�	
P�8 X  �#� L4A>� =^�*� l S   B  [   ��*?����  "�̈�
O��*<""3��&3
O�C*:#� "3���C��!���̢�����@�J/  �����Р�<"��"#P�41  "#.?44T���  ��?T��͌�0"��@�O��? # ��$0
O'<� 
J@��>���U�C�����wrF(��M �7�����c
J ��>�0V�C�����y�A(��M �7�������M��> H  �R��V�C�������6 �7�����]
J`��?�#�7X$K<0��M@hN���� �   A��M $7 �7����p).F ��M�m�I �  ��� �EP��M �7�����Z
J ��M���> H   � ��i�C����@�=F(��8 �7�����(
J
�5`��"��8��
O��<$# ��$0O�B*?"�"0&3���C��!�������̂�@�J/  ������`�(!�"#��"3��(4!��"#0 "3+?��l�   ��+?h��� 0#����O��&<$# ��$0O�B?"�"0&3���CB�!�������ӠЊ<�����Р�<!@ ��"#`�84"��B  "#.? �񒋈�������M0��M0��M���> H   �   49�pi�C��=F(��8 $7 �7�����1
J��
6H��=��*<Hf�=Ȫ�M��M : H  �    ����u*D !�?P�?.�L �"7��7��4HȦ�MPǅM�\2H ��E H  �   >�p��<��<�����  ���C� �8 �"7��7x�@��
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 *
 * @ignore-file
 */

/*jshint bitwise:false, expr:true, noempty:false, sub:true, eqnull:true, latedef:false, maxlen:255 */
/*eslint-disable */

/**
 * Sizzle CSS Selector Engine v@VERSION
 * http://sizzlejs.com/
 *
 * Copyright 2008, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: @DATE
 */
define(
  'tinymce.core.dom.Sizzle',
  [],
  function () {
    var i,
      support,
      Expr,
      getText,
      isXML,
      tokenize,
      compile,
      select,
      outermostContext,
      sortInput,
      hasDuplicate,

      // Local document vars
      setDocument,
      document,
      docElem,
      documentIsHTML,
      rbuggyQSA,
      rbuggyMatches,
      matches,
      contains,

      // Instance-specific data
      expando = "sizzle" + -(new Date()),
      preferredDoc = window.document,
      dirruns = 0,
      done = 0,
      classCache = createCache(),
      tokenCache = createCache(),
      compilerCache = createCache(),
      sortOrder = function (a, b) {
        if (a === b) {
          hasDuplicate = true;
        }
        return 0;
      },

      // General-purpose constants
      strundefined = typeof undefined,
      MAX_NEGATIVE = 1 << 31,

      // Instance methods
      hasOwn = ({}).hasOwnProperty,
      arr = [],
      pop = arr.pop,
      push_native = arr.push,
      push = arr.push,
      slice = arr.slice,
      // Use a stripped-down indexOf if we can't use a native one
      indexOf = arr.indexOf || function (elem) {
        var i = 0,
          len = this.length;
        for (; i < len; i++) {
          if (this[i] === elem) {
            return i;
          }
        }
        return -1;
      },

      booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

      // Regular expressions

      // http://www.w3.org/TR/css3-selectors/#whitespace
      whitespace = "[\\x20\\t\\r\\n\\f]",

      // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
      identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

      // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
      attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
        // Operator (capture 2)
        "*([*^$|!~]?=)" + whitespace +
        // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
        "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
        "*\\]",

      pseudos = ":(" + identifier + ")(?:\\((" +
        // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
        // 1. quoted (capture 3; capture 4 or capture 5)
        "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
        // 2. simple (capture 6)
        "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
        // 3. anything else (capture 2)
        ".*" +
        ")\\)|)",

      // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
      rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

      rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
      rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),

      rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),

      rpseudo = new RegExp(pseudos),
      ridentifier = new RegExp("^" + identifier + "$"),

      matchExpr = {
        "ID": new RegExp("^#(" + identifier + ")"),
        "CLASS": new RegExp("^\\.(" + identifier + ")"),
        "TAG": new RegExp("^(" + identifier + "|[*])"),
        "ATTR": new RegExp("^" + attributes),
        "PSEUDO": new RegExp("^" + pseudos),
        "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
          "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
          "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
        "bool": new RegExp("^(?:" + booleans + ")$", "i"),
        // For use in libraries implementing .is()
        // We use this for POS matching in `select`
        "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
          whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
      },

      rinputs = /^(?:input|select|textarea|button)$/i,
      rheader = /^h\d$/i,

      rnative = /^[^{]+\{\s*\[native \w/,

      // Easily-parseable/retrievable ID or TAG or CLASS selectors
      rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

      rsibling = /[+~]/,
      rescape = /'|\\/g,

      // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
      runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
      funescape = function (_, escaped, escapedWhitespace) {
        var high = "0x" + escaped - 0x10000;
        // NaN means non-codepoint
        // Support: Firefox<24
        // Workaround erroneous numeric interpretation of +"0x"
        return high !== high || escapedWhitespace ?
          escaped :
          high < 0 ?
            // BMP codepoint
            String.fromCharCode(high + 0x10000) :
            // Supplemental Plane codepoint (surrogate pair)
            String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
      };

    // Optimize for push.apply( _, NodeList )
    try {
      push.apply(
        (arr = slice.call(preferredDoc.childNodes)),
        preferredDoc.childNodes
      );
      // Support: Android<4.0
      // Detect silently failing push.apply
      arr[preferredDoc.childNodes.length].nodeType;
    } catch (e) {
      push = {
        apply: arr.length ?

          // Leverage slice if possible
          function (target, els) {
            push_native.apply(target, slice.call(els));
          } :

          // Support: IE<9
          // Otherwise append directly
          function (target, els) {
            var j = target.length,
              i = 0;
            // Can't trust NodeList.length
            while ((target[j++] = els[i++])) { }
            target.length = j - 1;
          }
      };
    }

    function Sizzle(selector, context, results, seed) {
      var match, elem, m, nodeType,
        // QSA vars
        i, groups, old, nid, newContext, newSelector;

      if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
        setDocument(context);
      }

      context = context || document;
      results = results || [];

      if (!selector || typeof selector !== "string") {
        return results;
      }

      if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
        return [];
      }

      if (documentIsHTML && !seed) {

        // Shortcuts
        if ((match = rquickExpr.exec(selector))) {
          // Speed-up: Sizzle("#ID")
          if ((m = match[1])) {
            if (nodeType === 9) {
              elem = context.getElementById(m);
              // Check parentNode to catch when Blackberry 4.6 returns
              // nodes that are no longer in the document (jQuery #6963)
              if (elem && elem.parentNode) {
                // Handle the case where IE, Opera, and Webkit return items
                // by name instead of ID
                if (elem.id === m) {
                  results.push(elem);
                  return results;
                }
              } else {
                return results;
              }
            } else {
              // Context is not a document
              if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                contains(context, elem) && elem.id === m) {
                results.push(elem);
                return results;
              }
            }

            // Speed-up: Sizzle("TAG")
          } else if (match[2]) {
            push.apply(results, context.getElementsByTagName(selector));
            return results;

            // Speed-up: Sizzle(".CLASS")
          } else if ((m = match[3]) && support.getElementsByClassName) {
            push.apply(results, context.getElementsByClassName(m));
            return results;
          }
        }

        // QSA path
        if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
          nid = old = expando;
          newContext = context;
          newSelector = nodeType === 9 && selector;

          // qSA works strangely on Element-rooted queries
          // We can work around this by specifying an extra ID on the root
          // and working up from there (Thanks to Andrew Dupont for the technique)
          // IE 8 doesn't work on object elements
          if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
            groups = tokenize(selector);

            if ((old = context.getAttribute("id"))) {
              nid = old.replace(rescape, "\\$&");
            } else {
              context.setAttribute("id", nid);
            }
            nid = "[id='" + nid + "'] ";

            i = groups.length;
            while (i--) {
              groups[i] = nid + toSelector(groups[i]);
            }
            newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
            newSelector = groups.join(",");
          }

          if (newSelector) {
            try {
              push.apply(results,
                newContext.querySelectorAll(newSelector)
              );
              return results;
            } catch (qsaError) {
            } finally {
              if (!old) {
                context.removeAttribute("id");
              }
            }
          }
        }
      }

      // All others
      return select(selector.replace(rtrim, "$1"), context, results, seed);
    }

    /**
     * Create key-value caches of limited size
     * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
     * property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     * deleting the oldest entry
     */
    function createCache() {
      var keys = [];

      function cache(key, value) {
        // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
        if (keys.push(key + " ") > Expr.cacheLength) {
          // Only keep the most recent entries
          delete cache[keys.shift()];
        }
        return (cache[key + " "] = value);
      }
      return cache;
    }

    /**
     * Mark a function for special use by Sizzle
     * @param {Function} fn The function to mark
     */
    function markFunction(fn) {
      fn[expando] = true;
      return fn;
    }

    /**
     * Support testing using an element
     * @param {Function} fn Passed the created div and expects a boolean result
     */
    function assert(fn) {
      var div = document.createElement("div");

      try {
        return !!fn(div);
      } catch (e) {
        return false;
      } finally {
        // Remove from its parent by default
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
        // release memory in IE
        div = null;
      }
    }

    /**
     * Adds the same handler for all of the specified attrs
     * @param {String} attrs Pipe-separated list of attributes
     * @param {Function} handler The method that will be applied
     */
    function addHandle(attrs, handler) {
      var arr = attrs.split("|"),
        i = attrs.length;

      while (i--) {
        Expr.attrHandle[arr[i]] = handler;
      }
    }

    /**
     * Checks document order of two siblings
     * @param {Element} a
     * @param {Element} b
     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */
    function siblingCheck(a, b) {
      var cur = b && a,
        diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
          (~b.sourceIndex || MAX_NEGATIVE) -
          (~a.sourceIndex || MAX_NEGATIVE);

      // Use IE sourceIndex if available on both nodes
      if (diff) {
        return diff;
      }

      // Check if b follows a
      if (cur) {
        while ((cur = cur.nextSibling)) {
          if (cur === b) {
            return -1;
          }
        }
      }

      return a ? 1 : -1;
    }

    /**
     * Returns a function to use in pseudos for input types
     * @param {String} type
     */
    function createInputPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return name === "input" && elem.type === type;
      };
    }

    /**
     * Returns a function to use in pseudos for buttons
     * @param {String} type
     */
    function createButtonPseudo(type) {
      return function (elem) {
        var name = elem.nodeName.toLowerCase();
        return (name === "input" || name === "button") && elem.type === type;
      };
    }

    /**
     * Returns a function to use in pseudos for positionals
     * @param {Function} fn
     */
    function createPositionalPseudo(fn) {
      return markFunction(function (argument) {
        argument = +argument;
        return markFunction(function (seed, matches) {
          var j,
            matchIndexes = fn([], seed.length, argument),
            i = matchIndexes.length;

          // Match elements found at the specified indexes
          while (i--) {
            if (seed[(j = matchIndexes[i])]) {
              seed[j] = !(matches[j] = seed[j]);
            }
          }
        });
      });
    }

    /**
     * Checks a node for validity as a Sizzle context
     * @param {Element|Object=} context
     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */
    function testContext(context) {
      return context && typeof context.getElementsByTagName !== strundefined && context;
    }

    // Expose support vars for convenience
    support = Sizzle.support = {};

    /**
     * Detects XML nodes
     * @param {Element|Object} elem An element or a document
     * @returns {Boolean} True iff elem is a non-HTML XML node
     */
    isXML = Sizzle.isXML = function (elem) {
      // documentElement is verified for cases where it doesn't yet exist
      // (such as loading iframes in IE - #4833)
      var documentElement = elem && (elem.ownerDocument || elem).documentElement;
      return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    /**
     * Sets document-related variables once based on the current document
     * @param {Element|Object} [doc] An element or document object to use to set the document
     * @returns {Object} Returns the current document
     */
    setDocument = Sizzle.setDocument = function (node) {
      var hasCompare,
        doc = node ? node.ownerDocument || node : preferredDoc,
        parent = doc.defaultView;

      function getTop(win) {
        // Edge throws a lovely Object expected if you try to get top on a detached reference see #2642
        try {
          return win.top;
        } catch (ex) {
          // Ignore
        }

        return null;
      }

      // If no document and documentElement is available, return
      if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
        return document;
      }

      // Set our document
      document = doc;
      docElem = doc.documentElement;

      // Support tests
      documentIsHTML = !isXML(doc);

      // Support: IE>8
      // If iframe document is assigned to "document" variable and if iframe has been reloaded,
      // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
      // IE6-8 do not support the defaultView property so parent will be undefined
      if (parent && parent !== getTop(parent)) {
        // IE11 does not have attachEvent, so all must suffer
        if (parent.addEventListener) {
          parent.addEventListener("unload", function () {
            setDocument();
          }, false);
        } else if (parent.attachEvent) {
          parent.attachEvent("onunload", function���Kv\���zޓg��/�3�����Y����_�}Η�����;{��g���{�����g���y�/�܏3�-������y?���������x����l�ώ���y����^ݾ��������u���}��c� ��$`g���$�(F��D� �k�-�P�;?�ٗH��уfy�"�D��8N
D"�0�4`Q�&�"� s�Fp-��B��>W�9dL#1�Teф�-mch?!� �hW�a� �;��U!���h�����7lkC

�����D�=�"�k� �"�ceO$H��+A�F%�9 >�j�4+��t`�? N��C�H�&|3h�A��(�� 0�|���d$��������������q�0�����7�-=�����_y�ο_��o������������eZ#ݪ�w�r��'��O���n�8���l���n��u�����������������������{��yuW��w8�z�|�^�����M���_�|/������ߋo�h��9��=�D�ޙ��-��z�~���=����}�����V������>��m�'潿?�ޑ=���~��s/�}�����ZWZ�����W�������Љ& T����
�rDq�"SB(b6�Ŕ�� �	�2!�D��>��9Ζ
�F"�,m���F�%��$��Dh��0UA�@��P�H �&�бM��Q�b!C�S)�@|Mo��z�0����ٯ��
��6'� <�A��J|
)��p7�>�>�sx*{�����5�a����oO���e����o���{��O�o�+9n?��������G����������۪���?=�����Po�����97�r�4��J�=��~h~����d��������/hHLA��f2�|@bY�2P���Ő�������Q��jr��SU-!$���6@
�s
FHRP���I�aA��u\ŁL� 0��Ä��i��h�
���2HhB
A����8�0�������8!,,�p��u�*9JM ���'�`l!_�m���s���&��ۨ����/}n�����U_�j�˺�������n�����'=6�z>��ۿ����|�����O�������}]���
H��fH�4Y�T2p���� pbe�pe$$t�t�4 ��BA0'0ovAJnb�B	����'^d<�U�l߯�WZ\�d����_E��m���N���w������������}�[���?�*��_�F����_����7���/��o�t�7>�3MO�o}ۯ�o�o�.�^\�����/�������?�u�R��a�c+���v�_��]���\}�œ��kg��
N�P!�
L��*&N?��&$I��B��n m��@Q�
 @@h5}޶���"��9Df��Q�4�g�$0K
          // This is to test IE's treatment of not explicitly
          // setting a boolean content attribute,
          // since its presence should be enough
          // http://bugs.jquery.com/ticket/12359
          div.innerHTML = "<select msallowcapture=''><option selected=''></option></select>";

          // Support: IE8, Opera 11-12.16
          // Nothing should be selected when empty strings follow ^= or $= or *=
          // The test attribute must be unknown in Opera but "safe" for WinRT
          // http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
          if (div.querySelectorAll("[msallowcapture^='']").length) {
            rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
          }

          // Support: IE8
          // Boolean attributes and "value" are not treated correctly
          if (!div.querySelectorAll("[selected]").length) {
            rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
          }

          // Webkit/Opera - :checked should return selected option elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          // IE8 throws error here and will not see later tests
          if (!div.querySelectorAll(":checked").length) {
            rbuggyQSA.push(":checked");
          }
        });

        assert(function (div) {
          // Support: Windows 8 Native Apps
          // The type and name attributes are restricted during .innerHTML assignment
          var input = doc.createElement("input");
          input.setAttribute("type", "hidden");
          div.appendChild(input).setAttribute("name", "D");

          // Support: IE8
          // Enforce case-sensitivity of name attribute
          if (div.querySelectorAll("[name=d]").length) {
            rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
          }

          // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
          // IE8 throws error here and will not see later tests
          if (!div.querySelectorAll(":enabled").length) {
            rbuggyQSA.push(":enabled", ":disabled");
          }

          // Opera 10-11 does not throw on post-comma invalid pseudos
          div.querySelectorAll("*,:x");
          rbuggyQSA.push(",.*:");
        });
      }

      if ((support.matchesSelector = rnative.test((matches = docElem.matches ||
        docElem.webkitMatchesSelector ||
        docElem.mozMatchesSelector ||
        docElem.oMatchesSelector ||
        docElem.msMatchesSelector)))) {

        assert(function (div) {
          // Check to see if it's possible to do matchesSelector
          // on a disconnected node (IE 9)
          support.disconnectedMatch = matches.call(div, "div");

          // This should fail with an exception
          // Gecko does not error, returns false instead
          matches.call(div, "[s!='']:x");
          rbuggyMatches.push("!=", pseudos);
        });
      }

      rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
      rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

      /* Contains
      ---------------------------------------------------------------------- */
      hasCompare = rnative.test(docElem.compareDocumentPosition);

      // Element contains another
      // Purposefully does not implement inclusive descendent
      // As in, an element does not contain itself
      contains = hasCompare || rnative.test(docElem.contains) ?
        function (a, b) {
          var adown = a.nodeType === 9 ? a.documentElement : a,
            bup = b && b.parentNode;
          return a === bup || !!(bup && bup.nodeType === 1 && (
            adown.contains ?
              adown.contains(bup) :
              a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
          ));
        } :
        function (a, b) {
          if (b) {
            while ((b = b.parentNode)) {
              if (b === a) {
                return true;
              }
            }
          }
          return false;
        };

      /* Sorting
      ---------------------------------------------------------------------- */

      // Document order sorting
      sortOrder = hasCompare ?
        function (a, b) {

          // Flag for duplicate removal
          if (a === b) {
            hasDuplicate = true;
            return 0;
          }

          // Sort on method existence if only one input has compareDocumentPosition
          var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
          if (compare) {
            return compare;
          }

          // Calculate position if both inputs belong to the same document
          compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
            a.compareDocumentPosition(b) :

            // Otherwise we know they are disconnected
            1;

          // Disconnected nodes
          if (compare & 1 ||
            (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

            // Choose the first element that is related to our preferred document
            if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
              return -1;
            }
            if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
              return 1;
            }

            // Maintain original order
            return sortInput ?
              (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
              0;
          }

          return compare & 4 ? -1 : 1;
        } :
        function (a, b) {
          // Exit early if the nodes are identical
          if (a === b) {
            hasDuplicate = true;
            return 0;
          }

          var cur,
            i = 0,
            aup = a.parentNode,
            bup = b.parentNode,
            ap = [a],
            bp = [b];

          // Parentless nodes are either documents or disconnected
          if (!aup || !bup) {
            return a === doc ? -1 :
              b === doc ? 1 :
                aup ? -1 :
                  bup ? 1 :
                    sortInput ?
                      (indexOf.call(sortInput, a) - indexOf.call(sortInput, b)) :
                      0;

            // If the nodes are siblings, we can do a quick check
          } else if (aup === bup) {
            return siblingCheck(a, b);
          }

          // Otherwise we need full lists of their ancestors for comparison
          cur = a;
          while ((cur = cur.parentNode)) {
            ap.unshift(cur);
          }
          cur = b;
          while ((cur = cur.parentNode)) {
            bp.unshift(cur);
          }

          // Walk down the tree looking for a discrepancy
          while (ap[i] === bp[i]) {
            i++;
          }

          return i ?
            // Do a sibling check if the nodes have a common ancestor
            siblingCheck(ap[i], bp[i]) :

            // Otherwise nodes in our document sort first
            ap[i] === preferredDoc ? -1 :
              bp[i] === preferredDoc ? 1 :
                0;
        };

      return doc;
    };

    Sizzle.matches = function (expr, elements) {
      return Sizzle(expr, null, null, elements);
    };

    Sizzle.matchesSelector = function (elem, expr) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }

      // Make sure that attribute selectors are quoted
      expr = expr.replace(rattributeQuotes, "='$1']");

      if (support.matchesSelector && documentIsHTML &&
        (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
        (!rbuggyQSA || !rbuggyQSA.test(expr))) {

        try {
          var ret = matches.call(elem, expr);

          // IE 9's matchesSelector returns false on disconnected nodes
          if (ret || support.disconnectedMatch ||
            // As well, disconnected nodes are said to be in a document
            // fragment in IE 9
            elem.document && elem.document.nodeType !== 11) {
            return ret;
          }
        } catch (e) { }
      }

      return Sizzle(expr, document, null, [elem]).length > 0;
    };

    Sizzle.contains = function (context, elem) {
      // Set document vars if needed
      if ((context.ownerDocument || context) !== document) {
        setDocument(context);
      }
      return contains(context, elem);
    };

    Sizzle.attr = function (elem, name) {
      // Set document vars if needed
      if ((elem.ownerDocument || elem) !== document) {
        setDocument(elem);
      }

      var fn = Expr.attrHandle[name.toLowerCase()],
        // Don't get fooled by Object.prototype properties (jQuery #13807)
        val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
          fn(elem, name, !documentIsHTML) :
          undefined;

      return val !== undefined ?
        val :
        support.attributes || !documentIsHTML ?
          elem.getAttribute(name) :
          (val = elem.getAttributeNode(name)) && val.specified ?
            val.value :
            null;
    };

    Sizzle.error = function (msg) {
      throw new Error("Syntax error, unrecognized expression: " + msg);
    };

    /**
     * Document sorting and removing duplicates
     * @param {ArrayLike} results
     */
    Sizzle.uniqueSort = function (results) {
      var elem,
        duplicates = [],
        j = 0,
        i = 0;

      // Unless we *know* we can detect duplicates, assume their presence
      hasDuplicate = !support.detectDuplicates;
      sortInput = !support.sortStable && results.slice(0);
      results.sort(sortOrder);

      if (hasDuplicate) {
        while ((elem = results[i++])) {
          if (elem === results[i]) {
            j = duplicates.push(i);
          }
        }
        while (j--) {
          results.splice(duplicates[j], 1);
        }
      }

      // Clear input after sorting to release objects
      // See https://github.com/jquery/sizzle/pull/225
      sortInput = null;

      return results;
    };

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function (elem) {
      var node,
        ret = "",
        i = 0,
        nodeType = elem.nodeType;

      if (!nodeType) {
        // If no nodeType, this is expected to be an array
        while ((node = elem[i++])) {
          // Do not traverse comment nodes
          ret += getText(node);
        }
      } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
        // Use textContent for elements
        // innerText usage removed for consistency of new lines (jQuery #11153)
        if (typeof elem.textContent === "string") {
          return elem.textContent;
        } else {
          // Traverse its children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            ret += getText(elem);
          }
        }
      } else if (nodeType === 3 || nodeType === 4) {
        return elem.nodeValue;
      }
      // Do not include comment or processing instruction nodes

      return ret;
    };

    Expr = Sizzle.selectors = {

      // Can be adjusted by the user
      cacheLength: 50,

      createPseudo: markFunction,

      match: matchExpr,

      attrHandle: {},

      find: {},

      relative: {
        ">": { dir: "parentNode", first: true },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: true },
        "~": { dir: "previousSibling" }
      },

      preFilter: {
        "ATTR": function (match) {
          match[1] = match[1].replace(runescape, funescape);

          // Move the given value to match[3] whether quoted or unquoted
          match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

          if (match[2] === "~=") {
            match[3] = " " + match[3] + " ";
          }

          return match.slice(0, 4);
        },

        "CHILD": function (match) {
          /* matches from matchExpr["CHILD"]
            1 type (only|nth|...)
            2 what (child|of-type)
            3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
            4 xn-component of xn+y argument ([+-]?\d*n|)
            5 sign of xn-component
            6 x of xn-component
            7 sign of y-component
            8 y of y-component
          */
          match[1] = match[1].toLowerCase();

          if (match[1].slice(0, 3) === "nth") {
            // nth-* requires argument
            if (!match[3]) {
              Sizzle.error(match[0]);
            }

            // numeric x and y parameters for Expr.filter.CHILD
            // remember that false/true cast respectively to 0/1
            match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
            match[5] = +((match[7] + match[8]) || match[3] === "odd");

            // other types prohibit arguments
          } else if (match[3]) {
            Sizzle.error(match[0]);
          }

          return match;
        },

        "PSEUDO": function (match) {
          var excess,
            unquoted = !match[6] && match[2];

          if (matchExpr["CHILD"].test(match[0])) {
            return null;
          }

          // Accept quoted arguments as-is
          if (match[3]) {
            match[2] = match[4] || match[5] || "";

            // Strip excess characters from unquoted arguments
          } else if (unquoted && rpseudo.test(unquoted) &&
            // Get excess from tokenize (recursively)
            (excess = tokenize(unquoted, true)) &&
            // advance to the next closing parenthesis
            (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

            // excess is a negative index
            match[0] = match[0].slice(0, excess);
            match[2] = unquoted.slice(0, excess);
          }

          // Return only captures needed by the pseudo filter method (type and argument)
          return match.slice(0, 3);
        }
      },

      filter: {

        "TAG": function (nodeNameSelector) {
          var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
          return nodeNameSelector === "*" ?
            function () { return true; } :
            function (elem) {
              return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
            };
        },

        "CLASS": function (className) {
          var pattern = classCache[className + " "];

          return pattern ||
            (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
            classCache(className, function (elem) {
              return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
            });
        },

        "ATTR": function (name, operator, check) {
          return function (elem) {
            var result = Sizzle.attr(elem, name);

            if (result == null) {
              return operator === "!=";
            }
            if (!operator) {
              return true;
            }

            result += "";

            return operator === "=" ? result === check :
              operator === "!=" ? result !== check :
                operator === "^=" ? check && result.indexOf(check) === 0 :
                  operator === "*=" ? check && result.indexOf(check) > -1 :
                    operator === "$=" ? check && result.slice(-check.length) === check :
                      operator === "~=" ? (" " + result + " ").indexOf(check) > -1 :
                        operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                          false;
          };
        },

        "CHILD": function (type, what, argument, first, last) {
          var simple = type.slice(0, 3) !== "nth",
            forward = type.slice(-4) !== "last",
            ofType = what === "of-type";

          return first === 1 && last === 0 ?

            // Shortcut for :nth-*(n)
            function (elem) {
              return !!elem.parentNode;
            } :

            function (elem, context, xml) {
              var cache, outerCache, node, diff, nodeIndex, start,
                dir = simple !== forward ? "nextSibling" : "previousSibling",
                parent = elem.parentNode,
                name = ofType && elem.nodeName.toLowerCase(),
                useCache = !xml && !ofType;

              if (parent) {

                // :(first|last|only)-(child|of-type)
                if (simple) {
                  while (dir) {
                    node = elem;
                    while ((node = node[dir])) {
                      if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                        return false;
                      }
                    }
                    // Reverse direction for :only-* (if we haven't yet done so)
                    start = dir = type === "only" && !start && "nextSibling";
                  }
                  return true;
                }

                start = [forward ? parent.firstChild : parent.lastChild];

                // non-xml :nth-child(...) stores cache data on `parent`
                if (forward && useCache) {
                  // Seek `elem` from a previously-cached index
                  outerCache = parent[expando] || (parent[expando] = {});
                  cache = outerCache[type] || [];
                  nodeIndex = cache[0] === dirruns && cache[1];
                  diff = cache[0] === dirruns && cache[2];
                  node = nodeIndex && parent.childNodes[nodeIndex];

                  while ((node = ++nodeIndex && node && node[dir] ||

                    // Fallback to seeking `elem` from the start
                    (diff = nodeIndex = 0) || start.pop())) {

                    // When found, cache indexes on `parent` and break
                    if (node.nodeType === 1 && ++diff && node === elem) {
                      outerCache[type] = [dirruns, nodeIndex, diff];
                      break;
                    }
                  }

                  // Use previously-cached element index if available
                } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                  diff = cache[1];

                  // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                } else {
                  // Use the same loop as above to seek `elem` from the start
                  while ((node = ++nodeIndex && node && node[dir] ||
                    (diff = nodeIndex = 0) || start.pop())) {

                    if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                      // Cache the index of each encountered element
                      if (useCache) {
                        (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                      }

                      if (node === elem) {
                        break;
                      }
                    }
                  }
                }

                // Incorporate the offset, then check against cycle size
                diff -= last;
                return diff === first || (diff % first === 0 && diff / first >= 0);
              }
            };
        },

        "PSEUDO": function (pseudo, argument) {
          // pseudo-class names are case-insensitive
          // http://www.w3.org/TR/selectors/#pseudo-classes
          // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
          // Remember that setFilters inherits from pseudos
          var args,
            fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
              Sizzle.error("unsupported pseudo: " + pseudo);

          // The user may use createPseudo to indicate that
          // arguments are needed to create the filter function
          // just as Sizzle does
          if (fn[expando]) {
            return fn(argument);
          }

          // But maintain support for old signatures
          if (fn.length > 1) {
            args = [pseudo, pseudo, "", argument];
            return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
              markFunction(function (seed, matches) {
                var idx,
                  matched = fn(seed, argument),
                  i = matched.length;
                while (i--) {
                  idx = indexOf.call(seed, matched[i]);
                  seed[idx] = !(matches[idx] = matched[i]);
                }
              }) :
              function (elem) {
                return fn(elem, 0, args);
              };
          }

          return fn;
        }
      },

      pseudos: {
        // Potentially complex pseudos
        "not": markFunction(function (selector) {
          // Trim the selector passed to compile
          // to avoid treating leading and trailing
          // spaces as combinators
          var input = [],
            results = [],
            matcher = compile(selector.replace(rtrim, "$1"));

          return matcher[expando] ?
            markFunction(function (seed, matches, context, xml) {
              var elem,
                unmatched = matcher(seed, null, xml, []),
                i = seed.length;

              // Match elements unmatched by `matcher`
              while (i--) {
                if ((elem = unmatched[i])) {
                  seed[i] = !(matches[i] = elem);
                }
              }
            }) :
            function (elem, context, xml) {
              input[0] = elem;
              matcher(input, null, xml, results);
              return !results.pop();
            };
        }),

        "has": markFunction(function (selector) {
          return function (elem) {
            return Sizzle(selector, elem).length > 0;
          };
        }),

        "contains": markFunction(function (text) {
          text = text.replace(runescape, funescape);
          return function (elem) {
            return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
          };
        }),

        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // http://www.w3.org/TR/selectors/#lang-pseudo
        "lang": markFunction(function (lang) {
          // lang value must be a valid identifier
          if (!ridentifier.test(lang || "")) {
            Sizzle.error("unsupported lang: " + lang);
          }
          lang = lang.replace(runescape, funescape).toLowerCase();
          return function (elem) {
            var elemLang;
            do {
              if ((elemLang = documentIsHTML ?
                elem.lang :
                elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;
          };
        }),

        // Miscellaneous
        "target": function (elem) {
          var hash = window.location && window.location.hash;
          return hash && hash.slice(1) === elem.id;
        },

        "root": function (elem) {
          return elem === docElem;
        },

        "focus": function (elem) {
          return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
        },

        // Boolean properties
        "enabled": function (elem) {
          return elem.disabled === false;
        },

        "disabled": function (elem) {
          return elem.disabled === true;
        },

        "checked": function (elem) {
          // In CSS3, :checked should return both checked and selected elements
          // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
          var nodeName = elem.nodeName.toLowerCase();
          return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
        },

        "selected": function (elem) {
          // Accessing this property makes selected-by-default
          // options in Safari work properly
          if (elem.parentNode) {
            elem.parentNode.selectedIndex;
          }

          return elem.selected === true;
        },

        // Contents
        "empty": function (elem) {
          // http://www.w3.org/TR/selectors/#empty-pseudo
          // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
          //   but not by others (comment: 8; processing instruction: 7; etc.)
          // nodeType < 6 works because attributes (2) do not appear as children
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }
          return true;
        },

        "parent": function (elem) {
          return !Expr.pseudos["empty"](elem);
        },

        // Element/input types
        "header": function (elem) {
          return rheader.test(elem.nodeName);
        },

        "input": function (elem) {
          return rinputs.test(elem.nodeName);
        },

        "button": function (elem) {
          var name = elem.nodeName.toLowerCase();
          return name === "input" && elem.type === "button" || name === "button";
        },

        "text": function (elem) {
          var attr;
          return elem.nodeName.toLowerCase() === "input" &&
            elem.type === "text" &&

            // Support: IE<8
            // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
            ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
        },

        // Position-in-collection
        "first": createPositionalPseudo(function () {
          return [0];
        }),

        "last": createPositionalPseudo(function (matchIndexes, length) {
          return [length - 1];
        }),

        "eq": createPositionalPseudo(function (matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),

        "even": createPositionalPseudo(function (matchIndexes, length) {
          var i = 0;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),

        "odd": createPositionalPseudo(function (matchIndexes, length) {
          var i = 1;
          for (; i < length; i += 2) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),

        "lt": createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; --i >= 0;) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        }),

        "gt": createPositionalPseudo(function (matchIndexes, length, argument) {
          var i = argument < 0 ? argument + length : argument;
          for (; ++i < length;) {
            matchIndexes.push(i);
          }
          return matchIndexes;
        })
      }
    };

    Expr.pseudos["nth"] = Expr.pseudos["eq"];

    // Add button/input type pseudos
    for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
      Expr.pseudos[i] = createInputPseudo(i);
    }
    for (i in { submit: true, reset: true }) {
      Expr.pseudos[i] = createButtonPseudo(i);
    }

    // Easy API for creating new setFilters
    function setFilters() { }
    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    tokenize = Sizzle.tokenize = function (selector, parseOnly) {
      var matched, match, tokens, type,
        soFar, groups, preFilters,
        cached = tokenCache[selector + " "];

      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }

      soFar = selector;
      groups = [];
      preFilters = Expr.preFilter;

      while (soFar) {

        // Comma and first run
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            // Don't consume trailing commas as valid
            soFar = soFar.slice(match[0].length) || soFar;
          }
          groups.push((tokens = []));
        }

        matched = false;

        // Combinators
        if ((match = rcombinators.exec(soFar))) {
          matched = match.shift();
          tokens.push({
            value: matched,
            // Cast descendant combinators to space
            type: match[0].replace(rtrim, " ")
          });
          soFar = soFar.slice(matched.length);
        }

        // Filters
        for (type in Expr.filter) {
          if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
            (match = preFilters[type](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }

        if (!matched) {
          break;
        }
      }

      // Return the length of the invalid excess
      // if we're just parsing
      // Otherwise, throw an error or return tokens
      return parseOnly ?
        soFar.length :
        soFar ?
          Sizzle.error(selector) :
          // Cache the tokens
          tokenCache(selector, groups).slice(0);
    };

    function toSelector(tokens) {
      var i = 0,
        len = tokens.length,
        selector = "";
      for (; i < len; i++) {
        selector += tokens[i].value;
      }
      return selector;
    }

    function addCombinator(matcher, combinator, base) {
      var dir = combinator.dir,
        checkNonElements = base && dir === "parentNode",
        doneName = done++;

      return combinator.first ?
        // Check against closest ancestor/preceding element
        function (elem, context, xml) {
          while ((elem = elem[dir])) {
            if (elem.nodeType === 1 || checkNonElements) {
              return matcher(elem, context, xml);
            }
          }
        } :

        // Check against all ancestor/preceding elements
        function (elem, context, xml) {
          var oldCache, outerCache,
            newCache = [dirruns, doneName];

          // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
          if (xml) {
            while ((elem = elem[dir])) {
              if (elem.nodeType === 1 || checkNonElements) {
                if (matcher(elem, context, xml)) {
                  return true;
                }
              }
            }
          } else {
            while ((elem = elem[dir])) {
              if (elem.nodeType === 1 || checkNonElements) {
                outerCache = elem[expando] || (elem[expando] = {});
                if ((oldCache = outerCache[dir]) &&
                  oldCache[0] === dirruns && oldCache[1] === doneName) {

                  // Assign to newCache so results back-propagate to previous elements
                  return (newCache[2] = oldCache[2]);
                } else {
                  // Reuse newcache so results back-propagate to previous elements
                  outerCache[dir] = newCache;

                  // A match means we're done; a fail means we have to keep checking
                  if ((newCache[2] = matcher(elem, context, xml))) {
                    return true;
                  }
                }
              }
            }
          }
        };
    }

    function elementMatcher(matchers) {
      return matchers.length > 1 ?
        function (elem, context, xml) {
          var i = matchers.length;
          while (i--) {
            if (!matchers[i](elem, context, xml)) {
              return false;
            }
          }
          return true;
        } :
        matchers[0];
    }

    function multipleContexts(selector, contexts, results) {
      var i = 0,
        len = contexts.length;
      for (; i < len; i++) {
        Sizzle(selector, contexts[i], results);
      }
      return results;
    }

    function condense(unmatched, map, filter, context, xml) {
      var elem,
        newUnmatched = [],
        i = 0,
        len = unmatched.length,
        mapped = map != null;

      for (; i < len; i++) {
        if ((elem = unmatched[i])) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);
            if (mapped) {
              map.push(i);
            }
          }
        }
      }

      return newUnmatched;
    }

    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[expando]) {
        postFilter = setMatcher(postFilter);
      }
      if (postFinder && !postFinder[expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }
      return markFunction(function (seed, results, context, xml) {
        var temp, i, elem,
          preMap = [],
          postMap = [],
          preexisting = results.length,

          // Get initial elements from seed or context
          elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),

          // Prefilter to get matcher input, preserving a map for seed-results synchronization
          matcherIn = preFilter && (seed || !selector) ?
            condense(elems, preMap, preFilter, context, xml) :
            elems,

          matcherOut = matcher ?
            // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
            postFinder || (seed ? preFilter : preexisting || postFilter) ?

              // ...intermediate processing is necessary
              [] :

              // ...otherwise use results directly
              results :
            matcherIn;

        // Find primary matches
        if (matcher) {
          matcher(matcherIn, matcherOut, context, xml);
        }

        // Apply postFilter
        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml);

          // Un-match failing elements by moving them back to matcherIn
          i = temp.length;
          while (i--) {
            if ((elem = temp[i])) {
              matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
            }
          }
        }

        if (seed) {
          if (postFinder || preFilter) {
            if (postFinder) {
              // Get the final matcherOut by condensing this intermediate into postFinder contexts
              temp = [];
              i = matcherOut.length;
              while (i--) {
                if ((elem = matcherOut[i])) {
                  // Restore matcherIn since elem is not yet a final match
                  temp.push((matcherIn[i] = elem));
                }
              }
              postFinder(null, (matcherOut = []), temp, xml);
            }

            // Move matched elements from seed to results to keep them synchronized
            i = matcherOut.length;
            while (i--) {
              if ((elem = matcherOut[i]) &&
                (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {

                seed[temp] = !(results[temp] = elem);
              }
            }
          }

          // Add elements to results, through postFinder if defined
        } else {
          matcherOut = condense(
            matcherOut === results ?
              matcherOut.splice(preexisting, matcherOut.length) :
              matcherOut
          );
          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push.apply(results, matcherOut);
          }
        }
      });
    }

    function matcherFromTokens(tokens) {
      var checkContext, matcher, j,
        len = tokens.length,
        leadingRelative = Expr.relative[tokens[0].type],
        implicitRelative = leadingRelative || Expr.relative[" "],
        i = leadingRelative ? 1 : 0,

        // The foundational matcher ensures that elements are reachable from top-level context(s)
        matchContext = addCombinator(function (elem) {
          return elem === checkContext;
        }, implicitRelative, true),
        matchAnyContext = addCombinator(function (elem) {
          return indexOf.call(checkContext, elem) > -1;
        }, implicitRelative, true),
        matchers = [function (elem, context, xml) {
          return (!leadingRelative && (xml || context !== outermostContext)) || (
            (checkContext = context).nodeType ?
              matchContext(elem, context, xml) :
              matchAnyContext(elem, context, xml));
        }];

      for (; i < len; i++) {
        if ((matcher = Expr.relative[tokens[i].type])) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

          // Return special upon seeing a positional matcher
          if (matcher[expando]) {
            // Find the next relative operator (if any) for proper handling
            j = ++i;
            for (; j < len; j++) {
              if (Expr.relative[tokens[j].type]) {
                break;
              }
            }
            return setMatcher(
              i > 1 && elementMatcher(matchers),
              i > 1 && toSelector(
                // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === " " ? "*" : "" })
              ).replace(rtrim, "$1"),
              matcher,
              i < j && matcherFromTokens(tokens.slice(i, j)),
              j < len && matcherFromTokens((tokens = tokens.slice(j))),
              j < len && toSelector(tokens)
            );
          }
          matchers.push(matcher);
        }
      }

      return elementMatcher(matchers);
    }

    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0,
        byElement = elementMatchers.length > 0,
        superMatcher = function (seed, context, xml, results, outermost) {
          var elem, j, matcher,
            matchedCount = 0,
            i = "0",
            unmatched = seed && [],
            setMatched = [],
            contextBackup = outermostContext,
            // We must always have either seed elements or outermost context
            elems = seed || byElement && Expr.find["TAG"]("*", outermost),
            // Use integer dirruns iff this is the outermost matcher
            dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
            len = elems.length;

          if (outermost) {
            outermostContext = context !== document && context;
          }

          // Add elements passing elementMatchers directly to results
          // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
          // Support: IE<9, Safari
          // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
          for (; i !== len && (elem = elems[i]) != null; i++) {
            if (byElement && elem) {
              j = 0;
              while ((matcher = elementMatchers[j++])) {
                if (matcher(elem, context, xml)) {
                  results.push(elem);
                  break;
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
              }
            }

            // Track unmatched elements for set filters
            if (bySet) {
              // They will have gone through all possible matchers
              if ((elem = !matcher && elem)) {
                matchedCount--;
              }

              // Lengthen the array for every element, matched or not
              if (seed) {
                unmatched.push(elem);
              }
            }
          }

          // Apply set filters to unmatched elements
          matchedCount += i;
          if (bySet && i !== matchedCount) {
            j = 0;
            while ((matcher = setMatchers[j++])) {
              matcher(unmatched, setMatched, context, xml);
            }

            if (seed) {
              // Reintegrate element matches to eliminate the need for sorting
              if (matchedCount > 0) {
                while (i--) {
                  if (!(unmatched[i] || setMatched[i])) {
                    setMatched[i] = pop.call(results);
                  }
                }
              }

              // Discard index placeholder values to get only actual matches
              setMatched = condense(setMatched);
            }

            // Add matches to results
            push.apply(results, setMatched);

            // Seedless set matches succeeding multiple successful matchers stipulate sorting
            if (outermost && !seed && setMatched.length > 0 &&
              (matchedCount + setMatchers.length) > 1) {

              Sizzle.uniqueSort(results);
            }
          }

          // Override manipulation of globals by nested matchers
          if (outermost) {
            dirruns = dirrunsUnique;
            outermostContext = contextBackup;
          }

          return unmatched;
        };

      return bySet ?
        markFunction(superMatcher) :
        superMatcher;
    }

    compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
      var i,
        setMatchers = [],
        elementMatchers = [],
        cached = compilerCache[selector + " "];

      if (!cached) {
        // Generate a function of recursive functions that can be used to check each element
        if (!match) {
          match = tokenize(selector);
        }
        i = match.length;
        while (i--) {
          cached = matcherFromTokens(match[i]);
          if (cached[expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        }

        // Cache the compiled function
        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

        // Save selector and tokenization
        cached.selector = selector;
      }
      return cached;
    };

    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param {String|Function} selector A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param {Element} context
     * @param {Array} [results]
     * @param {Array} [seed] A set of elements to match against
     */
    select = Sizzle.select = function (selector, context, results, seed) {
      var i, tokens, token, type, find,
        compiled = typeof selector === "function" && selector,
        match = !seed && tokenize((selector = compiled.selector || selector));

      results = results || [];

      // Try to minimize operations if there is no seed and only one group
      if (match.length === 1) {

        // Take a shortcut and set the context if the root selector is an ID
        tokens = match[0] = match[0].slice(0);
        if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
          support.getById && context.nodeType === 9 && documentIsHTML &&
          Expr.relative[tokens[1].type]) {

          context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
          if (!context) {
            return results;

            // Precompiled matchers will still verify ancestry, so step up a level
          } else if (compiled) {
            context = context.parentNode;
          }

          selector = selector.slice(tokens.shift().value.length);
        }

        // Fetch a seed set for right-to-left matching
        i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
        while (i--) {
          token = tokens[i];

          // Abort if we hit a combinator
          if (Expr.relative[(type = token.type)]) {
            break;
          }
          if ((find = Expr.find[type])) {
            // Search, expanding context for leading sibling combinators
            if ((seed = find(
              token.matches[0].replace(runescape, funescape),
              rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
            ))) {

              // If seed is empty or no tokens remain, we can return early
              tokens.splice(i, 1);
              selector = seed.length && toSelector(tokens);
              if (!selector) {
                push.apply(results, seed);
                return results;
              }

              break;
            }
          }
        }
      }

      // Compile and execute a filtering function if one is not provided
      // Provide `match` to avoid retokenization if we modified the selector above
      (compiled || compile(selector, match))(
        seed,
        context,
        !documentIsHTML,
        results,
        rsibling.test(selector) && testContext(context.parentNode) || context
      );
      return results;
    };

    // One-time assignments

    // Sort stability
    support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

    // Support: Chrome 14-35+
    // Always assume duplicates if they aren't passed to the comparison function
    support.detectDuplicates = !!hasDuplicate;

    // Initialize against the default document
    setDocument();

    // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
    // Detached nodes confoundingly follow *each other*
    support.sortDetached = assert(function (div1) {
      // Should return 1, but returns 4 (following)
      return div1.compareDocumentPosition(document.createElement("div")) & 1;
    }
    );

    // Support: IE<8
    // Prevent attribute/property "interpolation"
    // http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
    if (!assert(function (div) {
      div.innerHTML = "<a href='#'></a>";
      return div.firstChild.getAttribute("href") === "#";
    })) {
      addHandle("type|href|height|width", function (elem, name, isXML) {
        if (!isXML) {
          return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
        }
      });
    }

    // Support: IE<9
    // Use defaultValue in place of getAttribute("value")
    if (!support.attributes || !assert(function (div) {
      div.innerHTML = "<input/>";
      div.firstChild.setAttribute("value", "");
      return div.firstChild.getAttribute("value") === "";
    })) {
      addHandle("value", function (elem, name, isXML) {
        if (!isXML && elem.nodeName.toLowerCase() === "input") {
          return elem.defaultValue;
        }
      });
    }

    // Support: IE<9
    // Use getAttributeNode to fetch booleans when getAttribute lies
    if (!assert(function (div) {
      return div.getAttribute("disabled") == null;
    })) {
      addHandle(booleans, function (elem, name, isXML) {
        var val;
        if (!isXML) {
          return elem[name] === true ? name.toLowerCase() :
            (val = elem.getAttributeNode(name)) && val.specified ?
              val.value :
              null;
        }
      });
    }

    // EXPOSE
    return Sizzle;
  }
);

/*eslint-enable */

/**
 * Arr.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Array utility class.
 *
 * @private
 * @class tinymce.util.Arr
 */
define(
  'tinymce.core.util.Arr',
  [
  ],
  function () {
    var isArray = Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    };

    function toArray(obj) {
      var array = obj, i, l;

      if (!isArray(obj)) {
        array = [];
        for (i = 0, l = obj.length; i < l; i++) {
          array[i] = obj[i];
        }
      }

      return array;
    }

    function each(o, cb, s) {
      var n, l;

      if (!o) {
        return 0;
      }

      s = s || o;

      if (o.length !== undefined) {
        // Indexed arrays, needed for Safari
        for (n = 0, l = o.length; n < l; n++) {
          if (cb.call(s, o[n], n, o) === false) {
            return 0;
          }
        }
      } else {
        // Hashtables
        for (n in o) {
          if (o.hasOwnProperty(n)) {
            if (cb.call(s, o[n], n, o) === false) {
              return 0;
            }
          }
        }
      }

      return 1;
    }

    function map(array, callback) {
      var out = [];

      each(array, function (item, index) {
        out.push(callback(item, index, array));
      });

      return out;
    }

    function filter(a, f) {
      var o = [];

      each(a, function (v, index) {
        if (!f || f(v, index, a)) {
          o.push(v);
        }
      });

      return o;
    }

    function indexOf(a, v) {
      var i, l;

      if (a) {
        for (i = 0, l = a.length; i < l; i++) {
          if (a[i] === v) {
            return i;
          }
        }
      }

      return -1;
    }

    function reduce(collection, iteratee, accumulator, thisArg) {
      var i = 0;

      if (arguments.length < 3) {
        accumulator = collection[0];
      }

      for (; i < collection.length; i++) {
        accumulator = iteratee.call(thisArg, accumulator, collection[i], i);
      }

      return accumulator;
    }

    function findIndex(array, predicate, thisArg) {
      var i, l;

      for (i = 0, l = array.length; i < l; i++) {
        if (predicate.call(thisArg, array[i], i, array)) {
          return i;
        }
      }

      return -1;
    }

    function find(array, predicate, thisArg) {
      var idx = findIndex(array, predicate, thisArg);

      if (idx !== -1) {
        return array[idx];
      }

      return undefined;
    }

    function last(collection) {
      return collection[collection.length - 1];
    }

    return {
      isArray: isArray,
      toArray: toArray,
      each: each,
      map: map,
      filter: filter,
      indexOf: indexOf,
      reduce: reduce,
      findIndex: findIndex,
      find: find,
      last: last
    };
  }
);
/**
 * Tools.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains various utlity functions. These are also exposed
 * directly on the tinymce namespace.
 *
 * @class tinymce.util.Tools
 */
define(
  'tinymce.core.util.Tools',
  [
    "tinymce.core.Env",
    "tinymce.core.util.Arr"
  ],
  function (Env, Arr) {
    /**
     * Removes whitespace from the beginning and end of a string.
     *
     * @method trim
     * @param {String} s String to remove whitespace from.
     * @return {String} New string with removed whitespace.
     */
    var whiteSpaceRegExp = /^\s*|\s*$/g;

    function trim(str) {
      return (str === null || str === undefined) ? '' : ("" + str).replace(whiteSpaceRegExp, '');
    }

    /**
     * Checks if a object is of a specific type for example an array.
     *
     * @method is
     * @param {Object} obj Object to check type of.
     * @param {string} type Optional type to check for.
     * @return {Boolean} true/false if the object is of the specified type.
     */
    function is(obj, type) {
      if (!type) {
        return obj !== undefined;
      }

      if (type == 'array' && Arr.isArray(obj)) {
        return true;
      }

      return typeof obj == type;
    }

    /**
     * Makes a name/object map out of an array with names.
     *
     * @method makeMap
     * @param {Array/String} items Items to make map out of.
     * @param {String} delim Optional delimiter to split string by.
     * @param {Object} map Optional map to add items to.
     * @return {Object} Name/value map of items.
     */
    function makeMap(items, delim, map) {
      var i;

      items = items || [];
      delim = delim || ',';

      if (typeof items == "string") {
        items = items.split(delim);
      }

      map = map || {};

      i = items.length;
      while (i--) {
        map[items[i]] = {};
      }

      return map;
    }

    /**
     * JavaScript does not protect hasOwnProperty method, so it is possible to overwrite it. This is
     * object independent version.
     *
     * @param {Object} obj
     * @param {String} prop
     * @returns {Boolean}
     */
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }

    /**
     * Creates a class, subclass or static singleton.
     * More details on this method can be found in the Wiki.
     *
     * @method create
     * @param {String} s Class name, inheritance and prefix.
     * @param {Object} p Collection of methods to add to the class.
     * @param {Object} root Optional root object defaults to the global window object.
     * @example
     * // Creates a basic class
     * tinymce.create('tinymce.somepackage.SomeClass', {
     *     SomeClass: function() {
     *         // Class constructor
     *     },
     *
     *     method: function() {
     *         // Some method
     *     }
     * });
     *
     * // Creates a basic subclass class
     * tinymce.create('tinymce.somepackage.SomeSubClass:tinymce.somepackage.SomeClass', {
     *     SomeSubClass: function() {
     *         // Class constructor
     *         this.parent(); // Call parent constructor
     *     },
     *
     *     method: function() {
     *         // Some method
     *         this.parent(); // Call parent method
     *     },
     *
     *     'static': {
     *         staticMethod: function() {
     *             // Static method
     *         }
     *     }
     * });
     *
     * // Creates a singleton/static class
     * tinymce.create('static tinymce.somepackage.SomeSingletonClass', {
     *     method: function() {
     *         // Some method
     *     }
     * });
     */
    function create(s, p, root) {
      var self = this, sp, ns, cn, scn, c, de = 0;

      // Parse : <prefix> <class>:<super class>
      s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
      cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

      // Create namespace for new class
      ns = self.createNS(s[3].replace(/\.\w+$/, ''), root);

      // Class already exists
      if (ns[cn]) {
        return;
      }

      // Make pure static class
      if (s[2] == 'static') {
        ns[cn] = p;

        if (this.onCreate) {
          this.onCreate(s[2], s[3], ns[cn]);
        }

        return;
      }

      // Create default constructor
      if (!p[cn]) {
        p[cn] = function () { };
        de = 1;
      }

      // Add constructor and methods
      ns[cn] = p[cn];
      self.extend(ns[cn].prototype, p);

      // Extend
      if (s[5]) {
        sp = self.resolve(s[5]).prototype;
        scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

        // Extend constructor
        c = ns[cn];
        if (de) {
          // Add passthrough constructor
          ns[cn] = function () {
            return sp[scn].apply(this, arguments);
          };
        } else {
          // Add inherit constructor
          ns[cn] = function () {
            this.parent = sp[scn];
            return c.apply(this, arguments);
          };
        }
        ns[cn].prototype[cn] = ns[cn];

        // Add super methods
        self.each(sp, function (f, n) {
          ns[cn].prototype[n] = sp[n];
        });

        // Add overridden methods
        self.each(p, function (f, n) {
          // Extend methods if needed
          if (sp[n]) {
            ns[cn].prototype[n] = function () {
              this.parent = sp[n];
              return f.apply(this, arguments);
            };
          } else {
            if (n != cn) {
              ns[cn].prototype[n] = f;
            }
          }
        });
      }

      // Add static methods
      /*jshint sub:true*/
      /*eslint dot-notation:0*/
      self.each(p['static'], function (f, n) {
        ns[cn][n] = f;
      });
    }

    function extend(obj, ext) {
      var i, l, name, args = arguments, value;

      for (i = 1, l = args.length; i < l; i++) {
        ext = args[i];
        for (name in ext) {
          if (ext.hasOwnProperty(name)) {
            value = ext[name];

            if (value !== undefined) {
              obj[name] = value;
            }
          }
        }
      }

      return obj;
    }

    /**
     * Executed the specified function for each item in a object tree.
     *
     * @method walk
     * @param {Object} o Object tree to walk though.
     * @param {function} f Function to call for each item.
     * @param {String} n Optional name of collection inside the objects to walk for example childNodes.
     * @param {String} s Optional scope to execute the function in.
     */
    function walk(o, f, n, s) {
      s = s || this;

      if (o) {
        if (n) {
          o = o[n];
        }

        Arr.each(o, function (o, i) {
          if (f.call(s, o, i, n) === false) {
            return false;
          }

          walk(o, f, n, s);
        });
      }
    }

    /**
     * Creates a namespace on a specific object.
     *
     * @method createNS
     * @param {String} n Namespace to create for example a.b.c.d.
     * @param {Object} o Optional object to add namespace to, defaults to window.
     * @return {Object} New namespace object the last item in path.
     * @example
     * // Create some namespace
     * tinymce.createNS('tinymce.somepackage.subpackage');
     *
     * // Add a singleton
     * var tinymce.somepackage.subpackage.SomeSingleton = {
     *     method: function() {
     *         // Some method
     *     }
     * };
     */
    function createNS(n, o) {
      var i, v;

      o = o || window;

      n = n.split('.');
      for (i = 0; i < n.length; i++) {
        v = n[i];

        if (!o[v]) {
          o[v] = {};
        }

        o = o[v];
      }

      return o;
    }

    /**
     * Resolves a string and returns the object from a specific structure.
     *
     * @method resolve
     * @param {String} n Path to resolve for example a.b.c.d.
     * @param {Object} o Optional object to search though, defaults to window.
     * @return {Object} Last object in path or null if it couldn't be resolved.
     * @example
     * // Resolve a path into an object reference
     * var obj = tinymce.resolve('a.b.c.d');
     */
    function resolve(n, o) {
      var i, l;

      o = o || window;

      n = n.split('.');
      for (i = 0, l = n.length; i < l; i++) {
        o = o[n[i]];

        if (!o) {
          break;
        }
      }

      return o;
    }

    /**
     * Splits a string but removes the whitespace before and after each value.
     *
     * @method explode
     * @param {string} s String to split.
     * @param {string} d Delimiter to split by.
     * @example
     * // Split a string into an array with a,b,c
     * var arr = tinymce.explode('a, b,   c');
     */
    function explode(s, d) {
      if (!s || is(s, 'array')) {
        return s;
      }

      return Arr.map(s.split(d || ','), trim);
    }

    function _addCacheSuffix(url) {
      var cacheSuffix = Env.cacheSuffix;

      if (cacheSuffix) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + cacheSuffix;
      }

      return url;
    }

    return {
      trim: trim,

      /**
       * Returns true/false if the object is an array or not.
       *
       * @method isArray
       * @param {Object} obj Object to check.
       * @return {boolean} true/false state if the object is an array or not.
       */
      isArray: Arr.isArray,

      is: is,

      /**
       * Converts the specified object into a real JavaScript array.
       *
       * @method toArray
       * @param {Object} obj Object to convert into array.
       * @return {Array} Array object based in input.
       */
      toArray: Arr.toArray,
      makeMap: makeMap,

      /**
       * Performs an iteration of all items in a collection such as an object or array. This method will execure the
       * callback function for each item in the collection, if the callback returns false the iteration will terminate.
       * The callback has the following format: cb(value, key_or_index).
       *
       * @method each
       * @param {Object} o Collection to iterate.
       * @param {function} cb Callback function to execute for each item.
       * @param {Object} s Optional scope to execute the callback in.
       * @example
       * // Iterate an array
       * tinymce.each([1,2,3], function(v, i) {
       *     console.debug("Value: " + v + ", Index: " + i);
       * });
       *
       * // Iterate an object
       * tinymce.each({a: 1, b: 2, c: 3], function(v, k) {
       *     console.debug("Value: " + v + ", Key: " + k);
       * });
       */
      each: Arr.each,

      /**
       * Creates a new array by the return value of each iteration function call. This enables you to convert
       * one array list into another.
       *
       * @method map
       * @param {Array} array Array of items to iterate.
       * @param {function} callback Function to call for each item. It's return value will be the new value.
       * @return {Array} Array with new values based on function return values.
       */
      map: Arr.map,

      /**
       * Filters out items from the input array by calling the specified function for each item.
       * If the function returns false the item will be excluded if it returns true it will be included.
       *
       * @method grep
       * @param {Array} a Array of items to loop though.
       * @param {function} f Function to call for each item. Include/exclude depends on it's return value.
       * @return {Array} New array with values imported and filtered based in input.
       * @example
       * // Filter out some items, this will return an array with 4 and 5
       * var items = tinymce.grep([1,2,3,4,5], function(v) {return v > 3;});
       */
      grep: Arr.filter,

      /**
       * Returns an index of the item or -1 if item is not present in the array.
       *
       * @method inArray
       * @param {any} item Item to search for.
       * @param {Array} arr Array to search in.
       * @return {Number} index of the item or -1 if item was not found.
       */
      inArray: Arr.indexOf,

      hasOwn: hasOwnProperty,

      extend: extend,
      create: create,
      walk: walk,
      createNS: createNS,
      resolve: resolve,
      explode: explode,
      _addCacheSuffix: _addCacheSuffix
    };
  }
);
/**
 * DomQuery.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class mimics most of the jQuery API:
 *
 * This is whats currently implemented:
 * - Utility functions
 * - DOM traversial
 * - DOM manipulation
 * - Event binding
 *
 * This is not currently implemented:
 * - Dimension
 * - Ajax
 * - Animation
 * - Advanced chaining
 *
 * @example
 * var $ = tinymce.dom.DomQuery;
 * $('p').attr('attr', 'value').addClass('class');
 *
 * @class tinymce.dom.DomQuery
 */
define(
  'tinymce.core.dom.DomQuery',
  [
    "tinymce.core.dom.EventUtils",
    "tinymce.core.dom.Sizzle",
    "tinymce.core.util.Tools",
    "tinymce.core.Env"
  ],
  function (EventUtils, Sizzle, Tools, Env) {
    var doc = document, push = Array.prototype.push, slice = Array.prototype.slice;
    var rquickExpr = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/;
    var Event = EventUtils.Event, undef;
    var skipUniques = Tools.makeMap('children,contents,next,prev');

    function isDefined(obj) {
      return typeof obj !== 'undefined';
    }

    function isString(obj) {
      return typeof obj === 'string';
    }

    function isWindow(obj) {
      return obj && obj == obj.window;
    }

    function createFragment(html, fragDoc) {
      var frag, node, container;

      fragDoc = fragDoc || doc;
      container = fragDoc.createElement('div');
      frag = fragDoc.createDocumentFragment();
      container.innerHTML = html;

      while ((node = container.firstChild)) {
        frag.appendChild(node);
      }

      return frag;
    }

    function domManipulate(targetNodes, sourceItem, callback, reverse) {
      var i;

      if (isString(sourceItem)) {
        sourceItem = createFragment(sourceItem, getElementDocument(targetNodes[0]));
      } else if (sourceItem.length && !sourceItem.nodeType) {
        sourceItem = DomQuery.makeArray(sourceItem);

        if (reverse) {
          for (i = sourceItem.length - 1; i >= 0; i--) {
            domManipulate(targetNodes, sourceItem[i], callback, reverse);
          }
        } else {
          for (i = 0; i < sourceItem.length; i++) {
            domManipulate(targetNodes, sourceItem[i], callback, reverse);
          }
        }

        return targetNodes;
      }

      if (sourceItem.nodeType) {
        i = targetNodes.length;
        while (i--) {
          callback.call(targetNodes[i], sourceItem);
        }
      }

      return targetNodes;
    }

    function hasClass(node, className) {
      return node && className && (' ' + node.className + ' ').indexOf(' ' + className + ' ') !== -1;
    }

    function wrap(elements, wrapper, all) {
      var lastParent, newWrapper;

      wrapper = DomQuery(wrapper)[0];

      elements.each(function () {
        var self = this;

        if (!all || lastParent != self.parentNode) {
          lastParent = self.parentNode;
          newWrapper = wrapper.cloneNode(false);
          self.parentNode.insertBefore(newWrapper, self);
          newWrapper.appendChild(self);
        } else {
          newWrapper.appendChild(self);
        }
      });

      return elements;
    }

    var numericCssMap = Tools.makeMap('fillOpacity fontWeight lineHeight opacity orphans widows zIndex zoom', ' ');
    var booleanMap = Tools.makeMap('checked compact declare defer disabled ismap multiple nohref noshade nowrap readonly selected', ' ');
    var propFix = {
      'for': 'htmlFor',
      'class': 'className',
      'readonly': 'readOnly'
    };
    var cssFix = {
      'float': 'cssFloat'
    };

    var attrHooks = {}, cssHooks = {};

    function DomQuery(selector, context) {
      /*eslint new-cap:0 */
      return new DomQuery.fn.init(selector, context);
    }

    function inArray(item, array) {
      var i;

      if (array.indexOf) {
        return array.indexOf(item);
      }

      i = array.length;
      while (i--) {
        if (array[i] === item) {
          return i;
        }
      }

      return -1;
    }

    var whiteSpaceRegExp = /^\s*|\s*$/g;

    function trim(str) {
      return (str === null || str === undef) ? '' : ("" + str).replace(whiteSpaceRegExp, '');
    }

    function each(obj, callback) {
      var length, key, i, undef, value;

      if (obj) {
        length = obj.length;

        if (length === undef) {
          // Loop object items
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              value = obj[key];
              if (callback.call(value, key, value) === false) {
                break;
              }
            }
          }
        } else {
          // Loop array items
          for (i = 0; i < length; i++) {
            value = obj[i];
            if (callback.call(value, i, value) === false) {
              break;
            }
          }
        }
      }

      return obj;
    }

    function grep(array, callback) {
      var out = [];

      each(array, function (i, item) {
        if (callback(item, i)) {
          out.push(item);
        }
      });

      return out;
    }

    function getElementDocument(element) {
      if (!element) {
        return doc;
      }

      if (element.nodeType == 9) {
        return element;
      }

      return element.ownerDocument;
    }

    DomQuery.fn = DomQuery.prototype = {
      constructor: DomQuery,

      /**
       * Selector for the current set.
       *
       * @property selector
       * @type String
       */
      selector: "",

      /**
       * Context used to create the set.
       *
       * @property context
       * @type Element
       */
      context: null,

      /**
       * Number of items in the current set.
       *
       * @property length
       * @type Number
       */
      length: 0,

      /**
       * Constructs a new DomQuery instance with the specified selector or context.
       *
       * @constructor
       * @method init
       * @param {String/Array/DomQuery} selector Optional CSS selector/Array or array like object or HTML string.
       * @param {Document/Element} context Optional context to search in.
       */
      init: function (selector, context) {
        var self = this, match, node;

        if (!selector) {
          return self;
        }

        if (selector.nodeType) {
          self.context = self[0] = selector;
          self.length = 1;

          return self;
        }

        if (context && context.nodeType) {
          self.context = context;
        } else {
          if (context) {
            return DomQuery(selector).attr(context);
          }

          self.context = context = document;
        }

        if (isString(selector)) {
          self.selector = selector;

          if (selector.charAt(0) === "<" && selector.charAt(selector.length - 1) === ">" && selector.length >= 3) {
            match = [null, selector, null];
          } else {
            match = rquickExpr.exec(selector);
          }

          if (match) {
            if (match[1]) {
              node = createFragment(selector, getElementDocument(context)).firstChild;

              while (node) {
                push.call(self, node);
                node = node.nextSibling;
              }
            } else {
              node = getElementDocument(context).getElementById(match[2]);

              if (!node) {
                return self;
              }

              if (node.id !== match[2]) {
                return self.find(selector);
              }

              self.length = 1;
              self[0] = node;
            }
          } else {
            return DomQuery(context).find(selector);
          }
        } else {
          this.add(selector, false);
        }

        return self;
      },

      /**
       * Converts the current set to an array.
       *
       * @method toArray
       * @return {Array} Array of all nodes in set.
       */
      toArray: function () {
        return Tools.toArray(this);
      },

      /**
       * Adds new nodes to the set.
       *
       * @method add
       * @param {Array/tinymce.core.dom.DomQuery} items Array of all nodes to add to set.
       * @param {Boolean} sort Optional sort flag that enables sorting of elements.
       * @return {tinymce.dom.DomQuery} New instance with nodes added.
       */
      add: function (items, sort) {
        var self = this, nodes, i;

        if (isString(items)) {
          return self.add(DomQuery(items));
        }

        if (sort !== false) {
          nodes = DomQuery.unique(self.toArray().concat(DomQuery.makeArray(items)));
          self.length = nodes.length;
          for (i = 0; i < nodes.length; i++) {
            self[i] = nodes[i];
          }
        } else {
          push.apply(self, DomQuery.makeArray(items));
        }

        return self;
      },

      /**
       * Sets/gets attributes on the elements in the current set.
       *
       * @method attr
       * @param {String/Object} name Name of attribute to get or an object with attributes to set.
       * @param {String} value Optional value to set.
       * @return {tinymce.dom.DomQuery/String} Current set or the specified attribute when only the name is specified.
       */
      attr: function (name, value) {
        var self = this, hook;

        if (typeof name === "object") {
          each(name, function (name, value) {
            self.attr(name, value);
          });
        } else if (isDefined(value)) {
          this.each(function () {
            var hook;

            if (this.nodeType === 1) {
              hook = attrHooks[name];
              if (hook && hook.set) {
                hook.set(this, value);
                return;
              }

              if (value === null) {
                this.removeAttribute(name, 2);
              } else {
                this.setAttribute(name, value, 2);
              }
            }
          });
        } else {
          if (self[0] && self[0].nodeType === 1) {
            hook = attrHooks[name];
            if (hook && hook.get) {
              return hook.get(self[0], name);
            }

            if (booleanMap[name]) {
              return self.prop(name) ? name : undef;
            }

            value = self[0].getAttribute(name, 2);

            if (value === null) {
              value = undef;
            }
          }

          return value;
        }

        return self;
      },

      /**
       * Removes attributse on the elements in the current set.
       *
       * @method removeAttr
       * @param {String/Object} name Name of attribute to remove.
       * @return {tinymce.dom.DomQuery/String} Current set.
       */
      removeAttr: function (name) {
        return this.attr(name, null);
      },

      /**
       * Sets/gets properties on the elements in the current set.
       *
       * @method attr
       * @param {String/Object} name Name of property to get or an object with properties to set.
       * @param {String} value Optional value to set.
       * @return {tinymce.dom.DomQuery/String} Current set or the specified property when only the name is specified.
       */
      prop: function (name, value) {
        var self = this;

        name = propFix[name] || name;

        if (typeof name === "object") {
          each(name, function (name, value) {
            self.prop(name, value);
          });
        } else if (isDefined(value)) {
          this.each(function () {
            if (this.nodeType == 1) {
              this[name] = value;
            }
          });
        } else {
          if (self[0] && self[0].nodeType && name in self[0]) {
            return self[0][name];
          }

          return value;
        }

        return self;
      },

      /**
       * Sets/gets styles on the elements in the current set.
       *
       * @method css
       * @param {String/Object} name Name of style to get or an object with styles to set.
       * @param {String} value Optional value to set.
       * @return {tinymce.dom.DomQuery/String} Current set or the specified style when only the name is specified.
       */
      css: function (name, value) {
        var self = this, elm, hook;

        function camel(name) {
          return name.replace(/-(\D)/g, function (a, b) {
            return b.toUpperCase();
          });
        }

        function dashed(name) {
          return name.replace(/[A-Z]/g, function (a) {
            return '-' + a;
          });
        }

        if (typeof name === "object") {
          each(name, function (name, value) {
            self.css(name, value);
          });
        } else {
          if (isDefined(value)) {
            name = camel(name);

            // Default px suffix on these
            if (typeof value === 'number' && !numericCssMap[name]) {
              value += 'px';
            }

            self.each(function () {
              var style = this.style;

              hook = cssHooks[name];
              if (hook && hook.set) {
                hook.set(this, value);
                return;
              }

              try {
                this.style[cssFix[name] || name] = value;
              } catch (ex) {
                // Ignore
              }

              if (value === null || value === '') {
                if (style.removeProperty) {
                  style.removeProperty(dashed(name));
                } else {
                  style.removeAttribute(name);
                }
              }
            });
          } else {
            elm = self[0];

            hook = cssHooks[name];
            if (hook && hook.get) {
              return hook.get(elm);
            }

            if (elm.ownerDocument.defaultView) {
              try {
                return elm.ownerDocument.defaultView.getComputedStyle(elm, null).getPropertyValue(dashed(name));
              } catch (ex) {
                return undef;
              }
            } else if (elm.currentStyle) {
              return elm.currentStyle[camel(name)];
            }
          }
        }

        return self;
      },

      /**
       * Removes all nodes in set from the document.
       *
       * @method remove
       * @return {tinymce.dom.DomQuery} Current set with the removed nodes.
       */
      remove: function () {
        var self = this, node, i = this.length;

        while (i--) {
          node = self[i];
          Event.clean(node);

          if (node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }

        return this;
      },

      /**
       * Empties all elements in set.
       *
       * @method empty
       * @return {tinymce.dom.DomQuery} Current set with the empty nodes.
       */
      empty: function () {
        var self = this, node, i = this.length;

        while (i--) {
          node = self[i];
          while (node.firstChild) {
            node.removeChild(node.firstChild);
          }
        }

        return this;
      },

      /**
       * Sets or gets the HTML of the current set or first set node.
       *
       * @method html
       * @param {String} value Optional innerHTML value to set on each element.
       * @return {tinymce.dom.DomQuery/String} Current set or the innerHTML of the first element.
       */
      html: function (value) {
        var self = this, i;

        if (isDefined(value)) {
          i = self.length;

          try {
            while (i--) {
              self[i].innerHTML = value;
            }
          } catch (ex) {
            // Workaround for "Unknown runtime error" when DIV is added to P on IE
            DomQuery(self[i]).empty().append(value);
          }

          return self;
        }

        return self[0] ? self[0].innerHTML : '';
      },

      /**
       * Sets or gets the text of the current set or first set node.
       *
       * @method text
       * @param {String} value Optional innerText value to set on each element.
       * @return {tinymce.dom.DomQuery/String} Current set or the innerText of the first element.
       */
      text: function (value) {
        var self = this, i;

        if (isDefined(value)) {
          i = self.length;
          while (i--) {
            if ("innerText" in self[i]) {
              self[i].innerText = value;
            } else {
              self[0].textContent = value;
            }
          }

          return self;
        }

        return self[0] ? (self[0].innerText || self[0].textContent) : '';
      },

      /**
       * Appends the specified node/html or node set to the current set nodes.
       *
       * @method append
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to append to each element in set.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      append: function () {
        return domManipulate(this, arguments, function (node) {
          // Either element or Shadow Root
          if (this.nodeType === 1 || (this.host && this.host.nodeType === 1)) {
            this.appendChild(node);
          }
        });
      },

      /**
       * Prepends the specified node/html or node set to the current set nodes.
       *
       * @method prepend
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to prepend to each element in set.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      prepend: function () {
        return domManipulate(this, arguments, function (node) {
          // Either element or Shadow Root
          if (this.nodeType === 1 || (this.host && this.host.nodeType === 1)) {
            this.insertBefore(node, this.firstChild);
          }
        }, true);
      },

      /**
       * Adds the specified elements before current set nodes.
       *
       * @method before
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to add before to each element in set.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      before: function () {
        var self = this;

        if (self[0] && self[0].parentNode) {
          return domManipulate(self, arguments, function (node) {
            this.parentNode.insertBefore(node, this);
          });
        }

        return self;
      },

      /**
       * Adds the specified elements after current set nodes.
       *
       * @method after
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to add after to each element in set.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      after: function () {
        var self = this;

        if (self[0] && self[0].parentNode) {
          return domManipulate(self, arguments, function (node) {
            this.parentNode.insertBefore(node, this.nextSibling);
          }, true);
        }

        return self;
      },

      /**
       * Appends the specified set nodes to the specified selector/instance.
       *
       * @method appendTo
       * @param {String/Element/Array/tinymce.dom.DomQuery} val Item to append the current set to.
       * @return {tinymce.dom.DomQuery} Current set with the appended nodes.
       */
      appendTo: function (val) {
        DomQuery(val).append(this);

        return this;
      },

      /**
       * Prepends the specified set nodes to the specified selector/instance.
       *
       * @method prependTo
       * @param {String/Element/Array/tinymce.dom.DomQuery} val Item to prepend the current set to.
       * @return {tinymce.dom.DomQuery} Current set with the prepended nodes.
       */
      prependTo: function (val) {
        DomQuery(val).prepend(this);

        return this;
      },

      /**
       * Replaces the nodes in set with the specified content.
       *
       * @method replaceWith
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to replace nodes with.
       * @return {tinymce.dom.DomQuery} Set with replaced nodes.
       */
      replaceWith: function (content) {
        return this.before(content).remove();
      },

      /**
       * Wraps all elements in set with the specified wrapper.
       *
       * @method wrap
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
       * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
       */
      wrap: function (content) {
        return wrap(this, content);
      },

      /**
       * Wraps all nodes in set with the specified wrapper. If the nodes are siblings all of them
       * will be wrapped in the same wrapper.
       *
       * @method wrapAll
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
       * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
       */
      wrapAll: function (content) {
        return wrap(this, content, true);
      },

      /**
       * Wraps all elements inner contents in set with the specified wrapper.
       *
       * @method wrapInner
       * @param {String/Element/Array/tinymce.dom.DomQuery} content Content to wrap nodes with.
       * @return {tinymce.dom.DomQuery} Set with wrapped nodes.
       */
      wrapInner: function (content) {
        this.each(function () {
          DomQuery(this).contents().wrapAll(content);
        });

        return this;
      },

      /**
       * Unwraps all elements by removing the parent element of each item in set.
       *
       * @method unwrap
       * @return {tinymce.dom.DomQuery} Set with unwrapped nodes.
       */
      unwrap: function () {
        return this.parent().each(function () {
          DomQuery(this).replaceWith(this.childNodes);
        });
      },

      /**
       * Clones all nodes in set.
       *
       * @method clone
       * @return {tinymce.dom.DomQuery} Set with cloned nodes.
       */
      clone: function () {
        var result = [];

        this.each(function () {
          result.push(this.cloneNode(true));
        });

        return DomQuery(result);
      },

      /**
       * Adds the specified class name to the current set elements.
       *
       * @method addClass
       * @param {String} className Class name to add.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      addClass: function (className) {
        return this.toggleClass(className, true);
      },

      /**
       * Removes the specified class name to the current set elements.
       *
       * @method removeClass
       * @param {String} className Class name to remove.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      removeClass: function (className) {
        return this.toggleClass(className, false);
      },

      /**
       * Toggles the specified class name on the current set elements.
       *
       * @method toggleClass
       * @param {String} className Class name to add/remove.
       * @param {Boolean} state Optional state to toggle on/off.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      toggleClass: function (className, state) {
        var self = this;

        // Functions are not supported
        if (typeof className != 'string') {
          return self;
        }

        if (className.indexOf(' ') !== -1) {
          each(className.split(' '), function () {
            self.toggleClass(this, state);
          });
        } else {
          self.each(function (index, node) {
            var existingClassName, classState;

            classState = hasClass(node, className);
            if (classState !== state) {
              existingClassName = node.className;

              if (classState) {
                node.className = trim((" " + existingClassName + " ").replace(' ' + className + ' ', ' '));
              } else {
                node.className += existingClassName ? ' ' + className : className;
              }
            }
          });
        }

        return self;
      },

      /**
       * Returns true/false if the first item in set has the specified class.
       *
       * @method hasClass
       * @param {String} className Class name to check for.
       * @return {Boolean} True/false if the set has the specified class.
       */
      hasClass: function (className) {
        return hasClass(this[0], className);
      },

      /**
       * Executes the callback function for each item DomQuery collection. If you return false in the
       * callback it will break the loop.
       *
       * @method each
       * @param {function} callback Callback function to execute for each item.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      each: function (callback) {
        return each(this, callback);
      },

      /**
       * Binds an event with callback function to the elements in set.
       *
       * @method on
       * @param {String} name Name of the event to bind.
       * @param {function} callback Callback function to execute when the event occurs.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      on: function (name, callback) {
        return this.each(function () {
          Event.bind(this, name, callback);
        });
      },

      /**
       * Unbinds an event with callback function to the elements in set.
       *
       * @method off
       * @param {String} name Optional name of the event to bind.
       * @param {function} callback Optional callback function to execute when the event occurs.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      off: function (name, callback) {
        return this.each(function () {
          Event.unbind(this, name, callback);
        });
      },

      /**
       * Triggers the specified event by name or event object.
       *
       * @method trigger
       * @param {String/Object} name Name of the event to trigger or event object.
       * @return {tinymce.dom.DomQuery} Current set.
       */
      trigger: function (name) {
        return this.each(function () {
          if (typeof name == 'object') {
            Event.fire(this, name.type, name);
          } else {
            Event.fire(this, name);
          }
        });
      },

      /**
       * Shows all elements in set.
       *
       * @method show
       * @return {tinymce.dom.DomQuery} Current set.
       */
      show: function () {
        return this.css('display', '');
      },

      /**
       * Hides all elements in set.
       *
       * @method hide
       * @return {tinymce.dom.DomQuery} Current set.
       */
      hide: function () {
        return this.css('display', 'none');
      },

      /**
       * Slices the current set.
       *
       * @method slice
       * @param {Number} start Start index to slice at.
       * @param {Number} end Optional end index to end slice at.
       * @return {tinymce.dom.DomQuery} Sliced set.
       */
      slice: function () {
        return new DomQuery(slice.apply(this, arguments));
      },

      /**
       * Makes the set equal to the specified index.
       *
       * @method eq
       * @param {Number} index Index to set it equal to.
       * @return {tinymce.dom.DomQuery} Single item set.
       */
      eq: function (index) {
        return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
      },

      /**
       * Makes the set equal to first element in set.
       *
       * @method first
       * @return {tinymce.dom.DomQuery} Single item set.
       */
      first: function () {
        return this.eq(0);
      },

      /**
       * Makes the set equal to last element in set.
       *
       * @method last
       * @return {tinymce.dom.DomQuery} Single item set.
       */
      last: function () {
        return this.eq(-1);
      },

      /**
       * Finds elements by the specified selector for each element in set.
       *
       * @method find
       * @param {String} selector Selector to find elements by.
       * @return {tinymce.dom.DomQuery} Set with matches elements.
       */
      find: function (selector) {
        var i, l, ret = [];

        for (i = 0, l = this.length; i < l; i++) {
          DomQuery.find(selector, this[i], ret);
        }

        return DomQuery(ret);
      },

      /**
       * Filters the current set with the specified selector.
       *
       * @method filter
       * @param {String/function} selector Selector to filter elements by.
       * @return {tinymce.dom.DomQuery} Set with filtered elements.
       */
      filter: function (selector) {
        if (typeof selector == 'function') {
          return DomQuery(grep(this.toArray(), function (item, i) {
            return selector(i, item);
          }));
        }

        return DomQuery(DomQuery.filter(selector, this.toArray()));
      },

      /**
       * Gets the current node or any parent matching the specified selector.
       *
       * @method closest
       * @param {String/Element/tinymce.dom.DomQuery} selector Selector or element to find.
       * @return {tinymce.dom.DomQuery} Set with closest elements.
       */
      closest: function (selector) {
        var result = [];

        if (selector instanceof DomQuery) {
          selector = selector[0];
        }

        this.each(function (i, node) {
          while (node) {
            if (typeof selector == 'string' && DomQuery(node).is(selector)) {
              result.push(node);
              break;
            } else if (node == selector) {
              result.push(node);
              break;
            }

            node = node.parentNode;
          }
        });

        return DomQuery(result);
      },

      /**
       * Returns the offset of the first element in set or sets the top/left css properties of all elements in set.
       *
       * @method offset
       * @param {Object} offset Optional offset object to set on each item.
       * @return {Object/tinymce.dom.DomQuery} Returns the first element offset or the current set if you specified an offset.
       */
      offset: function (offset) {
        var elm, doc, docElm;
        var x = 0, y = 0, pos;

        if (!offset) {
          elm = this[0];

          if (elm) {
            doc = elm.ownerDocument;
            docElm = doc.documentElement;

            if (elm.getBoundingClientRect) {
              pos = elm.getBoundingClientRect();
              x = pos.left + (docElm.scrollLeft || doc.body.scrollLeft) - docElm.clientLeft;
              y = pos.top + (docElm.scrollTop || doc.body.scrollTop) - docElm.clientTop;
            }
          }

          return {
            left: x,
            top: y
          };
        }

        return this.css(offset);
      },

      push: push,
      sort: [].sort,
      splice: [].splice
    };

    // Static members
    Tools.extend(DomQuery, {
      /**
       * Extends the specified object with one or more objects.
       *
       * @static
       * @method extend
       * @param {Object} target Target object to extend with new items.
       * @param {Object..} object Object to extend the target with.
       * @return {Object} Extended input object.
       */
      extend: Tools.extend,

      /**
       * Creates an array out of an array like object.
       *
       * @static
       * @method makeArray
       * @param {Object} object Object to convert to array.
       * @return {Array} Array produced from object.
       */
      makeArray: function (object) {
        if (isWindow(object) || object.nodeType) {
          return [object];
        }

        return Tools.toArray(object);
      },

      /**
       * Returns the index of the specified item inside the array.
       *
       * @static
       * @method inArray
       * @param {Object} item Item to look for.
       * @param {Array} array Array to look for item in.
       * @return {Number} Index of the item or -1.
       */
      inArray: inArray,

      /**
       * Returns true/false if the specified object is an array or not.
       *
       * @static
       * @method isArray
       * @param {Object} array Object to check if it's an array or not.
       * @return {Boolean} True/false if the object is an array.
       */
      isArray: Tools.isArray,

      /**
       * Executes the callback function for each item in array/object. If you return false in the
       * callback it will break the loop.
       *
       * @static
       * @method each
       * @param {Object} obj Object to iterate.
       * @param {function} callback Callback function to execute for each item.
       */
      each: each,

      /**
       * Removes whitespace from the beginning and end of a string.
       *
       * @static
       * @method trim
       * @param {String} str String to remove whitespace from.
       * @return {String} New string with removed whitespace.
       */
      trim: trim,

      /**
       * Filters out items from the input array by calling the specified function for each item.
       * If the function returns false the item will be excluded if it returns true it will be included.
       *
       * @static
       * @method grep
       * @param {Array} array Array of items to loop though.
       * @param {function} callback Function to call for each item. Include/exclude depends on it's return value.
       * @return {Array} New array with values imported and filtered based in input.
       * @example
       * // Filter out some items, this will return an array with 4 and 5
       * var items = DomQuery.grep([1, 2, 3, 4, 5], function(v) {return v > 3;});
       */
      grep: grep,

      // Sizzle
      find: Sizzle,
      expr: Sizzle.selectors,
      unique: Sizzle.uniqueSort,
      text: Sizzle.getText,
      contains: Sizzle.contains,
      filter: function (expr, elems, not) {
        var i = elems.length;

        if (not) {
          expr = ":not(" + expr + ")";
        }

        while (i--) {
          if (elems[i].nodeType != 1) {
            elems.splice(i, 1);
          }
        }

        if (elems.length === 1) {
          elems = DomQuery.find.matchesSelector(elems[0], expr) ? [elems[0]] : [];
        } else {
          elems = DomQuery.find.matches(expr, elems);
        }

        return elems;
      }
    });

    function dir(el, prop, until) {
      var matched = [], cur = el[prop];

      if (typeof until != 'string' && until instanceof DomQuery) {
        until = until[0];
      }

      while (cur && cur.nodeType !== 9) {
        if (until !== undefined) {
          if (cur === until) {
            break;
          }

          if (typeof until == 'string' && DomQuery(cur).is(until)) {
            break;
          }
        }

        if (cur.nodeType === 1) {
          matched.push(cur);
        }

        cur = cur[prop];
      }

      return matched;
    }

    function sibling(node, siblingName, nodeType, until) {
      var result = [];

      if (until instanceof DomQuery) {
        until = until[0];
      }

      for (; node; node = node[siblingName]) {
        if (nodeType && node.nodeType !== nodeType) {
          continue;
        }

        if (until !== undefined) {
          if (node === until) {
            break;
          }

          if (typeof until == 'string' && DomQuery(node).is(until)) {
            break;
          }
        }

        result.push(node);
      }

      return result;
    }

    function firstSibling(node, siblingName, nodeType) {
      for (node = node[siblingName]; node; node = node[siblingName]) {
        if (node.nodeType == nodeType) {
          return node;
        }
      }

      return null;
    }

    each({
      /**
       * Returns a new collection with the parent of each item in current collection matching the optional selector.
       *
       * @method parent
       * @param {Element/tinymce.dom.DomQuery} node Node to match parents against.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
       */
      parent: function (node) {
        var parent = node.parentNode;

        return parent && parent.nodeType !== 11 ? parent : null;
      },

      /**
       * Returns a new collection with the all the parents of each item in current collection matching the optional selector.
       *
       * @method parents
       * @param {Element/tinymce.dom.DomQuery} node Node to match parents against.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
       */
      parents: function (node) {
        return dir(node, "parentNode");
      },

      /**
       * Returns a new collection with next sibling of each item in current collection matching the optional selector.
       *
       * @method next
       * @param {Element/tinymce.dom.DomQuery} node Node to match the next element against.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      next: function (node) {
        return firstSibling(node, 'nextSibling', 1);
      },

      /**
       * Returns a new collection with previous sibling of each item in current collection matching the optional selector.
       *
       * @method prev
       * @param {Element/tinymce.dom.DomQuery} node Node to match the previous element against.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      prev: function (node) {
        return firstSibling(node, 'previousSibling', 1);
      },

      /**
       * Returns all child elements matching the optional selector.
       *
       * @method children
       * @param {Element/tinymce.dom.DomQuery} node Node to match the elements against.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      children: function (node) {
        return sibling(node.firstChild, 'nextSibling', 1);
      },

      /**
       * Returns all child nodes matching the optional selector.
       *
       * @method contents
       * @param {Element/tinymce.dom.DomQuery} node Node to get the contents of.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      contents: function (node) {
        return Tools.toArray((node.nodeName === "iframe" ? node.contentDocument || node.contentWindow.document : node).childNodes);
      }
    }, function (name, fn) {
      DomQuery.fn[name] = function (selector) {
        var self = this, result = [];

        self.each(function () {
          var nodes = fn.call(result, this, selector, result);

          if (nodes) {
            if (DomQuery.isArray(nodes)) {
              result.push.apply(result, nodes);
            } else {
              result.push(nodes);
            }
          }
        });

        // If traversing on multiple elements we might get the same elements twice
        if (this.length > 1) {
          if (!skipUniques[name]) {
            result = DomQuery.unique(result);
          }

          if (name.indexOf('parents') === 0) {
            result = result.reverse();
          }
        }

        result = DomQuery(result);

        if (selector) {
          return result.filter(selector);
        }

        return result;
      };
    });

    each({
      /**
       * Returns a new collection with the all the parents until the matching selector/element
       * of each item in current collection matching the optional selector.
       *
       * @method parentsUntil
       * @param {Element/tinymce.dom.DomQuery} node Node to find parent of.
       * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching parents.
       */
      parentsUntil: function (node, until) {
        return dir(node, "parentNode", until);
      },

      /**
       * Returns a new collection with all next siblings of each item in current collection matching the optional selector.
       *
       * @method nextUntil
       * @param {Element/tinymce.dom.DomQuery} node Node to find next siblings on.
       * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      nextUntil: function (node, until) {
        return sibling(node, 'nextSibling', 1, until).slice(1);
      },

      /**
       * Returns a new collection with all previous siblings of each item in current collection matching the optional selector.
       *
       * @method prevUntil
       * @param {Element/tinymce.dom.DomQuery} node Node to find previous siblings on.
       * @param {String/Element/tinymce.dom.DomQuery} until Until the matching selector or element.
       * @return {tinymce.dom.DomQuery} New DomQuery instance with all matching elements.
       */
      prevUntil: function (node, until) {
        return sibling(node, 'previousSibling', 1, until).slice(1);
      }
    }, function (name, fn) {
      DomQuery.fn[name] = function (selector, filter) {
        var self = this, result = [];

        self.each(function () {
          var nodes = fn.call(result, this, selector, result);

          if (nodes) {
            if (DomQuery.isArray(nodes)) {
              result.push.apply(result, nodes);
            } else {
              result.push(nodes);
            }
          }
        });

        // If traversing on multiple elements we might get the same elements twice
        if (this.length > 1) {
          result = DomQuery.unique(result);

          if (name.indexOf('parents') === 0 || name === 'prevUntil') {
            result = result.reverse();
          }
        }

        result = DomQuery(result);

        if (filter) {
          return result.filter(filter);
        }

        return result;
      };
    });

    /**
     * Returns true/false if the current set items matches the selector.
     *
     * @method is
     * @param {String} selector Selector to match the elements against.
     * @return {Boolean} True/false if the current set matches the selector.
     */
    DomQuery.fn.is = function (selector) {
      return !!selector && this.filter(selector).length > 0;
    };

    DomQuery.fn.init.prototype = DomQuery.fn;

    DomQuery.overrideDefaults = function (callback) {
      var defaults;

      function sub(selector, context) {
        defaults = defaults || callback();

        if (arguments.length === 0) {
          selector = defaults.element;
        }

        if (!context) {
          context = defaults.context;
        }

        return new sub.fn.init(selector, context);
      }

      DomQuery.extend(sub, this);

      return sub;
    };

    function appendHooks(targetHooks, prop, hooks) {
      each(hooks, function (name, func) {
        targetHooks[name] = targetHooks[name] || {};
        targetHooks[name][prop] = func;
      });
    }

    if (Env.ie && Env.ie < 8) {
      appendHooks(attrHooks, 'get', {
        maxlength: function (elm) {
          var value = elm.maxLength;

          if (value === 0x7fffffff) {
            return undef;
          }

          return value;
        },

        size: function (elm) {
          var value = elm.size;

          if (value === 20) {
            return undef;
          }

          return value;
        },

        'class': function (elm) {
          return elm.className;
        },

        style: function (elm) {
          var value = elm.style.cssText;

          if (value.length === 0) {
            return undef;
          }

          return value;
        }
      });

      appendHooks(attrHooks, 'set', {
        'class': function (elm, value) {
          elm.className = value;
        },

        style: function (elm, value) {
          elm.style.cssText = value;
        }
      });
    }

    if (Env.ie && Env.ie < 9) {
      /*jshint sub:true */
      /*eslint dot-notation: 0*/
      cssFix['float'] = 'styleFloat';

      appendHooks(cssHooks, 'set', {
        opacity: function (elm, value) {
          var style = elm.style;

          if (value === null || value === '') {
            style.removeAttribute('filter');
          } else {
            style.zoom = 1;
            style.filter = 'alpha(opacity=' + (value * 100) + ')';
          }
        }
      });
    }

    DomQuery.attrHooks = attrHooks;
    DomQuery.cssHooks = cssHooks;

    return DomQuery;
  }
);

/**
 * Styles.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to parse CSS styles it also compresses styles to reduce the output size.
 *
 * @example
 * var Styles = new tinymce.html.Styles({
 *    url_converter: function(url) {
 *       return url;
 *    }
 * });
 *
 * styles = Styles.parse('border: 1px solid red');
 * styles.color = 'red';
 *
 * console.log(new tinymce.html.StyleSerializer().serialize(styles));
 *
 * @class tinymce.html.Styles
 * @version 3.4
 */
define(
  'tinymce.core.html.Styles',
  [
  ],
  function () {
    return function (settings, schema) {
      /*jshint maxlen:255 */
      /*eslint max-len:0 */
      var rgbRegExp = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/gi,
        urlOrStrRegExp = /(?:url(?:(?:\(\s*\"([^\"]+)\"\s*\))|(?:\(\s*\'([^\']+)\'\s*\))|(?:\(\s*([^)\s]+)\s*\))))|(?:\'([^\']+)\')|(?:\"([^\"]+)\")/gi,
        styleRegExp = /\s*([^:]+):\s*([^;]+);?/g,
        trimRightRegExp = /\s+$/,
        i, encodingLookup = {}, encodingItems, validStyles, invalidStyles, invisibleChar = '\uFEFF';

      settings = settings || {};

      if (schema) {
        validStyles = schema.getValidStyles();
        invalidStyles = schema.getInvalidStyles();
      }

      encodingItems = ('\\" \\\' \\; \\: ; : ' + invisibleChar).split(' ');
      for (i = 0; i < encodingItems.length; i++) {
        encodingLookup[encodingItems[i]] = invisibleChar + i;
        encodingLookup[invisibleChar + i] = encodingItems[i];
      }

      function toHex(match, r, g, b) {
        function hex(val) {
          val = parseInt(val, 10).toString(16);

          return val.length > 1 ? val : '0' + val; // 0 -> 00
        }

        return '#' + hex(r) + hex(g) + hex(b);
      }

      return {
        /**
         * Parses the specified RGB color value and returns a hex version of that color.
         *
         * @method toHex
         * @param {String} color RGB string value like rgb(1,2,3)
         * @return {String} Hex version of that RGB value like #FF00FF.
         */
        toHex: function (color) {
          return color.replace(rgbRegExp, toHex);
        },

        /**
         * Parses the specified style value into an object collection. This parser will also
         * merge and remove any redundant items that browsers might have added. It will also convert non hex
         * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
         *
         * @method parse
         * @param {String} css Style value to parse for example: border:1px solid red;.
         * @return {Object} Object representation of that style like {border: '1px solid red'}
         */
        parse: function (css) {
          var styles = {}, matches, name, value, isEncoded, urlConverter = settings.url_converter;
          var urlConverterScope = settings.url_converter_scope || this;

          function compress(prefix, suffix, noJoin) {
            var top, right, bottom, left;

            top = styles[prefix + '-top' + suffix];
            if (!top) {
              return;
            }

            right = styles[prefix + '-right' + suffix];
            if (!right) {
              return;
            }

            bottom = styles[prefix + '-bottom' + suffix];
            if (!bottom) {
              return;
            }

            left = styles[prefix + '-left' + suffix];
            if (!left) {
              return;
            }

            var box = [top, right, bottom, left];
            i = box.length - 1;
            while (i--) {
              if (box[i] !== box[i + 1]) {
                break;
              }
            }

            if (i > -1 && noJoin) {
              return;
            }

            styles[prefix + suffix] = i == -1 ? box[0] : box.join(' ');
            delete styles[prefix + '-top' + suffix];
            delete styles[prefix + '-right' + suffix];
            delete styles[prefix + '-bottom' + suffix];
            delete styles[prefix + '-left' + suffix];
          }

          /**
           * Checks if the specific style can be compressed in other words if all border-width are equal.
           */
          function canCompress(key) {
            var value = styles[key], i;

            if (!value) {
              return;
            }

            value = value.split(' ');
            i = value.length;
            while (i--) {
              if (value[i] !== value[0]) {
                return false;
              }
            }

            styles[key] = value[0];

            return true;
          }

          /**
           * Compresses multiple styles into one style.
           */
          function compress2(target, a, b, c) {
            if (!canCompress(a)) {
              return;
            }

            if (!canCompress(b)) {
              return;
            }

            if (!canCompress(c)) {
              return;
            }

            // Compress
            styles[target] = styles[a] + ' ' + styles[b] + ' ' + styles[c];
            delete styles[a];
            delete styles[b];
            delete styles[c];
          }

          // Encodes the specified string by replacing all \" \' ; : with _<num>
          function encode(str) {
            isEncoded = true;

            return encodingLookup[str];
          }

          // Decodes the specified string by replacing all _<num> with it's original value \" \' etc
          // It will also decode the \" \' if keepSlashes is set to fale or omitted
          function decode(str, keepSlashes) {
            if (isEncoded) {
              str = str.replace(/\uFEFF[0-9]/g, function (str) {
                return encodingLookup[str];
              });
            }

            if (!keepSlashes) {
              str = str.replace(/\\([\'\";:])/g, "$1");
            }

            return str;
          }

          function decodeSingleHexSequence(escSeq) {
            return String.fromCharCode(parseInt(escSeq.slice(1), 16));
          }

          function decodeHexSequences(value) {
            return value.replace(/\\[0-9a-f]+/gi, decodeSingleHexSequence);
          }

          function processUrl(match, url, url2, url3, str, str2) {
            str = str || str2;

            if (str) {
              str = decode(str);

              // Force strings into single quote format
              return "'" + str.replace(/\'/g, "\\'") + "'";
            }

            url = decode(url || url2 || url3);

            if (!settings.allow_script_urls) {
              var scriptUrl = url.replace(/[\s\r\n]+/g, '');

              if (/(java|vb)script:/i.test(scriptUrl)) {
                return "";
              }

              if (!settings.allow_svg_data_urls && /^data:image\/svg/i.test(scriptUrl)) {
                return "";
              }
            }

            // Convert the URL to relative/absolute depending on config
            if (urlConverter) {
              url = urlConverter.call(urlConverterScope, url, 'style');
            }

            // Output new URL format
            return "url('" + url.replace(/\'/g, "\\'") + "')";
          }

          if (css) {
            css = css.replace(/[\u0000-\u001F]/g, '');

            // Encode \" \' % and ; and : inside strings so they don't interfere with the style parsing
            css = css.replace(/\\[\"\';:\uFEFF]/g, encode).replace(/\"[^\"]+\"|\'[^\']+\'/g, function (str) {
              return str.replace(/[;:]/g, encode);
            });

            // Parse styles
            while ((matches = styleRegExp.exec(css))) {
              styleRegExp.lastIndex = matches.index + matches[0].length;
              name = matches[1].replace(trimRightRegExp, '').toLowerCase();
              value = matches[2].replace(trimRightRegExp, '');

              if (name && value) {
                // Decode escaped sequences like \65 -> e
                name = decodeHexSequences(name);
                value = decodeHexSequences(value);

                // Skip properties with double quotes and sequences like \" \' in their names
                // See 'mXSS Attacks: Attacking well-secured Web-Applications by using innerHTML Mutations'
                // https://cure53.de/fp170.pdf
                if (name.indexOf(invisibleChar) !== -1 || name.indexOf('"') !== -1) {
                  continue;
                }

                // Don't allow behavior name or expression/comments within the values
                if (!settings.allow_script_urls && (name == "behavior" || /expression\s*\(|\/\*|\*\//.test(value))) {
                  continue;
                }

                // Opera will produce 700 instead of bold in their style values
                if (name === 'font-weight' && value === '700') {
                  value = 'bold';
                } else if (name === 'color' || name === 'background-color') { // Lowercase colors like RED
                  value = value.toLowerCase();
                }

                // Convert RGB colors to HEX
                value = value.replace(rgbRegExp, toHex);

                // Convert URLs and force them into url('value') format
                value = value.replace(urlOrStrRegExp, processUrl);
                styles[name] = isEncoded ? decode(value, true) : value;
              }
            }
            // Compress the styles to reduce it's size for example IE will expand styles
            compress("border", "", true);
            compress("border", "-width");
            compress("border", "-color");
            compress("border", "-style");
            compress("padding", "");
            compress("margin", "");
            compress2('border', 'border-width', 'border-style', 'border-color');

            // Remove pointless border, IE produces these
            if (styles.border === 'medium none') {
              delete styles.border;
            }

            // IE 11 will produce a border-image: none when getting the style attribute from <p style="border: 1px solid red"></p>
            // So let us assume it shouldn't be there
            if (styles['border-image'] === 'none') {
              delete styles['border-image'];
            }
          }

          return styles;
        },

        /**
         * Serializes the specified style object into a string.
         *
         * @method serialize
         * @param {Object} styles Object to serialize as string for example: {border: '1px solid red'}
         * @param {String} elementName Optional element name, if specified only the styles that matches the schema will be serialized.
         * @return {String} String representation of the style object for example: border: 1px solid red.
         */
        serialize: function (styles, elementName) {
          var css = '', name, value;

          function serializeStyles(name) {
            var styleList, i, l, value;

            styleList = validStyles[name];
            if (styleList) {
              for (i = 0, l = styleList.length; i < l; i++) {
                name = styleList[i];
                value = styles[name];

                if (value) {
                  css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
                }
              }
            }
          }

          function isValid(name, elementName) {
            var styleMap;

            styleMap = invalidStyles['*'];
            if (styleMap && styleMap[name]) {
              return false;
            }

            styleMap = invalidStyles[elementName];
            if (styleMap && styleMap[name]) {
              return false;
            }

            return true;
          }

          // Serialize styles according to schema
          if (elementName && validStyles) {
            // Serialize global styles and element specific styles
            serializeStyles('*');
            serializeStyles(elementName);
          } else {
            // Output the styles in the order they are inside the object
            for (name in styles) {
              value = styles[name];

              if (value && (!invalidStyles || isValid(name, elementName))) {
                css += (css.length > 0 ? ' ' : '') + name + ': ' + value + ';';
              }
            }
          }

          return css;
        }
      };
    };
  }
);

/**
 * TreeWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * TreeWalker class enables you to walk the DOM in a linear manner.
 *
 * @class tinymce.dom.TreeWalker
 * @example
 * var walker = new tinymce.dom.TreeWalker(startNode);
 *
 * do {
 *     console.log(walker.current());
 * } while (walker.next());
 */
define(
  'tinymce.core.dom.TreeWalker',
  [
  ],
  function () {
    /**
     * Constructs a new TreeWalker instance.
     *
     * @constructor
     * @method TreeWalker
     * @param {Node} startNode Node to start walking from.
     * @param {node} rootNode Optional root node to never walk out of.
     */
    return function (startNode, rootNode) {
      var node = startNode;

      function findSibling(node, startName, siblingName, shallow) {
        var sibling, parent;

        if (node) {
          // Walk into nodes if it has a start
          if (!shallow && node[startName]) {
            return node[startName];
          }

          // Return the sibling if it has one
          if (node != rootNode) {
            sibling = node[siblingName];
            if (sibling) {
              return sibling;
            }

            // Walk up the parents to look for siblings
            for (parent = node.parentNode; parent && parent != rootNode; parent = parent.parentNode) {
              sibling = parent[siblingName];
              if (sibling) {
                return sibling;
              }
            }
          }
        }
      }

      function findPreviousNode(node, startName, siblingName, shallow) {
        var sibling, parent, child;

        if (node) {
          sibling = node[siblingName];
          if (rootNode && sibling === rootNode) {
            return;
          }

          if (sibling) {
            if (!shallow) {
              // Walk up the parents to look for siblings
              for (child = sibling[startName]; child; child = child[startName]) {
                if (!child[startName]) {
                  return child;
                }
              }
            }

            return sibling;
          }

          parent = node.parentNode;
          if (parent && parent !== rootNode) {
            return parent;
          }
        }
      }

      /**
       * Returns the current node.
       *
       * @method current
       * @return {Node} Current node where the walker is.
       */
      this.current = function () {
        return node;
      };

      /**
       * Walks to the next node in tree.
       *
       * @method next
       * @return {Node} Current node where the walker is after moving to the next node.
       */
      this.next = function (shallow) {
        node = findSibling(node, 'firstChild', 'nextSibling', shallow);
        return node;
      };

      /**
       * Walks to the previous node in tree.
       *
       * @method prev
       * @return {Node} Current node where the walker is after moving to the previous node.
       */
      this.prev = function (shallow) {
        node = findSibling(node, 'lastChild', 'previousSibling', shallow);
        return node;
      };

      this.prev2 = function (shallow) {
        node = findPreviousNode(node, 'lastChild', 'previousSibling', shallow);
        return node;
      };
    };
  }
);

/**
 * Entities.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*jshint bitwise:false */
/*eslint no-bitwise:0 */

/**
 * Entity encoder class.
 *
 * @class tinymce.html.Entities
 * @static
 * @version 3.4
 */
define(
  'tinymce.core.html.Entities',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    var makeMap = Tools.makeMap;

    var namedEntities, baseEntities, reverseEntities,
      attrsCharsRegExp = /[&<>\"\u0060\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
      textCharsRegExp = /[<>&\u007E-\uD7FF\uE000-\uFFEF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
      rawCharsRegExp = /[<>&\"\']/g,
      entityRegExp = /&#([a-z0-9]+);?|&([a-z0-9]+);/gi,
      asciiMap = {
        128: "\u20AC", 130: "\u201A", 131: "\u0192", 132: "\u201E", 133: "\u2026", 134: "\u2020",
        135: "\u2021", 136: "\u02C6", 137: "\u2030", 138: "\u0160", 139: "\u2039", 140: "\u0152",
        142: "\u017D", 145: "\u2018", 146: "\u2019", 147: "\u201C", 148: "\u201D", 149: "\u2022",
        150: "\u2013", 151: "\u2014", 152: "\u02DC", 153: "\u2122", 154: "\u0161", 155: "\u203A",
        156: "\u0153", 158: "\u017E", 159: "\u0178"
      };

    // Raw entities
    baseEntities = {
      '\"': '&quot;', // Needs to be escaped since the YUI compressor would otherwise break the code
      "'": '&#39;',
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '\u0060': '&#96;'
    };

    // Reverse lookup table for raw entities
    reverseEntities = {
      '&lt;': '<',
      '&gt;': '>',
      '&amp;': '&',
      '&quot;': '"',
      '&apos;': "'"
    };

    // Decodes text by using the browser
    function nativeDecode(text) {
      var elm;

      elm = document.createElement("div");
      elm.innerHTML = text;

      return elm.textContent || elm.innerText || text;
    }

    // Build a two way lookup table for the entities
    function buildEntitiesLookup(items, radix) {
      var i, chr, entity, lookup = {};

      if (items) {
        items = items.split(',');
        radix = radix || 10;

        // Build entities lookup table
        for (i = 0; i < items.length; i += 2) {
          chr = String.fromCharCode(parseInt(items[i], radix));

          // Only add non base entities
          if (!baseEntities[chr]) {
            entity = '&' + items[i + 1] + ';';
            lookup[chr] = entity;
            lookup[entity] = chr;
          }
        }

        return lookup;
      }
    }

    // Unpack entities lookup where the numbers are in radix 32 to reduce the size
    namedEntities = buildEntitiesLookup(
      '50,nbsp,51,iexcl,52,cent,53,pound,54,curren,55,yen,56,brvbar,57,sect,58,uml,59,copy,' +
      '5a,ordf,5b,laquo,5c,not,5d,shy,5e,reg,5f,macr,5g,deg,5h,plusmn,5i,sup2,5j,sup3,5k,acute,' +
      '5l,micro,5m,para,5n,middot,5o,cedil,5p,sup1,5q,ordm,5r,raquo,5s,frac14,5t,frac12,5u,frac34,' +
      '5v,iquest,60,Agrave,61,Aacute,62,Acirc,63,Atilde,64,Auml,65,Aring,66,AElig,67,Ccedil,' +
      '68,Egrave,69,Eacute,6a,Ecirc,6b,Euml,6c,Igrave,6d,Iacute,6e,Icirc,6f,Iuml,6g,ETH,6h,Ntilde,' +
      '6i,Ograve,6j,Oacute,6k,Ocirc,6l,Otilde,6m,Ouml,6n,times,6o,Oslash,6p,Ugrave,6q,Uacute,' +
      '6r,Ucirc,6s,Uuml,6t,Yacute,6u,THORN,6v,szlig,70,agrave,71,aacute,72,acirc,73,atilde,74,auml,' +
      '75,aring,76,aelig,77,ccedil,78,egrave,79,eacute,7a,ecirc,7b,euml,7c,igrave,7d,iacute,7e,icirc,' +
      '7f,iuml,7g,eth,7h,ntilde,7i,ograve,7j,oacute,7k,ocirc,7l,otilde,7m,ouml,7n,divide,7o,oslash,' +
      '7p,ugrave,7q,uacute,7r,ucirc,7s,uuml,7t,yacute,7u,thorn,7v,yuml,ci,fnof,sh,Alpha,si,Beta,' +
      'sj,Gamma,sk,Delta,sl,Epsilon,sm,Zeta,sn,Eta,so,Theta,sp,Iota,sq,Kappa,sr,Lambda,ss,Mu,' +
      'st,Nu,su,Xi,sv,Omicron,t0,Pi,t1,Rho,t3,Sigma,t4,Tau,t5,Upsilon,t6,Phi,t7,Chi,t8,Psi,' +
      't9,Omega,th,alpha,ti,beta,tj,gamma,tk,delta,tl,epsilon,tm,zeta,tn,eta,to,theta,tp,iota,' +
      'tq,kappa,tr,lambda,ts,mu,tt,nu,tu,xi,tv,omicron,u0,pi,u1,rho,u2,sigmaf,u3,sigma,u4,tau,' +
      'u5,upsilon,u6,phi,u7,chi,u8,psi,u9,omega,uh,thetasym,ui,upsih,um,piv,812,bull,816,hellip,' +
      '81i,prime,81j,Prime,81u,oline,824,frasl,88o,weierp,88h,image,88s,real,892,trade,89l,alefsym,' +
      '8cg,larr,8ch,uarr,8ci,rarr,8cj,darr,8ck,harr,8dl,crarr,8eg,lArr,8eh,uArr,8ei,rArr,8ej,dArr,' +
      '8ek,hArr,8g0,forall,8g2,part,8g3,exist,8g5,empty,8g7,nabla,8g8,isin,8g9,notin,8gb,ni,8gf,prod,' +
      '8gh,sum,8gi,minus,8gn,lowast,8gq,radic,8gt,prop,8gu,infin,8h0,ang,8h7,and,8h8,or,8h9,cap,8ha,cup,' +
      '8hb,int,8hk,there4,8hs,sim,8i5,cong,8i8,asymp,8j0,ne,8j1,equiv,8j4,le,8j5,ge,8k2,sub,8k3,sup,8k4,' +
      'nsub,8k6,sube,8k7,supe,8kl,oplus,8kn,otimes,8l5,perp,8m5,sdot,8o8,lceil,8o9,rceil,8oa,lfloor,8ob,' +
      'rfloor,8p9,lang,8pa,rang,9ea,loz,9j0,spades,9j3,clubs,9j5,hearts,9j6,diams,ai,OElig,aj,oelig,b0,' +
      'Scaron,b1,scaron,bo,Yuml,m6,circ,ms,tilde,802,ensp,803,emsp,809,thinsp,80c,zwnj,80d,zwj,80e,lrm,' +
      '80f,rlm,80j,ndash,80k,mdash,80o,lsquo,80p,rsquo,80q,sbquo,80s,ldquo,80t,rdquo,80u,bdquo,810,dagger,' +
      '811,Dagger,81g,permil,81p,lsaquo,81q,rsaquo,85c,euro', 32);

    var Entities = {
      /**
       * Encodes the specified string using raw entities. This means only the required XML base entities will be encoded.
       *
       * @method encodeRaw
       * @param {String} text Text to encode.
       * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
       * @return {String} Entity encoded text.
       */
      encodeRaw: function (text, attr) {
        return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
          return baseEntities[chr] || chr;
        });
      },

      /**
       * Encoded the specified text with both the attributes and text entities. This function will produce larger text contents
       * since it doesn't know if the context is within a attribute or text node. This was added for compatibility
       * and is exposed as the DOMUtils.encode function.
       *
       * @method encodeAllRaw
       * @param {String} text Text to encode.
       * @return {String} Entity encoded text.
       */
      encodeAllRaw: function (text) {
        return ('' + text).replace(rawCharsRegExp, function (chr) {
          return baseEntities[chr] || chr;
        });
      },

      /**
       * Encodes the specified string using numeric entities. The core entities will be
       * encoded as named ones but all non lower ascii characters will be encoded into numeric entities.
       *
       * @method encodeNumeric
       * @param {String} text Text to encode.
       * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
       * @return {String} Entity encoded text.
       */
      encodeNumeric: function (text, attr) {
        return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
          // Multi byte sequence convert it to a single entity
          if (chr.length > 1) {
            return '&#' + (((chr.charCodeAt(0) - 0xD800) * 0x400) + (chr.charCodeAt(1) - 0xDC00) + 0x10000) + ';';
          }

          return baseEntities[chr] || '&#' + chr.charCodeAt(0) + ';';
        });
      },

      /**
       * Encodes the specified string using named entities. The core entities will be encoded
       * as named ones but all non lower ascii characters will be encoded into named entities.
       *
       * @method encodeNamed
       * @param {String} text Text to encode.
       * @param {Boolean} attr Optional flag to specify if the text is attribute contents.
       * @param {Object} entities Optional parameter with entities to use.
       * @return {String} Entity encoded text.
       */
      encodeNamed: function (text, attr, entities) {
        entities = entities || namedEntities;

        return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
          return baseEntities[chr] || entities[chr] || chr;
        });
      },

      /**
       * Returns an encode function based on the name(s) and it's optional entities.
       *
       * @method getEncodeFunc
       * @param {String} name Comma separated list of encoders for example named,numeric.
       * @param {String} entities Optional parameter with entities to use instead of the built in set.
       * @return {function} Encode function to be used.
       */
      getEncodeFunc: function (name, entities) {
        entities = buildEntitiesLookup(entities) || namedEntities;

        function encodeNamedAndNumeric(text, attr) {
          return text.replace(attr ? attrsCharsRegExp : textCharsRegExp, function (chr) {
            if (baseEntities[chr] !== undefined) {
              return baseEntities[chr];
            }

            if (entities[chr] !== undefined) {
              return entities[chr];
            }

            // Convert multi-byte sequences to a single entity.
            if (chr.length > 1) {
              return '&#' + (((chr.charCodeAt(0) - 0xD800) * 0x400) + (chr.charCodeAt(1) - 0xDC00) + 0x10000) + ';';
            }

            return '&#' + chr.charCodeAt(0) + ';';
          });
        }

        function encodeCustomNamed(text, attr) {
          return Entities.encodeNamed(text, attr, entities);
        }

        // Replace + with , to be compatible with previous TinyMCE versions
        name = makeMap(name.replace(/\+/g, ','));

        // Named and numeric encoder
        if (name.named && name.numeric) {
          return encodeNamedAndNumeric;
        }

        // Named encoder
        if (name.named) {
          // Custom names
          if (entities) {
            return encodeCustomNamed;
          }

          return Entities.encodeNamed;
        }

        // Numeric
        if (name.numeric) {
          return Entities.encodeNumeric;
        }

        // Raw encoder
        return Entities.encodeRaw;
      },

      /**
       * Decodes the specified string, this will replace entities with raw UTF characters.
       *
       * @method decode
       * @param {String} text Text to entity decode.
       * @return {String} Entity decoded string.
       */
      decode: function (text) {
        return text.replace(entityRegExp, function (all, numeric) {
          if (numeric) {
            if (numeric.charAt(0).toLowerCase() === 'x') {
              numeric = parseInt(numeric.substr(1), 16);
            } else {
              numeric = parseInt(numeric, 10);
            }

            // Support upper UTF
            if (numeric > 0xFFFF) {
              numeric -= 0x10000;

              return String.fromCharCode(0xD800 + (numeric >> 10), 0xDC00 + (numeric & 0x3FF));
            }

            return asciiMap[numeric] || String.fromCharCode(numeric);
          }

          return reverseEntities[all] || namedEntities[all] || nativeDecode(all);
        });
      }
    };

    return Entities;
  }
);

/**
 * Range.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Old IE Range.
 *
 * @private
 * @class tinymce.dom.Range
 */
define(
  'tinymce.core.dom.Range',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    // Range constructor
    function Range(dom) {
      var self = this,
        doc = dom.doc,
        EXTRACT = 0,
        CLONE = 1,
        DELETE = 2,
        TRUE = true,
        FALSE = false,
        START_OFFSET = 'startOffset',
        START_CONTAINER = 'startContainer',
        END_CONTAINER = 'endContainer',
        END_OFFSET = 'endOffset',
        extend = Tools.extend,
        nodeIndex = dom.nodeIndex;

      function createDocumentFragment() {
        return doc.createDocumentFragment();
      }

      function setStart(n, o) {
        _setEndPoint(TRUE, n, o);
      }

      function setEnd(n, o) {
        _setEndPoint(FALSE, n, o);
      }

      function setStartBefore(n) {
        setStart(n.parentNode, nodeIndex(n));
      }

      function setStartAfter(n) {
        setStart(n.parentNode, nodeIndex(n) + 1);
      }

      function setEndBefore(n) {
        setEnd(n.parentNode, nodeIndex(n));
      }

      function setEndAfter(n) {
        setEnd(n.parentNode, nodeIndex(n) + 1);
      }

      function collapse(ts) {
        if (ts) {
          self[END_CONTAINER] = self[START_CONTAINER];
          self[END_OFFSET] = self[START_OFFSET];
        } else {
          self[START_CONTAINER] = self[END_CONTAINER];
          self[START_OFFSET] = self[END_OFFSET];
        }

        self.collapsed = TRUE;
      }

      function selectNode(n) {
        setStartBefore(n);
        setEndAfter(n);
      }

      function selectNodeContents(n) {
        setStart(n, 0);
        setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
      }

      function compareBoundaryPoints(h, r) {
        var sc = self[START_CONTAINER], so = self[START_OFFSET], ec = self[END_CONTAINER], eo = self[END_OFFSET],
          rsc = r.startContainer, rso = r.startOffset, rec = r.endContainer, reo = r.endOffset;

        // Check START_TO_START
        if (h === 0) {
          return _compareBoundaryPoints(sc, so, rsc, rso);
        }

        // Check START_TO_END
        if (h === 1) {
          return _compareBoundaryPoints(ec, eo, rsc, rso);
        }

        // Check END_TO_END
        if (h === 2) {
          return _compareBoundaryPoints(ec, eo, rec, reo);
        }

        // Check END_TO_START
        if (h === 3) {
          return _compareBoundaryPoints(sc, so, rec, reo);
        }
      }

      function deleteContents() {
        _traverse(DELETE);
      }

      function extractContents() {
        return _traverse(EXTRACT);
      }

      function cloneContents() {
        return _traverse(CLONE);
      }

      function insertNode(n) {
        var startContainer = this[START_CONTAINER],
          startOffset = this[START_OFFSET], nn, o;

        // Node is TEXT_NODE or CDATA
        if ((startContainer.nodeType === 3 || startContainer.nodeType === 4) && startContainer.nodeValue) {
          if (!startOffset) {
            // At the start of text
            startContainer.parentNode.insertBefore(n, startContainer);
          } else if (startOffset >= startContainer.nodeValue.length) {
            // At the end of text
            dom.insertAfter(n, startContainer);
          } else {
            // Middle, need to split
            nn = startContainer.splitText(startOffset);
            startContainer.parentNode.insertBefore(n, nn);
          }
        } else {
          // Insert element node
          if (startContainer.childNodes.length > 0) {
            o = startContainer.childNodes[startOffset];
          }

          if (o) {
            startContainer.insertBefore(n, o);
          } else {
            if (startContainer.nodeType == 3) {
              dom.insertAfter(n, startContainer);
            } else {
              startContainer.appendChild(n);
            }
          }
        }
      }

      function surroundContents(n) {
        var f = self.extractContents();

        self.insertNode(n);
        n.appendChild(f);
        self.selectNode(n);
      }

      function cloneRange() {
        return extend(new Range(dom), {
          startContainer: self[START_CONTAINER],
          startOffset: self[START_OFFSET],
          endContainer: self[END_CONTAINER],
          endOffset: self[END_OFFSET],
          collapsed: self.collapsed,
          commonAncestorContainer: self.commonAncestorContainer
        });
      }

      // Private methods

      function _getSelectedNode(container, offset) {
        var child;

        // TEXT_NODE
        if (container.nodeType == 3) {
          return container;
        }

        if (offset < 0) {
          return container;
        }

        child = container.firstChild;
        while (child && offset > 0) {
          --offset;
          child = child.nextSibling;
        }

        if (child) {
          return child;
        }

        return container;
      }

      function _isCollapsed() {
        return (self[START_CONTAINER] == self[END_CONTAINER] && self[START_OFFSET] == self[END_OFFSET]);
      }

      function _compareBoundaryPoints(containerA, offsetA, containerB, offsetB) {
        var c, offsetC, n, cmnRoot, childA, childB;

        // In the first case the boundary-points have the same container. A is before B
        // if its offset is less than the offset of B, A is equal to B if its offset is
        // equal to the offset of B, and A is after B if its offset is greater than the
        // offset of B.
        if (containerA == containerB) {
          if (offsetA == offsetB) {
            return 0; // equal
          }

          if (offsetA < offsetB) {
            return -1; // before
          }

          return 1; // after
        }

        // In the second case a child node C of the container of A is an ancestor
        // container of B. In this case, A is before B if the offset of A is less than or
        // equal to the index of the child node C and A is after B otherwise.
        c = containerB;
        while (c && c.parentNode != containerA) {
          c = c.parentNode;
        }

        if (c) {
          offsetC = 0;
          n = containerA.firstChild;

          while (n != c && offsetC < offsetA) {
            offsetC++;
            n = n.nextSibling;
          }

          if (offsetA <= offsetC) {
            return -1; // before
          }

          return 1; // after
        }

        // In the third case a child node C of the container of B is an ancestor container
        // of A. In this case, A is before B if the index of the child node C is less than
        // the offset of B and A is after B otherwise.
        c = containerA;
        while (c && c.parentNode != containerB) {
          c = c.parentNode;
        }

        if (c) {
          offsetC = 0;
          n = containerB.firstChild;

          while (n != c && offsetC < offsetB) {
            offsetC++;
            n = n.nextSibling;
          }

          if (offsetC < offsetB) {
            return -1; // before
          }

          return 1; // after
        }

        // In the fourth case, none of three other cases hold: the containers of A and B
        // are siblings or descendants of sibling nodes. In this case, A is before B if
        // the container of A is before the container of B in a pre-order traversal of the
        // Ranges' context tree and A is after B otherwise.
        cmnRoot = dom.findCommonAncestor(containerA, containerB);
        childA = containerA;

        while (childA && childA.parentNode != cmnRoot) {
          childA = childA.parentNode;
        }

        if (!childA) {
          childA = cmnRoot;
        }

        childB = containerB;
        while (childB && childB.parentNode != cmnRoot) {
          childB = childB.parentNode;
        }

        if (!childB) {
          childB = cmnRoot;
        }

        if (childA == childB) {
          return 0; // equal
        }

        n = cmnRoot.firstChild;
        while (n) {
          if (n == childA) {
            return -1; // before
          }

          if (n == childB) {
            return 1; // after
          }

          n = n.nextSibling;
        }
      }

      function _setEndPoint(st, n, o) {
        var ec, sc;

        if (st) {
          self[START_CONTAINER] = n;
          self[START_OFFSET] = o;
        } else {
          self[END_CONTAINER] = n;
          self[END_OFFSET] = o;
        }

        // If one boundary-point of a Range is set to have a root container
        // other than the current one for the Range, the Range is collapsed to
        // the new position. This enforces the restriction that both boundary-
        // points of a Range must have the same root container.
        ec = self[END_CONTAINER];
        while (ec.parentNode) {
          ec = ec.parentNode;
        }

        sc = self[START_CONTAINER];
        while (sc.parentNode) {
          sc = sc.parentNode;
        }

        if (sc == ec) {
          // The start position of a Range is guaranteed to never be after the
          // end position. To enforce this restriction, if the start is set to
          // be at a position after the end, the Range is collapsed to that
          // position.
          if (_compareBoundaryPoints(self[START_CONTAINER], self[START_OFFSET], self[END_CONTAINER], self[END_OFFSET]) > 0) {
            self.collapse(st);
          }
        } else {
          self.collapse(st);
        }

        self.collapsed = _isCollapsed();
        self.commonAncestorContainer = dom.findCommonAncestor(self[START_CONTAINER], self[END_CONTAINER]);
      }

      function _traverse(how) {
        var c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

        if (self[START_CONTAINER] == self[END_CONTAINER]) {
          return _traverseSameContainer(how);
        }

        for (c = self[END_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
          if (p == self[START_CONTAINER]) {
            return _traverseCommonStartContainer(c, how);
          }

          ++endContainerDepth;
        }

        for (c = self[START_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
          if (p == self[END_CONTAINER]) {
            return _traverseCommonEndContainer(c, how);
          }

          ++startContainerDepth;
        }

        depthDiff = startContainerDepth - endContainerDepth;

        startNode = self[START_CONTAINER];
        while (depthDiff > 0) {
          startNode = startNode.parentNode;
          depthDiff--;
        }

        endNode = self[END_CONTAINER];
        while (depthDiff < 0) {
          endNode = endNode.parentNode;
          depthDiff++;
        }

        // ascend the ancestor hierarchy until we have a common parent.
        for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
          startNode = sp;
          endNode = ep;
        }

        return _traverseCommonAncestors(startNode, endNode, how);
      }

      function _traverseSameContainer(how) {
        var frag, s, sub, n, cnt, sibling, xferNode, start, len;

        if (how != DELETE) {
          frag = createDocumentFragment();
        }

        // If selection is empty, just return the fragment
        if (self[START_OFFSET] == self[END_OFFSET]) {
          return frag;
        }

        // Text node needs special case handling
        if (self[START_CONTAINER].nodeType == 3) { // TEXT_NODE
          // get the substring
          s = self[START_CONTAINER].nodeValue;
          sub = s.substring(self[START_OFFSET], self[END_OFFSET]);

          // set the original text node to its new value
          if (how != CLONE) {
            n = self[START_CONTAINER];
            start = self[START_OFFSET];
            len = self[END_OFFSET] - self[START_OFFSET];

            if (start === 0 && len >= n.nodeValue.length - 1) {
              n.parentNode.removeChild(n);
            } else {
              n.deleteData(start, len);
            }

            // Nothing is partially selected, so collapse to start point
            self.collapse(TRUE);
          }

          if (how == DELETE) {
            return;
          }

          if (sub.length > 0) {
            frag.appendChild(doc.createTextNode(sub));
          }

          return frag;
        }

        // Copy nodes between the start/end offsets.
        n = _getSelectedNode(self[START_CONTAINER], self[START_OFFSET]);
        cnt = self[END_OFFSET] - self[START_OFFSET];

        while (n && cnt > 0) {
          sibling = n.nextSibling;
          xferNode = _traverseFullySelected(n, how);

          if (frag) {
            frag.appendChild(xferNode);
          }

          --cnt;
          n = sibling;
        }

        // Nothing is partially selected, so collapse to start point
        if (how != CLONE) {
          self.collapse(TRUE);
        }

        return frag;
      }

      function _traverseCommonStartContainer(endAncestor, how) {
        var frag, n, endIdx, cnt, sibling, xferNode;

        if (how != DELETE) {
          frag = createDocumentFragment();
        }

        n = _traverseRightBoundary(endAncestor, how);

        if (frag) {
          frag.appendChild(n);
        }

        endIdx = nodeIndex(endAncestor);
        cnt = endIdx - self[START_OFFSET];

        if (cnt <= 0) {
          // Collapse to just before the endAncestor, which
          // is partially selected.
          if (how != CLONE) {
            self.setEndBefore(endAncestor);
            self.collapse(FALSE);
          }

          return frag;
        }

        n = endAncestor.previousSibling;
        while (cnt > 0) {
          sibling = n.previousSibling;
          xferNode = _traverseFullySelected(n, how);

          if (frag) {
            frag.insertBefore(xferNode, frag.firstChild);
          }

          --cnt;
          n = sibling;
        }

        // Collapse to just before the endAncestor, which
        // is partially selected.
        if (how != CLONE) {
          self.setEndBefore(endAncestor);
          self.collapse(FALSE);
        }

        return frag;
      }

      function _traverseCommonEndContainer(startAncestor, how) {
        var frag, startIdx, n, cnt, sibling, xferNode;

        if (how != DELETE) {
          frag = createDocumentFragment();
        }

        n = _traverseLeftBoundary(startAncestor, how);
        if (frag) {
          frag.appendChild(n);
        }

        startIdx = nodeIndex(startAncestor);
        ++startIdx; // Because we already traversed it

        cnt = self[END_OFFSET] - startIdx;
        n = startAncestor.nextSibling;
        while (n && cnt > 0) {
          sibling = n.nextSibling;
          xferNode = _traverseFullySelected(n, how);

          if (frag) {
            frag.appendChild(xferNode);
          }

          --cnt;
          n = sibling;
        }

        if (how != CLONE) {
          self.setStartAfter(startAncestor);
          self.collapse(TRUE);
        }

        return frag;
      }

      function _traverseCommonAncestors(startAncestor, endAncestor, how) {
        var n, frag, startOffset, endOffset, cnt, sibling, nextSibling;

        if (how != DELETE) {
          frag = createDocumentFragment();
        }

        n = _traverseLeftBoundary(startAncestor, how);
        if (frag) {
          frag.appendChild(n);
        }

        startOffset = nodeIndex(startAncestor);
        endOffset = nodeIndex(endAncestor);
        ++startOffset;

        cnt = endOffset - startOffset;
        sibling = startAncestor.nextSibling;

        while (cnt > 0) {
          nextSibling = sibling.nextSibling;
          n = _traverseFullySelected(sibling, how);

          if (frag) {
            frag.appendChild(n);
          }

          sibling = nextSibling;
          --cnt;
        }

        n = _traverseRightBoundary(endAncestor, how);

        if (frag) {
          frag.appendChild(n);
        }

        if (how != CLONE) {
          self.setStartAfter(startAncestor);
          self.collapse(TRUE);
        }

        return frag;
      }

      function _traverseRightBoundary(root, how) {
        var next = _getSelectedNode(self[END_CONTAINER], self[END_OFFSET] - 1), parent, clonedParent;
        var prevSibling, clonedChild, clonedGrandParent, isFullySelected = next != self[END_CONTAINER];

        if (next == root) {
          return _traverseNode(next, isFullySelected, FALSE, how);
        }

        parent = next.parentNode;
        clonedParent = _traverseNode(parent, FALSE, FALSE, how);

        while (parent) {
          while (next) {
            prevSibling = next.previousSibling;
            clonedChild = _traverseNode(next, isFullySelected, FALSE, how);

            if (how != DELETE) {
              clonedParent.insertBefore(clonedChild, clonedParent.firstChild);
            }

            isFullySelected = TRUE;
            next = prevSibling;
          }

          if (parent == root) {
            return clonedParent;
          }

          next = parent.previousSibling;
          parent = parent.parentNode;

          clonedGrandParent = _traverseNode(parent, FALSE, FALSE, how);

          if (how != DELETE) {
            clonedGrandParent.appendChild(clonedParent);
          }

          clonedParent = clonedGrandParent;
        }
      }

      function _traverseLeftBoundary(root, how) {
        var next = _getSelectedNode(self[START_CONTAINER], self[START_OFFSET]), isFullySelected = next != self[START_CONTAINER];
        var parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

        if (next == root) {
          return _traverseNode(next, isFullySelected, TRUE, how);
        }

        parent = next.parentNode;
        clonedParent = _traverseNode(parent, FALSE, TRUE, how);

        while (parent) {
          while (next) {
            nextSibling = next.nextSibling;
            clonedChild = _traverseNode(next, isFullySelected, TRUE, how);

            if (how != DELETE) {
              clonedParent.appendChild(clonedChild);
            }

            isFullySelected = TRUE;
            next = nextSibling;
          }

          if (parent == root) {
            return clonedParent;
          }

          next = parent.nextSibling;
          parent = parent.parentNode;

          clonedGrandParent = _traverseNode(parent, FALSE, TRUE, how);

          if (how != DELETE) {
            clonedGrandParent.appendChild(clonedParent);
          }

          clonedParent = clonedGrandParent;
        }
      }

      function _traverseNode(n, isFullySelected, isLeft, how) {
        var txtValue, newNodeValue, oldNodeValue, offset, newNode;

        if (isFullySelected) {
          return _traverseFullySelected(n, how);
        }

        // TEXT_NODE
        if (n.nodeType == 3) {
          txtValue = n.nodeValue;

          if (isLeft) {
            offset = self[START_OFFSET];
            newNodeValue = txtValue.substring(offset);
            oldNodeValue = txtValue.substring(0, offset);
          } else {
            offset = self[END_OFFSET];
            newNodeValue = txtValue.substring(0, offset);
            oldNodeValue = txtValue.substring(offset);
          }

          if (how != CLONE) {
            n.nodeValue = oldNodeValue;
          }

          if (how == DELETE) {
            return;
          }

          newNode = dom.clone(n, FALSE);
          newNode.nodeValue = newNodeValue;

          return newNode;
        }

        if (how == DELETE) {
          return;
        }

        return dom.clone(n, FALSE);
      }

      function _traverseFullySelected(n, how) {
        if (how != DELETE) {
          return how == CLONE ? dom.clone(n, TRUE) : n;
        }

        n.parentNode.removeChild(n);
      }

      function toStringIE() {
        return dom.create('body', null, cloneContents()).outerText;
      }

      extend(self, {
        // Initial states
        startContainer: doc,
        startOffset: 0,
        endContainer: doc,
        endOffset: 0,
        collapsed: TRUE,
        commonAncestorContainer: doc,

        // Range constants
        START_TO_START: 0,
        START_TO_END: 1,
        END_TO_END: 2,
        END_TO_START: 3,

        // Public methods
        setStart: setStart,
        setEnd: setEnd,
        setStartBefore: setStartBefore,
        setStartAfter: setStartAfter,
        setEndBefore: setEndBefore,
        setEndAfter: setEndAfter,
        collapse: collapse,
        selectNode: selectNode,
        selectNodeContents: selectNodeContents,
        compareBoundaryPoints: compareBoundaryPoints,
        deleteContents: deleteContents,
        extractContents: extractContents,
        cloneContents: cloneContents,
        insertNode: insertNode,
        surroundContents: surroundContents,
        cloneRange: cloneRange,
        toStringIE: toStringIE
      });

      return self;
    }

    // Older IE versions doesn't let you override toString by it's constructor so we have to stick it in the prototype
    Range.prototype.toString = function () {
      return this.toStringIE();
    };

    return Range;
  }
);

defineGlobal("global!Array", Array);
defineGlobal("global!Error", Error);
define(
  'ephox.katamari.api.Fun',

  [
    'global!Array',
    'global!Error'
  ],

  function (Array, Error) {

    var noop = function () { };

    var compose = function (fa, fb) {
      return function () {
        return fa(fb.apply(null, arguments));
      };
    };

    var constant = function (value) {
      return function () {
        return value;
      };
    };

    var identity = function (x) {
      return x;
    };

    var tripleEquals = function(a, b) {
      return a === b;
    };

    // Don't use array slice(arguments), makes the whole function unoptimisable on Chrome
    var curry = function (f) {
      // equivalent to arguments.slice(1)
      // starting at 1 because 0 is the f, makes things tricky.
      // Pay attention to what variable is where, and the -1 magic.
      // thankfully, we have tests for this.
      var args = new Array(arguments.length - 1);
      for (var i = 1; i < arguments.length; i++) args[i-1] = arguments[i];

      return function () {
        var newArgs = new Array(arguments.length);
        for (var j = 0; j < newArgs.length; j++) newArgs[j] = arguments[j];

        var all = args.concat(newArgs);
        return f.apply(null, all);
      };
    };

    var not = function (f) {
      return function () {
        return !f.apply(null, arguments);
      };
    };

    var die = function (msg) {
      return function () {
        throw new Error(msg);
      };
    };

    var apply = function (f) {
      return f();
    };

    var call = function(f) {
      f();
    };

    var never = constant(false);
    var always = constant(true);
    

    return {
      noop: noop,
      compose: compose,
      constant: constant,
      identity: identity,
      tripleEquals: tripleEquals,
      curry: curry,
      not: not,
      die: die,
      apply: apply,
      call: call,
      never: never,
      always: always
    };
  }
);

defineGlobal("global!Object", Object);
define(
  'ephox.katamari.api.Option',

  [
    'ephox.katamari.api.Fun',
    'global!Object'
  ],

  function (Fun, Object) {

    var never = Fun.never;
    var always = Fun.always;

    /**
      Option objects support the following methods:

      fold :: this Option a -> ((() -> b, a -> b)) -> Option b

      is :: this Option a -> a -> Boolean

      isSome :: this Option a -> () -> Boolean

      isNone :: this Option a -> () -> Boolean

      getOr :: this Option a -> a -> a

      getOrThunk :: this Option a -> (() -> a) -> a

      getOrDie :: this Option a -> String -> a

      or :: this Option a -> Option a -> Option a
        - if some: return self
        - if none: return opt

      orThunk :: this Option a -> (() -> Option a) -> Option a
        - Same as "or", but uses a thunk instead of a value

      map :: this Option a -> (a -> b) -> Option b
        - "fmap" operation on the Option Functor.
        - same as 'each'

      ap :: this Option a -> Option (a -> b) -> Option b
        - "apply" operation on the Option Apply/Applicative.
        - Equivalent to <*> in Haskell/PureScript.

      each :: this Option a -> (a -> b) -> Option b
        - same as 'map'

      bind :: this Option a -> (a -> Option b) -> Option b
        - "bind"/"flatMap" operation on the Option Bind/Monad.
        - Equivalent to >>= in Haskell/PureScript; flatMap in Scala.

      flatten :: {this Option (Option a))} -> () -> Option a
        - "flatten"/"join" operation on the Option Monad.

      exists :: this Option a -> (a -> Boolean) -> Boolean

      forall :: this Option a -> (a -> Boolean) -> Boolean

      filter :: this Option a -> (a -> Boolean) -> Option a

      equals :: this Option a -> Option a -> Boolean

      equals_ :: this Option a -> (Option a, a -> Boolean) -> Boolean

      toArray :: this Option a -> () -> [a]

    */

    var none = function () { return NONE; };

    var NONE = (function () {
      var eq = function (o) {
        return o.isNone();
      };

      // inlined from peanut, maybe a micro-optimisation?
      var call = function (thunk) { return thunk(); };
      var id = function (n) { return n; };
      var noop = function () { };

      var me = {
        fold: function (n, s) { return n(); },
        is: never,
        isSome: never,
        isNone: always,
        getOr: id,
        getOrThunk: call,
        getOrDie: function (msg) {
          throw new Error(msg || 'error: getOrDie called on none.');
        },
        or: id,
        orThunk: call,
        map: none,
        ap: none,
        each: noop,
        bind: none,
        flatten: none,
        exists: never,
        forall: always,
        filter: none,
        equals: eq,
        equals_: eq,
        toArray: function () { return []; },
        toString: Fun.constant("none()")
      };
      if (Object.freeze) Object.freeze(me);
      return me;
    })();


    /** some :: a -> Option a */
    var some = function (a) {

      // inlined from peanut, maybe a micro-optimisation?
      var constant_a = function () { return a; };

      var self = function () {
        // can't Fun.constant this one
        return me;
      };

      var map = function (f) {
        return some(f(a));
      };

      var bind = function (f) {
        return f(a);
      };

      var me = {
        fold: function (n, s) { return s(a); },
        is: function (v) { return a === v; },
        isSome: always,
        isNone: never,
        getOr: constant_a,
        getOrThunk: constant_a,
        getOrDie: constant_a,
        or: self,
        orThunk: self,
        map: map,
        ap: function (optfab) {
          return optfab.fold(none, function(fab) {
            return some(fab(a));
          });
        },
        each: function (f) {
          f(a);
        },
        bind: bind,
        flatten: constant_a,
        exists: bind,
        forall: bind,
        filter: function (f) {
          return f(a) ? me : NONE;
        },
        equals: function (o) {
          return o.is(a);
        },
        equals_: function (o, elementEq) {
          return o.fold(
            never,
            function (b) { return elementEq(a, b); }
          );
        },
        toArray: function () {
          return [a];
        },
        toString: function () {
          return 'some(' + a + ')';
        }
      };
      return me;
    };

    /** from :: undefined|null|a -> Option a */
    var from = function (value) {
      return value === null || value === undefined ? NONE : some(value);
    };

    return {
      some: some,
      none: none,
      from: from
    };
  }
);

defineGlobal("global!String", String);
define(
  'ephox.katamari.api.Arr',

  [
    'ephox.katamari.api.Option',
    'global!Array',
    'global!Error',
    'global!String'
  ],

  function (Option, Array, Error, String) {
    // Use the native Array.indexOf if it is available (IE9+) otherwise fall back to manual iteration
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    var rawIndexOf = (function () {
      var pIndexOf = Array.prototype.indexOf;

      var fastIndex = function (xs, x) { return  pIndexOf.call(xs, x); };

      var slowIndex = function(xs, x) { return slowIndexOf(xs, x); };

      return pIndexOf === undefined ? slowIndex : fastIndex;
    })();

    var indexOf = function (xs, x) {
      // The rawIndexOf method does not wrap up in an option. This is for performance reasons.
      var r = rawIndexOf(xs, x);
      return r === -1 ? Option.none() : Option.some(r);
    };

    var contains = function (xs, x) {
      return rawIndexOf(xs, x) > -1;
    };

    // Using findIndex is likely less optimal in Chrome (dynamic return type instead of bool)
    // but if we need that micro-optimisation we can inline it later.
    var exists = function (xs, pred) {
      return findIndex(xs, pred).isSome();
    };

    var range = function (num, f) {
      var r = [];
      for (var i = 0; i < num; i++) {
        r.push(f(i));
      }
      return r;
    };

    // It's a total micro optimisation, but these do make some difference.
    // Particularly for browsers other than Chrome.
    // - length caching
    // http://jsperf.com/browser-diet-jquery-each-vs-for-loop/69
    // - not using push
    // http://jsperf.com/array-direct-assignment-vs-push/2

    var chunk = function (array, size) {
      var r = [];
      for (var i = 0; i < array.length; i += size) {
        var s = array.slice(i, i + size);
        r.push(s);
      }
      return r;
    };

    var map = function(xs, f) {
      // pre-allocating array size when it's guaranteed to be known
      // http://jsperf.com/push-allocated-vs-dynamic/22
      var len = xs.length;
      var r = new Array(len);
      for (var i = 0; i < len; i++) {
        var x = xs[i];
        r[i] = f(x, i, xs);
      }
      return r;
    };

    // Unwound implementing other functions in terms of each.
    // The code size is roughly the same, and it should allow for better optimisation.
    var each = function(xs, f) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        f(x, i, xs);
      }
    };

    var eachr = function (xs, f) {
      for (var i = xs.length - 1; i >= 0; i--) {
        var x = xs[i];
        f(x, i, xs);
      }
    };

    var partition = function(xs, pred) {
      var pass = [];
      var fail = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        var arr = pred(x, i, xs) ? pass : fail;
        arr.push(x);
      }
      return { pass: pass, fail: fail };
    };

    var filter = function(xs, pred) {
      var r = [];
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          r.push(x);
        }
      }
      return r;
    };

    /*
     * Groups an array into contiguous arrays of like elements. Whether an element is like or not depends on f.
     *
     * f is a function that derives a value from an element - e.g. true or false, or a string.
     * Elements are like if this function generates the same value for them (according to ===).
     *
     *
     * Order of the elements is preserved. Arr.flatten() on the result will return the original list, as with Haskell groupBy function.
     *  For a good explanation, see the group function (which is a special case of groupBy)
     *  http://hackage.haskell.org/package/base-4.7.0.0/docs/Data-List.html#v:group
     */
    var groupBy = function (xs, f) {
      if (xs.length === 0) {
        return [];
      } else {
        var wasType = f(xs[0]); // initial case for matching
        var r = [];
        var group = [];

        for (var i = 0, len = xs.length; i < len; i++) {
          var x = xs[i];
          var type = f(x);
          if (type !== wasType) {
            r.push(group);
            group = [];
          }
          wasType = type;
          group.push(x);
        }
        if (group.length !== 0) {
          r.push(group);
        }
        return r;
      }
    };

    var foldr = function (xs, f, acc) {
      eachr(xs, function (x) {
        acc = f(acc, x);
      });
      return acc;
    };

    var foldl = function (xs, f, acc) {
      each(xs, function (x) {
        acc = f(acc, x);
      });
      return acc;
    };

    var find = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          return Option.some(x);
        }
      }
      return Option.none();
    };

    var findIndex = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        if (pred(x, i, xs)) {
          return Option.some(i);
        }
      }

      return Option.none();
    };

    var slowIndexOf = function (xs, x) {
      for (var i = 0, len = xs.length; i < len; ++i) {
        if (xs[i] === x) {
          return i;
        }
      }

      return -1;
    };

    var push = Array.prototype.push;
    var flatten = function (xs) {
      // Note, this is possible because push supports multiple arguments:
      // http://jsperf.com/concat-push/6
      // Note that in the past, concat() would silently work (very slowly) for array-like objects.
      // With this change it will throw an error.
      var r = [];
      for (var i = 0, len = xs.length; i < len; ++i) {
        // Ensure that each value is an array itself
        if (! Array.prototype.isPrototypeOf(xs[i])) throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
        push.apply(r, xs[i]);
      }
      return r;
    };

    var bind = function (xs, f) {
      var output = map(xs, f);
      return flatten(output);
    };

    var forall = function (xs, pred) {
      for (var i = 0, len = xs.length; i < len; ++i) {
        var x = xs[i];
        if (pred(x, i, xs) !== true) {
          return false;
        }
      }
      return true;
    };

    var equal = function (a1, a2) {
      return a1.length === a2.length && forall(a1, function (x, i) {
        return x === a2[i];
      });
    };

    var slice = Array.prototype.slice;
    var reverse = function (xs) {
      var r = slice.call(xs, 0);
      r.reverse();
      return r;
    };

    var difference = function (a1, a2) {
      return filter(a1, function (x) {
        return !contains(a2, x);
      });
    };

    var mapToObject = function(xs, f) {
      var r = {};
      for (var i = 0, len = xs.length; i < len; i++) {
        var x = xs[i];
        r[String(x)] = f(x, i);
      }
      return r;
    };

    var pure = function(x) {
      return [x];
    };

    var sort = function (xs, comparator) {
      var copy = slice.call(xs, 0);
      copy.sort(comparator);
      return copy;
    };

    return {
      map: map,
      each: each,
      eachr: eachr,
      partition: partition,
      filter: filter,
      groupBy: groupBy,
      indexOf: indexOf,
      foldr: foldr,
      foldl: foldl,
      find: find,
      findIndex: findIndex,
      flatten: flatten,
      bind: bind,
      forall: forall,
      exists: exists,
      contains: contains,
      equal: equal,
      reverse: reverse,
      chunk: chunk,
      difference: difference,
      mapToObject: mapToObject,
      pure: pure,
      sort: sort,
      range: range
    };
  }
);
defineGlobal("global!setTimeout", setTimeout);
define(
  'ephox.katamari.api.LazyValue',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'global!setTimeout'
  ],

  function (Arr, Option, setTimeout) {
    var nu = function (baseFn) {
      var data = Option.none();
      var callbacks = [];

      /** map :: this LazyValue a -> (a -> b) -> LazyValue b */
      var map = function (f) {
        return nu(function (nCallback) {
          get(function (data) {
            nCallback(f(data));
          });
        });
      };

      var get = function (nCallback) {
        if (isReady()) call(nCallback);
        else callbacks.push(nCallback);
      };

      var set = function (x) {
        data = Option.some(x);
        run(callbacks);
        callbacks = [];
      };

      var isReady = function () {
        return data.isSome();
      };

      var run = function (cbs) {
        Arr.each(cbs, call);
      };

      var call = function(cb) {
        data.each(function(x) {
          setTimeout(function() {
            cb(x);
          }, 0);
        });
      };

      // Lazy values cache the value and kick off immediately
      baseFn(set);

      return {
        get: get,
        map: map,
        isReady: isReady
      };
    };

    var pure = function (a) {
      return nu(function (callback) {
        callback(a);
      });
    };

    return {
      nu: nu,
      pure: pure
    };
  }
);
define(
  'ephox.katamari.async.Bounce',

  [
    'global!Array',
    'global!setTimeout'
  ],

  function (Array, setTimeout) {

    var bounce = function(f) {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var me = this;
        setTimeout(function() {
          f.apply(me, args);
        }, 0);
      };
    };

    return {
      bounce: bounce
    };
  }
);

define(
  'ephox.katamari.api.Future',

  [
    'ephox.katamari.api.LazyValue',
    'ephox.katamari.async.Bounce'
  ],

  /** A future value that is evaluated on demand. The base function is re-evaluated each time 'get' is called. */
  function (LazyValue, Bounce) {
    var nu = function (baseFn) {
      var get = function(callback) {
        baseFn(Bounce.bounce(callback));
      };

      /** map :: this Future a -> (a -> b) -> Future b */
      var map = function (fab) {
        return nu(function (callback) {
          get(function (a) {
            var value = fab(a);
            callback(value);
          });
        });
      };

      /** bind :: this Future a -> (a -> Future b) -> Future b */
      var bind = function (aFutureB) {
        return nu(function (callback) {
          get(function (a) {
            aFutureB(a).get(callback);
          });
        });
      };

      /** anonBind :: this Future a -> Future b -> Future b
       *  Returns a future, which evaluates the first future, ignores the result, then evaluates the second.
       */
      var anonBind = function (futureB) {
        return nu(function (callback) {
          get(function (a) {
            futureB.get(callback);
          });
        });
      };

      var toLazy = function () {
        return LazyValue.nu(get);
      };

      return {
        map: map,
        bind: bind,
        anonBind: anonBind,
        toLazy: toLazy,
        get: get
      };

    };

    /** a -> Future a */
    var pure = function (a) {
      return nu(function (callback) {
        callback(a);
      });
    };

    return {
      nu: nu,
      pure: pure
    };
  }
);

define(
  'ephox.katamari.async.AsyncValues',

  [
    'ephox.katamari.api.Arr'
  ],

  function (Arr) {
    /* 
     * NOTE: an `asyncValue` must have a `get` function which gets given a callback and calls 
     * that callback with a value once it is ready
     *
     * e.g 
     * {
     *   get: function (callback) { callback(10); }
     * }
     */
    var par = function (asyncValues, nu) {
      return nu(function(callback) {
        var r = [];
        var count = 0;

        var cb = function(i) {
          return function(value) {
            r[i] = value;
            count++;
            if (count >= asyncValues.length) {
              callback(r);
            }
          };
        };

        if (asyncValues.length === 0) {
          callback([]);
        } else {
          Arr.each(asyncValues, function(asyncValue, i) {
            asyncValue.get(cb(i));
          });
        }
      });
    };

    return {
      par: par
    };
  }
);
define(
  'ephox.katamari.api.Futures',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.async.AsyncValues'
  ],

  function (Arr, Future, AsyncValues) {
    /** par :: [Future a] -> Future [a] */
    var par = function(futures) {
      return AsyncValues.par(futures, Future.nu);
    };

    /** mapM :: [a] -> (a -> Future b) -> Future [b] */
    var mapM = function(array, fn) {
      var futures = Arr.map(array, fn);
      return par(futures);
    };

    /** Kleisli composition of two functions: a -> Future b.
     *  Note the order of arguments: g is invoked first, then the result passed to f.
     *  This is in line with f . g = \x -> f (g a)
     *
     *  compose :: ((b -> Future c), (a -> Future b)) -> a -> Future c
     */
    var compose = function (f, g) {
      return function (a) {
        return g(a).bind(f);
      };
    };

    return {
      par: par,
      mapM: mapM,
      compose: compose
    };
  }
);
define(
  'ephox.katamari.api.Result',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option'
  ],

  function (Fun, Option) {
    /* The type signatures for Result 
     * is :: this Result a -> a -> Bool
     * or :: this Result a -> Result a -> Result a
     * orThunk :: this Result a -> (_ -> Result a) -> Result a
     * map :: this Result a -> (a -> b) -> Result b
     * each :: this Result a -> (a -> _) -> _ 
     * bind :: this Result a -> (a -> Result b) -> Result b
     * fold :: this Result a -> (_ -> b, a -> b) -> b
     * exists :: this Result a -> (a -> Bool) -> Bool
     * forall :: this Result a -> (a -> Bool) -> Bool
     * toOption :: this Result a -> Option a
     * isValue :: this Result a -> Bool
     * isError :: this Result a -> Bool
     * getOr :: this Result a -> a -> a
     * getOrThunk :: this Result a -> (_ -> a) -> a
     * getOrDie :: this Result a -> a (or throws error)
    */

    var value = function (o) {
      var is = function (v) {
        return o === v;      
      };

      var or = function (opt) {
        return value(o);
      };

      var orThunk = function (f) {
        return value(o);
      };

      var map = function (f) {
        return value(f(o));
      };

      var each = function (f) {
        f(o);
      };

      var bind = function (f) {
        return f(o);
      };

      var fold = function (_, onValue) {
        return onValue(o);
      };

      var exists = function (f) {
        return f(o);
      };

      var forall = function (f) {
        return f(o);
      };

      var toOption = function () {
        return Option.some(o);
      };
     
      return {
        is: is,
        isValue: Fun.constant(true),
        isError: Fun.constant(false),
        getOr: Fun.constant(o),
        getOrThunk: Fun.constant(o),
        getOrDie: Fun.constant(o),
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        each: each,
        bind: bind,
        exists: exists,
        forall: forall,
        toOption: toOption
      };
    };

    var error = function (message) {
      var getOrThunk = function (f) {
        return f();
      };

      var getOrDie = function () {
        return Fun.die(message)();
      };

      var or = function (opt) {
        return opt;
      };

      var orThunk = function (f) {
        return f();
      };

      var map = function (f) {
        return error(message);
      };

      var bind = function (f) {
        return error(message);
      };

      var fold = function (onError, _) {
        return onError(message);
      };

      return {
        is: Fun.constant(false),
        isValue: Fun.constant(false),
        isError: Fun.constant(true),
        getOr: Fun.identity,
        getOrThunk: getOrThunk,
        getOrDie: getOrDie,
        or: or,
        orThunk: orThunk,
        fold: fold,
        map: map,
        each: Fun.noop,
        bind: bind,
        exists: Fun.constant(false),
        forall: Fun.constant(true),
        toOption: Option.none
      };
    };

    return {
      value: value,
      error: error
    };
  }
);

/**
 * StyleSheetLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */
define(
  'tinymce.core.dom.StyleSheetLoader',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Futures',
    'ephox.katamari.api.Result',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools'
  ],
  function (Arr, Fun, Future, Futures, Result, Delay, Tools) {
    "use strict";

    return function (document, settings) {
      var idCount = 0, loadedStates = {}, maxLoadTime;

      settings = settings || {};
      maxLoadTime = settings.maxLoadTime || 5000;

      function appendToHead(node) {
        document.getElementsByTagName('head')[0].appendChild(node);
      }

      /**
       * Loads the specified css style sheet file and call the loadedCallback once it's finished loading.
       *
       * @method load
       * @param {String} url Url to be loaded.
       * @param {Function} loadedCallback Callback to be executed when loaded.
       * @param {Function} errorCallback Callback to be executed when failed loading.
       */
      function load(url, loadedCallback, errorCallback) {
        var link, style, startTime, state;

        function passed() {
          var callbacks = state.passed, i = callbacks.length;

          while (i--) {
            callbacks[i]();
          }

          state.status = 2;
          state.passed = [];
          state.failed = [];
        }

        function failed() {
          var callbacks = state.failed, i = callbacks.length;

          while (i--) {
            callbacks[i]();
          }

          state.status = 3;
          state.passed = [];
          state.failed = [];
        }

        // Sniffs for older WebKit versions that have the link.onload but a broken one
        function isOldWebKit() {
          var webKitChunks = navigator.userAgent.match(/WebKit\/(\d*)/);
          return !!(webKitChunks && webKitChunks[1] < 536);
        }

        // Calls the waitCallback until the test returns true or the timeout occurs
        function wait(testCallback, waitCallback) {
          if (!testCallback()) {
            // Wait for timeout
            if ((new Date().getTime()) - startTime < maxLoadTime) {
              Delay.setTimeout(waitCallback);
            } else {
              failed();
            }
          }
        }

        // Workaround for WebKit that doesn't properly support the onload event for link elements
        // Or WebKit that fires the onload event before the StyleSheet is added to the document
        function waitForWebKitLinkLoaded() {
          wait(function () {
            var styleSheets = document.styleSheets, styleSheet, i = styleSheets.length, owner;

            while (i--) {
              styleSheet = styleSheets[i];
              owner = styleSheet.ownerNode ? styleSheet.ownerNode : styleSheet.owningElement;
              if (owner && owner.id === link.id) {
                passed();
                return true;
              }
            }
          }, waitForWebKitLinkLoaded);
        }

        // Workaround for older Geckos that doesn't have any onload event for StyleSheets
        function waitForGeckoLinkLoaded() {
          wait(function () {
            try {
              // Accessing the cssRules will throw an exception until the CSS file is loaded
              var cssRules = style.sheet.cssRules;
              passed();
              return !!cssRules;
            } catch (ex) {
              // Ignore
            }
          }, waitForGeckoLinkLoaded);
        }

        url = Tools._addCacheSuffix(url);

        if (!loadedStates[url]) {
          state = {
            passed: [],
            failed: []
          };

          loadedStates[url] = state;
        } else {
          state = loadedStates[url];
        }

        if (loadedCallback) {
          state.passed.push(loadedCallback);
        }

        if (errorCallback) {
          state.failed.push(errorCallback);
        }

        // Is loading wait for it to pass
        if (state.status == 1) {
          return;
        }

        // Has finished loading and was success
        if (state.status == 2) {
          passed();
          return;
        }

        // Has finished loading and was a failure
        if (state.status == 3) {
          failed();
          return;
        }

        // Start loading
        state.status = 1;
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = 'u' + (idCount++);
        link.async = false;
        link.defer = false;
        startTime = new Date().getTime();

        // Feature detect onload on link element and sniff older webkits since it has an broken onload event
        if ("onload" in link && !isOldWebKit()) {
          link.onload = waitForWebKitLinkLoaded;
          link.onerror = failed;
        } else {
          // Sniff for old Firefox that doesn't support the onload event on link elements
          // TODO: Remove this in the future when everyone uses modern browsers
          if (navigator.userAgent.indexOf("Firefox") > 0) {
            style = document.createElement('style');
            style.textContent = '@import "' + url + '"';
            waitForGeckoLinkLoaded();
            appendToHead(style);
            return;
          }

          // Use the id owner on older webkits
          waitForWebKitLinkLoaded();
        }

        appendToHead(link);
        link.href = url;
      }

      var loadF = function (url) {
        return Future.nu(function (resolve) {
          load(
            url,
            Fun.compose(resolve, Fun.constant(Result.value(url))),
            Fun.compose(resolve, Fun.constant(Result.error(url)))
          );
        });
      };

      var unbox = function (result) {
        return result.fold(Fun.identity, Fun.identity);
      };

      var loadAll = function (urls, success, failure) {
        Futures.par(Arr.map(urls, loadF)).get(function (result) {
          var parts = Arr.partition(result, function (r) {
            return r.isValue();
          });

          if (parts.fail.length > 0) {
            failure(parts.fail.map(unbox));
          } else {
            success(parts.pass.map(unbox));
          }
        });
      };

      return {
        load: load,
        loadAll: loadAll
      };
    };
  }
);

/**
 * Schema.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Schema validator class.
 *
 * @class tinymce.html.Schema
 * @example
 *  if (tinymce.activeEditor.schema.isValidChild('p', 'span'))
 *    alert('span is valid child of p.');
 *
 *  if (tinymce.activeEditor.schema.getElementRule('p'))
 *    alert('P is a valid element.');
 *
 * @class tinymce.html.Schema
 * @version 3.4
 */
define(
  'tinymce.core.html.Schema',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    var mapCache = {}, dummyObj = {};
    var makeMap = Tools.makeMap, each = Tools.each, extend = Tools.extend, explode = Tools.explode, inArray = Tools.inArray;

    function split(items, delim) {
      items = Tools.trim(items);
      return items ? items.split(delim || ' ') : [];
    }

    /**
     * Builds a schema lookup table
     *
     * @private
     * @param {String} type html4, html5 or html5-strict schema type.
     * @return {Object} Schema lookup table.
     */
    function compileSchema(type) {
      var schema = {}, globalAttributes, blockContent;
      var phrasingContent, flowContent, html4BlockContent, html4PhrasingContent;

      function add(name, attributes, children) {
        var ni, attributesOrder, element;

        function arrayToMap(array, obj) {
          var map = {}, i, l;

          for (i = 0, l = array.length; i < l; i++) {
            map[array[i]] = obj || {};
          }

          return map;
        }

        children = children || [];
        attributes = attributes || "";

        if (typeof children === "string") {
          children = split(children);
        }

        name = split(name);
        ni = name.length;
        while (ni--) {
          attributesOrder = split([globalAttributes, attributes].join(' '));

          element = {
            attributes: arrayToMap(attributesOrder),
            attributesOrder: attributesOrder,
            children: arrayToMap(children, dummyObj)
          };

          schema[name[ni]] = element;
        }
      }

      function addAttrs(name, attributes) {
        var ni, schemaItem, i, l;

        name = split(name);
        ni = name.length;
        attributes = split(attributes);
        while (ni--) {
          schemaItem = schema[name[ni]];
          for (i = 0, l = attributes.length; i < l; i++) {
            schemaItem.attributes[attributes[i]] = {};
            schemaItem.attributesOrder.push(attributes[i]);
          }
        }
      }

      // Use cached schema
      if (mapCache[type]) {
        return mapCache[type];
      }

      // Attributes present on all elements
      globalAttributes = "id accesskey class dir lang style tabindex title role";

      // Event attributes can be opt-in/opt-out
      /*eventAttributes = split("onabort onblur oncancel oncanplay oncanplaythrough onchange onclick onclose oncontextmenu oncuechange " +
       "ondblclick ondrag ondragend ondragenter ondragleave ondragover ondragstart ondrop ondurationchange onemptied onended " +
       "onerror onfocus oninput oninvalid onkeydown onkeypress onkeyup onload onloadeddata onloadedmetadata onloadstart " +
       "onmousedown onmousemove onmouseout onmouseover onmouseup onmousewheel onpause onplay onplaying onprogress onratechange " +
       "onreset onscroll onseeked onseeking onseeking onselect onshow onstalled onsubmit onsuspend ontimeupdate onvolumechange " +
       "onwaiting"
       );*/

      // Block content elements
      blockContent =
        "address blockquote div dl fieldset form h1 h2 h3 h4 h5 h6 hr menu ol p pre table ul";

      // Phrasing content elements from the HTML5 spec (inline)
      phrasingContent =
        "a abbr b bdo br button cite code del dfn em embed i iframe img input ins kbd " +
        "label map noscript object q s samp script select small span strong sub sup " +
        "textarea u var #text #comment"
        ;

      // Add HTML5 items to globalAttributes, blockContent, phrasingContent
      if (type != "html4") {
        globalAttributes += " contenteditable contextmenu draggable dropzone " +
          "hidden spellcheck translate";
        blockContent += " article aside details dialog figure header footer hgroup section nav";
        phrasingContent += " audio canvas command datalist mark meter output picture " +
          "progress time wbr video ruby bdi keygen";
      }

      // Add HTML4 elements unless it's html5-strict
      if (type != "html5-strict") {
        globalAttributes += " xml:lang";

        html4PhrasingContent = "acronym applet basefont big font strike tt";
        phrasingContent = [phrasingContent, html4PhrasingContent].join(' ');

        each(split(html4PhrasingContent), function (name) {
          add(name, "", phrasingContent);
        });

        html4BlockContent = "center dir isindex noframes";
        blockContent = [blockContent, html4BlockContent].join(' ');

        // Flow content elements from the HTML5 spec (block+inline)
        flowContent = [blockContent, phrasingContent].join(' ');

        each(split(html4BlockContent), function (name) {
          add(name, "", flowContent);
        });
      }

      // Flow content elements from the HTML5 spec (block+inline)
      flowContent = flowContent || [blockContent, phrasingContent].join(" ");

      // HTML4 base schema TODO: Move HTML5 specific attributes to HTML5 specific if statement
      // Schema items <element name>, <specific attributes>, <children ..>
      add("html", "manifest", "head body");
      add("head", "", "base command link meta noscript script style title");
      add("title hr noscript br");
      add("base", "href target");
      add("link", "href rel media hreflang type sizes hreflang");
      add("meta", "name http-equiv content charset");
      add("style", "media type scoped");
      add("script", "src async defer type charset");
      add("body", "onafterprint onbeforeprint onbeforeunload onblur onerror onfocus " +
        "onhashchange onload onmessage onoffline ononline onpagehide onpageshow " +
        "onpopstate onresize onscroll onstorage onunload", flowContent);
      add("address dt dd div caption", "", flowContent);
      add("h1 h2 h3 h4 h5 h6 pre p abbr code var samp kbd sub sup i b u bdo span legend em strong small s cite dfn", "", phrasingContent);
      add("blockquote", "cite", flowContent);
      add("ol", "reversed start type", "li");
      add("ul", "", "li");
      add("li", "value", flowContent);
      add("dl", "", "dt dd");
      add("a", "href target rel media hreflang type", phrasingContent);
      add("q", "cite", phrasingContent);
      add("ins del", "cite datetime", flowContent);
      add("img", "src sizes srcset alt usemap ismap width height");
      add("iframe", "src name width height", flowContent);
      add("embed", "src type width height");
      add("object", "data type typemustmatch name usemap form width height", [flowContent, "param"].join(' '));
      add("param", "name value");
      add("map", "name", [flowContent, "area"].join(' '));
      add("area", "alt coords shape href target rel media hreflang type");
      add("table", "border", "caption colgroup thead tfoot tbody tr" + (type == "html4" ? " col" : ""));
      add("colgroup", "span", "col");
      add("col", "span");
      add("tbody thead tfoot", "", "tr");
      add("tr", "", "td th");
      add("td", "colspan rowspan headers", flowContent);
      add("th", "colspan rowspan headers scope abbr", flowContent);
      add("form", "accept-charset action autocomplete enctype method name novalidate target", flowContent);
      add("fieldset", "disabled form name", [flowContent, "legend"].join(' '));
      add("label", "form for", phrasingContent);
      add("input", "accept alt autocomplete checked dirname disabled form formaction formenctype formmethod formnovalidate " +
        "formtarget height list max maxlength min multiple name pattern readonly required size src step type value width"
      );
      add("button", "disabled form formaction formenctype formmethod formnovalidate formtarget name type value",
        type == "html4" ? flowContent : phrasingContent);
      add("select", "disabled form multiple name required size", "option optgroup");
      add("optgroup", "disabled label", "option");
      add("option", "disabled label selected value");
      add("textarea", "cols dirname disabled form maxlength name readonly required rows wrap");
      add("menu", "type label", [flowContent, "li"].join(' '));
      add("noscript", "", flowContent);

      // Extend with HTML5 elements
      if (type != "html4") {
        add("wbr");
        add("ruby", "", [phrasingContent, "rt rp"].join(' '));
        add("figcaption", "", flowContent);
        add("mark rt rp summary bdi", "", phrasingContent);
        add("canvas", "width height", flowContent);
        add("video", "src crossorigin poster preload autoplay mediagroup loop " +
          "muted controls width height buffered", [flowContent, "track source"].join(' '));
        add("audio", "src crossorigin preload autoplay mediagroup loop muted controls " +
          "buffered volume", [flowContent, "track source"].join(' '));
        add("picture", "", "img source");
        add("source", "src srcset type media sizes");
        add("track", "kind src srclang label default");
        add("datalist", "", [phrasingContent, "option"].join(' '));
        add("article section nav aside header footer", "", flowContent);
        add("hgroup", "", "h1 h2 h3 h4 h5 h6");
        add("figure", "", [flowContent, "figcaption"].join(' '));
        add("time", "datetime", phrasingContent);
        add("dialog", "open", flowContent);
        add("command", "type label icon disabled checked radiogroup command");
        add("output", "for form name", phrasingContent);
        add("progress", "value max", phrasingContent);
        add("meter", "value min max low high optimum", phrasingContent);
        add("details", "open", [flowContent, "summary"].join(' '));
        add("keygen", "autofocus challenge disabled form keytype name");
      }

      // Extend with HTML4 attributes unless it's html5-strict
      if (type != "html5-strict") {
        addAttrs("script", "language xml:space");
        addAttrs("style", "xml:space");
        addAttrs("object", "declare classid code codebase codetype archive standby align border hspace vspace");
        addAttrs("embed", "align name hspace vspace");
        addAttrs("param", "valuetype type");
        addAttrs("a", "charset name rev shape coords");
        addAttrs("br", "clear");
        addAttrs("applet", "codebase archive code object alt name width height align hspace vspace");
        addAttrs("img", "name longdesc align border hspace vspace");
        addAttrs("iframe", "longdesc frameborder marginwidth marginheight scrolling align");
        addAttrs("font basefont", "size color face");
        addAttrs("input", "usemap align");
        addAttrs("select", "onchange");
        addAttrs("textarea");
        addAttrs("h1 h2 h3 h4 h5 h6 div p legend caption", "align");
        addAttrs("ul", "type compact");
        addAttrs("li", "type");
        addAttrs("ol dl menu dir", "compact");
        addAttrs("pre", "width xml:space");
        addAttrs("hr", "align noshade size width");
        addAttrs("isindex", "prompt");
        addAttrs("table", "summary width frame rules cellspacing cellpadding align bgcolor");
        addAttrs("col", "width align char charoff valign");
        addAttrs("colgroup", "width align char charoff valign");
        addAttrs("thead", "align char charoff valign");
        addAttrs("tr", "align char charoff valign bgcolor");
        addAttrs("th", "axis align char charoff valign nowrap bgcolor width height");
        addAttrs("form", "accept");
        addAttrs("td", "abbr axis scope align char charoff valign nowrap bgcolor width height");
        addAttrs("tfoot", "align char charoff valign");
        addAttrs("tbody", "align char charoff valign");
        addAttrs("area", "nohref");
        addAttrs("body", "background bgcolor text link vlink alink");
      }

      // Extend with HTML5 attributes unless it's html4
      if (type != "html4") {
        addAttrs("input button select textarea", "autofocus");
        addAttrs("input textarea", "placeholder");
        addAttrs("a", "download");
        addAttrs("link script img", "crossorigin");
        addAttrs("iframe", "sandbox seamless allowfullscreen"); // Excluded: srcdoc
      }

      // Special: iframe, ruby, video, audio, label

      // Delete children of the same name from it's parent
      // For example: form can't have a child of the name form
      each(split('a form meter progress dfn'), function (name) {
        if (schema[name]) {
          delete schema[name].children[name];
        }
      });

      // Delete header, footer, sectioning and heading content descendants
      /*each('dt th address', function(name) {
       delete schema[name].children[name];
       });*/

      // Caption can't have tables
      delete schema.caption.children.table;

      // Delete scripts by default due to possible XSS
      delete schema.script;

      // TODO: LI:s can only have value if parent is OL

      // TODO: Handle transparent elements
      // a ins del canvas map

      mapCache[type] = schema;

      return schema;
    }

    function compileElementMap(value, mode) {
      var styles;

      if (value) {
        styles = {};

        if (typeof value == 'string') {
          value = {
            '*': value
          };
        }

        // Convert styles into a rule list
        each(value, function (value, key) {
          styles[key] = styles[key.toUpperCase()] = mode == 'map' ? makeMap(value, /[, ]/) : explode(value, /[, ]/);
        });
      }

      return styles;
    }

    /**
     * Constructs a new Schema instance.
     *
     * @constructor
     * @method Schema
     * @param {Object} settings Name/value settings object.
     */
    return function (settings) {
      var self = this, elements = {}, children = {}, patternElements = [], validStyles, invalidStyles, schemaItems;
      var whiteSpaceElementsMap, selfClosingElementsMap, shortEndedElementsMap, boolAttrMap, validClasses;
      var blockElementsMap, nonEmptyElementsMap, moveCaretBeforeOnEnterElementsMap, textBlockElementsMap, textInlineElementsMap;
      var customElementsMap = {}, specialElements = {};

      // Creates an lookup table map object for the specified option or the default value
      function createLookupTable(option, defaultValue, extendWith) {
        var value = settings[option];

        if (!value) {
          // Get cached default map or make it if needed
          value = mapCache[option];

          if (!value) {
            value = makeMap(defaultValue, ' ', makeMap(defaultValue.toUpperCase(), ' '));
            value = extend(value, extendWith);

            mapCache[option] = value;
          }
        } else {
          // Create custom map
          value = makeMap(value, /[, ]/, makeMap(value.toUpperCase(), /[, ]/));
        }

        return value;
      }

      settings = settings || {};
      schemaItems = compileSchema(settings.schema);

      // Allow all elements and attributes if verify_html is set to false
      if (settings.verify_html === false) {
        settings.valid_elements = '*[*]';
      }

      validStyles = compileElementMap(settings.valid_styles);
      invalidStyles = compileElementMap(settings.invalid_styles, 'map');
      validClasses = compileElementMap(settings.valid_classes, 'map');

      // Setup map objects
      whiteSpaceElementsMap = createLookupTable(
        'whitespace_elements',
        'pre script noscript style textarea video audio iframe object code'
      );
      selfClosingElementsMap = createLookupTable('self_closing_elements', 'colgroup dd dt li option p td tfoot th thead tr');
      shortEndedElementsMap = createLookupTable('short_ended_elements', 'area base basefont br col frame hr img input isindex link ' +
        'meta param embed source wbr track');
      boolAttrMap = createLookupTable('boolean_attributes', 'checked compact declare defer disabled ismap multiple nohref noresize ' +
        'noshade nowrap readonly selected autoplay loop controls');
      nonEmptyElementsMap = createLookupTable('non_empty_elements', 'td th iframe video audio object ' +
        'script pre code', shortEndedElementsMap);
      moveCaretBeforeOnEnterElementsMap = createLookupTable('move_caret_before_on_enter_elements', 'table', nonEmptyElementsMap);
      textBlockElementsMap = createLookupTable('text_block_elements', 'h1 h2 h3 h4 h5 h6 p div address pre form ' +
        'blockquote center dir fieldset header footer article section hgroup aside nav figure');
      blockElementsMap = createLookupTable('block_elements', 'hr table tbody thead tfoot ' +
        'th tr td li ol ul caption dl dt dd noscript menu isindex option ' +
        'datalist select optgroup figcaption', textBlockElementsMap);
      textInlineElementsMap = createLookupTable('text_inline_elements', 'span strong b em i font strike u var cite ' +
        'dfn code mark q sup sub samp');

      each((settings.special || 'script noscript noframes noembed title style textarea xmp').split(' '), function (name) {
        specialElements[name] = new RegExp('<\/' + name + '[^>]*>', 'gi');
      });

      // Converts a wildcard expression string to a regexp for example *a will become /.*a/.
      function patternToRegExp(str) {
        return new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');
      }

      // Parses the specified valid_elements string and adds to the current rules
      // This function is a bit hard to read since it's heavily optimized for speed
      function addValidElements(validElements) {
        var ei, el, ai, al, matches, element, attr, attrData, elementName, attrName, attrType, attributes, attributesOrder,
          prefix, outputName, globalAttributes, globalAttributesOrder, key, value,
          elementRuleRegExp = /^([#+\-])?([^\[!\/]+)(?:\/([^\[!]+))?(?:(!?)\[([^\]]+)\])?$/,
          attrRuleRegExp = /^([!\-])?(\w+::\w+|[^=:<]+)?(?:([=:<])(.*))?$/,
          hasPatternsRegExp = /[*?+]/;

        if (validElements) {
          // Split valid elements into an array with rules
          validElements = split(validElements, ',');

          if (elements['@']) {
            globalAttributes = elements['@'].attributes;
            globalAttributesOrder = elements['@'].attributesOrder;
          }

          // Loop all rules
          for (ei = 0, el = validElements.length; ei < el; ei++) {
            // Parse element rule
            matches = elementRuleRegExp.exec(validElements[ei]);
            if (matches) {
              // Setup local names for matches
              prefix = matches[1];
              elementName = matches[2];
              outputName = matches[3];
              attrData = matches[5];

              // Create new attributes and attributesOrder
              attributes = {};
              attributesOrder = [];

              // Create the new element
              element = {
                attributes: attributes,
                attributesOrder: attributesOrder
              };

              // Padd empty elements prefix
              if (prefix === '#') {
                element.paddEmpty = true;
              }

              // Remove empty elements prefix
              if (prefix === '-') {
                element.removeEmpty = true;
              }

              if (matches[4] === '!') {
                element.removeEmptyAttrs = true;
              }

              // Copy attributes from global rule into current rule
              if (globalAttributes) {
                for (key in globalAttributes) {
                  attributes[key] = globalAttributes[key];
                }

                attributesOrder.push.apply(attributesOrder, globalAttributesOrder);
              }

              // Attributes defined
              if (attrData) {
                attrData = split(attrData, '|');
                for (ai = 0, al = attrData.length; ai < al; ai++) {
                  matches = attrRuleRegExp.exec(attrData[ai]);
                  if (matches) {
                    attr = {};
                    attrType = matches[1];
                    attrName = matches[2].replace(/::/g, ':');
                    prefix = matches[3];
                    value = matches[4];

                    // Required
                    if (attrType === '!') {
                      element.attributesRequired = element.attributesRequired || [];
                      element.attributesRequired.push(attrName);
                      attr.required = true;
                    }

                    // Denied from global
                    if (attrType === '-') {
                      delete attributes[attrName];
                      attributesOrder.splice(inArray(attributesOrder, attrName), 1);
                      continue;
                    }

                    // Default value
                    if (prefix) {
                      // Default value
                      if (prefix === '=') {
                        element.attributesDefault = element.attributesDefault || [];
                        element.attributesDefault.push({ name: attrName, value: value });
                        attr.defaultValue = value;
                      }

                      // Forced value
                      if (prefix === ':') {
                        element.attributesForced = element.attributesForced || [];
                        element.attributesForced.push({ name: attrName, value: value });
                        attr.forcedValue = value;
                      }

                      // Required values
                      if (prefix === '<') {
                        attr.validValues = makeMap(value, '?');
                      }
                    }

                    // Check for attribute patterns
                    if (hasPatternsRegExp.test(attrName)) {
                      element.attributePatterns = element.attributePatterns || [];
                      attr.pattern = patternToRegExp(attrName);
                      element.attributePatterns.push(attr);
                    } else {
                      // Add attribute to order list if it doesn't already exist
                      if (!attributes[attrName]) {
                        attributesOrder.push(attrName);
                      }

                      attributes[attrName] = attr;
                    }
                  }
                }
              }

              // Global rule, store away these for later usage
              if (!globalAttributes && elementName == '@') {
                globalAttributes = attributes;
                globalAttributesOrder = attributesOrder;
              }

              // Handle substitute elements such as b/strong
              if (outputName) {
                element.outputName = elementName;
                elements[outputName] = element;
              }

              // Add pattern or exact element
              if (hasPatternsRegExp.test(elementName)) {
                element.pattern = patternToRegExp(elementName);
                patternElements.push(element);
              } else {
                elements[elementName] = element;
              }
            }
          }
        }
      }

      function setValidElements(validElements) {
        elements = {};
        patternElements = [];

        addValidElements(validElements);

        each(schemaItems, function (element, name) {
          children[name] = element.children;
        });
      }

      // Adds custom non HTML elements to the schema
      function addCustomElements(customElements) {
        var customElementRegExp = /^(~)?(.+)$/;

        if (customElements) {
          // Flush cached items since we are altering the default maps
          mapCache.text_block_elements = mapCache.block_elements = null;

          each(split(customElements, ','), function (rule) {
            var matches = customElementRegExp.exec(rule),
              inline = matches[1] === '~',
              cloneName = inline ? 'span' : 'div',
              name = matches[2];

            children[name] = children[cloneName];
            customElementsMap[name] = cloneName;

            // If it's not marked as inline then add it to valid block elements
            if (!inline) {
              blockElementsMap[name.toUpperCase()] = {};
              blockElementsMap[name] = {};
            }

            // Add elements clone if needed
            if (!elements[name]) {
              var customRule = elements[cloneName];

              customRule = extend({}, customRule);
              delete customRule.removeEmptyAttrs;
              delete customRule.removeEmpty;

              elements[name] = customRule;
            }

            // Add custom elements at span/div positions
            each(children, function (element, elmName) {
              if (element[cloneName]) {
                children[elmName] = element = extend({}, children[elmName]);
                element[name] = element[cloneName];
              }
            });
          });
        }
      }

      // Adds valid children to the schema object
      function addValidChildren(validChildren) {
        var childRuleRegExp = /^([+\-]?)(\w+)\[([^\]]+)\]$/;

        // Invalidate the schema cache if the schema is mutated
        mapCache[settings.schema] = null;

        if (validChildren) {
          each(split(validChildren, ','), function (rule) {
            var matches = childRuleRegExp.exec(rule), parent, prefix;

            if (matches) {
              prefix = matches[1];

              // Add/remove items from default
              if (prefix) {
                parent = children[matches[2]];
              } else {
                parent = children[matches[2]] = { '#comment': {} };
              }

              parent = children[matches[2]];

              each(split(matches[3], '|'), function (child) {
                if (prefix === '-') {
                  delete parent[child];
                } else {
                  parent[child] = {};
                }
              });
            }
          });
        }
      }

      function getElementRule(name) {
        var element = elements[name], i;

        // Exact match found
        if (element) {
          return element;
        }

        // No exact match then try the patterns
        i = patternElements.length;
        while (i--) {
          element = patternElements[i];

          if (element.pattern.test(name)) {
            return element;
          }
        }
      }

      if (!settings.valid_elements) {
        // No valid elements defined then clone the elements from the schema spec
        each(schemaItems, function (element, name) {
          elements[name] = {
            attributes: element.attributes,
            attributesOrder: element.attributesOrder
          };

          children[name] = element.children;
        });

        // Switch these on HTML4
        if (settings.schema != "html5") {
          each(split('strong/b em/i'), function (item) {
            item = split(item, '/');
            elements[item[1]].outputName = item[0];
          });
        }

        // Add default alt attribute for images, removed since alt="" is treated as presentational.
        // elements.img.attributesDefault = [{name: 'alt', value: ''}];

        // Remove these if they are empty by default
        each(split('ol ul sub sup blockquote span font a table tbody tr strong em b i'), function (name) {
          if (elements[name]) {
            elements[name].removeEmpty = true;
          }
        });

        // Padd these by default
        each(split('p h1 h2 h3 h4 h5 h6 th td pre div address caption'), function (name) {
          elements[name].paddEmpty = true;
        });

        // Remove these if they have no attributes
        each(split('span'), function (name) {
          elements[name].removeEmptyAttrs = true;
        });

        // Remove these by default
        // TODO: Reenable in 4.1
        /*each(split('script style'), function(name) {
         delete elements[name];
         });*/
      } else {
        setValidElements(settings.valid_elements);
      }

      addCustomElements(settings.custom_elements);
      addValidChildren(settings.valid_children);
      addValidElements(settings.extended_valid_elements);

      // Todo: Remove this when we fix list handling to be valid
      addValidChildren('+ol[ul|ol],+ul[ul|ol]');


      // Some elements are not valid by themselves - require parents
      each({
        dd: 'dl',
        dt: 'dl',
        li: 'ul ol',
        td: 'tr',
        th: 'tr',
        tr: 'tbody thead tfoot',
        tbody: 'table',
        thead: 'table',
        tfoot: 'table',
        legend: 'fieldset',
        area: 'map',
        param: 'video audio object'
      }, function (parents, item) {
        if (elements[item]) {
          elements[item].parentsRequired = split(parents);
        }
      });


      // Delete invalid elements
      if (settings.invalid_elements) {
        each(explode(settings.invalid_elements), function (item) {
          if (elements[item]) {
            delete elements[item];
          }
        });
      }

      // If the user didn't allow span only allow internal spans
      if (!getElementRule('span')) {
        addValidElements('span[!data-mce-type|*]');
      }

      /**
       * Name/value map object with valid parents and children to those parents.
       *
       * @example
       * children = {
       *    div:{p:{}, h1:{}}
       * };
       * @field children
       * @type Object
       */
      self.children = children;

      /**
       * Name/value map object with valid styles for each element.
       *
       * @method getValidStyles
       * @type Object
       */
      self.getValidStyles = function () {
        return validStyles;
      };

      /**
       * Name/value map object with valid styles for each element.
       *
       * @method getInvalidStyles
       * @type Object
       */
      self.getInvalidStyles = function () {
        return invalidStyles;
      };

      /**
       * Name/value map object with valid classes for each element.
       *
       * @method getValidClasses
       * @type Object
       */
      self.getValidClasses = function () {
        return validClasses;
      };

      /**
       * Returns a map with boolean attributes.
       *
       * @method getBoolAttrs
       * @return {Object} Name/value lookup map for boolean attributes.
       */
      self.getBoolAttrs = function () {
        return boolAttrMap;
      };

      /**
       * Returns a map��\7�Zܿi�?�:E[���V>����ܗ�]�*���W-����S�]��7~�w���9����V�;��~6��/�)�gk֟Nv����k��x*����t�]��ܹ\��waU�;W�~�_���~����k��T�D��
H?��4���(�� 'B��a�@L؎(�
j($ �b�]^A�P��� ІQ<�|eP���@�U�!�Ŭ�#	�JP�$Z%
@��:W���V�uQw�����|�- ��GG��/�~�K�C�5����¨��b�\��=�Wɳ�ohW���[?}jND]�sG=���ɬ��Ӟ�]v�V��������{�F�ǡ�fv��l�S��_�s�q=z�������p�   A���
�
� 8�WF���z���!�5E	i%n���TkL���� ��	�m�b �j��9���HM`#�Af�p��2b@ �*s �J$� #�2؂��A$�X1�깽<���1��9��"���
%�k����O|��;���ܚS_���}\�
B 1�C2�- 3�A  
 �@�@�� �@y� zLe�@�! o8!��@V0 B6�`:T2*A���XEN@3�	�IH�@@�  �l�C��`� ��	����\����ܫ�k�O[z���,���?7�y�{��O���f˷�o�9~��3�yk�uW_��O�Op�K��$C�ֽ6���~�` ��_^V^_ٱ�������i-U��6N�,v���ifk��n����BiZ�������J`!`f1��dud!�!�h��!��D��h$�$�� A:xD ��P����C||���!G���L�i��9C�Y��
$�FA�B �F !��J�F I�!�b@& PȈ)H��@� Q%�ta� �
+��GO:.� 60f� �2�ZD���8� ���CH�B	 s2� ��)�`
�RH"(�b	Mk ���R�� Cpz�5@�D�];���_��;)l<_�'o���Zb6R��f[��E�x���~������`˦����^���t~��/�W����}��aB��

�Q`@�� T  -BIt����B�t"hK���[��3靯��OPP�����2�:�)ԡ���������άw��j�,X�m7�r��
��Ɵ���K��f4������me7�J8�:���]dZ�5�}������}/��=����/_8N�?�����qo�Qm;��S�D=�Ѭ��zm�>�oS�Ngԑ����M��m��Sϼ|t����u�W�ǟ�xi�c'��8���W~�ܷ�����%s6׻��oϒ6=?�L������+�sΔ�_�t�|�fu�Ͻ�.�]	�$I��K�
��T�Q&��((���t٢�@�!��&�CHI� TP!,��0��bJ&Q1�d�����m��<�OY��H �� MP氀�����HQ�&+�+���  C��M^::��wi�o���.u�sn��Zq~���tgt������&g��ŵr�&=��A����̲�5���������{�}�{NԼ_ۯ��+6����j��Z�����u�Gq���]U_��%=gGvg��s?��~��<~Y�,aH(����/I`!B�!hB�0 �%"��ЎJ %��G�� 9��45 @8 2b,F@�
��1H0p(@�<���	`<@Tv��
Ơ`��JEM
 Ht �`kXD@*��� �JY�3��EHf�D:`
Mpߧ]�����6��K�5ܿ�N>˯}�9�\�v�X�Oҹ|7��-��-��"<����X�����v�W=�;����w��gbu��49ߵ��w�Q /�*��*���p�4\X@1�B��E��Z�F�% 7�A�ʘ��I,`%tȅ(p`��pd:�
q�Dj�H  0�&P �A�a�5�52�B��⁲ �I���A�Dx=�������׋{;7��W��_����J�#�P�ӟ7���ZFPE?�6�
RT!U�a���#B1��`� ����D!�<Ca�t b��
IH���(�k=0B"ET ��"$��`B@� �	�B��&A2���:�f>n�|��_�T�{��u���b�Z���/�K�����~��O��dv�I\�m��\
�n�����m�M�v˼
�4��" ��L$K7!�
� ��N H���� J � �`� �Y!T# �1#$4*�	" *I�!� �)�
��`6���pk�����?�˗�m�����E�^��cq?�;�w�����m���U�s�_�8�;��s����ɗ��^�E�����j�~Xo���o���ؿ��k��	M��3�����tw�]�%��}����F�Q�٪�{��!���.v�|�����������Xs'w,v�yka7Ω����o�_F����g���c*v��������K��ߟ�x���󺵡���n��o�����8�۝�MP�]k3�qW��=�2A  #�p��S�F���PW@$�	� D�]2Bb� \���0�
� ��R,*��QO�%D0J�(
�b�>e�H	HF`V8 �h` "
j���[�Hb`�" &�@c"�OB�$JJ �@ �8�(�LH�"$H 
���Wj�x�(nE8\
!�ˆ?5�Ϭ��{��L�5�����^������G��������t%{5���������R���yl=�::7��s{���>�\����W��{o�i�o0�J�~o�;�y��jm��-��k�o)��q�^�y�o�z�ws�^���]�|����η#�M�d����.^�S,�y��W����w�ؗ��\U�t��2�#�>Q�� �
 ��8�XPa *Fb�� 8�l��C)��܊�BBb�؄��B<��8�H�_�?ֶ�m�ޞ�w^u�+�?ż[��b��$�-ݞ|�׾y�t�t_u����oq����k�rq�����4��u���{-�Fb������ν0u��d���+k�#�>���)���~SP���v_��n�O7�������I�kf0 9!M ��B%D'�< ���-��[ɁU  ��;��R>A��%C�0dH&C� �H�@!����HZĉ���	@s@�T���
��1*d�Tn� q�ABP�BB�F������B�jNAAPΠ#B@8 �

 � �V�
(����:� �dh�/�8QP#�8��
 "B�`h�Ɓ` � ts�c]������"X�x�R;�#�_Y��[U�L7��ujz��}�+=c��d�������t��#�������k�5~��5�=�㓟9��OW���7���צ�O�??,z��'/��5����}��w^ܘ��g���lu���~�.g��\5�����V����^r׉o
�5+.��η�����o{{{��w��|�ƴsԷ�
%R�f �M�A
@� T� 8-H�
4	�.U�j0��[!�jH\ `Ec�1M �H � � ��F(�@PP �9P��
��	TV�!PT@� B�+  �H!dU쐁�9�IbD��T(�@! 0� ��	%H ((�c��(��
@V"�) &�0��"�9: �`��JFA(D�( l�*Iٴ ���LC��A� ���4� t�H�[Hq�������/y=�Y��:o��n��}����o��w��~ۋ�﷼�����k{����(7[�{S��S;�/��p��K��&o߲w�gnt�W���r����_�o�j�?���v�5;��������A��܌�y����>��ɱGe�\��̻��u��1�5�Q�_����*�lߺ�������7�Z���.\����z�V���w.��~ǫ��uc_^z�nV�;�up�l��b��6��ҳ�����<=��u�gU���7�) ! �("
�3R`pI%���RRC�kBr�� P �	�BLA�$�0`�D��,b�$���V�08�r.
�h��LO�m	  DΉ%x��Q B"x%�BB+���X<��a#��v�����e���a��Q}�2�_��j��s��{c�`[uGX�y5�ؓ�NpѨ<��C��.+z�R�nj}&�����{g��O�}�6��z:��������궸4���+ͦ�U���i�q�]��W��v�Y����68BeF����  "D "#*�l�1I�R+>��<���~
9
 s }����#P2�(G  H
C�$<F@�	C��`��Y{����=������K�w��������E��f�����k;g�T�)����?�_�?���e\e�Ϻ�=nm�_}%{-�Mu�qk����u���p����~l��v�.f?���R�R�w���v_��O�z�S��6
+ ," JN8 VQ��  * @�P�m` �)�6�3d���pE� ���K���l
1�y(B`�d�C�`� �o�_ۼ�uz�I��j�{S��eo��<�}����������{��7V^��\�V����ޜ�T���~�gp���T���V����D�O��Gt-���s?wQ�Z�Nm� \�Z�}b'�U���:s�kS��q���Cb��  �F��"�*b	��(�@�� P�Ȅܻ(�h$� �C�!4� �6'�
  �q
 C�X� ā��'��ϡp���>����l����{]���뿭�v�t�J���gc~'\g���;&X�L�v��R��mn��{��O&�����S�sj�s�M�ΝJ�&x�ݚ{�0�r�yM��*���mp�{M��O�|U���+��&�HO\7\��,M�T �!> ���#$�����J�%G�9�	 �p�0� }!Qq@@���t2��hA%@�`��'�ZOm �AW8@e�� �ƕ=;�P4 � ��� �� �"H�a�� ��z�SL2Q*�' I��!{PI�H`�b�� �c�
Rr��2<\�ex���B\�@��s� �� �LIDN�L������a~�1�D�y�$2��
f

�2 @
�a(LG(i`�A(*8rR  ��@ѐ5& Ltx�̠�AB4U��@��V@È!�jb����dAx�[C"� ,K�� "��Pib��di	�@�T1��1!����%�!���G	���( 	b�#��@́JG�$]���>	>	&J4R		�$J A�)P�HA� � �G�  DR<@@	$�DH�n I�
�P	�vB4�a�"�x�`L��a�t��� ��  
�+n`OY�H������ ��<������Q� �"8��Lp7'�'aI�Q$Ȋ�P29�S0��a� ��B�J�RE�~fi�I�f�� F ��÷"�@4,J�@ �q� ( �1
a ���5��CI"�+XPG�&� �  �k�,1��2�`%�6 �Z � rM 4#��s��ȍ�	R�	86`�. 2|Y+��F�7�E,�	$M�p�DD ��&�pC���&' �A�:�� D̉�cB\Lh�  @8l��" RRH�d�D�#�E�R��F1�+�(��2R�!��08� E��
�#49q ȴ��( �0h Y���"V�h�Ik�d�:��1@E��6�(����l  SD��	E V����yT�&-1��i*�$EV8V/h�X�.Q�\$�D�CX��i��r�QJ�����O��F�N�-x�`E1	{�F��l��������I��Æ0��bCRba8��
�0FTQ�� �A@T$�`ЄCD@J`KEP KC@�l�Q�� � @`@��d �r �P  �O�X$"`` HC��%$��@�A
��@9M2	�D�16 B�H`�T@� � 6��4,;B¢&�/�p2�a �� (&�� ��;��D�:O��V�D@V1:@A�& ��bhIp���	�&SD �l0? �	`R,x�A((�9	8�qBɈ�51���@`Q����e	σ@�h�<@�"&!Cك:���[2JJ"@����aQ��$�����<C�j ���dY�� B��F 4� b��H��(�4<Pp(��-h *��T���� �:��,���>�PѼ�@ �� n�b'-J�PD� �0���%RX�@4 C,� �@/�#A�19C�#�P-�����ee�t�¢�08�X� @r
  `�&bS#fE$�$�U�����
@�"/%	xR�WB؅�`�7p�#�&^�@� A4&Ѐ @��0��d�r �8ƈ�2+H0  7�(ؐ$gH(l�����F�Lo)P��$�B�ġ�(��"HT@1/
��%uE/� Q%���S�w�IP�p��H�k(pU8�I%�)D��R��H P� � �U��8E�L�@D�&a�0��aC$�C@dYXH6�\�#(p�� �O"		LB� �!>�0Q��, �0b��ƶj
 ����M	�cТ�z��((�q K� �-�J$a�JEDb���	t�
�r6���B0 A�8c��EN���>ED!a"j��0�MhG#A"W @"@g��:"�"���H�F���C�A ''
C �B�L"����/4&���F�(DT��t"P:�6�f�@�	�#���2NFrZ��5C�d�� ��$�1bƠW����!�,���Q��/|!��@H�d�M%b�; Q�T��,
�H�@8�3�� P 1�E$)-P(	*Tp�:�
iU
@0 ��B �W	���X�B�<"�&
A��[��/s�BiY��B�^I��(d� �=Nf�6y�DXS�`A��XYDl���T���P}��
<q.?��,4H-��k9`bb@��%$!"tq���^���ga�%L��Ae
I��@u�
�.�a��:��IN�$����ЄЙ��-
���E�0C��� �'���h�3lA0$E�
a8!@�b^�$���t�v�@1�K\'8�"�EURP����D�
5��� X�8@#�EXt�VA�;D��h�($�`H�V��!
LxSD&�3	D�t��ቀ���X�`@��J�����KB�
���gR ll�@6@q`j��	�L� ��8,����B�b@2kH`�$@�B�"z� �Q���hA�F���R�1�u$
�@�� *�	2�� 	(o��n��HAF`2QA�@�!
 _��@A�`�� �. e����H  �(3�	�
�2`�[�������K?�Q,W@�@!q� :�,i7	��%11��%�l���r�  �8��-8�!����`�
Q�*�\H "Or2( ��iЃ(P�c��$�%�D"��=\HC����J$PI��X�\� �&��0~
	�n(i{  D�0�Ex�(�
�C��  �+l  �y����A� H����@�b�`�PR10`_�*��HQ+ !6"F���$ �%�a" UPQ6)� U �DX�sGE�A�T'4�a' 8�p�#<� ��DM�
���������!�����B-v
T	*8*K�P �.�uc�	F(󤸁�
���`HX#�� 5D#%0�(p!���J��L,(!B=AP� �K���C��htL!�!��8@.�D ��+dGa$b�0�8�=!ES�8�S0@df	 ep������,�ĸC�00�QF�p��p�AM�p�S��E��f $rI�&�P�5�@��H2Ā Ww0Gʙ��C�1���ĀG�eEG
AbJZHb��X� A� ,�@$�&-��	�8 �fE�&�&�b a)g8� 5P�ॲ��AH7d �k����L���%jY�óV�Np
HD\�@J2<0 ]� ���	Y� B�xJ�EVR
�i<���Q�� $�U�[`Dk ���ԍ T�*T ��`��8(
E&̗�� 9�L ���H�`�@ J�j/@\� �V�a a@�
"�4��E����� @[ ���-�Y��
���� �sHfӌ%`BAbP@ 'A*( %! N�e� " "]'l��rE�OB�@� &�
DF >�%z|��)�Q�( ���F����&P�GT R�C�`�"ؠ�@t�j0��H��h@G-URF�sid@u�`�����u��M@�����-I!V���Ls���� 0�3K��8�� �" �F�b"��T�À,��TB$� �(�� 0� r� 1	$ S�-`b�¨���f BRD�
�',S #B�ܗV�S	��R�� �D`
7�d   ����b ���^qK�
@a1�
�� %0`U�a�ӐF@VT"�@ʂ���h�Ш)t`��(%�e d��C � �	@����ЅB0�L��y"�E�脈e�:Kj�)��d�#���S��$��K��"˲����Bs:��N
��C@ �d�9@� � ,]i�Fh@! C��-(�@4
�#�l�������Ak ����G��I�,b��1�)��
"�| �c
�D�H"�Rp�"`�`�.,@1@g �H�P�D����z1�D�@���4,kd��(k
 � 	9�� �H�.s�K"5D���j7���'L
A�2�'}_�R�6�U�@(ў�ɔ D$
����� ,@�a%�'h(�h@T,�!X� uP��@�@Pр�  d�$ ]%?)P6,
���Q�!��E"�/%#pO�11,��!�� �/3�:$�FC

� ���(#�Ѝ H,�5Y����	F�-[O5���K $4�3���  e�s")!�	@`@%"(�Z ��}��T� ��PJ"LS�YԪ�E4+B���2�: �(!��p��@���!T $�A�<���Pw�/&�
N�!��B�F)T5H�%� �R�4�^k@�5���qT"d0
`�9P@ @� �NE ZD�Q29���#�/� JD4>@�è\�b�+ Cr�p�I�� �4�Hp�I"� C�D (U�xp *p5 F<'�ĠIAN���M�  d� K(j���B)�������*i0�ez.�
ᖃ~�����Q�,�.#�T(Q%`��X(�����
�h�_�!��KI9H�<A<]�%`q`��P��%6b@� �£�J�'@!�O����a��(�
�5C�("�@�1��v>�T[ �)����]��� Eb� �����1@8�����P���."k`T�13LW�rH	���x< @������DF�A@! 2�� r�M�@�������2��P���Q>7�K (	L�3��E����[�4��I�,�,G���Ȭ@�X���1G�Q
 	H H)���m�	�!H�:W,\b�� bJ�!
�tɽ�#g*K�h#����l���q�T¬@���A@ `B�
!эpP�*9�� ���N�PЁp`�A>��	��Z���&P�a��F�F��h E2@�c��0��$0O0�h��{�TΠ �![�.��$�E@�����
E@C� 0*0	,��0��(8(�
Z"� ���" �%QDL/F�"hE��k�  � �U@���#��%(E;�$Xɀ@8��@�I#
 O����p�A�b�*@@�[�A�E `

 8�GPC��,�_�� *�p(��� �(D��jbs 0�p 0EB#Q�
#h@��`t�ʀ���I�`Q$�DD�	�%�����d ��/
$�NeL$7����PB� $�7D%x�PR�p�l��uIx$|%b?!"��MARP���P��>�B Cf�T�M�B
��X!#�ˁaw%��jM P:S (rLb �8��0M<c0=�yH���Т���@ �@d"�	@li𸃂ʐ�G `�c��$���HL��Dg�� '� ��B�G
��~R(	Es��)��a�/��!CN�InP   @\�N�  WE�3< JaX��ĘD������) ,���) � .H��R��>
P��`�FPFi"�(@&�n��F!"@8�K��U
)� 	PR�`�@� HN`ǭ� j#0W�H,�*�%A�0*.dO@��=�FZC�)	"� N�Y@7�u� �@ܥHR�Ż� T(&���JRe ��=���D�(�J�T�5���PR#��%���0�8/ $�ȃ����I ƚ
@�S1�D 	�*�V :I(�+dhR��p���1�R $Ȑ��(@H�"8
~��;�����}�ں�5=��ݥ��?��7{=?'{�F��]�{�+�[��\�����>/��ޛ�_%V\����K'_��'�4��^Q�%{�'��K/Mc���
(BÊ��)�T�p�g۶�% A��Ԅ �O!� B �C�8i
��0�d�h8<4� fk� �� h��!�D@FQb �j#�9�@"9Q (�D�;	
�u�J�>
��ʺi��'�  �H�@� z�O�B
R ��� �\i,D�H$$0B���B��I°m*8
c!$biD��� �$=($"�$VA�U�"��*iQ�"�M�W���"
�;Ǔ
�	E����h�QR 1H��q�4�ZC � ����b@!Ra�e@ �.m��bJA�"� q����X����_$�k*bD�h
Q���-ʠ"w�@��,r8GƸ��������������?���������匿ß�GV�I~�O������o�}�߽��C�����Ji���Q~��g��.�:�{g�������j}������_��x
S��B{W���Ź�bX|T��	�@� �jgi@
+lB�R�`k�V���p|��H��'J6`=�evD� E7 B
�y(�?�t�S��\�¡�=)�K�[��:����k����_�/��������[ߓ�k�3����΢�i��I��ݮg[��z��7���J��������޾��w�y�/Ɉ�~x�o��s�m���~����?�6����������_�Mo���Wҹ�>��s����V�;���O��V���[��^􋖺����o�{��|9����<�幋͘_�}��z��]ٻ���|]?7~��e�;�}y��pU��W��'�����o�y��R^N�/��= �$C@�aUL^�%�D6�u؎V�`�-�	Db����D�a
%dQT��� �h���Y���O���ӽ�'�m��Lw���?�������w�w�����_��__�+^�_��lls�{���5[�W_����bٲ�_6E��_��;�c*�z���v,���?����v^���ow���N��.�T�ڻ��H�GTH��x"�#
Ȃi)!h�_ �D/Qh�$`k�b���&�$�׵�:V< $0
� �ƀKA  DI�0BN8��Ja�LJ�G�|�"�N��pI�A�6�I
@�
Y�B�p.o��aę���!``���
NU�ͮ���1;�.��H"()HG�� 4
�t6T�b�J�{���3��˿���۽I'��7o{�����������������<��o���ټ�p��{�����������5��@����~��9�}��ٻ}�7�����������i�?���k<���_w}Nd>��y���3,��rћB��U1
P��K�dHDS@�+E��`�!�aX/�9"AK����vkj��^d4�P  ���*@$	T�h�dh7U��H*��1P�֠�#t�KJ,�*$@��������o7���m��'���{;��l�.�gz�*x�]��o�WS�����?�}?��v~�ec霞v�O{!����W������W���+���g���L~���5����mL��?�]����鿻���}��Os���?p��/�����>K�v��s��uk���ۭ��j�z.���7��|;�����o����e֗����]x����_E�o���I����iǭ?���[��eu��y�{�:���k�z�._�������}�����R}�&GC��bt TL4�`"�]
��^9	L$�:��C#�)�6����#3,���8"Tz"$��fA @�1"��+P`�U����U=�R+ H�]0��$(%$�
��5 �
o�f�����f�nŴM�篮�.��̭'�8��r��:��u9���o���W�{����������������u��i���q�c�>r���7�ئ�_�������齻�{����^_�{_����f���o�od getPrev
       * @param {Node} node Node to find siblings from.
       * @param {String/function} selector Selector CSS expression or function.
       * @return {Node} Previous node item matching the selector or null if it wasn't found.
       */
      getPrev: function (node, selector) {
        return this._findSib(node, selector, 'previousSibling');
      },

      // #ifndef jquery

      /**
       * Selects specific elements by a CSS level 3 pattern. For example "div#a1 p.test".
       * This function is optimized for the most common patterns needed in TinyMCE but it also performs well enough
       * on more complex patterns.
       *
       * @method select
       * @param {String} selector CSS level 3 pattern to select/find elements by.
       * @param {Object} scope Optional root element/scope element to search in.
       * @return {Array} Array with all matched elements.
       * @example
       * // Adds a class to all paragraphs in the currently active editor
       * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
       *
       * // Adds a class to all spans that have the test class in the currently active editor
       * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('span.test'), 'someclass')
       */
      select: function (selector, scope) {
        var self = this;

        /*eslint new-cap:0 */
        return Sizzle(selector, self.get(scope) || self.settings.root_element || self.doc, []);
      },

      /**
       * Returns true/false if the specified element matches the specified css pattern.
       *
       * @method is
       * @param {Node/NodeList} elm DOM node to match or an array of nodes to match.
       * @param {String} selector CSS pattern to match the element against.
       */
      is: function (elm, selector) {
        var i;

        if (!elm) {
          return false;
        }

        // If it isn't an array then try to do some simple selectors instead of Sizzle for to boost performance
        if (elm.length === undefined) {
          // Simple all selector
          if (selector === '*') {
            return elm.nodeType == 1;
          }

          // Simple selector just elements
          if (simpleSelectorRe.test(selector)) {
            selector = selector.toLowerCase().split(/,/);
            elm = elm.nodeName.toLowerCase();

            for (i = selector.length - 1; i >= 0; i--) {
              if (selector[i] == elm) {
                return true;
              }
            }

            return false;
          }
        }

        // Is non element
        if (elm.nodeType && elm.nodeType != 1) {
          return false;
        }

        var elms = elm.nodeType ? [elm] : elm;

        /*eslint new-cap:0 */
        return Sizzle(selector, elms[0].ownerDocument || elms[0], null, elms).length > 0;
      },

      // #endif

      /**
       * Adds the specified element to another element or elements.
       *
       * @method add
       * @param {String/Element/Array} parentElm Element id string, DOM node element or array of ids or elements to add to.
       * @param {String/Element} name Name of new element to add or existing element to add.
       * @param {Object} attrs Optional object collection with arguments to add to the new element(s).
       * @param {String} html Optional inner HTML contents to add for each element.
       * @param {Boolean} create Optional flag if the element should be created or added.
       * @return {Element/Array} Element that got created, or an array of created elements if multiple input elements
       * were passed in.
       * @example
       * // Adds a new paragraph to the end of the active editor
       * tinymce.activeEditor.dom.add(tinymce.activeEditor.getBody(), 'p', {title: 'my title'}, 'Some content');
       */
      add: function (parentElm, name, attrs, html, create) {
        var self = this;

        return this.run(parentElm, function (parentElm) {
          var newElm;

          newElm = is(name, 'string') ? self.doc.createElement(name) : name;
          s1��^��	 . �0�wF1 [0x5934bde217c5e4a3][1][0] 	isLinkDown: FALSE
  W     5�1��^r: 0P9�wF1 [0x5934b7c5e4a3]0] 	rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  6�1��^1 VENT��}F1 [0x5934bde209480b53][1][1] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_event_data:  7�1��^E
  . y�}F1 [0x5934bde209480b53][1][1] 	isLinkDown: FALSE
    8�1��^r: 0I u%�}F1 [0x5934b9480b53][1][rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%
     9��L VENT] ��?�F1 [0x5934bde217c5e4a3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:  :�1��^�L . ��?�F1 [0x5934bde217c5e4a3][1][0] 	isLinkDown: FALSE
    ;�1��^�L r: 0I �@�F1 [0x5934b7c5e4a3]rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  <�I VENT��ӒF1 [0x5934bde217c5f8e3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:
     =�2��^. ��ӒF1 [0x5934bde218e3][1][0] 	isLinkDown: FALSE
    >�2��^r: 0I ��ӒF1 [0x5934b7c5frssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  ?�_ VENT] �)�F1 [0x5934bde217c5e4a3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_event_data:  @�2��^#_ . ��)�F1 [0x5934bde217c5e4a3][1][0] 	isLinkDown: FALSE
  W     A�2��^r: 0'�)�F1 [0x5934b7c5e4a3]0] 	rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  B�2��^� VENT�ÙF1 [0x5934bde217c5e4a3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:  C�2��^� . O�ÙF1 [0x5934bde217c5e4a3][1][0] 	isLinkDown: FALSE
    D�2��^� r: 0I X�ÙF1 [0x5934b7c5e4a3]rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%
     E�2��^�% VENT�F1 [0x5934bde217c5f8e3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:  F�2��^�% . )�F1 [0x5934bde218e3][1][0] 	isLinkDown: FALSE
    G�2��^�% r: 0I c2�F1 [0x5934b7c5f[1][rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  H��� VENT���F1 [0x5934bde209480b53][1][1] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:
     I�2��^�� . ���F1 [0x5934bde209480b53][1][1] 	isLinkDown: FALSE
    J�2��^�� r: 0I ���F1 [0x5934bde209480b53][1][rssi: -39dbm, snr: 0db, nf: -84dbm, cca: 31%  K�� VENT] 9I=�F1 [0x5934bde217c5f8e3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:  L�2��^� . �Y=�F1 [0x5934bde218e3][1][0] 	isLinkDown: FALSE
  W     M�2��^� r: 0c=�F1 [0x5934b7c5f0] 	rssi: -39dbm, snr: 0db, nf: -83dbm, cca: 31%  N�2��^�; VENT� ��F1 [0x5934bde217c5e4a3][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_eveata:  O�2��^�; . ���F1 [0x5934bde217c5e4a3][1][0] 	isLinkDown: FALSE
    P�2��^r: 0I ���F1 [0x5934b7c5e4a3]rssi: -39dbm, snr: 0db, nf: -82dbm, cca: 31%
     Q�]Q VENT] �WL�F1 [0x5934b 0�Yp b�� |P0
 �s	 � �%� �	0�%0�	 %� �Y� ��P0bz  %��
W\�
\Q
\�W`� W(p�'� Wt� W\�W(p
\!]\�)p
\Q2I(p](pWt� W(p]\� W(pI(p](p�_ , S�  �  �  ������������������������*z��������������������+z�����j������Z����ꮪ�����������������������������j���������j�������jj�����������kj�����ꪪ骪����������������ꪡ���j���������骪������+z��������������������*z�����������������ꪪ����������������������ata:  �����^�s
 [1][. ���31 [0x5934bde20c3ce643][1][0] 	isLinkDown: FALSE
  W     �����^�s
 X6�^I s��31 [0x5934b643][1][0] 	rssi: -39dbm, snr: 0db, nf: -81dbm, cca: 38%  �����^%1 [0x5�
k�31 [0x5934bde209480b53][1][1] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_event_data:  �����^[1][. �k�31 [0x5934bde209480b53][1][1] 	isLinkDown: FALSE
    �����^X6�^I d&k�31 [0x5934b9480b53][1][rssi: -39dbm, snr: 0db, nf: -81dbm, cca: 38%
     ����^! [0x5Hԭ�31 [0x5934bde20c3ce643][1][0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_event_data:  ����^$ [1][. r㭵31 [0x5934bde20643][1][0] 	isLinkDown: FALSE
    ����^X6�^I �쭵31 [0x5934b643][1][rssi: -39dbm, snr: 0db, nf: -81dbm, cca: 38%  ����^�	 [0x5藣�31 [0x5934bde2145552d3]0] getLINK_CHANGED_EVENT_DATA(): apple80211_link_changed_event_data:
     ����^[1][. ���31 [0x5934bde2145552d3]0] 	isLinkDown: FALSE
    ����^Y6�^D���31 [0x5934b4555[1][rssi: -39dbm, snr: 0db, nf: -81dbm, cca: 38%  ����^� [0x5] 	)��31 [0x5934bde20_~Ɯ���wy������e�T��nE�g2g�u���[�����:�3��Ώ���Q�������ﱿ��/��o�Y�O�Rj|���[�7�w�{��׎}k�6?����?��ߟt�ӿ=������/�U������>J \l��@J�`%�6�� � �f�Б�t�P
�H�@Ð�0����� �1��TQJ ���(��aNPD� MD �	�bd@  �!F4|&�'�:�P`G(@�&	�� (���	]A!�A��%p� Hq bĞpA���
M@ ��� � ��H�
�"��!0@�-Ed���pPLP%@Ga �@ ��(� `D���" �,衰  Ha���m���/��k��r�=������oy��ߗ9������k�oo%E����_M�_3�TҬC���;�%�r�����V�������g����}��rޏ:�?�ik.2���:�g�n�u�A��_~g�y6�fA��'� ��&�F(h�� R �e�I hG��)�@q)F	, /� KS�A
� !M 6$�!�!0�J�@.�x ��A���[�g�k�~��/l�Z�b�������5��嫹��~5������Pͻ�|�9�ϱm����˧}���\��N{%�K�j�s_���K�q�V���Qn��7�U�|uOܚ)�����3��?�s�{���=���\<_��n�O��.�Ui����O6U7��W���W?ާ�ż�==���f���o'N�Ǝ������=����g��y����{|�w����]���������ݭ��Ow~yz��~�������/�߷�����*"`@��&+dE�>1P!@  � @�c Ў)I � \� �H Pf� Y�p�`�Li����F ��@ @9�+�
��#=��k�M�ut����z֯�|��k��;�j������?���u<y�������ߦb�ϧ��7������~}QCc	�����+��	���K��}��~-DF���V����/GF������/�?�-?�?�ٟ���B����hH��Dsq�&�"��A����(�@v`�I�	p
NЈ�S4�f��%X�("h	�T�h
D n�$ 
FB�Ȁ� i!�bQ" %`D �h8��!� �BB;, l\	B��dB�B +�E�5# DĈ	����"@�@��!Jja�Kc hgyoo���F���/������������ۿ�?�~��w��Ogo|�� �u��_<��}O�����^�}w�{���΍O>�/�s�������~�w5�7o��}�}���w���k�}�ٯ��_���s��d�g `=

\�
8�)�Q#L`B����R�2��d���M�"�L����Dp��E�@P BX�B��d$ۀ$� "P1	�h��o�Br�6 P�c�Р&0�)@,�3Z�� F4$k�\��������>��g�����ꦫ����B�f�=���v�m���?�o?s��f�;���{�|QZ����?���?��m��|חn�o���/���?����iC~u�wt�_?�>�����.�?�|{�o��׿���Wنſ��{��7뻻�?U������g������~�k�o�~=ŝ�_>ɷ�����m���=���F��j_si��;}�O�7ޗ��{������_3������oͶ�#�n����~���֫��(@��LCX�B�r� "�$+|�BD	$�<��0��D�` 0���1�`�DPR�8*� T�� @z&
��(H��@,� j���\�C ����� !BL��(� `&8BD����]�?��u�O���w��sv���2p���}��o�m�����9i{�]�N�z=߳������>�j뿧G�����a�����o��ygl������5_����w
���@  (�0BD` Xd�i�j xi�U  ��0/ ��� �`!$!��SBD 4��@B�Q<R�F+Xؐ� ��Е:�eD�&�R �3 ��C���	 DS�T4,	"N �\&�� @I��	8�Dʠ5�] �d2�(� 9P�(�0�И�$0R-
���� !�!E�Q ,Ȁ �t_lMq~��>���.�����v����o�������W1�}��/�ϯ��W9�}���P��'��z��<Glr���:=����]�ؿ�������.�U��]ۤ�|�_�_g�>M�In�oK��v�\�ۿ?ݞhf������  ^Ur��?	=xp�#�wG� �@#��$"�l���^ �`�)
��3V����'S�PD�b��
(� � G�1�"LIS0�E @;���"�2P�0�		d*Xp�F=`��!�" �`0����� B
�� D!� \�B��K]�M1�I�lV�?��m%�]����P]'������z펺~��>?�f��~���ݯ���w޾�]��n�K���zWUCK}po߶�C���X�������u�tm\o�Ga�w���Ή�ի[Ƿ�~�����}�� �a֋C� B�d���"1��E TD0b����R��=`(���  9�2m�����-$�H����aEPD- y�@K�h$�
Ra,��!��U�z` p#B@ $��	� �����i	�q�Ҡ� �. ���,
�M1L�E4F�D� HE����%.� �Ѡ2J(G
	=�"Nŧ��DPFLqA � !�F	!�RD� I0c@2�� ��A�\x���
��5�$͎��� ݌�DEQ��O H@@��&N��"�yex�D�
 "�1@�$0�`qV2�D�v FLE�жHbG�9G��� ���B��*J��Y|�I fpK
r@�!+��s�`�c�@ � G�z�A@湢��W)��
��!�-t.IIC9h@���PUY4�  �
<(р>c�`>�n�\4$0
X<�� � !v��@ ` b3@ !D���&aE�R�  #@p� 8�N!*�#@��HA ��F�0�mL��LD�Y5� BD����)�$	C0KF.�"$���U� ����� B��Q��!�� ������"� �ؾ��
O��T�PU蠉��e����ڪ�@ &4���E굁Mgd�b��y� �%�I��T'-  _Z�A�H��`DF�;b[�f9©`" ?�@���&�#(%�S@`�A�IP`�"0PY" !)D�4Јt �
�%A�IA
 RM	�` �!�K] d��,)� � D R"-��,�pAȐ ZLs� ,�j @��O��I@8	�G�@
Ԁ@4�Fȍ�� �S2���PX!	 FJ. %��EJ�P�!  
���C2N΀�51 %�DFD�%�b >B�l� @��9	��� {�!���pQD���+ㅫKQ&râ����Lz�R�S�#���2-G �BMy� b�e�E(+a��Μ�  J�C	R@��C����r�e@d����ʍn@� M*<߁28$�r�{D @i�!hb$�&� ���F�� q��0AJ��`$@E.
0)$�Y�r@B�T�Bf��
�� K@ p�k31 ~!��G(�w�fH0$�,�!�����X�~!�4�W�UF�B�ܶ��40Uȵ��s���%� M� �10��9>ȡ��6��Š% 4q@G� @�΀��1QxD	��m �FX�P�bAE�0D
@h
�HP�D���� � 0:(�@�g�`�@\Ka H'�"hf0$	$�
B�p0�#
��A`Q"���0
 � ��� �%���1a
�w��J:�Fn%�m��l��RRH���;fS*;��F! %�*�E4!�S�!8�`��V("�0�sP�g0����C�@�����%.��HF2 ��P�E7�G^�' l�hJ�5 �P�C@� @$Iȁ��`� �@�JP�8���@ K�QP��Ȇ c��DAc�O8  ��@$@�@$�Q��'Eb��pH�{s�X�&0Q���>�KDmTx�Aq
ġ+����"�"2*M��0s�[J��'�l@�D��%
 @	�`�0�@tDD&�;\`����%���y�c��*a���8J�'� �r+� I����X� ���.
� x����>��Z|���@���'GD)+��Jn,�� I5

<b�"�  @u�d �� @�<�,%�ܑ5�`�1Z3�B�|h��1��8 2B� (�TW �0� �0� ` V	!��Y��؀4L��`B$�[h%$
            // Also remove the body/documentelement clientTop/clientLeft on IE 6, 7 since they offset the position
            x = pos.left + (doc.documentElement.scrollLeft || body.scrollLeft) - rootElm.clientLeft;
            y = pos.top + (doc.documentElement.scrollTop || body.scrollTop) - rootElm.clientTop;

            return { x: x, y: y };
          }

          offsetParent = elm;
          while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
            x += offsetParent.offsetLeft || 0;
            y += offsetParent.offsetTop || 0;
            offsetParent = offsetParent.offsetParent;
          }

          offsetParent = elm.parentNode;
          while (offsetParent && offsetParent != rootElm && offsetParent.nodeType) {
            x -= offsetParent.scrollLeft || 0;
            y -= offsetParent.scrollTop || 0;
            offsetParent = offsetParent.parentNode;
          }
        }

        return { x: x, y: y };
      },

      /**
       * Parses the specified style value into an object collection. This parser will also
       * merge and remove any redundant items that browsers might have added. It will also convert non-hex
       * colors to hex values. Urls inside the styles will also be converted to absolute/relative based on settings.
       *
       * @method parseStyle
       * @param {String} cssText Style value to parse, for example: border:1px solid red;.
       * @return {Object} Object representation of that style, for example: {border: '1px solid red'}
       */
      parseStyle: function (cssText) {
        return this.styles.parse(cssText);
      },

      /**
       * Serializes the specified style object into a string.
       *
       * @method serializeStyle
       * @param {Object} styles Object to serialize as string, for example: {border: '1px solid red'}
       * @param {String} name Optional element name.
       * @return {String} String representation of the style object, for example: border: 1px solid red.
       */
      serializeStyle: function (styles, name) {
        return this.styles.serialize(styles, name);
      },

      /**
       * Adds a style element at the top of the document with the specified cssText content.
       *
       * @method addStyle
       * @param {String} cssText CSS Text style to add to top of head of document.
       */
      addStyle: function (cssText) {
        var self = this, doc = self.doc, head, styleElm;

        // Prevent inline from loading the same styles twice
        if (self !== DOMUtils.DOM && doc === document) {
          var addedStyles = DOMUtils.DOM.addedStyles;

          addedStyles = addedStyles || [];
          if (addedStyles[cssText]) {
            return;
          }

          addedStyles[cssText] = true;
          DOMUtils.DOM.addedStyles = addedStyles;
        }

        // Create style element if needed
        styleElm = doc.getElementById('mceDefaultStyles');
        if (!styleElm) {
          styleElm = doc.createElement('style');
          styleElm.id = 'mceDefaultStyles';
          styleElm.type = 'text/css';

          head = doc.getElementsByTagName('head')[0];
          if (head.firstChild) {
            head.insertBefore(styleElm, head.firstChild);
          } else {
            head.appendChild(styleElm);
          }
        }

        // Append style data to old or new style element
        if (styleElm.styleSheet) {
          styleElm.styleSheet.cssText += cssText;
        } else {
          styleElm.appendChild(doc.createTextNode(cssText));
        }
      },

      /**
       * Imports/loads the specified CSS file into the document bound to the class.
       *
       * @method loadCSS
       * @param {String} url URL to CSS file to load.
       * @example
       * // Loads a CSS file dynamically into the current document
       * tinymce.DOM.loadCSS('somepath/some.css');
       *
       * // Loads a CSS file into the currently active editor instance
       * tinymce.activeEditor.dom.loadCSS('somepath/some.css');
       *
       * // Loads a CSS file into an editor instance by id
       * tinymce.get('someid').dom.loadCSS('somepath/some.css');
       *
       * // Loads multiple CSS files into the current document
       * tinymce.DOM.loadCSS('somepath/some.css,somepath/someother.css');
       */
      loadCSS: function (url) {
        var self = this, doc = self.doc, head;

        // Prevent inline from loading the same CSS file twice
        if (self !== DOMUtils.DOM && doc === document) {
          DOMUtils.DOM.loadCSS(url);
          return;
        }

        if (!url) {
          url = '';
        }

        head = doc.getElementsByTagName('head')[0];

        each(url.split(','), function (url) {
          var link;

          url = Tools._addCacheSuffix(url);

          if (self.files[url]) {
            return;
          }

          self.files[url] = true;
          link = self.create('link', { rel: 'stylesheet', href: url });

          // IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
          // This fix seems to resolve that issue by recalcing the document once a stylesheet finishes loading
          // It's ugly but it seems to work fine.
          if (isIE && doc.documentMode && doc.recalc) {
            link.onload = function () {
              if (doc.recalc) {
                doc.recalc();
              }

              link.onload = null;
            };
          }

          head.appendChild(link);
        });
      },

      /**
       * Adds a class to the specified element or elements.
       *
       * @method addClass
       * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
       * @param {String} cls Class name to add to each element.
       * @return {String/Array} String with new class value or array with new class values for all elements.
       * @example
       * // Adds a class to all paragraphs in the active editor
       * tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'myclass');
       *
       * // Adds a class to a specific element in the current page
       * tinymce.DOM.addClass('mydiv', 'myclass');
       */
      addClass: function (elm, cls) {
        this.$$(elm).addClass(cls);
      },

      /**
       * Removes a class from the specified element or elements.
       *
       * @method removeClass
       * @param {String/Element/Array} elm Element ID string or DOM element or array with elements or IDs.
       * @param {String} cls Class name to remove from each element.
       * @return {String/Array} String of remaining class name(s), or an array of strings if multiple input elements
       * were passed in.
       * @example
       * // Removes a class from all paragraphs in the active editor
       * tinymce.activeEditor.dom.removeClass(tinymce.activeEditor.dom.select('p'), 'myclass');
       *
       * // Removes a class from a specific element in the current page
       * tinymce.DOM.removeClass('mydiv', 'myclass');
       */
      removeClass: function (elm, cls) {
        this.toggleClass(elm, cls, false);
      },

      /**
       * Returns true if the specified element has the specified class.
       *
       * @method hasClass
       * @param {String/Element} elm HTML element or element id string to check CSS class on.
       * @param {String} cls CSS class to check for.
       * @return {Boolean} true/false if the specified element has the specified class.
       */
      hasClass: function (elm, cls) {
        return this.$$(elm).hasClass(cls);
      },

      /**
       * Toggles the specified class on/off.
       *
       * @method toggleClass
       * @param {Element} elm Element to toggle class on.
       * @param {[type]} cls Class to toggle on/off.
       * @param {[type]} state Optional state to set.
       */
      toggleClass: function (elm, cls, state) {
        this.$$(elm).toggleClass(cls, state).each(function () {
          if (this.className === '') {
            DomQuery(this).attr('class', null);
          }
        });
      },

      /**
       * Shows the specified element(���_������r��G�ez�_���L��}�Ϫ��#�~�o�����o��j���}�G��<�߽;v��{T=WkL�,������R򿲼�[������
���� !�E�TL�YEtB�~ �����>��^�����T}�!�����W�ݝ���&���r�M��S�����=�2�[���j�_���{�-:o�??w5�ߙo��>�͋��}�!?��O��Zҫ�S�7�~޿6O���W����������������E��*Ϥd@�BJ�G ���ə ����dQ;���3M�O�x�@�.@<PB�S��(0�	�� J�>�%����>5R'�9+�Cԛ�	 
� e8fV@:<Ō�,H���c��N_�Vw�w���_z���z����_�.��Q�K��؇����y�����w���?�O�WM��7e��o���>��`�����P?�}�;7����קw�_�rݮ2k_�ǿ����п���3�ϟ������ݡ������K]�4��7Ĝ�+�������md���ӏ������W����}�_U�j[?����o����_�]�{�q5]�{��F����R_�����w���:��_�����'�v�����x��m����w~�,�xRC�DB�[-�㢇�]�� J" -RGt1� p1�G~.9��<B2 HJY0[���/��Ұ+� ?�u�8���r[�M@ũbi�!�hH�C�i*a�`c� X����"�ac��ӻ����{�_��v���f����{������hw'�c���{9�������}�f��:Z��������k3��^u�;oL�m���|��O7�I����6ڌ~����קl�~b�F}w��_�����;��������$ʒDR,���e^��1�S98(��A/
0H�@M#�@��'#H�^���Ja�"�`N�(Ɗ��X`��� �I��`�  �0=7T@��� @$�W��Gze!�U0&�D 5N��%k�`���z 	��]��XpU���&� �IH1��S�|���}��Q��y�-���8�j��ۮ��{M[��_��t��}�G4ŗ�|�y�o��{������q�����W�N��
iu���w����k���o��������Ǿ^�5�߭|���v�����?�rܧ��	%�`�XB��lG�"�&�aDp��2�� A�j��:�A�x��D�XF��
;	 �	b,�(�rBd 
b-ڭt�@O���,H�6�B "w�!�>��Mz�����=��~�O���c�Uvz���Ҟ������}�t���'s��������}�U
�����i���_�u�oUg�����?�}_��-������떺i5��<j�������F�����}���hi������n���p|-�?Ϗ��^�~O���믓���~�K ��� DL �S���Ti-@�c����2� J`A���U��&�E�
D�  z$RB0RH�f�b�1lO�@'9�B�6	V�@$�L�e`D.B!A���3�
7L�S�,%k0� rR����5E8p����
��'� ��!B�/S\C��+�d�7�4��C�P  �0�:P���`�Xޠ�@~ 
Ɍ�Fr -0�N	$��l,\�8,�  Uz(��A �p)$�$�+!nW��K!�� �xC`P%2
�D��&=��PAlhPƑ��$A��I�FA
�2�@!�2*�$���\��~|�s�}����/���}ѫ����:�����W7o���3vg5G/�M�'=;���og���;���cO_	��w�[��v���e������#��~���,�Ew�l���9v����{�-hy�m������퀀�w)��C�At� �R`b�`6\D�+@FO@��Aav"�cH�� �8G��Z�\*N���	
�A0v �� Z��u#0 ���������p(D ��.���~w�^?3_E�|?����<������磟�=���[���S4�������q�j��Is����B���W���ޟ����?5�����5�g��U���^������K�o�S����|vo?�����'�t����_��sk���.�ZO�N�����0�ooG�*s����^�����?�|���owo�_ŗ��+�y;�~Q~�o�岥��5�.�u������%������i����.ƺT����>�#|�����m�_nZW�w�ף�-@�`P �b�\2 y� � ����1J�@G|oD�`�J -�ŀ �Ƞ$�\�
��4��o
 ��$Ђc�R��P��3�N��P	N��! `
�� �
2X'�,��`-� �I���v���%�4�D�+�&� ��K�� ��2ѫ��#�!�$�hq���*F	��W�F�/a ��%l2�0F1*OWYAV G@�Q
NF$a��Hx E�RU��:�
����zG�x����W�훭�O�z�g���*��{����_��+���~�m�g��k����۸^�i�����<�)�;'�k-ߺm��m�\���������?��n�>��>�������/u�o�w�����w�֛��Hb�-�-	�4�U����Ac�p b,T���M� ���jC����
2� %��=�r���^IP�΀*5��Pi�!֐���}��?��z�ݟ��~����=��}k�^��������ͧ�xmMvi������m�m��:9�������_6��������Ůկ7�{�9�{���g�d�9�/G}�f�ϵ��_����鼯��������$" c =a��3�\p5��	a[L-+@)R���NKF��$�`��Q,
:蘺T @Af"�����$�%!�)�T�(B�#�jnGR�&pcx���
D9�6�@,&�8����y@Z�( �� 846@���#3�/��0� ̀��T�ކ��]QJ�� ��܁��I�e(A���J�R��B�<�3�
0��
U+��?l��8ߟ�?����M�u�:����ߑ�^���������_��L����c�?�����w=n������'Z=����{�Z����r��-�����_�}�����]ߓ�7����{�����w����� a4
t\�bPR��08B�� m9#0�c��A�(L8,�A� �4X$8Ƽ ��\�# �l�]��HY4���6� ��P3�FЂ-*��afTA��l�'��Ǔ�U@���=�!��k���5����?�;yu��h�>�6��k��~h���o�t����7�7�7�鼆�������_m?ڏv��>��ZD�N����~]���?��������~�{��/�-��z�o��=w����=����t��mw>��]�}�G{>s��j��Z��������r�s*ow�o�?��{\���'q�<�?�X�<���|�k����ɏ~���Z��)���w�}���g����o��N�~�������{o�z[o�ЬUV�����I�D���тKP�zDTF�@�((tTX�wd��U�X@�T����P�%bD�I	6��D&؅�if@ث����c���BF��r�L%�f ���h@e�%"��j��۠9�rpE�
%cfk�����t �A0�HD)[!� $@� �lƱ-����� MTTJ�L3��[���/;�;o�����fm�[��{��wu3{�3�&��W�#:ם��;+��S�)Nz=�M�>_ۢ�]�������u/_�dӫ�����Q��:z+c��S�~�����ɭ/����������ۼ�d}7�}���ߣ��_����}^���k��؟'��y�'������y{�����m���tO����O�ݾ�s��~Z��붾_X^�������/�?{�k��l���{w�M�������n�K_9Ǽ�����c֏��ա���������  ���$��}�2*U�0B��	k"�u`��R	��Z�Y�̈� �r+l�NA*�9 �R�LHi�zĠ
J2.%*.���@JYwAx���LxL�� ���i�4F%Cx@�
�	���E��"R��j���ZI)�R͓Y��p�7�K�/H 	Id�>L�O7`�PXa��<
����C�E.:"(��� BL(�Z �,* �	� e$h�E�6@ ����z�ֻ�?wS�����g�O�G,�Yu3���~~�r����g޷U�G���Ǟ��~+��º>Z~��ך]�����}����������V�Wq�;��������w��/�������M��~������'�����E�Q���@�a� !C��'\�C
X�N� ���.�g,t���� `�,�2���z�ϐI#p�P�H!��xJJ<�|���:E��n��wp�w��J��M������N���=b��e]>]��G�|�z����/�������ߩ%�N��������?������������ۺ���iѣ���pKo���Ͻ���۶�w��n�����R}��k���}���{�G�����ߙ>�]��������}�g����V������?�)��y���ϋ��7��+�]7n_��_��?���������G����}v�ۗ{���[�����[�k����������m߿��C�.L}TD/@` ]`��g��Wb�×�fl �� � �M`N=QB`���P�L!�T�	-*
����	����:Z30x� ��$`� �{2���g
�r
I`�!p0�BZ�(A��\ZH
 }h�tAFB b� 6�#v�!.��`X@�������QYDL'eG�Ce&Ď���XJ�������c|����_��w�}k���}�]�W�ޞ������2Z����G�����������k������<�7^�o���������9�z����ۿ�����r�}v�v����m�&��9��o�����S�����7�y�
�9O�ȤP`�����0xi@N���Ȉ e�|�֠�cP��[mQ<�Y-v�M�A�MrZ=Hp������2	1%s�2�P`<�^^u� �gEO��51H9Xӕs"�g"$P�0�@$u͛�9m����wk���C>����}�w�k������}��[�c��/��߿o����4�����;wc>g�������ῦ��o��s������/��d���~�[��w�?c���s��v�R�4
��zZ>E��!�6G���M��Q��4<C�	�h-9�F�A"&��E3#��C(rFn 50h1Z	���@�"	p�
��D�(�n�" �P��DП� ����� �R�PR�xH����fo�����p��io�o��
W��|��6�s���ϝ�*߇����9�#m�3�w�z�.��6��{����+�ߟ�,o�&�6׻�����O6(Q �"��/@qB�KPL�̀���/�9��9�����|�uz�#N`0�^E'���Ҋal�S0�@� bFh	�=�
Q�b6C*$7 9�@,$Tj9���$�!�h�'�XPr����� AU/Ӏ�	`#b��Yj�$�
G��@���Ћ��2��`�Jj��&�t*p�E]A�
�Ap�*@��q��	0|;6EJ�?
���1a!�:���I+A@A"�U*wG:"�[Q(4P�hyU��b����&���ljs^��f�&�H(����sJG�qlKk�O7��m�����o�Y��ٝ�s��|��t�;��u?��[믜��_������>_����Wh?-������}�6e�s�3��~֡{۞�wY}��|��l������k���܋����������Y�o�Z����kf����Wnm�W�i�ߵ�{����o����?������E���ߪ}y{��p���ݯ���#?��~g�����L���W�;9���_������ޫ￯�O�an����������������,"1��U�(-D�B�A��02��1��F̊2�+c��fL���a6	� Nt�#C���^�^� ��vT���D�Q�P"���gG�ŅRI��H]�`-K0H�Tb i@ (_��zO��{տ��m�g���|����/Y�_7\�z���u�+���m�����j|������������o�7�6�ݼV:[������������h_����������ϓ����/�����_5����{��]�$TND�2J�j
a4-�8M�� ��E� �HF��K�̝�;;G�D���H�\�� 1����#Ef��Z?�
�..�r���	��q�%+3.�bP%HWm�ՌpA�zajz
"�?"��*�$I�i�����{?�'��87���x_����~m�ߕ��������g��/��&U��������V��y>��������M@�m���G������&���o�s���߻��_-OØ;�}�{2_��C��]��������Pr�"�)�U
-IP��"[ I0iB&k vp�P��@c&G��!9#�Y
��;�#p!2�2�W@ �X	*T��2	�}���� )�P~����@k��C�0\E�@ �������{�ݔ��������|�������������υ߷�ӌ����;��o,��'���>5ڷ_����?�_���ϫ���;�?�;���:?��Q�Ͽ�~�mO�g�����B���w����칪��㻿ij������u՜���=�b߬������}/��eW{����S� �����ߟ�G�i��}����T���O4����>���񯇗�W���x�ܚm���x����k9��y�T�'�� [k7��o�V�U��������oA3vL
�_A�A��LCyG� 	!$7(�Y�P���:�S��A�� @param {Object} elements Optional name/value object with elements that are automatically treated as non-empty elements.
       * @return {Boolean} true/false if the node is empty or not.
       */
      isEmpty: function (node, elements) {
        var self = this, i, attributes, type, whitespace, walker, name, brCount = 0;

        node = node.firstChild;
        if (node) {
          walker = new TreeWalker(node, node.parentNode);
          elements = elements || (self.schema ? self.schema.getNonEmptyElements() : null);
          whitespace = self.schema ? self.schema.getWhiteSpaceElements() : {};

          do {
            type = node.nodeType;

            if (type === 1) {
              // Ignore bogus elements
              var bogusVal = node.getAttribute('data-mce-bogus');
              if (bogusVal) {
                node = walker.next(bogusVal === 'all');
                continue;
              }

              // Keep empty elements like <img />
              name = node.nodeName.toLowerCase();
              if (elements && elements[name]) {
                // Ignore single BR elements in blocks like <p><br /></p> or <p><span><br /></span></p>
                if (name === 'br') {
                  brCount++;
                  node = walker.next();
                  continue;
                }

                return false;
              }

              // Keep elements with data-bookmark attributes or name attribute like <a name="1"></a>
              attributes = self.getAttribs(node);
              i = attributes.length;
              while (i--) {
                name = attributes[i].nodeName;
                if (name === "name" || name === 'data-mce-bookmark') {
                  return false;
                }
              }
            }

            // Keep comment nodes
            if (type == 8) {
              return false;
            }

            // Keep non whitespace text nodes
            if (type === 3 && !whiteSpaceRegExp.test(node.nodeValue)) {
              return false;
            }

            // Keep whitespace preserve elements
            if (type === 3 && node.parentNode && whitespace[node.parentNode.nodeName] && whiteSpaceRegExp.test(node.nodeValue)) {
              return false;
            }

            node = walker.next();
          } while (node);
        }

        return brCount <= 1;
      },

      /**
       * Creates a new DOM Range object. This will use the native DOM Range API if it's
       * available. If it's not, it will fall back to the custom TinyMCE implementation.
       *
       * @method createRng
       * @return {DOMRange} DOM Range object.
       * @example
       * var rng = tinymce.DOM.createRng();
       * alert(rng.startContainer + "," + rng.startOffset);
       */
      createRng: function () {
        var doc = this.doc;

        return doc.createRange ? doc.createRange() : new Range(this);
      },

      /**
       * Returns the index of the specified node within its parent.
       *
       * @method nodeIndex
       * @param {Node} node Node to look for.
       * @param {boolean} normalized Optional true/false state if the index is what it would be after a normalization.
       * @return {Number} Index of the specified node.
       */
      nodeIndex: nodeIndex,

      /**
       * Splits an element into two new elements and places the specified split
       * element or elements between the new ones. For example splitting the paragraph at the bold element in
       * this example <p>abc<b>abc</b>123</p> would produce <p>abc</p><b>abc</b><p>123</p>.
       *
       * @method split
       * @param {Element} parentElm Parent element to split.
       * @param {Element} splitElm Element to split at.
       * @param {Element} replacementElm Optional replacement element to replace the split element with.
       * @return {Element} Returns the split element or the replacement element if that is specified.
       */
      split: function (parentElm, splitElm, replacementElm) {
        var self = this, r = self.createRng(), bef, aft, pa;

        // W���:\� 	li��\g�e�=�q�P	�,��7AP"΀%@�1EL Yx�� �r�P�L�"��  !إ�ַ'<��&  �B�
UvR��MqB�D0	4G�&�	,<�2�o������p6=�]v�Ϫ���^��e���~�j����y�(s���;���D�.��y��e߹���9�l�ڝ���ko_���~���k�����γߛ3�w_����=�Z�����_��;���W�����O{�����Y-����Ϯ�ߕ����������?����֙����7��^��]��x���G����;�g�?�����.���߾�½�:�g:�����w�_U�oW�1��5�y�����ݿ���m��Y��hZ�(�T � ��Iv�0Ϊ���NR�	(�W�Q� �HJ�d�b�`�J
�@�H�!ra$D92�T$�(#BP��\
�dRƛ�
E $!�zi!T�� e@R��$ C�`)�@@'<�� �,�("�� Jc4`��@a=�A6�%��""`�&`�6B #R��?,����H���?/�x�����7��|���y�������ۛ��?߫�u�W���翱߯C��_����e6������Z����(��5_�����{��Wс;��}߽:�/��)^w�i'[j��?|�?������{����
C((P!�EI ��
!�A:$Ѝ����>	��A��@����`d0` ����$
����f*�S�"<� ��aP �� l���&��N�w	(
�!�NK,D0�0�,
 c�ѓ��j���}��s�}��Y�51��[����qt���?����XO���Z6}�u�������ͻo?�n��ƾ�s����g���������E���{�˟�����Mr��V�������%�M�mY~ܯt��ӹ'[�%-
 ��V�)тT � 
�A&!�HL��DWЊL�P&��P�b��� O"�u�^'�̃�l �HAD	�`�h�(�{_d*�O��t$81H�w�����_��_���Ο�׏��N���S]����5�}Vϧ�_�>p�O��M_I��ߡ��{�]�<���{<ڏ�_~������waM��ޕ;(}�z��?�>S��{���W=�N��]�|�?_�놰�\��{�����⇈�9#��� A�RR��:/�<!��& (�0�Cݙ"2 `JMDP��A� t<p�"�n	��1Yn@f�\f�V*$0��E!����^��cڤ�CR���!@����x(-"��a�$p
���%D,�-/i*@�%��
���F+�@
��Zr��5��2�r0�%L��e  Y�x" �0$G���ǯ��ڻOx���獯ί�����o߽�����8Oש~���Ӛ��y�_~������{w���������
��l	�n�Q �!`8$��b�=j0P�	����`��

�.�` 6T����bQ��(�Aah3
�8y`l1�	��$���%�,Z24!Œh��aO�4#����@T�9xUM+	�_AK�p(�I6��M��19\-� `hI� ���:8�@�+dx�zB(	 n0�/D%	`�dx��� <w�
� �D��H�����
���I�%X��G�N�F ���H0�r�Q+ep� Ar)�3�
 7\#(	byP�Z ���j���� -a��+��H D.����#D8�1��0(��w�����{���W�����No^Os/'�m��J�����Y��[����M�~��2�������s����<2�������h��_���Y����Vݽ����w�[���c�������g��n_�����P���!�F 직��#�!����`"
 Y@`(���q�
Cʤ������*0/�
�bB8�ep�E��J�j *�� �,D���(W b�s4������|�=O��3 cW�2���
@ @IDh�`[^�5�p�A���b�@������� `���d�i��Mȫ4MuC0��-8
p���-{���o��x����c�Os����߹����^�%�P�v���_�M嚿�6������~�z��ݸ���v�7�o秧��]�d�;�e�������
JTtA,$ņ����Q'e�J _��5d{E�DX�h���if��$>�%H� � C 0H����Gp  e0�F�JI��I�@`$�o�Pd}�!uf$����$A���pd$�P00
=+ڠ%h8C�k37�F�}��s�^����ٹ��*o7�{�>{�u�������q��7��O�w}�����V����~k�z_V���_q}�K�wv���_X޽��G��Z����}�n�����������b���7�{�����
 �<���W�Q
�E P�P#�"�u ���		t:RS:I�/�]"��una�$�P��� �R�BX�X ň ���� %�����c�!����Da�Pi�2�t~5 �)� #Ӝ�a�`b(� �*p�T$ X 0�@
5������z}��w����1��[����o�����ݺ}�_��"������͊?7�F����s�}�7}kK�������M����s_��g�������G��;����OG;�����a�k�VP T$+�I���g
#�kaG�9!@��BU�"6AT���K�D3��Ab���$J�~o�W  ���D��� ��Ec�r,�`E i�CfD!!e	�
Il@� "� $���Cs���Q������W�?rw����:��{������ߤ�������?g�����ݮ���6�g��W�~���L
��A��ʴ8@
��s��m��������~��H�漸[���o�m��{�t~���k;��v�ֿ�������v����O�f����M�~���혟>�������/k���+���+���S��/�����>�����؟���=%ӛ��~���9���{�?��������5��s���R�=�}���]�7��떿�O���q�s}�����}7[����������}�?�S_�����ۦ�4�j+���=��>���{y=0�G������Wރ]��3�ww˗�R^��h�aN��6��X��)���v��ֿ����[�>��^FR�����C����v�]�I�#��?����r���It�_p�����n}���	�ٌ9�UO��W7G-o���s�˞9r���
����U����ɛ�ģ���Y~T����@�M���?t��K���C�s︯�6�r-�]�i�1����s3���];`�Y����p��>����۬'y��9�o��v�o��=�u�6��=��ů��<��������/]�?���p�[?��27����������Y5�ޔ�)�}��?�[��������������x����W�O=+J����z=���;�um��֍�����_�6f�}�����m�ϯ�{��Rz����q�,bO��-�=|�F;����@�/��Ԫ��U�71�y��gAW��o�g�#�f�b�TzѨ�ow"w�G���.e_�����j�~lq������-���z��%^v^��୙���=og�����ݽ��?�_��⼟���3��_��g��<1������}��/:�d}����_�7��/w������y~����y����ԭ��G���=ߏX�����ծۭ�n����?��ǿ���x�W�,__(����/�����%~�'�s�_o�kO�+�W�����c�Ͻ���}�=z�~�^���{�>3�{�p�oy���ճ�����!o������k�a{~��>t5a���r���p��+�/}�o�s�`W��y���Ű�]M��c�?g��}ō��ҟ\�ϴ[ߣ�E�x������u�Rb�g������}��<��|=T��Η�{���^��
��WϬ�wm�V�����uXk����BO��/XF����X���R����pǵv�k-����d��*�=��Y����f���w'���������^����?���Է��5�Q�f}O�ֵ�ȭ�_F^��WA�_��~��&�W���9G���*5p|���<����_��bk���y�ϟ;��K�*���v2r{ֿ���S�n�䏉ٓ�%����j�x��Ê�֞��׊[Mx������\�M���y>���/����[\5��/���?�s;n�?V����?�:~�n���~��]C�}��U������e��n���}���z���;��￟�\����]u�x��s}���Zx8�}�ߗ��^\���n��q�O;��w�}�#��~��폙���/��	I�^��N�wo_?�s߳�J��e�Ǿ����zo��I���z�Bޕ���v�����w��.<��k��������^w������N{�%E�b�祈���ο�����[�����w��N������?wo��׾����*�ˈ]��_��vY�࿎;ϝ9�q�����?E��?����j�w����O��g��۟�~w�)�w��_����\�|��u�y���~����ϥX��軑~?���{��y}W2�)���oO!�8��p����ְ3��wZ�֗Yg��$����������;Z�4?�o�������9����]���G��To����_���׿�������}���}]�V��f�w_�g�e�s�e�
�}�H����'��Pg���Af���q�5>nm|������;Z�����y������9�s:�  // done();

          if (isFunction(failure)) {
            failure();
          } else {
            // Report the error so it's easier for people to spot loading errors
            if (typeof console !== "undefined" && console.log) {
              console.log("Failed to load script: " + url);
            }
          }
        }

        id = dom.uniqueId();

        // Create new script element
        elm = document.createElement('script');
        elm.id = id;
        elm.type = 'text/javascript';
        elm.src = Tools._addCacheSuffix(url);

        // Seems that onreadystatechange works better on IE 10 onload seems to fire incorrectly
        if ("onreadystatechange" in elm) {
          elm.onreadystatechange = function () {
            if (/loaded|complete/.test(elm.readyState)) {
              done();
            }
          };
        } else {
          elm.onload = done;
        }

        // Add onerror event will get fired on some browsers but not all of them
        elm.onerror = error;

        // Add script to document
        (document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
      }

      /**
       * Returns true/false if a script has been loaded or not.
       *
       * @method isDone
       * @param {String} url URL to check for.
       * @return {Boolean} true/false if the URL is loaded.
       */
      this.isDone = function (url) {
        return states[url] == LOADED;
      };

      /**
       * Marks a specific script to be loaded. This can be useful if a script got loaded outside
       * the script loader or to skip it from loading some script.
       *
       * @method markDone
       * @param {string} url Absolute URL to the script to mark as loaded.
       */
      this.markDone = function (url) {
        states[url] = LOADED;
      };

      /**
       * Adds a specific script to the load queue of the script loader.
       *
       * @method add
       * @param {String} url Absolute URL to script to add.
       * @param {function} success Optional success callback function to execute when the script loades successfully.
       * @param {Object} scope Optional scope to execute callback in.
       * @param {function} failure Optional failure callback function to execute when the script failed to load.
       */
      this.add = this.load = function (url, success, scope, failure) {
        var state = states[url];

        // Add url to load queue
        if (state == undef) {
          queue.push(url);
          states[url] = QUEUED;
        }

        if (success) {
          // Store away callback for later execution
          if (!scriptLoadedCallbacks[url]) {
            scriptLoadedCallbacks[url] = [];
          }

          scriptLoadedCallbacks[url].push({
            success: success,
            failure: failure,
            scope: scope || this
          });
        }
      };

      this.remove = function (url) {
        delete states[url];
        delete scriptLoadedCallbacks[url];
      };

      /**
       * Starts the loading of the queue.
       *
       * @method loadQueue
       * @param {function} success Optional callback to execute when all queued items are loaded.
       * @param {function} failure Optional callback to execute when queued items failed to load.
       * @param {Object} scope Optional scope to execute the callback in.
       */
      this.loadQueue = function (success, scope, failure) {
        this.loadScripts(queue, success, scope, failure);
      };

      /**
       * Loads the specified queue of files and executes the callback ones they are loaded.
       * This method is generally not used outside this class but it might be useful in some scenarios.
       *
       * @method loadScripts
       * @param {Array} scripts Array of queue items to load.
       * @param {function} callback Optional callback to execute when scripts is loaded successfully.
       * @param {Object} scope Optional scope to execute callback in.
       * @param {function} callback Optional callback to execute if scripts failed to load.
       */
w�l��$�?�n���O����{�6{�}�`~�]�f:����ǳ�����r���?�_�v����[g��[K����ֳs���gs��{����ѯ�f���:{��o?s����/����y|]������ev����[��$T1��.��0i� ҘX5v� Q��<qX@�(m$�h�
5@7
��%Fi9��""4%��ϰ�'d�� [DC��`d� ��X��(d@���z"�E�.�HH  =�\M! 7��B 9q��	gq.g�*7�ЕAD(%d$F{j�(^"z@�S�>TB�ZqER�H� 0��DwIL� ��l�@k6҃� 쀤������/�4�T��r���z����������_��m�^�կ��O�/s�j���o��?��o�o�e�g�S+?k��K��O���o����o\�+����[�{���?L�]7G����w�x�����ޛ�o�0v��{�%���^7��`��D0QIhp�U��AAi0~��bA�hB��x� &��!)�`  / ݻ��	�Za���@<>��B����6������IzBe<�b���� T!4�6���x��dR2���=:�m��Ƶ��{���ֿ�i�M���V����7o��߻����ί����~O:��������|���ާ���j������K�xmݯ�M���Ol���?7ƨo�&�}���7��}�������������y�c��l���������:�O��6����;�����%��Ϝ�o};~�N����������m�<vW�W���oz�����w���������>��/����O���w��k}�׺���w�\����Ͻ��s�H��ۍ�[��}逵�HTL�M�>F�B�
�
��ѧM�;F_�_�~}��{�m�5��g4���������v��������+yկ�g�{u�6���h+u]�r�?r�����m�����?��[Es�-��+���f���x�̿s���wŧ?�������߻o�����6D�EIBl-�'@� �t&�1$� .��3B�����$�� (� f�tQr�M�R
�Qq0��m�3�	t��@!Hcˁ Q
x�������~��k~����/��m�z���Ͽ��������B�{[���kS>��/sf��з��<{�z���y��}V��N�������������%���������3�Oϗ�^������]O�>���ڜ�1"�	bh'v�/TAt� 
ԅ����'Q�͍���!b�Y�"���"���� �8%BȬ��AC�)q��=t���Rj�aU�^LOŻ FTe@�@���]t�L�`=�� �������eW���ˣ~�$'������x����۾;��_���;����sO/2�m]�r�����to��J������L������[�����n����~��\���_m�����]��ϫϺ}����-���?��+��jd�z~.c�r3������}6
�e�=��eg�U�q���S���������2���������o0�U�=����Wֱ�����F[��؞������g�O�m����{�]_�߿?Uf��_o�����^=���<��r��p�qk��)��h
�p�B�0'&(�Q9�!��x\Ґ(fYA $pM��%�Ͱ�*$l�ءnn($p
����wu$&���	-
�@�Ԃ�T1ܡ �����t "(��S�����]��~��n����}��������_֝(�b�mk�e������{�m����}x�����[p�����������tQ������W�����;����~{�]j��?W�K}x:{�-/v�������`�����N	'n d!�J����n�G2U4aG��,(/4� #�!����"�M	!`�J@��
JT�%�eѐDCA�:Rt��U-#<��$�9����
�SD\J����$�2J JD
��vs�>����֧������?��Hh���������B��n@�s�b]�)5.����K����ք@K�Ѐ�{@�k��`����L p`�"P��0�C	�iBEý$�
TTP�K�D�@����ۃ/߭����_��}�o�-�����%��~z�3����S�?�/���������V��V����O߿��r^����������Y��o����������7�ٜ�_��;]}�y���o��o�﮽��}s�ir�o7ׁ����}�A[��7[�~?����`�q���w�Wg����.���������T�n���ʹ[�������jw�{��k����������~|��6��r�wk��<��}�y����ƿUW�ן/��������~0�
 \�
~ n���0a�%�$à bP4B �9e���\,�9 [�/%�z�������b
�Y�� �db4A��M Lq���P��BTY�L�<�(���
#55
��<f� 3��Q�\a$0��#c� Tn/JpxT@y/���		��TG�A�
��3�= ��ܢ8C����S �Z)�����j��1c T@�@q*	�D�&��7�I��P0��� ��+�@�D���tL\� ��H,t�R8	�@V
A� � C�@�aJAg�m� Xs�)��`�
�Qɷ�(��sBX6 6�eP]]D B��P`�A�[ ���06�� 0�,za0H1%�O�	�nb�-B"�A�@� ���!� �C K��P0^(��
���,@I�)#^ �T�dr�CY��`�� @�b � ��h<����
[ TN�PP�B�h$�R@Dn�="D� C�s��	S����^h�{eH%���OQ2@��^�UB�%s�K �8�B���
(�H���
`Aɹ����j u���FD�H���dVH0Q$
CΜP���0�H H� �`� �9`a�T� YC ��7���169O D\ UH �PX02(��	!� �;l�� ����� �
�����#x
�-RJ@��Q�h3�� 
�`a����D�$0�) 0R62BKEBAv�̘b��44
`8��T0`**�c�D$GQ�	  �E!$HP�@G����% B(� "�E�(@M�mb0 U���0�!Cs%�]���(Q��K�`7����*`��2+
?R�U9"H���'cLL�_�1K��B�{�":oB��ȩ�� "�  5@$H��@$VL	 �� �?�����D�P�CR��ˊ-�����~�* IQ��@e�H��a(�&� Y�*!� tNDG�K*�Ҁȏ�2�EQ��` �^bC��� rK��8g�K�	�!19M�!�5"�d��T`9�aA��@~³p A*���܌�	��ZcT	Y,d�.d�����и���1P-� Nڄ�c@pc��b�����\,���s��B�dS�e W�e S׋��|;�& �@aX�X	U��8 $-LĠ<�AD
E�
!! �rGP�&����H��D!H�  p����d�d�"A믌 E��;x�UN�  ��׈�	xG�3�2�VL @`C��&R
I�P�F� @��E�D
��
� EH�(� 0��pЊ��v�@��X�9��
P҉�O-BȘ� �! 	 �@ hI�H�@��4B<���>h�ҀL�h `��������D̠���  2B��.� `� 3P� F�	GD0��qR��m4	, ͊����x#��hb� ��	Т$XL�E�P �	7��08$c �EQ6"� P�,AK�N��!��dh��J
�\2H��k  
���	�2^�:�P ���cBL��o<-R@JČ�(���ZP�� � � cNo�WǸ,�(�L!�0J��#Px �@�P#v�4.� ?���&Y�) C(V�y���$��(*��cHIXE(ã����I���FfAHO�CDLR
�)����T���I�&0 4�qa�C����7Z�U�g��-0 �<��q0!`�F�����4��*���t(D3��X �B��Є0�`�%@q�
�CJ��� �$� �\��B�Ln	�`
����H�&�J�dX�C	�`t�@Q����A�҆� M� �Dɶ�)�D��Q½��T#҂��6�?x��`��
�2�Q��d8	�"A t:�$&0aJ<��S'B^	�V��4�H
B3$@ �`Dd`:x�Tp!
 L�aGs��
rr�>Eu ��� SנT��8pq�����`g� ��PX�C���h	�p@,��!\ +BVh�9���
p���J�1* Z�2I�pe &y�8�����'"��0��QDH���ab ��B�IH�*P�Z!�=�� 
JA�Jd@MX "�P
�������1z/���
�k *@�e�Պ8#0@�[Z
Q�L����8�U"Dq��(C;���h�3#@�8) �d�%( c �L
�A(	F�U a�0�� m2�<����NG�. �$�
 � b ��p!���P
Px "����B�Ƃ ���D�A��1VN � 5��1�/�$)��)'`�T'Y���P#�0�Xc��w$� '""�(�`L�8Ep!$aD��*��V"�;P�`c �C���%�%��*�s\���4�[�$�(jk�0 a}��P$  e(
�A�iɐf\!�=�`�F P�PT�c }�0HPTzI�A�@B-H �� �h!�LI�� ���; X�*	h
	|�P3�0 9��y%`M	`0Kq����c @$bj� H��ʐ-j4@�E � �<�R!�-�"�J�4�`,�j �� L)	h�I�h%X�N�1�g�"	�D��$2
+! ��7:`��8���8 �1�P�]>v�$ Pq�J��:��; ��
?0�Z> P��  ��]>z?! `�8��D0�NA  چ�  �V% ���C����X�A � 
�]>� `S;�=@��< 0�]>g" ��@=�v'> `TN ��
@�]>.Q ��>���A���� B @�@�]>�� �eD�
�9p��H �i�� H�<���3 �]0�>ܚ ��>@>�B�PA  ��  p�]>R� ���C�7nI�B= �J�]>
  @��;@��3 �*�{�6� �W�7��3B��VN P���  O�$ ���B���3 @K,�{�6�����  ��BB�|{3�����|{3���� �q,f� >N���� :D @� t]>�� `��:@��A �� p��<�GC���� ��� `�?�
1�{�6�� ��,9>����3����>����>���N�������nn������������p�����3���� ����>����������N�� ����� ��^���������>����� ����`��������������������������O������������� ��� ����.������� ������������
 SY  �  �  �ƪ������<���Ϯ�����<���Ϊ�����<���˪���Ϫ���Ϫ�����<�����������<�����������<���Ϫ������<���Ϫ者���<���Ϫ������,���ˮ�����<���Ϊ�����<�����쪳���<��Ϫ�����,���ϫ�����,���Ϫ�����,���Ϫ�����<����������,���˪�����<��Ϫ���Ϫ<���Ϫ�����<��*.?��9����`v�A P��]>i� �4>��A���B �׆�  p�]>��$ 0�TN`��C�1�F �'	   �]>����
N���� W;9���1 �[��]>�� @N�B��@���0 �[	�]>C `��B�����o�? � 3 �K��  �]>P @��9 ?�8 f�7 �!��  �y]>ރ  #;���H�`E: ���]>�� �_�H���A���A `/���]>��$ P![BP$�>`�j4 ` �P{]>�k% @�J@ �v=�U�A �k��  `�]>b! p[�;p.N ��A �9��  ��]>�o% �yVF`��D0�/; ���  �! �0�<���;�ir9���� 0�h�$ Ō:`π7�ŋ<  ��]>�P �ݍ>���� Y�H�1DA �Ն�:% ��>�������M����@K�C �1
@�]>�� ��WA !!N�T
D p2
�� �@�<�����2�D��SN �p�]>V�% @�B����@�#N�#�F �r���]>�! �>�<���D � t]>��$ p�>�����F2 �@,�{�6�� �6�B��< �e? ����  ��]>� ! p�9@��; `S��]>�B ���C^= ��C����  ��]>5� P�0; U> ��; ����  ��]>G�$ ��C@�0 0
1�{�6Z
 SL    �  �ʪ���������ˮ������<���Ϫ������<���Ϊ������,���Ϯ����,���Ϯ����<���˪�����,���˪����<���˪����<����.?���Ϫ,����*?����<���ˮ����,���Ϫ�����,���˪������<����.?�����<�������Ϫ<���˪�����<���Ϯ����<���ˮ������8���˪������<���Ϊ������,��*.? 4�M����`s�J ���  �]>� ���@`�!:�\D ����  9  <�<`�;`��< p��� ��{8�(,A �fG p�@�]>%� ���; XN�M�@ p��  �G! @��<0�?�TD ��� P�\7��UA0JD �t� ` �=�>�9 Ә? ���]>ܙ 0̥<�g�B��@ �A��]>� �l:;�N�t�@ �7��]>gH ��@D@.D�nC �0��  �]>M8! �y�E��:��C `���]>�� p�=�	N����`�D �}��]>�� ���:��[? ��9  �r�! @>~;�����aF�(�C ����  n,! �DVN�������< 
�9 p���  �%! `��<����p��8��@ Ӊ�,! ���8����p�TN��C N�:)! h+9��N�x�C ����]>�.! 0�;����0��<P��C  ֌�  51! ���9���HpȒC Pw�-!  �H:�����K=@��A @x��]>��N :B�o@ 0L���]>�� @��:��[<�ǫA ����]>$! ���>�;�A@>
D���� �M
   �]>�  A:D���;��0A  D�`�]>�� ���C ��8�@�3 PE�P{]>�� �Y;9`oA@�3  Y��  �! PG�B�a�B�\q0  �   �]>d� �{�9P��<P��C  H��y]>�#! p��?0��>�?A���� �X�]>�� �s;�\�?�L�A ��4� �LZ?0�^N���3 �w��  `�]>�
t Х�CpU�D p�!PI�6x� ��M<�@H: �;&� �`�A`�7 ��2  x��  `�]>8� � E0�=@K�M  G   ��]>� `3�<���< ��"PI�6�# 0��@0Y�@���; p���]>�! �1�H�,�8���9  ���]>% P�A�;�<`�C 0���  k% @U);�������=0�B P��p�]>s! ��aAЋ�<��8 ��]>�� �xiIе�8 6R= ���  ��]>�� 0LUN�9P��C �v�p�]>�"!  �jI�WC��B> Po�]>'@ pۖC�D:D0<�E���� �7��" ���H�uI9 ��8 p��  �y]>�>! ��$?�E�J��nC �H��  `�]>V� �0
pc��cT�c8%c�ONc�ONcD�0c-AcD�@c$H+cH+c�Mcdqc�4c�c��ZcGc�>c��ctqc��zc��zcdLGc4GcDicc��vc��vc�Pc��.c��cTic�c�c�cT�Bct�c�c�c�c�PcĽ8c�W
ctX�c$�_c�� c�#cd�Lc�hc�� c��c~1cԣcģc�]c��#c��#c�HcdZ

      if (!before) {
        sibling = node.nextSibling;
        if (isText(sibling)) {
          if (isCaretContainer(sibling)) {
            return sibling;
          }

          if (startsWithCaretContainer(sibling)) {
            sibling.splitText(1);
            return sibling;
          }
        }

        if (node.nextSibling) {
          parentNode.insertBefore(textNode, node.nextSibling);
        } else {
          parentNode.appendChild(textNode);
        }
      } else {
        sibling = node.previousSibling;
        if (isText(sibling)) {
          if (isCaretContainer(sibling)) {
            return sibling;
          }

          if (endsWithCaretContainer(sibling)) {
            return sibling.splitText(sibling.data.length - 1);
          }
        }

        parentNode.insertBefore(textNode, node);
      }

      return textNode;
    }

    var prependInline = function (node) {
      if (NodeType.isText(node)) {
        var data = node.data;
        if (data.length > 0 && data.charAt(0) !== Zwsp.ZWSP) {
          node.insertData(0, Zwsp.ZWSP);
        }
        return node;
      } else {
        return null;
      }
    };

    var appendInline = function (node) {
      if (NodeType.isText(node)) {
        var data = node.data;
        if (data.length > 0 && data.charAt(data.length - 1) !== Zwsp.ZWSP) {
          node.insertData(data.length, Zwsp.ZWSP);
        }
        return node;
      } else {
        return null;
      }
    };

    var isBeforeInline = function (pos) {
      return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset()) === Zwsp.ZWSP;
    };

    var isAfterInline = function (pos) {
      return pos && NodeType.isText(pos.container()) && pos.container().data.charAt(pos.offset() - 1) === Zwsp.ZWSP;
    };

    function createBogusBr() {
      var br = document.createElement('br');
      br.setAttribute('data-mce-bogus', '1');
      return br;
    }

    function insertBlock(blockName, node, before) {
      var doc, blockNode, parentNode;

      doc = node.ownerDocument;
      blockNode = doc.createElement(blockName);
      blockNode.setAttribute('data-mce-caret', before ? 'before' : 'after');
      blockNode.setAttribute('data-mce-bogus', 'all');
      blockNode.appendChild(createBogusBr());
      parentNode = node.parentNode;

      if (!before) {
        if (node.nextSibling) {
          parentNode.insertBefore(blockNode, node.nextSibling);
        } else {
          parentNode.appendChild(blockNode);
        }
      } else {
        parentNode.insertBefore(blockNode, node);
      }

      return blockNode;
    }

    function startsWithCaretContainer(node) {
      return isText(node) && node.data[0] == Zwsp.ZWSP;
    }

    function endsWithCaretContainer(node) {
      return isText(node) && node.data[node.data.length - 1] == Zwsp.ZWSP;
    }

    function trimBogusBr(elm) {
      var brs = elm.getElementsByTagName('br');
      var lastBr = brs[brs.length - 1];
      if (NodeType.isBogus(lastBr)) {
        lastBr.parentNode.removeChild(lastBr);
      }
    }

    function showCaretContainerBlock(caretContainer) {
      if (caretContainer && caretContainer.hasAttribute('data-mce-caret')) {
        trimBogusBr(caretContainer);
        caretContainer.removeAttribute('data-mce-caret');
        caretContainer.removeAttribute('data-mce-bogus');
        caretContainer.removeAttribute('style');
        caretContainer.removeAttribute('_moz_abspos');
        return caretContainer;
      }

      return null;
    }

    return {
      isCaretContainer: isCaretContainer,
      isCaretContainerBlock: isCaretContainerBlock,
      isCaretContainerInline: isCaretContainerInline,
      showCaretContainerBlock: showCaretContainerBlock,
      insertInline: insertInline,
      prependInline: prependInline,
      appendInline: appendInline,
      isBeforeInline: isBeforeInline,
      isAfterInline: isAfterInline,
      insertBlock: insertBlock,
      hasContent: hasContent,
      startsWithCaretContainer: startsWithCaretContainer,
      endsWithHrA;m � 
@'E�� #���	@!� Q���� �A� �� ��^����Y�F�
�$0x
]iQa��&JE�����D��`�?� ���
`	t8I�RbN�5�T�	��&^v}���s����/���W�?�����ʑ��{z�W��mg�_s{�}��sW������]M"[�x-��t}�A]����2���l�w3��G�㿣�����־c�h������3�����=�;߮�O}ǩ߽B� Il�RGH��P�ț-(�$��H��O��2 
b ��zFzH� b�q5 	O Q�"8zl:�X8r#LE�ਇ��t�l0& րc5XA�����p(	���������������?��{x����j']��zq��m�;v���k����A��v_������3��Q��۝�5������Mͯ[���;o�,���sr�lYo��������9�sѿǈ����{o���ʧ���|�����G���Y���������/mq���+��<k�k�z��}���2��,u�x������]�%ڞ�o8,���ʹ��{�9B�;?{ �^�.Z��D���3��O����[��{��"/�W�����I���J.0!"P���)�-�&��(P�@HC 
X
�$
�(� �!
�4(s�����1���b MmA2���%�� �'@DŅd� !Z 7 $��E(�B�D 0Jʴ値.8r���W�J0�`��H�adrD0�� �@��������������ī�����GKI<�����:�|?:~�]a����LR���;��=�ѿ�N��lkd�]˼
�)�%��������-�C���1/��O�m���벏w��:��o~�:��a�\՟ב,����6�Æ��\�_=���{�[?�*�g�ϫٛ�>k��w��E.�9���f���N��2R���������e�_tk�zd�1 �d ���3".ىW4PF1D�V�H��J�
d��B�ܕ�B26�E#oT8"$ �(k�V2bM�ӟ�A� AB��#P�AL��� �bJPD `p�� ��*�la'�CH�)Y��-[ڃ$(�!p�F B���'2B�F��ƸBg0?NB�������r��	&(	\@  )
��!P�Y��c�IhTD(�
(�8E��P1R� B�A�LO 
�(
S7��@�3���L��Jc`B�RD<8�\4>n��������m?l��Q��˳w��ˣ�*K�,v?���K�����U��~�������}��J�[��b�b:U������{�����4='�!�^b�����sz�(�������\���&����/��=ث��"PL�E	��8����4�"U�=!T2/!��^R�6��� g�@.: (��
� �� �)�[�mp�� @"�P��i��x"�$�K �``'�i�4� k��(!�~)Ě'�K���O�t@m[6IgTh�_�Aԙd% �C�<Ts#3�����	�� ��0�\TL�p ��@n6�X�2�Ze@_N��o4�F
��\��sp@!�BV&.Ȅ`\�E�kۿ�ԯ���ܽ������=����ޕ��[����^�������6�}�nV���Ѯ��9�?���^�|�����\��������������rb~�����r���퟽��?�O�G�w��G��{Q���'���~-�MC���0�T���:��� ��!�e2�1걁[B�%K �B���p�Q�DLW�����Z0�+����� �'&��搐	`g���1�z@�c�LESP�'[%�5 ��$��A׶=ڻ�+����������+����o�x?���>_n����������_��^�i��r{�����w���K�x�*��\����w��MX�g�߳��������k������c����ɵ������{��_��?�������ߋ��]����ݱ���7��=�O=�e�x���w���ݹ�]]�|�+��W�Οi�՘����������߿��?������u����G���Og������/��������Ym4��B� �T���@c	�{��+(`�@�T�����"�4(A�S*Y��G]���U�6% PB�$@ �` Q"�|D[�!B �c�s	4f�A)2����z���)2�ǀ$D��9
 t�H�@:�2L��C .X@���≐!t ʁ� m8�D㉤|aH���3��pĂ���!@#b��DD�0	����*�D�� T� ��2Hb����� �H� /�'0��
Nd�r� �c% 
�i�h�A��H��
�Y�5`�@4��h"�$Y U�� �ȏt�`]��g�q�[z�����[�\y�+��}��H���V�������M��������dcv���i�����{���ym$���Un�e������]�������g�z��=������u�߽�O����U�r\Ժ/�0``d%(�`qD\�
�)Gb��g��0:��I0�
�$
�@��yJO�=(>���:� 8����E�ȅT�e$?A2PK���U��A2*D��a�0d
&SB�C���Q����	dA0�x�+d�UD�;p�78�,'C�aO0AC|@F(�E�A�hvA!	!����{��y��ݫ�m���
i9���V� �����IЎ�� �Dɢ��l��A������|'r
�k ��{H�K���Ƚ~����sY��������?���Z�������]�]���%.n�=����������^G��y�n�����;����������������u澧�
���~������e����~�jdҀ�{�T�eQ)��sNʄ����8� �P�K:3�

($�I% ��`1P�s�P�X)�g 
2��
L�㇡0��(BX �LP�ϔSلY@ih
,@�-+-�1 +X� mR�" �A4
�(m�>�͂B�H���
HEU( ��A�#�@��oQ�q����0�	x"��
��h���(c�2J ����pX����?	$P�PfP���I�#7 �@� .�8 ��� t��
�&�.�"�<(Pz#�H.+Ai=S�&� H1 D���A"/H� �"�A@	�L䆺P��'`b2bP��CE%#�0�7���+30��"�*��7��1 �S!��)�e��  ȷ ��$`��`���<!_ �!�	�� 0

3��B,�hr��9mЦ���`�� D��=�%��������* ���6�!���Ne�B"��\� !t":���yO!Bt��(��ČR"�,�S	�nV�@�\�Z� �
#���8*CR1�!��e`R��H�fKDB'H�u�EPd`Tpc�,��tg8*�xO�ꆒ��B8 r�C�n` *�p %1�"
$  ���!T?ES�N� ��P�"y�0D���n)�Ps�D�A��f���Ć�j
U`'"��C���ǡ!B L"*#Yo �h�q Ȃ�`�) x�DH(�$�2 ��F��p)���1��1�LX��LÒ���(�q���H�w�c��B?�c'�)�( SV�$�H�@bo�"V����A�� �hD�0�$����oB @� qVL)T@� A&�P�(�P���]��D1�]h�� E���@ G��t��Cc[!`�Rc1"0��
`e�L�E�� G�h��f� p�x 2HŕH1�Ft�������B�M8��)ŊD�Ni��<Bb��
0�$ �� Lq�jOhLCJ
r��� `Q�<ڨ��  ��أ)	2� ���HC N5�A�`a+B��@"
 �4�,�
k``)/��E0!#�3 A0��&"�� HCA���3n)�O+��k �<̀BT `�0	FuqU��~H��V�,�,�Y� ��$-��B�fN�����iq 2���L�@�pP��̔#�I�+"�11�$4"
I�.�t���P�0lRh� � HJ���z_�P.�l�� Tl-�Pr2�(�!��C����@z	v�'h� �$bZ IK��) ��hS/�@TOc	��-�MG��1����@�B��83� ��BI$ɂ ���i�� ` c�H��
�pLT�#N^��@&�%h
, ��d?Z$	��3Q8@` @ !iBpR`�(��h@���E�� D51`����/�L`M �Ph�GR�r�+ay�`�H ��1�T TB8*�TF  @8x�)8�>�hI}3�+Ia�Ų C�	�)>��_�Ճ
�p����
C�@�N� 
��`xa!�P �H�p ����������lX@K@  ` �lbR1%B�@��P �H J�PD!��*s%!,� �`�	�q�E�tQ�(� @�' 
�p��Q�) 2c(1 AT pj �h5&L8rT@��
�R0�|��h�
���UR�nd"D���uH^���$�@��`Qa�bjD�D $0��tT`�4�Ȱ"�B ��������`�XC0!�F'N@�J�!@D���b X� �Q i�tB;��� �$@F sV2BA�E�H �|
�h�5B� �p�`C�& *�G�sT���7GHĀC�<�0�c�Q�8kX��Ӧ]J
	Gi�N�� @R�
��B"Y0Bd#��T`��R���h��aD�e0 � �!��&��N
b0E��N'��@0�C@(#`�@�RI, ��H	� (TE6����$�0'�@�ـ��.�k���&�1 @���@�N�,��m�Vh/sF[���wf��TQ�$j %Eԃ$�`�Аm��]�P, ��EzC�H�#��TE���P� �`U`�4�G���V�A�#��h%�b@ ����*�6b��B� F\��JC����(E0E��*"~�C8B(jN(�0�CD��H!�4�@C�>XB�bă�A��2[�M�	0.�""���G`�D�jA�0D
��A�p~+�1%��5�p�*�� � ,�)$.����>R$#�� 2� E@7��h�B� �U:�����"���&Ҡ�C�k
�ӐlP  �x�
�p%�t��aRA �K #�� �05j�J�0 � ��B@	(�����%C<@�P� �* �&� T�� �!�G�)�c�L c�>	J� `"ՐQ�"�Ȃ
R�f6|L$�B8HL�Q
��@��C�
i<�Ca$BI� �d�# 
�d��H�3�2`dZLL|�*�3Ҹ�P.��,"dO(̦�Gt�`�r$�� kAr40 ��� �
�F �[�/
Qȓ� 0��9�0�T��e���xC	J�T$
*`�H��  4B"&����A"�BR4�EHDG3e�U�� 4�����P��P���1�h����uj�;���^�$H�3�N `Ȋ��P`E������Dv� K1
x ��"��*�N6�����>hPGd`	��,T�T.`؋
rbґ �V#��!>y�K�"�P�*�4�o�� � �����\ yAhǓ�$�� .�%ЊH D ��B ��4P@	��)�C� taTD�)�,t"��C �	@4 A �TiSE �L�����!�)��(Jcf��B�� �U@4@��L$1R��$���2�h
�(�6%�",����)�@ �	���͑��@<��e�� U$�.�0ĠA� P�A� ,y0)Y�C�pP�@T!(e #�?BW@ILBB" 
�")LN
��\"XA�<�U.	���"�Ѳ�H�A�ۨ�<(�`�J�f"
)Y ףT,���P�@I9��4)P�O�@%($J 4���@�`dC4��r
�0P@� aT
�и@�)Cë	F1�   �M�L�@ � X�{ �p&��
� 3�\�`鳄  U�+�lk0D*�L�H �P�|#`0�E a��`������D�� c��$J�#%� �ڂ-pƆ8DT�\KM`&�$(,C�$���At�� e� >�"�T� )RD�����/��$� ��D� T1L[�*�� KYP8�CLn�C0��Z� 
f�RpB2��@�P�ʃP6#�5�A�[Qd��N.E���U<`�4&��c��!M1$r�&d �\!KX � ��H��-A �i0��#b$�@�	(8�D���4�(�#��,�P����J%#@
V �m�����(��UP�@��o�6D8�@Rma�,�pB��D6�4�s.y�� �Bk' �Q%	*]D�+ddKP�01���"(LX�lDE @I,0L�D&�I�P^�" & #p�� �:���$�VN�A � D=�P8*8B�` !J�_�( C8F@2$�H��"B��X�w0�(�I22Q*X@`I0*��YH�p8!  ��2�p P   �
@1�2F I�4�P  IP���`P���P@  �"@���� �,���H � ��� ���`L$A�pc$�	l! x��8I�)G�d�� @�$	�b D�I�`*I��@X�]@��*�P�	���6T+W� ����;��$��V` p�Z�B�P �`��X3 @bq ݡ
����&T����="TB�`'G����0�u
H��#EXG L�I�,��c��<LD�q	 � � PDU� @"�� �� �`� �D��@�`�0Y�@�$ �m ��!=�[����q0b L�ʳ�!P�hN��	� 0���L
�2p6e%@%#�d�:T�J�$*�`�I�� )0��2GL�ŭq�Q]#$ۻbʠl��р$���2J�C�dΩ 6%R���!#�� j� ����!1;@aS
hCB"
dr�p�f�Bz�	R��Xj,e�V  B�	���E� �n���(�f�P�8	���FXA�)"��ٰ��8D<0wlP2`x��"@. �� �,H/�U�5"�v�$T�BC� �'���p� ��F���$�p� �,;+ =�	�'��p!�" �#�Y��[)!)�d!���8 T� ��Ay����'# �Ђ�@.(aR�
�2r�� (�M%]( $��G ��WT�LX�(2 ��P��R��� D� Ђ�� � �� �R@
�cIDK
�Br�P	� H0� ��у@( 14x6FBY|H0�B��R ��T@1� c�r!� 1	� ��s�  ��` ����&EO0�c�B4!f'�.�� �"��$4Q�n.:���p��*J+3����eP�&��
P�s���tX.���- 8� ��F�1 \]%H��� 3& ��!%b���	0
                    break;
                  }
                } while ((node = (directionLeft ? walker.next() : walker.prev())));
              }
            }
          }

          // Lean the caret to the left if possible
          if (collapsed) {
            // So this: <b>x</b><i>|x</i>
            // Becomes: <b>x|</b><i>x</i>
            // Seems that only gecko has issues with this
            if (container.nodeType === 3 && offset === 0) {
              findTextNodeRelative(true);
            }

            // Lean left into empty inline elements when the caret is before a BR
            // So this: <i><b></b><i>|<br></i>
            // Becomes: <i><b>|</b><i><br></i>
            // Seems that only gecko has issues with this.
            // Special edge case for <p><a>x</a>|<br></p> since we don't want <p><a>x|</a><br></p>
            if (container.nodeType === 1) {
              node = container.childNodes[offset];

              // Offset is after the containers last child
              // then use the previous child for normalization
              if (!node) {
                node = container.childNodes[offset - 1];
              }

              if (node && node.nodeName === 'BR' && !isPrevNode(node, 'A') &&
                !hasBrBeforeAfter(node) && !hasBrBeforeAfter(node, true)) {
                findTextNodeRelative(true, node);
              }
            }
          }

          // Lean the start of the selection right if possible
          // So this: x[<b>x]</b>
          // Becomes: x<b>[x]</b>
          if (directionLeft && !collapsed && container.nodeType === 3 && offset === container.nodeValue.length) {
            findTextNodeRelative(false);
          }

          // Set endpoint if it was normalized
          if (normalized) {
            rng['set' + (start ? 'Start' : 'End')](container, offset);
          }
        }

        collapsed = rng.collapsed;

        normalizeEndPoint(true);

        if (!collapsed) {
          normalizeEndPoint();
        }

        // If it was collapsed then make sure it still is
        if (normalized && collapsed) {
          rng.collapse(true);
        }

        return normalized;
      };
    }

    /**
     * Compares two ranges and checks if they are equal.
     *
     * @static
     * @method compareRanges
     * @param {DOMRange} rng1 First range to compare.
     * @param {DOMRange} rng2 First range to compare.
     * @return {Boolean} true/false if the ranges are equal.
     */
    RangeUtils.compareRanges = function (rng1, rng2) {
      if (rng1 && rng2) {
        // Compare native IE ranges
        if (rng1.item || rng1.duplicate) {
          // Both are control ranges and the selected element matches
          if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0)) {
            return true;
          }

          // Both are text ranges and the range matches
          if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1)) {
            return true;
          }
        } else {
          // Compare w3c ranges
          return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
        }
      }

      return false;
    };

    /**
     * Finds the closest selection rect tries to get the range from that.
     */
    function findClosestIeRange(clientX, clientY, doc) {
      var element, rng, rects;

      element = doc.elementFromPoint(clientX, clientY);
      rng = doc.body.createTextRange();

      if (!element || element.tagName == 'HTML') {
        element = doc.body;
      }

      rng.moveToElementText(element);
      rects = Tools.toArray(rng.getClientRects());

      rects = rects.sort(function (a, b) {
        a = Math.abs(Math.max(a.top - clientY, a.bottom - clientY));
        b = Math.abs(Math.max(b.top - clientY, b.bottom - clientY));

        return a - b;
      });

      if (rects.length > 0) {
        clientY = (rects[0].bottom + rects[0].top) / 2;

        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);

          return rng;
        } catch (ex) {
          // At least we tried
        }
      }

      return null;
    }

    function moveOutOfContentEditableFalse(rng, rootNode) {
      var parentElement = rng && rng.parentElement ? rng.parentElement() : null;
      return isContentEditableFalse(findParent(parentElement, rootNode, hasCeProperty)) ? null : rng;
    }

    /**
     * Gets the caret range for the given x/y location.
     *
     * @static
     * @method getCaretRangeFromPoint
     * @param {Number} clientX X coordinate for range
     * @param {Number} clientY Y coordinate for range
     * @param {Document} doc Document that x/y are relative to
     * @returns {Range} caret range
     */
    RangeUtils.getCaretRangeFromPoint = function (clientX, clientY, doc) {
      var rng, point;

      if (doc.caretPositionFromPoint) {
        point = doc.caretPositionFromPoint(clientX, clientY);
        rng = doc.createRange();
        rng.setStart(point.offsetNode, point.offset);
        rng.collapse(true);
      } else if (doc.caretRangeFromPoint) {
        rng = doc.caretRangeFromPoint(clientX, clientY);
      } else if (doc.body.createTextRange) {
        rng = doc.body.createTextRange();

        try {
          rng.moveToPoint(clientX, clientY);
          rng.collapse(true);
        } catch (ex) {
          rng = findClosestIeRange(clientX, clientY, doc);
        }

        return moveOutOfContentEditableFalse(rng, doc.body);
      }

      return rng;
    };

    RangeUtils.getSelectedNode = function (range) {
      var startContainer = range.startContainer,
        startOffset = range.startOffset;

      if (startContainer.hasChildNodes() && range.endOffset == startOffset + 1) {
        return startContainer.childNodes[startOffset];
      }

      return null;
    };

    RangeUtils.getNode = function (container, offset) {
      if (container.nodeType == 1 && container.hasChildNodes()) {
        if (offset >= container.childNodes.length) {
          offset = container.childNodes.length - 1;
        }

        container = container.childNodes[offset];
      }

      return container;
    };

    return RangeUtils;
  }
);

/**
 * Node.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is a minimalistic implementation of a DOM like node used by the DomParser class.
 *
 * @example
 * var node = new tinymce.html.Node('strong', 1);
 * someRoot.append(node);
 *
 * @class tinymce.html.Node
 * @version 3.4
 */
define(
  'tinymce.core.html.Node',
  [
  ],
  function () {
    var whiteSpaceRegExp = /^[ \t\r\n]*$/;
    var typeLookup = {
      '#text': 3,
      '#comment': 8,
      '#cdata': 4,
      '#pi': 7,
      '#doctype': 10,
      '#document-fragment': 11
    };

    // Walks the tree left/right
    function walk(node, rootNode, prev) {
      var sibling, parent, startName = prev ? 'lastChild' : 'firstChild', siblingName = prev ? 'prev' : 'next';

      // Walk into nodes if it has a start
      if (node[startName]) {
        return node[startName];
      }

      // Return the sibling if it has one
      if (node !== rootNode) {
        sibling = node[siblingName];

        if (sibling) {
          return sibling;
        }

        // Walk up the parents to look for siblings
        for (parent = node.parent; parent && parent !== rootNode; parent = parent.parent) {
          sibling = parent[siblingName];

          if (sibling) {
            return sibling;
          }
        }
      }
    }

    /**
     * Constructs a new Node instance.
     *
     * @constructor
     * @method Node
     * @param {String} name Name of the node type.
     * @param {Number} type Numeric type representing the node.
     */
    function Node(name, type) {
      this.name = name;
      this.type = type;

      if (type === 1) {
        this.attributes = [];
        this.attributes.map = {};
      }
    }

    Node.prototype = {
      /**
       * Replaces the current node with the specified one.
       *
     
�L�1��_�����/T!���\��dy�����3���{�����I��g[����q�����]��{]��_M�_�_����?.�w~��=�o8�۟����s�;����.;s�kk,ێg��F�2�gw�gC���߭���>�:�������Ue�|z�^�~ug?��G]�8���E�OF����os��=}%���fc���������JØ�Ы���`��* OpA6
-(FQ@��`�D�dL�Nh�JCRV 4����$�D�d � I �<8` ��7 7�&���0H�FP��B
@���U���H*�h�@���C2��4@� � &|> ���(Bb� Y� �
�f�۹7����;Z�L߭��G�Bm��;�����u�^���;�6ܓ���]����y���G�v���g��� Db��ń@�PG" l�p�%� ��M�M(aF�0�"�
Q`P M#i@<��@6+4��q"�l(0( ᦘ7�0��a�@�АJ2!��#!�0H`�H `���J2��(%�J&��<�|o+|��O��n�sѣ�}���ל���Gr�[�=>v�����h�^x���O?|?�����WG�>['���=���G���?��}��q����ڵ�}~V�U�[:/om���_���k�^�������ӌ"�~���b{���=���W?^�[���Ou������U�.�ͯ�߾��=�|���}�}����;�ӿ�լ�j��	��H������k���^<᭏g��ۻ/gA8�/�'GNc����?��zJ�
"FԂ�1ЀH`QRoC 0jv�c`9F`)Rd�!"��1 �2�� ["�
@ ��d��Df	�0���"R a���	A�(��`�I(P ��,��"
��� @�+�`G(� � ���2��u,� A
@�x �!1�0��0d0�"�@�1�3�&+�\�

	�@*����@m �2��BI�"���)5@#� �Er$ �+�E0b
2"
� � .[�#
B������d1M%
�U	,qpAg��(Rmā�K� �! B�yT���dwy
��H�*@!����� �P��D$�2�' ��H	AH 
����Hj	t,�8P��1p �=tL��D��P$����D@ $\"�H��a�+�2���H�%6H(!4�&TDDdapP��DB6�%K!�$A-u"�(�$�  G ����yw�,�z.�k��s�o7{o�q������>/�Q���_�{����5��=�g���_o����iXև~�۶c�;�e7���_#}:�[�zhu�����7���'���#���G�s7��w��k��ֿ��m��,���d2' 
��B� 2�$JQ ���Q� #A$� !Apa,pj�B;�ZJH@�3�A8B��B'�`� �D�� �i �; �8�x:*U�E�����2O��x�K$%��Z��:�4!� ���r�hҸ�qD	�% d��w�A	��FU�Z A�C |�0x� �T��	Q
BKW�G��v�'nj�o��qK�@#������[�?����G�S��G�����[�\��t���}�c�����~�.�6zi6^���]�&|�Wp���g�}�I[�����ϵ?�}yr��0�G>����~��9V�� AF%!�P��\C  �� �D�^bN)�
�@@
�`#�R$��l
��^_s�����s�7�;6�p����t��~�W����?��jV�����{��,��7���i������Ό}��=t�W�}
P"pP1�p4 B �L D]��	"�� XJ e4�� �l �
�@@�,�* H� " h	��
�#f��* c ��Ĺx� gD (3���(a�0 ��`�q��Dt���&��	�p�P�	�BA
�����0P�H `B.V "	!����0aF8X�dM#! �����.��.n�/��o�}�d��w�[w���?��r�F�G��G�T���Z�D�n��n�����Թ�iɺ��U�������?��������+���5�����2'��m�7���K���_��.�}Ǫ�&Ծ���true);
          node = next;
        }

        self.remove();
      },

      /**
       * Removes the node from it's parent.
       *
       * @example
       * node.remove();
       *
       * @method remove
       * @return {tinymce.html.Node} Current node that got removed.
       */
      remove: function () {
        var self = this, parent = self.parent, next = self.next, prev = self.prev;

        if (parent) {
          if (parent.firstChild === self) {
            parent.firstChild = next;

            if (next) {
              next.prev = null;
            }
          } else {
            prev.next = next;
          }

          if (parent.lastChild === self) {
            parent.lastChild = prev;

            if (prev) {
              prev.next = null;
            }
          } else {
            next.prev = prev;
          }

          self.parent = self.next = self.prev = null;
        }

        return self;
      },

      /**
       * Appends a new node as a child of the current node.
       *
       * @example
       * node.append(someNode);
       *
       * @method append
       * @param {tinymce.html.Node} node Node to append as a child of the current one.
       * @return {tinymce.html.Node} The node that got appended.
       */
      append: function (node) {
        var self = this, last;

        if (node.parent) {
          node.remove();
        }

        last = self.lastChild;
        if (last) {
          last.next = node;
          node.prev = last;
          self.lastChild = node;
        } else {
          self.lastChild = self.firstChild = node;
        }

        node.parent = self;

        return node;
      },

      /**
       * Inserts a node at a specific position as a child of the current node.
       *
       * @example
       * parentNode.insert(newChildNode, oldChildNode);
       *
       * @method insert
       * @param {tinymce.html.Node} node Node to insert as a child of the current node.
       * @param {tinymce.html.Node} refNode Reference node to set node before/after.
       * @param {Boolean} before Optional state to insert the node before the reference node.
       * @return {tinymce.html.Node} The node that got inserted.
       */
      insert: function (node, refNode, before) {
        var parent;

        if (node.parent) {
          node.remove();
        }

        parent = refNode.parent || this;

        if (before) {
          if (refNode === parent.firstChild) {
            parent.firstChild = node;
          } else {
            refNode.prev.next = node;
          }

          node.prev = refNode.prev;
          node.next = refNode;
          refNode.prev = node;
        } else {
          if (refNode === parent.lastChild) {
            parent.lastChild = node;
          } else {
            refNode.next.prev = node;
          }

          node.next = refNode.next;
          node.prev = refNode;
          refNode.next = node;
        }

        node.parent = parent;

        return node;
      },

      /**
       * Get all children by name.
       *
       * @method getAll
       * @param {String} name Name of the child nodes to collect.
       * @return {Array} Array with child nodes matchin the specified name.
       */
      getAll: function (name) {
        var self = this, node, collection = [];

        for (node = self.firstChild; node; node = walk(node, self)) {
          if (node.name === name) {
            collection.push(node);
          }
        }

        return collection;
      },

      /**
       * Removes all children of the current node.
       *
       * @method empty
       * @return {tinymce.html.Node} The current node that got cleared.
       */
      empty: function () {
        var self = this, nodes, i, node;

        // Remove all children
        if (self.firstChild) {
          nodes = [];

          // Collect the children
          for (node = self.firstChild; node; node = walk(node, self)) {
            nodes.push(node);
          }

          // Remove the children
          i = nodes.length;
          while (i--) {
     D��� ��@"y[E�P
A 20 Q
P2�O�pl5dh%&��� DA_�p��  ��`��  "4��D.�(HH*�X`F%�H�R	a�P���  `@&�KC� b�SV "�H
np 
R�� �����FtF"���F��+�X������`JM�IP@�.�2��f�y<N ?)`ڢ	�f� ��� 
#%
������:�B
�H�aA�@��`� P��p.	l$���
~�b6�9$6�O���M���o\� 2���(E���=�6�)PR+$�H� �`A! FF(�
�W�&��>��f�cX@�0!�@�n�@�  � P`�@A�� ��@8�`P���@Y�aA I��ʃ�Q�PL�J�	���A��A"�5 * �)�:  L@���5�H�Ѐ�1���(�
�@��@�( @Q�b|�L�$TVx��0����(��A� 
�� !!:�d���@U�	j	1 7���6Uj	. �E�A0��� "!�C�=�h1b�D\4g�	b+�BB��2�$�����A�5(@:צ ��$$�4K � �
�@T$
@D&F�`��j#"�
A�@T	pp
)���p&r� �B 1�AP��D-g
 +�|�	�Fb	 E�
1L����+YS�� �)�B���	�0�0�" AS��" @6B�
q�@PQ  F�`��b%�Jт�jNB�ꀤ������Ag��8Kx��x9�0E X� �Ps�����t%+@%�"�e���9� C��'.D M� / #X��F�� ���`ʄ�Tk�EHA1P �" � ��  ��@�! Ap("f��� D]B� !	�6�@��
`d`���(` 0 �	B�4ʥ�"8B ��� 
#�B�-��� ��@=�"#�b��5l):��Y�TAP,�4�0	������$J���!�	ȑ�`�U �R�0 � iZn@�b	�h�s�0��ɐv0�2 ,�����6���B�M( bvlQ_'I&.� `3��@�"2�'6	@�A�b�mx�9"�"�c<
	Z_Ǒ�(#
��
�#�D��" �"d�@���� T���, [~	��]	#� �$@�@06�`��p�B�E)/�p �&;�t ��a��@C('�"�R�d $p�� E(#bdĴε�"y�P ZC��<�$s3Y(�*�3@���V��A �   s�Fh+q�U��@r
 T�U58� �
3 �B ;	 
 ��p�
��Q � �T@��h�@� 4��p,`��A'*@ 
�B�f�"2  bD#��H+A��!	PA� 
� �PPN�$ S 0;B � (D����P�����$��V֑�0�eAS���!���� +�`�d4
� 
Bp�Xij43ȼ<N���h�� �D �@� ��]i� D  @���d�$ (.T�� �-��AO�!-��Q��VF��a S@"*	l�, �5B��$���*S�&�#<�R���R$ 4���  @�:� $F`$$0F	p��4C<$ J�!$���d+��#	� �MJz�Tt� �*�����B�G�!j1��j{����$!K�$p�+�táB*�@SqEQ7�S"�- (�=!�P�-� ��H,AB .7`T)   ��H#���8iE@�0@�P |P%@PD8 � I�
�����b� ��,`�ּ}5�> 2���B��Y�DR.5�$�2��-'5��#���;!�EX	F
0�� �aF�@���"�G�- A  �h�j�t� 9���
���3�L��+�*� �8!�` �x@#S  �
������*��%�@�>	��@& �B�P+p`�84T�G��N�I��*� v���&$�,�b��JB�UvF���Y$^bB�(���:2 �P�@ �`+L$�2@�\U�( � ��H � AAT� "h �$&
#�@Bi
��A%�u�'�	d �œPA@h 2�P 
A�S`��	  �PT�qc@�Bd��4�Ò�ɐ�� ���$B�$D�@��0���B"�FhWe,��DH �F��)����	�%) /�-� 9��@EH( ��@��!x� 09X���DV%d��/�g<�������w��ͻ����kO���?�����R��y�̸��ޯ�������\��������{���&�YY��&��N���l�'z=����<��o��/^^)���{R�����<�Z�~o݋(; #�@�Y( �X��H�U *��{
  u4Br@φ@$���>g�E��B��SS�5cIK&3= 
À���_4FA��ҭpL��L�P�U��$ r��0���:@"�5H"(��a@N!F�B�P@ !	H��p�@"�P �PQ��,,2���NL!��8&�+�Hf��1mR��'���#�.��\{�;�� 5@o��$D� :&$��(	��HG��J�N�IC$�hnT�y�����������w�>�̿z������)����������3���
�9���?7l������tn^�����������~�뻸�h��y�8����s3���C�Lk�_��������6�_�h������*n4N0�@`^aSr�%!XA���Pp���뢸�W�� P&*�d�I�İ�n �`r`�E$Ud�	�O*Ϝ�� �1��f�D�����H  1P�cp�U*�)1C��p�Fa"2�?��;�?�ϻ�����K��׹��e��bj�V�wV�K������~��������ܹz��>_��SZ�;�{�/s����o�O?�������ks����������nw�����s����޽�'W�9B��������?�P������ߗ(q��{|������N��x��_I�:��S�FE������ޫ��y���/���]�gޙ���٭Fe����_��g���^�������|�����
.0�v�R
�M���H�+aq4�6*B�)L��R@��(W��G���������׶������4]7��W_�������wk{�/!�����~���η��6�2n��{���}'��^Գ��{qh߉��|���W?�ޝ�t�������o��;Ӵ��K��S�w�� ��f`�����`) ��HѶ��BC*@���Ke��݀3�

�Xfa1@P���3)ԁD�S�GzBl@ɰl����3@j�$��]�0f8)w�  mAr0��0!� �( 1د����E�x�S&��wpQw��p���{_r��n/?7|�sA������W���Ǎ����<�o8�Y�[+n�o��=�bv���gK/Z'�/t�=�������/�o�ʟ��˯���{��.�ޤ�}�����˾]�H
�㙂��}E%�JV%�V(�ĸ!4�C�b]2r��I
�JT�T������<*P�"W"5G�D��N^C���T��@�T@h�0�,�p��b9����Ѓچ�2�� �A ��mޓ��u��<z�����j�������[e���v9�C���~�5��'���?��h����?��{��q�L�����o����x����w����G[������ݠ��l<��a��� �]���w�q��s������~���S�5���зOv��V�������ߢ)�������Ѿn��w翵O!�?�e�ߨ�����{JS����S/�O���������Π٧ｷ�o�����>�ǽ
u�_����e������}�������/����K�k�����(�~�����}�����3��:m���[���3N�᫛�wi��_sf?{.6���{������u�=+A� �@�������!��@5�� �@�� �bU�ACV���#�L�  ��@x�26Y�c- P����H�����0���jW0p�  ��)D�	@(F@'@����) `�@)�1��D&MF���o`z����A�ҋKHRf8D*�A�)��!�����0VOb2N 	�Ro%a�L�/�vi'!�� ی�d$D�	� \K M��;iڮ�r�4��-8 ��S�"���N��e�_S�����W��׹���ݒ�r���^�o�X�˻
��fo���c3��d��N��Ox�~�gc�{����w���#�;����)������ا��?�y�7��������S1������}�ҷ�9֯�T�6��Y�Th��<�1��I@0(y�h!Ge,� T@>��b2f��� ��N$���0 ���y����	��GhAR�!Z `~�I
*��)�Ab��ib�WP�@�#ᄂ3`F����t���f��?���'e�O��4�G�R���;{�s��ݹ7a�~�����A�������Z̏����}SS},uv��s��_��s���Y�׺���^Wa����?m��x����_����_�ߙғ����|��o�Kc���{j�����擬������{�?�t�q��7��wx7s������u����������ئ���e��S�5��;n�����qw�m�]�u�Woe����{g�����l�͛��[��*�����'����g�2@WH���4pWUQN=" ���h ���T�X� ��<@dE�"0��Ѐ�v ��0�A�L����(<
�@ ��t(��*$�Ņ�:9A� 
�
4
�$�	zF��AX��"�C@)��ӐQ�� 2�@rq���
 ��
��6$l���8� �9�%�[��h��9b�& 0-�@"%�K��AfX�dJPL!@�Z=E4�6�#؛ሠ�z����s�����c��ݽ������;����[��{��<�_��k�α�{CW�;߃���������k�N�Y��i�G���~��gj���^�w���_+��Yx������NǞ��+�2�6���u��\��������?0�����Cԃ("��H%�6O�l�o� fA`x:�R�5���=dCA�VkMJ¬�en2P�qs �g�����b�\�$�!������k�� ��7�2��m�^"D�"Bc��Է'�lfo�o��-a����=��i��������v�W^���>~�����_�����=�U���g����;��A?�ͅ+W��o�}���
� Q �X`d�hoO/%Ɩ
          // Find position of parent of the same type
          pos = stack.length;
          while (pos--) {
            if (stack[pos].name === name) {
              break;
            }
          }

          // Found parent
          if (pos >= 0) {
            // Close all the open elements
            for (i = stack.length - 1; i >= pos; i--) {
              name = stack[i];

              if (name.valid) {
                self.end(name.name);
              }
            }

            // Remove the open elements from the stack
            stack.length = pos;
          }
        }

        function parseAttribute(match, name, value, val2, val3) {
          var attrRule, i, trimRegExp = /[\s\u0000-\u001F]+/g;

          name = name.toLowerCase();
          value = name in fillAttrsMap ? name : decode(value || val2 || val3 || ''); // Handle boolean attribute than value attribute

          // Validate name and value pass through all data- attributes
          if (validate && !isInternalElement && isValidPrefixAttrName(name) === false) {
            attrRule = validAttributesMap[name];

            // Find rule by pattern matching
            if (!attrRule && validAttributePatterns) {
              i = validAttributePatterns.length;
              while (i--) {
                attrRule = validAttributePatterns[i];
                if (attrRule.pattern.test(name)) {
                  break;
                }
              }

              // No rule matched
              if (i === -1) {
                attrRule = null;
              }
            }

            // No attribute rule found
            if (!attrRule) {
              return;
            }

            // Validate value
            if (attrRule.validValues && !(value in attrRule.validValues)) {
              return;
            }
          }

          // Block any javascript: urls or non image data uris
          if (filteredUrlAttrs[name] && !settings.allow_script_urls) {
            var uri = value.replace(trimRegExp, '');

            try {
              // Might throw malformed URI sequence
              uri = decodeURIComponent(uri);
            } catch (ex) {
              // Fallback to non UTF-8 decoder
              uri = unescape(uri);
            }

            if (scriptUriRegExp.test(uri)) {
              return;
            }

            if (!settings.allow_html_data_urls && dataUriRegExp.test(uri) && !/^data:image\//i.test(uri)) {
              return;
            }
          }

          // Block data or event attributes on elements marked as internal
          if (isInternalElement && (name in filteredUrlAttrs || name.indexOf('on') === 0)) {
            return;
          }

          // Add attribute to list and map
          attrList.map[name] = value;
          attrList.push({
            name: name,
            value: value
          });
        }

        // Precompile RegExps and map objects
        tokenRegExp = new RegExp('<(?:' +
          '(?:!--([\\w\\W]*?)-->)|' + // Comment
          '(?:!\\[CDATA\\[([\\w\\W]*?)\\]\\]>)|' + // CDATA
          '(?:!DOCTYPE([\\w\\W]*?)>)|' + // DOCTYPE
          '(?:\\?([^\\s\\/<>]+) ?([\\w\\W]*?)[?/]>)|' + // PI
          '(?:\\/([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)>)|' + // End element
          '(?:([A-Za-z][A-Za-z0-9\\-_\\:\\.]*)((?:\\s+[^"\'>]+(?:(?:"[^"]*")|(?:\'[^\']*\')|[^>]*))*|\\/|\\s+)>)' + // Start element
          ')', 'g');

        attrRegExp = /([\w:\-]+)(?:\s*=\s*(?:(?:\"((?:[^\"])*)\")|(?:\'((?:[^\'])*)\')|([^>\s]+)))?/g;

        // Setup lookup tables for empty elements and boolean attributes
        shortEndedElements = schema.getShortEndedElements();
        selfClosing = settings.self_closing_elements || schema.getSelfClosingElements();
        fillAttrsMap = schema.getBoolAttrs();
        validate = settings.validate;
        removeInternalElements = settings.remove_internals;
        fixSelfClosing = settings.fix_self_closing;
        specialElements = schema.getSpecialElements();
        processHtml = html + '>';

        while ((matches = tokenRegExp.exec(processHtml))) { // Adds and extra '>' to keep regexps from doing catastrofic backtracking on malformed html
          // Text
          if (index < matches.index) {
            self.text(decode(html.substr(index, matches.index - index)));
          }

          if ((value = matches[6])) { // End element
            value = value.toLowerCase();

            // IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
            if (value.charAt(0) === ':') {
              value = value.substr(1);
            }

            processEndTag(value);
          } else if ((value = matches[7])) { // Start element
            // Did we consume the extra character then treat it as text
            // This handles the case with html like this: "text a<b text"
            if (matches.index + matches[0].length > html.length) {
              self.text(decode(html.substr(matches.index)));
              index = matches.index + matches[0].length;
              continue;
            }

            value = value.toLowerCase();

            // IE will add a ":" in front of elements it doesn't understand like custom elements or HTML5 elements
            if (value.charAt(0) === ':') {
              value = value.substr(1);
            }

            isShortEnded = value in shortEndedElements;

            // Is self closing tag for example an <li> after an open <li>
            if (fixSelfClosing && selfClosing[value] && stack.length > 0 && stack[stack.length - 1].name === value) {
              processEndTag(value);
            }

            // Validate element
            if (!validate || (elementRule = schema.getElementRule(value))) {
              isValidElement = true;

              // Grab attributes map and patters when validation is enabled
              if (validate) {
                validAttributesMap = elementRule.attributes;
                validAttributePatterns = elementRule.attributePatterns;
              }

              // Parse attributes
              if ((attribsValue = matches[8])) {
                isInternalElement = attribsValue.indexOf('data-mce-type') !== -1; // Check if the element is an internal element

                // If the element has internal attributes then remove it if we are told to do so
                if (isInternalElement && removeInternalElements) {
                  isValidElement = false;
                }

                attrList = [];
                attrList.map = {};

                attribsValue.replace(attrRegExp, parseAttribute);
              } else {
                attrList = [];
                attrList.map = {};
              }

              // Process attributes if validation is enabled
              if (validate && !isInternalElement) {
                attributesRequired = elementRule.attributesRequired;
                attributesDefault = elementRule.attributesDefault;
                attributesForced = elementRule.attributesForced;
                anyAttributesRequired = elementRule.removeEmptyAttrs;

                // Check if any attribute exists
                if (anyAttributesRequired && !attrList.length) {
                  isValidElement = false;
                }

                // Handle forced attributes
                if (attributesForced) {
                  i = attributesForced.length;
                  while (i--) {
                    attr = attributesForced[i];
                    name = attr.name;
                    attrValue = attr.value;

                    if (attrValue === '{$uid}') {
                      attrValue = 'mce_' + idCount++;
                    }

                    attrList.map[name] = attrValue;
                    attrList.push({ name: name, value: attrValue });
                  }
                }

                // Handle default attributes
                if (attributesDefault) {
                  i = attributesDefault.length;
                  while (i--) {
                    attr = attributesDefault[i];
                    name = attr.name;

                    if (!(name in attrList.map)) {
        �'b����ҳ&
��E�dd�J`DS�@��l!	  @p�@�`2�   ��E�@R�X P��Jj� �$E� �H��󈑥�P�J@l(�ȩ�acO4�!@�LK8)���LKB�T0@$�c""�k���Q	 BKbaID0�����$ �FP(xA h&�@�
� (�A,��fPp@���� ����Eu0D�� ��DY.��@ ��(���B- xQ��A ��	A��V S��Jd3A8U*��ACn�ƈ��c��� 5�h�6-+�XP�h(��8�D�5ho��D-�$�6�[�r)M!\`AT	HM�d�K�A"D<0ä
bH^�	����w�і�o@a㤉$������"���>��^��	@�0�0 � 3
�̔���L�D#�
��"9	'�
�"��M���&f�$��㭏# M�c���Nb�Π�C+6�� � �+��99�ر#�BG�@� /HH �Z
�*�Q���`0$t @p �,*� NPh6P�H��@PaX����2C"0( �� �E� �
d ��3��@|��B2 >L"�� �(�@�ɀ	DM� $|G"O��T
7�LDx!�� `_2�#
 I�"�
 �P  �rB�ڟ�zg��<�`""�� �DC!�u ��B-��q�d@�@
eB�4�4B�H[=�0Ѐ@e <�6v�RD��E�	��!8�UD�[Йb$�3�fOC�LLR䘒�.�!@��2H$	D�S_���&8� ��hT0"��VxX0�\�O!J<�B��1@	@BBD *�	� 	��� (+:��ED!~4�rJ���D��1�b�  ! �D�0�9l�}D��!pQ0`�`AR0��%i� 3�K�f������  ,� Є˂ �1 ��ȊH2�F�Q�@����(�<��I��DGv�B���!%�&��p6˳"�a  !�@F� P]�L(D����@���H��!�dP�B0��bY
1F��0 �1�!p��<MJ$��F�
���H����(�,������dP��*  �����<3+ }v���ġ�
cP`�H��f`jt" D��LAbDT 
*����u� �E�L9H�`  4���Q(4M*��H\ �\ ��:K�@�IĜ@0���0J�I"�1�	� $��a�����l ��4&V �h%M$�*s	��5% �Pʊ&17
$��yXy��#v/`�A�&���� ˓�0ah��E���)Ƞ�%$08&p ��=i ,� �G��1Fh��n@�	7>H��bu� 8 � ��X ����� DG0 � �� HH����» 
�  �� F(�("���#�
@�^�@��@�!(�	@�aH"���@"���%��R�f���Ѝ	�C4B��L.R��&�*%��%
ZG�RFD2&�������XC T	����҅ dd B�z"X�@(�׏(X�X��j�5  e�P����(�n�Ѐ"�LI�   @@�C������
�%�� Ed��@,!*L HK�z�#��������3h^h�`��\�D0���A)�����7�� ����xZ0ڐ(	��  (5�@P@F� ��l0&&���-�eM ���$�(T"h��r@���$��W���D$�%�� ��Z,RR�Q"0�:�t"�Z�,�#��5@sƏ� D4 � �AbH����bސFk�d��	�X��ֈ�Ә�@b �+JTT]��%�&D2�hZ�	��a�D=)�0X� {4 �Tdf��01S,	�H2�% 5bd�
��.D$O�` [(@]�C�0`0B � ��X[΀��rJ	�����dB8Z��AD��@(Q�p���j8� S�Ɉ8�D1�0h�  @�`p�@�@y� ���H�c"l@ ��C����+C T�b�v"��j �J��!p�&�.�� : � �*10?v"`pA@ P
��C! J�@�m���{����KSP��I��0�(((+bh�&�i��� ��o�8����f� �&�5<�!�UB��D��bS�EB03! P  0�
T���BVQd��P�`	   �@�dQA�((�L *@4
�� �A3`�aa���Y�	/` RBɹ������+������`��@Q E6�H��a���T)("]��h ��P��Kd	  Q�D|�(���epD��7�X@�)��(eo
�P�@�� T22�F�3F��`
�ǐ3D�b�wZ�E HB��g�"&h��G0VlQ�:�L@�j����JU@z$-�z#E *�""^��`
C�C0#q� ��� F �;� �����Pj��M�����$�  ��.�$P �M��@� �E�0#�!Q��� �25\�yV�)0�@��c-� �A��!$@@AQ� �#�#`���ᶃf��i?ܶ� � 1Q��  MlT �0�  ��})u&II" �*a.�SD@-8��,Д�A��@�%�� #&X ` 1D�W�q"�a@K 艊�ܿ� W��$P
C ���D��+�s�IF%�b�_M���[���B��P�������A��e��C���1� ��D2��b{��͈!"�'n
�B��S�I �I�� � �C ��i�9�<�!� @�#	 3�4
�MDS� 
b�&h%�P�rs��XH0/ � JB�H���]D( �	�EAR:\L�)E#��J*B�#�|DBB\!#)�Xh�@�00�X�!�<L @Ì$0�, 0R܂H�`���d�(��(0<��j�A@<Uk
BS!��I�b @�xF ^X�q�R����|k�	J<p�"qU���LEG`� �@Qi� '��p�)��`A0*f[�� �P*����̑!D���&����!3P � �'˂):A�! Rt�I �yO\�a C8��444mABơD�� F		�N$F4!"��D$
S01 �a�H�,^�A#�b��A�C4hR���,#�0��)�	&W�6j�qh�VD�
��E�Z���@]�p�Aa9��& �����d����v�C9@�ܠvqj�#��Q$���z� ��w	H�� !G�*\@�G�H�~��'���vF��@�06�0Ԇ�4���b AiP#��T*��l"
tTJഘt���9�Ԑ�`PP a J�	䀅@ P&<���Y:=4đP�5���6VcGn>�������_w?�{ngT���R����y����~��e������Or�𿻎p5n�߰s��\�g���l֓27ޙ������������m}�����n�{Z�7����y��nY�+��ߙ��?��m��ӻ��>���^|��Ǎr�����.���_��?x	�6�;�D��ޞGܹݟ�}~��_���}�������O~��}��e��.�Ծ����x]�6ng��_��m���Ԕ���w�7^��?���xcdX��p�|��g��!�t��M��	
�
/�$�A����Zb40T�>�p r�@�*AT ŀ !q8!�L�C�U� � �q�D��2(�Ic0`�Y / ��� h/2TɃ� X�d�@Ρ`I� �%�PP� DYa�@X Al��Uh�03��@&����H�%�C���� @ r,b��f"¤ Ձ(L�@�����
�&4!L@��"
 E$���`�B,2�&�P@##Q1d��(D
��kT����b��/����q��f
w2��
z�
�2�6a$
!Ma���A � DH	/,c�4 d$ՁARG6I�H���LN �Ha�}�+)1-���1z��#���
 �@�Q)!�B���@ �d�b	@�~���$HEU@
��B ��(g=bB2b�<�G ��X9HK�� �E�� �
�F�J �)�0	D@�2� * �0 ��@���J``��wi�Ґ���p �\/`��($@ �
 �b�&`DCP�K� fAb$EA0IS�T�щ@!D1 E!�HT
�@`�Xa1�� � ��ǜ~�����uV���X͞m�;]�_�uSB��<���;��x^������
 0�
��$�%L�
h��(� � TC� ��d`x�y�F�"@ �~ �BPeA"� \� d�� _R�G�1��,�@d�LHB �B`k+d��*Q�H�B��6@�*��@ A0(
6�B��[P@T�  . q�w  M��{#�w����M�zW"�_���,��>�t����^�����޷����G�/�7W��/��;�W�1�?]����W]g����Y1��Ѧ󯯿������ ���7���v�I[-sm����ϫ?�N�.��O{�kɷ����w�;�Q������_��w������?�����o�n=�K�&����oޔI:�����<?��7}ߌ�{��N�������_��o�~*ƒL�x��答n�o:�缃��&%��R7&�D��!L+�� l �C��1j%��Ьn
��p�`��P j(���J�D 0�G�B�h1�p� QDa�A�s 
!A@G
D=dr@��`

            for (i = 0; i < parents.length - 1; i++) {
              if (schema.isValidChild(currentNode.name, parents[i].name)) {
                tempNode = self.filterNode(parents[i].clone());
                currentNode.append(tempNode);
              } else {
                tempNode = currentNode;
              }

              for (childNode = parents[i].firstChild; childNode && childNode != parents[i + 1];) {
                nextNode = childNode.next;
                tempNode.append(childNode);
                childNode = nextNode;
              }

              currentNode = tempNode;
            }

            if (!newParent.isEmpty(nonEmptyElements, whitespaceElements)) {
              parent.insert(newParent, parents[0], true);
              parent.insert(node, newParent);
            } else {
              parent.insert(node, parents[0], true);
            }

            // Check if the element is empty by looking through it's contents and special treatment for <p><br /></p>
            parent = parents[0];
            if (parent.isEmpty(nonEmptyElements, whitespaceElements) || hasOnlyChild(parent, 'br')) {
              parent.empty().remove();
            }
          } else if (node.parent) {
            // If it's an LI try to find a UL/OL for it or wrap it
            if (node.name === 'li') {
              sibling = node.prev;
              if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
                sibling.append(node);
                continue;
              }

              sibling = node.next;
              if (sibling && (sibling.name === 'ul' || sibling.name === 'ul')) {
                sibling.insert(node, sibling.firstChild, true);
                continue;
              }

              node.wrap(self.filterNode(new Node('ul', 1)));
              continue;
            }

            // Try wrapping the element in a DIV
            if (schema.isValidChild(node.parent.name, 'div') && schema.isValidChild('div', node.name)) {
              node.wrap(self.filterNode(new Node('div', 1)));
            } else {
              // We failed wrapping it, then remove or unwrap it
              if (specialElements[node.name]) {
                node.empty().remove();
              } else {
                node.unwrap();
              }
            }
          }
        }
      }

      /**
       * Runs the specified node though the element and attributes filters.
       *
       * @method filterNode
       * @param {tinymce.html.Node} Node the node to run filters on.
       * @return {tinymce.html.Node} The passed in node.
       */
      self.filterNode = function (node) {
        var i, name, list;

        // Run element filters
        if (name in nodeFilters) {
          list = matchedNodes[name];

          if (list) {
            list.push(node);
          } else {
            matchedNodes[name] = [node];
          }
        }

        // Run attribute filters
        i = attributeFilters.length;
        while (i--) {
          name = attributeFilters[i].name;

          if (name in node.attributes.map) {
            list = matchedAttributes[name];

            if (list) {
              list.push(node);
            } else {
              matchedAttributes[name] = [node];
            }
          }
        }

        return node;
      };

      /**
       * Adds a node filter function to the parser, the parser will collect the specified nodes by name
       * and then execute the callback ones it has finished parsing the document.
       *
       * @example
       * parser.addNodeFilter('p,h1', function(nodes, name) {
       *  for (var i = 0; i < nodes.length; i++) {
       *   console.log(nodes[i].name);
       *  }
       * });
       * @method addNodeFilter
       * @method {String} name Comma separated list of nodes to collect.
       * @param {function} callback Callback function to execute once it has collected nodes.
       */
      self.addNodeFilter = function (name, callback) {
        each(explode(name), function (name) {
          var list = nodeFilters[name];

          if (!list) {
            nodeFilters[name] = list = [];
          }

          list.push(callback);
        });
      };

      /**
       * Adds a attribute filter function to the parser, the parser will collect nodes that has the specified attributes
       * and then execute the callback ones it has finished parsing the document.
       *
       * @example
       * parser.addAttributeFilter('src,href', function(nodes, name) {
       *  for (var i = 0; i < nodes.length; i++) {
       *   console.log(nodes[i].name);
       *  }
       * });
       * @method addAttributeFilter
       * @method {String} name Comma separated list of nodes to collect.
       * @param {function} callback Callback function to execute once it has collected nodes.
       */
      self.addAttributeFilter = function (name, callback) {
        each(explode(name), function (name) {
          var i;

          for (i = 0; i < attributeFilters.length; i++) {
            if (attributeFilters[i].name === name) {
              attributeFilters[i].callbacks.push(callback);
              return;
            }
          }

          attributeFilters.push({ name: name, callbacks: [callback] });
        });
      };

      /**
       * Parses the specified HTML string into a DOM like node tree and returns the result.
       *
       * @example
       * var rootNode = new DomParser({...}).parse('<b>text</b>');
       * @method parse
       * @param {String} html Html string to sax parse.
       * @param {Object} args Optional args object that gets passed to all filter functions.
       * @return {tinymce.html.Node} Root node containing the tree.
       */
      self.parse = function (html, args) {
        var parser, rootNode, node, nodes, i, l, fi, fl, list, name, validate;
        var blockElements, startWhiteSpaceRegExp, invalidChildren = [], isInWhiteSpacePreservedElement;
        var endWhiteSpaceRegExp, allWhiteSpaceRegExp, isAllWhiteSpaceRegExp, whiteSpaceElements;
        var children, nonEmptyElements, rootBlockName;

        args = args || {};
        matchedNodes = {};
        matchedAttributes = {};
        blockElements = extend(makeMap('script,style,head,html,body,title,meta,param'), schema.getBlockElements());
        nonEmptyElements = schema.getNonEmptyElements();
        children = schema.children;
        validate = settings.validate;
        rootBlockName = "forced_root_block" in args ? args.forced_root_block : settings.forced_root_block;

        whiteSpaceElements = schema.getWhiteSpaceElements();
        startWhiteSpaceRegExp = /^[ \t\r\n]+/;
        endWhiteSpaceRegExp = /[ \t\r\n]+$/;
        allWhiteSpaceRegExp = /[ \t\r\n]+/g;
        isAllWhiteSpaceRegExp = /^[ \t\r\n]+$/;

        function addRootBlocks() {
          var node = rootNode.firstChild, next, rootBlockNode;

          // Removes whitespace at beginning and end of block so:
          // <p> x </p> -> <p>x</p>
          function trim(rootBlockNode) {
            if (rootBlockNode) {
              node = rootBlockNode.firstChild;
              if (node && node.type == 3) {
                node.value = node.value.replace(startWhiteSpaceRegExp, '');
              }

              node = rootBlockNode.lastChild;
              if (node && node.type == 3) {
                node.value = node.value.replace(endWhiteSpaceRegExp, '');
              }
            }
          }

          // Check if rootBlock is valid within rootNode for example if P is valid in H1 if H1 is the contentEditabe root
          if (!schema.isValidChild(rootNode.name, rootBlockName.toLowerCase())) {
            return;
          }

          while (node) {
            next = node.next;

            if (node.type == 3 || (node.type == 1 && node.name !== 'p' &&
              !blockElements[node.name] && !node.attr('data-mce-type'))) {
              if (!rootBlockNode) {
                // Create a new root block element
                rootBlockNode = createNode(rootBlockName, 1);
                rootBlockNode.attr(settinn��~��߮�ʻ>��<󵖫�����?S�������ܳ-�����[�?�z��������_�ӷ�L����iL����(mo�ʻ�l�j���|�|�^਄���N�~�ܬ��z9�_E��r����f�)T�H d�0 e��D!S �I�	�  �, В���@X�C$�H�`PeI, � 61 I$�G�*#
��@�P����! g�BD�(qr�|" B� *�@̈́<�>�=HtP�Ƀ��  _ !8dp��aG� 0t�
�@�h�8!���x#@��   AA�
�@�舢��%	j&� �d�2el�)Hb@!:A�@�D ������ '��((! P�-Ř� ��Z�q����4َ��p��z���ϵE��'�z�{��߻�����ڛ޻y_������!~J��,�=��~��ӻ�S^�����'��߮��
�D�6 HbD
�T�2F������pe6i�h$�F:DtC�ED "ԅ���(D��,0���	l�рh�;߯�V�����i�����[�mj�ӳv��~%���'��%��Z~���ޫ>��.~�����Ú����!7����˻{���a��wz.C;������Wǫ�����Ǖ�M��e���K�R�B0�V `@��]Hǁ�!0�}�R� �-�R8�PV�FBfb{� h  �'@n��A(� �L)4�i	jBA�Y5 %i�Bu�+ �3�iF� ��PD�z���\ (E�"(L�y�H   &H0D	��(T�(����Xp BF��ڐ �
pY�� �+#���R0� BA 	9���	

� 0�s��( ���QQ:8'%�#��f������;Crۘ��"�-���`w�eݱ��a����K���z����sJv�������\�o���������?�;�w�?�����O����U����t��
{����
�"! �(��6�9,~�"8 ,r0�L+>����{3޷���l)w���ZY;�a7W���ݢ��L�j:�9ͱ���/|NJ�������_9�w�ݨv���=��k��3����?��U�����=��?_$*W�F��j���N����7(����_�������㌲��?���	:�ޟ؋_2�w��c{��>������o+���m�H��O���^ܥ���%�{�U"���;����ҹ�������y}���~���~ݖ����?�,^�����{���wZ�$�8/0�&�`T�.b�	�eX��L1-�6�(( � d t0�.0 � �� ��#\
 � �D  XR$�jH9T"�I��K.R� ��؂�P� B��E@M��!L5�v"���a����%���ם�=�B���c�����Po��m�K��f'��x�ߟ������%M���w��wX�7Ǜ��W��Y��^^�����h�c��O������vE�p�n{�tȨ��Z��W�Qw]c��M���нe�,�(S����%0��U��*!C �0 �I&��5P�P B�`}�A(�Z�Q�J� �#0� �\+ ��2��1�2��TPW
��` p E�R, E���U�$��,6q��˸�XIt�@F�'�)�>�D2b�A V R�`ċD�0R	�)S@Ȃʀc�
숰AT�@$}�E�B]��X)�((��X1L:!�����0���"�#��D#�a��R HR6�X���N�7�z�+�tF=|�^�c���K�46��S��ޫ��O���-�g�?�w{������^�qg�A�+���}K��}ϳf��9����f;UsG�*ק?���?�m�Dy_d���>��;/���D^j ��A~� ���c�� 
�PHP( e���D� d�'ئ@(�� 8�>�"V��8��9�7{�������w~�_���mkkz���۳X�&�\78�m|_y#�+�����Ҫ����9��[��������m�Hk���n�sH�Χ���~����W�O�Y|�vydc��\�./�#��r}��>��};���_��=��G��G�:]_|m�/m'�����ݯ�����wqϬs~ן|x�u�zo%��i'��'��F�^R�a��?���[o���U_-��~����]����f:��]2��V�v��>q��0�!�J�Z�,@��B�� � �; �8A!�'p�p�4P�B'�@�0�,��P��d�B*&�0  t au�����Vcd�ࡸ �  �NB�"bI��N P�xpO�w��z�[/�3�JTn����x���}
$A�'w1/�s~��ۓ:�����^���/����0��V{uGOA\���LT�c��y�/aW_/���ht���7�^鹴$4G��ח��7�G�l5%�SOb�1	A q
A"D�{EV?�@0)ȅ�p
 DL *�U�V'��h�<)JBD7� �'K ��0[IH�	v�	��	��HLp$���a4�H��h�dE(�]�((A����|am� P"j�y��B���YЁ#H��$ xNM�,#L���T΍�Q��0f��p  ��LԞ����@i�� �M
.�U7ä��od���޻��J�BV��^����N���;|y���~�����	�r�Y�������{][����Q���[�������C�� &@�@R,U��8����0(H����� H �0��E��#0d�@ ,��0�Nؠ �8b&8D�LD� 0�/גD@�� * �$07$`����&���0p��jk�؅Գ�W�����vm��fm��eg{mO��fgRO4��S��z	�?zV�������_|��/m�__��(�o�K������Q?3˩��������ݜ����B����|���.���ϳ��rs�/?�G�v;��/}��wz[�w�����m�G�w����ק���OuM�[�~+�?e�jU���ӻ�ys6~v7���������^���2Y���x��v���<�O��_�;�M��~{~I�M����7_������u�E�?�2�~���.��bhS�L N@�z0���$ ��"�#��F� �� 
DLa �X6�?z<q@�
 b ��Lp@���0%, � �d�c"�xpG(�Ir�� * !�X��J����l9�/�~��bw/n���Y���W��G���_�� o����S�ݯ������Ύ�O���ү�}�����;�u���g�m��[
�]��G�7w��W������\���w���{�j��Vw�����^����O�����o|�]���������?��ⶬ��۟�[�>�J5?�\�d�/ǵ�����n�:����/��9����{�_�����ߟw{7~����p�Y�������~�Ҟ���Ng�����?��Ox��i?��+���o���O�p�o�m�n�O��C���껏�����۟�Ҷ:�������5��
                      }
                    }
                  }
                }

                // Trim start white space
                // Removed due to: #5424
                /*textNode = node.prev;
                if (textNode && textNode.type === 3) {
                  text = textNode.value.replace(startWhiteSpaceRegExp, '');

                  if (text.length > 0)
                    textNode.value = text;
                  else
                    textNode.remove();
                }*/
              }

              // Check if we exited a whitespace preserved element
              if (isInWhiteSpacePreservedElement && whiteSpaceElements[name]) {
                isInWhiteSpacePreservedElement = false;
              }

              // Handle empty nodes
              if (elementRule.removeEmpty || elementRule.paddEmpty) {
                if (node.isEmpty(nonEmptyElements, whiteSpaceElements)) {
                  if (elementRule.paddEmpty) {
                    paddEmptyNode(settings, node);
                  } else {
                    // Leave nodes that have a name like <a name="name">
                    if (!node.attributes.map.name && !node.attributes.map.id) {
                      tempNode = node.parent;

                      if (blockElements[node.name]) {
                        node.empty().remove();
                      } else {
                        node.unwrap();
                      }

                      node = tempNode;
                      return;
                    }
                  }
                }
              }

              node = node.parent;
            }
          }
        }, schema);

        rootNode = node = new Node(args.context || settings.root_name, 11);

        parser.parse(html);

        // Fix invalid children or report invalid children in a contextual parsing
        if (validate && invalidChildren.length) {
          if (!args.context) {
            fixInvalidChildren(invalidChildren);
          } else {
            args.invalid = true;
          }
        }

        // Wrap nodes in the root into block elements if the root is body
        if (rootBlockName && (rootNode.name == 'body' || args.isRootContent)) {
          addRootBlocks();
        }

        // Run filters only when the contents is valid
        if (!args.invalid) {
          // Run node filters
          for (name in matchedNodes) {
            list = nodeFilters[name];
            nodes = matchedNodes[name];

            // Remove already removed children
            fi = nodes.length;
            while (fi--) {
              if (!nodes[fi].parent) {
                nodes.splice(fi, 1);
              }
            }

            for (i = 0, l = list.length; i < l; i++) {
              list[i](nodes, name, args);
            }
          }

          // Run attribute filters
          for (i = 0, l = attributeFilters.length; i < l; i++) {
            list = attributeFilters[i];

            if (list.name in matchedAttributes) {
              nodes = matchedAttributes[list.name];

              // Remove already removed children
              fi = nodes.length;
              while (fi--) {
                if (!nodes[fi].parent) {
                  nodes.splice(fi, 1);
                }
              }

              for (fi = 0, fl = list.callbacks.length; fi < fl; fi++) {
                list.callbacks[fi](nodes, list.name, args);
              }
            }
          }
        }

        return rootNode;
      };

      // Remove <br> at end of block elements Gecko and WebKit injects BR elements to
      // make it possible to place the caret inside empty blocks. This logic tries to remove
      // these elements and keep br elements that where intended to be there intact
      if (settings.remove_trailing_brs) {
        self.addNodeFilter('br', function (nodes) {
          var i, l = nodes.length, node, blockElements = extend({}, schema.getBlockElements());
          var nonEmptyElements = schema.getNonEmptyElements(), parent, lastParent, prev, prevName;
          var whiteSpaceElements = schema.getNonEmptyElements();
          var elementRule, textNode;

          // Remove brs from body element as well
          blockElements.body = 1;

          // Must loop forwards since it will otherwise remove all brs in <p>a<br><br><br></p>
          for (i = 0; i < l; i++) {
            node = nodes[i];
            parent = node.parent;

            if (blockElements[node.parent.name] && node === parent.lastChild) {
              // Loop all nodes to the left of the current node and check for other BR elements
              // excluding bookmarks since they are invisible
              prev = node.prev;
              while (prev) {
                prevName = prev.name;

                // Ignore bookmarks
                if (prevName !== "span" || prev.attr('data-mce-type') !== 'bookmark') {
                  // Found a non BR element
                  if (prevName !== "br") {
                    break;
                  }

                  // Found another br it's a <br><br> structure then don't remove anything
                  if (prevName === 'br') {
                    node = null;
                    break;
                  }
                }

                prev = prev.prev;
              }

              if (node) {
                node.remove();

                // Is the parent to be considered empty after we removed the BR
                if (parent.isEmpty(nonEmptyElements, whiteSpaceElements)) {
                  elementRule = schema.getElementRule(parent.name);

                  // Remove or padd the element depending on schema rule
                  if (elementRule) {
                    if (elementRule.removeEmpty) {
                      parent.remove();
                    } else if (elementRule.paddEmpty) {
                      paddEmptyNode(settings, parent);
                    }
                  }
                }
              }
            } else {
              // Replaces BR elements inside inline elements like <p><b><i><br></i></b></p>
              // so they become <p><b><i>&nbsp;</i></b></p>
              lastParent = node;
              while (parent && parent.firstChild === lastParent && parent.lastChild === lastParent) {
                lastParent = parent;

                if (blockElements[parent.name]) {
                  break;
                }

                parent = parent.parent;
              }

              if (lastParent === parent && settings.padd_empty_with_br !== true) {
                textNode = new Node('#text', 3);
                textNode.value = '\u00a0';
                node.replace(textNode);
              }
            }
          }
        });
      }


      self.addAttributeFilter('href', function (nodes) {
        var i = nodes.length, node;

        var appendRel = function (rel) {
          var parts = rel.split(' ').filter(function (p) {
            return p.length > 0;
          });
          return parts.concat(['noopener']).sort().join(' ');
        };

        var addNoOpener = function (rel) {
          var newRel = rel ? Tools.trim(rel) : '';
          if (!/\b(noopener)\b/g.test(newRel)) {
            return appendRel(newRel);
          } else {
            return newRel;
          }
        };

        if (!settings.allow_unsafe_link_target) {
          while (i--) {
            node = nodes[i];
            if (node.name === 'a' && node.attr('target') === '_blank') {
              node.attr('rel', addNoOpener(node.attr('rel')));
            }
          }
        }
      });

      // Force anchor names closed, unless the setting "allow_html_in_named_anchor" is explicitly included.
      if (!settings.allow_html_in_named_anchor) {
        self.addAttributeFilter('id,name', function (nodes) {
          var i = nodes.length, sibling, prevSibling, parent, node;

          while (i--) {
            node = nodes[i];
            if (node.name === 'a' && node.firstChild && !node.attr('href')) {
              parent = node.parent;

              // Move children after current node
              sibling = node.lastChild;
              do {
                prevSibling = sibling.prev;
                parent.insert(sibling, node);
                sibling = prevSibling;
              } while (sibling);
            }
          }
        });
      }

      if (settings.fix_list_elements) {
        self.addNodeFilter('ul,ol', function (nodes) {
          var i = nodes.length, node, parentNode;

          while (i--) {
            node = nodes[i];
            parentNode = node.parent;

            if (parentNode.name === 'ul' || parentNode.name === 'ol') {
              if (node.prev && node.prev.name === 'li') {
                node.prev.append(node);
              } else {
                var li = new Node('li', 1);
                li.attr('style', 'list-style-type: none');
                node.wrap(li);
              }
            }
          }
        });
      }

      if (settings.validate && schema.getValidClasses()) {
        self.addAttributeFilter('class', function (nodes) {
          var i = nodes.length, node, classList, ci, className, classValue;
          var validClasses = schema.getValidClasses(), validClassesMap, valid;

          while (i--) {
            node = nodes[i];
            classList = node.attr('class').split(' ');
            classValue = '';

            for (ci = 0; ci < classList.length; ci++) {
              className = classList[ci];
              valid = false;

              validClassesMap = validClasses['*'];
              if (validClassesMap && validClassesMap[className]) {
                valid = true;
              }

              validClassesMap = validClasses[node.name];
              if (!valid && validClassesMap && validClassesMap[className]) {
                valid = true;
              }

              if (valid) {
                if (classValue) {
                  classValue += ' ';
                }

                classValue += className;
              }
            }

            if (!classValue.length) {
              classValue = null;
            }

            node.attr('class', classValue);
          }
        });
      }
    };
  }
);

/**
 * Writer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to write HTML tags out it can be used with the Serializer or the SaxParser.
 *
 * @class tinymce.html.Writer
 * @example
 * var writer = new tinymce.html.Writer({indent: true});
 * var parser = new tinymce.html.SaxParser(writer).parse('<p><br></p>');
 * console.log(writer.getContent());
 *
 * @class tinymce.html.Writer
 * @version 3.4
 */
define(
  'tinymce.core.html.Writer',
  [
    "tinymce.core.html.Entities",
    "tinymce.core.util.Tools"
  ],
  function (Entities, Tools) {
    var makeMap = Tools.makeMap;

    /**
     * Constructs a new Writer instance.
     *
     * @constructor
     * @method Writer
     * @param {Object} settings Name/value settings object.
     */
    return function (settings) {
      var html = [], indent, indentBefore, indentAfter, encode, htmlOutput;

      settings = settings || {};
      indent = settings.indent;
      indentBefore = makeMap(settings.indent_before || '');
      indentAfter = makeMap(settings.indent_after || '');
      encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
      htmlOutput = settings.element_format == "html";

      return {
        /**
         * Writes the a start element such as <p id="a">.
         *
         * @method start
         * @param {String} name Name of the element.
         * @param {Array} attrs Optional attribute array or undefined if it hasn't any.
         * @param {Boolean} empty Optional empty state if the tag should end like <br />.
         */
        start: function (name, attrs, empty) {
          var i, l, attr, value;

          if (indent && indentBefore[name] && html.length > 0) {
            value = html[html.length - 1];

            if (value.length > 0 && value !== '\n') {
 ��^��s���ݤ���̲�������S�_���/��~�ŷG)}_��_���������zw{�ֻ���<y�=��,v�#���?����翫���դ�������������?|����?�}u?}�[-c��� �;[]��A#����=;B�!�pѐ����b���0�f��0
��B恊@8�5�A���mD�a��dBPi��@�� �"���o�[��1�����d �� p�&��f���F2@�OPiD��+��Z�&L���>C�	�6�Ml�Pd
�>zF  '<H^�AHb��
�	)D�L�,!Ax����Zo����F��;�~�.�y5w�ڟ�������>��;b$���.�W�/������om�͕������Ӿ����K�����}�v�z�����������t��So�+�?�����^ѝ��R���S0W�Q� �� �0
Xm
 h!HH$U�6#*?T*`�����b�/@g;���"G��2��^q8�1𧳒0�C	0�g}2�m% a����0���5�s6C'��:KE\D�@�T
)BD�*2JȺ "1S�N�u1�J6.GCf��Tl�$1�l��^�W@< �B(b�ݩ��8�@rf6 @�t*�pP0 t?�>�����q?:rVGL۱}}ߞJ_��$��?;����u���^�]�Ǘ��s{��c������ƿ������������]��������;�]����s��{{�|ܯ������������O�_�����0�=Z�~��,a+g�zs� �1�C�0�`�0�XH?��7�IPb$��JI" 6]�IIQ"�+D ��I��
>���A'���A�&  �	,	ic� AC���9r�LXH1���Co�6w��{�=R���o=�����[�v���/��W���)��b__�W�F�ί��]��U�?���4���;K����[��.��������{������~���_������o�]���k���׻�����~��^�����l{��ײ}��{�g;��y�7����2n����|O:�w���?�S}?���j�.����O���j��=���sݺ�Kh���mI�����߼�G>������_���$�~��_�v�m[��)�����[ ��)� 0�s�P��%:k2���ak@A+3�.�&.4�HU�DB� ����Q�4C2¯�Q�U�~�@����� ��KDΰ8P LJ�
Ub4z?&b"���ʋ:��r� ��T�L�I/?~k������}'{����ޜ���9#�}����z�Vp���i{�T�]�\7���H}���o���O�4<[����nv��߭����;�������~��/�����:��k}��;��7������Q�_Q���{Ր	A���$�&!���<,� D��@��N)�`yW�GY�^P 
�@Np�%y"� � ċ[�,필��5�dT��M��0��5t�A�y�7`���B��0wQ@�.�Q��U��2�
�TGFm��"��x���٧A��&@/4P(ؠ���X��D+Lq��J���s(��#n��Ϻ��C�C��TR
�Hb�C @4Xl�8�,�CP~�|���_���o6���=�-g��/ھ�=�����e����Wի?�}g�w�g^S��ϛ�ϟ��v�f����s)s�;�/��6���zs�X�mc�߻�ݿ�����<�z��������o�o|�VO���fŏ�߭>��ͯ���.��?_�v����Vݯ���e�����k�kf��,�i�:z�u{�w��頳|������������O��$�~��L^?�������~��k����k\�W�������l����~�\vxP97m������f��"TT,n� ��E$B�0��H������Dl�3R,��l��p��fd�m�C��4���pn�&h����Lh�$�K�B�
$����ע���V�>��u��7���޾;Iw�0���_������S�z��~���N_�G������o�&����v��8�w���ͫ����NF߾z��;��ջ���w�e���{?�ﵟ���>7����+=��f�:b
�Ё� Х X�Pg��
3���Q���xB��l��d:U%H�KRx�r֘2��8��t 
%�ㄋ��3��u�@ Ѕ�� b�d!s��lL�s/(r\MhAQ��	�d�Z��*]�ED��1��ECt� ��ݏN������~a��R��}�ڿ�}ģ��/�����O���\o�w��ӽktV~��?'����^9���������������^�1��4O׿�������k�M��^�K٦�_zOw�����W,z���L�,��-x��?�@�(3d��D�h,4I�
� �>��A��x��-	2���E5!@ơ)��9�e̍S����Y�A�Y�� �a9E�h+�Aխ�5�dV&���U�H3���J@P6�,�b�����e���M�[�~����{o.���{��������h'�����
��g�j;�s���Y���o��|����e�պ��'�������(۸���ꜭ�_��o����]s�C3��������~���n<��o��߾���i��������ot=���w�?}gg�]��_r����}8��*�wk��������������_o~k�Z��������.�}�]�3�ݩ쏭��|��������M_����������ݯ�m������^�z�b������&��|�2�S�cQB�Z��Bp� ��  *D�b"$$%��J"R4�� ?m3J��3��������
�].i�:��i q	��[Q�M���"gH(���*z����*b`Rbq�=��R B \0D�W (� �&(U5�MN��DW@s�(F )&n �  \�F@�@!ҠD�:0t�wSW ��2
)�3��	91Q�c7���EuP���,\a(P���I��w�����}�~y��;�d���Gս�m�^T������~����������yo~z^��˸y{��n�/����Ş����~�����]�M������/��l��^��`��'^����K������T���;������M���w<���_�'ټ���G>�Q��7��}����Z��y����#qo����%>��_n�w����������nn�v)����=���~�=�mo�{��4�݋�o�?�����g{�����W��W��`��SRy��5�����@i"����Ed��h�+� ��Q�Z�4���Q���K�z� B�d()����  `x"�T �(�byT$$[H&�B@�0݀��(V���hN �E�'�RF&��S eq<�Qg����i<�������s�߹������ת�U�3�����t_��������m��������{w����W{N�wi�;����ݿ��[�����}�O�+���_�������n����?�~~[�ﴗ��%y
�;%B�u6Ca$5�A(��FRP�"Ա��-� ���O��� �:a�(��HX!�����H ���T (�	W�p \@���v-#����̧�c^9��@4y���?�4
4t�O�p�J��3�`,�hO@40
% F$�A�d�`���!G1I���B�8E�y�rO���q�&4Wk�j�O�-7w��g�~�/3�&�O����}����\�w�}�2�z���/��WH�q,���1i��+u���<�����S��=��_��������n�a����Ǧ����_�?ɯ>�f��k�:��}���R�..��
';�^P�	,VMs
��w����b����ְ��wK����e�g�v���V��{��z���z�g������i��u'?��c!�]�-��c�=F�<���o�y
Q�_$X�T
�N� J� 
`rXB	��0��P��G��}��XCP��D"�0�DD�J��@$������	�]����,N�_�j�;�jmu���{�{��>;�U�<��o���Kr���ެ����w���k�ht�ܿ�ߵ}.���k]w�����{��{K�~��>�/��~�=�S�����1}{�R������?9��2�A��a��
	���F�
��dEBu ���
�� K(��Y��T�n��+P����/�N��*c(O#� ���ȥSxc}�������/��϶�y����{�����ƶ�������[>�7�Wh���뾼s��*���z���������������;���K2~Gj���y�|�_����=scW��W�4>|x����}������}�ϯ�����o�j�~N���z�>�w�{z�f�~I����G�i�_�y�]\��������ۏ����{W�
'~N�{�D�� ̓8X� �C�$�j�B��0 L�{G���S `������߮��}�+��o�K˭�����s��66�e��~����}/���o_��i�ֲ�~�m�`�ߺW����K_�S��ad���'����[����M��n�������������������������D�~���P@���W
 &��҄G��Î)pZF�-�H%�R�B!�{\b.�Mʌ�ULQQ�*p7��^hn�"�j�B��G���,�%� J��O#�E�pLІ����C�,b��

P2+��(�HAUj
R�'b�Wy/X -z�3�@���)VG��Z��2����圐�QՁɥ�W�ϒ�;7?�u*�nG���|���ٵo��Z�[g-��W��g�t���q�o-w�s֛�4��Ǿ<���o�}+s�3�7�������|2��Ӓ���n����?������o�뀰��_n���l��g�v�}��f; 1�*�V��T
���T)J( d@��#)�
H`�B }�ˎ	]q@��T:GH��~:����Q�=~�'��Q���U~>�������6ܟ����J������y�=������{�|�>���M���`���I|��l��Sڷ��Ϛ�;�lr�_o=�^���O/�����ω_ٽ�o{�~��������k뿬�޽ʆ����N��g�KS��[��.�����b+�ռ�m��*C+����糿O��ݭ������)��޽���ҵ�(7��7����v��������嶏g-�O�.�����tz�N�k{�o����h���`��n��tX.`�:(�p�ƲqK젚d0B2�C@r[`d�`!��B� 
8A�0R@�W���B�t�B1�s�~���(�	 a�-��OU*p�`;k��AUY 
q���F������d�� vd@�"��'�l��C��8@ĭrBa�)T�&1�'$5�VI� �A_<��!U.*LD��&�R��  �% �� ����" �$�d6pLL���@�P��n��� � A�Bc�`�G`��2��<΂
89�A=�@����(�á�(J�� ����V�(:���FBH�q*�<!x�A`�y�� 
hO������{=�n��_]����~mO�?�c���������?W�+^���&D?����?�g�����[����t;u�O�w�c���<������;w�w�����������w�|�?�����o������w�x�[uߟS�����o�k�>�������'잓��a�?=���;=��
3XD-� �:�n)�lR+��/���d�W��[�.m��&���I ��<�@ ���"��	1d��**��
��DD���28�BHY`�H}�0B��6D'6Ѐ� �&@ޏP)��nDൔ �3H�k�F�P4-�p�*���b�V� ��[@ D.�B�S�� ������V 
����xۻ6�O�5{����Ǯ���~o�?{���tk���.�q���������O���W_����_���O���~���z��^���������u���<�����3������}�������{��Vם��z` ױh dl$Uo���B�h�TDA��U�RE�Ѡ�0vpǋ!L� �	�IQc�;�)? ���kC%�X@4S�fT##B�B�n�	ܶ����p�F"�D��Ú0
$t(�@������59�vU�!&�{@#\��>��4ԭ���@�1mü0��"�O��s�$�"�I�U����S����s��ۭ����ͽ3ܪ���k�������}ek���﻾���h{?�ڻ�}V���r��߉�ُ���v�÷vk�_�'z������E{:�_����s>ڳ����/�w�,��[�o�:{���>���}>�[-OS�_�ቚ����?�������5�v|��֯�l��qw�����j��yn����t��o�o���?�ut�y�o���6�[_�Կ��O�r����y����{�j�n�Srg�ߏ<�)�g��d(�b� �  nM ^��� dE�!��D\�#npT$�b�
 �y&a2A�D%��A�D#�q,����� �M�PD�BР	I�(lS�j%�"d0A�V�h8��4d 
�
L^���"��Ȳ�) ���ed�E$ $���f?��2�������.��=��t�{�����/�o���v��������=��~������>�����q��٧���չL)7�����o��w^Oy����y��Ꞿk}��i��}s������[	�߼ύ����75�s�}p��=O��l����[k�-�������mz���,���߉��݊Y���;�&�m����������o=���{]wJ��}��������뽟0��W���9���k���s���^��s~���l�� b *ah���@2va�@
K9�(�KV�,P*V*���hP�� e{Jp�	�q�V��k���n� 6T☒x`�� k�(X%Oh]I|m�!���(�3C[hD�f`��$(��?�p����_
6�~W�������?�^!����f�v��t���/�O�{�>�~���?��w�2~O�����V�p%������m��9�<�O��Ͽ����_����%}��Pڿ��o�����������b�� X8��$�0��d�(D�
�ʠx(�Iv!���.̠� �|`���2&(�Aǹ�c2*�e2����sU�&���-�IC
="��A�cli�w�V�Qz��y�*F�Qq6�
��#IE5"�&�R�B Skϟ���ow�߼�E���+�\�>������wj�>o���j���g��A�K^����x珨�m��E�~ɺ���/�'_��w<֛u���3�����������H=x�w�Ҽw��ڛ��oL�\�[}��糼�~f	��c�I5B"�RaE��| S� v� +K��%���HZ*0ig,�bdtA��PQ�H�H��@�BH4b�BЍ�fDB��M� Ǩ�cw L4BP�-�8�F��F��<.�s
�Z^�������������Tc��Oy�����k�1?��������z�Y������E�ÿ��y��3\�o�m�O�-����]��]t�3F�����O��Sos�޿k��$b��ފϻ5���!������������L�����y�Z�g������o��O����-��_}��ܳt�3��g�����w�����?��[��y���%�f�}=w~׿:��	����Z�O��;�W���.���/�[7�ǭ���ׯ:�����@�lZ����x�0V8j���=�� �U��(%�O<P� ����)��e4�[��Ւ*P�
�0Rq�FqT�@B���� 2ĲW
������I"�2����|�2�@b ���h
�8�P \ "���N^�dH LMoG� G	��}_����_���G��P���}�_ϯ��ݭ�b���W��}�D�}�o��Km����=1�C�>���ڍ�����^�F��Ͽ�o���{��u��������Ο��ۥ�A�������]��?Fk�J7�O�;��q���&2L��
F)!J �"4@%� cC�D��  �-R�AFZ��$�&��:K� �!0#ԩ���H�i[��@EP��H7 �0�~@ \��B�	j@ 7�	Ъ3+N��"g}��2����s��;/��6��Z��{��R���L��?��^o��[�twO��v��@<l��}����+��O$߭�|�W�<�������.�퟼��g�կ9��D��}�_�ݳ�޽���z^���������h�}�vI������O���g�;�:���}��~?�����SE~�?��/��i�f��߹W�|���N����}���o�_k��潏�ݷ4�-�������������\��{������~�/O�b���k���i��� �ƚ ��,�B@�F����r�0	��+"3�@ ��鄏D!F�U����Rs�`�6R�@se��I�8 "��k�k�0A	$K�#(�'��v��)�^�rPy�T�V�����h������Vyu���ۏ�z��ՉK��O^I-?��OA������7�u�?�ݿ}�F���|�{���}XϺ}��>���k�z�<)��}�N7�����>�/8y�|��~�w����_U�z�N�6���{7ݙ���3*�1*���`��" &^�F�,B�)
�0%*�� D��!7�� 0�zh�p�B�B���@����u2@!�����ܕ��|.g���QKgy��|�f�.}�^:�ε������?�?1y�����׫wpIv��_�����oO����߼Up��V�}}���o�w���5����a�w�������n��{���o�����#%,La ���9U��7 
�
\��x����޷i��#���ϥ��M���������~��w�e_���ҭ_iP����Ok�����ϵ�qV���/�����M����ί�v�o��~�T��o�Jw7����[����{�����녖o���P G�I�j�k/��8�@@�	' �WX�U?�� R�(@�j�ː�%t}J�����k� KpH��9,0�tNCd �4� ȴ�P��<�+���|�)� a�8 ����D�*�� �@)�3ًv���\>!�r��9����W�(țP ��BQ���GH0�(#-,H��� #h(R�@D��(l� `Rb!FĄf��0ǈL�2�@G���HB\�` N��a�K�{���{��K�����wu4����6������5X���S-���~�y�g�����3ԍ=�h���u~�}���<�>��2������{2���5�*x�������~�o>g7/������~�5�l����w*\s*<!--\s*\*\/)\s*[\r\n]*/gi, '')
            .replace(/\s*(\/\*\s*\]\]>\s*\*\/(-->)?|\s*\/\/\s*\]\]>(-->)?|\/\/\s*(-->)?|\]\]>|\/\*\s*-->\s*\*\/|\s*-->\s*)\s*$/g, '');
        }

        while (i--) {
          node = nodes[i];
          value = node.firstChild ? node.firstChild.value : '';

          if (name === "script") {
            // Remove mce- prefix from script elements and remove default type since the user specified
            // a script element without type attribute
            type = node.attr('type');
            if (type) {
              node.attr('type', type == 'mce-no/type' ? null : type.replace(/^mce\-/, ''));
            }

            if (value.length > 0) {
              node.firstChild.value = '// <![CDATA[\n' + trim(value) + '\n// ]]>';
            }
          } else {
            if (value.length > 0) {
              node.firstChild.value = '<!--\n' + trim(value) + '\n-->';
            }
          }
        }
      });

      // Convert comments to cdata and handle protected comments
      htmlParser.addNodeFilter('#comment', function (nodes) {
        var i = nodes.length, node;

        while (i--) {
          node = nodes[i];

          if (node.value.indexOf('[CDATA[') === 0) {
            node.name = '#cdata';
            node.type = 4;
            node.value = node.value.replace(/^\[CDATA\[|\]\]$/g, '');
          } else if (node.value.indexOf('mce:protected ') === 0) {
            node.name = "#text";
            node.type = 3;
            node.raw = true;
            node.value = unescape(node.value).substr(14);
          }
        }
      });

      htmlParser.addNodeFilter('xml:namespace,input', function (nodes, name) {
        var i = nodes.length, node;

        while (i--) {
          node = nodes[i];
          if (node.type === 7) {
            node.remove();
          } else if (node.type === 1) {
            if (name === "input" && !("type" in node.attributes.map)) {
              node.attr('type', 'text');
            }
          }
        }
      });

      // Remove internal data attributes
      htmlParser.addAttributeFilter(
        'data-mce-src,data-mce-href,data-mce-style,' +
        'data-mce-selected,data-mce-expando,' +
        'data-mce-type,data-mce-resize',

        function (nodes, name) {
          var i = nodes.length;

          while (i--) {
            nodes[i].attr(name, null);
          }
        }
      );

      // Return public methods
      return {
        /**
         * Schema instance that was used to when the Serializer was constructed.
         *
         * @field {tinymce.html.Schema} schema
         */
        schema: schema,

        /**
         * Adds a node filter function to the parser used by the serializer, the parser will collect the specified nodes by name
         * and then execute the callback ones it has finished parsing the document.
         *
         * @example
         * parser.addNodeFilter('p,h1', function(nodes, name) {
         *  for (var i = 0; i < nodes.length; i++) {
         *   console.log(nodes[i].name);
         *  }
         * });
         * @method addNodeFilter
         * @method {String} name Comma separated list of nodes to collect.
         * @param {function} callback Callback function to execute once it has collected nodes.
         */
        addNodeFilter: htmlParser.addNodeFilter,

        /**
         * Adds a attribute filter function to the parser used by the serializer, the parser will
         * collect nodes that has the specified attributes
         * and then execute the callback ones it has finished parsing the document.
         *
         * @example
         * parser.addAttributeFilter('src,href', function(nodes, name) {
         *  for (var i = 0; i < nodes.length; i++) {
         *   console.log(nodes[i].name);
         *  }
         * });
         * @method addAttributeFilter
         * @method {String} name Comma separated list of nodes to collect.
         * @param {function} callback Callback function to execute once it has collected nodes.
         */
        addAttributeFilter: htmlParser.addAttributeFilter,

        /**
         * Serializes the specified browser DOM node into a HTML string.
         *
         * @method serialize
         * @param {DOMNode} node DOM node to serialize.
         * @param {Object} args Arguments option that gets passed to event handlers.
         */
        serialize: function (node, args) {
          var self = this, impl, doc, oldDoc, htmlSerializer, content, rootNode;

          // Explorer won't clone contents of script and style and the
          // selected index of select elements are cleared on a clone operation.
          if (Env.ie && dom.select('script,style,select,map').length > 0) {
            content = node.innerHTML;
            node = node.cloneNode(false);
            dom.setHTML(node, content);
          } else {
            node = node.cloneNode(true);
          }

          // Nodes needs to be attached to something in WebKit/Opera
          // This fix will make DOM ranges and make Sizzle happy!
          impl = document.implementation;
          if (impl.createHTMLDocument) {
            // Create an empty HTML document
            doc = impl.createHTMLDocument("");

            // Add the element or it's children if it's a body element to the new document
            each(node.nodeName == 'BODY' ? node.childNodes : [node], function (node) {
              doc.body.appendChild(doc.importNode(node, true));
            });

            // Grab first child or body element for serialization
            if (node.nodeName != 'BODY') {
              node = doc.body.firstChild;
            } else {
              node = doc.body;
            }

            // set the new document in DOMUtils so createElement etc works
            oldDoc = dom.doc;
            dom.doc = doc;
          }

          args = args || {};
          args.format = args.format || 'html';

          // Don't wrap content if we want selected html
          if (args.selection) {
            args.forced_root_block = '';
          }

          // Pre process
          if (!args.no_events) {
            args.node = node;
            self.onPreProcess(args);
          }

          // Parse HTML
          rootNode = htmlParser.parse(trim(args.getInner ? node.innerHTML : dom.getOuterHTML(node)), args);
          trimTrailingBr(rootNode);

          // Serialize HTML
          htmlSerializer = new Serializer(settings, schema);
          args.content = htmlSerializer.serialize(rootNode);

          // Replace all BOM characters for now until we can find a better solution
          if (!args.cleanup) {
            args.content = Zwsp.trim(args.content);
            args.content = args.content.replace(/\uFEFF/g, '');
          }

          // Post process
          if (!args.no_events) {
            self.onPostProcess(args);
          }

          // Restore the old document if it was changed
          if (oldDoc) {
            dom.doc = oldDoc;
          }

          args.node = null;

          return args.content;
        },

        /**
         * Adds valid elements rules to the serializers schema instance this enables you to specify things
         * like what elements should be outputted and what attributes specific elements might have.
         * Consult the Wiki for more details on this format.
         *
         * @method addRules
         * @param {String} rules Valid elements rules string to add to schema.
         */
        addRules: function (rules) {
          schema.addValidElements(rules);
        },

        /**
         * Sets the valid elements rules to the serializers schema instance this enables you to specify things
         * like what elements should be outputted and what attributes specific elements might have.
         * Consult the Wiki for more details on this format.
         *
         * @method setRules
         * @param {String} rules Valid elements rules string.
         */
        setRules: function (rules) {
          schema.setValidElements(rules);
        },

        onPreProcess: function (args) {
          if (editor) {
            editor.fire('PreProcess', args);
          }
        },

        onPostProcess: function (args) {
          if (editor) {
            editor.fire('PostProcess', args);
          }
        },

        /**
         * Adds a temporary internal attribute these attributes will get removed on undo and
         * when getting contents out of the editor.
         *
         * @method addTempAttr
         * @param {String} name string
         */
        addTempAttr: addTempAttr,

        // Internal
        trimHtml: trimHtml,
        getTrimmedContent: getTrimmedContent,
        trimContent: trimContent
      };
    };
  }
);

/**
 * VK.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This file exposes a set of the common KeyCodes for use. Please grow it as needed.
 */
define(
  'tinymce.core.util.VK',
  [
    "tinymce.core.Env"
  ],
  function (Env) {
    return {
      BACKSPACE: 8,
      DELETE: 46,
      DOWN: 40,
      ENTER: 13,
      LEFT: 37,
      RIGHT: 39,
      SPACEBAR: 32,
      TAB: 9,
      UP: 38,

      modifierPressed: function (e) {
        return e.shiftKey || e.ctrlKey || e.altKey || this.metaKeyPressed(e);
      },

      metaKeyPressed: function (e) {
        // Check if ctrl or meta key is pressed. Edge case for AltGr on Windows where it produces ctrlKey+altKey states
        return (Env.mac ? e.metaKey : e.ctrlKey && !e.altKey);
      }
    };
  }
);

/**
 * ClientRect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions for working with client rects.
 *
 * @private
 * @class tinymce.geom.ClientRect
 */
define(
  'tinymce.core.geom.ClientRect',
  [
  ],
  function () {
    var round = Math.round;

    function clone(rect) {
      if (!rect) {
        return { left: 0, top: 0, bottom: 0, right: 0, width: 0, height: 0 };
      }

      return {
        left: round(rect.left),
        top: round(rect.top),
        bottom: round(rect.bottom),
        right: round(rect.right),
        width: round(rect.width),
        height: round(rect.height)
      };
    }

    function collapse(clientRect, toStart) {
      clientRect = clone(clientRect);

      if (toStart) {
        clientRect.right = clientRect.left;
      } else {
        clientRect.left = clientRect.left + clientRect.width;
        clientRect.right = clientRect.left;
      }

      clientRect.width = 0;

      return clientRect;
    }

    function isEqual(rect1, rect2) {
      return (
        rect1.left === rect2.left &&
        rect1.top === rect2.top &&
        rect1.bottom === rect2.bottom &&
        rect1.right === rect2.right
      );
    }

    function isValidOverflow(overflowY, clientRect1, clientRect2) {
      return overflowY >= 0 && overflowY <= Math.min(clientRect1.height, clientRect2.height) / 2;

    }

    function isAbove(clientRect1, clientRect2) {
      if ((clientRect1.bottom - clientRect1.height / 2) < clientRect2.top) {
        return true;
      }

      if (clientRect1.top > clientRect2.bottom) {
        return false;
      }

      return isValidOverflow(clientRect2.top - clientRect1.bottom, clientRect1, clientRect2);
    }

    function isBelow(clientRect1, clientRect2) {
      if (clientRect1.top > clientRect2.bottom) {
        return true;
      }

      if (clientRect1.bottom < clientRect2.top) {
        return false;
      }

      return isValidOverflow(clientRect2.bottom - clientRect1.top, clientRect1, clientRect2);
    }

    function isLeft(clientRect1, clientRect2) {
      return clientRect1.left < clientRect2.left;
    }

    function isRight(clientRect1, clientRect2) {
      return clientRect1.right > clientRect2.right;
    }

    function compare(clientRect1, clientRect2) {
      if (isAbove(clientRect1, clientRect2)) {
        return -1;
      }

      if (isBelow(clientRect1, clientRect2)) {
        return 1;
      }

      if (isLeft(clientRect1, clientRect2)) {
        return -1;
      }

      if (isRight(clientRect1, clientRect2)) {
        return 1;
      }

      return 0;
    }

    function containsXY(clientRect, clientX, clientY) {
      return (
        clientX >= clientRect.left &&
        clientX <= clientRect.right &&
        clientY >= clientRect.top &&
        clientY <= clientRect.bottom
      );
    }

    return {
      clone: clone,
      collapse: collapse,
      isEqual: isEqual,
      isAbove: isAbove,
      isBelow: isBelow,
      isLeft: isLeft,
      isRight: isRight,
      compare: compare,
      containsXY: containsXY
    };
  }
);

/**
 * RangePoint.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.RangePoint',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.geom.ClientRect'
  ],
  function (Arr, ClientRect) {
    var isXYWithinRange = function (clientX, clientY, range) {
      if (range.collapsed) {
        return false;
      }

      return Arr.foldl(range.getClientRects(), function (state, rect) {
        return state || ClientRect.containsXY(rect, clientX, clientY);
      }, false);
    };

    return {
      isXYWithinRange: isXYWithinRange
    };
  }
);
/**
 * ControlSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles control selection of elements. Controls are elements
 * that can be resized and needs to be selected as a whole. It adds custom resize handles
 * to all browser engines that support properly disabling the built in resize logic.
 *
 * @class tinymce.dom.ControlSelection
 */
define(
  'tinymce.core.dom.ControlSelection',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangePoint',
    'tinymce.core.Env',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Tools',
    'tinymce.core.util.VK'
  ],
  function (Fun, NodeType, RangePoint, Env, Delay, Tools, VK) {
    var isContentEditableFalse = NodeType.isContentEditableFalse;
    var isContentEditableTrue = NodeType.isContentEditableTrue;

    function getContentEditableRoot(root, node) {
      while (node && node != root) {
        if (isContentEditableTrue(node) || isContentEditableFalse(node)) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    }

    var isImage = function (elm) {
      return elm && elm.nodeName === 'IMG';
    };

    var isEventOnImageOutsideRange = function (evt, range) {
      return isImage(evt.target) && !RangePoint.isXYWithinRange(evt.clientX, evt.clientY, range);
    };

    var contextMenuSelectImage = function (editor, evt) {
      var target = evt.target;

      if (isEventOnImageOutsideRange(evt, editor.selection.getRng()) && !evt.isDefaultPrevented()) {
        evt.preventDefault();
        editor.selection.select(target);
      }
    };

    return function (selection, editor) {
      var dom = editor.dom, each = Tools.each;
      var selectedElm, selectedElmGhost, resizeHelper, resizeHandles, selectedHandle, lastMouseDownEvent;
      var startX, startY, selectedElmX, selectedElmY, startW, startH, ratio, resizeStarted;
      var width, height, editableDoc = editor.getDoc(), rootDocument = document, isIE = Env.ie && Env.ie < 11;
      var abs = Math.abs, round = Math.round, rootElement = editor.getBody(), startScrollWidth, startScrollHeight;

      // Details about each resize handle how to scale etc
      resizeHandles = {
        // Name: x multiplier, y multiplier, delta size x, delta size y
        /*n: [0.5, 0, 0, -1],
        e: [1, 0.5, 1, 0],
        s: [0.5, 1, 0, 1],
        w: [0, 0.5, -1, 0],*/
        nw: [0, 0, -1, -1],
        ne: [1, 0, 1, -1],
        se: [1, 1, 1, 1],
        sw: [0, 1, -1, 1]
      };

      // Add CSS for resize handles, cloned element and selected
      var rootClass = '.mce-content-body';
      editor.contentStyles.push(
        rootClass + ' div.mce-resizehandle {' +
        'position: absolute;' +
        'border: 1px solid black;' +
        'box-sizing: box-sizing;' +
        'background: #FFF;' +
        'width: 7px;' +
        'height: 7px;' +
        'z-index: 10000' +
        '}' +
        rootClass + ' .mce-resizehandle:hover {' +
        'background: #000' +
        '}' +
        rootClass + ' img[data-mce-selected],' + rootClass + ' hr[data-mce-selected] {' +
        'outline: 1px solid black;' +
        'resize: none' + // Have been talks about implementing this in browsers
        '}' +
        rootClass + ' .mce-clonedresizable {' +
        'position: absolute;' +
        (Env.gecko ? '' : 'outline: 1px dashed black;') + // Gecko produces trails while resizing
        'opacity: .5;' +
        'filter: alpha(opacity=50);' +
        'z-index: 10000' +
        '}' +
        rootClass + ' .mce-resize-helper {' +
        'background: #555;' +
        'background: rgba(0,0,0,0.75);' +
        'border-radius: 3px;' +
        'border: 1px;' +
        'color: white;' +
        'display: none;' +
        'font-family: sans-serif;' +
        'font-size: 12px;' +
        'white-space: nowrap;' +
        'line-height: 14px;' +
        'margin: 5px 10px;' +
        'padding: 5px;' +
        'position: absolute;' +
        'z-index: 10001' +
        '}'
      );

      function isResizable(elm) {
        var selector = editor.settings.object_resizing;

        if (selector === false || Env.iOS) {
          return false;
        }

        if (typeof selector != 'string') {
          selector = 'table,img,div';
        }

        if (elm.getAttribute('data-mce-resize') === 'false') {
          return false;
        }

        if (elm == editor.getBody()) {
          return false;
        }

        return editor.dom.is(elm, selector);
      }

      function resizeGhostElement(e) {
        var deltaX, deltaY, proportional;
        var resizeHelperX, resizeHelperY;

        // Calc new width/height
        deltaX = e.screenX - startX;
        deltaY = e.screenY - startY;

        // Calc new size
        width = deltaX * selectedHandle[2] + startW;
        height = deltaY * selectedHandle[3] + startH;

        // Never scale down lower than 5 pixels
        width = width < 5 ? 5 : width;
        height = height < 5 ? 5 : height;

        if (selectedElm.nodeName == "IMG" && editor.settings.resize_img_proportional !== false) {
          proportional = !VK.modifierPressed(e);
        } else {
          proportional = VK.modifierPressed(e) || (selectedElm.nodeName == "IMG" && selectedHandle[2] * selectedHandle[3] !== 0);
        }

        // Constrain proportions
        if (proportional) {
          if (abs(deltaX) > abs(deltaY)) {
            height = round(width * ratio);
            width = round(height / ratio);
          } else {
            width = round(height / ratio);
            height = round(width * ratio);
          }
        }

        // Update ghost size
        dom.setStyles(selectedElmGhost, {
          width: width,
          height: height
        });

        // Update resize helper position
        resizeHelperX = selectedHandle.startPos.x + deltaX;
        resizeHelperY = selectedHandle.startPos.y + deltaY;
        resizeHelperX = resizeHelperX > 0 ? resizeHelperX : 0;
        resizeHelperY = resizeHelperY > 0 ? resizeHelperY : 0;

        dom.setStyles(resizeHelper, {
          left: resizeHelperX,
          top: resizeHelperY,
          display: 'block'
        });

        resizeHelper.innerHTML = width + ' &times; ' + height;

        // Update ghost X position if needed
        if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
          dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
        }

        // Update ghost Y position if needed
        if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
          dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
        }

        // Calculate how must overflow we got
        deltaX = rootElement.scrollWidth - startScrollWidth;
        deltaY = rootElement.scrollHeight - startScrollHeight;

        // Re-position the resize helper based on the overflow
        if (deltaX + deltaY !== 0) {
          dom.setStyles(resizeHelper, {
            left: resizeHelperX - deltaX,
            top: resizeHelperY - deltaY
          });
        }

        if (!resizeStarted) {
          editor.fire('ObjectResizeStart', { target: selectedElm, width: startW, height: startH });
          resizeStarted = true;
        }
      }

      function endGhostResize() {
        resizeStarted = false;

        function setSizeProp(name, value) {
          if (value) {
            // Resize by using style or attribute
            if (selectedElm.style[name] || !editor.schema.isValid(selectedElm.nodeName.toLowerCase(), name)) {
              dom.setStyle(selectedElm, name, value);
            } else {
              dom.setAttrib(selectedElm, name, value);
            }
          }
        }

        // Set width/height properties
        setSizeProp('width', width);
        setSizeProp('height', height);

        dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
        dom.unbind(editableDoc, 'mouseup', endGhostResize);

        if (rootDocument != editableDoc) {
          dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
          dom.unbind(rootDocument, 'mouseup', endGhostResize);
        }

        // Remove ghost/helper and update resize handle positions
        dom.remove(selectedElmGhost);
        dom.remove(resizeHelper);

        if (!isIE || selectedElm.nodeName == "TABLE") {
          showResizeRect(selectedElm);
        }

        editor.fire('ObjectResized', { target: selectedElm, width: width, height: height });
        dom.setAttrib(selectedElm, 'style', dom.getAttrib(selectedElm, 'style'));
        editor.nodeChanged();
      }

      function showResizeRect(targetElm, mouseDownHandleName, mouseDownEvent) {
        var position, targetWidth, targetHeight, e, rect;

        hideResizeRect();
        unbindResizeHandleEvents();

        // Get position and size of target
        position = dom.getPos(targetElm, rootElement);
        selectedElmX = position.x;
        selectedElmY = position.y;
        rect = targetElm.getBoundingClientRect(); // Fix for Gecko offsetHeight for table with caption
        targetWidth = rect.width || (rect.right - rect.left);
        targetHeight = rect.height || (rect.bottom - rect.top);

        // Reset width/height if user selects a new image/table
        if (selectedElm != targetElm) {
          detachResizeStartListener();
          selectedElm = targetElm;
          width = height = 0;
        }

        // Makes it possible to disable resizing
        e = editor.fire('ObjectSelected', { target: targetElm });

        if (isResizable(targetElm) && !e.isDefaultPrevented()) {
          each(resizeHandles, function (handle, name) {
            var handleElm;

            function startDrag(e) {
              startX = e.screenX;
              startY = e.screenY;
              startW = selectedElm.clientWidth;
              startH = selectedElm.clientHeight;
              ratio = startH / startW;
              selectedHandle = handle;

              handle.startPos = {
                x: targetWidth * handle[0] + selectedElmX,
                y: targetHeight * handle[1] + selectedElmY
              };

              startScrollWidth = rootElement.scrollWidth;
              startScrollHeight = rootElement.scrollHeight;

              selectedElmGhost = selectedElm.cloneNode(true);
              dom.addClass(selectedElmGhost, 'mce-clonedresizable');
              dom.setAttrib(selectedElmGhost, 'data-mce-bogus', 'all');
              selectedElmGhost.contentEditable = false; // Hides IE move layer cursor
              selectedElmGhost.unSelectabe = true;
              dom.setStyles(selectedElmGhost, {
                left: selectedElmX,
              �g���^��������e��ee��[���/��A���_�
[r{����^k��ثy��:5������,�������ȥ��������������u�y���������^�~��~�^g��2_�����v���^-�V����󷗙"�g~r�L��Yں5����?����:�5�[U�{v���{��^��r��z����"��wk|?�δ�BwM~������������믎D�^�]��霽����}���<��~��6�+��{�/����&����������{����E��e-�{op��h�������5i޳K�����-�;�����m���n�t�
c~G�������z�U�)�����]�zŽ��|����)����߲�{[���~�^~��x4�S<�ٯVw�ÿ�����s�ny��ͺ'��S��e���vkB��O��ٽ�	�K����i����6�lmu���׻���&�>_޳���A���i?�c����w$������������W�^�S����h���������rg����m{&�������w����W~���ݪ���;��ǽ��^��?;���n�>����tion attachEvent(elm, name, func) {
        if (elm && elm.attachEvent) {
          elm.attachEvent('on' + name, func);
        }
      }

      function detachEvent(elm, name, func) {
        if (elm && elm.detachEvent) {
          elm.detachEvent('on' + name, func);
        }
      }

      function resizeNativeStart(e) {
        var target = e.srcElement, pos, name, corner, cornerX, cornerY, relativeX, relativeY;

        pos = target.getBoundingClientRect();
        relativeX = lastMouseDownEvent.clientX - pos.left;
        relativeY = lastMouseDownEvent.clientY - pos.top;

        // Figure out what corner we are draging on
        for (name in resizeHandles) {
          corner = resizeHandles[name];

          cornerX = target.offsetWidth * corner[0];
          cornerY = target.offsetHeight * corner[1];

          if (abs(cornerX - relativeX) < 8 && abs(cornerY - relativeY) < 8) {
            selectedHandle = corner;
            break;
          }
        }

        // Remove native selection and let the magic begin
        resizeStarted = true;
        editor.fire('ObjectResizeStart', {
          target: selectedElm,
          width: selectedElm.clientWidth,
          height: selectedElm.clientHeight
        });
        editor.getDoc().selection.empty();
        showResizeRect(target, name, lastMouseDownEvent);
      }

      function preventDefault(e) {
        if (e.preventDefault) {
          e.preventDefault();
        } else {
          e.returnValue = false; // IE
        }
      }

      function isWithinContentEditableFalse(elm) {
        return isContentEditableFalse(getContentEditableRoot(editor.getBody(), elm));
      }

      function nativeControlSelect(e) {
        var target = e.srcElement;

        if (isWithinContentEditableFalse(target)) {
          preventDefault(e);
          return;
        }

        if (target != selectedElm) {
          editor.fire('ObjectSelected', { target: target });
          detachResizeStartListener();

          if (target.id.indexOf('mceResizeHandle') === 0) {
            e.returnValue = false;
            return;
          }

          if (target.nodeName == 'IMG' || target.nodeName == 'TABLE') {
            hideResizeRect();
            selectedElm = target;
            attachEvent(target, 'resizestart', resizeNativeStart);
          }
        }
      }

      function detachResizeStartListener() {
        detachEvent(selectedElm, 'resizestart', resizeNativeStart);
      }

      function unbindResizeHandleEvents() {
        for (var name in resizeHandles) {
          var handle = resizeHandles[name];

          if (handle.elm) {
            dom.unbind(handle.elm);
            delete handle.elm;
          }
        }
      }

      function disableGeckoResize() {
        try {
          // Disable object resizing on Gecko
          editor.getDoc().execCommand('enableObjectResizing', false, false);
        } catch (ex) {
          // Ignore
        }
      }

      function controlSelect(elm) {
        var ctrlRng;

        if (!isIE) {
          return;
        }

        ctrlRng = editableDoc.body.createControlRange();

        try {
          ctrlRng.addElement(elm);
          ctrlRng.select();
          return true;
        } catch (ex) {
          // Ignore since the element can't be control selected for example a P tag
        }
      }

      editor.on('init', function () {
        if (isIE) {
          // Hide the resize rect on resize and reselect the image
          editor.on('ObjectResized', function (e) {
            if (e.target.nodeName != 'TABLE') {
              hideResizeRect();
              controlSelect(e.target);
            }
          });

          attachEvent(rootElement, 'controlselect', nativeControlSelect);

          editor.on('mousedown', function (e) {
            lastMouseDownEvent = e;
          });
        } else {
          disableGeckoResize();

          // Sniff sniff, hard to feature detect this stuff
          if (Env.ie >= 11) {
            // Needs to be mousedown for drag/drop to work on IE 11
            // Needs to be click on Edge to properly select images
            editor.on('mousedown click', function (e) {
              var target = e.target, nodeName = target.nodeName;

              if (!resizeStarted && /^(TABLE|IMG|HR)$/.test(nodeName) && !isWithinContentEditableFalse(target)) {
                if (e.button !== 2) {
                  editor.selection.select(target, nodeName == 'TABLE');
                }

                // Only fire once since nodeChange is expensive
                if (e.type == 'mousedown') {
                  editor.nodeChanged();
                }
              }
            });

            editor.dom.bind(rootElement, 'mscontrolselect', function (e) {
              function delayedSelect(node) {
                Delay.setEditorTimeout(editor, function () {
                  editor.selection.select(node);
                });
              }

              if (isWithinContentEditableFalse(e.target)) {
                e.preventDefault();
                delayedSelect(e.target);
                return;
              }

              if (/^(TABLE|IMG|HR)$/.test(e.target.nodeName)) {
                e.preventDefault();

                // This moves the selection from being a control selection to a text like selection like in WebKit #6753
                // TODO: Fix this the day IE works like other browsers without this nasty native ugly control selections.
                if (e.target.tagName == 'IMG') {
                  delayedSelect(e.target);
                }
              }
            });
          }
        }

        var throttledUpdateResizeRect = Delay.throttle(function (e) {
          if (!editor.composing) {
            updateResizeRect(e);
          }
        });

        editor.on('nodechange ResizeEditor ResizeWindow drop', throttledUpdateResizeRect);

        // Update resize rect while typing in a table
        editor.on('keyup compositionend', function (e) {
          // Don't update the resize rect while composing since it blows away the IME see: #2710
          if (selectedElm && selectedElm.nodeName == "TABLE") {
            throttledUpdateResizeRect(e);
          }
        });

        editor.on('hide blur', hideResizeRect);
        editor.on('contextmenu', Fun.curry(contextMenuSelectImage, editor));

        // Hide rect on focusout since it would float on top of windows otherwise
        //editor.on('focusout', hideResizeRect);
      });

      editor.on('remove', unbindResizeHandleEvents);

      function destroy() {
        selectedElm = selectedElmGhost = null;

        if (isIE) {
          detachResizeStartListener();
          detachEvent(rootElement, 'controlselect', nativeControlSelect);
        }
      }

      return {
        isResizable: isResizable,
        showResizeRect: showResizeRect,
        hideResizeRect: hideResizeRect,
        updateResizeRect: updateResizeRect,
        controlSelect: controlSelect,
        destroy: destroy
      };
    };
  }
);

/**
 * Fun.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Functional utility class.
 *
 * @private
 * @class tinymce.util.Fun
 */
define(
  'tinymce.core.util.Fun',
  [
  ],
  function () {
    var slice = [].slice;

    function constant(value) {
      return function () {
        return value;
      };
    }

    function negate(predicate) {
      return function (x) {
        return !predicate(x);
      };
    }

    function compose(f, g) {
      return function (x) {
        return f(g(x));
      };
    }

    function or() {
      var args = slice.call(arguments);

      return function (x) {
        for (var i = 0; i < args.length; i++) {
          if (args[i](x)) {
            return true;
          }
        }

        return false;
      };
    }

    function and() {
      var args = slice.call(arguments);

      return function (x) {
        for (var i = 0; i < args.length; i++) {
          if (!args[i](x)) {
            return false;
          }
        }

        return true;
      };
    }

    function curry(fn) {
      var args = slice.call(arguments);

      if (args.length - 1 >= fn.length) {
        return fn.apply(this, args.slice(1));
      }

      return function () {
        var tempArgs = args.concat([].slice.call(arguments));
        return curry.apply(this, tempArgs);
      };
    }

    function noop() {
    }

    return {
      constant: constant,
      negate: negate,
      and: and,
      or: or,
      curry: curry,
      compose: compose,
      noop: noop
    };
  }
);
/**
 * CaretCandidate.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for handling caret candidates. A caret candidate is
 * for example text nodes, images, input elements, cE=false elements etc.
 *
 * @private
 * @class tinymce.caret.CaretCandidate
 */
define(
  'tinymce.core.caret.CaretCandidate',
  [
    "tinymce.core.dom.NodeType",
    "tinymce.core.util.Arr",
    "tinymce.core.caret.CaretContainer"
  ],
  function (NodeType, Arr, CaretContainer) {
    var isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isBr = NodeType.isBr,
      isText = NodeType.isText,
      isInvalidTextElement = NodeType.matchNodeNames('script style textarea'),
      isAtomicInline = NodeType.matchNodeNames('img input textarea hr iframe video audio object'),
      isTable = NodeType.matchNodeNames('table'),
      isCaretContainer = CaretContainer.isCaretContainer;

    function isCaretCandidate(node) {
      if (isCaretContainer(node)) {
        return false;
      }

      if (isText(node)) {
        if (isInvalidTextElement(node.parentNode)) {
          return false;
        }

        return true;
      }

      return isAtomicInline(node) || isBr(node) || isTable(node) || isContentEditableFalse(node);
    }

    function isInEditable(node, rootNode) {
      for (node = node.parentNode; node && node != rootNode; node = node.parentNode) {
        if (isContentEditableFalse(node)) {
          return false;
        }

        if (isContentEditableTrue(node)) {
          return true;
        }
      }

      return true;
    }

    function isAtomicContentEditableFalse(node) {
      if (!isContentEditableFalse(node)) {
        return false;
      }

      return Arr.reduce(node.getElementsByTagName('*'), function (result, elm) {
        return result || isContentEditableTrue(elm);
      }, false) !== true;
    }

    function isAtomic(node) {
      return isAtomicInline(node) || isAtomicContentEditableFalse(node);
    }

    function isEditableCaretCandidate(node, rootNode) {
      return isCaretCandidate(node) && isInEditable(node, rootNode);
    }

    return {
      isCaretCandidate: isCaretCandidate,
      isInEditable: isInEditable,
      isAtomic: isAtomic,
      isEditableCaretCandidate: isEditableCaretCandidate
    };
  }
);
/**
 * ExtendingChar.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains logic for detecting extending characters.
 *
 * @private
 * @class tinymce.text.ExtendingChar
 * @example
 * var isExtending = ExtendingChar.isExtendingChar('a');
 */
define(
  'tinymce.core.text.ExtendingChar',
  [
  ],
  function () {
    // Generated from: http://www.unicode.org/Public/UNIDATA/DerivedCoreProperties.txt
    // Only includes the characters in that fit into UCS-2 16 bit
    var extendingChars = new RegExp(
      "[\u0300-\u036F\u0483-\u0487\u0488-\u0489\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A" +
      "\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0" +
      "\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C" +
      "\u09J�@	�Mad��(" $0KY�I	^��0%p<,5�Tp���1&RRc�]�Ba��4���� D)�и�C20�m��*�'�R8/�j���p�
�����(�@2�	- A√�"K�z��=����<��
��'�Ë1���+8� � �T*��B �P��
b!� D�M��0(�0H����P#� F@c�(��H4	*h� 8AE -	M��	F|
�y�T�P@�%�(ZJ�p�! �2�a
ŢR  ��2�;0 @J4
�TK��ro>l����d�FW���4-ؚ`\���>n�tĤ�#/ 	�#b� p �
P�����	h+����KQH<�`0eWll�3:�$?@(YU�B7�H�ce0B��2�LX0-s,�#�B �d A�!5�QB��\ �0�Έ ����ϥHM���6o
����ڣ�T���
�{Ԡ^�؞�e���ǽ����w>���o�m�5Ѩ�����N/e��D��v�ϟ׋��G��^l��t5X��O���g%���ό�/���T��6�������iN5����`�o�T�t�`zlBP< ���5 4(A�4<�*�a E ҁ���H8�L@=�Ro�e*,䐴8<JI�H�	�t1(� @�@@A@�� ��p 
����A����`��Q;F
 !�� H"1A7P�	�  j%�C-��<A��&@S�!rD�$ � �� $��8M `��4��I�5Ph�ā@A���a"�7 �"����������w�_6��S���;n2���f�_ߺ�����3�^�K���n�=m���{��i��~���g�?���]߄�����/s�7�T�\~�;�o��}�s�47~%Ԗ$��������!�S��Ώv����\���iF!��TH@7� c�4r�����	B�5L@$c%T �0�Q�d Z�X� * ��0a(Ơ ��Ú��
� jH�%qM
�9�*�����q��Ͻ�y�Bg�:�7�r����9�_��א�u}]�u���k��ƥ���)ۿ�j���oot|�c����~}��?U5������9�;�����N����V��?�)��b���ќ�{��e�{{ao���=����r[���}���}֭W_�wֽe鸩'd��$����{���헻s�3��h JE¡<s4	n����	�TC0��ˈHTB�����E0c3�%3����	�"�rrGl D�CJ
$�R��� �z � �D�A�" �P BZ E�� �f@!  ���`��;���5{��o��թ�����Oz����\�w~g���^��]��j�g���,���}>����&%WE���fu�����]�{:w���갿�/�O�,&��o^{q;/���?���-����O=��S0�E(�!$""  �l` p�Z1���`�1�	p�, ����@�X(R�B<�
q@��  &(��QG P�Ȃ�
���3�i �'�%~�5�
 ����BB`� DX�q�HA"@��1f*@���^� 4FF�b !!B�B�9D7*! �,�@ �-c+��
�� 
 �8�"5	 �"
�+h�8@"=E>w�� Pe �DLG���UӲ�	[�{~�m��?bS�}Y+|[�������#v_פz��9
�BP7,�d���ĸ< �H��d��%"��
4 x7b�m߉YS����=�q�3^����v?������<���v}oe�7�ja��'���kv�f�m���S/���~�Z���Kt��<�w_=�V�o�m_G����>ϓk�������_�Ϝ>wkY���Z������'[+���v@��������(����C�ɀ"4A`��Pa+BHF���!�#�8�!1h�ʑ\�*� �Ed�F1�X�)-B�� ( Y� ��t�H�@� T�� �TQ����8ND��b 0]P@pGJ�:���#�"R�S�$���* ��$ @�fA�HI@�c���#�3��:
 ���a�@
 �`24�NB@A�C`��A
2�K��:6�S QD1r��6����Z\� L�%���L���o*6�
*��Fj�H�H��%m�I��%�A0 �t̖�:�4)�f�A�3HA�"�<�"x��Q-����eC��p�:��B5R,���E�8T"��Qp!�
�0"! ���G%���w�޴�i��?s��Mu\�}�5?���՟i�y�z���K�{ ��e�ڋ�j;��������D��y���k�ݪw���_������Yz6���w7����֮g]�f����g���C��Ͽ�L�l�F8��U����[�`	�$BT �b/!(Q\�%��*�L�!Q�*-5rB ��C�dC��~��_�RM�&�FQ�T���J�M:��,0 A-�	�A��E�O9�w�
.(J�(R���Pc9(��+�
)#er��� �B��A���F�@��W	�3�@���*J �I1z8"/�R�n 0���y����}�_�Ǽ�������u<��Q�_�C<��-)޿ǫ;�տvx������7߽�����}}�������{���g�
9
�	PY�r(`qH#J��P@uhc| #��D�f*2�1b$1 `�W4 ��J����D���@���җH�^�B�记�s��j5s���O���f]�����~=�i}�;M_�W���r������[Y��*o��7�W��zo����/�ӽ������;�[�v���X��os�{_�'��7�j��'�y�o��|�wm:��k����3���~W�S����y�|٣a�|��]�������l����ݬ���jg��Yo�����~�ߨ�o�����ew`�����[�o!��z�/������'�U�ݩ篇���>��am]�߻����͆�+��n6}�s�@��P �H3��Y4x1�8Ҝ��Vx���5P��va�0m+ `(�"��d%��+6c�S3�'!�����a�&ZP�
f�A҈T 
�4�o���#M
�'��u���hYw�ۂB�a 2dT��2�xN	4�f���c8����&2|�dx��j-� aI���yj `��:����m�O�H�dHi(@�A��.�5�f��HV9WC�q<,V�qD#	��>����% �@[���
��+G���d,Mh����|��C$��00�nH�D�!Z���@�����4bAMcASb) ؂5�A��
 �#P4����O�]��������!���������'��׿��pm�~o�i���i���?����C���?���?<����a�y����f��-���wF�;~����R]�ǭ��q���������g�y6�?���=��ޯi��` �<b����WK X @6�2bT4yHd[j�Br����P����!Ҟ��k��� t��F:M
�h�N�5�������5q�Q�ɏ�7r�� I��B�x��2���@L`,�bSP��PFͰR*��UH��_�<�Dt�Yo4���0�L���
r�G :hkd�B>��T�������%!��J���\�i|$t ��� �_�y�J�Q �ڟTd�D$	�@`�k���ũ�K��E܄ '<�eؘA�-ĺ�}�u�$+�n�z�ߞû����s~���5S����=�w��矘����G^�|�ڱ��y��fo{����������?����u���=����w�������;�o�t�7v~����N��O������3��L�믗�u٘v�[��-�V��}C��<8�?=���uǿ�=����:�}�������{o������������������^7շ�������U��z���k����Ў5���}=_������?��U��V���T��&P<G�k���d�x%�پ}�#��T�uF�DLA�� �Ȁ5�(jA�0�Δ��` ��G�"��B"�
cy!�� s���.B�1Nr"�4@ĸ��@B2+)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
          }
        } else {
          node = resolveIndex(caretPosition.container(), caretPosition.offset());
          if (isText(node)) {
            addCharacterOffset(node, 0);
          }

          if (isValidElementCaretCandidate(node) && caretPosition.isAtEnd()) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), false));
            return clientRects;
          }

          beforeNode = resolveIndex(caretPosition.container(), caretPosition.offset() - 1);
          if (isValidElementCaretCandidate(beforeNode) && !isBr(beforeNode)) {
            if (isBlock(beforeNode) || isBlock(node) || !isValidElementCaretCandidate(node)) {
              addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(beforeNode), false));
            }
          }

          if (isValidElementCaretCandidate(node)) {
            addUniqueAndValidRect(collapseAndInflateWidth(getBoundingClientRect(node), true));
          }
        }
      }

      return clientRects;
    }

    /**
     * Represents a location within the document by a container and an offset.
     *
     * @constructor
     * @param {Node} container Container node.
     * @param {Number} offset Offset within that container node.
     * @param {Array} clientRects Optional client rects array for the position.
     */
    function CaretPosition(container, offset, clientRects) {
      function isAtStart() {
        if (isText(container)) {
          return offset === 0;
        }

        return offset === 0;
      }

      function isAtEnd() {
        if (isText(container)) {
          return offset >= container.data.length;
        }

        return offset >= container.childNodes.length;
      }

      function toRange() {
        var range;

        range = createRange(container.ownerDocument);
        range.setStart(container, offset);
        range.setEnd(container, offset);

        return range;
      }

      function getClientRects() {
        if (!clientRects) {
          clientRects = getCaretPositionClientRects(new CaretPosition(container, offset));
        }

        return clientRects;
      }

      function isVisible() {
        return getClientRects().length > 0;
      }

      function isEqual(caretPosition) {
        return caretPosition && container === caretPosition.container() && offset === caretPosition.offset();
      }

      function getNode(before) {
        return resolveIndex(container, before ? offset - 1 : offset);
      }

      return {
        /**
         * Returns the container node.
         *
         * @method container
         * @return {Node} Container node.
         */
        container: Fun.constant(container),

        /**
         * Returns the offset within the container node.
         *
         * @method offset
         * @return {Number} Offset within the container node.
         */
        offset: Fun.constant(offset),

        /**
         * Returns a range out of a the caret position.
         *
         * @method toRange
         * @return {DOMRange} range for the caret position.
         */
        toRange: toRange,

        /**
         * Returns the client rects for the caret position. Might be multiple rects between
         * block elements.
         *
         * @method getClientRects
         * @return {Array} Array of client rects.
         */
        getClientRects: getClientRects,

        /**
         * Returns true if the caret location is visible/displayed on screen.
         *
         * @method isVisible
         * @return {Boolean} true/false if the position is visible or not.
         */
        isVisible: isVisible,

        /**
         * Returns true if the caret location is at the beginning of text node or container.
         *
         * @method isVisible
         * @return {Boolean} true/false if the position is at the beginning.
         */
        isAtStart: isAtStart,

        /**
         * Returns true if the caret location is at the end of text node or container.
         *
         * @method isVisible
         * @return {Boolean} true/false if the position is at the end.
         */
        isAtEnd: isAtEnd,

        /**
         * Compares the caret position to another caret position. This will only compare the
         * container and offset not it's visual position.
         *
         * @method isEqual
         * @param {tinymce.caret.CaretPosition} caretPosition Caret position to compare with.
         * @return {Boolean} true if the caret positions are equal.
         */
        isEqual: isEqual,

        /**
         * Returns the closest resolved node from a node index. That means if you have an offset after the
         * last node in a container it will return that last node.
         *
         * @method getNode
         * @return {Node} Node that is closest to the index.
         */
        getNode: getNode
      };
    }

    /**
     * Creates a caret position from the start of a range.
     *
     * @method fromRangeStart
     * @param {DOMRange} range DOM Range to create caret position from.
     * @return {tinymce.caret.CaretPosition} Caret position from the start of DOM range.
     */
    CaretPosition.fromRangeStart = function (range) {
      return new CaretPosition(range.startContainer, range.startOffset);
    };

    /**
     * Creates a caret position from the end of a range.
     *
     * @method fromRangeEnd
     * @param {DOMRange} range DOM Range to create caret position from.
     * @return {tinymce.caret.CaretPosition} Caret position from the end of DOM range.
     */
    CaretPosition.fromRangeEnd = function (range) {
      return new CaretPosition(range.endContainer, range.endOffset);
    };

    /**
     * Creates a caret position from a node and places the offset after it.
     *
     * @method after
     * @param {Node} node Node to get caret position from.
     * @return {tinymce.caret.CaretPosition} Caret position from the node.
     */
    CaretPosition.after = function (node) {
      return new CaretPosition(node.parentNode, nodeIndex(node) + 1);
    };

    /**
     * Creates a caret position from a node and places the offset before it.
     *
     * @method before
     * @param {Node} node Node to get caret position from.
     * @return {tinymce.caret.CaretPosition} Caret position from the node.
     */
    CaretPosition.before = function (node) {
      return new CaretPosition(node.parentNode, nodeIndex(node));
    };

    CaretPosition.isAtStart = function (pos) {
      return pos ? pos.isAtStart() : false;
    };

    CaretPosition.isAtEnd = function (pos) {
      return pos ? pos.isAtEnd() : false;
    };

    CaretPosition.isTextPosition = function (pos) {
      return pos ? NodeType.isText(pos.container()) : false;
    };

    return CaretPosition;
  }
);
/**
 * CaretBookmark.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module creates or resolves xpath like string representation of a CaretPositions.
 *
 * The format is a / separated list of chunks with:
 * <element|text()>[index|after|before]
 *
 * For example:
 *  p[0]/b[0]/text()[0],1 = <p><b>a|c</b></p>
 *  p[0]/img[0],before = <p>|<img></p>
 *  p[0]/img[0],after = <p><img>|</p>
 *
 * @private
 * @static
 * @class tinymce.caret.CaretBookmark
 * @example
 * var bookmark = CaretBookmark.create(rootElm, CaretPosition.before(rootElm.firstChild));
 * var caretPosition = CaretBookmark.resolve(bookmark);
 */
define(
  'tinymce.core.caret.CaretBookmark',
  [
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Arr',
    'tinymce.core.caret.CaretPosition'
  ],
  function (NodeType, DomUtils, Fun, Arr, CaretPosition) {
    var isText = NodeType.isText,
      isBogus = NodeType.isBogus,
      nodeIndex = DomUtils.nodeIndex;

    function normalizedParent(node) {
      var parentNode = node.parentNode;

      if (isBogus(parentNode)) {
        return normalizedParent(parentNode);
      }

      return parentNode;
    }

    function getChildNodes(node) {
      if (!node) {
        return [];
      }

      return Arr.reduce(node.childNodes, function (result, node) {
        if (isBogus(node) && node.nodeName != 'BR') {
          result = result.concat(getChildNodes(node));
        } else {
          result.push(node);
        }

        return result;
      }, []);
    }

    function normalizedTextOffset(textNode, offset) {
      while ((textNode = textNode.previousSibling)) {
        if (!isText(textNode)) {
          break;
        }

        offset += textNode.data.length;
      }

      return offset;
    }

    function equal(targetValue) {
      return function (value) {
        return targetValue === value;
      };
    }

    function normalizedNodeIndex(node) {
      var nodes, index, numTextFragments;

      nodes = getChildNodes(normalizedParent(node));
      index = Arr.findIndex(nodes, equal(node), node);
      nodes = nodes.slice(0, index + 1);
      numTextFragments = Arr.reduce(nodes, function (result, node, i) {
        if (isText(node) && isText(nodes[i - 1])) {
          result++;
        }

        return result;
      }, 0);

      nodes = Arr.filter(nodes, NodeType.matchNodeNames(node.nodeName));
      index = Arr.findIndex(nodes, equal(node), node);

      return index - numTextFragments;
    }

    function createPathItem(node) {
      var name;

      if (isText(node)) {
        name = 'text()';
      } else {
        name = node.nodeName.toLowerCase();
      }

      return name + '[' + normalizedNodeIndex(node) + ']';
    }

    function parentsUntil(rootNode, node, predicate) {
      var parents = [];

      for (node = node.parentNode; node != rootNode; node = node.parentNode) {
        if (predicate && predicate(node)) {
          break;
        }

        parents.push(node);
      }

      return parents;
    }

    function create(rootNode, caretPosition) {
      var container, offset, path = [],
        outputOffset, childNodes, parents;

      container = caretPosition.container();
      offset = caretPosition.offset();

      if (isText(container)) {
        outputOffset = normalizedTextOffset(container, offset);
      } else {
        childNodes = container.childNodes;
        if (offset >= childNodes.length) {
          outputOffset = 'after';
          offset = childNodes.length - 1;
        } else {
          outputOffset = 'before';
        }

        container = childNodes[offset];
      }

      path.push(createPathItem(container));
      parents = parentsUntil(rootNode, container);
      parents = Arr.filter(parents, Fun.negate(NodeType.isBogus));
      path = path.concat(Arr.map(parents, function (node) {
        return createPathItem(node);
      }));

      return path.reverse().join('/') + ',' + outputOffset;
    }

    function resolvePathItem(node, name, index) {
      var nodes = getChildNodes(node);

      nodes = Arr.filter(nodes, function (node, index) {
        return !isText(node) || !isText(nodes[index - 1]);
      });

      nodes = Arr.filter(nodes, NodeType.matchNodeNames(name));
      return nodes[index];
    }

    function findTextPosition(container, offset) {
      var node = container, targetOffset = 0, dataLen;

      while (isText(node)) {
        dataLen = node.data.length;

        if (offset >= targetOffset && offset <= targetOffset + dataLen) {
          container = node;
          offset = offset - targetOffset;
          break;
        }

        if (!isText(node.nextSibling)) {
          container = node;
          offset = dataLen;
          break;
        }

        targetOffset += dataLen;
        node = node.nextSibling;
      }

      if (offset > container.data.length) {
        offset = container.data.length;
      }

      return new CaretPosition(container, offset);
    }

    function resolve(rootNode, path) {
      var parts, container, offset;

      if (!path) {
        return null;
      }

      parts = path.split(',');
      path = parts[0].split('/');
      offset = part�+LL/����� }� P��>Լ�]"P#
�\" �$9���&�(���"P����ezgHq!�;��	 [-!U ﵩ7}��pCa,��Vz�!m�w4`G�@TC+#:��T:�#8�apW�p��+�]r� �/���a
���!N�Z�� ���B*~Rf�%!�T� 1`�
�Zd�00�"Fo � fa�=1F�!�d�p;0T� B XV0J	��$2�B��X F��P�!=$�@U2�� T�c��`�,��j(�2Uu_ �H �q���8$�k���j�"�@ �Qa���F $ �I`"
B� D䡨 �~0̅ʄ�1�ơ����NQ�bԠgR,7H���*� D�� 8��T����8�KT(�=��(�+�P"v(��J}q `�	H*?�1F�yg��  V`�!� l�T2G4`��_���&�����&���j �b�  �� �S������i �p��@	a��5PIz�Q ND�hٚ �,Da��0��	$���CXBPI�  �b�
 �	0 ���`�(Lr)�
��2�WO" �!@�,�* !��0�R	t�rs���%# 	�҈�Qi2���),����E?p���
4� +�7*g4�HC���$5;o O�#FQC$H���õ���cjr�TD Rx�j�!�9b ���#�)����i ��H<��
@Y r�"Y\

zR��  L.0�Aπ1-) �*)��	�
:N����pD��0�,@�D1@�I��X!� �b!C`^qv
� ��� C���RȀƁh�Ŏ�Hf���cAB � ���@c)`���c�#�tHeFnc�
~����)�@!�b$��`
l�K4�HO�� 	��4@���<�Qʀ^�l
)�+�q�8(.�ʁt�� ���	 (�JG1�àP ��]qBA@�`�,�4Ŋ���	�0Ă��uDH�$#"ȑ�� �`��B E ���B6�M�k��ق���I 50L�!�Cc�#a2���1
�#%I@ &6p��� I��	D���@��Ƒ���]&	�D`0��(Ƃp#� � *�( $�ܢ�A x#p��� H&�Q|@(��dR3
Iy���$N Uk��� �]X�����M8%�	()��Z�+ �#����""_M�����$AA"*$UL��76@�3M� H �JB�Y�8E%��r8ǫ�JrAd�j�
��`�%�����@�T� 
� � 	  ��̐VI ��B%}��r	�H�(p�� ��lÒ !P L% Ƅ�4���q�� d �y��&M	�� \�O,
�S�e�B�N@�T ��z������(M��"�� Q#��tpR'BR�Q�QR �@ �Y
Ah #Θ�8S ���C�f8�
��t��< :�E 8�
�8JP�|d	!�Db��8�T�u���̒ �	 �E`  TèD@� b��ch�Nz� @�*�R(�y� \#
r��@��P" �P"lb�"��$	  0�P4ht���H�D{��J8�T��� IB�DY� $H"(�n4	��)!z  ***����*D�R�4-��>	FTaD�P b)�
	h���=HD�(�PL�� U*�  �2=5P� �+h�AL.'Ѐ �G6���t���Y0I@���@@�P$P@X ��DA�@�8"
��S�~�YB���� 
� uF�G7LH"� � qƇ���hI !�Ĥ�Ef&�.�8�5ԇP��IEJ�4
iBE�K;@Df����"B�� "C��6�.�	~N咠�R�"d�m��`IT�Q��E� (R@֭ǐX��j� 
 z��C�4����1(�\(�)
$"�(a�� b0���""����� b`�p�
���D�
��!��V�`M�E֜BFI��$$L�?��TJ�䤄GA@��E�@#�h � (gB_�P]�XM�:!�\0��A��5@ 9�� 4���v3���0�PT ��L��E0� ai%�8bF�8CH�����3���	�i 0�({

        function findIndex(name, element) {
          var count = 0;

          Tools.each(dom.select(name), function (node) {
            if (node.getAttribute('data-mce-bogus') === 'all') {
              return;
            }

            if (node == element) {
              return false;
            }

            count++;
          });

          return count;
        }

        function normalizeTableCellSelection(rng) {
          function moveEndPoint(start) {
            var container, offset, childNodes, prefix = start ? 'start' : 'end';

            container = rng[prefix + 'Container'];
            offset = rng[prefix + 'Offset'];

            if (container.nodeType == 1 && container.nodeName == "TR") {
              childNodes = container.childNodes;
              container = childNodes[Math.min(start ? offset : offset - 1, childNodes.length - 1)];
              if (container) {
                offset = start ? 0 : container.childNodes.length;
                rng['set' + (start ? 'Start' : 'End')](container, offset);
              }
            }
          }

          moveEndPoint(true);
          moveEndPoint();

          return rng;
        }

        function getLocation(rng) {
          var root = dom.getRoot(), bookmark = {};

          function getPoint(rng, start) {
            var container = rng[start ? 'startContainer' : 'endContainer'],
              offset = rng[start ? 'startOffset' : 'endOffset'], point = [], childNodes, after = 0;

            if (container.nodeType === 3) {
              point.push(normalized ? getNormalizedTextOffset(container, offset) : offset);
            } else {
              childNodes = container.childNodes;

              if (offset >= childNodes.length && childNodes.length) {
                after = 1;
                offset = Math.max(0, childNodes.length - 1);
              }

              point.push(dom.nodeIndex(childNodes[offset], normalized) + after);
            }

            for (; container && container != root; container = container.parentNode) {
              point.push(dom.nodeIndex(container, normalized));
            }

            return point;
          }

          bookmark.start = getPoint(rng, true);

          if (!selection.isCollapsed()) {
            bookmark.end = getPoint(rng);
          }

          return bookmark;
        }

        function findAdjacentContentEditableFalseElm(rng) {
          function findSibling(node, offset) {
            var sibling;

            if (NodeType.isElement(node)) {
              node = RangeUtils.getNode(node, offset);
              if (isContentEditableFalse(node)) {
                return node;
              }
            }

            if (CaretContainer.isCaretContainer(node)) {
              if (NodeType.isText(node) && CaretContainer.isCaretContainerBlock(node)) {
                node = node.parentNode;
              }

              sibling = node.previousSibling;
              if (isContentEditableFalse(sibling)) {
                return sibling;
              }

              sibling = node.nextSibling;
              if (isContentEditableFalse(sibling)) {
                return sibling;
              }
            }
          }

          return findSibling(rng.startContainer, rng.startOffset) || findSibling(rng.endContainer, rng.endOffset);
        }

        if (type == 2) {
          element = selection.getNode();
          name = element ? element.nodeName : null;
          rng = selection.getRng();

          if (isContentEditableFalse(element) || name == 'IMG') {
            return { name: name, index: findIndex(name, element) };
          }

          if (selection.tridentSel) {
            return selection.tridentSel.getBookmark(type);
          }

          element = findAdjacentContentEditableFalseElm(rng);
          if (element) {
            name = element.tagName;
            return { name: name, index: findIndex(name, element) };
          }

          return getLocation(rng);
        }

        if (type == 3) {
          rng = selection.getRng();

          return {
            start: CaretBookmark.create(dom.getRoot(), CaretPosition.fromRangeStart(rng)),
            end: CaretBookmark.create(dom.getRoot(), CaretPosition.fromRangeEnd(rng))
          };
        }

        // Handle simple range
        if (type) {
          return { rng: selection.getRng() };
        }

        rng = selection.getRng();
        id = dom.uniqueId();
        collapsed = selection.isCollapsed();
        styles = 'overflow:hidden;line-height:0px';

        // Explorer method
        if (rng.duplicate || rng.item) {
          // Text selection
          if (!rng.item) {
            rng2 = rng.duplicate();

            try {
              // Insert start marker
              rng.collapse();
              rng.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

              // Insert end marker
              if (!collapsed) {
                rng2.collapse(false);

                // Detect the empty space after block elements in IE and move the
                // end back one character <p></p>] becomes <p>]</p>
                rng.moveToElementText(rng2.parentElement());
                if (rng.compareEndPoints('StartToEnd', rng2) === 0) {
                  rng2.move('character', -1);
                }

                rng2.pasteHTML('<span data-mce-type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
              }
            } catch (ex) {
              // IE might throw unspecified error so lets ignore it
              return null;
            }
          } else {
            // Control selection
            element = rng.item(0);
            name = element.nodeName;

            return { name: name, index: findIndex(name, element) };
          }
        } else {
          element = selection.getNode();
          name = element.nodeName;
          if (name == 'IMG') {
            return { name: name, index: findIndex(name, element) };
          }

          // W3C method
          rng2 = normalizeTableCellSelection(rng.cloneRange());

          // Insert end marker
          if (!collapsed) {
            rng2.collapse(false);
            rng2.insertNode(dom.create('span', { 'data-mce-type': "bookmark", id: id + '_end', style: styles }, chr));
          }

          rng = normalizeTableCellSelection(rng);
          rng.collapse(true);
          rng.insertNode(dom.create('span', { 'data-mce-type': "bookmark", id: id + '_start', style: styles }, chr));
        }

        selection.moveToBookmark({ id: id, keep: 1 });

        return { id: id };
      };

      /**
       * Restores the selection to the specified bookmark.
       *
       * @method moveToBookmark
       * @param {Object} bookmark Bookmark to restore selection from.
       * @return {Boolean} true/false if it was successful or not.
       * @example
       * // Stores a bookmark of the current selection
       * var bm = tinymce.activeEditor.selection.getBookmark();
       *
       * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
       *
       * // Restore the selection bookmark
       * tinymce.activeEditor.selection.moveToBookmark(bm);
       */
      this.moveToBookmark = function (bookmark) {
        var rng, root, startContainer, endContainer, startOffset, endOffset;

        function setEndPoint(start) {
          var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

          if (point) {
            offset = point[0];

            // Find container node
            for (node = root, i = point.length - 1; i >= 1; i--) {
              children = node.childNodes;

              if (point[i] > children.length - 1) {
                return;
              }

              node = children[point[i]];
            }

            // Move text offset to best suitable location
            if (node.nodeType === 3) {
              offset = Math.min(point[0], node.nodeValue.length);
            }

            // Move element offset to best suitable location
            if (node.nodeType === 1) {
              offset = Math.min(point[0], node.childNodes.length);
            }

            // Set offset within container node
            if (start) {
              rng.setStart(node, offset);
            } else {
              rng.setEnd(node, offset);
            }
          }

          return true;
        }

        function restoreEndPoint(suffix) {
          var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

          if (marker) {
            node = marker.parentNode;

            if (suffix == 'start') {
              if (!keep) {
                idx = dom.nodeIndex(marker);
              } else {
                node = marker.firstChild;
                idx = 1;
              }

              startContainer = endContainer = node;
              startOffset = endOffset = idx;
            } else {
              if (!keep) {
                idx = dom.nodeIndex(marker);
              } else {
                node = marker.firstChild;
                idx = 1;
              }

              endContainer = node;
              endOffset = idx;
            }

            if (!keep) {
              prev = marker.previousSibling;
              next = marker.nextSibling;

              // Remove all marker text nodes
              Tools.each(Tools.grep(marker.childNodes), function (node) {
                if (node.nodeType == 3) {
                  node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
                }
              });

              // Remove marker but keep children if for example contents where inserted into the marker
              // Also remove duplicated instances of the marker for example by a
              // split operation or by WebKit auto split on paste feature
              while ((marker = dom.get(bookmark.id + '_' + suffix))) {
                dom.remove(marker, 1);
              }

              // If siblings are text nodes then merge them unless it's Opera since it some how removes the node
              // and we are sniffing since adding a lot of detection code for a browser with 3% of the market
              // isn't worth the effort. Sorry, Opera but it's just a fact
              if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3 && !Env.opera) {
                idx = prev.nodeValue.length;
                prev.appendData(next.nodeValue);
                dom.remove(next);

                if (suffix == 'start') {
                  startContainer = endContainer = prev;
                  startOffset = endOffset = idx;
                } else {
                  endContainer = prev;
                  endOffset = idx;
                }
              }
            }
          }
        }

        function addBogus(node) {
          // Adds a bogus BR element for empty block elements
          if (dom.isBlock(node) && !node.innerHTML && !Env.ie) {
            node.innerHTML = '<br data-mce-bogus="1" />';
          }

          return node;
        }

        function resolveCaretPositionBookmark() {
          var rng, pos;

          rng = dom.createRng();
          pos = CaretBookmark.resolve(dom.getRoot(), bookmark.start);
          rng.setStart(pos.container(), pos.offset());

          pos = CaretBookmark.resolve(dom.getRoot(), bookmark.end);
          rng.setEnd(pos.container(), pos.offset());

          return rng;
        }

        if (bookmark) {
          if (Tools.isArray(bookmark.start)) {
            rng = dom.createRng();
            root = dom.getRoot();

            if (selection.tridentSel) {
              return selection.tridentSel.moveToBookmark(bookmark);
            }

            if (setEndPoint(true) && setEndPoint()) {
              selection.setRng(rng);
            }
          } else if (typeof bookmark.start == 'string') {
            selection.setRng(resolveCaretPositionBookmark(bookmark));
          } else if (bookmark.id) {
            // Restore start/end points
            restoreEndPoint('start');
            restoreEndPoint('end');

            if (st4S@�27@ �((�
D��H*�"H<�lcH88����H�F�Q��
X0�
_P\3@\ /�
P\�-V8q P��3�h�#��4@�H ��h
¨f!j`��� ���8��9���zV`��T�0g��� ���sp@'@ p��Am4 0�#-����$TRa X��Z DzL
$K�2 n�5K$��fH ����-_'�������h������<���G~�
�f{�[}����?O߯�)J~�ǳ��]'�״V��^��o���7�V�~7?������v��4{�:�*���k�ݳ��/�e�����v�����}�����L�����BHH��`$
�#��* 0���Q ��
��t
J2�$	=�0QX0=�`�X-b�pQ���B� %$(DQ�l �	6"�+@�0q�]
"��@�*"����� �&����@M���Ab�0"	�ٺS@�R��B00�L0�@r�V�*p52~�v`Ĳ��$h�J��-�P��B�z!c
_��W��/�yܒ��}r7r�?�7��z������������:~��t�y�/��x&/Y��ۺ���5�����͛�_-���}���K��5�A&@IvHD��8��S���#�G�@qRdbʎZ j�8�����b@��X��!)�(p�@�=��B�ล�����A!�A�2,� ���B?(���@B�FJ�UP

�J	!B( ���,������l��;������+}�����N��Z������j�5���k�[��T��җ>��?���x���t�ۿ?�Gu��Y������y����-{爞������p�I����K_�
����?�Ǵ՛���4�	MQ��dB�%C�V�4�� J #�Ds�0 ��D<pLJ�Y$4� DGa
��K�Q���
�,bm���*F�˲�s�$NB�R	eQ��`q ���
��@A��� q����(�^��@� Q
;�	�@`Qŉ�Ea�*VH9H���H�QP�A �6h�r�����]m�
%�^'� 8"a�S�~�ӽ7K��خ��3������������񇳜=�
�dD �4,�i��ց�D�h
���Zd�#@��>|�
��&�@�j� �,J��	��)3) �q!Ԕ�5  �+ 
�&#��@�����P���� 8PG ��P�� �1W�0����B�n��`$�*!/~�����^(���1C��!cF -�x�' ���4"J a�h���0��,Q�FŎ�p���߹ᮽﳔ���N��uo����d���w�~���w�^�w_�o�>_�W��v����5~�����r���ʦ�K����7������e�|[�������w�������=�ŏ�����U������u/[4����=q����Oݿ�}��������θN����ߎ���3K�	�3����������?kNҤ������v��{t��u��mGϻ0�y���}�u{��,�5�-y��ܷ������?�=��/�ǥr�Ծ�����߀/���ŷB ! C�1S�op�!3'�k���g���G	�����	C�$�Q/WR p �� \�A2�`)n*��P� �h%  p=4�a"BO5���4a8!#�W�H�B]@P�<�  ~�	
�H �"N0/�` �F�<) ��j�1BJ$� @ƆD��Bv�#�A���n(4BLg���Ip7'0I� 
� CH����fF�<�.h��)*�h�@�Z ��� ����`�)@�J�! ��\�6���s��󻾼�������?��������hη�/�{��_ܽ7ӿ�:k�����޾z��N{?~������k/N�l�y��օ�����)��>?���=��{q���.g�Үv���8g����G~�
� 
D�	���#���!���e�+�AT,��@��
�ah{��`!F�6���� �D�l�AB ���c*��H`*PƦ �_��_շ����y?�֞����눃7���3_sW��h�v�-1�����������)��>:��d?�����e�?~zm�o�ȧ�9){��7�n���z[�]������鹬~=���χ��>z�蘇����
 �) f81 �hq!!  q��# �  @����^�)25!5��+Ȋ1j ��*��9`��\I��P|�21)1(��&��!� �=������5�¹��������ȭ>��{u�����z�n|������}������������3�l{���b����_62��}�����о�:�����C�G�Ij����y������]�>�hf��P���?�� 8�:�����#6*@u��t��M<H�L���e�x�CJ�� @ � �l!N�	�E���d��J���,H$:��h�T1cE>��Q)2r��p ����
	���%cX$��H�YQBH�x��!)`����@[���FO��T�AH(��*�� �A��N !N��c2��A���Q�� ` KQV
����x��5(p�@�/A�`��pJ�AR�#<��F�՘A�	�ڦ�N�Sy��w�쇹t�X���mm�e��j�
Z��t�P�x�evF-X
�Xtx�q����%��l��	� P� �!!@��"�$��{�*	!`Bv%� NF��k &���f ��|K��I�9�u�zZm����t��}���{���f��>�t�.�~��Fl�f7�g��o
 ��Wn���
���A���N8��!$O �Uшb�P�J��caIRE�E�n���B�Ը�*�&��n��r�� :�J�!B�!Qa2:�����"t�Ƙ� �Y=G!4HPm� �ǠtF@@��z` m��jQ0���|�0 $��b�	 J��BbBp
�d�J��D�8L�@8�Q$Ǖ�$'3@��eI�$�� ���B-Y��)V46@��(�� 	$�� Qai�!BB9@S2U>)� � ]F2 .��A�� Һ��4�JJ���
�B� �t< ���ݻ�Kߕl�����y� ���/z�u��?��w������'���^�߿��*��Y'�/�~��Y��nk��������Vߡ�������6��~�}f����c{���wz�YMw��g��Mf��z������ݿ������������-_J��m�k;?�����O�Wn�6���X��M{�r����xϖ�O����@�Ow���t���W�{�}�~r���]w���;?�v}���<?'=����>����:Wտ�f�߀�
�m6%
��KpI/
LlX ����ɰ��.˳����ɲ
pni����HA�ؘ pQD)�\D�BIP�3�$A2�"Ɂ�A���T���*bXA: H�,'���j�4����~�6�G�s��=������O?����ד�}���I�U��e�f���s�o�^��������׎�]˿Vgﶯ��~㾿{����N��ٞN�~�W�ޓ�Fw����}g(����x�nۘ}��q���8����/[r�H
�!`,��<FQ�d�
Ua�v�	�Eh!�?���! 
F�
�`b�DɈ�J $,� �N0w��#"�5 �@ġ�f$@�B 
��� [��K$(r@�')x	��T�*��� �AM9U�����D	�^�[��
i %+�A����@��"�(�(#¡d�,�a�"�$��0� �A�b�|��	"h�� E��B�ڽH~��7��un������Fw�XM�x>&��o{�ˉ���o��wɔ�3���Zd����3y߆���{
b(�K ���!9҄# 8� @a�Ha	&����� Z�Linux: isOS(linux, current),
        isSolaris: isOS(solaris, current),
        isFreeBSD: isOS(freebsd, current)
      };
    };

    return {
      unknown: unknown,
      nu: nu,

      windows: Fun.constant(windows),
      ios: Fun.constant(ios),
      android: Fun.constant(android),
      linux: Fun.constant(linux),
      osx: Fun.constant(osx),
      solaris: Fun.constant(solaris),
      freebsd: Fun.constant(freebsd)
    };
  }
);
define(
  'ephox.sand.detect.DeviceType',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return function (os, browser, userAgent) {
      var isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
      var isiPhone = os.isiOS() && !isiPad;
      var isAndroid3 = os.isAndroid() && os.version.major === 3;
      var isAndroid4 = os.isAndroid() && os.version.major === 4;
      var isTablet = isiPad || isAndroid3 || ( isAndroid4 && /mobile/i.test(userAgent) === true );
      var isTouch = os.isiOS() || os.isAndroid();
      var isPhone = isTouch && !isTablet;

      var iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;

      return {
        isiPad : Fun.constant(isiPad),
        isiPhone: Fun.constant(isiPhone),
        isTablet: Fun.constant(isTablet),
        isPhone: Fun.constant(isPhone),
        isTouch: Fun.constant(isTouch),
        isAndroid: os.isAndroid,
        isiOS: os.isiOS,
        isWebView: Fun.constant(iOSwebview)
      };
    };
  }
);
define(
  'ephox.sand.detect.UaString',

  [
    'ephox.katamari.api.Arr',
    'ephox.sand.detect.Version',
    'global!String'
  ],

  function (Arr, Version, String) {
    var detect = function (candidates, userAgent) {
      var agent = String(userAgent).toLowerCase();
      return Arr.find(candidates, function (candidate) {
        return candidate.search(agent);
      });
    };

    // They (browser and os) are the same at the moment, but they might
    // not stay that way.
    var detectBrowser = function (browsers, userAgent) {
      return detect(browsers, userAgent).map(function (browser) {
        var version = Version.detect(browser.versionRegexes, userAgent);
        return {
          current: browser.name,
          version: version
        };
      });
    };

    var detectOs = function (oses, userAgent) {
      return detect(oses, userAgent).map(function (os) {
        var version = Version.detect(os.versionRegexes, userAgent);
        return {
          current: os.name,
          version: version
        };
      });
    };

    return {
      detectBrowser: detectBrowser,
      detectOs: detectOs
    };
  }
);
define(
  'ephox.katamari.str.StrAppend',

  [

  ],

  function () {
    var addToStart = function (str, prefix) {
      return prefix + str;
    };

    var addToEnd = function (str, suffix) {
      return str + suffix;
    };

    var removeFromStart = function (str, numChars) {
      return str.substring(numChars);
    };

    var removeFromEnd = function (str, numChars) {
      return str.substring(0, str.length - numChars);
    };
 
    return {
      addToStart: addToStart,
      addToEnd: addToEnd,
      removeFromStart: removeFromStart,
      removeFromEnd: removeFromEnd
    };
  }
);
define(
  'ephox.katamari.str.StringParts',

  [
    'ephox.katamari.api.Option',
    'global!Error'
  ],

  function (Option, Error) {
    /** Return the first 'count' letters from 'str'.
-     *  e.g. first("abcde", 2) === "ab"
-     */
    var first = function(str, count) {
     return str.substr(0, count);
    };

    /** Return the last 'count' letters from 'str'.
    *  e.g. last("abcde", 2) === "de"
    */
    var last = function(str, count) {
     return str.substr(str.length - count, str.length);
    };

    var head = function(str) {
      return str === '' ? Option.none() : Option.some(str.substr(0, 1));
    };

    var tail = function(str) {
      return str === '' ? Option.none() : Option.some(str.substring(1));
    };

    return {
      first: first,
      last: last,
      head: head,
      tail: tail
    };
  }
);
define(
  'ephox.katamari.api.Strings',

  [
    'ephox.katamari.str.StrAppend',
    'ephox.katamari.str.StringParts',
    'global!Error'
  ],

  function (StrAppend, StringParts, Error) {
    var checkRange = function(str, substr, start) {
      if (substr === '') return true;
      if (str.length < substr.length) return false;
      var x = str.substr(start, start + substr.length);
      return x === substr;
    };

    /** Given a string and object, perform template-replacements on the string, as specified by the object.
     * Any template fields of the form ${name} are replaced by the string or number specified as obj["name"]
     * Based on Douglas Crockford's 'supplant' method for template-replace of strings. Uses different template format.
     */
    var supplant = function(str, obj) {
      var isStringOrNumber = function(a) {
        var t = typeof a;
        return t === 'string' || t === 'number';
      };

      return str.replace(/\${([^{}]*)}/g,
        function (a, b) {
          var value = obj[b];
          return isStringOrNumber(value) ? value : a;
        }
      );
    };

    var removeLeading = function (str, prefix) {
      return startsWith(str, prefix) ? StrAppend.removeFromStart(str, prefix.length) : str;
    };

    var removeTrailing = function (str, prefix) {
      return endsWith(str, prefix) ? StrAppend.removeFromEnd(str, prefix.length) : str;
    };

    var ensureLeading = function (str, prefix) {
      return startsWith(str, prefix) ? str : StrAppend.addToStart(str, prefix);
    };

    var ensureTrailing = function (str, prefix) {
      return endsWith(str, prefix) ? str : StrAppend.addToEnd(str, prefix);
    };
 
    var contains = function(str, substr) {
      return str.indexOf(substr) !== -1;
    };

    var capitalize = function(str) {
      return StringParts.head(str).bind(function (head) {
        return StringParts.tail(str).map(function (tail) {
          return head.toUpperCase() + tail;
        });
      }).getOr(str);
    };

    /** Does 'str' start with 'prefix'?
     *  Note: all strings start with the empty string.
     *        More formally, for all strings x, startsWith(x, "").
     *        This is so that for all strings x and y, startsWith(y + x, y)
     */
    var startsWith = function(str, prefix) {
      return checkRange(str, prefix, 0);
    };

    /** Does 'str' end with 'suffix'?
     *  Note: all strings end with the empty string.
     *        More formally, for all strings x, endsWith(x, "").
     *        This is so that for all strings x and y, endsWith(x + y, y)
     */
    var endsWith = function(str, suffix) {
      return checkRange(str, suffix, str.length - suffix.length);
    };

   
    /** removes all leading and trailing spaces */
    var trim = function(str) {
      return str.replace(/^\s+|\s+$/g, '');
    };

    var lTrim = function(str) {
      return str.replace(/^\s+/g, '');
    };

    var rTrim = function(str) {
      return str.replace(/\s+$/g, '');
    };

    return {
      supplant: supplant,
      startsWith: startsWith,
      removeLeading: removeLeading,
      removeTrailing: removeTrailing,
      ensureLeading: ensureLeading,
      ensureTrailing: ensureTrailing,
      endsWith: endsWith,
      contains: contains,
      trim: trim,
      lTrim: lTrim,
      rTrim: rTrim,
      capitalize: capitalize
    };
  }
);

define(
  'ephox.sand.info.PlatformInfo',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Strings'
  ],

  function (Fun, Strings) {
    var normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;

    var checkContains = function (target) {
      return function (uastring) {
        return Strings.contains(uastring, target);
      };
    };

    var browsers = [
      {
        name : 'Edge',
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: function (uastring) {
          var monstrosity = Strings.contains(uastring, 'edge/') && Strings.contains(uastring, 'chrome') && Strings.contains(uastring, 'safari') && Strings.contains(uastring, 'applewebkit');
          return monstrosity;
        }
      },
      {
        name : 'Chrome',
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/, normalVersionRegex],
        search : function (uastring) {
          return Strings.contains(uastring, 'chrome') && !Strings.contains(uastring, 'chromeframe');
        }
      },
      {
        name : 'IE',
        versionRegexes: [/.*?msie\ ?([0-9]+)\.([0-9]+).*/, /.*?rv:([0-9]+)\.([0-9]+).*/],
        search: function (uastring) {
          return Strings.contains(uastring, 'msie') || Strings.contains(uastring, 'trident');
        }
      },
      // INVESTIGATE: Is this still the Opera user agent?
      {
        name : 'Opera',
        versionRegexes: [normalVersionRegex, /.*?opera\/([0-9]+)\.([0-9]+).*/],
        search : checkContains('opera')
      },
      {
        name : 'Firefox',
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search : checkContains('firefox')
      },
      {
        name : 'Safari',
        versionRegexes: [normalVersionRegex, /.*?cpu os ([0-9]+)_([0-9]+).*/],
        search : function (uastring) {
          return (Strings.contains(uastring, 'safari') || Strings.contains(uastring, 'mobile/')) && Strings.contains(uastring, 'applewebkit');
        }
      }
    ];

    var oses = [
      {
        name : 'Windows',
        search : checkContains('win'),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name : 'iOS',
        search : function (uastring) {
          return Strings.contains(uastring, 'iphone') || Strings.contains(uastring, 'ipad');
        },
        versionRegexes: [/.*?version\/\ ?([0-9]+)\.([0-9]+).*/, /.*cpu os ([0-9]+)_([0-9]+).*/, /.*cpu iphone os ([0-9]+)_([0-9]+).*/]
      },
      {
        name : 'Android',
        search : checkContains('android'),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name : 'OSX',
        search : checkContains('os x'),
        versionRegexes: [/.*?os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      {
        name : 'Linux',
        search : checkContains('linux'),
        versionRegexes: [ ]
      },
      { name : 'Solaris',
        search : checkContains('sunos'),
        versionRegexes: [ ]
      },
      {
       name : 'FreeBSD',
       search : checkContains('freebsd'),
       versionRegexes: [ ]
      }
    ];

    return {
      browsers: Fun.constant(browsers),
      oses: Fun.constant(oses)
    };
  }
);
define(
  'ephox.sand.core.PlatformDetection',

  [
    'ephox.sand.core.Browser',
    'ephox.sand.core.OperatingSystem',
    'ephox.sand.detect.DeviceType',
    'ephox.sand.detect.UaString',
    'ephox.sand.info.PlatformInfo'
  ],

  function (Browser, OperatingSystem, DeviceType, UaString, PlatformInfo) {
    var detect = function (userAgent) {
      var browsers = PlatformInfo.browsers();
      var oses = PlatformInfo.oses();

      var browser = UaString.detectBrowser(browsers, userAgent).fold(
        Browser.unknown,
        Browser.nu
      );
      var os = UaString.detectOs(oses, userAgent).fold(
        OperatingSystem.unknown,
        OperatingSystem.nu
      );
      var deviceType = DeviceType(os, browser, userAgent);

      return {
        browser: browser,
        os: os,
        deviceType: deviceType
      };
    };

    return {
      detect: detect
    };
  }
);
defineGlobal("global!navigator", navigator);
define(
  'ephox.sand.api.PlatformDetection',

  [
    'ephox.katamari.api.Thunk',
    'ephox.sand.core.PlatformDetection',
    'global!navigator'
  ],

  function (Thunk, PlatformDetection, navigator) {
    var detect = Thunk.cached(function () {
      var userAgent = navigator.userAgent;
      return PlatformDetection.detect(userAgent);
    });

    return {
      detect: detect
    };
  }
);
define("global!console", [], function () { if (typeof console === "undefined") console = { log: function () {} }; return console; });
defineGlobal("global!document", document);
define(
  'ephox.sugar.api.node.Element',

  [
    'ephox.katamari.api.Fun',
    'global!Error',
    'global!console',
    'global!document'
  ],

  function (Fun, Error, console, document) {
    var fromHtml = function (html, scope) {
      var doc = scope || document;
      var div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        console.error('HTML does not have a single root node', html);
        throw 'HTML must have a single root node';
      }
      return fromDom(div.childNodes[0]);
    };

    var fromTag = function (tag, scope) {
      var doc = scope || document;
      var node = doc.createElement(tag);
      return fromDom(node);
    };

    var fromText = function (text, scope) {
      var doc = scope || document;
      var node = doc.createTextNode(text);
      return fromDom(node);
    };

    var fromDom = function (node) {
      if (node === null || node === undefined) throw new Error('Node cannot be null or undefined');
      return {
        dom: Fun.constant(node)
      };
    };

    return {
      fromHtml: fromHtml,
      fromTag: fromTag,
      fromText: fromText,
      fromDom: fromDom
    };
  }
);

define(
  'ephox.sugar.api.node.NodeTypes',

  [

  ],

  function () {
    return {
      ATTRIBUTE:              2,
      CDATA_SECTION:          4,
      COMMENT:                8,
      DOCUMENT:               9,
      DOCUMENT_TYPE:          10,
      DOCUMENT_FRAGMENT:      11,
      ELEMENT:                1,
      TEXT:                   3,
      PROCESSING_INSTRUCTION: 7,
      ENTITY_REFERENCE:       5,
      ENTITY:                 6,
      NOTATION:               12
    };
  }
);
define(
  'ephox.sugar.api.search.Selectors',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.NodeTypes',
    'global!Error',
    'global!document'
  ],

  function (Arr, Option, Element, NodeTypes, Error, document) {
    /*
     * There's a lot of code here; the aim is to allow the browser to optimise constant comparisons,
     * instead of doing object lookup feature detection on every call
     */
    var STANDARD = 0;
    var MSSTANDARD = 1;
    var WEBKITSTANDARD = 2;
    var FIREFOXSTANDARD = 3;

    var selectorType = (function () {
      var test = document.createElement('span');
      // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
      // Still check for the others, but do it last.
      return test.matches !== undefined ? STANDARD :
             test.msMatchesSelector !== undefined ? MSSTANDARD :
             test.webkitMatchesSelector !== undefined ? WEBKITSTANDARD :
             test.mozMatchesSelector !== undefined ? FIREFOXSTANDARD :
             -1;
    })();


    var ELEMENT = NodeTypes.ELEMENT;
    var DOCUMENT = NodeTypes.DOCUMENT;

    var is = function (element, selector) {
      var elem = element.dom();
      if (elem.nodeType !== ELEMENT) return false; // documents have querySelector but not matches

      // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
      // Still check for the others, but do it last.
      else if (selectorType === STANDARD) return elem.matches(selector);
      else if (selectorType === MSSTANDARD) return elem.msMatchesSelector(selector);
      else if (selectorType === WEBKITSTANDARD) return elem.webkitMatchesSelector(selector);
      else if (selectorType === FIREFOXSTANDARD) return elem.mozMatchesSelector(selector);
      else throw new Error('Browser lacks native selectors'); // unfortunately we can't throw this on startup :(
    };

    var bypassSelector = function (dom) {
      // Only elements and documents support querySelector
      return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT ||
              // IE fix for complex queries on empty nodes: http://jsfiddle.net/spyder/fv9ptr5L/
              dom.childElementCount === 0;
    };

    var all = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom();
      return bypassSelector(base) ? [] : Arr.map(base.querySelectorAll(selector), Element.fromDom);
    };

    var one = function (selector, scope) {
      var base = scope === undefined ? document : scope.dom();
      return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map(Element.fromDom);
    };

    return {
      all: all,
      is: is,
      one: one
    };
  }
);

define(
  'ephox.sugar.api.dom.Compare',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.Node',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.search.Selectors'
  ],

  function (Arr, Fun, Node, PlatformDetection, Selectors) {

    var eq = function (e1, e2) {
      return e1.dom() === e2.dom();
    };

    var isEqualNode = function (e1, e2) {
      return e1.dom().isEqualNode(e2.dom());
    };

    var member = function (element, elements) {
      return Arr.exists(elements, Fun.curry(eq, element));
    };

    // DOM contains() method returns true if e1===e2, we define our contains() to return false (a node does not contain itself).
    var regularContains = function (e1, e2) {
      var d1 = e1.dom(), d2 = e2.dom();
      return d1 === d2 ? false : d1.contains(d2);
    };

    var ieContains = function (e1, e2) {
      // IE only implements the contains() method for Element nodes.
      // It fails for Text nodes, so implement it using compareDocumentPosition()
      // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
      // Note that compareDocumentPosition returns CONTAINED_BY if 'e2 *is_contained_by* e1':
      // Also, compareDocumentPosition defines a node containing itself as false.
      return Node.documentPositionContainedBy(e1.dom(), e2.dom());
    };

    var browser = PlatformDetection.detect().browser;

    // Returns: true if node e1 contains e2, otherwise false.
    // (returns false if e1===e2: A node does not contain itself).
    var contains = browser.isIE() ? ieContains : regularContains;

    return {
      eq: eq,
      isEqualNode: isEqualNode,
      member: member,
      contains: contains,

      // Only used by DomUniverse. Remove (or should Selectors.is move here?)
      is: Selectors.is
    };
  }
);

/**
 * ScrollIntoView.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.ScrollIntoView',
  [
    'tinymce.core.dom.NodeType'
  ],
  function (NodeType) {
    var getPos = function (elm) {
      var x = 0, y = 0;

      var offsetParent = elm;
      while (offsetParent && offsetParent.nodeType) {
        x += offsetParent.offsetLeft || 0;
        y += offsetParent.offsetTop || 0;
        offsetParent = offsetParent.offsetParent;
      }

      return { x: x, y: y };
    };

    var fireScrollIntoViewEvent = function (editor, elm, alignToTop) {
      var scrollEvent = { elm: elm, alignToTop: alignToTop };
      editor.fire('scrollIntoView', scrollEvent);
      return scrollEvent.isDefaultPrevented();
    };

    var scrollIntoView = function (editor, elm, alignToTop) {
      var y, viewPort, dom = editor.dom, root = dom.getRoot(), viewPortY, viewPortH, offsetY = 0;

      if (fireScrollIntoViewEvent(editor, elm, alignToTop)) {
        return;
      }

      if (!NodeType.isElement(elm)) {
        return;
      }

      if (alignToTop === false) {
        offsetY = elm.offsetHeight;
      }

      if (root.nodeName !== 'BODY') {
        var scrollContainer = editor.selection.getScrollContainer();
        if (scrollContainer) {
          y = getPos(elm).y - getPos(scrollContainer).y + offsetY;
          viewPortH = scrollContainer.clientHeight;
          viewPortY = scrollContainer.scrollTop;
          if (y < viewPortY || y + 25 > viewPortY + viewPortH) {
            scrollContainer.scrollTop = y < viewPortY ? y : y - viewPortH + 25;
          }

          return;
        }
      }

      viewPort = dom.getViewPort(editor.getWin());
      y = dom.getPos(elm).y + offsetY;
      viewPortY = viewPort.y;
      viewPortH = viewPort.h;
      if (y < viewPort.y || y + 25 > viewPortY + viewPortH) {
        editor.getWin().scrollTo(0, y < viewPortY ? y : y - viewPortH + 25);
      }
    };

    return {
      scrollIntoView: scrollIntoView
    };
  }
);

/**
 * TridentSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Selection class for old explorer versions. This one fakes the
 * native selection object available on modern browsers.
 *
 * @private
 * @class tinymce.dom.TridentSelection
 */
define(
  'tinymce.core.dom.TridentSelection',
  [
  ],
  function () {
    function Selection(selection) {
      var self = this, dom = selection.dom, FALSE = false;

      function getPosition(rng, start) {
        var checkRng, startIndex = 0, endIndex, inside,
          children, child, offset, index, position = -1, parent;

        // Setup test range, collapse it and get the parent
        checkRng = rng.duplicate();
        checkRng.collapse(start);
        parent = checkRng.parentElement();

        // Check if the selection is within the right document
        if (parent.ownerDocument !== selection.dom.doc) {
          return;
        }

        // IE will report non editable elements as it's parent so look for an editable one
        while (parent.contentEditable === "false") {
          parent = parent.parentNode;
        }

        // If parent doesn't have any children then return that we are inside the element
        if (!parent.hasChildNodes()) {
          return { node: parent, inside: 1 };
        }

        // Setup node list and endIndex
        children = parent.children;
        endIndex = children.length - 1;

        // Perform a binary search for the position
        while (startIndex <= endIndex) {
          index = Math.floor((startIndex + endIndex) / 2);

          // Move selection to node and compare the ranges
          child = children[index];
          checkRng.moveToElementText(child);
          position = checkRng.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', rng);

          // Before/after or an exact match
          if (position > 0) {
            endIndex = index - 1;
          } else if (position < 0) {
            startIndex = index + 1;
          } else {
            return { node: child };
          }
        }

        // Check if child position is before or we didn't find a position
        if (position < 0) {
          // No element child was found use the parent element and the offset inside that
          if (!child) {
            checkRng.moveToElementText(parent);
            checkRng.collapse(true);
            child = parent;
            inside = true;
          } else {
            checkRng.collapse(false);
          }

          // Walk character by character in text node until we hit the selected range endpoint,
          // hit the end of document or parent isn't the right one
          // We need to walk char by char since rng.text or rng.htmlText will trim line endings
          offset = 0;
          while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
            if (checkRng.move('character', 1) === 0 || parent != checkRng.parentElement()) {
              break;
            }

            offset++;
          }
        } else {
          // Child position is after the selection endpoint
          checkRng.collapse(true);

          // Walk character by character in text node until we hit the selected range endpoint, hit
          // the end of document or parent isn't the right one
          offset = 0;
          while (checkRng.compareEndPoints(start ? 'StartToStart' : 'StartToEnd', rng) !== 0) {
            if (checkRng.move('character', -1) === 0 || parent != checkRng.parentElement()) {
              break;
            }

            offset++;
          }
        }

        return { node: child, position: position, offset: offset, inside: inside };
      }

      // Returns a W3C DOM compatible range object by using the IE Range API
      function getRange() {
        var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed, tmpRange, element2, bookmark;

        // If selection is outside the current document just return an empty range
        element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
        if (element.ownerDocument != dom.doc) {
          return domRange;
        }

        collapsed = selection.isCollapsed();

        // Handle control selection
        if (ieRange.item) {
          domRange.setStart(element.parentNode, dom.nodeIndex(element));
          domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

          return domRange;
        }

        function findEndPoint(start) {
          var endPoint = getPosition(ieRange, start), container, offset, textNodeOffset = 0, sibling, undef, nodeValue;

          container = endPoint.node;
          offset = endPoint.offset;

          if (endPoint.inside && !container.hasChildNodes()) {
            domRange[start ? 'setStart' : 'setEnd'](container, 0);
            return;
          }

          if (offset === undef) {
            domRange[start ? 'setStartBefore' : 'setEndAfter'](container);
            return;
          }

          if (endPoint.position < 0) {
            sibling = endPoint.inside ? container.firstChild : container.nextSibling;

            if (!sibling) {
              domRange[start ? 'setStartAfter' : 'setEndAfter'](container);
              return;
            }

            if (!offset) {
              if (sibling.nodeType == 3) {
                domRange[start ? 'setStart' : 'setEnd'](sibling, 0);
              } else {
                domRange[start ? 'setStartBefore' : 'setEndBefore'](sibling);
              }

              return;
            }

            // Find the text node and offset
            while (sibling) {
              if (sibling.nodeType == 3) {
                nodeValue = sibling.nodeValue;
                textNodeOffset += nodeValue.length;

                // We are at or passed the position we where looking for
                if (textNodeOffset >= offset) {
                  container = sibling;
                  textNodeOffset -= offset;
                  textNodeOffset = nodeValue.length - textNodeOffset;
                  break;
                }
              }

              sibling = sibling.nextSibling;
            }
          } else {
            // Find the text node and offset
            sibling = container.previousSibling;

            if (!sibling) {
              return domRange[start ? 'setStartBefore' : 'setEndBefore'](container);
            }

            // If there isn't any text to loop then use the first position
            if (!offset) {
              if (container.nodeType == 3) {
                domRange[start ? 'setStart' : 'setEnd'](sibling, container.nodeValue.length);
              } else {
                domRange[start ? 'setStartAfter' : 'setEndAfter'](sibling);
              }

              return;
            }

            while (sibling) {
              if (sibling.nodeType == 3) {
                textNodeOffset += sibling.nodeValue.length;

                // We are at or passed the position we where looking for
                if (textNodeOffset >= offset) {
                  container = sibling;
                  textNodeOffset -= offset;
                  break;
                }
              }

              sibling = sibling.previousSibling;
            }
          }

          domRange[start ? 'setStart' : 'setEnd'](container, textNodeOffset);
        }

        try {
          // Find start point
          findEndPoint(true);

          // Find end point if needed
          if (!collapsed) {
            findEndPoint();
          }
        } catch (ex) {
          // IE has a nasty bug where text nodes might throw "invalid argument" when you
          // access the nodeValue or other properties of text nodes. This seems to happen when
          // text nodes are split into two nodes by a delete/backspace call.
          // So let us detect and try to fix it.
          if (ex.number == -2147024809) {
            // Get the current selection
            bookmark = self.getBookmark(2);

            // Get start element
            tmpRange = ieRange.duplicate();
            tmpRange.collapse(true);
            element = tmpRange.parentElement();

            // Get end element
            if (!collapsed) {
              tmpRange = ieRange.duplicate();
              tmpRange.collapse(false);
              element2 = tmpRange.parentElement();
              element2.innerHTML = element2.innerHTML;
            }

            // Remove the broken elements
            element.innerHTML = element.innerHTML;

            // Restore the selection
            self.moveToBookmark(bookmark);

            // Since the range has moved we need to re-get it
            ieRange = selection.getRng();

            // Find start point
            findEndPoint(true);

            // Find end point if needed
            if (!collapsed) {
              findEndPoint();
            }
          } else {
            throw ex; // Throw other errors
          }
        }

        return domRange;
      }

      this.getBookmark = function (type) {
        var rng = selection.getRng(), bookmark = {};

        function getIndexes(node) {
          var parent, root, children, i, indexes = [];

          parent = node.parentNode;
          root = dom.getRoot().parentNode;

          while (parent != root && parent.nodeType !== 9) {
            children = parent.children;

            i = children.length;
            while (i--) {
              if (node === children[i]) {
                indexes.push(i);
                break;
              }
            }

            node = parent;
            parent = parent.parentNode;
          }

          return indexes;
        }

        function getBookmarkEndPoint(start) {
          var position;

          position = getPosition(rng, start);
          if (position) {
            return {
              position: position.position,
              offset: position.offset,
              indexes: getIndexes(position.node),
              inside: position.inside
            };
          }
        }

        // Non ubstructive bookmark
        if (type === 2) {
          // Handle text selection
          if (!rng.item) {
            bookmark.start = getBookmarkEndPoint(true);

            if (!selection.isCollapsed()) {
              bookmark.end = getBookmarkEndPoint();
            }
          } else {
            bookmark.start = { ctrl: true, indexes: getIndexes(rng.item(0)) };
          }
        }

        return bookmark;
      };

      this.moveToBookmark = function (bookmark) {
        var rng, body = dom.doc.body;

        function resolveIndexes(indexes) {
          var node, i, idx, children;

          node = dom.getRoot();
          for (i = indexes.length - 1; i >= 0; i--) {
            children = node.children;
            idx = indexes[i];

            if (idx <= children.length - 1) {
              node = children[idx];
            }
          }

          return node;
        }

        function setBookmarkEndPoint(start) {
          var endPoint = bookmark[start ? 'start' : 'end'], moveLeft, moveRng, undef, offset;

          if (endPoint) {
            moveLeft = endPoint.position > 0;

            moveRng = body.createTextRange();
            moveRng.moveToElementText(resolveIndexes(endPoint.indexes));

            offset = endPoint.offset;
            if (offset !== undef) {
              moveRng.collapse(endPoint.inside || moveLeft);
              moveRng.moveStart('character', moveLeft ? -offset : offset);
            } else {
              moveRng.collapse(start);
            }

            rng.setEndPoint(start ? 'StartToStart' : 'EndToStart', moveRng);

            if (start) {
              rng.collapse(true);
            }
          }
        }

        if (bookmark.start) {
          if (bookmark.start.ctrl) {
            rng = body.createControlRange();
            rng.addElement(resolveIndexes(bookmark.start.indexe�d�!���r@4P�
)�  �4"�EƠe� @ ����� �P�P�D(L!@�'@Ap#EO �B:�Q0�tB(�4	�$��`
wpb0�#@�W *�>A��2%"E���("�ЧI�,�LC��@3��X!��I�����!}Ħ� !9u
�b@0$�c���!�@�TM ^�P^ː�4 ����"� \BD¼�!��,��qEC�8F��A@0��*�e�	5@P"��R��>1&���z
� 4H�b]���B#x,(��E%	"��K��("C���
	� Ȁ`�!����2�� S@B��@b�-`;�h��$�m�(��S�$&���4 �"-�0J��$�!9N��
cQ�d�
R}Rb��4 >:�PD� 
��"E �Z���W��P �! 9p�4Hٸ�& �V�GB$4��� � ��N, �Ss��� 
�:?��%�p���B����@4*�i("H&M0&S�Jd �A&I$Q�  �*����@ sQ�h2���p�Q`3Z!��B�C���0eBn$=YD�� �
���)�`C]шD�h6 P|X�'P�LR�D5��?dHNch"�
*@���O@�(@80	��p��2h��H^�c H���(O�	
��I��@��E�GdA��:@  �"` ��g�� ��J-��1��<�P����A@@�PYPԁ ��P���PL��
h 8��BH�4QB�� �Cӑ�%E�M�  AAP�,�y ��p�%�DP $�.�z�an.���fH�
G0n$+P�� 5r,P� ���?��B%]h� 
BP@��Ha+�#&r	0%G�K3����`9�P���R&�T��9P���y�,�3�1�jA��	� � =DM�$B&ȿ�ǂ� ��#�G<&  �qD�EY 0*+EF41 ��@B"h*�fZ��㨐&��Q� 84PB@:P `��,\  ע�"tBt�����-���P�VJ�<AF�B�% �&��$�� �ָ
H�Iň+b ": �!��H
�L@4@ �"O"h��8�	�D@+$�  ��4�� ��,��$%A!-$jP)u"U��C�� F���C�% 	�a,	3�چ`�`V�*v���)ZH4��L%c �D� ���~��,aA!1
9B��ф  ���	�]! غ����k�@AA�� ��!���#�e	i�@X�?`QlA�  `7!�^E`\IɐB�  2�0�`�(D�FA`�P�E%HH��!I4Q_
� b�c
$@Rh@$`$��:P!�J��1��0�B��d,f)�@�ay<@�nc�� � �Hs�
 $��q�"$8�:�C �7�&��.�C�a���M0�8�3@H��RZ�V� �����	A�&�H�'�
r"��i��K�4� �&�-*8��I!x���2�() � >.DJ�� ��  Be0f��.U0 ��K�0f�m��H	�l���X #,\	���DP*ؽI  �LX� 1���R�] ���R��YF� �s@`�
\����( (B ����:� #B�� !J��(I��JL�P�Y@����0�� �[�@�&  �3AP�i0}X�@$�c�@ k#�ь P b�-�j@�" i��&.uB%� ���'f�@ �`Z�$xCgAH	�'(��hp� �B9�  �$����Y 0F��D�",2��@�E���@���5D�A���!葀�PQP��DCc�6�`T	9�<�R�@CjM �  S~�*  @�"� p$���$A2
&��AȎ(j|�X�8�B��JH�?T
H�`Q
`D!0%b@��,��R�U2�(�l�(�4��%ETRŘ@KH��Z�A�H�p �  
� (��"��� �`  � 4`	 ��I����.1M(��(	H
�V�� �y�a/]A�A%��O�'��j`�$ �7p�1����I�AR/�2�G�H 
��P9�)C%8	�/P��H˽@�� �!��gy��	E4i�x��r!s�a�!p��Z�	�r/�Ӧ@dT�	��Q)F �)�$hE�"UXáA �U%�x����r$�D�p��"��d � "A*�� �� l�� �Gr$  �� ���B�
Ċ���;�#I�XӅ  Pو��Ȝ$��"ðV�BA=�3V�@�&	� �C1�`�P �qC\0�AB"�4H�R!�+� ,��H�  @h7PB�e*��D�X�ªnM����()��H9�&�P`� o`v�@b�WD��d� 
0R���" 4�= 	&`�qC��D@s� V"�#����*�@U�D�	�2�?� �`��M`$�u�
�F �'��iH��dPQ���:��B|4�l��0T��G
ar�Mkf���A	�$����$&46��: P���E�1�`b����j�B��#�$	H�`Ԁ ��2��R)��`)DQ�"�g d�P�#,��� #W�ucJ��d6D�

0R��BD�`�)$�INI�U'*�D	�>M��1(x���Q����Q�+ �)e�	� #8� �!lF���R��� E�"�
�
_��T�� ����r�"$ B$4H�3�0 �b����@+�������L�L@�1 	�!3�r�E�u��P""�8T[L�88(k�
�Y"��$	�B�y����&����c$`l`$��1 ����+P!
����	�Y�� �4�ࠃ� 1
�Cc �E��r*U50Ch��EM�	ȄA�DQ'%�
�@� `-b�%, ev�*E�Ap=qIPG��C�����)%k (��0�K�@lB ��P�v�����ڨp�P
	! C�IT�� ��
�A��.��	0 �`6����	�  �ʒ�!`�p@�0�Ř��~�2 1w�@ 8
Ve�����Hhʣ"�H #�H��D�QAX�2�
E�	0&�! ����\
H�@[\։�# ! V���� +�)�c�!@p�)a� G�%`x̅��PE$�m$d<�O+N�
�.8-I�d<��h1��L$B!pN��P� �� d�Q �р/'`q%� PC��$��c��0�:.LkU	`��� ���	�",�H����G�``@��B�d\l�RA��D(y��0�$���B ��Z1� �(�>3�f��� ���m� ��.�v�@ H(()!	H k���� � ID�4$P��4/
@p("�!C"
�@�89(RnH��E�����Ł
�RP����BR�bF1�Y,g�Gj �B9\	� �E�
�ꌆ	 �`�R.vȊ���p ��A�� L0��!	D���	`
 G �ܤ
�$��2b� sf���k1��b9~F"GX@'?�؈���~5C|/��(��
y (
��Xh֌x2L�Dـ�<{�H@.�%���Q PV4z�B3�AH ��j�
����'AIň�bD�.9�0�"	����9�! #(�C��b΍�t��rx���E�  0a�5 �h(- �A�P`&B��P8�4ՋQ���H@"XV`�]
�:m@ܕ�2�fP6)40�@�+�!@\OȐ��B��0�HK`�P��l�Kŋ@6 ���ڀ�GLbh����l=& 	I��;�
�  ��P	�� 
��I&9���()@*�"Nu<!D�1�	��PZCp��
#���7 0<����G�1�zPB

@E�PC�A%`� B��
B�!Gd0�sS�T!hh7�P$,�Kr �d+��d8����  �� �'��(�TB�BQ ���4���'�H�����Z
ЮAĢ*�9CrО�?� l� X�����%`I@ax�4��Q�
 SH���~(

�0���`O�LP*C@�$Q�7����4�	���(r���` 	DXH02  P �*�	�����Jl�D{h̎! P- "@ �:P.�x64�!e#@@�� ��ZP$K��xPI
�fz��JL19G)#&�dC:4�^H�R��4���F
�a'%G�TB� R�60�U6� 1D���#��3@J&�(C�`4��A �
K�J�z��WBx�����! p !)&BtB �-�e L�F�XPbI
$�40����&�Ԏ0i�m@ $E�=�DK(eI` @RQU!",�J�, ���.l �2�2�I�숀�'c��J�0 �L� ��1��(� ��`D� ���¿0�����\�D�"є!DI�%����,p�a��fa"H9� U�D�gU�$*@H��!(�-���	@������DB�@M�@Q���@"
��$�,X7�p@e�	�HAB����$�*��ҰBx$*a .p0+H
�B�K���
 ����RGKD� ��i�dDx�T,X��](�`�A'�H5�I0�&D�D :ĳ0e���Hb���.�gq�$A  n p�c�E�9� �V��B��<B ��P-���[FX ������%� ����P������1��E9� C@Њ$j �Q�j�FT�J¶�&,V%Hs	39��W�i�	�q�A�зڧ
P�1`�0 �&��
R1$Х�J�9���(DX��Lb��y �#�dư#�R���0�(��� �Wj(3���H�Jx�9@(�*@(Z�)H
�R;D�h"�7 ,�Ť��#�dF(�N*	0�	�8�
 )@ � U�L4Z��83 �pM ��d�X����@`�Hs x6 �M$��+".ɂ� ��) <1$I$JH@ nQ.�J��A�!'
	U@�J�� � ���\F҅@B�A�^�S"���gH��SӐ�	4���ǀ",	�䮠!����h���X�La(P!�p &j�,ultE�`�V
���%`�5� 4B�1n*�*
�B���
�D���6��b ��P@r��}�B�
 ��ЃBC5� h"PdK���D�����b�
C@��M �(Q�4
 pf���� ��� �T�Ae�ӂ��,0x��M�] k Pj��$� �)_�"hkEq`"  �	�H�hEE@dI
�qQ *��^,�(5 $հ�S��
X)aO ���&��		T�r4bs PP�
Mr(�
�Wd �P�a3Hm@ `@6 ^� P!�@q���(
ʄ킟�<����:���73�U([��_�b�� �PΔ�PL�,�xF�@Aq���T �" �rX�kp$$K`T=�\�d}�P�`�P��P<,��r�*P����D�v�b"D�� � ��p9�	��U��7�
��b� ��p��d�hW���H�̝сX�B)�%�Y�\HE%� tuple.v;
      });
      return r;
    };

    /** bifilter :: (JsObj(k, v), (v, k -> Bool)) -> { t: JsObj(k, v), f: JsObj(k, v) } */
    var bifilter = function (obj, pred) {
      var t = {};
      var f = {};
      each(obj, function(x, i) {
        var branch = pred(x, i) ? t : f;
        branch[i] = x;
      });
      return {
        t: t,
        f: f
      };
    };

    /** mapToArray :: (JsObj(k, v), (v, k -> a)) -> [a] */
    var mapToArray = function (obj, f) {
      var r = [];
      each(obj, function(value, name) {
        r.push(f(value, name));
      });
      return r;
    };

    /** find :: (JsObj(k, v), (v, k, JsObj(k, v) -> Bool)) -> Option v */
    var find = function (obj, pred) {
      var props = keys(obj);
      for (var k = 0, len = props.length; k < len; k++) {
        var i = props[k];
        var x = obj[i];
        if (pred(x, i, obj)) {
          return Option.some(x);
        }
      }
      return Option.none();
    };

    /** values :: JsObj(k, v) -> [v] */
    var values = function (obj) {
      return mapToArray(obj, function (v) {
        return v;
      });
    };

    var size = function (obj) {
      return values(obj).length;
    };

    return {
      bifilter: bifilter,
      each: each,
      map: objectMap,
      mapToArray: mapToArray,
      tupleMap: tupleMap,
      find: find,
      keys: keys,
      values: values,
      size: size
    };
  }
);
define(
  'ephox.katamari.util.BagUtils',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Type',
    'global!Error'
  ],

  function (Arr, Type, Error) {
    var sort = function (arr) {
      return arr.slice(0).sort();
    };

    var reqMessage = function (required, keys) {
      throw new Error('All required keys (' + sort(required).join(', ') + ') were not specified. Specified keys were: ' + sort(keys).join(', ') + '.');
    };

    var unsuppMessage = function (unsupported) {
      throw new Error('Unsupported keys for object: ' + sort(unsupported).join(', '));
    };

    var validateStrArr = function (label, array) {
      if (!Type.isArray(array)) throw new Error('The ' + label + ' fields must be an array. Was: ' + array + '.');
      Arr.each(array, function (a) {
        if (!Type.isString(a)) throw new Error('The value ' + a + ' in the ' + label + ' fields was not a string.');
      });
    };

    var invalidTypeMessage = function (incorrect, type) {
      throw new Error('All values need to be of type: ' + type + '. Keys (' + sort(incorrect).join(', ') + ') were not.');
    };

    var checkDupes = function (everything) {
      var sorted = sort(everything);
      var dupe = Arr.find(sorted, function (s, i) {
        return i < sorted.length -1 && s === sorted[i + 1];
      });

      dupe.each(function (d) {
        throw new Error('The field: ' + d + ' occurs more than once in the combined fields: [' + sorted.join(', ') + '].');
      });
    };

    return {
      sort: sort,
      reqMessage: reqMessage,
      unsuppMessage: unsuppMessage,
      validateStrArr: validateStrArr,
      invalidTypeMessage: invalidTypeMessage,
      checkDupes: checkDupes
    };
  }
);
define(
  'ephox.katamari.data.MixedBag',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Option',
    'ephox.katamari.util.BagUtils',
    'global!Error',
    'global!Object'
  ],

  function (Arr, Fun, Obj, Option, BagUtils, Error, Object) {
    
    return function (required, optional) {
      var everything = required.concat(optional);
      if (everything.length === 0) throw new Error('You must specify at least one required or optional field.');

      BagUtils.validateStrArr('required', required);
      BagUtils.validateStrArr('optional', optional);

      BagUtils.checkDupes(everything);

      return function (obj) {
        var keys = Obj.keys(obj);

        // Ensure all required keys are present.
        var allReqd = Arr.forall(required, function (req) {
          return Arr.contains(keys, req);
        });

        if (! allReqd) BagUtils.reqMessage(required, keys);

        var unsupported = Arr.filter(keys, function (key) {
          return !Arr.contains(everything, key);
        });

        if (unsupported.length > 0) BagUtils.unsuppMessage(unsupported);

        var r = {};
        Arr.each(required, function (req) {
          r[req] = Fun.constant(obj[req]);
        });

        Arr.each(optional, function (opt) {
          r[opt] = Fun.constant(Object.prototype.hasOwnProperty.call(obj, opt) ? Option.some(obj[opt]): Option.none());
        });

        return r;
      };
    };
  }
);
define(
  'ephox.katamari.api.Struct',

  [
    'ephox.katamari.data.Immutable',
    'ephox.katamari.data.MixedBag'
  ],

  function (Immutable, MixedBag) {
    return {
      immutable: Immutable,
      immutableBag: MixedBag
    };
  }
);

define(
  'ephox.sugar.alien.Recurse',

  [

  ],

  function () {
    /**
     * Applies f repeatedly until it completes (by returning Option.none()).
     *
     * Normally would just use recursion, but JavaScript lacks tail call optimisation.
     *
     * This is what recursion looks like when manually unravelled :)
     */
    var toArray = function (target, f) {
      var r = [];

      var recurse = function (e) {
        r.push(e);
        return f(e);
      };

      var cur = f(target);
      do {
        cur = cur.bind(recurse);
      } while (cur.isSome());

      return r;
    };

    return {
      toArray: toArray
    };
  }
);
define(
  'ephox.sugar.api.search.Traverse',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.sugar.alien.Recurse',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element'
  ],

  function (Type, Arr, Fun, Option, Struct, Recurse, Compare, Element) {
    // The document associated with the current element
    var owner = function (element) {
      return Element.fromDom(element.dom().ownerDocument);
    };

    var documentElement = function (element) {
      // TODO: Avoid unnecessary wrap/unwrap here
      var doc = owner(element);
      return Element.fromDom(doc.dom().documentElement);
    };

    // The window element associated with the element
    var defaultView = function (element) {
      var el = element.dom();
      var defaultView = el.ownerDocument.defaultView;
      return Element.fromDom(defaultView);
    };

    var parent = function (element) {
      var dom = element.dom();
      return Option.from(dom.parentNode).map(Element.fromDom);
    };

    var findIndex = function (element) {
      return parent(element).bind(function (p) {
        // TODO: Refactor out children so we can avoid the constant unwrapping
        var kin = children(p);
        return Arr.findIndex(kin, function (elem) {
          return Compare.eq(element, elem);
        });
      });
    };

    var parents = function (element, isRoot) {
      var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

      // This is used a *lot* so it needs to be performant, not recursive
      var dom = element.dom();
      var ret = [];

      while (dom.parentNode !== null && dom.parentNode !== undefined) {
        var rawParent = dom.parentNode;
        var parent = Element.fromDom(rawParent);
        ret.push(parent);

        if (stop(parent) === true) break;
        else dom = rawParent;
      }
      return ret;
    };

    var siblings = function (element) {
      // TODO: Refactor out children so we can just not add self instead of filtering afterwards
      var filterSelf = function (elements) {
        return Arr.filter(elements, function (x) {
          return !Compare.eq(element, x);
        });
      };

      return parent(element).map(children).map(filterSelf).getOr([]);
    };

    var offsetParent = function (element) {
      var dom = element.dom();
      return Option.from(dom.offsetParent).map(Element.fromDom);
    };

    var prevSibling = function (element) {
      var dom = element.dom();
      return Option.from(dom.previousSibling).map(Element.fromDom);
    };

    var nextSibling = function (element) {
      var dom = element.dom();
      return Option.from(dom.nextSibling).map(Element.fromDom);
    };

    var prevSiblings = function (element) {
      // This one needs to be reversed, so they're still in DOM order
      return Arr.reverse(Recurse.toArray(element, prevSibling));
    };

    var nextSiblings = function (element) {
      return Recurse.toArray(element, nextSibling);
    };

    var children = function (element) {
      var dom = element.dom();
      return Arr.map(dom.childNodes, Element.fromDom);
    };

    var child = function (element, index) {
      var children = element.dom().childNodes;
      return Option.from(children[index]).map(Element.fromDom);
    };

    var firstChild = function (element) {
      return child(element, 0);
    };

    var lastChild = function (element) {
      return child(element, element.dom().childNodes.length - 1);
    };

    var spot = Struct.immutable('element', 'offset');
    var leaf = function (element, offset) {
      var cs = children(element);
      return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
    };

    return {
      owner: owner,
      defaultView: defaultView,
      documentElement: documentElement,
      parent: parent,
      findIndex: findIndex,
      parents: parents,
      siblings: siblings,
      prevSibling: prevSibling,
      offsetParent: offsetParent,
      prevSiblings: prevSiblings,
      nextSibling: nextSibling,
      nextSiblings: nextSiblings,
      children: children,
      child: child,
      firstChild: firstChild,
      lastChild: lastChild,
      leaf: leaf
    };
  }
);

define(
  'ephox.sugar.api.dom.Insert',

  [
    'ephox.sugar.api.search.Traverse'
  ],

  function (Traverse) {
    var before = function (marker, element) {
      var parent = Traverse.parent(marker);
      parent.each(function (v) {
        v.dom().insertBefore(element.dom(), marker.dom());
      });
    };

    var after = function (marker, element) {
      var sibling = Traverse.nextSibling(marker);
      sibling.fold(function () {
        var parent = Traverse.parent(marker);
        parent.each(function (v) {
          append(v, element);
        });
      }, function (v) {
        before(v, element);
      });
    };

    var prepend = function (parent, element) {
      var firstChild = Traverse.firstChild(parent);
      firstChild.fold(function () {
        append(parent, element);
      }, function (v) {
        parent.dom().insertBefore(element.dom(), v.dom());
      });
    };

    var append = function (parent, element) {
      parent.dom().appendChild(element.dom());
    };

    var appendAt = function (parent, element, index) {
      Traverse.child(parent, index).fold(function () {
        append(parent, element);
      }, function (v) {
        before(v, element);
      });
    };

    var wrap = function (element, wrapper) {
      before(element, wrapper);
      append(wrapper, element);
    };

    return {
      before: before,
      after: after,
      prepend: prepend,
      append: append,
      appendAt: appendAt,
      wrap: wrap
    };
  }
);

define(
  'ephox.sugar.api.node.Node',

  [
    'ephox.sugar.api.node.NodeTypes'
  ],

  function (NodeTypes) {
    var name = function (element) {
      var r = element.dom().nodeName;
      return r.toLowerCase();
    };

    var type = function (element) {
      return element.dom().nodeType;
    };

    var value = function (element) {
      return element.dom().nodeValue;
    };

    var isType = function (t) {
      return function (element) {
        return type(element) === t;
      };
    };

    var isComment = function (element) {
      return type(element) === NodeTypes.COMMENT || name(element) === '#comment';
    };

    var isElement = isType(NodeTypes.ELEMENT);
    var isText = isType(NodeTypes.TEXT);
    var isDocument = isType(NodeTypes.DOCUMENT);

    return {
      name: name,
      type: type,
      value: value,
      isElement: isElement,
      isText: isText,
      isDocument: isDocument,
      isComment: isComment
    };
  }
);

define(
  'ephox.sugar.api.properties.Attr',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.node.Node',
    'global!Error',
    'global!console'
  ],

  /*
   * Direct attribute manipulation has been around since IE8, but
   * was apparently unstable until IE10.
   */
  function (Type, Arr, Obj, Node, Error, console) {
    var rawSet = function (dom, key, value) {
      /*
       * JQuery coerced everything to a string, and silently did nothing on text node/null/undefined.
       *
       * We fail on those invalid cases, only allowing numbers and booleans.
       */
      if (Type.isString(value) || Type.isBoolean(value) || Type.isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attr.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };

    var set = function (element, key, value) {
      rawSet(element.dom(), key, value);
    };

    var setAll = function (element, attrs) {
      var dom = element.dom();
      Obj.each(attrs, function (v, k) {
        rawSet(dom, k, v);
      });
    };

    var get = function (element, key) {
      var v = element.dom().getAttribute(key);

      // undefined is the more appropriate value for JS, and this matches JQuery
      return v === null ? undefined : v;
    };

    var has = function (element, key) {
      var dom = element.dom();

      // return false for non-element nodes, no point in throwing an error
      return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
    };

    var remove = function (element, key) {
      element.dom().removeAttribute(key);
    };

    var hasNone = function (element) {
      var attrs = element.dom().attributes;
      return attrs === undefined || attrs === null || attrs.length === 0;
    };

    var clone = function (element) {
      return Arr.foldl(element.dom().attributes, function (acc, attr) {
        acc[attr.name] = attr.value;
        return acc;
      }, {});
    };

    var transferOne = function (source, destination, attr) {
      // NOTE: We don't want to clobber any existing attributes
      if (has(source, attr) && !has(destination, attr)) set(destination, attr, get(source, attr));        
    };

    // Transfer attributes(attrs) from source to destination, unless they are already present
    var transfer = function (source, destination, attrs) {
      if (!Node.isElement(source) || !Node.isElement(destination)) return;
      Arr.each(attrs, function (attr) {
        transferOne(source, destination, attr);
      });
    };

    return {
      clone: clone,
      set: set,
      setAll: setAll,
      get: get,
      has: has,
      remove: remove,
      hasNone: hasNone,
      transfer: transfer
    };
  }
);

define(
  'ephox.sugar.api.dom.InsertAll',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Insert'
  ],

  function (Arr, Insert) {
    var before = function (marker, elements) {
      Arr.each(elements, function (x) {
        Insert.before(marker, x);
      });
    };

    var after = function (marker, elements) {
      Arr.each(elements, function (x, i) {
        var e = i === 0 ? marker : elements[i - 1];
        Insert.after(e, x);
      });
    };

    var prepend = function (parent, elements) {
      Arr.each(elements.slice().reverse(), function (x) {
        Insert.prepend(parent, x);
      });
    };

    var append = function (parent, elements) {
      Arr.each(elements, function (x) {
        Insert.append(parent, x);
      });
    };

    return {
      before: before,
      after: after,
      prepend: prepend,
      append: append
    };
  }
);

define(
  'ephox.sugar.api.dom.Remove',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, InsertAll, Traverse) {
    var empty = function (element) {
      // shortcut "empty node" trick. Requires IE 9.
      element.dom().textContent = '';

      // If the contents was a single empty text node, the above doesn't remove it. But, it's still faster in general
      // than removing every child node manually.
      // The following is (probably) safe for performance as 99.9% of the time the trick works and
      // Traverse.children will return an empty array.
      Arr.each(Traverse.children(element), function (rogue) {
        remove(rogue);
      });
    };

    var remove = function (element) {
      var dom = element.dom();
      if (dom.parentNode !== null)
        dom.parentNode.removeChild(dom);
    };

    var unwrap = function (wrapper) {
      var children = Traverse.children(wrapper);
      if (children.length > 0)
        InsertAll.before(wrapper, children);
      remove(wrapper);
    };

    return {
      empty: empty,
      remove: remove,
      unwrap: unwrap
    };
  }
);

define(
  'ephox.sugar.api.dom.Replication',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Attr, Element, Insert, InsertAll, Remove, Traverse) {
    var clone = function (original, deep) {
      return Element.fromDom(original.dom().cloneNode(deep));
    };

    /** Shallow clone - just the tag, no children */
    var shallow = function (original) {
      return clone(original, false);
    };

    /** Deep clone - everything copied including children */
    var deep = function (original) {
      return clone(original, true);
    };

    /** Shallow clone, with a new tag */
    var shallowAs = function (original, tag) {
      var nu = Element.fromTag(tag);

      var attributes = Attr.clone(original);
      Attr.setAll(nu, attributes);

      return nu;
    };

    /** Deep clone, with a new tag */
    var copy = function (original, tag) {
      var nu = shallowAs(original, tag);

      // NOTE
      // previously this used serialisation:
      // nu.dom().innerHTML = original.dom().innerHTML;
      //
      // Clone should be equivalent (and faster), but if TD <-> TH toggle breaks, put it back.

      var cloneChildren = Traverse.children(deep(original));
      InsertAll.append(nu, cloneChildren);

      return nu;
    };

    /** Change the tag name, but keep all children */
    var mutate = function (original, tag) {
      var nu = shallowAs(original, tag);

      Insert.before(original, nu);
      var children = Traverse.children(original);
      InsertAll.append(nu, children);
      Remove.remove(original);
      return nu;
    };

    return {
      shallow: shallow,
      shallowAs: shallowAs,
      deep: deep,
      copy: copy,
      mutate: mutate
    };
  }
);

define(
  'ephox.sugar.api.node.Fragment',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'global!document'
  ],

  function (Arr, Element, document) {
    var fromElements = function (elements, scope) {
      var doc = scope || document;
      var fragment = doc.createDocumentFragment();
      Arr.each(elements, function (element) {
        fragment.appendChild(element.dom());
      });
      return Element.fromDom(fragment);
    };

    return {
      fromElements: fromElements
    };
  }
);

/**
 * ElementType.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.ElementType',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.node.Node'
  ],
  function (Arr, Fun, Node) {
    var blocks = [
      'article', 'aside', 'details', 'div', 'dt', 'figcaption', 'footer',
      'form', 'fieldset', 'header', 'hgroup', 'html', 'main', 'nav',
      'section', 'summary', 'body', 'p', 'dl', 'multicol', 'dd', 'figure',
      'address', 'center', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'listing', 'xmp', 'pre', 'plaintext', 'menu', 'dir', 'ul', 'ol', 'li', 'hr',
      'table', 'tbody', 'thead', 'tfoot', 'th', 'tr', 'td', 'caption'
    ];

    var voids = [
      'area', 'base', 'basefont', 'br', 'col', 'frame', 'hr', 'img', 'input',
      'isindex', 'link', 'meta', 'param', 'embed', 'source', 'wbr', 'track'
    ];

    var tableCells = ['td', 'th'];

    var textBlocks = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form',
      'blockquote', 'center', 'dir', 'fieldset', 'header', 'footer', 'article',
      'section', 'hgroup', 'aside', 'nav', 'figure'
    ];

    var headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    var lazyLookup = function (items) {
      var lookup;
      return function (node) {
        lookup = lookup ? lookup : Arr.mapToObject(items, Fun.constant(true));
        return lookup.hasOwnProperty(Node.name(node));
      };
    };

    var isHeading = lazyLookup(headings);

    var isBlock = lazyLookup(blocks);

    var isInline = function (node) {
      return Node.isElement(node) && !isBlock(node);
    };

    return {
      isBlock: isBlock,
      isInline: isInline,
      isHeading: isHeading,
      isTextBlock: lazyLookup(textBlocks),
      isVoid: lazyLookup(voids),
      isTableCell: lazyLookup(tableCells)
    };
  }
);

/**
 * Parents.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Parents',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.search.Traverse'
  ],
  function (Fun, Compare, Traverse) {
    var dropLast = function (xs) {
      return xs.slice(0, -1);
    };

    var parentsUntil = function (startNode, rootElm, predicate) {
      if (Compare.contains(rootElm, startNode)) {
        return dropLast(Traverse.parents(startNode, function (elm) {
          return predicate(elm) || Compare.eq(elm, rootElm);
        }));
      } else {
        return [];
      }
    };

    var parents = function (startNode, rootElm) {
      return parentsUntil(startNode, rootElm, Fun.constant(false));
    };

    var parentsAndSelf = function (startNode, rootElm) {
      return [startNode].concat(parents(startNode, rootElm));
    };

    return {
      parentsUntil: parentsUntil,
      parents: parents,
      parentsAndSelf: parentsAndSelf
    };
  }
);

define(
  'ephox.katamari.api.Options',

  [
    'ephox.katamari.api.Option'
  ],

  function (Option) {
    /** cat :: [Option a] -> [a] */
    var cat = function (arr) {
      var r = [];
      var push = function (x) {
        r.push(x);
      };
      for (var i = 0; i < arr.length; i++) {
        arr[i].each(push);
      }
      return r;
    };

    /** findMap :: ([a], (a, Int -> Option b)) -> Option b */
    var findMap = function (arr, f) {
      for (var i = 0; i < arr.length; i++) {
        var r = f(arr[i], i);
        if (r.isSome()) {
          return r;
        }
      }
      return Option.none();
    };

    /**
     * if all elements in arr are 'some', their inner values are passed as arguments to f
     * f must have arity arr.length
    */
    var liftN = function(arr, f) {
      var r = [];
      for (var i = 0; i < arr.length; i++) {
        var x = arr[i];
        if (x.isSome()) {
          r.push(x.getOrDie());
        } else {
          return Option.none();
        }
      }
      return Option.some(f.apply(null, r));
    };

    return {
      cat: cat,
      findMap: findMap,
      liftN: liftN
    };
  }
);

/**
 * SelectionUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.SelectionUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Fun, Option, Options, Compare, Element, Node, Traverse, NodeType) {
    var getStartNode = function (rng) {
      var sc = rng.startContainer, so = rng.startOffset;
      if (NodeType.isText(sc)) {
        return so === 0 ? Option.some(Element.fromDom(sc)) : Option.none();
      } else {
        return Option.from(sc.childNodes[so]).map(Element.fromDom);
      }
    };

    var getEndNode = function (rng) {
      var ec = rng.endContainer, eo = rng.endOffset;
      if (NodeType.isText(ec)) {
        return eo === ec.data.length ? Option.some(Element.fromDom(ec)) : Option.none();
      } else {
        return Option.from(ec.childNodes[eo - 1]).map(Element.fromDom);
      }
    };

    var getFirstChildren = function (node) {
      return Traverse.firstChild(node).fold(
        Fun.constant([node]),
        function (child) {
          return [node].concat(getFirstChildren(child));
        }
      );
    };

    var getLastChildren = function (node) {
      return Traverse.lastChild(node).fold(
        Fun.constant([node]),
        function (child) {
          if (Node.name(child) === 'br') {
            return Traverse.prevSibling(child).map(function (sibling) {
              return [node].concat(getLastChildren(sibling));
            }).getOr([]);
          } else {
            return [node].concat(getLastChildren(child));
          }
        }
      );
    };

    var hasAllContentsSelected = function (elm, rng) {
      return Options.liftN([getStartNode(rng), getEndNode(rng)], function (startNode, endNode) {
        var start = Arr.find(getFirstChildren(elm), Fun.curry(Compare.eq, startNode));
        var end = Arr.find(getLastChildren(elm), Fun.curry(Compare.eq, endNode));
        return start.isSome() && end.isSome();
      }).getOr(false);
    };

    return {
      hasAllContentsSelected: hasAllContentsSelected
    };
  }
);

/**
 * FragmentReader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.FragmentReader',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Replication',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Fragment',
    'ephox.sugar.api.node.Node',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.Parents',
    'tinymce.core.selection.SelectionUtils'
  ],
  function (Arr, Fun, Insert, Replication, Element, Fragment, Node, ElementType, Parents, SelectionUtils) {
    var findParentListContainer = function (parents) {
      return Arr.find(parents, function (elm) {
        return Node.name(elm) === 'ul' || Node.name(elm) === 'ol';
      });
    };

    var getFullySelectedListWrappers = function (parents, rng) {
      return Arr.find(parents, function (elm) {
        return Node.name(elm) === 'li' && SelectionUtils.hasAllContentsSelected(elm, rng);
      }).fold(
        Fun.constant([]),
        function (li) {
          return findParentListContainer(parents).map(function (listCont) {
            return [
              Element.fromTag('li'),
              Element.fromTag(Node.name(listCont))
            ];
          }).getOr([]);
        }
      );
    };

    var wrap = function (innerElm, elms) {
      var wrapped = Arr.foldl(elms, function (acc, elm) {
        Insert.append(elm, acc);
        return elm;
      }, innerElm);
      return elms.length > 0 ? Fragment.fromElements([wrapped]) : wrapped;
    };

    var getWrapElements = function (rootNode, rng) {
      var parents = Parents.parentsAndSelf(Element.fromDom(rng.commonAncestorContainer), Element.fromDom(rootNode));
      var wrapElements = Arr.filter(parents, function (elm) {
        return ElementType.isInline(elm) || ElementType.isHeading(elm);
      });
      var fullWrappers = getFullySelectedListWrappers(parents, rng);
      return Arr.map(wrapElements.concat(fullWrappers), Replication.shallow);
    };�q\�~�1DP�P�t9�� Sf��XGB|�+�g>h����v�0�DL=�X�Z����
Z1G�ö���>#����a��� ��PL���z�Kha 	Ԉ(U." %i׃�gbM�@
�T�e � @
� �&��PlD �*0 (cH!+1�7����" �� @ 
�%�4 !P`����d��"�9�@)  �i$� j�'Bi=Gȝ���4o�$H� �r	����%�J�	ђ��)�!c a ��4V `��Wp (_2`� !� �C���*�0�RY\@2@��p�,��0&��(��0^�!�C�"Z�p,�T�DD	 :��QL�H�	2pʲ� 	ULAtj �`D��&H` h F�E�����E�ӱl� 	D�*A H�`�\HE`�#��
`	A�M6��t4�5%��9� O�#* �
 �PCLȂ0pdP�1�٘4��@����ХP��#b0`@c�N�>*hT.�ʝ |�({�p	h�HaMT���R ��0��E��6�B ^�2 	F�(����ș�x	� "H`Fd��4	�,b%O" $$�gbI:���Af�Th�1 �W�$*��	�P�@�m��IJp*��a���X�X�0��N\��(H��rzf:rC���IP�Đ4ǰ4T��Q��#&f>C� �Z#p�+���nąE2��D�@c3��L@G�
�J$�
��TYv�!��2 H4D��)L3�X��!�@4]8K�K�F�����C��2�� q���)L( K�t�
�"��T@,)�c.&X� 1 n�M�9���e	HJF`P�H J��	r:2F 
	c
��|: ����3��"N�$��`! h @b�� ��� $?S��Y 1 �BQPT'NFQ$�	�aH.���n�HD���%kI ��@��Ae� ��P��� ���c�!"�� ����
x�"S�% ��!5F`d'"k� T���4�@#����I �a0HdDl� j�"��?0[���eq��S��8�� �*���f`�@@T1@�EP�`)��7��{
�@�Z��A�L��Gd�,�8B2  
L�8�a�P��$��
�P �P
�F0s � �!]���(%F��tE�@� T	'SD؀�gD@�c(��Bܐ �S�@ �3��MA � �J @H�<����@�Y*%5� **$��L��
!~� 0@�<*�DQ$$T��P��+2�:
�0���q=TA
 ��W�4eҀ�M��r�T2�A�
	�@D`4�� @e#���Ab$3 �����0��b� ��8	T�*�( ��#�Q!�@��d�
���$�$(H>UHP�� Ȃ�]x�iH���e !�A-fY`��`����4@���� V�"aEE��W/�h�D�p���ɀ�| ��10�D��Bd2�_@���J� �h04A�`�OjEH�"�(�A ���  %�Ȩ"� �l�+]J��F�8c &#'Dl82!2Ȅ
  �@
*0tPE( frM�T�pA��T�&	%�r�h\��hB ����AA�V"H +@��$�@8Q	�i`0� &$)G�
�����
�	X V��FYB���M!P �!�#��A� o!�" 	�8K��	�M���).<���Dc�f�M�$u�����i:DxЮI����$8'��j��'aB�0�d	��F@$�@H<�!Y�('�� F�1� RzWBC<�[0� ��`�i�" =�i �07#,4� ��$jC� e'��Ñ !$��c t��fA0�$ �(H 
�L"� `(����Gl!�0�⭭Q;Q�H
��S�=DD��4U��d�� ��$=2�	V`@�N�,t �8�B@6A" 2�'J���4(	0ʨ+8�-�)��6#���?���'�1���k�M@�_B��YՃ���A0,=RJ�i�?,  �Ѵ�A#j`�2Z@GPC�� �@$��"Y(�'��P� Ԝ� � ;I=D���GC�@
��4�8I :��Zf@��� llD��"�j�<P%#T��\"P��@� �M�,Ft��DG �� 6JP�"�AQ�T�@t� � 	2}�&r30$�fS*, @-� �&� & �'�H� �܁�0+;FH �<� 3~ @%�c"�Ȱ�b��*�HBb4k���-c 	i��As�G@�@@,�´�&�٪n#���P< �J�N �C��� %����0�D �dզ���E���*"2� �QUe$θOe@�`vS0�r`D* ��dP``� pX�F
�$�� TA���B(�TЀ Gl-+#���r ��TqP��J�C`+
���  D� Q�d�T�d�j�F	F: D�h����$����ATE�u��� F�hX��F	"�k� �� ��B � � 29��T� 
T���  =V��A�o���@Q�� �O=��6߂+�& �0ƀ�� h ��Ȩf!U��!-K\Q��cB�		a(
@���`Q�h �/��hb�mxT�w�@�D�����T(֞<��:	/��I�P P*��]
"�d`�%��m �E�D��+BB�"He�A�A�
1"�����P�'�@��I�Y��1v 4xample output format text or html.
       * @return {String} Selected contents in for example HTML format.
       * @example
       * // Alerts the currently selected contents
       * alert(tinymce.activeEditor.selection.getContent());
       *
       * // Alerts the currently selected contents as plain text
       * alert(tinymce.activeEditor.selection.getContent({format: 'text'}));
       */
      getContent: function (args) {
        var self = this, rng = self.getRng(), tmpElm = self.dom.create("body");
        var se = self.getSel(), whiteSpaceBefore, whiteSpaceAfter, fragment;

        args = args || {};
        whiteSpaceBefore = whiteSpaceAfter = '';
        args.get = true;
        args.format = args.format || 'html';
        args.selection = true;
        self.editor.fire('BeforeGetContent', args);

        if (args.format === 'text') {
          return self.isCollapsed() ? '' : Zwsp.trim(rng.text || (se.toString ? se.toString() : ''));
        }

        if (rng.cloneContents) {
          fragment = args.contextual ? FragmentReader.read(self.editor.getBody(), rng).dom() : rng.cloneContents();
          if (fragment) {
            tmpElm.appendChild(fragment);
          }
        } else if (rng.item !== undefined || rng.htmlText !== undefined) {
          // IE will produce invalid markup if elements are present that
          // it doesn't understand like custom elements or HTML5 elements.
          // Adding a BR in front of the contents and then remoiving it seems to fix it though.
          tmpElm.innerHTML = '<br>' + (rng.item ? rng.item(0).outerHTML : rng.htmlText);
          tmpElm.removeChild(tmpElm.firstChild);
        } else {
          tmpElm.innerHTML = rng.toString();
        }

        // Keep whitespace before and after
        if (/^\s/.test(tmpElm.innerHTML)) {
          whiteSpaceBefore = ' ';
        }

        if (/\s+$/.test(tmpElm.innerHTML)) {
          whiteSpaceAfter = ' ';
        }

        args.getInner = true;

        args.content = self.isCollapsed() ? '' : whiteSpaceBefore + self.serializer.serialize(tmpElm, args) + whiteSpaceAfter;
        self.editor.fire('GetContent', args);

        return args.content;
      },

      /**
       * Sets the current selection to the specified content. If any contents is selected it will be replaced
       * with the contents passed in to this function. If there is no selection the contents will be inserted
       * where the caret is placed in the editor/page.
       *
       * @method setContent
       * @param {String} content HTML contents to set could also be other formats depending on settings.
       * @param {Object} args Optional settings object with for example data format.
       * @example
       * // Inserts some HTML contents at the current selection
       * tinymce.activeEditor.selection.setContent('<strong>Some contents</strong>');
       */
      setContent: function (content, args) {
        var self = this, rng = self.getRng(), caretNode, doc = self.win.document, frag, temp;

        args = args || { format: 'html' };
        args.set = true;
        args.selection = true;
        args.content = content;

        // Dispatch before set content event
        if (!args.no_events) {
          self.editor.fire('BeforeSetContent', args);
        }

        content = args.content;

        if (rng.insertNode) {
          // Make caret marker since insertNode places the caret in the beginning of text after insert
          content += '<span id="__caret">_</span>';

          // Delete and insert new node
          if (rng.startContainer == doc && rng.endContainer == doc) {
            // WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
            doc.body.innerHTML = content;
          } else {
            rng.deleteContents();

            if (doc.body.childNodes.length === 0) {
              doc.body.innerHTML = content;
            } else {
              // createContextualFragment doesn't exists in IE 9 DOMRanges
              if (rng.createContextualFragment) {
                rng.insertNode(rng.createContextualFragment(content));
              } else {
                // Fake createContextualFragment call in IE 9
                frag = doc.createDocumentFragment();
                temp = doc.createElement('div');

                frag.appendChild(temp);
                temp.outerHTML = content;

                rng.insertNode(frag);
              }
            }
          }

          // Move to caret marker
          caretNode = self.dom.get('__caret');

          // Make sure we wrap it compleatly, Opera fails with a simple select call
          rng = doc.createRange();
          rng.setStartBefore(caretNode);
          rng.setEndBefore(caretNode);
          self.setRng(rng);

          // Remove the caret position
          self.dom.remove('__caret');

          try {
            self.setRng(rng);
          } catch (ex) {
            // Might fail on Opera for some odd reason
          }
        } else {
          if (rng.item) {
            // Delete content and get caret text selection
            doc.execCommand('Delete', false, null);
            rng = self.getRng();
          }

          // Explorer removes spaces from the beginning of pasted contents
          if (/^\s+/.test(content)) {
            rng.pasteHTML('<span id="__mce_tmp">_</span>' + content);
            self.dom.remove('__mce_tmp');
          } else {
            rng.pasteHTML(content);
          }
        }

        // Dispatch set content event
        if (!args.no_events) {
          self.editor.fire('SetContent', args);
        }
      },

      /**
       * Returns the start element of a selection range. If the start is in a text
       * node the parent element will be returned.
       *
       * @method getStart
       * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
       * @return {Element} Start element of selection range.
       */
      getStart: function (real) {
        var self = this, rng = self.getRng(), startElement, parentElement, checkRng, node;

        if (rng.duplicate || rng.item) {
          // Control selection, return first item
          if (rng.item) {
            return rng.item(0);
          }

          // Get start element
          checkRng = rng.duplicate();
          checkRng.collapse(1);
          startElement = checkRng.parentElement();
          if (startElement.ownerDocument !== self.dom.doc) {
            startElement = self.dom.getRoot();
          }

          // Check if range parent is inside the start element, then return the inner parent element
          // This will fix issues when a single element is selected, IE would otherwise return the wrong start element
          parentElement = node = rng.parentElement();
          while ((node = node.parentNode)) {
            if (node == startElement) {
              startElement = parentElement;
              break;
            }
          }

          return startElement;
        }

        startElement = rng.startContainer;

        if (startElement.nodeType == 1 && startElement.hasChildNodes()) {
          if (!real || !rng.collapsed) {
            startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];
          }
        }

        if (startElement && startElement.nodeType == 3) {
          return startElement.parentNode;
        }

        return startElement;
      },

      /**
       * Returns the end element of a selection range. If the end is in a text
       * node the parent element will be returned.
       *
       * @method getEnd
       * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
       * @return {Element} End element of selection range.
       */
      getEnd: function (real) {
        var self = this, rng = self.getRng(), endElement, endOffset;

        if (rng.duplicate || rng.item) {
          if (rng.item) {
            return rng.item(0);
          }

          rng = rng.duplicate();
          rng.collapse(0);
  DB,�:�c� <�('0 ���-�S@ �)3� d,�v*�DGp#S� ��r�����4�0&i�IQi �A�K�
@ A� 
@�`$�� ���p��(A�P�p�}.�I`�80@mt����"��ĹM�]5^���Zo��嵷��
����{6
�fv��W�� �������c�g� Zy���w�㟪-���s��w����}�����_S�}�c�RZ}���O⎮�^�������P�������z�.����o����g������ߍ�u����n��M��c�u��m�{O��ڷ�����޳<o��������JuF}J��~���?������|�/��?]{��\���g���YWX���Sw]�w^��`PPH�
�E��S'(c� Y@5p�H ��&(D��@��A��T���B"��d$$^*��2�P) ��#� �J�(	�H	J����	�F� @������(�0&2�]͢�N�6�������b�6ήtw����֥�;�gz���p9�[��τ�=��\��%��Ӻ�ٲ���M]�4�_y����>m�s_�4��g���۬W��_9��׉�/�����X&�����'��~w��*�Z/�� .Lp��  �*@P`b�ggAP�1
@����0h�k�z �f4\d1 mP��Q�m�W�Ӡ
�e����HmH� >
.2�#c��7�!@I��p�QP"oQ����T`@Db�D#�F �(�B���ȁ1
 }D
T��T`!
�u��h�	B*@�5˼7�B��CF��&�AӪ��B�� �A pJ5�����z��Q�A!Ln�Jy8�
���e�l�}_�^~���ߖ7��in��\7d���g{ݳ�{���������x�����z�W�U��c\�	���[���ii'�{������������巍5����$}BA-@ 	 ��(*N,�
���Hj2 ��
C�B@yIL (@2OD���	�	#L2Q� @ � �֌@�fQi�0  +
��1P�0�@�=�=R ��pJ�Cd�C� I)b�P�@ݚ,���R��`�`Q�s��DL�5�\`�H�[�S'� �F�@pd�" � � �((du�g|�l�_�����}����z�����U��K�\�η���
�Pl�B@p�C �T�E�9�1$B��Z���	AR�dEҒ�H�ED %��@��hA!��#�Ȓ�P@� %���FS&��z��?���/T���I��OW�{�ݶ�����h���}3ǮͶ����յ'�W�ׯ�{�i�����7g�;����x��5�<�:c�q�o��
°��PVf���c�(`_ ��Ї��(�W( ��St��������8�����tn������\҇�vT�mn_ϵ�}{�s F�m���g}����~_��W��qT
0�	��@@���)A0
'( m
	�h�$�8�ٳ5Wj�l�oW�g��m��CE7�_i���y7y�m��f�~dw�N���o��_�>m���Y�������.ø����5�a}seZ5�V�݉ؽ?�����j���5��߇����=g����7��y�^�1%	�1��5h� @p�A[� I0��	%i`��3+�IA"Q>S	�]�ju�B&�"A@	"G9�X?`~�a	�Ċ�L a
�d�@b @K�"-<d �^D�%�hDh� H0@
�o�@�,�ԈE8��]P��P�"��"F�a�
�R�ƕф�C�@9��0�9,C  ���@�X��Q����4��-i2%^S�B�"	(
,v	��B�p� !#�Ȳ¨��� � !$�E�
ANޏ�웡�}����?����s�>�bw�p��7��;�g�w*g����/w?�l|��SV�������ջ�z�%�*�|����*�����}ex��w���D�����?��]����o��gOz��mo�_��%���[��F������d�M�z٭-�_����:�������l;�/����Ɵ��
����tI`�'����S~����w�sݥ��'���m��x�w{�{���Z������qi)g�|��U�~�����������������0�fB�.�\�XCP ��"0�0 ���p��d �8�� '  @�a S��,�`6#T�1 
Hb���Q  BB�
� �08
E)�`�@�$�`4 �F� p ����
� V �ah6�O1@=h%�B��"H�+�9r`. X�� ��
FY �%#��H �:R$@�a-�Ի#`
i�(��. �WD��GA��<` �L�8, eL @��b�  Dl[ �ěK$0e"���@�GB�!�����}�?�ԾۮM_�������k%|���f����Ͻ�]��-͙7_�Nx���1��:Y-�G�������M�[^���^vϺ���z�v���x�{��1��v��e쾓_�_�/�t��R�uS֗?��MT8��s�SO۔�J�n(�����ݼ��?�|Y�㚽�����믍�|7��_��h@w߿_5�'���.��
�
��� p��c��I R�` �c[)yPd��?,�� ��� T1V &��I2C"��� E� 
�H�)AZ �Y�8��  PB� Npf���`Qm@Bf�c�>���,bL ,
�B��� ��� �@ �kHJY�@*�
�:�0�P�!
%A:AJ�1` �0%  
 �9�A�� � t�-�E"���ֺB t��DB���)�	�B{8�����0 Nѥ81���n0�' !�'D	Lc{�����K�l��o�f������!�����;;����#ow����κH�|��C��M;���k�O���u�ti27���Í����u����������v�J���ֱ����ғ�z���������+K����.n�~��l��x��6�z���v������p��>��8��ҫ���������a�^�[�������Q����v}v�]\k��,/��O?�{��qr]�[��i<�>y�O��F��;:\�|_�EC�y�0�@~�6@��  ���&,@	d0�o$��=P�0$@��
QR%W�R�U�A>66������G1��J@\H   ����Jm�� �B��Xhh����4��� XC	��@)�}ڼ�O��������*�0�˾��C��k��Ԇ.y%��(���湺}���}�7�����v����mۦ���&��~��Ͷ���}�gnߟ��-�1}^�MZ�ߧ}��[����������,�=���,�n��@�!HBn
���t0"�P�� ��XE��x2�(�h��E��0b  A��H�H/IHGf��e8y(�RA�{����
F2V���� D�F� ��4T4�� �@0�4���G��� b%��A"��~��A�@��92���
&A)T�
p�Ih��Q��% E!Q�(t $a@�@ψh(� �Bn;b� D`�Q6M�����$Q� ���	a�9���݌����N�5ߧO<���\K�9��s~^��}������:������=����uo�f���f.w�����5moV�m��Vp��o�����:w�J�������[_�����:��R���w��@����n�.���;�ޔ � h F�Ԡ�H�jF0�"RRG 	�!H�*Hb���0��H5��09��))F����i��bBBf�*F@c0@
�$@* `	 �GXa�$YA�Ҭ"�O@a	i���d�����k�l�k�[��˻;����B;��ӷ7�c�׳�u�u��޻vZ�ɏ܇v��=֯}^�w�ѻt	m\�7k���g��O���w%5��z����[����U�f<��K�����������pO��/>�����	{��Qط_s�?|O�8�ϫ���]���Ҿ:��vo圫��*���ŻYt� ����+F0�We���JmSA���s��v�=���L���\"yq1G�������h�?4��r���F}�����Qj �T�	J�(�T�$ �H1�B`B	+�r�@ �'A��B@�f��8��2�u8ٰ � h��� Hi�$@��C*D�e��k
Q"XQ������N 'gA 
�a($Y ��@�@R��	*�a*@P{@Z YQ s�	��X� H�|��
�
tJ9�A4�n4@C � ���(�ȢU�� X�S���<T V�P#�pP�aᖀ*� 	@6� V2CPD�D
0��DR!@2��(TST,@S$�cUٌ���������|��?��_���'{�����X��sO�2��M�y�m����D9�,^����
���Ko_ܸ���=^��.�w����u�i�}������do�n}���j��m(��ӳ����k��0"�:	�5�GF�X��P�`ح
&�PB $KVB���#y�  :���!�b4k�p��
ƀ��P D�C�� 1 �`�C�Bd`��U�A�`C 2 ���p� "��5����#�B�5��S��[�8����L\=��^Qu�vq�M���������[w�[���߮^/��ѿv�~�okn��ޕY����۲��{�����-���k���Y�GƣӋ�;���w��������^k���f� 9�ŕ�M٪ϟ�P�����Վ캙{E�m�_+�2ƻg{�?��w����۾5��W���(xt����3�����=:;�����^ύ���篹��=^�V�j�n�%���Y���g�o���G7��\��-��bUR�Vy.���!�����pF�T
`Y�G柳�{/��$�k��#�b������h��%���u������Uw�F���2��0�Vx�wn��o���W��WC�'�o�����]�f���=���a}b��' ���L幟����6����y�a���X�sH�-t% �Z�q� Q���A@G!,b�4*1�TAh���D�"@h/B� ! ��	� jX��`��Bcq�I��iA(Q�J� �( ,�a
��
0�)�A`� �t�@�8 ���V0f$�dP�I!����T�T���@��JoE��'0��}5
����_�|}�o��\v�w����������o�-���宼�������c��o���*�{͛�w����j�o?s������<��y|��׾�g���{����]��D;�o}�7g��ض���[��r����_�W��ޗ�-�܏��{��}<!�ڧ�{Z]�SQ���O�^�(�����u���r��귿������T���
�%!A��E��@�(��
@����b�`
�:��D,^��
�y$(� P�vg�Ǵ_\�������0g�v]�����Ss�y��yzK��W��5כ>����ϯ�g���7������y�&���c����ל5��y���|���������t�oe�����ܙ��q��۟��姳}�sk����վ�W}��wne�����Uw��~�+
T�씡, H��D5:^��@.N�� 00��	`��p!	�b&$�C����P���(009��K�Q5��	�Ĥ�@ ��x�j ʠ�
 PEV �!  pA`&` �bK� �� @% � �h�
���"0���fh	���"#dP �h���@�V`�AW������ �� �(��X�pcT�7%xD�*z-�@�Y��0  
�F "@�Q�RB @��n�U|��{?~�e����o�v����%��\�ߴ�u�]g�ͳ���xn~q�{_Wk��7ܿ�7�{��?�w�n�H��ۧ���
�A��6��%w����{��ܮh��|r?�]���wo�{V��v���d�������/���ɖ��{p�߶�ʉO���z�����{��w���h�s����������s[s-j�G�b��0������;��P���K|� d��]!�$@D P��b!C 0T�'.Rl.
[(�#4I�P�A��aj ����&�[  ,>��I��!M��\�Jҵ ��q �0JZI!$�8$P� � &0�P?�$'�s����������g{�����ܛy5��Q�׿�Oj>�c�����y��r��J����x��e����i�������x��F��r��kF���{�u�&u�o#��*��^���گׅ�?�������-'\~(�R%�D+gj��l�� ,�R��A�ƨ��1WI\  X�&�ZE�61���Av��
��Q�"��5��K@RF``݀��:0����
6!
C�,��BH� U@��G�D�QA<$!�:�p��F����B�Ƃ� ��ݔ �  �  �@{9)ZT@� HL��X	�.2��D��` B���C	!� ��0��J*�HCCT(+h"ND�P�P�^�����3)�oۄ���v%Ӷ����v�����]���������iś����>���y-�[��r_��˽sG�9zzמ�'ӯ����w��[�{_������q�O���~�����^�7�������$k����I�" 'ޘ�I��28��Q��E�г�E�F
����FĈ��5!� � 0���sa8���j��P�@�T J� �c\X � @�rh�s%
 ��ab�5!�uˏ��_��O�)�$��-�k�����|��ΐ{���OG����ͻ������ڭ_L����\/�~�/d[Ϩ�r����j�J{ގ�v8���wI���_5���o�F��Zn��5�����N�������
��E,�T(e@�,�@M ��K��A\
8U� ������ ��_*TR��
z<HLa�OHr[!� � �A'
9@
�F� H� � |R��E�X0�����# `a)Q���'!0�2��)) ���@��Y4"�@��RhID�  npL 15!�p@+�ФE�%A|A@@C ��0�E�P	P #�J0[g\ H�@��H ^�R��L�< �=� mDBA��� ��(a^�z�^�_�?o&�L�^]G���ܪ��3�*����y�^�_O�y�j_\dK��AnoW����|�U:�Zw����{���d�����_�ۧ�����?�+�����>�-�ڹ������������aG�%^y@B ���
T�x eb �b�H�IB�%$H@X�М���F�@.��KI�c��o".k zhY�d����H�!�@��0
}̰ �@&)�$� }"!�@�I  a��uaH=`r���BF�1I D �9�^�k@< (
P'�&:�SZ0�C�J�.y�B@B�H4�D���ۉ�o���e<qߎ���\[�>���ow����G�����gw~�ku���>פ������-����?�ο��,�z�������+�����~�}�^~��~љ�>_�ڳ���~�mR٬�/��]��+=����r�� � ��	�$CZ%r�@N!"�$Xii�z��!(i�"	4�(���\<�& [D� �
`%�HtB�0��A�tB DI� � � �$�H"�QI46Y Y�V�F M�0�.!�D5D��5�	6P,KQp)DC �M!Đ	�l� �ͱ�/�\*�������)˙�����_?������ު�\���V�f���ۏ�x������5��v^���Ѿ}��|���9�ўe�}o��Լ������o���x����כ��oi�p������йvo0�c�� ��((�Y\D�	%� z�RRHT(d�eV� k�Ytd ���(��) 
H6Q:�ق�(���B�>�/X���_�҆���(�3���+{�w6I�g�����%݅8��~s��Y����Ξ�S|�u?����ٕη��h���ꜷ~��t������v��ڋ{��#�~p�����rW�l���[��?�m��w�v=���}�ې,���/&��{��������w�������5?�Mo!����=����廯�[�K?۴MG���W�Rrj������C�y�D6V;g6����lý�v��e���vI)������{/<���m�߿����c0@_���lD��FH�^�  &pE� ��l��� 5CM	N��PA�I)L%�!d��@F� @1B
�$8Rk�Z��*FP"	�VT��7���TXd�PA4�BI 8�1iB*4��ڿ������j��������g:�����o��6����������)WS7�\o���_�(�qo0wu4/��^]��_��3�y{�{�_���QQ;~���?���7|⣷֘�������{����AR
b A�t�4 ��6A8Q]3`m��PP�Mg ���[R��$�**Fe�� d$�`2!P �"P�J 
��W�������Y��)��}�g�[����w3���o�o��]����x�z���!�s)W�Z�����_�=j��垽4^����Ӈ��r���L�j����Ӷ�{�������E�p~��{ܛ}_��7�~?���₀�^��`J
�� �Y�C�	

@� �
���A���0 � %@QBa��U1�l�  �2L� )@ �$T�)���P�
��< CjA B@ ��f@I@�Sj�Z�"H�]��Vgv����W�$�yP��v����������{�2���h�����q���f��.18�O��zq?�vZםT���w������~�m����������o�����5�����ӗ_��"�� ��Ƨ|�����\��h���������w�����_ہ��������^�w��m3�����N�h�O��苯�����bC��8+�W�}���W�~�}���cܾ���̝~��K��F���o�������+���ȷ^�����ϻ>^P��ac
CHD��H@� hD*�d �LR���Y:I �K� �� P��E��* q��2�4H��� 1-�
�P ��d�#� �3  �8""2&X*h!
�7GDAYB�T��MܭzZ~�#���]}ķ_l��{�\��K��Y��{��9��v7�6�>�XЯ�������򿽐�+���w/����?���}[�v�Wox��}���jKϤ���̪�;]u�4��e�����ޭ2|��>7�KE' Jh �X-$bBJ)� "� `� �*f�(@d�� \������E -(��xH�/ A�@0)4��"��J] l�P ����I�@b< �
 ����f%������'Tn����ɍ��E�����r��[i�Kmqo}N��'�m�o��u���׽���uthf��,��#6s�ud�}�q�Œ���4��]�]��K����U�ƛ���v��������^+z���������������v���!r�À$Ag�f���� ��ȍ����d�J�@*)m����)`�F����6(��(� �p !�r"
�" H��ᧄP�@���p�xHId���hB��	� �l�b �ͮ��������doߦ����{K��������۟�^�����>G�g�������������fu4��lR߿zҏ����w�gͧ�:[��Wh'.�ݝ�o�b���n����]��O;�jj���?�z�xq��i�ņ�{?��k���a}�_�� �C��]�u{�>����ԫ�z�=�ᜋ����m��f�5uo��臨����x���ٽ��%�?m���}�����}~m����������-LV���qe���=�Z�U����&�dq �=�ES͈!M 	�D"v� �����#ab�1f>6 Pb�e���Jd��Ƣ&�� HX#��L��G @�i��+�A�B8O Y7v
U�4**Scz ��JJ��������橜���~Ua�|���_=�����Z�п����v����n��_��bܮ�{�/���_���y�ۘ��N�}wm�ǳـ�Ğ���]���춻�����9)��'��=���o����=�M�c��	hW�PJ,;El�(�
`a�!c�i�@`��`"�D, ����F!	' J@$5CE�BH��'�Lk)'���v�g��)>N��(�A�0�A�)G�� Ag( @*f���`N`ɐt
                return startContainer;
              }
            }
          }

          if (elm && elm.nodeType == 3) {
            return elm.parentNode;
          }

          return elm;
        }

        elm = rng.item ? rng.item(0) : rng.parentElement();

        // IE 7 might return elements outside the iframe
        if (elm.ownerDocument !== self.win.document) {
          elm = root;
        }

        return elm;
      },

      getSelectedBlocks: function (startElm, endElm) {
        var self = this, dom = self.dom, node, root, selectedBlocks = [];

        root = dom.getRoot();
        startElm = dom.getParent(startElm || self.getStart(), dom.isBlock);
        endElm = dom.getParent(endElm || self.getEnd(), dom.isBlock);

        if (startElm && startElm != root) {
          selectedBlocks.push(startElm);
        }

        if (startElm && endElm && startElm != endElm) {
          node = startElm;

          var walker = new TreeWalker(startElm, root);
          while ((node = walker.next()) && node != endElm) {
            if (dom.isBlock(node)) {
              selectedBlocks.push(node);
            }
          }
        }

        if (endElm && startElm != endElm && endElm != root) {
          selectedBlocks.push(endElm);
        }

        return selectedBlocks;
      },

      isForward: function () {
        var dom = this.dom, sel = this.getSel(), anchorRange, focusRange;

        // No support for selection direction then always return true
        if (!sel || !sel.anchorNode || !sel.focusNode) {
          return true;
        }

        anchorRange = dom.createRng();
        anchorRange.setStart(sel.anchorNode, sel.anchorOffset);
        anchorRange.collapse(true);

        focusRange = dom.createRng();
        focusRange.setStart(sel.focusNode, sel.focusOffset);
        focusRange.collapse(true);

        return anchorRange.compareBoundaryPoints(anchorRange.START_TO_START, focusRange) <= 0;
      },

      normalize: function () {
        var self = this, rng = self.getRng();

        if (Env.range && new RangeUtils(self.dom).normalize(rng)) {
          self.setRng(rng, self.isForward());
        }

        return rng;
      },

      /**
       * Executes callback when the current selection starts/stops matching the specified selector. The current
       * state will be passed to the callback as it's first argument.
       *
       * @method selectorChanged
       * @param {String} selector CSS selector to check for.
       * @param {function} callback Callback with state and args when the selector is matches or not.
       */
      selectorChanged: function (selector, callback) {
        var self = this, currentSelectors;

        if (!self.selectorChangedData) {
          self.selectorChangedData = {};
          currentSelectors = {};

          self.editor.on('NodeChange', function (e) {
            var node = e.element, dom = self.dom, parents = dom.getParents(node, null, dom.getRoot()), matchedSelectors = {};

            // Check for new matching selectors
            each(self.selectorChangedData, function (callbacks, selector) {
              each(parents, function (node) {
                if (dom.is(node, selector)) {
                  if (!currentSelectors[selector]) {
                    // Execute callbacks
                    each(callbacks, function (callback) {
                      callback(true, { node: node, selector: selector, parents: parents });
                    });

                    currentSelectors[selector] = callbacks;
                  }

                  matchedSelectors[selector] = callbacks;
                  return false;
                }
              });
            });

            // Check if current selectors still match
            each(currentSelectors, function (callbacks, selector) {
              if (!matchedSelectors[selector]) {
                delete currentSelectors[selector];

                each(callbacks, function (callback) {
                  callback(false, { node: node, selector: selector, paren����z
�4��m�Lb`T$�ȁ( �@p�P2���LR�0��LK�3ŵ �����h����(j$�	�
�)$c�# �苈�l�n8u� �T�T��,A[� 	T
ASb k0�G`�R������B.�,4�%��!�%�_�ht3Kf�LDa9�WxD�hL'@�$���� �f�fC�,���Ї X
0R �Ш��P �	ـ1��� ��8��$Θ�`! V .!��� J�<� ��p$a�ԍEZ�F��+�B��"���� �!��DTj�@OP�#cF�L�� �)E�#�#oM�l!��P�J00fn!��Q2n;�E>7D͓F�P0ik, ű"��U�`yHS� �A�
�4 ���!�B#T��r4-� 9�4! 20J)�<7��BB��d1t:)�FCdJ=�:
�D`%T �܂�% 4@�
 2� �\dS��T�`��h*�� � 
"�SB�����d!��B& 
��x�����@L
43�  ����Vx) � N�YU�A�P�9�ۤ�tl9�E�͹�DQCE�HI�dE�D(�ZX
	: Ҙ t*@TI��qJP�B^C B�� 1��PP���4)��ăXa@��(�Q����I�
b-���ܡP2� �� ��%&E� Qh+G�#�X�B1�*���.(��� � OKԐ)F�7��c��}8HJ�bP	C*+Ls%[_����!DSB IX���`
��,�-����E�%�ɦ�jnZ4B���
��Q�$Y�6�(�+�!����Â��^.�3!���Uqx�) 4$Q@��.D1��B0ER�� B�T��"P0@{"Ȃ����B |)%r
J�`�e��A,TR@� xL��i��
����B,.��T u&� �R��` �C�X�񙃔	� ���@�
9!"I�hT�RP!��Ґ�Q@�����`�J��B�0Q��� �F-`0����ҙ��� )��p��Gh� ���6%\��0��'W9P@
`(0��B�H�pE�H8=���d���m�
Zڔ�  ��!kkZ�@n�c,���>�����)
PYđ�9!*�0R �Hx)���"|E���  p, 1�D">0 � "=YPF�=�bx�K$(!�NB`0�.�"b$(T�D� P���B�r���0R � j�
l�����?�	�B@a@� �Y\ д�Exs�"�Qj�p�A� ��F0d��I�R;  "�1�Q,�dDA
 B�x�3`)Q�� `FĀ�Z��"!>��@�Q�T �(x i� DHPm�$�����@D���<
H4�!P�#VT����* � e%�
"(��"�0@�����iIB���j`	��I  !1��� "��"PI9Z�!�� p�P �+H��bF.iX+�+X hH�*���+ ,�8+�%ғA+�X#<P�@ƀ� �]/&��aC�F���Iy��H �M�AbA��Ƞ #)%ٻI޸�*6 ��̰P#@��
�7	贔hO~
���D�  ����6��a Q ��ЅP4�rA4� ���rZHPO$�2bl�&	Ff<L ��Հ -�p��) �(�Zm��  7��a-��� BC��0�Ȑ� 5�W8b�E�Z���d���JA4�N����Q�b�M� �FX-Z`64�i�
�A�e�#X�K�`K@=�+�:�p��P��.�
)�@`��B �u� x�@P�� J%Q
A@�aB�9�i@$�L"�"" 	���@ !iQ�J2��Ex���q$��a��1 C#�d PY�-� ���"#�� 4�n�@}����," ��  � �X�+C��@@�;�(Ea�(�"BP��N�ɋ�H	
Ú5�FFH�l �� B� H�  i�"���b���(����4�jDh��Ȗ
İG*It�|��(k��l&tb��EfW߄��$�����8B��@!�
 ��3T� s�*���*��s� D��
�l!CL NE�P
$�~�H�!��b�Wt �#� RJ[8���� �P� �((I)�P0lPG���� E�!\dbc�bTe��f� 6.�2���+d$�2# �F"d�I��F��(�JN@�+C��� b&�!	B0�"f�`DЄŰRE�c�Ҹs/@���, �
� B$��F`
D���
�$ťpx�#�e
 X�E`�$a�G0�@=7|�"(p E��!r�_ �XBh�T 4C(@	$[ `S�EB$HbO��� C@0VBD@�8NPT�� e� �J���dj
R��dF�0 �J C���X�H�A��x�='&���\��@�0r	�px�S��jJF)I��dP$��D��Ξ��t��r
՝AR��&$	L�"dD�
�4 THt �u @L =Y"@%���Q� )l�J� P����S ���
�i���Cg��MP�Т��
�
v
v
��E
'
KK  ��WW��    ������������3�3�����F�F���������A�A�r�r�G�G����.�.�J�J���d�d�f�f�u�u����׽սճӳ�_�_�+�+������������̦˦�c�c�=�=�2�2�@�@�d�dƜŜűıĕÕÊ�����������#�#���g�g�6�6�,�,�ȱȱ����������o�o�W�W�X�X����稜���S�S�-�-���n�n�����|�|�X�X�����#�#���&�&�0�0��������付�������;�;���]�]�.�.ۏߏߊ�� � �y�y�������t�t�~�~�	�	�=�=���������������������!�!�r�r�y�y�%�%�m�m�5�5���0�0�Z�Z�4�4�����o�o���4�4�z�z�����G�G���A�A�K�K�����������������������c�c�������%�%�I�I�����������߰����ܷڷ���`�`�a�a�z�z֨ը��������ԨԨ�7�7չչՎ֎֐א�=�=�����i�iٷٷ��������هه��������ן֟�\�\�����|�|�9�9�g�gШϨ�A�A�`�`�|�|ϖϖ���L�LЭЭ���v�v�������,�,���������*�*�i�i�s�s�������G�G�H�H�a�a�;�;�0�0܃ۃۢۢ�����y�y��݉݉�������N�Nޗޗ�)�)�'�'���t�t�[�[�-�-���}�}�^�^�����M�M�����������)�)���p�p�&�&���������#�#�����U�U�����\�\���c�c�_�_�&�&���F�F�_�_�����S�S� � �[�[�B�B�h�h���������
�
���F�F�����+�+�'�'�������p�p�X�Xٿؿ�I�I�o�o�a�a���������b�b�������������������^�^�&�&�E�E���������_�_�������������K�K�q�q�O�O�������������i�i�/�/�����������������������T�T���!�!�i�i�������������7�7�k�k�7�7ӏҏ�\�\�.�.�X�X���P�P�"�"�-�-�O�O���������q�qӦѦ�r�r�Z�Z���������m�mϓϓϵϵ�W�W�����u�u�2�2�c�cʴȴȻƻ�����0�0�7�7�[�[�0�0�&�&�J�J�����������k�k�����ڱڱs�s�T�T�����+�+� � ���;�;�a�a�l�l�^�^�z�z�9�9�+�+���������*�*�?�?�������������a�a�)�)�����U�U�����������7�7�J�J���!�!�Z�Zƀǀǋȋ�}�}�����y�y���2�2�����K�K������������� � �����x�x�������B�B������ � ==���
�
<
�
�
�
�	�	<<����� � ����M�M�5�5���������������>�>�����������r�r�����  OOMM�	�	��~~������55++����������  �!�!A#A#}

      function wrapInHtml(elm, ancestry, siblings) {
        var parent, parentCandidate, parentRequired;
        var ancestor = ancestry.length > 0 && ancestry[0];
        var ancestorName = ancestor && ancestor.name;

        parentRequired = getRequiredParent(elm, ancestorName);

        if (parentRequired) {
          if (ancestorName == parentRequired) {
            parentCandidate = ancestry[0];
            ancestry = ancestry.slice(1);
          } else {
            parentCandidate = parentRequired;
          }
        } else if (ancestor) {
          parentCandidate = ancestry[0];
          ancestry = ancestry.slice(1);
        } else if (!siblings) {
          return elm;
        }

        if (parentCandidate) {
          parent = createElement(parentCandidate);
          parent.appendChild(elm);
        }

        if (siblings) {
          if (!parent) {
            // if no more ancestry, wrap in generic div
            parent = dom.create('div');
            parent.appendChild(elm);
          }

          Tools.each(siblings, function (sibling) {
            var siblingElm = createElement(sibling);
            parent.insertBefore(siblingElm, elm);
          });
        }

        return wrapInHtml(parent, ancestry, parentCandidate && parentCandidate.siblings);
      }

      if (ancestry && ancestry.length) {
        item = ancestry[0];
        elm = createElement(item);
        fragment = dom.create('div');
        fragment.appendChild(wrapInHtml(elm, ancestry.slice(1), item.siblings));
        return fragment;
      } else {
        return '';
      }
    }


    function selectorToHtml(selector, editor) {
      return parsedSelectorToHtml(parseSelector(selector), editor);
    }


    function parseSelectorItem(item) {
      var tagName;
      var obj = {
        classes: [],
        attrs: {}
      };

      item = obj.selector = Tools.trim(item);

      if (item !== '*') {
        // matching IDs, CLASSes, ATTRIBUTES and PSEUDOs
        tagName = item.replace(/(?:([#\.]|::?)([\w\-]+)|(\[)([^\]]+)\]?)/g, function ($0, $1, $2, $3, $4) {
          switch ($1) {
            case '#':
              obj.attrs.id = $2;
              break;

            case '.':
              obj.classes.push($2);
              break;

            case ':':
              if (Tools.inArray('checked disabled enabled read-only required'.split(' '), $2) !== -1) {
                obj.attrs[$2] = $2;
              }
              break;
          }

          // atribute matched
          if ($3 == '[') {
            var m = $4.match(/([\w\-]+)(?:\=\"([^\"]+))?/);
            if (m) {
              obj.attrs[m[1]] = m[2];
            }
          }

          return '';
        });
      }

      obj.name = tagName || 'div';
      return obj;
    }


    function parseSelector(selector) {
      if (!selector || typeof selector !== 'string') {
        return [];
      }

      // take into account only first one
      selector = selector.split(/\s*,\s*/)[0];

      // tighten
      selector = selector.replace(/\s*(~\+|~|\+|>)\s*/g, '$1');

      // split either on > or on space, but not the one inside brackets
      return Tools.map(selector.split(/(?:>|\s+(?![^\[\]]+\]))/), function (item) {
        // process each sibling selector separately
        var siblings = Tools.map(item.split(/(?:~\+|~|\+)/), parseSelectorItem);
        var obj = siblings.pop(); // the last one is our real target

        if (siblings.length) {
          obj.siblings = siblings;
        }
        return obj;
      }).reverse();
    }


    function getCssText(editor, format) {
      var name, previewFrag, previewElm, items;
      var previewCss = '', parentFontSize, previewStyles;

      previewStyles = editor.settings.preview_styles;

      // No preview forced
      if (previewStyles === false) {
        return '';
      }

      // Default preview
      if (typeof previewStyles !== 'string') {
        previewStyles = 'font-family font-size font-weight font-style text-decoration ' +
          'text-transform color background-color border border-radius outline text-shadow';
      }

      // Removes any variables since these can't be previewed
      function removeVars(val) {
        return val.replace(/%(\w+)/g, '');
      }

      // Create block/inline element to use for preview
      if (typeof format == "string") {
        format = editor.formatter.get(format);
        if (!format) {
          return;
        }

        format = format[0];
      }

      // Format specific preview override
      // TODO: This should probably be further reduced by the previewStyles option
      if ('preview' in format) {
        previewStyles = format.preview;
        if (previewStyles === false) {
          return '';
        }
      }

      name = format.block || format.inline || 'span';

      items = parseSelector(format.selector);
      if (items.length) {
        if (!items[0].name) { // e.g. something like ul > .someClass was provided
          items[0].name = name;
        }
        name = format.selector;
        previewFrag = parsedSelectorToHtml(items, editor);
      } else {
        previewFrag = parsedSelectorToHtml([name], editor);
      }

      previewElm = dom.select(name, previewFrag)[0] || previewFrag.firstChild;

      // Add format styles to preview element
      each(format.styles, function (value, name) {
        value = removeVars(value);

        if (value) {
          dom.setStyle(previewElm, name, value);
        }
      });

      // Add attributes to preview element
      each(format.attributes, function (value, name) {
        value = removeVars(value);

        if (value) {
          dom.setAttrib(previewElm, name, value);
        }
      });

      // Add classes to preview element
      each(format.classes, function (value) {
        value = removeVars(value);

        if (!dom.hasClass(previewElm, value)) {
          dom.addClass(previewElm, value);
        }
      });

      editor.fire('PreviewFormats');

      // Add the previewElm outside the visual area
      dom.setStyles(previewFrag, { position: 'absolute', left: -0xFFFF });
      editor.getBody().appendChild(previewFrag);

      // Get parent container font size so we can compute px values out of em/% for older IE:s
      parentFontSize = dom.getStyle(editor.getBody(), 'fontSize', true);
      parentFontSize = /px$/.test(parentFontSize) ? parseInt(parentFontSize, 10) : 0;

      each(previewStyles.split(' '), function (name) {
        var value = dom.getStyle(previewElm, name, true);

        // If background is transparent then check if the body has a background color we can use
        if (name == 'background-color' && /transparent|rgba\s*\([^)]+,\s*0\)/.test(value)) {
          value = dom.getStyle(editor.getBody(), name, true);

          // Ignore white since it's the default color, not the nicest fix
          // TODO: Fix this by detecting runtime style
          if (dom.toHex(value).toLowerCase() == '#ffffff') {
            return;
          }
        }

        if (name == 'color') {
          // Ignore black since it's the default color, not the nicest fix
          // TODO: Fix this by detecting runtime style
          if (dom.toHex(value).toLowerCase() == '#000000') {
            return;
          }
        }

        // Old IE won't calculate the font size so we need to do that manually
        if (name == 'font-size') {
          if (/em|%$/.test(value)) {
            if (parentFontSize === 0) {
              return;
            }

            // Convert font size from em/% to px
            value = parseFloat(value, 10) / (/%$/.test(value) ? 100 : 1);
            value = (value * parentFontSize) + 'px';
          }
        }

        if (name == "border" && value) {
          previewCss += 'padding:0 2px;';
        }

        previewCss += name + ':' + value + ';';
      });

      editor.fire('AfterPreviewFormats');

      //previewCss += 'line-height:normal';

      dom.remove(previewFrag);

      return previewCss;
    }

    return {
      getCssText: getCssText,
      parseSelector: parseSelector,
      selectorToHtml: selectorToHtml
    };
  }
);

/**
 * Hooks.js
 *
 * ��#Dy�|�E��m�Nǯ�^��2o��S��h����E��o��[ߴu���u�����?�,��4�cu-�N=���߹Ԟ辷�文~y�d���Oj���j��JP�������]�_�}�=~�����  �)�@#H��@@K�!�A8���s�R�B
�B @�**H`@
Ȕ,� ���  �%�@$ (�-����l0@�� 	�ep���k�8P 6LP2`H8 ǆ@�E>��� '�8# �
  1�I�$�(h�,RF�C�X0�P�� #&L��ꒈ��@	DQ���C�G� 
� 	D ��P! � 	   �F@:$B 0Й��G�LD�d�M���d��&�'����ko���ʵ��Ϯ	�;>֌o��V�=�}d���o;e���ؼ5����o�������x9[��r#�[��eƏ�?�oo���ګ�{-�g��ξwG_�����W�cl�!�  ba )�8'��P����PDa 5DF�H��(_-Eq.��&dc���H  �q�x䦱��� �F����	

`��C�%��h��n`�H���ƪ@��F$)"� U���;܃�s�k�[���}���]}����O����p-�i���t�s��η{[N��w�ϳtV}�z���������o�\~��/���]���k�'���w�z��_,�7�_������i�-�'��w�}���a�p���^��,�N�������}{�o�V��폯n;�{Q������wa�?��V��6���w�^C�����X��w�7��]$ٜ:��1Tŝ��\����rTc�M�v-\֗�|v+�G��wϱ�����N�e	�`� ,�`���  � K�   �� �� <�R T��bj ��h:"/P�b ��		0�0dD� ��h�`/L��!Q�MI�D@ ��"
B� D(�"�\� �P[ V"�RPp*�Vp� �$����d("��H(2��] i�
�B &���F�]&�-�H)�A!�`��� �	�!Y���@ �Pp@*�`��#	�$�� ��0�!���,`@A�@� ^"K��
 J����� �R8�@(@  H�"v]��p��(Y@���}��&��s�O���])��h����?���3J(����W��wc�T�O�ލ������ �f\��������|�Y׵�ˍ�9�|�~��Y}U����tz�g9ŷ����5t�S;�o
) QCr�	@� N  EB&)C9I@4�c���#@��� `p �$�Kj�h=P��8F��� 8�0@��$L�1�+@:�B0��@C >s�+@  B`�P $b��>Q���y��=t��
?�ާ������7�e>�5E���N�f
����@`	P �r0@AL�
��Z�  �p$��tE�$'� ����90�dB��@`��!�����%�
�� 
B�	   A�_ˎ�����{��_����
�N�K�nɧ�~I�@� h ��E  �8���b'$�3p��y( b��HJ�N ���X@A�R��d B�P ��0 Q" 
 �AX�����M��)J���8@XR�<b`b�p�� �6�;dPlh<A$��� ��.� �	�B!g 4����ܙ�P�[��a���/��
 A�
�p4WS 0 ���� �� � �1���x<`� � ��2,vBL �`!� !TP������e8B'A�xp�`D  ���!+�E�" ���D�$M!b H� B@ �@�@	��JD%8�T"��! �d�}���Oyh���YƐ�
tmr��_��U�����7}�ַ�/����'�͜�ǟ��Yϕ������f 	B����B��Om������&�}��TNu����g�~��蕐�*]fX?tj�����]��_��u�'Ӡx$ ���� b��\��!	BF�-H��  \0 �� F��KE�dB��B ( P� "08�(��8 (H#�R%��P���" !�� �h# D$d"��*a����t��=:�2���ۘ�{��k�?�?{�J۫�I�F�kk�G�g��i�"�xg������������5�v7/X�_�v�6�c��z����Cx���p�k`���0��/֎���Ow���>~��R_��?0֛�WlD��קU!��Ff&�Ow'�&l9d���F��}����y�x�2�x��/�}������v�9\����
      }

      function getParents(node, selector) {
        return dom.getParents(node, selector, dom.getRoot());
      }

      function isCaretNode(node) {
        return node.nodeType === 1 && node.id === '_mce_caret';
      }

      function defaultFormats() {
        register({
          valigntop: [
            { selector: 'td,th', styles: { 'verticalAlign': 'top' } }
          ],

          valignmiddle: [
            { selector: 'td,th', styles: { 'verticalAlign': 'middle' } }
          ],

          valignbottom: [
            { selector: 'td,th', styles: { 'verticalAlign': 'bottom' } }
          ],

          alignleft: [
            {
              selector: 'figure.image',
              collapsed: false,
              classes: 'align-left',
              ceFalseOverride: true,
              preview: 'font-family font-size'
            },
            {
              selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
              styles: {
                textAlign: 'left'
              },
              inherit: false,
              preview: false,
              defaultBlock: 'div'
            },
            { selector: 'img,table', collapsed: false, styles: { 'float': 'left' }, preview: 'font-family font-size' }
          ],

          aligncenter: [
            {
              selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
              styles: {
                textAlign: 'center'
              },
              inherit: false,
              preview: false,
              defaultBlock: 'div'
            },
            {
              selector: 'figure.image',
              collapsed: false,
              classes: 'align-center',
              ceFalseOverride: true,
              preview: 'font-family font-size'
            },
            {
              selector: 'img',
              collapsed: false,
              styles: {
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              },
              preview: false
            },
            {
              selector: 'table',
              collapsed: false,
              styles: {
                marginLeft: 'auto',
                marginRight: 'auto'
              },
              preview: 'font-family font-size'
            }
          ],

          alignright: [
            {
              selector: 'figure.image',
              collapsed: false,
              classes: 'align-right',
              ceFalseOverride: true,
              preview: 'font-family font-size'
            },
            {
              selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
              styles: {
                textAlign: 'right'
              },
              inherit: false,
              preview: 'font-family font-size',
              defaultBlock: 'div'
            },
            {
              selector: 'img,table',
              collapsed: false,
              styles: {
                'float': 'right'
              },
              preview: 'font-family font-size'
            }
          ],

          alignjustify: [
            {
              selector: 'figure,p,h1,h2,h3,h4,h5,h6,td,th,tr,div,ul,ol,li',
              styles: {
                textAlign: 'justify'
              },
              inherit: false,
              defaultBlock: 'div',
              preview: 'font-family font-size'
            }
          ],

          bold: [
            { inline: 'strong', remove: 'all' },
            { inline: 'span', styles: { fontWeight: 'bold' } },
            { inline: 'b', remove: 'all' }
          ],

          italic: [
            { inline: 'em', remove: 'all' },
            { inline: 'span', styles: { fontStyle: 'italic' } },
            { inline: 'i', remove: 'all' }
          ],

          underline: [
            { inline: 'span', styles: { textDecoration: 'underline' }, exact: true },
            { inline: 'u', remove: 'all' }
          ],

          strikethrough: [
            { inline: 'span', styles: { textDecoration: 'line-through' }, exa��%$����
	��)$��Z�^�pQ�Ex@�!"\A0�����P��
D�B.�q6)�	P$$�MD�>��<a��  hX(� $�Wр!�����*���hlژ��0�&����d(����Z�}}�Ŵ뷖�7K��7�&��=�?��;������{����������<����?�wo��?���/�n�[��e~v��囜������%��^}�����tL��+�����������]�?x��k0?��P�}����-��R翌������Ug��m_�������~��������ͬ_}��@_�����}?{^�������W����{��v����ߛ�{����2>������F��T{+M�X6H�a�]0m�y�k���wO鉝���v�!;�iY'�<AP$E�!F
)�0#ȣ���DA�n���%��A���ǈ� P@o�
=��	��SE�\L�{ R_���28���7�E������t�\Z�iF�I�aA���%(� �=
��k\z!<���U#�XW�(��@�U�c%���$Gms�H�A���4n� Kq\
�2�	#�t�@��E/A�- ��E^P�8�B3Q~�� ��P���P"l�Ҁ�P��ADb� h8`���EB(ZDa��� ;�@��0N	UA��&!�E�R�f�8U� �u,�S@��i�����z[����o�}��
?	�H��>0�Ɓ�	��.2�A���aX�)!Y�@0 d+D��ȑ��
ӓؤfZ8Q ��` u�Oj�$�A��ңҾ��:
Q�(��C�"�� U��F@�o��A�� ��� ��r���`'�l��2��I(u:0�0�� �&���]POP�C�a��4f]`7ATLr�dJ�g��}vw�?��O_���y]o�?��^��Y4�~��ͬݶ����֯�������w����s�¿�w�5ڽ�}�z9w�m�=����^�v�۝P�1=��^�ݵ��qK���;Ͼ�������7o���{�F������_=��/�oZ�����{�<��������T�w܍�f�ڝ�g���}�f�����W�L��Wv�6���I��~~�_��W���e{�a�#��?��g{k�o������;}��_����ۼ�������ο��I�ՀCJ"�g�!��&22Qå4�	�%#��0�S!�*
��3gqЄ0*�	M�G�  䍅�$g�?* �`��r�U�>R
�(Ͳk*
��Q��t�@�
o� �/��Ӱ��B�Z�14Ð��j 
��!� JP��Ӻ����! C @�Z����:J*-b��j!
,+k���K �I]�̠�$LDm�
A^,هUaU��5��b7 <bD�aEh1=0�r��)ؤl:�
S�qD��6 �6%��%$�w4����·�nK�α�|�����wr�����3_�/����w�����û|�~��|�����q������Ǭ��}�vxoN���]��'w��O��=oV���4K���w��u�������wm��m��?���[����d��
��څ)*fܜ�L���D"�!
�H�&@�P~/	��`\Q��C b�Ѵ_�$!^b=Id 'h( IF� ����b�I�  � �+`	��n+* Dِ�XXzJ�·������b��--���]��C^׷3�^����=�������;�����o��oǯ�[4y��ǻ�>y�O��kM������������j��o����H�}��]�V��:T]�~��뺷�����o�=;��Y�ߖӞy͙o��:]�z�����?��km�՟�]�=q�?
Hf�C�T���$L椞<� P�
p�(P(Ĩ���z���Y��#��#�G�����\�-c@��I �ZNAV@e�`)!�r
,�P�T���i�	!(!P�)�E���M{o�M+}�����޹��˼��~�g�������z�m�W�*wO�_�������\���}��ߤ�����O��������h��7�6�׾���ǽf����v���ϰ�}��M���q??�ʧzy�*�K�^�w�`1a�ot%j1�d)����%�n�@X .C��ύAwĬ�x>��$���"X�b� �(W
E Fu�@�^B�=DMg��f
Hv�DeV�V`$$���4\$MU@fE8� O�(�V�&����I*���BK�H������VK ���Q�Ipu>���x�,��h��,Qh�<T`3U���JfD�!� %
�V�Z$� b"A	M]�N�Ɇ�vB33�2���Y+�K �r�/@�$=
$r�o���m_��_{]���=̗g>t����y��˞�-���������Rs�����?~�����m��f�&���?�{��]-_q�Vq����#�����_����U���꽷��������>��⭎�.���n (format) {
              // Set deep to false by default on selector formats this to avoid removing
              // alignment on images inside paragraphs when alignment is changed on paragraphs
              if (format.deep === undef) {
                format.deep = !format.selector;
              }

              // Default to true
              if (format.split === undef) {
                format.split = !format.selector || format.inline;
              }

              // Default to true
              if (format.remove === undef && format.selector && !format.inline) {
                format.remove = 'none';
              }

              // Mark format as a mixed format inline + block level
              if (format.selector && format.inline) {
                format.mixed = true;
                format.block_expand = true;
              }

              // Split classes if needed
              if (typeof format.classes === 'string') {
                format.classes = format.classes.split(/\s+/);
              }
            });

            formats[name] = format;
          }
        }
      }

      /**
       * Unregister a specific format by name.
       *
       * @method unregister
       * @param {String} name Name of the format for example "bold".
       */
      function unregister(name) {
        if (name && formats[name]) {
          delete formats[name];
        }

        return formats;
      }

      function matchesUnInheritedFormatSelector(node, name) {
        var formatList = get(name);

        if (formatList) {
          for (var i = 0; i < formatList.length; i++) {
            if (formatList[i].inherit === false && dom.is(node, formatList[i].selector)) {
              return true;
            }
          }
        }

        return false;
      }

      function getTextDecoration(node) {
        var decoration;

        ed.dom.getParent(node, function (n) {
          decoration = ed.dom.getStyle(n, 'text-decoration');
          return decoration && decoration !== 'none';
        });

        return decoration;
      }

      function processUnderlineAndColor(node) {
        var textDecoration;
        if (node.nodeType === 1 && node.parentNode && node.parentNode.nodeType === 1) {
          textDecoration = getTextDecoration(node.parentNode);
          if (ed.dom.getStyle(node, 'color') && textDecoration) {
            ed.dom.setStyle(node, 'text-decoration', textDecoration);
          } else if (ed.dom.getStyle(node, 'text-decoration') === textDecoration) {
            ed.dom.setStyle(node, 'text-decoration', null);
          }
        }
      }

      /**
       * Applies the specified format to the current selection or specified node.
       *
       * @method apply
       * @param {String} name Name of format to apply.
       * @param {Object} vars Optional list of variables to replace within format before applying it.
       * @param {Node} node Optional node to apply the format to defaults to current selection.
       */
      function apply(name, vars, node) {
        var formatList = get(name), format = formatList[0], bookmark, rng, isCollapsed = !node && selection.isCollapsed();

        function setElementFormat(elm, fmt) {
          fmt = fmt || format;

          if (elm) {
            if (fmt.onformat) {
              fmt.onformat(elm, fmt, vars, node);
            }

            each(fmt.styles, function (value, name) {
              dom.setStyle(elm, name, replaceVars(value, vars));
            });

            // Needed for the WebKit span spam bug
            // TODO: Remove this once WebKit/Blink fixes this
            if (fmt.styles) {
              var styleVal = dom.getAttrib(elm, 'style');

              if (styleVal) {
                elm.setAttribute('data-mce-style', styleVal);
              }
            }

            each(fmt.attributes, function (value, name) {
              dom.setAttrib(elm, name, replaceVars(value, vars));
            });

            each(fmt.classes, function (value) {
              value = replaceVars(value, vars);

              if (!dom.hasClass(elm, value)) {
                dom.addClass(elm, value);
              }
            });
          }
        }

        function applyNodeStyle(formatList, node) {
          var found = false;

          if (!format.selector) {
            return false;
          }

          // Look for matching formats
          each(formatList, function (format) {
            // Check collapsed state if it exists
            if ('collapsed' in format && format.collapsed !== isCollapsed) {
              return;
            }

            if (dom.is(node, format.selector) && !isCaretNode(node)) {
              setElementFormat(node, format);
              found = true;
              return false;
            }
          });

          return found;
        }

        // This converts: <p>[a</p><p>]b</p> -> <p>[a]</p><p>b</p>
        function adjustSelectionToVisibleSelection() {
          function findSelectionEnd(start, end) {
            var walker = new TreeWalker(end);
            for (node = walker.prev2(); node; node = walker.prev2()) {
              if (node.nodeType == 3 && node.data.length > 0) {
                return node;
              }

              if (node.childNodes.length > 1 || node == start || node.tagName == 'BR') {
                return node;
              }
            }
          }

          // Adjust selection so that a end container with a end offset of zero is not included in the selection
          // as this isn't visible to the user.
          var rng = ed.selection.getRng();
          var start = rng.startContainer;
          var end = rng.endContainer;

          if (start != end && rng.endOffset === 0) {
            var newEnd = findSelectionEnd(start, end);
            var endOffset = newEnd.nodeType == 3 ? newEnd.data.length : newEnd.childNodes.length;

            rng.setEnd(newEnd, endOffset);
          }

          return rng;
        }

        function applyRngStyle(rng, bookmark, nodeSpecific) {
          var newWrappers = [], wrapName, wrapElm, contentEditable = true;

          // Setup wrapper element
          wrapName = format.inline || format.block;
          wrapElm = dom.create(wrapName);
          setElementFormat(wrapElm);

          rangeUtils.walk(rng, function (nodes) {
            var currentWrapElm;

            /**
             * Process a list of nodes wrap them.
             */
            function process(node) {
              var nodeName, parentName, hasContentEditableState, lastContentEditable;

              lastContentEditable = contentEditable;
              nodeName = node.nodeName.toLowerCase();
              parentName = node.parentNode.nodeName.toLowerCase();

              // Node has a contentEditable value
              if (node.nodeType === 1 && getContentEditable(node)) {
                lastContentEditable = contentEditable;
                contentEditable = getContentEditable(node) === "true";
                hasContentEditableState = true; // We don't want to wrap the container only it's children
              }

              // Stop wrapping on br elements
              if (isEq(nodeName, 'br')) {
                currentWrapElm = 0;

                // Remove any br elements when we wrap things
                if (format.block) {
                  dom.remove(node);
                }

                return;
              }

              // If node is wrapper type
              if (format.wrapper && matchNode(node, name, vars)) {
                currentWrapElm = 0;
                return;
              }

              // Can we rename the block
              // TODO: Break this if up, too complex
              if (contentEditable && !hasContentEditableState && format.block &&
                !format.wrapper && isTextBlock(nodeName) && isValid(parentName, wrapName)) {
                node = dom.rename(node, wrapName);
                setElementFormat(node);
                newWrappers.push(node);
                currentWrapElm = 0;
                return;
              }

              // Handle selector patterns
              if (format.selector) {
   
`��@#��̅_R5 �P��.� @�A TD��C����f�%	�O�*�z�&�00�R�+���@<A	P�!; �	@!>�Z�(J�I ��f��46�@ �V
����_�~��q����u�O��X���Ck�zu��[��g�o�~��g�l��������ꗻ箧;���ᗯ�/7�}��߿����]������_�}��E|�#}����3�w3;�k����S�ے���_���K_om��}=�������N�}�g�ַ�[o͛���#�2���q�~�Kｮ�]V��?n{����~z�;?���t�	�9zs���y����/?���U��Z��qO{{����k�>m��{�]�_���������_*o���Հ��TMv(l\
�f	H?�
�(��
� ( "1�Bb-b��w ���s-�`!�&,�p�@an@l)
Z�
|B�[5a�h@+È8m
6 D����h�@#��P	"p1��) 8@H�dI�R�*N  �F�r����$~g����QFi% ��	�4� �4	�pg��f��U�?6��_���G_��|n�}����������{���������������St�w�e�~~|_�O�tXt9s�_/�k7i��?������z߮R����������NW�6��w���=�{V��/��_�
�*R� K�0�b I W�� $� Y�B@7!I4�ތ���b3j9�sp*Cv,z�(��
9�/	#�W��![���������N�W���
 ���p��e';�P bT �&�Y�H�1�h-�"L��H�a! 
T�De�#+P A��"����+003�N@n �����{�!�!ºagFP�%�  0�q"\h  6�d
m F�u���G+jb��-S��6P"e���c���ۼ��8������>��x]6_Ϭ������V�m_�y�����;����������3��xO����{_��?>�=�՝ϋ�7�����}�����?{<����Y������{���{�7��{_Q� )(d
$@����g@��gDW	�Q���H�˒���� �\ M���C ������P�Ȋ�P���{T(!BU Y�F,D�$�	���� 0UHp�+	@�ItD� v"2�4��f_�>W���5�u](�k~+��,�����uӫ�:ʋ�sҟ��}�{�hn?���:�W��|Ͽ���+��cݷ}�Ms�|��o<n��]b�����Zؿ�w�Mh���������+��U�!���]�}׌9�y�_��\{��Z[��ﳵ-�֫��~��������͎o��裉�N��^�%������qOm>�k�������^��R�VjV��������/��=��>|�w׻��Ğ�U��;��b�yǱ�ڞc���p)d9R �P�)p��`�>�U )
� F����B��PT}�`C��P�� ��#�I�O��D)5@O %EHL�#IFT�B�%��P�Pe�D� ��x�b  ���z�'n7�Կ]�����Ͽ���]�.�}���ߧ����O�����l��總�o�ϻ���m�>�O�׷o}��G��������������Kz�
�3��5��޿���6�ky��l�m���J�z��
 �=)m]	"�
���$D:A!2 �ũ0I
��p0��R	"@��0�gD�h���������O���������rKt�l7���y}ޠ���-�͑�z��4[�u�����������7��ԥg��oZ�Gw�5-G��a��=��H�������z?�]o���5��t�yo����vT���'�:����j�0C� #+��9�K ��_D����H`G�肀3��Nƀa �B��(�Ƃ bB�E��uH����v����0��(2& ��da P"��OBl �@2d0�S�=����?�Z-��Qh����o��3����������y��}������O�r;�����[��/-�$��t���������������������-~sY���G�.����{�)�4��.E����O��������޿������9q]�����U����}�����������or�R�^�k��?��|:�;������q��_L>�{��ck����/��c>����������^Y~�?&?m����_��u�yg�̝^H����M�c�-�B*q� !� �� A���a����q�R"��F�6�j ��bJp��H>�}$ S��!B� ������Ke;PR1 _� �� &���� 32P�a�3�	��x���o�\��_�}�o��zOW�����%�����ڼ�wӹy�o�{]K|׮�u�һ�z�����q����/��������8)������{z���Z����wz�W�s���~�?��᲏�f/�sz��� O�4a�P��Pv$ 6QTd�ho �H��S����C1X 7� "�4$� �Xc�2�E8��C� �W�hK
��C@b�pfO�
P$أ���&`R� $����0]�`��|D#Ն�@�Hʛ;� A�|�����#�	��x �``P'c���4��%� $ �`c8��%�oQT<H"�p�e��5A6�@3@�C�
 &�	aPH�� %Ys��
^�2��!�*�$ 	�^�Y0�/�,5f�T=N3p&9 � $@/��r���!��� b���R�h���!�d/jlD�a�F���,H�~�	kJGr�x`	�CMmNC4DAH���j�$?!  4����G�E�)P@ %�9	3��s(C�
Yp�3|�`h�1�!�� N+*�bMHĐ�(  � (��d�D� ��D��"�� Ul$��p��r` (#J#���% h �F��'�m5А�>B!��H��"�DH�����	O0�"E���q�Ъ��1Pd���H 	�#*�T�@ �E�,��LWP�� 
b�щ%�A�(`�D@� X�P٢w@] �+B�b`���c
T�@"�>��6��B�'(�ć-��z���JP��f/%7D�
q�0	#���   5,����0	y\�	G�%�Up
hh
� @F��ٺ�	
���" �N a�R�P��I�Š*Uw�t�)��pH��H��6�P�R"�B� a�@��1�!(A�!@��5����ׁ  �� �(j!N0P�� 2F�-C�CхrH@⪄L\�! @��X�KM�(	�� i,���pAJz�I؆B�h �����.�S$���Z0!��G�D�U��]��0�@�K8	70��
�@	�(DAgIh�0�%@I�F�� ����"J�zH�00�"&�� D3�)dU���	(�P$#Hd	��Ҁ��	t|��&�=��* cj 2 !C�� T�9<���W���� u�@�%NsC��d���K��E�� ��%B��&Q@*"�#�5D�!h�@���b�PX� D ! �Q�� ���0�
%I^�HN�0�f� .�b!�G�I��@�H!X�D2�	8��Ձ�c�B!�h  �0�I� ��`M�"��M��Ć��'�2�á2 +
�d�K` �D)4(QO  �?` �	�F��`�d��(�E
���(m�=�F�B�eH@ 	N �1��д�� ��C�� dEap@� JEC�  ,�0 �H
,�t���PBfd���)C�B@�8�7S�XH2��l�+"9e !���Q�#J�hd@ b-�:�-1�JDi#*�a���� �pD�b FLk��S��K�R �@|H��B��Be�< �.8�F�V@���D��he�d��b�d�R���x0C��� R��0�5�
@�8�A�LEh0X���3
O���
J�J#�P��D��'� (�� ''2@�H�br-�Tb���0A����x  ���K&,����Db"O �$0�Dn��d��4"�PDE��=�2�l�%�@Q@�5-j�E����D�� `8G!���&��C�Q��864�2� ��" :rP��
��� a,��7�rT���D�I���0C �C(�b��h4�Ln�#F�C��G- &	jHPR��S� j�
A��E����B�$@S�@� $-aCd�"C>�)B`�3!
 0`(��P�����l�U"$6:YP!c E�H��/Г5!�
6��b�� �;$G�ˢ Б��:$��`�N��03��P$tg`�ڊ�(*�+ %�,[�`!�)��Q(�
� ��� P�� �  #�l��%H�aH�1Y䖘!�Ƹ�4�z��>���H 2��'��
�p�@P� ��� FfP�, ���	����J���(��� Av�rM 9�d��>`h0,b|ڊ+F��/"�:�� b��4/�V�)���<H���`��ĵ�*=@D0+
-c�$b��0�]�!!`J��(�C	&� NQK,@��D�hH�j&�P6dm�����@6@�� c ��a� @�L"^_FUj��<,�~�6A��5�@�/b��2����9O�
!.!9�������C)W�M�$�S���ϛ� !0s��(D�J�a`VRR4[Ĉ��F�P"��3������J0��$0P� X� `�# �B�Q *��A82�L�R�$!�GL�:�4H �K�<�))M&`������8,W,� � 83q� }�5�q�PC$(	H2%�1�D���JG2�\ ��&<| �-T�0�3<�b�I�T1Ą�PP{$�$�M��(6'c��`�Ya	��b �@B���*֘*i�* �$h�"F!�6� 3�FR�-@�X!`��d�ۉ� �,�@  Sb$4 QEP" ��
��� �)
|�hK� 
͐ѻ &�L,� �nI��*�bDz�0`�H��`A6�LH0*�"��� �� 
�)��T�M�� ��ۑ!)@`��*	S!��.
�@8�40"�
�E$VP��E@��RP!Hd+�p���% HB
/��A�+�C({(��!��蘐���@�0d�Hd#2 C���E��/�%��+fL|1C�	� & 4�0�V�����H�fr0M�.�6� "a5�g5�$!� �	9J�� � �� A��
�D��B� �ҕ`DB
�m �� U  �4B@�AŠQ��LL��r@�� �$����l� �D�!�:�@
��Q
%'f2t��2 ���?�C5������`  t@(D���pH��UQ # �Lt �P
 �8���(&�'@� T$ �������߾���meܻ�����
�|˖ut�.k�����u?O�=�q�G��1���(�/����W��S�s�ϲ�ْ!��%��R���k������xq���Ji����F�⻥~�.�y5W�ڟ���������;b$۟�.�W�/������om�͕������Ӿ����}K�����}�v�z�����������t��So�+�?�����^ѝ��R���S0W�Q�?�>�����q=�rVGLӱ}}ߞJ_��,��?;��������^�]�Ǘ��s{��c������ƿ������������]��������;�]����s��{{�|ܯ����&��������O�_�����0�=���-����d�����vz�%;�U~��976���sL��եk�>�2��*u�Xl	/�?�[?�b~m����f���������;3�Vzq��/���������5��}�ڝ��&�w�����ߩ���/�9{y�o�6w��{�<R�E�o=�����[�v���/��W���)��bO_�W�F�Ώ��]��]����4���;K����[��.���������{������|���_������o?]���k���׻�����~��Ov�;��һ�Q��^���ރ����=�������f��W��ݟ�������w7��.�t̫;�C����������w�6z��	��7���I����ɛ|�׿�Jٗ���ٗ�����`���˱�_͗�����Z���������7�r�������p���t�A�3�Vپ\�0�W����ڪ�\��r������Wx����~&*
��6�����裷�u�����y��1�3��T.�k�|�Ug��ֿg���v}x��������ɟ�/?~c������}'{����ޜ���9#�}���z�Vp���i�T�]�\7���J}���o���N�4<[����nv��߭����;�������~��/�����:��k}�;��7������Q�Y���{����^[vi���_�o-;���X��?��<p�7����ރ��|��ɹ�������|���__����w���z��=�����F��%gw����{�fݙZ����?��:������}s=߼M��M��EUG�/g����Ox�:�t7K�F!��O�����=��O=K���7��l�ۼ������)��E�{��_���ܦ*
O������X����]~�g���y�	���z{~+�^R1�>�4������=;�ۻ���~�<���_���o6���}�-g��/ھ�<�����e����Wթ?�}g�w�g^S�����ϟ��t�f����s)c�;�/��6���z3�X�mg�ݻ�ݿ�����<�z��������o�o|�VO���fŏ�߭��?h�����3�<�K?�r�������7��S�{����u|*Z���.�ˏ�x�\E��.��������Qg��|Q�tY�h�{Yk��]߿z{>��m^�_�q�r��W��O7u��_�,�W#�������wv;�X��/�ڏ��7oY�^����~���P����=V�?��ߢ7�cw�^�]���=�����)Gl�۷�-�w�?o�y��z����}i���F!�]����c���/o���������{�]{<��ͯ���.��?�v����Vݯ���u�����k�kf��,�i�:zwui�w��頳|������������O��$�~��L^?�������z��K����k\�W�������l����~��v|P97m�������{�/������L�h�!ݼ��	Ny����K���_�o��ۻ��=h��'?ڏ���SF��~{4��v��G��,u����z���k.�}_�g����tw�C�8t�����Q���w��3�����O��{}�l�=�]Kv�ע���V�>��u��7�����;Iw�2���_������S�z��~���N_�G������o�&����v��8�w���ͫ����NF߾z��;��ջ���w�e���{?�ﵟ���>7��՞+=��b���ݏN������~a�����}�ڿ�}ƣ��/����wO_��\o�v��S�+tV~��?'����^9���������������^�1I�4G���������k�M��^�K٦�_zOw�����W,~��ӹ�}߸���}T�׽��Һ�����ܕ|-?]��������zH߯d�m������}v��Ŷ�6�G���7�w�����"�M��������_5W'ݍ��M��������>��L�=e�[��o�����,{b�����e���M�[�|����{o.���{��������i'�����
��gw�j;�s����Y���o��|����e�պ�'�������(ۼ���ꜭ�_��o����]s�C3��������~���~<��o��u��<��f�[��ٗ��(��Q���VE�z���HrU��I ��1���{�����F:��[���w�K���?��sI�]�9;sV_�ɭq3}W��n���௭g�����V��a�[���f��/]�rپ�����j�|���F��n���g��
          });

          return formatRoot;
        }

        function wrapAndSplit(formatRoot, container, target, split) {
          var parent, clone, lastClone, firstClone, i, formatRootParent;

          // Format root found then clone formats and split it
          if (formatRoot) {
            formatRootParent = formatRoot.parentNode;

            for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
              clone = dom.clone(parent, FALSE);

              for (i = 0; i < formatList.length; i++) {
                if (removeFormat(formatList[i], vars, clone, clone)) {
                  clone = 0;
                  break;
                }
              }

              // Build wrapper node
              if (clone) {
                if (lastClone) {
                  clone.appendChild(lastClone);
                }

                if (!firstClone) {
                  firstClone = clone;
                }

                lastClone = clone;
              }
            }

            // Never split block elements if the format is mixed
            if (split && (!format.mixed || !isBlock(formatRoot))) {
              container = dom.split(formatRoot, container);
            }

            // Wrap container in cloned formats
            if (lastClone) {
              target.parentNode.insertBefore(lastClone, target);
              firstClone.appendChild(target);
            }
          }

          return container;
        }

        function splitToFormatRoot(container) {
          return wrapAndSplit(findFormatRoot(container), container, container, true);
        }

        function unwrap(start) {
          var node = dom.get(start ? '_start' : '_end'),
            out = node[start ? 'firstChild' : 'lastChild'];

          // If the end is placed within the start the result will be removed
          // So this checks if the out node is a bookmark node if it is it
          // checks for another more suitable node
          if (isBookmarkNode(out)) {
            out = out[start ? 'firstChild' : 'lastChild'];
          }

          // Since dom.remove removes empty text nodes then we need to try to find a better node
          if (out.nodeType == 3 && out.data.length === 0) {
            out = start ? node.previousSibling || node.nextSibling : node.nextSibling || node.previousSibling;
          }

          dom.remove(node, true);

          return out;
        }

        function removeRngStyle(rng) {
          var startContainer, endContainer;
          var commonAncestorContainer = rng.commonAncestorContainer;

          rng = expandRng(rng, formatList, TRUE);

          if (format.split) {
            startContainer = getContainer(rng, TRUE);
            endContainer = getContainer(rng);

            if (startContainer != endContainer) {
              // WebKit will render the table incorrectly if we wrap a TH or TD in a SPAN
              // so let's see if we can use the first child instead
              // This will happen if you triple click a table cell and use remove formatting
              if (/^(TR|TH|TD)$/.test(startContainer.nodeName) && startContainer.firstChild) {
                if (startContainer.nodeName == "TR") {
                  startContainer = startContainer.firstChild.firstChild || startContainer;
                } else {
                  startContainer = startContainer.firstChild || startContainer;
                }
              }

              // Try to adjust endContainer as well if cells on the same row were selected - bug #6410
              if (commonAncestorContainer &&
                /^T(HEAD|BODY|FOOT|R)$/.test(commonAncestorContainer.nodeName) &&
                isTableCell(endContainer) && endContainer.firstChild) {
                endContainer = endContainer.firstChild || endContainer;
              }

              if (dom.isChildOf(startContainer, endContainer) && !isBlock(endContainer) &&
                !isTableCell(startContainer) && !isTableCell(endContainer)) {
                startContainer = wrap(startCon�o�.T��}�����e�_��m?�ťv�}�Og��>9�>oM���sJ�|��0��=hMs��>���}����O�]~-�nZw�ߋ�mw��Qu׿�d�}ޛ��gy����
!j,PP���� oBvFAGCJ���k"`#p��B<a�p2>P8WV%b+V2�D� (�,U 
_�����n�󔗹�|�����p�6�����k��_�����޵�������7����_c��׶~ J'�^9�BZ���!k�<<I �HɅ��XUq���%u*=|�	x$ a<� �#@g�&9g�@S�r�p 
&5�jI0��%j0B0b�Ee���V�
B2H�dJ���x �� (�{$�!f!T"P�  P��1��B$IA* �@l ME$�7.��� �R@Nt��E�π�!�q!"Dp��/�Y3��AJ2�Mk��* 1�	�X���e@���0?(�
S��
� *	��2r�D������
�;��b8�@�Ё	7��9�� �NFx��!}����*�*aՂ�@��ɶ6��������V_�#������v���{��ۆ�{��������F[�x���~�5?�v�S��������r���xƋn������/'���ws��?O�|�����?�����
�n�ݚ���_p�������w��@������� S�Z���NaD�X����f�:(��� C$��t�G��!, �@��`BE""YrE �  �fLD2�VJ�8����$!`��@Q�! m��\���= 
��Wc��gj����������׼�g^/��ۂ�o3�ݑ+�$��v~�����׏_�o��M�8����ӯMk�� b=����N�w�j��߿����}&��/����_������'�On������_��r���g���ۘ_���u��W�����{�%���o�ͽ�]3r�������_�?��_��������_w{��c�ϳ�������N�~���_,��=X=^���v�G�g���;�d}=ϯ��KG�}�+���#s�M���
T�zK�+�D�@ �x�h# x� CQ��  I���M���ǏQ�JMM�BB���&aԫ@�bQ�W���|Zw��%������������-4���q��o~֜μO֋��xU<-������E����ϓ��{�y��?����6=�k������﷮9Ֆu�ﾖo�v߭�M��?ǵ�����U�]����_ߣ
������R�@s(� юCB��P"�5�7G�$Q@T�,�F���NB��A^An%��*�0�Q@�� ؅�.�/F����D�y%�٨��1�M`���� C�� ��<�G�:�	^���@�@�"`2>��)*@��*S��1*��B0���#H�p���#  �y�31�āQsdM-� �ZTB�G���	f�
�����*&S�Z:v��e[�P�@IT�j$.	#���"���e(0vF}���Mk^{?����y��߷���[����#|�}e�y���}K���������?r���-�v��+O7���T��=}���A_��g/Ƽ�|�����v�����[��ν����iw����|��u��{Q��9�� �&<�E	�@Q� �K�H'3�B��ȉ� �@�|@�t̮1 �V, G
����H�Ѕ*�lx��V`�c��� :�A5����BDЁR�0�eQ�Dm���0�#�`����$�j��μ��ox�w���ٟ>d���/��������=���ﾏ���~v���>����)�Q�������q۽����>��{�����������o��-���~�����o����o�����\�|������+m����eo��~��?����
�P{���W�-r�Y��kz�5w}�?�W��__�ַ�߽f���y�{�������u���ԺQՖ ,3Bt7A"��s!�"׍p�`�z��IKbj��9Q2�%A%�{0�B� �D��&J�������
��0#șG�
��`�S@��BG@ܡY�\��$���'�1Q��ס%�@٨5����P'` �Q���v���-?��w��{��T��?���-�������6���Νߗ6���������w�?�����>������y��������%&��Vڵ~Yq�����r����vx���*��](��m��+����O�l[�K���E�Zo��{���U���]^��R���ț�
�`an\�0�`�I!6�'b i� X�cd �t���!!0rЂ�(�(���J%�ly(name, vars, node);
        }
      }

      /**
       * Return true/false if the specified node has the specified format.
       *
       * @method matchNode
       * @param {Node} node Node to check the format on.
       * @param {String} name Format name to check.
       * @param {Object} vars Optional list of variables to replace before checking it.
       * @param {Boolean} similar Match format that has similar properties.
       * @return {Object} Returns the format object it matches or undefined if it doesn't match.
       */
      function matchNode(node, name, vars, similar) {
        var formatList = get(name), format, i, classes;

        function matchItems(node, format, itemName) {
          var key, value, items = format[itemName], i;

          // Custom match
          if (format.onmatch) {
            return format.onmatch(node, format, itemName);
          }

          // Check all items
          if (items) {
            // Non indexed object
            if (items.length === undef) {
              for (key in items) {
                if (items.hasOwnProperty(key)) {
                  if (itemName === 'attributes') {
                    value = dom.getAttrib(node, key);
                  } else {
                    value = getStyle(node, key);
                  }

                  if (similar && !value && !format.exact) {
                    return;
                  }

                  if ((!similar || format.exact) && !isEq(value, normalizeStyleValue(replaceVars(items[key], vars), key))) {
                    return;
                  }
                }
              }
            } else {
              // Only one match needed for indexed arrays
              for (i = 0; i < items.length; i++) {
                if (itemName === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i])) {
                  return format;
                }
              }
            }
          }

          return format;
        }

        if (formatList && node) {
          // Check each format in list
          for (i = 0; i < formatList.length; i++) {
            format = formatList[i];

            // Name name, attributes, styles and classes
            if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
              // Match classes
              if ((classes = format.classes)) {
                for (i = 0; i < classes.length; i++) {
                  if (!dom.hasClass(node, classes[i])) {
                    return;
                  }
                }
              }

              return format;
            }
          }
        }
      }

      /**
       * Matches the current selection or specified node against the specified format name.
       *
       * @method match
       * @param {String} name Name of format to match.
       * @param {Object} vars Optional list of variables to replace before checking it.
       * @param {Node} node Optional node to check.
       * @return {boolean} true/false if the specified selection/node matches the format.
       */
      function match(name, vars, node) {
        var startNode;

        function matchParents(node) {
          var root = dom.getRoot();

          if (node === root) {
            return false;
          }

          // Find first node with similar format settings
          node = dom.getParent(node, function (node) {
            if (matchesUnInheritedFormatSelector(node, name)) {
              return true;
            }

            return node.parentNode === root || !!matchNode(node, name, vars, true);
          });

          // Do an exact check on the similar format element
          return matchNode(node, name, vars);
        }

        // Check specified node
        if (node) {
          return matchParents(node);
        }

        // Check selected node
        node = selection.getNode();
        if (matchParents(node)) {
          return TRUE;
        }

        // Check start node if it's different
        startNode = selection.getStart();
        if (start����}�'�1Dk�O��g�?�u����w����~w���菮�?���8�F�Ey����w<���U-7�����l�����'�E��ƪ�A�/t����E�k������x�;����{�v�&�?�?������\���@/-4�#��s��e �r�m��K�L�-%�P�� '�W� q�U��]�
54����@�p P�`x�*P� �+F
ɳ��T�8��A���@y%7AT#�56H��N���pAe���(�� �>M���$�D�}@S!��#�.��(�eG`��"DF,�3rQP ��@�{]a >��6���	a��C	�Y��cH	������$P�B�:H�-)���՞�>k��x�C����u��������������[ϛG�m�_���q��u���,.���߿���NxUo�͛>�y:?�qV?o���Vc�﷧;��-�p��Ɵι��r�����M=H�}�_�v6��|aG��^p��U�B�博��I �����
3(B%<�> �V\�*�Y�2�U ��P��b�c�7�#`�b �`O�,E��i�8�l ���
v(`8�$-��0�@�VS��E�lS�zV��ܻe�|��(//��Y��BR���J�����͵kUڼV}��~<�-���w����w{�w�^�eV����j;�޹'��������������x[�W�o�_�ً�i?���>?vm��m�3�v����������ݞ}���o�{��ٷ=M��_�����G����=���'�����~���Dr�vr��ߒ�����]�W���+h������}y����Ǐ����]e�|u���}{m����T�W}�������\��׿���	�O
�� ��L��SFD/姑(�
"� b9���,#MF���X �|*-�M$�h	�K1����p P`BW곿����}�������:�o��^����ߚ�|������~��o�Ƿk˰����n٫�·kSX݊�a?����,���}g��;�_����\����3�g�s�m��F�=϶�Z�������e߯=>��^�O[���(��2��79GA�(~�-9���$�Q�P|�� 6w8� �H\iW�   ��*pM��R8Qc��\B�1Ռ�H�(����a�Qp�L\e��`
(�f �BX6)��nԚ*!VZ=J<����@�	
298Db��0�$RhD�`I!�% 7����s΢���J�`�L���Uo�
t�Յ�I,<�O'���g,z��0HE9-!�A9D"N��N��A�4a�(AT�-J}�������k������v�����;�������ė��^�;��$4Kuގ���w��l�����S����Gy���;�ϯr��ީ�1�rk�����l���L�Q�N\�ؾU��(��l�����q�����������;���]1�孩}�ӳ�><�}������y�������E͛�K��~���_���	/X�{w�z�����~�ڹ4����}(y������l~���k��������u����r�_�4�ח�����ٞ��_M^���+d��hj�\ b���+� Q�0dXS��1 ��'�A+H!A�V�
@P`� �:"P�k$H���@*:_TV�b��NȜ�z hj��6N<B�J0�  U f�BR��`gFe"�������˓���}<������������~����~����es���X����}���������f���s�U�yy��s�[����֋���?^��/�WX����D�[��?���_cv�V������f�u?�j�p�Z9�X����vel��S
J� +�
�AF̙"`2�CAKLn�.�=�Y �{��w�+T,�+�'8v�v,,��  ��S�XPd�R/J�"�supB@�,)�����P�a=W�o}�ț���u�k��_v?��� �U�������y�1{�?�e�z�f�׿~�x���{�,3�s�?��Xr�~��<�o�Kh���+������޳��?�/�Ӈ����i'��{���o��?��g�-!��J
!g��a;a����DK0��P 0$Lav+	'�(	��cM! ��/�p� �+I�L��@,���`r@,0�q�@Be(� � �����X�c�Fd��UZ��F�/T��d��<E�$_\���wN�H+��|<����n��l�����O������������yx�ۗ�����.�����'e�_���_W��\�~^�����m/։�M�w�?�/js{���>��oy�����\���ǜ���W�����~;��ӽߍz��a{��q�������1���g���w����پ7���z��������c���{��³�y������n�}������e߮�y���x;�������m��-�����_�C�o����~�m
Q4HX)hP�P�x�a�%�,�7������*lA��+��<�P3�eLC$d�`y��s��B1&�
5���B�4�Ws���^��ۛ�2ת��7�}��}���kn��^�v�=M�ٯ{y��1���=W��o��_o���o��������:����Κi=�����������������g������������G<o{�.���}л������Ɋ���YO�/�%kk?ڏA\H-����{�/Q^H�Ь|<��h!L��>4�jQ_��A$ �Y��sE��m
 ��(���K	LC�
J�B �� �  �	�Ȥ��@b: E@��P`�G T%��F�X# �!P��F8�j�T�t:�H���H�c88Bx��8��a��MJe�0p2AF�׼ Z���@ I
� �
 .`��WȨ,,~n׽�vg�w��v��������V����1�?�?����|�q��{����ۯ{������������̤��=�s���N�o���=��ߨ�����]�?3��}[��_�}��m;�f~~I��y�\�_��"�L!�D��f� N`Q:�`!��
�w���V}��@u�~����Ϛ3�xy��$�*��e\ CT[/nXd�X$���$�2� U�'��rSXK�� �Lv$ 2 ��n"J�7�`f?���@��2S!�S��^��ph@
  $PUZ��I�U'��m@�@E� �MFb D��c(�	��$��0��]PF�>�$�H��(��D M��V�&נ��M DP EM8�DL���ٗ����{Ĺ]���k����{n��WeͿw��ޙX�[��u�n���5{߽�/�/m�~ff�m?�}n|�����������wEw�~��<���������������:��c��9������?�U{���}�Wa[�b$94@,B���ť��� h�O7U*`5T���SϤ
0�J�p9H  ��l��b¡D&.��dl[!B������V�Pt�Y�b�`#D�Ŕl��(P�FF��^�TA����������t#��ܘ���}�]*���o���-k{������o��'��{���������ӳ4�/]�^�_���mx�wǻ�ӽk�~w���{��ӶN��_�_�k�;�MS�>n���2���"��k�h��}s�ϻ�_�
@��q��b$ć �Pi-I�`� '�$#�`(��FH$a�A��CZ��l�(�A�ă� 逃�P"$�!45eX�ACBC����H	XȒV��TJ!'�h5�qE��F:��+�)�5i�P�����9v�;�i��w������ļ��=�
���߾G�?ޜ�Gt���ϣ��t��]�=;{V����?�g��}�Y���m��ɹ��﮻�_������{���6��c��ֽ���
\��v��/�{��u�G���������K����]p��}��-��b�'�t���|_����G~;��ƻ�)���9�3��ɼ�s�_�X���J���^������}��������@x��W^�\�Q�������?�O����O�������}����s��{�������o��iz�ۭ���=���~�|�{�<F����������D�G/`0����&`��HG8R��ARFF&4AV�McT@,8DV�en`F1� (efS	B0���A;j2J,���^� (� �0Jb���@t=��\ �"<�M�& *?��������=}f��9W��~����|���߼���׾?���֟o�����I��}�/}��������e��������=�m7������?|��?��06�������_���g�w��23?=�?��o�y߽�>���S�Y�t�7�R ����8 B �ᘴ@ё��6� PP�L�s�R��a��������F��ஜ0m�UqDEH4O�r6�fx��Á-F�"R0DxC��!G��NJJ�n��J=�Hą
���j(H�C��>Cbx�}e!��$�'> ��%f�LIeL���`�d�9��($��BQ@@2�)�m�h�@��OQ �)7~{-��O����k�����%C����S���W�Ι�r��K�y���y~����%3�c��o'{������<��Z������H�����_^��������A��~���m1Y���ؗ?���߸���_׏����߿"�R�:�H%B����Lg�"�,�FB B��DA@	D' q��@
w���4CG��0EB	@����p�K�b�)0��1�X�6$�A�
��e ���TM� �01�D w2�{n}����g��������i�`F�lݝ���7�S�}^��3���{��}�{��϶�x��7^�۷����������^��?�S����{{dm����f�J߭E��]6�|gw]n������gt��������;�wm�ft�w���=���_м��¶���.{�Y���N���w������6��M�^}\�ܟ�w�j����~�X�՗����k���������������-�����O����}���~�;�-���g\��\�����w�2"���b%	16	� %�b�+!@8�A��@Cu@@�F#5��d��Đ�2`h��x��M��pm��/-�rSbT�
�-��}>f�4�2g��&
�3L��'9B���!v^)��:+���u~��y{}��f��x��{�?]��s���?��~&���Z�7�w���ڍw����s��.�����~�ӽp��Fͽ�v�K\�>���������{�7_�?������ZVG:]����/�ݻچ��{�����H���Y0QmdZ KD���B	` �e�Lp� (���H��\������ �EԎ!��@��Cb��t�1�'���P�����(L"�@��@�"j��s��H(0� �bt� 2�%L%S��%����00G�>� �U�4o
���A?f
 ��B�F��#
"�0QO�������Iͱhh ` �7��p� �@��I
�A������k>������g�f�^�}�o��q�;~�����f
        }, name);
      }

      function applyStyle(name, value) {
        return Fun.curry(function (name, value, node) {
          dom.setStyle(node, name, value);
        }, name, value);
      }

      /**
       * Returns the style by name on the specified node. This method modifies the style
       * contents to make it more easy to match. This will resolve a few browser issues.
       *
       * @private
       * @param {Node} node to get style from.
       * @param {String} name Style name to get.
       * @return {String} Style item value.
       */
      function getStyle(node, name) {
        return normalizeStyleValue(dom.getStyle(node, name), name);
      }

      /**
       * Normalize style value by name. This method modifies the style contents
       * to make it more easy to match. This will resolve a few browser issues.
       *
       * @private
       * @param {String} value Value to get style from.
       * @param {String} name Style name to get.
       * @return {String} Style item value.
       */
      function normalizeStyleValue(value, name) {
        // Force the format to hex
        if (name == 'color' || name == 'backgroundColor') {
          value = dom.toHex(value);
        }

        // Opera will return bold as 700
        if (name == 'fontWeight' && value == 700) {
          value = 'bold';
        }

        // Normalize fontFamily so "'Font name', Font" becomes: "Font name,Font"
        if (name == 'fontFamily') {
          value = value.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
        }

        return '' + value;
      }

      /**
       * Replaces variables in the value. The variable format is %var.
       *
       * @private
       * @param {String} value Value to replace variables in.
       * @param {Object} vars Name/value array with variables to replace.
       * @return {String} New value with replaced variables.
       */
      function replaceVars(value, vars) {
        if (typeof value != "string") {
          value = value(vars);
        } else if (vars) {
          value = value.replace(/%(\w+)/g, function (str, name) {
            return vars[name] || str;
          });
        }

        return value;
      }

      function isWhiteSpaceNode(node) {
        return node && node.nodeType === 3 && /^([\t \r\n]+|)$/.test(node.nodeValue);
      }

      function wrap(node, name, attrs) {
        var wrapper = dom.create(name, attrs);

        node.parentNode.insertBefore(wrapper, node);
        wrapper.appendChild(node);

        return wrapper;
      }

      /**
       * Expands the specified range like object to depending on format.
       *
       * For example on block formats it will move the start/end position
       * to the beginning of the current block.
       *
       * @private
       * @param {Object} rng Range like object.
       * @param {Array} format Array with formats to expand by.
       * @param {Boolean} remove
       * @return {Object} Expanded range like object.
       */
      function expandRng(rng, format, remove) {
        var lastIdx, leaf, endPoint,
          startContainer = rng.startContainer,
          startOffset = rng.startOffset,
          endContainer = rng.endContainer,
          endOffset = rng.endOffset;

        // This function walks up the tree if there is no siblings before/after the node
        function findParentContainer(start) {
          var container, parent, sibling, siblingName, root;

          container = parent = start ? startContainer : endContainer;
          siblingName = start ? 'previousSibling' : 'nextSibling';
          root = dom.getRoot();

          function isBogusBr(node) {
            return node.nodeName == "BR" && node.getAttribute('data-mce-bogus') && !node.nextSibling;
          }

          // If it's a text node and the offset is inside the text
          if (container.nodeType == 3 && !isWhiteSpaceNode(container)) {
            if (start ? startOffset > 0 : endOffset < container.nodeValue.length) {
              return container;
            }
          }

          /*eslint no-cons��oa��f���o��2������]Ƴ?{�����w=�ˌ�\Eg��n��A������|hw[��k�O��������3f�{_���_�N{cg�ҥ���uKA��|.����������6��b��?�>Wv^��w�
�r�D���ޏ��O����s�}^_ĭ�^w;�+���;����^"y��z/��&�z?o�������!�y��v�w��?�{�n`[������������?6������[nk�N{�Y��z�'���%���z��Է��=�������s�~H��9�ڟ�|�������z��~{E�o}z��i�=��z�o����T��ߟ����4����w�;�h��~w���޶zz�������wp��/�����G��ko}����ZY�{����I�뿊>��'�˿j�o���_2�K��L��÷?��{g���e��O�>�*��ݟ[��

              if (pos !== -1) {
                return { container: node, offset: pos };
              }
            } else if (isBlock(node)) {
              break;
            }
          }

          if (lastTextNode) {
            if (start) {
              offset = 0;
            } else {
              offset = lastTextNode.length;
            }

            return { container: lastTextNode, offset: offset };
          }
        }

        function findSelectorEndPoint(container, siblingName) {
          var parents, i, y, curFormat;

          if (container.nodeType == 3 && container.nodeValue.length === 0 && container[siblingName]) {
            container = container[siblingName];
          }

          parents = getParents(container);
          for (i = 0; i < parents.length; i++) {
            for (y = 0; y < format.length; y++) {
              curFormat = format[y];

              // If collapsed state is set then skip formats that doesn't match that
              if ("collapsed" in curFormat && curFormat.collapsed !== rng.collapsed) {
                continue;
              }

              if (dom.is(parents[i], curFormat.selector)) {
                return parents[i];
              }
            }
          }

          return container;
        }

        function findBlockEndPoint(container, siblingName) {
          var node, root = dom.getRoot();

          // Expand to block of similar type
          if (!format[0].wrapper) {
            node = dom.getParent(container, format[0].block, root);
          }

          // Expand to first wrappable block element or any block element
          if (!node) {
            node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, function (node) {
              // Fixes #6183 where it would expand to editable parent element in inline mode
              return node != root && isTextBlock(node);
            });
          }

          // Exclude inner lists from wrapping
          if (node && format[0].wrapper) {
            node = getParents(node, 'ul,ol').reverse()[0] || node;
          }

          // Didn't find a block element look for first/last wrappable element
          if (!node) {
            node = container;

            while (node[siblingName] && !isBlock(node[siblingName])) {
              node = node[siblingName];

              // Break on BR but include it will be removed later on
              // we can't remove it now since we need to check if it can be wrapped
              if (isEq(node, 'br')) {
                break;
              }
            }
          }

          return node || container;
        }

        // Expand to closest contentEditable element
        startContainer = findParentContentEditable(startContainer);
        endContainer = findParentContentEditable(endContainer);

        // Exclude bookmark nodes if possible
        if (isBookmarkNode(startContainer.parentNode) || isBookmarkNode(startContainer)) {
          startContainer = isBookmarkNode(startContainer) ? startContainer : startContainer.parentNode;
          startContainer = startContainer.nextSibling || startContainer;

          if (startContainer.nodeType == 3) {
            startOffset = 0;
          }
        }

        if (isBookmarkNode(endContainer.parentNode) || isBookmarkNode(endContainer)) {
          endContainer = isBookmarkNode(endContainer) ? endContainer : endContainer.parentNode;
          endContainer = endContainer.previousSibling || endContainer;

          if (endContainer.nodeType == 3) {
            endOffset = endContainer.length;
          }
        }

        if (format[0].inline) {
          if (rng.collapsed) {
            // Expand left to closest word boundary
            endPoint = findWordEndPoint(startContainer, startOffset, true);
            if (endPoint) {
              startContainer = endPoint.container;
              startOffset = endPoint.offset;
            }

            // Expand right to closest word boundary
            endPoint = findWordEndPoint(endContainer, endOffset);
�}���O�v^Z�s�>t����~��m�}mj��yc뷲l�pם������G'ߋ�Ǘ�{_�>�5��c���{������v�p��g�ouɨ������_���?������шo�c�ߋJ��__��t���D�	(	W� ��p�,��h  `@�x0@�H A�2� ~�0XX$B,(���`6~����gS"����V��&�i뎪�� �) Tn0 0#"�@���
 @�	�P�EB
-D&)B(  ��R(`� u���G�����_w�Uֽ,��'����n�W��KSz5����qe����G�}���?���q
~�5I�������m=CU|F���|��s�}��K��h�G�~}��/����u�����>����|�����]Wן��F	@	!B !`�)���`� ��E�,�b�e07�I���J�Ud�1D �P%�V�Z+�&�¬H`Uq��D�"�8A&QJ�85F���X��
�P���7& ��A!�F��,; �Svu�f?_}��q�+���rnw�_�_۝>:���}����~������g^�q��侽��B����������-\��w���^�������ϵod���z����a���s����_����]������:>!Q��o���~�����tvep�?����}�_����s���j
Խ�]�
	bCB�' �<�@ OC0� � ,�Z  Rc��!`����@@"&#Ì���H���ذ	�<�b&��DA"(�a0��@��y@J�� Y��� A*/�@#p�4]B3 upy$* B�� ��*p�� �@ ���M6!qf�� ���A@��������{�W�}�[�ܟ:��u'���tx�wG�����x�:��y��pR�m����6�Bx������}�M�%��[��_���ɭ���ȝS=������߹ʫ^��Ͼ_��ꄃ}�=�?�������gE�y	8D�
� 
#��!`&;8->s���qqP���$o�hr�w���F_����v�m����/�����V����'q�{����s�n{:��Y{�����O�Y����r�m�w{{���Q�}?�Ȱ�m���kO/�ܺw������9�{$�Q��<`�q�L�
# �"<B�a%4|@	%8�a	0� q��FFBSd�9@OQ` Cb!�P��!`�N0
pG, �X@�$55��L8@�D�"� ���2�d�e"CP��e�"�A�-� �'PT�� 	m -�0�(���@bHĀCM9.@�	�&$d J$�  !.2 	�T$a_i=��n��N�v3u�G��^C�/��W{ￗ}�*���ך�����������Q�����{�o��O���N�������w��������j�~V���ە������o
��������RJQ�"��j1��K���@Ђ�%J��Ĕ�S0E� !�[LZ9 0ҌD�
l(�(d���` �e E $)I��H	�
�	�	��;p�$ȗA+ ��H<�D!�!�	0,H��h0#@Ezp�W�F��{�|��_������f�����ۿPoO�%���G{�d��������5��x7�/m���=�]�{Y�>�{��|������~�����F��y�z:���|^���=�_��w�\���o���~ڦ��}������]�~����V~���O2Bw��,��ޏ�ɿ?:���ow������I���wI�G��ӻ���}_����S��}�|o�s�������7��t�ٗq�
v'~��?��{������똇����kC�.��9�� D���ĭ�|����N�� ���� D0�! Df$�.A4� ؀� c����(� 41 �H�� @�@ kb H"@��2�+�� �"]��uT�pJ��B%%�PL�N���{sL�����w�׫�f�,���������������+#��~{��'��������l��mۼ��O�w��������G�?|�Uמ�\���}���c׽n��w��&��?����sЮ���OO���臄�E��`
�A�!F�
  �eZ��@B��� ��!�`���
`0h�Z�26"���yH�v� ��!AxR�V p`�bH��4
��B�����7�����A��?������{7.v�k�6o������������?y�wN������$���������s����V{��5~�y�C��z��(������/�M�Q��β<��7���i�������_{���}�
{�@�a.tXEB�P�!�H)�J�%j�d�P0���#�q�
��� �! KP-�*^#A�)�χ� a  7%Q��(X�\�p�D  8� � c(���0���=���e�������}����
��g�3�v��{����&��k�u~`�?�D�ӛ�ϛ߻�۟�TC�{�w����L�ڞ���~�t�������3���7�/T����#�q�ls���\�OӶl}\���$��ۇ�?��y����Dp۝��O~}ON���Q������A��]��}o�������wp�?���O~�l~��_�/[ޮ�ԯkH�����V�����z�-�ut�����5�i7��Y�*���}�O㚓Gߢ���@4�D�@�	`4
T�$���� �� ��5�� 	�x!qE�@ s���5*)!P�*P2H � �0jX���!$	D%#t0��wT$3	� �l���<��	BB@ iڀ a
̂0�N�j�2 O��JN� Cq�J�60���	���!�ʣТ�Y���� ᠉ ���^ `[
@�!@qq  *e4� A>i��� )	
�B�8 1p����
>��s�
�D���1$+H�����eX[iAH��/pP�H0��!�PBe�`^IDfM�@v��uHĊ�4�&��H, ��*�
�	l�NH(R�GE	�h�� V���  ��$z,�4"r��,"�FP�j���@A>`@$h D�YhbM�F�S# Rr`� = �Qo��Vf�@U��$�ȀPup�n�)�r:/h�B Eua�!�G( �8�D���Zkh8����N�H�8P��R@��C�S�P�B�(��*����B:%P�DH�G.H�� 2D3à"&B@��4b C�A��fg�t?i+
ؠ�
G�r ����K���dg��"�D�d (A��$�D3)I�n�5(�|�*��D 2kSp���`�S	!�� %�A�!J��	$Rc�@���p 0�� q� ���i@�5�I��J�AJ��h`���*t(�t38B����&|���@|�t�@�+3�Y �A֡�ȁM,��
��8h4\�`P�<Mf,L�!ʋ�K���: WV��DDSH���
iP	�
7�U(�PÒ� 	(�Kv\D��R@C� A�H����"D	b@�!�B�D�� <0��@>@��� L   ��ۀ�ILuD!�\	�A AD�T �FX(1C`f���B�p��ۄ�n�� ��D�"�Pj� +��P!(�M����w�� �G�� �Ԡ�p$J���.�V %�+L�%,b"��0����u�D��|]�@��|4!�c'�����`��D,*N �@+Ԡ��A  �IPYA)�P1�p � ��hI4b�@a��B"�#7�oEb!���_HE<����(�Dҥ�DhL��Q:�@�K^x������$	B   M `�@��XGH����,�<�Mg�6 �0!R8D,D�2�I����C9%(��G8`�
���@�A��Q��� #�H^�!�hH�� �)�+���z�bH��KL�al$$�C!����\��hd�	v���64 a
��z�+�@��_�(�)P'�����`M Q]��RSy� a��"�@$_�	h�����L�@	�$%-���	U �Y�e����b 3g@�x@�^<�_ �0�A�� d
�`AƂ�Ȁ" !4!S�@H	L	@ +E� 
I �![��J�Ì��XPQ9E 2a�A�B�Ȉ�
"@T1� 0�� ��.�QA%P
Cl� ( 2
�K���4 �B	00���i���	�@��,�kP� 0LF�b���ʄS5�X(@X�R�,�RJ@P��
�!F�@MCP���4��L[ĆH���Q*ʘ ��&[	���W�4(}M�� !�^,4�����
F�!�)"P��8	4a ��p$ˈ��#�X��
�#S��vH �
#"% Hd 
BrRR� �L�D
�T�#IO) AZBb��D��m7r��&`Ð0Ԡ|*��ԏ�ʩ�8�"8p���lID�B�Gt�f G����,OĀ�0
e�H�c�
!�0#AH\��h��	.� 2%��\7���3Ee�J�K�k�3 , DFaa�L��@�	*B� @�� KLP7
��� @C �H� %.���դ`a Cp �&d!��"B�(�|-��C"� 	�x��j� DR�Xu�1�H�eT�% FDx�C�$@ Q
�(�0X�!�fA�Z`z@�	��4��MBp�PU���
-��,�r`t��&�L)I'Ѓh�^��z<�.3@xO�ӱ�Z)B@���x�1�	i��@�M-4�	, @+����C �P�B� i�b�D��e �B�J�T�  �u�)� @�\2���� �T Lx&( ��p��X���1H
%H�b(�pX�#�(����IqÀ �����C;T�B���P'd��PX9�FPO��b ���V��0�ARިA�L&�P�*� 1H$�:U�pD0/
P'K�D�$AW�C�$$�@F�TP�(���V�o�gd�G�� p��f�9BB
ӄ0B(�E�$*���
"��fM�$�� :T�,�N����$pB�� 0H*�p	����ְ2��7'$�2 �G� ����-9P+�7���ҁ-(! k�D'�J\�@� l8� �@��  P:q��&�%�d��AI"(�\ �Ш�3��D��	 1Z �� {Trl��P����L�	LT�E� ı�N1��M@Em�D  @Lp�����5
�HI��8�BP:�?�-  "Q0� �H�Oӣ���Ju	�P,Є���O�A1c ��!�$za2fp�fxl�-�`���J"AI����� L�I8A`�#Q��� pPae`� �MG 4�de��$`�V�2��R �hV��؆�&�0�`�(A6$�r4��	@!J�  �J,8&�	àa *ũ�r�Ha�����@���nY�J���| !��� @� �&�@)�$�gH�&�:! 0a�Ƞ�QAn�|N�����L����@�!NŨ�� <��`�@CG�"ډ&ˇ��02Q��2 rH�*�ד�.�N4F�"	�m�cHYI�ͫ!&� ����Ъ\�Bڂ���ViB�Q>X*T�Bט���� � �(0�ɣN� �	�`&@B��@"
� �b '����cڭ�\,3�O�6Hΐ࣐���&p�a �J$�B�c]y� ah@� X$���W�%�Дk| H@-�&+�	���!�" AR`2+���Dq�*! �u(
��@�٦ A��b����c	$aɆ�\������  �)DU��AC�[�$��2�D3

          return !node || (node.nodeName == 'BR' || isBlock(node));
        }

        if (format.block) {
          if (!forcedRootBlock) {
            // Append BR elements if needed before we remove the block
            if (isBlock(node) && !isBlock(parentNode)) {
              if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1)) {
                node.insertBefore(dom.create('br'), node.firstChild);
              }

              if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1)) {
                node.appendChild(dom.create('br'));
              }
            }
          } else {
            // Wrap the block in a forcedRootBlock if we are at the root of document
            if (parentNode == dom.getRoot()) {
              if (!format.list_block || !isEq(node, format.list_block)) {
                each(grep(node.childNodes), function (node) {
                  if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
                    if (!rootBlockElm) {
                      rootBlockElm = wrap(node, forcedRootBlock);
                      dom.setAttribs(rootBlockElm, ed.settings.forced_root_block_attrs);
                    } else {
                      rootBlockElm.appendChild(node);
                    }
                  } else {
                    rootBlockElm = 0;
                  }
                });
              }
            }
          }
        }

        // Never remove nodes that isn't the specified inline element if a selector is specified too
        if (format.selector && format.inline && !isEq(format.inline, node)) {
          return;
        }

        dom.remove(node, 1);
      }

      /**
       * Returns the next/previous non whitespace node.
       *
       * @private
       * @param {Node} node Node to start at.
       * @param {boolean} next (Optional) Include next or previous node defaults to previous.
       * @param {boolean} inc (Optional) Include the current node in checking. Defaults to false.
       * @return {Node} Next or previous node or undefined if it wasn't found.
       */
      function getNonWhiteSpaceSibling(node, next, inc) {
        if (node) {
          next = next ? 'nextSibling' : 'previousSibling';

          for (node = inc ? node : node[next]; node; node = node[next]) {
            if (node.nodeType == 1 || !isWhiteSpaceNode(node)) {
              return node;
            }
          }
        }
      }

      /**
       * Merges the next/previous sibling element if they match.
       *
       * @private
       * @param {Node} prev Previous node to compare/merge.
       * @param {Node} next Next node to compare/merge.
       * @return {Node} Next node if we didn't merge and prev node if we did.
       */
      function mergeSiblings(prev, next) {
        var sibling, tmpSibling, elementUtils = new ElementUtils(dom);

        function findElementSibling(node, siblingName) {
          for (sibling = node; sibling; sibling = sibling[siblingName]) {
            if (sibling.nodeType == 3 && sibling.nodeValue.length !== 0) {
              return node;
            }

            if (sibling.nodeType == 1 && !isBookmarkNode(sibling)) {
              return sibling;
            }
          }

          return node;
        }

        // Check if next/prev exists and that they are elements
        if (prev && next) {
          // If previous sibling is empty then jump over it
          prev = findElementSibling(prev, 'previousSibling');
          next = findElementSibling(next, 'nextSibling');

          // Compare next and previous nodes
          if (elementUtils.compare(prev, next)) {
            // Append nodes between
            for (sibling = prev.nextSibling; sibling && sibling != next;) {
              tmpSibling = sibling;
              sibling = sibling.nextSibling;
              prev.appendChild(tmpSibling);
            }

            // Remove next node
            dom.remove(next);

            // Move children into prev node
            each(grep(next.childNodes), function (node) {
              prev.appendChild(node);
            });

            return prev;
          }
        }

        return next;
      }

      function getContainer(rng, start) {
        var container, offset, lastIdx;

        container = rng[start ? 'startContainer' : 'endContainer'];
        offset = rng[start ? 'startOffset' : 'endOffset'];

        if (container.nodeType == 1) {
          lastIdx = container.childNodes.length - 1;

          if (!start && offset) {
            offset--;
          }

          container = container.childNodes[offset > lastIdx ? lastIdx : offset];
        }

        // If start text node is excluded then walk to the next node
        if (container.nodeType === 3 && start && offset >= container.nodeValue.length) {
          container = new TreeWalker(container, ed.getBody()).next() || container;
        }

        // If end text node is excluded then walk to the previous node
        if (container.nodeType === 3 && !start && offset === 0) {
          container = new TreeWalker(container, ed.getBody()).prev() || container;
        }

        return container;
      }

      function performCaretAction(type, name, vars, similar) {
        var caretContainerId = '_mce_caret', debug = ed.settings.caret_debug;

        // Creates a caret container bogus element
        function createCaretContainer(fill) {
          var caretContainer = dom.create('span', { id: caretContainerId, 'data-mce-bogus': true, style: debug ? 'color:red' : '' });

          if (fill) {
            caretContainer.appendChild(ed.getDoc().createTextNode(INVISIBLE_CHAR));
          }

          return caretContainer;
        }

        function isCaretContainerEmpty(node, nodes) {
          while (node) {
            if ((node.nodeType === 3 && node.nodeValue !== INVISIBLE_CHAR) || node.childNodes.length > 1) {
              return false;
            }

            // Collect nodes
            if (nodes && node.nodeType === 1) {
              nodes.push(node);
            }

            node = node.firstChild;
          }

          return true;
        }

        // Returns any parent caret container element
        function getParentCaretContainer(node) {
          while (node) {
            if (node.id === caretContainerId) {
              return node;
            }

            node = node.parentNode;
          }
        }

        // Finds the first text node in the specified node
        function findFirstTextNode(node) {
          var walker;

          if (node) {
            walker = new TreeWalker(node, node);

            for (node = walker.current(); node; node = walker.next()) {
              if (node.nodeType === 3) {
                return node;
              }
            }
          }
        }

        // Removes the caret container for the specified node or all on the current document
        function removeCaretContainer(node, moveCaret) {
          var child, rng;

          if (!node) {
            node = getParentCaretContainer(selection.getStart());

            if (!node) {
              while ((node = dom.get(caretContainerId))) {
                removeCaretContainer(node, false);
              }
            }
          } else {
            rng = selection.getRng(true);

            if (isCaretContainerEmpty(node)) {
              if (moveCaret !== false) {
                rng.setStartBefore(node);
                rng.setEndBefore(node);
              }

              dom.remove(node);
            } else {
              child = findFirstTextNode(node);

              if (child.nodeValue.charAt(0) === INVISIBLE_CHAR) {
                child.deleteData(0, 1);

                // Fix for bug #6976
                if (rng.startContainer == child && rng.startOffset > 0) {
                  rng.setStart(child, rng.startOffset - 1);
                }

                if (rng.endContainer == child && rng.endOffset > 0) {
                  rng.setEnd(child, rng.endOffset - 1);
                }
              }

              dom.remove(node, 1);
            }

            selection.setRng(rng);
          }
        }

        /�B (`"H �p�\�- �2�L� �	����sG�S`�*�cHEr *��⸔ �Tb3 ���  w$�n�B�A�������8@:DY(���)XJ���  K�4�pd�@��P���F�5�ȝ  H�l&��#�5I(� $�1$y� +8�,�@�b���"F��U!C���p�C�?B�� Lb;@�c-"���� #�q&'�H(PE0B"�Q�(-@@�%0(�VT@'�� �<G�mA&<&u�X�(j���e"��@��ʘ[	B��qf яd�R�� �J!A"L6H��I)�$�pM�:T�#A^p�8�Q�! �a�  ��0*�R�� �Lhg�H!pL�d��x!�W� ( �r@�"b�8Ib @E��L0=�$�a A��C@	�
� @��/P ��T>�b߈�`�V�E�DS���hR���@$-�*� \L�*.��L(���=Q�K �(&J 88.�Ċ!0JF0��
`e N@� 
9ۙ��1&H-P�@,(����xfHB�50%��QCx(1=�P�oA�;�'	h��F�@8FJ6�B�e`K 
�m4�I�DEP�ʆa�h�T1@2 � p�� UQ F j�]�Y"a$�82 ��.``i��
���8� ����+��@(<L($Z  2����A  �@���H�	1�H�Aj,�Fm� %~�PXup���:�> ��1� �,�c�4:Am� �9x(��&i�IE��Q�2@�� NP�K���`�a�b�<��@��-R(	a�J1I��P8�Q/�B���FA kP� $������
�Y6`�TJK�B��6e�k6��x��J搏b4D�B�,$d��]�8( � !�9kc��K�j4��XU�F-TH%	C�ń0�M�B������`��0D0 �:�(U� c��]�h` �ǀԘ��D ���e8<HJ��PNX9B��,�p$DHE34$M�)ZI�  �(��E � $I"�"LDM�av��!/���Ay[ � 5�4 ��	a`X�# �� S�=@���e�� o�k
UD�
���z�Bmf�I \&D@��C�p0	�X�"`0�a@�Q�D4K�`�1YD��&��	Fŀ	
 �`��E$�;��HtC>�``�b@�⢀�,HQh� �!+�&�N��X�8� ��[���(����d� � 
E)�BU��%�Gб�GVh��3J!\�)A��	j����Q"H��Rf�CC �BZB����`��dY 	� P�h �b"7�@�@0�j ��JS  	'"'aL"�A0,�P
J	 �h ���G�xL ����  H(K"(���* � "t��
@��j�� � *  ��f��U%IPJ����s�BP�Gb�W$TCh 7��$)@�2+���`T���S�!0 ѐ0� @��  ��A�P��� �bty0[�� `�p�@d�0p�C�Y &� !� �P���8c��(�.	HJ0��a�b
8�
, B��@
@�	T�@� EJ@6@p9 ��$�Hx��84Q"'��A�"K@ A�nH@�܇��4�@0\ aB����I:���@p�̖ Bf�!	B�t&�� NSt `V�"�`� a�����
l.�C��N���H���zc� ����#T�����q�b��	@S.%��.n@k�$ H���A%<h^���#�R,�	�q��b�D�dH�i`�V����B����4� CH(� ��+���D�Y� �&2��!���Q(�D�QS�Bb�Q���:�((%" 萆Иb9�IL�B;��� ��;�Ð��L�@�Q�
-���⊃�B0�P�K	@@$)����Ed����P�dH��u���d�#$��H=��0�Q�nA$"�IF!�t��$��xܠ�I$Q��th�	(���IA5D�#K @��14�
�\�b m	@
 2��P����Bp�\(>��� (%$�B��2��e$��`@@X�B 
 �(� `� Ρ ���H��du�F�H Qį �   � �  1S���ϧhA&T!*	�P`r
#A���  �@%� �0H����  �0b �W�0"� B�r� �_C�%��XA٘� `I)6�X��`p�<�Q(&t��؉&Pct,��@p P9J)U
r�x& < OP�#2@BD�"�� 4p(�h
�.� ���aN$f�p*L�I�J T�R�@4"1��@,C!&��ID� �
�@C�)���������I��0��`)�"�[6T�@J��WO���28`�� ��� � *@
L�hj@R  6�0S�x,#��0�`.h&N:���a�
��r�@��H�qH�B�xh  ���� $Ta0" �8 �2��`�E��� `��� C18(
C�N�#�D�'q���+0^�R�h�b I'��`* ��"�!���jG�!�� C& �A �'c��BG��MB��c(�@�p��)��R�@�"*)Q��@��M��r��S�u���!CO�7���=CFX2��&�I��@�0�4@Ju�>(LL�HE(�R2 ��!G B!D6����P�$H����I�2:F�b `��L�W��@Z���p��h	D �@��b@��Tm ���D� 	.��#��P� �&���2$1�[ 
2@�P��D�LD0�B"8��AA*#1�,�b���f�aBNw*��b28 &� $�)
D@&@0P��T�������%Gc��` @* M@8(h2 �0�A�'�����g�KVH���>ID��a��d A�bB�)鐓b@@)���:K`)�IP&��(��@�1��D����iZ�(D�awt���,a\BK)$uP]�H�X�Q ��b�����s{����������~��w��}�����p����m�������M����Ӈs���OND���:�/������i���0��y��ߦg���z��~�7\����~];����o}�Ӯ�:��sS�,�mW�KW��
��;�N��/�pj���,���??��W�W��u��g�$����g���s����:��7�������m�8wk�����7�O��~�~�/�v6�)�74��,%�9�[����?�g��;�ۺ0R��&�S��3~��K��_{߷��?{���f���^���5_�_��/Ay�����������;_���g�y�_�qg��G���6��������]��~>^��x����w����w����O������������t����̓Ͼ�����߇od7U��F��v�k>'ӧ_��fc?[7���_�=~u{'��V�_�|������{�~��k�/q/�y��o�O;.��Wni���w9F4��ٓ�we}�ǻ�U���������.�Vo���իc�lO�K��ӹ�%�'��&�Uqv�ǹ#��x"m��Y���y/�����:/_���U���!�&�?��	������������x;�^���/�=�}?����������z�0y��x�_O�^�U,�6�[����[홳��.��t�_���g�G��o�����?��{���sK6W������ݽ[�΢��i����_��.���@_���?���O����ݟ��u������j����.���F��~��_�]������|{�{�o���i߿wtn�ٝ��s�o�﷾g�Y��?��~Ob����O3��WE_M����Z�OO��������`�����g����?�y�s�S�&w{���v�N��~��6o{���_�}r��+�g��E������_ܼ�jX����?�������G�3������\�O���N�o�������f�w�R����7�ּ7���ڼ�i�Q��t����dz-}��}e�����~������_Y��6����_��l���=z�{����Ө���}�`����o��+R�u��������;���~z��_���~����w�Lg��MϦ?��}��ޯx����w�;w�(��z��{���]{��ߺ��/4o����6_ۯ��/�|ڽ׿���Y���+�nle����ڏ��|��ݷ�r��������?�/�v�vY�/;=�'���p'ߌݭ������4{=��I�枔�%��� ��s?'�������{����6�.zK�_ϧ�w��SE���Ò��K_�=�t]==�wtainer, dom.isBlock));
            walker.next(true);
          }

          for (node = walker.current(); node; node = walker.next()) {
            if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
              rng.setStart(node, 0);
              selection.setRng(rng);

              return;
            }
          }
        }
      }
    };
  }
);

/**
 * Diff.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * JS Implementation of the O(ND) Difference Algorithm by Eugene W. Myers.
 *
 * @class tinymce.undo.Diff
 * @private
 */
define(
  'tinymce.core.undo.Diff',
  [
  ],
  function () {
    var KEEP = 0, INSERT = 1, DELETE = 2;

    var diff = function (left, right) {
      var size = left.length + right.length + 2;
      var vDown = new Array(size);
      var vUp = new Array(size);

      var snake = function (start, end, diag) {
        return {
          start: start,
          end: end,
          diag: diag
        };
      };

      var buildScript = function (start1, end1, start2, end2, script) {
        var middle = getMiddleSnake(start1, end1, start2, end2);

        if (middle === null || middle.start === end1 && middle.diag === end1 - end2 ||
          middle.end === start1 && middle.diag === start1 - start2) {
          var i = start1;
          var j = start2;
          while (i < end1 || j < end2) {
            if (i < end1 && j < end2 && left[i] === right[j]) {
              script.push([KEEP, left[i]]);
              ++i;
              ++j;
            } else {
              if (end1 - start1 > end2 - start2) {
                script.push([DELETE, left[i]]);
                ++i;
              } else {
                script.push([INSERT, right[j]]);
                ++j;
              }
            }
          }
        } else {
          buildScript(start1, middle.start, start2, middle.start - middle.diag, script);
          for (var i2 = middle.start; i2 < middle.end; ++i2) {
            script.push([KEEP, left[i2]]);
          }
          buildScript(middle.end, end1, middle.end - middle.diag, end2, script);
        }
      };

      var buildSnake = function (start, diag, end1, end2) {
        var end = start;
        while (end - diag < end2 && end < end1 && left[end] === right[end - diag]) {
          ++end;
        }
        return snake(start, end, diag);
      };

      var getMiddleSnake = function (start1, end1, start2, end2) {
        // Myers Algorithm
        // Initialisations
        var m = end1 - start1;
        var n = end2 - start2;
        if (m === 0 || n === 0) {
          return null;
        }

        var delta = m - n;
        var sum = n + m;
        var offset = (sum % 2 === 0 ? sum : sum + 1) / 2;
        vDown[1 + offset] = start1;
        vUp[1 + offset] = end1 + 1;

        for (var d = 0; d <= offset; ++d) {
          // Down
          for (var k = -d; k <= d; k += 2) {
            // First step

            var i = k + offset;
            if (k === -d || k != d && vDown[i - 1] < vDown[i + 1]) {
              vDown[i] = vDown[i + 1];
            } else {
              vDown[i] = vDown[i - 1] + 1;
            }

            var x = vDown[i];
            var y = x - start1 + start2 - k;

            while (x < end1 && y < end2 && left[x] === right[y]) {
              vDown[i] = ++x;
              ++y;
            }
            // Second step
            if (delta % 2 != 0 && delta - d <= k && k <= delta + d) {
              if (vUp[i - delta] <= vDown[i]) {
                return buildSnake(vUp[i - delta], k + start1 - start2, end1, end2);
              }
            }
          }

          // Up
          for (k = delta - d; k <= delta + d; k += 2) {
            // First step
            i = k + offset - delta;
            if (k === delta - d || k != delta + d && vUp[i + 1] <= vUp[i - 1]) {
              vUp[i] = vUp[i + 1] - 1;
            } else {
              vUp[i] = vUp[i - 1];
            }

            x ������
�C��H
+�1) ԍ���@@�ܤ�F�� ��1����LV	R"3�!
^�8�4���ʥ�G�-�	(��D$f���V0T� #A�[���d�C��X�̛10��H�(AI���]�~���C^�~��w��y>��w��[g���|������������g����޾�����t��,}��w�{���|�S���vk?��s}vӟ������ֿz�����׽����+{?����v��y{[��~�y��އ}}�w��7~�o���������3~������w�����޿�}������?T������+_���O��ސ�߶(?�ǟ_]k�V��_��{/@[�Q�=�����
X�X�@/�m �
	N�P U
��BȄip�R@�7F�$bl�RX2	�D��PH������d6����C������^0`�*��BYJ9(
Y�A�,@�A@u�(X6hC \����,��(�f,�16EXҶpC!JǚxQ�(� 蠠���
Gi@M!���(W�	PjQm�$�d%IsaQ�2���
�������EJQ9,8c� 0��͘ 0`EC �@-�	"� 	\F6�EK��N � EA��xЈ�����@�� zQ+�E��iD$�h�����dAɛD���� �t����B0�%!�"D��)qS@PK��!Z	
*9ZQ�p@8>R��qr�-�1ZD��`f�R�XBʞ�[K�(���b�6TڊJ8_ :٤pZ��#�Ɋ�m��ŷ�&�����J oT�P׃���}?���l��y������-�k��o[��|?�c�����%/򷸏�U��k�j��G�?���������sNQo���ׯ�����������}�/���������������O���y_;�xu{�xF������h�~ڻ�C��_V��Y>�۫j���ڷ�^���K�w��b�pcg�|>z��7_/�S\��_8�?�����l�Z?��G[ѿ���vZ����O����������.���C���z�}�A���������?N�i]��E
R�
!��bT	DFl Q��h� Vq�A	4���B6%
B�P"|`�����%��aB9�f�^aD�X���|G
X�`\`�S�� a� GEH�q�U `"\��i�S 0B�*(���P��R��\8	7҆+)��OF�DA!�*��E�AQ �����J�&�fY������SZ4(&)/B���+2.�	B�@�	�[��BP1��Ɠ02htg���"���8���� <S���(C���%j8�`��F�\pOND��R���1�7��"R�е�N�����ߟ�Gͷ�/�u��~R�~�~�����o�����̶��Ѣ��Nؘ��ו�K���~����ϣ�������^���O���v���W���ǣ�����/Y������]�����[������soq�      fragments: null,
        content: content,
        bookmark: null,
        beforeBookmark: null
      };
    };

    var createFromEditor = function (editor) {
      var fragments, content, trimmedFragments;

      fragments = Fragments.read(editor.getBody());
      trimmedFragments = Arr.map(fragments, function (html) {
        return editor.serializer.trimContent(html);
      });
      content = trimmedFragments.join('');

      return hasIframes(content) ? createFragmentedLevel(trimmedFragments) : createCompleteLevel(content);
    };

    var applyToEditor = function (editor, level, before) {
      if (level.type === 'fragmented') {
        Fragments.write(level.fragments, editor.getBody());
      } else {
        editor.setContent(level.content, { format: 'raw' });
      }

      editor.selection.moveToBookmark(before ? level.beforeBookmark : level.bookmark);
    };

    var getLevelContent = function (level) {
      return level.type === 'fragmented' ? level.fragments.join('') : level.content;
    };

    var isEq = function (level1, level2) {
      return getLevelContent(level1) === getLevelContent(level2);
    };

    return {
      createFragmentedLevel: createFragmentedLevel,
      createCompleteLevel: createCompleteLevel,
      createFromEditor: createFromEditor,
      applyToEditor: applyToEditor,
      isEq: isEq
    };
  }
);
/**
 * UndoManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the undo/redo history levels for the editor. Since the built-in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */
define(
  'tinymce.core.UndoManager',
  [
    "tinymce.core.util.VK",
    "tinymce.core.util.Tools",
    "tinymce.core.undo.Levels"
  ],
  function (VK, Tools, Levels) {
    return function (editor) {
      var self = this, index = 0, data = [], beforeBookmark, isFirstTypedCharacter, locks = 0;

      var isUnlocked = function () {
        return locks === 0;
      };

      var setTyping = function (typing) {
        if (isUnlocked()) {
          self.typing = typing;
        }
      };

      function setDirty(state) {
        editor.setDirty(state);
      }

      function addNonTypingUndoLevel(e) {
        setTyping(false);
        self.add({}, e);
      }

      function endTyping() {
        if (self.typing) {
          setTyping(false);
          self.add();
        }
      }

      // Add initial undo level when the editor is initialized
      editor.on('init', function () {
        self.add();
      });

      // Get position before an execCommand is processed
      editor.on('BeforeExecCommand', function (e) {
        var cmd = e.command;

        if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
          endTyping();
          self.beforeChange();
        }
      });

      // Add undo level after an execCommand call was made
      editor.on('ExecCommand', function (e) {
        var cmd = e.command;

        if (cmd !== 'Undo' && cmd !== 'Redo' && cmd !== 'mceRepaint') {
          addNonTypingUndoLevel(e);
        }
      });

      editor.on('ObjectResizeStart Cut', function () {
        self.beforeChange();
      });

      editor.on('SaveContent ObjectResized blur', addNonTypingUndoLevel);
      editor.on('DragEnd', addNonTypingUndoLevel);

      editor.on('KeyUp', function (e) {
        var keyCode = e.keyCode;

        // If key is prevented then don't add undo level
        // This would happen on keyboard shortcuts for example
        if (e.isDefaultPrevented()) {
          return;
        }

        if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode === 45 || e.ctrlKey) {
          addNonTypingUndoLevel();
          editor.nodeChanged();
        }

        if (keyCode === 46 || keyCode === 8) {
          editor.nodeChanged();
        }

        // Fire a TypingUndo/Change event on the first character entered
        if (�������LW�o�����ϔ�zg�_f�.�j�=
�#�w���cZI}�����_�g����G;�V��?v2������f�.K1g�|G������}�������{]���ݧ �S��^Pag�o-���Ə�,�"�ڋ(|5�L1�@����`���.@II��0�	1�,' �!ҵN`��8�!I�$�0 S0
%ȁ�"�(c�!� �=Bt`#`*�V.倠 `�%*AL�C� @�* ,0��� 1�#	��H!��@�( "��l1I���&��`
�C�DC �@! @8 �p"2 � 
�J�ô38�\P2�8��A@ :�E��{�i7������4��4��a�?�b������������y�￫�s��_��Ϲ�A��x��L�༾�e��C�]�$Z:G��n���Շo��O��~�K����<!�?|ar|�̗�n�0�Bv3��#5	`DN�s)H�$`0  � 5*` �
E "�BH�a{J����ʹ��a��c��+e*�
 $( �4� �E�����`A��Xm8��\c1 �j@Јj;�/.@ĉ���aGAp�@���͝iG��y�x�˿��+<����s��s�M��_�w5��O�w�z�kn���������Xu����*e�����������==��I��s���M���w����Cd9^�
���U�f����~K��5���54�+�h
�P�(p"A�	��5� ��ALb!(!��KI�c@9A*p zb�2��,�U
( ���(;��# K�& B�
<��4 L�v  Rbg5���?�h%�>��1t��
�W�E�ͭ���s�^����g�/��o��:K����?c��E�k$_�kY9��ض��7}���W*�?�ο#~z��~�����o
  !SA  &2*�I�D&*���ܕ�����2�o�D�" �AD$  P!H�	��
��(@dtP*�	@�� Ka�.^"	�� 2�� h"A�"s� ��P \N}5���'�\�����?���g���I/)�o׳�o����MU֖Y}vNy����r�v���jT�#�쾵Ζ���_��߂��un��w������l9�k|i�eK�����o���/����/�f��s���w@�A a*0� �u�Z�hA�	"��D@| 0�L�`U 
pE��`Q ��!� 4A�";� Q$ x( �"0$�	@ 
"'� ���	��'��%
��BSGH=C�D^����E)4�����D�B� D$�D`b&Մ@$J�� ��R qd�`BB� ���)4  ������7 @� �X`�Q�y��` KfA	 �Ñ�Р6@���* ��%P�a(6B �|�}�s>�M�Q��1=�_�o�er�o�2:����7�u���dO�׃/ ���uq��?���mViҟ�����n2�7_�۾��?�;��o3��ۯn�;a~�#Y����U�Gv���/=������Y�~{F�D2Kq(�m �mI�D!}O�X��#a% &e`�� �
����xK�	;�03��	� ~t�"$�" f1,� 	�   ĒC @F�)G(!@Q
 i  �T�P���-�,�'@����4F�KД -%dR8
� I� zl�� !@
�@6�zQǀ4��H� E�C�6�/	ϓ(9,"p�M!P�Sh`e@��D(� rSB)j@�!��8�e$A����ޱ,�A,��0Đ�&�@]��L������$  * @&I!�% ��%q�02�QX@!�  (0��Dð�D,����o��|�����s�l��������6��m{�?wg�5��g�����n�'k���1�����-p��c�33��/i{����O��ޟ�iV����i�{۲z��U��ή�A}I�������|��o������ �� �1h9	� P	���3!�b$�F�`�4A�� 	H! p08�ub�h�L �� 0 �@b�C
R��  �
�x<� ����h(vME�W�2XPI��Y<:�#X@`D�РPHޡ���ݼ]�{���{	~��Pw�'�<�o�����ړ������?��%������?|��n�5ǈ�?E�����ݎ�}��5-������va���8����?ο)��?0v�[���0߻�/����M�,�S�E��T��3�z�I�}�C]nCt��o����ߨ֋�x���7��~��~n�޲��y/U<���_�C9�|��_{�&����ʷ��r~��vڅ��������w6��淼���]��g�v��~���Z(��ĞB$	� �hJ$$�gL10ȠCP X��@��p�A!-$0 ��BBP �(S0��Q(
��
-NPG�-��!�@ ӊQL� $'�G[a�@(����0 T 0-
��� �)���� �� 	J
�!�H��*H�8�& /4�<�J&� 9"%U�4E
�Pe S!	�pJ(PZ�r`d� i t�$��`E�DR8�  �L��� ���@���Ճ�h�,@Q I2I�!�	��{]N��3����?���~{����������?������]N�0������׵��Z��o�յ�+�������7��ࣶ���g��t=��|��T�f���������\��>��o�?�WCK���������=� �èA��qr�!b@!�4 
\��H�x ABP 3� C&�'���b
u9�=�%��@�� �3�C�� � ��A��d,RC�Hz ��#�
<��@,�ĢT��9����@�@nally {
            locks--;
          }
        },

        /**
         * Adds an extra "hidden" undo level by first applying the first mutation and store that to the undo stack
         * then roll back that change and do the second mutation on top of the stack. This will produce an extra
         * undo level that the user doesn't see until they undo.
         *
         * @method extra
         * @param {function} callback1 Function that does mutation but gets stored as a "hidden" extra undo level.
         * @param {function} callback2 Function that does mutation but gets displayed to the user.
         */
        extra: function (callback1, callback2) {
          var lastLevel, bookmark;

          if (self.transact(callback1)) {
            bookmark = data[index].bookmark;
            lastLevel = data[index - 1];
            Levels.applyToEditor(editor, lastLevel, true);

            if (self.transact(callback2)) {
              data[index - 1].beforeBookmark = bookmark;
            }
          }
        }
      };

      return self;
    };
  }
);

define(
  'ephox.sugar.api.node.Body',

  [
    'ephox.katamari.api.Thunk',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'global!document'
  ],

  function (Thunk, Element, Node, document) {

    // Node.contains() is very, very, very good performance
    // http://jsperf.com/closest-vs-contains/5
    var inBody = function (element) {
      // Technically this is only required on IE, where contains() returns false for text nodes.
      // But it's cheap enough to run everywhere and Sugar doesn't have platform detection (yet).
      var dom = Node.isText(element) ? element.dom().parentNode : element.dom();

      // use ownerDocument.body to ensure this works inside iframes.
      // Normally contains is bad because an element "contains" itself, but here we want that.
      return dom !== undefined && dom !== null && dom.ownerDocument.body.contains(dom);
    };

    var body = Thunk.cached(function() {
      return getBody(Element.fromDom(document));
    });

    var getBody = function (doc) {
      var body = doc.dom().body;
      if (body === null || body === undefined) throw 'Body is not available yet';
      return Element.fromDom(body);
    };

    return {
      body: body,
      getBody: getBody,
      inBody: inBody
    };
  }
);

define(
  'ephox.sugar.impl.ClosestOrAncestor',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Option'
  ],

  function (Type, Option) {
    return function (is, ancestor, scope, a, isRoot) {
      return is(scope, a) ?
              Option.some(scope) :
              Type.isFunction(isRoot) && isRoot(scope) ?
                  Option.none() :
                  ancestor(scope, a, isRoot);
    };
  }
);
define(
  'ephox.sugar.api.search.PredicateFind',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.impl.ClosestOrAncestor'
  ],

  function (Type, Arr, Fun, Option, Body, Compare, Element, ClosestOrAncestor) {
    var first = function (predicate) {
      return descendant(Body.body(), predicate);
    };

    var ancestor = function (scope, predicate, isRoot) {
      var element = scope.dom();
      var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

      while (element.parentNode) {
        element = element.parentNode;
        var el = Element.fromDom(element);

        if (predicate(el)) return Option.some(el);
        else if (stop(el)) break;
      }
      return Option.none();
    };

    var closest = function (scope, predicate, isRoot) {
      // This is required to avoid ClosestOrAncestor passing the predicate to itself
      var is = function (scope) {
        return predicate(scope);
      };
      return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
    };

    var sibling = function (scope, predicate) {
      var element = scope.dom();
      if (!element.parentNode) return Option.none();

      return child(Element.fromDom(element.parentNode), function (x) {
        return !Compare.eq(scope, x) && predicate(x);
      });
    };

    var child = function (scope, predicate) {
      var result = Arr.find(scope.dom().childNodes,
        Fun.compose(predicate, Element.fromDom));
      return result.map(Element.fromDom);
    };

    var descendant = function (scope, predicate) {
      var descend = function (element) {
        for (var i = 0; i < element.childNodes.length; i++) {
          if (predicate(Element.fromDom(element.childNodes[i])))
            return Option.some(Element.fromDom(element.childNodes[i]));

          var res = descend(element.childNodes[i]);
          if (res.isSome())
            return res;
        }

        return Option.none();
      };

      return descend(scope.dom());
    };

    return {
      first: first,
      ancestor: ancestor,
      closest: closest,
      sibling: sibling,
      child: child,
      descendant: descendant
    };
  }
);

/**
 * CaretUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility functions shared by the caret logic.
 *
 * @private
 * @class tinymce.caret.CaretUtils
 */
define(
  'tinymce.core.caret.CaretUtils',
  [
    "tinymce.core.util.Fun",
    "tinymce.core.dom.TreeWalker",
    "tinymce.core.dom.NodeType",
    "tinymce.core.caret.CaretPosition",
    "tinymce.core.caret.CaretContainer",
    "tinymce.core.caret.CaretCandidate"
  ],
  function (Fun, TreeWalker, NodeType, CaretPosition, CaretContainer, CaretCandidate) {
    var isContentEditableTrue = NodeType.isContentEditableTrue,
      isContentEditableFalse = NodeType.isContentEditableFalse,
      isBlockLike = NodeType.matchStyleValues('display', 'block table table-cell table-caption list-item'),
      isCaretContainer = CaretContainer.isCaretContainer,
      isCaretContainerBlock = CaretContainer.isCaretContainerBlock,
      curry = Fun.curry,
      isElement = NodeType.isElement,
      isCaretCandidate = CaretCandidate.isCaretCandidate;

    function isForwards(direction) {
      return direction > 0;
    }

    function isBackwards(direction) {
      return direction < 0;
    }

    function skipCaretContainers(walk, shallow) {
      var node;

      while ((node = walk(shallow))) {
        if (!isCaretContainerBlock(node)) {
          return node;
        }
      }

      return null;
    }

    function findNode(node, direction, predicateFn, rootNode, shallow) {
      var walker = new TreeWalker(node, rootNode);

      if (isBackwards(direction)) {
        if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
          node = skipCaretContainers(walker.prev, true);
          if (predicateFn(node)) {
            return node;
          }
        }

        while ((node = skipCaretContainers(walker.prev, shallow))) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }

      if (isForwards(direction)) {
        if (isContentEditableFalse(node) || isCaretContainerBlock(node)) {
          node = skipCaretContainers(walker.next, true);
          if (predicateFn(node)) {
            return node;
          }
        }

        while ((node = skipCaretContainers(walker.next, shallow))) {
          if (predicateFn(node)) {
            return node;
          }
        }
      }

      return null;
    }

    function getEditingHost(node, rootNode) {
      for (node = node.parentNode; node && node != rootNode; node = node.parentNode) {
        if (isContentEditableTrue(node)) {
          return node;
        }
      }

      return rootNode;
    }

    function getParentBlock(node, rootNode) {
      while (node && node != rootNode) {
        if (isBlockLike(node)) {
          return node;
        }

        node = node.parentNode;
      }

      return null;
    }

    function isInSameBlock(caretPosition1, caretPosition2, rootNode) {
      return getParentBlock(caretPosition1.container(), rootNode) == getParentBlock(caretPosition2.container(), rootNode);
    }

    function isInSameEditingHost(caretPosition1, caretPosition2, rootNode) {
      return getEditingHost(caretPosition1.container(), rootNode) == getEditingHost(caretPosition2.container(), rootNode);
    }

    function getChildNodeAtRelativeOffset(relativeOffset, caretPosition) {
      var container, offset;

      if (!caretPosition) {
        return null;
      }

      container = caretPosition.container();
      offset = caretPosition.offset();

      if (!isElement(container)) {
        return null;
      }

      return container.childNodes[offset + relativeOffset];
    }

    function beforeAfter(before, node) {
      var range = node.ownerDocument.createRange();

      if (before) {
        range.setStartBefore(node);
        range.setEndBefore(node);
      } else {
        range.setStartAfter(node);
        range.setEndAfter(node);
      }

      return range;
    }

    function isNodesInSameBlock(rootNode, node1, node2) {
      return getParentBlock(node1, rootNode) == getParentBlock(node2, rootNode);
    }

    function lean(left, rootNode, node) {
      var sibling, siblingName;

      if (left) {
        siblingName = 'previousSibling';
      } else {
        siblingName = 'nextSibling';
      }

      while (node && node != rootNode) {
        sibling = node[siblingName];

        if (isCaretContainer(sibling)) {
          sibling = sibling[siblingName];
        }

        if (isContentEditableFalse(sibling)) {
          if (isNodesInSameBlock(rootNode, sibling, node)) {
            return sibling;
          }

          break;
        }

        if (isCaretCandidate(sibling)) {
          break;
        }

        node = node.parentNode;
      }

      return null;
    }

    var before = curry(beforeAfter, true);
    var after = curry(beforeAfter, false);

    function normalizeRange(direction, rootNode, range) {
      var node, container, offset, location;
      var leanLeft = curry(lean, true, rootNode);
      var leanRight = curry(lean, false, rootNode);

      container = range.startContainer;
      offset = range.startOffset;

      if (CaretContainer.isCaretContainerBlock(container)) {
        if (!isElement(container)) {
          container = container.parentNode;
        }

        location = container.getAttribute('data-mce-caret');

        if (location == 'before') {
          node = container.nextSibling;
          if (isContentEditableFalse(node)) {
            return before(node);
          }
        }

        if (location == 'after') {
          node = container.previousSibling;
          if (isContentEditableFalse(node)) {
            return after(node);
          }
        }
      }

      if (!range.collapsed) {
        return range;
      }

      if (NodeType.isText(container)) {
        if (isCaretContainer(container)) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before(node);
            }

            node = leanLeft(container);
            if (node) {
              return after(node);
            }
          }

          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after(node);
            }

            node = leanRight(container);
            if (node) {
              return before(node);
            }
          }

          return range;
        }

        if (CaretContainer.endsWithCaretContainer(container) && offset >= container.data.length - 1) {
          if (direction === 1) {
            node = leanRight(container);
            if (node) {
              return before(node);
            }
          }

          return range;
        }

        if (CaretContainer.startsWithCaretContainer(container) && offset <= 1) {
          if (direction === -1) {
            node = leanLeft(container);
            if (node) {
              return after(node);
            }
          }

          return range;
        }

        if (offset === container.data.length) {
          node = leanRight(container);
          if (node) {
            return before(node);
          }

          return range;
        }

        if (offset === 0) {
          node = leanLeft(container);
          if (node) {
            return after(node);
          }

          return range;
        }
      }

      return range;
    }

    function isNextToContentEditableFalse(relativeOffset, caretPosition) {
      return isContentEditableFalse(getChildNodeAtRelativeOffset(relativeOffset, caretPosition));
    }

    return {
      isForwards: isForwards,
      isBackwards: isBackwards,
      findNode: findNode,
      getEditingHost: getEditingHost,
      getParentBlock: getParentBlock,
      isInSameBlock: isInSameBlock,
      isInSameEditingHost: isInSameEditingHost,
      isBeforeContentEditableFalse: curry(isNextToContentEditableFalse, 0),
      isAfterContentEditableFalse: curry(isNextToContentEditableFalse, -1),
      normalizeRange: normalizeRange
    };
  }
);

/**
 * CaretWalker.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic for moving around a virtual caret in logical order within a DOM element.
 *
 * It ignores the most obvious invalid caret locations such as within a script element or within a
 * contentEditable=false element but it will return locations that isn't possible to render visually.
 *
 * @private
 * @class tinymce.caret.CaretWalker
 * @example
 * var caretWalker = new CaretWalker(rootElm);
 *
 * var prevLogicalCaretPosition = caretWalker.prev(CaretPosition.fromRangeStart(range));
 * var nextLogicalCaretPosition = caretWalker.next(CaretPosition.fromRangeEnd(range));
 */
define(
  'tinymce.core.caret.CaretWalker',
  [
    "tinymce.core.dom.NodeType",
    "tinymce.core.caret.CaretCandidate",
    "tinymce.core.caret.CaretPosition",
    "tinymce.core.caret.CaretUtils",
    "tinymce.core.util.Arr",
    "tinymce.core.util.Fun"
  ],
  function (NodeType, CaretCandidate, CaretPosition, CaretUtils, Arr, Fun) {
    var isContentEditableFalse = NodeType.isContentEditableFalse,
      isText = NodeType.isText,
      isElement = NodeType.isElement,
      isBr = NodeType.isBr,
      isForwards = CaretUtils.isForwards,
      isBackwards = CaretUtils.isBackwards,
      isCaretCandidate = CaretCandidate.isCaretCandidate,
      isAtomic = CaretCandidate.isAtomic,
      isEditableCaretCandidate = CaretCandidate.isEditableCaretCandidate;

    function getParents(node, rootNode) {
      var parents = [];

      while (node && node != rootNode) {
        parents.push(node);
        node = node.parentNode;
      }

      return parents;
    }

    function nodeAtIndex(container, offset) {
      if (container.hasChildNodes() && offset < container.childNodes.length) {
        return container.childNodes[offset];
      }

      return null;
    }

    function getCaretCandidatePosition(direction, node) {
      if (isForwards(direction)) {
        if (isCaretCandidate(node.previousSibling) && !isText(node.previousSibling)) {
          return CaretPosition.before(node);
        }

        if (isText(node)) {
          return CaretPosition(node, 0);
        }
      }

      if (isBackwards(direction)) {
        if (isCaretCandidate(node.nextSibling) && !isText(node.nextSibling)) {
          return CaretPosition.after(node);
        }

        if (isText(node)) {
          return CaretPosition(node, node.data.length);
        }
      }

      if (isBackwards(direction)) {
        if (isBr(node)) {
          return CaretPosition.before(node);
        }

        return CaretPosition.after(node);
      }

      return CaretPosition.before(node);
    }

    // Jumps over BR elements <p>|<br></p><p>a</p> -> <p><br></p><p>|a</p>
    function isBrBeforeBlock(node, rootNode) {
      var next;

      if (!NodeType.isBr(node)) {
        return false;
      }

      next = findCaretPosition(1, CaretPosition.after(node), rootNode);
      if (!next) {
        return false;
      }

      return !CaretUtils.isInSameBlock(CaretPosition.before(node), CaretPosition.before(next), rootNode);
    }

    function findCaretPosition(direction, startCaretPosition, rootNode) {
      var container, offset, node, nextNode, innerNode,
        rootContentEditableFalseElm, caretPosition;

      if (!isElement(rootNode) || !startCaretPosition) {
        return null;
      }

      if (startCaretPosition.isEqual(CaretPosition.after(rootNode)) && rootNode.lastChild) {
        caretPosition = CaretPosition.after(rootNode.lastChild);
        if (isBackwards(direction) && isCaretCandidate(rootNode.lastChild) && isElement(rootNode.lastChild)) {
          return isBr(rootNode.lastChild) ? CaretPosition.before(rootNode.lastChild) : caretPosition;
        }
      } else {
        caretPosition = startCaretPosition;
      }

      container = caretPosition.container();
      offset = caretPosition.offset();

      if (isText(container)) {
        if (isBackwards(direction) && offset > 0) {
          return CaretPosition(container, --offset);
        }

        if (isForwards(direction) && offset < container.length) {
          return CaretPosition(container, ++offset);
        }

        node = container;
      } else {
        if (isBackwards(direction) && offset > 0) {
          nextNode = nodeAtIndex(container, offset - 1);
          if (isCaretCandidate(nextNode)) {
            if (!isAtomic(nextNode)) {
              innerNode = CaretUtils.findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
              if (innerNode) {
                if (isText(innerNode)) {
                  return CaretPosition(innerNode, innerNode.data.length);
                }

                return CaretPosition.after(innerNode);
              }
            }

            if (isText(nextNode)) {
              return CaretPosition(nextNode, nextNode.data.length);
            }

            return CaretPosition.before(nextNode);
          }
        }

        if (isForwards(direction) && offset < container.childNodes.length) {
          nextNode = nodeAtIndex(container, offset);
          if (isCaretCandidate(nextNode)) {
            if (isBrBeforeBlock(nextNode, rootNode)) {
              return findCaretPosition(direction, CaretPosition.after(nextNode), rootNode);
            }

            if (!isAtomic(nextNode)) {
              innerNode = CaretUtils.findNode(nextNode, direction, isEditableCaretCandidate, nextNode);
              if (innerNode) {
                if (isText(innerNode)) {
                  return CaretPosition(innerNode, 0);
                }

                return CaretPosition.before(innerNode);
              }
            }

            if (isText(nextNode)) {
              return CaretPosition(nextNode, 0);
            }

            return CaretPosition.after(nextNode);
          }
        }

        node = caretPosition.getNode();
      }

      if ((isForwards(direction) && caretPosition.isAtEnd()) || (isBackwards(direction) && caretPosition.isAtStart())) {
        node = CaretUtils.findNode(node, direction, Fun.constant(true), rootNode, true);
        if (isEditableCaretCandidate(node)) {
          return getCaretCandidatePosition(direction, node);
        }
      }

      nextNode = CaretUtils.findNode(node, direction, isEditableCaretCandidate, rootNode);

      rootContentEditableFalseElm = Arr.last(Arr.filter(getParents(container, rootNode), isContentEditableFalse));
      if (rootContentEditableFalseElm && (!nextNode || !rootContentEditableFalseElm.contains(nextNode))) {
        if (isForwards(direction)) {
          caretPosition = CaretPosition.after(rootContentEditableFalseElm);
        } else {
          caretPosition = CaretPosition.before(rootContentEditableFalseElm);
        }

        return caretPosition;
      }

      if (nextNode) {
        return getCaretCandidatePosition(direction, nextNode);
      }

      return null;
    }

    return function (rootNode) {
      return {
        /**
         * Returns the next logical caret ߧ.�x�����}W�Q����3���m�^ߩv���=���ۿ���w��������X������_��ۙt�e~����c[F-������˪�]���������-�?����μ�m��O���׶���={�>����?�/K~W�����bv�v�ӯ/~�����/�� ���{�XP�u���Q���WU��l���f��o뚷΁������]�I[W����4�:ߛ�л��U��M���x�K���v�O��o���թ)�_.�e��QS�����[vh���C��ʵ������f��x.������ދ����̟�b����z�����d럇��BiG�~�v_��Ǜ��/�s_����/˦������$��n�����*r�;�;����۳�jw�byu��qo�����}������ik��k��_��=��x�r������������q���~����{��ʖo9�MV����Zog�x�ƿ�����<=ۊ��Wh�����㴾o�/_�>�?���ǁ�����V���Th��^���y����w����7�in��ݿ}�}O���8����W�-�V��c�����}_���y3��64o���ݛl�>�{�Q_�������o���6����y��f�YY���mn�q�-y��X�*�����z�������*N?N_��[�����v\��������Z�g���5���?�������O�����<7ܟ˒�+�8��m�s��������2�=f�/�������9ܼܼ�'X������wP��ۿ�����j:�}�}�s�g���8�B�}��+�7�˿Ϟy��z���I߾�[�������[��O����g�������G���{��m|z=���"�����^������ו���|�7����>�l��,޴ջn���O7�������ѱ~����5�3�To�P>���S�[����i\q����]}p����Ow��W��=�}B����_��צ/Y{�m���������y��~ڞ��c[��[����Z�ms'�������!ˢ�[>�sz�����������������z�e�]�}��f�c�ߋ�L֫k���Ư��������m�w�<��y��o��G�߽��%�>��=������u��ߟ޴��z_W�?�~��"?*����ֶ����_�bf|��ѓ��m�Oç=]���?��{�ֽ�l�8�f}j���U�e����������}�~V�5��ؚ����z�k����޵�mݜJ����}������2�D��?y���v�y��s�dW�f��3��rW���M����3p}����n{�����q�wϞ{v�S����Zo����N5��_����އ�w�7����{_����{6�������]+W3n7�x�����l���ֽ_����[V���l�K}���G�����]��ݽ�W�[�^�~��;y��'��n{ͯ���k�j_���Z=V���5�m�����Ou�Ͽ�}��z������������hՍ��<k���|�u�=������)����XW��?��W�KjlG!z�cl7�����7���o�,�.�fr�����7���-K�W����sz�+xv��ҿ�x_�ׯ�(5�}w��Xo��M����:�����6��[�.'L�H���f�����V�/}�>��T�f��(G�o��q��+�}~ut�g|�ۙ���o�m���
        return Option.some(new CaretPosition(startNode, forward ? 0 : startNode.data.length));
      } else if (startNode) {
        if (CaretCandidate.isCaretCandidate(startNode)) {
          return Option.some(forward ? CaretPosition.before(startNode) : afterElement(startNode));
        } else {
          return walkToPositionIn(forward, element, startNode);
        }
      } else {
        return Option.none();
      }
    };

    return {
      fromPosition: fromPosition,
      navigate: navigate,
      positionIn: positionIn
    };
  }
);

/**
 * DeleteUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind'
  ],
  function (Arr, Option, Compare, Element, Node, PredicateFind) {
    var toLookup = function (names) {
      var lookup = Arr.foldl(names, function (acc, name) {
        acc[name] = true;
        return acc;
      }, { });

      return function (elm) {
        return lookup[Node.name(elm)] === true;
      };
    };

    var isTextBlock = toLookup([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'address', 'pre', 'form', 'blockquote', 'center',
      'dir', 'fieldset', 'header', 'footer', 'article', 'section', 'hgroup', 'aside', 'nav', 'figure'
    ]);

    var isBeforeRoot = function (rootNode) {
      return function (elm) {
        return Compare.eq(rootNode, Element.fromDom(elm.dom().parentNode));
      };
    };

    var getParentTextBlock = function (rootNode, elm) {
      return Compare.contains(rootNode, elm) ? PredicateFind.closest(elm, isTextBlock, isBeforeRoot(rootNode)) : Option.none();
    };

    return {
      getParentTextBlock: getParentTextBlock
    };
  }
);

define(
  'ephox.sugar.api.search.SelectorFind',

  [
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Selectors',
    'ephox.sugar.impl.ClosestOrAncestor'
  ],

  function (PredicateFind, Selectors, ClosestOrAncestor) {
    // TODO: An internal SelectorFilter module that doesn't Element.fromDom() everything

    var first = function (selector) {
      return Selectors.one(selector);
    };

    var ancestor = function (scope, selector, isRoot) {
      return PredicateFind.ancestor(scope, function (e) {
        return Selectors.is(e, selector);
      }, isRoot);
    };

    var sibling = function (scope, selector) {
      return PredicateFind.sibling(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var child = function (scope, selector) {
      return PredicateFind.child(scope, function (e) {
        return Selectors.is(e, selector);
      });
    };

    var descendant = function (scope, selector) {
      return Selectors.one(selector, scope);
    };

    var closest = function (scope, selector, isRoot) {
      return ClosestOrAncestor(Selectors.is, ancestor, scope, selector, isRoot);
    };

    return {
      first: first,
      ancestor: ancestor,
      sibling: sibling,
      child: child,
      descendant: descendant,
      closest: closest
    };
  }
);

define(
  'ephox.sugar.api.search.SelectorExists',

  [
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (SelectorFind) {
    var any = function (selector) {
      return SelectorFind.first(selector).isSome();
    };

    var ancestor = function (scope, selector, isRoot) {
      return SelectorFind.ancestor(scope, selector, isRoot).isSome();
    };

    var sibling = function (scope, selector) {
      return SelectorFind.sibling(scope, selector).isSome();
    };

    var child = function (scope, selector) {
      return SelectorFind.child(scope, selector).isSome();
    };

    var descendant = function (scope, selector) {
      return SelectorFind.descendant(scope, selector).isSome();
    };

    var closest = function (scope, selector, isRoot) {
      return SelectorFind.closest(scope, selector, isRoot).isSome();
    };

    return {
      any: any,
      ancestor: ancestor,
      sibling: sibling,
      child: child,
      descendant: descendant,
      closest: closest
    };
  }
);

/**
 * Empty.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.Empty',
  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorExists',
    'tinymce.core.caret.CaretCandidate',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.TreeWalker'
  ],
  function (Fun, Compare, Element, SelectorExists, CaretCandidate, NodeType, TreeWalker) {
    var hasWhitespacePreserveParent = function (rootNode, node) {
      var rootElement = Element.fromDom(rootNode);
      var startNode = Element.fromDom(node);
      return SelectorExists.ancestor(startNode, 'pre,code', Fun.curry(Compare.eq, rootElement));
    };

    var isWhitespace = function (rootNode, node) {
      return NodeType.isText(node) && /^[ \t\r\n]*$/.test(node.data) && hasWhitespacePreserveParent(rootNode, node) === false;
    };

    var isNamedAnchor = function (node) {
      return NodeType.isElement(node) && node.nodeName === 'A' && node.hasAttribute('name');
    };

    var isContent = function (rootNode, node) {
      return (CaretCandidate.isCaretCandidate(node) && isWhitespace(rootNode, node) === false) || isNamedAnchor(node) || isBookmark(node);
    };

    var isBookmark = NodeType.hasAttribute('data-mce-bookmark');
    var isBogus = NodeType.hasAttribute('data-mce-bogus');
    var isBogusAll = NodeType.hasAttributeValue('data-mce-bogus', 'all');

    var isEmptyNode = function (targetNode) {
      var walker, node, brCount = 0;

      if (isContent(targetNode, targetNode)) {
        return false;
      } else {
        node = targetNode.firstChild;
        if (!node) {
          return true;
        }

        walker = new TreeWalker(node, targetNode);
        do {
          if (isBogusAll(node)) {
            node = walker.next(true);
            continue;
          }

          if (isBogus(node)) {
            node = walker.next();
            continue;
          }

          if (NodeType.isBr(node)) {
            brCount++;
            node = walker.next();
            continue;
          }

          if (isContent(targetNode, node)) {
            return false;
          }

          node = walker.next();
        } while (node);

        return brCount <= 1;
      }
    };

    var isEmpty = function (elm) {
      return isEmptyNode(elm.dom());
    };

    return {
      isEmpty: isEmpty
    };
  }
);

/**
 * BlockBoundary.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockBoundary',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.katamari.api.Struct',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.PredicateFind',
    'ephox.sugar.api.search.Traverse',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.NodeType'
  ],
  function (Arr, Fun, Option, Options, Struct, Compare, Element, Node, PredicateFind, Traverse, CaretFinder, CaretPosition, DeleteUtils, Empty, NodeType) {
    var BlockPosition = Struct.immutable('block', 'position');
    var BlockBoundary = Struct.immutable('from', 'to');

    var getBlockPosition = function (rootNode, pos) {
      var rootElm = Element.fromDom(rootNode);
      var containerElm = Element.fromDom(pos.cont�B��gD
;�c�B0A� ��C��B!%u�%�ق�1�R@"��r�!�5� (rft�d*0�T�*b#! $�BE������C b �HQ� �֎�:��'T�)�5�`�K��
I��@6�X��!�������@>�"@��&
%	�9�`�0�P�
� �$�m��	e(�x( Px.B]�"!1!@�@� p
@�Q P  AԤ�y�( ?D@��(��b�D`m
��@LD�8 #	$�EFh$�p��bE�"�.8 � 	D, �8�0�xHp� �03 ` �H��� rBc� ]��4 �X	%#(Đ�"�P$!&#�T�@D� ���H"exZL@0�r$��>���!Dt��a'�!��H�@0�O�4�
 �P�*��qF0x�� E�����
�D��(����H�
��G�7or�*B���"�*�~eF@�W C����� @���0 JAX
�p� �G����0(�"�04$(�0��@d ��$`LI�""��x�l�P��<B:0�U
��5F$+��d\Ą��h� 4
�D��j�� FAi��V{�b@�Hh�1K����
zq0  ��@րht@Rr� ǀb��
�LH��	Rh	��Sȗ�����@ $�6Eq�Ū�1JP��
��"P�`� 0�;�$� �Z ��F ��P�b��7��2%�P�.` �H�V ������ �L�P2�`� ��^@�+` 	B����B"L��FLF

����d�A�$b<��bS4��2Q�ĠL1�b�Đ#����qL�8�  ��h, ��@N�)%� RE�L�S0�� ȈO  	��I�4Xp�a�`F$N%��$p�Q���H 0�B�@�.�@�� y5f (� ��h
"	�� ��� T�"
&	�<�0D��h�� PCP�f �qL@M?�L�	�u������I'l�<�@ i�T FPL(�r��@��	X(
��@A�B,k,�H����b1Y6$�`t$ "`#tB� �L��J�P4�A�.�@@I�6 �8XR'&�����͜`)e �@�&�dKJИ��0¼��
6��
� �='^A"�H��U9�`S,@� �f�Bc

���9ET@������D°���h"�q��X@�8%�iT 8��U@�)@@)����B�E�����J��d�I℁�J�Q�0�R`�@��G�؈	 �U�%!@�$�@N�ggA*H�!&@RR�$��!�2�@`T���5K�0F�Қb,�`g)��<R�8@CXf��������|)R@I� � h��{	��S��� ��eF�&A
8��B;" P�0�(
�� f�r��M!�����P<DT
�� �	��	�U�
O��&�������� �@��Rp	%I٫�F�W�!��dC>A�!f�����T�&
*Ӓ栄	 9�(H),�:��,B&K�hH��)�q1"Ł� �!�N� ���%�Tl0� �Kx�#fA@ @�d�/�@���$��|�E + �"
Kq�B&W��ސ�� �@@�A2A�8 �t� ��*���f2�\�E��Ԡ]Pu �.�T;���xe
Bux,�\� �!���!	0
Mh��H�
��C�X�� �  3��)A`f*@�눎梫����#t����+
(i,a 6t,�@@a��E8���"D��	 QD�B[z�DRI, (�!5�+ ���p �4	 7�q�x!pQ�C�� ��q�8 P���
LP���`��D(wL�����XBZ�$�P���`�0���4 -
���
�C�� �`��!` �DҜa���� �0��@0� #�f',)eĠI��PQ]"H�, "���PQ�äL�	�`;�2y40^0 ���(�9���@+ 
"Pl�d��VF� 3��	� �;D��Y�@� @ �O�w 
d0`X܌X2  xS��Rd�K;}I�^b�F�S=@d9M-��&Nh(�Uʀ��8��  t"�Â
ɠ"1HB���E����O؀DY ��� 0����l��<�"�Pt��J� �0�4@(0(a��$��H��t � #� ���ʘ�2" 
����� �@�v�?5�U:'��5sY���y�
(iB2r".�	i&�.b�rD�
PB J
�d�2h
ե�8��a�=Zs�
1���s ���d�� o Q��   DT�h����p�I`0X�O4�H�	Cg@KIII1��)�b	`��z		der.positionIn(false, block1.dom()).bind(function (toPosition) {
            return mergeBlocksAndReposition(forward, block2, block1, toPosition);
          });
        }
      } else {
        if (Empty.isEmpty(block2)) {
          Remove.remove(block2);
          return CaretFinder.positionIn(true, block1.dom());
        } else {
          return CaretFinder.positionIn(false, block2.dom()).bind(function (toPosition) {
            return mergeBlocksAndReposition(forward, block1, block2, toPosition);
          });
        }
      }
    };

    return {
      mergeBlocks: mergeBlocks
    };
  }
);

/**
 * BlockBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockBoundaryDelete',
  [
    'tinymce.core.delete.BlockBoundary',
    'tinymce.core.delete.MergeBlocks'
  ],
  function (BlockBoundary, MergeBlocks) {
    var backspaceDelete = function (editor, forward) {
      var position;

      position = BlockBoundary.read(editor.getBody(), forward, editor.selection.getRng()).bind(function (blockBoundary) {
        return MergeBlocks.mergeBlocks(forward, blockBoundary.from().block(), blockBoundary.to().block());
      });

      position.each(function (pos) {
        editor.selection.setRng(pos.toRange());
      });

      return position.isSome();
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);

/**
 * BlockRangeDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.BlockRangeDelete',
  [
    'ephox.katamari.api.Options',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'tinymce.core.delete.DeleteUtils',
    'tinymce.core.delete.MergeBlocks'
  ],
  function (Options, Compare, Element, DeleteUtils, MergeBlocks) {
    var deleteRange = function (rootNode, selection) {
      var rng = selection.getRng();

      return Options.liftN([
        DeleteUtils.getParentTextBlock(rootNode, Element.fromDom(rng.startContainer)),
        DeleteUtils.getParentTextBlock(rootNode, Element.fromDom(rng.endContainer))
      ], function (block1, block2) {
        if (Compare.eq(block1, block2) === false) {
          rng.deleteContents();

          MergeBlocks.mergeBlocks(true, block1, block2).each(function (pos) {
            selection.setRng(pos.toRange());
          });

          return true;
        } else {
          return false;
        }
      }).getOr(false);
    };

    var backspaceDelete = function (editor, forward) {
      var rootNode = Element.fromDom(editor.getBody());

      if (editor.selection.isCollapsed() === false) {
        return deleteRange(rootNode, editor.selection);
      } else {
        return false;
      }
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);

define(
  'ephox.katamari.api.Adt',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Type',
    'global!Array',
    'global!Error',
    'global!console'
  ],

  function (Arr, Obj, Type, Array, Error, console) {
    /*
     * Generates a church encoded ADT (https://en.wikipedia.org/wiki/Church_encoding)
     * For syntax and use, look at the test code.
     */
    var generate = function (cases) {
      // validation
      if (!Type.isArray(cases)) {
        throw new Error('cases must be an array');
      }
      if (cases.length === 0) {
        throw new Error('there must be at least one case');
      }

      var constructors = [ ];

      // adt is mutated to add the individual cases
      var adt = {};
      Arr.each(cases, function (acase, count) {
        var keys = Obj.keys(acase);

        // validation
        if (keys.length !== 1) {
          throw new Error('one and only one name per case');
        }

        var key = keys[0];
        var value = acase[key];
-q����S��ǟ?��~���������_T�E���������}Y_����==������~�=���g���g�wm����]�מ���o������a&���s���{��O���o�\+��ߕ���������%�5��&����}�����-�J���O�����;����`���~�¯w*�>V���s_��
��s�i1/��;�mj]v/���;b���?���o���Cj��}p�~{_���g��=_��V�$����՗n^�TzR����W{��G��>���{���ov���}�������Ϸ}�ڲs�ns�zG�8w����b�������y��u�g�e�l���Q���o��U{+?_��;O���Wnf�v�o}���_�o��kw���r?��ܛ�����W1������u����Y\u���s����_}���ӣ����<gn��u��o��s��o��O�,�ko���y6�{������l�_��Z����mޯ��k���{�;�_�Կ��G������{˺k����=�Ϸ6��g������Gi��O����߸����������A��^G�O�s���_���k��)Χ9����9��?�+���;t{Ѯ޶�����'����|<��O���lޏنL�Y}������?�i����!��S�����������f�����3�.�����������}�o�O{}�0�K)�������U�p��O'C^�}�ym�#����������?���߷��{ϵ�秊o;����ߋw�z��?����߿�����.o�����֬�������o5��~����Ŕ��uן����ϓ��z����ռ�lw�ڻ��y���2��^�w\�����ik-���l���w^����8�_����n�Y�k��GW���_���߿{�|_����Q�k�ϖ���[e���J�^1��ߗ���v]Sg_�W~w���O+̏�{��~����g����]l����g�U���p
g�O,����zU���s�?�ė�?�~�o�����ן�v�������q��w��޺�$�i�&���'�^r�Y�{�߿w7�
        return Option.some(DeleteAction.moveToElement(toCefElm));
      });
    };

    var findCefPosition = function (rootNode, forward, from) {
      return CaretFinder.fromPosition(forward, rootNode, from).bind(function (to) {
        if (forward && NodeType.isContentEditableFalse(to.getNode())) {
          return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
        } else if (forward === false && NodeType.isContentEditableFalse(to.getNode(true))) {
          return deleteEmptyBlockOrMoveToCef(rootNode, forward, from, to);
        } else if (forward && CaretUtils.isAfterContentEditableFalse(from)) {
          return Option.some(DeleteAction.moveToPosition(to));
        } else if (forward === false && CaretUtils.isBeforeContentEditableFalse(from)) {
          return Option.some(DeleteAction.moveToPosition(to));
        } else {
          return Option.none();
        }
      });
    };

    var getContentEditableBlockAction = function (forward, elm) {
      if (forward && NodeType.isContentEditableFalse(elm.nextSibling)) {
        return Option.some(DeleteAction.moveToElement(elm.nextSibling));
      } else if (forward === false && NodeType.isContentEditableFalse(elm.previousSibling)) {
        return Option.some(DeleteAction.moveToElement(elm.previousSibling));
      } else {
        return Option.none();
      }
    };

    var getContentEditableAction = function (rootNode, forward, from) {
      if (isAtContentEditableBlockCaret(forward, from)) {
        return getContentEditableBlockAction(forward, from.getNode(forward === false))
          .fold(
            function () {
              return findCefPosition(rootNode, forward, from);
            },
            Option.some
          );
      } else {
        return findCefPosition(rootNode, forward, from);
      }
    };

    var read = function (rootNode, forward, rng) {
      var normalizedRange = CaretUtils.normalizeRange(forward ? 1 : -1, rootNode, rng);
      var from = CaretPosition.fromRangeStart(normalizedRange);

      if (forward === false && CaretUtils.isAfterContentEditableFalse(from)) {
        return Option.some(DeleteAction.remove(from.getNode(true)));
      } else if (forward && CaretUtils.isBeforeContentEditableFalse(from)) {
        return Option.some(DeleteAction.remove(from.getNode()));
      } else {
        return getContentEditableAction(rootNode, forward, from);
      }
    };

    return {
      read: read
    };
  }
);

/**
 * Bidi.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.text.Bidi',
  [
  ],
  function () {
    var strongRtl = /[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;

    var hasStrongRtl = function (text) {
      return strongRtl.test(text);
    };

    return {
      hasStrongRtl: hasStrongRtl
    };
  }
);
/**
 * InlineUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.InlineUtils',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.caret.CaretWalker',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Bidi'
  ],
  function (Arr, Fun, Option, Options, CaretContainer, CaretFinder, CaretPosition, CaretUtils, CaretWalker, DOMUtils, NodeType, Bidi) {
    var isInlineTarget = function (elm) {
      return DOMUtils.DOM.is(elm, 'a[href],code');
    };

    var isRtl = function (element) {
      return DOMUtils.DOM.getStyle(element, 'direction', true) === 'rtl' || Bidi.hasStrongRtl(element.textContent);
    };

    var findInlineParents = function (rootNode, pos) ������gM�w'����
������}��e���?�]���>�}y�<%����
��X�ߗ7e����`���z���}�Woc���]�{]�yUz&��w�No��P�����5w�қo�w��ҶTpF?m�B?���XO�oy���v���.�g���g�.�U�m~�������R���_�u=7)���\�}�t�p��#t�,��������/���Ϭ�j{W���������������o?ܿ{�?�~���	�Μty�����~�;߷G�ޏ�Y����k����+�c�������0����[����z�����}~[�?��������k����n�}ͭ���w���v�?�/������>�5���N�u�������������?Kk�>x��=�s��n31�?���ɀH���me����󣽤���4��2��7s���ƽ��r��pC��{V��y��G��{�_�������v�d�G���?_�k�'��W����w�����xW��*���G�Ϲ��_��kw���������m�=#������.����������<����������D����Sg�w����|�߼��r�[���>�7T߮�����;}��ws���3������W��Ϛ����-���p~�Ǫ�o��V�?��Z�Z��]7�Qw���^�}�g}�K�=�j�y�~?�/�s͟�޾�[��yo����s���V�ګ����K��Ʒ޾�cR���|sO��랛CF��֛��ǻO��7���\�{����%_۝w��w��#�wKb�ݯ��F�������o=����٫�>�0�?�p�����p_�^�^���ou:K�������ٯ^����]�=�'u"_?��#�=7{��W5�3�����^�m'�_�/�7$�%zzf|�{���|9�u�w��j��wK�����{����[��ݿݶ/���j��ɉQ�+�-����߮-��ݛ�?�%��y޳�:���.��7?�y��۟�}�w��m�_���;����]u�?�u�[9���K�
]R�<�ϖ�'�A������듼u����>�vw�w�z�r���k��=���v�{�l'��3�7�nټQ�W�t����2E�3o�ϴ���E��k�W_����>��6�������_������wϏd����������W�����ܴ�r]������w~띿��u�]�.FK���s��o�Y��?3������]~���
����������~w�[�?���N������y����{_�{'/�r��_�r��������������w���������t�r����pm��W<��R��l��Yh���O�׾�W���?�պ��������������|s}�Ǩ�=\������_�6�7{��߫���ܸ^�{�o�V�2�6�����g����i�)��S/�f]�e�O_�U�����=�˿����3�����-#����ϣ��f�{�����}����f�U��zo�lN��bJOP��z;��ͽ�5u|���q�w�O�����NWW�W��Ӻ��S��ܝ�����M��;���ѯ��}�{��I�������/�^V��s�+�m���������}�_������5���y���Y��V�������x������<��ۦ������{��ھ�o�+�(���^MޮF����f��UZ�����0O�\�c�o<���iy��j����)��o��-�?��Z?���+��ӳ����g�ݶ�� U8ئ.��'p����������op����?}��L�sK�~�ښ���b�7������
      var offset = pos.offset();
      return CaretPosition.isTextPosition(pos) === false && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
    };

    var reposition = function (elm, pos) {
      return needsReposition(pos, elm) ? new CaretPosition(pos.container(), pos.offset() - 1) : pos;
    };

    var beforeOrStartOf = function (node) {
      return NodeType.isText(node) ? new CaretPosition(node, 0) : CaretPosition.before(node);
    };

    var afterOrEndOf = function (node) {
      return NodeType.isText(node) ? new CaretPosition(node, node.data.length) : CaretPosition.after(node);
    };

    var getPreviousSiblingCaretPosition = function (elm) {
      if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
        return Option.some(afterOrEndOf(elm.previousSibling));
      } else {
        return elm.previousSibling ? InlineUtils.findCaretPositionIn(elm.previousSibling, false) : Option.none();
      }
    };

    var getNextSiblingCaretPosition = function (elm) {
      if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
        return Option.some(beforeOrStartOf(elm.nextSibling));
      } else {
        return elm.nextSibling ? InlineUtils.findCaretPositionIn(elm.nextSibling, true) : Option.none();
      }
    };

    var findCaretPositionBackwardsFromElm = function (rootElement, elm) {
      var startPosition = CaretPosition.before(elm.previousSibling ? elm.previousSibling : elm.parentNode);
      return InlineUtils.findCaretPosition(rootElement, false, startPosition).fold(
        function () {
          return InlineUtils.findCaretPosition(rootElement, true, CaretPosition.after(elm));
        },
        Option.some
      );
    };

    var findCaretPositionForwardsFromElm = function (rootElement, elm) {
      return InlineUtils.findCaretPosition(rootElement, true, CaretPosition.after(elm)).fold(
        function () {
          return InlineUtils.findCaretPosition(rootElement, false, CaretPosition.before(elm));
        },
        Option.some
      );
    };

    var findCaretPositionBackwards = function (rootElement, elm) {
      return getPreviousSiblingCaretPosition(elm).orThunk(function () {
        return getNextSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionBackwardsFromElm(rootElement, elm);
      });
    };

    var findCaretPositionForward = function (rootElement, elm) {
      return getNextSiblingCaretPosition(elm).orThunk(function () {
        return getPreviousSiblingCaretPosition(elm);
      }).orThunk(function () {
        return findCaretPositionForwardsFromElm(rootElement, elm);
      });
    };

    var findCaretPosition = function (forward, rootElement, elm) {
      return forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);
    };

    var findCaretPosOutsideElmAfterDelete = function (forward, rootElement, elm) {
      return findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));
    };

    var setSelection = function (editor, forward, pos) {
      pos.fold(
        function () {
          editor.focus();
        },
        function (pos) {
          editor.selection.setRng(pos.toRange(), forward);
        }
      );
    };

    var eqRawNode = function (rawNode) {
      return function (elm) {
        return elm.dom() === rawNode;
      };
    };

    var isBlock = function (editor, elm) {
      return elm && editor.schema.getBlockElements().hasOwnProperty(Node.name(elm));
    };

    var paddEmptyBlock = function (elm) {
      if (Empty.isEmpty(elm)) {
        var br = Element.fromHtml('<br data-mce-bogus="1">');
        Remove.empty(elm);
        Insert.append(elm, br);
        return Option.some(CaretPosition.before(br.dom()));
      } else {
        return Option.none();
      }
    };

    // When deleting an element between two text nodes IE 11 doesn't automatically merge the adjacent text nodes
    var deleteNormalized = function (elm, afterDeletePosOpt) {
      return Options.liftN([Traverse.prevSibling(elm), Tr�L�D���1t�. -P�@	P7`3�f��SpB��Pq�zFL(�Nn���;�W6���P�
H�A� �i`�I �@P�p
f�m+P�
t	;2b�4P� 4"
`@+i$
9~8 �� "H �Re�Si"H@BxLi��!"bD�\�& CD� B���1`P �� �#�z�Y�Pi`�J Ǩ0#+E��4��S 08I[0S���J 	\Vh�i���H�
""�1`X�`U�HQ��B��5XA@
y*L!J�)���f3
@� ��  <��@�A����2@�
�Fr� ��]Na	e��L�P�
�#��]*%N ��x�! �@Q
��T%HD�`����A��*�� ��$�Q@@ 
+^����N�p�@0��I�@���
�!CütT��D�0�PwPN&}:MT��Vɐ���Ɛ@aoM���(�ױ�����@�d[^���H7Ǔ �D�����
b_�a'p�	�+@+* 1w0�PB,C(ih�$)WH`��hAe&1\���`hF�	�!
H���  Q �  �Abf�2�0� У�[!B0�v�H�@r�\ՁA@�(�05"�ύf���bL@�"� �GPp8�FA�*�0�@�
@�R�k@�B� QdXAA�#�(�@B��P�t.�ƃQ"�����s�Q�-Z��a�B�� �%(�S`hy��`����� �"����  Ӏ"��@0 	 4)��� �(C��B 9Pj��B�P ��	�*P%P%�<X
5@fń	�#F��1� &�0"
fEН T*F��@$@ ��D,���J~" �� g@@(�5�-E��	���
4�1P��X$p5�$R����	 Eb0n�H�C�"�eH�	8`�P41���?}y�
�@���B	��$%$�S()��C)Q	(��h]q�I(E�D@`��j��{ΔB��� P R$�0�A���h2DD	W�@�� 
�@hp� .V@
��̀.���-p� %� ��'a2�!&\ �%�$,� P �� H�(S`@*��+ኣ#����%Q�x6�)�AI��@�����\2�F�s��%!"%�Rm=ĸ��C$T��H0?ALA&  HK*MWijF�D@2A	i �	8�R�5��@/	�f�E��8.�
�X8
�m� b � `�^C20�ÀC�1�E�ZXA���pA
)���a`�XK�^�BhxD@D`����H+)$�!C �������`@1�i�i� I���R��H$p 
�tK���Á��b�8
 �PA��H2�
H3
V�T` !�bMfB2!a�`h�ń*`Z��{N(H!L0@�:#�� ��B$�d��Da�k�
J�2$�3$2,2F� m���ܐL�W �|�@KD��4E ��L�R� a�H]4!��R�IE#!	�6������` D�*Xjq�Q�@j��<�$+�P�6	`�(8%�\F܂.�
C���(��g)
L"�W�"�  K�F@��-�@��H �-(; J���F=��&(�#EĐ@HĂB�Ԏ���x&� Lč�D��2 �)�P�����Ʉb��HB��!y�@��R���a�@H0Pږh�d�ܸ���&�=a�Yj��PC	�T-�c����O2ܙ
�`�.�D!� �2$`��  a`� �itL�E
X ���IxA�7
PF��-�m���D���N��d�OF���r4Ĺ�Di��F;QTȸ�`RR� 0#l@�CF����oK̖ O�lr���	�� [CH7�,�` Y�R8" �!	^ !�,@4 �éI6F. Y����0UG�A�RޜhY6GA�%R"#a�H�	#��k�b܄�X�@���~ B|�֔"���,SI� �H� ��j� ��%6A8N= A�͙ҔM��5��l5��4 X����a%.�0� %��:� 6@ �`�7�RD0P�HՄ=0	#h@�4>p!0
 � ����(]V LK��xtB�&D8
&t<Ri�ԣ%��@jWL�2S� c�A��A���0�6
j �2�8�$`�)�)�9p`��MK;�7B�� �Hx�ֈ��B�ܭ�	 XSC�	A�@����� 0�|_�sH&<(�]0�@�$� &��� �$��FBPp���(� 
��"B R�6l�&0�6#_K*��>"�C�"�Nр�=0�� ���E���	0W��
vD[5(�i\	Ia��{�!���6D2�(���x���Odp!��9-�;��1RX-P���O@�WrMZP��Å�A�$��Q^��5B��0X��A�H�5	��!)C!0�Ԑ��+� .h4���#��Q�(P�@ӟ��PA
N.YyWp��F�q!L�@K��j]�,��D0��h  "�
����ac":;c�8y
��	$�A b i�X,���6�!����
- �2F@�@B��P����S��<0-0HA*�� �T����A0�Af��I�h� 
�#`�G
�U��6I$�IA����$M�1��I�p�& H&�� �`�,"8	�BNX,<b)�A���KA�^M�4J$N#šP cBi�;@Pd�D` GN�)�G�C'�PD"��5Q��t��4��=$$ᘂ��h؊t����9!0�$
p�!(��-P�4�a~`�G @"Y `N �b�����fX� �����Έ�>%����+�� �Q��8`��ۀ���1zor�v�k�F"-�E3J@���`@�
��	0m ��e��a�J�$�pD(=.�� E�i6@�� �S��R �@L�T���i��`%@���(  �"�": "1" });
        editor.dom.setHTML(ceRoot, '');
        ceRoot.appendChild(br);
        editor.selection.setRng(CaretPosition.before(br).toRange());
      }

      return true;
    };

    var backspaceDelete = function (editor, forward) {
      if (editor.selection.isCollapsed()) {
        return backspaceDeleteCaret(editor, forward);
      } else {
        return backspaceDeleteRange(editor, forward);
      }
    };

    return {
      backspaceDelete: backspaceDelete,
      paddEmptyElement: paddEmptyElement
    };
  }
);

/**
 * CaretContainerInline.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.caret.CaretContainerInline',
  [
    'ephox.katamari.api.Fun',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Zwsp'
  ],
  function (Fun, NodeType, Zwsp) {
    var isText = NodeType.isText;

    var startsWithCaretContainer = function (node) {
      return isText(node) && node.data[0] === Zwsp.ZWSP;
    };

    var endsWithCaretContainer = function (node) {
      return isText(node) && node.data[node.data.length - 1] === Zwsp.ZWSP;
    };

    var createZwsp = function (node) {
      return node.ownerDocument.createTextNode(Zwsp.ZWSP);
    };

    var insertBefore = function (node) {
      if (isText(node.previousSibling)) {
        if (endsWithCaretContainer(node.previousSibling)) {
          return node.previousSibling;
        } else {
          node.previousSibling.appendData(Zwsp.ZWSP);
          return node.previousSibling;
        }
      } else if (isText(node)) {
        if (startsWithCaretContainer(node)) {
          return node;
        } else {
          node.insertData(0, Zwsp.ZWSP);
          return node;
        }
      } else {
        var newNode = createZwsp(node);
        node.parentNode.insertBefore(newNode, node);
        return newNode;
      }
    };

    var insertAfter = function (node) {
      if (isText(node.nextSibling)) {
        if (startsWithCaretContainer(node.nextSibling)) {
          return node.nextSibling;
        } else {
          node.nextSibling.insertData(0, Zwsp.ZWSP);
          return node.nextSibling;
        }
      } else if (isText(node)) {
        if (endsWithCaretContainer(node)) {
          return node;
        } else {
          node.appendData(Zwsp.ZWSP);
          return node;
        }
      } else {
        var newNode = createZwsp(node);
        if (node.nextSibling) {
          node.parentNode.insertBefore(newNode, node.nextSibling);
        } else {
          node.parentNode.appendChild(newNode);
        }
        return newNode;
      }
    };

    var insertInline = function (before, node) {
      return before ? insertBefore(node) : insertAfter(node);
    };

    return {
      insertInline: insertInline,
      insertInlineBefore: Fun.curry(insertInline, true),
      insertInlineAfter: Fun.curry(insertInline, false)
    };
  }
);
/**
 * CaretContainerRemove.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.caret.CaretContainerRemove',
  [
    'ephox.katamari.api.Arr',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.text.Zwsp',
    'tinymce.core.util.Tools'
  ],
  function (Arr, CaretContainer, CaretPosition, NodeType, Zwsp, Tools) {
    var isElement = NodeType.isElement;
    var isText = NodeType.isText;

    var removeNode = function (node) {
      var parentNode = node.parentNode;
      if (parentNode) {
        parentNode.removeChild(node);
      }
    };

    var getNodeValue = function (node) {
      try {
        return node.nodeValue;
      } catch (ex) {
        // IE sometimes produces "Invalid argument" on nodes
        return "";
      }
    };

    var setNodeValue = function (node, text) {
      if (text.length �qdXL7pB
$*��� q!�/�<��B�`�d
���U���7���)���'v�պ�������v�?]���)�ǥg}��������^���I^�{,��۾��W�/�����������#���%���g�bo��n�{���s��/��y��{X��;�~�G%��'����S���������=�����W�/���o���~�}�$z������5@ ���W� 6$�2T!��
Y !�� &�a� �t�Όm�6�}��w���������/I�Q}�E�_��o�`:�����������/������k��5��߷��d<����ÿ�F�?�	R�����g�=�!�K����ѫ���V���/���[v�^��g���E�	`�xj@eऊA��G�� ��b%*
3ؚ��K@@R���
��"��	�iX(�1fT���JJv�� LF�d�b�	�@ <0��dn; JN   7J���   ��.$M
�X%������``!e��L�H��S(��$$QjI��!��I�LBgU�`�`@.P�*F�
e��B�@ @QL@%��@H8A	�@NaE �.C� ��2͢?�������ݽ��o�ϝ�Z�[q�������Շ�����=��?��5rz}��a�M���o���v�z17��?����s��_�Nu���C���n������Η�����u�󽧄t�.O^��ɍ'�����9Zo?<Wvj�o����?���������������?�7w�Ooٻ?���o��[�����_�sf���e8k�����?����;j�O�~ߖ�<�v���Os��_}�������������&�]zy������#H�@�3�"D��$K�c�	�=J��Ճ�Ɨ	s�*�;15(�7���8��S�Ɓ*�@ t@u�y@��W"-"0� xxaC�.0� CP�'�!��`�NN	;[	�o�R|��W���|<�W�/�c:�_} �o@��5n�p�����66���^�|�'���7�
R10�@�^
0�I�dh�� 7 B 	 @ �E	 ����&+�`8�џ���}.�����W��_�7>f��}}_6�������߳����a�'���N7��������6m_���3����W�?�V"����?j�o��z��{?p���}~���v�ܟ���7w/��Ϸ��o��_?K��_��K�oyW�[j��"�5�n����V��(�l��{���ڿw]�����ݭ<�S��;o����&�_V������^}���?|��/�}���_�mt����!����ˤ�?�s�Z����ws׻S���#��` (�( @�����	�QM�ƈ  ,���B �����(�Q�
hEX�����Z��0�>�o�<���}�K����x����~�{k�z[;�=�ߟ-y-^�eo�̛�X���v�
��R��0�WP�%���'RD�
 ����D
� ,%SG	"4 �%�����H QF8�C0����\-Ğ�d QX$69
Hx�:@��	h5&	�������dB�	4X�� � �*�F3�4�  �٤B 9(@0� �� P(o�?m�\Ep[����w�?�~�y(|���s��m}�M��Cgw�wO�W;s�����E�O3g^��{3������]O_�>�Vm�oڻM�������d24�����:ߗ���
;B��pv���� �,��6X�����T�6��t,�KD�@>�J���5�h���-XG!(B�@Z@�F@B$(d��F��M`��B���!�	"� ���� H��ڷ����?h7y�E���ͯ��=�w����ވ^e��T���*��S���fw��?���+��-���L�~���ְ_S����{������U������w�����;�L߯׽|�'���.�M�~���?͌���s�����ž˫͗��������~����Ug�;��rl���m����/�����4/՛�gm���M��3�N�����uq�#Z��Qg�}}�w����;���6F���7�����"���_D_��dE(@F�P�C5"�$
T{-P��;0@5 #��KBb�<5cTB8��� 4B&+v�+���� %�p*@�`��Ǜ(Ǆǔ!H��Ȑ�0���)a!4���:?�����Ww��B������K���y�����|��H���?���������S��m�*�w����+��?�\��_wr��������s�Ogu�����j0s�n��<���!��}��O��������7���� F ��ȣB У�#	-AFd �����`h%C ͠Y�#,J  )�!�6(x"�2 ��8D��E9,`;|h�l��(�.���	XT��`"^)"H� ̉�`�( "0�`��x[ A��00B���"����KL�h[D�������a�aFW$�@`8� 	.*��(.2#@!:v`� �@Aj?�	$AC "���A
��C�
�4���a�!lb 0�.�Ȳ"WЭ���5]^�Fs�紱s���u���
a�_Z�/A�������Tʮ_O���r�wf���+w���积x$��_n��?�������	�]�_�����y{�������an�y�'���:V�ПeE_����`5%�� �UE�������]�
��yH�@���ˠ 18� wX0�p	����6b62�a5~"� � ȴ p�S �4���[�E�QR,���x Z H4b@VA�kI�8� �S`[ 
�1X 0ޕ6�Ƕ��D��HHȂ�����bP`L���\���Tp!�@ g(6���; T�K&��@� B��*T��@�!�@ h��\�!h���m �@y�` �*@ @� ! (s@� t$a�`8�"8�1�`�H(&� p���!(H�c	�`�Q��8aA1l�P� ӬL�J%�0�% �!jI@��0� J`  HaP0F�� �֗��!A � ��(!������cEEB��jM#$�9��Q�1�5뀶h]�t`�P%�������Ĥ�*Q��@" L�PR�ű�P	B /�bOA�A�/�PDU���+�tA�1��Yq (0�N"�H\�"��$U�=!�����(��RȦHPtF�` � T�N ^#�����X�d�AWF��DT(@�0� R(�3P
.���%A�
@��1`�� �ji�C(l�H��CBF�/� T�p��U���"�@$AØx�#�G+�Xb�	u���b�,�$a�u`�0qIK�.B�aXpLd�{��^@� b�������V�#:��� ����X�N�u����c# ��aVC�3tA&c���44(�H 	���Z�C�.�fP�E  S�B�X�=��C�a	`@H�.�0º����=�x���s�DC(�@ 2	!k��� 2+�F��F��1 "d��!hA�h&��#e$��ذBF
ti0�F\b=�HЅ$��-���HAU��.��
cUt�'�A� X!�!P�_��tT/��UW�ւX���8H�ȼ�@:F�4�%1 4�
�	K č�I�@T��(�Rk$!RA��0*��@���� �

�\O�h�(	�N��LP�@x��b7�!� r���@�`͹�@�!]�9��� �0i؂ =a[E�n)r�M��0A%�̃$�9� �x� �B
�%�&B�Z(4@C���*�� 
 *B� *b ���%j���5@
H@EH�-`�(E��K`! $R�"���#A@A�Cp�HR�P�ġ籋2��ږ�JQ Y0�"�2` ��A6:�  [,@�<
�	 Z� �1�,��p@�W�(�j�8�(W���i�CDȮ~��~�.d	�E��^*T�h%������3Z:I4����D8�@/D��`a�F� �z
<��
71���	F��*,��#��(( '�0P��#o�	�4O�4ʬ�@�,�CUǊ��)�sX ��$����H�֓(<���C���6�59�B� � 4���Tɜ��YdԔ��8I�U0�) # e\#@N4��0e�h�@�0 ���ap1���HPdU ���	�!4� $%f ����~3��aI$h��bc�xJudQ��B
 V�~Eb���
Rj� j�� d l@��	��$.��0���тB�Rj��̲�� ��2) �9 Q� ��� X,�L���fF[( �
�ò�P�`Cb�I�/D1�	�DK�2 �` VB;ޙ��	N�B0j��L�9j�D �a7P3�������5R(�� �O�	�x( �d��*�u�� 9��F  	�8�,e&CG�4W"H�h�h#�t1!� �2F{�d��"F��b,O ���h��&,��| �H�\ 5�)�h��@*�!�!�@Ҁ�J',��>0�Gl
 �:RTZR��d�"���LNPɂ��@�HP�7uDpV�"\�Ā$��
D��`� �H b(�Ad,����ZB�,�@@s(*�P"�"�p`B$�Q �)��6�����P�@�����E$@�,D5X����"�! X Hp$����e��ClD@� ֩��1�I�PH \"HH��ň�܀�]��Z��
7L|H��h+;��t��2�^�A�W�Q�T�PR���D �d�=��9
����w@�9�X�P��UB���Z$Ax�A0S!(D�C`�0d�
/p+r�` E  $|A!Y4��a@0 ��� �&�$@H�@"!B��P("��XE$R�@dUI��P ı��L�ㄐ�U[X  �`pa�$x���+���eV̢�I�������P@B��������E�N�!э��a�`JC"��	MGF��B���"� ���QT��A����D�.IUdb����Z�&
�KB8$�@@� �C21���<# �<0%CpqJ�� � P!+#p9���	a? ��$k �  t�Lр��`��;a�s��*�&�@!��8�l$M�ET!�x 0bQ�K.�B *3�1G�@�D	� �6%�N����
�Fǎ�xL 
 ,�$� ��B@��@�� ��!3���>_
�Ȉ  Â��5 ��` !�,�PM�R��D�i��4#"H �NL$,�h��$"0�ZK"#
	�
P`f2�Bu).\���PF�q	��b*�E"�
�D�%'X���$J Y�@`�$4dD���	=�W�#fI$��KZ�
^�l���D�"��ڲb�+H�L  3аb
a�
@�
�yP~��b�����2��E��¦��S�Ȕ�G�� ��	8T�y���$FB9=��lYL�pK
�p�
P�%�'dD �� �!��� ni�@2`$����3*�D�S�E�B"w.��DLY�`	>T A�����0�(��PP!�$� �PU ��rn nextPos.isNone() ? Option.some(Location.end(inline)) : Option.none();
      });
    };

    var after = function (rootNode, pos) {
      var nPos = InlineUtils.normalizeBackwards(pos);
      var scope = rescope(rootNode, nPos.container());
      return InlineUtils.findRootInline(scope, nPos).fold(
        function () {
          return InlineUtils.findCaretPosition(scope, false, nPos)
            .bind(Fun.curry(InlineUtils.findRootInline, scope))
            .map(function (inline) {
              return Location.after(inline);
            });
        },
        Option.none
      );
    };

    var isValidLocation = function (location) {
      return InlineUtils.isRtl(getElement(location)) === false;
    };

    var readLocation = function (rootNode, pos) {
      var location = LazyEvaluator.evaluateUntil([
        before,
        start,
        end,
        after
      ], [rootNode, pos]);

      return location.filter(isValidLocation);
    };

    var getElement = function (location) {
      return location.fold(
        Fun.identity, // Before
        Fun.identity, // Start
        Fun.identity, // End
        Fun.identity  // After
      );
    };

    var getName = function (location) {
      return location.fold(
        Fun.constant('before'), // Before
        Fun.constant('start'),  // Start
        Fun.constant('end'),    // End
        Fun.constant('after')   // After
      );
    };

    var outside = function (location) {
      return location.fold(
        Location.before, // Before
        Location.before, // Start
        Location.after,  // End
        Location.after   // After
      );
    };

    var inside = function (location) {
      return location.fold(
        Location.start, // Before
        Location.start, // Start
        Location.end,   // End
        Location.end    // After
      );
    };

    var isEq = function (location1, location2) {
      return getName(location1) === getName(location2) && getElement(location1) === getElement(location2);
    };

    var betweenInlines = function (forward, rootNode, from, to, location) {
      return Options.liftN([
        InlineUtils.findRootInline(rootNode, from),
        InlineUtils.findRootInline(rootNode, to)
      ], function (fromInline, toInline) {
        if (fromInline !== toInline && InlineUtils.hasSameParentBlock(rootNode, fromInline, toInline)) {
          // Force after since some browsers normalize and lean left into the closest inline
          return Location.after(forward ? fromInline : toInline);
        } else {
          return location;
        }
      }).getOr(location);
    };

    var skipNoMovement = function (fromLocation, toLocation) {
      return fromLocation.fold(
        Fun.constant(true),
        function (fromLocation) {
          return !isEq(fromLocation, toLocation);
        }
      );
    };

    var findLocationTraverse = function (forward, rootNode, fromLocation, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var to = InlineUtils.findCaretPosition(rootNode, forward, from).map(Fun.curry(InlineUtils.normalizePosition, forward));

      var location = to.fold(
        function () {
          return fromLocation.map(outside);
        },
        function (to) {
          return readLocation(rootNode, to)
            .map(Fun.curry(betweenInlines, forward, rootNode, from, to))
            .filter(Fun.curry(skipNoMovement, fromLocation));
        }
      );

      return location.filter(isValidLocation);
    };

    var findLocationSimple = function (forward, location) {
      if (forward) {
        return location.fold(
          Fun.compose(Option.some, Location.start), // Before -> Start
          Option.none,
          Fun.compose(Option.some, Location.after), // End -> After
          Option.none
        );
      } else {
        return location.fold(
          Option.none,
          Fun.compose(Option.some, Location.before), // Before <- Start
          Option.none,
          Fun.compose(Option.some, Location.end) // End <- After
        );
      }
    };

    var findLocation = function (forward, rootNode, pos) {
      var from = InlineUtils.normalizePosition(forward, pos);
      var fromLocation = readLocation(rootNode, from);

      return readLocation(rootNode, from).bind(Fun.curry(findLocationSimple, forward)).orThunk(function () {
        return findLocationTraverse(forward, rootNode, fromLocation, pos);
      });
    };

    return {
      readLocation: readLocation,
      prevLocation: Fun.curry(findLocation, false),
      nextLocation: Fun.curry(findLocation, true),
      getElement: getElement,
      outside: outside,
      inside: inside
    };
  }
);
define(
  'ephox.katamari.api.Cell',

  [
  ],

  function () {
    var Cell = function (initial) {
      var value = initial;

      var get = function () {
        return value;
      };

      var set = function (v) {
        value = v;
      };

      var clone = function () {
        return Cell(get());
      };

      return {
        get: get,
        set: set,
        clone: clone
      };
    };

    return Cell;
  }
);

/**
 * BoundarySelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.keyboard.BoundarySelection',
  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'tinymce.core.caret.CaretContainerRemove',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.BoundaryCaret',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (Arr, Cell, Fun, CaretContainerRemove, CaretPosition, BoundaryCaret, BoundaryLocation, InlineUtils) {
    var setCaretPosition = function (editor, pos) {
      var rng = editor.dom.createRng();
      rng.setStart(pos.container(), pos.offset());
      rng.setEnd(pos.container(), pos.offset());
      editor.selection.setRng(rng);
    };

    var isFeatureEnabled = function (editor) {
      return editor.settings.inline_boundaries !== false;
    };

    var setSelected = function (state, elm) {
      if (state) {
        elm.setAttribute('data-mce-selected', '1');
      } else {
        elm.removeAttribute('data-mce-selected', '1');
      }
    };

    var renderCaretLocation = function (editor, caret, location) {
      return BoundaryCaret.renderCaret(caret, location).map(function (pos) {
        setCaretPosition(editor, pos);
        return location;
      });
    };

    var findLocation = function (editor, caret, forward) {
      var rootNode = editor.getBody();
      var from = CaretPosition.fromRangeStart(editor.selection.getRng());
      var location = forward ? BoundaryLocation.nextLocation(rootNode, from) : BoundaryLocation.prevLocation(rootNode, from);
      return location.bind(function (location) {
        return renderCaretLocation(editor, caret, location);
      });
    };

    var toggleInlines = function (dom, elms) {
      var selectedInlines = dom.select('a[href][data-mce-selected],code[data-mce-selected]');
      var targetInlines = Arr.filter(elms, InlineUtils.isInlineTarget);
      Arr.each(Arr.difference(selectedInlines, targetInlines), Fun.curry(setSelected, false));
      Arr.each(Arr.difference(targetInlines, selectedInlines), Fun.curry(setSelected, true));
    };

    var safeRemoveCaretContainer = function (editor, caret) {
      if (editor.selection.isCollapsed() && editor.composing !== true && caret.get()) {
        var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
        if (CaretPosition.isTextPosition(pos) && InlineUtils.isAtZwsp(pos) === false) {
          setCaretPosition(editor, CaretContainerRemove.removeAndReposition(caret.get(), pos));
          caret.set(null);
        }
      }
    };

    var renderInsideInlineCaret = function (editor, caret, elms) {
      if (editor.selection.isCollapsed()) {
        var inlines = Arr.filter(elms, InlineUtils.isInlineTarget);
        Arr.each(inlines, function (inline) {
          var pos = CaretPosition.fromRangeStart(editor.selection.getRng());
          BoundaryLocation.readLocation(editor.getBody(), pos).bind(function (location) {
            return renderCaretLocation(editor, caret, location);
          });
        });
      }
    };

    var move = function (editor, caret, forward) {
      return function () {
        return isFeatureEnabled(editor) ? findLocation(editor, caret, forward).isSome() : false;
      };
    };

    var setupSelectedState = function (editor) {
      var caret = new Cell(null);

      editor.on('NodeChange', function (e) {
        if (isFeatureEnabled(editor)) {
          toggleInlines(editor.dom, e.parents);
          safeRemoveCaretContainer(editor, caret);
          renderInsideInlineCaret(editor, caret, e.parents);
        }
      });

      return caret;
    };

    return {
      move: move,
      setupSelectedState: setupSelectedState,
      setCaretPosition: setCaretPosition
    };
  }
);
/**
 * InlineBoundaryDelete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.InlineBoundaryDelete',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Options',
    'ephox.sugar.api.node.Element',
    'tinymce.core.caret.CaretContainer',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.delete.DeleteElement',
    'tinymce.core.keyboard.BoundaryCaret',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.BoundarySelection',
    'tinymce.core.keyboard.InlineUtils'
  ],
  function (
    Fun, Option, Options, Element, CaretContainer, CaretFinder, CaretPosition, CaretUtils, DeleteElement, BoundaryCaret, BoundaryLocation, BoundarySelection,
    InlineUtils
  ) {
    var isFeatureEnabled = function (editor) {
      return editor.settings.inline_boundaries !== false;
    };

    var rangeFromPositions = function (from, to) {
      var range = document.createRange();

      range.setStart(from.container(), from.offset());
      range.setEnd(to.container(), to.offset());

      return range;
    };

    // Checks for delete at <code>|a</code> when there is only one item left except the zwsp caret container nodes
    var hasOnlyTwoOrLessPositionsLeft = function (elm) {
      return Options.liftN([
        InlineUtils.findCaretPositionIn(elm, true),
        InlineUtils.findCaretPositionIn(elm, false)
      ], function (firstPos, lastPos) {
        var normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
        var normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);

        return InlineUtils.findCaretPosition(elm, true, normalizedFirstPos).map(function (pos) {
          return pos.isEqual(normalizedLastPos);
        }).getOr(true);
      }).getOr(true);
    };

    var setCaretLocation = function (editor, caret) {
      return function (location) {
        return BoundaryCaret.renderCaret(caret, location).map(function (pos) {
          BoundarySelection.setCaretPosition(editor, pos);
          return true;
        }).getOr(false);
      };
    };

    var deleteFromTo = function (editor, caret, from, to) {
      var rootNode = editor.getBody();

      editor.undoManager.ignore(function () {
        editor.selection.setRng(rangeFromPositions(from, to));
        editor.execCommand('Delete');

        BoundaryLocation.readLocation(rootNode, CaretPosition.fromRangeStart(editor.selection.getRng()))
          .map(BoundaryLocation.inside)
          .map(setCaretLocation(editor, caret));
      });

      editor.nodeChanged();
    };

    var rescope = function (rootNode, node) {
      var parentBlock = CaretUtils.getParentBlock(node, rootNode);
      return parentBlock ? parentBlock : rootNode;
    };

    var backspaceDeleteCollapsed = function (editor, caret, forward, from) {
      var rootNode = rescope(editor.getBody(), from.container());
      var fromLocation = BoundaryLocation.readLocation(rootNode, from);

      return fromLocation.bind(function (location) {
        if (forward) {
          return location.fold(
            Fun.constant(Option.some(BoundaryLocation.inside(location))), // Before
            Option.none, // Start
            Fun.constant(Option.some(BoundaryLocation.outside(location))), // End
            Option.none  // After
          );
        } else {
          return location.fold(
            Option.none, // Before
            Fun.constant(Option.some(BoundaryLocation.outside(location))), // Start
            Option.none, // End
            Fun.constant(Option.some(BoundaryLocation.inside(location)))  // After
          );
        }
      })
      .map(setCaretLocation(editor, caret))
      .getOrThunk(function () {
        var toPosition = CaretFinder.navigate(forward, rootNode, from);
        var toLocation = toPosition.bind(function (pos) {
          return BoundaryLocation.readLocation(rootNode, pos);
        });

        if (fromLocation.isSome() && toLocation.isSome()) {
          return InlineUtils.findRootInline(rootNode, from).map(function (elm) {
            if (hasOnlyTwoOrLessPositionsLeft(elm)) {
              DeleteElement.deleteElement(editor, forward, Element.fromDom(elm));
              return true;
            } else {
              return false;
            }
          }).getOr(false);
        } else {
          return toLocation.bind(function (_) {
            return toPosition.map(function (to) {
              if (forward) {
                deleteFromTo(editor, caret, from, to);
              } else {
                deleteFromTo(editor, caret, to, from);
              }

              return true;
            });
          }).getOr(false);
        }
      });
    };

    var backspaceDelete = function (editor, caret, forward) {
      if (editor.selection.isCollapsed() && isFeatureEnabled(editor)) {
        var from = CaretPosition.fromRangeStart(editor.selection.getRng());
        return backspaceDeleteCollapsed(editor, caret, forward, from);
      }

      return false;
    };

    return {
      backspaceDelete: backspaceDelete
    };
  }
);
/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.delete.DeleteCommands',
  [
    'tinymce.core.delete.BlockBoundaryDelete',
    'tinymce.core.delete.BlockRangeDelete',
    'tinymce.core.delete.CefDelete',
    'tinymce.core.delete.InlineBoundaryDelete'
  ],
  function (BlockBoundaryDelete, BlockRangeDelete, CefDelete, BoundaryDelete) {
    var nativeCommand = function (editor, command) {
      editor.getDoc().execCommand(command, false, null);
    };

    var paddEmptyBody = function (editor) {
      var dom = editor.dom;

      // Check if body is empty after the delete call if so then set the contents
      // to an empty string and move the caret to any block produced by that operation
      // this fixes the issue with root blocks not being properly produced after a delete call on IE
      var body = editor.getBody();

      if (dom.isEmpty(body)) {
        editor.setContent('');

        if (body.firstChild && dom.isBlock(body.firstChild)) {
          editor.selection.setCursorLocation(body.firstChild, 0);
        } else {
          editor.selection.setCursorLocation(body, 0);
        }
      }
    };

    var deleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, false)) {
        return;
      } else if (BlockRangeDelete.backspaceDelete(editor, false)) {
        return;
      } else {
        nativeCommand(editor, 'Delete');
        paddEmptyBody(editor);
      }
    };

    var forwardDeleteCommand = function (editor) {
      if (CefDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BlockBoundaryDelete.backspaceDelete(editor, true)) {
        return;
      } else if (BlockRangeDelete.backspaceDelete(editor, true)) {
        return;
      } else {
        nativeCommand(editor, 'ForwardDelete');
      }
    };

    return {
      deleteCommand: deleteCommand,
      forwardDeleteCommand: forwardDeleteCommand
    };
  }
);
/**
 * RangeNormalizer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.RangeNormalizer',
  [
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.caret.CaretUtils',
    'tinymce.core.dom.NodeType'
  ],
  function (CaretFinder, CaretPosition, CaretUtils, NodeType) {
    var isTextBlock = function (elm) {
      return NodeType.isElement(elm) && /^(P|H[1-6]|DIV)$/.test(elm.nodeName);
    };

    var matchEndContainer = function (rng, predicate) {
      return predicate(rng.endContainer);
    };

    var createRange = function (sc, so, ec, eo) {
      var rng = document.createRange();
      rng.setStart(sc, so);
      rng.setEnd(ec, eo);
      return rng;
    };

    // If you tripple click a paragraph in this case:
    //   <blockquote><p>a</p></blockquote><p>b</p>
    // It would become this range in webkit:
    //   <blockquote><p>[a</p></blockquote><p>]b</p>
    // We would want it to be:
    //   <blockquote><p>[a]</p></blockquote><p>b</p>
    // Since it would otherwise produces spans out of thin air on insertContent for example.
    var normalizeBlockSelection = function (rng) {
      var startPos = CaretPosition.fromRangeStart(rng);
      var endPos = CaretPosition.fromRangeEnd(rng);
      var rootNode = rng.commonAncestorContainer;

      if (rng.collapsed === false && matchEndContainer(rng, isTextBlock) && rng.endOffset === 0) {
        return CaretFinder.fromPosition(false, rootNode, endPos)
          .map(function (newEndPos) {
            if (!CaretUtils.isInSameBlock(startPos, endPos, rootNode) && CaretUtils.isInSameBlock(startPos, newEndPos, rootNode)) {
              return createRange(startPos.container(), startPos.offset(), newEndPos.container(), newEndPos.offset());
            } else {
              return rng;
            }
          }).getOr(rng);
      } else {
        return rng;
      }
    };

    var normalize = function (rng) {
      return normalizeBlockSelection(rng);
    };

    return {
      normalize: normalize
    };
  }
);
/**
 * InsertList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles inserts of lists into the editor instance.
 *
 * @class tinymce.InsertList
 * @private
 */
define(
  'tinymce.core.InsertList',
  [
    "tinymce.core.util.Tools",
    "tinymce.core.caret.CaretWalker",
    "tinymce.core.caret.CaretPosition"
  ],
  function (Tools, CaretWalker, CaretPosition) {
    var isListFragment = function (fragment) {
      var firstChild = fragment.firstChild;
      var lastChild = fragment.lastChild;

      // Skip meta since it's likely <meta><ul>..</ul>
      if (firstChild && firstChild.name === 'meta') {
        firstChild = firstChild.next;
      }

      // Skip mce_marker since it's likely <ul>..</ul><span id="mce_marker"></span>
      if (lastChild && lastChild.attr('id') === 'mce_marker') {
        lastChild = lastChild.prev;
      }

      if (!firstChild || firstChild !== lastChild) {
        return false;
      }

      return firstChild.name === 'ul' || firstChild.name === 'ol';
    };

    var cleanupDomFragment = function (domFragment) {
      var firstChild = domFragment.firstChild;
      var lastChild = domFragment.lastChild;

      // TODO: remove the meta tag from paste logic
      if (firstChild && firstChild.nodeName === 'META') {
        firstChild.parentNode.removeChild(firstChild);
      }

      if (lastChild && lastChild.id === 'mce_marker') {
        lastChild.parentNode.removeChild(lastChild);
      }

      return domFragment;
    };

    var toDomFragment = function (dom, serializer, fragment) {
      var html = serializer.serialize(fragment);
      var domFragment = dom.createFragment(html);

      return cleanupDomFragment(domFragment);
    };

    var listItems = function (elm) {
      return Tools.grep(elm.childNodes, function (child) {
        return child.nodeName === 'LI';
      });
    };

    var isEmpty = function (elm) {
      return !elm.firstChild;
    };

    var trimListItems = function (elms) {
      return elms.length > 0 && isEmpty(elms[elms.length - 1]) ? elms.slice(0, -1) : elms;
    };

    var getParentLi = function (dom, node) {
      var parentBlock = dom.getParent(node, dom.isBlock);
      return parentBlock && parentBlock.nodeName === 'LI' ? parentBlock : null;
    };

    var isParentBlockLi = function (dom, node) {
      return !!getParentLi(dom, node);
    };

    var getSplit = function (parentNode, rng) {
      var beforeRng = rng.cloneRange();
      var afterRng = rng.cloneRange();

      beforeRng.setStartBefore(parentNode);
      afterRng.setEndAfter(parentNode);

      return [
        beforeRng.cloneContents(),
        afterRng.cloneContents()
      ];
    };

    var findFirstIn = function (node, rootNode) {
      var caretPos = CaretPosition.before(node);
      var caretWalker = new CaretWalker(rootNode);
      var newCaretPos = caretWalker.next(caretPos);

      return newCaretPos ? newCaretPos.toRange() : null;
    };

    var findLastOf = function (node, rootNode) {
      var caretPos = CaretPosition.after(node);
      var caretWalker = new CaretWalker(rootNode);
      var newCaretPos = caretWalker.prev(caretPos);

      return newCaretPos ? newCaretPos.toRange() : null;
    };

    var insertMiddle = function (target, elms, rootNode, rng) {
      var parts = getSplit(target, rng);
      var parentElm = target.parentNode;

      parentElm.insertBefore(parts[0], target);
      Tools.each(elms, function (li) {
        parentElm.insertBefore(li, target);
      });
      parentElm.insertBefore(parts[1], target);
      parentElm.removeChild(target);

      return findLastOf(elms[elms.length - 1], rootNode);
    };

    var insertBefore = function (target, elms, rootNode) {
      var parentElm = target.parentNode;

      Tools.each(elms, function (elm) {
        parentElm.insertBefore(elm, target);
      });

      return findFirstIn(target, rootNode);
    };

    var insertAfter = function (target, elms, rootNode, dom) {
      dom.insertAfter(elms.reverse(), target);
      return findLastOf(elms[0], rootNode);
    };

    var insertAtCaret = function (serializer, dom, rng, fragment) {
      var domFragment = toDomFragment(dom, serializer, fragment);
      var liTarget = getParentLi(dom, rng.startContainer);
      var liElms = trimListItems(listItems(domFragment.firstChild));
      var BEGINNING = 1, END = 2;
      var rootNode = dom.getRoot();

      var isAt = function (location) {
        var caretPos = CaretPosition.fromRangeStart(rng);
        var caretWalker = new CaretWalker(dom.getRoot());
        var newPos = location === BEGINNING ? caretWalker.prev(caretPos) : caretWalker.next(caretPos);

        return newPos ? getParentLi(dom, newPos.getNode()) !== liTarget : true;
      };

      if (isAt(BEGINNING)) {
        return insertBefore(liTarget, liElms, rootNode);
      } else if (isAt(END)) {
        return insertAfter(liTarget, liElms, rootNode, dom);
      }

      return insertMiddle(liTarget, liElms, rootNode, rng);
    };

    return {
      isListFragment: isListFragment,
      insertAtCaret: insertAtCaret,
      isParentBlockLi: isParentBlockLi,
      trimListItems: trimListItems,
      listItems: listItems
    };
  }
);
/**
 * InsertContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 �T�`	q^"� " �C4 ՚`c��!Fh@@d��r R6�($p()��B�8� (�c�$B@� �.E�4R@]"��I0���:�Y�H��W	"@C8C��0`��P�2Kܾ�>^�q�����-1�u��tߙ�s�ww�������~s���ҪU�c���ښ�g��^�ջ�e܀��?{n��=�/�7����]��Wk����j_�o��N��4��wI�:?^��^�QM��zoN���������#������?�K�"���2M�Uw�9�j���1w�燲����A����s2Y7p�U�?(5�����oMw�����
�V� @
�7,��x�~���C�C��7�f�k<z�~��lz���տ�?���]�x�O�^�k��Xcm��·��a��������\���u��4�o�h�z�[��or���{�qe"�_]�}��ư�.Zt�\�����w'�6��$�Lh�� �	Ng	R
T $N���*�hM2"�,'C�
2 �J�`h�-�N�$`Z��@D��"(5hD+�D� "
] <�  �B�C�%���p�@	*E�D�U�  �� �,(A	 �6#)��0��7����E9�\w|�z���O[S���]��v���=?�S�O��G��k�;�Wg��v^3��w�N��R�����ߔ�\a����h�O�1�������>z|�dyw���ݤ%��Q�]�Ĥj�f�7Wn�r4��my�
	�"4M)�a�6� �@@� )�4� �@���Je�d�R�@Z��Q"5 6 0`�s!h�`�V��؟�����˭���m��������׆r�>_��7��������P��f�4���s�Ӿ�+7��ٛO�_�T����J�o��o>����En��|{x�X'��O��H���1+
d",�$!0� b$ 8 C ��mpC�P0rU� � ��0@ ��a "cD�)P�2� 	$<�:H�
t D$K�D@0DD��24(� W"9������?�m̟��fYג����{���JK��ߟ����K�K�i���A���~���W�v����̋�Z��/�����e����z���脕���u��nnvVϋ�P��������=a|���|��W~�������Χ�c�?+��ߋZZ����lU_MN��O���|�[�q��߾���q������ze��[���/E��_��W�l�y�u�{����Ԍ̽���?O/�7ƛ����\���\gZ��u[�mR`�`�uPx#�, �2G8�( �8��K�� !��0@!!, CSBMiP N�`	0�Uy���B"	� ��A�� � a;���� ;*Ւ�(�f�4u XDI��pHb!�����?>_�ѣ��c�{���n������]����
@l�3PvHH�r�h�$)0��p��	Тʝ���%L�� p
^��x� @��(`  P�B�ipJ$��1��Na �e摈4�=�V���ʂ�{߿�d=�կ���5��?�����%��w��C���w��}�.���������o�\����
���︽����}׼���U�v��%v�]/<ۻ6������GD�vg����
��u���[���|J��d����<IBO 5�@��8�lO IP �$2c	���M��'.@i�� �T#$�2��C�hPPi�&F`C��5�B@:�1@�@���� K�4��4s7��~������?�ӆ��5�����~
0���0������(׷�Oʿ3�a��_��ڞ?��<��e%�����З���2ow�I�������-q�4�[î����ǟ�Ec{mӺ�ḱ��3�ݽL�p/��s�Ho�������[6�'���{O�rw���M�ɍ�z�D�� W LW��PA�$)� 7� ��"�b�*����B���8�0	r<�-�!�Q��a��$ā��}�<`���upHɌd� )��
��C�X�<#Db
�@R#�4|H(,�$��G#�a! :�dA.
$�VQaBR0%�0��A
W�� ��_��Ԅ�9��@7D�J
        Tools.each(elm.getElementsByTagName('*'), function (elm) {
          elm.removeAttribute('data-mce-fragment');
        });
      }

      function isPartOfFragment(node) {
        return !!node.getAttribute('data-mce-fragment');
      }

      function canHaveChildren(node) {
        return node && !editor.schema.getShortEndedElements()[node.nodeName];
      }

      function moveSelectionToMarker(marker) {
        var parentEditableFalseElm, parentBlock, nextRng;

        function getContentEditableFalseParent(node) {
          var root = editor.getBody();

          for (; node && node !== root; node = node.parentNode) {
            if (editor.dom.getContentEditable(node) === 'false') {
              return node;
            }
          }

          return null;
        }

        if (!marker) {
          return;
        }

        selection.scrollIntoView(marker);

        // If marker is in cE=false then move selection to that element instead
        parentEditableFalseElm = getContentEditableFalseParent(marker);
        if (parentEditableFalseElm) {
          dom.remove(marker);
          selection.select(parentEditableFalseElm);
          return;
        }

        // Move selection before marker and remove it
        rng = dom.createRng();

        // If previous sibling is a text node set the selection to the end of that node
        node = marker.previousSibling;
        if (node && node.nodeType == 3) {
          rng.setStart(node, node.nodeValue.length);

          // TODO: Why can't we normalize on IE
          if (!Env.ie) {
            node2 = marker.nextSibling;
            if (node2 && node2.nodeType == 3) {
              node.appendData(node2.data);
              node2.parentNode.removeChild(node2);
            }
          }
        } else {
          // If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
          rng.setStartBefore(marker);
          rng.setEndBefore(marker);
        }

        function findNextCaretRng(rng) {
          var caretPos = CaretPosition.fromRangeStart(rng);
          var caretWalker = new CaretWalker(editor.getBody());

          caretPos = caretWalker.next(caretPos);
          if (caretPos) {
            return caretPos.toRange();
          }
        }

        // Remove the marker node and set the new range
        parentBlock = dom.getParent(marker, dom.isBlock);
        dom.remove(marker);

        if (parentBlock && dom.isEmpty(parentBlock)) {
          editor.$(parentBlock).empty();

          rng.setStart(parentBlock, 0);
          rng.setEnd(parentBlock, 0);

          if (!isTableCell(parentBlock) && !isPartOfFragment(parentBlock) && (nextRng = findNextCaretRng(rng))) {
            rng = nextRng;
            dom.remove(parentBlock);
          } else {
            dom.add(parentBlock, dom.create('br', { 'data-mce-bogus': '1' }));
          }
        }

        selection.setRng(rng);
      }

      // Check for whitespace before/after value
      if (/^ | $/.test(value)) {
        value = trimOrPaddLeftRight(value);
      }

      // Setup parser and serializer
      parser = editor.parser;
      merge = details.merge;

      serializer = new Serializer({
        validate: editor.settings.validate
      }, editor.schema);
      bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;&#x200B;</span>';

      // Run beforeSetContent handlers on the HTML to be inserted
      args = { content: value, format: 'html', selection: true };
      editor.fire('BeforeSetContent', args);
      value = args.content;

      // Add caret at end of contents if it's missing
      if (value.indexOf('{$caret}') == -1) {
        value += '{$caret}';
      }

      // Replace the caret marker with a span bookmark element
      value = value.replace(/\{\$caret\}/, bookmarkHtml);

      // If selection is at <body>|<p></p> then move it into <body><p>|</p>
      rng = selection.getRng();
      var caretElement = rng.startContainer || (rng.parentElement ? rng.parentElement() : null);
      var body = editor.getBody();
      if (caretElement === body && selection.isCollapsed()) {
        if (dom.isBlock(body.firstChild) && canHaveChildren(body.firstChild) && dom.isEmpty(body.firstChild)) {
          rng = dom.createRng();
          rng.setStart(body.firstChild, 0);
          rng.setEnd(body.firstChild, 0);
          selection.setRng(rng);
        }
      }

      // Insert node maker where we will insert the new HTML and get it's parent
      if (!selection.isCollapsed()) {
        // Fix for #2595 seems that delete removes one extra character on
        // WebKit for some odd reason if you double click select a word
        editor.selection.setRng(RangeNormalizer.normalize(editor.selection.getRng()));
        editor.getDoc().execCommand('Delete', false, null);
        trimNbspAfterDeleteAndPaddValue();
      }

      parentNode = selection.getNode();

      // Parse the fragment within the context of the parent node
      var parserArgs = { context: parentNode.nodeName.toLowerCase(), data: details.data };
      fragment = parser.parse(value, parserArgs);

      // Custom handling of lists
      if (details.paste === true && InsertList.isListFragment(fragment) && InsertList.isParentBlockLi(dom, parentNode)) {
        rng = InsertList.insertAtCaret(serializer, dom, editor.selection.getRng(true), fragment);
        editor.selection.setRng(rng);
        editor.fire('SetContent', args);
        return;
      }

      markFragmentElements(fragment);

      // Move the caret to a more suitable location
      node = fragment.lastChild;
      if (node.attr('id') == 'mce_marker') {
        marker = node;

        for (node = node.prev; node; node = node.walk(true)) {
          if (node.type == 3 || !dom.isBlock(node.name)) {
            if (editor.schema.isValidChild(node.parent.name, 'span')) {
              node.parent.insert(marker, node, node.name === 'br');
            }
            break;
          }
        }
      }

      editor._selectionOverrides.showBlockCaretContainer(parentNode);

      // If parser says valid we can insert the contents into that parent
      if (!parserArgs.invalid) {
        value = serializer.serialize(fragment);
        validInsertion(editor, value, parentNode);
      } else {
        // If the fragment was invalid within that context then we need
        // to parse and process the parent it's inserted into

        // Insert bookmark node and get the parent
        selection.setContent(bookmarkHtml);
        parentNode = selection.getNode();
        rootNode = editor.getBody();

        // Opera will return the document node when selection is in root
        if (parentNode.nodeType == 9) {
          parentNode = node = rootNode;
        } else {
          node = parentNode;
        }

        // Find the ancestor just before the root element
        while (node !== rootNode) {
          parentNode = node;
          node = node.parentNode;
        }

        // Get the outer/inner HTML depending on if we are in the root and parser and serialize that
        value = parentNode == rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
        value = serializer.serialize(
          parser.parse(
            // Need to replace by using a function since $ in the contents would otherwise be a problem
            value.replace(/<span (id="mce_marker"|id=mce_marker).+?<\/span>/i, function () {
              return serializer.serialize(fragment);
            })
          )
        );

        // Set the inner/outer HTML depending on if we are in the root or not
        if (parentNode == rootNode) {
          dom.setHTML(rootNode, value);
        } else {
          dom.setOuterHTML(parentNode, value);
        }
      }

      reduceInlineTextElements();
      moveSelectionToMarker(dom.get('mce_marker'));
      umarkFragmentElements(editor.getBody());
      editor.fire('SetContent', args);
      editor.addVisual();
    };

    var processValue = function (value) {
      var details;

      if (typeof value !== 'string') {
        details = Tools.extend({
          paste: value.paste,
          data: {
            paste: value.paste
          }
        }, value);

        return {
          content: value.content,
          details: details
        };
      }

      return {
        content: value,
        details: {}
      };
    };

    var insertAtCaret = function (editor, value) {
      var result = processValue(value);
      insertHtmlAtCaret(editor, result.content, result.details);
    };

    return {
      insertAtCaret: insertAtCaret
    };
  }
);
/**
 * EditorCommands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class enables you to add custom editor commands and it contains
 * overrides for native browser commands to address various bugs and issues.
 *
 * @class tinymce.EditorCommands
 */
define(
  'tinymce.core.EditorCommands',
  [
    'tinymce.core.delete.DeleteCommands',
    'tinymce.core.dom.NodeType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.dom.TreeWalker',
    'tinymce.core.Env',
    'tinymce.core.InsertContent',
    'tinymce.core.util.Tools'
  ],
  function (DeleteCommands, NodeType, RangeUtils, TreeWalker, Env, InsertContent, Tools) {
    // Added for compression purposes
    var each = Tools.each, extend = Tools.extend;
    var map = Tools.map, inArray = Tools.inArray, explode = Tools.explode;
    var isOldIE = Env.ie && Env.ie < 11;
    var TRUE = true, FALSE = false;

    return function (editor) {
      var dom, selection, formatter,
        commands = { state: {}, exec: {}, value: {} },
        settings = editor.settings,
        bookmark;

      editor.on('PreInit', function () {
        dom = editor.dom;
        selection = editor.selection;
        settings = editor.settings;
        formatter = editor.formatter;
      });

      /**
       * Executes the specified command.
       *
       * @method execCommand
       * @param {String} command Command to execute.
       * @param {Boolean} ui Optional user interface state.
       * @param {Object} value Optional value for command.
       * @param {Object} args Optional extra arguments to the execCommand.
       * @return {Boolean} true/false if the command was found or not.
       */
      function execCommand(command, ui, value, args) {
        var func, customCommand, state = 0;

        if (editor.removed) {
          return;
        }

        if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint)$/.test(command) && (!args || !args.skip_focus)) {
          editor.focus();
        }

        args = editor.fire('BeforeExecCommand', { command: command, ui: ui, value: value });
        if (args.isDefaultPrevented()) {
          return false;
        }

        customCommand = command.toLowerCase();
        if ((func = commands.exec[customCommand])) {
          func(customCommand, ui, value);
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        // Plugin commands
        each(editor.plugins, function (p) {
          if (p.execCommand && p.execCommand(command, ui, value)) {
            editor.fire('ExecCommand', { command: command, ui: ui, value: value });
            state = true;
            return false;
          }
        });

        if (state) {
          return state;
        }

        // Theme commands
        if (editor.theme && editor.theme.execCommand && editor.theme.execCommand(command, ui, value)) {
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        // Browser commands
        try {
          state = editor.getDoc().execCommand(command, ui, value);
        } catch (ex) {
          // Ignore old IE errors
        }

        if (state) {
          editor.fire('ExecCommand', { command: command, ui: ui, value: value });
          return true;
        }

        return false;
      }

      /**
       * Queries the current state for a command for example if the current selection is "bold".
       *
       * @method queryCommandState
       * @param {String} command Command to check the state of.
       * @return {Boolean/Number} true/false if the selected contents is bold or not, -1 if it's not found.
       */
      function queryCommandState(command) {
        var func;

        if (editor.quirks.isHidden() || editor.removed) {
          return;
        }

        command = command.toLowerCase();
        if ((func = commands.state[command])) {
          return func(command);
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandState(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }

        return false;
      }

      /**
       * Queries the command value for example the current fontsize.
       *
       * @method queryCommandValue
       * @param {String} command Command to check the value of.
       * @return {Object} Command value of false if it's not found.
       */
      function queryCommandValue(command) {
        var func;

        if (editor.quirks.isHidden() || editor.removed) {
          return;
        }

        command = command.toLowerCase();
        if ((func = commands.value[command])) {
          return func(command);
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandValue(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }
      }

      /**
       * Adds commands to the command collection.
       *
       * @method addCommands
       * @param {Object} commandList Name/value collection with commands to add, the names can also be comma separated.
       * @param {String} type Optional type to add, defaults to exec. Can be value or state as well.
       */
      function addCommands(commandList, type) {
        type = type || 'exec';

        each(commandList, function (callback, command) {
          each(command.toLowerCase().split(','), function (command) {
            commands[type][command] = callback;
          });
        });
      }

      function addCommand(command, callback, scope) {
        command = command.toLowerCase();
        commands.exec[command] = function (command, ui, value, args) {
          return callback.call(scope || editor, ui, value, args);
        };
      }

      /**
       * Returns true/false if the command is supported or not.
       *
       * @method queryCommandSupported
       * @param {String} command Command that we check support for.
       * @return {Boolean} true/false if the command is supported or not.
       */
      function queryCommandSupported(command) {
        command = command.toLowerCase();

        if (commands.exec[command]) {
          return true;
        }

        // Browser commands
        try {
          return editor.getDoc().queryCommandSupported(command);
        } catch (ex) {
          // Fails sometimes see bug: 1896577
        }

        return false;
      }

      function addQueryStateHandler(command, callback, scope) {
        command = command.toLowerCase();
        commands.state[command] = function () {
          return callback.call(scope || editor);
        };
      }

      function addQueryValueHandler(command, callback, scope) {
        command = command.toLowerCase();
        commands.value[command] = function () {
          return callback.call(scope || editor);
        };
      }

      function hasCustomCommand(command) {
        command = command.toLowerCase();
        return !!commands.exec[command];
      }

      // Expose public methods
      extend(this, {
        execCommand: execCommand,
        queryCommandState: queryCommandState,
        queryCommandValue: queryCommandValue,
        queryCommandSupported: queryCommandSupported,
        addCommands: addCommands,
        addCommand: addCommand,
        addQueryStateHandler: addQueryStateHandler,
        addQueryValueHandler: addQueryValueHandler,
        hasCustomCommand: hasCustomCommand
      });

      // Private methods

      function execNativeCommand(command, ui, value) {
        if (ui === undefined) {
          ui = FALSE;
        }

        if (value === undefined) {
          value = null;
        }

        return editor.getDoc().execCommand(command, ui, value);
      }

      function isFormatMatch(name) {
        return formatter.match(name);
      }

      function toggleFormat(name, value) {
        formatter.toggle(name, value ? { value: value } : undefined);
        editor.nodeChanged();
      }

      function storeSelection(type) {
        bookmark = selection.getBookmark(type);
      }

      function restoreSelection() {
        selection.moveToBookmark(bookmark);
      }

      // Add execCommand overrides
      addCommands({
        // Ignore these, added for compatibility
        'mceResetDesignMode,mceBeginUndoLevel': function () { },

        // Add undo manager logic
        'mceEndUndoLevel,mceAddUndoLevel': function () {
          editor.undoManager.add();
        },

        'Cut,Copy,Paste': function (command) {
          var doc = editor.getDoc(), failed;

          // Try executing the native command
          try {
            execNativeCommand(command);
          } catch (ex) {
            // Command failed
            failed = TRUE;
          }

          // Chrome reports the paste command as supported however older IE:s will return false for cut/paste
          if (command === 'paste' && !doc.queryCommandEnabled(command)) {
            failed = true;
          }

          // Present alert message about clipboard access not being available
          if (failed || !doc.queryCommandSupported(command)) {
            var msg = editor.translate(
              "Your browser doesn't support direct access to the clipboard. " +
              "Please use the Ctrl+X/C/V keyboard shortcuts instead."
            );

            if (Env.mac) {
              msg = msg.replace(/Ctrl\+/g, '\u2318+');
            }

            editor.notificationManager.open({ text: msg, type: 'error' });
          }
        },

        // Override unlink command
        unlink: function () {
          if (selection.isCollapsed()) {
            var elm = editor.dom.getParent(editor.selection.getStart(), 'a');
            if (elm) {
              editor.dom.remove(elm, true);
            }

            return;
          }

          formatter.remove("link");
        },

        // Override justify commands to use the text formatter engine
        'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone': function (command) {
          var align = command.substring(7);

          if (align == 'full') {
            align = 'justify';
          }

          // Remove all other alignments first
          each('left,center,right,justify'.split(','), function (name) {
            if (align != name) {
              formatter.remove('align' + name);
            }
          });

          if (align != 'none') {
            toggleFormat('align' + align);
          }
        },

        // Override list commands to fix WebKit bug
        'InsertUnorderedList,InsertOrderedList': function (command) {
          var listElm, listParent;

          execNativeCommand(command);

          // WebKit produces lists within block elements so we need to split them
          // we will replace the native list creation logic to custom logic later on
          // TODO: Remove this when the list creation logic is removed
          listElm = dom.getParent(selection.getNode(), 'ol,ul');
          if (listElm) {
            listParent = listElm.parentNode;

            // If list is within a text block then split that block
            if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
              storeSelection();
              dom.split(listParent, listElm);
              restoreSelection();
            }
          }
        },

        // Override commands to use the text formatter engine
        'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function (command) {
          toggleFormat(command);
        },

        // Override commands to use the text formatter engine
        'ForeColor,HiliteColor,FontName': function (command, ui, value) {
          toggleFormat(command, value);
        },

        FontSize: function (command, ui, value) {
          var fontClasses, fontSizes;

          // Convert font size 1-7 to styles
          if (value >= 1 && value <= 7) {
            fontSizes = explode(settings.font_size_style_values);
            fontClasses = explode(settings.font_size_classes);

            if (fontClasses) {
              value = fontClasses[value - 1] || value;
            } else {
              value = fontSizes[value - 1] || value;
            }
          }

          toggleFormat(command, value);
        },

        RemoveFormat: function (command) {
          formatter.remove(command);
        },

        mceBlockQuote: function () {
          toggleFormat('blockquote');
        },

        FormatBlock: function (command, ui, value) {
          return toggleFormat(value || 'p');
        },

        mceCleanup: function () {
          var bookmark = selection.getBookmark();

          editor.setContent(editor.getContent({ cleanup: TRUE }), { cleanup: TRUE });

          selection.moveToBookmark(bookmark);
        },

        mceRemoveNode: function (command, ui, value) {
          var node = value || selection.getNode();

          // Make sure that the body node isn't removed
          if (node != editor.getBody()) {
            storeSelection();
            editor.dom.remove(node, TRUE);
            restoreSelection();
          }
        },

        mceSelectNodeDepth: function (command, ui, value) {
          var counter = 0;

          dom.getParent(selection.getNode(), function (node) {
            if (node.nodeType == 1 && counter++ == value) {
              selection.select(node);
              return FALSE;
            }
          }, editor.getBody());
        },

        mceSelectNode: function (command, ui, value) {
          selection.select(value);
        },

        mceInsertContent: function (command, ui, value) {
          InsertContent.insertAtCaret(editor, value);
        },

        mceInsertRawHTML: function (command, ui, value) {
          selection.setContent('tiny_mce_marker');
          editor.setContent(
            editor.getContent().replace(/tiny_mce_marker/g, function () {
              return value;
            })
          );
        },

        mceToggleFormat: function (command, ui, value) {
          toggleFormat(value);
        },

        mceSetContent: function (command, ui, value) {
          editor.setContent(value);
        },

        'Indent,Outdent': function (command) {
          var intentValue, indentUnit, value;

          // Setup indent level
          intentValue = settings.indentation;
          indentUnit = /[a-z%]+$/i.exec(intentValue);
          intentValue = parseInt(intentValue, 10);

          if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
            // If forced_root_blocks is set to false we don't have a block to indent so lets create a div
            if (!settings.forced_root_block && !dom.getParent(selection.getNode(), dom.isBlock)) {
              formatter.apply('div');
            }

            each(selection.getSelectedBlocks(), function (element) {
              if (dom.getContentEditable(element) === "false") {
                return;
              }

              if (element.nodeName !== "LI") {
                var indentStyleName = editor.getParam('indent_use_margin', false) ? 'margin' : 'padding';
                indentStyleName = element.nodeName === 'TABLE' ? 'margin' : indentStyleName;
                indentStyleName += dom.getStyle(element, 'direction', true) == 'rtl' ? 'Right' : 'Left';

                if (command == 'outdent') {
                  value = Math.max(0, parseInt(element.style[indentStyleName] || 0, 10) - intentValue);
                  dom.setStyle(element, indentStyleName, value ? value + indentUnit : '');
                } else {
                  value = (parseInt(element.style[indentStyleName] || 0, 10) + intentValue) + indentUnit;
                  dom.setStyle(element, indentStyleName, value);
                }
              }
            });
          } else {
            execNativeCommand(command);
          }
        },

        mceRepaint: function () {
        },

        InsertHorizontalRule: function () {
          editor.execCommand('mceInsertContent', false, '<hr />');
        },

        mceToggleVisualAid: function () {
          editor.hasVisual = !editor.hasVisual;
          editor.addVisual();
        },

        mceReplaceContent: function (command, ui, value) {
          editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, selection.getContent({ format: 'text' })));
        },

        mceInsertLink: function (command, ui, value) {
          var anchor;

          if (typeof value == 'string') {
            value = { href: value };
          }

          anchor = dom.getParent(selection.getNode(), 'a');

          // Spaces are never valid in URLs and it's a very common mistake for people to make so we fix it here.
          value.href = value.href.replace(' ', '%20');

          // Remove existing links if there could be child links or that the href isn't specified
          if (!anchor || !value.href) {
            formatter.remove('link');
          }

          // Apply new link to selection
          if (value.href) {
            formatter.apply('link', value, anchor);
          }
        },

        selectAll: function () {
          var root = dom.getRoot(), rng;

          if (selection.getRng().setStart) {
            var editingHost = dom.getParent(selection.getStart(), NodeType.isContentEditableTrue);
            if (editingHost) {
              rng = dom.createRng();
              rng.selectNodeContents(editingHost);
              selection.setRng(rng);
            }
          } else {
            // IE will render it's own root level block elements and sometimes
            // even put font elements in them when the user starts typing. So we need to
            // move the selection to a more suitable element from this:
            // <body>|<p></p></body> to this: <body><p>|</p></body>
            rng = selection.getRng();
            if (!rng.item) {
              rng.moveToElementText(root);
              rng.select();
            }
          }
        },

        "delete": function () {
          DeleteCommands.deleteCommand(editor);
        },

        "forwardDelete": function () {
          DeleteCommands.forwardDeleteCommand(editor);
        },

        mceNewDocument: function () {
          editor.setContent('');
        },

        InsertLineBreak: function (command, ui, value) {
          // We load the current event in from EnterKey.js when appropriate to heed
          // certain event-specific variations such as ctrl-enter in a list
          var evt = value;
          var brElm, extraBr, marker;
          var rng = selection.getRng(true);
          new RangeUtils(dom).normalize(rng);

          var offset = rng.startOffset;
          var container = rng.startContainer;

          // Resolve node index
          if (container.nodeType == 1 && container.hasChildNodes()) {
            var isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

            container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
            if (isAfterLastNodeInContainer && container.nodeType == 3) {
              offset = container.nodeValue.length;
            } else {
              offset = 0;
            }
          }

          var parentBlock = dom.getParent(container, dom.isBlock);
          var parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
          var containerBlock = parentBlock ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;
          var containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

          // Enter inside block contained within a LI then split or insert before/after LI
          var isControlKey = evt && evt.ctrlKey;
          if (containerBlockName == 'LI' && !isControlKey) {
            parentBlock = containerBlock;
            parentBlockName = containerBlockName;
          }

          // Walks the parent block to the right and look for BR elements
          function hasRightSideContent() {
            var walker = new TreeWalker(container, parentBlock), node;
            var nonEmptyElementsMap = editor.schema.getNonEmptyElements();

            while ((node = walker.next())) {
              if (nonEmptyElementsMap[node.nodeName.toLowerCase()] || node.length > 0) {
                return true;
              }
            }
          }

          if (container && container.nodeType == 3 && offset >= container.nodeValue.length) {
            // Insert extra BR element at the end block elements
            if (!isOldIE && !hasRightSideContent()) {
              brElm = dom.create('br');
              rng.insertNode(brElm);
              rng.setStartAfter(brElm);
              rng.setEndAfter(brElm);
              extraBr = true;
            }
          }

          brElm = dom.create('br');
          rng.insertNode(brElm);

          // Rendering modes below IE8 doesn't display BR elements in PRE unless we have a \n before it
          var documentMode = dom.doc.documentMode;
          if (isOldIE && parentBlockName == 'PRE' && (!documentMode || documentMode < 8)) {
            brElm.parentNode.insertBefore(dom.doc.createTextNode('\r'), brElm);
          }

          // Insert temp marker and scroll to that
          marker = dom.create('span', {}, '&nbsp;');
          brElm.parentNode.insertBefore(marker, brElm);
          selection.scrollIntoView(marker);
          dom.remove(marker);

          if (!extraBr) {
            rng.setStartAfter(brElm);
            rng.setEndAfter(brElm);
          } else {
            rng.setStartBefore(brElm);
            rng.setEndBefore(brElm);
          }

          selection.setRng(rng);
          editor.undoManager.add();

          return TRUE;
        }
      });

      // Add queryCommandState overrides
      addCommands({
        // Override justify commands
        'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull': function (command) {
          var name = 'align' + command.substring(7);
          var nodes = selection.isCollapsed() ? [dom.getParent(selection.getNode(), dom.isBlock)] : selection.getSelectedBlocks();
          var matches = map(nodes, function (node) {
            return !!formatter.matchNode(node, name);
          });
          return inArray(matches, TRUE) !== -1;
        },

        'Bold,Italic,Underline,Strikethrough,Superscript,Subscript': function (command) {
          return isFormatMatch(command);
        },

        mceBlockQuote: function () {
          return isFormatMatch('blockquote');
        },

        Outdent: function () {
          var node;

          if (settings.inline_styles) {
            if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
              return TRUE;
            }

            if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft, 10) > 0) {
              return TRUE;
            }
          }

          return (
            queryCommandState('InsertUnorderedList') ||
            queryCommandState('InsertOrderedList') ||
            (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'))
          );
        },

        'InsertUnorderedList,InsertOrderedList': function (command) {
          var list = dom.getParent(selection.getNode(), 'ul,ol');

          return list &&
            (
              command === 'insertunorderedlist' && list.tagName === 'UL' ||
              command === 'insertorderedlist' && list.tagName === 'OL'
            );
        }
      }, 'state');

      // Add queryCommandValue overrides
      addCommands({
        'FontSize,FontName': function (command) {
          var value = 0, parent;

          if ((parent = dom.getParent(selection.getNode(), 'span'))) {
            if (command == 'fontsize') {
              value = parent.style.fontSize;
            } else {
              value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
            }
          }

          return value;
        }
      }, 'value');

      // Add undo manager logic
      addCommands({
        Undo: function () {
          editor.undoManager.undo();
        },

        Redo: function () {
          editor.undoManager.redo();
        }
      });
    };
  }
);

/**
 * URI.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles parsing, modification and serialization of URI/URL strings.
 * @class tinymce.util.URI
 */
define(
  'tinymce.core.util.URI',
  [
    'global!document',
    'tinymce.core.util.Tools'
  ],
  function (document, Tools) {
    var each = Tools.each, trim = Tools.trim;
    var queryParts = "source protocol authority userInfo user password host port relative path directory file query anchor".split(' ');
    var DEFAULT_PORTS = {
      'ftp': 21,
      'http': 80,
      'https': 443,
      'mailto': 25
    };

    /**
     * Constructs a new URI instance.
     *
     * @constructor
     * @method URI
     * @param {String} url URI string to parse.
     * @param {Object} settings Optional settings object.
     */
    function URI(url, settings) {
      var self = this, baseUri, baseUrl;

      url = trim(url);
      settings = self.settings = settings || {};
      baseUri = settings.base_uri;

      // Strange app protocol that isn't http/https or local anchor
      // For example: mailto,skype,tel etc.
      if (/^([\w\-]+):([^\/]{2})/i.test(url) || /^\s*#/.test(url)) {
        self.source = url;
        return;
      }

      var isProtocolRelative = url.indexOf('//') === 0;

      // Absolute path with no host, fake host and protocol
      if (url.indexOf('/') === 0 && !isProtocolRelative) {
        url = (baseUri ? baseUri.protocol || 'http' : 'http') + '://mce_host' + url;
      }

      // Relative path http:// or protocol relative //path
      if (!/^[\w\-]*:?\/\//.test(url)) {
        baseUrl = settings.base_uri ? settings.base_uri.path : new URI(document.location.href).directory;
        if (settings.base_uri.protocol === "") {
          url = '//mce_host' + self.toAbsPath(baseUrl, url);
        } else {
          url = /([^#?]*)([#?]?.*)/.exec(url);
          url = ((baseUri && baseUri.protocol) || 'http') + '://mce_host' + self.toAbsPath(baseUrl, url[1]) + url[2];
        }
      }

      // Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
      url = url.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something

      /*jshint maxlen: 255 */
      /*eslint max-len: 0 */
      url = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(url);

      each(queryParts, function (v, i) {
        var part = url[i];

        // Zope 3 workaround, they use @@something
        if (part) {
          part = part.replace(/\(mce_at\)/g, '@@');
        }

        self[v] = part;
      });

      if (baseUri) {
        if (!self.protocol) {
          self.protocol = baseUri.protocol;
        }

        if (!self.userInfo) {
          self.userInfo = baseUri.userInfo;
        }

        if (!self.port && self.host === 'mce_host') {
          self.port = baseUri.port;
        }

        if (!self.host || self.host === 'mce_host') {
          self.host = baseUri.host;
        }

        self.source = '';
      }

      if (isProtocolRelative) {
        self.protocol = '';
      }

      //t.path = t.path || '/';
    }

    URI.prototype = {
      /**
       * Sets the internal path part of the URI.
       *
       * @method setPath
       * @param {string} path Path string to set.
       */
      setPath: function (path) {
        var self = this;

        path = /^(.*?)\/?(\w+)?$/.exec(path);

        // Update path parts
        self.path = path[0];
        self.directory = path[1];
        self.file = path[2];

        // Rebuild source
        self.source = '';
        self.getURI();
      },

      /**
       * Converts the specified URI into a relative URI based on the current URI instance location.
       *
       * @method toRelative
       * @param {String} uri URI to convert into a relative path/URI.
       * @return {String} Relative URI from the point specified in the current URI instance.
       * @example
       * // Converts an absolute URL to an relative URL url will be somedir/somefile.htm
       * var url = new tinymce.util.URI('http://www.site.com/dir/').toRelative('http://www.site.com/dir/somedir/somefile.htm');
       */
      toRelative: function (uri) {
        var self = this, output;

        if (uri === "./") {
          return uri;
        }

        uri = new URI(uri, { base_uri: self });

        // Not on same domain/port or protocol
        if ((uri.host != 'mce_host' && self.host != uri.host && uri.host) || self.port != uri.port ||
          (self.protocol != uri.protocol && uri.protocol !== "")) {
          return uri.getURI();
        }

        var tu = self.getURI(), uu = uri.getURI();

        // Allow usage of the base_uri when relative_urls = true
        if (tu == uu || (tu.charAt(tu.length - 1) == "/" && tu.substr(0, tu.length - 1) == uu)) {
          return tu;
        }

        output = self.toRelPath(self.path, uri.path);

        // Add query
        if (uri.query) {
          output += '?' + uri.query;
        }

        // Add anchor
        if (uri.anchor) {
          output += '#' + uri.anchor;
        }

        return output;
      },

      /**
       * Converts the specified URI into a absolute URI based on the current URI instance location.
       *
       * @method toAbsolute
       * @param {String} uri URI to convert into a relative path/URI.
       * @param {Boolean} noHost No host and protocol prefix.
       * @return {String} Absolute URI from the point specified in the current URI instance.
       * @example
       * // Converts an relative URL to an absolute URL url will be http://www.site.com/dir/somedir/somefile.htm
       * var url = new tinymce.util.URI('http://www.site.com/dir/').toAbsolute('somedir/somefile.htm');
       */
      toAbsolute: function (uri, noHost) {
        uri = new URI(uri, { base_uri: this });

        return uri.getURI(noHost && this.isSameOrigin(uri));
      },

      /**
       * Determine whether the given URI has the same origin as this URI.  Based on RFC-6454.
       * Supports default ports for protocols listed in DEFAULT_PORTS.  Unsupported protocols will fail safe: they
       * won't match, if the port specifications differ.
       *
       * @method isSameOrigin
       * @param {tinymce.util.URI} uri Uri instance to compare.
       * @returns {Boolean} True if the origins are the same.
       */
      isSameOrigin: function (uri) {
        if (this.host == uri.host && this.protocol == uri.protocol) {
          if (this.port == uri.port) {
            return true;
          }

          var defaultPort = DEFAULT_PORTS[this.protocol];
          if (defaultPort && ((this.port || defaultPort) == (uri.port || defaultPort))) {
            return true;
          }
        }

        return false;
      },

      /**
       * Converts a absolute path into a relative path.
       *
       * @method toRelPath
       * @param {String} base Base point to convert the path from.
       * @param {String} path Absolute path to convert into a relative path.
       */
      toRelPath: function (base, path) {
        var items, breakPoint = 0, out = '', i, l;

        // Split the paths
        base = base.substring(0, base.lastIndexOf('/'));
        base = base.split('/');
        items = path.split('/');

        if (base.length >= items.length) {
          for (i = 0, l = base.length; i < l; i++) {
            if (i >= items.length || base[i] != items[i]) {
              breakPoint = i + 1;
              break;
            }
          }
        }

        if (base.length < items.length) {
          for (i = 0, l = items.length; i < l; i++) {
            if (i >= base.length || base[i] != items[i]) {
              breakPoint = i + 1;
              break;
            }
          }
        }

        if (breakPoint === 1) {
          return path;
        }

        for (i = 0, l = base.length - (breakPoint - 1); i < l; i++) {
          out += "../";
        }

        for (i = breakPoint - 1, l = items.length; i < l; i++) {
          if (i != breakPoint - 1) {
            out += "/" + items[i];
          } else {
            out += items[i];
          }
        }

        return out;
      },

      /**
       * Converts a relative path into a absolute path.
       *
       * @method toAbsPath
       * @param {String} base Base point to convert the path from.
       * @param {String} path Relative path to convert into an absolute path.
       */
      toAbsPath: function (base, path) {
        var i, nb = 0, o = [], tr, outPath;

        // Split paths
        tr = /\/$/.test(path) ? '/' : '';
        base = base.split('/');
        path = path.split('/');

        // Remove empty chunks
        each(base, function (k) {
          if (k) {
            o.push(k);
          }
        });

        base = o;

        // Merge relURLParts chunks
        for (i = path.length - 1, o = []; i >= 0; i--) {
          // Ignore empty or .
          if (path[i].length === 0 || path[i] === ".") {
            continue;
          }

          // Is parent
          if (path[i] === '..') {
            nb++;
            continue;
          }

          // Move up
          if (nb > 0) {
            nb--;
            continue;
          }

          o.push(path[i]);
        }

        i = base.length - nb;

        // If /a/b/c or /
        if (i <= 0) {
          outPath = o.reverse().join('/');
        } else {
          outPath = base.slice(0, i).join('/') + '/' + o.reverse().join('/');
        }

        // Add front / if it's needed
        if (outPath.indexOf('/') !== 0) {
          outPath = '/' + outPath;
        }

        // Add traling / if it's needed
        if (tr && outPath.lastIndexOf('/') !== outPath.length - 1) {
          outPath += tr;
        }

        return outPath;
      },

      /**
       * Returns the full URI of the internal structure.
       *
       * @method getURI
       * @param {Boolean} noProtoHost Optional no host and protocol part. Defaults to false.
       */
      getURI: function (noProtoHost) {
        var s, self = this;

        // Rebuild source
        if (!self.source || noProtoHost) {
          s = '';

          if (!noProtoHost) {
            if (self.protocol) {
              s += self.protocol + '://';
            } else {
              s += '//';
            }

            if (self.userInfo) {
              s += self.userInfo + '@';
            }

            if (self.host) {
              s += self.host;
            }

            if (self.port) {
              s += ':' + self.port;
            }
          }

          if (self.path) {
            s += self.path;
          }

          if (self.query) {
            s += '?' + self.query;
          }

          if (self.anchor) {
            s += '#' + self.anchor;
          }

          self.source = s;
        }

        return self.source;
      }
    };

    URI.parseDataUri = function (uri) {
      var type, matches;

      uri = decodeURIComponent(uri).split(',');

      matches = /data:([^;]+)/.exec(uri[0]);
      if (matches) {
        type = matches[1];
      }

      return {
        type: type,
        data: uri[1]
      };
    };

    URI.getDocumentBaseUrl = function (loc) {
      var baseUrl;

      // Pass applewebdata:// and other non web protocols though
      if (loc.protocol.indexOf('http') !== 0 && loc.protocol !== 'file:') {
        baseUrl = loc.href;
      } else {
        baseUrl = loc.protocol + '//' + loc.host + loc.pathname;
      }

      if (/^[^:]+:\/\/\/?[^\/]+\//.test(baseUrl)) {
        baseUrl = baseUrl.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');

        if (!/[\/\\]$/.test(baseUrl)) {
          baseUrl += '/';
        }
      }

      return baseUrl;
    };

    return URI;
  }
);

/**
 * Class.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This utilitiy class is used for easier inheritance.
 *
 * Features:
 * * Exposed super functions: this._super();
 * * Mixins
 * * Dummy functions
 * * Property functions: var value = object.value(); and object.value(newValue);
 * * Static functions
 * * Defaults settings
 */
define(
  'tinymce.core.util.Class',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    var each = Tools.each, extend = Tools.extend;

    var extendClass, initializing;

    function Class() {
    }

    // Provides classical inheritance, based on code made by John Resig
    Class.extend = extendClass = function (prop) {
      var self = this, _super = self.prototype, prototype, name, member;

      // The dummy class constructor
      function Class() {
        var i, mixins, mixin, self = this;

        // All construction is actually done in the init method
        if (!initializing) {
          // Run class constuctor
          if (self.init) {
            self.init.apply(self, arguments);
          }

          // Run mixin constructors
          mixins = self.Mixins;
          if (mixins) {
            i = mixins.length;
            while (i--) {
              mixin = mixins[i];
              if (mixin.init) {
                mixin.init.apply(self, arguments);
              }
            }
          }
        }
      }

      // Dummy function, needs to be extended in order to provide functionality
      function dummy() {
        return this;
      }

      // Creates a overloaded method for the class
      // this enables you to use this._super(); to call the super function
      function createMethod(name, fn) {
        return function () {
          var self = this, tmp = self._super, ret;

          self._super = _super[name];
          ret = fn.apply(self, arguments);
          self._super = tmp;

          return ret;
        };
      }

      // Instantiate a base class (but only create the instance,
      // don't run the init constructor)
      initializing = true;

      /*eslint new-cap:0 */
      prototype = new self();
      initializing = false;

      // Add mixins
      if (prop.Mixins) {
        each(prop.Mixins, function (mixin) {
          for (var name in mixin) {
            if (name !== "init") {
              prop[name] = mixin[name];
            }
          }
        });

        if (_super.Mixins) {
          prop.Mixins = _super.Mixins.concat(prop.Mixins);
        }
      }

      // Generate dummy methods
      if (prop.Methods) {
        each(prop.Methods.split(','), function (name) {
          prop[name] = dummy;
        });
      }

      // Generate property methods
      if (prop.Properties) {
        each(prop.Properties.split(','), function (name) {
          var fieldName = '_' + name;

          prop[name] = function (value) {
            var self = this, undef;

            // Set value
            if (value !== undef) {
              self[fieldName] = value;

              return self;
            }

            // Get value
            return self[fieldName];
          };
        });
      }

      // Static functions
      if (prop.Statics) {
        each(prop.Statics, function (func, name) {
          Class[name] = func;
        });
      }

      // Default settings
      if (prop.Defaults && _super.Defaults) {
        prop.Defaults = extend({}, _super.Defaults, prop.Defaults);
      }

      // Copy the properties over onto the new prototype
      for (name in prop) {
        member = prop[name];

        if (typeof member == "function" && _super[name]) {
          prototype[name] = createMethod(name, member);
        } else {
          prototype[name] = member;
        }
      }

      // Populate our constructed prototype object
      Class.prototype = prototype;

      // Enforce the constructor to be what we expect
      Class.constructor = Class;

      // And make this class extendible
      Class.extend = extendClass;

      return Class;
    };

    return Class;
  }
);
/**
 * EventDispatcher.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class lets you add/remove and fire events by name on the specified scope. This makes
 * it easy to add event listener logic to any class.
 *
 * @class tinymce.util.EventDispatcher
 * @example
 *  var eventDispatcher = new EventDispatcher();
 *
 *  eventDispatcher.on('click', function() {console.log('data');});
 *  eventDispatcher.fire('click', {data: 123});
 */
define(
  'tinymce.core.util.EventDispatcher',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    var nativeEvents = Tools.makeMap(
      "focus blur focusin focusout click dblclick mousedown mouseup mousemove mouseover beforepaste paste cut copy selectionchange " +
      "mouseout mouseenter mouseleave wheel keydown keypress keyup input contextmenu dragstart dragend dragover " +
      "draggesture dragdrop drop drag submit " +
      "compositionstart compositionend compositionupdate touchstart touchmove touchend",
      ' '
    );

    function Dispatcher(settings) {
      var self = this, scope, bindings = {}, toggleEvent;

      function returnFalse() {
        return false;
      }

      function returnTrue() {
        return true;
      }

      settings = settings || {};
      scope = settings.scope || self;
      toggleEvent = settings.toggleEvent || returnFalse;

      /**
       * Fires the specified event by name.
       *
       * @method fire
       * @param {String} name Name of the event to fire.
       * @param {Object?} args Event arguments.
       * @return {Object} Event args instance passed in.
       * @example
       * instance.fire('event', {...});
       */
      function fire(name, args) {
        var handlers, i, l, callback;

        name = name.toLowerCase();
        args = args || {};
        args.type = name;

        // Setup target is there isn't one
        if (!args.target) {
          args.target = scope;
        }

        // Add event delegation methods if they are missing
        if (!args.preventDefault) {
          // Add preventDefault method
          args.preventDefault = function () {
            args.isDefaultPrevented = returnTrue;
          };

          // Add stopPropagation
          args.stopPropagation = function () {
            args.isPropagationStopped = returnTrue;
          };

          // Add stopImmediatePropagation
          args.stopImmediatePropagation = function () {
            args.isImmediatePropagationStopped = returnTrue;
          };

          // Add event delegation states
          args.isDefaultPrevented = returnFalse;
          args.isPropagationStopped = returnFalse;
          args.isImmediatePropagationStopped = returnFalse;
        }

        if (settings.beforeFire) {
          settings.beforeFire(args);
        }

        handlers = bindings[name];
        if (handlers) {
          for (i = 0, l = handlers.length; i < l; i++) {
            callback = handlers[i];

            // Unbind handlers marked with "once"
            if (callback.once) {
              off(name, callback.func);
            }

            // Stop immediate propagation if needed
            if (args.isImmediatePropagationStopped()) {
              args.stopPropagation();
              return args;
            }

            // If callback returns false then prevent default and stop all propagation
            if (callback.func.call(scope, args) === false) {
              args.preventDefault();
              return args;
            }
          }
        }

        return args;
      }

      /**
       * Binds an event listener to a specific event by name.
       *
       * @method on
       * @param {String} name Event name or space separated list of events to bind.
       * @param {callback} callback Callback to be executed when the event occurs.
       * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
       * @return {Object} Current class instance.
       * @example
       * instance.on('event', function(e) {
       *     // Callback logic
       * });
       */
      function on(name, callback, prepend, extra) {
        var handlers, names, i;

        if (callback === false) {
          callback = returnFalse;
        }

        if (callback) {
          callback = {
            func: callback
          };

          if (extra) {
            Tools.extend(callback, extra);
          }

          names = name.toLowerCase().split(' ');
          i = names.length;
          while (i--) {
            name = names[i];
            handlers = bindings[name];
            if (!handlers) {
              handlers = bindings[name] = [];
              toggleEvent(name, true);
            }

            if (prepend) {
              handlers.unshift(callback);
            } else {
              handlers.push(callback);
            }
          }
        }

        return self;
      }

      /**
       * Unbinds an event listener to a specific event by name.
       *
       * @method off
       * @param {String?} name Name of the event to unbind.
       * @param {callback?} callback Callback to unbind.
       * @return {Object} Current class instance.
       * @example
       * // Unbind specific callback
       * instance.off('event', handler);
       *
       * // Unbind all listeners by name
       * instance.off('event');
       *
       * // Unbind all events
       * instance.off();
       */
      function off(name, callback) {
        var i, handlers, bindingName, names, hi;

        if (name) {
          names = name.toLowerCase().split(' ');
          i = names.length;
          while (i--) {
            name = names[i];
            handlers = bindings[name];

            // Unbind all handlers
            if (!name) {
              for (bindingName in bindings) {
                toggleEvent(bindingName, false);
                delete bindings[bindingName];
              }

              return self;
            }

            if (handlers) {
              // Unbind all by name
              if (!callback) {
                handlers.length = 0;
              } else {
                // Unbind specific ones
                hi = handlers.length;
                while (hi--) {
                  if (handlers[hi].func === callback) {
                    handlers = handlers.slice(0, hi).concat(handlers.slice(hi + 1));
                    bindings[name] = handlers;
                  }
                }
              }

              if (!handlers.length) {
                toggleEvent(name, false);
                delete bindings[name];
              }
            }
          }
        } else {
          for (name in bindings) {
            toggleEvent(name, false);
          }

          bindings = {};
        }

        return self;
      }

      /**
       * Binds an event listener to a specific event by name
       * and automatically unbind the event once the callback fires.
       *
       * @method once
       * @param {String} name Event name or space separated list of events to bind.
       * @param {callback} callback Callback to be executed when the event occurs.
       * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
       * @return {Object} Current class instance.
       * @example
       * instance.once('event', function(e) {
       *     // Callback logic
       * });
       */
      function once(name, callback, prepend) {
        return on(name, callback, prepend, { once: true });
      }

      /**
       * Returns true/false if the dispatcher has a event of the specified name.
       *
       * @method has
       * @param {String} name Name of the event to check for.
       * @return {Boolean} true/false if the event exists or not.
       */
      function has(name) {
        name = name.toLowerCase();
        return !(!bindings[name] || bindings[name].length === 0);
      }

      // Expose
      self.fire = fire;
      self.on = on;
      self.off = off;
      self.once = once;
      self.has = has;
    }

    /**
     * Returns true/false if the specified event name is a native browser event or not.
     *
     * @method isNative
     * @param {String} name Name to check if it's native.
     * @return {Boolean} true/false if the event is native or not.
     * @static
     */
    Dispatcher.isNative = function (name) {
      return !!nativeEvents[name.toLowerCase()];
    };

    return Dispatcher;
  }
);

/**
 * Observable.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This mixin will add event binding logic to classes.
 *
 * @mixin tinymce.util.Observable
 */
define(
  'tinymce.core.util.Observable',
  [
    "tinymce.core.util.EventDispatcher"
  ],
  function (EventDispatcher) {
    function getEventDispatcher(obj) {
      if (!obj._eventDispatcher) {
        obj._eventDispatcher = new EventDispatcher({
          scope: obj,
          toggleEvent: function (name, state) {
            if (EventDispatcher.isNative(name) && obj.toggleNativeEvent) {
              obj.toggleNativeEvent(name, state);
            }
          }
        });
      }

      return obj._eventDispatcher;
    }

    return {
      /**
       * Fires the specified event by name. Consult the
       * <a href="/docs/advanced/events">event reference</a> for more details on each event.
       *
       * @method fire
       * @param {String} name Name of the event to fire.
       * @param {Object?} args Event arguments.
       * @param {Boolean?} bubble True/false if the event is to be bubbled.
       * @return {Object} Event args instance passed in.
       * @example
       * instance.fire('event', {...});
       */
      fire: function (name, args, bubble) {
        var self = this;

        // Prevent all events except the remove event after the instance has been removed
        if (self.removed && name !== "remove") {
          return args;
        }

        args = getEventDispatcher(self).fire(name, args, bubble);

        // Bubble event up to parents
        if (bubble !== false && self.parent) {
          var parent = self.parent();
          while (parent && !args.isPropagationStopped()) {
            parent.fire(name, args, false);
            parent = parent.parent();
          }
        }

        return args;
      },

      /**
       * Binds an event listener to a specific event by name. Consult the
       * <a href="/docs/advanced/events">event reference</a> for more details on each event.
       *
       * @method on
       * @param {String} name Event name or space separated list of events to bind.
       * @param {callback} callback Callback to be executed when the event occurs.
       * @param {Boolean} first Optional flag if the event should be prepended. Use this with care.
       * @return {Object} Current class instance.
       * @example
       * instance.on('event', function(e) {
       *     // Callback logic
       * });
       */
      on: function (name, callback, prepend) {
        return getEventDispatcher(this).on(name, callback, prepend);
      },

      /**
       * Unbinds an event listener to a specific event by name. Consult the
       * <a href="/docs/advanced/events">event reference</a> for more details on each event.
       *
       * @method off
       * @param {String?} name Name of the event to unbind.
       * @param {callback?} callback Callback to unbind.
       * @return {Object} Current class instance.
       * @example
       * // Unbind specific callback
       * instance.off('event', handler);
       *
       * // Unbind all listeners by name
       * instance.off('event');
       *
       * // Unbind all events
       * instance.off();
       */
      off: function (name, callback) {
        return getEventDispatcher(this).off(name, callback);
      },

      /**
       * Bind the event callback and once it fires the callback is removed. Consult the
       * <a href="/docs/advanced/events">event reference</a> for more details on each event.
       *
       * @method once
       * @param {String} name Name of the event to bind.
       * @param {callback} callback Callback to bind only once.
       * @return {Object} Current class instance.
       */
      once: function (name, callback) {
        return getEventDispatcher(this).once(name, callback);
      },

      /**
       * Returns true/false if the object has a event of the specified name.
       *
       * @method hasEventListeners
       * @param {String} name Name of the event to check for.
       * @return {Boolean} true/false if the event exists or not.
       */
      hasEventListeners: function (name) {
        return getEventDispatcher(this).has(name);
      }
    };
  }
);
/**
 * Binding.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class gets dynamically extended to provide a binding between two models. This makes it possible to
 * sync the state of two properties in two models by a layer of abstraction.
 *
 * @private
 * @class tinymce.data.Binding
 */
define(
  'tinymce.core.data.Binding',
  [
  ],
  function () {
    /**
     * Constructs a new bidning.
     *
     * @constructor
     * @method Binding
     * @param {Object} settings Settings to the binding.
     */
    function Binding(settings) {
      this.create = settings.create;
    }

    /**
     * Creates a binding for a property on a model.
     *
     * @method create
     * @param {tinymce.data.ObservableObject} model Model to create binding to.
     * @param {String} name Name of property to bind.
     * @return {tinymce.data.Binding} Binding instance.
     */
    Binding.create = function (model, name) {
      return new Binding({
        create: function (otherModel, otherName) {
          var bindings;

          function fromSelfToOther(e) {
            otherModel.set(otherName, e.value);
          }

          function fromOtherToSelf(e) {
            model.set(name, e.value);
          }

          otherModel.on('change:' + otherName, fromOtherToSelf);
          model.on('change:' + name, fromSelfToOther);

          // Keep track of the bindings
          bindings = otherModel._bindings;

          if (!bindings) {
            bindings = otherModel._bindings = [];

            otherModel.on('destroy', function () {
              var i = bindings.length;

              while (i--) {
                bindings[i]();
              }
            });
          }

          bindings.push(function () {
            model.off('change:' + name, fromSelfToOther);
          });

          return model.get(name);
        }
      });
    };

    return Binding;
  }
);
/**
 * ObservableObject.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is a object that is observable when properties changes a change event gets emitted.
 *
 * @private
 * @class tinymce.data.ObservableObject
 */
define(
  'tinymce.core.data.ObservableObject',
  [
    'tinymce.core.data.Binding',
    'tinymce.core.util.Class',
    'tinymce.core.util.Observable',
    'tinymce.core.util.Tools'
  ], function (Binding, Class, Observable, Tools) {
    function isNode(node) {
      return node.nodeType > 0;
    }

    // Todo: Maybe this should be shallow compare since it might be huge object references
    function isEqual(a, b) {
      var k, checked;

      // Strict equals
      if (a === b) {
        return true;
      }

      // Compare null
      if (a === null || b === null) {
        return a === b;
      }

      // Compare number, boolean, string, undefined
      if (typeof a !== "object" || typeof b !== "object") {
        return a === b;
      }

      // Compare arrays
      if (Tools.isArray(b)) {
        if (a.length !== b.length) {
          return false;
        }

        k = a.length;
        while (k--) {
          if (!isEqual(a[k], b[k])) {
            return false;
          }
        }
      }

      // Shallow compare nodes
      if (isNode(a) || isNode(b)) {
        return a === b;
      }

      // Compare objects
      checked = {};
      for (k in b) {
        if (!isEqual(a[k], b[k])) {
          return false;
        }

        checked[k] = true;
      }

      for (k in a) {
        if (!checked[k] && !isEqual(a[k], b[k])) {
          return false;
        }
      }

      return true;
    }

    return Class.extend({
      Mixins: [Observable],

      /**
       * Constructs a new observable object instance.
       *
       * @constructor
       * @param {Object} data Initial data for the object.
       */
      init: function (data) {
        var name, value;

        data = data || {};

        for (name in data) {
          value = data[name];

          if (value instanceof Binding) {
            data[name] = value.create(this, name);
          }
        }

        this.data = data;
      },

      /**
       * Sets a property on the value this will call
       * observers if the value is a change from the current value.
       *
       * @method set
       * @param {String/object} name Name of the property to set or a object of items to set.
       * @param {Object} value Value to set for the property.
       * @return {tinymce.data.ObservableObject} Observable object instance.
       */
      set: function (name, value) {
        var key, args, oldValue = this.data[name];

        if (value instanceof Binding) {
          value = value.create(this, name);
        }

        if (typeof name === "object") {
          for (key in name) {
            this.set(key, name[key]);
          }

          return this;
        }

        if (!isEqual(oldValue, value)) {
          this.data[name] = value;

          args = {
            target: this,
            name: name,
            value: value,
            oldValue: oldValue
          };

          this.fire('change:' + name, args);
          this.fire('change', args);
        }

        return this;
      },

      /**
       * Gets a property by name.
       *
       * @method get
       * @param {String} name Name of the property to get.
       * @return {Object} Object value of propery.
       */
      get: function (name) {
        return this.data[name];
      },

      /**
       * Returns true/false if the specified property exists.
       *
       * @method has
       * @param {String} name Name of the property to check for.
       * @return {Boolean} true/false if the item exists.
       */
      has: function (name) {
        return name in this.data;
      },

      /**
       * Returns a dynamic property binding for the specified property name. This makes
       * it possible to sync the state of two properties in two ObservableObject instances.
       *
       * @method bind
       * @param {String} name Name of the property to sync with the property it's inserted to.
       * @return {tinymce.data.Binding} Data binding instance.
       */
      bind: function (name) {
        return Binding.create(this, name);
      },

      /**
       * Destroys the observable object and fires the "destroy"
       * event and clean up any internal resources.
       *
       * @method destroy
       */
      destroy: function () {
        this.fire('destroy');
      }
    });
  }
);
/**
 * Selector.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint no-nested-ternary:0 */

/**
 * Selector engine, enables you to select controls by using CSS like expressions.
 * We currently only support basic CSS expressions to reduce the size of the core
 * and the ones we support should be enough for most cases.
 *
 * @example
 * Supported expressions:
 *  element
 *  element#name
 *  element.class
 *  element[attr]
 *  element[attr*=value]
 *  element[attr~=value]
 *  element[attr!=value]
 *  element[attr^=value]
 *  element[attr$=value]
 *  element:<state>
 *  element:not(<expression>)
 *  element:first
 *  element:last
 *  element:odd
 *  element:even
 *  element element
 *  element > element
 *
 * @class tinymce.ui.Selector
 */
define(
  'tinymce.core.ui.Selector',
  [
    "tinymce.core.util.Class"
  ],
  function (Class) {
    "use strict";

    /**
     * Produces an array with a unique set of objects. It will not compare the values
     * but the references of the objects.
     *
     * @private
     * @method unqiue
     * @param {Array} array Array to make into an array with unique items.
     * @return {Array} Array with unique items.
     */
    function unique(array) {
      var uniqueItems = [], i = array.length, item;

      while (i--) {
        item = array[i];

        if (!item.__checked) {
          uniqueItems.push(item);
          item.__checked = 1;
        }
      }

      i = uniqueItems.length;
      while (i--) {
        delete uniqueItems[i].__checked;
      }

      return uniqueItems;
    }

    var expression = /^([\w\\*]+)?(?:#([\w\-\\]+))?(?:\.([\w\\\.]+))?(?:\[\@?([\w\\]+)([\^\$\*!~]?=)([\w\\]+)\])?(?:\:(.+))?/i;

    /*jshint maxlen:255 */
    /*eslint max-len:0 */
    var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
      whiteSpace = /^\s*|\s*$/g,
      Collection;

    var Selector = Class.extend({
      /**
       * Constructs a new Selector instance.
       *
       * @constructor
       * @method init
       * @param {String} selector CSS like selector expression.
       */
      init: function (selector) {
        var match = this.match;

        function compileNameFilter(name) {
          if (name) {
            name = name.toLowerCase();

            return function (item) {
              return name === '*' || item.type === name;
            };
          }
        }

        function compileIdFilter(id) {
          if (id) {
            return function (item) {
              return item._name === id;
            };
          }
        }

        function compileClassesFilter(classes) {
          if (classes) {
            classes = classes.split('.');

            return function (item) {
              var i = classes.length;

              while (i--) {
                if (!item.classes.contains(classes[i])) {
                  return false;
                }
              }

              return true;
            };
          }
        }

        function compileAttrFilter(name, cmp, check) {
          if (name) {
            return function (item) {
              var value = item[name] ? item[name]() : '';

              return !cmp ? !!check :
                cmp === "=" ? value === check :
                  cmp === "*=" ? value.indexOf(check) >= 0 :
                    cmp === "~=" ? (" " + value + " ").indexOf(" " + check + " ") >= 0 :
                      cmp === "!=" ? value != check :
                        cmp === "^=" ? value.indexOf(check) === 0 :
                          cmp === "$=" ? value.substr(value.length - check.length) === check :
                            false;
            };
          }
        }

        function compilePsuedoFilter(name) {
          var notSelectors;

          if (name) {
            name = /(?:not\((.+)\))|(.+)/i.exec(name);

            if (!name[1]) {
              name = name[2];

              return function (item, index, length) {
                return name === 'first' ? index === 0 :
                  name === 'last' ? index === length - 1 :
                    name === 'even' ? index % 2 === 0 :
                      name === 'odd' ? index % 2 === 1 :
                        item[name] ? item[name]() :
                          false;
              };
            }

            // Compile not expression
            notSelectors = parseChunks(name[1], []);

            return function (item) {
              return !match(item, notSelectors);
            };
          }
        }

        function compile(selector, filters, direct) {
          var parts;

          function add(filter) {
            if (filter) {
              filters.push(filter);
            }
          }

          // Parse expression into parts
          parts = expression.exec(selector.replace(whiteSpace, ''));

          add(compileNameFilter(parts[1]));
          add(compileIdFilter(parts[2]));
          add(compileClassesFilter(parts[3]));
          add(compileAttrFilter(parts[4], parts[5], parts[6]));
          add(compilePsuedoFilter(parts[7]));

          // Mark the filter with pseudo for performance
          filters.pseudo = !!parts[7];
          filters.direct = direct;

          return filters;
        }

        // Parser logic based on Sizzle by John Resig
        function parseChunks(selector, selectors) {
          var parts = [], extra, matches, i;

          do {
            chunker.exec("");
            matches = chunker.exec(selector);

            if (matches) {
              selector = matches[3];
              parts.push(matches[1]);

              if (matches[2]) {
                extra = matches[3];
                break;
              }
            }
          } while (matches);

          if (extra) {
            parseChunks(extra, selectors);
          }

          selector = [];
          for (i = 0; i < parts.length; i++) {
            if (parts[i] != '>') {
              selector.push(compile(parts[i], [], parts[i - 1] === '>'));
            }
          }

          selectors.push(selector);

          return selectors;
        }

        this._selectors = parseChunks(selector, []);
      },

      /**
       * Returns true/false if the selector matches the specified control.
       *
       * @method match
       * @param {tinymce.ui.Control} control Control to match against the selector.
       * @param {Array} selectors Optional array of selectors, mostly used internally.
       * @return {Boolean} true/false state if the control matches or not.
       */
      match: function (control, selectors) {
        var i, l, si, sl, selector, fi, fl, filters, index, length, siblings, count, item;

        selectors = selectors || this._selectors;
        for (i = 0, l = selectors.length; i < l; i++) {
          selector = selectors[i];
          sl = selector.length;
          item = control;
          count = 0;

          for (si = sl - 1; si >= 0; si--) {
            filters = selector[si];

            while (item) {
              // Find the index and length since a pseudo filter like :first needs it
              if (filters.pseudo) {
                siblings = item.parent().items();
                index = length = siblings.length;
                while (index--) {
                  if (siblings[index] === item) {
                    break;
                  }
                }
              }

              for (fi = 0, fl = filters.length; fi < fl; fi++) {
                if (!filters[fi](item, index, length)) {
                  fi = fl + 1;
                  break;
                }
              }

              if (fi === fl) {
                count++;
                break;
              } else {
                // If it didn't match the right most expression then
                // break since it's no point looking at the parents
                if (si === sl - 1) {
                  break;
                }
              }

              item = item.parent();
            }
          }

          // If we found all selectors then return true otherwise continue looking
          if (count === sl) {
            return true;
          }
        }

        return false;
      },

      /**
       * Returns a tinymce.ui.Collection with matches of the specified selector inside the specified container.
       *
       * @method find
       * @param {tinymce.ui.Control} container Container to look for items in.
       * @return {tinymce.ui.Collection} Collection with matched elements.
       */
      find: function (container) {
        var matches = [], i, l, selectors = this._selectors;

        function collect(items, selector, index) {
          var i, l, fi, fl, item, filters = selector[index];

          for (i = 0, l = items.length; i < l; i++) {
            item = items[i];

            // Run each filter against the item
            for (fi = 0, fl = filters.length; fi < fl; fi++) {
              if (!filters[fi](item, i, l)) {
                fi = fl + 1;
                break;
              }
            }

            // All filters matched the item
            if (fi === fl) {
              // Matched item is on the last expression like: panel toolbar [button]
              if (index == selector.length - 1) {
                matches.push(item);
              } else {
                // Collect next expression type
                if (item.items) {
                  collect(item.items(), selector, index + 1);
                }
              }
            } else if (filters.direct) {
              return;
            }

            // Collect child items
            if (item.items) {
              collect(item.items(), selector, index);
            }
          }
        }

        if (container.items) {
          for (i = 0, l = selectors.length; i < l; i++) {
            collect(container.items(), selectors[i], 0);
          }

          // Unique the matches if needed
          if (l > 1) {
            matches = unique(matches);
          }
        }

        // Fix for circular reference
        if (!Collection) {
          // TODO: Fix me!
          Collection = Selector.Collection;
        }

        return new Collection(matches);
      }
    });

    return Selector;
  }
);

/**
 * Collection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Control collection, this class contains control instances and it enables you to
 * perform actions on all the contained items. This is very similar to how jQuery works.
 *
 * @example
 * someCollection.show().disabled(true);
 *
 * @class tinymce.ui.Collection
 */
define(
  'tinymce.core.ui.Collection',
  [
    "tinymce.core.util.Tools",
    "tinymce.core.ui.Selector",
    "tinymce.core.util.Class"
  ],
  function (Tools, Selector, Class) {
    "use strict";

    var Collection, proto, push = Array.prototype.push, slice = Array.prototype.slice;

    proto = {
      /**
       * Current number of contained control instances.
       *
       * @field length
       * @type Number
       */
      length: 0,

      /**
       * Constructor for the collection.
       *
       * @constructor
       * @method init
       * @param {Array} items Optional array with items to add.
       */
      init: function (items) {
        if (items) {
          this.add(items);
        }
      },

      /**
       * Adds new items to the control collection.
       *
       * @method add
       * @param {Array} items Array if items to add to collection.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      add: function (items) {
        var self = this;

        // Force single item into array
        if (!Tools.isArray(items)) {
          if (items instanceof Collection) {
            self.add(items.toArray());
          } else {
            push.call(self, items);
          }
        } else {
          push.apply(self, items);
        }

        return self;
      },

      /**
       * Sets the contents of the collection. This will remove any existing items
       * and replace them with the ones specified in the input array.
       *
       * @method set
       * @param {Array} items Array with items to set into the Collection.
       * @return {tinymce.ui.Collection} Collection instance.
       */
      set: function (items) {
        var self = this, len = self.length, i;

        self.length = 0;
        self.add(items);

        // Remove old entries
        for (i = self.length; i < len; i++) {
          delete self[i];
        }

        return self;
      },

      /**
       * Filters the collection item based on the specified selector expression or selector function.
       *
       * @method filter
       * @param {String} selector Selector expression to filter items by.
       * @return {tinymce.ui.Collection} Collection containing the filtered items.
       */
      filter: function (selector) {
        var self = this, i, l, matches = [], item, match;

        // Compile string into selector expression
        if (typeof selector === "string") {
          selector = new Selector(selector);

          match = function (item) {
            return selector.match(item);
          };
        } else {
          // Use selector as matching function
          match = selector;
        }

        for (i = 0, l = self.length; i < l; i++) {
          item = self[i];

          if (match(item)) {
            matches.push(item);
          }
        }

        return new Collection(matches);
      },

      /**
       * Slices the items within the collection.
       *
       * @method slice
       * @param {Number} index Index to slice at.
       * @param {Number} len Optional length to slice.
       * @return {tinymce.ui.Collection} Current collection.
       */
      slice: function () {
        return new Collection(slice.apply(this, arguments));
      },

      /**
       * Makes the current collection equal to the specified index.
       *
       * @method eq
       * @param {Number} index Index of the item to set the collection to.
       * @return {tinymce.ui.Collection} Current collection.
       */
      eq: function (index) {
        return index === -1 ? this.slice(index) : this.slice(index, +index + 1);
      },

      /**
       * Executes the specified callback on each item in collection.
       *
       * @method each
       * @param {function} callback Callback to execute for each item in collection.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      each: function (callback) {
        Tools.each(this, callback);

        return this;
      },

      /**
       * Returns an JavaScript array object of the contents inside the collection.
       *
       * @method toArray
       * @return {Array} Array with all items from collection.
       */
      toArray: function () {
        return Tools.toArray(this);
      },

      /**
       * Finds the index of the specified control or return -1 if it isn't in the collection.
       *
       * @method indexOf
       * @param {Control} ctrl Control instance to look for.
       * @return {Number} Index of the specified control or -1.
       */
      indexOf: function (ctrl) {
        var self = this, i = self.length;

        while (i--) {
          if (self[i] === ctrl) {
            break;
          }
        }

        return i;
      },

      /**
       * Returns a new collection of the contents in reverse order.
       *
       * @method reverse
       * @return {tinymce.ui.Collection} Collection instance with reversed items.
       */
      reverse: function () {
        return new Collection(Tools.toArray(this).reverse());
      },

      /**
       * Returns true/false if the class exists or not.
       *
       * @method hasClass
       * @param {String} cls Class to check for.
       * @return {Boolean} true/false state if the class exists or not.
       */
      hasClass: function (cls) {
        return this[0] ? this[0].classes.contains(cls) : false;
      },

      /**
       * Sets/gets the specific property on the items in the collection. The same as executing control.<property>(<value>);
       *
       * @method prop
       * @param {String} name Property name to get/set.
       * @param {Object} value Optional object value to set.
       * @return {tinymce.ui.Collection} Current collection instance or value of the first item on a get operation.
       */
      prop: function (name, value) {
        var self = this, undef, item;

        if (value !== undef) {
          self.each(function (item) {
            if (item[name]) {
              item[name](value);
            }
          });

          return self;
        }

        item = self[0];

        if (item && item[name]) {
          return item[name]();
        }
      },

      /**
       * Executes the specific function name with optional arguments an all items in collection if it exists.
       *
       * @example collection.exec("myMethod", arg1, arg2, arg3);
       * @method exec
       * @param {String} name Name of the function to execute.
       * @param {Object} ... Multiple arguments to pass to each function.
       * @return {tinymce.ui.Collection} Current collection.
       */
      exec: function (name) {
        var self = this, args = Tools.toArray(arguments).slice(1);

        self.each(function (item) {
          if (item[name]) {
            item[name].apply(item, args);
          }
        });

        return self;
      },

      /**
       * Remove all items from collection and DOM.
       *
       * @method remove
       * @return {tinymce.ui.Collection} Current collection.
       */
      remove: function () {
        var i = this.length;

        while (i--) {
          this[i].remove();
        }

        return this;
      },

      /**
       * Adds a class to all items in the collection.
       *
       * @method addClass
       * @param {String} cls Class to add to each item.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      addClass: function (cls) {
        return this.each(function (item) {
          item.classes.add(cls);
        });
      },

      /**
       * Removes the specified class from all items in collection.
       *
       * @method removeClass
       * @param {String} cls Class to remove from each item.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      removeClass: function (cls) {
        return this.each(function (item) {
          item.classes.remove(cls);
        });
      }

      /**
       * Fires the specified event by name and arguments on the control. This will execute all
       * bound event handlers.
       *
       * @method fire
       * @param {String} name Name of the event to fire.
       * @param {Object} args Optional arguments to pass to the event.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      // fire: function(event, args) {}, -- Generated by code below

      /**
       * Binds a callback to the specified event. This event can both be
       * native browser events like "click" or custom ones like PostRender.
       *
       * The callback function will have two parameters the first one being the control that received the event
       * the second one will be the event object either the browsers native event object or a custom JS object.
       *
       * @method on
       * @param {String} name Name of the event to bind. For example "click".
       * @param {String/function} callback Callback function to execute ones the event occurs.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      // on: function(name, callback) {}, -- Generated by code below

      /**
       * Unbinds the specified event and optionally a specific callback. If you omit the name
       * parameter all event handlers will be removed. If you omit the callback all event handles
       * by the specified name will be removed.
       *
       * @method off
       * @param {String} name Optional name for the event to unbind.
       * @param {function} callback Optional callback function to unbind.
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      // off: function(name, callback) {}, -- Generated by code below

      /**
       * Shows the items in the current collection.
       *
       * @method show
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      // show: function() {}, -- Generated by code below

      /**
       * Hides the items in the current collection.
       *
       * @method hide
       * @return {tinymce.ui.Collection} Current collection instance.
       */
      // hide: function() {}, -- Generated by code below

      /**
       * Sets/gets the text contents of the items in the current collection.
       *
       * @method text
       * @return {tinymce.ui.Collection} Current collection instance or text value of the first item on a get operation.
       */
      // text: function(value) {}, -- Generated by code below

      /**
       * Sets/gets the name contents of the items in the current collection.
       *
       * @method name
       * @return {tinymce.ui.Collection} Current collection instance or name value of the first item on a get operation.
       */
      // name: function(value) {}, -- Generated by code below

      /**
       * Sets/gets the disabled state on the items in the current collection.
       *
       * @method disabled
       * @return {tinymce.ui.Collection} Current collection instance or disabled state of the first item on a get operation.
       */
      // disabled: function(state) {}, -- Generated by code below

      /**
       * Sets/gets the active state on the items in the current collection.
       *
       * @method active
       * @return {tinymce.ui.Collection} Current collection instance or active state of the first item on a get operation.
       */
      // active: function(state) {}, -- Generated by code below

      /**
       * Sets/gets the selected state on the items in the current collection.
       *
       * @method selected
       * @return {tinymce.ui.Collection} Current collection instance or selected state of the first item on a get operation.
       */
      // selected: function(state) {}, -- Generated by code below

      /**
       * Sets/gets the selected state on the items in the current collection.
       *
       * @method visible
       * @return {tinymce.ui.Collection} Current collection instance or visible state of the first item on a get operation.
       */
      // visible: function(state) {}, -- Generated by code below
    };

    // Extend tinymce.ui.Collection prototype with some generated control specific methods
    Tools.each('fire on off show hide append prepend before after reflow'.split(' '), function (name) {
      proto[name] = function () {
        var args = Tools.toArray(arguments);

        this.each(function (ctrl) {
          if (name in ctrl) {
            ctrl[name].apply(ctrl, args);
          }
        });

        return this;
      };
    });

    // Extend tinymce.ui.Collection prototype with some property methods
    Tools.each('text name disabled active selected checked visible parent value data'.split(' '), function (name) {
      proto[name] = function (value) {
        return this.prop(name, value);
      };
    });

    // Create class based on the new prototype
    Collection = Class.extend(proto);

    // Stick Collection into Selector to prevent circual references
    Selector.Collection = Collection;

    return Collection;
  }
);
/**
 * DomUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Private UI DomUtils proxy.
 *
 * @private
 * @class tinymce.ui.DomUtils
 */
define(
  'tinymce.core.ui.DomUtils',
  [
    "tinymce.core.Env",
    "tinymce.core.util.Tools",
    "tinymce.core.dom.DOMUtils"
  ],
  function (Env, Tools, DOMUtils) {
    "use strict";

    var count = 0;

    var funcs = {
      id: function () {
        return 'mceu_' + (count++);
      },

      create: function (name, attrs, children) {
        var elm = document.createElement(name);

        DOMUtils.DOM.setAttribs(elm, attrs);

        if (typeof children === 'string') {
          elm.innerHTML = children;
        } else {
          Tools.each(children, function (child) {
            if (child.nodeType) {
              elm.appendChild(child);
            }
          });
        }

        return elm;
      },

      createFragment: function (html) {
        return DOMUtils.DOM.createFragment(html);
      },

      getWindowSize: function () {
        return DOMUtils.DOM.getViewPort();
      },

      getSize: function (elm) {
        var width, height;

        if (elm.getBoundingClientRect) {
          var rect = elm.getBoundingClientRect();

          width = Math.max(rect.width || (rect.right - rect.left), elm.offsetWidth);
          height = Math.max(rect.height || (rect.bottom - rect.bottom), elm.offsetHeight);
        } else {
          width = elm.offsetWidth;
          height = elm.offsetHeight;
        }

        return { width: width, height: height };
      },

      getPos: function (elm, root) {
        return DOMUtils.DOM.getPos(elm, root || funcs.getContainer());
      },

      getContainer: function () {
        return Env.container ? Env.container : document.body;
      },

      getViewPort: function (win) {
        return DOMUtils.DOM.getViewPort(win);
      },

      get: function (id) {
        return document.getElementById(id);
      },

      addClass: function (elm, cls) {
        return DOMUtils.DOM.addClass(elm, cls);
      },

      removeClass: function (elm, cls) {
        return DOMUtils.DOM.removeClass(elm, cls);
      },

      hasClass: function (elm, cls) {
        return DOMUtils.DOM.hasClass(elm, cls);
      },

      toggleClass: function (elm, cls, state) {
        return DOMUtils.DOM.toggleClass(elm, cls, state);
      },

      css: function (elm, name, value) {
        return DOMUtils.DOM.setStyle(elm, name, value);
      },

      getRuntimeStyle: function (elm, name) {
        return DOMUtils.DOM.getStyle(elm, name, true);
      },

      on: function (target, name, callback, scope) {
        return DOMUtils.DOM.bind(target, name, callback, scope);
      },

      off: function (target, name, callback) {
        return DOMUtils.DOM.unbind(target, name, callback);
      },

      fire: function (target, name, args) {
        return DOMUtils.DOM.fire(target, name, args);
      },

      innerHtml: function (elm, html) {
        // Workaround for <div> in <p> bug on IE 8 #6178
        DOMUtils.DOM.setHTML(elm, html);
      }
    };

    return funcs;
  }
);
/**
 * BoxUtils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Utility class for box parsing and measuring.
 *
 * @private
 * @class tinymce.ui.BoxUtils
 */
define(
  'tinymce.core.ui.BoxUtils',
  [
  ],
  function () {
    "use strict";

    return {
      /**
       * Parses the specified box value. A box value contains 1-4 properties in clockwise order.
       *
       * @method parseBox
       * @param {String/Number} value Box value "0 1 2 3" or "0" etc.
       * @return {Object} Object with top/right/bottom/left properties.
       * @private
       */
      parseBox: function (value) {
        var len, radix = 10;

        if (!value) {
          return;
        }

        if (typeof value === "number") {
          value = value || 0;

          return {
            top: value,
            left: value,
            bottom: value,
            right: value
          };
        }

        value = value.split(' ');
        len = value.length;

        if (len === 1) {
          value[1] = value[2] = value[3] = value[0];
        } else if (len === 2) {
          value[2] = value[0];
          value[3] = value[1];
        } else if (len === 3) {
          value[3] = value[1];
        }

        return {
          top: parseInt(value[0], radix) || 0,
          right: parseInt(value[1], radix) || 0,
          bottom: parseInt(value[2], radix) || 0,
          left: parseInt(value[3], radix) || 0
        };
      },

      measureBox: function (elm, prefix) {
        function getStyle(name) {
          var defaultView = document.defaultView;

          if (defaultView) {
            // Remove camelcase
            name = name.replace(/[A-Z]/g, function (a) {
              return '-' + a;
            });

            return defaultView.getComputedStyle(elm, null).getPropertyValue(name);
          }

          return elm.currentStyle[name];
        }

        function getSide(name) {
          var val = parseFloat(getStyle(name), 10);

          return isNaN(val) ? 0 : val;
        }

        return {
          top: getSide(prefix + "TopWidth"),
          right: getSide(prefix + "RightWidth"),
          bottom: getSide(prefix + "BottomWidth"),
          left: getSide(prefix + "LeftWidth")
        };
      }
    };
  }
);

/**
 * ClassList.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles adding and removal of classes.
 *
 * @private
 * @class tinymce.ui.ClassList
 */
define(
  'tinymce.core.ui.ClassList',
  [
    "tinymce.core.util.Tools"
  ],
  function (Tools) {
    "use strict";

    function noop() {
    }

    /**
     * Constructs a new class list the specified onchange
     * callback will be executed when the class list gets modifed.
     *
     * @constructor ClassList
     * @param {function} onchange Onchange callback to be executed.
     */
    function ClassList(onchange) {
      this.cls = [];
      this.cls._map = {};
      this.onchange = onchange || noop;
      this.prefix = '';
    }

    Tools.extend(ClassList.prototype, {
      /**
       * Adds a new class to the class list.
       *
       * @method add
       * @param {String} cls Class to be added.
       * @return {tinymce.ui.ClassList} Current class list instance.
       */
      add: function (cls) {
        if (cls && !this.contains(cls)) {
          this.cls._map[cls] = true;
          this.cls.push(cls);
          this._change();
        }

        return this;
      },

      /**
       * Removes the specified class from the class list.
       *
       * @method remove
       * @param {String} cls Class to be removed.
       * @return {tinymce.ui.ClassList} Current class list instance.
       */
      remove: function (cls) {
        if (this.contains(cls)) {
          for (var i = 0; i < this.cls.length; i++) {
            if (this.cls[i] === cls) {
              break;
            }
          }

          this.cls.splice(i, 1);
          delete this.cls._map[cls];
          this._change();
        }

        return this;
      },

      /**
       * Toggles a class in the class list.
       *
       * @method toggle
       * @param {String} cls Class to be added/removed.
       * @param {Boolean} state Optional state if it should be added/removed.
       * @return {tinymce.ui.ClassList} Current class list instance.
       */
      toggle: function (cls, state) {
        var curState = this.contains(cls);

        if (curState !== state) {
          if (curState) {
            this.remove(cls);
          } else {
            this.add(cls);
          }

          this._change();
        }

        return this;
      },

      /**
       * Returns true if the class list has the specified class.
       *
       * @method contains
       * @param {String} cls Class to look for.
       * @return {Boolean} true/false if the class exists or not.
       */
      contains: function (cls) {
        return !!this.cls._map[cls];
      },

      /**
       * Returns a space separated list of classes.
       *
       * @method toString
       * @return {String} Space separated list of classes.
       */

      _change: function () {
        delete this.clsValue;
        this.onchange.call(this);
      }
    });

    // IE 8 compatibility
    ClassList.prototype.toString = function () {
      var value;

      if (this.clsValue) {
        return this.clsValue;
      }

      value = '';
      for (var i = 0; i < this.cls.length; i++) {
        if (i > 0) {
          value += ' ';
        }

        value += this.prefix + this.cls[i];
      }

      return value;
    };

    return ClassList;
  }
);
/**
 * ReflowQueue.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class will automatically reflow controls on the next animation frame within a few milliseconds on older browsers.
 * If the user manually reflows then the automatic reflow will be cancelled. This class is used internally when various control states
 * changes that triggers a reflow.
 *
 * @class tinymce.ui.ReflowQueue
 * @static
 */
define(
  'tinymce.core.ui.ReflowQueue',
  [
    "tinymce.core.util.Delay"
  ],
  function (Delay) {
    var dirtyCtrls = {}, animationFrameRequested;

    return {
      /**
       * Adds a control to the next automatic reflow call. This is the control that had a state
       * change for example if the control was hidden/shown.
       *
       * @method add
       * @param {tinymce.ui.Control} ctrl Control to add to queue.
       */
      add: function (ctrl) {
        var parent = ctrl.parent();

        if (parent) {
          if (!parent._layout || parent._layout.isNative()) {
            return;
          }

          if (!dirtyCtrls[parent._id]) {
            dirtyCtrls[parent._id] = parent;
          }

          if (!animationFrameRequested) {
            animationFrameRequested = true;

            Delay.requestAnimationFrame(function () {
              var id, ctrl;

              animationFrameRequested = false;

              for (id in dirtyCtrls) {
                ctrl = dirtyCtrls[id];

                if (ctrl.state.get('rendered')) {
                  ctrl.reflow();
                }
              }

              dirtyCtrls = {};
            }, document.body);
          }
        }
      },

      /**
       * Removes the specified control from the automatic reflow. This will happen when for example the user
       * manually triggers a reflow.
       *
       * @method remove
       * @param {tinymce.ui.Control} ctrl Control to remove from queue.
       */
      remove: function (ctrl) {
        if (dirtyCtrls[ctrl._id]) {
          delete dirtyCtrls[ctrl._id];
        }
      }
    };
  }
);

/**
 * Control.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*eslint consistent-this:0 */

/**
 * This is the base class for all controls and containers. All UI control instances inherit
 * from this one as it has the base logic needed by all of them.
 *
 * @class tinymce.ui.Control
 */
define(
  'tinymce.core.ui.Control',
  [
    "tinymce.core.util.Class",
    "tinymce.core.util.Tools",
    "tinymce.core.util.EventDispatcher",
    "tinymce.core.data.ObservableObject",
    "tinymce.core.ui.Collection",
    "tinymce.core.ui.DomUtils",
    "tinymce.core.dom.DomQuery",
    "tinymce.core.ui.BoxUtils",
    "tinymce.core.ui.ClassList",
    "tinymce.core.ui.ReflowQueue"
  ],
  function (Class, Tools, EventDispatcher, ObservableObject, Collection, DomUtils, $, BoxUtils, ClassList, ReflowQueue) {
    "use strict";

    var hasMouseWheelEventSupport = "onmousewheel" in document;
    var hasWheelEventSupport = false;
    var classPrefix = "mce-";
    var Control, idCounter = 0;

    var proto = {
      Statics: {
        classPrefix: classPrefix
      },

      isRtl: function () {
        return Control.rtl;
      },

      /**
       * Class/id prefix to use for all controls.
       *
       * @final
       * @field {String} classPrefix
       */
      classPrefix: classPrefix,

      /**
       * Constructs a new control instance with the specified settings.
       *
       * @constructor
       * @param {Object} settings Name/value object with settings.
       * @setting {String} style Style CSS properties to add.
       * @setting {String} border Border box values example: 1 1 1 1
       * @setting {String} padding Padding box values example: 1 1 1 1
       * @setting {String} margin Margin box values example: 1 1 1 1
       * @setting {Number} minWidth Minimal width for the control.
       * @setting {Number} minHeight Minimal height for the control.
       * @setting {String} classes Space separated list of classes to add.
       * @setting {String} role WAI-ARIA role to use for control.
       * @setting {Boolean} hidden Is the control hidden by default.
       * @setting {Boolean} disabled Is the control disabled by default.
       * @setting {String} name Name of the control instance.
       */
      init: function (settings) {
        var self = this, classes, defaultClasses;

        function applyClasses(classes) {
          var i;

          classes = classes.split(' ');
          for (i = 0; i < classes.length; i++) {
            self.classes.add(classes[i]);
          }
        }

        self.settings = settings = Tools.extend({}, self.Defaults, settings);

        // Initial states
        self._id = settings.id || ('mceu_' + (idCounter++));
        self._aria = { role: settings.role };
        self._elmCache = {};
        self.$ = $;

        self.state = new ObservableObject({
          visible: true,
          active: false,
          disabled: false,
          value: ''
        });

        self.data = new ObservableObject(settings.data);

        self.classes = new ClassList(function () {
          if (self.state.get('rendered')) {
            self.getEl().className = this.toString();
          }
        });
        self.classes.prefix = self.classPrefix;

        // Setup classes
        classes = settings.classes;
        if (classes) {
          if (self.Defaults) {
            defaultClasses = self.Defaults.classes;

            if (defaultClasses && classes != defaultClasses) {
              applyClasses(defaultClasses);
            }
          }

          applyClasses(classes);
        }

        Tools.each('title text name visible disabled active value'.split(' '), function (name) {
          if (name in settings) {
            self[name](settings[name]);
          }
        });

        self.on('click', function () {
          if (self.disabled()) {
            return false;
          }
        });

        /**
         * Name/value object with settings for the current control.
         *
         * @field {Object} settings
         */
        self.settings = settings;

        self.borderBox = BoxUtils.parseBox(settings.border);
        self.paddingBox = BoxUtils.parseBox(settings.padding);
        self.marginBox = BoxUtils.parseBox(settings.margin);

        if (settings.hidden) {
          self.hide();
        }
      },

      // Will generate getter/setter methods for these properties
      Properties: 'parent,name',

      /**
       * Returns the root element to render controls into.
       *
       * @method getContainerElm
       * @return {Element} HTML DOM element to render into.
       */
      getContainerElm: function () {
        return DomUtils.getContainer();
      },

      /**
       * Returns a control instance for the current DOM element.
       *
       * @method getParentCtrl
       * @param {Element} elm HTML dom element to get parent control from.
       * @return {tinymce.ui.Control} Control instance or undefined.
       */
      getParentCtrl: function (elm) {
        var ctrl, lookup = this.getRoot().controlIdLookup;

        while (elm && lookup) {
          ctrl = lookup[elm.id];
          if (ctrl) {
            break;
          }

          elm = elm.parentNode;
        }

        return ctrl;
      },

      /**
       * Initializes the current controls layout rect.
       * This will be executed by the layout managers to determine the
       * default minWidth/minHeight etc.
       *
       * @method initLayoutRect
       * @return {Object} Layout rect instance.
       */
      initLayoutRect: function () {
        var self = this, settings = self.settings, borderBox, layoutRect;
        var elm = self.getEl(), width, height, minWidth, minHeight, autoResize;
        var startMinWidth, startMinHeight, initialSize;

        // Measure the current element
        borderBox = self.borderBox = self.borderBox || BoxUtils.measureBox(elm, 'border');
        self.paddingBox = self.paddingBox || BoxUtils.measureBox(elm, 'padding');
        self.marginBox = self.marginBox || BoxUtils.measureBox(elm, 'margin');
        initialSize = DomUtils.getSize(elm);

        // Setup minWidth/minHeight and width/height
        startMinWidth = settings.minWidth;
        startMinHeight = settings.minHeight;
        minWidth = startMinWidth || initialSize.width;
        minHeight = startMinHeight || initialSize.height;
        width = settings.width;
        height = settings.height;
        autoResize = settings.autoResize;
        autoResize = typeof autoResize != "undefined" ? autoResize : !width && !height;

        width = width || minWidth;
        height = height || minHeight;

        var deltaW = borderBox.left + borderBox.right;
        var deltaH = borderBox.top + borderBox.bottom;

        var maxW = settings.maxWidth || 0xFFFF;
        var maxH = settings.maxHeight || 0xFFFF;

        // Setup initial layout rect
        self._layoutRect = layoutRect = {
          x: settings.x || 0,
          y: settings.y || 0,
          w: width,
          h: height,
          deltaW: deltaW,
          deltaH: deltaH,
          contentW: width - deltaW,
          contentH: height - deltaH,
          innerW: width - deltaW,
          innerH: height - deltaH,
          startMinWidth: startMinWidth || 0,
          startMinHeight: startMinHeight || 0,
          minW: Math.min(minWidth, maxW),
          minH: Math.min(minHeight, maxH),
          maxW: maxW,
          maxH: maxH,
          autoResize: autoResize,
          scrollW: 0
        };

        self._lastLayoutRect = {};

        return layoutRect;
      },

      /**
       * Getter/setter for the current layout rect.
       *
       * @method layoutRect
       * @param {Object} [newRect] Optional new layout rect.
       * @return {tinymce.ui.Control/Object} Current control or rect object.
       */
      layoutRect: function (newRect) {
        var self = this, curRect = self._layoutRect, lastLayoutRect, size, deltaWidth, deltaHeight, undef, repaintControls;

        // Initialize default layout rect
        if (!curRect) {
          curRect = self.initLayoutRect();
        }

        // Set new rect values
        if (newRect) {
          // Calc deltas between inner and outer sizes
          deltaWidth = curRect.deltaW;
          deltaHeight = curRect.deltaH;

          // Set x position
          if (newRect.x !== undef) {
            curRect.x = newRect.x;
          }

          // Set y position
          if (newRect.y !== undef) {
            curRect.y = newRect.y;
          }

          // Set minW
          if (newRect.minW !== undef) {
            curRect.minW = newRect.minW;
          }

          // Set minH
          if (newRect.minH !== undef) {
            curRect.minH = newRect.minH;
          }

          // Set new width and calculate inner width
          size = newRect.w;
          if (size !== undef) {
            size = size < curRect.minW ? curRect.minW : size;
            size = size > curRect.maxW ? curRect.maxW : size;
            curRect.w = size;
            curRect.innerW = size - deltaWidth;
          }

          // Set new height and calculate inner height
          size = newRect.h;
          if (size !== undef) {
            size = size < curRect.minH ? curRect.minH : size;
            size = size > curRect.maxH ? curRect.maxH : size;
            curRect.h = size;
            curRect.innerH = size - deltaHeight;
          }

          // Set new inner width and calculate width
          size = newRect.innerW;
          if (size !== undef) {
            size = size < curRect.minW - deltaWidth ? curRect.minW - deltaWidth : size;
            size = size > curRect.maxW - deltaWidth ? curRect.maxW - deltaWidth : size;
            curRect.innerW = size;
            curRect.w = size + deltaWidth;
          }

          // Set new height and calculate inner height
          size = newRect.innerH;
          if (size !== undef) {
            size = size < curRect.minH - deltaHeight ? curRect.minH - deltaHeight : size;
            size = size > curRect.maxH - deltaHeight ? curRect.maxH - deltaHeight : size;
            curRect.innerH = size;
            curRect.h = size + deltaHeight;
          }

          // Set new contentW
          if (newRect.contentW !== undef) {
            curRect.contentW = newRect.contentW;
          }

          // Set new contentH
          if (newRect.contentH !== undef) {
            curRect.contentH = newRect.contentH;
          }

          // Compare last layout rect with the current one to see if we need to repaint or not
          lastLayoutRect = self._lastLayoutRect;
          if (lastLayoutRect.x !== curRect.x || lastLayoutRect.y !== curRect.y ||
            lastLayoutRect.w !== curRect.w || lastLayoutRect.h !== curRect.h) {
            repaintControls = Control.repaintControls;

            if (repaintControls) {
              if (repaintControls.map && !repaintControls.map[self._id]) {
                repaintControls.push(self);
                repaintControls.map[self._id] = true;
              }
            }

            lastLayoutRect.x = curRect.x;
            lastLayoutRect.y = curRect.y;
            lastLayoutRect.w = curRect.w;
            lastLayoutRect.h = curRect.h;
          }

          return self;
        }

        return curRect;
      },

      /**
       * Repaints the control after a layout operation.
       *
       * @method repaint
       */
      repaint: function () {
        var self = this, style, bodyStyle, bodyElm, rect, borderBox;
        var borderW, borderH, lastRepaintRect, round, value;

        // Use Math.round on all values on IE < 9
        round = !document.createRange ? Math.round : function (value) {
          return value;
        };

        style = self.getEl().style;
        rect = self._layoutRect;
        lastRepaintRect = self._lastRepaintRect || {};

        borderBox = self.borderBox;
        borderW = borderBox.left + borderBox.right;
        borderH = borderBox.top + borderBox.bottom;

        if (rect.x !== lastRepaintRect.x) {
          style.left = round(rect.x) + 'px';
          lastRepaintRect.x = rect.x;
        }

        if (rect.y !== lastRepaintRect.y) {
          style.top = round(rect.y) + 'px';
          lastRepaintRect.y = rect.y;
        }

        if (rect.w !== lastRepaintRect.w) {
          value = round(rect.w - borderW);
          style.width = (value >= 0 ? value : 0) + 'px';
          lastRepaintRect.w = rect.w;
        }

        if (rect.h !== lastRepaintRect.h) {
          value = round(rect.h - borderH);
          style.height = (value >= 0 ? value : 0) + 'px';
          lastRepaintRect.h = rect.h;
        }

        // Update body if needed
        if (self._hasBody && rect.innerW !== lastRepaintRect.innerW) {
          value = round(rect.innerW);

          bodyElm = self.getEl('body');
          if (bodyElm) {
            bodyStyle = bodyElm.style;
            bodyStyle.width = (value >= 0 ? value : 0) + 'px';
          }

          lastRepaintRect.innerW = rect.innerW;
        }

        if (self._hasBody && rect.innerH !== lastRepaintRect.innerH) {
          value = round(rect.innerH);

          bodyElm = bodyElm || self.getEl('body');
          if (bodyElm) {
            bodyStyle = bodyStyle || bodyElm.style;
            bodyStyle.height = (value >= 0 ? value : 0) + 'px';
          }

          lastRepaintRect.innerH = rect.innerH;
        }

        self._lastRepaintRect = lastRepaintRect;
        self.fire('repaint', {}, false);
      },

      /**
       * Updates the controls layout rect by re-measuing it.
       */
      updateLayoutRect: function () {
        var self = this;

        self.parent()._lastRect = null;

        DomUtils.css(self.getEl(), { width: '', height: '' });

        self._layoutRect = self._lastRepaintRect = self._lastLayoutRect = null;
        self.initLayoutRect();
      },

      /**
       * Binds a callback to the specified event. This event can both be
       * native browser events like "click" or custom ones like PostRender.
       *
       * The callback function will be passed a DOM event like object that enables yout do stop propagation.
       *
       * @method on
       * @param {String} name Name of the event to bind. For example "click".
       * @param {String/function} callback Callback function to execute ones the event occurs.
       * @return {tinymce.ui.Control} Current control object.
       */
      on: function (name, callback) {
        var self = this;

        function resolveCallbackName(name) {
          var callback, scope;

          if (typeof name != 'string') {
            return name;
          }

          return function (e) {
            if (!callback) {
              self.parentsAndSelf().each(function (ctrl) {
                var callbacks = ctrl.settings.callbacks;

                if (callbacks && (callback = callbacks[name])) {
                  scope = ctrl;
                  return false;
                }
              });
            }

            if (!callback) {
              e.action = name;
              this.fire('execute', e);
              return;
            }

            return callback.call(scope, e);
          };
        }

        getEventDispatcher(self).on(name, resolveCallbackName(callback));

        return self;
      },

      /**
       * Unbinds the specified event and optionally a specific callback. If you omit the name
       * parameter all event handlers will be removed. If you omit the callback all event handles
       * by the specified name will be removed.
       *
       * @method off
       * @param {String} [name] Name for the event to unbind.
       * @param {function} [callback] Callback function to unbind.
       * @return {tinymce.ui.Control} Current control object.
       */
      off: function (name, callback) {
        getEventDispatcher(this).off(name, callback);
        return this;
      },

      /**
       * Fires the specified event by name and arguments on the control. This will execute all
       * bound event handlers.
       *
       * @method fire
       * @param {String} name Name of the event to fire.
       * @param {Object} [args] Arguments to pass to the event.
       * @param {Boolean} [bubble] Value to control bubbling. Defaults to true.
       * @return {Object} Current arguments object.
       */
      fire: function (name, args, bubble) {
        var self = this;

        args = args || {};

        if (!args.control) {
          args.control = self;
        }

        args = getEventDispatcher(self).fire(name, args);

        // Bubble event up to parents
        if (bubble !== false && self.parent) {
          var parent = self.parent();
          while (parent && !args.isPropagationStopped()) {
            parent.fire(name, args, false);
            parent = parent.parent();
          }
        }

        return args;
      },

      /**
       * Returns true/false if the specified event has any listeners.
       *
       * @method hasEventListeners
       * @param {String} name Name of the event to check for.
       * @return {Boolean} True/false state if the event has listeners.
       */
      hasEventListeners: function (name) {
        return getEventDispatcher(this).has(name);
      },

      /**
       * Returns a control collection with all parent controls.
       *
       * @method parents
       * @param {String} selector Optional selector expression to find parents.
       * @return {tinymce.ui.Collection} Collection with all parent controls.
       */
      parents: function (selector) {
        var self = this, ctrl, parents = new Collection();

        // Add each parent to collection
        for (ctrl = self.parent(); ctrl; ctrl = ctrl.parent()) {
          parents.add(ctrl);
        }

        // Filter away everything that doesn't match the selector
        if (selector) {
          parents = parents.filter(selector);
        }

        return parents;
      },

      /**
       * Returns the current control and it's parents.
       *
       * @method parentsAndSelf
       * @param {String} selector Optional selector expression to find parents.
       * @return {tinymce.ui.Collection} Collection with all parent controls.
       */
      parentsAndSelf: function (selector) {
        return new Collection(this).add(this.parents(selector));
      },

      /**
       * Returns the control next to the current control.
       *
       * @method next
       * @return {tinymce.ui.Control} Next control instance.
       */
      next: function () {
        var parentControls = this.parent().items();

        return parentControls[parentControls.indexOf(this) + 1];
      },

      /**
       * Returns the control previous to the current control.
       *
       * @method prev
       * @return {tinymce.ui.Control} Previous control instance.
       */
      prev: function () {
        var parentControls = this.parent().items();

        return parentControls[parentControls.indexOf(this) - 1];
      },

      /**
       * Sets the inner HTML of the control element.
       *
       * @method innerHtml
       * @param {String} html Html string to set as inner html.
       * @return {tinymce.ui.Control} Current control object.
       */
      innerHtml: function (html) {
        this.$el.html(html);
        return this;
      },

      /**
       * Returns the control DOM element or sub element.
       *
       * @method getEl
       * @param {String} [suffix] Suffix to get element by.
       * @return {Element} HTML DOM element for the current control or it's children.
       */
      getEl: function (suffix) {
        var id = suffix ? this._id + '-' + suffix : this._id;

        if (!this._elmCache[id]) {
          this._elmCache[id] = $('#' + id)[0];
        }

        return this._elmCache[id];
      },

      /**
       * Sets the visible state to true.
       *
       * @method show
       * @return {tinymce.ui.Control} Current control instance.
       */
      show: function () {
        return this.visible(true);
      },

      /**
       * Sets the visible state to false.
       *
       * @method hide
       * @return {tinymce.ui.Control} Current control instance.
       */
      hide: function () {
      },



