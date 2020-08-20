/*globals jQuery, define, module, exports, require, window, document, postMessage */
(function (factory) {
	"use strict";
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	}
	else if(typeof module !== 'undefined' && module.exports) {
		module.exports = factory(require('jquery'));
	}
	else {
		factory(jQuery);
	}
}(function ($, undefined) {
	"use strict";
/*!
 * jsTree 3.3.8
 * http://jstree.com/
 *
 * Copyright (c) 2014 Ivan Bozhanov (http://vakata.com)
 *
 * Licensed same as jquery - under the terms of the MIT License
 *   http://www.opensource.org/licenses/mit-license.php
 */
/*!
 * if using jslint please allow for the jQuery global and use following options:
 * jslint: loopfunc: true, browser: true, ass: true, bitwise: true, continue: true, nomen: true, plusplus: true, regexp: true, unparam: true, todo: true, white: true
 */
/*jshint -W083 */

	// prevent another load? maybe there is a better way?
	if($.jstree) {
		return;
	}

	/**
	 * ### jsTree core functionality
	 */

	// internal variables
	var instance_counter = 0,
		ccp_node = false,
		ccp_mode = false,
		ccp_inst = false,
		themes_loaded = [],
		src = $('script:last').attr('src'),
		document = window.document; // local variable is always faster to access then a global

	/**
	 * holds all jstree related functions and variables, including the actual class and methods to create, access and manipulate instances.
	 * @name $.jstree
	 */
	$.jstree = {
		/**
		 * specifies the jstree version in use
		 * @name $.jstree.version
		 */
		version : '3.3.8',
		/**
		 * holds all the default options used when creating new instances
		 * @name $.jstree.defaults
		 */
		defaults : {
			/**
			 * configure which plugins will be active on an instance. Should be an array of strings, where each element is a plugin name. The default is `[]`
			 * @name $.jstree.defaults.plugins
			 */
			plugins : []
		},
		/**
		 * stores all loaded jstree plugins (used internally)
		 * @name $.jstree.plugins
		 */
		plugins : {},
		path : src && src.indexOf('/') !== -1 ? src.replace(/\/[^\/]+$/,'') : '',
		idregex : /[\\:&!^|()\[\]<>@*'+~#";.,=\- \/${}%?`]/g,
		root : '#'
	};
	
	/**
	 * creates a jstree instance
	 * @name $.jstree.create(el [, options])
	 * @param {DOMElement|jQuery|String} el the element to create the instance on, can be jQuery extended or a selector
	 * @param {Object} options options for this instance (extends `$.jstree.defaults`)
	 * @return {jsTree} the new instance
	 */
	$.jstree.create = function (el, options) {
		var tmp = new $.jstree.core(++instance_counter),
			opt = options;
		options = $.extend(true, {}, $.jstree.defaults, options);
		if(opt && opt.plugins) {
			options.plugins = opt.plugins;
		}
		$.each(options.plugins, function (i, k) {
			if(i !== 'core') {
				tmp = tmp.plugin(k, options[k]);
			}
		});
		$(el).data('jstree', tmp);
		tmp.init(el, options);
		return tmp;
	};
	/**
	 * remove all traces of jstree from the DOM and destroy all instances
	 * @name $.jstree.destroy()
	 */
	$.jstree.destroy = function () {
		$('.jstree:jstree').jstree('destroy');
		$(document).off('.jstree');
	};
	/**
	 * the jstree class constructor, used only internally
	 * @private
	 * @name $.jstree.core(id)
	 * @param {Number} id this instance's index
	 */
	$.jstree.core = function (id) {
		this._id = id;
		this._cnt = 0;
		this._wrk = null;
		this._data = {
			core : {
				themes : {
					name : false,
					dots : false,
					icons : false,
					ellipsis : false
				},
				selected : [],
				last_error : {},
				working : false,
				worker_queue : [],
				focused : null
			}
		};
	};
	/**
	 * get a reference to an existing instance
	 *
	 * __Examples__
	 *
	 *	// provided a container with an ID of "tree", and a nested node with an ID of "branch"
	 *	// all of there will return the same instance
	 *	$.jstree.reference('tree');
	 *	$.jstree.reference('#tree');
	 *	$.jstree.reference($('#tree'));
	 *	$.jstree.reference(document.getElementByID('tree'));
	 *	$.jstree.reference('branch');
	 *	$.jstree.reference('#branch');
	 *	$.jstree.reference($('#branch'));
	 *	$.jstree.reference(document.getElementByID('branch'));
	 *
	 * @name $.jstree.reference(needle)
	 * @param {DOMElement|jQuery|String} needle
	 * @return {jsTree|null} the instance or `null` if not found
	 */
	$.jstree.reference = function (needle) {
		var tmp = null,
			obj = null;
		if(needle && needle.id && (!needle.tagName || !needle.nodeType)) { needle = needle.id; }

		if(!obj || !obj.length) {
			try { obj = $(needle); } catch (ignore) { }
		}
		if(!obj || !obj.length) {
			try { obj = $('#' + needle.replace($.jstree.idregex,'\\$&')); } catch (ignore) { }
		}
		if(obj && obj.length && (obj = obj.closest('.jstree')).length && (obj = obj.data('jstree'))) {
			tmp = obj;
		}
		else {
			$('.jstree').each(function () {
				var inst = $(this).data('jstree');
				if(inst && inst._model.data[needle]) {
					tmp = inst;
					return false;
				}
			});
		}
		return tmp;
	};
	/**
	 * Create an instance, get an instance or invoke a command on a instance.
	 *
	 * If there is no instance associated with the current node a new one is created and `arg` is used to extend `$.jstree.defaults` for this new instance. There would be no return value (chaining is not broken).
	 *
	 * If there is an existing instance and `arg` is a string the command specified by `arg` is executed on the instance, with any additional arguments passed to the function. If the function returns a value it will be returned (chaining could break depending on function).
	 *
	 * If there is an existing instance and `arg` is not a string the instance itself is returned (similar to `$.jstree.reference`).
	 *
	 * In any other case - nothing is returned and chaining is not broken.
	 *
	 * __Examples__
	 *
	 *	$('#tree1').jstree(); // creates an instance
	 *	$('#tree2').jstree({ plugins : [] }); // create an instance with some options
	 *	$('#tree1').jstree('open_node', '#branch_1'); // call a method on an existing instance, passing additional arguments
	 *	$('#tree2').jstree(); // get an existing instance (or create an instance)
	 *	$('#tree2').jstree(true); // get an existing instance (will not create new instance)
	 *	$('#branch_1').jstree().select_node('#branch_1'); // get an instance (using a nested element and call a method)
	 *
	 * @name $().jstree([arg])
	 * @param {String|Object} arg
	 * @return {Mixed}
	 */
	$.fn.jstree = function (arg) {
		// check for string argument
		var is_method	= (typeof arg === 'string'),
			args		= Array.prototype.slice.call(arguments, 1),
			result		= null;
		if(arg === true && !this.length) { return false; }
		this.each(function () {
			// get the instance (if there is one) and method (if it exists)
			var instance = $.jstree.reference(this),
				method = is_method && instance ? instance[arg] : null;
			// if calling a method, and method is available - execute on the instance
			result = is_method && method ?
				method.apply(instance, args) :
				null;
			// if there is no instance and no method is being called - create one
			if(!instance && !is_method && (arg === undefined || $.isPlainObject(arg))) {
				$.jstree.create(this, arg);
			}
			// if there is an instance and no method is called - return the instance
			if( (instance && !is_method) || arg === true ) {
				result = instance || false;
			}
			// if there was a method call which returned a result - break and return the value
			if(result !== null && result !== undefined) {
				return false;
			}
		});
		// if there was a method call with a valid return value - return that, otherwise continue the chain
		return result !== null && result !== undefined ?
			result : this;
	};
	/**
	 * used to find elements containing an instance
	 *
	 * __Examples__
	 *
	 *	$('div:jstree').each(function () {
	 *		$(this).jstree('destroy');
	 *	});
	 *
	 * @name $(':jstree')
	 * @return {jQuery}
	 */
	$.expr.pseudos.jstree = $.expr.createPseudo(function(search) {
		return function(a) {
			return $(a).hasClass('jstree') &&
				$(a).data('jstree') !== undefined;
		};
	});

	/**
	 * stores all defaults for the core
	 * @name $.jstree.defaults.core
	 */
	$.jstree.defaults.core = {
		/**
		 * data configuration
		 *
		 * If left as `false` the HTML inside the jstree container element is used to populate the tree (that should be an unordered list with list items).
		 *
		 * You can also pass in a HTML string or a JSON array here.
		 *
		 * It is possible to pass in a standard jQuery-like AJAX config and jstree will automatically determine if the response is JSON or HTML and use that to populate the tree.
		 * In addition to the standard jQuery ajax options here you can suppy functions for `data` and `url`, the functions will be run in the current instance's scope and a param will be passed indicating which node is being loaded, the return value of those functions will be used.
		 *
		 * The last option is to specify a function, that function will receive the node being loaded as argument and a second param which is a function which should be called with the result.
		 *
		 * __Examples__
		 *
		 *	// AJAX
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : {
		 *				'url' : '/get/children/',
		 *				'data' : function (node) {
		 *					return { 'id' : node.id };
		 *				}
		 *			}
		 *		});
		 *
		 *	// direct data
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : [
		 *				'Simple root node',
		 *				{
		 *					'id' : 'node_2',
		 *					'text' : 'Root node with options',
		 *					'state' : { 'opened' : true, 'selected' : true },
		 *					'children' : [ { 'text' : 'Child 1' }, 'Child 2']
		 *				}
		 *			]
		 *		}
		 *	});
		 *
		 *	// function
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'data' : function (obj, callback) {
		 *				callback.call(this, ['Root 1', 'Root 2']);
		 *			}
		 *		});
		 *
		 * @name $.jstree.defaults.core.data
		 */
		data			: false,
		/**
		 * configure the various strings used throughout the tree
		 *
		 * You can use an object where the key is the string you need to replace and the value is your replacement.
		 * Another option is to specify a function which will be called with an argument of the needed string and should return the replacement.
		 * If left as `false` no replacement is made.
		 *
		 * __Examples__
		 *
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'strings' : {
		 *				'Loading ...' : 'Please wait ...'
		 *			}
		 *		}
		 *	});
		 *
		 * @name $.jstree.defaults.core.strings
		 */
		strings			: false,
		/**
		 * determines what happens when a user tries to modify the structure of the tree
		 * If left as `false` all operations like create, rename, delete, move or copy are prevented.
		 * You can set this to `true` to allow all interactions or use a function to have better control.
		 *
		 * __Examples__
		 *
		 *	$('#tree').jstree({
		 *		'core' : {
		 *			'check_callback' : function (operation, node, node_parent, node_position, more) {
		 *				// operation can be 'create_node', 'rename_node', 'delete_node', 'move_node', 'copy_node' or 'edit'
		 *				// in case of 'rename_node' node_position is filled with the new node name
		 *				return operation === 'rename_node' ? true : false;
		 *			}
		 *		}
		 *	});
		 *
		 * @name $.jstree.defaults.core.check_callback
		 */
		check_callback	: false,
		/**
		 * a callback called with a single object parameter in the instance's scope when something goes wrong (operation prevented, ajax failed, etc)
		 * @name $.jstree.defaults.core.error
		 */
		error			: $.noop,
		/**
		 * the open / close animation duration in milliseconds - set this to `false` to disable the animation (default is `200`)
		 * @name $.jstree.defaults.core.animation
		 */
		animation		: 200,
		/**
		 * a boolean indicating if multiple nodes can be selected
		 * @name $.jstree.defaults.core.multiple
		 */
		multiple		: true,
		/**
		 * theme configuration object
		 * @name $.jstree.defaults.core.themes
		 */
		themes			: {
			/**
			 * the name of the theme to use (if left as `false` the default theme is used)
			 * @name $.jstree.defaults.core.themes.name
			 */
			name			: false,
			/**
			 * the URL of the theme's CSS file, leave this as `false` if you have manually included the theme CSS (recommended). You can set this to `true` too which will try to autoload the theme.
			 * @name $.jstree.defaults.core.themes.url
			 */
			url				: false,
			/**
			 * the location of all jstree themes - only used if `url` is set to `true`
			 * @name $.jstree.defaults.core.themes.dir
			 */
			dir				: false,
			/**
			 * a boolean indicating if connecting dots are shown
			 * @name $.jstree.defaults.core.themes.dots
			 */
			dots			: true,
			/**
			 * a boolean indicating if node icons are shown
			 * @name $.jstree.defaults.core.themes.icons
			 */
			icons			: true,
			/**
			 * a boolean indicating if node ellipsis should be shown - this only works with a fixed with on the container
			 * @name $.jstree.defaults.core.themes.ellipsis
			 */
			ellipsis		: false,
			/**
			 * a boolean indicating if the tree background is striped
			 * @name $.jstree.defaults.core.themes.stripes
			 */
			stripes			: false,
			/**
			 * a string (or boolean `false`) specifying the theme variant to use (if the theme supports variants)
			 * @name $.jstree.defaults.core.themes.variant
			 */
			variant			: false,
			/**
			 * a boolean specifying if a reponsive version of the theme should kick in on smaller screens (if the theme supports it). Defaults to `false`.
			 * @name $.jstree.defaults.core.themes.responsive
			 */
			responsive		: false
		},
		/**
		 * if left as `true` all parents of all selected nodes will be opened once the tree loads (so that all selected nodes are visible to the user)
		 * @name $.jstree.defaults.core.expand_selected_onload
		 */
		expand_selected_onload : true,
		/**
		 * if left as `true` web workers will be used to parse incoming JSON data where possible, so that the UI will not be blocked by large requests. Workers are however about 30% slower. Defaults to `true`
		 * @name $.jstree.defaults.core.worker
		 */
		worker : true,
		/**
		 * Force node text to plain text (and escape HTML). Defaults to `false`
		 * @name $.jstree.defaults.core.force_text
		 */
		force_text : false,
		/**
		 * Should the node be toggled if the text is double clicked. Defaults to `true`
		 * @name $.jstree.defaults.core.dblclick_toggle
		 */
		dblclick_toggle : true,
		/**
		 * Should the loaded nodes be part of the state. Defaults to `false`
		 * @name $.jstree.defaults.core.loaded_state
		 */
		loaded_state : false,
		/**
		 * Should the last active node be focused when the tree container is blurred and the focused again. This helps working with screen readers. Defaults to `true`
		 * @name $.jstree.defaults.core.restore_focus
		 */
		restore_focus : true,
		/**
		 * Default keyboard shortcuts (an object where each key is the button name or combo - like 'enter', 'ctrl-space', 'p', etc and the value is the function to execute in the instance's scope)
		 * @name $.jstree.defaults.core.keyboard
		 */
		keyboard : {
			'ctrl-space': function (e) {
				// aria defines space only with Ctrl
				e.type = "click";
				$(e.currentTarget).trigger(e);
			},
			'enter': function (e) {
				// enter
				e.type = "click";
				$(e.currentTarget).trigger(e);
			},
			'left': function (e) {
				// left
				e.preventDefault();
				if(this.is_open(e.currentTarget)) {
					this.close_node(e.currentTarget);
				}
				else {
					var o = this.get_parent(e.currentTarget);
					if(o && o.id !== $.jstree.root) { this.get_node(o, true).children('.jstree-anchor').focus(); }
				}
			},
			'up': function (e) {
				// up
				e.preventDefault();
				var o = this.get_prev_dom(e.currentTarget);
				if(o && o.length) { o.children('.jstree-anchor').focus(); }
			},
			'right': function (e) {
				// right
				e.preventDefault();
				if(this.is_closed(e.currentTarget)) {
					this.open_node(e.currentTarget, function (o) { this.get_node(o, true).children('.jstree-anchor').focus(); });
				}
				else if (this.is_open(e.currentTarget)) {
					var o = this.get_node(e.currentTarget, true).children('.jstree-children')[0];
					if(o) { $(this._firstChild(o)).children('.jstree-anchor').focus(); }
				}
			},
			'down': function (e) {
				// down
				e.preventDefault();
				var o = this.get_next_dom(e.currentTarget);
				if(o && o.length) { o.children('.jstree-anchor').focus(); }
			},
			'*': function (e) {
				// aria defines * on numpad as open_all - not very common
				this.open_all();
			},
			'home': function (e) {
				// home
				e.preventDefault();
				var o = this._firstChild(this.get_container_ul()[0]);
				if(o) { $(o).children('.jstree-anchor').filter(':visible').focus(); }
			},
			'end': function (e) {
				// end
				e.preventDefault();
				this.element.find('.jstree-anchor').filter(':visible').last().focus();
			},
			'f2': function (e) {
				// f2 - safe to include - if check_callback is false it will fail
				e.preventDefault();
				this.edit(e.currentTarget);
			}
		}
	};
	$.jstree.core.prototype = {
		/**
		 * used to decorate an instance with a plugin. Used internally.
		 * @private
		 * @name plugin(deco [, opts])
		 * @param  {String} deco the plugin to decorate with
		 * @param  {Object} opts options for the plugin
		 * @return {jsTree}
		 */
		plugin : function (deco, opts) {
			var Child = $.jstree.plugins[deco];
			if(Child) {
				this._data[deco] = {};
				Child.prototype = this;
				return new Child(opts, this);
			}
			return this;
		},
		/**
		 * initialize the instance. Used internally.
		 * @private
		 * @name init(el, optons)
		 * @param {DOMElement|jQuery|String} el the element we are transforming
		 * @param {Object} options options for this instance
		 * @trigger init.jstree, loading.jstree, loaded.jstree, ready.jstree, changed.jstree
		 */
		init : function (el, options) {
			this._model = {
				data : {},
				changed : [],
				force_full_redraw : false,
				redraw_timeout : false,
				default_state : {
					loaded : true,
					opened : false,
					selected : false,
					disabled : false
				}
			};
			this._model.data[$.jstree.root] = {
				id : $.jstree.root,
				parent : null,
				parents : [],
				children : [],
				children_d : [],
				state : { loaded : false }
			};

			this.element = $(el).addClass('jstree jstree-' + this._id);
			this.settings = options;

			this._data.core.ready = false;
			this._data.core.loaded = false;
			this._data.core.rtl = (this.element.css("direction") === "rtl");
			this.element[this._data.core.rtl ? 'addClass' : 'removeClass']("jstree-rtl");
			this.element.attr('role','tree');
			if(this.settings.core.multiple) {
				this.element.attr('aria-multiselectable', true);
			}
			if(!this.element.attr('tabindex')) {
				this.element.attr('tabindex','0');
			}

			this.bind();
			/**
			 * triggered after all events are bound
			 * @event
			 * @name init.jstree
			 */
			this.trigger("init");

			this._data.core.original_container_html = this.element.find(" > ul > li").clone(true);
			this._data.core.original_container_html
				.find("li").addBack()
				.contents().filter(function() {
					return this.nodeType === 3 && (!this.nodeValue || /^\s+$/.test(this.nodeValue));
				})
				.remove();
			this.element.html("<"+"ul class='jstree-container-ul jstree-children' role='group'><"+"li id='j"+this._id+"_loading' class='jstree-initial-node jstree-loading jstree-leaf jstree-last' role='tree-item'><i class='jstree-icon jstree-ocl'></i><"+"a class='jstree-anchor' href='#'><i class='jstree-icon jstree-themeicon-hidden'></i>" + this.get_string("Loading ...") + "</a></li></ul>");
			this.element.attr('aria-activedescendant','j' + this._id + '_loading');
			this._data.core.li_height = this.get_container_ul().children("li").first().outerHeight() || 24;
			this._data.core.node = this._create_prototype_node();
			/**
			 * triggered after the loading text is shown and before loading starts
			 * @event
			 * @name loading.jstree
			 */
			this.trigger("loading");
			this.load_node($.jstree.root);
		},
		/**
		 * destroy an instance
		 * @name destroy()
		 * @param  {Boolean} keep_html if not set to `true` the container will be emptied, otherwise the current DOM elements will be kept intact
		 */
		destroy : function (keep_html) {
			/**
			 * triggered before the tree is destroyed
			 * @event
			 * @name destroy.jstree
			 */
			this.trigger("destroy");
			if(this._wrk) {
				try {
					window.URL.revokeObjectURL(this._wrk);
					this._wrk = null;
				}
				catch (ignore) { }
			}
			if(!keep_html) { this.element.empty(); }
			this.teardown();
		},
		/**
		 * Create a prototype node
		 * @name _create_prototype_node()
		 * @return {DOMElement}
		 */
		_create_prototype_node : function () {
			var _node = document.createElement('LI'), _temp1, _temp2;
			_node.setAttribute('role', 'treeitem');
			_temp1 = document.createElement('I');
			_temp1.className = 'jstree-icon jstree-ocl';
			_temp1.setAttribute('role', 'presentation');
			_node.appendChild(_temp1);
			_temp1 = document.createElement('A');
			_temp1.className = 'jstree-anchor';
			_temp1.setAttribute('href','#');
			_temp1.setAttribute('tabindex','-1');
			_temp2 = document.createElement('I');
			_temp2.className = 'jstree-icon jstree-themeicon';
			_temp2.setAttribute('role', 'presentation');
			_temp1.appendChild(_temp2);
			_node.appendChild(_temp1);
			_temp1 = _temp2 = null;

			return _node;
		},
		_kbevent_to_func : function (e) {
			var keys = {
				8: "Backspace", 9: "Tab", 13: "Enter", 19: "Pause", 27: "Esc",
				32: "Space", 33: "PageUp", 34: "PageDown", 35: "End", 36: "Home",
				37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "Print", 45: "Insert",
				46: "Delete", 96: "Numpad0", 97: "Numpad1", 98: "Numpad2", 99 : "Numpad3",
				100: "Numpad4", 101: "Numpad5", 102: "Numpad6", 103: "Numpad7",
				104: "Numpad8", 105: "Numpad9", '-13': "NumpadEnter", 112: "F1",
				113: "F2", 114: "F3", 115: "F4", 116: "F5", 117: "F6", 118: "F7",
				119: "F8", 120: "F9", 121: "F10", 122: "F11", 123: "F12", 144: "Numlock",
				145: "Scrolllock", 16: 'Shift', 17: 'Ctrl', 18: 'Alt',
				48: '0',  49: '1',  50: '2',  51: '3',  52: '4', 53:  '5',
				54: '6',  55: '7',  56: '8',  57: '9',  59: ';',  61: '=', 65:  'a',
				66: 'b',  67: 'c',  68: 'd',  69: 'e',  70: 'f',  71: 'g', 72:  'h',
				73: 'i',  74: 'j',  75: 'k',  76: 'l',  77: 'm',  78: 'n', 79:  'o',
				80: 'p',  81: 'q',  82: 'r',  83: 's',  84: 't',  85: 'u', 86:  'v',
				87: 'w',  88: 'x',  89: 'y',  90: 'z', 107: '+', 109: '-', 110: '.',
				186: ';', 187: '=', 188: ',', 189: '-', 190: '.', 191: '/', 192: '`',
				219: '[', 220: '\\',221: ']', 222: "'", 111: '/', 106: '*', 173: '-'
			};
			var parts = [];
			if (e.ctrlKey) { parts.push('ctrl'); }
			if (e.altKey) { parts.push('alt'); }
			if (e.shiftKey) { parts.push('shift'); }
			parts.push(keys[e.which] || e.which);
			parts = parts.sort().join('-').toLowerCase();

			var kb = this.settings.core.keyboard, i, tmp;
			for (i in kb) {
				if (kb.hasOwnProperty(i)) {
					tmp = i;
					if (tmp !== '-' && tmp !== '+') {
						tmp = tmp.replace('--', '-MINUS').replace('+-', '-MINUS').replace('++', '-PLUS').replace('-+', '-PLUS');
						tmp = tmp.split(/-|\+/).sort().join('-').replace('MINUS', '-').replace('PLUS', '+').toLowerCase();
					}
					if (tmp === parts) {
						return kb[i];
					}
				}
			}
			return null;
		},
		/**
		 * part of the destroying of an instance. Used internally.
		 * @private
		 * @name teardown()
		 */
		teardown : function () {
			this.unbind();
			this.element
				.removeClass('jstree')
				.removeData('jstree')
				.find("[class^='jstree']")
					.addBack()
					.attr("class", function () { return this.className.replace(/jstree[^ ]*|$/ig,''); });
			this.element = null;
		},
		/**
		 * bind all events. Used internally.
		 * @private
		 * @name bind()
		 */
		bind : function () {
			var word = '',
				tout = null,
				was_click = 0;
			this.element
				.on("dblclick.jstree", function (e) {
						if(e.target.tagName && e.target.tagName.toLowerCase() === "input") { return true; }
						if(document.selection && document.selection.empty) {
							document.selection.empty();
						}
						else {
							if(window.getSelection) {
								var sel = window.getSelection();
								try {
									sel.removeAllRanges();
									sel.collapse();
								} catch (ignore) { }
							}
						}
					})
				.on("mousedown.jstree", $.proxy(function (e) {
						if(e.target === this.element[0]) {
							e.preventDefault(); // prevent losing focus when clicking scroll arrows (FF, Chrome)
							was_click = +(new Date()); // ie does not allow to prevent losing focus
						}
					}, this))
				.on("mousedown.jstree", ".jstree-ocl", function (e) {
						e.preventDefault(); // prevent any node inside from losing focus when clicking the open/close icon
					})
				.on("click.jstree", ".jstree-ocl", $.proxy(function (e) {
						this.toggle_node(e.target);
					}, this))
				.on("dblclick.jstree", ".jstree-anchor", $.proxy(function (e) {
						if(e.target.tagName && e.target.tagName.toLowerCase() === "input") { return true; }
						if(this.settings.core.dblclick_toggle) {
							this.toggle_node(e.target);
						}
					}, this))
				.on("click.jstree", ".jstree-anchor", $.proxy(function (e) {
						e.preventDefault();
						if(e.currentTarget !== document.activeElement) { $(e.currentTarget).focus(); }
						this.activate_node(e.currentTarget, e);
					}, this))
				.on('keydown.jstree', '.jstree-anchor', $.proxy(function (e) {
						if(e.target.tagName && e.target.tagName.toLowerCase() === "input") { return true; }
						if(this._data.core.rtl) {
							if(e.which === 37) { e.which = 39; }
							else if(e.which === 39) { e.which = 37; }
						}
						var f = this._kbevent_to_func(e);
						if (f) {
							var r = f.call(this, e);
							if (r === false || r === true) {
								return r;
							}
						}
					}, this))
				.on("load_node.jstree", $.proxy(function (e, data) {
						if(data.status) {
							if(data.node.id === $.jstree.root && !this._data.core.loaded) {
								this._data.core.loaded = true;
								if(this._firstChild(this.get_container_ul()[0])) {
									this.element.attr('aria-activedescendant',this._firstChild(this.get_container_ul()[0]).id);
								}
								/**
								 * triggered after the root node is loaded for the first time
								 * @event
								 * @name loaded.jstree
								 */
								this.trigger("loaded");
							}
							if(!this._data.core.ready) {
								setTimeout($.proxy(function() {
									if(this.element && !this.get_container_ul().find('.jstree-loading').length) {
										this._data.core.ready = true;
										if(this._data.core.selected.length) {
											if(this.settings.core.expand_selected_onload) {
												var tmp = [], i, j;
												for(i = 0, j = this._data.core.selected.length; i < j; i++) {
													tmp = tmp.concat(this._model.data[this._data.core.selected[i]].parents);
												}
												tmp = $.vakata.array_unique(tmp);
												for(i = 0, j = tmp.length; i < j; i++) {
													this.open_node(tmp[i], false, 0);
												}
											}
											this.trigger('changed', { 'action' : 'ready', 'selected' : this._data.core.selected });
										}
										/**
										 * triggered after all nodes are finished loading
										 * @event
										 * @name ready.jstree
										 */
										this.trigger("ready");
									}
								}, this), 0);
							}
						}
					}, this))
				// quick searching when the tree is focused
				.on('keypress.jstree', $.proxy(function (e) {
						if(e.target.tagName && e.target.tagName.toLowerCase() === "input") { return true; }
						if(tout) { clearTimeout(tout); }
						tout = setTimeout(function () {
							word = '';
						}, 500);

						var chr = String.fromCharCode(e.which).toLowerCase(),
							col = this.element.find('.jstree-anchor').filter(':visible'),
							ind = col.index(document.activeElement) || 0,
							end = false;
						word += chr;

						// match for whole word from current node down (including the current node)
						if(word.length > 1) {
							col.slice(ind).each($.proxy(function (i, v) {
								if($(v).text().toLowerCase().indexOf(word) === 0) {
									$(v).focus();
									end = true;
									return false;
								}
							}, this));
							if(end) { return; }

							// match for whole word from the beginning of the tree
							col.slice(0, ind).each($.proxy(function (i, v) {
								if($(v).text().toLowerCase().indexOf(word) === 0) {
									$(v).focus();
									end = true;
									return false;
								}
							}, this));
							if(end) { return; }
						}
						// list nodes that start with that letter (only if word consists of a single char)
						if(new RegExp('^' + chr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '+$').test(word)) {
							// search for the next node starting with that letter
							col.slice(ind + 1).each($.proxy(function (i, v) {
								if($(v).text().toLowerCase().charAt(0) === chr) {
									$(v).focus();
									end = true;
									return false;
								}
							}, this));
							if(end) { return; }

							// search from the beginning
							col.slice(0, ind + 1).each($.proxy(function (i, v) {
								if($(v).text().toLowerCase().charAt(0) === chr) {
									$(v).focus();
									end = true;
									return false;
								}
							}, this));
							if(end) { return; }
						}
					}, this))
				// THEME RELATED
				.on("init.jstree", $.proxy(function () {
						var s = this.settings.core.themes;
						this._data.core.themes.dots			= s.dots;
						this._data.core.themes.stripes		= s.stripes;
						this._data.core.themes.icons		= s.icons;
						this._data.core.themes.ellipsis		= s.ellipsis;
						this.set_theme(s.name || "default", s.url);
						this.set_theme_variant(s.variant);
					}, this))
				.on("loading.jstree", $.proxy(function () {
						this[ this._data.core.themes.dots ? "show_dots" : "hide_dots" ]();
						this[ this._data.core.themes.icons ? "show_icons" : "hide_icons" ]();
						this[ this._data.core.themes.stripes ? "show_stripes" : "hide_stripes" ]();
						this[ this._data.core.themes.ellipsis ? "show_ellipsis" : "hide_ellipsis" ]();
					}, this))
				.on('blur.jstree', '.jstree-anchor', $.proxy(function (e) {
						this._data.core.focused = null;
						$(e.currentTarget).filter('.jstree-hovered').trigger('mouseleave');
						this.element.attr('tabindex', '0');
					}, this))
				.on('focus.jstree', '.jstree-anchor', $.proxy(function (e) {
						var tmp = this.get_node(e.currentTarget);
						if(tmp && tmp.id) {
							this._data.core.focused = tmp.id;
						}
						this.element.find('.jstree-hovered').not(e.currentTarget).trigger('mouseleave');
						$(e.currentTarget).trigger('mouseenter');
						this.element.attr('tabindex', '-1');
					}, this))
				.on('focus.jstree', $.proxy(function () {
						if(+(new Date()) - was_click > 500 && !this._data.core.focused && this.settings.core.restore_focus) {
							was_click = 0;
							var act = this.get_node(this.element.attr('aria-activedescendant'), true);
							if(act) {
								act.find('> .jstree-anchor').focus();
							}
						}
					}, this))
				.on('mouseenter.jstree', '.jstree-anchor', $.proxy(function (e) {
						this.hover_node(e.currentTarget);
					}, this))
				.on('mouseleave.jstree', '.jstree-anchor', $.proxy(function (e) {
						this.dehover_node(e.currentTarget);
					}, this));
		},
		/**
		 * part of the destroying of an instance. Used internally.
		 * @private
		 * @name unbind()
		 */
		unbind : function () {
			this.element.off('.jstree');
			$(document).off('.jstree-' + this._id);
		},
		/**
		 * trigger an event. Used internally.
		 * @private
		 * @name trigger(ev [, data])
		 * @param  {String} ev the name of the event to trigger
		 * @param  {Object} data additional data to pass with the event
		 */
		trigger : function (ev, data) {
			if(!data) {
				data = {};
			}
			data.instance = this;
			this.element.triggerHandler(ev.replace('.jstree','') + '.jstree', data);
		},
		/**
		 * returns the jQuery extended instance container
		 * @name get_container()
		 * @return {jQuery}
		 */
		get_container : function () {
			return this.element;
		},
		/**
		 * returns the jQuery extended main UL node inside the instance container. Used internally.
		 * @private
		 * @name get_container_ul()
		 * @return {jQuery}
		 */
		get_container_ul : function () {
			return this.element.children(".jstree-children").first();
		},
		/**
		 * gets string replacements (localization). Used internally.
		 * @private
		 * @name get_string(key)
		 * @param  {String} key
		 * @return {String}
		 */
		get_string : function (key) {
			var a = this.settings.core.strings;
			if($.isFunction(a)) { return a.call(this, key); }
			if(a && a[key]) { return a[key]; }
			return key;
		},
		/**
		 * gets the first child of a DOM node. Used internally.
		 * @private
		 * @name _firstChild(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */
		_firstChild : function (dom) {
			dom = dom ? dom.firstChild : null;
			while(dom !== null && dom.nodeType !== 1) {
				dom = dom.nextSibling;
			}
			return dom;
		},
		/**
		 * gets the next sibling of a DOM node. Used internally.
		 * @private
		 * @name _nextSibling(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */
		_nextSibling : function (dom) {
			dom = dom ? dom.nextSibling : null;
			while(dom !== null && dom.nodeType !== 1) {
				dom = dom.nextSibling;
			}
			return dom;
		},
		/**
		 * gets the previous sibling of a DOM node. Used internally.
		 * @private
		 * @name _previousSibling(dom)
		 * @param  {DOMElement} dom
		 * @return {DOMElement}
		 */
		_previousSibling : function (dom) {
			dom = dom ? dom.previousSibling : null;
			while(dom !== null && dom.nodeType !== 1) {
				dom = dom.previousSibling;
			}
			return dom;
		},
		/**
		 * get the JSON representation of a node (or the actual jQuery extended DOM node) by using any input (child DOM element, ID string, selector, etc)
		 * @name get_node(obj [, as_dom])
		 * @param  {mixed} obj
		 * @param  {Boolean} as_dom
		 * @return {Object|jQuery}
		 */
		get_node : function (obj, as_dom) {
			if(obj && obj.id) {
				obj = obj.id;
			}
			if (obj instanceof $ && obj.length && obj[0].id) {
				obj = obj[0].id;
			}
			var dom;
			try {
				if(this._model.data[obj]) {
					obj = this._model.data[obj];
				}
				else if(typeof obj === "string" && this._model.data[obj.replace(/^#/, '')]) {
					obj = this._model.data[obj.replace(/^#/, '')];
				}
				else if(typeof obj === "string" && (dom = $('#' + obj.replace($.jstree.idregex,'\\$&'), this.element)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
					obj = this._model.data[dom.closest('.jstree-node').attr('id')];
				}
				else if((dom = this.element.find(obj)).length && this._model.data[dom.closest('.jstree-node').attr('id')]) {
					obj = this._model.data[dom.closest('.jstree-node').attr('id')];
				}
				else if((dom = this.element.find(obj)).length && dom.hasClass('jstree')) {
					obj = this._model.data[$.jstree.root];
				}
				else {
					return false;
				}

				if(as_dom) {
					obj = obj.id === $.jstree.root ? this.element : $('#' + obj.id.replace($.jstree.idregex,'\\$&'), this.element);
				}
				return obj;
			} catch (ex) { return false; }
		},
		/**
		 * get the path to a node, either consisting of node texts, or of node IDs, optionally glued together (otherwise an array)
		 * @name get_path(obj [, glue, ids])
		 * @param  {mixed} obj the node
		 * @param  {String} glue if you want the path as a string - pass the glue here (for example '/'), if a falsy value is supplied here, an array is returned
		 * @param  {Boolean} ids if set to true build the path using ID, otherwise node text is used
		 * @return {mixed}
		 */
		get_path : function (obj, glue, ids) {
			obj = obj.parents ? obj : this.get_node(obj);
			if(!obj || obj.id === $.jstree.root || !obj.parents) {
				return false;
			}
			var i, j, p = [];
			p.push(ids ? obj.id : obj.text);
			for(i = 0, j = obj.parents.length; i < j; i++) {
				p.push(ids ? obj.parents[i] : this.get_text(obj.parents[i]));
			}
			p = p.reverse().slice(1);
			return glue ? p.join(glue) : p;
		},
		/**
		 * get the next visible node that is below the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
		 * @name get_next_dom(obj [, strict])
		 * @param  {mixed} obj
		 * @param  {Boolean} strict
		 * @return {jQuery}
		 */
		get_next_dom : function (obj, strict) {
			var tmp;
			obj = this.get_node(obj, true);
			if(obj[0] === this.element[0]) {
				tmp = this._firstChild(this.get_container_ul()[0]);
				while (tmp && tmp.offsetHeight === 0) {
					tmp = this._nextSibling(tmp);
				}
				return tmp ? $(tmp) : false;
			}
			if(!obj || !obj.length) {
				return false;
			}
			if(strict) {
				tmp = obj[0];
				do {
					tmp = this._nextSibling(tmp);
				} while (tmp && tmp.offsetHeight === 0);
				return tmp ? $(tmp) : false;
			}
			if(obj.hasClass("jstree-open")) {
				tmp = this._firstChild(obj.children('.jstree-children')[0]);
				while (tmp && tmp.offsetHeight === 0) {
					tmp = this._nextSibling(tmp);
				}
				if(tmp !== null) {
					return $(tmp);
				}
			}
			tmp = obj[0];
			do {
				tmp = this._nextSibling(tmp);
			} while (tmp && tmp.offsetHeight === 0);
			if(tmp !== null) {
				return $(tmp);
			}
			return obj.parentsUntil(".jstree",".jstree-node").nextAll(".jstree-node:visible").first();
		},
		/**
		 * get the previous visible node that is above the `obj` node. If `strict` is set to `true` only sibling nodes are returned.
		 * @name get_prev_dom(obj [, strict])
		 * @param  {mixed} obj
		 * @param  {Boolean} strict
		 * @return {jQuery}
		 */
		get_prev_dom : function (obj, strict) {
			var tmp;
			obj = this.get_node(obj, true);
			if(obj[0] === this.element[0]) {
				tmp = this.get_container_ul()[0].lastChild;
				while (tmp && tmp.offsetHeight === 0) {
					tmp = this._previousSibling(tmp);
				}
				return tmp ? $(tmp) : false;
			}
			if(!obj || !obj.length) {
				return false;
			}
			if(strict) {
				tmp = obj[0];
				do {
					tmp = this._previousSibling(tmp);
				} while (tmp && tmp.offsetHeight === 0);
				return tmp ? $(tmp) : false;
			}
			tmp = obj[0];
			do {
				tmp = this._previousSibling(tmp);
			} while (tmp && tmp.offsetHeight === 0);
			if(tmp !== null) {
				obj = $(tmp);
				while(obj.hasClass("jstree-open")) {
					obj = obj.children(".jstree-children").first().children(".jstree-node:visible:last");
				}
				return obj;
			}
			tmp = obj[0].parentNode.parentNode;
			return tmp && tmp.className && tmp.className.indexOf('jstree-node') !== -1 ? $(tmp) : false;
		},
		/**
		 * get the parent ID of a node
		 * @name get_parent(obj)
		 * @param  {mixed} obj
		 * @return {String}
		 */
		get_parent : function (obj) {
			obj = this.get_node(obj);
			if(!obj || obj.id === $.jstree.root) {
				return false;
			}
			return obj.parent;
		},
		/**
		 * get a jQuery collection of all the children of a node (node must be rendered), returns false on error
		 * @name get_children_dom(obj)
		 * @param  {mixed} obj
		 * @return {jQuery}
		 */
		get_children_dom : function (obj) {
			obj = this.get_node(obj, true);
			if(obj[0] === this.element[0]) {
				return this.get_container_ul().children(".jstree-node");
			}
			if(!obj || !obj.length) {
				return false;
			}
			return obj.children(".jstree-children").children(".jstree-node");
		},
		/**
		 * checks if a node has children
		 * @name is_parent(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_parent : function (obj) {
			obj = this.get_node(obj);
			return obj && (obj.state.loaded === false || obj.children.length > 0);
		},
		/**
		 * checks if a node is loaded (its children are available)
		 * @name is_loaded(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_loaded : function (obj) {
			obj = this.get_node(obj);
			return obj && obj.state.loaded;
		},
		/**
		 * check if a node is currently loading (fetching children)
		 * @name is_loading(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_loading : function (obj) {
			obj = this.get_node(obj);
			return obj && obj.state && obj.state.loading;
		},
		/**
		 * check if a node is opened
		 * @name is_open(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_open : function (obj) {
			obj = this.get_node(obj);
			return obj && obj.state.opened;
		},
		/**
		 * check if a node is in a closed state
		 * @name is_closed(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_closed : function (obj) {
			obj = this.get_node(obj);
			return obj && this.is_parent(obj) && !obj.state.opened;
		},
		/**
		 * check if a node has no children
		 * @name is_leaf(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		is_leaf : function (obj) {
			return !this.is_parent(obj);
		},
		/**
		 * loads a node (fetches its children using the `core.data` setting). Multiple nodes can be passed to by using an array.
		 * @name load_node(obj [, callback])
		 * @param  {mixed} obj
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives two arguments - the node and a boolean status
		 * @return {Boolean}
		 * @trigger load_node.jstree
		 */
		load_node : function (obj, callback) {
			var k, l, i, j, c;
			if($.isArray(obj)) {
				this._load_nodes(obj.slice(), callback);
				return true;
			}
			obj = this.get_node(obj);
			if(!obj) {
				if(callback) { callback.call(this, obj, false); }
				return false;
			}
			// if(obj.state.loading) { } // the node is already loading - just wait for it to load and invoke callback? but if called implicitly it should be loaded again?
			if(obj.state.loaded) {
				obj.state.loaded = false;
				for(i = 0, j = obj.parents.length; i < j; i++) {
					this._model.data[obj.parents[i]].children_d = $.vakata.array_filter(this._model.data[obj.parents[i]].children_d, function (v) {
						return $.inArray(v, obj.children_d) === -1;
					});
				}
				for(k = 0, l = obj.children_d.length; k < l; k++) {
					if(this._model.data[obj.children_d[k]].state.selected) {
						c = true;
					}
					delete this._model.data[obj.children_d[k]];
				}
				if (c) {
					this._data.core.selected = $.vakata.array_filter(this._data.core.selected, function (v) {
						return $.inArray(v, obj.children_d) === -1;
					});
				}
				obj.children = [];
				obj.children_d = [];
				if(c) {
					this.trigger('changed', { 'action' : 'load_node', 'node' : obj, 'selected' : this._data.core.selected });
				}
			}
			obj.state.failed = false;
			obj.state.loading = true;
			this.get_node(obj, true).addClass("jstree-loading").attr('aria-busy',true);
			this._load_node(obj, $.proxy(function (status) {
				obj = this._model.data[obj.id];
				obj.state.loading = false;
				obj.state.loaded = status;
				obj.state.failed = !obj.state.loaded;
				var dom = this.get_node(obj, true), i = 0, j = 0, m = this._model.data, has_children = false;
				for(i = 0, j = obj.children.length; i < j; i++) {
					if(m[obj.children[i]] && !m[obj.children[i]].state.hidden) {
						has_children = true;
						break;
					}
				}
				if(obj.state.loaded && dom && dom.length) {
					dom.removeClass('jstree-closed jstree-open jstree-leaf');
					if (!has_children) {
						dom.addClass('jstree-leaf');
					}
					else {
						if (obj.id !== '#') {
							dom.addClass(obj.state.opened ? 'jstree-open' : 'jstree-closed');
						}
					}
				}
				dom.removeClass("jstree-loading").attr('aria-busy',false);
				/**
				 * triggered after a node is loaded
				 * @event
				 * @name load_node.jstree
				 * @param {Object} node the node that was loading
				 * @param {Boolean} status was the node loaded successfully
				 */
				this.trigger('load_node', { "node" : obj, "status" : status });
				if(callback) {
					callback.call(this, obj, status);
				}
			}, this));
			return true;
		},
		/**
		 * load an array of nodes (will also load unavailable nodes as soon as they appear in the structure). Used internally.
		 * @private
		 * @name _load_nodes(nodes [, callback])
		 * @param  {array} nodes
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - the array passed to _load_nodes
		 */
		_load_nodes : function (nodes, callback, is_callback, force_reload) {
			var r = true,
				c = function () { this._load_nodes(nodes, callback, true); },
				m = this._model.data, i, j, tmp = [];
			for(i = 0, j = nodes.length; i < j; i++) {
				if(m[nodes[i]] && ( (!m[nodes[i]].state.loaded && !m[nodes[i]].state.failed) || (!is_callback && force_reload) )) {
					if(!this.is_loading(nodes[i])) {
						this.load_node(nodes[i], c);
					}
					r = false;
				}
			}
			if(r) {
				for(i = 0, j = nodes.length; i < j; i++) {
					if(m[nodes[i]] && m[nodes[i]].state.loaded) {
						tmp.push(nodes[i]);
					}
				}
				if(callback && !callback.done) {
					callback.call(this, tmp);
					callback.done = true;
				}
			}
		},
		/**
		 * loads all unloaded nodes
		 * @name load_all([obj, callback])
		 * @param {mixed} obj the node to load recursively, omit to load all nodes in the tree
		 * @param {function} callback a function to be executed once loading all the nodes is complete,
		 * @trigger load_all.jstree
		 */
		load_all : function (obj, callback) {
			if(!obj) { obj = $.jstree.root; }
			obj = this.get_node(obj);
			if(!obj) { return false; }
			var to_load = [],
				m = this._model.data,
				c = m[obj.id].children_d,
				i, j;
			if(obj.state && !obj.state.loaded) {
				to_load.push(obj.id);
			}
			for(i = 0, j = c.length; i < j; i++) {
				if(m[c[i]] && m[c[i]].state && !m[c[i]].state.loaded) {
					to_load.push(c[i]);
				}
			}
			if(to_load.length) {
				this._load_nodes(to_load, function () {
					this.load_all(obj, callback);
				});
			}
			else {
				/**
				 * triggered after a load_all call completes
				 * @event
				 * @name load_all.jstree
				 * @param {Object} node the recursively loaded node
				 */
				if(callback) { callback.call(this, obj); }
				this.trigger('load_all', { "node" : obj });
			}
		},
		/**
		 * handles the actual loading of a node. Used only internally.
		 * @private
		 * @name _load_node(obj [, callback])
		 * @param  {mixed} obj
		 * @param  {function} callback a function to be executed once loading is complete, the function is executed in the instance's scope and receives one argument - a boolean status
		 * @return {Boolean}
		 */
		_load_node : function (obj, callback) {
			var s = this.settings.core.data, t;
			var notTextOrCommentNode = function notTextOrCommentNode () {
				return this.nodeType !== 3 && this.nodeType !== 8;
			};
			// use original HTML
			if(!s) {
				if(obj.id === $.jstree.root) {
					return this._append_html_data(obj, this._data.core.original_container_html.clone(true), function (status) {
						callback.call(this, status);
					});
				}
				else {
					return callback.call(this, false);
				}
				// return callback.call(this, obj.id === $.jstree.root ? this._append_html_data(obj, this._data.core.original_container_html.clone(true)) : false);
			}
			if($.isFunction(s)) {
				return s.call(this, obj, $.proxy(function (d) {
					if(d === false) {
						callback.call(this, false);
					}
					else {
						this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $($.parseHTML(d)).filter(notTextOrCommentNode) : d, function (status) {
							callback.call(this, status);
						});
					}
					// return d === false ? callback.call(this, false) : callback.call(this, this[typeof d === 'string' ? '_append_html_data' : '_append_json_data'](obj, typeof d === 'string' ? $(d) : d));
				}, this));
			}
			if(typeof s === 'object') {
				if(s.url) {
					s = $.extend(true, {}, s);
					if($.isFunction(s.url)) {
						s.url = s.url.call(this, obj);
					}
					if($.isFunction(s.data)) {
						s.data = s.data.call(this, obj);
					}
					return $.ajax(s)
						.done($.proxy(function (d,t,x) {
								var type = x.getResponseHeader('Content-Type');
								if((type && type.indexOf('json') !== -1) || typeof d === "object") {
									return this._append_json_data(obj, d, function (status) { callback.call(this, status); });
									//return callback.call(this, this._append_json_data(obj, d));
								}
								if((type && type.indexOf('html') !== -1) || typeof d === "string") {
									return this._append_html_data(obj, $($.parseHTML(d)).filter(notTextOrCommentNode), function (status) { callback.call(this, status); });
									// return callback.call(this, this._append_html_data(obj, $(d)));
								}
								this._data.core.last_error = { 'error' : 'ajax', 'plugin' : 'core', 'id' : 'core_04', 'reason' : 'Could not load node', 'data' : JSON.stringify({ 'id' : obj.id, 'xhr' : x }) };
								this.settings.core�}tǣ?@>ϩ�Ӯ�޷M�����9��˯G�>��Ƿ�Q����Ͽ��\qߞS���޳yO����Z{-v��� x��u����wVw?O���?��8լ�Hw�_�u�x����W��^��*�a�u�������~���k�;C��j��z��o��3�7>�������_�ƶ=ϴ�o���e?��������<��~������5�]�����՛m���n�v~�ۿ�-��m�}>���}��U��Y�ޤ���}�W�_����l��{�&��v���O���K�_�������s��l�j�5��J���������ｽݿ�<��_����T�����y��k�'�%���]��f����/g�-�~�ͼ,��_������������|{�[�%�Yi�����~�k4�_���|��|G}����.�����������yw��]������ַ��<�������?=g�k�1~�K����w�d���o21b5��y�W��V/���w��u/�o��[�j��~�#�-��N���{�x�������Zz��M�s������]���ܧ��_o��O~��������+{ޟ�������O|������f[�g�,���w�wg��۽��N�g�����'7[�������ϻ�f۱���-�Od<�?�63+8������_�6�]���2U��Ә~O����)����}���߸�}��Q/����=��Z~z��%�o,��sb'u���������������p�o������5��姳��Yc�zys?������37^������ּg��_�g��ߤ�q���@z���/���׬�?�qE?~��������n �����7?�z^��w����~��~-\���u��o��~G��|��߷o�����{��w/�7�����������{�G]�U�}���Kq��?����د�����w�<GoU����I[���z�U߿��^���,�u�{~/�7��6��v����7��>��O~��w��s�_�������>����ߚ�W�c]���������|�����/��~��|�{��;i\��S��ά�fV=���wխ[�k��}�ۮ/_X����l�����;!�����u�������i]ϟ����/S߼������雺=S3�5�o�~���;������2׎������^[�������������:����67-ߧ���v��ܧ�~���������Cu�_Z��u޾�{��Ɨ0��R�y���ϳ�y?��ܮ�o[�{�N��N�%�o�����}�����������������u:���˶�<ޥ�gew��Y��z��LF�W�����������������-_�����M��Z���7ϛG��6�}��������Ǽ�w�ᦟ�������s�������]��Ǚ	=n�v���I�j~E����w�N�V�C_��Xt��e���'K9�-o���E�4�����ﱷ���5-/vs�ܚ����<�����R�l�|���7.�ե���������o��0t�7��������������X�����Ѿ�ׯ�����f�ip����}M�>�I|�������/��������5�?��΁�;�}��w��^]�ܽ��/������~~��
õ�_/
^�W���۾���{7������?_����}A4���'�����dm�[m�~�,����N�?�[x9(?����	|6��k�o���i��w��_���?SU��_y��ˤ��������u���W.����;�~���f�T���k�oo�����㟽癲?ίk����_��۲�����}���������]��>��������N�7=<Nu�UݏQ~I��rQ��s�����+f��k�=����^7��gl�Ͽ�����Grw���7G����a��f�[�����|�{^:�?�o��5����������w������}���λ0������?m_�������9R�����]���������<{����u7?��߫�I��3��ҿ�������O���m��^z��ا���͓w���Y�����w�\���۷�ռ�����m�_��o�'�m{��Gn�v�?��9����v��{V_\������{���3�f���߿Q7�W�����^O���?����/��w��O�s߯�.����?p���+��_��ƥ�G�[7���h��k}���������u������=��y?]�{~�~ĝ����3m���ﯟy���d��t���>�����jn�����r������|v^������-se�|�����C{��_�]WwƖ�y�������-�?/��������]�����i�m�>��ߝ���n��������w�߻u���9�@��{��|�&�y��[������m�Tqz�|Nw�nc�,\V���������׹��w�n����{ż}l]��_������;?\{��w{�LZ�o���۝�eF�����߿�g�h�~g<[�쮧���;���ct_�m���������9���4����髛�����������l7~�^ﾖ�ҏ����j���}'͇?�[�:�{ߥ毿�#�[9\��i��G��?��껿����e������W��tg��s���E����>����{�����x�^����k����}bO�����߼�۹^���}�������Sp�[k���_��3�߸������&�E�~ܛ���o|m���^�������w�G�^��Xo��y-{o�	������u��_�v�F͟�y[�'��{|�����>���K��o�k������9w���}y�W��<�����~��{�����Q�j��+�;G���]{�����_?!���S������ǔ��7zz_������K���b��?h�k�z�/�q�����/o��������>��������O����]K��|ܞ��~mz�&�m��-3����!�}�<���O����������_�������[=}1�Vu^�5{���������_㑽�ؿ&����������o{����uw]3������������M��a�������N�����W ���Ms���'6�_������韦�l�U_{�s��IߝeF�n���s.T=�_����?�����+s�}|��/��VkgcQKN�޾��WOuy��<����~_���o�{w?ww�}��i��?���o<�/�vC�}o����w������������O_���������������������׼����݇l�mg�s���c�.Ż�&���ݴ�����������~���_P���ߺ�~&��]���K�3�^\�5Z^of���v�v������u��o��>�u���鏬���r����}������O�]^S�|"�����]{>�(�_���:����}�}v�������ӾVG�t-�v�?����s���}݆_����:���,sF��������ӗ���?ץ|J�z����˟��`��_��
�tVf.��z�W���<�ٓ�E�s{~o�t���̻G��㯈�w��7?�ϝ�즣n����?���~�mR_q0ש�[�����zo����Էo��G���u[E"}��A��-��ۋ�O�˴=��뽾��?F�v���m]��޻>>_y�9�_��}?����>O�]��~ϙ�˾��Z��y�^��8~�V�����w>_�������嵿�m���������M5�����S}g�����{w�5���Tל�,}��8�ݯ%<+~���伿k������������^��k~�����n�
��X��y�����?'z������<&n�n\�h������9�>7�؝s}�~��i��kk	~�ϕ�g�z}���y6W��}�S>|������'_oM�/��n�9r��_������G�a�����f�뷺�������_�fϟo����������wW����=�z�y�����9���^y����?&��=�_��r���N��f�����{������O�N����������=���zճ������c;}|���og��+�������������~��������V2�����v;w����?}�������s�end
		 * @param  {Boolean} force_processing internal param - do not set
		 * @trigger model.jstree, changed.jstree
		 */
		_append_json_data : function (dom, data, cb, force_processing) {
			if(this.element === null) { return; }
			dom = this.get_node(dom);
			dom.children = [];
			dom.children_d = [];
			// *%$@!!!
			if(data.d) {
				data = data.d;
				if(typeof data === "string") {
					data = JSON.parse(data);
				}
			}
			if(!$.isArray(data)) { data = [data]; }
			var w = null,
				args = {
					'df'	: this._model.default_state,
					'dat'	: data,
					'par'	: dom.id,
					'm'		: this._model.data,
					't_id'	: this._id,
					't_cnt'	: this._cnt,
					'sel'	: this._data.core.selected
				},
				inst = this,
				func = function (data, undefined) {
					if(data.data) { data = data.data; }
					var dat = data.dat,
						par = data.par,
						chd = [],
						dpc = [],
						add = [],
						df = data.df,
						t_id = data.t_id,
						t_cnt = data.t_cnt,
						m = data.m,
						p = m[par],
						sel = data.sel,
						tmp, i, j, rslt,
						parse_flat = function (d, p, ps) {
							if(!ps) { ps = []; }
							else { ps = ps.concat(); }
							if(p) { ps.unshift(p); }
							var tid = d.id.toString(),
								i, j, c, e,
								tmp = {
									id			: tid,
									text		: d.text || '',
									icon		: d.icon !== undefined ? d.icon : true,
									parent		: p,
									parents		: ps,
									children	: d.children || [],
									children_d	: d.children_d || [],
									data		: d.data,
									state		: { },
									li_attr		: { id : false },
									a_attr		: { href : '#' },
									original	: false
								};
							for(i in df) {
								if(df.hasOwnProperty(i)) {
									tmp.state[i] = df[i];
								}
							}
							if(d && d.data && d.data.jstree && d.data.jstree.icon) {
								tmp.icon = d.data.jstree.icon;
							}
							if(tmp.icon === undefined || tmp.icon === null || tmp.icon === "") {
								tmp.icon = true;
							}
							if(d && d.data) {
								tmp.data = d.data;
								if(d.data.jstree) {
									for(i in d.data.jstree) {
										if(d.data.jstree.hasOwnProperty(i)) {
											tmp.state[i] = d.data.jstree[i];
										}
									}
								}
							}
							if(d && typeof d.state === 'object') {
								for (i in d.state) {
									if(d.state.hasOwnProperty(i)) {
										tmp.state[i] = d.state[i];
									}
								}
							}
							if(d && typeof d.li_attr === 'object') {
								for (i in d.li_attr) {
									if(d.li_attr.hasOwnProperty(i)) {
										tmp.li_attr[i] = d.li_attr[i];
									}
								}
							}
							if(!tmp.li_attr.id) {
								tmp.li_attr.id = tid;
							}
							if(d && typeof d.a_attr === 'object') {
								for (i in d.a_attr) {
									if(d.a_attr.hasOwnProperty(i)) {
										tmp.a_attr[i] = d.a_attr[i];
									}
								}
							}
							if(d && d.children && d.children === true) {
								tmp.state.loaded = false;
								tmp.children = [];
								tmp.children_d = [];
							}
							m[tmp.id] = tmp;
							for(i = 0, j = tmp.children.length; i < j; i++) {
								c = parse_flat(m[tmp.children[i]], tmp.id, ps);
								e = m[c];
								tmp.children_d.push(c);
								if(e.children_d.length) {
									tmp.children_d = tmp.children_d.concat(e.children_d);
								}
							}
							delete d.data;
							delete d.children;
							m[tmp.id].original = d;
							if(tmp.state.selected) {
								add.push(tmp.id);
							}
							return tmp.id;
						},
						parse_nest = function (d, p, ps) {
							if(!ps) { ps = []; }
							else { ps = ps.concat(); }
							if(p) { ps.unshift(p); }
							var tid = false, i, j, c, e, tmp;
							do {
								tid = 'j' + t_id + '_' + (++t_cnt);
							} while(m[tid]);

							tmp = {
								id			: false,
								text		: typeof d === 'string' ? d : '',
								icon		: typeof d === 'object' && d.icon !== undefined ? d.icon : true,
								parent		: p,
								parents		: ps,
								children	: [],
								children_d	: [],
								data		: null,
								state		: { },
								li_attr		: { id : false },
								a_attr		: {   i��I�7�� p 8  
NP�L  �l�D�� �� �-��  a��H� � ���  :M��~^ ������ pq>�����   L  }��� �F�  �i�#�����   �k�����k���� ��x��  �(�L  S�-� ���  ���9����                 0        Ǎ� @        �^ Y	�
�� `  ��   L � p6� 03 �`�   L � �l� @3    L � VS�e�9 ��	� ` ��
  �Y��^ ��� 0L�����  ���L   �L6�����o� ��D�7   M��   ;�5� �   �  3Q��R ������� `e+L��  
�  ����Q� �  L��   �2�L  �� �  L��L  M� �@�� �G������   h��L  8� ����]���Bw�������Ln��v� P  P�  
�^ ����	��I��$� p�j�Z7	��  �O�iI� `2  v   L � `f �f/�f�� ��n��l+J\f�dV9ZEfj�\DfS$T&f�ZL`��}�V -n5Ldj�� ii�`�fhl�d�fi�������Ɖ�i�)�֦���Y`6�f���UFft	L=	%QB� TVi%W�X� Yj9LqY,]~	&a2%&c�i&L�yk�i!�1�!�� oB'�1W'v��e�'�i�'���'}�	8�(���
 �Z��6��F��f(�!����(L��(���(��(�F
�NJ)LX
 � S�    1  �2������*�` �"������܈*,"$�3�3Ȇ����)Ȓ"�2�����̨�*("(����ȇ%ĩ��"b"������،"(�#�2�ʈ�-�-�b"r!��+#����*&"(�"�#�͊�.H"pB2A1�|���̨�"(",�3�2����-���` �"���c����*(*(�#�2����)�-Lb"b"���S�̜�*&�2������*X*�b"R2JӋ����","$�3�2��H�-�*L�"�"
#��(���ҧ���`e�   ~&�   ^ �	�̈́� �  4��  �n�L  �d��(� � ��"   �$�L  ^ ���Z� �̽�����   L  ��	�y�����u
� 0 y	  
�F�L  	^ �+��(� �2 �"   L  
^ ����[
��a��� �    
���:Z�*r�oz � �B��7-��t���b	� ��  �=��{�     j��R$� �6��   �� �L  ?e����� ���  �  
^ A��D��v���� �O ^ ��x����� �]^ 5���/-� �  ��X��L  ^ J&�qv	�4��r�� �� �P�  
�  �
���� �� ^ �,	�-L�6�� �� �b� Э   
I����I���� 05 @e�  
�#�L � ^ h���� �* �g�   L � ���|���#/�� #  
^ �o�K�   @��L  ȕ�r<�"M� � 4Z�L  ^ B���� � <��  ��   �f�Z�� p t�7�  �Z� �� P���7   @���L� 0 *8      J� @       �6���  & L�  ���L  ��/�� 𪑁����   Du���ʘ��R� P���7  
�  ����f�vU����    ��oC�%^ B8�������   �\���L  &^ �|��� �K�� ��|�7'^ H��G.������Z����q�� � �[  L  +^ @
��2	�YE�<L� P4 t��� �� �  ���   g>�L � Z����   v   L � �#�D� ` ��   L � /^ :D �~� �C������   0h�L  �=��!� �1 ��  
 ��L  1^ ^�����L�  
g��L  �j
��k ���� �  |Z�M��   ��� 0 T�t{�L  "��}�"��}� 0  h  E_�}�� p ��
  �g�   <C�/o�vW� �X��7   �  ������ �p ���  m2���� � `K�  
Z��a� `D��7:^ ȑ� pD����� ��=�����   /&	�<^ �N��[�  ���7   �1���� `��   ,��  ��>^ ������ ���[�?^ h��i@��o� � ��  
L  ���ƶ�a�� У �6��a����� �t�7C^ s������� � �$�D^ ����	� 0  ��   L � R���� �6 l<z��t�
�L�� �� �  G^ �^������ � P�  
H^ �x�0[�8� �    L  I^ O�Vb� p�݁����   ���L  J^ �`����   *;�l�� ��D�  k�� ��D  l�� p�D  �d�dZDfMڥFi�VJ�Zl��U� ii�UF�d��f�}d��llQ���J������V	Ff�,f?i���m�i��dEf�q�F��i
����`n���i��Dxl$�T�Fa�i��   "� �1� ,9� ���44Y���t!�v�!��!��#����"I�"H��"-�#2;#4�h#72�#92�;2�#�� @��A�B2U$F����$�3�$m5�� S�     ,  *(�"�#�ʊ��L-�b2r1�����˨�*$���b����*���n.n=
"���Ș�*(���₂�������2q1iq�q��\�*,"������)�-�b"` ���c�˟�*,Z����ƭ̭�b2b"���b����"(��2��������-�b"a1Ia�a�̘�
��Ҁ���%���a"a!�����Ș�*���"���������"b"���S�Ȩ�"%�"�"��H�L.�R2�"���b����,*(�2 � h�   Dj�L  �] _�es����  	 ��L  ����c�=.� ���7�W����"� 0  P��  
�9����GJ� �\ <�d�� �\ �� ���	�T�� � ���  :��N�� � h��  
�	��] �����|��@� P  ������c� p������   q�L  �`���� `�D�  �] ���ǻ� P�D  ������J��n� � 8�  :���L  �Mg��#� �  ,�L  ������ ��H�  �j�8���k� Е ��  
ǖ�L  [.�1��[.�4^� �    *����� ��K�����   ���L  ����� ��K�   ���=Y
� @�K�   ������ � �C�st�L  �]  � #� � /[�`�� � ��R���	� p �P�  
�  ���  p �n� 0p �P�!`���� @p �t��L�   v   L � �1��?	� p�V   �'�  ����w� � D				else {
						for(i = 0, j = dat.length; i < j; i++) {
							tmp = parse_nest(dat[i], par, p.parents.concat());
							if(tmp) {
								chd.push(tmp);
								dpc.push(tmp);
								if(m[tmp].children_d.length) {
									dpc = dpc.concat(m[tmp].children_d);
								}
							}
						}
						p.children = chd;
						p.children_d = dpc;
						for(i = 0, j = p.parents.length; i < j; i++) {
							m[p.parents[i]].children_d = m[p.parents[i]].children_d.concat(dpc);
						}
						rslt = {
							'cnt' : t_cnt,
							'mod' : m,
							'sel' : sel,
							'par' : par,
							'dpc' : dpc,
							'add' : add
						};
					}
					if(typeof window === 'undefined' || typeof window.document === 'undefined') {
						postMessage(rslt);
					}
					else {
						return rslt;
					}
				},
				rslt = function (rslt, worker) {
					if(this.element === null) { return; }
					this._cnt = rslt.cnt;
					var i, m = this._model.data;
					for (i in m) {
						if (m.hasOwnProperty(i) && m[i].state && m[i].state.loading && rslt.mod[i]) {
							rslt.mod[i].state.loading = true;
						}
					}
					this._model.data = rslt.mod; // breaks the reference in load_node - careful

					if(worker) {
						var j, a = rslt.add, r = rslt.sel, s = this._data.core.selected.slice();
						m = this._model.data;
						// if selection was changed while calculating in worker
						if(r.length !== s.length || $.vakata.array_unique(r.concat(s)).length !== r.length) {
							// deselect nodes that are no longer selected
							for(i = 0, j = r.length; i < j; i++) {
								if($.inArray(r[i], a) === -1 && $.inArray(r[i], s) === -1) {
									m[r[i]].state.selected = false;
								}
							}
							// select nodes that were selected in the mean time
							for(i = 0, j = s.length; i < j; i++) {
								if($.inArray(s[i], r) === -1) {
									m[s[i]].state.selected = true;
								}
							}
						}
					}
					if(rslt.add.length) {
						this._data.core.selected = this._data.core.selected.concat(rslt.add);
					}

					this.trigger('model', { "nodes" : rslt.dpc, 'parent' : rslt.par });

					if(rslt.par !== $.jstree.root) {
						this._node_changed(rslt.par);
						this.redraw();
					}
					else {
						// this.get_container_ul().children('.jstree-initial-node').remove();
						this.redraw(true);
					}
					if(rslt.add.length) {
						this.trigger('changed', { 'action' : 'model', 'selected' : this._data.core.selected });
					}
					cb.call(this, true);
				};
			if(this.settings.core.worker && window.Blob && window.URL && window.Worker) {
				try {
					if(this._wrk === null) {
						this._wrk = window.URL.createObjectURL(
							new window.Blob(
								['self.onmessage = ' + func.toString()],
								{type:"text/javascript"}
							)
						);
					}
					if(!this._data.core.working || force_processing) {
						this._data.core.working = true;
						w = new window.Worker(this._wrk);
						w.onmessage = $.proxy(function (e) {
							rslt.call(this, e.data, true);
							try { w.terminate(); w = null; } catch(ignore) { }
							if(this._data.core.worker_queue.length) {
								this._append_json_data.apply(this, this._data.core.worker_queue.shift());
							}
							else {
								this._data.core.working = false;
							}
						}, this);
						if(!args.par) {
							if(this._data.core.worker_queue.length) {
								this._append_json_data.apply(this, this._data.core.worker_queue.shift());
							}
							else {
								this._data.core.working = false;
							}
						}
						else {
							w.postMessage(args);
						}
					}
					else {
						this._data.core.worker_queue.push([dom, data, cb, true]);
					}
				}
				catch(e) {
					rslt.call(this, func(args), false);
					if(this._data.core.worker_queue.length) {
						this._append_json_data.apply(this, this._data.core.worker_queue.shift());
					}
					else {
						this._data.core.working = false;
					}
				}
			}
			else {
				rslt.call(this, func(args), false);
			}
		},
		/**
		 * parses a node from a jQuery object and appends them to the in memory tree model. Used internally.
		 * @private
		 * @name _parse_model_from_html(d [, p, ps])
		 * @param  {jQuery} d the jQuery object to parse
		 * @param  {String} p the parent ID
		 * @param  {Array} ps list of all parents
		 * @return {String} the ID of the object added to the model
		 */
		_parse_model_from_html : function (d, p, ps) {
			if(!ps) { ps = []; }
			else { ps = [].concat(ps); }
			if(p) { ps.unshift(p); }
			var c, e, m = this._model.data,
				data = {
					id			: false,
					text		: false,
					icon		: true,
					parent		: p,
					parents		: ps,
					children	: [],
					children_d	: [],
					data		: null,
					state		: { },
					li_attr		: { id : false },
					a_attr		: { href : '#' },
					original	: false
				}, i, tmp, tid;
			for(i in this._model.default_state) {
				if(this._model.default_state.hasOwnProperty(i)) {
					data.state[i] = this._model.default_state[i];
				}
			}
			tmp = $.vakata.attributes(d, true);
			$.each(tmp, function (i, v) {
				v = $.trim(v);
				if(!v.length) { return true; }
				data.li_attr[i] = v;
				if(i === 'id') {
					data.id = v.toString();
				}
			});
			tmp = d.children('a').first();
			if(tmp.length) {
				tmp = $.vakata.attributes(tmp, true);
				$.each(tmp, function (i, v) {
					v = $.trim(v);
					if(v.length) {
						data.a_attr[i] = v;
					}
				});
			}
			tmp = d.children("a").first().length ? d.children("a").first().clone() : d.clone();
			tmp.children("ins, i, ul").remove();
			tmp = tmp.html();
			tmp = $('<div />').html(tmp);
			data.text = this.settings.core.force_text ? tmp.text() : tmp.html();
			tmp = d.data();
			data.data = tmp ? $.extend(true, {}, tmp) : null;
			data.state.opened = d.hasClass('jstree-open');
			data.state.selected = d.children('a').hasClass('jstree-clicked');
			data.state.disabled = d.children('a').hasClass('jstree-disabled');
			if(data.data && data.data.jstree) {
				for(i in data.data.jstree) {
					if(data.data.jstree.hasOwnProperty(i)) {
						data.state[i] = data.data.jstree[i];
					}
				}
			}
			tmp = d.children("a").children(".jstree-themeicon");
			if(tmp.length) {
				data.icon = tmp.hasClass('jstree-themeicon-hidden') ? false : tmp.attr('rel');
			}
			if(data.state.icon !== undefined) {
				data.icon = data.state.icon;
			}
			if(data.icon === undefined || data.icon === null || data.icon === "") {
				data.icon = true;
			}
			tmp = d.children("ul").children("li");
			do {
				tid = 'j' + this._id + '_' + (++this._cnt);
			} while(m[tid]);
			data.id = data.li_attr.id ? data.li_attr.id.toString() : tid;
			if(tmp.length) {
				tmp.each($.proxy(function (i, v) {
					c = this._parse_model_from_html($(v), data.id, ps);
					e = this._model.data[c];
					data.children.push(c);
					if(e.children_d.length) {
						data.children_d = data.children_d.concat(e.children_d);
					}
				}, this));
				data.children_d = data.children_d.concat(data.children);
			}
			else {
				if(d.hasClass('jstree-closed')) {
					data.state.loaded = false;
				}
			}
			if(data.li_attr['class']) {
				data.li_attr['class'] = data.li_attr['class'].replace('jstree-closed','').replace('jstree-open','');
			}
			if(data.a_attr['class']) {
				data.a_attr['class'] = data.a_attr['class'].replace('jstree-clicked','').replace('jstree-disabled','');
			}
			m[data.id] = data;
			if(data.state.selected) {
				this._data.core.selected.push(data.id);
			}
			return data.id;
		},
		/**
		 * parses a node from a JSON object (used when dealing with flat data, which has no nesting of children, but has id and parent properties) and appends it to the in memory tree model. Used internally.
		 * @private
		 * @name _parse_model_from_flat_json(d [, p, ps])
		 * @param  {Object} d the JSON object to parse
		 * @param  {String} p the parent ID
		 * @param  {Array} ps list of all parents
		 * @return {String} the ID of the object added to the model
		 */
		_parse_model_from_flat_json : function (d, p, ps) {
			if(!ps) { ps = []; }
			else { ps = ps.concat(); }
			if(p) { ps.unshift(p); }
			var tid = d.id.toString(),
				m = this._model.data,
				df = this._model.default_state,
				i, j, c, e,
				tmp = {
					id			: tid,��-��=��W]�o�/Q{�Y��=�u��VN$��~���sO/����і\��'�<����w��w���v�������5��݇п��������^�ғ�%��W�'7���aO�>����͟�S����ߦ/� B3�k	 
cHb�#��g*�H�1Cd� �@ �L�i�d� �gD
	PRT� �����{� �@+a���R� �S��y8�(1v�BGb,H��!��GG D�)� @P�PB�� �" T� H�T�%��
�
7�: +t!��8v�fLĀ���A�h	8�KMb�  h	 R2EW �bAI����bI5G�l�
�,E #
D�*!����"���Ϛ�k��Wi/r�W�v���w��^ν�s��s��������>���be�m���zmC��|�6\�
�s�K���~�4�'W�G]os���k?�>�'ߟ+������K��^7-��n���kq�;��$	"�9a P�0 $(RYpp��f!De��[���HʈQ���  �8TB������RX�G���#fhO@"�f� �A�����A
!� H0�P�HMH�A�@(���m�ͷ=}�?Vf�K�o�9��FuO񸮅���ya���o~nz�pPr�u:՝��tR�ζX$U�W�~g�޹��3~w3�[��e7l�c����ʽ��\Ց�jo�����7��%_�-�os��2�_��ɦ>t��w{�~�v����љ�V��\/ �{����F��W?�����#��c*̙?^�v3��}Sh��+����޴����u�+�SL{oo��in�{���k��W���^�>���{�?�������@��kk}b� KH��MDP$N4 # A��VP8��P0RZI�P
�!�LX�PBAhTOJ3�(	 T 9aADDp��O4)�D8�"62,�: ��* �	�@A�� T�!������;�w'/&[ې��W~ߌ����c�^~;@^���q�Y����)�����ߧ�&.W��=#7��K�~���_������������Tb����郲���o���v���d?��]�߻�>t�O�m^ϝ{�}����y�#9���X05�t�$& �d��D�I٧�2 z�3 Q�L��̠E!�$L�@G��@Qj�X �e0�l����pq��D ��0�����BY �P (EAr(R	\:u84U��� <3�P��%�&l$-�
H� /��FoDp(P0�l"l0
U`�K
�8p �3 `���x(1  c�RH��p1 `BP"��� $@@
Z�F�h2P%�QP�E���'��v}�ok�tZ�t��g��7>��|N��;��g�ʩ	�_��2�[���ʟ�g��6������5�~?>�W|/Ѧ���,�j�m?�\��`ߤ���~t�ܮ�{�|����Ѽ�d>���� ] �@%E���
l (n�b� �J ��#*�#@! J�,*@�8��� �C 1*�ā1�� p �� 8�-�B ��
 � ) J�XmH�`���Q�@M��8g
�B@�J���K-7�d^�;wu3Ӣ�o^�q�g����2��-��@��8�q.}��@���m+7oʷ�����f)[W�|\�[����g�o���d\���o���v�+��]��}���������L=���NNne�8�v��=�������[�k+uǯ����U]����2���61o��p�W(������u�k��"�/�����2+������f?�����"ˁ������;�ͷ��X����o4�U��*w���m�Kۛ�c�l!��J �I3P�h�� !(*�@B  �P-Qq��`	���� XE!���%�K�$@D"86B0�D�� 1V2Y��$�B|�%@
� �q#��U�0CHFh��\�DB�]��Y������>�����v\�t�i��?"���1}�O>̏�g����A��������mw�
��Q-�����]u�l��{�g�����������?�z��1��Kͥv��������l�76�v����6�  �� � �@@���`���p�� PW!r�d�a�
@&�`R���|[fa���`	�<Q�T0' W0�P�`@�&bP[4�b a2���9���<���ZC#!����`�!�!�C�@d�(e�0  u"�4 2�`!"K$!�T�($
C���@ ��*���� B��/#Cb@�A�,�P�I�RaR @?�d�!�0� %<�� s"H� @�p  C`�������\�����﵏���o��~�����ev�����\h]�����}��_����=���U�t�-�������Cf��O��[z���	��?�|��t����߿ߵ֧�K�����ֿ��갓X��%Y;\b� �I@X>$�"
vd	A m����")"�`,"G�\�CQZT�T:z�((R(��A@0J"�O
�q�pp)H '	;�DF� �2�@($m�!��P 8� Pb ƕI����%���>�G���u���_��?_o�~d����}�y�[�S������g��}OW��hW:��=ϵ�I��F��i�9����On�������W=�u�R����{/�wG�����#3����7_��G����o�}f����^c���?�͹�c�_d,C�i?�.�Tg-/������!�^ݱH�NS���
����a}[������_\�N���?����`W;��}���GZ��*cPe�����w�Wm���o���%z|�����@�! ``�p�$	�����X��c(NՅ ,���!D5q� � ���@�	 A  M`� �A!� +�1�U  �Ԝ � ������ ��� �� � I�{|�_�lA��߾���u��׼�lחƖ|���9,}��+]�-4˶��y�o[���g�Z("���=����K*�V���;�؟�wǮ���j��u���^�o������?��O��zEGt������6_����g�$@��Gp ���2��,091�Q�/�	%�� �@���� W$ZD 3�  	NP ᘼX "�� AF��k� �A&ɫ ȆwT���BnC�(�`eF ��z� f8Fp� @ �! ��N���
T T�Pi�*B�@��8&��"! !dj�4!$V��V�n+ ��D�$X�55#@���m�q< "`�,�()�"�<������)+�X�տ�r�l�����:۾n�n%K������?����}E��o�??�N��.K�7ܗ�Oio��^ki.�QY���z��>옷�_���՟��1��J{�d�������]��\�y�����?N�~��e7oB� �V 8�� ��*��\! 0#8!�2	�L4@�"�a%�� �8�-�fI� D  �@`P�"(� lp�E�E�P	#�G"��`�#c�	m,RMH �!���ab$8���f296�����XR�^�O��Z�;���'}�}հ�O��r~�o����>_������/���iW�/��B���������v�t]j��gh���o��a~���yU���5�e=�~2_�{���[%��7�,��^g��No,�o����?^S��O��/��Z�~iN���<M��b&�(���w��yO�����5/�}�Z?~?��g*�>��8u��7��z��rv����sx�f�[����o��?��W	�U��c���UMT�T�P�� �x��� HIr�)��B ���^q$�#j0.� �U  H!@N1� �`�JiJ�HP  (B��!�#DR@ AXm�7a�FB��#M�"�:J�c` D yQY8�O�]�3��p����o������=�z�zw#�6��0d���i��7}���+�x}T��M/%�����Ӯ��>?����߱�.�?Y|���?꿯���o���=���W������ĺt��w�+o�gs�V7_���������l�n�����^�����_�����j�6^�.����:��w���{~�X梅�{�tx�/˵��;*w}����y��g�r�w���o��w�����Q6�q�X�wn�q;�=^��ơ���^�t����/\��n�n��֏��ל�g_}S���߷k������'!z����	~�߽o�����G{�/���ի��������������o�������?��?e���=���x����χ�W�;�����������I�8�SJ}{�����m��jO}�^����*9>����~���7��a��}I}]o��dY��G�I�w��ϻ���?��Y�Zͷ���sѶǡ�o_����������{;�޷�G�eo϶w�[<�?����K��O����4�w��.��zҾw�+���|�fi��ݥ�>�����ަo�O������a�?f��<������jֻ9�/�j�����_�5C����������K�<�vϯǿ��������s��������w���,lG����v/��M����u_P�5m����k�7�2G���9�(������'���ڎ�Y��A{���y3����W]�ʥ�0}W������!i�����{�"�y�N�������U��>�ͬ�������?�ڽ}��8��b��]�����@�ཹ����^��^c�������Ķ�׽��c�{*��/Zw_-L�¿}s��&ٗ�r�Vy>�K|g���������uw�{��Gۿ�o�}�#�?9����Ow���b���w=�͏Y��?���q���m���~���wO��w�}�}�����A^��U������Ǘ��۸�������۩k�����^8k���o�\��?�{�y������������������3�5����Z�7�{���i���y��M�W�_=ݵ�_t��[���c���o�;�}�}v��a�?첶����E��������������w�?�z���\��������3�W���|�9���Ċ��?��>������i���j��Lr���;�O�V9.������ە]�l���M�����_4��߉�^?\�o_�����6�[����o��`���}�U���Ԝ��3n������o������c����O�Ծ_�\�i?��o7�Ϳ�\��~k�N���������{?�y�x��������w������u��~��ws�������w�����=6���w��o���|�����?�=������z��⾾8�~wG������_�w,����닷��ܟ��;�g����o�ﳽ���a�OXħ������ߣ��ˬ}vm���m+m��ۍ>=�7�o�mħ�f��1��?﷜;����y�K��G���޾qWQ���~|��ϭ�q9{��Լ�^Gl�~��[�wz���bq���^������O~T��o�ӛ�����o�\5��5��?�������j����-�R�:��/��[����*��t��"Lo��>������\o�n��\���e����v�G�{�}|��ll�~>z=�W~�ѽO���*_��7�ռ����g���{�)����]��E����*�ߣ{��}����z�mߝ�>{5�Uf�ur���鸸��㉈��,w�����>Ge�譗��������&�S�W������-���v���y�U���a_��_9o����>�_7��o��;�s�{���e��2/��枋������E���s�����������i�f�&�o&���W�~/�˛����������w��zoF���{G�z���Q���b�~�ۋ�Z7����k�=�����3��W=t#�O���S��oZ���*�������}����������^���W��������SU��;��_���o�~�k����qv�џ���'�������_��n���s炟�������N�?��y\�z��}�����X�������ݍ�n�i�W�Z~��wlҿ���m~cu��#�Ws/w����n���-SZ�7�o�[�օ�9{/R��g������v�_Zd��>d�g�ysf���3�߰ ��z��_��}}�G{�/���5��߶ͼ�57�樂�-�M�j�?����k7n�����z��v?����*IO���o������B_]�vj5{�]�����_�]W����ݸ��)_����_��_�U���,���Y7{ߟVo��g��/rV����}�f�>��n_�������f���r�o�߻�R~��܏?����;�?���kٕ��?��[�r���6���a��燽����󎻂����#���^��1!^�۽��W�h��{���������r��g��K���uW��f{��=��av��%�_m������wد7]ot|�!o���o�V���_�����E;Do�]{ݟ]B�������X�G�ۖ���?�Oэ�7��W��og���~߮�R5������w�w���u�3��u����O����۝miw?���������ݯ�!����������K��q�X?궿����n���>�U�M.���ǽ��_z�����=��-��X�������b���϶*����m&�u�m{�;����߹�7��]r��߻w��x�����v���Ѵf^����*�EC����{�nGW����?���P{3�����������d����y�c������������#�o^������������+��B���?�/oY���V�����g���_;Yտ�cjO�a��;�=p�5��$k��wέ�����,ou���kR�a�e���ϓ]�xz6����������د_�۬�8��+�m]����Ֆ?ŝk�����Ǐ��V��}�������w~��k��^V_�o?�Ԛ�U������J������{�0�}����{V�s����o�����g�}ʳO����v��g�f����]�����|~v�m���fv�{���4��mW윯|�����o��\��3e�FjR5�J�?��ş�?�n��ŴK]?q��WF}��o^���5����k����
b�n/2�?ǵ�����k�ó�3���v��6q�g�'��W�tOU�g�w�.E�����I�|і��|�N��ĺ�_�����}��_{����οv�a���u����?���X������?���������[������/˽�����}���?�|���������_o����?�W�{��.����|����r��_�������?���N������������_������->����W�+����W/�mOO����S���z�o��_�_�ww�|�����ز�xg�ٯ����?_8/��������#g��v�������ۯ'j����U�~ג��M��������v��[p�|'�|����q���~v�����~Fْ�6�;��o㝵ٽw��_Ho�?���_q������ό����+�_�C�>{r���zU�{��{���f�w�*G�����w��}ޗ��/�iV/u���������ѽuy�3'�V��-zb�w�p���o�����z9�y������}���׃[���.�ݎQ�}��or?���{^�?�uGK���Ƴ����3��r�.�u���e~^�r��U��\3}�=�oY�7�n+��U"�n��R�E������Ӽ�N>�^����i������R�w�ş��n��l*my��6wf��z���X���m	B��������S���+����Y���z>?�qU��9�l]���~5��x�O����ʿ��$���-��?�o�m�׺os1�����;��#75�}���y���(q�͞�B���>��.��l���G����������������1��ܼ����ݯ_���������S�n�������&���?���~�������u���O��w��.}w�����M�}����{�K|����_���𳷞�����Ou�����?n�o�vW?/�������ֿ���Go/����t���yD�ô  q2D��0`z� �t C����TP��ab�  �1A;��DZF����>
)pa$pN d� "+�Xp�D8&�� Є!B�$C���[f��%�G�#�0@�I*#0^)1�&����w������m���oyg|�s׳�{|�;����_�3�n}Կ������7��ӗ=��wͽO��?O��_��t����?���}}?ٽ�e����ݧ�W�������u���;�}M��mo���9�u�����X��q�_�OOw�s�˶���vޟ���c��N��/~3~�s������e�y��MO��>Я�������f�?�M�_�{nr����<s������j��k��/��������>��ݿ���
4 F��L"L�	3� �(� ��� W��� �j�S7( �!-�
�
�#�3�Hൂ� �;+�Ccd��(*�Ee!CTX0L*�w&�E � HK��j��'4���&0� ����_��^�����oz�ݹ��k��:�����3?�����o�7~�Nn�M���vl�k���fJ���b�]g�g������ۊ��N|������ֿ������?w��HoV��զ���Q��y�\/�B���fSA#Mn$w"h�a$
f��#�� #�fI�6��@�0H
(bmd�GnC�,�$�� �I	�f���Q�X�(��P%x��@* q���@�@�K: (4@3i���P-(�\D��lN:R��I"�8Ւ	x	�FE�Cܐ���R4Pfܠ����fT I3����{B�R�K#P��YTAe:��0��# W�� ��H��� @d� ��"�f������
fGfB���%��Y��>_�1ۙ⟻3�i��Own���&�WX��Ʒ����zk}��j���b��z���K�>����?{�/��F+����î/�Nhu��_�Zo�~x���o��j����Z[�$%��o��{�;%������B�����U����8P  	��@0N�T;jI� �a���*���pAȚB(�%=@�DЀ\a�1�I�P  �-���"�"̱ ��G0�� �<`D8 �
J`$I*E���|ϛ����'�������os�v������������Z�_b6�����o��[�s��ߺ���^��ow�}iY�_�/�c�O����v����:�������}lv��q}[�k�������<S�{UH;�7_p����].��쮏^����_߽�{��~����J����g�z�Sb�?������?��B�����'��z�_��5�qu������7�S��?�Ԯ�����n+?Q�^s�y�~�YY�~�����ٯ��w��k B�a��*� ��ԑ�������` �A��"�D�����q����LT���5AA^	�d�@���ESʩ���P��ؖ;�4�!" B��l� @� � �	 ��!�AD����\/�V��O�FvS�1�_ϡ���w����w����~y?��K���%f�����ݿ�U�x�>������}�L�����|���=��������������w��{ﳿ���?w����_�Q�����c{�D9 K$������aiG��į&6b��b%%I�А$VD��!`�$�3��@r*B�B�1 r�@�Hp�"8f��A3��#-�F�"�����C�`Ȑ$�!0$�4����Ʉ�f@�����*2�  ��N(� ��L P>�zG1&$��댺�+4�CDP[A��C,T&�$�E
AeD�đC�%�#�^��#B�(jƎ�D �(~c(�"%p0T$aB������v�ܡ�O־�)�����>��������<��f�����Ǯ��_ot�����u����I�*�R��ݶ���u#�B}.��ύ?���x��?ϸ���؎��f���1~�\?��u4��֯��w����)�݂����$�f��0qbu���c�w�@$p�NGhR��� Ãj�
�"E!sj6Dj@��NȒ���lS|A�'a�O!�	@Y��x��@@�F$J$�BA�-4��� -���N�u��QeW]֥��ۿ����ݭ���y��σ��6�����������>�=�O���{]��ȯ��+�8����������_얻�.���m�&
P?����V�p��x�p������/��y��e4��<5�imw_�P�[�u������@�}�v�����^�ُ��"���d٧��wz�������m[����˻���P3y6>�~N���]��i����S���Z��սm�.w_ɗ����v_'֟�ܦY���lݛ�)F����Q"�H����2и�.�@4�i@&(*I��p�� 0���0d�l�T	a�$ VJ��AgpC4��"+�X("� @BFz�Oc��P�<B�|ED 8��`���(�� �@����w��?A{������߷NR��_>�I�6�w��^�>����=�o��o���V��4�^}�����2�ǿS>-�o�G���{߾�|��������x�}��������oMo���֫:�~	��뾇��M�V�x�0@4���"��$P�0�@ �-B���`U$�F�\(I��P'Pe�!Y� 1(9,�I.���)�dڞ�L�`�U��� �����aa@�&�� A��bdD���AM��@p�)�m�3��&M�'��b��4i�(�)q� ���"#���`�w��X�ŜJ���X
8��
�� �h@7x�i1 ��Nq҈��T���?gdq0�(w���_��~M�:������������_����<n�{���?�n�'��g�<�V{���ާ��_����w���wߛ���R�\�����x��?�O��������n�/��?�y�]��Wk�����}������ �XlB!�`�F	J�4fȀQO�yV
�E��c!Y�B�ʃ6901Eh@�*)5�N���p��D�4:�! t�D&R52�e@g`��c�iH��H�"�X�� E0N���_�v�F���sto����l�y<�7��4��>��Ե��W��?�?�����sZ�^��m6�c�~��?e��_^�3l޿����r�����ײ9?����st�����k{�_����}s��p��^^0�������f�-\]���7���v���cq����z����^}�φV�&��7������p�o�<�wls]��?�x���������sc��iŜ�/}�����~�C�������^�/��W�/{�g���^$Xpl���@,�X�#�0i� � ��@�p<�|����0P�(aL��P0��D�VCBT�_��ȫ�$��B��!�iv�{��B"8�VQ�� 5MR�A:T���FyT�.�ϯ9��N��ok�W���wް��g��w�}�;��{��ù�sڱ��W�O�����_��n�ϳ%χ��?����t�q;�Fx;��^s�|��������Og�~$W�;�k���'��<�C����5�v�axQ��rX���&	:���Nrzbt�
��֐����, n���`#V~#�M*w�b!�6�d�T% b ȃ>�E P0B� Ȍ�T�h���T� ��W
T�HM�F_�p��b� ��" �. �hXL9p�"��lA�����\��䨵!(`)B��� 3.��	E����~%e�D43QD�� � �% L�$��L"E�0¤�p`( �48jz X�Og�it�Y���������ĵm '͞�~�>n�}/����|w��}�׎�����ߩ����r���������N�/ٱ��Rx��O���+y�~>�o=ZZ9���o��k9���uz��x�M|��b����Ѷ����B ��C�G �A�0`�D B$ZA ��$�+(����A< d�H��`DB�J`�!�!��J  6�B�
�&DJ �� ~�$r TĦ	P@� ��BI�(
���6�rI-4�D�(�+0,.q
9���[�I9FH,�@$$�Y��08^�p��"�8��PA@�CR�"�S�� �@Y��hc�%�P��.�8��d&Qн�B!e؊AGI(��@2�U�0 & "Z3J���(1n��J0 0 j��΄8%;��� T�IN���숈���pF���D�8 �@Zd��-���L��8��H� [�%0!�$�42�1�{}!����1��p�^P��� 
0��%��AA|�P�"lF"XĲ� �PH��@(Q���8EA��k�01c��  q�D�H ��l| ����ф�!'����(����� D �0 VԖ�8@�b8��8�EP��b��2,���C�r�%DL���
<�$��-�DB� 	q�z"�2�D0��dYf�
� cN+8*=�S�dI.��T��A Ϫ�:Z���`pn����&�BJ�A��
B&K%���"�X L��Q����K`*� #e�!Q���k�%G�h���$
�䔥�K@4E� �3$fLa/�F�&��e�&�D��g�0�2D�P d� 
H��h�(R�*3hÀ\����e��P�*#��$��+�1 0��TW��p �R Z4$��An3n�21b B� �s �*"�68@$L`�$@ARAr�� �!���Cp��@E�E�,� !~���@x%!�Q��8��jw#��)$���(��,��B�a$�H ��[Q�� Z�@TQ#�Hɐ��P�5� #�  �5F��  0cġ��%؀d � Ԗ ��! 0"R` �}p��R��(�B &�T���􀄓! E�� �*�1mE 0�X�P$�`���5�@d2-(�c�< ����!��Y��D�9EP@@� P���SefT�3�L^� @� &D �Qi�VT�X��*`�T�� 0( `$`�X0"�Q��L��ar1��$�!�CP( `��3��xHв��! DF(��8Tr��z�	������G�B��a�FR�\���ш�����yб
�6���Q�.��И(@�*��d��#��� !@^R $P3�DDp6$��0`�i
��[CH����T�� ���ʨ��  � mf�`
B �4	�E�H �� ���*��I(r� tH*Y� 
xP"�4��8
 -	"Ȉ0 ���"��p�R�rl�-@�"0DE )���d�p�{��Y3$�,��@@�A6���8�0$��c8F0 $V� F8cD@ERJ 5��R�A�+2� xs��
1���
 �:��b��6�6��F�`"���q"�!8���pL6P��IP� �XE]&@�ILԨ�IEp��
 ( A@�8
$���j �  � (� �tBc ��  NKK��aTD	<��y��@ �� H2 %` A�4����&�D���R �@���4 z2�R@�2�A*
�b0�'D� �vb�d�(rA,���� ���P#���	&h1�H�0�D> r!�`cqhA!�e @��T��(�ख���R���US 2T<��"	?X����%��2Z�`|(���%!L"�ԼB�2�Yq���Q�r�Ph�T�XHF�2�q7B�
^�0�c}U6\����:$z�0D��0�6@ �P�j�+က�0@i��T�� ��0$ aA6\�(��B`4��b��42�8�bA@ 2�QB5� 4(��	
 D2�90 cg�H/y�����¸0 ��@B�� `�8E��,U9A��l��e�pP72,��LN$EF�D���"����" �<X	BIT�Jia"!�P�&� @�e����*PP��" ����(
�1�	�,�q�
f
@e!�aQ`���F�v�FG'��0�M����0 D�sBp�����D5�XT�%h�t��0�,�� $ ��&����b$�J� �@,'
k��u@�b�X�8"EE)
�@���*d'�*'m,c  �
��+1��� �e��P�"� ( �D|�#c����
� 
un-��T��AȢ� (`7v k���Z{  T
D`� Sp���2�4Q	B �@��=(�KR	(*&�HE{ B�!�jG�7J ��E�8d`Tq	 ��(i�Q&v1K� �@��p�!���M�F#�R�3�8�EY�%Ib�*�t��G��:PD�b<؀$Й5�@Fe8��I8�@��2��%�L���6�w8D,c��0b@"B�b�`��$ R:@ ��$� $l`�� @  ��pl4$0����s�Ȥ��� TAFS�PH�͙@+,�-|$YA 9k��I' 4  ���&@(�. !�xB ��
HɃWH�J � I � #��P���:�A@  �� E�
�A� .�ԙ*į��V�(*@ �L@ 4b6�`�,$6E�)
��"�N�!9s i��L8�h �]��
	Et�"��<] jtB��N�X����@9a��f:���/gG����fk>&����a�XV��!�4t�ư�j^��(S\� c�P�����`S����Q�Pq  � p�V���$�@DNP� Š�@Ŕ1�R�ـHX ��`2
\!b�(4�A� S�b�w'* 
`�� �i�bP4�p	I�p؂(��uJV� $X� �*��P(-"%(s@q��D���P�H���?��	P�{�R �����Q�(@���0�T���RP��ʈ傥c �8@Rx�A� �@Ze("E
# "k�dC��)�� JP1��. >�I�����@�A�
6Y���� �9����$��'�"�TA*��K�=��@@�: Y�7�� 'xpQ<�T(ɘd�F�P1�D�_� �'�(B�b I*��0��� �߬D?�!�8�@�U �$(� ��`�
 (�C 		����HK  ܂��P& �`�P�� ����@H��d4�Xb$�� �Q� (Yd�"KrUAE �q�N�PaB�T&t�L��! &r�A��5�$<,*8��$e� ��c@�fG0��(���`�A��p� F	M(��@ � ��(,��0Q1*`�b Ah��2)$�����~�|�. `��:�Z� 	�&T���Ba�"b%��e0EA �@ڿ��"T� � d wĈ j��! $��	AP,@  8h]� b�Vl�DE	I�t@�hA�A  @@ ���m�P�c�	@ �Ό�� $����DF~�<P,E @�Q� �PB�%�� �A��*V�V B��!`�+ D�`A
��I� �a	d� @Ħ �	�pH��!
�@@�

��� n�2a& �jLL �А�c8HU@T�@G�	H� �&1@�̶GL�����6p���`#�f�*�vP�� )�*$��(A����GHH�DBH�&��hD&`�(@$)"	^ �#��!6 f����B�MAnB֢��Ԇ�
�!ˁxG�J�&�$�FP#V	 ���B#I��b�2�%Y D��hG�f��	�F&�%N�� �9V"G�* V�A(�@A��H�9A��H t�R-	��S�A'"! 0�A�RGx�" %X�"J*h)��Z"f0�i�P#D!@�(fB��.!3�B!>�Bd*\	�@�DFfS$�
#L��r�@�h!ޣ  �*�"QP���� ( 0 @� $���� 9v�G�H W�
"$uH"j��qa��& ��XI �=�D� ��#��`�b�! �$B0Вb)��N��p Sؤ �3�0CJt p  P"�	@�2�`��j0E �Zp�hf��|�R�$IU�	�#Q ����P���K�L�@ׇ�C �wX`��iJ(�;a6��21m�8 ��a0P`e�_"d`P
5K�F�HB�E�@J �$�CX
EH�6"f20�dFI@9����e�T�L�,&�x�M��PH:R����Iu�4Tj�%4 �`�2�S �̱�(FRA�  ���J5 T���!1CC
�8(00"'FI%� q��W-+EC��\E��*��Y�P@�D��G�Dp�"��3 ���P"� M�����(S���9�c	n�Z&v"�&`ƘsC� Jx�F!� X+��B��Қ<�ap.Pg� D�d��  	@"��DP[A� ��4f>J��)�`m��BK^�	:)�J�rB� �)���pr٘G��x,�y�A�T�.����H$�
4�+d$��C��,E\M�P'��`
�	h�	�{����)La� �� a29
HтP�I��@�D�UB4`W�AIP�A�*B
GM Dx�"�����S 
bg�� �}��'��U���)�@�H�` �B  һ$5�	JD 8��  ��"�@�EЂ	��	�Q������&B F���;f��R�^�	D�ր
�� T@
Q3�c��!��I���� <,P6�#6t�`PA6>���gS��DUe"�rAd� Z!��M&@q ��*���Dt x�� �  le�����4�J "摞Em��   (i ��X	��T�d t H"i<^6@ E�@D �D@ ��(Y�|�9���8 ( T-s�@@�%�WH���x$!tF���i@ ��
H�1浅C����@� Fb�P��BH�8#����`� !��
�����,�XX1P ��	�(i� C�@���+D�)�� ��� m �4" �(9LTɂ�hΓ���8���:�蹉H� pҠ�7)�S@w	��eH!`GA�E j4eչ q�d,$@$v ��)���UJ�MRA,�� �D0 �hj�Bv�wqDTE$(D � �B(��@'B�P���(Q� ,�E 	G2�J�����N�@IW`

k@��7McH` @ �� "���Q* H :��`b�P!�U� @z�{�<y6�c�@L�'�Z
J`�	Ԕ�)r�gtSw��A'S���P��%+��HE��H,�+B�  ����05�ȯ�$T�~;X��qI�G +�1�a#ΕSZ$!A��*d� ��uD�ba��	3dE���2��ATU��l���T@w�Ei�3��)Di�C7Sa/�Y@�pG$���J�6%�mT-�j��v0?�č �i8t�7YYL`'�p�Ea��`�30� D��rrI
�,
��~X�"X��+ �M�jhˣI�iBt� 2G
Dd �W�J(h�Q  � H@
!������0)��Q�B(D@bT��@��^��BX4`	   8
(2'�� �q�� T��X�< Ѡ ��K	&�#A$���Iv�]` �0J
R�T��@bD&9l��C���PP`�(�$]<C	�p	��	x=, jP a@ĈdYZ;p�"XS B l_$��Z��@s��$PH�=[� �Q�P S/���.�`8�B[�YJ�M@�=�h	b́'�����b4�ĔK�%�H �#��(�� R�@08c!�X�F	(
4��H����`�$�@B�h�f�8�T`  .����D� P
Kn- ����! (����B,m
�!	�H�@P   !@*�nNB��T@�v�G��1AnT�$Q�� � �h0�r��T  ��W��1(�J���e xF��V  J@LY��T���gF�rI�J a@D#�(��a@�r���9�bq��@	8pOD$H�C���Gt}@D��Q�H4S@�J#%�PH$.�>��p�$ Ex�0D@Q�@1PP�������� 8 !���:؀|��bH�� �����B�8 � D B�EM��q$ V�1

L?ST�O"E D�%��C�d���(p�B������AghpU�� f:�@���   �A�		"dtB]  �0/�9��E!EA`�N;\�� �B��S>.��D EZ (�"�VW�9���p�G.�da�v1@�(�(V`Qs~9��d¤�H4�P��JB���$��9���3�!PYR@%���׭Q�H)!"Q�
^DpF��x�����x��<T��Xݸ���E1zT�"�tRE�4襄��i�`�D �$�@�_P	��(�f�L
+x�r AO��@����EFMD�^Q"�W  �t���R�!�(& � ���`;D<$ׅH(PV�X22`�� T�B��J���n��Ac�� �	b4���0P#X$H��N��b@S
G�GA

ɰ�C #�A �PD��"]@ ��HA�L�� �)� $���V����gD��	��z�D.���B�PFB�Bf�2)�1���"��)�C�(�`DL�Hz��� # � DQ,��pÄ!!�T�S b�P
�dخ�Q�HM �C0��b$DD� �h3C�� 2x@- D!R �  �� �O�-�'��P�̢�� aFXU"{2@Є(�b1F�@���T�3�H�<`!(��6J��0:
��dFdD�PH1 yʠ���JA�1��f�1�Y`0�#�d 8��P�8�`� "��0�� �!%4�ABFgA/��+�0 @@#S1�UC3�C����p�O�h�dɐ�FP�"%�	B�&���5�� 4^@.b����CCl�Y�	����U,��`�e�R�@� �<�1
�Dp�l0$�
 $AHG&�� h�H �$BI��P�����JG�,��B0�$���$4���
A� ! 1vk�F���53
(��n3��8���*�6 K��B0!�i� �*����PWI�B�ӴH?��A�Q� &E(R�a� *a҄����1�"�al%�R6V!6A�x �US��UA7�
�3 }LdNS$ �J����B �%B:�U�H��X @��@��1}��!�a/i�atQ��
@�1HN ��((���QBe	 '40+�ܿ0�%`U�Ɍ�@@U!�9V,2��� �d2���B��Q$�,��HY�	��J2xƇ�@j��*�
tP	P"(E4@�� �Y� ~2`�[ĮP���0�)�� �'
  �8)uA0��@p �E��}�1�W� � 
�T.8/H�SKZ_������gqVy���w�3�6������ܞ�#G:��Y�w���~����S�J'��[���S�Mo�kS��o�T������&�)�}���]�'�w���5�O��/��{g;���{q��	n3��Z��*@� %0, 0!<�F $$���0�.``�D!I>�cVb Ҥ�D2 Z���� �P*� ��U9N  � ]�J �b�* "�R��h����pdPFj���P�c%
U(Eta �U� )!0H\�& 84ƕP��`<" �>@� ��� ��I  ���(�@���:�H!�fb h� &�2 �+��H�D���">U  
`j�4�2���<�|<c���������M��v/��{�g��ҿj�fO�y~����N���G���~����%e�O�HeO�|j�O|�g�K��wW�\�U�����S�m��s�u��-�[�|���ow�����?o���� @��	U0P�% &$��BP�\����`�� �����g��E�(B�P��@T�tC���`��B	1`*`6 " u�B�4 �ET0C�� ��H2@)�����J��ƽ���J6�6��n����_=Wk�����*lKq.�n���ז'4�����E.������'VysS�����G����}�m���N}q���N�u���YG�v9#�����n�/��Q��jS������ae��?���>=Ჷ�1��ў�^�7��\Rk~ԟt������'��Y�c�o%N�/�;�}�f����������-vl���'�g�ޕc�R?;����65vn������۵��u����ެ5�p
���H@��8��
 x
i	tJ8z��)���A� �,"��m$�P�Bd@ ` � TS�",!@q�S2�@*l� �� � ���� փ6��(��� �$ � ������G�>���'<s/�(�_H�v́���9�\���]�~v�~h���K?s/��z��e��Qu�wd���4^�{�tY�|�u��YU���_����}m����wvs�_�<��������G����}g�� 02CAE�>��OL�Rf C��$X�23> ԁL< ��( Q@��t��  �*D$�j�K�B$@D�05@� � X�P�(C�H��0����H( Ƒ�rn �;j A��@dG���%R"8("D, �@�$�H H�3fQ:�"�4"��!`0�q6�F��2@�B� ���5��k`I�8������P1P��$� @L !#H ڈ��E�d ~_�>$�\z|w�y�KV���O��.���k�4f�۪<�v�m�i��M���o�-��6��~�w|����n��5���?�sC;�_ѷj�Χ����������u�}z�\�wl{�~���F?�[��y����*7"@�H��i��@#
0� ��:�Hd`%�`��D�P6��H0��0��` C�@P�D���"!Y��#<����U����� l�!4�	�I'6/�	��*"��cP$Ċ) D�1q�O�Ҙe�M��V��l]��^�e_;�ۉW�u����n��o�Y���'��/:��Ϗ�Yv��w��na�>���1���׼������K�K:��������x|%ʛ�M�UzG{R#i���F�oۤ��:y����/���泓o�e���'[}���~��V�7A��|�>5�RG��q�������m�z�M�������&���,�������>�t��;'sJw��nMZ���>�Cк�^���Zj���78����^�����H\4�Ac� �6c�  �`5�.�6BC���"� � ��|�DP�� ` B ppd�� Yg�� �
���A � &L�t�D�BPY%�%XЅS@$#X�h@�� k�1V}��I���Y6֖�N���?��ʛ�f���[�l���iw4k���[������T���݆�}w�*o|hm{i�/����pl�E��[��{��崚)���7Nz���������uo5��ǹNOu�ɆA*bB�y"�8�5B�|�a"FiR�J0��a� �+�DY�BK�E%Am�  '�0,+�B�@0dc�D� a$3F�� jX8	:G) �X�"��Ђ� ����I�PE 4�KC	A�L� "I�Q"A�s��l�@A0E�%� ����MGe"�`�<�AH"�<� ��&H.`"�)%r	  J�K:#w��+cPX U@ P�բgE��C)�;��t�~��S�ʟe�-����Sm��2�٧��/<��5]�[�sv�7^>�;���K>wQ�׳;M윸��E�Q�gP�
C����U�r�n/���ג~�5B�KWw������uߵ�O�V{�h6i�s��@B��4T�X06D%@ҍ
Y" ��&�H@�� ]H�aPd�%��	f�
�( 00�4EHQ����@���с
$�RP),��d � ��@%(�`V�
� t��9��R(Qz>�������������A��[��:����g���-��n�{�����?��ޟ��&ǵ����X��?��W���ϢN�W�{����ğ��)�?�����i������n�;W�W.�ݛW����uz{������������ҟ�������۷&�.׷�X�������?�R��r�{0����u_v�L��o�����t٢�_|~~��gN��2�}�]�k����ߚ�k��/=���*���}����zӷ<[��`��k��@B 	�D"�%`C�� �@AnhJ�s4# :�&$@ � �J`AFF�$cp46 �A����bY��X	�CA���� @!%ȓ�@�P
���$ PPC� E!@]RY(�h��Z�zB���g^��o�E��Ҩ��o�rs�W+�}�^������Ɲk��D���7������?�����?����}�j������̇�����������E�ޯ�,�w��Ct�����c�^-������I6ב����# XB�)�t  �Cx� D �٨
H������ �X+�AX�#�2���!�����Hp��ʃ�%K��� �!�(9v
��� H&���$X5�� �t�  �f	p``t(��z	 �`00
C��	��X� $ �P @VPR�)�p"" Y� �� �2��r�0H����, �G#�`c�M�" 0&��0h HC��  2S�Q�8A! d$��K���3��Ͻi�΅��gҚ/��Cަ��y�M�qvgw5�#�#V��u�c��S/nyY^��{��ǧ?6���7�b����63c��}����^�ͽ���^������ۓ���ݹ.-7�[�?���.�x�h���2
��d`$9fK@9.���i�AaQLDM�1� BvgL@�� ��}S �O��g0b�D�#B��D  э0����,`��?l�	�BS��0�0�(b0"2"������؛��s�'�n��w{�������=�o�G��$��g�{�K{�z�s��m��z�c��nT9r�ݽ���6�u�~���_g�J�?�����e�I�m�_�szs�{F���e�w�)c��]�w��"�����oﴜէ���N�����d���9z�Ӝ�߯J�˞>�x��{_S=�o/��V�2�~���i������؅�������)��Y���˒���Jz��=���í���[���{���8��?��<�8D  MU�(���D9$(H_�D����)��P"�@ B�B`9
>:{I;E
�P�$�� �o�&��!)�� (n D$"D��$$s���`��2^0 "� )	�{�w/��W{����N��?wk�\5�˿�_����Y�ߒ����Y̾�M|��˃���R�p�mzZ~��j���g3���/�Lʹ�/�?�7����,��[�������?Cf�?��m��w�7�z���������ܻ�I��0K��SQ.E3� X (�7��5��b&U1�ra��9��2eu"i���a `�J
�BRT� �n�LR	J�� ��,�"�Y���g�8R2H�a���h	�I�t� ��a ��4��� Vt� H@~c�Л������5BVT�@2�<Jp�
@�<@ Fp�8�,�H� k	d�s�+AJI(O@��H��8rf�{��Ec D�.`FE"EB"KH
q�]����_����|Ϸ�y�[����߸�K�ݮ�O�������m������W����9�������yeߌ��q=�{q�����������^���M�޻�i�z��<������7����9���f�ߘ�����<ġC��FVG� ���P����$1�lBy1Rx�
�	f��M 
��xR0�l�*�JOg�d23ov�#  �ff� @��P^�Jr�2X� F��a؂�˵QQ����Y�9�x�[٧�������_����?������ޟ]�z�������2��mܮ�g�z��x��~�y�^����s������{o�w����������x{�O���W�.[�\��`X���۱��sM_����;���mf������,�>�z�T�����^���п����~�/V�����_s������{g.[���w;q;�����,�lw��i����G�����S��~��?��*���S�~�+��S�~R�u�����ǹo��H.U9raC�-*6B �qa� ��
��4�PqH����m �Q|������
K�6"X� �Js � �!i�;U$ � 25p ����4Q�RCi� ��=��w��ӻ���{�]wW+��ks�[�n���}���=��M?	���oz��[�Q~�t�^(������w����߿����w?�}�����w�߸��������nu��y����or}׾���VPO�G���=�	p� �� x�
� /�L�	)M	]bS��MT�*$�B��QD����J����AHX�B� �Bk�'�`�rP&��-��CDI AC45�fO@AIX��@��1�e�[���Y"�AJ �BU� �9QT��B �8Jk��V(CR�BЬDaej��� kM
֟�		x�ҁx�Č��Ƭ�B'r�� d�c�-���K���p=A' %�����ͯ߿�~S�|G����m����^����^�������W�����ۧ����S������~xԾ�����v叟����g�_��r�_�_���{����f�?WI߱�Gݖ���]���_�������a�� �.��L#�ymLD�d6���+@@�\�(|P�O�0�P��%�Aք�qQbs	�`�Y����T�` D)A.@C 1�E'��  AZ�X��ϒxQ������AK"`�YQ����z���}�����8�_�G����׿{�
���j���_�����������o��^�{�h}��?&e�C�o��w~UF�0����8w�����l���0n�Q���?_����F˘��u7�����.��������'Ѩ�k��=��k��G�������Gf5A�����v��4��b��}������s��������������n�w�ˬ�o����뿫���}s����ғ���s|<n�|�����_L.���sOt�7X�}�Tx��
=��d�(����T'��%� �N��dЉ���,D��$����e�40�c#ăC`@4 �T aQE�q��!��,6k�E!h��2E�)pJ[DRp�Ä�����:_��۷o9���d��V��7����_m��_.��H{���]z��~~���m;��o���/�e������]�w.���]���?���צ������n���Wؿ��o�R����7��G����7s��F�����>�� �G�2D)� T6p����`�0!��e���&w�QV�a bᖄ@F��@M2�D*S� �	F;8IYE�BلHhd����Kb�9\��Z�J�,�*H���4�.�����0�[���A3�@���c@q��DUhpF�&2@���JĄ� %�,Iv �0`�Cf��b���� #/�@�"����T$Baൈ82D/0��1��	�@�k�6��U����q;�����c���?^�������$��k���W��~e������ߟ{��}�ov������dr�M��sy����Y�}��~���-L���z��7��֍��{'����o
��Wo����c�n˴x�Y�^*��U�\  �C���� ���� V�h.�`Y.@!���[C�:�@,�S�BZ��%�J1�Nd5�$�� :L -�J�V>��K�L�1�d�b�F(�j�Y��l	���_��}��S�)۟�����������g���;��g˿���]z������_��m�������n���o��϶������w~���c���~���������-j����̷O��$����,k����b��������x��Y�*O}Ϗ�G��;��|��O�|�?/�v�[����E�?�r�<p��v??������f����U�_�ݻ�_���&���F}��r���u?��?�k��_��3�����}��{i�k��ݢ�����$F�I�[�`?CJc�T�R8۰	�C)D��p�l���$̆��0oX�A�g�"� ��A ���B"Z1� �568��0�NB�@�@�@i���C6|��@��3C\ƨ3���/w#�V����a�g�ҟY��D���n�~�:w�Vv���m�����qr���7������u��=��i�o���<�����A��ﺿ���o���z��c~����k��__����Sw�o:����������������@��H���ae�8��yÄ-����A�F�P@M)!I�X@ae& 1@1"�v����H"�A& `)�]��A8DD �@� �2:��~)(`�JG��J�D��T1�t�CT���dƄفXR�p	���� @H�D `�l�M�@'�T6p�e��5L�@F��C Ҋ  XYaA�P*���
� ���Q d\��e��L���TD�KO@��'� �3Hd*U� ���u7����m:�ZG=�����������.�z_��~�ÿ"�����,��|���{�{�����}=?���Uw�$��vO�S�m���w�盿m�F4������=���S�O��<ɵ�-������y�Hѵ��c_%!J0�[` �2 `�e	���-��	c 8�!�Ҋ(0Wy����"j<����ȱ4�
�	P�e3Y Ƹ�K�A��X�গ�P '��$
���_�! $yA�{��SK����o��f��{}n�7�w��������w�ջ�N{9˿�t�΋2������������(���Ϸ��?������m������}����w���{�=�ݯ���������������Y{_}�ߏ������{o�~��{Y{����������~[|��y���d���m����xw�A�}������g�^����{��+��Β��ݛEy���L���w�/e�=��ػ%]��9���K�����A�z����ch���*0��ܾ7�+��[��&Y1�0B+F����Č8PA
͗��D�xI��7j �a�ÙH�H���G ��`2�Jˤ 4�\�s�`�V #��L�����#0WD0|��$���� ���MDЌ�@ ��X;DC�&�^5�D !8�
��$�'�P( E\U#��4=�@A�!^I4�`	Vhp�LP����Wd(g2	!<	ݐQBp��KdV� `!�� qЀ��P�$�")h�5 e�}�&�.���ub�߫W�^����o�_�&�c?W��eKo��'������\����p5r.����^�����O���]#�~LwH��ڦ��Ј��~o��;���3/����}�����5�~�a���N,^�����v�F�-I]���_̳�7��wՏM6�[n������(����&�_�qW���~vݧ�Lט�'�}��n��>����������0����k��݊Wӂn!�y���;`����ݭ��0-�	�D�b3Q�7c� ��P�9+5�.
������@�炠�b���%	� HB(���5
AbIde�%`L)�P&<D�@�A8�hł�@+� G\CI��J�l����BD H0n�2󫻗����'�2'���� �����������z�S�̻�a��Q��j�I�5���Ԝ��z/Fo~���[o���W�����n��e+�=\�v?3O��f��am��~��RWT����z0�� lq�"�&� :20W"I�`@A(AT. ͅ$"	=�EDG��∵���, @��$�'�0�rEe =] �Z�X ������ � �$` � �t	!��L0� �-@xh�I�	H�qGP�DY"�@PJxR!E��,�0�TƆNQ�0p
} V ��# �B b0�xCx�D�@0�ϔ@
� �Qޅ+����ȀS DVP���ʌb���۰�L��������W���n�[�yO�#�>�"��Iw��o��~���������N��Gy���ù������q��#�-�ӳ�4[�r�2�,s����7��mp���q���4�3���W�<��Wy��-G�$<�$AT :
�I$� mY��# 9 b�p� ��P k�2h�b`$� �/h`�QC��`��P�FBF�7 �0�Bq� �0�! Gr��DA1�h� �<��j�N�`�~t?*�ŏ�S*w���w�:����;tz����<��U���-_�����OE��WQ�;G�'f�z�ƿ�z8������բ�L*o�������������߷�'c�<;?�=��u݆�q;|�����?������UY�|���uŚq]_Z5����gG���o���b�@mn���&^����c���w���K{���x���Q�r���R��W��\-k�������5��}4�ھ�~�����|�O�������� ��
� KC8�(�E$�T1(b��Iu��P��s:r�8PP����bI +���v��(��"%@�
��� ���!������ZV�D���}E f\���e�2�0(�0�յz�G/�-��$_�����j��?�<�k����������������]����,~���޴0ߜ�������?���j/����r�����W��w��|���M�鞎��	i����sz�i��Kmp�
I� �(@�#�"%ai�1��" �B � QT�&.��-�@ ���nd � �僴9�uX�d�BJ@��� ��)&ᣀ��H (�� �B�T+ �0@�$���~�P, -#02 ��@�b%�mv�A 'E
 `hp���02RJ&D� 1h��D��B� �|T�؅4�X �D(@�B 5,p@(( H�2��&x��b>AF JD�q�  $ Q��a�D�bÄB�aR ϳ��O�GG���/}��O�o����������6h�̽7������[���b��-j�[T���?��g�[~������o���q���.^�&{����=����ʻ��]{:��R��/��:o�?p�y���Q�Xn���,�@ �" -�0(��,)�a��F�   p����! I��#* �0�0"
 �nW�
��A U�(M ��AH9I`k���X�$!�"��D ��L�0��.&�"`���o��'N}]��q������7�8e���O�z-[Ր����m�ד��Kܤu��ku2��T�����������}{����~��������W]Y�����j�������v�����GO?����~�e?����-���}�b�F�����2?�n��o�ۻ7MʐwQus��9��U���U���?���	�ǟ�;��>}g���rx_����z��!����F���C2��߫��m���1o{v��O���W�ϫzs'q�����Ua� ,��`� �"�2�@�+��1D)���!�-TYH�`�@,@��`& �J@ H
#�rH����*��  `� $�9�@	D8;(�C�.*�!�Dt�pA�2������f��X�t�����e�zg�v�V�u��^�ǯ+����E�+=&���<Q.�&�.����+w�:/o;>%���N����oy{��|�/�U��_n�����w�W9io�ǿS�mw�s�V��OH����ݩ!=2��,01d�B� `&�d ��[M  ����r� СP���V�4�$ Q�"8%`?�u�P9]��@H��1����-RXDȡd��	2z`�d���a2>�&��C @)�`(�3�`P@�B�Qa�ԍ��� F�� k�! � ����QBA�20��D�,���%��dz����0 N��U * 	X�e�JV�!&�����AшD�|8?�=�%WW�-z�Ho���t�m����;�~�����{�n��n��(���������ݸ��׿癈�o���q��O�_[�<�_o�v߿>_��K�׽zgx��{�z������߾�C�l��l����XTOhEp�H�l�&h�p��+ $� Z f!R�	`�� n���
�<,�a���D&�ܜ0c�^	�)9� 
�L"��Ж#��DJW�d<�D�2'�$T�!�3�MN��v]3O��~���?5��{}���`?��v�����'o�{߻zﹷ������������W�ӽ]5:��lmn������n�'Z+���?[���{����[;��^�\���e���\�^��}���+�#I���|�F����G㮮��U��(�Ĝ���/�7߯_�<_���)�Z��?�w4_-�o�o�{����/[?��}�q�Ҭ�^�Ꞑn��\�~��w��-�6����_���^�߭l۵�������^u���d�oi[@ A�, $"�@��D�Xap J�
�����D@���FEm%-�
@P6Dc@��(B�W�)T@I� b �H   -�Pt��8�QFCD���aT%P k�i�TF�A?����ο޼�����c{��z��mۖ������=�x���p��������>/�������{����kw��{����~���Zzw�b�±�W����>�v�]^���s�?o���d�ww�z}����V�=��Y�����0h���1@Ȑ/W� ��01��cPh�(`�����9 A�!"�<ࠠ���(	"𡀄�� @�E-�t�� %� �A	bUJaB� �؎�(-�G�����"�D�DEH ���a�%�"�"��ER����d��	mD�c� M`)��B ��aR� �"� ,iB	��h ��  .�3	���� ��B�����@pB�FB&�	 0	`$�	 R�@��!��|�~��W�<���z~?��}����6'���J��&����Sˮ���7+~V���ڻ\'�>�-������B&G���O�د�w㫲�l�z�����]�޻����3$��GԶ�z���R�o���Zqdo����Tn�3���~�;���{���,���s�������uף���]��v��מ���l�����2�qU��[�����;w�sN}N���\��|�H������7��ޅ�}�xw7����]�t=����2 F@� �Z]����)3��� �v�a A�T'D�Q����a �o$Na�d"1�-'�v�(#�eP36c�� �b'��%" �DA6��F�h@`" B��(��2 ���
B	�%�J�a( �$P��8�\R4Ik �"a����@�@|�JR.ʌ��QVI�@��@��P���a��8�"
�`i$��|1�Q��F
�l`�G^��C�(fd�4 ,��?Jf�g������i~�	�?�S����0}^|����2��#��۟.߻[��U�>�jB��?W�k������������������n��~�5��O���q.�����N����[�����>=�_�6;�����#�|} a(R`XC!a� �2�a �d2o@p  �A)JE����	@:X$�  ID@�`�g�4BD B � �0\*�Ɔ�rZ$��+�"��C$
x���x(�D������M2?��ֿ����N�5�Omc��4t�������j���󾯝���~�q��jk����߻���[��W�]I��������5���o�t9��vI�c����W_���ҽ�Lc��7��W�����?a�m�K�߾�����k����o�7*Gk��}̿����f^c�ҟ5_�͚���T����7���i�����7���^��7��ۏ?��#�}{o�}kN���<�jߏ�{��۽u]1���_�a���,��0N�b/g z��$GG 0AH  
n�3|�B@*H�����/D@�����h�5�xr� �<�����"�%!@2�x�`4�i� �z1!�jg`��CV<	��ñӐ�� *�ʔl�|������M����G�G�%w��v�G/^?�]�{�����v�Vn���f�C��������~�����~���랡��qI:�%m��z�o��a��Z������?���U�d�w�������7�+F��d��P% ,�x�M���@&""� t�Ra�r\����@�i�@X)*�ȶ�0�
��ɉ�J� 4ea�`�E�(�'��X7� b͡P`X`d �DKA��)B$SP� H1K@@ %PxT�Bm$H  , ��"� k�� $�����$@��-4vP�(҆���d �����)����]�
bℬ�
 ��� 3(#���%�`��T ����l�z�z^��y���o��U�M��4^�8;'�u�N�VW�o}����۾7>uvӐq��ox����'��6E޿��������ʦ�f��Oy����_��W��dm_7꽽����s�u��ƨ�Fg��^�~�"QL CAI��.��
�$ 9�`A(@s�0���1p6c���)@6'����"���f�A �'�0�A ��L�����@!��A�pi`8�UrHd8��{ !$ 
 !e�1�Iq�d0:�w�,]��rz�^���_���9���7W�������eK���vg���]?s�Ǉ?���i9���J���,S|�u�no{�C�m_�p	���we��腣���Uw��=��׿g�O�nkݱW��.���O���m	�W��Dt�J7�y��V�O��s;�s�������{���^7�<�~�x4��X���;������KW�V�{��������V_������%�/,3����~�־ӯ��{��d<��^����p�p ��X4 �� �D@�� M ���BDIL@F�1���eA$X@��H%	T�48E��-@CA `�	 D����� &$�E!S64A �����@vD��l� 0p�R�O`))`�|+�*������+�o��w�ٱ�r��ٟ�	���ow�����7�=m?�}��6ۏqU���9��9��9����i~�w��}�������7p����=��ds����%����V��ǳ�������O��y����6� @$��� =h�������$ā�,�`	�!#�� ��h�y-��	  *V(xU ( ��
P�`@$�!	0 "������4�P�6e �D"@ *$�!�����a`	����z ��8��!"��TBV5��p�GJdU4`�� vJ�0a�(�H�	*E 3-Hb8h���TA�& �D�� 2(X,���@J �8
Ń@���1$)��7{��R��_���S�\������{��������g���_���x?��������O����B�8��o�.s����k�z�w~�mU�{�eWu#Q����>3�Q�KV����M��7ʱ�h�{W��M�ʤd�4�uhġ0�QD�J
�( �:�� �,rP�(�� ���AvD�9a�n��HJ�@1;y� �DaH�*�NdD�B ����`:KJF��{���(� �  �� ���׽�[_�ŭȘ����>�\��n)���_�2�	��-�c�����c�vS[��ҳ��������?�����{�۾�WK�b�n+�����������[n��E_�[�Ky��VGě}rk������8�u���	�i������w���q~i�o���=���7b��_N��z^��ޛ�噿�Ӌ�E|Nb��}���۵�؎�-��g57�u��?���U����|������)���{�}����F�����n�<�#�o�{	�@�g$� -(LD�`"&4Ie�@h��c`�Hp*`�t)Tt� `%� HB�-�E�I(? ������P.D
 %Ъ TaH�q	-�
�Dr.�l�
�������z����*��+�ܷF�7F�犻�[�W�_�B�s�_��+����ˮ�i8��{w��X4���o�9%p}s^>M��8�׭��z�ۏ?��������׏�m�����1~۟׼
��WIm)!N �~�c� 76@NP�@�F!�I��["�Y2� ��`���!��9�@ c��0` �F�6 81�,����	|@�* 	j@ �����Tr�JT%�2�< R@Q0ʠ D� - ÄH �
��0$ R��,k��� ��d2�X2 " �J@0	  �!D�%�PT"" ��
T�c�*���Q@ɰ�&  @`�V@(�SB>AE��� M���N_������}��?���ߏ21���w)�2��?�����f����?�~����{�~g�G��]����S���<��5{�����/{��m�L��^;�M{>�ŷG���je��-��Q���~�}Yw��V�Ͻk� ,J*�R
`B�	k11�<�0J���@)g�`0 �#' 8�����$ $���T�dB� A4�N� h �)�hYA ɔ0��@T���!8�!/�Z�@�GT�  �9 
�	sA�j������}��;���������nL���?��~_g��_�ܻ����o�����������]���
e������׳���~����+�R�|B�{������:4�������ֽϯ�7��2�s�����ݭ��g���?^�u��'��nT�_޿��s/��w�N�_�S�}]��;����4����;�1��_�Y{7���٥�s��~P6�ƛ�Ҭ?��c��4��踻�Z������3�G���`ab����#J��BѤQB���` ���
@�A|QT��J��O�	FT�����X�"��� -Ġ 8\� ���a(Zi'	,L&XPa�6@�BR @o�If e�	�� ؁�,��,A��B(,I t M�O �D @!G ���& ��4Hp��E +� "H$ @8 ߠ�0� 1��"Y4��6k��D@&`�e �(�\�J�6(D�� �m�1��z�(�,@@\ ��R@)�C��'��:(�iH�
�qHQ8�A61�"
`��D�	 �4�U�L��Xe ��# � �1Ș� �D � ���Cd𱈊��DX����X.
�@�z*X#R�ȱ�  ŀ �V,|*� ��Ő(V�-:�	A�M�@�@�J�	 ����@@���̅I h�R>��D1ZNJ!��R	�f?
cXEd�)�  ��%�ĵ6�.&$< ��I���1������$C� ��W���6�z*�0X $$a�&�� b�3@R�!W�C!Y@!eh*���	@@�V@ ,>!�	z��Vb�(@��If8DP�P�$X�@(�`AA�b ��6E@p!�+��%$o�jBJ��M`�&(�#�	�"""Ȅ3��P3DU^d
�S�$�!)H��<���l�E�4��&����*Tf ��H<(�3J6@�52"\¸#f�V�!J1�@ ����P
4�b#" 4� �!RT($ @
	�����C��i���D�H@�`	 ظ|���{�n � ���M�������$HS�<�����T"$�4B3� �@ �!@�TIx.��,� N2� `�`�et`e$�K0 6���C�A�5h���0T�J�� �� HI��#�����"" �D@��P�I�4Iɔ@h2�b
C ZbN�%ec$!�RD��X0�0�K��$ذQQT&��R ����t 9B ��y� 	  ؉�`:�G��*@ �p�Q�<9$Y\�d *Ic� �5#��1))
6	H�J+ �-CTZ��J �m<�@RD *$4  5�� r�DP�[�0B$c��z�)����0yQ�$���< "�B�1���`q-3 ���	�
 ���$�p ˄�f�	X I*�)� ���FH4�� "� �2�a�:
�` � ��X�0������ ��L� ��B��1�`A�) ,� BP�3�3���R���ȁ�	-@g�@4H��<@nT	F��@�B��t' �*A7�N}D��*��V��	 ���|q�$8)�� =��@aP�D!�~���<*8fQu5�m0(� v1�Z�a��t�R����s@0L��Q@)��� ��0@�64��"� �F�� bˌ`B� ��
���@X�* J�|�� ����Y`�)<��$P��"!"8RDf#9��T *܀�\�$Q
���GE#)e���`�C��5`F��Tj/�`
 P�LY�<����1���(h��L �&����$��K&"�P J����HB`EI�A�i�	(��*����D��� CQ@6��M�vU�h�I��*��#R $� ��8l@fDp�Ca� 40�rPz`�@(���+�(6th�`	���bP�*�H�P���`& C � c�B`�ȐAJ�4���+ ����"�7m� ��b4�����h���J�
p��K ���UT! ~G"�(��p�P�`V0!X0�< "?��p� X pR��� ,�d�� ��	�a6 ȸLB 4�b8``��b�A�S�咃��%:b4@��d im�7jJ�+�! IQ�"CL>C�1j�3��@�� J�Hd-�S��K!AW�HiJD%(1f��C�@*,( BA @�A7Sa J�ᆑ��Y�R4d��E�ltf@M�!�bʀcd�T�A�����p$�J<8Ytq�Xbbqd��@YK$+ �'xE�m�  Ж}��A�����(@H	�ȀB�-*�Y	fB %
$2��)�h�	%�)�q0(.H�)4�	��@�.I �Z)����������� @�H�g�% � � ��ĞE J�%��H"����Ud���L��!"�(1�$��W�Ì!�� Bw�*f�R� ��Q�0�A"YbBB 5@ $x  �R� �� �� ��"ئ�i����BP��!��%�D�^�����	Ge0%B	�WdԔ �)\��LbU�D�: ��C6�Lt����U0(8fFG	��s�+FJ2����gQ{	�'�f$��°$ 
�A�Y�" ��q�!��`�p�`�
 hŀF�l،�P �V�LD�P� ��`0�$��`(o�#0���@�.�,��0����tfI�!� O�P�@��!@kK��H��ea!D)�@�X4B ��Bp�� "�� �A5 ��@u�԰H�A�J0��b) ���s�� �(J�4��$@� �P�:��~-qu (E	1ix �JP*�s��BA�A@$�M2E@��BK�E�HP	/�D�$R�H�@��0 ��#�0gCf10pA$���0�R�X"�$F9���j�&�E`�+$d�19@("( �I!�X~�"���$�$pH�`���m�0`��K�F� I$� A@�PP��XLNP �� �Y%@��
�� 4�b�lE����8`�x%B�3�j�@��Et��4,���Pd�?0t(H	�y��B�F��x�H8�H��tB�b�EԈ���bn#��7���IW$F�� #����`�	2T��+T0i*����Q�i0'fH��9���&���a�!!(̰D�܊ �ǃ�a����E*BA�p_�IR�� ��C@4A �"`�b4�a�&OH��GdR �J4 @
@R=@�
a.8�&HDe!�����IbQ��Q�l�Y0�F$A`(��8�"�DD�g��`"� h� 9aq`�Q��(��8�2&QPh�� `(Nt�D* `�&�\@D�J�aBEiC��!�4��0!	`�CNA(#&��i��NaC� �"�`�D��& � (���gh�$*�@," P���\��`JA:25�2HGL��. a�J���)(JDⴂ1���^&E(dQ��8��s˃E�M� �C! @�	d�
d����60"H�� l�s0"��� ��-�HL��Ԇ !hʎ��")�� � T�`�lH���"*�� Aj�@R@��h�(���L�`�(�8�$:,i�����
rH��ݠ�.@��� )ӠD �!/	�8��`�BR�Rh�P 2�
�@@�D�&�+@��$I@_�eA!C � �dS� `�#@�e���d� �� p�D�I
p���N@v4�aZd��8o��@G�j@������ (#����g�*U�"�8�	$Z��TI�-XD6��`��@� ĥ"ƣX@
���	�E��2B|]B� f ����r#,"0Q�h
 !� 8 f�� ���D6
���0	2����@	�	JR��!B:  	��â$ ȸ�D<4�  `$���(.� F#p S">�!CE �
*r���0�8��YD HB"WA#� "ʂʰ&	 fb���
e�6,Cq8��(��&� ���@L�P�t	���HR�>�G�L�
:�TY�=�r � 䄆�OT��`�-Ac�.` (�<���C�&�����s��E  ��FBA	A@��M���5�!�D�鬐$B�\��h�!q��I��B�P�@_$ �
J�K����Ц
E0��� ���ws�f�M_?Z�G�i�ȩa�lw���dr�������w��e��u�_g��c�����i9��{���_����w��{�ׇ}�����_G���e�~V���{��%�_�?����N�^�q���ޘ�y�7k��w#���~>"	��1�����KÌ�@8V���i��Lc�*�J2��TK� ��F#,1� Ag� E�h%z )A���<@� � ��N@�:�@ �5��6�6�Lئ��r%pDa�`�e�
�M3@���2 P %�����QV�a5�40�����	�� �9`@.T� � m�@�!T (�Ģ � �T7R� ��`�"
*���ڐpP(H�� �	T����
����/�_�k߭=��S��\���s}O�G�v����o��,��j���}m��o��=y'^N�k���&�����s�kmۧ<<����O7�_ă_x�_>�@�
x�X���ч�~��2��/�����3��HH��6?Q@d�V DK �(@. �t���iV"q - ��Z��$5�R=�'��	�P�
�ɐ8"1d&H��Ā�gT��H	�[`!q��@f�I�?%$R
��C5GU�_)�8t����W�����ݞn�^��z���o��j�WSK�3%��~��Usݦ�'��� q?��z�g��_��w�h�����l���wM��m<�s,��ۏ�{���:�ԥ���_��$���	ޞ�n����_O��/`?��>)����<GGc�,v���3�v����>%v�s��]5�������_���
��ϵg�6����s{o��%��e�=S���A=�ԁ��r�Ҷv]W�۽����s��>�?��-���A���"W�ZJ�qT�	�D+"TtR
Y
�Q���N0��An9���%� M�4�  �@  �(�1� �P�BI��*�e�K��` �ee@1A t��LҀ� !��&pZ3����cR����w����J���ު����:�y�����=w�&�Q���_8��W~W�D�b��O�ͯ�I���;��(�w�G;)Ә�{�w܏�+�lGY������ߚ]����͉�~ת^[聀�  Ja�2 z�R���(B@"i�P���,�� ��/�P�l$��`��C��1�� =ł	 B�"��%P
�0	�)�1�]�� ��p

 �@�Ԃ"��a�Ԡ��"(��;�'@�>��(B@!VDY�  �@�� 4`�## [  �0��Q�Bj�i@�
ҫ�-�P	�Qe��
jl  8�!*B0j ��a��d��& �ct>6��LV&1��7������ڏ%B�`U�%���w�>�{-�}տ�~}��c].e�~���*�*�`����d	"�����~ �ӣ�O1֋���O���M깗�K3b�׿v�����G�����J�p��8�gպ}��׾{������`l)�3�F�	"@�.6h�A�%	�@`�d�@v�H��(��4,Jr!�3��������E򁀂�$1B� �$�@��`A��4�
s�  $�3��VQ �@D�A ��|PS��z���^_�w���ي�~��5XWz��Rd]�~�;����r����=�8�Ͻ�����;of��յ�f�Ƚ�������_��^������-k������������?'��~o�L��W����ԭ)����E�iwm���[��ͯ��������Tk��Y�~�����E7{����fu�Q�z}��w|�+l��ђ�C��[c�{�O|w����ٹ�&3��~�^6��������tw�ǞI�ad@3 ��(DBu8�$�q��� I2d� 1�"8�� � ��(�0KQ�P�&�@h�h�B�B0Ҁ�Bw�� e`jr�� 	 �������&�Ā���¢� @�0�Ӏ���o<��g���~nnѿ��u�Z���v߳��d˭�G�^��ֿ�?o�v�/j�?�?��ٲ�f���j����������>������5ߟ��[3~?�Nn~���彝S讇�����j�,�+������g'mF$�! 1��Ÿ
�"P	+! 
j%4!Zp�'A�(	&�a ZqB83 ��M�4�8��D''�SV���� ��D 0��I�P��\Q��@�0@� xBQ�
(��P@`D�щ��TA&-	B�VB��E�!l"# ��pJ�8PD
0�! Q��#A�b��(JX���(@!�F&R$ ��ڒ �H�j�D"�jZ~x1�M5�$ʼ4&H�1�E	C  �j�<���q�E��ko���Wg����9��}6r/;�\����!o_���y���w�q_������w�sG⥏�w]8˟�ߗ�Q�{�������g����&�������}�|�ɿ���{��;1 D�4�W 0���9�" �P32I��r��5�F�$`����,#�J6��"��*!0 3*"5J��T�� Jx�,� �������U�@,P�P�4E`"�� X 0$H��--cYi/�����]���N�h��_��篲��Μ�@Ob		�~ZZܘ�qδ�k�ӺULjgw玬�W����M{_�7bٗ햮|�V�E��m.w8�7������B�{������7~˾�~���7Y�[���g���������_zQ���������n�+�A�����6����ʳ?�����~��79)ټgQ���E�_��_^�Dc�S�t��;��~���c�����]�Ľl���5��Ϩ����eĬbly�����" ��0H ( ��B�7�B� � s��ᛠS��`�A���K��)��
`�b#� 0�# )��  A�"�k� R �
(�/ �D P��J� ���c� ��l�#��_���𽔱��N�>�g#��uۘ�ZL�z���Z���wD{�{}NojU�8��Wx����}���:���}��EQe���#��x�������dӼ��ix��!$����Q�kE��Lh*� �dA'*+5�$%-j$( A�0�!$�#� �AJݱ !(f�@�@�N@� Ō�S��2�(�� � ���I"ڰ��H�a���P
:�c�� q�P,��
h�0  3�F"PB �� ��`����	P���`*)$�G@���B1e� ,HT o�#�.�L��aЂ��$�@�F@.�+@�I3
. 	��A����LP��p!x�0  e w7�_��IW���𷺯s�|�U��Oo�S_��[O����mu
����O�<��:����mM������h���WW�}nu�ߛ�R�O[��G4m;A�.�_��u���2g��|���R�wew7v�F��c��#`��¯��@ �  ��a �,A�D�jD[��-q0B24qf$�9p
� �Fx�B�L7`�9e�!*�$M����Q�A.�&�lр
��X-���`�CȘ2(SƜb�QP�M=�16JJ,g@2_����~��o���z��<-���m����~c{�L�wf���.��s䯞����|����/_�u���烵^K��ko������.�w��-���?�˻ח���/���?�����j>��ڤɿ9��������^7E�_Ag��r�a��ڿi��wt�Z���J�O6��׷nQz��֊�i��|���W��s���}�y�xu7�����ݾ�P��7M6��:]I�gy���%�^�����w��:��gq�9Ծ�=?� $�\ �¢0��I4A�O j�'N �� %))/P�,�1R	e�3D  #��&`���X
3�`E� n ])�t䲌 hH�"��$�	~�cA`�Ȕ�H=�8��y�G�`4�j$�IP$�_9�I, �f"2�@0U��$H����  #GM��K#4	Q�0�� ��$�`I6� �BJ`I*B$P� �`��dMI3�yD%��( Cc���u[y�9�TD��۲Q��d9��A��}Ƈ@�|�2��?��7�?���V��8����[}~��3�w(V{�9�P�׋_����<�M3��Vns���������{���Ň�Y_���6���u?��LO��]�������s�_�
��G���r$��\׿��ئ�?�7q}�m^4�6�c�5�^�s~�W�Ρ~&��[�~���y��z׾k�?�5�pV<%+m�y��o>]�}���7;����{��5�?|�[��H
���O� ؀�X��E�&��d�a�Cd�L���G �@��@(7���F!P �X)DA
��)	BEG�Y+|���4��oH��@�@�� �A�D�0)�+�Ů!�)B�Dyb�����p}�������k�uc�N�$L����}����?�e�=�����V�g�8>��z���޾�:��.?�Z�Y�o���bK@��K~�MW�`��5���͋V��;�e�6�����z3�����{���k���+� �.R � �D8�b�G�P ��!(�4:&��]��-�`80�@b��tlD	�b�
�"-J��H� �!`��7" ��J�
�8Ap���*��S��D�&�� `)�	���| 2��` r����y�% ���� Q2T���R�h�؀�i���X���`  �\�$��
��$@
���� C,ă;�#8�Bu�`E�	���D��@  'P*!�������gQ��&w�%S>�V��{�%챯�+-���θ���������>b{M���r/��Ǿ�8^{��w�2â�7���5��W��wc��gU|���'��!�A�џ�1�q���6�C���d�1��;v��#�$�6��W**Dy1��#�4 ���x1�A � )B����l1*`��@ p;+p�u"i �$b"B�-�(�`@"Z��eE��zF ��@`%�$�! o�����o�_��ZG�K��k�_�w+>���E���·������b'������N��3�D9G6󋶣�nJнo�߿���+w��滯�cónZ���{��M���W��^]�ebX��F���z��_������|W���sfw�Qٵ�g�������T�Y��
г5���j�=���]�v�y�f�ܗ��k���ݗߕ�Zlp���V}~�L��Ԭc����_�_Vo�����گ�;�.���X�����c��g��[��)?��[��Y�BlȢ����# O�I -2I���S$2�� @��b����BA�������c �T9H�h�P�)): @��`P0T�S:X$ �  =H&
������ JD������/����~{���O~�λ:�1�c��s�ݘ��t﫲�n��e���oV}�}_����o������u�b�n�Zc��azVMã�M_�;o�W������to�^�����
��'�u��a�:��@N" ��|���B P��cH�RP��J��a��剠ah��["B0$/�@ @�00� X�c` �A��RA��V�����l� �� q �'�C��)�!�� �
� Df�J6�Ȑ�P(�  tf �`, 0��A�Ra��! ёH	V`�t`h0� �B�Б`ˆV ��g�20(�8��� ���J(�
*3J��p �$O x
 ,�bT �S�u���?�w�ן�p(۸�KyA����n��)��\���v �����]�ngW�=�ڏ�-��fw���g>4�����c�}��}ֳ���o�����7���o��߿��عY\I���wp���[��o��1���A��� �( ��U�B(��� ��Kr<  ��@�� P  �!�  JuPć>A��EMDǲ�*E"�
b�XB+$k�4�$"W�D`�SB�)�#��
����9pzB"q�"@L���
��;�^|��r���o�G��Y���5���-���C����7;y�������Cz����W*ҫ�u��sJk]ڨ���O��W�Y�O���;�Pk�ϵ���r������x�k��{����:7Z��֮�O�ѻH��������&���������+�m�޻"��u��m1�~�bU�i1��'�?{��zȎ�o�����g��oG�&��O��{�g[�߼s���ѿ��f�/��ݨ��݋��[3�>�޷���r�� YN� ��I��@�>  @��ߠ'��<]"�h9�	!fHD�HH�Dd1BdCL$@X�`E� 0t(SZ�0�$~88 C.+0@�@U�3s�G�94��A �<�3A���Lu;��M��O�}�_�Gr'un��m���V/?�O����v[�w�u������4z_��߇����������=�2+����G����oy��wt�}n��ڮ�/���ŗ�m���å����+����mS��]{YL����B@��� @@�  MF3��`�E���v��0bz��XQ�'N�@�qAC$����h��$��uR6�
` @�
����s�� 1FKFKa�`V=`=�DQ"8�2�KQ�[Y ' ���1DIv
,  ��n vPd�ax*p�@XHa�cz8�!te"�� P
���`Pn|�"H � d�B���`����������@'�A$f�$��&�]A@����k���'�ѫe���_� �g5�-O������� ���������-����=���ϴ����n���_ίt�*��*�w�y�����P��]ejF�7����ݟQ;����vS��̔�EO��fZ���g���(\��$�M����~�b�6���R&^  0����P"��F+$p(H �����U�$�B�_
 Q�qK�^T �E�9Up�  P4!� ��D e@��sc�=��^�����_�����~����	�'��;��4�O$�s����~{��=��ym��~�[uJ���l��8�ߖ;�O�mMs�T	_�շq�|t���_�[����\��m�)OI8���������m��?�??�ŗ�����G��lg����?|aa�~N����?�_���N�z{*�u�s�������}����τ�inv�{�^u�V�U�YԆr���&�o�w� ����\��?~���w���� SD�IDa�N@"@b����@���2�� ��FH���Y! D@�v	 ��@(`�Ġ�<
Z�h ��4P�Ô�A�la 6�!     >"��D�Df�����Ho���"�_�׵�J~�V��æp?��{���eww����{�{GQ����w���՗K�����n�]E����_�=�;�f|w�M����콳�wx���~X���mr��u�������h�����Y��(�$!��1 �Y�B�lc�`�A @u�q�	6  H�,E�T�)���c�)B��� -�
�0� 	��Z �(��F h:��!,��x��$Ix�b�	�%]G %c �
��L�R� a`�AR�`���-u�P&�L�i� i@ l � �`(�^A��eE�H�#!m9�CP�V R 3����� �8�EI��
���0#I*�"0~ $"��{/|���DFǺ�U����~�8?�g�nn�s�?�Roң[����=�����]-�����~|I��U���(�s�̾���[]�e�߫x?\n�zjeJ����l�NJ��o�H�m��uɳ�ӹ陫�"������)�2 1���hB���-Q
@�`(�  k��F���� 8�dRIP�0U��<��"�D'  Ap����QDJX&_�@��d"H� ���	�XP�< p���w��5� td$�w`*yt��arH*��B*���Q
$!0]$0�0H�s�T��:Y�im� sF�Є"B*d�AP�S����DfTG���D����p� ,:��+82��x(�ఠ�� abC V��;V�"*�	Q	���&Wfp�	�b�?�#'�!�������� ��,�b��!�`1LG��KU���H2(�)AH B�v���4  :i�$�*�"0�J U�@ �`E#��#�� �8,�0D@����`�"���W�@GA()��0���"bC >�r�� �6@!)Q�K�@J,H���`0���� �-P�B�u$� A@� (�'�i��`�` �f�@÷�v4�	�H��f8(�/R����@��c�"
;�B
�= P$ Qn�bfaԠ���H�#R�j���&:�@��$ � N@�Vq���X���
J�3�H2D� �΀J�'��3
���� @;`@ C48�)JB��XOF�YB(�CA���� �q`��� ��	�s&�i@D�4��$f#U$�Ab�� �@d��F)L�0�:��N �KNB �����v�Ph���H�.K�P���t<��@&�P;�$HȈ*�A���@�*@UĊ$	�B@�0!B
d 2�3@�9 @ܩ@�!�-G���u�}�LD�V���p�4�Z�U�  �.�dd����! �3�A@P(��0*z�B�0`	Ё�g�R2���c�2�,�c@@��	j 
!7tf40���$EBp5@v��j�5�   �yAFҀ&$��#| @�	PC	@�
0"�AM��T�p���`�
�h�# 8�tB� ���AM�A�RE�2�J� 
p�C;I( �
���"�`@�G�4d��B% g �*p�� �`Y!8x"wy
B�e�|
 WF���NG@@ X� &` atT	���Di;�+B��\k � �bqy��@ "�A%����6b � RLPB��P��  �W��T�!@ 5��A�XU5dâ�@SXT��p6D!H��`+����<�P�@ �E����!��/�Aؔ!��	���)�	�d`/� ��� � ��!!1`UA����`%�������d!��:-c0#$1	��sb�0� 9'PaCA �Q8@�J� �(�#h$`@��,�v�"��!pPB�fA
<���g5� � �@A@Y�
�G��RU� L���i��rvHD�9�P�'�JY�X�������;
 :�5�G�&���Iza	�Q�Fʐ����Xb�h� �P�"��X ��
)70#H/  �)\���5�� ��a'��y� ((F� Q�>"5V�`D 4��-�B@d�BD (�p �� ����������h��
�9M� ��������A?0� ��J�P���-�B!� �5�\p�@��@�� `B���	4(bp�H )`� �<c�Y��J&4 �8��N   (V`7�2t�e���&*p�DD�P ͂T0R�ePbPd!�ɰ�C�x�"� �~�B,
$A�p�@�~�� pFb)Ip�J� |��� �<%�]��$`��W� J�wX�0�0�����H�aD��3$� @�$��"D�UD�yFP��,�aO�* �RX%��J)"��cx{+a��:Y�b( 3"��ĞL��� �H��@@�PH�$4�07(pu#�Y�/�  (2 :�BSU H m!�  �   zY!�=�4
dH�00�E.%�� B&��hK��У�S*�<P�P!��� ��$���Pud�
�(� ���1 +)���UyД�!�7%A��*�f*&�*���w��!cC$e���Њ"�ZSY"  ���� $5@��F��,�I�p+�� @1��@J@��ÐY#�D|� �"�J1�i�

�%
�?5	砀�@����Q� ��"�P�JH
(  ���01Ds��㓰6 �3`P%����$"�  C
78#�! � Q4e(A8 dWqA�@�*�� I<ÀЩ
f� P>  d*B�R2h(	� �
-l�1��� ;��`Cp�8)0B��u$a���r�!<3#90��� �X�hx��aD� �HCJ�QH] �L��`�$��h"��E���$0-@� ��P ��`a H��v 1�C- "�I@14*p�$4�,�
�:P�E�) � . ��h��� 	2&Q	�	@T
L�  l�^�ֆa� %� (N(,@ � ��D�� �$R4K@>< ذ��,��+�x$�X���C�Uq6�R���A��D�K��8#M�Gk�  �P%�
X�
m�E��5Uh��-���|2�@@H��"^)l���8u��#��$�0jh�@3 ' �9%@$��`@�H(	�R�:B�"*X�D� %��G��0 ��@�0�i�4�&�!h�(qd�5I@�0C�`�sAE�i�Edq�� �0�<N& fpA����TDK�,�X@)6�y'I����3��0r#�!�y	��/*E�f+���!���� 04�����$@0H�L��
�P�S���<t�(�E�	�@	�s�n�� �aiZ�HHD�*w�@#2Q ��AR*��Q��<tE�| V�lu�3`#�DE� 
lY�'a�L(��  @�"b�((]�@�t��$T}�T���%Z�7��b�x7��x�IтA�. Bm��YCn�����w@��8�4��peO��b$ 28ؖ6(Dv�E�P"� 	 V�B4 *J�	h,����"z� YbR4�A� �4�
��bd&D�j	�> �4%����@kI,��$�E@5*�ac���1���� e@V�cŴ�F0��W����@�Z���*�$�2��1`�Ez�	E2 �[,�Y�?�a Ȣ@( 12��B��(B �jI	�#�J0���]�&� G0 ($*��Ǌ#�ɐ�U�Ȣ�F�À#`ϰ2a!4�d��~"<�E���&%@�" �R�b�AX�NI QC �!��)�0F89"�B�0	X��� ��i�2�& 3J��^%R=�2� �%��Ta ,0���짎����!����p��(�@r�R�\*�x�SR�I6")  $D
IͰ�Z�i`	�P�� �j�FQD  �f� ��.�`2\I)r	l(� R�
�\�?�
�&H����t���8b������Z �	Q�$��2�P (��@ �􀬈"� a��"aA.��� �����Xe8B���""p0�!8��ƈp�!�AA��X�<X  /A�C� ;S$QD�@dȣ�`��+�Ǉ L��ĥ`S:�p�0� %���3�h�H uF		"b��G�!S�����(�`�D��0��H<B���3���n1	8#���%*��(?�$����J�	 GA����3�2c1�0���y@b9��2PI�hDUD@Xn2
Pvq�F�$e|��EaL��3U�聤J1 %0�P8�F f< ���J��6
 I���� ��H8ZB�%����(����0D�N1P�t@�"Qp �(�L1��L+�  `)Vo ��$B��g0�Qd�W�b��c2,�Ӹ�$c@F�]D��dI�2�2r<p���!Y�%3&��eN$�! T,Q�L1 x�0��	HH VY� <P�ąP$Q ��/�� ^@X@�E�H^�$�( 4 �&�t@!`��Z B� �@.�(D��	ql0&�B �@�4���4����!'D��LB� Ą�e�s�&�0%Z��o ÀRH P�dbaAp�2O��22�d�0 %!�'�-��*!A� ��Lb��`j��(0E 
M��.4> m@���ɀE!"h#�0Ɇs �G��Ȱ�#9��@PApb D�B3T�� h��'E0@1�DQ��|@#}�q0����DXJF���%0h!@�p!�
��R��
��!6�  $�"G@ � %F��O�@A@�b�=@<�'=�"A$���� �
a�#tw�@��ĊS�BD !�{��ՊP,a<Q�
�
��`Y"� 0P��-����?�b 2 �� g��8$H ((�jË(
 	��ː�@��\�� a$X
��*p���V�s&@HA����`BN�(#���	��H!��1D��0#1Dà%l$E5a�T(����M� ����`��4�n�H"P ��Ee*�{�G%Q�@Z<ę���PX��P� 
��	��d� 5�*��0JU��Xh�F� @�Tr�8&$heN(" �@
 �  @#	h!PAe��Б	T6 g)^�  �T�JH&U h�q@�^ ��@�+J4.J�x ���YЁ�b�_	�   � ��Q7��9!�D@%��31J�=�?�
�|����	���L���Af�+��#����(��g�$)A��V ��d�Ő�i��u�@ d�[�ʀ,@)L� ��7$��""<�6��`�fr�$�/I����@��\�qd�(@d�^`��ɢ��k���D�A@��Ԁ�H���BZq�Y4C�0-A�� W���e��h��Y&DG��XAl�#$A�a0�0��g Ā@ TB�@�@pX�#X8� ���  ����_ �zHf1tE�PB+0( W1�v ��2�D�	�"�	���(�(\�M�K�V�Qd?
pR
!����rtx���@�E��0�`a�3* ���crBB����@"p���J�O9�f`p�0�������Bh�|��EÛ ]�D��^�c0�@�(������	����z� �'��84VQ�/ Z�	0h�0<�! e��@H��`����`�F0@p�HZ&)Ђ �F�(�
�I�j�V�D� "�a�	E��&1.��  (P9EmN S�%L 0 Q:aćr``�*��>a��P�ς@��@5�-�:<�b"�@��/#�"��/���� `5��sL#�&a��1���  Gd"�A�%G$�`I���,{i���쁔N�)cP~M�*��;�@�c6H�$��	��% �@#U�ƍ��$Y0`�`L�R ��4��-Q %�,"q��%� ��`�F  ���D3Y�˴�#�2B(z��b@�f_�/#P�7J @�`ZI�
L�� �)l� &�TDBB@�, @l��	!*FЌ��@\�  �$x��
�PҤSaO�1���b��Y�Bd@B��ɸD�223 ��8��HJ@���Brp�A��x�4 *��*� f�%D8~A``b�wI� �wA=�-10 � �J6C"ja$�?&�(�<��Zt@F|T�D:jHXP�*X���@z�`�"@70'p)�~(�c��A8 *�qHP;��	eP�I$2�@U����H �����K)`�D� $ c�$#�� �� 1H@
a@�a� �Q�**eB@4T!�!��dA����BdS��
uo $Ӂ�L$ք ʄ�8�"����Q�2H�"F��-�R,��7�஀�H��d6U �,2!�Hjf22	�A$� C�*�0B�г�4� �D)��$9
!��U)�`�	`�� � 0�8��8" B����C0L��0X*!.��2�{ڝ mQ@L�	 �"����L|��g�@��x��"���] Q�fD����O�����pq�n�"@���R )@p@*�T !j�*A�Q%��B0%ƺh�0lke�t� u&�, �J 5d b]%�9���g�� L�D�@�\�P�]  b�!�
�N2 
P�L�H0Z� U��X�(`$�b�HE\0� ��xY�f��d(��a��q ��D�LfA2@� h�jxt�H�A&!�@�  G�$`?�D"�L
�!����6YL�C!��v�P`� (J�a��_&�4eev@ HCC��à 1G$.�!3� �43��h#50��!�K� �+�r@ �h?Ba��$��a�1���@��rP�!%dDI"X!"���� ��2���n�es��×�	�� � p��=#( ���h  -ĉx��@�Z7��D�� (�+�E�!CR<�ˢ\� � #��:61�B�T�UE�	H ��F ��@� 0���"!	��<�@TB`�H�*�H14�0��
��Ȑ�����0XM ��
�Җ@�� �Y" t �P�a ��P�R�����&"��F�P�
A4��V������,��%�H/��� �)=@
|� �4�O� �q ̢��	�"�J!@�$W)@ 	!K`!`�%��*x& �;8�@訒T��i�O���� L"%�0
'�*�	� ���9��  ��Ds
�>@ d⁈���7@�Ҁ�q�C"�H�DL��,	���Cb�fd�s	�$j� h�	�e��L�#*ѦX@����#x�0��) �	,1�Xv����a��,eؙ���"4�)<*��͡l��j1D@� 8��	#a@�%B$ 
��"8�Q$��R ��'�p`���J ,HBD@@& �� BI�yI� 	���Ҋ$� ���8�AqB��4T���@�e�� C =�K�`t`�������#Ȓ�r~ C�KB x3�i�C �\^' ��mဟ�2���(i!r�@�� h]ใ���И� 8�QУ �p�@�TP S`" � ��n B����@ 	�9D���!aJBS �G!� 0�aW(0�L%!*YA�(�;1@o����) 2�@H���ԐP�(�%�(G (="�$�  �������P� ��* �� !�e$B�E#A�$�R�(6RY �*����J��$!P`FM I��0���4��%C��5�H `>V��+R��@@�0��-Ht�\p����@1y��!Cp�A��pD�p	-( ̍�#�kI��p`�O�K^jD�?AP�dT �WA���$#a`��`$�B�i���*%��ԁd�@P�Fp�� �c���=8Ir��4T} �!0� �Qɰ�
�`�V
��b�#�PTɈ?�@� �i����
 �6`ED����BB,uL�,  
�cq! �$ � Ȁ,�JV�ah4��@��	�I��>�q�Z��*a8���^���������������ڻ�߾������P�������˷�����*}�6���l���]�S�����_<{������PX�~�I�e�^q��붾���z�e����O~F�gྪ����7N�χ��vP�@�&*<�x
	p� �qO�9�$��XU�)D�dl�2��f ���4� UHs�	`����s@rG�$NSU��
��&��"n��E�=`3IH(L�*��"ZD�?`�Kh �Z�EBU��9���7 ��&� y ��ƃK�2T�����%Z� ���?T @% }�@dI�1GY�G������ �@DR'����@� *PQK���AR>
,$"O
 �g���@J ���{�����Z�G�M��)�;�m�yE7����=�����',�S�����Z����z��~�ܖ���;�C�Tw��|�'j|�����ܗ�;�v��|���߾����է��i�?��y�{�?����աc�HB�»!�2�8�q���`G�$\`Ħ�Ĺ�&4\-,���!Q"���t�*����zƠԿRVYGDlA 
�@��p@�G�R p�P�W!lP0�A��0�bP\��&ZP������Z��w}��G3cw|�ն��u��g�mP������N����'oo��xoy��~�v��߾�٪��SU���'����k�^=����o�k�~g�/�}���_3����l'X_lo����{9�z׫m�t������/�^Z?���gg�o��ܯm��\�>ű��6�Ǚ��WF��T�c�j��v�W������)S�'���#زQ�?�n/����{=�Ů�]_���gZM��o^���y�y�ڻ�����vϦ��O<������	�3֣��"� p��K�C�!Hn:6�����gx���O@e��
�E�)'N����zCp����<�W;w�%���� �@��8w!9��L!c	s@�� ( 4@�Bbq�������O��+�ۋ�K��C���=�����|������i�f����{��:����3����T�?����~K{���~զo�����N��s��`���z;�����^��4�ZR�ȸ�U�1��V���ť#,�D(�O��AH�3r:Q%��i�fT/Ƒ��	��
�5jFV��'�}��	�XnXB&�=m4P��eN� )!3ST\�;����S�P>f�w�i�T�`9*@��y�@@�Ω6,�7P��Jr��}w�0Q�8 �Z�-��h��tr(H% �P�X 8�D��!�s�HRc��G� x�� x�`�rK4��	�* a�O
��	�(�ȓ$fAL�rl��B�n\���M��?����y�L����]���[�������iv3���[k>�_~���r�������ް��������շ�S���w������7��6���������y���ߚ��i�7������󼯧�~��A~��T H���FK�4
� ����z�^a�B;}� ' `� d� )q�	T����@G�F�	T�B0�f��It��q������aZD����� ��4^	��N29��"4X�ܿ���v�ڹ�i�<m����wn����_t�����o�������߿j5~�_����~��no����.w<߉�����U�î�}���|o���[|�����[�I�֣��w�ݸ����/Pݮ�]�gﾚ�ϔ��]�(:��v�2�mI�߹�{f���������<�����0���]���/]�|D���6�ժ��*�%���������q���m��v�����],y����$_1�XcL��lˋ���m��������ǜ�yO�AC�#�I��)��A� !@`�hQM�\ ��HC�:RC��%�Bp�:��DÂTߐB��2�1B @t�9)"
BR� ,�G�\#T �!L	xDAm8)P�Z 3� ):Q����S��������ue�����z3���_������x���?���co�����������������u�sݺ�����i�+2����˺�?��������e�U������jw���������֠�{������$#� �� �	X�(�e�o@� b�B4@�G�Q�m�1 �M �0�Ԣs��`t�ŞbB����H�%�ѐ8j]@� ��<�bj0W�	zE���*���e] �:����^
 �1 8�	���Y��pՐ��x�jp3���t�*!�R
�� V7�ab �i�`:��x��
`����0��т�hB�@�~�R�ȧDn�?5?._��{�N��z�n������n��s������T_߈0WF����ͧ���o_����/ƞ��t[�qܗu�q�������=e������r����s�m����o�^í[����v����WG�_����{2%D�����0-#^,F@�'*a�%�R&�	�)l��̌�4R �g�ڪ�� �#�t� �L2h�A�D���pi T������-2@C��PF�)��cV4��@�A�9B�#��Ǻ�z�pp����������w�������K�_�o���k����>�>׷�O�wX]��e�����o!��G?��mߝ�����o�[���ƛ{v��{{����_��ۻ��ݘ�������B͞�o��o��wO����	��=M�*������˾�/������������������-Cn��������n����׻�m��Op��]�ڳ���~ѾN���������:����&��_�=����6�������n/ߏ�����`h�UhYDrJ�I���'Xq���"q��^ W(P`R�} 
��)b�C�p��b�Љ ��� >ሂ(@8V�h.�2��`��B@y� D&z�R(�(�0����$+71��HpL0��O�S���ޯ��~\/��Nv��ߥ͜�9���o��ۅ���~����{��������Vz?��Z^��/��?s�����K���w�����<��7���i��e8���Wu��{�9��v���w�z����8�~���RQ_J ]V�. �<�A��e�4�| 6P'IA`EӶ42A ���0rG� 
�b �D1�G�z�S�Q;F&IT=>Bc}9�D�@d�	N�P1rc4�� �� W��� �v!&�QPI�	�Ա�498��P��4dH ^!�TH@c.PD,�8@��E�zG���Y(, <��q��[��� �%��$QmjPz�� ��ȶ�"����d	��(��©'"�^�Q���wa^��F@B�@���W>�k���7/�����e�~�m^��z���~7w�{���/��/�R������ͫ�z�og������_���oއo������0�%�g�����ս��y����������=?�rc���ۮ��������h�'�`1�1��#��� �B�	P\s(y`AN� Á>�"����#��aiG�`T(�䀢���(,w��DG�!�D"��LR�	#�&�t P9�@D���D'Z�0A�e �����Z�4���+��m��w�;���/����W[o���= ��?yu~q�����x��˳��^����Ҿ�w�{ߝ�Y˨���{��n]ݚ���/|�\)���g�+���m���}��1�7��Α�ן��g��[���|�_|w�)U�;��m�������-�U��L��ծ�w�����{���N��v}y����{�o�]ƿ��,���v�����_�����n�]?�M�˹������}`�����į���}�ݢ��$.�$Ɉ1 
K�.0%Ɛ10yIH Sb @�P�b��|�BI&ţ.C�H	$b�0C�|  �	j�A4 �*v����@��6G0�M\Gl�|�LMT���JDD��K���G���ٿ@nc�����D|�Y�d�|o���~M���꾲�[��m��<u��<w�j��B������������r�c���_�J%o}�u�v����J_�����f�G� �;��s{����x�����w9�i > �?�₈ �`@#
+�B��f�2�W2A+�����t��F � ��_  bA)��b��@��6>���`�U 5  ���OqH���(���:��pA��L.��g@��Њ�!$@G.@.l0��ߘ`2��q�`F�'�4@z�yxdD��m`�����0 ���p��Nu@@��,T4 ��k��H�뙄�iUmL���-�F���09�u��$e��x��n� ڼ�_n��B���)�[� M	���������|	=��w~_��������o��	֏�y�N�W�;78��h��Rz����~��������A^�p����ӏ�������)�l����qgH��B�=����ٯ� ��Ug��&C2_"�q� �BP�w�?�Hex����3��a�M_`#s-�;�<�7V ZP�R��Xۃ�DD+X��QP`XC�Ndm��SI�&��7�_~�"���W��[��f~%�]?�m���)ͣ8��V���W����K������������!$��]������n�T�|Ϳ��qh����us�~�[�ӵ�n�Y��3��_:�r����=�j��$��?�.���O3�������!J-ǿ�����������LZ���ߎ7��}�S��+�?ܪ�������T���^յBoؾ���������Uv��}��Y�7�~����FL7���k۰�R�����t���:���<��!�L�����n��E@bj��"�5���� ��+'��7��L$t��E���O�0ug��?@�d%�@Ɛ��.PU��p�S���1P��o R�HqU	Nj�1����CW]{���y�.��͋��o`�7�X�o�����d�N������/��3F����z��m�����
�����l}_��po�����?�s��A�];�s�s9�}��?���(M����J�ݯ������$�K����',�C&q��G�Ż�8Z���[�&C+%�Wڇ/�~%� �YTdL���b�|AK�Qr���S���"y�a��U��Y6�.2W� 0��&��d�Xn�L:� XX4b���C�A0�`}(1Gw��A��A^V��B7��23"T\Gaa�DԸ	� A2gTL,�d��Y�ݑ,�! �A��g�Kh���ـ Q���Y�� ��#�q&b�)%I2�Ca@w �f  L���aC+�K�&����.������K��{�r�w��Y��[`~������������w�]���;��?o���߶������/��}`����^����\�Ԡ��{����B\�S��#�����?�W��}����'w��ZF1�"S^��{a�d$:��2*>�$��0
�"XL ųRN�
�da�zlA؃�PdXyԓ<���M���X��e�H�D�JhP $$kqL?�l@Cg�`��"E�� ��K0r�XIl����� �nW���t��ϫ.6�ߨ���w�o��i���
�_�c��[d����w�O����<�u�w��徭����l.����g� Ϟy�/׍)�]�����(z����I��l�vi�_,�_����,�=l��$���n\�5��^x���;��{��_�V��� �s���`���}���{��߿���5������'�������2����-[�$��ݏC� �w��3]��������=R�ٺ��^:O�^�~Y������6!"zR" T�Q�� ѳ#��CYЁR0`+�"&�k)��x
��"'Q�B�FHc�b���!R����C	A
�h�4�B�_n@��XӄI�l`�I!��hR&�Q�Yؒ��A�\���w�B�/�ϾV}�-�[��H���/٫��QIOgﯶ;��匌���?���+m��|9����?����������_�Z}^���y���a�0r软��_o������I����o���k�"�2 � 	��!FE���,�$EM��,
��G�|���m�&8pDz`���2�uC)�r��X��E�%��Q$���
��h2`pb�5��F0��X�db��p	�  �ب6� I��_�`ue��0�Ҕ�L���DY� �FF���-+҄��!
`��" H�%gH��-0@B� �H�d��:[F�Ɏ��=(#:��-����I�Z)@�NK�	1R�ྕBtP��du�F���������3|�~������������L��_I�;���K���}e�51ͷ�m��i�=~��}=���\��߻���Uߺ��z����~��'�����W}o$�<П��_��}�)����eUO�V@`�Ɓ�Y�b��(�8��g�?�M�6��hfI
�b��'Lx��0�R 
H&���5���V� $6�u�PAt�*�a�"inH���D.!6��Ei;@a@	��m � W ���EmJ�$���������>�u՗�ߦ_u�8���?7�����~��t����������^Ӊ�s��?|ݔ���_���������W��w�k���#?��k����n�����E��#�5��=�߭��"������;�{�zG���	�������E]��y�����mo_���o<��:�i�ng��$�o���w)��9��ߞ��t|��E�T~�N����Z�^��_���}~�{��	���g������W�� ����qۿ�����یՈ���D$3t�I5��3�0E6���5n(  P�r�6�XFB�l�z!5�7�a ��d
��TM�4���[���d�F x�C��
8 pv@�BJ�N�s��s
`��<8'â����z��-��C�B��������wӝ�_�{�V��/�'�K=y� �ծ��~�����{��r����Tݳ{��߼c;��uN��$���M��z�|��`u��r�m�$���O�?� ���/���v�z�%N�(`��	��
����9�D�(� *�v�� 	I���Z���#,$�1�r�84QA"V)�n���6�QG0 ��
R�N�pC��K�����km��^7bGZ���ξ  � ��Q��ͩ@V�뉀� �
�e�pU4^`���BY�1T $�'�q�
H�Ga`��D�IR��GtfY��� )�d��� 2�E�7V%6R��� ��G)h� �%�ef�ߕ���<�������������:�w�5.�g���Dn}��>�/#v����� ��#zw�狤��^ ��^����H��ݿ��}�}����}��{��v��%(���k��C�޾�׷��P��{w�n�ܢp�T�%P��	�AZ�$3UD��+Z�q¨["��V)�U�@Z:4r��r8�4�k��N� ͐�0`:�Q|��\�JŴ2��V�4�MZpGX���L��(d �%��O)��K�_$���{��}jg������;W����Ǉ?�������9�y�r����h����~y�?�}�ϯ�o��tk]YD���?����v�ڜ�~?[�WKu^����������E��K���OQ�ث��{�I$�������Dw����[d�������:-�o�=����{.�L���l�������+��������KZ����L�����w��y ��/�/[��o���s}v��}��� ���}>������������#@,��H�x�� ��H!�z�	�!l��@�2�f(�� ��&Bk���,d�Zd(PGo�y�R@
hJFz�
5r�ƅK�P,�6	�W$�N�Mt���6c��d�" v	old_par = (obj.parent || $.jstree.root).toString();
			new_par = (!pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root) ? par : this.get_node(par.parent);
			old_ins = origin ? origin : (this._model.data[obj.id] ? this : $.jstree.reference(obj.id));
			is_multi = !old_ins || !old_ins._id || (this._id !== old_ins._id);
			old_pos = old_ins && old_ins._id && old_par && old_ins._model.data[old_par] && old_ins._model.data[old_par].children ? $.inArray(obj.id, old_ins._model.data[old_par].children) : -1;
			if(old_ins && old_ins._id) {
				obj = old_ins._model.data[obj.id];
			}

			if(is_multi) {
				if((tmp = this.copy_node(obj, par, pos, callback, is_loaded, false, origin))) {
					if(old_ins) { old_ins.delete_node(obj); }
					return tmp;
				}
				return false;
			}
			//var m = this._model.data;
			if(par.id === $.jstree.root) {
				if(pos === "before") { pos = "first"; }
				if(pos === "after") { pos = "last"; }
			}
			switch(pos) {
				case "before":
					pos = $.inArray(par.id, new_par.children);
					break;
				case "after" :
					pos = $.inArray(par.id, new_par.children) + 1;
					break;
				case "inside":
				case "first":
					pos = 0;
					break;
				case "last":
					pos = new_par.children.length;
					break;
				default:
					if(!pos) { pos = 0; }
					break;
			}
			if(pos > new_par.children.length) { pos = new_par.children.length; }
			if(!this.check("move_node", obj, new_par, pos, { 'core' : true, 'origin' : origin, 'is_multi' : (old_ins && old_ins._id && old_ins._id !== this._id), 'is_foreign' : (!old_ins || !old_ins._id) })) {
				this.settings.core.error.call(this, this._data.core.last_error);
				return false;
			}
			if(obj.parent === new_par.id) {
				dpc = new_par.children.concat();
				tmp = $.inArray(obj.id, dpc);
				if(tmp !== -1) {
					dpc = $.vakata.array_remove(dpc, tmp);
					if(pos > tmp) { pos--; }
				}
				tmp = [];
				for(i = 0, j = dpc.length; i < j; i++) {
					tmp[i >= pos ? i+1 : i] = dpc[i];
				}
				tmp[pos] = obj.id;
				new_par.children = tmp;
				this._node_changed(new_par.id);
				this.redraw(new_par.id === $.jstree.root);
			}
			else {
				// clean old parent and up
				tmp = obj.children_d.concat();
				tmp.push(obj.id);
				for(i = 0, j = obj.parents.length; i < j; i++) {
					dpc = [];
					p = old_ins._model.data[obj.parents[i]].children_d;
					for(k = 0, l = p.length; k < l; k++) {
						if($.inArray(p[k], tmp) === -1) {
							dpc.push(p[k]);
						}
					}
					old_ins._model.data[obj.parents[i]].children_d = dpc;
				}
				old_ins._model.data[old_par].children = $.vakata.array_remove_item(old_ins._model.data[old_par].children, obj.id);

				// insert into new parent and up
				for(i = 0, j = new_par.parents.length; i < j; i++) {
					this._model.data[new_par.parents[i]].children_d = this._model.data[new_par.parents[i]].children_d.concat(tmp);
				}
				dpc = [];
				for(i = 0, j = new_par.children.length; i < j; i++) {
					dpc[i >= pos ? i+1 : i] = new_par.children[i];
				}
				dpc[pos] = obj.id;
				new_par.children = dpc;
				new_par.children_d.push(obj.id);
				new_par.children_d = new_par.children_d.concat(obj.children_d);

				// update object
				obj.parent = new_par.id;
				tmp = new_par.parents.concat();
				tmp.unshift(new_par.id);
				p = obj.parents.length;
				obj.parents = tmp;

				// update object children
				tmp = tmp.concat();
				for(i = 0, j = obj.children_d.length; i < j; i++) {
					this._model.data[obj.children_d[i]].parents = this._model.data[obj.children_d[i]].parents.slice(0,p*-1);
					Array.prototype.push.apply(this._model.data[obj.children_d[i]].parents, tmp);
				}

				if(old_par === $.jstree.root || new_par.id === $.jstree.root) {
					this._model.force_full_redraw = true;
				}
				if(!this._model.force_full_redraw) {
					this._node_changed(old_par);
					this._node_changed(new_par.id);
				}
				if(!skip_redraw) {
					this.redraw();
				}
			}
			if(callback) { callback.call(this, obj, new_par, pos); }
			/**
			 * triggered when a node is moved
			 * @event
			 * @name move_node.jstree
			 * @param {Object} node
			 * @param {String} parent the parent's ID
			 * @param {Number} position the position of the node among the parent's children
			 * @param {String} old_parent the old parent of the node
			 * @param {Number} old_position the old position of the node
			 * @param {Boolean} is_multi do the node and new parent belong to different instances
			 * @param {jsTree} old_instance the instance the node came from
			 * @param {jsTree} new_instance the instance of the new parent
			 */
			this.trigger('move_node', { "node" : obj, "parent" : new_par.id, "position" : pos, "old_parent" : old_par, "old_position" : old_pos, 'is_multi' : (old_ins && old_ins._id && old_ins._id !== this._id), 'is_foreign' : (!old_ins || !old_ins._id), 'old_instance' : old_ins, 'new_instance' : this });
			return obj.id;
		},
		/**
		 * copy a node to a new parent
		 * @name copy_node(obj, par [, pos, callback, is_loaded])
		 * @param  {mixed} obj the node to copy, pass an array to copy multiple nodes
		 * @param  {mixed} par the new parent
		 * @param  {mixed} pos the position to insert at (besides integer values, "first" and "last" are supported, as well as "before" and "after"), defaults to integer `0`
		 * @param  {function} callback a function to call once the move is completed, receives 3 arguments - the node, the new parent and the position
		 * @param  {Boolean} is_loaded internal parameter indicating if the parent node has been loaded
		 * @param  {Boolean} skip_redraw internal parameter indicating if the tree should be redrawn
		 * @param  {Boolean} instance internal parameter indicating if the node comes from another instance
		 * @trigger model.jstree copy_node.jstree
		 */
		copy_node : function (obj, par, pos, callback, is_loaded, skip_redraw, origin) {
			var t1, t2, dpc, tmp, i, j, node, old_par, new_par, old_ins, is_multi;

			par = this.get_node(par);
			pos = pos === undefined ? 0 : pos;
			if(!par) { return false; }
			if(!pos.toString().match(/^(before|after)$/) && !is_loaded && !this.is_loaded(par)) {
				return this.load_node(par, function () { this.copy_node(obj, par, pos, callback, true, false, origin); });
			}

			if($.isArray(obj)) {
				if(obj.length === 1) {
					obj = obj[0];
				}
				else {
					//obj = obj.slice();
					for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
						if((tmp = this.copy_node(obj[t1], par, pos, callback, is_loaded, true, origin))) {
							par = tmp;
							pos = "after";
						}
					}
					this.redraw();
					return true;
				}
			}
			obj = obj && obj.id ? obj : this.get_node(obj);
			if(!obj || obj.id === $.jstree.root) { return false; }

			old_par = (obj.parent || $.jstree.root).toString();
			new_par = (!pos.toString().match(/^(before|after)$/) || par.id === $.jstree.root) ? par : this.get_node(par.parent);
			old_ins = origin ? origin : (this._model.data[obj.id] ? this : $.jstree.reference(obj.id));
			is_multi = !old_ins || !old_ins._id || (this._id !== old_ins._id);

			if(old_ins && old_ins._id) {
				obj = old_ins._model.data[obj.id];
			}

			if(par.id === $.jstree.root) {
				if(pos === "before") { pos = "first"; }
				if(pos === "after") { pos = "last"; }
			}
			switch(pos) {
				case "before":
					pos = $.inArray(par.id, new_par.children);
					break;
				case "after" :
					pos = $.inArray(par.id, new_par.children) + 1;
					break;
				case "inside":
				case "first":
					pos = 0;
					break;
				case "last":
					pos = new_par.children.length;
					break;
				default:
					if(!pos) { pos = 0; }
					break;
			}
			if(pos > new_par.children.length) { pos = new_par.children.length; }
			if(!this.check("copy_node", obj, new_par, pos, { 'core' : true, 'origin' : origin, 'is_multi' : (old_ins && old_ins._id && old_ins._id !== this._id), 'is_foreign' : (!old_ins || !old_ins._id) })) {
				this.settings.core.error.call(this, this._data.core.last_error);
				return false;
			}
			node = old_ins ? old_ins.get_json(obj, { no_id : true, no_data : true, no_state : true }) : obj;
			if(!node) { return false; }
			if(node.id === true) { delete node.id; }
			node = this._parse_model_from_jsT�����V�������ߵ�[}.�\��������/��}5���|�&}���5��v��������w�Ϳ�����x]u2������n�{�ʩ��_�7��w��f�������Ϙ�g�����u��A�@:D  &���   XA6DD8  ���+��(P(=B��vG` +�& �Cq���qbA�����g Ȃq��E#pO�"h �!���Aj�_�S�2�@�$W*C`  Y�0�P�8H (I2����# �@L��# �B�j���! �`�2Ђ H�b��\ 
�?�*`�(!�,� �@r BN�K��� p,�<GL"�� * 1����! ������@������u�W��/�ōn���|�y���������^t��k��f�����m������}���	�G�����ͻ������uc��r��7y�����߿��~���|}�^쓫�|���o���9��w|���?�;����}��n�Ȁ a�(�V@P)��f� �4E��Vp�:�,:DB$u��p�S< z��H5 ��,#�*�$�  F$D-�D�/�0d�+
 ) *�� �(89C�� +EJ��d0G���Lm���z��+���a����o�xU�?ƕ���t����+:^Il�v?_TS�,��o��=���4���]�U�v��ڦ���t?����}�����R�w��p����o��r��]�;����Ock�8����.n�z8�㯾s�z�}A���|����0��������������ݘ�wo����Aωg�}�nw]�;M1����?9�0���7�;��'���|kj+�uS �|�ݿ�\��w����+���w����y�8��	0�A�d�Z���Y�1��EE�IT)"�6�'#  ��rUP�Ң"@�=��.�S�9�* �P��H`&�6@�Ղ 8Ց �2�#ƊX������4 �
$p���	8Fa�JBX �[�-!w83���=��,�|��ۯ���{7O���.�N���%.���������"'���w�����4O��yv���+�{���?bY��aV~�ro>F�z�}�{m�{[�#y�Y?u�z�������O��qp���2��X� (!p �J�0DZ�Ekq���*q4R�-�@
�AA�'�`,�F�Y!4@ꔫ��V�4�S��J���p��XU!� HP��i֦�{P��CE�t0��1& ��lM  9� :�<@$��
  A�!&b ��a��
�l�
�#� �	�k$�2h�#"�)R������L0���,�a���В���A�Z�d��$��Q��E�˼	���D27{���d-����x�|���U]�SF�+�m�*I~;�8p��f���K��+ݲ�r��|��fv��F�j��N��>�����q}w�ZU�������>�y���0�1��>z��;<�靈Ȳ�J���4P� �!0&p� �!$�Y�QE]ADg� z�h#"�aDr&Q&$�%@D� i`+aC��,��[T����"$p"�������RD�d#J�a�֨�a`��N�U��<
��]�_�ۨK�~�Xo��Y���}�o��;!z/�K�Y�~����wb���ZN�5߯����n�[�~����G���s�*������ݿ���׹���o��v�2�V�]�?���o���?�����9���'��dׇ��[����kZ�����m�t������ػ?��|^_�����O���7���~.�fk�߻���R��^���j��yqy[]"?&�zzڕ�wӓ�z�����nn������oq2��O��\���q/�@ ���3J��6h�@�T���L��P�@@�EA�@	A0Oz�!�b����)��"���(��� �ك)�`A ^B5��F�`��AB	� ���#PKϗ@؆��8 `  ,�Z{7��U��-8�M�b�y���myg���>�U2C��+����Ĺ��8��;�K�N������?�����ﾣ�`������-�������;��/�]v�>�����j많t=��k���?���_��20h�@�
:���bHl�  ���#F�H"��0�A���X��l)�� ���pB(��X� 3w`��!��	i�+��Hp	$D,A1� D@�I���Q*�$�Hc�D����H #	�y!qE��(\7�$
Z͈��@�>2 aB��B#�˪�䀀\�X�R\i���Q����PS�B�����h���� A���q�� ��Y@Q����"(@$���5��{��n��������?㾿o�}\��[�w��l�y��=���<��_�WP���j���s�+!{���)��J���B+�w���~��;[��寖���Dٮ6&OHe-���q�[��B� ��뀠1J"@D���Q��G���A�0��
@ @F�K `8!0�</��b2%I0� Eԍ���P R�m�(�
�Y����E�B H 	H�($&�0D 1�Ȁ#�"�( ��	w�mҿ��3E�[�����w�~�w�=���c����(�n�>�#����J���?�oe�ݗe����/���˳��/َܼm�`?9�FyY��]��ˬ���{X�Ei���I<�v�龿������g�:��b[�����ܱ�OK���\�|{������� �|�'u���6��Ϫ����:�C�6�r_���y������˲k]���2���$�o�s�o�>UmaO��%�uy��s}_*������x{�Cu{ٜ�t^��<^��6*qB���0��B�����`�D�p�*@0 4ѧ䚜���`3�̉� D��C��$À���6	�"@7�lw�$@�`F03."	�Ԋ AYU, G' ���",
�@,��J���O_5r���W�_��O���*��Ξ���w������ΛD�侪k=�[o�+�̙����׃��sfv�6�8�CN��ض�G�r��ܟ�ߍ�?��:W՟��O��������m�HUDw)!���L0 `h@V�A�`h"�Bđ  C�4� @��.3�.�2 �j� (���@�e)3�2�3��&4I*ȧa A\��)���?:��A Ѣ�C	h���H�M  ��)\�$8A�,�ơB��x   @��1���� T�����&��QI����4��n�P ��� @A�� VЅw� z@�F�$0Hy  E �I�.����E�/ {�x�\ m|_��͞�:�������{�J�7���i���������?}۵���{w�ҝ�ճ����ۧ��_������~m��δ��?��й�Ww���_��tW�{��z�����`3��w4���Z���>�ƽ;��?[%Y^ ��)�J�$��g �H�a1���8��E�1����P PF  �%bOp�( �>\ U@�XcBf���H
a�Ѐh 5�G��B��2,@ H�fS����挕a��ު���m��g�9.9�ڞ�^��j������2e�������;��������im�a?�vrľ�r�����F��;���6ϡ/�w�M���W�����?�����CǓ��&}��=��f�_�;�}{/��Ϻ}�~������^JZ��7���m�_��_��ɿ�����'�J��<i��U��l��{v�aﯿ�j��k��w��%��o9����QN��٧�����߷�NVk�8�{��U�+{�{���Qm�^}���CC ��1��v�!(�*�$JA@f -�� �� ��c���*IIC@G6$+��q��D�!�)BF�D_�zq�b��4aOŉP�Fm��.�P$"*�
�Z((,9�� xu�t��ߗq����~m���7��ߖx��I�CO��K����������-��=}_��n�g��ޛ�=7j���ks�;�_�cs6�oԺ+nu^{;�Q��1	{�+��}q�����}���s�Y��Y�Gk��l�^��oн�}���Gߵo���q���/��}�9���������u���q̓gw�u5;��w}����u���/�������}�k�����b��nm}����ܻ�O���;���]�}W�������۽�eϯ���:}�v�����{���w��7?/Ϯ�}�_p=�o����������O����O�y?�x�ڛ?�͗���};ol'������'~��޿z��������߽�?e�pq(���W�������-�ߕ�[�u����Y���˗5r�����6ëW�f;�C�_�����$���*G�����{`/]�u��^�z�;��������_k_��v����_������9�|�v�~����XFgM���~�_xo�����[១>�����o?����$g��k�썾���ޘ5��{��{���7���?�m�_�����7��ս��ut���k����o����yW����z����&����o���f[Yk����������_Y����������V�u��_���G�W�7�E���g3��u���2�_�cڬ�t�}yN��`��Z�x���W��ϭ#���޾l?���~7;5�;���0:�ԭ�pU��k~M�䤗��a����q�u��������/��癴�]}�TԌ��=�r�J���	���R�O�Um�7�k�sN=M��Y��\]����י|�~,��/��F\��Ɲct�r�������������\f���j�;J�j����G�_i��z����ʿW���E��^��ߢK�𼞿=u�}��o5�{�߽U]�_�~�n�[���⿯w��F�N���Sc���<�>����I|U�g�ʯT��_���Z�_op�O�W�s��e6Ϗ��ܾy�{o�[o~M�;��v�|���b���t+�L��7�>�|e��M���-�h�������3��_�{����ٱ�:�f��?�8��.��6�Oߙ~���{u�;m���Jyٿ��nv'{�����+^���w��������ݓ^�k'��[]=�V��iy�~L��?��/oW�mb��ݫ��,��Z�y���I������7��m����I6~���}��7���k�[��_w�Z��ߺ�>��W��6�e������y��O�W����[��~�����?w��z��������~�_߼:9�O�ö;��{yzj����/��[~ݣ�?Θ�n,����ϊ����%�o����������{�|жr����m�u��z���o��A�����}*N2O]��r��?��������<�����-�i{��g��N�6ja(vH�m�����V׶�������>��/�[l��p<�]��������]�y�$%?�{I|ͤwZ��k��� K�R�l���ٯ���C�g��~r�i��v�������LS��u8~����v����G"p�>6G��o�b���Ϯ�����7����׾N�x���������������c̟��4ߖ�j�s^�u��-�+��_Y���>ߔ���g�y��}u��=q������_���f��v���,=�_�]?����6,��'�_=WO�[S�O<�����v��u�񸗯^�w����}�������������7<��b�R^uB��
�{�߿_��6�V~��W���٪*�g{w�'΋����ۤ�oſ��g�����v���;�r�N����s>(�?9,�,f?��N��~�;��
rl�T�;����͟��~���V��eg��tc����ï=����wj�騂~s����ƿmmQ�ԛ�~���}���^�>�j{�*��m~2O���ۿ�o�M�}�����s/z���v��,o������r����m�<�I��&��!v������g�w�������'���l�/�<�}ܯ܎(�Ѽ��t����칛�����O�����������G-^�v�Y����؎j�y�گ��Y����	o/��~=S{~~qY�^9���>>��㦇f�����ʻ�Z������/��1�s�<���]3�?����o��A����[5O��{����t=�{�76r�w��b������~�}^��������w��H�;�Wgo�_���~�s?��׻�/ط�����m������?����n�}~���ۺݻ����|\;|���y7��;����wD��|���m_Ͼ?��Y�������{����������������?�֒�m?���}�������������������{����z����c�|�����e�>������n�z�c�s)�}��������=O�\����A�Jm��H��/��-}oܿc���~��W�=������3�!v�}�15ϙev��M�����7��~���~�{��Q�}8s���+�J�����M�[��_���-��_��ν�Md����y�l�c�Ϙ�y#^nЎ�s�v�������l������������������ݝ�{�_�-�]����[=�n������&˗��i���~����]��Y`�z{�~����m�������]������˙����g�ﳺz��'�����[�񿳓�����ˇ�G$����W��V����9����1Uy�
~��]�T�����:!�/�oӌW~�צϔ�C湻�x����V!��RC��H/�|��8�����߹��wS�i-���Y�c���R?��}��y��5�������������i�Uo��#�[�{�������&~��?�������5�wwꧥ�)��O��w��濛ʗ���A}=.�\n{_��(�9�'��a�f2�7�Qw��q?���o��sA�g�u><���k�ޓ����|m6󽜯�Ek�w�3{�[��۹=�_����zM|������Q߽�x}/W����y9����e�;?�}�S����������׿]q�������e;����/�?�^�n��>v�������I���k�^dxWl.n�����G�������:~�USw��k�R$8�UF��zN����T�������6cp�]\�/|���~k�f�������Җ�䳆��6�xis����h9�����E����Z�g�V;��~�o�������I[e�?_�Y^�����>��?�?�V�_��b���������?�j��������r����-�c>��eڏ�<Il�O�����x�黟�퍶�r�����[�ո;���������������Gk��w�';Ƿy�������/�<���ݞߗ������_���{���{�������?�3�������/^�y����R���n�~�����O������~F���ft��o+��wm��?����l���_�q;p�Z�'o�S��^��<i�|f�{���P����Ϟ:���/�ͪ�\��t��������鬭d﷯�)Fq� �<y��p�C�vk%�P��������-��oc���a�?�?�7G��+�|�_��e�f����~v$��g��	�'��~;r�s@�����|�T��W�����? ���w��/惡o���y�;���ܾ?��+�{]�\��w�_�5�Num�����������F��������M�>2e^����K��O�(�W�{������~����t�3����W��7'���WQkE��W�vŤ9ֆ�����v�&W�`��߿��{t'��a�j�K���rG/Z�ޫ���V�ͽZ�җ�U����ܚ�W|n�)���G�{z��}%5�������������+�Ο�&��^u�W��-�7�:�|��e[��/ß�oŭYZ�ܥz������{�>�ڟ�*w�?���=!�k5�/w5��z�v�;���ړ�[�{�d/��dw��?�^ �����/յ����>�ӿ%9��~n7r�W����<�w���vm���g�_�Z��U���M�o��ݿ���n�����o��+��m$���F�ֽ=�&�w��>���֟R�]M{t_�����uw���rW����no����ȹ�?���vm����=]��mm�����/�}������=�^�]{�?f��������w�������[��u���~�_�����~�����?���B�N��������Ow��������7����~����������x�1��ߏ{�[��]?���V����j����~D���G�������M��jხG��0��r��������ƭ��Xk��a#K?�׮���Ծ��]ku�}?���o��l\�h��w����'��ϫ���7���'}��$-���E���s��Ӈ������?S��n��ώ��F~7����r��u��$������]���Юl}|��[���n�/����n�ߗB��uwW>�2O���������?�(]~�/����߿���yS���޿�N�/���=�Q�W���O�������^�U�U�C���;ݣ�T`������?�������?=�_��?7z:�k�[~�꥕�_����Ɗ�]Y���~�n+��߱�M#r��v/�fs��N��9�w���K�y-}=�zՆԽ�}�~�S��N�˪g�%�'J�E��W���G~����~�����������n�}�%�_��\��ߘ��|�/�o������nع��<{�g�����?�Rdw������f�������y�n�n��_v��W���������w��o?�����v��M�Ż���N��5��tw�o�<v�ۯ���_�~���e�M��z��������W}�?�J����x�͎n��}���wl-������};w?��������y�n�]��]�cw��]�ϭ�g�ƴ����F�?�l?�w�����^Y~����?7-�X���}zu��������⟷��~W��w��˞���_��ھ�Xψ~�����U��7���S��x#��Ɨ�����q�\R<���J�S�[;�>�����K���V�A��ݓ�t}{��7��[��j�[��_���������J����P��_���/��g�
fL�q���?�������R������F���B[o�����O�7�=���c���/���s�?�������V�������������xm�_ؽ��?���W����0�G�8��KI�����~�w坶��M7�{��k^ԗ��#�J%��3>�F����>�k��A��/ǿ��n�*�TRR���o�=�{���+zI����пx��������wN>�ٛ�Ϳ����mv�������q�%�*��/�c#��˭�ʗ��^��g�P�T9����#��Y����D~���%ON�k}��؂�?g{#�?{�ߗ�s�>�mP�o��m�WB�o�þ�r�_��[��w��o?����c�����ݞ����^�zu�?��!�?�p��ϖ��v��G������k���������WWV��}�޲y��5u��/ps������Z��^q���ܿ;׻Џ��?�?�����w����������������G�Gx���������g_z��~�f���/>��}�����1��sU�{����c�b����O�w}^e�����
�u7�M;~<����]�.���ө�"�_>����k��N4/����G���&=�_ҝ�h�{�����]|�[����f�k�����Y�j{���~b�8��]��U}>���ڋw���c����]�����ڏ_�k_uV���d�����������/�������od)����כ��su������u��>�k��ߓ�㿸,��{�@��y����]>��-���^�_6����_��֎�]�꿿G������߹O��c��e������?Y��_�z=M����_k?���![[�����]�o�|}��Ou�뾧�G����+��ݏ��{�}G6O{~���U��wW,ߏ��Cj�z�όM���������v��l�qѹ~�/cW;���x�m�i���z_+��u��]����D��3������ѝ�8�P�u���96���5�9�ʟ)_��|���ԗ�9~Xw�(�	7�_�����Wv7�f���������/5߯n��g�xkq������S���0�?�_���1������'�������_�O}������_�~��������sٝ�̼���7����>|������K���z8������}c*����^է�����_��2kn3��Ý����蝧�h�6�?8��t��ϗ3���J��0�	����َ֫�ٔ����Ǵ�����k�K�����s�s��|����VIУ��^֮=�o��?�������?{��{������Z�8��A�� ���铹���_�,��ξ�yl/d���;�����հ%y&�����f���.����=��Ow2o�����@w�`K��חA��.�7jx�K[��vSo���v�nWG����D�V�����=�������}�.j�^���}������w���%��w�7��}�N����L��=�;�����KӜ/�u-���4O�x����[�����H�O�������s��v�g��S��:a���_�s������Ӎ���W���[�js�ͺ��G�T�����%Ǥ��E�l�@�/�;��_N���R�ׯ�z'�֊���\�Nv�>��?���C��{%��eO�	�)�yO�?�֙�d����Shl�������~7����طc���o�����k���}��~��)�Oﯿ��:�:�N}�^o��O���?�S��kϵ�ּ�}���q��~m���x_�u����m�˻�w�^���_�����������k~���o�3~�������_����������{�׿���{�5�>y����������{�=�v��r��O��'���{�/��Sf������y�;o���ܽo����o��=��~��7�L�^��-��+���۷�G}�]}��d�O�=�����?O�#���yT�^Q��/���}7�t����c��e���Ӿ�:?]���������zi�:���WOq����W1��9�7�XUdj��
�G���:_t������a��˕�f��Wї���d��yi�;w�}�����J:��P���w��Vb����w0�����؋s���^��zS�{=T��5�,�A�����{�^�����m��\�_+��g<ϓ~��-��*������w��nի߹_����G�g������~�u���Ll�i�����瓻��a��{}F֋هC�Z�?�O�u��#�Zco�ri۵��ne{���~�g��2�k�j��m|;n���lgv��p��t{��!�溧��u���U/�Zj�ɩ[��VS�>ofǯ7�k"���f��w;��M��>��%�����W�|�������OR��I��C�q�
������e����6���Zal�[+�L��?���_b�g^~����x=UBz�>0..����+F}�Mm_����킥�=��~��ǹ�#y���roO�t�%��ݻ���t�<��"���/���?��o�8T���������x�_6G�U�����?�[�O6�ҿ��ۿ/��M��w�_'�A�ߨ����������o3~}������Ω�}��7�ȷ�{V&vm9i6z��%�/V3��o >��woC��#
����+�r��m���_���6����k���gk�ѱ���Ir�k��ޗ���o{�k�6�]q%ܜ��P�}�߿{�v�/�������r�]N�����L�������?����������s9���/�����g������mo��}��������y7��Ҧ���~��������^�{����4����x��x�����/v�����+q��u���ۿ~_���]������]��_����������o�7������n��9��?s��7�O��>�s<��t���=����o�����*�����������q�������V޿���������۴���Hh��/k3��?��>�Uf�[���v�hN�����=5�t���*���W�7?_���}�]�?�w��E��+��j�'Z�׭���{���V�����+�v���R�|�o��+l���mXtc�u~%�ƾ��Sww��Z�ion (variant_name) {
			if(this._data.core.themes.variant) {
				this.element.removeClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
			}
			this._data.core.themes.variant = variant_name;
			if(variant_name) {
				this.element.addClass('jstree-' + this._data.core.themes.name + '-' + this._data.core.themes.variant);
			}
		},
		/**
		 * gets the name of the currently applied theme variant
		 * @name get_theme()
		 * @return {String}
		 */
		get_theme_variant : function () { return this._data.core.themes.variant; },
		/**
		 * shows a striped background on the container (if the theme supports it)
		 * @name show_stripes()
		 */
		show_stripes : function () {
			this._data.core.themes.stripes = true;
			this.get_container_ul().addClass("jstree-striped");
			/**
			 * triggered when stripes are shown
			 * @event
			 * @name show_stripes.jstree
			 */
			this.trigger('show_stripes');
		},
		/**
		 * hides the striped background on the container
		 * @name hide_stripes()
		 */
		hide_stripes : function () {
			this._data.core.themes.stripes = false;
			this.get_container_ul().removeClass("jstree-striped");
			/**
			 * triggered when stripes are hidden
			 * @event
			 * @name hide_stripes.jstree
			 */
			this.trigger('hide_stripes');
		},
		/**
		 * toggles the striped background on the container
		 * @name toggle_stripes()
		 */
		toggle_stripes : function () { if(this._data.core.themes.stripes) { this.hide_stripes(); } else { this.show_stripes(); } },
		/**
		 * shows the connecting dots (if the theme supports it)
		 * @name show_dots()
		 */
		show_dots : function () {
			this._data.core.themes.dots = true;
			this.get_container_ul().removeClass("jstree-no-dots");
			/**
			 * triggered when dots are shown
			 * @event
			 * @name show_dots.jstree
			 */
			this.trigger('show_dots');
		},
		/**
		 * hides the connecting dots
		 * @name hide_dots()
		 */
		hide_dots : function () {
			this._data.core.themes.dots = false;
			this.get_container_ul().addClass("jstree-no-dots");
			/**
			 * triggered when dots are hidden
			 * @event
			 * @name hide_dots.jstree
			 */
			this.trigger('hide_dots');
		},
		/**
		 * toggles the connecting dots
		 * @name toggle_dots()
		 */
		toggle_dots : function () { if(this._data.core.themes.dots) { this.hide_dots(); } else { this.show_dots(); } },
		/**
		 * show the node icons
		 * @name show_icons()
		 */
		show_icons : function () {
			this._data.core.themes.icons = true;
			this.get_container_ul().removeClass("jstree-no-icons");
			/**
			 * triggered when icons are shown
			 * @event
			 * @name show_icons.jstree
			 */
			this.trigger('show_icons');
		},
		/**
		 * hide the node icons
		 * @name hide_icons()
		 */
		hide_icons : function () {
			this._data.core.themes.icons = false;
			this.get_container_ul().addClass("jstree-no-icons");
			/**
			 * triggered when icons are hidden
			 * @event
			 * @name hide_icons.jstree
			 */
			this.trigger('hide_icons');
		},
		/**
		 * toggle the node icons
		 * @name toggle_icons()
		 */
		toggle_icons : function () { if(this._data.core.themes.icons) { this.hide_icons(); } else { this.show_icons(); } },
		/**
		 * show the node ellipsis
		 * @name show_icons()
		 */
		show_ellipsis : function () {
			this._data.core.themes.ellipsis = true;
			this.get_container_ul().addClass("jstree-ellipsis");
			/**
			 * triggered when ellisis is shown
			 * @event
			 * @name show_ellipsis.jstree
			 */
			this.trigger('show_ellipsis');
		},
		/**
		 * hide the node ellipsis
		 * @name hide_ellipsis()
		 */
		hide_ellipsis : function () {
			this._data.core.themes.ellipsis = false;
			this.get_container_ul().removeClass("jstree-ellipsis");
			/**
			 * triggered when ellisis is hidden
			 * @event
			 * @name hide_ellipsis.jstree
			 */
			this.trigger('hide_ellipsis');
		},
		/**
		 * toggle the node ellipsis
		 * @name toggle_icons()
		 */
		toggle_ellipsis : function () { if(this._data.core.themes.ellipsis) { this.hide_ellipsis(); } else { this.show_ellipsis(); } },
		/**
		 * set the node icon for a node
		 * @name set_icon(obj, icon)
		 * @param {mixed} obj
		 * @param {String} icon the new icon - can be a path to an icon or a className, if using an image that is in the current directory use a `./` prefix, otherwise it will be detected as a class
		 */
		set_icon : function (obj, icon) {
			var t1, t2, dom, old;
			if($.isArray(obj)) {
				obj = obj.slice();
				for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.set_icon(obj[t1], icon);
				}
				return true;
			}
			obj = this.get_node(obj);
			if(!obj || obj.id === $.jstree.root) { return false; }
			old = obj.icon;
			obj.icon = icon === true || icon === null || icon === undefined || icon === '' ? true : icon;
			dom = this.get_node(obj, true).children(".jstree-anchor").children(".jstree-themeicon");
			if(icon === false) {
				dom.removeClass('jstree-themeicon-custom ' + old).css("background","").removeAttr("rel");
				this.hide_icon(obj);
			}
			else if(icon === true || icon === null || icon === undefined || icon === '') {
				dom.removeClass('jstree-themeicon-custom ' + old).css("background","").removeAttr("rel");
				if(old === false) { this.show_icon(obj); }
			}
			else if(icon.indexOf("/") === -1 && icon.indexOf(".") === -1) {
				dom.removeClass(old).css("background","");
				dom.addClass(icon + ' jstree-themeicon-custom').attr("rel",icon);
				if(old === false) { this.show_icon(obj); }
			}
			else {
				dom.removeClass(old).css("background","");
				dom.addClass('jstree-themeicon-custom').css("background", "url('" + icon + "') center center no-repeat").attr("rel",icon);
				if(old === false) { this.show_icon(obj); }
			}
			return true;
		},
		/**
		 * get the node icon for a node
		 * @name get_icon(obj)
		 * @param {mixed} obj
		 * @return {String}
		 */
		get_icon : function (obj) {
			obj = this.get_node(obj);
			return (!obj || obj.id === $.jstree.root) ? false : obj.icon;
		},
		/**
		 * hide the icon on an individual node
		 * @name hide_icon(obj)
		 * @param {mixed} obj
		 */
		hide_icon : function (obj) {
			var t1, t2;
			if($.isArray(obj)) {
				obj = obj.slice();
				for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.hide_icon(obj[t1]);
				}
				return true;
			}
			obj = this.get_node(obj);
			if(!obj || obj === $.jstree.root) { return false; }
			obj.icon = false;
			this.get_node(obj, true).children(".jstree-anchor").children(".jstree-themeicon").addClass('jstree-themeicon-hidden');
			return true;
		},
		/**
		 * show the icon on an individual node
		 * @name show_icon(obj)
		 * @param {mixed} obj
		 */
		show_icon : function (obj) {
			var t1, t2, dom;
			if($.isArray(obj)) {
				obj = obj.slice();
				for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.show_icon(obj[t1]);
				}
				return true;
			}
			obj = this.get_node(obj);
			if(!obj || obj === $.jstree.root) { return false; }
			dom = this.get_node(obj, true);
			obj.icon = dom.length ? dom.children(".jstree-anchor").children(".jstree-themeicon").attr('rel') : true;
			if(!obj.icon) { obj.icon = true; }
			dom.children(".jstree-anchor").children(".jstree-themeicon").removeClass('jstree-themeicon-hidden');
			return true;
		}
	};

	// helpers
	$.vakata = {};
	// collect attributes
	$.vakata.attributes = function(node, with_values) {
		node = $(node)[0];
		var attr = with_values ? {} : [];
		if(node && node.attributes) {
			$.each(node.attributes, function (i, v) {
				if($.inArray(v.name.toLowerCase(),['style','contenteditable','hasfocus','tabindex']) !== -1) { return; }
				if(v.value !== null && $.trim(v.value) !== '') {
					if(with_values) { attr[v.name] = v.value; }
					else { attr.push(v.name); }
				}
			});
		}
		return attr;
	};
	$.vakata.array_unique = function(array) {
		var a = [], i, j, l, o = {};
		for(i = 0, l = array.length; i < l; i++) {
			if(o[array[i]] === undefined) {
				a.push(array[i]);
				o[array[i]] = true;
			}
		}
		return a;
	};
	// remove item from array
	$.vakata.array_remove = function(array, from) {
		array.splice(from, 1);
		return array;
		//var rest = array.slice((to || from) + 1 || array.length);
		//array.length = from < 0 ? array.lengt������������~�w�y�������1��o���_W���ꫣ���sz��[������o���s��\ж}���5߳��?�֏w�s��v�!�_���9������6���eo�m����2�����=�Y$Ž���K��u��7h�����������6�[�瓶�z�߽���? ���k��A�ǺJ��}�ͨ����N�]lm���c]�"��m2���|����i����>��n����)�=*��u����K�#����մ�Bn{�|����Y�����o�p�����u������뿯�c�����&����z�����=�����E����ߍ��]��1��m:��s]����w\m���w���W�c���E��f���_Hw�묏���+y���'��{�:��蘞�N<�;������S�k��Y_�ڲ��������珧���߾��_p��1׻�o���Y>���7_zy�O���6_���+����v������M��=9��������۩������ś�D6Ϛ��{�*_Y����	�������~�ǿ���Cs[�p���{�~�����7������'����R��rq@�[�~�=���޾/�Zߪ{N�9�_vno��c��ϭ.�K�_�|�gƣ�cZ���.�J����z�����~��K��ۯ��O�/���{�^�������P�?t��޽�'���>\�?�_z�Ϟ?��{+w���{����~�]jO�>�z�?�?����}���{W�O������~������[�۳�s��T�k��f�����?������~}<�z�_��'����Y���x_��������=����������lm�����I�������������������x��z�K�ޮ~�����oo�'���߯�.��G[�ν3��~�Y�~�_�k����=\m������{��ì7��=~�������{W;���*�㻘X��{{��Bw���lF�����+���_��/�?b����}7V��Gk����;��Q
W}2ި�b��g�.�;��˟��������~�_p�_i�������~������Ի�w����y뿟�km}������~�ڣ7���U:��mNw?����w�����Ϛ����]������w������������s��͇gr�#j�ۏ��m�=9�w��ս�����˻�������5�_�U������P�n�_C�擌��������N�|�滷������kf�\?�&���wj�?���M�޳�pʟ�:�#�����ӯy,��]��o����[���������͛�[��	��j��ǻ9n?�U�W�t��r������oq3�����5R7�w�����������.��J�	�c��,�R/K��94�4��:<q�n'O��_@G���oKM���=0���.���r�m>�co����n������������n�/÷P���8ʓ�g��m�L����������;��+9O���n��ߒ����'�~Foe�����zm����}�'��=����Ϳ�S���m6��Y��`*�~�?���75���+cܛSm�?�k;Q4����<&�_���<��}��o�w�d�Io~�o��hY��7��3r��{<W�od�#q�����_�m�En����Y|�R:]��|�o����u��{q^�c��۾����H��|������ɿ�}�ݛk�_O�7���.;����K��G�������G{����?��o�7}�q��_imz���}_nϿ��_���>ؽ����7w�J�������=W���`��݆~�~��#����~���z||���k�?>6��k�9��O��S�Ys�_na����ǿ��m�����ￛ���׹��_�w�3���a�}��������������k_}�o��\z|z]�����E����w�v�3����ѯ��Y��/W=�^()��y����O��֮��w���X[���kD�U�=�_[���V�.Ý-6\>����y�������>�+��S�/������w�(Lt��瞫��~�k9��9~t�=�.WՏӾ���������'���똵^�G����ߩ_����[�?m�����Ļ�{��?����6��j�����z���Źz�u���{�����ؼݢ/k�~�����{O�����~+yt���.=����>*O^���~޷w~~v�Os.޽��K��T���@�_ǻ�4� �����q���u�E�������^��﹡�-�Ư��V55��gJ��׵h���_n&�M~:�o����w���V��$9�+.;���W�ުn����ݟp���ko�����C��u�;�����g:�]^���>���m��2Q�ٗ�������_Jw7����v�W����}�.�E��mk�������l��+�z={���������_�q�E��_ҟ����������^���~������힋[��������}��S�/_��ߞ������m���?w�����������_�{|�-����O��N����������l������U��}���6�h?�=��Y�[���J��g`���#]xW��w{�~�G;tf��{m���eS�T����x�����y���T���>���wy��*�%wo�߾���P���S�_<˒��>?�<����y?�u�y�[||�����{{��_�w��[G=�v���g��pcߗ�+-����y�LW�_W���HLg�����5����}}�}�����jl���;�z�-�w�ݧ����l����a���۽���nk��ݗ�+��ߛ�ϟ�~����e�����^��}ۿ�E���W�N�n���ݪ���;�S�g��9���Y�8�����:}��yz>���v�����}\%��j=w��Ow�������_�{��y�/��߻��Y�_����վ��{ﲖ��;����A��s�_~�]��d���m�~|�������h��&��=>��o���/����ޭ���<֎�N�?�}�~_��{~+����'�y��B����w��ܰ��K�{�Z�w�W��w�����ۍ�����;��S��������ݻ��TW�����Ծ�Y�?��>�ވ5_ݳ�����<�����^�?2����s덿M������i̩�}����ο��\��۞��������g���?_�7lܮ��.��}��i�~�t�_���Lg�[�ǻ׏�w�ۓ�Kk{��R��������t!����V�R���½�?T�7g�ۻ�������ߧ�����G��͹	k���>��ϵ�#��{�~��~�5?�{iR�i���w�x��\���}��M�������[����ϳ}�5���ޯ�mU�	'J�]������:�Q���B�ݿ����t�Z�^�}�>�'��]��BS�;�b����f7լ�����u��</����n�\���=s��/�亝pu�w�������~^�n������]gϞ�����w'��w��{��w+_�u��]o��;�_}}*���闯�/�_��7�7?�����K�_������[s����������Y�k���w�<c��������������w�hg����d��}��?f��j��q����W�_��6�����o��#3ؙ�߹���.���;r_��o�9����Ro�7��Ƌ�����׼�y?��������z'�����n�~nKU9}��'���omj��[���������h�o����]�����������ڗ�ճ��}ӿ�}���7p?����}v���}���y��w������������{V=�������F�eyv�_�����{�������߶񍿯_����������|�뿶�/��ܚۺ�}��v��y��۶��m�~��o�/������4^��8֥��os������W��}5��w�����M�_ƺ�{�u|M֜3ua���6�<���A��������^��1�?�H���?y��UO+��3�&7p��n|wP�<���^7�����/���������}C񭲞���w����V���}��x;������꾗u�Oefaults to ''.
		 * @name $.jstree.defaults.checkbox.cascade
		 * @plugin checkbox
		 */
		cascade				: '',
		/**
		 * This setting controls if checkbox are bound to the general tree selection or to an internal array maintained by the checkbox plugin. Defaults to `true`, only set to `false` if you know exactly what you are doing.
		 * @name $.jstree.defaults.checkbox.tie_selection
		 * @plugin checkbox
		 */
		tie_selection		: true,

		/**
		 * This setting controls if cascading down affects disabled checkboxes
		 * @name $.jstree.defaults.checkbox.cascade_to_disabled
		 * @plugin checkbox
		 */
		cascade_to_disabled : true,

		/**
		 * This setting controls if cascading down affects hidden checkboxes
		 * @name $.jstree.defaults.checkbox.cascade_to_hidden
		 * @plugin checkbox
		 */
		cascade_to_hidden : true
	};
	$.jstree.plugins.checkbox = function (options, parent) {
		this.bind = function () {
			parent.bind.call(this);
			this._data.checkbox.uto = false;
			this._data.checkbox.selected = [];
			if(this.settings.checkbox.three_state) {
				this.settings.checkbox.cascade = 'up+down+undetermined';
			}
			this.element
				.on("init.jstree", $.proxy(function () {
						this._data.checkbox.visible = this.settings.checkbox.visible;
						if(!this.settings.checkbox.keep_selected_style) {
							this.element.addClass('jstree-checkbox-no-clicked');
						}
						if(this.settings.checkbox.tie_selection) {
							this.element.addClass('jstree-checkbox-selection');
						}
					}, this))
				.on("loading.jstree", $.proxy(function () {
						this[ this._data.checkbox.visible ? 'show_checkboxes' : 'hide_checkboxes' ]();
					}, this));
			if(this.settings.checkbox.cascade.indexOf('undetermined') !== -1) {
				this.element
					.on('changed.jstree uncheck_node.jstree check_node.jstree uncheck_all.jstree check_all.jstree move_node.jstree copy_node.jstree redraw.jstree open_node.jstree', $.proxy(function () {
							// only if undetermined is in setting
							if(this._data.checkbox.uto) { clearTimeout(this._data.checkbox.uto); }
							this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
						}, this));
			}
			if(!this.settings.checkbox.tie_selection) {
				this.element
					.on('model.jstree', $.proxy(function (e, data) {
						var m = this._model.data,
							p = m[data.parent],
							dpc = data.nodes,
							i, j;
						for(i = 0, j = dpc.length; i < j; i++) {
							m[dpc[i]].state.checked = m[dpc[i]].state.checked || (m[dpc[i]].original && m[dpc[i]].original.state && m[dpc[i]].original.state.checked);
							if(m[dpc[i]].state.checked) {
								this._data.checkbox.selected.push(dpc[i]);
							}
						}
					}, this));
			}
			if(this.settings.checkbox.cascade.indexOf('up') !== -1 || this.settings.checkbox.cascade.indexOf('down') !== -1) {
				this.element
					.on('model.jstree', $.proxy(function (e, data) {
							var m = this._model.data,
								p = m[data.parent],
								dpc = data.nodes,
								chd = [],
								c, i, j, k, l, tmp, s = this.settings.checkbox.cascade, t = this.settings.checkbox.tie_selection;

							if(s.indexOf('down') !== -1) {
								// apply down
								if(p.state[ t ? 'selected' : 'checked' ]) {
									for(i = 0, j = dpc.length; i < j; i++) {
										m[dpc[i]].state[ t ? 'selected' : 'checked' ] = true;
									}

									this._data[ t ? 'core' : 'checkbox' ].selected = this._data[ t ? 'core' : 'checkbox' ].selected.concat(dpc);
								}
								else {
									for(i = 0, j = dpc.length; i < j; i++) {
										if(m[dpc[i]].state[ t ? 'selected' : 'checked' ]) {
											for(k = 0, l = m[dpc[i]].children_d.length; k < l; k++) {
												m[m[dpc[i]].children_d[k]].state[ t ? 'selected' : 'checked' ] = true;
											}
											this._data[ t ? 'core' : 'checkbox' ].selected = this._data[ t ? 'core' : 'checkbox' ].selected.concat(m[dpc[i]].children_d);
										}
									}
								}
							}

							if(s.indexOf('up') !== -1) {
								// apply up
								for(i = 0, j = p.children_d.length; i < j; i++) {
									if(!m[p.children_d[i]].children.length)�����������T�x���'���]��߽�o�JYw����F�^����W�{4���F����ݛ�����O�~|�߫��l��t���r�����d����.:��[����[����o(�����}�_տ�n�w�G�X %e����"88�x�|�!IQ �L�Q,v N��' G��d�)FW�$#���B��@*� �M��5F�� "	�c�(o���F���
 ��B.�#Kaa�IT�fь�F�P&+,3F����AE�Jhi(H�1C0��D�d{���$*D���C� ��	��,���M.G�9��r��C"�) �t�OY��EXL����D@���w�EX]&��h��WX8��*E����޾�)���6��^�7>?�������������������]�ٿ����:�ͫ���n~�=��8�7��ev���m�Y�?���&�����<�pn�H��E�_quc�s/�W��s�����ݯg/�߫�gZ�Q�AT@uB$�����x��'z`L��2���XG��0Vb�	D	3 - "W� ��H ��$P3�K$ B��i2fPhbR9"��XD� c"�(! �+��ٰ,- �F_U�ݨ���7�嫭���'n�߹�ݿ2����^/���6�މz������{NW����^�/�u�1l�~�~��x��������U�~�}��������n�N׵�sɩ^�G�d�}[�������������-������_����7.�[�uU�'��׿�����������|k0��}/ֿϽt_�-^ߗ�է��?�6^���������������?~����9�O:�:�{����x�w���oo��˅��g�ֻ��5+����ܝ�ȹi"�X)#�O͂��EƉ�I�6�j
��1g�djB)�bPhH!&� (Q
' 
`>UfB*���D����Gi�hH��AaTX@

�8a��P��(!� ���"�\ T���^�R��_�k���������޿����ߺ~���O��+���w��v��W����٣?��k������������ڲk��A��w�?�M,>��7�����{5͸�����_����d������������7�>�v���P Ғ A��!@I�p���^�0�!�V#	|a2e%H��'��E�5�R0�Peа����A�N�FB�3��0˲4�u�XQ��bl	{�� 
��rJHl2W�=OT�-2�"��UMN*�p!#BӶ�E^�n123"4A|G�L�Tx�-S���=
���*�E����XP�c�1Ŧ�"]D_jz@eҍE��dP�.�6�".N���	�~ I��Ap7}��!� B{� �Oj����������������:8�y�����{�>���c�u���W��7����������_�������}��Ƨ�۱�y����+󚹿�����6zgox+�w����[��CE��s��|�ߵ������_ (0R�v�3�+@�`�@� NϠ<'pZ�`��9�%�������{D�8<��Ă9_h��\0 i::Ŵ�IT
DL�LpA�� �dط�PG &���VL��Rb K���e����t����x�����Ϭ߶�O�[�;���������:����W��w�sK�&��/��ǵ�i_���������|~_��u���^�W����{ri�^w����U�e>�������W������%����[������������/��n������ߵ���N�ot���[Mr������k����ݐ����O�R^U�}}}�����-شw�w����?���p_�������?�������}�����^'��'��h��D�VV�C�<H�i �f[-.�!P����� {+X�x\���*rjB� � ��a)~�����܃���H@D���D��p��`@"1�W,I9���� �� $ %�@�JA��5Z�uv��j��oa�g2��v�����L������s��������̳������|�g�|������^}����|~�V�������U~�ןh�*��O}w�s'��W�>��w�}̿|���i~[��׮y��wiV����~T�K� ��N�T@�I�p�Y"!ܹ@/ J(f! �0��	%��B��:P��%�a���@f4
���y��΋T3H��.P"B	\�V�H�T�8 FB��a��8ȸ|E���1M�@?�T�5��"n4�[N�� @�&%��2�2@2��¡
���b!��Pp$�A�j�'"���<KM$ =0��&��TI+���A  ��G'�K��� v	��W����s��<w{��|����߭<���{���k6r���o��_g"���׾�g�:��]ag��ݝUo���/y�|���O����j&Ym�d��~{P,��HϷ��hM�=��.쿸ׯ����������W��gp@� Q�G*Gf_
�Y-��#����<+��X�P �a9cx�+��@S)°D�&xB�I '�9�.��"<2�5$��Bl�ȕKLEh6 J�)�N�%��1,�W��o�%���뻣���ߪ�L������%w}�)�v,�5��~�fjݥ{o���/�����5��H��R�V�����r���]�r~������󙾿�tTӿm�n��y{1�����m�i�����ޟz��'6�ݯ�����4�����|���/�����Vկ:??����8�o������h�kF�v*�M���>EH������}������������~������O;�?��i5:�����6ݔ}��h�O����ʅ�1�^$IHԨ�C`�B��D�y����R��)ihLLDdQK�	��^�!C�5�P�,K��i,f�( �	��b!4'�X�F�$����]��t�M&�hk�g.Bp*���L?�6\�jBb|�Azg���Cv�w��y��C`������{����>���Ϸzn�}~Mw;�m/틟S����o��;}�����,|��~���/�}�m]ٟ��s��N��_�)�Y���������Y���oο��V\�1��4�. +L�6�   �BiS�=9F�@ud�D%#v*`�"E��j��S�C�9bbRN�!G?v��
6!��kg���eZ�L�	��oI� �P@$IM��2��
�4E����dp�G
��P��6�ԓ'ɉ<� C��'�@?$ ���8�,�� ����(���#��(��0c�T��H#�q���
i�I�2`F6.!Q\���"Ę^Q2�Ѐ j�����|)��t�s���Gk���n�w�Z�����3~�ﵺ�T;�_����Ve)w�����7�p����2ש�����ӕ���>��oϾ�����ں����=���:���l������.���������������&�&dŒu_� '�Z�DMВr7) ���ʀ��%�p,�j�E�sh�D L��$7T�F� 
��� $i��K`2-MB`�
sB�@IC!�D��j���jR
��^(��l�޺�������V�^��}�������t�}���,�G�\?����� lw��G���D����ï���ؾ�������W߯����g]��}z��w��?�����݉�����NJ��U?�����}��׳�������?�������N)/�|��/��K���m!��_����}�������m�����������o��x~�����/U�z�P|s��{�&ie���k�z��������O�����v����5Ok�gN��7���N)|C��H@����@<B�E�J�ft��_ ����$-2`-�)8�Q����ud
���D�9�5E�b��%#UE1+����@�B�4 l���I<0A�@tG�h���BFP�\ade_new_checked_state(obj.id, false);

								cur = $.vakata.array_filter(cur, function(id) {
									return allIds.indexOf(id) === -1 || selectedIds.indexOf(id) > -1;
								});
							}

							// only apply up if cascade up is enabled and if this node is not selected
							// (if all child nodes are disabled and cascade_to_disabled === false then this node will till be selected).
							if(s.indexOf('up') !== -1 && cur.indexOf(obj.id) === -1) {
								for(i = 0, j = obj.parents.length; i < j; i++) {
									tmp = this._model.data[obj.parents[i]];
									tmp.state[ t ? 'selected' : 'checked' ] = false;
									if(tmp && tmp.original && tmp.original.state && tmp.original.state.undetermined) {
										tmp.original.state.undetermined = false;
									}
									tmp = this.get_node(obj.parents[i], true);
									if(tmp && tmp.length) {
										tmp.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
									}
								}

								cur = $.vakata.array_filter(cur, function(id) {
									return obj.parents.indexOf(id) === -1;
								});
							}

							this._data[ t ? 'core' : 'checkbox' ].selected = cur;
						}, this));
			}
			if(this.settings.checkbox.cascade.indexOf('up') !== -1) {
				this.element
					.on('delete_node.jstree', $.proxy(function (e, data) {
							// apply up (whole handler)
							var p = this.get_node(data.parent),
								m = this._model.data,
								i, j, c, tmp, t = this.settings.checkbox.tie_selection;
							while(p && p.id !== $.jstree.root && !p.state[ t ? 'selected' : 'checked' ]) {
								c = 0;
								for(i = 0, j = p.children.length; i < j; i++) {
									c += m[p.children[i]].state[ t ? 'selected' : 'checked' ];
								}
								if(j > 0 && c === j) {
									p.state[ t ? 'selected' : 'checked' ] = true;
									this._data[ t ? 'core' : 'checkbox' ].selected.push(p.id);
									tmp = this.get_node(p, true);
									if(tmp && tmp.length) {
										tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
									}
								}
								else {
									break;
								}
								p = this.get_node(p.parent);
							}
						}, this))
					.on('move_node.jstree', $.proxy(function (e, data) {
							// apply up (whole handler)
							var is_multi = data.is_multi,
								old_par = data.old_parent,
								new_par = this.get_node(data.parent),
								m = this._model.data,
								p, c, i, j, tmp, t = this.settings.checkbox.tie_selection;
							if(!is_multi) {
								p = this.get_node(old_par);
								while(p && p.id !== $.jstree.root && !p.state[ t ? 'selected' : 'checked' ]) {
									c = 0;
									for(i = 0, j = p.children.length; i < j; i++) {
										c += m[p.children[i]].state[ t ? 'selected' : 'checked' ];
									}
									if(j > 0 && c === j) {
										p.state[ t ? 'selected' : 'checked' ] = true;
										this._data[ t ? 'core' : 'checkbox' ].selected.push(p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
										}
									}
									else {
										break;
									}
									p = this.get_node(p.parent);
								}
							}
							p = new_par;
							while(p && p.id !== $.jstree.root) {
								c = 0;
								for(i = 0, j = p.children.length; i < j; i++) {
									c += m[p.children[i]].state[ t ? 'selected' : 'checked' ];
								}
								if(c === j) {
									if(!p.state[ t ? 'selected' : 'checked' ]) {
										p.state[ t ? 'selected' : 'checked' ] = true;
										this._data[ t ? 'core' : 'checkbox' ].selected.push(p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
										}
									}
								}
								else {
									if(p.state[ t ? 'selected' : 'checked' ]) {
										p.state[ t ? 'selected' : 'checked' ] = false;
										this._data[ t ? 'core' : 'checkbox' ].selected = $.vakata.array_remove_item(this._data[ t ? 'core' : 'checkbox' ].selected, p.id);
										tmp = this.get_node(p, true);
										if(tmp && tmp.length) {
											tmp.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
										}
									}
									else {
										break;
									}
								}
								p = this.get_node(p.parent);
							}
						}, this));
			}
		};
		/**
		 * get an array of all nodes whose state is "undetermined"
		 * @name get_undetermined([full])
		 * @param  {boolean} full: if set to `true` the returned array will consist of the full node objects, otherwise - only IDs will be returned
		 * @return {Array}
		 * @plugin checkbox
		 */
		this.get_undetermined = function (full) {
			if (this.settings.checkbox.cascade.indexOf('undetermined') === -1) {
				return [];
			}
			var i, j, k, l, o = {}, m = this._model.data, t = this.settings.checkbox.tie_selection, s = this._data[ t ? 'core' : 'checkbox' ].selected, p = [], tt = this, r = [];
			for(i = 0, j = s.length; i < j; i++) {
				if(m[s[i]] && m[s[i]].parents) {
					for(k = 0, l = m[s[i]].parents.length; k < l; k++) {
						if(o[m[s[i]].parents[k]] !== undefined) {
							break;
						}
						if(m[s[i]].parents[k] !== $.jstree.root) {
							o[m[s[i]].parents[k]] = true;
							p.push(m[s[i]].parents[k]);
						}
					}
				}
			}
			// attempt for server side undetermined state
			this.element.find('.jstree-closed').not(':has(.jstree-children)')
				.each(function () {
					var tmp = tt.get_node(this), tmp2;
					
					if(!tmp) { return; }
					
					if(!tmp.state.loaded) {
						if(tmp.original && tmp.original.state && tmp.original.state.undetermined && tmp.original.state.undetermined === true) {
							if(o[tmp.id] === undefined && tmp.id !== $.jstree.root) {
								o[tmp.id] = true;
								p.push(tmp.id);
							}
							for(k = 0, l = tmp.parents.length; k < l; k++) {
								if(o[tmp.parents[k]] === undefined && tmp.parents[k] !== $.jstree.root) {
									o[tmp.parents[k]] = true;
									p.push(tmp.parents[k]);
								}
							}
						}
					}
					else {
						for(i = 0, j = tmp.children_d.length; i < j; i++) {
							tmp2 = m[tmp.children_d[i]];
							if(!tmp2.state.loaded && tmp2.original && tmp2.original.state && tmp2.original.state.undetermined && tmp2.original.state.undetermined === true) {
								if(o[tmp2.id] === undefined && tmp2.id !== $.jstree.root) {
									o[tmp2.id] = true;
									p.push(tmp2.id);
								}
								for(k = 0, l = tmp2.parents.length; k < l; k++) {
									if(o[tmp2.parents[k]] === undefined && tmp2.parents[k] !== $.jstree.root) {
										o[tmp2.parents[k]] = true;
										p.push(tmp2.parents[k]);
									}
								}
							}
						}
					}
				});
			for (i = 0, j = p.length; i < j; i++) {
				if(!m[p[i]].state[ t ? 'selected' : 'checked' ]) {
					r.push(full ? m[p[i]] : p[i]);
				}
			}
			return r;
		};
		/**
		 * set the undetermined state where and if necessary. Used internally.
		 * @private
		 * @name _undetermined()
		 * @plugin checkbox
		 */
		this._undetermined = function () {
			if(this.element === null) { return; }
			var p = this.get_undetermined(false), i, j, s;

			this.element.find('.jstree-undetermined').removeClass('jstree-undetermined');
			for (i = 0, j = p.length; i < j; i++) {
				s = this.get_node(p[i], true);
				if(s && s.length) {
					s.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-undetermined');
				}
			}
		};
		this.redraw_node = function(obj, deep, is_callback, force_render) {
			obj = parent.redraw_node.apply(this, arguments);
			if(obj) {
				var i, j, tmp = null, icon = null;
				for(i = 0, j = obj.childNodes.length; i < j; i++) {
					if(obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1) {
						tmp = obj.childNodes[i];
						break;
					}
				}
				if(tmp) {
					if(!this.settings.checkbox.tie_selection && this._model.data[obj.id].state.checked) { tmp.className += ' jstree-checked'; }
					icon = _i.cloneNode(false);
					if(this._model.data[obj.id].state.checkbox_disabled) { icon.className += ' jstree-checkbox-disabled'; }
					tmp.insertBefore(icon, tmp.childNodes[0]);
				}
			}
			if(!is_callback && this.settings.checkbox.cascade.indexOf('undetermined') !== -1) {
				if(this._data.checkbox.uto) { clearTimeout(this._data.checkbox.uto); }
				this._data.checkbox.uto = setTimeout($.proxy(this._undetermined, this), 50);
			}
			return obj;
		};
		/**
		 * show the node checkbox icons
		 * @name show_checkboxes()
		 * @plugin checkbox
		 */
		this.show_checkboxes = function () { this._data.core.themes.checkboxes = true; this.get_container_ul().removeClass("jstree-no-checkboxes"); };
		/**
		 * hide the node checkbox icons
		 * @name hide_checkboxes()
		 * @plugin checkbox
		 */
		this.hide_checkboxes = function () { this._data.core.themes.checkboxes = false; this.get_container_ul().addClass("jstree-no-checkboxes"); };
		/**
		 * toggle the node icons
		 * @name toggle_checkboxes()
		 * @plugin checkbox
		 */
		this.toggle_checkboxes = function () { if(this._data.core.themes.checkboxes) { this.hide_checkboxes(); } else { this.show_checkboxes(); } };
		/**
		 * checks if a node is in an undetermined state
		 * @name is_undetermined(obj)
		 * @param  {mixed} obj
		 * @return {Boolean}
		 */
		this.is_undetermined = function (obj) {
			obj = this.get_node(obj);
			var s = this.settings.checkbox.cascade, i, j, t = this.settings.checkbox.tie_selection, d = this._data[ t ? 'core' : 'checkbox' ].selected, m = this._model.data;
			if(!obj || obj.state[ t ? 'selected' : 'checked' ] === true || s.indexOf('undetermined') === -1 || (s.indexOf('down') === -1 && s.indexOf('up') === -1)) {
				return false;
			}
			if(!obj.state.loaded && obj.original.state.undetermined === true) {
				return true;
			}
			for(i = 0, j = obj.children_d.length; i < j; i++) {
				if($.inArray(obj.children_d[i], d) !== -1 || (!m[obj.children_d[i]].state.loaded && m[obj.children_d[i]].original.state.undetermined)) {
					return true;
				}
			}
			return false;
		};
		/**
		 * disable a node's checkbox
		 * @name disable_checkbox(obj)
		 * @param {mixed} obj an array can be used too
		 * @trigger disable_checkbox.jstree
		 * @plugin checkbox
		 */
		this.disable_checkbox = function (obj) {
			var t1, t2, dom;
			if($.isArray(obj)) {
				obj = obj.slice();
				for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.disable_checkbox(obj[t1]);
				}
				return true;
			}
			obj = this.get_node(obj);
			if(!obj || obj.id === $.jstree.root) {
				return false;
			}
			dom = this.get_node(obj, true);
			if(!obj.state.checkbox_disabled) {
				obj.state.checkbox_disabled = true;
				if(dom && dom.length) {
					dom.children('.jstree-anchor').children('.jstree-checkbox').addClass('jstree-checkbox-disabled');
				}
				/**
				 * triggered when an node's checkbox is disabled
				 * @event
				 * @name disable_checkbox.jstree
				 * @param {Object} node
				 * @plugin checkbox
				 */
				this.trigger('disable_checkbox', { 'node' : obj });
			}
		};
		/**
		 * enable a node's checkbox
		 * @name enable_checkbox(obj)
		 * @param {mixed} obj an array can be used too
		 * @trigger enable_checkbox.jstree
		 * @plugin checkbox
		 */
		this.enable_checkbox = function (obj) {
			var t1, t2, dom;
			if($.isArray(obj)) {
				obj = obj.slice();
				for(t1 = 0, t2 = obj.length; t1 < t2; t1++) {
					this.enable_checkbox(obj[t1]);
				}
				return true;
			}
			obj = this.get_node(obj);
			if(!obj || obj.id === $.jstree.root) {
				return false;
			}
			dom = this.get_node(obj, true);
			if(obj.state.checkbox_disabled) {
				obj.state.checkbox_disabled = false;
				if(dom && dom.length) {
					dom.children('.jstree-anchor').children('.jstree-checkbox').removeClass('jstree-checkbox-disabled');
				}
				/**
				 * triggered when an node's checkbox is enabled
				 * @event
				 * @name enable_checkbox.jstree
				 * @param {Object} node
				 * @plugin checkbox
				 */
				this.trigger('enable_checkbox', { 'node' : obj });
			}
		};

		this.activate_node = function (obj, e) {
			if($(e.target).hasClass('jstree-checkbox-disabled')) {
				return false;
			}
			if(this.settings.checkbox.tie_selection && (this.settings.checkbox.whole_node || $(e.target).hasClass('jstree-checkbox'))) {
				e.ctrlKey = true;
			}
			if(this.settings.checkbox.tie_selection || (!this.settings.checkbox.whole_node && !$(e.target).hasClass('jstree-checkbox'))) {
				return parent.activate_node.call(this, obj, e);
			}
			if(this.is_disabled(obj)) {
				return false;
			}
			if(this.is_checked(obj)) {
				this.uncheck_node(obj, e);
			}
			else {
				this.check_node(obj, e);
			}
			this.trigger('activate_node', { 'node' : this.get_node(obj) });
		};

		/**
		 * Cascades checked state to a node and all its descendants. This function does NOT affect hidden and disabled nodes (or their descendants).
		 * However if these unaffected nodes are already selected their ids will be included in the returned array.
		 * @private
		 * @param {string} id the node ID
		 * @param {bool} checkedState should the nodes be checked or not
		 * @returns {Array} Array of all node id's (in this tree branch) that are checked.
		 */
		this._cascade_new_checked_state = function (id, checkedState) {
			var self = this;
			var t = this.settings.checkbox.tie_selection;
			var node = this._model.data[id];
			var selectedNodeIds = [];
			var selectedChildrenIds = [], i, j, selectedChildIds;

			if (
				(this.settings.checkbox.cascade_to_disabled || !node.state.disabled) &&
				(this.settings.checkbox.cascade_to_hidden || !node.state.hidden)
			) {
				//First try and check/uncheck the children
				if (node.children) {
					for (i = 0, j = node.children.length; i < j; i++) {
						var childId = node.children[i];
						selectedChildIds = self._cascade_new_checked_state(childId, checkedState);
						selectedNodeIds = selectedNodeIds.concat(selectedChildIds);
						if (selectedChildIds.indexOf(childId) > -1) {
							selectedChildrenIds.push(childId);
						}
					}
				}

				var dom = self.get_node(node, true);

				//A node's state is undetermined if some but not all of it's children are checked/selected .
				var undetermined = selectedChildrenIds.length > 0 && selectedChildrenIds.length < node.children.length;

				if(node.original && node.original.state && node.original.state.undetermined) {
					node.original.state.undetermined = undetermined;
				}

				//If a node is undetermined then remove selected class
				if (undetermined) {
					node.state[ t ? 'selected' : 'checked' ] = false;
					dom.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
				}
				//Otherwise, if the checkedState === true (i.e. the node is being checked now) and all of the node's children are checked (if it has any children),
				//check the node and style it correctly.
				else if (checkedState && selectedChildrenIds.length === node.children.length) {
					node.state[ t ? 'selected' : 'checked' ] = checkedState;
					selectedNodeIds.push(node.id);

					dom.attr('aria-selected', true).children('.jstree-anchor').addClass(t ? 'jstree-clicked' : 'jstree-checked');
				}
				else {
					node.state[ t ? 'selected' : 'checked' ] = false;
					dom.attr('aria-selected', false).children('.jstree-anchor').removeClass(t ? 'jstree-clicked' : 'jstree-checked');
				}
			}
			else {
				selectedChildIds = this.get_checked_descendants(id);

				if (node.state[ t ? 'selected' : 'checked' ]) {
					selectedChildIds.push(node.id);
				}

				selectedNodeIds = selectedNodeIds.concat(selectedChildIds);
			}

			return selectedNodeIds;
		};

		/**
		 * Gets ids of nodes selected in branch (of tree) specified by id (does not include the node specified by id)
		 * @name get_checked_descendants(obj)
		 * @param {string} id the node ID
		 * @return {Array} array of IDs
		 * @plugin checkbox
		 */
		this.get_checked_descendants = function (id) {
			var self = this;
			var t = self.settings.checkbox.tie_selection;
			var node = self._model.data[id];

			return $.vakata.array_filter(node.children_d, function(_id)�������"������̓�����X�q&����d���u�>��_�㑟�nVz�>Y��J���x?���[>�I��Ƭ/��2��#�����vņ�>ܶ f}I)��w�<��;w��qy�����T� ���T��C0�&�d�Á���D��/;$��FY�ACK @S��(CX�P��C�<$BuJ @bC� �VkP*,[�A�L�	��K` L"dJG@$�@ !�QJ�Y�,�
��PK��s0�Nx�
��		��IM�Ax��
�b�Db(�H� S`" ��	@�
�F<N@�c)D��Sr��@�� i+�@�X��x��d$b ���@ A | $J�@.�H
����-�K��c�U@w_��\�_;�?dq�]c�7��+F]�S�=Z�7VC�׭��A�uf��o��I��t;lN��m��������>�aL���~�G�?Μϸ�����,|�\��۟a���{��?����mbH ��DBj �!1��88 B!p�H�pcBN���"�	� ,� N�$@I+�,I��D 0 �B���Q ~$�h@!쀘 ND&� (BKV�- �0��  `��'���������kΘ�~��Ez�������g�����1�}����t��O�*�=�Zǭ���V���|����&���%?��}>�;���s���o~�JOr~wX�'���s�OV�=Ԯ���~L��b���=�۴�گ۾�k�U�fQE�7>#��|+Q���o/��M����~1�ݐ]�3�b�溉���
�;=g����Ὓ'��>P\9���}��<��c���ݻw~���w���g������ν��~�n���Dd��JpCA�����I��:DT��(W`V @r�$6�U6!a�+W�B%�PT7�5'�	 @�R��0p��C�L!�p!)�H.0f@�L j��ND* P	 !
\��# ��|����%���[Mg�K�5W��n����������w��c������>����M��|��g	��?^����f=�_��^���񆿇�8ߺ�k��c�����P(E�նCE�U���˔@?o��+��elcHa~�0� (�@  ����!��t���4� (�le��A
PqR��f�8�F� H S+(�o�R0['(԰�� �A �0����� 
p$@�"��#�0�%?�%"��  1tx���0����6 CICm* i)�V���y�i ���C �U�J1`P��H� �C��!A�0�!J�	 �ФA�M�� J(AAH� Ag��B� ��
9�-�J$¿��! ��j���<"��:��5�iԅH��;��o�|y�[���'�|��m�Ok��͟�zp��`_-�t����w��-�	�Z%��7�K�y��2ޱ��#V�S��Nz���Q�_i<�UڥsY���m�t��&�vg�j؈E��a��Rd	B��H2��S%	 $)? 1
$� 0@��	�� `eG'�!0�(Y?V�HDp��( 5H �H	 �L���" A  ��Cj �@�ɐ�� U�8����~�m�����.w����?�����%n�?��ǣ�z�����^\�>�_w:���r���,����-�>#Kw��]��^b�j7������>�W�Xb�����Ϧ;��E3��g��ߏ�z%�ߟ��q���w&��Y��
v�m���zF�l�=��OҮ^���ߴt�f��[Q����m����-��������\\=25��~�������~}�}���W�޿V�z�v����7�����}nq@��;z9������Qx�O\�	�@��e�%$B��1�@ _>q�A`SaƠ zΈ� $�}��@�U�E0�P� \9L� $��*���7�$h����@[� ���(�! �H�(,X�E1 @ *�6B�+�wZ��}�&����{��������2�k���Ma��n��i��k'��o�����v��Hm�~���������3��D>��,���ίP����-|���D���ΞX����6�L�[�l�+�/3� @��4b	�� AN<ȗApo��!��`�] �7���(� !QFG�A4�1
|l0h�C!U�R����h�%��ԁJ�x\I����.O`M� ���	���"�����R)���i��I��� �P5G�=�����A �TY;Np� ����l���i��i�$`
�4�)#%�$����?Ũt"
�
A:�pX 8*jsA�� <F$ %Q�����'��v��O��=oO�r�܃�~���׼��g�}��7:��/��G�����So=��9ə_���������C��o�I���п:_����~�����q�'?�OÁFx�յ�)ƿ��{Wh�����y���*4FH�  �)HXr�%L��ۀRׂ���@�r9LH|�G�!�  � @�!� � � �j��%�0c8@BH� ���pVF�	X�90��U�P  �E2 �  �F���ӯ{_���G�ۚt�Ѻ?���J��?˒g�������Ʒ��po�5���e������t?vͧU?�ߞ[Qu�+����i~]2�z��"�?�_�A�-�����V/����������?g�EX�ӿ�}��>?>G[U����2�߼;�����Yg��X
��"S����'��s�zm�u����p�����w�nzTg��쵝6~����)im��`�A�nW�[�q�o<7�6������o�i�������/�yՕ߬�׌�[BY� " "�I�m�a��N �B������`�u�v��0�:�Q��Qo�l 1R
р��-@�p�P$a� ꕈ0�Z��k��o��*0�T�
D8���BS�OLH�@��`�� �&��.=��	�mj-Z�7-ϛ"�����=��=_�7�}����ػ}M�>[/=�7��4▼T�g��>�҃6��T?�g��k�5����������k�?W�\�~�#�f�}��k��}�����q�/���29t�*�	( " 8!�,|���EDB � @B� ��)��FH�r�$�v#j���y}h�@a�@O+
�*�	6�@@ C̈́A�XJA�A �V��� �@&e�#G&�,<�(H.A�@�� � 0�EFP�!� 4�a�d"�", : =D�Y�C`b@�P �!�r
2�D4B� �H��&ȃ�t���a0���fH��~!�0�FZ��b,"H ��2� /� ���nXJY�틋��i�s�M��%�S��;�>�w�;�\����σzɬ��|�0OR�v��ou��宿+����'�o�u�}��m�IG1��{�+ż�����\�]H����ڳq=�a�I����}d��zϮhwE � �x
��*DD	��G@� GN���ꌐ
x�M^4N6 � �!O6�CR! d# )
  2�y0R@r"�Cbi�J���8
�Dt�: �W��b�"
�� b��`�遚��׷U'�n�x5����O�[m����{}���Z�����.va���nn�����L�����K�Ҥ.o��}V��r柨��z��~�T1o����^�bh��'��^����`�U��T���G����*�������}�=���L߷��;�v{6+��^^?֏���}��n���٦{�p�w��w}:�S�kX>�������fu{w�Z��䦟ؽH�w����-�[R����~k������������u\�������~ 
�}�{�`�U�4t�&�ԝ@��n �L1AH� %�D�O,��@��#R{�
��D�D<����0� Bf�y��� �hCQhrH@%
��B�,ИD�#hD�R�F�ڈ3T1+�dA�E�%��P{-�L9��oB��`�O�յ P(e�"x�a`A�4FA��PQ�!i��/#G�0ۉP��I  �|��?&:� H�
 "�Y��a+��F�(��G�.���Ny���Z~S�������t�y�������]���w������˿����e���z]��{}+����?~�ߟ����w;�����z�-��4۞������_�;�������>�m��~����c��{��{��;�Sd����_���������en����������j�t�\������Z��O�\����Q���?�{�u_���}m���E2�b��z�����~�[���ǟ�ܜ~������������/���m.{_��I��&U�	����R��%4K���[��4h�I�,EE���h���y�B�%O�` k�e��!��U��'�T�3�&9&-��B4� ���tF�H a�I2( 'B�bw)C#�2�@K�o�X/�~o���;����1�%��N��������w����ݙ|<��f��{��2>w���oY]��or�\�_����Pz��}޻�r����ߴ����^]�!��9�#��{����}������Wv�k���搹Ikh��"�H�9�1 ���h�
i��jP�$p����T@�� YD2"w�RE��^���#��0�$ R50DjNP��	ci�܀���&h�B�N�bD�R��&�� �%�n��;Q�F<��L��/h��0j��-�
��(�? [�5�^H��2H $��в���g4Y�A@�r�F!jD�T���e(��jC)Hl�ZAE[��00� 2J���67�sn{}���jn���:�	����y�[����a���[�R�y�.�4f�y����W6�w����O���۟L?�������׷�޽�}ܷ�i�G�k�t0=>T�^�*?yNu%?��o�A��8 ��C�)��!d���]]D�E �ʢLA��(ڨ����X���������VS(A@A@!�!(J�n=�|H� **%�#�!ө H��k�DB�$�H�� ` A���68�#�@!����^{g��I���W�}�֭�}ݯ����mW��x�������kq}�^ɳ����ӝ�ω梯_�R?�y����g�y]�¡������ҿ���gϷ�g���)�������o�^��.���X�?�ק���n�h���ko�����%��	ʽ���v>��W�;B3�������C����`fw�xg����Xu�����>��~�Y�~��^�������9��}���͟�u�ӯ��������^T��=��O������珕
¢�P7 �dS�9���C�K^�b�D��I"J�d�,	�""= �D"��MĆb�aJX�J	z�/$E�TDU $�	T��b1��.��X׏�k �B�<�C��U1HK�v�c�{������K�r���/O����zi�u*Ww�+����f���O���d,_���]��e����_��^��7�޻���[��E���q�������{������na�|-�ij����«�;��8� D��Έ��t��6��R�!�0W#�AQJJ&���:e�`�a�t�3WV'@q	�aࣄ(0�Ǥ��p�A�$P�D�PJ����c-��WG#���� `$�S���C4�%Ȭ���`6���=&I�b/�.��m��%�0>)q2�@vCs��c�>\@�E��6���&0La���

p���BH Lb3�Ҕ���!�r�#�(�e���"?(�"A �IF#ف9�����w]�O�o����k���ܮf���W��;��͞�\o������߾ۛ�GqO<�ߞuw�_T�[����u�z�_���1r{�ͻ�~�M�y��ݞ�}�o���z��P���O����ۢ���2���/���fQ���r!��+F�d���Q[	�:-�D�c1	� K�=r��M2+�8b�Q���PT���!��*R�B(K�SO�6<���;�<D-�Y("�T�� qD �b�[2� �+�\�(z�f�|n�`����������=g���[ݴo����o5��f���������z-���{����̿�����������O���?�������a?_�_�����������7���/�{�_c篻�����&��w��|��׿o����w��:Uݛ��j���;>��|���w��z����t����y�����?������랕�;�-S��n���ۻ���/������_��l����o�`�������b;{��vKr�Ra�)�$�� �:��oG�!s�( 
23�$�4<��BL���e^B��*@K��d���0xTeY��� �!DL=B�pD�$��
�\�TI	�i@�X!"M�0 0�6P �`��� "
��u���{�c��o������ =�������%O\3�.-���o�-�v=���?�k�����ݽ�����؛���x��������_�}����S^�����{���z������Ǳ�����K���s{�H��5�WXJ� T~�b�#���*M(�Da��C1���3�"a�B� "t����@L���	H�A����� 2����ZQ�A|�N,���d�*��1�(J�mƣ̚� B��0�C4D �|��8��\P��PVr )䘷(M�erJ�)dE�C �7E��F�@�J�[0��$/�A����8�A��w��F:��� #E1��l���a	X2A� ��%&`CE"5���u�E;��r{������b��:{z�����V������[�;���m���G��ѻ��^{�������0���?��~�v�������&�������;e���P4�����w+3_�S������v�˧��%<�ݸ��N��qީ�M��(NaK�|QN��� ��+Q�(l�*V�,Gx�G'�#B N(
OiCQDF0�la h@	��@i-���Ђ.�`q��1UH�`�D�FD- �pJ�LA@��v��DA�e߀Zj������޻��m���_����y[��u;��_��o�j;�橣-�������������~��I���߫$ox��ο�^t��/.�'��x>�]��U��?�������U��m}��y�<5�����o������v?������ӧ�������\�oͧ<��m�O���m�=m����?���o�n����m]����?o}�pK����y�i~�&���ɹ��~��������n/�nw�m��E_Wwן���������Co��ٚa��2�NNt�3��� R��(b��e���U $Ua� !+H��D42�� �@ �`2��&E�@%H�z;� hV��0C�� Ɏa-H7C�@X'��e�(D��� Yf�Ae�����e�������?n�cgn����������=��������������y����w�ގ����|�`����~�?q{����ܾ���]�X����G�~����渿�6]W����w���=�^�{wnb�k���@� d@@ϝ�v;��@(`.2����� :�m�M�I�q;P�FUTA 0���6�b�eH��w�ȂA5 �i@P�Q�h��%�U��UH� ��vyd!D"�CD!D�T  �PDhH�+8 4-�\��I�ÙY��Gp#h�p�l�~�r[L��@-�f�o�HE� &�H�@Í_�< �`�P����Q,`��0��&�6D 
F.0��ҖjFF�0>*��J� 0�N��7÷����I�~ٽ��?I����};����~���z�|�V[�~��������~��_�m������w������t���������v�+:w�޹��o��7����u��?.ӽ_��s�������y+�u�}���jG|�����5���?�]]�0���;~������������]m�k�ؙ��?}w�����U"V'�}OK�N�r�h�w���l�;�����uYN���������+n\{7��������{��:���l�?/��}�?#+�_����ds���g��{��e�������X�Ϻ�s>�~P���}r\�n���wz:�C���%��~����Z������mN���Wf�݀y.mU݆�rkv�o�'`�X��.���k}�������'���o�~���:���{ߣ��Q����{�">3�������Wq��s����������/�����7s����}��i�+'�n��ڛ�����}֮r_&�S��ߥW�hu�<^��[��j������ߴwsX���vZ�/}��J،f>�ﳞ�����oU�����W8���V+���ߗ�uL�����Wǿv��VG���G�i^�_�ۇM3�"zͿ�/[���l���~��Ϯ�[��|���m�Z����o������}|���9_��z�H���e.��{ry�-��_߷�ŷ�]�w��?�3�|=�V������yE��A/��W�^?���f�_�˟�������㢬�������ᮮ�oY��z����+�?�J{�������n�W�_Y{p�W��;Nߕ�Ϙ���_���{�ߟ���}.����]��S���}����5�˹\�}�^�g\�v�=�ۼ����ۋN�!���Kz?�'�~rF�9eY����u����]};���n���y�;�ݻ�oNynjݬz���w��mR<���S;����g�>�י��)�d��7�?ޜ�o��~���]�V�U�"����;?U�݃��=��u�]��۷�_��������o�r�-}[����w���ý���]_.V������[���m~���k3?���
TO��n��M�������JOu.���HQ�ν3>�N߷����|�ܯ�?}�5ۛ�s]�ﲡ=�<��݄�B}T^�����Jw��9<W}}ﯕ������0���N�\���n��2O��w<��&��������z?����ٜ��~߯=�{�;�S��+��Os�����s�e�~�����"c���]����y~:�u�o���n��~?���~��^3on?���g߷[�y����p3��oS����kt�����ߒ��*_�mݻ��3i��l�򓺧N�ap̆,���+��w�n�c�W���v�w����Yn}��ˍ�?�mt!wU[��9�n����Pu�s�����Q�>+x��>�[y?�r����YL�I�3����s�xN����x�����S��������}�m�>�w��J��k�ۋ�ܽo��ŧ�Ķ>����˹��_���E?�kك�.�G�>��'�?޷ﱕ�G�^��{�+���=��i�_uף������y��sM�����������z;����*�c\����o�����ϟ����J����~��ؽ�)۞�_2�5��ݹKퟻw�}k�qO.��{��Z/����3ֶ>����|���k>~�\�컟���?(y������O.�{��A�n�����~�黂��Oo?�R�|��u�q�e����:���{�q/��������Oc|ӻ�v�4�E�v���n����_��i�nh�������;uS;�t����BD���ۛ�����Z�h����w|��F����֝)��{~Ǿ]>����^��T��I�sͽ���ֹz�O�إ�`�ίw}������K_����a��o�k�s�������c�Z�}�n����?���}������n�?�e�O=�����i�������o_�˟��0��@��y��ש��}<j73)���e�~���}�s�;J�_5]��;���׻�����L�_�ޯ���~����l#ܵ��i{��n���!C�{�^ث�ݶ�����u��V𻾘�t�i޿��������zԧ���B�������^~�R�BW2�>�w������x��>��G��O������]ؿ�?];�}�8��������o�ݍ�W��Q*>6a1���~����{�ݽ]ͬ�����߽��Z�?���?�}=�������������|���}V���}��s/o����]_�y��m������s�۟?���r���ϩx|og_������|��n��o]� ���n�یz�������������K��6}��d/�ۯ�w��o�����;ۿ�O~��k�ǿ��Ss�S8���ʫ=�����g�/%���rަ��JJ��}�������rw݇���,k���{��N�y��yJ7���~������Ӝ�m��>=�n�:��4�%^�O��Y����[2���%n�nֿ�=�[��j۲�T�#���+疻fz��z��}�#�?��6w��ow��ne�--�6�q�o���>��~�㷫�~�w�Z���\����?����g(ys�?�e?�2�W���������������n��^�������Ѻ����;�б+����x�uO��r��~�����~�{Y���-K���Fx�������}q_��_e���}�����[�_��˵��o�?�`���{w�d}���k���U:{�o���6��ܻ??�Z��|��z:�/�s<�W�ig��@�s.��� �p�������{�~.��)�y��/�g���?z-��ڼ�I�~?���]�}g~�^ʓ�ӹ���Է�Ac��������M-��}�w��_�m���q������{���-<zm�{p�?���߯�w?_�<o��֖�２�~wo��>�;~��ܫ��mG��s��������������ں�op�x˯�Ƕ�ſ���]�����{O����w�����h��~����J�������VeW}�߶v���}ߞ�o�������l�����]7�����v��{�_o�_����o�s����{����m{���뽲6/>�������Ŷ��{-�{���ý���v�˯w�ۮo~�On�O�s����S�k����9_b�����[�W�.��;G|8lhS�M9�o��v���M�`�3�=��9���_q�����O��������K��٪ny���|�}������3���uy�n[�y!緻�y�����w�����{�����RE���?�o���E���k{�:���_l��?w�W��>_����M����>�J���[�>{��v�{�������׶~?����[z��~]wY�����{�T��3y��z%�i^w���ߎ��q]u��oSq˅���'a}��y߶o�j�����w�j��{Wx������]�v��e��V��C_ث8ZV�ޗe3)������V��F-���������&/�ߧ.��{�)r�?����ej�~���-��Z&��b��z��s�snmw*�ŋ�=f�[�9m��������?*y������eҐ������k�����T/���~�B���������_������73�}ݝK����}���U/.?��?�߻�	_պ����ϕݻ������Ov��ւ��w��W����u#�m�I�]������}�|�~S�O���<D��O��k����|�|�����g��:����������.��ӘG���������m|���������qG��-+��{kܖq�S'��p�UN�'�o�k_	w>�ul#Z���vwמXҏ���g�]�߿`2g��_�,�����w�>~y��MTux�顭��~d����7�~��������ۿ�i��>,����y�=�}�O����}~�}������(��ni�������}��]_�g����[��wS�����7��=Ƿ��k��٨�]��mf�g���'׿���*��������Ȱ���=:n�|���t0��W{���\]��G����־�2��9�3���"|��Z����o�����������}��������|������_�������Wpq���EfS�~c��W�t��S���k�O=��[d�5ߟo�W��_�����s�C�����o^��K��wG�;�N�z���?ڊ�5v�=a�:�+��o=\���S������1;_o!;��rgy��yݬ6�o�,����m�?}o��6�]�eN   �A     ��aL���� �aL��G    X   X��<hK`ӜG     '�K=<+3u��& �     �A     ������G   ޡM����X   ��a8��eKP�G     �e>/����& �     �A     @��M�������M  X��	    ȩyI@����X�G      ���\��D�ɳ, �     �A     ��aL����    ��<� ?�f    ���E�N     ��\����Cc�@� �  �A  ��G��<� ?Xj    ���?x��:P��8      �:A��Wv�v�k1B��( �     �A      �"R������"RP
�G    XC�    @P2L豈LH��G  ;�      ݵ'�K$�\/�k���& �     �A     `��M������G  p��MX�3    H�iLP�G  &3     4��zW���?`N' �     �A     _�E����0S�E �G����     ]�EX   �"M����p�{G      H�?C`KsFap�, �     �A     @�aL����X�G����    ��aL���$����^�    �V�LHơG     ��� @��q��\�<�O� �% �  �A  ��G����n; ��������� �.n������;k0V��N�䎎	z�������� ���� ����� 6������}�p�  ��& @j2z0 �/ @.��V�G��>���$0��A @:���.�k �G�� "% ��� ���1= (0 �G   � SH  `  z      ���覫��&�����       0��b⚟ZJ�         ��:�:i?��!1 0      ������&���    �� 0j�j�j�"8    ����󶼩*��I�   0    �8H�����"  @������k/n      ���즫��&�����       0��b⪟ZK�         �솇�=i/	 0      ������k&���8%��$���XL�    h�?�����f@���G      �w�'�K�U�I�kZV�& �     �A     �!J����(ѢG     �!J`��6�,���f    h�LH��C     <� ��?�<!��?�<!�� �@� �  �A  �ҢG�,��$���X   ��L�L<�&�G  |f    {�r��A:� ��? �  �A  �!�<.�<�ӢG  �-�<XR�    p��9@�@�����4�G      �w�'�K�J�k�j�& �     �A     ��!J������!J0բG    �!J��!JXХ	    ��/CX�F��L      �4�n�e�;F�k�g�, �     �A      ��J���� ��J�֢G    ���JX   �r/=@�2<�9�G      �w�'�Kt��K�kx!�& �     �A     p�!J�����עG  ��!JX    =@x�L /�G����  ��     �w�'�K�>�D�k�ԯ& �     �A     ����8٢G  `�!J�_���@�    ��L`3�G     cj ��G;���~�E�(;ɱ �  �A  �ڢG����X_3    �C(lB�oG      �R�ˌXy��kwYMN' �     �A     ��J����0�J�ۢG    �Jx2��$���df     �`H�'�G     af C&���ܣ��(�?� �  �A  @ݢGx2���?���8�E�����(�G     tsN�����?� �  �A  �ޢG�?��X��	     ;�B�����M�B\�L  ��	     ��2z`K��:E��ѳ, �     �A     ��J����P	�J�ߢG.:
���� ����@��.:�����X ���.:
 ��.>
 �w��}�0 �����p��Π� �������
 ���X  �0 ��@� 	�G��8P �He-( �"t �R  P 1 P`2_0 �@P@@5 T� �Q  �A    ��    � SN  e  ~  j�j�j�8    ��"#�����9	  0    � ������"  ��`���jnin      ����붼&���B�       0�8iΘ��"
  ������8�>m/I�   0      ������k&���    p� 0��j�j�8    ��"#�����9	        � �����!
  ������j�n      X��	    �ٙ;����������G����      �G+�K5�C�k��, �     �A     05K������G    �5K�5K(ژ�$���TȆ    @�.G�M     �ǆ >L1P#���C���� �  �A  (ژ�$���Xq�    ��;�����ԞH  ��    q�  �-(�KA��w�k��o�& �     �A     @t�M�����{�M     |�MPۘ�$����f    �-�L��N����     D�L@���~�A�/�@ �  �A  ���GPۘ�$���X��    ��?�ihKh��G  ��      ݵ'�Kd2{E��& �     �A     �ۡM����0ܡM����  0ԡMX   �� p�G       ݵ��b3�k/�î& �     �A     @ԡM����`ܡM����   ݡM�����ܡM����X   HԬ?ةiKxМG     ��2.�& �     �A     �ӡM�������G    �ܡM����X�3    ��8CЕ)@^�G  &3     ,�VK�2��k�^N' �     �A     PR�E����0��G  `^�EXإ	    ���8�G  ��	     �;I)aK)�xF8>��, �     �A     ��aL�������G    5K�5Kh���$������     ��L�q�G     \W6g��H���% �  �A  ���G����h���$���X�    <?X��ΜG  ��    '�Kwes3�VŮ& �     �A     �ݡM����pݡM����8��G����  `ݡM����PݡM�����Ԙ�=f    /�L09nG     "t8�������`�@ �  �A  ���G�����X ���( 	� �>�����0� ��n>[ �,�>k;����n;k0����~.Q�����X����� � ���;P��    �5 �< P "4�7�s9 ���G� �ޥ�$ 8��� 3@n; $Pb= 1� >Pp�0 \�3�P  ��    � S>  X  x  �@ � �  ����®�����T����x���ܿ�������R<��'��?yC3�L:������ά�%��ҟz�j���'vOf�x��[]����9�s���m��oW'S��+��_�7�6sw�oo��Ri͸�v�vCY�_Z뿧w��Zݗ��~�u����+�~��-oy7�����W}�����}��7��O��w��o���z������~s��zB��Kγ��w��x9.����νQ���?�x��/��o�_�xݯ�������y�~�{�{Z�}���g�ەo��u�����o�}?�;��ǧ���N��isOO����z���h�u�k���k?�rg�{������[����]�?��������O��ξ+��wH����s�����7��􌊪g����~�r����9���������c��ׇ;q��S�;A׶�1k�l�SG�1|��o���{�ǋ����l�SG1�=�]��I�������Z�y��S����{[Ƈ[mq�m%��.�C��������}�wb����U�/��i������_�s���E����5���������~/������-㏯��g^�����ޯ�����lX��ߪ�����~����l��>�������?�W���7������;Ȟ���u��^^#�����=�w+���o��i����lw})��q���1ۧ���V3��{�s��m?m>7:�yݾp1�_)�iQ���{��NQ2� �U�I�?���оY���b/����Qb��o�U��ʧ�~2��~�Z�;t�q���I�.A��������;�ֻ����^j�9<���u٘�ѣ�O�s_�ʃvy�W�����>:����s�M�Z����l]�^X�������Y��i��ڬZ��[����K����������?���M��{�)�����9o�k��)���6�/���S^����Ž�/�;��g������-������ſp����~���<���=���3.�����s��������Զ����������3��Ÿk�?i�~����}��e��|���O��^���G�ͫ���-��@����4ë�C9���ٲ���^��A7��-������.۞�Z�ݿ��ݕ����s���m��_�{7�}y�r�;��_�U��o(�.Z��x
ں�/�~g�0��}#�n���rW������?��=���_�ve���`����z��}��n�:�o�q�=�]���w��r��󽏯�s�7�S�����Cv{G�?kٵ����.e���	q-�鯞Z>��w��w���?||�G�_�=������;��[?��ݑ�o�+�\��+Mm���_��������^��6������5������_{W���>%���g'y�o��_�������k�|�5|ޙmC����_�h?��>I��nE��F��M��þߏV���q��u��~���1��|~�ʿݒ��{>���\f�����z�w��rSI�~7S˽>M'�Kz�Ŀ2y�Ϛ���oV���]���G��hQ����{F9�:����{�޲�W�wپ���z^N͕���њq;�m�������k}F���,j'��_���3���RR���g������?�sﶺ����I�����O�ⰾ���e�ٿ���w��~�����f��_�Cֿ�g�G����︝��=��>-���1h�R�_yԹ�̗��
v��e�]�������ԗ�/Q������\�e�{��_�N����N߾�ݒ���\#�E"w�w��_�#�_����6����#0ۗ��_�5��u�ǿ��m'w~��*����I��o�����Rk��e+�i�u�~�6��9��g��Ī'���o���v�k_���<sWa;�};����y0{�]A��Y�X��>�/�2	����=��G�^�|fe��vu�o�yz��-�������]O����Ey���������mƖj���(��/k��E���]y�����M�k������_�t�����R�����;)���ˬ�~����1��ܯv��%���c�Uצ�V�e���=����>�/�WK��{?e0'�5�o?o*������O'�1�f�{��?�������7��8ʹ�{������W���*��O�_m���_���>�����W��������fk������~�;����__:�n��m=�.�����~Ͽ���j���յ������o>���'��7�����������u�m9z�[�/�]��������l��{�r5�%�����ұ��~_۾���~[��?��KW�q����_�F�V����>�|c�Ǟ����+���<���}����ި�?k�z]������O����z�Q�}��}����w�~}�w��n�Ѹ�Ƿ}���_�.�{�+�Z}�[����>��z��4��}������?�K�{ȼ��������ύ`;��/��V��-�U._��[�V�߱����f�k�yN��#�w����Td��v����s��_��.�)q��Å���T�ٱ?���׿��_w�a���nUo=?���b�m=~M����m׫q����Dj�o����灅��w����^�q=��z���������s�f��������_/������v���G}�O����To���������Y绿�{�k~����]��U�x�����O���������ͯo��n���o?�{}��WQ�=U�a�^�s�C��{�{j�w�s��y�'�j�I�~�M_+�R��U��fbN���W�̿�����9r?���Ox��_<����?WWi�Y"~l:�_�[��P��is�}��o�8��|�Oe�_��{m�9ש/[`-���+o��7�=9W�����ZJ�߷��`?})��/����^E�O0��_N�_�Oc�;�~�w�VA��'�o������vF��q�;A�����9�~���/|j��܋gpg����ǫ�ͱ��.�W�3�|����U����u퇎�v߼�iK�{�����5{�}.Տ�]����������������v����?�����f�xG�����_?���.����_�x�9��g�ҿ�7���ץ����=�s��c����S�7o��r�hM�ܱ��%�u��=G�W�W-�z�c��H/f�%.n����O�έ_�}%#�=�-'�ϖ����������S�V����:8s�����9?��_?���w_�������B��y���{�kw��������k��~��%�����]{�������׻-w��ԑϻ��}����Y��V���:��Of��K_i�����g�������;����v}�>|�/�/�8K�}?��n%����ԏ����z���ǆ����o�U��^�ao۾��
�}I��;��������ZL�����������z��+�;���f>�dKen��O������e�u׹������֏]&)��?������[���֎n�%����n��5�s^~�+Q�<F�&�z�3�Wo��_E}l��qu���3P/���_Z����}���-���!{����_���z`ˏ3�����;��&���[�?����W�Wr��ǡ0�ii�s�����P��W�����n��:m�������f~y���Տ>����Ϗ��v>_߻9���/��ko/��|��֫�E��⟶{��_�o/s_�����n*�h�Iq�{ҹ���-��ߞ�����ٹ�[��ˎ͛�O���������U%�^���z�8{㬶X�]p��k5�ٿa���<C?�F�������N��,��WnӅ���~;������S�ں�_x��oW��8W�͹�O�{uYm�/kڇ�
Տ*�ݍ^5"{���?���ε�߱jL����n���/5[�S6���?��z~����i��6���B'�r�)��5��/ѿۧ�����_�}��o�����_;���r�z�����K{���������]�/��?u������#���y��5����_�O+�S��㯠m��^N�����鯿��M��6�Ս���O]qO���#|���\�m���Ŕ-������_�V�W='w���������m���=��������=ǽ����ߵ�:����_s�����{��;���t�����o��+�?�����������������~������H�?}�w~���ٿu��������W�۫_����w뉗�7��N]�$Hm}����5ڿ+��7��"�����ߏ�?y�����7ɱ�����Ok�rkg�?�+��X/Y�܁�==��c���۳���{�|K����`�j����#������^���|��ʱ�i������1���w��[�����5�3w���Tf[�����6@��t�ܻ��I��������~�υ�0�%Ǐ�sV]�%���vgƹJ�L�%��v����{��5����߼��������e���w�o���]�[�ٕ�F���n�����r:�ͬV�}�_^��2�3��u�/�~�Tp���+���Ϯ�y��v����������On�ߏ�}}����F�k�k��l���y����]���n7~[�|���{��-����޳��8���S��3�����+K��?�����[�6������[�y�՝I����&}��}�Gz��&v]���G�!}�_��u2,a���9���꯻��*l-�����?k�:^f|�m��#��v�)�����O����RzF���W\\�������As����k��)�����̺��o��Lߪz���uO�����
���g��y��{�g�����'��w[��v�ߒ�ֶ�8�g��,�o��៫�=����y����u��?۽���m)iү'���>oe���v�ׯ�?f{��_w�|O|c���Y͗u�%��/�}����[�����������}>�����f���=���׍��l�Y��������M? �+�����s����{?��
[\?�����o�����'��
���>e}�����_>��ߟ�ߺ����"cW_�w�+�gp�ͧ���x��Q����Y�����OlO���w��
MWn>���N�6�qf�(�-x����y��G�'m��>����<���_j��a����_�d���3�{�_�W`��ۓ����������lv�ߴ?K������o�W�g���)��}�ӷ�����+��ߜ�?� g�6�K�����������peUv��ї���Oc�ë����_����ߧ�u���xx��|���r����J�{K�^[X���gy�pG�٣f�U;�v��yj��3[u��ú��{���|�f�^��-����`�ӧmW?n��i��o[���Fvf�=������r���y,vf��� Ϲc��z��G,�㯻+���v�p���M�[|�m����#N'�28�:���b5{�MM������� ���n�&�|�ǯ�6��r4W¿e�6�˥�q�4�<fu��o>����<z�p���]A� �������ؑ4��ʷ�4L�/��O�F{���e�i�j��������Z��w?�|�g��w�}�#�W�U?}���u����[���s���~���^�Ε���_{?[�����0oY�m�}�,���+�z�[�����;�s����x\_��w������j��}�f��kr�����W-k���&�d�����5����toZ�O�|xSrxz?���ں�͸?{bE��<����:�u�u����)p��XU��l�����q,�ww=�d�q:�w�Վ|���Kq����7S�}�OMf�[o~�Q��yy��J�UL�w�_�4���og������ޣ�we�^�?�7��Y_^?m��?~�4븺���M�O��4�v��׺��Yw�����^g���������,����
_�����O�������6ݱK�>g���ђ?�Vv����|���^pK?�o����:�}}{}�}����>�e��Օ�k|����������-�}�k�������/�������ۙ$��U��ޓ��y����Zv�}���6����u}�׽���ۿ���Z�l ����g������?|��}�E⬽Ͷz\f�.��6��s��Λ�r�=�I��v��[N�/W��s�]�>9&�����o�p�W�$�1?���C����?G�U������r�B��/�}�^���%�w^������=1����&�;������������Wk{]忷��/|zM{��;�.����/�������~�������}��kǣ����w���a�ճ|��������u����<V����۷�K������z�ߍ�?�>�����v���~ϷJ�Eo6V��}�O��r_9A��F���ʉ�XrLIJ^<_��=�,Xܩ�W��h}=s���(��q��p���p7�O���v�^���$;!I}ֻ]�^����u����*���ˠ}gu�������󟓞�~���w��Hr�)�`�����q�r��<�2�ן�_�� ��ޟ���'�A���n��]���ʓ�����zm����34�4�e�ߗ��������/z����tטE�?U��f�G���qW;��|��ף?��_����_/���M�[���k����՞�/����������������s/��y�y��O���k�۟K�������ٳ-9��_�ޯ�^V�ٿ�߾��o�n�x������~���s�������\�t�~x�L���x����3��l�����7��]/ϑ��y9�[����v9r������}�U|���=�O�tv2x��vӶ���?_�]ٳp���|G����������~^��?.��߶��������q�H��en����?_���|Qc�{8�~l�V�g��sz뻫x��l����wo���ϧ?~���z}��=��?J˛��|��}���n�^�-���	v���뿞�ϵ�&�����ǹ����tm�_��ÿ�;��8>���3����n�K:��������u7������,�ڷ���?����`�����"�zq-Ҧ�C�;��~M����s����Z���}��O]��t�{���������gO���w�גt��fo��_��^�N��ՔG�����i�^|{�������{�._��߯��;�cp�Nv;y+lߠn�Eu�����Yqm���1{x����J�j������o�D�G����(���}ɫ�{ʸ����?�=מ���ˏ�W���VU���ty�μ���ٱkJ���ޯ��枱^��>�gS��kU}t�Z������:9���߽7��ɿ[���gsw�������v8�Cv�W����:�i!����������Ə�8��Zv�/�^ʠ���?��=o�i�/��/P�e:NR�\���l^u�����F�R��\������%-t��+�����.w��������P�v�4�Cu�лRt�vM�S���|��z���Z�7Um�?��w�7W����.�����>�,1-� �RQ�σ���o���}gf�xv���~��W�N^�ݮj���磫{��Ify�};ߟz��>}ɔ��޽��y�_m��E�;���S|���������������9->�E�yi�?�O�-Y����������[�e����S���vH��b���]���o������wO
��*{OU���;r�S���a���S[�i������x�/���~���"��߷�՗|��ے��w���Zٺ�����\����=X���[���;��7����v��_}�L��5����j�n�u��]i�q�_빷��z߷3��n��M+�O�~?�_����2���~f��#�9�{^֯�[�6K�?�����7{�W�|^q6����KF�_�m��U�,Rze���1��S����������f�lO�X�{*��]@������~�}�/�󚧮����y��^�{]������չ����/������S��[ǜ�g��=�n�������me]Q��������*_�\��M��}���}������^��9����n�������;������v}�Wz{��ģ�p�(�1�X���mK�������'�SV� i��=?����}���;m�ߞ��]ۡ�������r���{�t��_ܬ�����������q_��oM̿o�5�nZ'�O��������?�#�|r�Ǿ���E����q>��h-yM���ˎ�����^��4|�`νq����a?_ӫ�;��~���c��g�?�Z�f�b�R�]�p�������������{R�{����={�����u��k�v�>�t���-S�}�c��=����߯�����/O��1��_��ͣ������o��m���{���~I�~��������>�~���7�����j_�W$�����H�J\P�(�II�b�Te�c�}` h&� @XcF �� ��U,V)�	�$s��E�QDB�S)��H�
X�QK�i�Յ@F$
D�T��o`~������
7R�0�FaP ���Rv�(��V_P�����T����R�RD����@ �0�e�J���G�X����T.CD���y$ ΦQ+ T!�qR�to�	��%&IEZ��0$�M"�єF@d1z���K�M�,@�dk�ϟ-���oq&����wuV�{�md�V�_��������ڗ�l+��u�߶�}|��o}����-��ofE�{��2��]���g�������ݿ����[��������������{R��O����U��[v���l� b-� `R�/4,�d��G�1B2�Q�Ÿы@-� 
�m$Hl�����i�f66@ę�YIl�bRA����P�zA>���2�1��o��%o`W����H	E�?�k��\{���F���]����!}Wkڝ����Yk��������;x�+������u;._�۲�L�iw�Ӻs������;z���u�}O?"��g�����}�?^b����O[��>_>�y����?O�����Ŋ���t��'��2nw��~ۓ��c���������F�����eO{�����w���У����@��+�������?6�����{�������{��?�ͼ���uҿ�{�]�����s����-�V�޼U_���Ai�@b'�D������;�8��H���%�'zn�)� LV�H�d�m�@/@�r�$
"�0��"l)��	zJp� @�(�����!��]��L���$G��?�2�Q��b,�!�S�/��\��[��J�f������Q��<U��z��Fk�U��M������Mx�l���^|w���֡h�շ�!�+�����+;��?��V�����t\?v������e+]��q��ƷW�u�m���^��m���"\��F�j�D��S A���ED�+  �hB�0 ʄ���
O( ��4Jѽ��x�� 䒃7
�e>Á�{U�(<2'� Ŧ�)�29 )Q1/�X,�� ��� P��4 r<��t�	(a0�Sf�J�FQ/���`T��2�4�qiBS[A| f4P��� ����_W�ɪ��r�E'���B	`��2X�%�.� � �>|\��Ac`�h�q5��R�W%���v�En���v��ғ,�%��/tVY>?�Q�m��ڮ��U7ֿd���}����:֟�f�M���0����w���y����~W��7��oO�kK��>�gߖ�������v���n���ݷWo�����g��u���'��Qv  B6�!M@i>�c�ٰ��6�VJHV���K���"u'��	�q2.�+)$�{�@)LA�nWS<D�BAV "�b�	 �D���(I�NҸ0�����$�Q�ph���ߟ�y�G��>���;��9}��Z�ϻj����l����ۜ]�v ��x3~����߫��������37�������o�����߇�'���i����������?������į�LｹS6��[�����߶���}��~��x_��W�������~^�/_x��=�����{����[��7o�.�v�o_�1����{��ϥ��x�^������$�ң�ݾ?vw��}�O������5���J���~�ۣ�*�]$�,b�!B��2 �8�� p$�(��0�@@ �!p�K2��n�f@{%!;�����=QbTn�t�B�V���z 4�)�-&A�� 1����j�	Bbς� a?Ì]d	-!iS�⮿[;n�|������������oݷ���0
+���o�w�˛�z�߫���u������[��������I&g����]����m���忒��k���p�������u=���`�^^z�y���Yd���u� @�"@����R�6��K�$�S�F#A2/5C$cP'(�D	����M�R� Bs �SAN)��|�ש�%�R��!0�(4�XL1,�V2T�FS��a���}�ʜIch{3]���SFB2�v�YR���Pl�JiH.(
���2�C3`�E@d���D'Ȋ�0cD	DI�6 �QH�d.��@Oiaí
�{@&W/�a�D,"( ��U�� ��}�όs��Ί�_g����,���]�=u��Oi��ѵ�Q�Yu>�̷��
��m�{���{��BOڼ�������ި��z�Ȼ;���"N�R+����ÿ�n�7�O��w|��t�M���i�}˓�{��4�� �z�X
R���I�����Y��� �pP� D��ĳ��:�	��u�C'�Ԙ��#T�b2�x�-	��G��R �pCA�B���	1��L����N2!G)��`��Ե�P��ym�^n�����������[�[S^����K����>�3���7�ϟ��z���&��w����A�֛�����~��n�4��3����<�"�u�k��:�|ۗo����o��y��ջ�o�|��OU���?���~v��}��f���}�
fs�~���n�y�w��5Ӑ�si�Cݿ��_�׳�ꣾns˺_W��������o�4��ݭ�ۭ!����ʟ����[S��]��:������ξ�_�:��`~���5�D2T����DD���$ �X� �� ����H0�6 �Cbd`fP$���QڱU,C�.�F P"/�0�k4$=�LR�I9�GD$xp�(��~��� �3���\R�1;�x4hZ����{��9{�?�q	�~���s�R��=��w������/���ߵ�������5}��7�6N��n���K{���C������MsM���3:���/���7m���#o�}���Ż�j���������~��k�0x��Qs�v�.�(�@4|E���I# ' 6 �"%H 0E"�0=�G� 5�y��@�&3��D�[ p"]�`���S
r$R���uB�B�![$C8k@	��څ��� b;R=A���p �e�"9�49�?�
� ��/fD�!�f>�S�Aa��B��n�
6�D �-U�6�$f$�`@e��	@�RF @D����	=	� *dF� p�Re�CS0(fT�B���-Km�}��o�_����]�����n�Z��٢���c�����ܮ�n/梻�|��E�/��[c������Ү���������ӟn���h�����ㅫ�u�������ӏ˾��������8P���O�[?Gnw�UtH�B�02!B8�J�L�P��Y�R	x�|��{��H�/�!�18 �( �`E��X��%)4P	@�c�E'����SJ�A��7(d�� &�@��e��p�Q��� n��_��O
�
ߟ����-�_{t�ɽ������:�_O�w��;����zxo��Wu��}`�8/�&͹����w�[����]��{]q�R�o*����tL��?�����~ʾj�����)���v��V�5��^�R��|c��;����G������e��e�Q��g�/*��~s�j,�ߟ����������GN�F�o=�t�o��?�������_]����i����u������q���{�My���M��?�����Σ�{�u��`7�ribE;$(N(�I
�@o�Bz0ی�vg���^<�J��� _��0��'�-��^,FC�;�Ab&���3V�@b�$�Gd�4��h@R�Cu����P)�hYW�� `7 C�
T�>Fs_visible = true;
					/**
					 * triggered on the document when the contextmenu is shown
					 * @event
					 * @plugin contextmenu
					 * @name context_show.vakata
					 * @param {jQuery} reference the element that was right clicked
					 * @param {jQuery} element the DOM element of the menu itself
					 * @param {Object} position the x & y coordinates of the menu
					 */
					$.vakata.context._trigger("show");
				}
			},
			hide : function () {
				if(vakata_context.is_visible) {
					vakata_context.element.hide().find("ul").hide().end().find(':focus').blur().end().detach();
					vakata_context.is_visible = false;
					/**
					 * triggered on the document when the contextmenu is hidden
					 * @event
					 * @plugin contextmenu
					 * @name context_hide.vakata
					 * @param {jQuery} reference the element that was right clicked
					 * @param {jQuery} element the DOM element of the menu itself
					 * @param {Object} position the x & y coordinates of the menu
					 */
					$.vakata.context._trigger("hide");
				}
			}
		};
		$(function () {
			right_to_left = $(document.body).css("direction") === "rtl";
			var to = false;

			vakata_context.element = $("<ul class='vakata-context'></ul>");
			vakata_context.element
				.on("mouseenter", "li", function (e) {
					e.stopImmediatePropagation();

					if($.contains(this, e.relatedTarget)) {
						// премахнато заради delegate mouseleave по-долу
						// $(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
						return;
					}

					if(to) { clearTimeout(to); }
					vakata_context.element.find(".vakata-context-hover").removeClass("vakata-context-hover").end();

					$(this)
						.siblings().find("ul").hide().end().end()
						.parentsUntil(".vakata-context", "li").addBack().addClass("vakata-context-hover");
					$.vakata.context._show_submenu(this);
				})
				// тестово - дали не натоварва?
				.on("mouseleave", "li", function (e) {
					if($.contains(this, e.relatedTarget)) { return; }
					$(this).find(".vakata-context-hover").addBack().removeClass("vakata-context-hover");
				})
				.on("mouseleave", function (e) {
					$(this).find(".vakata-context-hover").removeClass("vakata-context-hover");
					if($.vakata.context.settings.hide_onmouseleave) {
						to = setTimeout(
							(function (t) {
								return function () { $.vakata.context.hide(); };
							}(this)), $.vakata.context.settings.hide_onmouseleave);
					}
				})
				.on("click", "a", function (e) {
					e.preventDefault();
				//})
				//.on("mouseup", "a", function (e) {
					if(!$(this).blur().parent().hasClass("vakata-context-disabled") && $.vakata.context._execute($(this).attr("rel")) !== false) {
						$.vakata.context.hide();
					}
				})
				.on('keydown', 'a', function (e) {
						var o = null;
						switch(e.which) {
							case 13:
							case 32:
								e.type = "click";
								e.preventDefault();
								$(e.currentTarget).trigger(e);
								break;
							case 37:
								if(vakata_context.is_visible) {
									vakata_context.element.find(".vakata-context-hover").last().closest("li").first().find("ul").hide().find(".vakata-context-hover").removeClass("vakata-context-hover").end().end().children('a').focus();
									e.stopImmediatePropagation();
									e.preventDefault();
								}
								break;
							case 38:
								if(vakata_context.is_visible) {
									o = vakata_context.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").prevAll("li:not(.vakata-context-separator)").first();
									if(!o.length) { o = vakata_context.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").last(); }
									o.addClass("vakata-context-hover").children('a').focus();
									e.stopImmediatePropagation();
									e.preventDefault();
								}
								break;
							case 39:
								if(vakata_context.is_visible) {
									vakata_context.element.find(".vakata-context-hover").last().children("ul").show().children("li:not(.vakata-context-separator)").removeClass("vakata-context-hover").first().addClass("vakata-context-hover").children('a').focus();
									e.stopImmediatePropagation();
									e.preventDefault();
								}
								break;
							case 40:
								if(vakata_context.is_visible) {
									o = vakata_context.element.find("ul:visible").addBack().last().children(".vakata-context-hover").removeClass("vakata-context-hover").nextAll("li:not(.vakata-context-separator)").first();
									if(!o.length) { o = vakata_context.element.find("ul:visible").addBack().last().children("li:not(.vakata-context-separator)").first(); }
									o.addClass("vakata-context-hover").children('a').focus();
									e.stopImmediatePropagation();
									e.preventDefault();
								}
								break;
							case 27:
								$.vakata.context.hide();
								e.preventDefault();
								break;
							default:
								//console.log(e.which);
								break;
						}
					})
				.on('keydown', function (e) {
					e.preventDefault();
					var a = vakata_context.element.find('.vakata-contextmenu-shortcut-' + e.which).parent();
					if(a.parent().not('.vakata-context-disabled')) {
						a.click();
					}
				});

			$(document)
				.on("mousedown.vakata.jstree", function (e) {
					if(vakata_context.is_visible && vakata_context.element[0] !== e.target  && !$.contains(vakata_context.element[0], e.target)) {
						$.vakata.context.hide();
					}
				})
				.on("context_show.vakata.jstree", function (e, data) {
					vakata_context.element.find("li:has(ul)").children("a").addClass("vakata-context-parent");
					if(right_to_left) {
						vakata_context.element.addClass("vakata-context-rtl").css("direction", "rtl");
					}
					// also apply a RTL class?
					vakata_context.element.find("ul").hide().end();
				});
		});
	}($));
	// $.jstree.defaults.plugins.push("contextmenu");


/**
 * ### Drag'n'drop plugin
 *
 * Enables dragging and dropping of nodes in the tree, resulting in a move or copy operations.
 */

	/**
	 * stores all defaults for the drag'n'drop plugin
	 * @name $.jstree.defaults.dnd
	 * @plugin dnd
	 */
	$.jstree.defaults.dnd = {
		/**
		 * a boolean indicating if a copy should be possible while dragging (by pressint the meta key or Ctrl). Defaults to `true`.
		 * @name $.jstree.defaults.dnd.copy
		 * @plugin dnd
		 */
		copy : true,
		/**
		 * a number indicating how long a node should remain hovered while dragging to be opened. Defaults to `500`.
		 * @name $.jstree.defaults.dnd.open_timeout
		 * @plugin dnd
		 */
		open_timeout : 500,
		/**
		 * a function invoked each time a node is about to be dragged, invoked in the tree's scope and receives the nodes about to be dragged as an argument (array) and the event that started the drag - return `false` to prevent dragging
		 * @name $.jstree.defaults.dnd.is_draggable
		 * @plugin dnd
		 */
		is_draggable : true,
		/**
		 * a boolean indicating if checks should constantly be made while the user is dragging the node (as opposed to checking only on drop), default is `true`
		 * @name $.jstree.defaults.dnd.check_while_dragging
		 * @plugin dnd
		 */
		check_while_dragging : true,
		/**
		 * a boolean indicating if nodes from this tree should only be copied with dnd (as opposed to moved), default is `false`
		 * @name $.jstree.defaults.dnd.always_copy
		 * @plugin dnd
		 */
		always_copy : false,
		/**
		 * when dropping a node "inside", this setting indicates the position the node should go to - it can be an integer or a string: "first" (same as 0) or "last", default is `0`
		 * @name $.jstree.defaults.dnd.inside_pos
		 * @plugin dnd
		 */
		inside_pos : 0,
		/**
		 * when starting the drag on a node that is selected this setting controls if all selected nodes are dragged or only the single node, default is `true`, which means all selected nodes are dragged when the drag is started on a selected node
		 * @name $.jstree.defaults.dnd.drag_selection
		 * @plugin dnd
		 */
		drag_selection : true,
		/**
		 * controls whether dnd works on touch devices. If left as boolean true dnd will work the same as in desktop browsers, which in some cases may impair scrolling. If set to boolean false dnd will not work on touch devices. There is a special third option - string "selected" which means only selected nodes can be dragged on touch devices.
		 * @name $.jstree.defaults.dnd.touch
		 * @plugin dnd
		 */
		touch : true,
		/**
		 * controls whether items can be dropped anywhere on the node, not just on the anchor, by default only the node anchor is a valid drop target. Works best with the wholerow plugin. If enabled on mobile depending on the interface it might be hard for the user to cancel the drop, since the whole tree container will be a valid drop target.
		 * @name $.jstree.defaults.dnd.large_drop_target
		 * @plugin dnd
		 */
		large_drop_target : false,
		/**
		 * controls whether a drag can be initiated from any part of the node and not just the text/icon part, works best with the wholerow plugin. Keep in mind it can cause problems with tree scrolling on mobile depending on the interface - in that case set the touch option to "selected".
		 * @name $.jstree.defaults.dnd.large_drag_target
		 * @plugin dnd
		 */
		large_drag_target : false,
		/**
		 * controls whether use HTML5 dnd api instead of classical. That will allow better integration of dnd events with other HTML5 controls.
		 * @reference http://caniuse.com/#feat=dragndrop
		 * @name $.jstree.defaults.dnd.use_html5
		 * @plugin dnd
		 */
		use_html5: false
	};
	var drg, elm;
	// TODO: now check works by checking for each node individually, how about max_children, unique, etc?
	$.jstree.plugins.dnd = function (options, parent) {
		this.init = function (el, options) {
			parent.init.call(this, el, options);
			this.settings.dnd.use_html5 = this.settings.dnd.use_html5 && ('draggable' in document.createElement('span'));
		};
		this.bind = function () {
			parent.bind.call(this);

			this.element
				.on(this.settings.dnd.use_html5 ? 'dragstart.jstree' : 'mousedown.jstree touchstart.jstree', this.settings.dnd.large_drag_target ? '.jstree-node' : '.jstree-anchor', $.proxy(function (e) {
						if(this.settings.dnd.large_drag_target && $(e.target).closest('.jstree-node')[0] !== e.currentTarget) {
							return true;
						}
						if(e.type === "touchstart" && (!this.settings.dnd.touch || (this.settings.dnd.touch === 'selected' && !$(e.currentTarget).closest('.jstree-node').children('.jstree-anchor').hasClass('jstree-clicked')))) {
							return true;
						}
						var obj = this.get_node(e.target),
							mlt = this.is_selected(obj) && this.settings.dnd.drag_selection ? this.get_top_selected().length : 1,
							txt = (mlt > 1 ? mlt + ' ' + this.get_string('nodes') : this.get_text(e.currentTarget));
						if(this.settings.core.force_text) {
							txt = $.vakata.html.escape(txt);
						}
						if(obj && obj.id && obj.id !== $.jstree.root && (e.which === 1 || e.type === "touchstart" || e.type === "dragstart") &&
							(this.settings.dnd.is_draggable === true || ($.isFunction(this.settings.dnd.is_draggable) && this.settings.dnd.is_draggable.call(this, (mlt > 1 ? this.get_top_selected(true) : [obj]), e)))
						) {
							drg = { 'jstree' : true, 'origin' : this, 'obj' : this.get_node(obj,true), 'nodes' : mlt > 1 ? this.get_top_selected() : [obj.id] };
							elm = e.currentTarget;
							if (this.settings.dnd.use_html5) {
								$.vakata.dnd._trigger('start', e, { 'helper': $(), 'element': elm, 'data': drg });
							} else {
								this.element.trigger('mousedown.jstree');
								return $.vakata.dnd.start(e, drg, '<div id="jstree-dnd" class="jstree-' + this.get_theme() + ' jstree-' + this.get_theme() + '-' + this.get_theme_variant() + ' ' + ( this.settings.core.themes.responsive ? ' jstree-dnd-responsive' : '' ) + '"><i class="jstree-icon jstree-er"></i>' + txt + '<ins class="jstree-copy" style="display:none;">+</ins></div>');
							}
						}
					}, this));
			if (this.settings.dnd.use_html5) {
				this.element
					.on('dragover.jstree', function (e) {
							e.preventDefault();
							$.vakata.dnd._trigger('move', e, { 'helper': $(), 'element': elm, 'data': drg });
							return false;
						})
					//.on('dragenter.jstree', this.settings.dnd.large_drop_target ? '.jstree-node' : '.jstree-anchor', $.proxy(function (e) {
					//		e.preventDefault();
					//		$.vakata.dnd._trigger('move', e, { 'helper': $(), 'element': elm, 'data': drg });
					//		return false;
					//	}, this))
					.on('drop.jstree', $.proxy(function (e) {
							e.preventDefault();
							$.vakata.dnd._trigger('stop', e, { 'helper': $(), 'element': elm, 'data': drg });
							return false;
						}, this));
			}
		};
		this.redraw_node = function(obj, deep, callback, force_render) {
			obj = parent.redraw_node.apply(this, arguments);
			if (obj && this.settings.dnd.use_html5) {
				if (this.settings.dnd.large_drag_target) {
					obj.setAttribute('draggable', true);
				} else {
					var i, j, tmp = null;
					for(i = 0, j = obj.childNodes.length; i < j; i++) {
						if(obj.childNodes[i] && obj.childNodes[i].className && obj.childNodes[i].className.indexOf("jstree-anchor") !== -1) {
							tmp = obj.childNodes[i];
							break;
						}
					}
					if(tmp) {
						tmp.setAttribute('draggable', true);
					}
				}
			}
			return obj;
		};
	};

	$(function() {
		// bind only once for all instances
		var lastmv = false,
			laster = false,
			lastev = false,
			opento = false,
			marker = $('<div id="jstree-marker">&#160;</div>').hide(); //.appendTo('body');

		$(document)
			.on('dragover.vakata.jstree', function (e) {
				if (elm) {
					$.vakata.dnd._trigger('move', e, { 'helper': $(), 'element': elm, 'data': drg });
				}
			})
			.on('drop.vakata.jstree', function (e) {
				if (elm) {
					$.vakata.dnd._trigger('stop', e, { 'helper': $(), 'element': elm, 'data': drg });
					elm = null;
					drg = null;
				}
			})
			.on('dnd_start.vakata.jstree', function (e, data) {
				lastmv = false;
				lastev = false;
				if(!data || !data.data || !data.data.jstree) { return; }
				marker.appendTo(document.body); //.show();
			})
			.on('dnd_move.vakata.jstree', function (e, data) {
				var isDifferentNode = data.event.target !== lastev.target;
				if(opento) {
					if (!data.event || data.event.type !== 'dragover' || isDifferentNode) {
						clearTimeout(opento);
					}
				}
				if(!data || !data.data || !data.data.jstree) { return; }

				// if we are hovering the marker image do nothing (can happen on "inside" drags)
				if(data.event.target.id && data.event.target.id === 'jstree-marker') {
					return;
				}
				lastev = data.event;

				var ins = $.jstree.reference(data.event.target),
					ref = false,
					off = false,
					rel = false,
					tmp, l, t, h, p, i, o, ok, t1, t2, op, ps, pr, ip, tm, is_copy, pn;
				// if we are over an instance
				if(ins && ins._data && ins._data.dnd) {
					marker.attr('class', 'jstree-' + ins.get_theme() + ( ins.settings.core.themes.responsive ? ' jstree-dnd-responsive' : '' ));
					is_copy = data.data.origin && (data.data.origin.settings.dnd.always_copy || (data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey)));
					data.helper
						.children().attr('class', 'jstree-' + ins.get_theme() + ' jstree-' + ins.get_theme() + '-' + ins.get_theme_variant() + ' ' + ( ins.settings.core.themes.responsive ? ' jstree-dnd-responsive' : '' ))
						.find('.jstree-copy').first()[ is_copy ? 'show' : 'hide' ]();

					// if are hovering the container itself add a new root node
					//console.log(data.event);
					if( (data.event.target === ins.element[0] || data.event.target === ins.get_container_ul()[0]) && ins.get_container_ul().children().length === 0) {
						ok = true;
						for(t1 = 0, t2 = data.data.nodes.length; t1 < t2; t1++) {
							ok = ok && ins.check( (data.data.origin && (data.data.origin.settings.dnd.always_copy || (data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey)) ) ? "copy_node" : "move_node"), (data.data.origin && data.data.origin !== ins ? data.data.origin.get_node(data.data.nodes[t1]) : data.data.nodes[t1]), $.jstree.root, 'last', { 'dnd' : true, 'ref' : ins.get_node($.jstree.root), 'pos' : 'i', 'origin' : data.data.origin, 'is_multi' : (data.data.origin && data.data.origin !== ins), 'is_foreign' : (!data.data.origin) });
							if(!ok) { break; }
						}
						if(ok) {
							lastmv = { 'ins' : ins, 'par' : $.jstree.root, 'pos' : 'last' };
							marker.hide();
							data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');
							if (data.event.originalEvent && data.event.originalEvent.dataTransfer) {
								data.event.originalEvent.dataTransfer.dropEffect = is_copy ? 'copy' : 'move';
							}
							return;
						}
					}
					else {
						// if we are hovering a tree node
						ref = ins.settings.dnd.large_drop_target ? $(data.event.target).closest('.jstree-node').children('.jstree-anchor') : $(data.event.target).closest('.jstree-anchor');
						if(ref && ref.length && ref.parent().is('.jstree-closed, .jstree-open, .jstree-leaf')) {
							off = ref.offset();
							rel = (data.event.pageY !== undefined ? data.event.pageY : data.event.originalEvent.pageY) - off.top;
							h = ref.outerHeight();
							if(rel < h / 3) {
								o = ['b', 'i', 'a'];
							}
							else if(rel > h - h / 3) {
								o = ['a', 'i', 'b'];
							}
							else {
								o = rel > h / 2 ? ['i', 'a', 'b'] : ['i', 'b', 'a'];
							}
							$.each(o, function (j, v) {
								switch(v) {
									case 'b':
										l = off.left - 6;
										t = off.top;
										p = ins.get_parent(ref);
										i = ref.parent().index();
										break;
									case 'i':
										ip = ins.settings.dnd.inside_pos;
										tm = ins.get_node(ref.parent());
										l = off.left - 2;
										t = off.top + h / 2 + 1;
										p = tm.id;
										i = ip === 'first' ? 0 : (ip === 'last' ? tm.children.length : Math.min(ip, tm.children.length));
										break;
									case 'a':
										l = off.left - 6;
										t = off.top + h;
										p = ins.get_parent(ref);
										i = ref.parent().index() + 1;
										break;
								}
								ok = true;
								for(t1 = 0, t2 = data.data.nodes.length; t1 < t2; t1++) {
									op = data.data.origin && (data.data.origin.settings.dnd.always_copy || (data.data.origin.settings.dnd.copy && (data.event.metaKey || data.event.ctrlKey))) ? "copy_node" : "move_node";
									ps = i;
									if(op === "move_node" && v === 'a' && (data.data.origin && data.data.origin === ins) && p === ins.get_parent(data.data.nodes[t1])) {
										pr = ins.get_node(p);
										if(ps > $.inArray(data.data.nodes[t1], pr.children)) {
											ps -= 1;
										}
									}
									ok = ok && ( (ins && ins.settings && ins.settings.dnd && ins.settings.dnd.check_while_dragging === false) || ins.check(op, (data.data.origin && data.data.origin !== ins ? data.data.origin.get_node(data.data.nodes[t1]) : data.data.nodes[t1]), p, ps, { 'dnd' : true, 'ref' : ins.get_node(ref.parent()), 'pos' : v, 'origin' : data.data.origin, 'is_multi' : (data.data.origin && data.data.origin !== ins), 'is_foreign' : (!data.data.origin) }) );
									if(!ok) {
										if(ins && ins.last_error) { laster = ins.last_error(); }
										break;
									}
								}
								if(v === 'i' && ref.parent().is('.jstree-closed') && ins.settings.dnd.open_timeout) {
									if (!data.event || data.event.type !== 'dragover' || isDifferentNode) {
										if (opento) { clearTimeout(opento); }
										opento = setTimeout((function (x, z) { return function () { x.open_node(z); }; }(ins, ref)), ins.settings.dnd.open_timeout);
									}
								}
								if(ok) {
									pn = ins.get_node(p, true);
									if (!pn.hasClass('.jstree-dnd-parent')) {
										$('.jstree-dnd-parent').removeClass('jstree-dnd-parent');
										pn.addClass('jstree-dnd-parent');
									}
									lastmv = { 'ins' : ins, 'par' : p, 'pos' : v === 'i' && ip === 'last' && i === 0 && !ins.is_loaded(tm) ? 'last' : i };
									marker.css({ 'left' : l + 'px', 'top' : t + 'px' }).show();
									data.helper.find('.jstree-icon').first().removeClass('jstree-er').addClass('jstree-ok');
									if (data.event.originalEvent && data.event.originalEvent.dataTransfer) {
										data.event.ori�x�~�:,o�X���)�/s�g5�h~f]����3w�j�y���o�tNs�?G��N�_U˅��os��%�ǋط#8���qe�7�e�-�פ�wG�ϝ�ƛ|uن���G���������m�/���Cz������g<�������w��ͻ�/��KO���?�����R��y�̸��^��������\��������{���&�QY��&��N���L�'x=����<��o��/�^)��{V�9����<�Z�~oߋ8{nD�y�����������W�>�̿z������)�����������3ݦ�
�=���?7|������tn^�������������뻸�h��y�8����s3���C�Lk�_��������6�]�h�߸������2�ږ�iSw������}�_�YWy�7�H��e����
<��oy�ϯ?�]��_�ޮ�[e�����_�k~:{���wɺ��~�^vZ�3,�?q_}����`����_R���߯?��_c�����ξ2�?��;�?�Ϻ�v���K��׹��m��bj�V�wW�K������~��������ܹz��>_��PZ�;�{�/s���o�O?�������k{����������fw�����s�����=�'_�9B�����{���M�?Ϫ)�ۺL�ҿ�/�e�Sz�w��]�����D�w�a�(���ܝ��.�_�wk�号�}��{���=�	맸��z}{[}���oۿ��R����[{v�Q��_�(S�������O�ҿm��y7�\�+�g��\���o7���b_������6�CO��}�|��4���7]�g�(��W�gv��=U�ڮ�wz�_����GN���wCm|>~��H���Ss�o�Y��:u����W����W��~������?�P����\�ߗ(q��{|������N��x��_Y�:���FE������֫��y���/���]�gޙ���.٭Fe����_��g���V�������|�����	���l���?��9F���ܷ�{��K����t_��<�wg��nf�w�x��p�~�~�r�{��W��w{s��������س��T}:�g�^�/���8lڇUkv�gғ���wi��u�8�w�5��T��x���|�3���6��������(U��G���������׶������4]7��W_�������wK{�/!��������η��6�2n��{���}'��_ֳ��{qhމ��|����?�ޝ�t�������o��;Ӿ��I��S�w�������E~x�S&��wpQw��p���{_r��N/?7}�{A������W���Ǎ����<�o8�Y�[+n�o�����-�bv���gK?Z'�/t�=�������/�o�ʟ��˯���{��.�ޤ�y�����˾����{��ӱ���vF]�u�wn?72}���;�_f����cxП�|	�*����ʑ��{�՞��^�O�M�VZ���}��S��3���yKgn��oM�����=�����t���?Į�춾�]�c�H����ޓ��u��<{�����j������[e���v��C���~�5��%���?��h����?����q�L�����k���������w����G[������ݠ��l<��a���`�]���w�q��s������~*��|��})_��Fx�3���;d^�_�tz[�x�g���������3�����QŴW���kۭ߳������}}�>ݣ�}�˿�2ϖ췏�G�)�強���7�7}%�u]ͷ��������m[�����s��3�y����ק��_��0�w����
ww�cf���o�r���݅�������������|+��G�F^<���w��������/�'=Kx=�t�~M��mK����o��'��m���{�M,ݗ?�{~������7���жOv��V�������ߢ)�������Ѿn�w翵O!�7�e�ߨ�����{JS����S/�O���������Π٧Ͻ��o�����>�ǽ?��=���2�;4�W�w�X���忼{{���y���������{���C����U��*��{I��>!�G��;N3�S*�R�:�Ǐ�{�P�g�j���o[��Aw����'��9� �����~?�M�^������D�OG�"u�U���ѣʾ�-Z�G��r������f�m՞�����=d��9�o|�
u�_�i���E������u�������/����k�k�����(�~�����}����3��:m���[���3N����wi��_sf6{&6���{������ṷ��N��u�_S�����W��׹���ݒ�r���^�o�X�˻
��fo���s3��d��N��Ox�f�g��{����w���3�;����	������ا��?�y�7��������S1������|�ҷ�9֯���~5����Y����x?���������Z�}���k�ͭ�<��4�L˻V�G��W���w����ϵ�~n��`�����p�>�����o����PJ�/�]7M��Ս�\���u?���g�4�|�f��?b����t���f��?��e�O�r4�g�S���;{�s��ݹ7a�~����A�������Z̏����}SS}uv��s��_��3���Y�׺���^Wa����?}��x����O����w��_�Ґ����|��>���ݚ�t��7w�u���dw?=�\ӷuW�~��[��켭����uܾ)�_���.���/��<-�<�.s3�5vw�����a�����f/�T�1��~Σ����ѣ�{����Kb����5#����uc}�{��E��6g��\߁���eߏv8�J�]�����8���W�Fp�H��HͰdɖ7J�7���?���}�
�Ws��?�!=j�j.ݳج�W���?"�?�A�k4��}T���|o����b�7�_c�o�Cc���{j�����擬������{�?�t�qz�7��wx7s�������u����������ئ���e��S�5��;n���,�qw�m�_�u�Wne����{f�����l�͛��S��*����˧����g��5��}�:Ic/s�<�w�so�g�T�]O�`W�׿T�t٬�vb@��´]g��[��_����{�Oʱ3{ϗ����b�;�>���[��3wp:`�/� -���b��i2��yQ]�}!MQWe��&�B���mm��{�=���_��\�*y���VI�����}۰k��J]j-ڊm_�������:џg���gz����z7�Ϭ�����W�o%�:�_�}�)���_����gXo�Gy��|S��7�t���m��u�Em���9|z����sN����c��ݽ�����ջ����[��k�i<�_��o�α�{CW�;߃���������k�N�Y��i�G���~��gz���^�����_+��Yx������NǞ��+�2�7���u��^��������?�3l&v<NWPYO/N�k�3x�i�/��\�/��h? {u�5?5o`�o1|��E����+-o���������MW��^v�}�W?��3���W��c���u�:�-�x�M]��������Ւ�ݿ�~�c�񭽷'�lfn�o��-a����=��i��������v�G^��������_�����=�U���g����;��A?�ͅ+W��o�}����\ֿ����L3����;�+�R[�E�+g�2�}�UO���?����o���� �������e��KI��~��E���Nz���������	�Y�z������%���ߠ���&����3�5}��oi����r��m�۽��T�'�����g^�Χ�{��g�����Z�;����?��ݛ�zp��_�J�fyg~���^O�P����j���K��#�i\�	w��(�݉��������6���_��W}���Q�����J<�أw���Ww���܂��.����*�}y>Mv#��+:��!o����C�=y�O�{�g}q��}����m����[?���՗�o�g=/���{�����h���_��΢~_�?��y���o����^{������;��y��.�/z_w�Q��}��Ïj��ÿ�����o�������u� @ I0�I��DAMAH��v�䀀�3P�Dp�HR���n. !%�((
("@ �@#*��� 0P���"� f����{ 	�� P�R��
�R E(K@� ��:(@y�	� @*�R\��2����5��r��H�G3�U� ���Dq ��	0 Q�0-a a�1�M�àH.�b8�M�BE�_P�F$�))!5(Y)�2��}b�$�@T�D	"�� �� d�I�I�H@ �xQ�:9�C��G�(� �14� l��@ !���BB+�@�jC�#�
��$�TA���	�ڥ�-�'� �40Lq�GCt!
��r����^�H$�(A+��+�C����!��h!��� �R �(�RlPz+H�H �� &B1
DXa+   �� j1�m�Q � �Cx~� PH!�jf{*�$��0 0P}�!� 2W��=H'���� �@G d0�D��`*!4 ʅ-A 3��"����I�v ��RP� d������8`-��U�iHt�Qk�Ԡ[4�PYU(��05��'�4����0% lu̸ �H�2��G�HVhe�����O��S��&	���':��D�@� ,aV,�� P4H̃@ @�_"!f(2�$���D4�()x��s�	8� ��'`�� 0A�%,��� ?���00�@�f#Q��quJ�+ �Ƅ�}��bp��P�qp0 i �2CO��8AP� �@��@�eX��&A ,	� �2��kR<�hY/- �PUn �	�B��X�9�Lt����v@��� Ar p8*LII q�&�xD�X@#�Q{f@�)�R$�i/qK��5�$���n�`,HÕ�!P��dJM	���PX�@#��B��Z���(4a-T@�����+п�O�0E�A(a#Y%�(� �` ����f�I�����`hy8-i�R*�� ��%�]@�%yH�@c1aS��ʓV��CP��_ ���� ��%!r "�p d6QU��0�R5@�ɡ%�� �& =��X P��q:�������,JKB�#�,��O�f DRB��B4 Hp#8��"����~2h���Ԁ��D�2� ╬ht!0U4�  CpA�`��[0�b��D@� 0�P����-MaI���C$@�b4����ǀ0 Dt� <�8G�
�/=�t#F� � p�QJ �!�n2�κJ3�PKPX+�`�{�~'KĈ	M��61 �
�B# g�6 7TMFNa�
 �J�`d	JI�B�$Z�츍�*DX :`	A�� @�4�0`� V"��d<qFh�!2@� 	��̥��0<�	 j��1��@&�	,�DB@�N2�aI �	hV���ę ��E�l)��$ �Ȃ��CrƵHDCV ��1�T��VjNB��' R���@@H�ACk���$��  {��2adXN�]�d@� �i&"% ��2$"�3- 87 ���CLS�A"�A�鐠x� Ѐ#H � �J&���� P$��0 [� *4�gL��`�9�%өbm E��� %�M����1� p �jT؁�TT��I�%E�X�T7� @ "��@?U�Х"�	|	PS�$@#e@8y� �Ș(X`����z ��,0 �L0��0P�̂& Q*X�
�2�0�"�|C !�#�0`x��2�Vh����*��f�@�`�w�h`�BP�hI\GJ�pMz$ d
� z�3AT���Q8 ����q�OA"�B�)
� ^ D!up3CP�v�Eik�CD��V���B��4�h�*a$����V��&,A[!���h1p�� q0� �!�T(�HD`�@3A�XK2 r��
i`@`L�E���'
+�J �v(^`@ ��"!�DJ���� 	G��직� B�% ����P�  JB�  h��
LN�����90Ę#R�`��FL@�)48�"
��g��ev$ #I�Dg;�#� �4A�ր�ـ������4D`,�(�S�xf�@A�@�*fRC4�Y<�	�4�9*�V�`R� B@�P�`W D0B$@EB����d�
H�*� H��8cK���#h0
��pe��@2���@XH�9D�D��W�GK�y�1�r� `�O�dZD6 ��@R����
V��0A@�J��`H `DYkc���*5< 1Q�E�A7��@��5f@�BC@�'�s؂�&B$ ��QCDI !J�r��y�X�L������r0�IW�Bz |XB Ar!\� 
��pa���3��m��$�I"% T\�\v�1D" �X�
5���h	Hh�`UGD��$���� 4EGh�0�����PpFb��ܐ6&�L� �Eo�
�&%��8��0�PC��\BRnD�2�D41\��6D5APW� �h�TDQ �1J@
"Ƥ@% !�|d���Y��	���l�(C�5��	1�Y(��: 2U_ nh��L9��� �����(f9��F��*��Dfd i���� ��J&b�  D��g�$�P�VT!�  A6����R ��,��T7��!P��
 /��"P�d�Ӊ��Pf�� �A�@r �d�+����� A"E=�� �He��1�r�>p�ar!�2�! ����F2��	ؑ/o���
a�	 �f̐��])щn0���i�E �'؁�0a6��ʷ&RS��"pԂ�pѝh$$�( aDu������@�cV��@jR� �,�@(�(��
�
����L0��I�!�DI"@H�,��jZQ�B�eN�"��Q�@��8��PBK� a�ddX-��C	 {sl���G!�/���  K`4��ǡ�����*Hy�����H 0�2�G��C2Ã���� U���M����;�&  ��&0�p�9��� �
H�օ��h�4�P� lM:�R�,$�Ҵ4�(�L�QcC�`zJ�$���W@��C!`bv_;9 Eem1���
3B�ǈo�FL8aHU�^ � DMp�S�!�UAHf,��MlF7�MY�� @��CM0���3��L�	pT�sY� @B�Cp!� �&D$#6  A�4 4��2;t��A$'C)�	�Jd $Hr�C�
� P%�i�۴J�x2�@@`��A&���#D !ԩC�V�(�TB��6������q��#0�@A��C�<�� *�l�I���1��9ᄝ+��`94"zN �u�碫JRݧ�Nɀt�"����D��*-|MDQ�W�.�9@�̲�-"
 1��O�D6&���	h��@~�a  �
0y�H��`]D$K�%�E�p��@���cKFƆ@ 6�(01��X9�h�6��J @ 84�-�ąb d�~ 1x ' �v6��� ���h	��I�%�q܈
��C��  �@��M��z� ��!\`�(�24�B
U4�  q��I��5����D$B\E�����hD��,D P���x6�

F�����p�#�Y��	A�a�5��J�nq�l��a�I"���"���l(x�� ՁZ�N��F(U��@�Ȑ�pa��J�Lԗ����&hA���c�p��H�ޕ�(��L$��0 A�yza�HȠL@P��c2s�V������Fy��s���lQވ��O�������b�iq��vۇ�G�����-����ۻ)���v���}������[dw�*��ű0���g��Kic��G�$��,���6\���}>�K���XW�j���ͮOH�#�@#E�P)�� Db�(�h�T�Oi�%���`F<�E�<� �� M y�If�C�* �L;P�T�ch�< b��  �	C6Q�d4DR �Ax8�Z"b"L�.<˨�a (T�F)��UI��ᙙ��  �Fh$�{�"�h� f���ET�
P��� �1) N� tP�I���1$�C�  ^�8��0ʚ JY��(`	�
 ��A��O}�j:���q;�������R���Jɦ��������#������w�w[��ՐuB���~іs�m��wl�-��N�7�^�U������u��{�t,�!��~�ݎK�W?�~��z�K���;����;I�+/&� �3p0��,B �;:[� Ql��
��@ָ8P����!�bR���S�!�DDS1b@����<E7�(@AL��0;�E�����2l ��.��,J?�*C�}��?��K	�|�+_U6��B�?۲�}�.fKz7���?q���a�j_�f���V?���"�w��4�_������ͭ������\�1��p�f��H�!Z��߾S����������Vo������m/�����ڳ����/n�{����ot�������;�I��~�VT��o-k�nq%��t%���)�ʢ��WR��_��U������d����;�����~���������ޟ�	t�Gv���K�d��oD` B	4��jE� �QAh!h� &ύz8�U5\ �P�N[#D�`����X\*:  @��7*FD!��$�*����  j 1� y��ā�4���a)FB�����Ȩ�� c���o�_�>\�����w=~y�]�~�B]&MR�$��?1�}c~�=?��������}s�C�;G�3��9k���;י�z�|[��6~���G�Q�����޵t_���z��]��f���.⚳-�٘!A,�J $�.D�'i[��,��C> A�g C��
4��"Ji� �$�	(* �S&���(�K�4$<�(�@���P*��(� �B$e @$�-R�@pY0a�&,c0�3E�&0�� F!�!�P-�H�����%� � &�B��b��`x�bda�%��V
��C (J�F@� �2 �e�H�DPb
C!" �a#Md  ��
�	��4ߖ溗�_���~��MnW�VzU���zEG�����~�7��D�w�.��ٳ��o�Yp���:n���7��گ�>���~h[?���~����͎f��d�'�+���H��ex��v���8�Z��r!=邕��P��7)�D	400��!�$��"D�����d 2�� �	ic�@dE
�}��E �4�"�`�B?�f8��Ӱ�d����0w�4A�O@2���; !�c��>/b+yK[�o�L^�Wl�v�;�{����LRy�J3~�ͦ<\�n����K�u]O6)�Y��Q���-�n~������w7a�۹���Pί�q2Gh_���۴>�u�%�3x��۠��j��<��V?�gT��?���u��.����#�6k���B(]ocnO_�_%�6F��'�����.ݷ׷���o_�2�>s��^���c�n]d�%v���J>3�w�q����[��_���2[��皿z�r��g�o����?���73��2���@r S�48	�B�)-���<-`�d@��T  ��@��@'` �@0�� �#�F�D �C��0�*�SB>LW�9I�e����(�2`0X�)��9�/	b � �X��`x���8�-�Q�@�ɕϘ�onqy_����k��Ż��������'ֻ�W���a~E�><��w�������G���Nf����^�zU��B��U��eϰ��޾e^�q&Y?�~�������s�v��pg� ��C�����HQI�! ����@�#-�3 O9,��<E!xf[T,� 8�-
# 2%Q$0�L�نl�	�$�\��$Fu��C"(�P8�#%p�d�" 
����em �������B�I $(�d���*���f�pʑ��IA��� r���!�C-`�Le �Z S�@ED���Hw � ��K�$�!��_��h���%��0���	{��ɝ�)���R�(W�����'C�i��	��:/����9�¾�F5���5�W���h�B����W�����3I�;�{g���ct WD��������|�_�\�12����ƻ�o��[<?7�:��[����Oo��B��D E 	` �b)@KP�ln '�V
�Nn�$@���!g�6���9E� 1 j�A1�d�̔�%"�ɀQ�C�xvA��i���j$Ax�`"G�Ea�Aa-���(�p�� ��4_wɠ5a?�]�%Bo��O���2Y�+3�|����_}V�o&;K.��D�i����Ķ]���'z���g��%�'�� wI��һ��I?{���e��~~�U���%�K��Om�LW-��YQq�ӵ����nml���c}S��O�i�e��*���g��t���܋~�]L�%�~��ړsO}�o]g���n����)���T�2�Z���y�6�����VJ�]�ߟG���V�[��o���U������5��7�����"�@bt�0I !<  J(d,0�&��,������l�bR�+�a&�H�	)�!��ز�%�e��DpP �
�(����nm�ACy Z��A��0�%�B��4�	[ʀ4�� [n}��\J����r�{�l��^���z��-��}�v�^b���^�{@��N��C�����Io�W�]a��W4Svz���,^��}�^�񩟽�uW�̴��ճߟ�}w�G��q��zN��_�s^��5�� �@h&
�$!l�! !���
 &L�x�2`$
�!�`�"�M�2X!� �$@�{��#ހH�B$B���2l���A  
4Є��00�Egd,@3��	��!��c��\��p����h:E��0IA68�#� �^��@iA��K 0`H QD$$@턨��� d�( Q`�H�[� s ,0@��0	�-dd� C]���h �j�fxl FCҀ``&�wk_��<���{ϾOy����ں�u~���_/����em��g]wzQ�|�~п{����� ��˿�Fɒ,�/�����Q�?�_�o��n�RgwnO�w��6ȓ��oM�������F�&r�BP �@�5 @��af�	Z$ a�`� e(�Pa�9*q ���J 	БG �
M��  p ͈� �6 e�z <n��L��C���04x�Z{�W��� ����nV��ٺ�
þ
�coj���r�y���=g|���� �����Me��-֦�3�m�����u���Aj�/�:׏��m�W�w�5�GmG8�����~�6_Ϲ�(���AIc��v�=�ߴ���$~�����7�=��m�K����z�!_�-��{��*����^���\�;�>l��q��=Wl �ݵT���.�|�7N��8�6ܦأ4����o
@���[�#� �w��Uw:r��;�ӧ��p�j�q�)��� �t:�@$HT�&�� � ����F� ��=�d	�Q(p
  ���8�H
^$Y>&��`��9Ā�AN� ��C����`8!Z�0d�"�X"[Rl�x�
 $����Q0( AIC,��+�`@%� E��T�ƨP�a ��E
Rv�
�$r�CX�fG� �%Nx0Gs H� )x��@�+�2��@Z*�� 5�n�-L�Y"B�ΙMl�  �����u&HKn@�M違���6���y���-�Q&^�������eO�W��������?��K�1��~��٭o��|�V�I�����׸��䅗]Y�w{F��'���K_�<�g�nyk��ͽn�ŀ�Z�H6����>��>��\Y���{�~���7��v�ݽ?�͙��?��Ϧ�/����~+g�{��_z�w��Q�9�O��y�{��~��������.����~�|�w����ꦝ{���~��}�������ӿӻ��?�z��\��}����a}�)[".�@<O��I*!-WC�� (!*�T 	�\�(���8L��ڠ�؄*O�@t� �W1L)-k!e�J��B��xS @m�����%i`��J@!@���1$��HZ ?{������~_7�?���w�\�V=��u����[4Ϟ��/���ٻ�xq���\���5��f��w/_߇��������9gs���k�o�_�(���{�����q]���o�q������sݿ��b���yН$ "M�!_�X��� ��Џ� Văx.�D{��4�B0F�a�:h��J���pB2	�23�U�)*| l6��B��:b B �à	�`D-����Gd�c��$0p�@T)����\�T	

p��dh�d�'+PR�|�C�UW��M|���9|�HPV�56$���R<� H�D�
���B��3�$	J4��Ӫ���F�D�������q��	�S ����տ3�뾲o�u�}�m����y���k�|���.��进�����_�K�fN��c��>���ʜ=�Y������b����O�������7?�m?���o�y��-���_���j����N�q=���+�s�|���AC���h��j�����Cs /[JG��j!%��L�%�w��Y�MGB��j�U $��a@�1���SSjɬ��b�"F0�V���� Z�3K�@�!L ���a����$L�"+���{�������z�s���׹����ݣf{������K�~��V�?�}�������>|���z;6~�go�������>����ߒk�Q���?�������5��o��Ν�1>��;���ܦmy�}���o~�]{��_�~�#y?�}�=��V���Qg�}�/����������}�9�_~�}��������4ٿq"*��V_���������oo�t��z��\��m����~Q�>G���?��zݾ���}���;�GM�����֘1��h Fآ�@*�'P�-�4G��pG� ��!
D	���gq�@+��"J��W�E�a%.&p�ᕀvkx�j�	P@	�$c��A�,/ @�l�l�Aa��=���a��$o���~k�����r��������|���Z���_�������'��K������������WY�f����c�~����{���������_���v����sĻ���y��꿶��mq����'������������-:b��$@ BP�,�,L���� (P�h �Nd4R}x|��a*�%h�FJI�R!���T@Z�E����Pd��kX��0 �2O
w7w�Y�@*��(4�H�2��EA0P�	�X"$0�An� �9"E��(a�*���	8E��H�T&�U:,8s ,z4``�P��g��p��x�U-o@	�� #��80%Å8� �@f
����Y",0v2���"�Hs��=�~���}V�[������=����?)�BڻU�M۳����ϼ�-��/}������������}��9�������5�����g�޶{}�������w��=�x��l���x��k�ru����������y0�b!�'7@B��� $A
@G�
X$�'@�� -��BTSE�v��5$�-!![�<P8��#
H)�4b� � �E��XIfu$i@��L�CT��b�}}T�E��*s��53������������e���/���h���~��"�;��]�����w{&g����f�R��l�8�����}��u���Ӿ��g����f]s��Ɨ���W�~���|]�"o�����6���r����ͱ���|o���-]�����|���`�>�}����w�}����˳���k�}�������-��;�_�/��K���\������ǻk{˥���U���߻�}�����c���7ӒO�g����޽���o�q߻��������N#�t@(⪃V�è���5	�&� ��e�x��1��8TJeT�nX	$$$ ����EXH E �5
}-@he0��HB��@���
 T�I8@	YM+�Q�J" j���c��~q,����=�Uu���?&��δ?����������k�������6�_��Qv?�o�-ـ��\�����:��{x���#�eO*_�o�#���o������k��O����{����@w����[J����@$��M��"H�,��d� TG�5�|D���'A�vV_X PP�R@4�Uj�P���3H@T1҅��  �a��H,���)���
��s q��
�� ���! @��;*�G�A�q���&��W����� �4��>V�H�`� �3�4h�Dzb�#b5�YvF$A���o J?sLI����B�d2Rפ<@ ����N�p �1	�+p0HQE��2Dnߛ9�����������/������]���_����k��������z���os{��s���-��o9�B��j��u_��˺+��w��?��мO������?_-�.�S��?��q����>�X��k�������F$!iiP@*��" C �\J9 ���+&F�f5�(5��6���m� %`1�(��YMY��M���  � �4f����(׭ 4�� �A$� A�L�01���G��Gh0��W|�[�m�G~r�Ϭ���Ƶ������8ϯ�:k�wJ�s��}����h�^��ǟO;mg��-������L�{e�^����=:k����q��l����&�?���{?���o߳-�+����uM���ʔ���������7�٬?ϥϯ���h��W��������׺�ͧ����x��_��7v��Ù{s���u{y�����_�|�ב��-6\������+������������n���?����3{�f��̿������w�E�� T#.280�)��� �0D`$f $
���<Za��
�p�dM��p� ����V�@` &�h��p�.h�e��r!*&� ��#MD�E��$�8\DP�p�ʐaE�AF�R���}+����[���{����C��Ek��k/����[�m����d^��ݰ�|]}�r��v�+o��o�m����S���2���TO��߇��.�~>C���>�?�9��-]?��������~@��'�@ Ed
�!d@�Q�0؀�0DElhj��E ��������1�0�w	�^�¥�@�sq�R�D��I�f�~	E�PZZM��B`d! 	�1j	a#�01%%	&��@E��C�@��^X4�A� *#�{v���&���� �
�j�9�0围�@F�����w�
�<
�
33���P�B䨐J�ݒ�@!�",����r,�KH����� 秔���A������5��e��k�[�Kg_�����c��;�x]w����p��{��?�����y|�g�v��޻��fG_uqW���}�����g[�j����>���s�~���{�������i��ݹ�=���r��������]c��7���������s��&�/-o��\��}�E��o[���������~�y�w���uF����ǟ��om>O��Od������{}9���W�_{9�����/����g���9���k����|ޢe�I�����s�׌��K���e��o���6�_�w�o�(�L��<�]h��-�׵�>�{�
S���V_���:؄�m�!Y�۴I[�GVF����6і�|��s�z}m��3�|zcG�Gn�����m�	1q�K�o��E�W��߫�W�{:���)�� �����~�O�Wy2��v����&}�->4��M��l�L���;�����4�v���u��n���>s�w���<��`�is�~�8|�j�N�r���{;�.�}�ש�����/���O�{���?���~���9��������̞v��Y}O�w���~�������7��5����)�E2����9���v�U���=[�w]�o������=�Gsk�����٧ë��l�6mo���?��ǫ�R�ý���,���o�u:�������/��2�;e�gq��#d%�>Z��_+:���V�;�呵�qq��}����m?��aϗ1�m��L�����V��߸;��w����W������=:�ǵ�����_����V�{�>��s����oս{n>#?.�?�_���ޗ��ߴ��o�����h̽����e�ޙ�}����׍{������7>B���n��y�˿/y=���NWM����o?[�tn{	�<{��h��q��{v�}��{=�7�����������}����x��;O�����=���-�_��?�~�������h7�/�o�/����{a�>�/c~k����[���|j�?���?�+��t}��K����7wR��'wﺍ����y�/����S-�s	���_ݒ�x���]s�{��7wz?%�{Y���/�o����G��3��ߑ��V�r,�_ς��>�O����ƞ��{�7�T��ί�m����M����T�����YR� ����3���][�ŝ��~��\'�}w��+O��2҉��������}v����������?���?���߁��o�������{�K����
?���=��{�/>�>��-���9��п�_���=��_�\o���_�}ϫ~=��~�*~�����loY�۹�a����|��/���3��i�[\�Gd»����W��{_���������V��k(�??���~?��o��m��dC��r������ޫ�Y�kw������Z�ޛǑSzq��Wrs�����4�ΟX��'xb�9�x[�����A����2������^y��������6�g����~Wjtc���Y:�}���}�;�t���8��}{���������T�bw��w��ӭ�箤�~{(�?���I�}o��u˲�Fm?⅏��g��z�3����o���+���Z�i�3��]�����R���X����������<��Kg���?���o������cJ7���|;_t���QN^������=έ?��ݫ����}�/�N�_�������KדϷg���3;���7���K�r��wd����s��6X�N����O[Y���]�����1�����u��������}����6�����vl������^���{g�o	�W��������z���������oͺwt���WK��}���������vw�����^~�{ӊ+Ka���=�knz���W^���շ����^�U����q���o����_��w��~���w��7?�͚�[���K�r{���w{(��<���Lv�����"�O,�<���>�ݯޛ���w��}��������zrx�׵��+TvF����W���B�Z�����o���>���s���wIvH}�������������:�[�|��{���[w8���%��Ϩ��.KItuԿ���u�~�w�ܿ}'�Yؿ>����5�g�?p�׭ڠ�'���9�����]��	`��i�����tк�۾����o��������UoU������̍���)����G�_��߻I�&�����}�s�'ݮ��=@�o�~�K.�����͊������|��h�g���{f�r��t������{�� ��׷s��������w��os������������_�����[��=��Y^����x��>���]���[}���������o�� �������<{���_��?wZ~��7lk��l�o���{�w�o�MU�o���]��V�����MM�9�Z���]7�pp���wؾ�[	��WrS+�ww�_�.>�xu����-���������~����s��)_���ߋ�������������홫����=��;�o�۝�k��L/��y�}+ޒ��{��ng��%���o�X�U��o�"kbzu_���j�K��}A|����|�+m����?�^���߶�������c�����w�T���-}s�/�������{��P~n�����6_^����2�XKu�g���W�9�����?��}��u������R})��.k+�$?[��}�o�ߏO�G��e7�+�w�!��b|5o���y�{�����ѝ�_�g�}����\w�m�#�;r��6-=�w���O���y�9n~���qݱ�X���z�C���Ҫ���������7����x��W�W������y}뿍���_��Ѯ�W}�^;#|����?���nyo�?����7_��h���_���{g��;����}�g]o��ܝ�����P���[�����g������0c3;�nO�[�Ӟ��M�۞�z)���_>.��Y��6�λ���g�W�}_��=�1O���>�kߍ�}y+������w�O~~���i�f�O���q��b~�>�a�u?���w���_>�w����󾳍�ݏ8���?�m���[�d����{n�ϩY���a�׻���?�<���Y*?5�����6�<_�+���߭����~h�^;����g:� �>,�KW���.uw��ˇ�F깽�~�=Ĳ0:�?���9�!�Nګ��O�jy��{��o��]�C����s��o��U��o��g�-������n����i�����=~韍?�\߷�������su��'����?�뻻���׿n���w��*m���?'���g7nv�����Ϳ���ܯ��y�~���.������>m��6~{.��~������n��������%���WY�%ɪN���й�Ŵ���Xw�������7�������]����w3w������Y�u_m�<�Ǽ���7���~������ͼ����?�o�#�1�������6L��{N�25W�3S�������ޜ�������t�g��vg�Z}��������ի?[��������s��>r]������w�|6Y�w^�?]��w}R#=3w�?Z͇B��^����o����>��(ol����?W�=U���$���������{�����?�����g�������ڣ'���n�ݽ�'t�����RUū�������_}_
��wn�=n��{��#�׿���������?{�z;?ڍ�=�w���$��>���nxyjqڻ{��}_���F���α�G��_���ln׫�|����i�F_[ŗ��=^����>M[�l���)�l��~���!��3.W��c>�n���ז�On�W7��@�w�}�~?h}�_���G��a�ꇾ([�r�ƿ��X~��k�o���������+���������>��?�t���nM���[����o����&6}�W�~����v�����{���4�����w�����/�>�����m�E���]k���wN?�Ͽ{�/�������}���ҪGW��[�������O>'�X��
������q+�y7��-��1s\��m�ww��?��)��s_����p�����~:+gl���ww�ݫ~������?�W�^u���w��9z����ڸ�R��Ŷ/qI����Ա�}��ym�7�Mɷ���W�C����x����w/�qQo�������ڛ��}��V�W���T�I���#������υ��^E�>�׿�Qs�F�?ӷ�D����s�k���?F^��v.�]�� 1I �����\�EFB!U�XA*@�3�b��,�P����zEi ԁh(@��
��d"D�aG���@�Ă�e<�� @��IH ,�#��B�Tp� ��2�X���  HG!D�AJ�2�������$ H�'`�(JD|�0��dX� T�m�i��r1��H�х�fJ�A��0!�XF,��CBP,B o� ��2�����#ePA�1��K ]6M0�#H ���0B�����څ
 ^Ŋ�K2�k@*��xHJ,�""�5$C!D<4 D"pėR( �š!���Ѱ�����JB�E6h�>7@	���B��5A�`�Q(`/�	I�PQ$��M@�5�FF6&�D0 s9� �B0'Ȯ���"�C��1B:��pv1�Q�8B�����@Q*I ��6p�@��
"��j���4� @#$�J�+#I�p���"¨ �r�p�(!]*(��� b�[	8 �Jd��!)g	�1h#ĵ"1`�DQ��! X
ʥ&4�@"P�%+Ƞj� a�B5�J�p!/C��	K� %�Xw�C�0�`*6+QAb��n8sL�6��0�dh$�b (3վ�-< ��`3�p�xC�D����A���N��h�D��� ��El��@zప|���V&���@Gl	$���r%l��V%����AD  �P.8��!�8R ��b�PpN���(4�R�(����H�I�� �����V#D�R�Q	��, ìͮ- XA���*b(,P��A"2���΀PITA��I" � 2H��
��O�
E H��pB(B<	 �ij�A$-�r�ء\��
�Q�����@�	v@bdC�`lb�P�PE@�R�� 6  .��A��5FD�r�t��F�p �a	� Z���h�	5$���b�I�X��I :r���N�ч� `�@����q	x���0�� [c0��	������&F�	APDqFhA3(E�0	dx��I���`�M3�R81CpC ���v� �AN�F��0� �� #    (=8�D(p�h��x��<� D0A���E���Q� ����rP	Y�4)&�BS �	�2c�0���3@Y�IC�����%A7b~a L�]Z=	���^�d:p!Q	H @+@�
�DJ�H�&�XJ$ELP� l��HHA�r�@X�����h@��qF� &+0����4� �� `�����`(�@�]@\f���V�%�%����T]鸑����\���V8ءf �0H��"�r�s�� w,Q�֕ �@"C&�('thA� ��Fd 0"D=-%�<B � ��KѦ4�D�P0	�4w�	B��Q��Z� p��&
5�0]�-�Ћ��(" � e!�Z�  ���C�:���| �� P ` �A`�8 �����ZD!�D BLl�� �HTI��0��d1̓b`�A�&4�
BЂ������0���A�"9��
�ea���W��K@�"=P w
��@@!�Ar��,<�
p�\�N`E�#�d� ��01�w�s��F�ɡP�� �dDB���$#��"p =h|C @#p0�	�1��q: ,`+8*��Q"L#`hp��G�'@'�'�hI`dĲPEh
*�"DAH�(@S`�]�x�m��C$�Q'�QDt@�3Q*�0� �L�Ja�
h��� E�!�K�"�p|�q�ed�6��Ё�@��8 {" ��E��	P����5X@ ��E̠>��.(d�"
(d��Z%M�$@C��J�­�@1!�	�a�Yt "�(���	w,�$GH�@��

(���,P�L. e��WL�QP L6A/q�J��S��]
�leU!�^�I�� 
�%���TD f����0�2��!@�(�0�j�b� "���`X��� ����!hC���*/	R @�C�)���d� �K���&$ d�XB�a �	��
�"$�
beb$ 
R����NC!󑕠�0�\&2�a�1���")��*I� ���I�2	�+��% 
��a��%"�P��)@�0�	�$�P �����
Ho@@� �Z )YU�LU����b��  �5@0�9 LF�c��@@�@L�� 8�� C4���6;�ȰN�P�!r	��|) �a�)�B�1*�9 Y 8�O�%��@'g�[@
 �� F�<@��� 4��� �hoXF%���N �ظG���bAa�U�Dp���H	h�j�V�p�����
�@2�D�D@�l%I�����-5�@b��f�� "A�	� ���m9�D !��I@ <@O�q3�4@� 	HQ��@ ���@�"D�DR �` H@��@  B��������	�
� ��f	��3ˡ	� �@��A >�%Ѩ��2?� C �x҂9ii�a��wgY���m�F1W`
4"$T.� ���A�l�E /�Q+W0�� ��	IY��u U�[*��=��5<}D�F��@h���0D�� )�C �C8lӿ"m�X����%\P#R�
��5aE��[�fe6vx8`��2�Y���^�8�F�b�,�E� &}    	�P�����-0@�' �`���`[`,	4B`@�� �Q��1�8
Qe� B�>Ch@
�aB�� @���Aa��P 
\&+A f�`)a�B��*�)E�L�l*E��ɬ��@�( ���z�aB��8l0�K0�|M�
�ҋ��Ԅ�R`�!��Z�JX  "�A�
]E�c@:"�'s�� 
C������D)� S�oB�{� G"8న��v�r� F�M�B,0�M�E@CEBB� � �S b,$� �( (4RO�A��H&v�G �A ��D���D B ��@@)x���	�
��� �� H� �$�P�`�P"D  A�"��U �P ���@!� !J�X�@
Nʠ�b����i���t:�]0( *)��� ���h$@QAS �1@EPU
Ԅ0�$��[K�J�	$H�An@p� �-�e X"2!� QP�(@�]�(`%��@A�`��"��@�(	��@"��4��rA# �1��0  ��[�"�ƭ �I0�� �b� N�z�W�����0 �p	�P���C� ���L `Q(DEQS1P��!@�V��^!*�Z��BU����P�R�אO@"HBB�� PI�Ts�� �q� �EO�PP��0Bh.�N �M�%   _4��. �@���0���bP�I�!@a� D���+ 8� jA  ( + �
��Bb)�JHxDeLx0���8F E�j�`P�D &X��"F`1(4� DQj��s�G�#!W�&��/� J9[�*�@|a�!4Oe1  ( ��%+VU N1~����b*{�����	��Ļ��i�Z�pѩ �(�y �0� D��A 0
�z#2�Bc&�#��&E8F� X  ��@
!�Ŋ� 4�3��X0�pI��(�
���Bm0�Uq��BĘ9f��\94a �n�6L �`v�H@*�@�J"�R�' Э�.�Q3�$d$ \� ��0D����J� Yh�F�"H�  A%�A	 
�@PYM�� .�x"P �H�P��
��=���`p-$�@f
s$V *� +@b�`@꙲ a��@�� @#ˁ:�P &��W�8�!�fDu2C�@����C� (��BHT�N�$]Z),���	w E1`� ��	 [Dlt0��,I���dZ�)�B A ��D����5)� L P�
@X�P
 $R���aPUG�hT��P�&P@I��c�w-�&���P  Q"�(� ��^!H"�D�V� �@@[
!	��0WF!-)AP��D�\@�� ��Qm�������D0����� �<@��$ ]R�`��( Q�D�����)Ae	k����d��H�� @`�IP"�Y�   �-"IDOO�( a0�� p��{�!  � �� �+��"6 ��<B��� xhr�c$�(@q���3@ ��� �!��	�. G` 1dB7�����d%h!���Ђ8��>n+Ȋ��@�T���g�P��'�i	`YM�*"�� �	��!H ��C��@��� ��;d���'�UYEt��AF	
_�-#5 ���4 �370D�, � �@�A��8Q"���E�Dp�]� P���ɂ��"��*�BČ4@�v�I�#�`� A�J5	��R�# ��$N D i�EC�5 ��� ` 4 %x�5�$b z	� :��`�9`\@cq���q�B�
0@  ��Q@0q�#�v �
 }�&�`�*`p�d!�W�M$v`�` �&�.x )UG2`� �8ڰ&��@(�b�`Q��FN ���G����BV?�D��#�	1h��%F���%pD� ���pBg� 'CԱ
� � (�B�(�ə�2��1
d @$L��cD �D6�08V�H`����K$!
,�B�Ҁ��� �#WC��.�`�ā �����iH �T���O@�.Rd�t0��d���m�X���� �$y#&a�HP]�D �	��8`�rp��!1$���c�[�  �LB��  A�$�C2�X�8=�Tj!a����"/<����3�0�0 �Iqi ��P����gVȸyI6�`L�	G� ��� F�$ �0�X�02@��%�   A`OD8��:B#HJ(u � j,|�����q� �S (5 Tc@@J�A�	���E�Ă�CbvR�����d8hU�� �@8 0
@ *5,14( ��X�b� ))S� �@ ���&	�0� ��G
"�A�A`C��` �J	 �!
��Pp� xB3���a�)���H���W�D��z"����}Тq�I�1PA�BR"@Pȩv|R`I@� I�K V`A7q;� �I�4VaE��A�M`�6�!h��2�r/b7 �r��  ���&#��A�h�0���aA�S�:F���&� ���� \�QU� D ��@  ���X��n�`
�wA(�~"  �01�=@�@H�$0���@�d��@��'�Fp����H�Ĉ8���J� � �I	<2� 0�� ` *)yJK
hAA��0�e�'�{����PO,�Q#�6J� x �"� &�!R�HW9�����E��M�'P��Q*`z��+0}$�:Crb  v�=I��Z+%B%NA��P�	����"@�� ��@���&�qVAL@�j� DH2�"E��)#�������h�� ��<"{$
5l���� t�@)�*)L���9��Q `�� �A��L�I��X�Ê�8@X\ ���<�� ��dĠ�8B0@8�^F��(@ #PHhbTB"S`4�ĉ�YBT�]p`�ZD�gU0;B�C�Jo�P"�	JP��`�� ���4 �(B@�P%���J -P�Ls@T�L�@b�����T�DD�B���!9 �0 �"�]q�
ȖXтR��Q ,�0N@ � g��1$"R�� #H��bB   �a$!B(� 	 �&	�B��:��d�� �#{"	 
��M�b����%�V �C  ��s�:D��4B ���b�l �9�=����0H(�ʏ
G���%��,f����j0��+т���P�a@(Pi�H
Q����
!@�Q�aQ��0����P�D �A&"��!^� �8�-r�C �(JX�,� �  "�X �� �� 2d���U G� �$���Z��(q�@f"�abR�X A$�@d>V(�"0���P�r`sR	��  D1r���S F/�J@����D 	#"���BB��@	S�0`/�	�����at0<!�`&ZCb,$#!a�� 9�A�
�#a�A�!ؐ	��D���  U�H �  0N��5@�Hth)��*�����8$@	`�%�@h�L $�v�@`@�
�DktmP���2P��Qa�XB%�]1r���&�[MP�PL:0 �e@aB�X��P>��02Y{Y	p�)�vc@�$�D�!B`�B ��DC� )�W�	���@d:"���EN�d�V�D ��eH J`L��bNPb�
Y` %("�)e ��B�X�$94
@9@8�
t)�Qo�lPH�CS(&�`�
PxS4�v@	�H���6�� �'Q%`(Ö�, �����b�lU�	V Lxdb��iH&�<&2���H ��$A2 �B2� ��$ ���=h��I1@x^�8�F�H��QMi�"�JX��"BP
02H(� A���*A���CqCK)G�(��e"��d�O�n��W�� N��q�44��hn� ��`I ,+)р�.C 	\�K	�d���
'�U$@�D�� ���,jR���B� 4�FxA�B@@�����	e� �� � CF �$��d�A@A�<P�V4	 � `�6��,�1B ��C��G@�Pa�!��Z�$  �\Th (-0��P�Ģt�@A�2 E����
��aX�`�4� D����  @
�AAoB�@�8���D��� h ����� I�	�׆T ��� B��XK0�B�RT�(�BH d 5 @qB �D�9�# .�L�  ���
�g] 4��~E/J�:q�!(`:��
�ĪBy��*`D�Vda$�1��'Vx��P	�!�L^0��M�u����� fPAr�k=1(Z�) �Q�(����j	�4I���U ��֐0�>��$q�TO� wDR &� ��8�D h�E�r����N +zRh	��"�	 �T
f�(J���Y�C �@�T�DG4)I$�`f��,(���9R�	03PWҁWAB���P�P���&*F �cE$@�H.dHk�1�h;(B����	�!B�A�-ؠ �b�߱ˎrRARGЌ ��W��R�D  ��YI�����   '�"�@���XG``�S-j��c��7�@ b!�� 3mh��E$� b!�ZP��P@�HP�! %�(�H
���5/gp>����b��1��!�.���DCT@
�"�;�#4[V�c�4b� � ��p��  J��4$ 2;:2tl 6.@ `��ޥ���$ �
E¨@$2(SD �� �-	%D@(�( �80B "��(X �т(@�@GP@� P
 `D%aB!*j 	�6�5 0�%� D( P�  J*=!0�I�D�K ���"QY!� P ��5@�	
��@D�A�I�D����( �"I �n��d� �L`Da b�� �)��8�0��X���DI��H��J����,u�6$J1��7ɉ�3@eI��� 3a�B
A 1&S�@ �Q��J��FS`�  *4k	� l���d��E1DaL�E"i�4� �(�Ă@r"0%�! ŀ�`p �D �4E�B�F�R��  E ��D����B�b #3���Mh���E�A(�� ��@[���bp�b�%`:.�)
�`�GH�tFp�9w襄�0�*E�c�H� �`i�\�
L-!m�2!$�0͆A!H��"g�C!MC@Ee���D�B@��2@B"EF�@E 2�1 ��`��Y8�_�6L(DA�H�-�# T������XC@� �1R K�Q 
���b�H0$ Dd��,�,DJG�4c ad�P7"kl@��3���$�� �,��2d! 0ip���p���(M�c(#@@�A�U@2X0�� 	�@�$�����)x��W��(�  2D.�R2.B0��(1"����	�� �8�$ �$G�pj@0���i �0#�hH(�!��8��@`�X� ��B�0(BT2,� `�	RE� 2�(���P`C��^#��С<�1�.)n X�� �BA�$r��A
��P�  ``r��@���X�  *˔��$  �dH!0!�p*�@���D�+06@S���`����`�R��ɗ-E���&H�Lq�E�bX�!�#@`aP	�B$`Du
Q��`D��0%�c$��(\*��Bm�-� �AE	��VB ��O�4��ڬ�K �@�1 �fp	�3A0����Jfn�h% `�HxFA� @)B�* ф䢊,� "�.@�E �ֳ�@�4�L ��E� �hr�X �� R�S�=0P��!TA=�@�"�	@� �2�D��ig j�J� �Q0lp(�� ".QYM`Ķ�r�`7�T1�EH	��j��% �" ���B�e�BR"8e8��3'�b�k��IM�"S���B�@؁��
�@ ��� Pa�c8AaO��">�Ә��4w.��T"Ņ<`���k�0�Zc�:D�,JO�	�l3˒
pЁ� 	�@](��1R��ݷ��\C�F�	o�$��8Pk(,
�G�!@��" P	ڂ@��
� ��ʣͦ�0��ň""�-"~�D��ˤ΀�  �H �j��R��&��� +!� �B�Y� 0
�P�	�� 8$B< `5 
��� W�N�DE�U
�	 
�5� ��KʚK���@(pB� ��p@�� ����' !@I�,�Y�K@*��A!
%1
��D@SX@Z�1 �
DCP/ S8�8�j ���RB"f�\���EP���@ �H%hpCA â����  Ap @ � ��  @9�dqW0��`dhC����@ G@����"s���(��Eيp�B@d$���
��-���$( >��������� "�,��B I� !P2� D�a �	T�  �P.�N��"[!� �1� YDT�B
�  ����� �������Q)<m GL+)��OW�	Cˀ`�A����h`�� $J�ht�Y+ ����s��@
g�	g��p.VX ��g id�"��' Г�ꅑ  ���"�qE��Ȃ0��F�� � �@fib���a�0�P���4 ��F�Z#��E��P�3�H �� ��L� $���&�
�����@M޹I@"�@���B��� 0$ %(�td�@@���5Cb ��� ��@1��,�� �����@8U"f����@��i ��4�0% �R�#��F�����)x �E"��As 
1*4 �D@��D���C"�H�!	��� ���ŀ"2R�I�"�j�B�8q��!�P	D`�e {�^G5� �4u�@�)փ�  ANA(B`mL��@D��N����B��&�DQ��`0�h �"�����062 I���# �D���,A��D�0%�"��2#�	0@O� ����r��� !`u:ȊaXA��`0B!��bڱ@��>0� ��Q�� 5�  *��Pp�� @P� D���qRA����'8TECBĐčH��NB�$ �+��� �p �P�y  @(;� ��cJ �.L `��Y��$)	 	ĐR D� f�c�G(�H@  J�v�=c�
�`�@>pi��FDbD�a�(�GE�2@Q����MSє��"S �  �� �-�%�Yp< &���$� pH�,A D�pH$p�R�I�H ���A �B�[ �%�7"' �I��U`V� C�@DER�P@P�&Q�( p���� V�<�8@ I�b͉�`	n�A �eFqG��H0�b�$S@
����$�A��_{��  ������-9 �,����@�CH"#`tF"ZX�%(iZ8QE$�	 �4�b �!0e@T@B#�J �1_��� a�ZJ!���$,A��а��4В���.
!�)���JV"" ���B���9ځ���!���"آj��H�(���S�6#�� ��cƢ����N�B�h�QV� �!D�D�����i�	)Hy��Щc�X�d0E0L	L 1*�
��&��.��L�$��a(g�	�G�Ā��` Dt �`)  � DY�A�K$0T aZ"� !^�
U �iP3R��cM0W#��1U�	��P�V $��N�ӠaІȗ��Md����`ѐV� �x8E� ���:	�� P2�) � ��H����d$R�DD�R'ĕBRwR�a�uAFDPFK  SՇ��2� d��H���nN��%�T�BI)��ӡ��7+ ���6bVOU��ⱂ��l2�+ ���RAC'D�r0d 0A��pI��6H*G`� dEl�D	���&0*����� %�� @Fb�� ڄ B�8xN! ,��#D6��K�h �� D��8 �@sP�h�� �Vר @BƠ���0��(�
 p\��H �hЃ�� ��l���)� +XB4 ��l2 ����9�/�E$�DZO�ķ*E�* �&`H�D� P��D$-�ql��I�@��P� Sd$"-�� �R��ӵ��!�/$�6.b8�,�!a��'�U��u�o%J0WQ�� �J�4@	! (-A$VY�:  �`)W�	��5l!E�H�Af��(j���s �0�H�X6(A�`��� ��a�I ʤ>�C(X0%!,�� �d$ @12�@Ļ �A1�	
$�&Q��D�Rp�Q%@� ��	��C���80 ���b#��P�7� 7��^�B i�� ��A
�A
]`��%�����hh��Y�@@c���0 �X�2a%D6� F�)���0s�A��U��DD�" ���>1 T,�@!*��9&���
.�
P,BF&Pt'��Pq*�?���18��'" Pd	%�x� U����$�D�U7R�E8 4  � ��!���t� �B��7�.+À����@��T ).	�&U(T�� �%�*���DA|@�ҵA�&H����!�9(1��� : &��f��*�
P+_#X���F��P����#`@��(��0*0�-J����Xx
��9P8�,		@�(� .�
D!A@
�H���0%�D*���8
U@�"���@ @!7(  e�QoH!H� �#�f�PV`@L�I 8��������D�"&��Ì��IAj��) @����Ȁ"� !�$�h�Se� �x�2H� ���@ ��D�+F���Rc�Q *`�8��  �bC`���� �t���P�B�����*� ����̈$\�� � Q�m����/g(��J�I U9�4#�A ��� PD"��0h L�Ơ��2aP"y&B�IL�PE��P��a�a!�� �� BiH}A���� RD <
D��S"��`��P�l�+S$=BE�����$�|D�9� ���A���$���D"f@SV�UE` �X��D�9�M$6��F��
�� ��,

��A�X���*1pB�p A�"�0� P�,�0Z:� A�8 0b:��	���2$I�� ���B4
�r�$@����p��B���d%2t@�%���N+D D�@*�$ \:���� ������3�#� �p��a S��� FR�s��` �R�0�L	��&�	T��nA��K.��� D���3L  @�s� ,	��	�SpX�_��BNe
P��J����)����P��KL"Ma��%\+N�p�bH8�Ʉc��h�������"��|�G� 
 ��  ��*d�!�*�P� x�@�DJ�t���'��!��b��-f2�=�� �(@�d&��x�`H�W��	m"��Y��zEaf������	���t�@-(��D-��@�D��$ �^% �
P��D�!���a<��� �n)" �PI5 k#a-PT\����C�A\P!��T� �8t8S��(aC��Y� 3N��
0��p��"�@� pº�U1C3��@�~���dB!%���@�*p�@ ��
[D�� H�A
C $����ဋ,$��	E��(@��  �2�bGe� ��0J�!y J Z��$"����BA� �q	��h@�2�@���9���!�*� ����,BA�N(�� �AP
 ��5W�@6�(Pd��� � 	P�� >���$�a�&�A�d��A��0Fq��L�0 �		AxCuqd	
?, !����(%CP�a=��2� ��N �"� �!����P�%j� �1���d:P7�0 `�(0 �)�H��V�4�@�Ԑxh�0�@	р$�P	� � !_=Q��D�+d	�"� �Є�� Q� ��D �r��0��p�	�.���& j����D��͈��
�m` � h9�Lj�@���5 ]�� 	b<�I� qP�D\����� B �
N��тhB��I{!�C���]F�"8��B����Y!<¦���R)"�>�
(4P����	��0�D� �:FKIa��EDH�9!baBJOD
I �6D3�̂ /I @��>���-�@�2@Xac�5�0�<��(W@:JA�P#�b" D�2T�@ґV��]�R����CB@�B��H�)@H�X&�0�`�����T1�-l) j����0BhL\XCSd �.�!�G�XǢ	��2� ���p��� �$^� �B(�U@�KHd�l��&�M�@D �H  !h�h 0HB�*�!YdJ`9��&P���B< S� (�U��������x�%0pp�0�C"x�1`D�4P�l�d��  �@���E��, m $`�!��� �,c��0����w��g�i�M�����( � �5�0! F��4L5S(��@L� !��J� d��ł]@*  ����@$)6�HF�� 8�8B$ H��b�I*��<� ܂ : ��� 䢆n�
�v �J@Ѐ&pR 0D��P+1$�k�[����>T�>2�N�c��BUb.�B,Vr�������h4�wK�a6e(F"� P����hA��A	)�bc 92)pV�p��&�8����� P9��E6
NAh2��Y4��@A�s����&B�[�]!�A�*&E���.r�!A`���NzH�D.U�F���q FZ l��Ti@I%�$�(�0%�0�SP��
 @&�B )"����j"�A��2A�!ą�AD؀$	4� �+(J hV���������Ia(X�C�d@0H,����B��������1Y :ð�mLb �! �a��0T�2D%9B�I�  $�%*#�IAd���$�+ � �H��*^E$�^��Ÿ�!�!��D����""��  h�AG*@�� ����"T"&A1r�]�CE�@ S�Q(D0(D!@H =�1%���C�d�B�G}
DAh�R@� �� �$ � AyU�R��ap�h+��L�6i����E
t�N"$Ò�v�E+-9!0!�oa� J0�!P�c�P1AB�P��XP @J�4@9 ƢԁBA�p�"( �ᚂ(� (a�0��.����4�  FpÍ �%J�DI#�4���@ M�D]�D*@�@�a�ָ��D@Dp � ,�0 $,�ʡ(� BC�PI�$�D6��BXl�rҠ�J� �t1D� �y&H0��0�H@�4� e	ZR � �T%�C)j���@"�jD�NBR8�B�~70a,T8�r�8t�9��g0:�6���UN)x�p< �c� �QERBc�8�
�ILS�{����
@$� ��� �� @�ne��P@b�@(�����@�0 d) �Ũ�	"� L΀F���"�����.f" �#�p�q�EP,�y�H�@�D~ 6qjHU��d� %�`C[w�SԠ$�P�G@qh�P�	/:�P �� �(���K����IH(iJ�gD�R2��w����� <��C�� �& ,�1�'��N�L< 4�� ��@İ�ZP �yb&Fex(v�u������K�b�� D耤
%@�Adb ���� PDA�$(4��AC5���U�@D��`
 PDH��mL�G-,B,A��D�
ML��II��CS��#� (8$X.�  �
��-P���"@�P8A@�"H20� � 5R:�|!�d$D�� ���� ��{I�Z �� R���-J�@G@&�� Gq�"5�V$H��$̠6�D0�R0
h���8�*D��r p�0&h�e
�2PC� "� EI�L�������#�D7]� Ȝ"4� 0fD0!@����w�MU�p@"� ��� �M0Bd��  Tθ=� �"�؜MPR��iT'H2��J���� �L�NQ�F�"��ˆ����p|@tZ�"m�Y@!)�� ��> B8�TV� 8�kPV�(� +2VP�$��a"T$%���I�C�(A^N��R� h
p$3@���"�0�M�Q{��
�$��r�P�A�A)���FC� ����4� #,�*�%`
�@( ��Q��J,�
��" 元����Wv��������Q�c���-�������k�M�ݾ�ǥ��|���6���^���D������������������^��W��oi�o���������KO�������{�����W'��CV�ݣ�{��{j��g�w���?����}�M�~�_�W���o��5������~O��8��4��<��������g_�Ê��/���{���������M���cd��_���;�ݯ-�5����������s'{�Oޯ��7��70������n��k��^�_�.�;�^c�������e��j��z/�+F���uͶ�i��	���Ž;j�x�~i�=T���Ǐ>?!���y?�[���n����s����|u�����r����gGA��f�T֗��%ܖ�N��=7���.o����_�?��5�{�6����>�o3���z֜��^����/=�����2�L�;������~�y��:���]���}�k�=]Uof�g�}�����47[����"-�[߹��]ݿ_W�_R���
��.�W�͐�|�?�kH���n��<��T�o�8�O�}N�l�R�ԗm���l��t��2m����։j���]S���e�q���ŏ��OG�%f5��M��}���g��އ����mLfe���U�W_��'���x��ÿ�3mbW����/���>��G�R�_.�׾ޫO��?�V~�#���wt�ڢ�������x]������b����[����u��j���.��]T~]�x��������瞥b�斷��g���}����z�߿�����{o3���n���y��ڶL��*u��}����{�������{���}��?��=u�IEս��[�9�׷���+U[�߫������_����;wܩ �����[��{���'&��W�(I�f��_o��&�9�����?�����P}3���{��:��!����ggI�ߌ��{��T��+8Y��Χ�}k��z���]�N�{�0��`��4�q�֯�*X[�6�՝W7~�E�f�����他l{�?U�V�9��ه9W��ѷ>6��=��~��="�{�����߽�o������8�xwo������⿾��N������.7�}Z��{��{c�k}��	���?ݳ��\�)����j�~�z��䖉��ޣ��J�~~u|k����ݳ�w�W��g�ĵ�˭G�C�?�w����}�}���w���6�r���4���5�}:ي0��?3Ow.��/U����ݷޛ�[���q}j^�}����w����u��3�������������-�w�,��ޏ�z^��[�5���{?��1�\�s��O�R]�>4�|{�1?/{��_o��tϻZ�Q�o/Qkf`�r����5��*>оa�X�d��:�����k�;��Q�VWq��}���?���ޖ�/���O��ֳ��C�����}_\����
j�O�!��~�?�q���jg�����^���ӗ7_��������s�|{�սk�n��[�>s���o�y�r���{��_@�.o~�~5�|q�l��'��k�9﮶��;�o��T+m'r?�{t����^m���:��c^�_�+�k=��o���vi�y۪[ܦ���S��k�w�_9hgu�ӯ�|nr��lt������_׷�Ե�w[{&��V��o����C}gJ��8�]��V�7�<�b���*������j�9��]��|�/��R�>��[>y���|���{�����k����:���o�z����������޿~�o��r���3��翮�������%���|�����L�X�km��O�\Fח;���uS
��WN�UG��?�����/�y������e�-=�5�v����r�����".=O~�������L�z�_Է��mYg���p��W�������;E����W����^�������u���m�^X���wO�?
�>��U��W���o��vƂ�ܺ_慑N����+s��t�̞�]���6�s�y�0��yͪz��2�W�g�[o����^v|�����o��~O�����j���M��{3������]���=q}y/%�]��G�����o州�<��ݽ�羷�����������+|׫���8�����~����_|�S������*���jϥ����Ue�ͮ�|s�����q	�f��� q4���Z��3������s�eS���O�����9�Oo{��?�}����"�[o�Y�������NW�^b<�������]��m��Zi�۴�°/[w������s��B�����������L�#��?��W�/EI��,��;�����OӮ�y�?ۇ��O�ؽ����r�}�v�0����o�&Y|�wG�G��y���ݿ�������1)?e���2���K��oo���{s��r������?f��������6��s�ߟ�޶��-�/���Ϸ��]�_����5�Ο����n���n}u����?}�oM��ϸ��ӷ�?��T�Ⱥ���w�}ӻ���p�]�O�Z��kk��������XΗ�S�w��g��s���)t�Ȝ-l�����y��{�K������������;�9�a�x�݉��:���SS;&���_�Q���;IB)K���q�.������3�oZ�_���All�6�'e9��%.����#�F~���Mk��������3�s�����+��_����ד�����߸vw����2{{9��Og����+�>n�����^���?�������K�|淗ww��w�������������l�{�]����o�_�{uKma��w[�g����t���������������l����n��{|���������m{���V����W�����?�������������`�s��e����7^r��;��*�i�ܿo����{�{;?�,������4`��3����.Z�3�;86?�=������:�'�h���w�|ۻ>��"������ߍ�Q��O�v��������˔3�y�q5��ҍ*J�'�9�#}��٭x3�?�u���O¯��ſ�3����?��q�����^�����<3ěZ<���^�m����I���e�﹩.���V�wz�ݩ���������~?��g}�o����}Tv���n�m�Sd����ϻ�����|�,�v�a9��t��G��Z��������������~���wQ��T��Bs|��1׶E�~�ߋ��s��o�3��S�Z���k-���!v5���v���4hG��o����n҇w�������б�����a�Zgܫ�m��7������]9L��-��K�7�<M��z�o�_��۝���W�����xn����V���'���K�O�Wo3M�{�����r�˾}?������_��O�����M�Kr�:�����x���ƻ���k��ڃ^ooϡ����-���cc����u�����=�����}��wk�A��?ӻ���7{��&��s�{-#�>��ޭߌ��ϠK�{+�q��������[���e_���G���Ω֯�{�v�m��E��������{����a����G�+z�|O��n����o�8�J������x��Z{~�_��q���;k���V{�4�VW������{r~xu�K�����d������\�g���;������-�������j��g_~�����|_(/�k�e�_7���9���K｝s������w�����K�׏��z�&� ��~������6����:���u�2��������������߫���$f�]����������߱�W5k�֚��w~���[������^�~��T�rv�ݽ�m�q�:���r�$����v���|��w7G�zQ�=﷠�K������.�`������W�����^}��������꿴O��������x�_7EW+Q�zw6�r�������C�3�����n��*;���W5Ͼ��t�d�"��vp��������榟~����cY�Ye��ȫ��O�v-�������d�����g�.�����|�΄�9����}��Vs�k���������}^ݾ��(ʀ�F����h$��� ��)�KI0H i�A�8� $Tt	`R``� @�@{L�� N (����H7�  ���!8 "d D)�I
�[�1 ���(�P�&L.`&Н���E� ���oG)I8�}%��y��Z��3?�9�?�:��v~����e�^��cn�g����6d\����y��/m߫�'�k�su�%�wws�����m���yK��������߯�c�}m�������[�����϶�w���cٹ�?q���݅�ޟ]=���z���:��������$Q�̍��~���=��9�J)~�����?��_s�Z�=��� ?���ݞ�����~��o�s=�-ˮ���l��{>�a��ռ�ӛ�w��m�?xR��ѻ3݄@�  ��2၀�� -�C��>� %���_�D���D4D!�*V,BhB A� d)bF$�tK
 4@��� bh�%��$�@	(&D� C-ȑAJ�@	1d�$S���� �e�£�Ej���g�c���{������m�c.���D��L잢����7��|���W��n{�{s����v+Ƶk���n���+����u>�6jԿ�������wO?�r����v/�?�����:�^�m��T6n�����mS�HL5������ 	 r�%�@�al�daB�B �IZ��� ṭR>E��Pd_ c"0rS	
 x;�iG@9 ����� �@0���Eh�.F4  @ @�V.@�c@��	��B���h� de`�ҁ@���	M`�3(' ��	!� r� (E�cT<��B��`�pA
:Q�B#�B�
+Hp��`!�);A\�>�p0 �"� �E!��HS PF� 2p�ؘ�;%@�D� ���w��)Ɏ��m1�֟��@'��{[�i����M�)�B�(�W��6�6v�{M-����mD���U�F��I}l8|�[ۤ������{E��|���g�-	���ɷm����vjӇ�����;�Vt���"��_��$%)*&K����V��3�ù�),�)܀�� fF80$ I
<�0P
3< "�EB
�x� �0 �r�D�0�@N�4�Ĕ$L����l.��	D#O��$b� ��f�@��+1i�|����>:w?t�����<���3��l��;j���]����P�jN�U������L�S�_�):2�Q�� �������\�m�/;���\�d�ף�>��5?σ����*�����<���_���k���?�����~wG�D�ר[����p�?�����1���a�ݬ�������n����$s�c���a�Ő���z�?�,�혇Ͼ�7�mv�ߍǢ��w�������<E��o�y�$Yη���[��:q=7�{��V�#��l0��J%V��`�Xa0�R A	x�
���(,��
 ��/����
H	` �lZ�1p8df2v ɀ0����4 �凐
�,��pP�S$��1��I�l�L(��B�%�3@�h�g���z	�fM�Sk8[�E�������$/s�y΍��s�[�=�k��V�:y��۲���m�_����ؕ����7:�ݵ�z��u�ҟ��ε湭mG�:����n��q����ѡ��k��s��W���� E5@R��� �x)$�(3��� �LB�� ��!���'���f��/�E��	 �T��$�X�l��@FC�B!��YD$ ��, E�!\�@("�@ ���M�A"%g�b@
��"��@��LM$,Њ�D	J!� CP A	X䢙� ��U4�h�2@t�D�EPq�ySD
�ف6/"$@���X(p>��e�b�!���H���&<�l���%�$��А���( �(��?V���Z5�_��r}����ouy��w}�?�*ڝ����Ϫ�淿;ˆ{�ڰ5[��ޣ�!�v\���4~���1�+I}�'��x-�'}�����λ�ywZ8�N�O���7���
��k�F�� �H � 	�фH@: ����) Md����4�`�>�ȂL�He��� PZ#@�"�#���*�S$-��P��X�XȌ~@E!� !�8�  ��N|���0�A�`���϶��U�բ��
_6#��w��̬7O���g}M;,~����o�k�7G��>~ſ=�7�|�'��v5���B�۽����p�/����ϒ�������������S���-�Ucs՛kD���nvo��sl��r�o�J��|E����\@v�]���/7V������}��Z-/��|	g�ȟ���>���o_tH��n���nϹ�v��z��#�}�e�v�~��/�x�y�>�^�c��߳������7c����r��}�6�B�(j��E1y�D	�J֘��A�P��e�[@�̊�0@P� �������`0�! ��΀@�Yd�@�&%�d	@28L(@ �F@ ��DVx �
(@�R�cb�6��4S���z�ɿ���"�y��ٻ���4ٰҟ�_���O�H�f�WH{�����y��s��=퇶53�������Y�����wi���/�Bpu��o���ͼ�c_�Z��]����_>�_���uv�Zo~QI@B�PAA�LK 1X�!R'.�$-CA D<23E2%����9	�c�B��
	� 8 ��E/PT��Bf�L @�RAHO�Z� ��J$1$��&I�@ �	��B`
T�!�(�A�''J1+� ZB4@�=��bL��d$j�"2� F	���� 1�ŋ�CH <��A�BL I8�(�GF�(p�d (A�aD !��<� �)dDD(D�KH�d{�W�����\����/Xs.����`���k�vV�m���[�|�}����e�_���B�~/�����凩G���������>����M��������~y�����!���h�����}����l� �!(��62@<Ȑ.����4B�����b��T	�D��D�F
�2� ���P0AQ8Rvc�HAd�M�D� ��qG8 FFr"2Ա �)�Hp\T�fR�"Y�(��)m�П����׽۝��?��j���/��w����K?�&|���zVսn�����t������}��{[m~�����������.�'��so瞝�
�~G���	�|yaL�������\c����W7�N���v�Zy�=�[��tL�8�=Fu��ѵ�3]�}��u�_�/̚�	���Ga�t
��`���m�Ur�w������_i���~�~�zz��~�ʜY�?\�}�V���f>��sv�}����F�Ͽ�"rD`� ��
f4@)�h��y 0���8�F��B��(�lF�@p?^
�J��2p�@�-��'M�a@�r�Ȑ)�%��` �P�5� G�V!��("�%
8�G�~jg�����gc���3�����J��H��=֭k����3�:^�|e�z������_R}����,F���ܥW�}���f�y��)���Go����)��������
�TM��V]�ÿÛ���EV�������KO��H��D@ D� �_B$� �Hp�01�!@�Cc(2/�e	c@.�(O� ����`�E�N��� Q�	 m)Fw`�B) 5�HQ"�p�P��"6I�@*0f�%� 8�>VP @ �8�aO@�4	B!Jg	!=�� BEz��{ZA��1� `�	(�L4�a�)(d�<Z��J4�$�B��(�&d �X�Jx��
Hx����0,Cup��R�А���(@��BAV�$���~�7��u������\���Y���>��ג��m��#{�ݯ��>���u��|6��+߶�V���v�VS�sg�w��y�����>��w��i;�?������o�U�ݽ��|Gϳ�_f�O绽�哦��>�~    ������u
�V~6k�w�	��q9������w|�<����=>@<��\�V���O��3=ގ�o�#Ο��mwo�=^W��ίs&��^��_�_�����q�%��O�6%r�������-���5g�?\��@�P�#0�
�0Ă�Z�DR-a9C �0
1���!����� &��x &�H!�3�d��dk�A k!L���$ �1J��(2$� ����@ YP��
�	BHA�b20�CP*4�ʄ��#PK�C�����`R6Z4�	@��Q�`"B+Y:H%`�|�C�*�Q�(q&���B f(�2�
TE�!���ȑ��������p�b�}�
֠ hT�M����>�� ��7��������_�i�ų�����e�6������D��j4}mW��=˿έ����s7�Su��o{7�e����E�x^���zW�bh7��3|wY�����{[i�f�p/�]5ԏ�i����� 
�TR(4 Afd��r�#�:,BD�	���$ZAF* ��
Tt$ ��^��$�	��B�@� 3�,V��&�� ����"�	 8d@	�gD � v�	� �]�uM�[�:e�[Y�{���y�w��������-��ڢ����l�ۿ���G����WK�~�Iվ�/>��{���]��0��ֹ�][��o�����������T��u/�������e�l-�?ǻvs���>+�\g+�|�
cc4?�r�n�O��G>Ӿ�~�,�>���������E��_��O����R���_����(ۉ|���__/�?����ަ���~���V�����){����nW���Џ�Ϗ���|*�6 ��O�
 43�^	
%@5 ���$0p� �6�JH��؉(��D	( 'D�#�L��!� �C��`
P���҈��p�YY\�  ��ȁ8 ��D4N �3Ԍ��, ��$�LP������|۟��=m:�~�x������/��t,gz�2'x!�������>v���h~2a�����֏G^d��k���|��V&��_x	d[_��/�o�n�<����>}����'L�-������&Ooot-P�?-Ċy8MDCwES T��X DL�9��@mB�N�xs	�x5"R��-QIj����h	`P�� g@�@�"�P 屡 �@`�� ���80�  �d����g�&�B��@ 9
  H(	�#A(Y*Fz+4*F1`)%�L�>����ʈ��� `J��Q�M�q� "�Ɂ^ #�塅�@"�@BI���CJ�  >И�29��F�2`A%"�bN� `�r����5?�}x���������?����>WZχ￧�*�6c[޷����wW�[���r����_����������*���?�׷��:�v<��V���?������r?�旾�c��.�u�"��w7�<�~�{Km����@v`x��HPnH@ 0AN� `���sB ˢ	�`X�$��tB�\  0D)���`+  �X��#�IZ�`�F%�H���H��R�" P�@@P #D�D�\�`t ����͋GA���f:�-B��w�ݛ�����6/��g����N�嚻���G:y�������h����N�o3w���~D�ͭ�N��?s�=��oW�t���g��������_�W#ؖ>2��Ȥ^���`G�u����~?�wR��V�ᚳ�y�{}�{Z6��A�v��x��q�g�?� ��,K�i���.S7��_����/��띰^_���2�P�-�������� ����}8�磫sO�w��ϐ����W}��2kɭ���}T'l�.I	�9�\�B1yn������ �TEA`v	 D3d�*"�-��~.F�0��������0 1@�
$lI$��P�@<,8̄� (�@*�������t D ���^��c�oy4Ef�$}|E���[�����^�V�?���'?���~���d��Q��	��ܯ�ksC�c��6�����nټn�� ����x����w���[���x]�y�������ݞ���������l���X 	 8@"���@��X	 �SA�J(��H�� j!-m�#6Ѫ L�ZȃK�*��� ��U��� @~���J$T4�	��B p@B$�P!FXVAp� ؕ8��!$!NMR x`���JQ^<�f�0
JaT� 
� p@E� AZ��!�,�`#�0��@p` 2v�S� T��S��M�  ��Q��1
D��Q)�!+Pb��u	��� P�
Td���7k�_���r�M}����[����_Zt�3���t�b�����uˎ����}���h�y�=��m�.���x_�e�q����x��l>��U�o�<��j�ɻoڞ�����o����-{��������;�+�,PA�� M D�<��LB7D�TV�� �� �	���Ȅ
 �8��H����r��Y	B��AFL�H��f��/��Q$ 	����� !4�A�@&m� j��6;��s��m�\_����)V��_$wy�7Z�o���(�v�Ͻ���j�����y۰f?��sg��o��o��S����#O~���Yx�WH�O=S��������z�������P��y���FG��9�7yr[�Kp�߶�{m-�� ������;57P����6G��eM��z���=��ɑy'�~����v��s��S[�,cr�^�nw�����Eˮ�W��7���6���	t_���3ɵ!�k���u���o��>^8��HH�t�Da 2P
H��-E% �5jT$d������ L�ȐP�B�$0\`��0 @  ��-�XT����)�	�H#*��
�@'�  �I�� 0 S�i�;P:@
��;��9��Of�F����!��O����������f��֭i����q�����}�FM},��
r����o���Uk}��wk'�w��������fg��V��{ܳ��kW�S����nW���׬��om�!@`, QQ���U�i���AE� �P���[F�
Bá��AB~� '�� 	S   �� �� �@��D}� ��0(��x�� p�
�# Q8�D� ZB]��2������-���@��*�*�lH�%�1�DF �8J@D1��� 2������ �"����� >�,�hJ `�:J�b�a��&��Z-D@HDAW `��� �Rl' ArDR �TZ�
�KJ�$�U�_���8ߧ�޸����G=��S���w�j�=?=��W�{�-ū��c�vn�?����sO����eM�E=���{���"���������?1��Y_9�ǻ�͜�zK���o����A�kWx�K��b{�h��폣�B��!A!��L�>�4� D@ e�B� �  S�,�@��3B��=@�0C F�)DXMN$bA���*�� `��54$��@!6�(� JI�QC$���q]�M(1p��).�w��]�?#���y�����-����?�3���4��j�����}u�L�o�����������gV���E����^�w�ˏ4�ͯ��j��Zt��lm�
�j�,���}/�M7��P4���k���㉻i�\>V��q/no6������i~�?e��o��a�}��9��ڂ�mrvw�f����.������iY��߿F/����ܽ��n��E������o�ݮ���dW%ky_�_s��]�)���9N���g��'���}&y�ב&0yC � @��tT�  ��U"�L����E�8I���F2R����@B����1�J �	���u	�je�m�4"H!�O�TK:���
�Z�@҄OeH���H�Td�� h���ń������ �@���J� �)� `*�XH��;3F='25��E<
�:�#Рօ�� �0 d��T������4"�����!�B$��������bb�PG� $�\���c�"�'CH䌈p��>���(�X��$�� �`��Ԡ��	��&ؘ��0���P؁L(gn�p���  ���(T( �P�B�"B
X�C�.BA0�
� @�0��0m0���!2� * P�(C-�@a! �БiL	;�W"2��&�3�!��J�	�P�ddH��ZH�D����B�����D
�3CD�� ���@z� `&��-�h�D��}P'@P���!��~s��*�[��W0�H@�"��	�	R��*�cL��v�NBn U�*`��G��t�01R�lP2����Q0�;�Y$�`�(�(@!�J	*|G� ����Bh�
�0�3�&�$�'�d
 Cd�bDHb���`Rހ���,@����A�:
��6��q�J0 �0 � �%� ���	>p!��5@+Q��C��c� E���b���ܳ���ps��c���d�܁�� xG�.@T1 �@��ܴ��)D9D�AML��<$00�	�O%�+�P�x��?�v/��=��DD�M�U�fB���hg4úq8�dBA�r �	��80ǐV����D#XEVe�Q�A���&�\���$�$A�D �����j�����(*2�f($
0�TL)S���RQ"�:��RY��dP�����<�����@�vM@2*�� �:��0�pE��T �Q �d�[Hs�� �y@IL�DW �@�ň�=0$L6 ��P @�DDY�t�a�
ΐ�   ���Ƞ��!��P��H �p��+�L@���u1p�V�p"@P��4`��3B�E%k e4b�R !���-�0B	=/��A��%��R�*[
aD�p�p!�D��t����@,��a�u��;�O�SK�*����PD�� ���L��{  ��C   ��HFC��E��Zr� c *��$@@t��hP�! ���j S�İB�`@��t8��z5�`���+�%N ��"�0���O�c�Lj� �;JE�AD!@S!x�a��%*9d �5D��r8ZP�Q�QQ������ "�!���4$P'l!���D �Etp�(  �B�b0��#�A ���$�i�* a� 
8�����B7�P�,%@0`�JH9�� J9
��C�,hy�T���)��ӣ�	qn�F�O@8��q�d�(2Dh �_��gMX�� x�	Ba9U �ɓ�݂iu�a�`�S��u�i9DB��� U b��C@@A�(eQO��!���6( d��s�  ��HXp��7�#�B �5��� E�I�C$ ����yA4`�Q�� ��!BՊ'
��0���(YQ$��K�6ަ`-��P�"a����F�$�e%�M�	TdH$*(8X{{�.& H2![��p @�:
�$��zc$�O�Pp�K�	��QGP�-�� ����T�A���Bٜ6t�� � �S%��F5b
�JyE8!�Xӌ被=`AW�& �*ND�*! 3D	1)La �*P�l�PLO�+��n���� 0,��.��e� ���� �����E����D �CvDE"l�	!]z+�:�A�5�;�hdL  �G� �

�QH\�i�B�E� ��`�HW0���&�ț0�0��@a P�(<d�
�,N�

���fP*> ����B�� �d ��)� DB�B ��# L3"�pH1��8 F��B�|'P�(�>"W9� ��K0��$�Ir�!u؝��>nDH@$ҁ��֛�P�`ALi��1�Z$}N�\tn�p��T��V	xv�ɇ��(.�X ���� DH�� $(H�#� {& 2Р ��!�I�
���	���Z�Fp�̚�F8� я0xC,�x�f9!�8T���䘑
�2i�S@�9AD1�R ڑ6x%1Z4
�
h � ����
28��0	O 0�E�@Y �dF ���� 0��� �  / � 8���<���P���Gh���=� �c���(KȂ�H M�n� �\� �:j���!tE T���:�����h�dD�A��%f�ADD 9���� D#?�1u�'��� 9��N��0K[
�"�=H&H�P��C1�PPم��07"�ACD�%-f��	�� �")e Z"h��9b��`��DPpxZ�TTC��   � 	&J 	N�	X
!0 ��@2�D���!��@D��rhS �	",�I �R�!�1�]i �Q�Z�SP�2�A��4��9J����P�Az �D`T#BD��SZ�����%�AD,8�.35&E%�P��; pm�(9J����Q��H1��,:b�#E����A8%9H-���$6_Eg����6� �r����:��]R�,(FC�t  �qe�Ҕ:�D#[DE',��GMF�7�����d� dB��	P��7��sDq	 P�g3���J ��"BD�)�\FA�@��PG ��!����?Pup),� \d9�-[0��b� Q@�@,Pb� ��*1	$ R�"�Ɣ�JB(���ֹ� 	�2cC�@�)�@� +b�`��HDP�� 
���<8�Y��Є#��A�4f< 6�D0)  # �����'�M�)$���(*A@ �%P��4J��.0TF�����T�t�BbAk�,�b��i��Q#+!"��H�"�@%&�pE� �0��Sb���F�D��Q� �c��r���3�YD��m	�����!0	�-���0�@o�*D	�& D�BH!�rC�
�pq]�MK���G
.�L$5��8� �� ��� 	��P�"����!�T���ǣ!�	�#$���EN @BoA�  `:%�v0$�� 
!R��B Q" �d��#`PB�%��M\� � ��S���"��JԐ�A�`�a�� e����H�(� "xlpK6�Ma
�� ��$b����(E�@`(x��`E,�*d��0
���saA�b�y���$�D-��v()ӥP%��@�KO�F�M� S6G.Ne�x\��$�"���@��P� AQ$D1�'�& .�H�h��aI
�EX ei���  ����:�B�1��q Q<�$DT�$�B@
�\ ���������C0�AJ#T� �k� 	`A �YZ R�>��([U�g��e�J���MZ�����?�A�,�PO��)`���@��Hb6��@�i
T���0d�u%��g@�8#=�\$ e҈� 1nT@ i`�v�(O�S�x%�A��ARfj ��'EP� ��8�f�"+.�b(�%$4xÍv�x�"95b�"%��$ ��3��|�	"X�F�Qъ���OP��B&�"�(��	#��@$��J�P 	�`@��e>�p�	N2�A�a1��`���͙6����M� 8�
L ���e@���!+	 ��X��!x  �$�:��͠��XI-�0�Ӱ@ 	�A��G� ���Ft�DL��|rШ�8`J�U�(Am�к4� O�P�'�`�#�����hP� �D�1($6W �P����N0 �D� N�8H� Z�P��� �R�d�" ��Q0@(B�&H��H�x R�!PO �2
 0h�x�@�,�Gg$��!* ��`!T�.C`a�P�D�8�1
�`��L&�PP�E�I ��� �  ��DI0 �K�#���`uh�0�@p�9��c`�� �(�  � ��@L(�JB�_PDQ	���� ��!�a ��`� I�H�mЇ�!�)�)B$P�A d�AR&� 	�Y����	� I@��W� d!3�7	%h�Ў hXBN�  P%��H���5 ��&�� �����n@K�6� �QH|f�AC�F�@t(�#[à5P@�*�D@Us��ȴ@���3HPB�DI4�A( I�ŤH���J�eH�Ö �!����D��`C�2�`��;��E��  > 9��,H0�)��0,R4D��䲉VHkܐԊ�	�� ��,��p(�'�G��(�"	4 �)"$(AJ�E  �EOx b!W�X��\�� P-�,�+@�%VElФ ]$�	q!�l �6
0�)/�t��E���
8A�N�X-L� 𠞶}�
`�3a/(��U�'8�A�f&��0 ��)6��!�%�Lā��c�$��d �q	�DZ#��]!x*�2�/� �� (P8Vp�E� L�!,�, ��$ �I�%����@�hUi$L���^j�� CARf ��X��8�BH  D�1\��,L�0��@�/�k^�1�+ ����(0h`[�B�Px���J�6 "A�� �C!�Y B � ����rH��"J��8BCeJc�2A< 7b�$^�8 ��
��
�����3�"QȠ��
RG�(	��@��`�@��IL�����̀\��bE*h  ��Y�P%|�� �o�����! �1
&��N�	;�B,"�0��"HIkBH/�j�B!S�$A֚��H��k��bm�  �8�IBB0
��%Ն0 * ��L(�h4��'d���P�]�0 ࠅ�K@H H@�)�2"HD�R�  Db@@n)�MB��[� �	�[(���	�
^P� q(k�0 �fP!@�p�(p �dBR�嬀:��r�L�)���� 6 �b����Ȥ3	6 �a�G""	� ,�3���JPfO3U@ �	�	��� Q�q�H�4�#��` G1U�� ��%�'�ޤ5��o�%��~ Zb��P9ء �5`H��UA���N
-JP�)���%��c~3�0H���A�@�Ґ�@��y̓Ę�G�bY�PX!�` C���o@ 2@A�ē�H ���?�Q���J�@C�0 "�D �m+$D@��H�It̂�!A�w� i�b[ !���E!��BCa��PAv�QQ�9`�H�~�PE�
�Y�@P!P�@0PR$(�%jLKxf,�"D��Fk E�@i�`�K1�%��\� 3*��Ńp0���  �a�ɰ��!��2�@�q
.�,1ƼB %D$�PH̔��,�� ��T� �a"�h�P 6@߀fD�7&�& �N
N<Ās��m AU$��朑2��'E Y#C� ��,�<`PBdBlAv6P@��vT�@R�E�e �I�!Sކ�P |44Q�Ҁ@"K@�(G��@��@���@�����K ���
�`Q��"�䌨�`�P� �̄�|X��
��0`M�HhhR\+`9r  $"!��0e� �(� :��a
�`H�Da� 5J����	�A@��²#
A4�@� `N8��!  �I�)@�ț
R
9c���r4��D~cV�@� �A�Z3 BXf 
Kq�%"���ڢj.IRo6� �0�R�&e��@W�����{@PTY 4��`��D��'F@� RD)H�"�(�� u�  ��D �P���(Ʊ u��@� �W9��	�F&,p@.�册����(e�H�@���%P�2�H9br �bu(�%C`@��fP����d �d
8	`4P��IX��<P5@ ���(�p�$���� �b��PR"���
�H��`�
А��
 ��(�� h)ȎA$(����
4�O  @�=$Y2�D
��W`�w3�26�-��)],nX����w�l��X�`�-)���U,0��� 1�I�n�-�0��D!H�	 l�P��]Yr� B$`�,6& @�| �~B�,`B�CJa��B�Q (&v2sl��@0# �XSx�� G4  \�ѐ� {�R*�2$�� "f�fM���8�:@9C � ��2 ��z �%� �'
��  	�8JR9�� ڈQ%�J@X����d* ˑ0�R?#��� �	4�x.��'�d�AJH *���M�
 �$F(S�'S='�%6
�a��R�8h����]�`%�Q��@�$/���m����P�*T��b�ئa ]��E$�X ��C6� f~`J�A�TJ��mpB������t8D��ETb��]�I'!@AY����3T >e ��eT�� am�̈́{� 	� �& ��a�CD 0��ΘiQ@HB`z>`d���j%՚�HK`�4�� a�p�A 5'�`���0��r��(�A�1��M#���G�Ptн�S$�` 1@6�]@@B�Ü��0��+�#`�h�"D0ē�3 ށ�	��l�)N�9�CJix�hUN�H � N+(f`�R��v�0q
�C���F��8 n�fD$�nR�@9B` �B���� ��Ps��!���R(��)��Y  *����� �	R��Ft��d�@$ t�	p�������.�/�Ɖ ��R!���# ���D�$ � ��*�1@ ���"�' Ш E��"Z 4���!�!R@D"�(|
P� �h���E	�!��q1 �΀��< 
.{�ӻaJ��D��Q��pT츀:& � 4<��@��!	
��$T���R`U!q) D��B
lP�� �NMA�f E�"P�$�
)�!A��$8�&a��
%  E�1� +@�,=�PA��B �b�(��4�����#��	�%6��Q .�P. ��c�d��pF��X�p�0�$ IDts��p�& ��
�zR ��y�xQ�0
IPb` RҨ	�����(HE��B2 [¯�% �0�	� ��$��4��	QA�Ab��8��  ��;H�BtT��-@
%��^ �$� YP�4��o��:jS�Đd1���� RhYKP"�Rh L+O'��l� Fb1Q�&\R
K4 ���(x��4Z��&B(HΓ�F �Pנ+��s
@��B^���BF����I5�!	�$e�C���`� �##�j�0,0�c(b���A�HDH�@�	G�a722� 0�%��+C?sā0Xw�����0�ZZ� �!C�#�	d�@�p	8Q���U�I��唨��F"��,�P$A�@L��9��(A6�	  Y@�
Ҙ r0L�b	 �"*L�@�(@� Ղ9����^%0	2�C(< p�aG�� ��i�}�A��+)&��P��� ̘UT@]1��� ˘(� 0e� ����D�E�9 �	���*�� J��B���SP���$8���
0]\�9B� #� �p�g�%XXGw�fH����{�p�7P�v�����9�{���?ۤe�_��Ӽ����f�+�����&��o��v{>K9e��|��Z�ĳ�~�O������w�u�sZ�c�׆�k��6��?�_����9w�.�ڍ=�4��O�˼�{������^���������&9'�3�+���[���'���]�����a�������o!P��uq��o��N��W}_3.��*��?/�O���;��.��	���v�錏��+l���  h��I�E5  P�d�
�7� �%��q(0��-�`�B�S 0��dl   �D@ �c@�H"Y���@=ixbyP�@ A\r+j( ��sH$e@DC����& %F����ml�����vO���x�z~ߑ롿�?��{�W����5!N{�������w����ҫ����O~�6�k�/~�V����sg���v� b7]����o�}N�;���/�X^���}���*z�g�{pHL�* )˃��$ ���D��AƲ �RI  A A�ș"�P r���J� LQ"� �� ��h�P�Z	��,� .B�q �&S	@aȡ9l"� G	I�E)"M� �-T��@�c�@�
DE!`�[$Hi"f�+'GJ 1��P8�l"��@ ���M@��2�	��@ B��`��J��R����z��� ��#�A�$������
!�@ ph�{e��ߏm�{Ϳ��{>��pwg߯�5�w���}������\o�|h������{�ݕ��}Vm�o������������6��B����b=���u���ߒ�>sg�#�����X���nr�������kHU;���������0��	�0RZ< #AG`(u	A� �P  @Ƞ�  ��@LI�|0,J�cA0	B�
�)�B���Ob���IF=d� �EB��t) ZD �W%��Q���$���4 5��Zo�wF��~;{���_�l}��:?�S'q��?�~�)ԟ������M�MM��
uu�٨��\���}��������<���}^��5���7r�^�\��Z���E���}��u*޿]�������y7����M�=^���v���E��t�ȕ���������Gs#�?]K~Ϛu�׽x��s�c����_|��OO���㿩�����k ֿ��7�������y�O��ۣ��j����4����N𗣖>�Z(7 a� � �� Y�c	J�aƠ�\
cm�a"� �T�DxC��0X@U
dR
I@�>�a��� ���X�c� �� �`zQ
An��٘$!2 )`�& 2  �,�  ��_��{���}m�3�<eeN�}{��w[����Y�o��OT�5���,�O�7ҿ>���/�����u��Õ{�{{{���۹G��Uw[�w����<^<:�R�-��:}���_������k�w�x�;?��*`N� �	ҡBa��X� !~�"��t+�x� A T��T) b�0#phK p�����:�`� 5�C�BrV1� ( �� Ā��
H��-���I؂�2&�"6VeI<�P"%C�Ҁh�ȉ����!��&�%Mi ���8(�!؈PN	�h� @�HKP<jD�3�0dJ�3L1���AC� �X%KH $ �(@ * � x��� $�F��:R`8�g��;��u�uP�����i��;���tW�G�>�w�&/����|��c���f������/��Fjn���l�8&u��.��ν]�G)�X�l��?n~a�w��D�-{�?�N�/��~�6������hd��\���F
"�� �S�8Z�6!T b��) ��*O�D� (�Y�B�� ҈ �"�6"N9@(��)P .׀ �%I�@�Y�Ą�*�x� R�  A(�+䐑7O����A����/s�x���i�~&#�B�'���;�o�]���j�:�;o�_s�I�{w>m?��i�j'�v��U��ӏ��^�/3_y��I��3�/�}��?=��A�d�]�a²K�ݽ����ϗ�U��;_F���p�u�G����c�;����?��{-	�_������_^��/��v�q�����M{�Nی�v��;���s�L?��Wo��U;���_�����ZA�y�/��^�?��k�u���|��=�?�6r��Ux���^�v�׮_���#aA��%@+�b �X�RY<�GOf� )�A5`� ��`n� !B�� Xv`AK A,�B @-B2S�Aq��Hl�5r���  87����)S�!83�K .��:^v�#��Z�.����K#i�G������`�����ԣ������_��������~j�L���y�_�}���oUz����o-��_3O��V}�Ůw��|�7z7���9�C���ϸw��z��1PtA �E�:c e� $T@4!��!���Rz� /Q �% �"	c"��Y`��&��
H�Є 	�*N@�� ��ІH0&FBBMY.5@$ D�@xH�J��Pqd	�A(A�"f@P "�� (Ty4AG�C @
  ( ����e��L�� �@�, @� (��&�X� "�Y�"6b
�`��RD��� ]A@��Y@q�@"ˈ��A\ O�P�E\_ ��A&�w��K�z���Vq�6O��7�_v���׼�����wܦ{�����xo~���]���%�/�޽?ţ�}���c�/w6��߲S��о>��ov����o�G��WG��cw[۷�z�}�WR�s�Ϧ_�fͻ�h�B��AP@�&CP@��6AS�A1� ��� �P���� � � J$?� �%@��"�b4�KP!X����! @�A ��  H�c��(���C�o�
�<BS
���D�8  =����o�G>L������u}ﻅ��w�����S�?�m�Ɵ��m�<z����/T�'��gon}�����߷mw�ѱgoG��=��-��w�k�{Wyy��k�~^����W������?��أf��c���������V��Z��]�}Q��M��Wm�����j�"���g�o�՛ھ�7��_�bw�3)�۞��� '�]�~~�ދ����~�}�������/��I=�?;�����?����6�;��yoo�?�]���x�s����@<58b�<8z+�1��`��	x��BMHT\���  A�+ap���� $h�P�)	��(@�KI��	\|�E��,B���� 4�Hh�BH(8  ࡚��0s��� �b"C�[��?���w��%�w?�5U��U���������U��������lF>�Q��4�����g�V=<��{zF^��ʇ�?�����wQ~O�߭����v�B��ǁ�;���kT��'�Ş��ګ��V����%� �#r�@���JE�IPL���#�1�S P�  �  �`P� ��AbY�b($0F('��,@ >͂ & "e�� �dP�` ���'�
�  �ǁ&W�d	�������@@ �^�]	���QA��fj�x 0�#fA� F�s�C� �D�: �I	 �H��Z �PD$`�Q � ��J�[n � T" �	
d  )Z�A��((&��	
$��
�@���>��$.�?]��Ѻ��o�é�s6~e�@��k��m���<���B����������e���Kw+G�j�5�Uw���{c���y=�����?��{S�-�ͩo�cM�n�{���x���_Q�S��o��: �|y�{>W������^8���QX��?o����~������5�y��Fs�8��w��v���{�{�����xk�R��מ���&���v���迷��Y���������ߩa����K_WY�}����������ӆ=���x��� ��D쀼
�TR'2�vc��J� x�NGl�4B#rpa�+AhI"�`輸Q���fS�B��-��� 
o�bcIѐ!MNb!h b��A�DTB�ʁҦ"CF  ��_U��3H�����00i������R�&(Zt��a��<4�J��s"@ea	C($CA	A����8dB�#B{ �81%&	��TZI�xÐ"0M�D�4�����8���4��O���耈�ϸ�����_l����^ٯ�?��X��H�.��н�������q���?��bg����.�̽��R�f��w����޽�����<�yy��[v��Խ������%<���v�_{����o��ъ���=�����8�������c���8
����®Z �)&��L�6J�LF�(D��*;$� m%<�� @(��A,�����\h���&0d�%�~X�ͅD&� `�� 3�̴a����M�a���ۙ�~���w'�|���ŵ���q˂�#�w��+��S��X7�̙F��{��2��ÿO}k^�����w��j����?��aI=��������<����y�'��C�9��W������=����?��Ƀ��l�����|_e����]��������~�v�{�,��>��w}�����_��ա���i��tY����}�{���|�>m����˿��|�zߣ]�~��^?�������������Y^�����G�|z���,=�g���jK&���P5�� �A�����LD 7X �@�ȑT�DN(D�48f���� ��!`D�)�B@�p�
MI��@�X�gJQ��i-!L"�1��ds6�{f�p�ePʤ� 	�ۿ��k����}^w��T���F2�S��'HΝr����T���l"��
�Ԝ���E�[|9o���n���?���?o��U���[����}�������~�����������?r=����wj$9?��FIA�PPJ���d�H�()hÀF��7�S(��2��X�J/3V��@�X�QpW��R�IX�2 o�eʜ�PX��!�ޗ $�p�LdM�D�DT�@�o@�A�;PAT�L�s!đ&�rإ�#	���� D�Z�0�7A��;�%� e@ʹ"E��X�0)6�1$ER��lO�`��?*��H�k6'԰����T
��(炡$��	�Q�R i����  �D�[T��"�2�F��������y��	y[�=����r�����~ߓ���~�����~}��W����v�[�w��پ��ۿ��%�����"�^�߿��>