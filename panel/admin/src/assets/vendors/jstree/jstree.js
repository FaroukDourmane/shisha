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
								this.settings.core›}tÇ£?@>Ï©ïÓ®÷Ş·MşÃîôï9¿ÕË¯G¿>§öÇ·ÒQ×ìØıÏ¿ûã\qßSıÏßŞ³yOõşãßZ{-v“ûç x÷ÿuõ¨ÿ‹wVw?Oô·¼?½Œ8Õ¬»Hwÿ_ÿuÓx»çïïW¾ş^Õÿ*‡aï¤u¹³Ÿçú¡ä~¯úºkş;CçøjµŞzŸûo£ş3¼7>¿÷¥ïüä_ÏÆ¶=Ï´÷oÛı»e?¡¸ÓÎú·ÿê<ÿí~¯óÖÛïí5í]áúÜÓáÕ›mõÏúnëv~åÛ¿ş-¼ümş}>Ëşñ}÷üUÌúYïŞ¤ÿïç}ÿWø_ææÔÑlûç{î&÷ÃvùÕÿOƒ¶ÆKù_ÿ²éôÿş÷s×÷lÖj½5û¿JßŞÜåÿ½çşñ¹ï½½İ¿í<»ò_Öı–ûTŸı–¿ñyîkò'½%ç¿ÿëŸ]ëòf÷¿Æã/gÑ-á~úÍ¼,ıÿ_ßÿİûÛÿ¨Óûö±»|{¿[ÿ%ÛYiç××ÿŒ~ık4_§ûÇ|·ì|G}½ÿıö.öó¿êÒû¿µ¿ç¿÷˜yw°û]ÚÖùæËÿÖ·á™ï<Êïã¿öÍÇö?=gók—1~£KŸŸ»¾wèd«¿¹o21b5ÇÿyïWÔñV/óôëw÷ÿu/ûoÓ[êjë•÷~ß#ş-¢ïNüæş{şxış´ç÷¾½ZzıÙMós÷åüîû]ÿŸÜ§©ş_oûÿO~»»åçïó+{ŞŸç©íì°ãï™üõO|úÏÿüåıf[½g´,·ÿ¸wÿwg³ïÛ½ıİN—gäŸ×Çÿú'7[œ®À«¤¿÷Ï»±fÛ±­óß-ŸOd<–?Ç63+8ûşÿ¿Êÿ_·6Ş]…õ·2Uÿ¾Ó˜~O·î¯ß)¿üèü}¿İùß¸ï}²Q/›îÿî=õ¿Z~zÿİ%ÿo,âïsb'uÇıÿ¾ı§÷¶—ıŸúÛúpÆoÿÿŸ÷§5ëşå§³¸Ycäzys?÷ÙÿÁøµ37^ù¶Áª×êÖ¼gìò_”gï¶ïß¤ï›§ßq«İñŸ@z–›/ûËö×¬ß?³qE?~—áâİØİ÷Õn Ñİ÷ï¿ç7?Ùz^İÙwıËşÿ~è¼ÿ~-\·ı»u»ùoîŞ~GŸí‰|¾Ûß·oÿı£ãŞ{·ÿw/ı7ø¯ÿ“ùûÿ»Üöï{ËG]»Uø}ŸÿşKq•ÿ?Š·½ÃØ¯Äßõ»òwŸ<GoUûÇÿóI[¼÷õz©Uß¿ù·^ºÿ–,ïuŸ{~/Ä7¾»6·»vßîœşü7ÿû>¿ÚO~Íå·w÷Ísß_ºı½ııô>¾¼ä¾ßšÿWñc]ŸÏÙ÷ï÷¯¼ÿ|á§ïï÷Î/÷Æ~ëì«|Ü{Ÿ­;i\õSûÎ¬áfV=¾¼ÌwÕ­[İkÿş}·Û®/_XåÇû‹lŸµîî¬¿•¿;!½ÏúæÇuíöÿ»úü’i]ÏŸ—ÿ”µ/Sß¼¿í÷¿ÛÇé›º=S3–5Üoç~İı;ş÷å¿ííÿ2×ïşÇÛêñ—­^[İØçÿö±Öæµÿúº÷ı:´İé½×67-ß§÷İıvÇûÜ§å~ÿô¿ï÷íö÷¬Cuß_Z÷³uŞ¾ş{¹—Æ—0÷ñRÿyÛäÏÏ³´y?îŞÜ®Ïo[ß{ŞN»üNí¹¥%Õo¹‡ÿ¼“}Óüûÿüùıßëûëïü¡Ï÷çu:¯û¿Ë¶ß<Ş¥¿gewí»ÿY£éµzÅìLFÿWşíÕİä·ÿİşñ­ıî³ÿõùğ¶êÛ-_ôªÏä«»M±«ZÛ÷ß7Ï›GŸÿ6×}ûûÚ÷µæşÇ¼—wµá¦Ÿÿº¿í×ÙÅsı÷ëÔ÷éË]¹÷Ç™	=nùv¿ıÜIµj~Eü³ÿá“wûNíVì®C_ÿØXtç¾úeÿ¿ö'K9¹-o÷÷ÏEæ4¿ö÷¯­ï±·ÿı†5-/vsüÜšÛ«å¬õ<üë—öª¾RÏlÎ|ò¯×ü7.çÕ¥íÿÔúÛööÛôo·ë0t»7™ûÏËÔ÷«şÿïÏûşÇXîÕıáûÑ¾Å×¯åÿıö¶fßipßùëæ}Mç>ßI|ŸÿÍÿôş½/¯ßİû½ÿÓ÷5ü?¾ßÎ¿;í}·ßw¼¯^]ï¿Ü½´û/šı×ùÙû~~ùÿ
ÃµÇ_/
^ùWûŸêÛ¾üİÙ{7¶ÜñıÿÓ?_ı½¥Ş}A4ãıä'ú¿³ÏdmÖ[mõ~¿,šç»ÕN–?ó[x9(?·öîş	|6ökÙoñæÙiïÊw·ï_§ÿáŸ?SU¼¸_yå½†Ë¤ÏİÕİÏëÛçu¿¿¿W.«×İã;ú~ÖíúfŞTËßãk¿ooßº›“ÙãŸ½ç™²?Î¯këşëù_ÿıÛ²áû‘öï}ıí¹ÚÅÏìÿıä]½>¿÷ı¾İóñûNÓ7=<Nu‡UİQ~IûÿrQşÓs»Òşüß+fÿkü=şùƒï^7ŞÿglşÏ¿ö¿õGrwîëç7G™Ş×ÏaÿşfÛ[ŞÁßÛÚ|Ö{^:ş?şo§ì5°¹÷¾¦ïÿıŸ¯w½Õÿßı·}ÿûæÎ»0¿Áëû¿ÿ?m_ûûûó—şÿÍ9RÛşøßÙ]ÿÿûõí»ÿ•ş<{¼şşu7?ïôß«ÿIÛç3¤ªÒ¿ßÛÿíüâ÷Oûîşmı¾^z¿åØ§íÿ½Í“wĞù•Y—¾ôáçw¿\†÷íÛ·½Õ¼Ï÷êÏï·mû_øËoş'ßm{ËçGn×vú?½„9ûØßvş©{V_\÷èÍıÖĞ{ÿÚü3ãfõ˜ß¿Q7òWâíêä¯Ï^OÿİÓ?û÷êö/ëùwºŸOùsß¯Ï.ûèóß?pÿÿ®+ëË_ÿ¯Æ¥¡G¿[7£¥çhü«k}¶¿ó¶½ûÿæúùïuõïÇñâ¾ç=ñİy?]ö{~ù~Äá×ö¿3mùõïï¯Ÿyë¶ıà²d¥ÿt÷åö>‹ü¿¹ÿjnú·éßùróú»ÿÚË|v^¼ûŞ×ş­-seÕ|ú®õÛÜC{ÿµ_ä]WwÆ–‡yãùßûª¯¿-ü?/¿çü’Ğßüë]şú²èÍiÿm>íŸïß»åªâ¦n«ÏÏîê¹àúïw×ß»uŞÚÿ9¯@Ûß{·|ò&yı×[ºüÛşù¿m÷Tqzş|NwÎncœ,\V¿ıÿ»‡şúû·×¹ì÷w¹nÕßõ÷{Å¼}l]ú¿_ú¿ÒÿÏë;?\{ß÷w{ŸLZÿo§ÚÛ½eF­ÿëéß¿ÿg×hñ~g<[÷ì®§Ûóü;ÿ”’ct_¾m÷úğ§ïÛîÿÖÛ9Ñÿ¶4ù…¼âé«›îığŒ°ïßü¹¿l7~Û^ï¾–şÒüÿ»³jşßç}'Í‡?ÿ[û:ü{ß¥æ¯¿»#­[9\÷úiòG²?ñÿê»¿«õóöeëúı£÷şWø¯tgÔïsæ÷şE»û·>ÜçÌÿ{ï÷ÏØşxï^ûŞîıkÚû¬†}bOöŸÖßé»ß¼şÛ¹^ÙÖÿ}ü½ïöÿ“¯Spı[k›Ï×_Ûï3×ß¸§´ì‹ßİ&ëE¿~Ü›÷Éëo|mû¾Ï^ıû—ÿõã¾ğwöGÿ^ßìXoéÿy-{o÷	Ÿº³©óıuíí·_ÕvÅFÍŸ³y[÷'—{|§ï¿ßæ•>®¢ÙKî¾ÕoÃkô»©·çõ9wõúÃ}y÷Wóİ<»ş—«õ~®¿{Ñşÿ‡Q•jœ³+ı;GõÖÿ]{÷õş¯ß_?!êëóS¸Ş÷Ç…³Ç”ÿê7zz_òßïûëıK–ıãb¾ÿ?hì»k×z’/¹qû¶›°ñ/oó÷²¿üñïœğ½>¿°ÓÿœôĞøO«ş¡ï]Kùû|Ü‘ö~mzŞ&Çm‹¯-3®¾¿!«}û<şû·Oşÿú·şª¬»_ûíµû¿ûñş[=}1¹Vu^Ü5{±õ´ƒÿÿ·í­_ã‘½ÒØ¿&ãı«è¤şõ¯Ûşğo{Ğ¯ì÷uw]3×ßßÿÓÿúî¶¯õ÷½ÿºMï¾úaıÿ¯¼÷ÿN´ÿšÿ®W öÿ÷Msœ¯·'6‡_´¿¨­ùéŸ¦ßl·U_{•sí¡ÛIßeFón¦È÷s.T=÷_µ­¿¬?½×î×í+s—}|‹÷/ëûVkgcQKNµŞ¾˜–WOuy¯­<ƒÍß~_´×÷oæ{w?wwâ}Å÷iÅÿ?—õ÷o<Ğ/ÛvCŸ}oßêûå½wß÷¯ûü©Ÿ½¿µûO_»øı°½şîåÇÜÛôëûÿşïîÿê×¼½ĞæÌİ‡lµmgÿs¥ÿïc¿.Å»&ÿ»íİ´î·½·ßíõïş¹ï~ï›ëî_Põíôßºµ~&û¨]µò§õK¸3÷^\Î5Z^ofÕÜívïvø³îÂçùuÿoÿ÷>ÿu¿â¯ßé¬ºÜïr÷ï¿÷Æ}¿¥»Âÿ—Oç]^SÏ|"÷³ÇĞ÷]{>×(¶_§ş·:™¿÷¿}ß}vô÷‹îí÷çÓ¾VGût-Ûvë?ıÏşsİãß}İ†_úÿşê:çÙ×,sFîÏíù»ŞõãÓ—ïßí?×¥|J¨zçØÿ«ËŸïçº`ñŞ_öÿ
ïtVf.ôïz—Wéò¿ü<äÙ“ÓEús{~oÿtóı’Ì»Gõ¥ã¯ˆ›wÔô7?ó¦ÏŸì¦£nûÿå ?ÕÿË~ÛmR_q0×©—[ıû™ÿûzoğÿö‡Ô·oş³G¯ößu[E"}íóAó¨-­üÛ‹¿O¯Ë´=î»×ë½¾‡ø?FİvßõÏm]ÿ·Ş»>>_y‹9¹_Øì}?»»Æ×>Oÿ]ç›ı~Ï™áË¾ÕÏZßÇyı^¶Ä8~çVûû»§w>_…Ü÷÷äííåµ¿¿mß÷©æ“¦¾ÔM5ÿ½ÿ÷öS}gş§õ‡¾î­—{wß5ÿÄŞT×œ¿,}íã8öİ¯%<+~ø–¾ä¼¿k¾¢÷·úŸÊÿòı^Úî¬k~ÙûºşÈn—
ïÏX«—y¶•®«?'zşö÷å’âÜ<&n¸n\ùhÅæû¼ôÇ9¯>7ê’Øs}İ~õ÷i©ékk	~°Ï•ÿg×z}ì»ŞÚy6W¿ë}ëµS>|îçöµ÷¯'_oMÇ/ãínô9ròŞ_í¹×Ïú·ıGéa½İÍôÏfµë·º—¥Ó÷óµÿ_½fÏŸo²­· ³úü‡ÎwW·²Ùÿ=Ñz—yÎ÷ÿ¬£9Òû³^yûø’¹?&¢ö=è_ÿÂr•÷ßNó×fËßÿ¶ë{ßüïÚßó›OÅNºõÙïİİïçé—ë=ƒ§­zÕ³ëµæ°÷öc;}|İÃ÷og×ö+ú÷¯¿»Ÿÿ÷¾ûú¿Ò~ÿ»íßæîŸõV2»çö»÷v;w‡ÿ½ï?}Îıûÿÿ­Ÿsşend
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
								a_attr		: {   i€¯I€7Ÿ€ p 8  
NP€L  ¶lØDÑ€   ˆ-åÌ  a€H€ Ğ Äêõ  :Mö×~^ ºÌ€ÁÓ€ pq>ÿÿÿ“   L  }€Ù€ à°F“  êi€#€ÿÿÿÿ   ùk€ŞÌØùk€ŞÌØ Áx¯ø  ½(€L  S€-Ø ÀßÀ  ¤İ€9€´ƒî                 0        Ç€ @        ‡^ Y	Ù
ğÙ `  Óá   L € p6€ 03 Ä`ñ   L € –l€ @3    L € VS€e€9 €ñ	€ ` ø
  ğY€‹^ ¬¯€ 0L€ÿÿÿ“  Áœ€L    L6€û¡€‡o€ àĞD²7   M˜€   ;€5€ Ù   Ì  3Q€¤R €Œ÷ØëàØ `e+LñÜ  
Ì  ±İ€ÖQ€ °  Lˆğ   Ğ2€L  á€ À  LˆğL  MÁ €@¡€ àG®ÿÿÿ“   hü€L  8® €œ€]€üùBw€ô²ØÃÇ€Ln€¤v€ P  P¥  
•^ ú€¹­	€åI€¸$€ p”jüZ7	€Ì  ¥O€iIØ `2  v   L „ `f Ìf/¿fæî æönÌl+J\fãdV9ZEfj”\DfS$T&f™ZL`™}•V -n5Ldjìœà ii™`ÎfhlædÀfi•”Ÿ™œ–ÉÆ‰Öi™)šÖ¦¤êÆY`6Şf–¹‰UFft	L=	%QBĞ TVi%WÎXş Yj9LqY,]~	&a2%&c–i&L¡yk²i!1€!ŒÀ oB'1W'vî—e–'˜i¦'™íÉ'}ş	8€(‚şá
 Z£•6…šF¦‘f(¥!š‰¢¦(L­Î(­³Ş(ö(F
’NJ)LX
 Ä S÷    1  º2ŠŠŠŠ­Œ*¨` ¢"ª¢‹£¨ˆÜˆ*,"$¦3§3È†€ƒ©¸)È’"’2Š²Š³¤Ì¨Œ*("(–«ÈËÈ‡%Ä©ˆ¢"b"‹£†’èÈØŒ"(ª#¶2ŠÊˆŠ-Ì-Œb"r!‹£+#˜ˆ˜È*&"(¦"ª#ŠÍŠÊ.H"pB2A1Œ|Œ¼ĞÌ¨ˆ"(",¶3¶2ŠŠˆŠ-Œª¨` ¢"«£¢cœˆØÌ*(*(¦#¶2ˆ‹ŠŠ)Œ-Lb"b"‹³‹SèÌœŒ*&º2¦¢‚ƒ‚Á*X*Œb"R2JÓ‹±œÌèŒ","$º3¶2ˆÊHË-ˆ*L¢"²"
#ªª(ˆ¦Ò§ÒÀƒ`eì   ~&€   ^ ô	€Í„€ €  4“÷  ¹n€L  ²dÙŸ(€ Ğ ”ç"   $€L  ^ Û€÷Z€ €Ì½ÿÿÿ“   L  ´õ	€y€ˆù€›u
€ 0 y	  
†F€L  	^ ¶+€ñ(€ À2 œ"   L  
^ –¾€Ñ[
€Ğaî”€     
 ó€:Z€*r€oz € àB˜±7-İ€t‘€b	€ Ì  û=€·{Ù     jÖ€R$€ €6±“   ˆ» €L  ?e€µÕ€§ €ø×  ì  
^ A€úDÛv€Üì€ ĞO ^ ”€xŒ€µÜØ À]^ 5€í°€/-Ø Ğ  ÜòX¸€L  ^ J&Øqv	€4İ€rã€  ­ ìPå  
Ì  Ù
€áÙ€ °­ ^ î,	€-L€6İ€ À­ ¨b€ Ğ­   
I¹€á¨€I¹€á¨€ 05 @eì  
å#€L € ^ h“€€ €* œgò   L € Ÿä€|€›€#/€Ø #  
^ âoÛK€   @¢èL  È•Ùr<€"M€ ° 4ZüL  ^ BÙ«Õ€ ° <…î  ş€   ¿f€Zò€ p t²7Ì  ğZ€ ğ€ Pë€±7   @İ€‡L€ 0 *8      J€ @       ®6€¶Ø  & L³  ”³€L  ä¼€/ä€ ğª‘ÿÿÿ“   Du€”€Ê˜€R€ PÍ€±7  
Ì  ¿¹€úf€vU€Óõ€    ôãoC€%^ B8€¢¯€³€   ”\íè€L  &^ •|€ù¤ €K¶€ ĞÂ|½7'^ Hİ€G.€ÿÿÿÿöZØ‹Ü€qà€ ğ Ô[  L  +^ @
€Ë2	€YE€<LÙ P4 tìñÆ €õ €  ¬Ôà   g>ÙL € Z€É÷€   v   L „ œ#€D€ ` ä¯à   L „ /^ :D €~€ €Cƒÿÿÿ“   0h€L  ·=€˜!€ €1 è¤æ  
 °ÙL  1^ ^î€¸’€LÀ  
gÉ€L  Áj
€´k €—‘€    |ZİM€Ì   Â…€“€ 0 Töt{€L  "€}€"€}€ 0  h  E_€}è€ p ”’
  œg€   <C€/o€vW€ °X€±7   Ì  ı»€¿®€ Ğp Üçñ  m2ØÁå€ € `Kõ  
Zİ€a€ `D¬±7:^ È‘€ pD—À€¯Ú  ›=ÿÿÿ“   /&	€<^ öNÙ¤[€  à˜±7   ¤1€›€€ `ãË   ,¦è  áœ€>^ —€˜ı€ ÚÃÜ[ù?^ hÆ€i@€¡o€   Àá  
L  ¥€Æ¶€aİ€ Ğ£ à£6°€aİ€®Ó€ ğ£t²7C^ sÖ€­€¾ˆ€   „$öD^ Ò€«›	€ 0  Óá   L € R¨€¬€ à6 l<z±ÙtÓ
€L÷× º Ì  G^ ì^€æÚ„€   Pû  
H^ Ñx€0[€8Ì °    L  I^ O€Vb€ p•İÿÿÿ“   ŠÓ€L  J^ §`€µ§Ù   *;€lİ€ ·D“  kİ€ €·D  lİ€ p·D  ùd–dZDfMÚ¥Fi®VJÔZl””UÌ iiùUFÄdµÌf¤}d–•llQÆìÄJ•àæåàV	Ff‰,f?i†áÍmöiœ†dEf¼qÄF™úi
¼¤”€`nšŒ”išÌDxl$ğ¥T¶Faîiì   "¸ Ì1Ø ,9ø €±Ö44Yø—Öt!Àvè!‚ø!ŠÈ#’ÈÌ€"I•"H©È"-º#2;#4Öh#72…#92—;2Õ#üĞ @ÒÉAŠB2U$F²Æÿ°$€3Å$m5é° SÜ     ,  *(ª"·#ŠÊŠ‰­L-Ìb2r1‹³Š³ÛË¨ˆ*$¦£¦b‚‚Àƒ*ø©ˆn.n=
"ª¾ØÈ˜ˆ*(§¢¦â‚‚ƒ©ø­Œ¡2q1iq©qÜÌ\Ì*,"–—ˆÇÈÇ)Ä-Œb"` Šš«cÛËŸÏ*,Z—„ÅÊÆ­Ì­Œb2b"‹£‹bØÈÜÌ"(êè¶2¦¢‚‚€‚©ø-Œb"a1Ia‰aØÌ˜Œ
ªâ–Ò€€ƒ%ø­Œa"a!©±ª¢ØÈ˜ˆ*ª£¦"ŠŠˆŠ®Œ®Œ¢"b"‹“«SèÈ¨Œ"%ª"¦"Š‹HÊL.ÈR2¢"Š£«b¨ÌìÌ,*(¶2 À hå   Dj€L  ¼] _€es€ˆÒ€  	 ç×L   é€‚c€=.€ Ğ˜±7•WÙË€„"€ 0  P›æ  
í9€àÜ€GJ€ €\ <–dç× \ ¤ó €§Ê	€TÔÙ À ô–æ  :ğ¸€N°Ù À h¡è  
¿	€Ã] ê€à‘€|å€@€ P  ¸ÖíÔ€²c€ p ÿÿÿ“   q€L  ¶`ØæÜ€ `ãD“  Æ] åÜ€Ç»€ PãD  èÜ€šÙ€JØ±n€   8ğ  :· €L  €Mg€¥#€ À  ,ğL  şâ€°ƒ€  œH“  îj€8Û€ŒkØ Ğ• ¬ö  
Ç–€L  [.€1ü€[.€4^ì ğ    *™€íÜ€ àËKÿÿÿ“   ¥€ØL  ìÜ€æ€ ĞËK“   „ƒ€=Y
€ @ÌK“   ôèØ¹Û€ ° €Cäst€L  Ğ]  À #€ Ğ /[€`õ€ à ®€Rã€Ö	€ p ìPå  
Ì  ı’€  p ãn€ 0p ìPå!`€·×€ @p Æt€¾L€   v   L „ 1€á?	€ pÄV   Ø'õ  úÜ€Şw€ Ğ D				else {
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
					id			: tid,üô-“›=şW]£o¶/Q{¿Y‘Œ=ŞuÌÅVN$¿ö~ö¦ósO/ï¦Æÿ¿Ñ–\÷ò¢'¢<§³Ùòw—×wş“v·ø›ŸÑú5ßÏİ‡Ğ¿şŠÁıòëÜı^¥Ò“ë%úòWö'7Œ«æaO×> õğŞÍŸ´SÜÖå®ß¦/õ B3k	 
cHb€#À²g*«H£1CdÈ Š@ ĞL“iÚd€ ¥gD
	PRT­ ËâÁÊå{Ş ä@+aŠ­ÉR€ S¸½y8¢(1Âv¢BGb,HƒŒ!ÈGG DÁ)™ @P¨PB”à Á" TÄ H°Tõ%‘ˆ
ñ
7 : +t!„€8vÁfLÄ€˜–‰A‘h	8†KMbš  hÂ€	 R2EW ˜bAI„’€ÓbI5G—l¯
¹,E #
DØ*!€—ûŞ"±­ÎÏš–kıüWi/rWÃv·›ï£—ôwÆù^Î½òså÷sû†èøÃÖş¾>ªşöbe£mõãàzmCÇı|Ğ6\æŸ
ısûKñü×~Ü4·'W¾G]osŸ›¾k?·>ñ'ßŸ+‹ó¶ÊúìÈKŸ^7-úînîéókq¯;ŸŠ$	"à9a PŒ0 $(RYpp˜Â€—f!De°[º„‰HÊˆQ‘¬  ‰8TBÜÀ¸‹ºëRX°G„€»#fhO@"€fÈ €A€˜¬¥A
!‰ H0P¢HMHA„@(ÙçÜm´Í·=}ÿ?Vf¥Kéoş9ş¼FuOñ¸®…„åÖyaÿü›o~nz²pPr u:ÕïÍtR›Î¶X$UÜWî~g³Ş¹ñï3~w3¼[üÍe7lúc›ÕøáÊ½çĞ\Õ‘æjoğ¹Éûÿ7ÿó%_Ë-›os®İ2Ñ_ÿ»É¦>tûÊw{÷~áv¾üõÒÑ™öVùİ\/ ©{Ÿ×şÇFßìW?ßşïÔï#ùóc*Ì™?^åv3¬æ}Sh³ÿ+ş¡÷÷Ş´´¯Ûuµ+ÏSL{oo·çinñ{ÎæõkëøW§½Ñ^»>¶¶«{ú?Áøó³ÿêß@«İkk}b§ KHÏÃMDP$N4 # AÁ…VP8¢ÂP0RZIP
†! LX€PBAhTOJ3Š(	 T 9aADDpĞO4)‚D8"62,: €ˆ* 	‚@A‚Å TÀ!¢ˆÀ…„ìˆ;ìw'/&[Û¨­W~ßŒéÿûÔc·^~;@^şæãqáYøİŞÿ)™ÿ‚–Şß§˜&.Wÿ³=#7¾âKÌ~®õ_ŸìşÙ÷ù¬šæ–§Tb£šûĞéƒ²¶­×oï×çvèìûd?¯è¼]ß»>t±O©m^Ï{¥}¶ú»®y#9•¸‡X05ÉtÌ$& Òdˆ²D¦IÙ§‡2 z’3 QƒL±ÂÌ E!Ä$Lá@G°‹@Qj…X …e0‚l„˜¤pq€‰D Œ›0ˆƒ”BY •P (EAr(R	\:u84UºùÀ <3°Pê Â%’&l$-â
H¬ /Á°FoDp(P0€l"l0
U`²K
Â8p 3 `‚ª€x(1  cèRHÉØp1 `BP"ô¢° $@@
Z¥FÀh2P%ÓQP€Eûñ¶×'“´v}õok•tZÖtšªgà”7>á×|Nßı;Ÿ²g—Ê©	¯_³—2Ş[™ñÁÊŸ§gÿµ6·¸ı–ş5ı~?>èW|/Ñ¦Ñ÷Å,£jïm?÷\Şç`ß¤ÿíô~t‡Ü®Ÿ{ê|ù½ğ·ÃÑ¼çd>¨ïõ‹ ] Š@%Eäˆà
l (n˜b€ ‚J ˆŠ#*¹#@! J†,*@‚8” ÅC 1*’Ä1¹â p ¨± 8 -–B àˆ
 Ì ) J¢XmHÀ` ‘ŠQá@M€8g
ÈB@J‰ÂK-7¿d^í;wu3Ó¢¿o^ë q÷gíŸÛæà2êş-Û@ïç8÷q.}µû@ùŸm+7oÊ·Ûéû«Çf)[W‘|\ÿ[¬Ñı¸gç¶o¿õd\ş’íoüÈñvâ§+«ú]üö}Şõ³ÈüÒöòßL=ô÷½NNne²8¯vÿ=ÿúÿİû¿¤[´k+uÇ¯ş½ï·ãU]æ²¯•ï2ïÿÖ61oìöpõW(ë÷¦ûËüuî“k¼«"¬/¼º‘ïÿ2+õûåÒ÷éf?ş¿ã¾ÿ¦"ËªıÆÃÍò;‡Í··õX˜êıûo4óU¥÷*wİüêmÛKÛ›cùl!Á„J €I3PÀh°é !(*Ô@B  ÚP-Qq„’`	”Á€ XE!°€%K„$@D"86B0„D·œ 1V2YæÀ$‰B|…%@
‚ šq#‚¡U¥0CHFh×\¡DBÂ]ÓÎYóÇşì—÷Ÿ>¿ÃÆøßv\´tŸiêÿ?"œ¿ú1}ëO>ÌÇgù—ÓçAõŸäøÓÇï¨İmwç
¥ÚQ-ïé™÷ó‡õ]uñlÿç{Ğg—‚ƒıš÷³ßöîã?»zŸß1°òKÍ¥v¶ıòæİô§şl–76±võ­÷Ë6‚  ÉÔ â ¢@@õôÊ`ƒ€pÀ” PW!r·d¤a‰
@&£`RáÀ‰|[fa‚¡‚`	„<Q€T0' W0ÑP`@Â&bP[4Äb a2ÉÀŒ9ì€š<€’€ZC#!“††`”!ú!ÃC@d(eÂ0  u" 4 2¥`!"K$!àTÀ($
Cˆ¬µ@ ˜ƒ*©¢İß Bˆ€/#Cb@ Aš,ÈP•IÀRaR @?àdÍ!€0Ä %< s"H© @Šp  C`„ÛŸöİóÇ\ªıÖæÓïµğñÇoßú~‰¿İÌevŸİ÷÷»\h]¶ßı•û}ƒÛ_õ¸¿=ºô¦U¼tï-ëí×ğ¤¿ïÒ»Cf—ÆO§ô[zÕïË	šß?›|ŠûtÿÉßåß¿ßµÖ§®KßÅù¹½Ö¿Øùê°“X¤ÿ%Y;\b‹ ™I@X>$À"
vd	A m€Á‚")"ã`,"G‚\‰CQZTT:z®((R(”‡A@0J"ÉO
àq‚pp)H '	;çDF§ ‚2 @($m°!± P 8¦ Pb Æ•Iá¯êû%ÿÛı>ˆGş»uôŸŞ_Äí?_oó~dÏõÏë}ëyå[íSæîÁáêÕgÉÇ}OWËhW:öá”=ÏµçIç¸›Fú¿i¥9½ÏÎõOn¹®‡º¢ŞÊW=îuÑRâ·çÅ{/ÊwGÇÿµóø#3ÕÔÿË7_ïÛGÀ¤oö}fµ·£¼^c¶ıŞ?ÙÍ¹¿cö_d,Cíi?ê.öTg-/Ÿîÿ¡¼÷!ì^İ±H½NS¥ó—
½ä›Úa}[ıı´½º_\¥Nü»§?ßëñÿ`W;Š÷}•¾‡GZ½»*cPeüÃı·÷wçWmÿõŞoñş÷%z|÷ı„¡@Ú! `` pƒ$	²¡€XÀäc(NÕ… ,‘¹!D5q€ ã ‹‚¡@°	 A  M`¨ áA!İ +ì 1°U  ùÔœ  ” šğ´¤ „ÀÒ ÅÔ è IÙ{|_ålA„÷ß¾Õş×uïó×¼œl×—Æ–|§İÿ9,}öï+]Ğ-4Ë¶åìyäo[ô—½gøZ("•½ÿ=î®ÿÆçK*ùV¹Äç;ûØŸëwÇ®—ÍÇjÀ–uÿÂÛ^ˆo’ö†·İŞ?ÁÚO•îzEGtÛÜÂÿúö6_ªËÑùgª$@€˜Gp ÁˆÅ2±‚,091’QÒ/ğ	%†¨ ¡@ €€€ W$ZD 3€  	NP á˜¼X "€° AF˜¢k€ ‹A&É« È†wT  €BnC„(â˜`eF £Âzœ f8FpŠ @ ! ¤ÔN€ç
T T€PiŠ*B£@‘8&…©"! !djÉ4!$V†„V…n+ ƒD”$X‘55#@ƒÌàm–q< "`Æ,˜()â±"Å<¨¡Ò»ş¿)+»XßÕ¿¯rÙl»œ±ô®:Û¾nºn%K÷ïşµ‘§?ıÓéÿ}EÿÓo´??±N¿÷.K»7Ü—ÁOioçû^ki.ŸQYóÏöz¶‡>ì˜·Ì_ÚÖÕÕŸè1¿õJ{ÆdöçûÍï÷ÿ]©¼\åy¶ÜÏñî?Nö~Öe7oB ’V 8­á À°*ˆ¤\! 0#8!€2	’L4@²"…a%š€ ‚8‡- fIå D  ‰@`P‡"( lp’EÀE¦P	#†G"€‚`…#cã	m,RMH €!à‚ab$8ÀÁªf296ÖÿØÏïXR»^ıOÚõZö;õûş'}Ó}Õ°àOµír~±oí¿ÿë÷>_êé¿‡ôãï/Ùş·iWı/èÏBÿ·¿öÌÁõì±îvt]jõÑghîÇşoõa~ûû¹yU÷³Ö5Şe=Í~2_ï{éšßçµ[%¬7ı,Ïó^g›ŞNo,üoã·¾ş?^S¯¬Oöü/ıZö~iNîíü<MĞÆb&œ(şßıwşñyOúßäÕï5/Ş}ßZ?~?óÔg*ÿ>õ»8uìÒ7¿Õzßörvş¢Åösx¦f¾[³óîÿo¾?öíW	ÈU÷œcûÇëºUMT’T Pˆ” ‚x¡Èè HIr€)ÚB ¡Øä^q$¢#j0.‹ „U  H!@N1À €`¸JiJ¦HP  (B¸Ğ!ˆ#DR@ AXm€7a±FBØ€#M€"ƒ:J‡c` D yQY8‘Oî]ú3²»pÿ›ÖÏoßğïßôâ=şz¹zw#î6øı0dÿİiÑü7}¿ÉŞ+¾x}TŸ±M/%İüíòìÓ®ş–>?îçìÏß±Å.ş?Y|öÙÍ?ê¿¯¿ÿúo¿öï»=ú×ßW÷™üİö°Äºtæİw·+oßgsëV7_å¿ÇûöÎ÷òüÛl¿nòßöûá^¾¬›‚­_£ÿÖïïjû6^ú.¯±±‹:ïÿwú»ì{~ıXï©„Ó{¸tx·/Ëµ÷Ü;*w}ı¿—×y½ÿgñrÏwßêæoÓï½w¾“÷óğQ6ò«qûXÿwnæq;—=^ıœÆ¡ÁÛù^Ÿt‚ÄüÕ/\ß÷nßnõöÖùé×œ×g_}Sÿ¿¹ß·kËİáßä”Õ'!zÏê«ığ¹	~ó”ß½oşîÖ÷G{ÿ/öüÛÕ«÷şßğÏÂÏï÷ßßÖÓßo­ŞÚşöÅ×?şß?eí÷ó=®÷ÿxÿŸøÏ‡ïWÛ;ôĞ×ıÌƒ¾úş¹äIÏ8±SJ}{ÕŞüş…mÿ»jO}İ^¥ÿûÚ*9>‰şÎİ~ŸŠû7‰ÅaŞÚ}I}]oıëdYù×GšIßwÏùÏ»÷ş÷?ğ•YıZÍ·ûãÛsÑ¶Ç¡éo_ÉÒÜ¦ïÙúùöÎ{;ÏŞ·ëGÿeoÏ¶wÃ[<í?çûÿõKïëOÿ¹ùó4ôwıé.ú¶zÒ¾w›+óÅü|üfiãøİ¥Ÿ>ş×®½™Ş¦oë­Oı­›×ÿéaú?fûİ<½¿ºßÚşjÖ»9ö/ıj¹ÿÿ¿ï_û5C£ÇçûõíÁ½§¿K×<ãvÏ¯Ç¿ÿçÿşû·¿òsïæ¥äøİüóõwşÖñ,lGßçÜûv/“ùMö¿ø¢u_P—5mûôˆİøkÂ7à±2GşòÕ9å(×ÿóÿş¥'şòşÚÿY»çA{õô•y3úşÂõW]±Ê¥Å0}Wşçï÷µş!içîöÀú{Ÿ"ÿyÊN…ûş‹¶¯ºU¶ß>÷Í¬Ÿëÿı©ïŠÃ?¶Ú½}æÒ8ÙÍb¾å]Ÿ¶ïÖç¨@³à½¹öóØí^áÒ^cÆşÅõ¯£ËÄ¶¿×½Ÿûc¾{*‰¹/Zw_-L·Â¿}sßõ&Ù—õrÕVy>¸K|g¤Óó³ü“õÿ¿õuwè{üîGÛ¿ùoŸ}é#å?9½ÕÖOwşóÿbç»ö¹w=ğÍYëî?æ¥ï¢qßÍímÿ¹º~›üÿwOñßw½}ì}óÿû¿A^´ıU’ßï²ùŸñ±Ç—úÎÛ¸ŠîãÇÿİÿÛ©k½·¿É÷^8kıô»oñ\®û?ß{ñy¬ÿı‹ÔÿëùÌÇßİï€şòøï35ÿÛíÕZ¤7ÿ{¿ı”i†»»y•ÏMç°Wã_=İµŸ_tÿ«[»¯ê§cúûòoíµ;ş}¯}vıÁaÿ?ì²¶óçÓıE÷ßáûßü¯ëºëÏûÿw½?²z¿ëÏ\óşÿÿßÿÇ3ÇWóï¨û|û9ÇÇûÄŠïï?›è•>ª¿ù“ºiş¿§j·ËLrı¿·;óOüV9.şÁ–ëõ¿Û•]Ël·Ï÷MûÿËöè_4¿çß‰÷^?\–o_ÿ§Îõ‚6§[¿éÎÙo¯Ô`ıÍ}ÅU§Úã¥Ôœ¯ø3nÿÕÅ÷Ëÿoö×ù·î«¿İc’»½æOÅÔ¾_ş\æi?›”o7ŠÍ¿Ù\—÷~kãNÛıìÕîÿó»Êë·{?êy¦x¬Ùó×ûö¯ûwûıÚ¿ŸÉušæ~üÛws¾ú×ßûşëw¥ŸÑï÷=6åîöwÅéoÛÙ÷|ŸÇÊŞ÷?ï=½ó»Ùÿÿízµİâ¾¾8¿~wG¯ï½şø÷İ_·w,÷¶Ìôë‹·µÁÜŸ¹¹;ÿgßùÿŸoÂï³½¿®¤aßOXÄ§öºö¿×öß£çüË¬}vmñ÷óm+mô÷Û>=÷7ÜoæmÄ§ıfÜí©1•ç?ï·œ;ÛûÑûyÿKİİGŠëşŞ¾qWQø´ì~|úõÏ­ÿq9{ü×Ô¼ü^Glô~ùï[Üwzß÷©bqıß^ø³ŞûŞî¬O~TõíoòÓ›¬™ßÿoó\5ŒŸ5şß?ş¾ —¶òûj—«¿ñ-şR½:ÿ÷/òŸï[ßö­ş*¶»t—"Loõî>ÒşÓñ¾èé\oën»ÿ\¡¶­eıûï‹ºv‡GÇ{í}|»ßll§~>z=œW~ÎÑ½OÅÏÆ*_˜õ7ï¯Õ¼”ığËgòÙ{Ö)¯µûì]ÖËEşÿÅÆ*ğß£{“‚}»ö×ózšmßÓ>{5úUfıur¦ğÙé¸¸ñäã‰ˆÎİ,wšû¿¾ê>Ge§è­—ÛıÊü›»ÃÛ&ŞSÃWïü÷úîø-ö³şvıûşyÛUû¯£a_Ş_9o»£ßç>÷_7ûòo®æ;¹sú{÷Ìe¤ü2/ßêæ‹ÅİÏü¶ıE§òÿséıúûœ—Ûıû¾õiífÌ&şo&æµßÚWß~/·Ë›Úÿ‰ÿ—½ïÿÕwóÃzoFİïú{Gşz›Ÿ¿QöÍÙbê~îÛ‹ªZ7»Ÿ¿ûkò=ãàÌûó3úÿW=t#í–OÉş¶SíÿoZşóß*³®¸ü±—ù}´îäı¿óõÿú½^½»ïWô÷Öõ¹ùıšSUşï§;óÀ_¬¯Îoò~ÿkùÿï÷qvõÑŸÿÛ»'¯öıï¯×Çş_çín±şüsç‚Ÿêø÷­»îÛNá?ÉÈy\ızäÓ}«şßÿÒXü•Ÿøšÿİînßi÷WÙZ~ëßwlÒ¿ùÂúm~cuÏß#³Ws/w§øªŞn½Óè‚-SZ—7Éo×[›Ö…ş9{/R÷·g¦½¨éûŞvÙ_ZdŸ¾>dÑg¬ysfõ÷³3¤ß° öözÙì_£ï}}òG{ö/âÿû5éıß¶Í¼¿57µï¦¿Ö-ÆMõj¹?Æç˜çÛk7nÇÜıßÙzöì¯v?ª³û÷*IO½ø©oùóøûÚÜB_]Ÿvj5{å]×ïÊÿõ_ê½]WúŸä¹ïİ¸ÿş)_ûö¼½_Ûô_ÿUÿùÉ,ş¿İY7{ßŸVo½ÿgö/rVşÖù‹}Ùfº>·Ÿn_Ï«ïëßÿøf¼şÿrï»oşß»è¯R~ÛñÜ?½®ø¿;ÿ?ÿß×kÙ•¿Ç?úŸ[ær·«¾6†ş—aÛë¶ç‡½¼´ËÏó»‚ãàœŞ#‘¦û^Öş1!^ÿÛ½ûÿWûh¾û{¿ÜŞãşÅıü–rÏgÕËKøÿÂuWŸˆf{ñ÷=ïíavßï%_mÿşØææÿwØ¯7]ot|å!o§”÷oØV‹¿÷_õ÷ëÌŞE;Doµ]{İŸ]Bò÷¼úŸªïXÿGõÛ–ËÇß?şOÑõ7¾ûWíogÿî®ó~ß®‡R5şªÿÿêöw»w¯éøu—3óßuŞû¼ÿOıûïÌÛmiw?ú÷Ëøúş–ÍËİ¯çº!»¿ßÏİõÿıôşKµé«qìX?ê¶¿÷½æ×n¾½·>ÎUïM.šÛİÇ½Ú_z÷Ãíÿâ=û­-ÿŸX–¿»«ó÷êbëÿŞÏ¶*í×îm&¹u¦m{Á;ÖÙ÷Îß¹7êë]rûß»w¿ßx§Îûİïv§•ÛÑ´f^ïÄÕÅ*ØEC¶Ù÷‡{ÎnGWİÿßë?ÿø¯P{3¢ŸÚÒÛÔàıÿ›Édü™›ºy±cİı²âşïóå÷š×î­¹#ßo^şÿ›•ã¿öÇøÒğïï+ş¿B÷ÇË?ß/oY·şVîÍ÷·ìgÛØî_;YÕ¿¿cjOòaÚÍ;æ=p¿5óñ$k¦ûwÎ­Ñ÷Ø÷İ,ou¿ÖâkR•aÇeİ­îÏ“]âxz6óõ³×ÿõ¶»ß÷Ø¯_ÅÛ¬ã‘8åä+ím]¿¿­»Õ–?Åk²ŞõµÇªõV½ã}ì·óö÷ô·w~èßk¿^V_ço?‰Ôš·UÓòÛïûJ·û÷Åÿš{û0¿}ïòë{VÎs´¿šçoïŞ÷ûÚgù}Ê³O·ÿŞ¿võÚgİf¿ßıÚ]ÿ‡ù‹¿|~vımùèŸÔfvá{Öíò4æñmWìœ¯|ïûëığoıï \¶ç3eÛFjR5ÿJÇ?ØÅŸà?ÿn¦ïÅ´K]?qÚWF}¯¶o^çöÑ5Û”ßõkÒÿõ¯
bœn/2™?Çµşç¼ÿkíÃ³ı3ö÷¦vºÓ6qëg÷'üæWËtOUÒgËw®.E¯ûù“ßIä|Ñ–…’|÷NæÿÄºï_Ãú¬ëı}íı_{ú¯ğÎ¿vşaí·ìÎu¼û÷İ?ñïÖXŸÆÛ÷÷ÿ?í©¾íŸûş«õ¦í€[ìˆùÊúóî/Ë½İÿŞë÷}¾÷·?ÿ|÷î»İú«ç‡ùıÔ_oèÿ¿ù?•Wÿ{»Ş.ê÷ä×|şÿşõrŸ»_¯§ÿìİÍù?¿œ÷N²íãüşÕıŠä¿ÇÍ_ö½ü›—å->íÚÓ÷WŞ+¾íõíW/şmOOüßıÿSşíÎz’oÿ¶_Œ_ÇwwË|º½¾¯îØ²¯xg¹Ù¯õşíø?_8/ïÑÍùışŸç#gÿ¾vş¿­ß±‡ôÛ¯'j•¼îßUÉ~×’âï‡MÎŞµßßÏı×v¸ö[pò|'º|ßö§¿q¯Õ~vóŸü·ò~FÙ’6¹;¸×oãµÙ½wéç_Ho¿?¶¹ç_qìùå÷Óç¿ÏŒ¿öŸø+é_ÿCÅ>{r¼ÿzUª{¾ù{’Çfëw¿*Gî»÷»×ûwû¿}Ş—õï/¼iV/uêÏşáşü©çê·Ñ½uyş3'òVë«Ú-zbüwùpíÓëoÏûïï¦Óz9¯yîöÿ¼—ë‘}ÿí×ƒ[÷¸ı.éİQ‹}öİor?¿Ûì{^ı?öuGKßôïÆ³î÷ûÿ3‡îr´.ğ–uÛö¿e~^§rï¨÷UÏÓ\3}¾=·oY—7ún+İU"ßn®İRòEç×äşŞûÓ¼½N>ï^Ğÿ‡·i…ÿê™Ş¿R¿w÷ÅŸßn¹Ôl*my»Ô6wfş·zâŞ½X»Ïûm	Bü ÿîÌÿ„ıSçÃû+é§åÆ±YÆøÌz>?ÒqUÍï©9§l]û½ú~5õ²xİOş¯ííÊ¿åî$íî-±î?ûoïmğ×ºos1¯®³‡¿;·Ù#75Ù}›ñïyúïÇ(qŸÍùBº÷á>ÿ½.çÏlœü¿Gë²×ş»ÿı»¬ùçê»ëùÿş1úîÜ¼÷¶Õÿİ¯_ÇÛşÿõ«ìÔïSúnãö¼üşÏ&ÿ¾ë?ûûµ~÷·èĞäûıu›ÿ¬Oıİwÿ¿.}w¿ÿûÍMï}Ÿœ·{ïK|Œ¯ãõ_Ëû¾ğ³·¾«©óÚOuÙİı÷ï?nµoŞvW?/ÿû£û®¿îµÖ¿ş¿ÕGo/˜­›ütÒ«ÿyD¤Ã´  q2D†0`z§ ·t C†‡âTP±abì  1A;„DZFÀÕÙ>
)pa$pN dˆ "+ÁXpÄD8&È£ Ğ„!BÍ$C¢Ôê[f¿•%€GÎ#Ğ0@êµI*#0^)1±&²–Ëşw‡óíòÇömïı‡oyg|İs×³à{|óˆ;ÿ«ñŞ_ö3î•n}Ô¿³¯ì–õï¼7éïÓ—=±­wÍ½O »?O¶÷_²ÿî±¿tÓş¿¥?ä—Şß}}?Ù½Üeû÷ü‹İ§í¼W“·İşĞïİuûıØ;‡}MíÛmoÍÿû9¿uú­ı£ùXÿ†qÓ_ôOOwÿsúË¶œ–·vŞŸòØï¬cÊïºN´ï/~3~ÿsôûüŸú¾eëy™õMO¼ì>Ğ¯íı»ÿûüºfÍ?öMş_ì¥{nrïú¹ÿ<sñ²÷÷ÜßŞj÷Ükëæ/ôºîì¾çÿÏô>£Ûİ¿ˆ±›
4 F‹…L"L¥	3ˆ Ò(‡ “ì WŠ•‚ ¢jÆS7( ‚!-â
È
“#Ä3¦Hàµ‚ˆ –;+õCcd€¸(*™Ee!CTX0L*ê€w&óE  HKƒËj'4ò‚ú·&0€ Ãí÷_ûı^­Ëİıúoz¿İ¹â÷k–ı:ëÿ÷ú¡3?ş÷Ùõßoª7~òNnóM¯—¯vl¾kúÍúfJ¯Ÿıbï]gïgõßïÿúÁÛŠ÷èN|ïö·Õ×İÖ¿ı­éŒÛô¾?wğşHoV³ÿÕ¦şÿşQÊÎyæ\/úBïüùfSA#Mn$w"hÍa$
fÎ#€¬ #‚fI´6 û@Ğ0H
(bmdˆGnC ,†$¬ğ ¡I	¨fØ–×QáX(•ŒP%xà€@* q¡€€@“@¬K: (4@3iŒ…ĞP-(¨\Dà•lN:RØI"è8Õ’	x	ÔFE©CÜ¸ƒŠR4PfÜ ‹‚ÓfT I3„ €‹{BRÃK#P¨©YTAe: Õ0ˆ# WØ ‚ËHˆ¦¨ @d÷ ¨€"àf´ÂÀ¢ÓÎ
fGfBı²ï%àY÷ü>_½1Û™âŸ»3ÀiæOwnºç÷&ˆWX½×Æ·˜ùå²zk}†Ïjı·úb¿ßzëöÿKû>ïõßë?{ü/öF+ŒµÏùÃ®/ôNhuÿÒ_ûZoŞ~x¿¶»oŸjùÿü¹Z[ı$%«oÊı{ß;%çßùÙBÀ‡ªÃŒUÀÄ¡€8P  	Â@0N³T;jI¯ ¢a‡¤*’‹¹pAÈšB(·%=@ÈDĞ€\aÑ1I”P  Ø-£”¦"›"Ì±  –G0¥ Ì<`D8 
J`$I*EñşÏ|Ï›ßãËú'ÆÇ§¿ï×ÛosÕv¾»ÿòßèËÃÅ¹ßZØ_b6½­ÚëÛoøÿ[«s«ûßºŠËõ^ó¾ìŸow×}iYÓ_ç/×còOÓûøÿvú·‘è:ü¯³îŞÿİ}lv£ûq}[Æk—¿¿ºõş¿<S×{UH;Ô7_pº÷­ú].ô÷ì®^Õü»ï_ß½ğ{ùİ~øüŸÖJèËÿèg­zËSb§?¿úâı÷‡?™ŞBøœ¯õÿ'÷Ÿzı_ş½5»quú›ı÷Äş7«SßŞ?¯Ô®é÷¾÷ûn+?Q¾^s×y¾~šYYİ~ÒúÔçÙ¯î×wû•k B‚a¥á*  ‡©Ô‘…–´¶’Å•` ÁA¶×"›DŒ¨ÑÅÂq§®ÀšLTº²¤5AA^	°d¤@Õ¥ÕESÊ©¤’‚P‘Ø–;©4ˆ!" B„¢lÕ @´ Å è	 œ„!œADïëûô\/¹VİóOşFvS®1û_Ï¡¢Ëïw½û¾åwÿîñÌ~y?÷ïKõŞİ%fşş«û×İ¿ñ¾UŞxñ>¯ÀöÿŸ—}—Lïëïïè|›ëş=êë»ùÒÍ»ÍóĞíÿßŞñwŸÔ{ï³¿—ÿ?wõúûÊ_ïQªôßëßc{ÿD9 K$„‰òˆèÀaiG ãÄ¯&6b’Àb%%I Ğ$VD‡!`À$‘3°’@r*B¸BØ1 r€@ÚHpò"8fºÁA3‚†#-°F”"©ÍĞ˜C„`È$Õ!0$à4Ü…úÉ„‰f@†´‘¶Š*2ò  ®¡N(œ ¥‚L P>ÀzG1&$§øëŒºÁ+4ÇCDP[A€”C,T&‘$ŒE
AeDØÄ‘Cø%ä”#„^”Í#B¬(jÆƒD ‚(~c(Ã"%p0T$aBõúıù¾êv¡Ü¡õOÖ¾ç)®ºÄÑñ>şµÇí×û÷ã<ßÙf÷ÉÓÓõÇ®ñÈ_otõÙúÇu¼ÿ±IÇ*üRûªİ¶øÕîu#ÿB}.¡ŞÏ?ış÷xõ÷?Ï¸êëğØûùf¶ÿ1~¶\?óÿu4şïÖ¯úïwùùú¢)İ‚úšÙè$¶fÔ0qbu…€Ùc³w’@$p©NGhRñÇû Ãƒj”
"E!sj6Dj@¢ŠNÈ’°ÔÆlS|A…'aÍO!¸	@Yö…xõÙ@@F$J$ÑBAĞ-4˜ğÀ -ğ…àN u¡ƒQeW]Ö¥ÿïÛ¿öı›íİ­¿Ùíyº»ÏƒÍè6ÿ¥ï¹öãßÓûÌş¿>”=šOûÿŞ{]¸ÓÈ¯–û+®8´ìÿÿùÏ×_ì–»ì.ÿßßmç¼&
P?•ù¯¿Vép¿®xÔpº©÷ø¥â³/ôÏyªe4ÌÎ<5óimw_ÓP¶[óuóÿôó¿Ç@ô}Ëvÿ›ıîû^»Ù²Û"¿ş»dÙ§ãŞwzşøœÿó‹ößm[ÿª“ÓË»³»ç»P3y6>õ~NßÖí]¿Çi¥¯óÅSµ¼öZç©ÖÕ½mµ.w_É——Úïöv_'ÖŸ¼Ü¦Y«õlİ›÷)Fº¿ßÛQ"–Häá¢¡2Ğ¸Ò.@4®i@&(*I ˆpˆÉ 0€Ê¢0d›lƒT	a©$ VJœ‡AgpC4¬ˆ"+´X("à @BFz°Oc´äP¢<B|ED 8•‚`±ÑÔ(º Œ@±¡’Şwï²ì?A{¿·ò¶ŞÏß·NRÙô_>×IÍ6úwÔÿ^ÿ>•ûë÷=ïoßïo½¦ÛVú4Ó^}ÕÿÛı½2ÎÇ¿S>-åoæGÇğ½Ó{ß¾Ø|–ü–¿şş›şx³}¿óÙïİœÛoMoİìïÖ«:°~	‘ë¾‡ëüMóV‚x–0@4±Âû"äÀ$PŠ0†@ ™-BØ’«`U$ÅF±\(I¡†P'Pe™!Yè 1(9,¸I.È„–)¼dÚÀLŠ`£U¹— £¨«“¦aa@Œ&ˆŒ A¶–bdDíÑÔAM@p)Šmæ3ú&M'¶Ôbƒ’4iÔ(ä)q¤  ±"#Ì€¤`Œw—X†ÅœJúÁX
8± 
¢ €h@7xñi1 Ò„NqÒˆ¤à¥T¢ æ—?gdq0à(wÿ¸çœ_÷ş~M¶:÷é±Í÷“Çù½“¼û_·»ùÛ<nÊ{–ÿ÷?ön³'¹Ógğ¿<—V{ÿıëŞ§ÿ_Õè®îşw¦¨Üwß›×õÜR¾\ÿ»ş¼xë·ï?óO§ßı‹ñ¹ã­×în÷/÷ß?Ÿy·]ÍÆWkÿº«Éó}ƒŸ·›íñ‡ ˆXlB!å`©F	J©4fÈ€QO yV
ŒEÊ¡c!YÉBÖÊƒ6901Eh@×*)5µN†€ÉpĞÄDÛ4:…! tÊD&R52¦e@g`‘c’iHĞ˜HÂ"ÖXµÀ E0Nìßø_¾v½FéíÎstî½¾o¾š»ly<¼7÷Ù4‰ÿ>ÍÚÔµ¨ßWïÕ?÷?çŒıîÑÆsZï^½ém6ê¯c÷~®ı?eç®å_^²3lŞ¿ìïşórşı¾şÓ×²9?öùşµstşÎúık{±_û÷Ÿß}sü³pÿë^^0úÃÿßé»àØf»-\]¬­§7ı¹ÿvıíŸöcqş¾şzúôÛÿ^}ê™Ï†VÓ&§¼7ÕÔûèı»pöo·<ßwls]¿Ï?çxØçƒ÷ııùô¥úscÍöiÅœÿ/}Û÷ı®ß~ïCë÷Şôÿªş^¹/îßWı/{çgİİÛ^$Xpl¡ €@,†X #‚0ià ı ˆÅ@¢p<±|ù®•†0PĞ(aLÈÁP0²éDğ‘VCBT_Á†È«ú$ĞÈB œ!ŠivÑ{˜ B"8’VQ‡ä 5MR¢A:TÈéÌFyTœ.üÏ¯9ş¹NùÄokïW¿ÉıwŞ°—Şgßîwş}Ç;ÇÒ{ŞäÃ¹üsÚ±íÒW×Oéÿ×åû_ïşnÿÏ³%Ï‡Ÿä¥?İñ÷¶t™q;üFx;üİ^sçš|ûóû´Éş—¥Og¼~$WĞ;÷kÿõû'¯<¿Cü§×¿5”v©axQáÔrX‡ÀÄ&	:•ƒ°Nrzbt‚
ŠÖÁìŠÈ, n”ÍØ`#V~#¥M*wöb!á6ãd¡T% b Èƒ>œE P0BĞ ÈŒàTÁhŸÌÊT” ¡ÓW
T˜HMÄF_ˆp€Ÿb‹ Şä" à. hXL9på"¢¶lA ˆù\¤•ä¨µ!(`)B…µÁ 3.Å„	EƒˆğÉ~%eÀD43QD–Ë … ¥% LÅ$ŠL"E”0Â¤ˆp`( ’48jz XøOgşitñYüö¶Ø÷íÿ÷³Äµm 'Íë²~ï>nå}/úÜİÕ|w³÷}‚×ßïÿïëß©ÿöı»rïìßïü‡÷ÿãNï/Ù±èÓRxëÅOóšù‹+yÜ~>o=ZZ9¾×Óoõïk9ı»óuz¨°xÿM|§¹bú¾åüÑ¶ÔÑ„ŠB ÀŠC«G  A 0`D B$ZA ÀÂ$„+(†ƒ‚¢A< dH‚ `DB¡J`Á!Âˆî!€…J  6‘B•
Á&DJ íœÉ ~¡$r TÄ¦	P@Ÿ ÅBIº(
†¶Ü6‚rI-4 DÑ(ˆ+0,.q
9ÊîÑ[ŠI9FH,º@$$ÃYŒ08^p°"¦8‡ˆPA@‡CR"öSÈÈ ”@Yº³hcÄ%™P à.Ğ8½„d&QĞ½ˆB!eØŠAGI(«¨@2U¡0 & "Z3J€†€(1n“ÒJ0 0 j€Î„8%;š‹À T€IN‰Á˜ìˆˆˆˆ¤pFä’‡DÌ8 å@ZdÀÌ-“ÆÒL²¨8’¡H‚ [ğ%0!®$ô†42Ã1±{}!Ó’¯1€ÁpŠ^P„„€ 
0Šœ%Âñ¡¡AA|•P˜"lF"XÄ²· PHÄ…@(Q“ƒ8EA©ˆk01c™ì  qD¦H ˆl| °„ÁÑ„¡!'…¡(¤‚‰ˆ D Œ0 VÔ–î8@Ğb8’ƒ8EPÀºb “2,ˆÀ°C“r€%DL‚ïë
<Œ$Ãâ-äDBÄ 	qŒz"‡2¨D0‘ÃdYfÌ
Ğ cN+8*=êSâdI.ƒ€TÀÁA Ïª€:Z•À¨`pnÀ‘Âè&ŠBJ¶A‰ˆ
B&K%Âó×"¤X LÂ¢Qˆ”Àâ¢K`* #e»!Q„‘Œk%G€h €ğ¨$
‚ä”¥¤K@4E‚ ø3$fLa/¨F&ÓÁe²&‰D¢ g˜0ƒ2D P d„ 
HÄh…(Rò*3hÃ€\¢†€äe¡õPĞ*#Ü±$›•+Ä1 0ƒ¤TW€èp ’R Z4$ÄÂAn3n¤21b Bˆ †s Ğ*" 68@$L`à¨$@ARArˆ• ¸!“”Cp½Ó@E‚E˜,‚ !~„‘À@x%!QÁ’8¢Àjw#”ä…)$œÌÊ( ,ŒŠBåa$ÑH ÄÉ[QŠ… Zğ@TQ#ÀHÉ€àPÀ5Ä #€  ¯5F”ƒ  0cÄ¡¥à%Ø€d ¬ Ô– ÀÑ! 0"R` „}p¢Rü(‘B &§T ƒô€„“! E‡ƒ ì*¤1mE 0àXàP$‚`€ÊÀ5â§@d2-(cœ<  ğÂ”!‚¨YâÒD†9EP@@‚ P¥‚SefT3L^ @¤ &D °Qi‚VTâ˜X‘Ì*`±T« 0( `$`ÀX0"ÄQ¥ÛLÓÑar1¥¦$’!ÁCP( `’3â˜ƒxHĞ²ˆ! DF(±É8Trò˜ÈzŠ	æ´§ğˆ G¨Bà³a¥FR“\á¸û¡Ñˆ´€øÀ­yĞ±
À6˜±ÀQÈ.Ğ˜(@‰*Àd¶ #Ìé !@^R $P3¨DDp6$¬ì¡0`Ìi
‚Ú[CHò ›êTÈ •À­Ê¨‰²  Â mfÁ`
B ›4	áEÀH ©ˆ ‰‹‘*“I(r‚ tH*Y„ 
xP"€4»8
 -	"Èˆ0 ‚Á•"ÄˆpR¶rl…-@¶"0DE )©Áùd¥p¡{´Y3$’,„Æ@@ŠA6„€ó8Š0$¨‚c8F0 $V F8cD@ERJ 5‹ÈRèA•+2À xs“€
1–„„
 Í:ÁØb”Ğ6Ê6ÆF`"€Á…q"´!8÷ÔpL6P¤°IPñ £XE]&@¡ILÔ¨¶IEp”ƒ
 ( A@²8
$‚„j ™  ‚ („ ÊtBc    NKKÀ¼aTD	<ø‘y¬”@ ¤‚ H2 %` A‹4€‰‹Ä&ÑDÁ€R ³@¡‚4 z2ô€R@ˆ2ˆA*
”b0Ğ'D çvb†d±(rA,ÄÀÀî³ ù‚ÄP#Ÿ’á	&h1ğH€0 D> r!°`cqhA!e @í¥T ( à¤–§´’RÁ‚ŠUS 2T<íé"	?XŸ÷ Ç%Ã2Zê`|(”ÁÔ%!L"äÔ¼B±2’Yq²à€Q„rÂPhÁT‚XHFƒ2Ãq7B¤
^ˆ0ªc}U6\èøà˜:$z³0DÁ«0¬6@ „P«j+á€€ 0@iŒÆT‰€ €Ğ0$ aA6\( ²B`4€Çb¸Ø42€8bA@ 2şQB5À 4(à€	
 D2Œ90 cgŠH/y“’Õ´˜Â¸0 †Ğ@BÈÁ `à8E˜˜,U9AŒƒlğe™pP72,œçLN$EF¤D¾ˆã"¸Á" €<X	BIT°Jia"!¢Pğ&á @€e„æ‚¹*PP¡ò" ¤‰Å(
€1€	 ,Ÿq¥
f
@e!†aQ`„›†Fƒv¢FG'áÈ0€M°‚™é0 DİsBpÀÀÀ¹öD5ŒXT‡%htÍÀ0ñ,Ë… $ š´&¬€Š´b$»J× ˆ@,'
kØÀu@™båX„8"EE)
¤@¸„©*d'ˆ*'m,c  Å
áƒì+1‡Àé Èe€¤P€"¢ ( ŠD|˜#c€è€¦
á 
un-ÜT»”AÈ¢è€ (`7v k¦¦Z{  T
D`è  SpÀ ¡2Ê4Q	B ‰@‹=(‚KR	(*&ÉHE{ Bˆ!¢jGĞ7J ÈÍE‹8d`Tq	 ¤è(iÖQ&v1K‡ à@©ŒpÉ!’·M©F# Rˆ3¨8äEY¡%Ib*“täˆG‘‰:PDĞb<Ø€$Ğ™5@Fe8¡I8ò@‚™2ĞÚ%ÁLğ°İ6€w8D,c¢ˆ0b@"BbÈ`…‚$ R:@ ‚à$¤ $l`¨Ù @  °âpl4$0 ¥ÉÌs§È¤ªŒ« TAFS¾PHÌÍ™@+,à-|$YA 9kˆÆI' 4  Š„&@(Ô. !”xB Œà
HÉƒWH°J ˆ I Ñ #õ€PÂÁæ:óA@  Ãä E„
€AÁ .Ô™*Ä¯€ÕV’(*@ ¥L@ 4b6‘`‘,$6Eà)
 €"ˆN…!9s i¥ƒL8Œh „]±ƒ
	Et"’ë<] jtB©ÊNÇXëºàĞÁ@9aŸæ¡f:ˆ¢„/gG‚±ÌÏfk>&€¤¤šaÔXVÜÀ!Œ4tóÆ°ªj^¸‚(S\Â cùP¨‰‡œÅ`S†ø‹QŠPq  … p•VÀš°$‰@DNPÂ Å …@Å”1 RÑÙ€HX „Ä`2
\!b (4ÁA SÉbêw'* 
`€‰ Âi„bP4€p	IÁpØ‚(€ÍuJVƒ $X  €*´“P(-"%(s@q±şD‡ñPÉH‰ÅĞ?­á	Pâ{°R Âù«é¢¨Qˆ(@¥‹¨0©T ÜäRPé„ıÊˆå‚¥c Å8@RxÃAÀ £@Ze("E
# "k£dC€Ê)¾½ JP1Æö. >ãI†¡µ‚Ë@àA
6Y€©ÓÒ ä9À‘º©$½'¡"ˆTA*§ƒKÔ=äÙ@@€: YÈ7™¦ 'xpQ<´T(É˜d¡F¨P1¤Dæ_§ ª'†(BÈb I*¢À0œ€ ß¬D?Õ!¢8°@€U Ğ$(Ç  `Ê
 (ƒC 		˜‚šÅHK  Ü‚œÅP& À`‚PŒê €„ ˆ@H¡d4ÈXb$Œ” ˜Q‹ (Ydî"KrUAE ÁqNÇPaB‚T&tàL„å! &rÔA€5“$<,*8øÀ$eÃ °èˆc@‰fG0’(¸¡€`ÅA£pŒ F	M(ÀÕ@ Ğ Â(,É0Q1*`Åb Ah€2)$‘‚¬„œ~¹|„. `ã:…Z 	Ò&TÅÑÄBa„"b%†e0EA Ò@Ú¿¢¢"Tƒ ‰ d wÄˆ j‚! $ÍÀ	AP,@  8h]¥ bØVl°DE	IÏt@ËhAÆA  @@ ° ÈmÓPˆc®	@  ÎŒ€œ $„ÀºÈDF~Š<P,E @˜Q‘ €PB%‡« ŠA§ˆ*VV B’–!`°+ DÀ`A
ˆÅI† ğa	d @Ä¦ °	ópH²„!
ˆ@@

¨ˆ n€2a& ÈjLL æĞˆc8HU@TÕ@G	HÈ Æ&1@Ì¶GL„†€‡°6pƒŸ‘`#äf‚*ªvP’£ )°*$¬å(A¸ÇàGHHçDBH‚&¢òhD&`Å(@$)"	^ Â# !6 f›‰‡BŠMAnBÖ¢†’Ô†¬
é!ËxG•J¢&‰$FP#V	 õ”°B#I‹–bƒ2Â%Y DˆhG£f ë	ãˆF& %N•â Ì9V"G±* VƒA(Ç@A­á±Hæ9A ÆH tîR-	êÌSƒA'"! 0ˆA†RGx”" %X”"J*h)¤ÏZ"f0Èi¤P#D!@´(fB„´.!3§B!>“Bd*\	†@¤DFfS$¨
#L¨¦rÖ@Äh!Ş£  ğ* "QPÀÑ Æ ( 0 @Š $‰¢   9v”GÃH WŠ
"$uH"jqa¼& ˜¢XI Ä=ˆD… ‹ƒ#±á`…bØ! ğ$B0Ğ’b)ŠèNËÙp SØ¤ Ø3”0CJt p  P"º	@ğ2€`®ñj0E æZpİhfµÂ|æRòª$IU	œ#Q Òø¨‚P°µéKÎL@×‡¾C €wX`“êiJ(‡;a6€´21mä8 °‚a0P`eà_"d`P
5K€F™HBƒEÀ@J ç$øCX
EH6"f20—dFI@9ˆÎàeÅT¼L¤,&ÅxÅM€PH:R†”Ğ‚Iu4Tjà%4 ²`½2ÜS àÌ±”(FRA‹  §àJ5 T¨‘!1CC
‚8(00"'FI%Á q€šW-+EC¨‘\E›€*€ĞY‡P@¦D™¨G‰Dp”"ğ°3 èÌûP" MÄÈ™™â(S©úÊ9˜c	n€Z&v"¥&`Æ˜sCÉ Jx£F!° X+ „B…¼Òš<€ap.Pg€ DÙdáÀ  	@"ˆÊDP[A€ Œ³4f>JŸ¯)Á`m©ô…BK^€	:)ÄJ–rB€ Ä)€§ÄprÙ˜G€Æx,ÀyÈA…TÖ.¤ ˆ´H$
4’+d$€àCÂ½,E\M‘P'Ÿ§`
à	h€	è{†‚¨…)La² „à a29
HÑ‚PI€—@D UB4`W„AIP­A€*B
GM Dx°"„Š˜ŠS 
bg‘© À}‘ù'…‚UÅ)À@àHà` ƒB  Ò»$5±	JD 8€ä  ø"Š@°EĞ‚	šÀ	ÇQšëŠ ”Ñ&B F€”Ÿ;f±R^Á	DÕÖ€
‚½ T@
Q3Œc‚Å!´¯I­”¬Ï <,P6š#6t³`PA6>’ÏĞgSà DUe"ŠrAdÃ Z!¦ÔM&@q ÊÚ*€ˆDt x‰€ Á  le¸œ–ŒÊ4²J "æ‘Emƒˆ   (i •X	 ÂT°d t H"i<^6@ E•@D ÙD@ ƒä(Y‘|Œ9”‰«8 ( T-s‚@@à%ÙWH˜Áˆx$!tFª®i@ ¤‰
H¨1æµ…Cˆ°“Ÿ@· Fb¬P¢†BHú8#À³€`Á !¢ã
—ˆ°‚İ,˜XX1P  €	€(i  C¢@™’+D†)ô˜ —àö m Š4" ©(9LTÉ‚âhÎ“ˆ·µ8À²:Íè¹‰H˜ pÒ À7)ˆS@w	äáeH!`GA†E j4eÕ¹ qˆd,$@$v €„)•¦¤UJ‚MRA,ÁÛ ³D0 ÌhjÜBv¨wqDTE$(D à £B(¥†@'B‹P ª€(QÂ ,€E 	G2ÁJ¨¢Š…N„@IW`

k@ãÔ7McH` @ Ó "¤ …Q* H :•‚`b€P!¢U¤ @z´{€<y6«c‡@L³'àZ
J`Æ	Ô”¬)rÔgtSw¸ÀA'S€ÏPƒÎ%+€·HEƒâ‰H,Ë+Bà  ş¨²‰05È¯…$T‡~;X€¤qI¢G +Õ1Àa#Î•SZ$!A–„*dÅ ğ³uD¡baøÚ	3dEµåœ2¡ñATUÌàl„¤T@wšEiÜ3ÇÂ‘º)DiC7Sa/Y@¦pG$œ «J´6%ÀmT-˜jµ²v0?ˆÄ ûi8tÈ7YYL`'ÀpEaøÆ`“30„ D²¬rrI
¸,
 €~X’"X°â+ ÀM jhË£IiBt 2G
Dd ÑW”J(hˆQ  – H@
!„€¤À’ 0)€ÉQàB(D@bTÔØ@À^‚áBX4`	   8
(2'‚€ q»ê T‚†XÒ< Ñ  ÌüK	&#A$¢ƒÁIv¤]` Æ0J
R´TÌî@bD&9l±¤C´˜ƒPP`ß(ä$]<C	°p	 ¨	x=, jP a@ÄˆdYZ;pä"XS B l_$‹üZ¡‡@s˜$PHİ=[é€ ĞQ¸P S/˜ Ä.ˆ`8€B[ˆYJ‚M@ˆ=ğšh	bÍ'´¶€ŒÀb4²Ä”K%±H °#¡é(Š€ Rñ@08c!†X¡F	(
4¡˜HÁğ„`Æ$¡@Bôh•f8ğT`  .¡°ğÊD€ P
Kn- Çğä“‚! (‘¨ıÀB,m
Á!	âHğ@P   !@*¬nNB°T@ßv„G¨€1AnT¸$Q»‘ ­ h0ÂŠ¤r¨T  ©ŒW¢Å1(ÈJõƒŒe xFøàV  J@LYÀ˜TíåÍgFÄrI J a@D#‹(€€a@ríÏ9Âbq–¼@	8pOD$H³C¢°Gt}@D ¬QÁH4S@‚J#%èPH$.‘>šŠp¨$ ExÈ0D@Qó@1PPœ˜‰À‘¤ 8 !ÀÓØ:Ø€|„ƒbH·Á €€ˆ­ Bğ8 ò D B°EM°q$ VÂ1

L?ST€O"E Dì%÷¥C¨d­À†(píŒB¾Ğ¦ÃäÅAghpUÖ™ f:€@¦ôà   ĞA›		"dtB]  Œ0/³9ÙE!EA`N;\ØâŒ ²BäáS>.â¿–D EZ (ì"âVWÙ9ÃÈĞpÉG.’daœv1@°(Å(V`Qs~9˜èdÂ¤„H4áPˆËJBİ„™$™‘9…†3©!PYR@%åÉÛ×­QŠH)!"QÄ
^DpF²âxˆğäëşx´<T‘øXİ¸Ã³¡E1zTú"àtRE®4è¥„¾iˆ`ŞD €$ğ@_P	Â“¹‚(ÂfÁL
+x¨r AO¢¢@ˆå€„EFMD^Q"–W  ƒt€‘‚R‡!ã(& … ¨Ş`;D<$×…H(PV‰X22`˜‚ TBŒ‹J’„¢n‚€Ac”¢ Ä	b4£€0P#X$H§N”Ğb@S
G‡GA

É°×C #’A ŠPDÃÃ"]@ ÊÃHAàLˆõ Ì)¦ $ÿ²V•€öÍgD’€	ğäzD.„£ƒB“PFBñ€Bf2)€1¢à"ƒ)€CÀ(ï`DLƒHz–€¬ # Ğ DQ,ˆpÃ„!!ÀT³S bÆP
†dØ®€Q’HM ‚C0‹Çb$DDğ ´h3C‚¸ 2x@- D!R ª  «À ¥OĞ-à'ÄëPÂÌ¢ˆÿ aFXU"{2@Ğ„(“b1F÷@¼„ô‰TÄ3§H´<`!(¼6Jöì0:
† dFdD€PH1 yÊ €•ƒJAâ1ˆŞfÈ1°Y`0š#ƒd 8”ĞP‡8”`• "‚‰0˜î Ó!%4×ABFgA/Àˆ+0 @@#S1ËUC3ÄC¹°‘ßpÒO¨h¢dÉFPÙ"%µ	B†&«Çı5‚ 4^@.b€ŠCClÇYˆ	áœÈU,¤`eàR¶@¤ Ò<¢1
õDpl0$À
 $AHG&ø• hÄH å$BIú€P¢€Š‚JG’,±ÈB0ˆ$„ˆ˜$4€¤
A¢ ! 1vk F§À°53
(ƒğn3À²8Š¤*¶6 K®B0!Ái† ƒ*¿õªâPWIB´Ó´H?æ¬øAÁQ¹ &E(Rèaˆ *aÒ„†Àù—1ä"€al%™R6V!6Aœx –USˆ‚UA7”
á3 }LdNS$ €JÀÁÁ€B ´%B:ÄU‘H„•X @’Š@Éˆ1}Ä!‡a/i¹atQ˜
@1HN ¹õ((©”‚QBe	 '40+¬Ü¿0—%`UµÉŒ@@U!¥9V,2‡ƒ‡ ˆd2ÚŠ¦BÀ‚Q$ ,‚‚HYŠ	ˆ£J2xÆ‡€@j±¶*ª
tP	P"(E4@„€ ¬YÑ ~2`Á[Ä®P‚Œ0˜)€€ ¨'
  ¢8)uA0‘€@p ”E‡‘}¢1¢W€ ‹ 
€T.8/HÿSKZ_¹ÿŸ·åçgqVyò×íwô3ü6î÷ş½úÏÜü#G:ëßYúw—½«~Ÿî°ÍßS›J'ü[¿¯ÛS¿Mo§kSãïoTÍÎçó÷¿&×)ğ}”ÿß]ÿ'¼wô›5ÿO»éŒ/Ãï§{g;»ûñ{qé¾ÿ	n3·ÃZıó£„*@‡ %0, 0!<³F $$¡ˆ‘0â.``èD!I>œcVb Ò¤ÀD2 Z·¥ãá ÀP*” ¥¢U9N  º ]ŒJ äbì* "ËRÅ‰hÈØ°pdPFjáğÈPÔc%
U(Eta  UÓ )!0H\& 84Æ•P€’`<" Â>@• ˆ‹¿ ²ˆI  à‚˜(à@öìÀ:ÄH!€fb h  &2 Ø+ÌÑHä’DáŠá">U  
`jË4€2Òõ—<ÿ|<c’ëÓÎû’ÀíM¾îv/Ëÿ{ßgƒ—Ò¿jôfO—y~ÙÛÿÖNºşŞG®—¿~–µºí%e¼OáHeO±|jÏO|½g¸KøwWÎ\ÃUßø”üıSğ¿møÿsÕuÚı-¸[ïœ|áïíow¯¶„Íı?oıåş³ @€ª	U0P % &$µÃBPô\€€ŒØ`‚Ö ’ƒ °’g§ Eä£(B€Pˆ„@T²tCà¦¢`°˜B	1`*`6 " u‡B 4 §ET0CÆ¬ €H2@)ê”À£•ÀJûêÆ½åÙ÷J6Ş6íşnÿú±ª_=WkÒ—»Îß*lKq.ÖnÿöŸ×–'4ıû®—E.ÿºğşî¿¤ñŠ'VysS¦•«ËG³îû¶}ã¿møö¾N}q‹˜ëNóuíí¬ëYGÅv9#¿‹Êùûn“/ÿ÷QŸºjSı±®ƒÓëaeöö?üÿú>=á²·û1ŞåÑÓ^7ù·\Rk~ÔŸtÅèãõãù'ìÿY¶cŞo%NŞ/½;½}ôfİÒöó´½ê×´Ö-vl»¥ê»'Şgé¼Ş•c×R?;¶ÿÏï65vnöÓÈì•ÙÛµªè®uŸ¥úå·Ş¬5§p
‰À°H@Šˆ8¢”
 x
i	tJ8z¥æ)„€A† ,"‡ƒm$ÌPºBd@ ` à TS—",!@q¬S2‚@*l‘ ‰ˆ Ô •°‘ Öƒ6”™(€° à$ Š ‘¨µ¹ŠÅGä¿>£íû'<s/û(·_H”vÍ©‡ï9ş\¬¯—]ê~vÇ~hòúÖK?s/¿ız¶çe½ñ»Quöwdÿø¶4^î{¸tY³|›ußóYUßÿ_ÛÚÓÇ}mëáîñœwvs¸_ï<òëç·ßØßú¿GŞñïŸ£ı}gÿç¯ 02CAEĞ>ÂŒ€¦OL…Rf CÆ$X23> ÔL< ò²( Q@»¸t†°  €*D$·jªK©B$@D¦05@€ ô XøPÊ(C•HŠ©0ÁÁ”H( Æ‘Àrn ;Â€j Aˆˆ@dG…ó€ü%R"8("D, ”@à$ÈH H—3fQ:É"4"À“!`0ˆq6„F¸ˆ2@ŠB– ˆ´ƒ5˜¼k`I8…†’ÚÈP1PƒŒ$“ @L !#H Úˆ¥‚E‰d ~_‚>$±\z|wÿyûKV ñóOç®.³×÷kò4föÛª<ã…vÿmŒiîÁMæıúoô-Ñà6Éı~êw|·ÇæınÁİ5‡æı?ŸsC;_Ñ·j÷Î§ë¯óäÓ÷Õş¤³¾uö}zó\ğwl{¾~ßæğ›‰F?“[·ïyØ¥«À*7"@ÄHéÄiŒ@#
0Æ €:Hd`%Ñ`ƒDP6”€H0€Ø0ù` C¢@PƒD¥„€"!Y•è#<„‚ˆ€U¨€°Ñ lŠ!4€	ñI'6/ 	ˆ³*"€ƒcP$ÄŠ) D£1qÿO÷Ò˜e MüïVçıl]ÙÔ^ºe_;ÍÛ‰W‘u¹ûíœ†n´³o—Yáş×'¿ç/:”Ï«YvşÄw»©naØ>İçÈ1ı»ú×¼Š¿­©ï¼ÿKøK:û»«µñåòãx|%Ê›ÙMUzG{R#i¾úûFÍoÛ¤üü:y÷³÷¥/·÷éæ³“oçe‡×÷'[}÷×ç~îåV´7Aóß|ì>5ÆRGßÜqÌÿñÿûêİmŞzßM™Ï×õ‘ôŞ&ùşÿ,æ»İŞü›ŞÇ>üt¦ç¾;'sJw¾ïnMZ¸õ†>îCĞºì^ÇõZjÙü78ŸíŸÀ^×ø»û™H\4ŠAc¡  6c›  ˆ`5›.6BCî”‰"€ ³ °„|DPº… ` B ppdˆ‰ Yg ˆ Ã
©€A   &L˜t›DƒBPY%€%XĞ…S@$#Xˆh@óÈ kŞ1V}¿ßIıY6Ö–øNŸ¿ß?½Ê›½fú—÷[ÿlÄ÷ûiw4kñ»æì[ÿ‰öóÖãT¿ìİ†™}wÚ*o|hm{iŞ/¿¬ğüplçEõç[á«î{Ÿ¾å´š)ãÆÌ7NzŸÿŞÿõ»áÁŞuo5÷ÛÇ¹NOuÿÉ†A*bBy"Ö8€5B†|‚a"FiR¦J0çàa Ñ+ DY‹BKâE%Am€  'ñ0,+ÂBÁ@0dc„D€ a$Âƒ3Fè÷ jX8	:G) ƒXâ"°†Ğ‚ ‘€‡°IÂPE 4´KC	AL€ "I¹Q"AˆsÓşlâ@A0Eæ%‡   ”İMGe"‚`ü<¤AH"<š ’‰&H.`"€)%r	  J€K:#wœƒ+cPX U@ P€Õ¢gEğ‚C)Ò;òïtï~¾¼S¦ÊŸeğ-ßóıÍSmØÏ2¢Ù§ïÄ/<ı¹5]Ï[¿svë²7^>Ş;¹æÌK>wQß×³;Mìœ¸²©E÷Q¶gPú
C¶üÍU­r°n/É×ö×’~î5BÁKWw¯·­¸³ußµ×O¯V{äh6iùsòï@B„È4TáX06D%@Ò
Y" ‚€&¡H@‰ ]HaPd”%è‘Ğ	f™
Á( 00‚4EHQ¡Ç•¡@Ü„Ñ
$¨RP),‰d ä @%(˜`V
„ t¤‚9ˆ¢R(Qz>„¾úòÿµ’¹ãûıïêAòú[ûí¿:ş•¶gåÿ‘-ÍônÁ{Òø½üå?»ç‹ŞŸ÷¯&ÇµŞúî»ûXºß?ÌÿWşêëÏ¢NôW¦{¾ıŸÏÄŸ¯)×?¯ïú—‚içæğÿûßnı;W·W.»İ›Wÿºîâuz{Ÿşëêóõ¿ú¦™ÒŸğöş½şşÍÛ·&ş.×·´X³ø’¬¢ñÕ?°R®õr“{0ÿ»¸u_v¤LğŞoÿäåï…ÜtÙ¢Å_|~~‹ægN‡Ö2¶}‡]øk÷¿õ½ßšşk÷ï/=¶›×*ü }«¿±ázÓ·<[³¾`§ÿkÿî¿@B 	èD"´%`C“Ñ Ä@AnhJ s4# :È&$@ Œ ìJ`AFF$cp46 èA„à¡€bY°€X	™CA€ŠšÍ @!%È“ê@áP
œ°€$ PPCˆ E!@]RY(ºh‡áZ zB¸Œ¥g^ûço÷Eû’Ò¨Ôéo†rs·W+}³^ø°ŠÍşÇÆkåîDüÿ€7ÍÏĞéëı?½ó¡ş£¤?ÚîÁì}£jŸÿ×ÜÒòÌ‡®‹ïÿùíÿÚö¿EìŞ¯ë,ıw÷ÿCt›ˆÚÿ÷c§^-÷úÈî³üúI6×‘‡³ş# XBÀ)‚t  ÀCx‚ D ùÙ¨
H€ğ …‚È ÀX+ÊAX‚#Œ2…„!ì’ÅØåHp „Êƒ€%KÖ¡ İ!€(9v
€ˆ H&ˆ²±$X5À ‚t‘  ‚f	p``t(„ˆz	 å`00
C€æ	‚Â„®X˜ $ P @VPRĞ)Áp"" Y„ È„ 2”r£0HŒä €Å, …G#‹`cøMÈ" 0&€’0h HCÀ  2SÄQ´8A! d$â‘K¿÷÷3±ñÏ½ióÎ…øïgÒš/ç÷CŞ¦šó—±y×Möqvgw5á#õ#VïÉu«c¿çS/nyY^ë—î{çşÇ§?6Îãã7çbõÑê63cæó‡}»ËşÇ^ùÍ½¿¦ô^÷ùãÿ÷éÛ“ÏíÑİ¹.-7û[ı?ıõ™.ıxh¡€Ç2
€d`$9fK@9.¡€i¸AaQLDM“1¤ BvgL@  †}S ¥Oæ›g0b„Dª#B€€D  Ñ0€ŒÀˆ,` ¨?lú	ĞBSÌ0ˆ0‚(b0"2"ÕúñÛãØ›ßıs×'ònŸÉw{éÙü¿”¿÷=»oŞGùİ$Ìåg¿{½K{ùzsÆïmúízücúûnT9röİ½ÒÍö6§u²~ïÅû_gæJ®?ô…ıéöeòI¼mä_ÿszs®{FÿåãewÏ)cøí¹]ÿwçî"ÆëøçÚoï´œÕ§÷ßÇN§½—äÏdÿ™Ï9zÀÓœğ¼ß¯JÙË>ıxçÜ{_S=£o/ø–Ví³½2×~ÍÚıişŸÓÚÿØ…Â¹ÑœŞÓÊ)ÿïY·İÎË’³ØãJz£ß=ş»‰Ã­ÿıÿ[ì“×Í{³ü¯8Êß?Õé<ı8D  MU•(˜ÈĞD9$(H_¤DŒˆª„)à‚P"€@ BğB`9
>:{I;E
€PĞ$„€ Ào‚&€Œ!)ŠŞ (n D$"D–$$sµ£‚`¢¶2^0 "œ )	ï{Şw/İúW{ÿ·îßN¿õ?wkÎ\5şË¿õ_ÏõëïYÄß’ÖÎìÿYÌ¾ÙM|ÿûËƒ×ûîRípÿmzZ~Şïjø§½g3İû¿/±LÍ´ÿ/¿?ı7ö¶»Ë,¾Í[øûéÇıÿï?CfÖ?Åşm‹wï7ùzŞ÷«şı½şÖûÜ»ıI†±0K†›SQ.E3„ X (•7´5Àµb&U1Ğra–Œ9€ª2eu"i’¡°a `™J
±BRTŠ §nÈLR	Jˆâ µ«,‚"ˆY…¤êg“8R2H‘a‡h	IÀt‰ æêa €‰4ÊÉÚ VtÀ H@~cªĞ›‹ÀôÁŠ¤5BVTú@2ô<Jp¤
@€<@ Fp8Â,ä±HÆ k	dás†+AJI(O@•ŠH¶8rfÀ{ÇåEc DÎ.`FE"EB"KH
q]Òìô_®½ş˜|Ï·Œy[ı»Çşß¸Kßİ®O„ÉûîÿıÏmßÏßïW»»ü·9ÿ½–¿«¯ÛyeßŒ½¿q=»{qÏÕìùË­×ÿßáÛ^İŞMôŞ»Ùi×z‹ç<·ÿıÂç¿7·Üÿ9ùÕßf¿ß˜°èúÍï<Ä¡CÀ‰FVG± É‚ÃPÀ’Óˆ$1·lBy1Rx 
¢	fˆ’M 
Å¹xR0¡l·*”JOg•d23ovå#  Ñff @ØüP^‡Jrˆ2X¸ F‹aØ‚”ËµQQ¸ÀÜÛY“9¯x»[Ù§Øÿ÷ıûşË_ÿßñã?üÑşÿ´êŞŸ]÷z·–××ö¯ê­2÷çmÜ®Şgÿz¨…xşŞ~†yÚ^×ğ·æ¿sµñıüıæ‹{oİwüĞ›ùµ½ÿïÿõx{®Oúÿî·Wú.[û\Ëô`XŸû¦Û±ş½sM_ş±ıç;şûúmfëñúßÏê,ã>ŸzÿT—¾ÿĞ×^çˆŞÿĞ¿˜¹¶Ÿ~¼/Vøíÿ¾ë_sæ¯ÛÕß÷ÿ{g.[ùºÿwÍ¾q;çÿ×ıÍ,ßlwûiİ÷ŸG×ÿËéıSşïº~ıò?×ê*¯¾ûSÎ~+ú±Sı~Rúuö›‡ÏÒÇ¹oıÙH.U9raCĞ-*6B qa€ ÜØ
ƒï4šPqH¡óˆ©”Ñm „Q|€‘ÍäÀÔ
K¦6"XÙ ÑJs Æ £!iĞ;U$ ˆ 25p ’¶„4Q¢RCiú ¯=¿ÿwÌÑÓ»Ÿ›ü{ë]wW+ïç³ksŒ[ònÃåÊ}Ş÷à=ûÖM?	÷½ßoz½ö[“Q~Ít¯^(ùÿæşşúw¯¨§õß¿ö¬üw?×}üÖÈûÔwÿß¸üÿ·şéíÿnuÿûy¥‰şõor}×¾¾ÓÿVPOÇG“şÿ=µ	p× ¡Â xæ
 /°L•	)M	]bSèMT³*$£Bò˜‚QDš€€àJƒ¦‚‰AHXB¢ ¥BkŠ'`ÒrP&¤°-´ŠCDI AC45¶fO@AIX¢Á@§1óe¾[ „“Y"ÅAJ ÂBUÂ Ã9QTÅB Ì8JkàñV(CR°BĞ¬DaejŠ®€ kM
ÖŸ«		x‡ÒxˆÄŒŞÏÆ¬ÎB'r‡» dçcáš-ûâäK£ „p=A' %’µÛûÍ¯ß¿û~Sõ|Gï¦ÿşmñœ¶û^×Úÿ½^ú÷şñ¦ÖŞW¯ïÿ¡‹Û§ØışßSúÏú¶õï~xÔ¾ŸışÖîvåŸüÿ×Ògı_Ïrÿ_û_¿ßÏ{ÿıîfı?WIß±ïGİ–Úİñ]¤üÿ_œŸãï Ùûÿa¦ ş.«™L#ïymLDÚd6¹¬è+@@ê\ (|P¥O¡0óP®İ%ÄAÖ„ÔqQbs	Ë`ÄY”ÄÂTÃ` D)A.@C 1„E'‰í  AZ‰X Ï’xQÑÛÜäğ÷AK"`ëYQ›œ«zş–Ñ}Ùıôğ8í_ûGÎï÷Ù×¿{õ
çÿÕj÷äï_ãÿ¿½×şüÿêûõoî¯Ó^­{úh}­Ò?&eßCßoşîw~UF÷0Şïÿş8wÖııª»lå„ô§0n«Q‡ó÷?_Ÿû¦ñFË˜ëŸëu7¾ù÷ö³.Ÿ£şÑşÿ–'Ñ¨ïk¬ê=®ßk½óG“ÿŞÑéó®Gf5Aé××ëïƒv÷“4Ùíb˜ó}Ççİî¿Ùsóüõ¤¼´½ÓùışÿÙÿnówÇË¬éoõõ÷úë¿«öëÏ}süùËşÒ“ûòös|<nÁ|ñïï¿îí_L.ÏüÒsOt½7X¿}÷TxŸ¦
=–àdè‚(„ŒâT'«‘%¥ „N«ĞdĞ‰³„×,D¨¬$¦¥€€e¼40ác#ÄƒC`@4  T aQE‚qÁ !™‰,6køE!h ú2EÔ)pJ[DRpŒÃ„Ê€¡:_ÓéÛ·o9Ÿ»¿d›ÈV´¿7ëû¾É_m÷î_.óŸûH{ûöÿ]zŸí~~óÿöm;õÛoËƒÚ/öeÿ™œ»ßÏ]¾w.¯ç¸ö]ŞÜß?ùïç×¦û¯×îÇ÷nû¶·WØ¿ùûoîR×ûÿÈ7éúGÙı¹ï¿7sÒıFÙşİÖó½>üÀ ÔG°2D)Í T6p‹ÊÄÊ`é0!±še‡Îñ&w‹QV‰a bá–„@F€ @M2ÇD*S€ 	F;8IYE¥BÙ„Hhd‚Á²ŠKbä9\“€Z†Jõ,è*Hƒø¾4—.’Ü”ÍÈ0À[âÍ€A3Õ@‰¢Çc@qÄØDUhpF†&2@¬¡ˆJÄ„‹ %Ê,Iv 0`ŸCfç¤bÀà‚ #/”@˜"€ƒÖ»T$Baàµˆ82D/0™°1ØÂ‘•	 @ĞkÒ6’ÈUßÚşğq;ÿ´”·÷cİ½¹?^ÏúÜÎóûç$—ûkÇûµWí~e–üÈç÷‡ßŸ{ËÓ}·ovÿ¿Ÿ¿›ïdrÏM©ïsyşÿÜÕYŸ}™ÿ~Şôú-LòÜØz¹ö7…îÖ×Ù{'ï¥ÿŸïo
ÇûWoşµ½í›cånË´xï½YÉ^*‰ˆU\  ÇC˜€¨ª €¡Œ„ Víh.Ğ`Y.@!²Ä[C”:‰@,SÉBZèò¤%î’J1¤Nd5É$À‘ :L -¼J•V>ÍŒK¤Lƒ1•d‘bñF(¢j‘Y„Íl	¿şï_«}û»Sô)ÛŸõÿÏëÏãı÷şŸîgóïÃ;ÇñgË¿÷‡í]zÿûúğõŸ_¾úmû³¯‹îÄÃnŸ­óšo·ÍÏ¶û»óŸÏá¿êw~²ûµc³÷ğ~ûİÕı¹ıù·¶-jıëëşÌ·Oû•$ß÷ßĞ,kûøÿ·bãù»Ëñı×ã–xûŞYæ¼*O}Ï·Gßõ;±·|ßßOé|ò?/­vÓ[ƒşöşEı?Õrß<p½¶v??õéíö®Şfÿïí¹ïU»_ÿİ»ó²_ı»Ï&õ÷ùF}ïÿrÿ÷úu?ïÍ?¨kÿÁ_ÿ3şî‡ïÿû}¿û{iÿk½Öİ¢ö¦Á¥Ã$F‚Iñ¡[×`?CJc…TÇR8Û°	¤C)D¢‘p¥l€Š’$Ì†ÁŒ0oXâA¡gÉ"ø ÔÌA ‹„‹B"Z1Ò ´568ª 0ÊNBÀ@ @‚@iÖC6|°@ÂË3C\Æ¨3Û/w#ùVóïöÿaßg¯ÒŸYÿ¿Dûº»nÖ~ÿ:wïVv›şÎmÿ»ãóÿqr¯§İ7åãõçş—uÑÓ=óöi¯oîëÍ<ş÷şÏøAÎûïº¿·şío½öÑzÎúc~¿ü÷ókùÿ__õóï»ÛSw—o:¶öïşöıû¾çì÷ÿŞİæÈ@ ˜HŠĞae…8ûÂyÃ„- €£”A–F§P@M)!IˆX@ae& 1@1"‚v¨§†„H"¥A& `)…]•€A8DD  @  ©2:Ñğ~)(`òJGä‹J D±‰T1àt«CT«­¬dÆ„ÙXR—p	€¥Â @HŠD `‚l‚MÄ@'ÍT6p™eÀ»5L¸@F«ëC ÒŠ  XYaA¢P*Ñ„â
« ˜ÈQ d\áe¤³L£€ÈTD¤KO@¬' ¤3Hd*Uà ïşëu7ÕÚÒım:é˜ZG=ûÛä¢ûîçø¯ÏÓÜ.¿z_¯“~ïÃ¿"•¤¯«,ìß|Ãûë{Ô{·ª¾»íµ}=?şËÏUwã$ÔÎvOıS˜mìßñwïç›¿mÚF4¿Ñşû¹=şŸSÿOüî<Éµù-ÈÍ÷ÿ¹yHÑµ‚üc_%!J0[` ¾2 `×e	¹„Ñ-‰‘	c 8§!°ÒŠ(0Wy¢ÚÎĞ"j<²£ÀîÈ±4
¡	Pãe3Y Æ¸¸KĞAÀ¢XÎà¦—¥P 'äÑ$
¶˜­_Ï! $yA†{ŒıSKıßëşoÃşfÙÿ{}nÿ7ïwéùÖßöí·ÿwßÕ»»N{9Ë¿ßt÷Î‹2ş¾ÿ¼×ßÿßÁöø÷(ëìëÏ·¿“?öú¿íüßm¯ÿÿ›çù}Ãÿ«çwì½{ß=ïİ¯¾šŸÛóû¿ç¿Ûã«üûß÷™Y{_}»ßŞåÔü¼î{o°~‹ü{Y{Åı¯ŸÿÓş×Ùú~[|ú¯yËÿ÷d¿ÿümçÏûûxwİAÿ}»å¤ñïÜÌg^œ¯¯ı{§Ê+ıµÎ’»¿İ›EyÛşâL¿õÿwí/eÕ=¦ûØ»%]»ã9¾Ã×KßûÿíÿAíz¢êïşch™şı*0ı·Ü¾7·+ÿ»[ùÆ&Y1Ğ0B+FÍà€ÁÄŒ8PA
Í—‘D€xIÂ…7j ña¨Ã™HÃH©Ø¨G À°`2€JË¤ 4Ù\¬s€`ÀV #ƒíLÀŒ…Ì#0WD0|µè$‰‰‚È áæéMDĞŒÂ@ ·™X;DCª& ^5ÕD !8˜
$ê'äP( E\U#4=€@AÀ!^I4—`	VhpˆLP˜èÓåWd(g2	!<	İQBp²¡KdV” `!… qĞ€‹êPÂ$")hÈ5 eñ}ß&Ÿ.ˆûÏubßß«Wÿ^ÙíÙç‚oø_Í&³c?W÷‡eKoïî'û¯Ÿú»õ\´÷Åöp5r.¿ÅĞú^ëşï£øìOôêè]ïšŸ#ê¿~LwH¸ÄÚ¦®Ğˆ£~o£¿;›¯š3/É·ÿ}š¼ìü×5Ñ~·aÿ«şN,^Şÿö¶ìvùFİ-I]Ãüç”_Ì³ı7÷ßwÕM6ª[n«ñóş÷Ô(¸íÿ³&»_İqWÒçƒ~vİ§ÅL×˜¼'õ}÷änÖÀ>Ğı¥ÿËùÎßÿ÷0û¼ùÕkûùİŠWÓ‚n!Şyş¾ù;`íĞñùİ­Şí0-ò	¬Dñb3QÀ7cì ¨€P€9+5.
€ éä°†@Áç‚ ²b‰ ˆ%	² HB(Œ5
AbIdeˆ%`L)ÜP&<D…@€A8¢hÅ‚¸@+ G\CIƒJÃl˜ˆ€BD H0nº2ó«»—öşç¾ë'‰2'¿û•ó ÛşîïÚí´÷ßïëÿzï¾SÕÌ»ûa÷ÂQÔêjçIñ5û‹ÿÔœ‡åz/Fo~æÇç[oºÓôWåŞÛ¸´n£ï–§e+í=\¿v?3Où…fñÛam”ì~õûRWTøÄå¹´z0ô÷ lq¾"Ş& :20W"Iâ‰`@A(AT. Í…$"	=¸EDGê¯âˆµ€ ±, @’¨$à'0€rEe =] ŠZàX ’€‚™€ ¦  $` ¢ Ôt	!¤åL0Â ”-@xh’IÆ	H¤qGP‰DY"¡@PJxR!EÄğ,¨0TÆ†NQ€0p
} V ø # „B b0ÚxCx‘D„@0ŠÏ”@
Ú ¼QŞ…+”šŠÈ€S DVP€Â¨ÊŒb“¦âÛ°üLÉÏÿäÿ£¶W–ø»n•[êyO×#é>õ"şÛIwƒ®o¿ç~üìîõŸ³õïüN½ïGy“ïÖÃ¹¿ü³¥ÿûqß#ü-ÖÓ³ÿ4[Îr2²,sÙãğ—¾å7ù½mpûêîqíîå43»õWë<½à³Wy¨Ò-GÍ$< $AT :
ÀI$€ mYÏÓ# 9 b­pè ¢P kÀ2hÈb`$Å /h`QCˆ‚`€¤PëFBF 7 ´0‘Bq  ‡0š! Gr†ªDA1Àhñ¦ ô<Æ‰j¨Nœ`Ş~t?*ÜÅ·S*w¾úÿwş:¢“ôÄ;tzş¿®Û<Ëğ±UİÔß-_ººåÛçOEÿúWQÀ;GÑ'f¯z¹Æ¿£z8ûÚÿ£÷ÙÕ¢óL*oö»ĞèüÿëËò÷Ïû“ß·ë'cÆ<;?ÿ=ö§uİ†âq;|ï÷ğîä²?ŸùüİUYç|ÆÛÜuÅšq]_Z5÷ŸúşgGªÿÅoú¿Şbş@mn÷î·ø&^öş¬ïc•ßá‡wœıİK{ò¿ßüxœÓÜQÿr¶ÿµR¤ùW¿×\-kóÙîıÒı5¿«}4ïÚ¾Û~ûÿÂê›á|òO±­üñÇõ»­ ºÄ
€ KC8ö(’E$…T1(b¤IuÌÂPÂs:râ8PP¶”Å¥bI +„µvØğ(º"%@‡
Çğ¥ ‚°¢!‚ÑàšğæZVÇD¬€À}E f\Š eÄ2‚0(„0ËÕµzìG/Å-ò$_®œÜçşj÷÷?ô<÷kºöºß®¶ı•¸ş•×ñŸ·ß]¦ıÿÛ,~õõ÷Ş´0ßœ˜Ã¢ôüşÊ?Ìû£j/½¿Íÿrìü‹™ûW·úw¹|Ÿ›úMÍé±	i·ÿ½şszûiÚÃKmpé
IÑ ¼(@†#š"%aiø1¶Œ" ½B ¢ QT÷&.™-Š@  ††nd € ‰åƒ´9ÊuX˜dàBJ@ÀƒÀ ƒ‘)&á£€ğŞH (À °BĞT+  0@™$øÀ’~ÀP, -#02 ´¤@Ùb%€mvŠA 'E
 `hpà¡‰02RJ&Dá 1h”€D’B‚ €|TˆØ…4ĞX ÀD(@ÉB 5,p@(( H2¡Æ&x€¨b>AF JD¡q¢  $ Q€¸a¡D€bÃ„B„aR Ï³£÷O¥GGíŞî/}û©O¢oÌÏøş¹ßîõ™6hŸÌ½7ıÓûáü[ÍÇßbï®Ã-jè·[T‹ÿ–?åÛgê[~ÿğÿçŞİoòÜûqùÑü.^“&{ÿèíó=ïÛòßÊ»—ß]{:ßıRŞÕ/¥Ş:o?p¦yûÿêQä£Xn„ˆ,Å@ €" -0(ĞÌ,)Œa˜àFÀ   pˆ‘€®! I…¨#* è0…0"
 ánW”
€¤A U„(M —ÆAH9I`k¡à°Xˆ$!‹"…“D £„L€0Œ³.&è"`‰ƒ´oŸ¼'N}]×ëqıŸó¾ÎÜş7ù8eìéÜO»z-[ÕÎúîÇmÖ×“®çKÜ¤uıÿku2¿³TŒïÅçèë»Ù×ë›şÿ}{Ç×÷ß~ÿ×ÿÃÿ­üW]YÕÎéú‡j÷¤˜ş½òİv§Ûş¡®GO?Òåÿ»~ße?§ãÿí™-ôùì}İb×FæÕû½õ2?ûnóüoÙÛ»7MÊwQuséí9¿ºU÷êÙUŸõ²?éõ“	¨ÇŸ§;Îæ>}gÉî½ırx_»õÜãz¿ò!½î·éÿFıåïC2Íÿß«û£m¤¿ñ1o{vÑÓO¶¾ŞWçÏ«zs'q¼»¡€Ua€ ,€°`ˆ È"€2«@€+‚‚1D)¨è!Ã-TYHæ`ğ¶@,@°`&  J@ H
#¤rHğèÊä*ÕÁ  `† $ã9€@	D8;(ÓCÙ.* !ĞDtƒpAÜ2¶€÷÷íÇfÜşXtÿú÷¿”eªzgÿvçV™u×Ö^ïÇ¯+ÖòëîE×+=&ŸêóŸ<Q.ò&—.îêëİ+wï:/o;>%ªÿèN­½÷ûoy{æõ|Õ/ÿU­§_nŸ©÷äıwæ¯W9io«Ç¿S‡mwÿsìVÛÁOH¯¿íêİ©!=2‚Â,01d€B  `&ˆd €Â[M  €€Á’r´ Ğ¡P¤ÒœV€4€$ Q¸"8%`?§u„P9]ã @H£1ú‚¡·-RXDÈ¡dê À	2z`ğdïğŠa2>‚&‘¨C @)à`(3`P@‚B©Qa‰Ô ƒò F € kÁ! À  ²¦ŠQBAÀ20’ÄD€,¶ÀÈ%˜¡dz¦Ä˜â0 N U * 	XeJVÌ!&€ˆ­œÂAÑˆDÑ|8?Ÿ=ı%WWª-zïHoøÇïtèm¼ÿ¬÷;î~õÿ§ùİ{¯n÷ä¿nÿä(ü¸û¿ÇËı¼öİ¸“«×¿ç™ˆoïÿïqùÛOë_[¸<ó_oãvß¿>_÷·K´×½zgxš¿{¦z§÷íÎúºß¾ûCçlïÚl‡ñ»ëÍXTOhEp®Hl”&h‚p°â+ $Ï Z f!Rå	`¦ˆ n†…¤
¨<,Æañ ¥D&”Üœ0cŠ^	€)9‰ 
°L"‰¡Ğ–#™“DJW•d<‘D‰2'©$Tñ!‡3§MNúïv]3O€å~º¾Ô?5³µ{}ïÎÚ`?İävõ·×ÿì'oæ{ß»zï¹·ó§ó¸ü—óÿ×êğÿó—ãWó¯Ó½]5:Œ·lmnÿ¶ÿÿü™næ'Z+ô¤¾?[÷ùç{‹Óú¾[;—â^ş\÷³ÉeÙ¤ü\ï^Ëâ}µ›Ş+Ö#Iî÷ë|ÍFç¶óÏGã®®¶îUìÿ(»ÄœîÛÕ/÷7ß¯_÷<_ıöİ)ñZı°?÷w4_-ùo¦oß{§öóé¿/[?û}şq÷Ò¬ß^ñênº»\ö~ô¶wïú-µ6›ö÷ù_û÷¶^¶ß­lÛµœ÷÷õşßò^uşåñdªoi[@ A², $"¦@È¤D™Xap J„
™ŸààD@¤£ƒFEm%-ğ
@P6Dc@ª€(BĞW)T@Iğ b €H   -ÄPtŠ„8šQFCD€‚‘aT%P k§iÉTF€A?¼¸áéÎ¿Ş¼÷´ıàıc{±ÏzùémÛ–İÓçÿúß=üxûûÇp÷Ëı×ëËûş>/¯÷¡÷¯{¶÷ü÷kwÿû{ÇÿÇŞ~Ô×öZzw­b¬Â±¥Wû÷úì»>ãŠvğ]^Éÿ´sÿ?o®æÖdûwwÿz}¼¯¿ÇVï=¦şY½¿¿›0h¥¡ƒ1@È/W° ‚Ê01¼cPhÃ(`˜à„ˆÀ9 A”!"Ğ<à  °«†(	"ğ¡€„…´ @‰E-€t‘€ %† ÁA	bUJaB  ™ØÈ(-çG¦¤€Ò"™DÒDEH ©„šaÒ%à"ª"‚âER”†ø„dª…	Â”mDÈcŠ M`)²üB °ˆaR€ ™"‚ ,iB	ŒÆh ´‡  .€3	¥€ ‘ „ÅÂ€B°¶³Æ@pBFB&È	 0	`$„	 R@„‹!ÿÛ|é~í¹ŞWç<ÿ¾z~?‡×}ï×õ«6'¿ÑİJûı&Ëòşò¹SË®•¦ø7+~VÔÕÚ»\'ö>ê-Óö¿÷İëB&Gˆ•¹OÏØ¯ÿwã«²³lµz›ÿ»Áİ]½Ş»ıËßñ3$§¿GÔ¶¶zÿô·RşoõŸZqdo—ıöºTnÊ3—Ú÷~å;‚¿Û{ù©,ıú’sõÃö»´ŸÔu×£Ç²¾]ùöv­å×ÿû¤l¾ü¯øÍ2êqUåÕ[‚·™óî;wİsN}Nïëó\Äı|ÏH·»±¬§¿7‚ïŞ…Ğ}×xw7‚¸õå]ğt=’şºÌ2 F@¦ €Z]¤¬ô°)3ÄÂÌ ãv€a AT'DğQ•¡‚a ”o$Na°d"1À-'Çv¤(#ˆeP36cÊÃ b'€à%" ÉDA6ÄFÀh@`" Bµ(Ù2 Äàœ
B	%ØJàa( Á$PëÈ8Ê\R4Ik ‚"a¢ª @¸@|‘JR.ÊŒ¸€QVI‰@À’@”…PŒœ„a×Ô8ä¾"
’`i$¢ |1ÀQÀ´F
¢l`’G^ŒşCó(fd’4 ,Ö÷?Jfİg·œùßéÈi~ø	ù?ëSìïßü0}^|ŸÓÿï2Çé#ùûÛŸ.ß»[›ïUÓ>ÓjB›?WòŸkûİíÇûæú¿ùÿ÷çöş¿ö¯ån¯î“~Í5ù—Oª¹¹q.·Í×şN¿ªùí[ÛÿÕã¡ş>=Î_Â6;÷¯ú»ğ#Ò|} aÂ(R`XC!aŒ à2‘a ¢d2o@p  ÂA)JEÁÆ‚˜	@:X$Å  ID@ñ‰`ĞgÛ4BD B ¹ †0\*ÉÆ†ÈrZ$ê¼Å+’"ˆ‚C$
xê”x(¦DÀ€Ùú¿M2?ÿ¿Ö¿èíò÷N»5ÅOmcßş4t¼÷±ãõ§Öj®¿şó¾¯ÿíÙ~Üqõ¹jk€İø¹ß»Ûû©[ÚÚWÍ]I¸ÿÍù¿ìûÿ5§Ÿoÿt9ÔÑvIıc·ŞßÿW_÷ïÒ½èLcÂî7´ûW÷ÿÊŞğ³?aµmÎKò—ß¾íĞÃí×k£³ÿ·oå7*Gk÷î}Ì¿±ììòf^c£ÒŸ5_ƒÍš—êÙTğŸ´³·ü7ş¢ÓiÓïï¾æú7Š—^ïÓ7ÙßÛ?ù›#ó}{oš}kN·µí<½jß´{ÎÅÛ½u]1şûÿ_³a§èù,¿Œ0N†b/g z°Ã$GG 0AH  
n¸3|¨B@*H¡¦Œ€Ê/D@’À¤šÉh‘5„xr€ ˜<¡Â€à€"À%!@2ˆx`4üi ”z1!°jg`€“CV<	€‹nÌƒÓ˜ *ßÊ”lş|ùû­¸ôM¶ïáóGíGå%w˜ÇvÿG/^?ú]±{îæó­óİvŠVn§üßfûC’ıÁ÷¥ñÅá~ïú†ÿ³~·úëë¡üÅqI:Ï%mçæzÚo×ÿaâ·î¬Zÿ­ŸÜäÕ?ûUÊdßw÷õıùä¸ùÓ7¿+F÷d¨ÈP% ,xãMƒµ@&""Ä tèRa€r\ĞÅÂ‚‚´@Êi¨@X)*È¶0„
Ş”É‰½J£ 4ea„`„EÀ(¡'‡ÑX7Ğ bÍ¡P`X`d ÀDKA€¬)B$SP H1K@@ %PxTBm$H  , Åâ"ˆ k ” $¥õÁá$@ ¢-4vP¤(Ò†¡‚Àd áôñˆ )Œ¢”ˆ]¨
bâ„¬¢
 ÈÓ 3(#¢Ó%¬`¤…T €æÈıl¼zßz^ïİy©öïoÕÿU¿M¸å4^ï8;'÷u¿Ná¬VWıo}ŞÌ±ÿÛ¾7>uvÓqÿûox°şíê¿'àü6EŞ¿Ÿş»Û÷äîŞÊ¦×f±ÌOyû™®¦_¤¿W¿Ádm_7ê½½¾™¤îsuı®Æ¨µFgù´^¿~"QL CAIÉè. 
¬$ 9¥`A(@sÈ0„ ‘1p6cØà„)@6'œÀşô"à€ f A ¼'…0ä¾A ¨ÀLÀâËĞÈ@!ŠA€pi`8‰UrHd8±â{ !$ 
 !e1‚Iqád0:ÿwê,]å÷rz­^—ÃÌ_ŒÒÒ9¦½Ÿ7W±ÑÂä»ó¿³ìÏeKö¶vg»”]?s“Ç‡?Äó²i9ïêÉJÿÿ÷,S|—uäno{İCöm_çp	÷åÛweş÷è…£ÏïÖUwÖÜ=ÏË×¿g°O¿nkİ±WƒÍ.ºOèîûm	ñWıßDt¾J7ñyá·ìV·O¼s;ûsşïÿ›ßü{äÿÿ^7¼<¯~ãx4ç¾ÿXŸ˜ü;íÿ÷¿¶¸KWèVÿ{Ïçµó»Îÿ³üV_÷¯ı¹í%ë/,3ùÇğÿ~ñ­Ö¾Ó¯ûØ{Çï¥d<ßß^ÁÓı­pßp ‡¤X4 ‘ ğD@È€ M …ˆBDIL@F™1Š„áeA$X@’ˆH%	TØ48EÀ©-@CA `©	 D‰ªÀ &$ÃE!S64A ” ¡ˆ@vD„€l© 0p†R¬O`))`–|+*œ‚Çıÿù+ñ·›oİŞwßÙ±¯r¾ßÙŸÑ	Çÿ×ow´•Åûñ7Ÿ=m?Å}³Ã6ÛqUøàî9õÎ9İÿ9ºŞài~¯wü°}ûÚãï÷î7pÿ®ñò=ââ›ds¼»öş%¶¿Èí¿Vó¿ÛÇ³î°÷òÇÿ‰ğOßèy¨û·¢6ˆ @$€€  =h³ Œúåó$Ä¨,‡`	€!#¸² „hy-¢à	  *V(xU ( €ì
PÓ`@$Á!	0 "õÀ ÂŠ¤4üPĞ6e ‘D"@ *$€!Œ „a`	±Ñ„z €å8ƒÀ!"¡‰TBV5ÂĞp¥GJdU4`ˆê vJ²0aˆ(ŒHì	*E 3-Hb8h¢…TAÚ& ÓDª‰ 2(X,˜Àğ@J ¸8
Åƒ@ú 1$)›¶7{ïõRªß_ğıSÙ\êöÿÆëŞ{ó÷…şËÔûÀgŞı—_ìø“x?ú†ııÔü§ûOûÿøÏBÖ8áÉoïŒ.s›àşk“z·w~ómUÜ{¿eWu#Q¡ê£õß>3ÑQúKV»çß×M¥ı7Ê±±h÷{WŸĞM­Ê¤d€4‚uhÄ¡0€QDŒJ
€( Ğ:•  ‘,rPÀ(¤£ „¤îAvD¼9aÀn€HJœ@1;y… €DaH‘*œNdD‡B €èàƒ`:KJFÀÂ{€¡(¹ ¨   ±Ÿş×½­[_µÅ­È˜·èßÏ>÷\Óÿn)§·Ÿ_ÿ2ÿ	ÎÔ-ñcøŸ»ÙícïvS[ÙÿÒ³ç—»ÿ¾é´äóù?¨õŸõ¾{ßÛ¾üWK“bÕn+óûîíÀşïô¿Ïó®[n¿ÿE_¿[ÚKy»©VGÄ›}rkîìî—‰8ãuïòİ	Õiññîì¸ïwŸöşq~i”o™èû=üá7büÓ_Nßüz^—üŞ›ãå™¿õÓ‹çE|NbŞó}åòÏÛµÎØ÷-×·g57üu­ÿ?é—ÃôU¤µû—|İøåúÓ)ëû¯{á}¾‡¿ıFì»÷ªÿ·næ<Ş#şoí{	@ˆg$ -(LDº`"&4Ie§@hŠƒc`ÂHp*`Ìt)Tt `%€ HBØ-½EI(?  š´¯…P.D
 %Ğª TaH„q	-œ
™Dr.Ál 
úŠÿ™åÿzËøñø*©ï+òÜ·FÇ7FœçŠ»ï[íWã_çBîsÎ_§§+¸¿çòË®ºi8ïç{wÿî¿X4é•Ëòoî£–û9%p}s^>M¹ï¬8×­çêzûÛ?çÜÕşîÿ¼×…m÷ÿé…í¯Á1~ÛŸ×¼
½ãWIm)!N °~Şc— 76@NPŠ@œF!–IÄÈ["ĞY2Ñ ‚¨`èŠ«!“¢9°@ c“ 0` Fà6 81¤,„†Ä	|@Æ* 	j@ Œ •‘TrÁJT%”2š< R@Q0Ê  Dï± - Ã„H Ÿ
”É0$ Rà,k€›Ô ¬ d2ÛX2 " ÁJ@0	  ¢!DŒ%®PT"" ÉÄ
T¨c¢*ñÊÁQ@É°±&  @`…V@(¸SB>AE‚‘Æ M„è€íN_¶›ı¿™—}ıë?‰Ûÿß21×óÏw)ß2¸ó?û¾Òşÿfìë¯¶?·~ı·ÂÍ{ê~g¡GØ÷]ëŸó¿ÿôSóíé<ï½Ö5{ıçèíŞ/{çùm¿L¿õ^;ÿM{>ŞÅ·Gÿ±jeæÏ-êçQÎåÎ~Ã}YwãıVÖÏ½kÏ ,J* R
`BĞ	k11Ì<€0J „ø@)g`0 Ó#' 8ı´Æ¨$ $‹’†T‰dBò€ A4N‚ h ğ)ĞhYA É”0‚¦@T² ş!8œ!/‘Z„@ŠGT   9 
¯	sAÄj‚¯ìïçÛ}êÃ;¤¿¼Ö×ıèİnL§¯æ?ûõ~_gïºß_ßÜ»ÿíâ²õo÷—ÿìúûû‹Æû½]µÓÿ
e¶­´ç÷×³»ë~³ÜÖÏ+è—R¦|B‰{¼¨ƒó™ù:4úôãÙ²Ÿ¿Ö½Ï¯±7¹Ç2ísõÂŸ¼‡õİ­ìgÕ÷—?^›uÎş'³¹nTš_Ş¿Éós/©wñN¾îˆ»_ùSÿ}]ßö;ú¿ş•4”ŸÛÿ;»1½·_Y{7ÿşÛÙ¥¯s®¸~P6çƒÆ›å™Ò¬?„’c¹4Éÿè¸»ôZ»ôşòÛÑ3İGº³ã`abÊ¼ğ¨#J†êBÑ¤QB—””` À€Ä
@ëA|QT ¤JÀğO˜	FTÈƒ¨ÅX"¦ˆ -Ä  8\Á ¡€Äa(Zi'	,L&XPa…6@‚BR @o±If e¯	ÁÀ Ø„,„ƒ,A¦ŒB(,I t M€O •D @!G ¸úâ& Ä¢4Hpğ‚E +“ "H$ @8 ß ‹0Œ 1‹„"Y4¨6kààD@&`©e €(‹\ÄJÁ6(D„ÂŠ Èm‡1‚‡z(€,@@\ ¿ƒR@)­C´‹'°:(ÅiH”
ÓqHQ8…A61Ñ"
`º¡Dì	 À4•U¤L™ÕXe ”‡# Ò ‘1È˜È D “ €È€Cdğ±ˆŠ‚„DX—‘‘ÊX.
ˆ@Éz*X#RÈ±À  Å€ ŠV,|*· ­èÅ(V•-:è	A®M–@ß@‚J‡	 ‰¤¥Ã@@„„Ì…I Â”hêR>ŠóD1ZNJ!ÕR	ñf?
cXEd³)Ì  ÀÑ%ÚÄµ6á.&$< €IÉÆÀ1£‡ÀÀ°$CÂ ˜°W† œ6Éz*È0X $$aì&€à b…3@R‡!W€C!Y@!eh*œŒ¨	@@ÍV@ ,>!™	z€Vb(@ªæIf8DP P $X„@(‘`AA‰b ™ä6E@p!š+å·À%$oñ´¤jBJğâ™M`&(€#å	ò‚"""È„3ÔP3DU^d
ØS$ !)HêÍ<€‰¾l©EÈ4Íá&¸ˆ–¤*Tf ¤H<(„3J6@­52"\Â¸#fæV!J1†@ ¨€ÂğP
4ƒb#" 4Ä è!RT($ @
	´€¥à—CÉ¥iÀˆÜDëH@ê`	 Ø¸|ˆº¶{¤n Ä ÃğÌM ”ƒÀ€…É$HSĞ<„†‚‘T"$ƒ4B3¡ €@ ‘!@…TIx.Àª,© N2ù `ø`…et`e$‰K0 6½Ù€C’A5h†‚Ë0T€J‚ˆ Œ HIà‰#Œ£ƒ„„"" ÈD@––PĞI£4IÉ”@h2Ùb
C ZbNÖ%ec$!ÈRD— X0ø0‰K¥’$Ø°QQT&›ªR ¯”Â›t 9B å°yØ 	  Ø‰á`:G’œ*@ pëQ™<9$Y\”d *Icâ– 5#‰Æ1))
6	H„J+ À-CTZÇåJ ‘m<°@RD *$4  5 Š rDP„[ß0B$c‚ÚzĞ)‚…ÁĞ0yQª$ƒË˜< "è¢B€1¡œ¥`q-3 ¬ˆí	Å
 ³ƒ $Ùp Ë„€fĞ	X I*‚)ˆ Š¢ˆFH4ĞÅ "Á †2ªaÔ:
‹` ¡ §¤X˜0ÎŠ¬Ğå… ¥¤Lá ˆìBÒÖ1 `AÃ) ,Ä BPç3°3”«ÂR€‚·È§	-@g‹@4H œ<@nT	Fâ@¡Bt' Ü*A7ØN}DÀÀ*… V…İ	 ±Îñ|q’$8)ÑŞ =Œ¨@aP°D!à~ •÷<*8fQu5¨m0(Ä v1’Z‹a‚…t¤R…€¾s@0L˜Q@)¶¡ …ˆ0@Å64ËÄ"  šFòÕ bËŒ`Bš ¢„
€›Ü@Xè* JĞ|‰… Á€‚Y`â)<š‚$Pƒ"!"8RDf#9€T *Ü€¦\$Q
òÁ€GE#)e³µ`İC€€5`F„¥Tj/ˆ`
 P‰LYò<€œˆ1‹¢(h€°L ·&•’°$øñK&"ÃP J† €ÊHB`EIA•iÈ	(©*˜†À°D€Ñ CQ@6äÂMávU‘h±I…¸*š¨#R $ô ²À8l@fDpŠCaÅ 40°rPz`œ@(š€à+ê(6th¢`	¨ƒbPÀ*€HP€Š`& C Ú cˆB`‘ÈAJÀ4‰è+ ôÀ€Œ"œ7m† €‰b4‚€©³h ™ÂJ€
p…ŞK „„„UT! ~G"®(äpåPˆ`V0!X0< "?ò“p‘ X pRˆ ,…dŠ… À	a6 È¸LB 4Æb8``ŒŒbÀAƒSµå’ƒø¯%:b4@Ëñ‘¦d im¬7jJŠ+…! IQğ"CL>C€1j„3@Ô J”Hd-ÀS…œK!AW‚HiJD%(1f„ÀC°@*,( BA @¤A7Sa J³á†‘„Y½R4dãâE²ltf@Má!¢bÊ€cdĞTA©‹ÄµÀp$ÏJ<8YtqÇXbbqdƒÎ@YK$+ ê'xEæmó  Ğ–}ˆ„A ü˜¨€(@H	ÂÈ€BÀ-*ÈY	fB %
$2°‚)óh‹	%è)Åq0(.HÀ)4‰	€à@Ä.I ÛZ)¡„´€˜œƒ´„ @—H–gä% ‰ À šÄE J€%ü„H"‚”Œ¨Ud¸LÑ€!"«(1”$æñ—WÅÃŒ!ÌÉ BwÀ*f•Râ â‚QÇ0ÂA"YbBB 5@ $x  ¤R¢ ˆü ‚© Âä"Ø¦²i¤‰‘„BPà„!ƒ€%¢Dš^‚ ‡€	Ge0%B	°WdÔ” ‹)\€¤LbU–D•: ƒÈC6ğLtˆ¤ÜU0(8fFG	•ä­s‚+FJ2©Ì£ÅgQ{	Ø'ğf$ »Â°$ 
‚A©Y" üÜqŠ!„`€p—`ˆ
 hÅ€F‚lØŒàP ³VÈLD‚P¸ ä`0˜$à`(o„#0‡@Ç.”,èÔ0€Äß´tfIâ !‘ OP°@¤¢!@kKÜÏH¢ea!D)„@ÂX4B ©¤Bp†‹ "Å“ ƒA5 ‘À@u‚Ô°HúA¤J0†©b) í€ĞàsÁ‹ ‘(JÚ4€â…$@ €PÉ:¥~-qu (E	1ix ÌJP*sàBAµA@$¢M2E@ˆ«BK–EÉHP	/ĞD…$RH–@¨´0 Œá#ğ0gCf10pA$„„Ğ0¹RŠX"‰$F9¢°jÑ&‚E`Á+$dÄ19@("( °I!X~î€™ğ"°€ˆ$Å$pHñ²`‰ìêmĞ0`®K Fƒ I$º A@£PPŒÂXLNP Š„ Y%@Şƒ
  4ˆb©lE¿¸8`x%B3j‰@±¬Et‹î4,ÿƒÀPdè?0t(H	šy€”B‚F¬¶xˆH8”HÀ£tBŒb°EÔˆÀ¦‚bn#³ˆ7„’âIW$FÄĞ # ¯¥‘`’	2T°€+T0i*™ÁŸÌQ¥i0'fH÷´9«€¤&”¨Ña­!!(Ì°D”ÜŠ ŠÇƒa ŒÒE*BA³p_IR‰ ğ†C@4A À"`b4Œaá&OH€ƒGdR ÊJ4 @
@R=@‰
a.8™&HDe!Š ‚¨»IbQ Q¡l²Y0F$A`(€€8"DD€g á†`"è„ h€ 9aq`°Q¡ ( Æ8·2&QPhñ `(NtŒD* `È&®\@DŠJĞaBEiC„ !‚4€˜0!	`„CNA(#&‘ñi§ NaCŒ €"¨`ŒD& „ (ŠÂ†gh¸$*„@," Pƒ¢\È€`JA:25Ì2HGLÉØ. a˜JàÀË)(JDâ´‚1‰‹Ç^&E(dQÄ–8¡€sËƒEçM” ÙC! @™	d‹
d¹ÀÒä60"H€© l¬s0"ÍÀó ‚œ-¢HL¼àÔ† !hÊ­Š")¨‹ „ T¤`ØlH€ˆÏ"*„– Aj˜@R@‘hé( ìŒÄL¡`ã(€8ˆ$:,iÀÀÀÁ
rHˆĞİ ‰.@„ğ )Ó D ·!/	â8Õ`‰BRĞRhÆP 2
Ø@@ÁD &ˆ+@“¬$I@_€eA!C Ú ÖdS¬ `Â#@«e¡’èdà §Ï p–DˆI
p‡€æN@v4šaZdœÂ8oĞÍ@Gàj@¯€Ààç (#¢¥ÁgØ*U›"À8Ä	$Z…ĞTIˆ-XD6õ‡`€ @ Ä¥"Æ£X@
‘‚†	ÂE×à2B|]B€ f ŞÀÄ¾r#,"0Qªh
 ! 8 fàÂ ‚ğD6
Ä¤0	2³Á„–@	‰	JR’!B:  	‘‚Ã¢$ È¸€D<4…  `$‚€£(.– F#p S">‰!CE ‘
*r„€€0°8‡ÙYD HB"WA#à "Ê‚Ê°&	 fb±  
eÀ6,Cq8Ãà( ø&¸ †İÛ@LàP±t	° ‰HRÅ>èG¦L‰
:„TYè=Ær À ä„†êOT `±-Ac¢.` (Á<†°ÌC&¹•ÂĞsˆ‘E  ²‚FBA	A@‚–M »˜5È!ä‹DÙé¬$Bá\€h†!qğÈIàBP@_$ Ğ
JœK¤ğ’àÀĞ¦
E0„ƒ¸ ˆ÷ÙwsçfóM_?Z³GşişÈ©aÿlwª”¤dr¤¯ÿ÷®ùwŸ÷eÿ’uÜ_gÑÿcîıšåéi9¹á{¦¤ï_çÊ×ïw½Ó{¶×‡}ëı˜×ü_GÁİóeé~V™ïÂ{×Ï%®_¶?ÿ«ËşNê^†qç¯ìßŞ˜Ùy‰7kÅôw#€€~>"	ƒ 1‡”€ª§KÃŒÂ@8V©¨šiˆĞLcˆ*€J2æTK† „„F#,1É Ag² EĞh%z )AÏÂÊ<@À ’ €°N@ã:•@ Ä5°Ê6°6¡LØ¦’ër%pDa€`Ôeº
€M3@‘2 P %„‚ƒöQVa5‡40’ƒÅÀ	€„ ¨9`@.T„ ¥ m@©!T (ÒÄ¢ ä éT7R  ¨`µ"
*¡»„ÚpP(H¸Â „	T‚ƒ«…
àğ–÷ç/Ï_Ÿkß­=ÕÏS¯ÿ\ÿçÎs}OGÚvï¿üÌoñ§©Ì,ûßjßÇì}mí¿oÕë=y'^NİkÖÁş&çù³¶ós·kmÛ§<<º‚íïO7¦_Äƒ_xı_>ë’@ë
xÿXŞùöÑ‡§~õÕ2öÃ/Ïâİı×3¨’HH¥ù6?Q@d€V DK „(@. €t€‚iV"q - €¸ZŠò$5ŒR=€'À£	ƒPƒ
‚É8"1d&H¤‚Ä€ägTÀÀH	È[`!qÀ†@fˆI?%$R
„„C5GU¯_)÷8tÚÏ¶¯W±õÓÎüİnÍ^îëz»¼ÛoïçjÍWSKÙ3%àÖ~Ö×Usİ¦¹'İÎ÷ q?óóz—gÏÌ_§æwÆh‚Êıû²lñíÿwM–ÿm<ûs,½´Ûä{¯ˆ©:ÊÔ¥ÜÎÃ_ÔÆ$¬¿§	Ş®n¼ÄË_Oôâ/`?Êè>)Ò×ê—Ï<GGcû,v€Ù§3¾vûÕìÉ>%v—sÖæ]5ûöµıçŞÑ_”û¯
…‰Ïµg·6òóê÷s{oŸò%÷ûeÏ=S›ûÿA=ÊÔ“«r×Ò¶v]WçÛ½ÿ†ïßsÌó>Ÿ?»ú-úæAáéÓ"W‘ZJ˜qT€	¨D+"TtR
Y
ÄQ€ˆ¥N0‘–An9‡…€%Š MÀ4ª  ¨@  ¢(à1  €P‚BIØó˜*Òe€K¢ä` ¤ee@1A t€‚LÒ€Í !€ &pZ3çßÅşcRùï•Şó™wøØÃöJïûŞªıõİ:•y¿Ëû¹=wò“&İQ¢ÂÃ_8÷õW~W‡Dÿbü¿OÿÍ¯ÿIèşõ;Âï±(¯wÿG;)Ó˜É{ÓwÜç+ËlGYİí¬áúÛßš]¾î½âÍ‰°~×ª^[è€Ø  Ja¤2 záR‰€(B@"i©P…Øî,…ä „Ò/ÃP‡l$„Á`‘œC€â1ù =Å‚	 B€"œ€%P
™0	ˆ)°1ˆ]¨Î ¡Äp

 ˆ@–Ô‚"„a•Ô "(€;È'@ù>áô(B@!VDY    @’ 4`À## [  0€£Q©Bj´i@Š
Ò« -ËP	¤Qeˆ„
jl  8Â!*B0j Äa´€d©ƒ& ‘ct>6 ªLV&1¢¶7®¯ÿ—‡÷Ú%Bê`UÖ%¶÷¿w¯>Ô{-ÿ}Õ¿ÿ~}üŞc].eÉ~÷„Ì*Í*ñ`îíÿ¦d	"ğşŞ¥ï~ ÎÓ£î«O1Ö‹·æOıòÓMê¹—øK3b´×¿v¼ù¹±³G½²ÿğ¯Jİp²ı8şgÕº}÷ß×¾{áĞé‚ÀÀ`l)Ú3ˆF	"@†.6hˆA´%	Å@`–d@v€H‚Ñ(ù®4,Jr!Ù3†”¨ºÃÂšÔEò€‚È$1B¤ ‚$¤@à¬`AªÅ4Œ
s’  $€3†ĞVQ £@DÇA ùş|PSŸ‡zñ“÷^_è¿w»ûôÙŠó~”5XWzç·íRd]–~×;İş¸òr´·ËÛ=ç8ŞÏ½”ªıáã;of÷ÜÕµ°f¿È½÷şïìòÿ¨_ÏŞ^˜ş©ïÅ-k·ıº¿»ş¯ÎÛÑø¬?'òß~oõL»üWù÷¼ªÔ­)ÒÚùë¥Eäiwm÷Şê[½ÖÍ¯ê¿ç½åïŞì­¯Tk¯ëYß~²ü—ÿùE7{¿¯ª¸fu¾Q÷z}Ğİw|Ø+läûÑ’™C½İ[cü{“O|wûÿÃïÙ¹Ï&3¿ï~ı^6÷›ßêùÖï›ßtw×ÇI„ad@3 ¤ƒ(DBu8$§q©”â I2dó 1¥"8€ ˆ ±(Ğ0KQ…PÎ&Ø@hÀh‹BB0Ò€ƒBwÄ¢ e`jrµ‰ 	 ³€º°‚¨&âÄ€¤‘ñ¢Â¢” @¨0€Ó€Ÿ£ïo<·üg’ü×~nnÑ¿üßuŠZöéßvß³ªÓdË­´GÃ^°ãÖ¿é?oövß/jõ?ì?˜ÖÙ²èfÏşØjëş½¦ıûûÍå®ã>ÿ³¸¶·5ßŸı†[3~?ë¶Nn~æ½ãşå½Sè®‡ô¯ıîÁj˜,ÿ+İëÜÿ¼g'mF$! 1ª‚Å¸
Î"P	+! 
j%4!Zp'A²(	&a ZqB83 ÄÜM4„8€—D''„SV€ƒÑ ¡¨D 0À­IƒPğ«\QÀ€@ˆ0@È xBQÀ
(P@`DÑÑ‰ˆˆTA&-	BĞVB‚¤E°!l"# ¡ÀpJŠ8PD
0»! Q™ä#A°bÁá(JX‘ Ä(@!­F&R$  õÚ’ ÂH’j’D"‰jZ~x1ÁM5À$Ê¼4&Hğ²1 E	C  ùj—<©òq·E»ûkoÿ¿ŸWg›Éáì9ïô}6r/;î\ş½ı!o_Íåïy»½øwò˜»q_¾¯»ˆï÷wÔsGâ¥÷w]8ËŸ’ß—î½ŸæQ×{å€üÿé®Ïÿg†¡µ‡&ıöö½÷²Ã}²|ÿÉ¿»×{Üå¡;1 D 4°W 0ªèÈ9Ş" …P32I¦‹r†—5‰F¤$`šŠ–¡,#¸J6¸¤"‡Á*!0 3*"5JŠÀT• Jx€,‘ ˆ´ƒ˜€° U¬@,PÀP´4E`"„ X 0$H˜™--cYi/·£ñÈ]šú—Nõhúÿ_¿ç¯²ŸßÎœ¿@Ob		Í~ZZÜ˜qÎ´ªkñÓºULjgwç¬İWÒÿ—ÑM{_¬7bÙ—í–®|ã€VİEïÁm.w8î7¾¨ÚÿóBö{êæì¶Øí›7~Ë¾Û~ˆÖè7Y£[­ÇûgôîªÜú¿Ñşúé_zQÕ¸ºêãâúµşn¬+ÏAúúõëï—6·ÿÒÎÊ³?ù»îûã½~÷79)Ù¼gQ¾ıÜE”_ı_^íDc×Sót•¹;²­~Şù´cí«éöãì¯]ÏÄ½l“è«Ö5óœïÏ¨·¿ã—ßeÄ¬blyœŒƒù" À¸0H ( œÑBƒ7¢Bø ¢ sÄÁá› S‹ `¦A†€èÂ”KÄÀ)áç
`€b#Á 0 # )˜‹  Aß"Šk„ R €
(„/ ÄD PªÂJ¡ Œ‰ècú üél#»õ_ô«Ÿğ½”±ìÖNÛ>–g#ıuÛ˜â¿ZLízÏ÷ŞZ­åÇwD{Ş{}NojUï8ùÊWxßÕ“}³İï:ñøø}„›EQe¿ˆ«#‰Úxıïë»Ïó»éÅdÓ¼·òixÏ×!$ûˆş÷QıkEáâLh* €dA'*+5°$%-j$( A£0£!$›#Ô ôAJİ± !(f¨@”@¦N@  ÅŒªS³¥2‡(‚ì Ñ ƒ½ÊI"Ú°°H…a­ÂP
:Ÿcª† qÈP,¤Š
hĞ0  3F"PB ƒ ¶Á`€‹¢‚	Pˆ¢Ğ`*)$´G@ÑB1eÜ ,HT oÜ#ì´.L€àaĞ‚à$˜@¬F@.Å+@¬I3
. 	·ğAˆ€áˆĞLP Æp!xÌ0  e w7Û_ÿîIWş—Şğ·º¯sğ|ŸUìÎOoÕS_œ¯[O°ùÄîmu
ıºòÏOÎ<Ÿ™:ıçÍÜmM—¹çÇİüh¬ñÉWW¹}nu”ß›ëRüO[ßöG4m;Aô.Û_ÿùuû½Ç2g”|¿òÿR–wew7vçFÿúcÜÿ#`·ÖÂ¯à@ À  „a ˜,A D°jD[€¾-q0B24qf$‰9p
¨  Fx€BL7` 9e”!*$Mà ¨Q©A.º&’lÑ€
ÉX-˜˜ƒ`©CÈ˜2(SÆœb€QP¡M=à¤16JJ,g@2_©˜¬Œ~ùÊoÍÕïz¯ÿ<-ŒİmÕé²ÿ³~c{ïLòwf£—¢.ñØsä¯¸ºİñ|õûóæ/_éuŸ·çƒµ^Kı¾koıÿ¯«Œ.ñwÁ³-š¶İ?”Ë»×—§¡³/Ñù?şÔö—új>¯ÖÚ¤É¿9Ñêı˜“÷úæ^7Eğ_AgÜÿr¹aÿòÚ¿iê›ØwtöZ¬©çŒJËO6ºù×·nQzéåÖŠ›iï÷|¯û—W÷ös—ÿ§}¢y·xu7ÅÿÛåûİ¾¿P„ñ7M6·á:]IÏgyÏİş%û^ö–öåñw¸ô:Úígq“9Ô¾·=? $€\ €Â¢0ƒÎI4A€O j 'N ×¬ %))/P„,€1R	eÂ3D  #&`çÓòX
3Ñ`EÊ n ])êtä²Œ hH"Ù$±	~ÈcA`†È”H=Í8À‚y¬GÊ`4€j$ÈIP$ƒ_9­I, ·f"2”@0Uğ$H¡“€±  #GMŒéK#4	Q€0Š« ”™$¢`I6Ê ÃBJ`I*B$P¨ Á` €dMI3¤yD%ÉÈ( Cc‘«÷u[y¾9êTD“ªÛ²Qşöd9î¿İAùÕ}Æ‡@õ|è2ış?Üú7Ø?ú–…VßÅ8ş½¹Í[}~¾í3°w(V{ú9ùPÕ×‹_öçá×<«M3åğVns“¯¤«†÷¬{®ÈÃÅ‡ÙY_¹ø÷6¬ûŒu?ğÄLOı§]ıÓäßâÿêsô_ó
”ºGíÿŸr$Ïÿ\×¿“ûØ¦Ú?É7q}şm^4ß6“có5ø^·s~ëWÎ¡~&¨ã[ÿ~æÃúy‡z×¾kú?¢5ñœˆpV<%+mÇyèÆo>]ß}ûéĞ7;ñ¿ÙÃã©{‹ô5Ş?|í[©«H
¾¥OÂ Ø€X‚§EÜ&¯€d’a‘Cd‚L£€¢G ‹@”«@(7¾°úF!P ùX)DA
˜º)	BEG†Y+|•õ4•â“oHèÕ@é@Ñ îA…D™0)…+‚Å®!–)B„DybÿÃçêøp}•·›“®ê¨Ûk¯uc§Nã$LÀ÷ş¼}š·Ÿ?¯eö=ı¯ºòV™g8>ŸâzáßşŞ¾Ç:÷÷.?¾Z YÙoïæûbK@ÜÛK~öMWÛîŸ`úÏ5²÷òÍ‹VŞ;ùeø6ú—«’¤z3ïÿåÆÎ{›–Ükğ¾ÒÚ+š ô.R ’ ƒD8‚b€GÔP …Õ!(Ì4:&äŒ]À¤-œ`80‚@b…‰tlD	bŒ
Ğ"-JÄH¤ !`Âæ7" ± J†
Á8Ap¹˜€*¨°SŠ¢Dà&Œ€ `)Â	œáà| 2ˆ` r˜ °´y % Ô¡ Q2TÀ´–R¶hÉØ€ƒiÀ °X°‰ƒ`  „\ $™¤
È¤$@
”©Á C,Äƒ;Ò#8ØBu‘`E	ƒåğD…@  'P*!Œ¿ı—œ¿÷gQï¤Ù&wÉ%S>ÚVïœã{Ü%ì±¯»+-»½ñ®Î¸îùÿÅû¿‡ı¼>b{MàüÛr/şïÇ¾Í8^{—²wı2Ã¢ã7íøË5ÈW±Åwc·ågU|¼İ'µÚ!ÉAî®ÑŸ´1ğq“ù¿6äCñœ–ÏdÈ1¸À;v¢à#$À6€ªW**Dy1Ô#ê4  ›†x1ˆA « )B ÜŒl1*`°Ó@ p;+p u"i Ñ$b"BÊ-½(’`@"ZŠ±eE„zF ±°@`%¤$Í! oşí¯ùöşoØ_ÏşZG·KÖ×k²_—w+>Ö÷ïE©ùÎ‡Á÷»÷î÷b'³·úïç“ÿNéê3½D9G6ó‹¶£—nJĞ½oûß¿½äú+wóßæ»¯¯cÃ³nZÿø÷{‡óMõıûWÿš^]¯ebXÚøFìóŞzì¯ş_óÓİú»İ|Wäæÿsfw£QÙµÂg®ùûÙÁëíTËYÿ
Ğ³5Û÷ôjê»=¸îß]†vğy‘fôÜ—íkŸõ¿İ—ß•òZlp¿¯ÿV}~úLƒÔ¬c¦íï_·_Voşïæ²÷ÿÚ¯£;à.æëåX§şÄ»ôcıç¦g´÷[³ñ)?ßß[¤„YÁBlÈ¢ ˆÙÌ# O‡I -2IÊà£S$2à @€†b‚â¸€BAäŒŒ ”Á¤àc ‰T9H®h„P‘)): @œ—`P0T°S:X$ ¨  =H&
šÈš•°´ JDòëú“çñ/ìîÎç®~{ıßæ»O~ıÎ»:®1÷c§¥sÿİ˜İÎtï«²§nûİeÊÎóoV}ï}_ÛçÏßoæ×ŞúÄu¹bnò§Zcá«azVMÃ£êM_é;oíWûµê‘Í×Çto·^½ûè¹Ïş
Ùß'çuä¿èaá:ˆŠ@N" €ê|§êêB PóªcHŒRPÁÂJ•¡a°‘å‰ ahœé²["B0$/Â@ @¡00è XŒc` è½AÀ¡RA€”V¶„Šl øˆ q Ô'Cˆ¸)…!ğ€  
Š Df²J6–ÈâP(£  tf `, 0¡ A´Ra–Ì! Ñ‘H	V`¨t`h0 ‡B‘Ğ‘`Ë†V ”•g”20(„8š¯¤  €šJ(”
*3Jªˆp á$O x
 ,¦bT  SßuÓßû?ºw§×Ÿ­p(Û¸…KyA³…ø¦nî)Çè\ş·›v çÜ÷­í]ngW°=÷Úë-ø¾fwö¦ñg>4õª¬öÄc©}ïÇ}Ö³üû¿oÂéúíä7­óµo¨ïß¿¼¿Ø¹Y\Ißéë·wp®¸¾[œµo½ç‰1ÿî—ÂA¤À ( €ÚU¥B(™€Ù €šKr<  ‚ƒ@€§ P  ƒ!ˆ  JuPÄ‡>Aä€EMDÇ²*E"
b‘XB+$kÒ4”$"WàD`SB…) #£Ã
Á˜§9pzB"q‚"@Lï·ûü
„‘;ñ^|ÿ¯rŸÿ§oÌGµùYî‡×5ùÿ­-–ùïCÚÿ„¬7;y—×îÿºğïCz‡Ÿ§ŠW*Ò«üußôsJk]Ú¨“ğŸùOÑÍWıYäOß÷„;÷PkÏÏµåß÷rû¢ŞñçËxÿkëÇ{î·Ïøû:7ZÿÙÖ®ìO«Ñ»H¹õ·™èçõ&±Œüç´÷–÷«»+ämÿŞ»"†ìuÊùm1­~«bUÛi1ñÇ'ò¡?{Í×zÈêo»Íô‰•ûÕgÿoG÷&ŸºO•à{ûg[ß¼s•»Ñ¿×í¢f/œÒİ¨·Êİ‹şŠ[3¶>¯Ş·²¨róå YN² ê…I°Ê@¸>  @–‚ß 'ëÑ<]"²h9Î	!fHD°HHDd1BdCL$@X`E¨ 0t(SZ‚0ñ$~88 C.+0@‹@U 3sˆGÁ94¢€A Œ<€3A…À˜Lu;æŞMéöOñ}ñ_ŞGr'unŸÆmûæáV/?ûOÏöÛşv[Åwéuï½ë¶ïèÓğ4z_¬ß‡ö‘ÚéßÆùİù‡=ï2+ÿö«ŸGÇûóåoy»ºwt}n’–Ú®ù/îí¹ıÅ—×m¡¾×Ã¥«¹¨¨+íŸÒ³­mSºÿ]{YL¥’†¶B@¸ÚÔ @@¹  MF3€ä`ÄEèâ•v³¯0bz‚ÀXQ¤'N°@qAC$Š«ˆhñ®…$ˆ·uR6ˆ
` @¡
“ƒĞ´s‚ 1FKFKa˜`V=`=ÀDQ"8Î2‚KQÎ[Y ' ‚Ò‚1DIv
,  ‚ƒn vPdax*pÀ@XHa°cz8Ğ!te"é P
ˆ„¼`Pn|¶"H É d¢B€˜á`°‰œ„” ˆÁ€@'ÒA$f$°è&ä]A@ÔÜÃãkÍÎÌ'½Ñ«eäÿœ_÷ g5Ÿ-OÑÕóöÿÏÈ ‹ÜäÊâãñõ§-Ÿïºî×=§ü·Ï´ìïÂùnıÿÅ_Î¯tÏ*Öİ*æw¥yõßÔûßPÍõ]ejFŞ7¬î÷—İŸQ;ú¨ìvSş¶Ì”ïEO•ŸfZğüågßáÙ(\ÊÁ$”MàÚ‘~´b‡6ƒŒ°R&^  0ĞäÄšP"© F+$p(H ÀÉÚ‹ŠU‹$èB‚_
 QÀqK‚^T ŸE”9Up°  P4!ª  ÀD e@ ”scŞ=ßÿ^¬øŸ©Ä_º¯ı¿ü~â¤ø‡÷	Æ'ëÜ;û¿4ŸO$×sïÓŞß~{úç=§óymŸÿ~Î[uJ·ÚÕl»Ï8´ß–;ÚOûmMs¬T	_´Õ·qª|t ¼•_×[á¹Ÿ†û\§Ómİ)OI8ö¶êÍÄÖı·ºmÿ—?¶??ÙÅ—ì¿ÈôÂÿGöºlg®ª¯º?|aaâ~NÍûÕù?İ_ËçïNûz{*Æu—sıÃÂı£åÏ}Î‹òøÏ„ñ¾inv§{ã^uò¡VåUíYÔ†rí¶÷ç&ôoûwÙ ËÏõÿ\İé?~·½ïwü–®¨ SDĞIDa„N@"@b  è€@„¥€2°Ü ºáFHâ ÄY! D@ív	 ÀÒ@(`ßÄ €<
Z­h •4PğÃ”ğ¤A–la 6”!     >"µƒDDfõ¿½„ÿHoŸú÷"æ_³×µåJ~ıVÏñÃ¦p?ıï{¹»¶eww¯Š¬‡{Ÿ{GQ¾óÁúwşü¿Õ—Kı¿înŸ]EÿÛÛ×_¹=Ï;áf|wíMëæÛÿì½³Ñwxıõï~XòùÑmrêìu»ñÛÄõØÈh° ¨æÈYƒ¡( $!À°1 ÒY‘B¡lc°`†A @uq¶	6  H¡,EƒT˜)À€¢c¨)Bà‹ -—
™0ã 	ª‚Z ë(†ˆF h:«²!,ì€Àx€Ã$IxÑbğ	”%]G %c ã
ÄóL¡Rô a`°AR‰`í‹…-u…P&€L i i@ l ¡ Â`(Å^A ŒeE¢H´#!m9äCPÛV R 3ˆ†©Ñİ 8EIÒ 
ˆÆˆ0#I*˜"0~ $"÷ü{/|ïùÇDFÇº¯Uß÷ş·~Ö8?¼gë¨nnïs·?æRoÒ£[Ôö­ò=æı•ôö]-ğ¿òºîõú~|IªÃUÚî½İ(ˆsßÌ¾åüÿ[]—eıß«x?\nô»zjeJı¬ìûlÁNJÿİoØHémãŞuÉ³²Ó¹é™«ˆ"À „„„ã)2 1¢’ÀhB€Œ¡-Q
@á`(Î  kÀÀF‚€•  8€dRIP¨0UÈä<÷Î"‚D'  Ap¦„À”QDJX&_‘@€¨d"H‘ Òµş	óXP€< p€¨‰wà‰5ñ td$ªw`*yt¾¤arH*õîB*¨ƒÍQ
$!0]$0à0HŸs£T€ğ:Y¬imİ sFáĞ„"B*dÀAPÀS„ÀDfTG¥–‰D°’ğ¤p„ ,:€ˆ+82Š¬x(İà° —è abC VĞ¾;V×"*	Q	ƒ¨&WfpÌ	Ğb€?°#'‚!‚à„‡‚€Â ¬§,®bø–!Ÿ`1LG°–KU€ÆÎH2(Ø)AH BÂv ‘4  :iƒ$‚*è£"0ËJ U¡@ Ã`E#„„#ÀŒ ’8,¿0D@ºà…Â`È"€€€W®@GA()¢0 Àˆ"bC >Árˆş à6@!)QÒK¤@J,H‰¹Å`0°°› ’-P„B¡u$š A@Î (â'€i•²`Š` ‚fã@Ã·Åv4„	ÀH«Òf8(‘/R€”Ô›@šğc¢"
;˜B
ƒ= P$ QnàbfaÔ ÁŠĞHÎ#R‰jå’Ä&: @ŒÄ$  N@ÅVqˆ¡šX ƒÁ
Jóˆ3ÉH2Dà ¨Î€J¡'Š3
€‚³€ @;`@ C48Ä)JB€ŠXOF—ÂˆYB(€CAéêš… ‚q`°ˆá ‚“	¤s&€i@Då4¦¤$f#U$ØAb„Ê ‚@dÀÊF)LÔ0Ã:‚N šKNB ˆÁŒ€©v„Ph…À€H†.K¦P¸’ôt<” @&á‚P;Ğ$HÈˆ*ÓA @å*@UÄŠ$	•B@0!B
d 2œ3@9 @Ü©@¥!Ã-GƒíĞu¢}¨LD¡V€p–4áZ§UÎ  °.€dd†²¶û! È3ÌA@P(ñÂ0*z€BÀ0`	Ğƒg€R2‰˜ÄcÄ2,¡c@@€‹	j 
!7tf40ˆâä$EBp5@vÎæj…5‚   âyAFÒ€&$„ˆ#| @á	PC	@š
0"úAM°˜Tñp–€Â`à
šhÂ# 8‘tBÇ ½ ÅAM¨A¨REŠ2 J  
p€C;I( Œ
¡Š"€`@©G‚4d•éB% g à*p‹À ¥`Y!8x"wy
Báeğ‘™|
 WFœäÊNG@@ Xˆ &` atT	‰À±Di;Á+BÀÌ\k á ÀbqyÑĞ@ "òA%º“€°6b ´ RLPB…Põ‰  ™W¢„Tª!@ 5à¸ÁA€XU5dÃ¢‚@SXT°œp6D!HŒ˜`+™à€óˆ<¹Pµ@ ‰E¡à«™!—„/çAØ”!Õ	„³Õ)’	Öd`/’ úÁÒ € Š’!!1`UAÜ’–`%ÂÅ”‚˜•d!ˆ¢:-c0#$1	 Åsb“0Ä 9'PaCA Q8@ÁJ“ Ë(áˆ#h$`@›‡,ÁvÂ"Œà!pPBĞfA
<ƒ¡g5“ € €@A@Y¬
ÜGÄğRU” L´ ®iö€rvHD 9ÂPÑ'àJYÙX´…îæçÑ;
 :5…G˜&•À²Iza	…Q‹FÊ°ğ Xbáhá P¼"À X ¾À
)70#H/  ê„)\ğ˜¡5½Ô “a'“€y€ ((F Q>"5VŒ`D 4‘-…B@d¡BD (€p ‡€ ÈÁ‘’Á°œ£ÃÉh‚Ì
¾9M £ƒàµ€€¤ŞA?0™ ‰€J¢P€Úé-ˆB!ƒ 5Ó\pÈ@‚á@€Ë `B±	4(bp§H )`„ <cÂY‚°J&4 €8¨†N   (V`7‘2tåe¤à‘&*p‚DDŠP Í‚T0RÀePbPd!ÎÉ°C“xˆ"” €~ÑB,
$ApÂ@~İÔ pFb)Ip„J |ÅÃÂ Ğ<Â’%…]Š©$`¨µWŒ J„wXö0€0Ê À¨ÔHÔaDè…3$Å @™$®À"DƒUDŠyFP¨Å,aO„* °RX%ÀJ)"Ìòcx{+a‘Ï:YŒb( 3"äÄL€„á H”¸@@–PHĞ$4€07(pu#ŠY–/Ê  (2 :ÀBSU H m!Š  œ   zY!Á=Â4
dH©00ÀE.%ğ’ B&†¥hKÖÂĞ£ğS*Ÿ<PÄP!˜¹€ ÀÑ$ÂëĞPud…
€(¤ ÀÊ1 +)§ŞáªUyĞ”à!¡7%A ’*‚f*&Ä*û¨şÂ“w†!cC$eˆ´ĞŠ"„ZSY"  ”‘‘¸ $5@ €F¹¡,€I‰p+û @1ƒ@J@€‚ÃY#ÜD|€ ¤"’J1Êi

Ş%
Ä?5	ç €€@¡æÕÄQ± ´‹"€PàJH
(  ˆšë€01Ds˜ ã“°6 Á3`P%±‹œ¢$"¡  C
78#À! ‰ Q4e(A8 dWqAÀ@Á*Ì I<Ã€Ğ©
f¤ P>  d*BÂR2h(	§ Á
-lù1ØÀ‚ ;¾¨`Cp¢8)0B°€u$aĞËrğ!<3#90´ÄÊ €X„hx²¨aDœ èHCJÉQH] €L¢`²$–Âh"’©Eˆ°ˆ$0-@Ê àP °³`a H‡Äv 1ŸC- "I@14*p°$4Ú,ª
Á:PÑE€) ¹ . ¡©hÈ„ı 	2&Q	‚	@T
L©  l„^’Ö†a‰ %Ù (N(,@  £ÚDˆ‚ «$R4K@>< Ø°¨î,Âï+Ìx$€X‘‰²CØUq6ÀRˆÀÁA‰ DK‚„8#M±GkÁ  ÁP%È
X°
mäˆEÁ‚5Uh„°-¨ÔÍ|2€@@H´€"^)lˆ˜À8uÒ¤#€ˆ$0jh¨@3 ' õ9%@$È`@™H(	ŠRè:B"*XÕDÚ %ˆÀGø²0 ‚‰@Ì0Äiƒ4¢&Ä!h£(qdµ5I@„0Cñ`€sAE i‰Edqªà ˆ0ù<N& fpA‹öÇÒTDKĞ,ÂX@)6¹y'IµÑĞ3ŠÌ0r#å!öy	Œ’/*Eˆf+Ô¢¤!ë” À 04´£ÈÒ$@0HLÀÂ
ïP‚S¸Œ€<t¾(áE´	À@	‡sÄnÃ  aiZÀHHDÂ*w…@#2Q ²ÀAR*ĞüQ<tE°| VĞluÑ3`#DEĞ 
lYë'aªL(Á¤  @¢"b´((]â’@„t‹$T}ƒTğ ÄÔ%Z7¤b°x7‰¥x¥IÑ‚Aƒ. Bm¼„YCn•„›w@Šª8¡4èÄpeO‰”b$ 28Ø–6(Dv²E‹P"ù 	 VÆB4 *J÷	h,ö€¨†"zä¡ YbR4¬Aé ‚4‚
àÒbd&DÖÂ…j	> èŒ4%±È@kI,«Å$E@5*–ac´Üá1˜öŒ­ e@V´cÅ´¢F0à”WŠ›¨@¡Z€±È*ğ$Ÿ2¬È1`‹EzÂ	E2 „[,€Y˜?Èa È¢@( 12àğ“BŒò(B ÊjI	Œ#àJ0„‹ñ]¦&± G0 ($*ˆ ÇŠ#ñÉŠU¡È¢€F¢AÍ€#`Ï°2a!4àdø³~"<—E€ˆâ&%@Õ" RÊbá–AXÒNI QC ‰!–Æ)¤0F89"ğBì0	X•ä ì¶±iâ2Ø& 3Jà¡^%R= 2Ñ °%úÌTa ,0š€™ì§€¾®˜!¡‚ÀÀpª(Á@r€R\*¢xSR±I6")  $D
IÍ°ÿZ´i`	‡P‚  jFQD  ˜f’ …Ä.`2\I)r	l(à R×
¼\­?€
 &HÔä«Ëàt„€Ì8bœ„‡„Z È	QŠ$Àˆ2¢P (‹¨@ †ô€¬ˆ"Î a…Î"aA.º¢  ¥ÀÀ‘Xe8B„¿”""p0†!8„ÚÆˆpê!AA’ÅXÃ<X  /A€CÅ ;S$QDÛ@dÈ£Ã`åÒ+„Ç‡ L©™Ä¥`S:ÁpŞ0ê %€„†3ÃhÖH uF		"b ˆG°!S€¸€×È(±`D°‡0é ÀH<B°¡ 3†‰n1	8#’¢Â%*š“(?€$¡™€ˆJë	 GA°€“3 2c1Æ0¸±¡y@b9¥‘2PIŠhDUD@Xn2
Pvq¨F±$e|›„EaLšÈ3U‡è¤J1 %0P8¦F f< ¨ šJ˜6
 I°°ä ğH8ZBÀ%”¯¨(°˜¤€0DN1P¨t@à"Qp •(½L1”–L+  `)Vo €‚$B²«g0ˆQdÉWòb…úc2,°Ó¸$c@F§]Dè’dI 2ƒ2r<p˜¢‚!Yà%3&Ùá£eN$! T,QL1 x¥0¨Ú	HH VYÃ <PªÄ…P$Q „Ê/µ ^@X@¡EÀH^Å$( 4 ñ&Ât@!`¥ Z B” ¨@.Ì(D‚á	ql0&‚B À@’4ğ€Š4Ã†”±!'DŠLB… Ä„¡e€sš&0%Z“o Ã€RH P dbaAp°2Oø™22d‰0 %!”'ñ-¸ğ•*!Aƒ ±…LbÎŒ`j€(0E 
M´¨.4> m@€³±É€E!"h#¸0É†s ¾GÉÆÈ°#9˜€@PApb D°B3T€ h†„'E0@1ÙDQ¡ã|@#}Œq0¥¤€DXJFœòÉ%0h!@“p!Â
üÁR è
­„!6Ğ  $Œ"G@ ¡ %FÈÂO€@A@Ëb¨=@<'=‚"A$ÄÁµ‹ ù
a¨#twÌ@”©ÄŠSáBD !†{ˆèÕŠP,a<Qã
¥
„`Y"Î 0P‡-—˜¶?„b 2 –“ g¡¸8$H ((¡jÃ‹(
 	°€ËÖ@Â\†¸ a$X
Ôò´*p‚…âV€s&@HAµŒƒ¦`BNˆ(#õ¡ä€	·ÄH!¥Î1D —0#1DÃ %l$E5a´T(¡ŠòMå° ğØñ·Å`„à4án†H"P ˆÁEe*±{G%Q”@Z<Ä™„°€PXŒ„P‚ 
àÊ	¨ÀdØ 5¢*âö0JU“¨XhŞF @’Tr¨8&$heN(" ˆ@
 ƒ  @#	h!PAe€ƒĞ‘	T6 g)^  ˆTJH&U hq@Œ^ Œ€@¸+J4.Jøx À¶ÉYĞ–b…_	Ù   ˜ ‚äQ7™¥9!D@%â€31JØ=Á?à
É|ã¨‚À	À”ÁLçÍĞAfá+ø–#ŠìåĞ(¢Ñg$)A€„V À—d€ÅiõÚuÌ@ dğ[ÏÊ€,@)L„ œ7$†""<à6€¤`¸frÉ$¾/I€¸’È@‹ô\Ïqdˆ(@d§^`šÉÉ¢õƒk€„´D¥A@èŒÔ€ÌHƒ§¢BZq€Y4CÁ0-Aöâ W“©ôe‚¢h±ğY&DGÁXAlÉ#$ÂAa0„0šËg Ä€@ TBÈ@@pXá#X8º À’§  Ú±„¢_  zHf1tEÊPB+0( W1v ËÂ2 D¿	" 	ğıÑ(˜(\àM„KĞV„Qd?
pR
!¡ãè€rtxŠàö@‹EúÊ0Â`a„3* ¶Œ’crBB«ÉÀ°@"p†ª”J–O9¦f`p†0€¦“Ñ¬ÒBhÀ|Ğ¬EÃ› ]¢Dˆ ^¥c0€@à(‚À¢•¡¢	’¢Æ‹z€ '84VQ€/ ZÒ	0h€0<ˆ! eĞÔ@HÌÈ`ã„ØÜ`F0@p„HZ&)Ğ‚ °FÖ(Á
ÀI„jâV D¨ "„aĞ	Eà”&1.°  (P9EmN S‚%L 0 Q:aÄ‡r``›*’’>aåP¢Ï‚@ä‚@5„-é:<‡b"±@€¤/#™"»Ë/ğ‰¡› `5Â±sL#±&aØ1…   Gd"ĞA†%G$ `I‹‚ˆ,{i€—†ì”N¨)cP~MÖ*ùŒ;£@—c6HÂ$°™	”ğ%  @#UÆ©•$Y0`Ã`LˆR ¬4¥€-Q %ã,"q©„%ƒ ‚`¼F  Õ¼€D3Y²Ë´¢#¼2B(z€b@øf_¥/#P¤7J @…`ZIŠ
L ’ ¨)l &çTDBB@, @lÍÍ	!*FĞŒ‹–@\Â  ä$x ²
PÒ¤SaO¨1’‹ÕbÀÖY˜Bd@B¢É¸Dƒ223 À8ÍÓHJ@ğ©BrpÖA€ x…4 *‚‡*Á fí%D8~A``báwI¤ ¨wA=Š-10 ø ÀJ6C"jÂ€a$ ?&’(Å<ˆÄZt@F|T€D:jHXPê*X ëåº@z”`•"@70'p)À~(c˜’A8 *ÊqHP;°À	ePØI$2È@U•˜‚€H †ˆ¢¤¨K)`£D– $ c‚$#ˆ àĞ 1H@
a@´aÀ QÅ**eB@4T!È!…¼dAÂ¨ĞÆBdSœô
uo $Ó¶L$Ö„ Ê„‰8ò"„€°€Qã’2H"FŒ¦-èR,‚¨7†à®€¤Hµd6U ”,2!€Hjf22	‰A$Æ CĞ*¤0BàĞ³Í4’ ŒD)¸›$9
!„ˆU)Ù`ô	`úà  0€8€¢8" B³¾€ÈC0L¦¨0X*!.€Á2–{Ú mQ@LŠ	 ‘"²˜—L|à¶Ågâ@Ìãx²¼"ÑÆìŠ] QfD Š€áO†¹ˆåpq€nÔ"@ÊÀ€R )@p@*§T !jŒ*A¤Q%” B0%Æºh†0lke˜tè³ u&ö, ‰J 5d b]%È9ÜàˆgÊ L†DÊ@È\”PŒ]  b!õ
´N2 
P‚L“H0Z… U˜¤XÀ(`$ˆb°HE\0Á áàxYÉf”àd(ºôa‚q ¶ÔD”LfA2@ hjxt•HØA&!†@Œ  GŒ$`?¸D"èL
†!¤ ¸€6YLC!‡Èv¿Â—P`¥ (Jªa â_&‚4eev@ HCC·èÃ  1G$.â!3ô 43Ñãh#50Æ!Kò Å+Ùr@ ”h?Ba‡„$°¹a„1†‡€@’„rPÄ!%dDI"X!"÷Æƒğ ¦2„ÅƒnåesèÎÃ—ˆ	Éè ˆ pÓÓ=#( ¦¾ªh  -Ä‰x„@ÀZ7ÚâD¹º (Ô+°Eˆ!CR<€Ë¢\Á   #”Š:61…B£TÖUE¡	H …F à€@€ 0Œ¢"!	’”<È@TB`ŒH€*†H14˜0¡
–È¹”£˜¼0XM ˆ
Ò–@Ä èY" t ‡PŒa „„PÃRÈÑÁ†ª&"Œ±F€PÉ
A4“¡V ‚ƒ°à’,Â %€H/‘€€ ¸)=@
|‚ ¢4O ñq Ì¢Š–	"ÆJ!@€$W)@ 	!K`!`Ü%Š‘*x& À;8@è¨’TïĞiÄO©€ƒ… L"%”0
'â*„	 Êˆ9¡†  ÈğDs
€>@ dâˆ€’ˆ7@†Ò€¡qÂC"éHÏDL„Â,	°ÒCbÂfdÊs	³$jŞ hÚ	…e¡L‚#*Ñ¦X@¤ƒ¢¼#xÌ0ŒÀ) Ô	,1‚Xv¬¤¤a€,eØ™€˜À"4ƒ)<*„—Í¡l€‚j1D@„ 8’	#a@¯%B$ 
ƒÄ"8ÓQ$³ÜR ´á'õp`¥…ĞJ ,HBD@@& ´‚ BI–yIù 	 ‘ÁÒŠ$È €øƒ8÷AqB˜¢4T‰‡@e„é C =€K†`t`€Œ‚¨÷¢Ä#È’§r~ C¬KB x3ëi¬C –\^' ¡má€Ÿ®2€è¡(i!rõ@”ë  h]à¹ƒ¦¤¤Ğ˜ 8‚QĞ£ Ñp´@ÂTP S`" €  Án B…ÆØñ@ 	¨9D”¥Š!aJBS õG!‡ 0ĞaW(0ŒL%!*YAŠ(Å;1@o¥¡‘è) 2è@HÀÈñÔPÑ( %¥(G (="„$·   ‹†ˆ¼P° „„* ¤è !¨e$B€E#Aä$òRî(6RY Ô*ú„€J€ä„$!P`FM I¶˜0†™†4À“%C¡’5‘H `>V‹ò+Rƒ€@@ä0Üà-Ht†\p „¥@1y…‘!CpÂA¡œpDªp	-( Ì‚#†kI†p`€O€K^jD?APÃdT ‚WA•©º$#a`†‰`$ÎBài¶Ú*%ƒ©Ôd„@P”Fp­  Åc‚¡‘=8Ir‰¦4T}  !0Œ ÃQÉ°…
 `°V
€‹b´#“PTÉˆ?•@¢ ˆià¡
 ‚6`EDÍÁ²BB,uL¦,  
ˆcq! ¨$ € È€,¤JV ah4ˆ‰@†â	„Iµ‚>¸qˆZ‡*a8½«×^Ÿ‡÷ßø¿÷¾äÃş®¯şíÚ»·ß¾şÙÜïõõP‹í¶¹±³ú´¾Ë·¿¬¿¯ï*}ÿ6ÿ­‡léıÿ]›SĞş¾í†İ_<{úÿÿÓßùPXæ~ÓIÛeş^q¿óœë¶¾ÏÿÿzŞeüíêÿO~FÇgà¾ªüÿë½Ù7NöÏ‡¯×vPñ™@•&*<œx
	p‡ ÁqO€9 $ĞÀXU•)D±dl²2Å°f şËÿ4´ UHs’	`†‘œès@rGÅ$NSU€ò
òĞ&€è "n¡‹EÍ=`3IH(L *ôñ"ZDõ?`”Kh ¨ZÅEBU¥à9ƒÂ™7 à³&Ş y ¢ÀÆƒK¥2TŒŠ½İø%ZÑ ’ƒ ?T @% }‹@dIÉ1GYGğ€€¡„ á@DR'à‰’@¤ *PQKÑÒÕAR>
,$"O
 Âg@J ×Éó{ßÿ–›ıZçGÿM÷òŸ)û;ÆmóŸyE7ÿ¶İë=Ÿşû¶÷',ïS¿ÒßÜÿZÇşÿõzŞı~Ü–¾Ïæ;İC­Tw¿ÿ|ñ'j|±óÿó¼ÑÜ—û;Ævùí|ñí½şß¾¹ÿ®¶Õ§ŞÖiï?ÿºyı{ø?øò¥¯ÉÕ¡cHB­Â»!€2Œ8Šq€çà`GÂ$\`Ä¦‹Ä¹&4\-,˜€£!Q"¡˜ôt*™­¡½zÆ Ô¿RVYGDlA 
‚@–‹p@îGİR p‚P€W!lP0¬A¬Æ0ÃbP\ƒ&ZPÿßí«å¿ıìZ¾¿w}ù·G3cw|ÿÕ¶ÇÂuö¿gímP×ûñıñõNûûÿß'ooçëxoyïó~üv¿Ïß¾·ÙªïSUï¿ü›'÷ÊßÆkí^=¿—÷öoÿkò~g¼/ß}İùÏ_3ÿÿ¿l'X_lo¿ê¿íÍ{9Ëz×«mætö¿¿öëÆ/ë^Z?£ŸİggóoÉßÜ¯mîÏ\û>Å±Ïş6ŸÇ™ÿîWFßşTïcşj¿Êv¿W®şø¿õ)Sÿ'şõí#Ø²Q¦?şn/æõúî{=ëÅ®ß]_Ûõ¿gZMı§o^ü¶ÿy³y¥Ú»İİêüóvÏ¦üÛO<¤ª’œ¨Ñ	Ô3Ö£€—"€ p›¨KšCÅ!Hn:6‚ŠàÖùgx‘¤óO@e¾
äEÚ)'Nƒ—¡„zCpÖ©ûàº<‰W;w¡%‹„ó¤ â@ÀĞ8w!9“L!c	s@º ( 4@³Bbq÷¿æ¾ïÔùôOŞì+ÅÛ‹÷K—ûC»š‡=ïş—Ÿï|õãí¿ÿø½iøfïß÷í{Ÿï:š½ƒî3•¯ÜúTå?¯÷»ü~K{ï¬Ş~Õ¦o¿»õö¸N§ësïÿ`©ëÿz;´¿Ôÿı^¿Ÿ4¯ZR­È¸÷UÍ1ÛÏîš¶VüÿÂÂƒÅ¥#,ÈD(«OÔÉAHƒ3r:Q%ÉÀi›fT/Æ‘ˆú	¶‰
“5jFVÑÀ'†}’­	ØXnXB& =m4PeNø )!3ST\;ÀáµS”P>fów–iTµ`9*@·¬yî@@òÎ©6,ñ7PîöJr‚ß}wğ0Q¸8 ¥Zş-†ôhÂÁtr(H% …PĞX 8«DŒ€!¶sÄHRc÷ÒG¬ x¥Ğ x€`÷rK4ƒ…	¤* a•O
Àâ	ğ™(ÎÈ“$fALŒrl€Bßn\„ÇŞMûú?ì¾óìyÛLªá]ÊûÇ[ºÖèŸ×ëºí¦ë«iv3úûÖ[k>_~ÿÿë¶r¯îŞ÷ÿÿûŞ°öâıëõ¾Ÿ¿Õ·çSêÿw®Ùï¿ò÷7çÿ6ÿ÷·ıü¯·ÿúyÛÿŸßš½õiê7ÿÜñ¤ıÍùó¼¯§‡~ÏüA~†T HÀ…FKœ4
˜ ©™ŒÁzÀ^aĞB;}ˆ ' `‰ dò )qò	T„àÇ@G¬FÙ	TçB0üf’ıItñÄq€ œ‚µaZDçâÄü­ Ë×4^	ˆæ§N29„Ä"4XøÜ¿÷·v×Ú¹Úi÷<müƒíwnóŞıò_tŞí×÷¹oôÏ÷æß÷¤ß¿j5~Î_®ÿéı~»Âno÷ñ–™ùß.w<ß‰Ÿ÷ÿÿÓUÛÃ®ï}‰ş«|oıüö[|ÿş­‡£[ïI¿Ö£ıë«wûİ¸¶ş½õ/Pİ®ÿ]á¯gï¾šî·Ï”¶´]ú(:ŸşvÃ2¯mI¾ß¹—{fø¯ÿ·½ÿ¼úİ<şı°Ÿ¾0üå½î]ùßÿ/]•|DßÚâ6ÿÕª¶Ö*õ%¼½îıïıïİqîşåmÿıv×ëï‡óû],y»Ïüï$_1ÛXcLßÖlË‹°ıêmëİÿı¾·óÿÇœïyOèACØ#ÁIÈÀ)…€Aº !@`…hQM™\ €ŠHCŒ:RC¡¸%‡Bp‘:ôñDÃ‚TßBä 2ú1B @t„9)"
BRç ,¼G°\#T Ä!L	xDAm8)PÆZ 3ä„ ):Q·öıáS¿÷îõ¾ÿ¶ùue÷ïÑñïz3î¢ïû_—êşßÇîx‹Ûó¬?çï¬ÿco¼ıöİÛëôìÛìÿÿïéùÿuµsİºıëù¿öiÿ+2‘¯×óËº–?Şıöşúúßøe÷Uô»ë¾üÏüjw¹ïÏÿ¿ÿ¶õ«Ö Ï{ÿ¶¿â€‚$#“ ã€Š €	XÑ( e„o@â b´B4@üG§Q™m¸1 ¤M œ0ÅÔ¢sÅÚ`t±ÅbBˆ ã‡ÀHÖ%ÄÑ8j]@„ À…<„bj0Wå	zEÒà™*û¢e] Ê:¢‡¨^
 ¢1 8Ã	ÅúY”¢pÕÁÈxßjp3–±ìtÀ*!™R
€± V7’ab ·i`:Ãî‡xÄ
`²…—à0©åÑ‚şhB°@Ä~üR„È§Dn‹?5?._¿»{ûNŸ¿zûn÷ÿ§·­½núÄs§¿ø»»äT_ßˆ0WFÎû¿Í§ÿ¿ûo_Øó¸¸÷ü/Æ÷æt[ÈqÜ—u·qı»¿ü¸ÿó=eó½•ş»ıíárÎîùí½s¿mï×ğÏoÕ^Ã­[¿÷§çvıÿşWGæ_ı«ü¾{2%DÁˆ ¿0-#^,F@À'*aö%–R&…	ˆ)lºÌŒ—4R ÄgÂ€ÄÚª‚ Ş#¥t L2h¦AˆD”şŠpi T¨œñ €-2@CˆìPF‚)ŒcV4±à@ÀAÉ9B#úÇºìzûpp§ü­ÛÎ÷¹ûÔõwê÷òíİK¾_ò—oˆÿõkı×ßı>Å>×·ßOïwX]ÿÍeú÷çÜ·o!ı·G?ÿ¯mßü¾µßÿoÿ[ùğÿÆ›{v•¼{{–·ÿû_Œ‹Û»¯öİ˜ïûµ¯²õîBÍ÷oÆ×o¼ÊwOç”æÿ½	ÿŸ=Mê*÷úÕæóîË¾÷/õïõ÷˜†èÅûõÿİÔ÷äşº-CnŞïÏİòâ×ÊnãÓôı×»²mıÿOp¿õ]ïÚ³Óóø~Ñ¾NİåöŒı®óñì:îæßë&Ëò_ÿ=ù–üÎ6şı¾¦…¬Ón/ßÿ÷ëÓÁ`hÃUhYDrJãIƒĞÁ'XqÂõ­"q¢Ñ^ W(P`R¸} 
Á—)b´C¹pè¬Âb—Ğ‰ £°É >áˆ‚(@8V¤h.‚2 `”ÑB@y€ D&z¬R(Ñ(Â0ßÊÓ$+71ÂÑHpL0æïOöS¢üŞ¯¶’~\/î¿çNv»ıß¥Íœõ9šş—oçÿÛ…õ¦~ù×ÇÖ{÷™ìÿóù§ëVz?íïZ^ÿÿ/¿ù?s½›¼KŸïåwşıÌîÿ<›§7¿½Ïişùe8şŸ÷Wu¶ï{Å9ğûvÍúîwózĞşû·8ï~¾êîRQ_J ]Vè. à<®Añ‘eÒ4Ì| 6P'IA`EÓ¶42A ™™×0rGÖ 
Àb „D1GõzšS•Q;F&IT=>Bc}9¯D¡@d²	NˆP1rc4¾ã ”‰ WÀÁ äv!&€QPI£	«Ô±ñ498‘ÔPÀœ4dH ^!…TH@c.PD,ª8@ÚáEzGÉìĞY(, <äÅq…Ø[ªéÄ ‘%˜Â$QmjPzÌÕ ¡¥È¶Ö"“ğ ú¢d	°à(œÑÂ©'"Ğ^ÏQ€€ğwa^€òF@B@–øşW>¼kî÷í7/·ÿŸÎæeÿ~ßm^ÿÿzşıë~7w‹{óï½ÿ/ïæ/ïR¿í×ıÍıÍ«‰z·ogşú¶ïû_ÿäëoŞ‡oúíşùï¿0ó%Ûgé÷µÏóÕ½»»yğÿßûØßÇÍí½ÿ=?ã—rc»ŸôÛ®œëå³õ²ùÃhñ'‚`1À1 „#ìò ã ´B	P\s(y`AN° Ã>â"ˆŠà#¸¯aiGÁ`T(¬ä€¢Î“Š(,w‹„DG¦!µD"À„LRª	#Œ&àt P9‘@DÅÙèD'ZÇ0A‚e Ï„©ïZó4Ûïü+ŸømÎÿw¾;üÉÎ/¾úïèW[o÷¹íŸ= İş?yu~qûÿóş÷x›÷Ë³­»^ñ¿ÜşßÒ¾wó˜{ß»YË¨õí{éşn]İšŸïÜ/|õ\)çÉüg¿+÷—ùmÚìÕ}ïè1Ç7¿çÎ‘¼×Ÿ¯ßgöï[¢ùÓ|ö_|wê)Uÿ;«ûm¾îßºêô-şUô÷Lİ÷Õ®w³ïÏÛÛ{ÎÿêNÿòv}y­¬´¿{óoë]Æ¿¾Î,ÿî¼ôvÿ»ûüî_Ÿû¿­ªnè]?÷M÷Ë¹öµÅü÷÷}`†µ»Û×Ä¯¸÷ı}öİ¢¢™$.Ã$Éˆ1 
Kâª.0%Æ10yIH Sb @àPµb€|±BI&Å£.CÜH	$b¥0C˜|  À	jÁA4 ‹*v°‚”@ŠÀ6G0âM\Glï|–LMT û”JDDÆ÷Kş¿GµÌÙ¿@nc¹ı¿ûÿD|ƒYìdû|o¿ÿş~M¯îõê¾²’[‹ïmï¿ê<uèù<w÷jıŞBšîùıİş¯ûñÛŞrúcîûû_¹J%o}îu³vç‰õ¼İJ_è±¿¯çfŸGç û;ÿïs{÷ş©ûx¤øô°¿w9‡i > “?’â‚ˆ ˆ`@#
+°BÌìf¬2¬W2A+ââŠ•ˆtÀƒF ¦ æË_  bA)„Åb”‘@òğ6>â€`àU 5  ¡ìÃOqH§´Î(”ÒĞ:…îpA€¤L.‰Ôg@÷ÑĞŠ!$@G.@.l0“¸ß˜`2Ãè q±`F•'À4@zÑyxdDœô€m`«ìğñé0 ‡‘ÁpĞæNu@@€,T4 ÃñkˆõHë™„áiUmLˆ‹³-ÆF¦à09¨u­Õ$eÏÀxŠç­nŸ Ú¼É_nîßBƒ—)ÿ[ë M	¿¼ş¯ëïı¾ÿ|	=½üw~_›´ÿ²æ¹ÿÚüoçê¾	ÖÿyÿNÂWÏ;78ÑÍhÿûRzä¶¼şİ~£ÚïÈßïëöA^Ûpó¹İüõÓ¿ıçí÷Úß)ïlÓÀæ qgHÁò²¦Bæ=Å™êœ±Ù¯™ ’±Ug‚&C2_"³qŸ èBPòw‡?Hexâ…µ3´Œa€M_`#s-†;”<±7V ZPˆRŠXÛƒ•DD+X¥ÔQP`XC—Ndmô¡SIÇ&²7¡_~ö"î¿Wÿ«[¯f~%Ö]?şmÚûî)Í£8ÕßV·¾ËWû¾Ÿì¾K‡³ÿ×Â—“ÿêşİ÷Ïş!$¾Á]î÷şçşİnÛT¯|Í¿¼ëqhµïÿ¯us¡~µ[§Óµ½n·Y„ÿ3†ï_:¾rëß¡›=ßjùü$ñÚ?ş.³¾¡O3‰ºø–­•ø!J-Ç¿§şêó½×ıµ¬¼¿ŞLî€ºZÒïñß7ô»}ÿS¶„+Ù?Üªóÿİçÿ¿T­º^ÕµBoØ¾óıı‹—¿šÎÿUvú÷}²ûYı7Š~¶¾ç–ÏFL7ûÿßkÛ°ªRºÿê™˜t£€ò:‚‹<è!ˆLâîÉ°Ên‚E@bj ˜"Ê5À­Äí ¨€+' è 7ƒ”L$t°‚E‹àOµ0ug€°?@d%‚@Æ†.PUÔÁp¡S×¤œ1P˜®o R…HqU	Nj“1„„‘ÃCW]{¯¾Œy³.ÏïÍ‹ûÛo`7ÿXòoµ÷÷¶d‰Nİşù‡­”/ßï3Fæ£÷ÕôzÙ¦mìÿùÿµ
øÿû‚ãl}_ÿ¯po‡ßÔşå?»sİïAÛ];ğsÎs9}›ï?›ßà(Mï¶÷ÓÏJ®İ¯ëåÓõ¨»$µK×şÿû',ŒC&qõGÖÅ»´8ZÀÒğ¢[Š&C+%÷WÚ‡/õ~%¼ †YTdL’¥”bô|AK•Qrºˆ€SöÂ"yôŠa‚ÓU’ÀY6‚.2W¸ 0ƒ‚&„Âd¤XnL:à XX4b£åÂC¤A0¢`}(1GwĞêAˆ‚A^V¢ÉB7ùÖ23"T\GaÂˆaĞDÔ¸	Í A2gTL,ÿd¸ÉYĞİ‘,×! ËAÀgßKhãã”àÙ€ Q°¸ƒY¦¶ °#Èq&b€)%I2ÒCa@w ™f  L¡‘ÄaC+©Ká&šßùï.ÆúöœıÏKÎã¿{çrÀwÿ¥Y§İ[`~ı¹®åàŒûœçõïwÖ]÷Öı;šø?oÿîıß¶¿éÿã/ù}`«¿éó^å„ãıí\÷Ô ŞÚ{ö¾öäB\öSºû#İışø­?şW÷Û}±ø…™'w‰€ZF1¬"S^€•{a®d$:¼‘2*>Í$ÃëŠ0
Ñ"XL Å³RN¦
’daƒzlAØƒ’PdXyÔ“<„€èM‰šáX¸ƒeÁH‚D¼JhP $$kqL?˜l@CgÁ`’¡"E ˜ ÅK0r„XIl÷çÿÿì ÔnWúòtßÛÏ«.6Ïß¨÷›Ôw“oÿËiÏşß
…_ócú[dü“¿üw„OãÿŸÿ<ãußwÿ¾å¾­üŞòûl.şüïèg› ÏyÙ/×)ß]àùû½Ô(z¾†§ÿIıƒl©viõ_,ëœ_ÿ¯­ù,Ñ=léì$ÿùùn\Í5ÿš^x÷û;àû{«é‚_çVÏ©ÿ sù÷ş`û¿ÿ}ûş“{ú¿ß¿¿ÿ€5ÚæïöòË'Ÿ“ïş¿öù2ª´´ß-[·$ÕÌİCş Éw¿ı3]ÀÑåûÿûÏß=R¿Ùº¹Ş^:O¸^û~Yù˜êşŒ¸6!"zR" TØQÛ¢ Ñ³#€øCYĞR0`+ƒ"&Úk)ÊÙx
õî"'QÇB’FHcÀbœğ…!R¸ ¹¸C	A
àhä°4¦Bè¢_n@€ XÓ„Ièl`…I!ÈÒhR&»QÓYØ’œÏAÔ\·û¿w•Bï/çÏ¾V}ş-ò[¿ŞH˜şı/Ù«íÀQIOgï¯¶;æ×åŒŒËÿ«?óı¬+mã¦õ|9Øÿöî?ÿº¯‰öÿªÏÿ_şZ}^î¹÷Ùy¯™ºaæ„0rè½¯ˆí_oÏíóûÿıIûõ®óo™ÿäkÂ"­2 Î 	¢Œ!FE€€,°$EM¢®,
ØˆG|ªÊÑm¤&8pDz`±¨©2ŸuC)ñr¢ˆXÜÅE“%èÈQ$À™Ÿ
Ôòh2`pbœ5™³F0˜ˆXÀdb„p	¨  ‚Ø¨6† I’ª_`ue‡é0†Ò”†L˜¯ÃDYŸ FFĞÀÚ-+Ò„Âô!
`âú" H±%gH±«-0@Bå‰ ÔH‚d¬:[FÉ¢¥=(#:„À-”Âá¬I†Z)@„NK€	1Rµà¾•BtPˆ–du‰F˜Ü÷ıÏçş„ÿ3|÷~…ëÉÜ›æ«õìÌØûÿL¿ó_I½;¯óºó¿Kõÿ÷}eô51Í·Èmïüi’=~ÛÈ}=®Ï÷\ùõß»‹Ûï½Ußºíüz†ÿ†®~·õ'µ“ÿÿÿW}o$æ¾<ĞŸ‰ı_şé}Ÿ)ï“ÿêİeUO÷V@`…ÆøY”b¬(±8 ˆg˜?ŞM˜6…ÙhfI
Šb½û'LxÇÈ0ôR 
H&¥æË5°„ˆV¬ $6¡u­PAt*®aÌ"inH†¯D.!6ÕóEi;@a@	É¨m ¤ W ’ËÁEmJ¢$™öÿÇçûÁ¾æ>ñuÕ—ëß¦_uï8××û?7ı—ÿß~é¿ætşÍúş÷ı÷»ú®^Ó‰ŸsŞş?|İ”úûı_»½Åıõ½®âW„ÿwùkôäİ#?î÷kŞëı¸nêÛÿâEù¿#ş5ÇÔ=ÿß­î®"¿şõùïû;¡{ÏzGÜóÓ	ş­ù÷ßÏÍE]ıy¿ìççmo_¹Ÿío<çã:ïişngıæ$éoˆ½ÿw)åÍ9—“ß€Ót|õÿE¿T~¿N¨ÿ€ëZË^«õ_³»ÿ}~İ{£ı	í¾·g»¥÷âËÿW«µ ÿ¿»÷qÛ¿ˆı¿òÛŒÕˆïÚÈD$3tşI5åö3˜0E6‹¡ğ5n(  PˆrŒ6—XFB˜l³z!5¢7ˆa Ê­d
¬ÈTM4ÑÂ‹²[‚ª±d‹F xÁCæĞ
8 pv@ BJ€Nøs s
` œ<8'Ã¢Ùïçzªû-Ÿ¾CêBóüÓÃÑüúàwÓÕ_·{¦VÿÏ/Ï'ÿK=yŸ »Õ®ÿú~ş ­¿º{ÿ€r×æ›ü³Tİ³{ÛËß¼c;Ÿó•uNµ²$÷ÏşMĞÿzó|÷ş`uİïrÿmı$Òş×O÷?· ïÿö/êâ“v‚z‘%N„(`Ô	¬€
´ÀÙ9’D…(Í *¨v¤¡ 	IëÅ‚Z„àï#,$1Ñrç84QA"V)Èn„ˆ¯6»QG0 Á“
RÂNåpCŠ¬KÁ”Äökm›È^7bGZØÌ«Î¾  º €„Qà‚Í©@V…ë‰€” £
µe¤pU4^`®¥´BYñ„1T $Ä'qì
HàGa`Š¬DÒIRâñGtfYø«À )èdËŒƒ 2üEĞ7V%6RèŒ G)hí ª%ñef¶ß•ãƒ¬<†êûµÏïïıóû‘ù:âwÛ5.óªgúë³õDn}±÷>ÿ/#ví•ùÙş¾ ®¾#zwßç‹¤Œø^ ½ÿ^÷ïÏÖHışİ¿óİ} }ıİå×}ÿ¨{ßıvîï%(Éõşk÷ĞCßŞ¾³×·ÕÀP®{wÿn·Ü¢pÆT‹%PØÿ	ÈAZÄ$3UDÅä+ZôqÂ¨["‹ñV)àU‡@Z:4rˆ©r8ğ4Äkì’ÚN« Í£0`:ˆQ|¥œ\JÅ´2èİVé…4„MZpGX§°£LÔà(d Ğ%ÀÄO)ÉÙKÿ_$Šğû{áÑ}jgùßÜõş;WÇá÷‡Ç‡?ÏçÛó÷Á÷9ûyâ°r÷ıÿõhëş¯ó~y¾?¶}¹Ï¯€o®ótk]YDı¼Û?ÓÛıµv÷ÚœÚ~?[ã¼WKu^Ÿòœöğ„íåÙÚßEáÊKç×ëOQ÷Ø«ÿ¹{÷I$Ôïñ÷ïæßDw­¿ı³[d¸óş«ÿõ«:-œo–=ıë¯ÿ{.¾LßÏşlŞşöúïò+àãÎşüæãÏKZû·®L¹”íú‹wü®y úÃ/Ø/[ûˆoöşûs}vÿï}ŠÏş Ï¿ß}>ıˆæã÷şïı§å˜#@,ŠüHùx  –ÒH!Áz‰	ü!lòò’™@2Öf(œ¤ âÃ&Bk°ƒ¹,d‚Zd(PGoãyä©R@
hJFzÉ
5r¤Æ…KÊP,î6	¯W$àNËMtü÷˜6cÈÅdŠ" v	old_par = (obj.parent || $.jstree.root).toString();
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
			node = this._parse_model_from_jsT³ü‹‡úV¿·îŞ÷ëßµß[}.Ï\ ôÓßó¤¿/ëß}5Óù±|ù&}õıî¼5÷ŸvëøïÊŸ£øºwÈÍ¿Ÿ¦òáçx]u2ÿÇ×ßõönû{şÊ©§Ì_ó­7ƒÉwŸÎfÿõ¡Òû±ùÏ˜÷gÿÙïøóu˜ŠAÁ@:D  &”£   XA6DD8   ÈØ+ÔÉ(P(=B€±vG` +ş& ¡CqƒšqbA¡µãÁØg È‚q£òE#pOä"h ¥!Ğ°ÂAjØ_ÈS€2‚@‘$W*C`  Y‚0ŠP¿8H (I2ªƒ¹˜# ˜@L†Ñ# ‚Bèj€œ! ‚`¨2Ğ‚ H’b€€\ 
À?‚*`¬(!,å ê@Âr BNÁK¢Ôõ p,Ô<GL"­² * 1ˆ£…‘! ˆ’€–ƒ‚@Šˆ©‡’uàWåÆ/·Ån“öí|µyõ»úŞş¿Åî»^t¿ìkÚí½fÿ–¢áêmüâİİÙî½}ıŸı	şG°ïö»şÍ»áöıü…¼uc»ßrã­ü7yéğ˜ßÕß¿îÔ~ÿíõ|}î^ì“«÷|ŠşËoÓÿñ9¥Ûw|õ¼µ?;÷›ï»}óùn€È€ a©(—V@P)ˆÌf‰ Ã4E‚‚Vp¤:,:DB$upS< zŒêH5 Éğ,#ğ*Ä$¨  F$D-†Dô/À0d„+
 ) *ª˜ ìŠ(89Cåã +EJ€Äd0G›¼õLmş¿˜zûÖ+‚Ëıaê÷éèoßxUò?Æ•îïßtŞÌıê+:^Il¯v?_TSß,™Ÿo‰õ=ä¾çï4ÕĞÿ]ĞUä½v‘œÚ¦ÙùÍt?Õù‘ø}ÛóæìÿRñwÿ³p¿Âåíoù÷rÛâ]×; ôïøOck×8÷Æó–ñ.n¿z8æã¯¾sz¹}Aí§âß|‹õ§ù0ÆòŸãû·ÓşÕöó›÷•”âªİ˜Ïwo×ÇòğAÏ‰gÔ}ßnw]ö;M1¡Ö…î?9ş0‹å¼7È;ôı'¥—Ï|kj+uS ï|øİ¿İ\ı¦wôßæ½Í+çôïwÿÿä‚òyö8ŒÔ	0ÈA°dÂZ €ìY—1À±EE¬IT)"È6Ã'#  ¨‚rUPƒÒ¢"@€=˜€.ğSÀ9À* ÀPèÖH`&°6@°Õ‚ 8Õ‘ ¡2È#ÆŠX°±À„²4 ¦
$pŒğÒ	8FaáJBX ‘[ö-!w83Çü»=ïâ,û|öİÛ¯òïõ{7OüÈì.¨NÚ÷Ş%.›ôçø«¯³¹İ"'Ÿşÿwœùü÷4OğÕyvşş+º{Ìïõ?bYë×aV~¸ro>Føzº}ù{mØ{[ö#y¸Y?uïzª¿»çúüOãäqp™íÄ2ÏÚXÑ (!p ‚Jà0DZ‘EkqŠ¬’*q4R„-Û@
²AA›'…`,šFçY!4@ê”«€V”4‰SƒĞJ¨ˆŒp´XU!î HP†òiÖ¦ğ{P ¨CE¼t0Šù1& Ä†lM  9‚ :ƒ<@$±¾
  A„!&b ¨aƒÙ
‰l¶
Â#‘ ±	„k$¯2h£#")RÌÍ”Îâ„¤L0”‚,ØağøÂĞ’ äÒA‚Z€dŠØ$‚ŠQ—üE™Ë¼	­ŞÔD27{ÿÊÿd-ÖÏÛíxÍ|÷ïøU]ñSFÁ+÷mï*I~;ù8p÷f£÷úKış+İ²ırËÕ|ìÿfvîşFãj¿NåÔ>úóõ»úq}wÜZUïÿ¿»ÿ÷æ>İyÏíå0ê1»§>zÃß;<ıï¦³È²ÚJ¡Èì‚4Pœ „!0&påº Ã!$€Y€QE]ADgÁ zˆh#"–aDr&Q&$ä%@D¢ i`+aC€™,¬[T¢€ à"$p"É±°ª‚‡RD d#J¤a€Ö¨‚a`ÑÅNùUø¨<
åÄ]°_÷Û¨KÕ~ÍXo¿´Y»ÿü}ÿoñÖ;!z/ßK¬Yá~ş÷í×wbÏÍZNù5ß¯¿ˆ«ìn[í~ö”ÿòGÿ»İsª*Æìµÿ­öõİ¿ãÎù×¹°ñÄoĞıv»2üVÍ]¾?ÓÂéoÍÿ÷?·ºÿÊû9¿·º'şèd×‡÷Ù[Şâò“çkZµëÚç÷mítÂıš×úíØ»?ÿñŸ|^_öşÚè»ÇOøûÛ7öÿø~.Œfkšß»ı‡²RÙı^íéãj¼ïyqy[]"?&ÕzzÚ•çwÓ“½zó’¥íßõçnn«ÿéËßoq2»°OÅß\™üq/É@ „ŠÙ3J†ä¥6hÛ@ÉT¤†ÅL°P”@@´EA@	A0OzÊ!©b±š) "èñÂ(˜¼µ †Ùƒ)­`A ^B5±ÇFˆ`ÀÀAB	á £¡Æ#PKÏ—@Ø†ÌŠ8 `  ,§Z{7íóU¯ê-8ÒMîbúyù“×mygşáªà¶>¾U2C¹ö+ıóçÌÄ¹õï8û·;îKæN§Åòşşû?‹ş÷‚ï¾£¾`½ÿÒÛû½-»şïıÿøÿ;ğ/¾]vş>ÿÈÊÄâ§jë§t=·kõşÆ?ÿÖö_§ò20hÕ@Æ
:àŒğšbHl’  À‡„#FH"ƒ¸0îA˜ƒ€X¤€l)„  ¤•…pB(¸†X˜ 3w`ˆ!©¨	i +“‰Hp	$D,A1Á D@ìI¥ŠQ*‚$™Hcê©Dñ˜H #	’y!qE´‚(\7Ä$
ZÍˆî¬@€>2 aB„ÑB#‡Ëª€ä€€\ÄX´R\iÈôQ¢ ‘€PS‰Bˆ…’‰˜hÃ Â A¡«‚qéà ¤áY@Q†‘’Á"(@$İåÇ5¿{ó¿ônîï·ÿøã¡úÌß?ã¾¿o×}\×Ó[ÿwœ¸lyËï=ÖëµÇ<¯¿_¼WP¹şój«Êús¬+!{¯è»á¬)şÙJ´ÿ¯B+¹wßù~ãÜ;[úå¯–ëïîDÙ®6&OHe-õííq¾[ì¡Bˆ ¨’ë€ 1J"@D›€ƒQÅÀGœ›ôA€0€
@ @F¢K `8!0€</’áb2%I0— EÔ²ÁñP R†m—(ˆ
YŒ¨„E¨B H 	H½($&¤0D 1ÀÈ€#£"( ÿß	wımÒ¿¾ó3Eïµ[ÿÿØüÃw~Ÿw¨=°¯çc¾ÿê÷(Ğn¼>ş#¿æüÖJû†û?ÿoe¯İ—e®ışí/‘Ÿ±Ë³ó÷/ÙÜ¼mÿ`?9ÿFyYû®]Œ¾Ë¬½ìÿ{XõEi†üšI<èvÏé¾¿ÑìÅúÿ¾gù:«şb[¿¢Ÿ¿¸Ü±İOK½—\î|{¢ú«êùóî ù|»'uÿ·Æ6úÏªÿÚ:•C¢6«r_åÿÚyñéúÿ¿ûË²k]¿êö2ãşŸ$¶o÷sÔo¾>UmaOëÊ%×uyÕõs}_*Öğüñòôx{ıCu{Ùœµt^úÿ<^›¬6*qB¸éÖ0€B­‚¦€`–Dp *@0 4Ñ§äšœÑ˜`3™Ì‰  DÄC¢Ğ$Ã€ĞÀÀ6	»"@7lwÈ$@‚`F03."	ÆÔŠ AYU, G' “Ê",
‡@,ú«JİßÿO_5r„ÿôWï‰»_’½OëÖÛ*ÎíÎğâûw¯˜ïæÿŠÎ›Dÿä¾ªk=ö[oó+ŠÌ™çÎâì×ƒõ¾sfvù6ÿ8ıCNÿˆØ¶ÛGrì»é¾ÜŸÂßÙ?¢§:WÕŸ¿ìOªÎÿúş²ŸêmôHUDw)!‚ŠÀL0 `h@VÆA`h"ÀBÄ‘  C4‡ @åÄ.3„.Ğ2 j¡ (Œ˜Ò@ée)3Á2ˆ3Â&4I*È§a A\Ã²)ƒèÁ?:ı¢A Ñ¢C	h‚€H M  ª)\à$8Aš, Æ¡B­x   @öÓ1ÑÛ€ TÀ¥€Â&©ÁQI€à¨4¢ªnĞP ˜»Æ @A…º VĞ…w½ z@ò F¤$0Hy  E ºI.•·çEà/ {‘x…\ m|_¶‰Í¥:ù¶÷ïëß{ÿJÎ7É½½i ¤÷÷¦ş»ö§?}Ûµõ­³{w½ÒÓÕ³ëáÚêÛ§•ü_·áîüäù~mü¸Î´§ì?›Ğ¹¾Ww±µÿ_ÓótWî{Ÿ®zäù¾û¶`3òçw4ıû¥Zÿ÷ø>®Æ½;ıò?[%Y^ ¡)¶J°$°Šg ¬H a1Áà©À8›ÆEã1€¤ ÄP PF   %bOp( „>\ U@‹XcÂ—Bf€ÁªH
a—Ğ€h 5£G€Bá2,@ HÂfS³á¨•æŒ•a±´Şªòİ·måægß9.9ÚÚÓ^ÒüjŸøÛïõÄ2eÿ¿ıÇõæş;¼ßõßòÇëşim¯a?ßvrÄ¾¼rí×ïïïFùç;ôïŸÛ6Ï¡/úwóMªªîW¹™öûô?Ÿ¿ïºÿâşCÇ“×ş&}×Ú=±øf»_¥;ş}{/÷ÿÏº}÷~öåéÏÿ½^JZ­ò7¯©×m‡_æã_•ÙÉ¿ÊÙÚ÷û'ñJ«<iûãU™›lûÕ{vßaï¯¿­jÖÄk­¨wô¯%×åo9ıÃıÿQNŞ–Ù§ÏÑşó®ëß·ûNVk¾8Ó{ù²U¸+{ç¹{ŞöºQmç^}×Û‹CC ‘±1ŒĞv¤!(Ä*È$JA@f -ÈÌ ˆÇ Àˆcˆ*IIC@G6$+áq‡‚D¨!„)BFD_¥zq¤bÀĞ4aOÅ‰PœFm˜³.ÀP$"*õ
Z((,9òâ xu²tÓòß—qş„®¯~môĞÎ7²ûß–x‡ßIûCO‹ÄKÃæİû¾óö‘£ß-ò=}_Şón“gûµŞ›ü=7jºšŸksé;É_—cs6ÿoÔº+nu^{;ŞQïß1	{•+µó}qßî¦û¡¼}õ¿ÆsşYşßYºGk×æl•^ÉşoĞ½÷}ìÛâGßµoİş«q»ú…/Ÿû}û9¢úüûÿ¿§³Îu÷×ÍqÍƒgw›u5;¿»w}õ×üu½êİ/×öíßÿºÆ}ßk¯Èş˜bïùnm}˜ŸëÜÜ»âOïÿø;óïİ]š}W®¾ö¾î©ãî¦Û½°eÏ¯çûÌ:}ÃvÇÿú÷•{çıßw÷ì7?/Ï®Î}ï_p=ïoù¹»ÿ¥óæËø¿Oó÷¯ûO†y?Ãx×Ú›?ìÍ—öû÷};ol'®®½ÿ‘ş'~şıŞ¿zçÿí¬Øı½ßúß½ø?eêpq(û»ÃW”ëı›“Çş-Ÿß•ı[ï›u¿ŠúŸYıİË—5rğüíëÑ6Ã«Wïf;õCı_î¡ç–ìÛã$§¬·*Gçóë—›Æ{`/]uÅò–^Îzº;¿æÂéÕÎĞŞ_k_…¯v÷Ÿşæ_ŸÅüë¶Ãÿ9¤|¼vÒ~¾õ—XFgMÄ¡~»_xo­»ı´×[áŸ¡>¯÷ÿ¿ùo?³—üù$g·¢k¯ì¾ÿıçŞ˜5íõ{ûı{ïóô7çöñ?çm½_üş½éÒ7ÿ½Õ½¯½ut¿üÉkŞ÷®–oç§ü×ûyWàúõòzŸÿ­í&û¯ÿoÿ÷f[Yköü†ÿëó¹­Şâ›öÛ_Yÿ«Õíõ¢ŞıÉñVÜu¿Ú_õGŒWŸ7÷Eüµ¯g3îğu·Ÿİ2°_ÛcÚ¬ãtÁ}yNşï`íÔZƒx¿î¿Wığ¯Ï­#ãüñŞ¾l?ıöå’~7;5Ş;óĞÿ0:èÔ­°pUùÛk~Mä¤—¢açé¯ú¦q÷u¯ü¹áıë›/şç™´Ú]}öTÔŒ¿›=ÛrËJ—Î‘	ı—RÓOÔUmÍ7ã£kÓsN=M®€Yôº\]şº¯®×™|®~,¿¿/ŸâF\õ×Æct÷rû”÷Åï÷ŸÚşöÿ§Â\fşÜŞjº;J×jÜïûğG_iëŠÿz–’ªÍÊ¿Wç½E‹ÿ^¿ßß¢Kşğ¼¿=uí¹}ßÿo5ï{¶ß½U]ş_¶~÷nß[‡ôÿâ¿¯wøÎFóNÉÛõScóíÿ<ç>óñæÏI|UÇgâÊ¯Tÿõ_çíüZù_opìOóW÷sı›e6Ïõ÷Ü¾y¿{oÿ[o~Mİ;íï¾vÕ|»¿Ïbü—¼t+£LÑå7ä>í|e²¼Mìñ×-¿hÓßş¾ü—ñ3¿Ã_á¯{—ø¼Ù±©:©fû¯?ï¯8÷ï.ù6úOß™~Ù÷»{uÕ;mŸÚÿJyÙ¿×ßnv'{öî÷è€ï+^·òÊwöŸé§÷óûÿëİ“^şk'šã[]=×V¥†iyê§~L¹ÿ?ûë/oW·mbßïŸİ«¶ğ,»öZ¿y—ÅI§¿ïµ÷¿7¼möÿ¿»I6~Ùıû}ù“7ßüükö[ıÍ_w£Z™§ßºè>×ôW½õ6ße®üû¶ÜyûúOñ¶WüåöË[Şê~¹¿Ÿûâ?w¸ºzì÷óşºğÛï«~Ï_ß¼:9ÏOÿÃ¶;ÿ×{yzjÓåÿü/ú³[~İ£¿?Î˜n,üÿí÷ÏŠ¼¡«¯%ıo½©“ÿÿëìªüıø{ÿ|Ğ¶r¾¿Ü÷m¾uåÿzïªşõoöAâ®çÛòó}*N2O]“çrşş?õöïø©ï–şí<ıüõïö-ëi{àígÜÜN¢6ja(vHºmÛå¿Üû×V×¶Ÿ¾Ïê«ú¢»>¿í¹/Ÿ[lÎêp<ı]ìŸü¥ˆ’Øô]ïy¥$%?ñ{I|Í¤wZïkÌì§ß KşRãlÛÆÚÙ¯“íæCëg‹û~rŸiÿòvâ½•û¡»ğ’LS‚ÿu8~«‡óæv“õÿïG"pÏ>6Géão¨bïïÏÏ®Úÿÿÿÿ7®¹»ı×¾Nßxİç÷±ÉÓıÿşÿü¾¿ù¿cÌŸ¿ø4ß–ÏjÉs^Ïuı÷-Ğ+÷ü_YŞîÒ>ß”ŞİÛgïy¿Ç}uÕŞ=qÅ÷÷ãûî_ßÖÿf¾Îv¼¹´,=è_à¡]?ó•±ó©6,çû'Ä_=WOö[SÿO<½øıŞv§uıñ¸—¯^µwÊô¾Ã}åÿÓıÛúïÌËî×úÍ7<¾óbõR^uBÿ’
ò{«ß¿_¸Ş6ûV~ıêW¿ş‹Ùª*óg{wş'Î‹êîÎÑÛ¤ùoÅ¿ÿŸg¿üŒğvşşû;ÿr÷Nùÿ¥¿s>(?9,ó,f?ÁN¸ó~ö;£û
rl¼Tê;­çñüÍŸõÃ~«ƒÛV·Ÿegßëtcÿšû½Ã¯=íú§×wj¤é¨‚~sÿïßïÆ¿mmQÔ›Ñ~ıïğ}¸¯Û^×>õj{û*‡ém~2Oıî÷Û¿ë¼oöM÷}Ëößßs/z÷Ãıví÷,oÿöÿ«˜r½İïõmŞ<ïI·ÿ&¿Ÿ!vô¾üÉû÷gõwµèó×ı¸ù'®ï¶l×/³<Ç}Ü¯Ü(¯Ñ¼«ÿtÓúÿì¹›ûŞı‹Oí÷ÿÿ´ûşÕîÛßG-^÷vØYØˆßõØjÕyÒÚ¯’’Y°Ÿ¿£	o/©‰~=S{~~qYë–^9òÎÿî¿©>>ÓÖã¦‡f¸ÑÏÍÊ»¿Zâÿ‹¼í¥ı/ê­î1ùsÚ<²Àä]3ë?ï÷ïíoœÕA‹´¹[5O¼½{‹øÖí«t=‘{Ü76r¾w»ıbÿÖıù¿î~û}^öÉíûî÷ªãwõşHÿ;ıWgoŒ_èïß~çs?÷ú×»÷/Ø·Çşåıım¸şÿ¥Ş?ôüÍŞn·}~ıèèÛºİ»ıšõ|\;|«›·y7ó»ø;ü½ÖwDíºÊ|Ú÷˜m_Ï¾?³ÍYïûÚüşı¸{«æûßÓùİş¿¸Ïÿ½ïÇè?ïÖ’ó¿m?µ»ı}÷ÿî÷«çÁÙëùœô´Öú»ùî{íû¾ÛzóíŞêc|Íú½îãe÷>ìÿèÓó½Ûn·zócós)·}«ÿçÚÿÒëû=OÒ\¦™ß¾A»JmÿÏHş»/÷Ù-}oÜ¿cÏñÿ~¼ÇWõ=§¥ô÷ÎÆ3Â!v†}·15Ï™ev¼MùÖÔûÎ7×û~¿¶¢~ÿ{÷æQµ}8s™¬Š+×JøşŞÿMÕ[‰ó»«_Òúê¤-½Ü_—ùÎ½çMd¾ïÀÑyşlÏcÚÏ˜ßy#^nĞüs÷v¼ÃÿİæßÏlÕÉûãõ”÷ÿÿÿîÿçÿ«î›İû{ô_ï-·]ûÿú¿[=ßnûÿø¾Ç&Ë—øóió÷æ~İÍïŞ]şıY`¾z{¾~¾æçï—mşşş—û¾ï]¿Ÿ•ù¯»Ë™á›ù³‹g÷ï³ºzø‚'ïÿ²Ñß[¼ñ¿³“îïş‰ıË‡ì–G$ŞÜÚğW÷êVî¬ò½ª9íğµİ½1Uy·
~á]€T›·¿û¾:!”/ŸoÓŒW~ï¯×¦Ï”óCæ¹»­xÏÅÜçV!œúRCö½H/û|ïó‡8û»èÅÏß¹ëìwS¯i-¥ûëYßc¶×ÆR?õÅ}÷yÕå5ç«ïµ÷ı×ğúÎñİü¼÷iŒUo—Ï#ï[{Øåî¶÷›¼à&~¼ÂŒÒ?û¾ÿûï‡¶5¾wwê§¥ï)‹üOç×wÕæ¿›Ê—ï¬‡ûA}=.ö\n{_ç“ç(9¹'´ÿaÎf2Û7äQwë‰q?¢Ÿáoøë¿sAşgïu><åœäÚkîŞ“üùÿ|m6ó½œ¯Ekówû3{½[óç›Û¹=Û_ı¿çïzM|ÿ¨ú»ÿ¿Qß½÷x}/WÙçïÇy9íú­çe—;?ó}ùSØÏéÿ§‘µãÿÖ×¿]qîë÷ß×ÿße;ßşñï/ı?¿^ßnÙ›>vÅøãÏÿÚûIÛòók^dxWl.n«Ößõ‡GÍõ‡Şş½Ç:~ÚUSw¿ækæR$8úUFøïzNı†·Tÿñöó‡ÿ§¿6cpò¨]\ı/|Ú÷ò’~këfş³Üò÷¯ƒÒ–øä³†ü 6Íxis®»æñ®h9âóıúçEßÕıÿZógûV;ïó~ßoıÓúüÿÿİI[e³?_úY^õµõëË>÷ï?Ç?ñVí_şébŸ×åøçıêşó?÷jııôÿÕıïëráËøë¡-ÿc>íîeÚ³<IlİOï÷Ÿ¨Éxßé»Ÿÿí¶™rîÚïìÍ[ÏÕ¸;µ±ë³ëñÎÛûÏú×ı¿¯Gkİİw¿';Ç·yÿÿñÿËû/á<ûúİß—üÿşÿ•õ_ÿü¯{ÿõû{ÿóÛÿï÷Ó?Ÿ3àÿüŸı½»/^Şy­ÿ¦’Rş­ÿn÷~ïå÷ı½Oªî“ÿ÷¿ş~F×§ÿft®ço+î¾áwmÛÎ?¯–ù¿l×á½_›q;pÒZè'oğS÷^ÜÇ<iĞ|f±{ÿºüPÄúşì½Ï:óìç/ÛÍªÿ\¦ïtµ§Õÿş¾şÏé¬­dï·¯)FqÜ ç<yİúpõCïvk%¹Pîç£ÜÉïïÒŞ-ıœocÿæ¾Çaï?»?Â7GÙÜ+Õ|Ÿ_ÛÛe‡f‡ßÏå~v$³ígÅÿ	Ô'Îû~;r¹s@ÍŞÚÛÙ|ğ´TñÉWıàÿ·û? ÷üÖwüî/ï¦¹o«î¼ÿyÌ;«şÍÜ¾?ºú+ş{]ö\ÙÙwƒ_ß5ŸNumü¾ßşßÿßê¿ïôôFæäŞŞ÷âÿñMí>2e^½ºû÷K§ïOÿ(ÿWğ¥{Îßí»ûòæ~£µ‹ŞtÍ3ëÿñWşë7'ù­İWQkE™ŞW…vÅ¤9Ö†ùğı¿vç&Wı`§ÿß¿ƒ­{t'½ËajöKªëçrG/ZÃŞ«îæúV£Í½Z£Ò—›UÏ÷ı÷ÜšÄW|n¿)Ğş¶G¶{zí}%5î¯œìò›ÇüÂßşëÁ+ØÎŸı&ïğ¦¿^uúWîĞ-«7ô:ç|²Æe[öö/ÃŸ¿oÅ­YZäºÜ¥zÛÿøíãí—{­>ÑÚŸù*w£?ùñç=!õk5¹/w5¿»zõvş;ƒÙöÚ“Ú[¶{ó™d/Èödw·ö?ñ^ î–ïüãİ/Õµó©ä¾×Ñ>çÓ¿%9ã×~n7rïWşÆÿ™<æw›÷évm×ïgÖ_üZŞÙU‹»ÿMîoßÓİ¿±ÿ™nşÿ¬üºoüŞ+ëÿm$î÷ÓFÏÖ½=Ú&òwüí>÷ñÿÖŸR³]M{t_½¹±œîuw®şÑrWøŞõÿno·´¼¯È¹û?İÿÓvm×ÎßÆ=]íŞmmúí÷¼Ë/·}—÷¥§ïı=ğ¯^ı]{ú?fÿÿ½ÿïï‰ÿçwõ¶ïÿ¸ó[ı“uóåÓ~ÿ_³üåşÒ~ÿÿñ›ùØ?ÿÿB¿Nˆûùö§òçOwºôüóÁûÆù7ÿøÿÕ~úÊã›çŞéö›—xé1şúß{íŸ[ıè]?—¿¹VÇùÿ°j‰ïÏğ¼~DìØîG²§µÛıùMõ‡jáƒ®Góñ0´İr­ú³ûäîõÆ­ë†êXk¯œa#K?ñ×®ìñ¶’×Ô¾ñí´]ku¢}?³Şîoåæl\·hİúw¶›µü'”ÿÏ«ìÛì7öîı'}æ“õ$-´¹¹EöÙüsÓÓ‡çÇïêıÖ?S»nû¾ÏÿF~7 ÅïÓrôÙuı¢$İúù­Èÿ]÷ŠçĞ®l}|Ûæ[¥—nÿ/÷¯Šün»ß—BŸ¿uwW>ë2O«ÿ÷÷«›êøæ?ş(]~¿/º»öëß¿ıùüySëûïŞ¿íNĞ/ÿŸà=·QÆW¿óºöO÷®¯÷ĞîŸà»^şU©UëCÿÛÿ;İ£·T`±÷–¸×?ïıÙõşßı?=ñ_µ·?7z:ÿk®[~šê¥•¬_ÿİıïÆŠœ]Yşë~³n+İÈß±¬M#rÛív/ófsªÎNäõ9ãwÖÔäKÙy-}=¨zÕ†Ô½ï}¾~şS€úNìËªg†%ş'JÓE¾¶WÿÔûG~»ÖÔß~°ö®îú§ÿ¤ÿŸÓnë}Ñ%×_Îß\Çıß˜»¹|¯/úo¹óßşÕïnØ¹ğş<{ûgõüÊßù?½Rdw½ï•ŞùüŸf¿··Íÿ§êyßnÖnóß_ÂŸv¾ÅWÁ³»¿Ÿõ­»ëwÿıo?»ºÜÿÕv­©MÿÅ»×óïºNşÓ5½ËtwıoÕ<vÊÛ¯ó»æÚ_û~ßİ×eáMÛÕzûµ®×üÿÿıW}¿?İJïï»ÊâxïÍn§¿}ô¿ówl-®¿´Ãòş};w?úıûşûëÿáy‡nç]ºß]­cwŞû]ÿÏ­ÍgşÆ´÷ÕŞÿFö?ğl?ÇwÿŸÿåó½¼^Y~ßêşÏ?7-óXœïï}zuÿı‡»÷½ş¿âŸ·¯×~W¿Êw¿İËÒï±ë_ÚÿÚ¾şXÏˆ~êãü°°UÂã7û²ûSı•x#ßåÆ—ƒÿù®Şq¹\R<Û×ÃJ“Sû[;É>àâÇüóKöİÍVÎAñ£ÿİ“Ñt}{ıû7µÛ[ííj[÷»_Æş»¹ëûïõ÷J¤»÷õPŠ™_şë¹ü/³„gç
fLµq£×ë?öïÿøé²ıúR÷ß÷ıïïFî×şB[o¯§¦üİOï½7½=ßïşcÕß÷/íÿúsÿ?®·­ñıçÿVâûëıõ¾Ïñ¿÷õßôåxmç_Ø½ÿÜ?¹ïÿW®©ä³ı0ÛGÊ8»úKIûÿÿº~Áwå¶ÎÿM7’{Ïk^Ô—ï¿Ú#·J%¾Ä3>©FíÁ÷Ÿ>£kİÀAº—/Ç¿úŒnì¿*éTRRÜòİo÷=‚{×ßº+zI²ïÿùĞ¿x÷ÿ³…ßâ¿ìwN>ÙÙ›İÍ¿¿ıımvÖíõòôÿ¼qè%–*ıÿ/İc#½ÙË­Ê—¿·^ÏõgÿPùT9©œ¼Í#ççYşù¾×D~â¾íì%ONøk}’Ø‚ı?g{#ø?{ß—ÿs×>‰mP¤o»×mÎWB¸oÍÃ¾ırı_ìÎ[»w«³o?÷õ°§cîşãûİ÷ûÚ^½zuó?›–!ó¾‹?ñp¿ÕÏ–şv½ëG£ÊÃíıékÌúáÿóïı¸¼WWVûÏ}İŞ²yØó5u·Ÿ/ps§•îîô½Zÿ»^q¾îÿÜ¿;×»Ğßÿ?÷?ÿ‡ïûöwêí“í×Ãø÷ş· ç»ı€÷û²GµGx·¿ş£¹ù§®Ëg_zÚ×~¶fïì»ß/>ÿö}÷’÷í»ÿ1òüsU½{ıÛ÷çc…b¿³§’Oõw}^eú÷×÷©
îu7ÿM;~<éÿªõ]í.÷¿ÏÓ©º"ı_>÷»õÏk¾öN4/õş–G’—çš&=®_ÒÌh½{»™³ëï]|ä[µêŸîfïk¿›½ûòYçj{ëÛú~bç8¿ø]ÿùU}>ŞïïÚ‹wôŞÕc¿¯¬ÿ]ö²âïÔÚ_¿k_uVü÷ïdÜÛÿŸòã©ûŸÿò/û¿·íØóñod)«çş÷×›ÕÉsuÚÆû¾ÕÚuÿí>ækúß“¥ã¿¸,ÿÏ{½@û—y½×ã÷]>¤ü-¹¸½^¿_6ûû÷õ_ü¨ÖÃ]ê¿¿GŸŒ²šŸãß¹O¹÷côïeüïûíü÷?Yï¡ı_Öz=M’ŞÜ_k?ûÎÿ![[“¸Õûü]“oŸ|}îÏOu§ë¾§øGş³£ì+ÿöİ·õ{î}G6O{~¿İşUÿçwW,ß­ÇCjüz¦ÏŒMıÖì»ÁªáìÃÙvªÙlÎqÑ¹~ê¹/cW;§íóœxümÇi·ùåz_+ÍÛuíğ]¾šÈèDÜÆ3´Şîû†¼ÑÔ8÷P¼uÕ±ì96¥³€5÷9æÊŸ)_ÿí|¿›Ô—¯9~Xw–(Í	7°_¿¿”´Wv7üf¿çşÿ£ÿïêÛ/5ß¯n“gîxkq¼ıÿ·¾ôSŞü·0¯?Ê_Óïı1¾şò×åü'§Ïÿş×ëÿ_ÿO}ø¯ŸÄË÷_ı~ßÍë—ŞÿöõÖsÙ½Ì¼şŸÉ7ççú…>|ûûı÷÷úKß¿z8Æ÷òÕëş}c*™ßï·Ù^Õ§­ŞîÚü_É÷2kn3ÿûÃÍÛßì®è§÷hÉ6ç?8úùt¹çÏ—3¾šïJñ0á	‘‰ı›ÙÖ«ûÙ”ßóÀşÇ´ä—ÎëŠËkï Kªÿ¿ÍÅsşsû—|à­ô·§VIĞ£÷æ^Ö®=ïoàû?ş÷Õßèòï?{˜©{»÷½·ŞÀZë8ûöAò–¯ÿ ¨·¼é“¹Şıª_ï,ÚÍÎ¾·yl/d·¥õ;ı£ÂîÿÕ°%y&­§‘Œòf±«ş.ó¸ôÓİ=ÍÍOw2oƒãşÚá@wÿ`Kòñ×—A»­.ó7jxÔK[â—ÏvSoÇÑævînWGÉöŞDóVãæ±şîî=¯î›ü“×ßõ}ó.jü^çÿÔ}Ãßù¬óÏw¸Éÿ%şíwú7“ı}‰N½¯²¦LşÅ=Ş;õ¶ÂıúKÓœ/ëu-­÷õ4O›xîÃ¯ø[ıÍå¿Ş¿HßOŸåûşêÿûsµîv¸g÷ıSï»Ñ:aı÷Ï_ësÓÿ¦ç½êÕÓşïøWıÙ[Øjs´ÍºËËG¾TÛóÙùÍ%Ç¤ç÷Eµlû@ß/¬;îõ_Nï±şâRá×¯«z'†ÖŠÍóŠ“ù\ Nv­>ıë?°°‡CóÎ{%ªßeOı	·)ÚyOĞ?ËÖ™ÿdû­‘¿Shlº£¿¶ïô•~7™†úóØ·cº²òo¸®âñÕkËî¿ş}œç~·ı)øOï¯¿ış:¿:æ¬N}¼^oö¹O¶«Ÿ?õS¿ækÏµºÖ¼â}ş­òqŸÖ~mùšßx_çu¦ÖçÓmßË»Üwª^·÷ß_ÊıÓíşçü»ïãùk~ŞÒÿoï3~ŸÑùî÷õß_ÿıêÿñúŸ÷ş½{ƒ×¿Ùÿÿ{¯5­>y‡›îığıİş¾ş{ü=Ÿvô¬r¼ıOñÿ'ìÊû{‹/üî¯Sf´âíÿØıy›;oîùóÜ½o÷õÿßoÿ³=êŞ~ùû7ÿLÏ^çí-şı+İıÛ·şG}ç]}íÛdÜOµ=ı½üıü?O¿#üıßyTò^Q˜»/¿ø×}7¿tØÖÍôc­ïeøåÓ¾Ÿ:?]‹¦¹¦‡Íë›õĞziŸ:»½ÆWOq»»ñ­W1õŠ9ş7ÖXUdjîâ
£GîİŸ:_t÷àğÿÆÒa¡ßË•ñfÌõWÑ—ÕùÙdæûyió;w·}çúÿ÷ÓJ:ş÷P³ŞÊw¿×Vbİÿõ¿w0ßëç®ï·çØ‹s³¿÷^ËÿzSÄ{=Tş5ô,ÿA–Ï÷¼ı{^ÚÿÿßÏmïş\ÿ_+÷ßg<Ï“~ïû-Ÿ·*Şşºó³Ïßw»ünÕ«ß¹_ûş±İGîgô™ÿŸ”ß~›u¦îÑLlíişşşîÏç“»öa›ó{}FÖ‹Ù‡C¶Zù?óOÚu­ß#÷ZcoóriÛµÿne{ùÅÙ~Âgà2êkéjïÎm|;n¥«‘lgv¹°p«ÿt{·ü!Şæº§ÆÈuÿîıU/ïZj¯É©[ç–îVSÇ>ofÇ¯7Ãk"î½ÿöfËßw;ÜÿMÿŞ>…·%½”ÛÈÒW·|§ôÎïõÊöOR±I¿¿C¾qñ
õÿ¯½ô•e÷ï—í6Ëßï¦ZalŒ[+½Lÿ¾?¾†Ê_bıg^~´¬¿¼x=UBz¯>0..ûıä®ğ+F}ÿMm_ÜßşÍí‚¥ï=ü®~óûÇ¹Ÿ#y¯ÿ¯roOßtÖ%äşİ»ÙÛÏtï<¢û"û»İ/»òã?×Ûo¾8TŞÿÿÿŸ¿óñ×xê¾_6GÛUµóëö÷?¿[–O6îÒ¿ÿÈÛ¿/¿»M·»wç¿_'ï¶A¿ß¨ı“ÎÔş»ú¿äÁo3~}·»ıŒİ÷Î©ë}èï7øÈ·ë{V&vm9i6z¿‡%í/V3ãßo >¾ùwoC¼Ö#
åçÉÕ+ªrÕÏm¡ı‚_ÿï6ÿ¼íï»kËøÑgkÚÑ±–›ãIrókæõŞ—ÿ¿»o{³kª6Á]q%ÜœäP¿}Îß¿{ï™v/§“şß¶¦´rë]NïÏÿıšLğè÷÷½æ?úıÜÛıŸ¿ãùÖs9ùå¦/Öıòÿ¿g÷¯ğöÿÿmo¿÷}ú©õëØİıíy7ÊñªÒ¦öüõ~¿£¾Ÿ»çÛÿ^“{á×ûï¿4ßûáÓxğÛxÏßşö/víßú¥µ+qæ×uöç›×Û¿~_é÷«]¿ßööëş]çÖ_÷æ½üõÿïÿ¯½¾oº7ø‰Üÿınƒÿ9ñ­ı?sïÿ7ıO÷ß>ês<ïÎtş»÷=öÿòıo÷şÇùß*Ëßôúıœôéùï×q›ıÿÿ»´¶VŞ¿ÿÏÏó¿¾Îó½Ïÿ÷Û´«ıúHh²Ê/k3şì¹?½·>«Uf¿[ş’vıhNÇºö—ı=5—tÜæ×*´ÁûWã7?_»ùı}Ä]Ú?Öw›E¹õ+ößj¾'Zç×­—œ{õô÷Vâ¾ÿÚÙÏ+åv»Rë|Úo¿ç+lºØşmXtcÿu~%õÆ¾SwwÑõZÓion (variant_name) {
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
		//array.length = from < 0 ? array.lengtŠããø¢Œ¿ş«øÿ¶~àwüy˜ïÿıÿßë­1ÿ™oó¦÷î_W¼¼÷ê«£ŸİıszşŞ[ÿ±Úşû÷oøïs¿Ñ\Ğ¶}©´¿5ß³¶?şÖwßsúçvÿ!û_ÿıï9Îù½¯ûÑ6ÿØÿeoóm¿³ëç–2ÿ¿÷Ôëµ=âY$Å½–ÑõKÑ©uìİ7hù¿Öÿ³‘¤ÎÜ÷½6ÿ[Ùç“¶ızİß½ïàÛ? ûŸŞkñ•şAÜÇºJıÿ}ùÍ¨ŸşÔùNİ]lm—îc]å"×ôm2üõµ|›öáşiõ¡Ôò„¿>ùïnøÊúÏ)™=*ğÊu“¿ùè¬Kç#¦·û€Õ´÷Bn{Ò|ÖÚ«÷Y¶»ñ×ê¯oŞpÖÏÆÿ‡u¿ş÷³¿áë¿¯æc‚ÖÕşŞ&°÷¯ùzã«ıœÿ¸=‡ÑÏÍûEá§ßòÓß×Ø]÷è1Ÿóm:½Ús]ôüßÛw\mÿêÔwÜóìW§cÊøÏEíïfïü÷_Hw‰ë¬ÿ÷¶+yşó¬·'Ûñ{ú:ÿ”è˜ó¶N<÷;£½óåüïSŞk¿òY_‹Ú²ş‹¾ÿşîå¦ìç§ÿ¿«ß¾ü×_pÿ½1×»»o÷íÓY>«»ƒ7_zyôO¿±³6_®÷ÿ+õí‹Ï÷vŒ³ŸÿöûM§Ú=9ßõòÎú‹¯œÛ©ºş¿ÛşîÅ›ÉD6Ïš¸—{*_Yöş¼Õ	òï¡ÿ¾ÿ®û~×Ç¿ğóCs[ÿp­Üı{µ~ûêïÛõ7‡ì¹ùÿ»ã'†îûÖRúõrq@Ù[~Ÿ=¾œëŞ¾/¿Zßª{Nß9ƒ_vno³¾c—ÉÏ­.¾Kò_™|ágÆ£ûcZŞêú.ÏJöøí×zùî«¿¾úë~ÿßKıÿÛ¯ÿï†Oÿ/åäï{ü^óòêÿïÿşPÚ?t¿—Ş½­'¯şÇ>\õ?ÿ_zûÏ?é¿Ñ{+wÇíÈ{Ÿÿşîƒ~§]jOß>ï¯zÿ?Ş?³ÿëÏ}îÇÇ{WıOËû¯ç~şôùñÿü[›Û³Ûs¶ÒT÷kêíŸf±½ıó?ıÿóàıç~}<ôzş_ïŸçŸ'ßøú¯Yüÿ§x_ßÿıı÷ûÌÒ=¹¦ßßÛñûÿ÷lmïÿÿÿ Ië™ÿ÷¶—ùüÑï“ı¯ù¿¡ş¸İxÿ¿zíK¶Ş®~Ÿ·şöooş'¾ÿ¿ß¯.°¸G[¾Î½3Û÷~ÿYÇ~òµ_ûkù«–ó=\mÿåíûô{îÿÃ¬7¶å=~Ïûûµ÷æù{W;ÿÕ¾*œã»˜X÷§{{éÚBwæ¿ªlFÛó×ùû+ÿ¤µ_İÙ/½?b¿‹Ğ•}7V¶—Gköı¿ş;ŸİQ
W}2Ş¨Ùb¹gë.Î;ÿºËŸõïûú×üîÏ~ïŸ_p­_i¯ûšŸËùĞ~˜Ê÷İûãÔ»w§ıÿãyë¿Ÿökm}Ëÿ·Ö÷ò~×Ú£7õ¶şU:ÿÓmNw?Õıï»ûw÷œ‹õŸÏš»í¥æı]ª¤µò§İâwãû‡ı¯ÿ½ÿù³ÿsåøÍ‡grß#jßÛıËm¯=9Ôwï÷Õ½º§şßúË»¹ÿê·ù½Éé5š_Uÿÿ­ßŞöP¿nú_C­æ“Œ›ıûÿ¬ÚîËNì|Ëæ»·”òûç¿Ëêkfß\?’&‚ïÑwjö?ıºæ³M›Ş³õpÊŸÏ:ø#ÿ¿ç¶ñÿÓ¯y,»£]û·oíóŠ×ã[¬ìû¾ŞïÿóşÍ›³[ûÛ	¯Ÿjş—Ç»9n?ÜU¶W®t°¾r¾•çó—ôÇoq3ü¼­÷İ5R7şw•—µ±ßÿ¯úÿçñ·.¶úJÒ	ó«c½Ã,ë¥R/K˜å94®4¹¿:<q…n'O¡¿_@G¬ù¸oKMı=0åßÿ.î÷ì·rÙm>ôcoæÛòïnı³õ³Şÿ›ûâïÿ×nß/Ã·Pşùë¬8Ê“ùg§ÿmëL›õı¿âïËæú»;³Ö+9OæŸş÷nŸ÷ß’ïúçº¿'‹~Foeı×ÿØzmïÿÿß}¹'æ÷=İı·Í¿ÿS¶Öİm6½ÊYÿï`*ï~Ş?½—ï75‚õè+cÜ›Smÿ?ÈkÍ¾Q4áúÿÅ<&ş_ê¿Ôù<×Û}ÏêoµwÕd–Io~úoÏò¹hY¯7ÿÛ3rÿ¿{<WşodÚ#qÿŞş¯é_ïmßEn¯í‹ñŸÏY|R:]í|ÿoÃÏÿ÷uû{q^ûcÿûÛ¾Ç÷şÿHÙİ|»²—·ÿÛÉ¿¾}ıİ›kÿ_O¿7‡îï.;õÿìçKÿÙGÏî¿ïó·¼üëïG{Óóó­ş?Ëùoö7}ßq™¯_imzåë™÷}_nÏ¿õì·_û»>Ø½Õÿ¿ï7wÿJÂ‰Ÿ÷½ùÅŞö=W½Ÿµ`÷»İ†~û~èú#¿ÿßê~‘•ïz||Ïük·?>6½Şkß9ö±O¨êSâYsÕ_naôßşŞÇ¿ê¸şm’ëãÿïï¿›ı¹×¹ÿò_×wõ3²¯÷aß}×ÛÖæİ÷şëßµŸÿÖĞk_}şoï÷\z|z]ş·úü®EÇÈªïwçvÿ3İış¯Ñ¯æ¼åYÿ¶/W=ÿ^()ÏóyËıßOÏî§Ö®Ùë¶w¶Ÿ¶X[î»úkDûUÿ=´_[îì±ıVë.Ã-6\>õáµıÿyŞßŞûãõø>ã+üÕS½/µ§ñö¥Ôwš(LtÇïç«ÃÕ~k9Üé9~tÿ=ü.WÕÓ¾İı¶àşúş÷'“ıÊë˜µ^ïG®ÿÿ¿ß©_¯­ëß[ñ?m¿ÿë”ïÄ»Î{•ß?ş½¿í6ëßj“³îñŸ¾úzûåÿÅ¹zÎuù±ÿ{«ÿ·ëŸÿØ¼İ¢/kï~ú¿ş‡{O¼ı÷øï~+yt³Óğ.=¿©ÜÖ>*O^÷ïò~Ş·w~~vóOs.Ş½¿ÔKïíT³¿ï@”_Ç»ç¼4« šŞÿÖûqÜøÿuŞE±ûÿ¦Ôî¤†ñ^Äå«ï¹¡£-¬Æ¯ÌëV55ßŞgJ—È×µhøïñ_n&ÿM~:óoş²øÿw÷øV†û$9Û+.;ßÿëWÇŞªnõïóäİŸp¯şëkoñ³ÿïó“ãCò÷uÏ;£îÁşğg:ÿ]^ôøÔ>ÇÃûm²Û2Q½Ù—ô÷í¾¯ùô_Jw7·õôûv•WÖÿ¯Ñ}ş.÷Eê‚Ïmkõş‘®äÿlÿş+Ûz={İç¼÷›íÇúü÷_˜qÖE×ê_ÒŸıÏÓşÒ÷óş×È^õí~¹ÿø»ºŸí‹[ò¿•÷çºıûö¯Ô}ÏñïŸ®Sï¿/_±ßõÿë’¿¯İmåù?wïüÿÿ”¿î×ûŸ_{|ï-ïßîòO¾÷NÿæÚş¿—¹ü—ılÇşÓóêßUª¶}İÒ6Çh?=ë¿ïY·[ÿ®÷J×ëg`ßúõ#]xWìÉw{¯~ÿG;tfçí{m½ÛÅeSßT·÷ÿ«xº¦ÿíÉïœ›yÑÅÙT½©¢>ùëÃwy¯¿*Ö%wo–ß¾õÖïP·ÑSõ_<Ë’ùò§>?á<ÿ»»ïy?¢uå¨yì[||”ñÖ³±{{¼ğ_ówûÛ[G=ùvø÷›gùÿpcß—Ö+-ûûŞıyÏLW¾_WíÿÿHLgİø®ş÷5Şæ¾ûË}}}ÿóÿ¯¿jl¹ÿÿ;½zÏ-êwíİ§¶õ†÷lşëîõaı§¹Û½›îÛnkïİİ—“+ÿ£ß›şÏŸÖ~‡Ÿ¹ºeó­íç¿Ì^ïë}Û¿ÿEËÅ÷W»N¿n–îòİª£ëæ¿;çSõgîú9»÷¦Yÿ8ÿíãóş:}ıÿyz>òî×vüÕÉùÌ}\%ĞÏj=wİ÷Owû”ıİ÷ŸÇ_í{î¾ÏyË/¯½ß»ú¿Yò­_½÷¯§Õ¾ÿÿ{ï²–úş;ÙöÿÿAÏsö_~¶]×ódşµÿmë~|íıÏÛ‹ı¿hèı&ÉË=>ıí¹o­›“/øû‡¯Ş­ÉÏ¿<ÖÛNö?Æ}†~_½ÿ{~+¿Şòñ'‡y·ŞBúÿ×êw¹ÿÜ°·åK¦{¸ZİwïºWûw‹¿ı†‚ÛÊï˜üÿ;İÿSõèÿÖßıåØİ»÷©TW§¾úº—Ô¾âY½?Ï÷>ÏŞˆ5_İ³ëèÿÏŞ<ï½¼¿ö^ı?2÷ùş¿së¿Mö÷ªšú¿iÌ©û}·¿ºìÎ¿ó›ú\ò¾êÛ¼æûµÿ»Ÿúg¨ßï­?_İ7lÜ®¿ú.¹ê}¿»i•~ßtº_¾¯¿Lgç®[ÛÇ»×¬w½Û“‘Kk{’ÉRŞóçó÷Ú÷Õt!¾ıÅıV÷R¢‹²Â½ß?Tñ7gŞÛ»—†¯±Èğİß§¾ûğó»•ÿGıíŒÍ¹	k¿›û>ª¶Ïµÿ#æ²{¿~íÓ~¦5?Ù{iR±iú¶ÖwÒxşï\®ß}öïMŸÍû³éÿÄ[›ßô×Ï³}’5ŞÀöŞ¯šmU	'JØ]ÇÚ÷æ¿ûÓ:óQı³ÜBÿİ¿·òŞÙtğ³Zë^í»}¹>‹'·Ÿ]ñ÷BS÷;äbÿı÷ßf7Õ¬ê¯‹¿»ÛuïÙ</½™ıön­\Ùú=s“í/­äºpuwûû÷»øûï–~^÷n®ï£¾÷ó]gÏ¬ÖÿàÑw'ìõw˜ï{¹áw+_Áuğõ]oùÿ;İ_}}*÷Ïüé—¯ÿ/ı_–Æ7·7?ËûùøñKË_Õıÿéÿ¿[sìËıôËı¿­¯Y½k©îÒw™<cîÿõùêÛíøŞáÿŞÿówhg·¤ıÆdîŸ¾¯ˆ}ÿÑ?f®ëjû˜q¿èµëW¿_³¾6úå»ûíŞoö¦#3Ø™ïß¹ëõß.ïâ­÷;r_ö­oğ9û¸ëîRoù7âûÆ‹ö¼ò—Øí×¼áŸy?¾•ÿúÍïÕz'­óËÎÿnå~nKU9}µŠ'úçó“omjÖö[¿ãÿãæûÏıÿî©ªhûoø®¹Ó]ë½ÿ¿£¿÷İöÛùÚ—íÕ³úù}Ó¿§}ÿ˜ÿ7p?ùíºëÏ}vÍÙğ}¹¹¸y¿íw¿÷Ôÿã§öçİ÷ûõ¿{V=üÿÿòıŞÿF®eyvü_Ïõÿ‰õ{åäïöÇïïß¶ñ¿¯_®¿û´ÿä»ÿı›|üë¿¶ÿ/÷ÇÜšÛºï¯}óÅvÿyÿëÛ¶¿Ëm»~òÏoö/ßş×ßç4^ßí«¨8Ö¥Øıos§Õõî¿ñŞWïì}5şõwãçòüöM÷_Æºİ{Øu|MÖœ3ua¾çô6¤<åïèAŞûå›ËÓøüŞ^Ş×1ì?ÃH×Ü?y™öUO+ª3ç&7p¨ùn|wPş<Õ÷›^7­İçİëŸ/áşõÿÅ¿æ·õÕ}Cñ­²ıı›wüû¶¯Vçßû}İöx;‡©«ú§İê¾—uûOefaults to ''.
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
									if(!m[p.children_d[i]].children.length)æÿôûŸÎÿ¾»ôØT§xşÕş'ñòõ]§—ß½Öo™JYwıõ©»F¯^õÜßßWç{4ÍìµÇFÿÔÿİ›ßóÿşOÏ~|Ÿß«ï¿ÿlá¿Ítûç×r²´üëédı‹ùø.:ûû[Úùï÷[ËÓş¢o(îâàù±}ï_Õ¿ænêwíGµX %eÀ¶•£Â€"88€xè|¬!IQ †Lí¤Q,v N°â' G¬ d )FWÌ$#“ƒÔBÂÀ@*˜ ñ‹MÒŸ5FÎ‘ "	ÑcÌ(oŒ‚éF•£
 €…B.À#KaaœITÂfÑŒÓF¬P&+,3FÓ¤‡ÀAEÀJhi(Hò1C0•Dd{ìÙº$*D¬ÍÒCø ’„	„Š,³M.G÷9ğÄr£»C"€) ‹t¤OYÕEXL¡ˆ„D@’Šä”w¶EX]&ÇÂhøğWX8à*E®í¯ş»Ş¾Ü)’Ü6®å^™7>?úëïùª»ÿ™€úèòÿûÿßõ™«]îÙ¿»½ŸÍ:ôÍ«ùØÍn~ì=ôÿ8¹7Ûÿevïß÷mßYô?ïİğ&™õï§Çş<ÕpnÏH¾ûEı_qucüs/ÁWŞâs÷Ïë·ìİ¯g/¶ß«ùgZÑQéAT@uB$€à’øÑxÏş'z`Lê”2†õ’XGò 0VbÆ	D	3 - "W êúH ¦é$P3ÄK$ B¬çi2fPhbR9"‰ƒXD c"‰(! ¦+€òÙ°,- êF_Uâİ¨ÿ¶ñ›7å«­óıç'nÓß¹şİ¿2™°¿º^/şŸû6«Ş‰zşõ¾ùàä{NWüéóı^ğ/«uù1l÷~§~¿÷xÛ÷ÈößÿöªUã~ÿ}şï»ÿËşîóÿnùN×µÛsÉ©^÷G×dŸ}[¿û›÷ŞıÿİûÈøãú-ıïÿüúõ_ß÷ø÷7.ì[½uU÷'Òù×¿ßûõèïúƒ÷ëş½|k0ı­}/Ö¿Ï½t_ş-^ß—ã¯Õ§èó·?»6^ü¯Şÿª¾ıŸ«·¿°Îö?~¯÷ıÊ9¿O:«:{·û¥xÛwş¿ÿooÛŞË…êögŸÖ»şä5+ßÏèİÜÃÈ¹i"’X)#°OÍ‚º€EÆ‰ØI†6¤j
öü1gÇdjB)â€bPhH!&ú (Q
' 
`>UfB* ÜâºD•ğ¬¶GiîhHŒ„AaTX@

€8a¸©P æ…(!® ’˜á"°\ TĞ£ ^ÁRûş_òkíúÎÔùßÏı»Ş¿½ôŞìßº~¿÷úOìÿ+ùúıwüÿvş³WÎÿ÷ïÙ£?–¶kûïÿ’¾ô·Øùû«ÒÚ²k¿•AŸÔw÷?M,>ºæ·7çş÷Ìİ{5Í¸÷ËÖ÷î_ö¿ÿöd×ï¾÷ö£öïû¦ÿşÈ7Ó>ÿvŸòÆP Ò’ A†!@I™p® §^œ0ø!ÔV#	|a2e%H°ğ'­šEÉ5R0†PeĞ°¡½µ‡A®NFB¼3µâ0Ë²4uŸXQ„‘bl	{‘â 
ÃÅrJHl2WĞ=OTø-2£"«åUMN*¢p!#BÓ¶ÈE^™n123"4A|GşL§Txº-S®ŒÂ=
€®ô*ÆE©¨šXPÃc’1Å¦ "]D_jz@eÒEâ„ˆdPèˆ.‚6ˆ".N†Š„	³~ I„ÁAp7}ŒÒ!Ø B{ª €OjŞûî¯ı£ş³½ôïõ²æé¹ÿË:8yô½½üœ{÷>İîıc¯uæúßWßî¸7ó¤şı¯÷ö»ßıÛ_§÷ÄİıóÚ}ıÿÆ§îÛ±»y•½ä®+óš¹¿Úßÿöû6zgox+§w´ÿíã[¾™CEğ›üsÙû|ğßµë÷¾üßı_ (0R”v”3á+@õ`‡@ NÏ <'pZ`¢€9”%„¢‚ÃÀ´{Dö8<©ØÄ‚9_hÆè\0 i::Å´ŒIT
DLÔLpAÁø ädØ·šPG &ĞàVLÂæRb Kóîeó÷÷ùtßõ«âx¾í½şÿĞÏ¬ß¶Oü[£;öÏïßöúıÎŞ:æıõ·W¾şwÿsKÅ&˜õ/ßâÇµÒi_½‰ÿ´£§Å½ù|~_ıÎu›½ş^çWå©ÿ¥®{riî^wäóöUòe>—Ş·ÒõÏïWïş°İ½Ü%ïØÏı[µı¾‡Ÿ÷ËÓ¶¿ş/ùÿnÿÿÿóùßµÏùüNöotûŞÌ[Mr¾Ÿ¬ş¼ûk÷¿½İÿõ¯OßR^Uç}}}çïÿÿß-Ø´wßw÷èÌ÷?íïõp_ßş«İ×÷Ê?»ËüÎÏş×}…êï»çù^'®ú'û¤h€ÔDÔVV‹C¸<H‰i –f[-. !P© €ˆ¨ {+X x\òÓÁ*rjBè ‘ Èâa)~„ªˆ¡ÖÜƒå–H@DÂ†æDş²p­`@"1…W,I9¡Œ ‚œ $ %Ğ@ÂJAîË5Z©uvÆÃjÑßoaøg2ıßvûö›÷×L‘¿óçÿısü«½éÉÿìÿÌ³¦üıİûß|ÿgï|¿ë¸éó™÷^}­©Ê|~ÿVÙí³ïşüçöU~ÿ×Ÿh‹*ŞÿO}w¿s'ŠWû>¯Ñwö}Ì¿| ½i~[¼î×®yïÙwiVÏï—ô™~TšKà üéÂ‹NáT@ÔIÒpØY"!Ü¹@/ J(f! 0¿É	%ú‘B˜€:PÁ¼%€a‘óş@f4
Â‹â¢yÅÁÎ‹T3Hâ„.P"B	\ãVğH„T´8 FBˆa€¬8È¸|E„Á¯1MÂ@?ÃT…5Š¯"n4ã[NÅ‚ @¨&%‹ˆ2€2@2äãÂ¡
€ŠĞb!Ñ´Pp$İA—j'"À†ü<KM$ =0ôå&‡TI+ê›¬A  Ã™G'ƒKÄ£Ø v	íóWó½ñçÿs§Û<w{Ìú|ıÖßê¿ß­<»³í«{Ÿ÷ûk6réûøo÷ı_g"¿«ÿ×¾çŸgí°:¼›]ag£ïºİUoı«ÿ/yÍ|éæÌOïÚîój&Ymødüö~{P,ø¸HÏ·µİhM®=ù.ì¿¸×¯çÿ—ïéÒú—ßÌW Ãgp@’ Q¡G*Gf_
„Y-±Ò#¸ª”<+ö°XºP a9cx¹+…@S)Â°DÀ&xBI 'à9Ê.ˆ€"<2¬5$ÉÏBlËÈ•KLEh6 J)óNí%¨•1,•W®Õo£%‰¯ıë»£÷ğóßªµL—¼£üá%w}Å)­v,¬5ı»~ùfjİ¥{o¿ğü/óæİÿË5şî«HÓşR¹V¿ºşÿrÎÿ¯]r~ÿîöşíıó™¾¿ætTÓ¿m¿nŸğy{1•õÿ§ßmúi™û¾Ç÷ŞŸzçÖ'6ïİ¯Çêùû”4ìûüÏß|ïî‚ğ/³ııùùVÕ¯:??¿ÿ½ÿ8«oËÚåëïÀhökFœvî±*ûMœ¶ê>EHûÙÿïôÏ}£ÿş­úë¶ıßöÿúÇ~«¿ËéõşO;ñ?Ûñi5:íßèÊü6İ”}¾Şh×Oœ¾ëµıÊ…Õ1µ^$IHÔ¨ªC`êB²µD y³œÁäR€Ë)ihLLDdQKÀ	ÂÎ^»!Cº5„P‡,Køñi,f ( ı	à’b!4'³XF­$­»‚³]Ä¬t†M&ßhk§g.Bp*¬ğL?³6\jBb|ÀAzgÿÿñ¿CvşwñÆyİëC`ÿÿúüº{ÿŸúçŸ>ïêöÏ·znÚ}~Mw;·m/í‹ŸSıı¶ì‰oÿı;}µïöúÂ,|Ùÿ~öã»¼/ç}·m]ÙŸÏös™ÿN«ä_õ)ìY¸÷ï™íÏŞÿÜñ¶YìëßoÎ¿úV\†1„¡4². +Lƒ6ˆ   ‘BiS·=9FÉ@udÆD%#v*`€"E’ÒjÊàS‘Cƒ9bbRN…!G?v„è 
6!‘ªkg™¶ƒeZê Lè	æÔoIƒ ÇP@$IM‰î2À„
ª4E Á£‚dp…G
’€P ’6¸Ô“'É‰<Ä C '„@?$ ¨”8ç¢,€  ª€‰é(µ¾¸#¬“(´˜0c—TñH#ÊqÀæÑ
i¥I¨2`F6.!Q\—¥Ü"Ä˜^Q2‰Ğ€ j€éï÷ò|)—–t¾sõÕûGk½æ¬Ûnßw»Z²£×õÖ3~íïµº¿T;¿_¨Ôà½ÒVe)w÷£Ôßÿ7úp²ÇÚç2×©÷¹ÿ…Ó•ïì÷>ùÚîˆ½oÏ¾§ïùÁ×ÚºòşŞ÷=¿¾Ø:ú÷½lò”÷ÿ÷ÿ™.ù¯ßù±«˜µ¤òÎèìÄÆ&Ä&dÅ’u_Ö 'ÉZöDMĞ’r7) ŒÊØÊ€€Ù%p,¥jéEµsh½D L¶¶$7T‰FÕ 
¸ŒÇ $i’ÀK`2-MB`µ
sB…@IC!€DÜĞj…Á—jR
—±^(’ğl˜Şº»ÖÚñšïö÷V›^µŸ}÷ı·æöş¿t‹}÷ïî,óGÿ\?ºêÇÏÜ lwüîGúïóD»ŸÛıÃ¯ı÷¿Ø¾Ğüü˜ÿ÷úWß¯¾ÿ¿¾g]¦¿}zßğ¾wÃÏ?»õ÷­èİ‰çÿï½Ò«NJŞáU?ßú‘÷Ÿ}Øÿ×³şÏùıíŸùø?ùÿıÅõ¾ÓN)/ù|Õç/ÿîK¯»§m!ÚÕ_çôİİ}îõ·ßóşúmö×Ö×üê÷ş¯ıÆoüÖx~ÿªØøß/UÿzÿP|s¥¿{·&ieÌïçŒkİzßş¯³ÈË•¯OÓößü¤v»Şıò5OkŒgNù”7í¿ıN)|C¾€H@—ê @<BˆEÀJî ft ù_ ˆØÆâ$-2`-ï)8èQƒÍ¡©ud
¢€ŠD 9…5EìbÉà%#UE1+ÍĞ‰˜@¹B»4 lˆÁŒI<0AÖ@tG€h¢èBFPâ\ade_new_checked_state(obj.id, false);

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

			return $.vakata.array_filter(node.children_d, function(_id) Ê÷³½Ÿ"î×ïŸ¿÷ûÖë¶Íƒø÷èá÷Xëq&÷¨ëŸÏd›­åuï>ÜÛ_±ã‘Ÿ—nVz÷>Y¼—J³ô¿x?ğ§ËÓ[>³I®÷Æ¬/ëà«2èÎ#ùİü·ÇvÅ†ı>Ü¶ f}I)ºìwë™<Öö;wã¯ÌqyíÖÿœèT… ğŒ˜Tø¨C0¨&€düÃ€ÀDâÈ/;$ËÌFYÈACK @S‰‘(CX”P©…CÃ<$BuJ @bC× VkP*,[°AÃL™	„ÁK` L"dJG@$@ !¢QJøY„,
¸PK„’s0NxÂ
€Í		 ”IMŒAxä¹
 b‘Db(ÀH S`" ¤Ä	@€
F<N@¬c)D…„SrÀ˜@Áä i+˜@–X…‘x üd$b   –@ A | $JÂ@.ŠH
êù¶×-öK¦„c²U@w_İ\ÿ_;ù?dqÁ]cß7¾…+F]²S–=Z¨7VCÔ×­÷ÉAÙuf®şo«§I«ó¯t;lNã»üm¿¿ŸîşíîÁ>ıaLÿ»ı~ıGè?ÎœÏ¸åçÏô,| \£ÎÛŸa÷´í¥{Úü?ö¾ÎúmbH ˆìDBj Ä!188 B!pÄH•pcBN€ÅŒ"	Ë ,à N†$@I+‚,I‘ÀD 0 €Bğ€ĞQ ~$Ìh@!ì€˜ ND&¥ (BKVˆ- Œ0’À  `”â'×Çüİş°µŞkÎ˜İ~„¶Ezñÿõƒº˜¾gÙÓûöÕ1÷}¿ŞıÕtñO›*û=ãZÇ­ıûÚVµ÷ı|ÙÏóå¶&¾âªÊ%?ËÖ}>Ï;¸›Üs’¾óo~ºJOr~wXŸ'Çùõs¾OVô=Ô®Ÿûİ~LÂÏbÿÄï=ñÛ´ŞÚ¯Û¾ïk¬UğfQE¢7>#Îó|+Q³¬o/âãM÷÷Üİ~1ãİ]Õ3ëb‰æº‰ÍİÊ
ö;=gßô½á½›'’Õ>P\9î˜ı×}ôò‰<ò¬ÿcüÓãİ»w~»·½wü—ögßßÿ¼äÎ½óß~³næÊÕDdÄJpCAì˜ÃÜÈÅIŠ:DT©(W`V @rÄ$6ÁU6!a+W B%¡PT7Ò5'è	 @¬R¦è†0p²ŠC’L!¤p!)ğ¢H.0f@ L j¾ND* P	 !
\ƒƒ# ´ç|ÀóŞı%ø™ï›[MgÿK×5WßÛn½¿‹õ¿¶ÇòúwïÔcéñşùƒİ>ë÷ì—÷M¿Ì|üºg	¬¾?^´ËŞıf=˜_­¯^½»ñ†¿‡û8ßºükûşcèòöû­P(EöÕ¶CE¬UŸÓÉË”@?oùÿ+õÜelcHa~Ñ0‹ (î@  …½œ!€tà‚4Â (…le«‡A
PqRØøf8FŠ H S+(‚oˆR0['(Ô°à– ƒA Ä0à œÓ 
p$@â"€‚#0Ô%?²%"¢È  1txË‘€0«‘ÿŒ6 CICm* i)…VÁØ¤yäi ƒ¤ÜC …U¢J1`PğŠH€ ”C„ !A±0Ú!JÔ	 ŠĞ¤AøMÔ J(AAHı Ag€öBÃ €„
9Ä-†J$Â¿¡Î! «ÿjµõÿ<"úÄ:µ5¦iÔ…H‘®;ïûoı|yø[óŞà' |ïÜmÒOk÷÷ÍŸÅzpìŸá¥`_-§tõáÎäw¾˜-¾	³Z%Óò7ÿKıyÇï¼2Ş±´“#VüS™˜NzØşïQô_i<‹UÚ¥sYåîëmtıò&êvg„jØˆE€ÄaÁŒRd	BáÑH2©àS%	 $)? 1
$  0@€À	ÌÀ `eG'!0°(Y?V HDp£Œ( 5H ¿H	 ¾Lœğ¯" A  ôáCj …@úÉ£Ø Uê8ÓìÌß~Ÿm¹ßº•Ó.w·¿…¦?·†õ•¿%né¾?üóÇ£ìz¾ÙùÉß^\>ö_w:¶ş¹r¨ªç,éõ§ó-ñ>#KwæÏ]œ^bµj7èóÿùÿ÷>‡WûXbèúôîñÏ¦;ÿ–E3ëîg¼ÿßÇz%ÌßŸ»®q“óıw&çôYõé
vÓmŒ¸ÄzFölİ=ÉîOÒ®^í«şîß´tßfµì[Q®¾³Ûm›·ÚÇ-Éëšûª™øÔ\\=25Õû~ùìïÛìØì¾~}µ}ı´é¢Wê›Ş¿V¿z¡våí½÷Ş7·¸îŞà¶}nq@ç®Ş;z9ìÚÚŠšÑQx©O\¡	Š@€†e%$BÁ›1€@ _>q…A`SaÆ  zÎˆñ $ç}§„@ UÄE0áP‡ \9L¡ $€¤* ‚7$h‚˜¡@[£ €Ä(Á! ¡Hé(,X•E1 @ *6Bë+î­wZ›¾}ÿ&³×êŒò¿{³¿‡õòû×2§k¼åÀMaŞì¼nöÿi‹»k'îò·oìö¾üıvÔÉHmí~öòûü„ØáÑÍ3 ŞD>ıº,óëÎÎ¯P‹¿“ã-|á¥ÖÏDÕ“íÎX´éÍİ6æLõ[l×+Ÿ/3ã @ ¢4b	 € AN<È—Apoæ!šÂ`Ç] 7À€Á(ì !QFG„A4º1
|l0hÂC!U”R½Ğ„«h %èÔJàx\I–›† .O`M€ Ãº	–÷Ã"¬õ§R)©˜ƒi€€IŒ¸µ ØP5Gî=ğ‰‘A ­TY;NpÀ ƒˆĞˆlÚ€iŒiË$`
ò‘4)#%ƒ$‚à°®?Å¨t"
€
A:ƒpX 8*jsA › <F$ %Q’ £íë½'ÿşvƒİOåÈ=oO—rïÜƒ÷~ï÷×¼‡ôgû}¾ú7:ÿ«/¯îG¼–™»“So=­÷9É™_¨¹®ñòìïŞÒCµñ®oÉIù§Ğ¿:_Âíğé~£ù¾Ïïq¾'?ïOÃFxËÕµı)Æ¿¾{Wh—çŸÏç ×yö‚˜*4FHˆ  ®)HXr›%LÚÛ€R×‚ê¤@“r9LH|«G !…  ˆ @Ä!À º î  j”%Å0c8@BH ‡ €pVFñ	X†90´òUÀP  µE2 ™  ƒFÎÿ³Ó¯{_£‹ıGòÛštÍÑº?—²çJ÷ø?Ë’gùõ“·ÏúÆ···poÇ5ïÃïeçÅÕÙı·t?vÍ§U?ôß[Quä+±¯½·i~]2ÿzÿå"¥?_ÿAõ-îÓôÿÊV/™”õªõ’¦ç½ºû?güEXïÓ¿ş}¿¾>?>G[Uÿçÿ´2Éß¼;óá˜ßÛòYg¢şX
ûé±"SßıÆæ'ÇısózmèuÆ×òïpóâ¾şöÏwÇnzTg™¿ìµ6~ÌØúÿ)im–Ş`¶AŞnWë[îqıo<7ù6›¨úÿÅoúiåßüû¥›Æ/ÃyÕ•ß¬ç×Œé[BY€ " "šIÀm€aÕñN B„œŠª¸À`‚uàv Ø0À:ŠQ‰‚Qo€l 1R
Ñ€€ˆ-@õpP$aÒ ê•ˆ0ˆZ’Ìkˆ‚o†€*0‚T 
D8†ÀÄBS¼OLH‚@’ğ‘`àô ª&²›.=‡®	åmj-Zÿ7-Ï›"ø½ï÷ì=á¾ÿ=_ò7í}œœîÇØ»}MÒ>[/=ı7’‚4â–¼T¾g½Ë>·Òƒ6œŸT?îgçk¨5âÒßÜü¿¯ÿù×k¯?W–\Ã~À#ßfõ}ù¥kÊÚ}ú·ûçÕqõ/µÜç29tÇ*ı	( " 8! ,|¬˜…EDB Ø @B† ÷€)£ÄFH r‰$…v#jÀÆy}h™@aì@O+
€*¼	6ş@@ CÍ„A²XJAñA ‚Vú‰á ‚@&e—#G&€,<€(H.A€@ÀÀ À 0«EFP!‚ 4°a°d"“", : =D¢YÂC`b@„P €!™r
2¦D4B„ ĞH‚&Èƒƒt‚€a0¹¾âfH ¹~!£0ˆFZğb,"H °„2„ / Ì„ànXJYÿí‹‹­÷iÅsáMîş%éSåŸÏ;¶>…wì;Ô\ğÅŞŞÏƒzÉ¬ŸïŸ|î0ORÇvŸouûµå®¿+ıŸÙ'öo¦uâ}ıñmÿIG1ış{é+Å¼ñîë¼ú—\²]H‚¸äÜÚ³q=öaÉIæÕ‘}dŸ¢zÏ®hwE Š …x
…Š*DD	©æG@’ GN¤¡®êŒ
xM^4N6  è!O6œCR! d# )
  2Ày0R@r"ĞCbiJˆ®ä8
œDtˆ: ¬Wà¨bé"
èÑ b‹ˆ`ŠéšÖÿ×·U'å±n»x5¶™ü³Oı[mø¿ç¹ı{}ä¶ÔîZãú÷óÚ.va¬ûãnnîî÷÷÷Lšş×ÿ·KÿÒ¤.oøË}VÃáræŸ¨Ìîzš¢~İT1o—óËé^îbh÷'¯¯^İíäé`ÓU®ÿT’÷ÙGïü³ş*”ñäÖùóğ}ı=î‚ÛLß·üí;ív{6+û¾^^?ÖÍÛî}ë„ŸnØúªÙ¦{ùpÓwÿâw}:øSâkX>Òáßü¿ÿÏfu{wıZÅıä¦ŸØ½Hwäûıù-Ù[Ræçîó²~kÿÿş‰îïÛùíîı¾u\ù‹…³¹Öì~ 
„} {£`²U‰4t& Ô@õ‹n ÀL1AHå• %¨D‚O,—Ô@±¸#R{Ö
‘çDÁD<ÆÀè0² Bf…y€– ähCQhrH@%
ğäB†,Ğ˜D€#hD×RĞFœÚˆ3T1+¹dAØEÈ%Äâ P{-¸L9‰ÂŒoBıª`ÁO«Õµ P(eÖ"xÔa`AÃ4FA€´PQ’!i·Ğ/#G¨0Û‰P„°I  ß|’•?&:’ H
 "²Y€ a+ ÈF€(„ôGĞ.³³˜NyíÇÓZ~Sÿ­ïåã÷ştïy¿ù¬ÕÿÉï]„œÛwüİÏÎï³ÿË¿§ÿÒóeíÙşz]õï{}+¾šø¯?~÷ßŸ÷¾•ÿw;óşÚµüz¹-ë½4Û¯âÓöÇş_Ì;çËâüßıß>ém¯Ñ~Ÿ¼ßûcÑé{Üÿ{ÿ†;ÿSdäéı™_úßùÿÇñ¿÷í÷enÛßó¯ºû÷¹ÿïÿ¸jå½t×\£í×Û÷ÜZö»Oõ\ÖÇå“ßQÂ—üÚù?î{å½u_¾ıÑ}mı•øE2éb÷½zÕãÿúø~õ[ÎÇÏÇŸØÜœ~Ææş®·÷Ø÷öıòİ/½ûïm.{_ü·IŸ‘&UÍ	€ ‹ÇRÈä%4Kƒ€ˆ[»«4h I¬,EE¹Ç‰hÀ±yÇB¬%Oğ` kÀe¨Ä!¤™U’†'†Tä3š&9&-…™B4¡ ±„à¹tFƒH aäƒI2( 'BĞbw)C#”2Õ@KÜoôX/Å~oëçï;ºÑßß1é%ÏæN¿ûäŸßşÒÎôwÿıäÂİ™|<›Õf¿¿{íá2>wËÕÛoY]ÿÔorÓ\Î_ñöÛúPzû¿}Ş»ór½ãû÷ß´¿ÜşË^]İ!ûó9ş#Ÿ˜{Üïßö}ÚÓüóù¿Wvßk½Ë”æ¹IkhÃ"ŒH±9—1 œˆğhÁ
i„€jPÇ$pôÊ¥”T@šĞ YD2"wÀREãê^ÆÖÒ#¾Á0‘$ R50DjNPÀ’	ci‚Ü€€&hB€NÂbDªRáÆ&äŸÄ %´nà¶Ë;QÀF<¹ÈLÂÀ/hµ0jèÃ-‡
‚Ü(Ğ? [ 5û^H°á2H $ˆÿĞ²éôÑg4YøA@Œr›F!jDäT„„òe(åº•jC)Hl‰ZAE[‘‰00 2J÷êÿ67·sn{}ÿÏÿjn·š:õ	¢şõºy[ıŸï÷aÊêè[²Róyî.ó4fşyçï¿½ûŸW6çwûßÃì¿Oı”ÿÛŸL?¹ÛÈÿİëí×·›Ş½Æ}Ü·ûiÑGïkèt0=>T¤^§*?yNu%?ó½œÿo½AÁƒ8 ¢°C…)‘!dÊğá]]DğE Ê¢LA¨ã(Ú¨³¢á†èXÅ‚àâÁ¼¥¨VS(A@A@!ø!(Jòn=±|H¦ **%í#ø!Ó© HƒÄkÂDBÛ$ÅHÍö ` A ¤68Œ#€@!ğşûù^{gçIóúÌWÿ}üÖ­¿}İ¯×ÿÿÚmWû¾x›ïõ·÷÷Ókq}³^É³˜ÿôÿÓÇÏ‰æ¢¯_İR?ÿyûÿİûg¡y]â—Â¡ı÷ıÈÿıÒ¿ÛùÃgÏ·İgÏøë)ïş»üçõôo¯^ßÿ.ş°ËXû?Ë×§•¿n§h÷ö¬ko–—ş¾Ÿ%º½	Ê½÷©±v>Öå¬Wÿ;B3²·ÓûòáûC·½Ëï`fwóxgºş÷ŸXuüàÿ¶ê>êı~ËY­~ï»Ö^•ãÿç§òş±9»°}úßäÍŸçuÓÓ¯ü·Çøû½÷^Töÿ=·…O—·ƒÿ÷ç•
Â¢ÖP7 dS¸9ŒûöCÚK^ábºDˆÙI"JªdÀ,	á‚""Âƒ= ¡D"”‰MÄ†bÄaJXÆJ	z°/$E¡TDU $„	T àb1¨€.˜‘X×¢k ²B“<ƒC‰âU1HK¤v÷c¿{ıÊ¼èùëKŞr¿ü/Oí­ú±ÿzi¿u*Ww·+ÿ½İÔf§À¿Oÿ÷ºd,_úÍû]®ıeßı–÷_íÿ^³Ÿ7ŸŞ»³çı[òÿEÙóÿq¾ÿ­îöÿ—{Ïşöùÿnaß|-ëij§ù“ŸïŒ—Â«½;î±÷8ş DÚÊÎˆ‘‘t›Ğ6Ê÷Rá!è0W#ÀAQJJ&©°ş:e”`„aÈt½3WV'@q	µaà£„(0êÇ¤° p‚Ağ¢$P‘D¡PJÂ÷ŒÔc- èWG#«À• `$õSŠÃC4Á%È¬ù€„`6“¤=&I€b/.€mæâ%0>)q2ˆ@vCs„ªc²>\@¾E˜©6‰š¬&0LaŠæ’

pÀ‘˜BH Lb3äÒ”¨À¤!Êr¦#Ô(eÑ‚Õ"?(â"A IF#Ù9áÄá÷ëw]çO¾oÿıÿòkšö»Ü®fæş÷W²ï;ãşÍ³\oş¾ÅüÑã¾ß¾Û›ŞGqO<Ößuw¿_Tò»[ÕÍËã‰u¥zº_ùïÏ1r{¿Í»æ›~ÏMÕyŞÏİî}åoéø«z÷ŸP»‹ÃOÿ§ŞßÛ¢ÿÿé2‡·¿/çÿËfQ™«õr!ò+F”d†‘„Q[	Ÿ:-îD˜c1	Í K¨=r£ËM2+À8bÀQ˜¼PT‰À†!Ùí*R…B(KšSOÍ6<‰Ñ;¡<D-±Y("ïˆT˜À qD êb°[2™ ¡+”\¨(zÿfæ|nï`¯şï¿ÿ¹¿ÿÿş›=gá¼ãµ›[İ´o½ø–ûo5ßşf»¯¯éÚû¼ßz-İãë{ŞÚóÌ¿èúÿêÇÑü›ÿ¿Oß÷?»½Ûóÿßåa?_ñ·_”ûÿ÷«Úşßß‡×7÷Ä/ù{Í_cç¯»¸ÊûÖï&ßÔw·ÿ|õÿ×¿oŸÚûıwÖÓ:Uİ›×çjÛØ;>ú×|õÿ¯wğìz½ù±ıt–ãş¸yÊşş»ü?ºÿØÙ÷şë•»;Ç-S·nËıÿÛ»ïûû/Éİüßó_ÿÙl»ûıöoß`¯ö¿ıäÿ½b;{úÂvKr×Ra©)Ø$šˆ £:§€oG‘!s†( 
23±$–4<€à¢BL‹¤še^B´³*@K‡Êdß´Ö0xTeY†€ã °!DL=BÆpD$ ¬
¢\—TI	Ìi@ØX!"M 0 06P Á`’ÒÁ "
Á»uş½÷{ûc¾ÂoàÜßıÌŞ =«Ÿ÷œ³Ÿ¯%O\3¥.-ÿşÑoõ-¦v=§‡ï?ò kœıâÿíİ½ûüçïöØ›ííã¿xÿŸÉöß™êï_Ë}ÛÛÏÖS^ÿü¾ı¥{º§’zü•îö¾ñÇ±ßÿ§ßôKÿşŞs{¿H§æ5 WXJÈ T~†b’#Ã²”*M(¬Da¥ŠC1Á‘€3à"aÒB’ "tÍ·‚§@L¶¨	HìA†ïÚ–† 2„İøµZQõA|ÇN,ØßÀd*„°1Õ(J€mÆ£Ìš£ Bâå0ÌC4D  |‘Õ8…­\P÷ÌPVr )ä˜·(MüerJÂ)dE˜C ©7EêÖF¯@ÓJê‹[0³ğ$/›AÀƒéÖ8‹A“å€wÀF: …Ö #E1¤©læôÂa	X2A€ „ò%&`CE"5–õæuÂE;Äƒr{Ÿƒîõµ’b÷¾:{zûöôË×Vßßı·şñ™[÷;¹»œmÑÿ¯Gü—Ñ»¯¯^{³½¿›£«÷0÷»•?³¯~ÿv”½¾şø·ş&õ§ğÒşÓÁ;eÿŸ¶P4÷¿ÛÏüw+3_öSıÿÿ¯Öv½Ë§ßï%<îİ¸¾ÌNùßqŞ©MÈÜ(NaKì|QNğƒâ „ã+Q¥(l*VÀ,Gx°G'Š#B N(
OiCQDF0Šla h@	¨™@i-™´„Ğ‚.„`q¡Â1UHä`¡D•FD- ¸pJ“LA@áv‡”DAçeß€Zjéêíßş¿Ş»ïûmşİî_ÿıº¿y[ãıu;şÿ_üïoãj;¦æ©£-¯—¿ûÿ·øìëìï×Ö~÷ìIİãóß«$oxÓ×Î¿¦^tß×/.æ'Ñûx>Î]­ÿUıè?÷í§Ïüš¾ôU™ám}ãúyı<5ï·¦ïíƒoïÙø¹ë÷v?á»Şí¹ÚÌ½Ó§‹ÇÛßÎıó\ãoÍ§<«õmİOæŞûm½=mÇëıÿ?ş»Ÿo½nû½¦óm]ÿ•¹¶?o}ópKıùû÷yëi~â&ñ÷¿É¹ş~éšû÷ÿŸş½ãn/únwûmıåE_Ww×Ÿ¿¯ÿßÔú±»ıCoŞñ†ÙšaÁ‚2†NNtá3”Ò§ R‘°(b“³e¬¦‘U $Ua” !+H„‚D42  Ø@ ¨`2¬°&Eü@%Hàz;  hVÅó0C°® Éa-H7CÈ@X'‚ãe„(D‚­ Yf¨Ae”´…şıeÿÿêÏÿÚë?ncgn­Üÿ¯‡•»íı«=ºÜúùÿ£ñúü‘ïãõòyÜî¿÷ÍwæŞïñ¬·üş|ı`ÿüÉï¿~ª?q{úÿÛÜ¾³ı§]ÖXš»ƒëGı~¸ôîşæ¸¿Î6]W»ş¿ïw–æ×=¿^½{wnb÷k‚¾Š@‡ d@@Ï‰v;° @(`.2‹„ƒèÂ :Ãm„MøI™q;PÔFUTA 0‹¹õ6ñ b¨eHÔ‰w‹È‚A5 i@PÒQ«h Ò%…U´áUHÂ »±vyd!D"¥CD!D‹T  ÈPDhH±+8 4-Ñ\ÆèIÀÃ™Yï¨Gp#hÀpÖlæ~r[LŠ»@-Ğf”o°HE“ &¦H¬@Ã_§< ‡`¾PÀª¸Q,`Š•0å&6D 
F.0ÔÖÒ–jFF™0>*œ•Jš 0ªNı7Ã·‰ŸŞÒI÷~Ù½í×?I´ÿ×ö};•ûÅ÷~æùŞzß|ùV[Ş~û½öëŞûç’ÿ~Äû_½mÿ§şù×îw™®ŸıßîtïöûÛ÷ÿ¾şvö+:w¾Ş¹Şöo×ß7ûşÿu›ş?.Ó½_÷Şs¿¶¼ÿ·ÿ¼y+ÿuÿ}«÷jG|³‡ò¼õÛ5ë·ü‹?î]]ô0ÿÿß;~óåùıü—ÿñÓÆ×û]mûkËØ™ûò?}w¸•ÿ¾æU"V'³}OKıNãrÙhíwöôïl÷;ûû»õûuYNıîëÿ¿œãúÚ+n\{7±íıŸÍÿÿ¿{èÿ:½ô×lØ?/ÿë}Ü?#+ñ_ü±İídsßÎşgäó{øøeşñç·İöŒ»XÜÏºÈs>Í~PµÏ¿}r\nêÏæwz:‰Cø„·%ïÍ~ü¥ÿÏZÏÛÕÇÿ¿mN¹ïßWf¿İ€y.mUİ†ïrkvôoÜ'`ÿXÿ.÷Éÿk}ŞïşÄı¼ë'ç…ÿ¯o¯~ˆšÿ:ßŞİ{ß£°«Qé÷şŞ{ö">3¾§¹»»÷Wqô÷sáéÑû£ù«õû/÷¶™ŸÙ7s¨µ·…}»îiÓ+'¬nïüÚ›ô’İêë»}Ö®r_&ÉSäçß¥W¬huû<^‹«[ç·jŞş¢·Ÿİß´wsX´ş·vZú/}¾¿JØŒf>ëï³»ÿÿİüoUÿËûßÿW8ß×çV+ûïİß—ÃuLÉúÿÿßWÇ¿v—äVGÌã™êGşi^•_ìÛ‡M3"zÍ¿ù/[üúë¸lµ¿ÿ~îñÏ®ß[õ»|ëí¬mî—Z•îÕïoşçÜÿÿêš}|şµ‡9_æÿzáHÆìñe.°ß{ryï-§â_ß·ç¶Å·«]Îwåö?û3¬|=ÅV½ÁµæûÛyE±ûA/¥ÓWë^?ú§ÿf_‚ËŸ¿°ÏóÛı›ã¢¬«­î·ãá®®çoY÷z®¼÷+Ù?J{¹ß÷ûùïnÎW£_Y{pWËø;Nß•»Ï˜£²Ù_ÿßã{ÿßŸ×ôÃ}.ıÓŞ]¨ÿSÿñÇ}Óøƒë5àË¹\æ}ö^g\»vİ=ıÛ¼ÿé‹÷ÎÛ‹Nº!¾ÍKz?İ'ï~rFß9eYº®ùïuşïù]};µ½­nû÷ôy­;öİ»¹oNynjİ¬zı—ëw¹òmR<ûÏŞS;÷ÿ‡İg«>¼×™é¨ç)Ëd³Š7ş?ŞœñoÂğ~¾½ı]éV“U½"äó÷ï;?Uıİƒãë=ª¿uã]ïêÛ·ÿ_Íõ¾ÿ–¯ïßoÛr¹-}[ÍöÛÓwÙËõÃ½Öéï½]_.VºíÿıÔÿ[ˆÿëm~Õçæ‘k3?«¹ß
TOÌõn”ìM´ı˜¿½•÷JOu.öÿ…HQéÎ½3>µNß·çÿ×å|ÚÜ¯ù?}ş5Û›¹s]ùï²¡=Ï<ÙÙİ„úB}T^ãÂÇî¹·óóŠJwæÚ9<W}}ï¯•çïúëÚï0Œ½æN·\¿ü÷n‡â2Oõİw<”×&¯ïÿÿ§õÇÜz?ÿ˜³³Ùœ¼~ß¯=ß{Ú;şSÿí•+ßÓOs—ãğúŸs÷eÿ~úüüÏ"cÏµ÷]ÊÚë÷y~:ßuóo¶ÿŸnº¶~?¹Ù~ëÿ^3on?ãõôgß·[ûyÙÑõ×p3±ùoSùÿ¯¿kt¾¸¿ÿ²ß’÷Ï*_Şmİ»Âä3iİëlÃò“º§N©apÌ†,Ÿïï+Çêwïnë™cşWıİÖvòwôî½°ÃÙßYn}“ÖË¯?Ümt!wU[ÿù9™nó¿ÛîPu‡söµşè´ìQ÷>+xûÕ>õ[y?¾rÌó°ß¿YLöIä3ïö¦şsŞxNıõ£xĞù÷±ÇS¼õû÷÷Ú}¿mŞ>æw·öJ´½kçÛ‹ßÜ½oçïÅ§½Ä¶>·¹øŞË¹şÔ_š¿÷E?÷kÙƒõ.ûG›>ïÛ'ß?Ş·ï±•«G¿^şÿ{´+Â÷ï=ŸËi¸_u×£½¶ÿûœÖy¢‘sM½ïïÃëüêÓòıız;Ÿ½ÿğ*Çc\îÿı¾oßÇôâ¿ÏŸûó×ëJîŸ«Œ©³¸~åùØ½ê)Û±_2î5¯Åİ¹KíŸ»wÚ}k»qO.ûí{¿«Z/ïóíß3Ö¶>™æû¿|şõ¥k>~ß\êì»Ÿ§¼²?(yÑÓÖÙøûO.í{…¾AÍnâŸ±¦ù~òé»‚÷ŠOo?ìRß|ı¿uqıeı¾÷Î:¿ÍÛ{ÿq/Öüïó¿æç÷³Oc|Ó»·vİ4öEïvÿ¯·nçôâß_úò‹iónhª‚“öš¦«;uS;¥t¿ü‹âBD¿åğÛ›ü§ûëÜZµhö¡ÿà¬w|ßúFûŸü»Ö)ú¯{~Ç¾]>Ûî‹ı¹^óõTÏıI×sÍ½ùÃøÖ¹z½OåØ¥ã`¿Î¯w}ïÿŞùÿK_º»İÕaşÛoùkşsû·î¿ÿ®¿îc†Zû}»nğíû²?ûòÿ}¿öÿëÒïnÍ?·eíO=Ïõ·óèi¾¹Ÿşşö£o_­ËŸßã0²Ş@ßÿy÷ö×©¾õ}<j73)³÷ÿe³~ıüô}çsæ;Jé_5]®÷;ÿşÏ×»´»õåÖLÿ_çŞ¯÷İĞ~îíù“l#Üµÿ÷i{ëæn¬ı·!Cù{ÿ^Ø«²İ¶ó÷µƒåuš¯Vğ»¾˜ã»t×iŞ¿½¥…ëşñşë¿zÔ§ìıóB’†İãñÜş^~´R­BW2¶>îw©¿àı›Åx‡ß>ûçGıÆOÅüöÿÅş]Ø¿ö?];»}ş8µæú¯’–›ùoÑİØWşµQ*>6a1şù†~µÙ÷{¥İ½]Í¬Ïóƒù¿úß½ûÍZ¿?¶îó?Ì}=–÷û»ıóÇëıû÷¹È|»°İ}Vï­ıñ}±ßs/o´³ò]_ëy³•mû¡î«Ûçì§sëÛŸ?ÿªórõ®úÏ©x|og_úÿáŞîÏ|®ín¾ão]ß ¿ŸïnóÛŒzûñ»ı½İıÊßãü¿×ÿKÖå6}ßd/şÛ¯éw»ó”oïû—ëı;Û¿ŸO~çïkÃÇ¿úõSs¿S8×ú³Ê«=õ‘ûgô/%ÿ¿ÏrŞ¦ÜôJJõ}İÿõÿ«ïórwİ‡Şşı,kÿŞ{î¾¿îêNîy÷–yJ7Ïæß~·ı“­ÖĞÓœôméºç>=ßnİ:®Ë4ÿ%^ÆOßïYÿá¯ß×[2ù‡ò%nÍnÖ¿™=æ[ÏçjÛ²óT÷#¿æû+ç–»fzİÿzÂş}ñ#¿?¯ğ6wöÍowùçne³--ß6ÇqÈo¯Úà>ó™¦ï~Ùã·«·~¯wÌZ÷«®\´Ãîş?¯´Èóg(ys·?­e?ß2ûWª¯µ¥ËİÿÿßîÎÖû×nÊÂ^œïâüû×ßÑº÷³¹×;ñĞ±+ıôªëx½uO—Íröù~ğÙöÅï~Ë{Y¼âì-Kş‡ıFxº×üˆ×ûÌ}q_ÿï_eûñÓ}óû—ıá[ß_ü¿ËµÎşoíŠ?ª`öŸë{wûd}‡½Ëk¸éâU:{¾oïñ‡ö6å½Ü»??ÃZØç|˜Ÿz:×/ÿs<·W¾igŸî@§s.Åúº ‡pùÛıûõ¹ä´{º~.ÉÇ)†yçÒ/ûgŞÿù?z-ªíÚ¼ÍI×~?¿·ı]Û}g~‡^Ê“ÃÓ¹ş½şÔ··Ac³·¿Û÷û¶M-¢ã}ÆwÕí¿¾_ûmÆÿøq¹ÚĞØÆï{¶§Ş-<zmã{pë?ø¯ï»ß¯î³w?_ë<oõïÖ–ıï¼’í~woÍä–>Ş;~ÿıÜ«ÃïœmGõÛsúßóø¾ï·ÎşÇîÿ½üÚºì¼op¿xË¯üÇ¶¾Å¿ŞåÉ]½ı÷ş{Oæÿ­ï«w¡½àÿìŠhëÈ~ıãüãJ¯üÿÛûü®VeW}ÿß¶v­ş}ßøoÿ‰·ç“÷ïûló×òí×]7ç÷»½ãvş‡{Ò_oÿ_·Óåúoûsÿúïæ{ûïÜÅm{·ÿËë½²6/>öûíß÷ÿÅ¶×¶{-î{ï÷ûÃ½ìÃÇv³Ë¯w»Û®o~şOnìOús­ãİS»kËÔú¾9_b®ëÿ¼¾[ùWõ.öê;G|8lhSíM9¯oÜÍv¸“óM§`ú3ß=åù9şŞå¬_qõÿÏÛşOÏõ¦¬¯åÜâK»Ùªny¿¿’|ì}şó³Õü½÷3ÿ´íuyİn[Úy!ç·»¢yï¾ÚòßówÕïöÓû{şêş¹éRE¨éÛ?âoóÌÁEÖôğk{é:æöÿ_lµï?w¿Wşÿ>_¯Ÿ¹ËMûÛïî>õJÍüº[í>{˜ıv{·¥ùøí‘û³×¶~î†±?—İò–§Ä[zñ¿ù~]wYôõı¹÷{ÿT»·3y½Ïz%“i^wÆóïßÏçq]u„÷oSqË…ÂÇå'a}¼¶yß¶oıjÇå÷—Ïwÿj³Ì{Wx—¿ü”û]ßvª—eçÍVıÒC_Ø«8ZVîŞ—e3)—ığîšöûVüüF-£‹±ş©–øî&/øß§.Ûü{Ø)r´?¿ùïıejÍ~óïİ-âÿZ&ïõbãòz›Ösşsnmw*ï¿Å‹Ú=fÿ[û9m«ÌÕÃûü—ë?*yº¿à·ÚÔeÒËæ…÷ãÙğkşıÛèí¥ŸT/œö–~öBÿÿÏüÏÄÚŞÿ_üÿ§ßÿ73è}İK³ûôê}¿–ËU/.?‚è?ñß»í	_Õºş®åÂÏ•İ»îöëøüÕOvïşÖ‚öæw¾ÏWïı‡ûu#êm˜I³]ş®îúÛé}õ|û~Sç³O¬‡ş<D¾ãOÃÚkÊîğî|©|±×í©ÿŞgûù:é¯ûîÖşÜéıïš÷.ç®í€Ó˜Gúãõ¦¾ö‡÷ãm|ÕåÿøÙúšµqG÷—-+·‰{kÜ–q«S'üüpÿUNì'·oÿk_	w>ûul#ZÜó¹ÿvw×XÒÅõ¯g]ìß¿`2gÿ»_¼,•°û»¹w>~yÇçMTuxéé¡­Ïí¸~dÿ¿üõ7»~Ãë¾áûò÷úÿÛ¿iÊè>,÷û‡äyç=ï‰}±OûóşÇ}~é·}ûûô†ö“Ù(ùËni«ñÇÛ÷‡Í}ó¯¾]Â•_¶gçıöÿ[¹ñwSıéú«ü7ó=Ç·şşkíŞÙ¨û]áómfïg‘íÜ'×¿şÌÍ*İîßîßÿÉÙÈ°³¿ñ=:n¾|·óİt0¼ÿW{šíç\]¶¯GÎı¿óÖ¾Ì2¯ï9ÿ3ûİõ"|ôşZışÿŞoüçé‡Íî÷­îê½Ó×}…ş¼ì·ÿğº¯|ôÿç÷ÁŸ_ßåçù÷şŸWpq³¿ÖEfSÿ~cİñWót¯×SıŸÙk†O=Ìİ[dÍ5ßŸo“Wèæ_ÒãûØsûC´®ÇÊŞo^Îî“K¾×wGï;ÇNÙzÜêË?ÚŠÃ5vß=a¨:¯+ÿÿo=\·óåSö÷ãÿßß1;_o!;¾Ÿrgy¯ûyİ¬6ˆoş,•®óğmß?}o‰É6¿]ÂeN   íA     ÀÙaL€ÿÿÿ ÕaL˜¤G    X   Xœ¦<hK`ÓœG     'ÎK=<+3u¼®& €     íA     €ÿÿÿğ¤G   Ş¡M€ÿÿÿX   èéa8°ÅeKPG     ¶e>/”·—®& €     íA     @“¢M€ÿÿÿà™¢M  X¤¥	    È©yI@½ñô¸XG      ¤î»­\ÔîDÉ³, €     íA     ÀÖaL€ÿÿÿ    Àã<â¤ ?ıf    àõòEè’N     ®ã\–şËªÂ—CcÚ@µ €  íA  ø¤GÀã<â¤ ?Xj    ÈşÅ?x‰«:PÕÙ8      :AÎÌWv¾v¾k1B‹Ø( €     íA      Ò"R€ÿÿÿ Ş"RP
¤G    XC½    @P2Lè±ˆLH†G  ;½      İµ'ÎK$£\/­k‡™®& €     íA     `¢M€ÿÿÿ¨¤G  p’¢MX†3    HÌiLPåG  &3     4’òzW¢”È?`N' €     íA     _øE€ÿÿÿ0SøE ¤G€ÿÿÿ     ]øEX   Ğ"M€¾ñôp‘{G      HØ?C`KsFapí³, €     íA     @ÚaL€ÿÿÿX¤G€ÿÿÿ    €×aLØŸ¥$îÿÀ^º    ¸VŸLHÆ¡G     Ş÷¸ @´œq—Ó\º<ˆO „% €  íA  °¤G€ÿÿÿn; îîì‘ààà® à.î»¾nÃÅà¾éìî;k0VàNíä	zåĞîçîòğÏ àààŞ äãçîç¾ 6ãàéãìàîˆ}åp¾  ©©& @j2z0 À/ @.µ¥V­Gğ>íä€$0ª¤A @:€Ö.ôk ÔG¥ "% €†Û €ÂŠ1= (0 ÔG   è SH  `  z       €¨è¦«¶¼&ˆ€Ã       0¨øbâšŸZJš         ¨ğ¦:º:i?‰Ğ!1 0      ˆŒ§ÎÚò¦«&ˆ‚Ã     à 0j¼jÎjŠ"8    €€’ã©ó¶¼©*€Iâ   0    œ8HŒª«Úóš"  @À°àˆˆªk/n       À¬ì¦«¶¼&ˆ€‚Ã       0˜¸bâªŸZK›         ¨ì†‡¹=i/	 0       ° €Úóªk&ˆ‚Ã8%¥$îÿÀXLÁ    h‰?€ÿÿÿÈf@€¯—G      êwñ'ÎKU¢I­kZV°& €     íA     à!J€ÿÿÿ(Ñ¢G     ï!J`¹½6È,¥f    hÍLH¦íC     <ç… şË?†<!şË?†<!şË Õ@µ €  íA  €Ò¢GÈ,¥$îÿÀX   ¾LàL<È&·G  |f    {‚rşËA:† Äø? €  íA  Ğ!§<.§<ØÓ¢G  ğ-§<XRÁ    p¨Õ9@£@€ÿÿÿØ4’G      êwñ'ÎKÛJ­kj°& €     íA     àæ!J€ÿÿÿè!J0Õ¢G    ã!J°è!JXĞ¥	    ¨©/CXô‰FøÏL      è4ºn®eÕ;FĞk¸gğ³, €     íA      ‹ŠJ€ÿÿÿ ƒŠJˆÖ¢G    ÀŠJX   ğr/=@Ø2<°9’G      êwñ'ÎKt”¥K­kx!°& €     íA     pë!J€ÿÿÿà×¢G   è!JX    =@x¸L /‘G€ÿÿÿ  „À     êwñ'ÎK®>‡D­kÄÔ¯& €     íA     €ÿÿÿ8Ù¢G  `ë!Jø_¥µ@¹    Ğâ€L`3G     cj ºG;¢™Š~ìEğ(;É± €  íA  Ú¢G€ÿÿÿX_3    ĞC(lBœoG      €RßËŒXy·Â’¶kwYMN' €     íA      İJ€ÿÿÿ0İJèÛ¢G    İJx2¥$îÿÀdf     À`HÀ'·G     af C&’şËÜ£Íñ(ç?µ €  íA  @İ¢Gx2¥¸?¥8íE€ÿÿÿ¸(·G     tsNÍîÂ¬á?µ €  íA  ˜Ş¢G¸?¥X®¥	     ;ÄB€ÿÿÿ€MŞB\ÆL  Š¥	     €Š2z`K·§:EÃĞÑ³, €     íA      J€ÿÿÿP	Jğß¢G.:
àãŞî ààîÿ@àî®.:ààîîÎX î®îå.:
 èî©.>
 —wîî}î0 °ĞÎÑàpîîÎ Ï àĞĞğğÏÀ
 àÎŞX  „0 Àã@† 	ÔGøå8P „He-( ‚"t ğR  P 1 P`2_0 à@P@@5 T€ õQ  ®A    ãÌ    ø SN  e  ~  j¨jÎjŠ8    €€"#ªû®¾º9	  0    €   ¨¬êòš"  €À`àˆˆjnin       À¨èªë¶¼&ˆ€BÂ       0œ8iÎ˜ìš"
  À€€€ªò¤8­>m/Iâ   0      ˆˆ¦ÎÚóªk&ˆÃ    pà 0¢°jÎj†8    €€"#ªû¦¾¹9	        €   ê¯Úóš!
  €€° ˆˆjén      X¥	    èÙ™;€ÿÿÿˆ¼ñô€ÿ‡G€ÿÿÿ      –G+ÕK5³CĞk¸³, €     íA     05K€ÿÿÿÈğ£G     5KĞ5K(Ú˜¥$îÿÀTÈ†    @Û.Gì¬M     ÏÇ† >L1P#âÚãC€ Øñ² €  íA  (Ú˜¥$îÿÀXqÈ    ¨ü;€ÿÿÿØÔH  ßÇ    qÈ  ´-(ÎKAÅüw­kìÎo²& €     íA     @tM€ÿÿÿà{M     |MPÛ˜¥$îÿÀÖf    ğ-ÄL€ŸN€ÿÿÿ     DÂL@şËø~ğA”/Ä@ €  íA  Ğô£GPÛ˜¥$îÿÀX²½    àê¥?˜ihKh‚™G  ©½      İµ'ÎKd2{E¶®& €     íA     ĞÛ¡M€ÿÿÿ0Ü¡M€ÿÿÿ  0Ô¡MX   òô p™G       İµ¨Œb3­k/£Ã®& €     íA     @Ô¡M€ÿÿÿ`Ü¡M€ÿÿÿ   İ¡M€ÿÿÿğÜ¡M€ÿÿÿX   HÔ¬?Ø©iKxĞœG     àĞ2.ñ´®& €     íA      Ó¡M€ÿÿÿØø£G    àÜ¡M€ÿÿÿXƒ3    Àú8CĞ•)@^ƒG  &3     ,üVKª2ù“kÛ^N' €     íA     PRøE€ÿÿÿ0ú£G  `^øEXØ¥	    à¾ñô8èG  Š¥	     à;I)aK)ÌxF8>ö³, €     íA     ğÚaL€ÿÿÿˆû£G    5K€5Khú˜¥$îÿÀà÷¸     ûøLğqŸG     \W6g×ÍHñüƒ% €  íA  àü£G€ÿÿÿhú˜¥$îÿÀXç½    <?XòôˆÎœG  ©½    'ÎKwes3ªVÅ®& €     íA     €İ¡M€ÿÿÿpİ¡M€ÿÿÿ8ş£G€ÿÿÿ  `İ¡M€ÿÿÿPİ¡M€ÿÿÿøÔ˜¥=f    /ÂL09nG     "t8şË³“¢ì`õ@ €  íA  ÿ£G€ÿÿÿÎX ëîî( 	à ê>ààşêÏ0Ï ààn>[ à,î¹>k;°ìîn;k0åàÀì~.QàáŞXààçîÄ Ä ààà;Pùş    Š5 €< P "4€7Ğs9 ÖÖÔGÈ  Ş¥æ$ 8¯¥ö 3@n; $Pb= 1Ş >Pp­0 \Ğ3µP  ıÌ    à S>  X  x  €@ à €  ŸĞÓÌÂ®œ÷şñûT¹™îïx™¢éÜ¿˜ÿöÚï÷R<§Æ'±€?yC3ÿL:ƒ¿‡½÷ÿÎ¬‹%ŞëÒŸzšj»ıÏ'vOf÷xûÛ[]û¿ş©9Æs¬”õm÷âoW'Sëí+¿_×7ÿ6swãooÇÿRiÍ¸óv¿vCYç_Zë¿§wöÜZİ—ïí~ØuÄŞÌÛ+ï¹~ªÊ-oy7şİÿîÚW}ßÓñ·¯ßÿ}ôû7áßO¶ÿwáíoûş«zÉ÷ıº÷ş~sŸÛzBÕå§KÎ³óÿwãîx9.öÿÛÃÎ½Q—¿ü?xŸ/ûşoß_½xİ¯ç‡öí¶¿ï«îy¦~ß{×{Z×}¶ğ¿ïgşÛ•oÏñuş¯±ûîoÈ}?Ş;¿“Ç§÷ÖùN÷èisOOï ıñøzõŸÊh¯uÓk÷±ÿk?ûrgŞ{£—úúå[•½ã›]¾?¶ÿÑÑê¿Ÿ–ıOıÿÎ¾+³wHŸºÿês½¯±õê7ŞíôŒŠªgõ«Ÿï¿~æ¾rïÿßß9ÕßÿçŞŸüÆÇcğş×‡;qáûS;A×¶ç1kölë½SGù1|Ë÷oàòş{İÇ‹õ’”½lÛSG1·=Ş]½æ“IÈä¿Ûø¶ZãyöôS·°{[Æ‡[mqÛm%Ù÷.ºCìªİï–çïáû÷}ñwbÆ÷ŒêUõ/ñÿi½ûôş›º_œsëıúE£òşõ5ßßååøØõë~/Åÿó¯ù£ù-ã¯ßûg^ş½ÛöıŞ¯¿ŸßıİlX×ıßª©›ÿ–Õ~¿ ¼ßl²Ó>ÏæŸşÇíı¿?‹Wğš÷Ï7ıßçêş®;È¿Öüu§Ì^^#«Õş=ì½w+òûşoÊçi¥×ûålw})èq»İÇ1Û§¶îİV3ºú{ÂsßÔm?m>7:Øyİ¾p1¥_)ŸiQ¦Ï{âËNQ2ÿ àUï²Ií?»òƒÿĞ¾Y÷Å÷b/¯šğıQbùÓoUñáÊ§­~2·ÿ~ñZ™;tçqİèÎIÏ.AÍÕÓ÷î¾™½­èç;¼Ö»Ëÿõÿ^jŸ9<ñşóuÙ˜µÑ£ãOös_í¾ÊƒvyÖWî¶“¤ª÷’>:ÍÊğósãMá•Z÷şÔêl]Ş^Xº¶ü›—ŞYÿ£ió¶“úÚ¬Z³¶[©ç¶ıøKû£¾Ûå¬Àè¯úïş?šÿó¿Mõİ{ò)öİş¥ß9oŞk›ı)×â÷6Ÿ/íûÇS^Ÿ¿ëëÅ½¿/¶;ÿgßş¾Şïÿ-‡¿şœì¾æÅ¿pôÿ„ı~õÿş<Ïş§=·£ë3.éş¿÷µsí÷óÉÿÿ¾ÍÔ¶Şßõ¼çßı—¦÷3üó—ŸÅ¸kÍ?i÷~Æø÷ç}ºÛe½ñ|¢Œî—Oİ÷^ã»ùGé¸Í«¯Š-òı@‹ºç×4Ã«ÂC9şñşÙ²ÿš^ãúA7¯í-ş¿ÿÆçñ.ÛüZÇİ¿»Ïİ•×ÿßçsëùßm‰_Õ{7Ò}yŸr³;şÆ_ìUëâo(¯.Z÷òx
Úºõ/ç~gÿ0ÂÎ}#Ån›ÜırWıõšòí½ñŸ?é÷=÷ıó_úveıõ»`Ëöş¶zïı}ÎÂnş:ïoŞqß=×]üş×wşïr¸ªó½¯¹sÿ7ÃSııùşµCv{G÷?kÙµ‘¯ı÷.eúßé	q-Ÿé¯Z>÷õwšw­ø?||÷G®_¾=Éßã›óºşå;›·[?îîİ‘®oÏ+ù\ÿ+Mm¥Õì_ÛõºŸ²Óş½^ıº6öïëÿıü5ÿíÿ‹ÿ•_{Wıü¹>%×Âê—g'yÑoÿ¾_¿ÕğÖöğşkı|à5|Ş™mC¾íüŞ_²h?êã>I÷õnEêÙF÷ò½M­óŸÃ¾ßVÿÓÕq¶èu÷~µëú1ò|~÷Ê¿İ’óÿ{>ü±Ò\fŞïÿôßzìw’×rSI~7SË½>M'‹î½Kz—Ä¿2yöÏšıåêoVåõã]¾òÏGÿ·hQª©‡Ú{F9»:÷şÎõ{úŞ²îW÷wÙ¾ôáÿz^NÍ•ü¨äÑšq;ümıíÿ½ÿş­k}F”ÿü,j'öç_ÿ³Ñ3¯àûRR¼–øgâùßë·×õ?ûsï¶ºöì÷ŸIÿü½ÿûOÛâ°¾ÿ‘še¸Ù¿ĞÆôw÷ö~½«úß÷fºÎ_şCÖ¿—gŞG“°“Ûï¸ûÇ=ŞŞ>-Ûëû1hÿR÷_yÔ¹öÌ—·½
væÛe¥]é´çïşüõÔ—ú/Q¾¼ñı”ñ¬\üe¸{ßó_¬Nİú‡šNß¾”İ’Â¯\#şE"w÷wœ_ò#÷_ñô³¢6±œÿï#0Û—óá_ù5ÿëu‹Ç¿Ïîm'w~Éï£*îü¾Iİé•o¯ùİÉıRkÖìe+ßißu¶~º6ÿó9ÿ÷gÏïÄª'şø–oş›ñv­k_Œï<sWa;ñ};ÿÿÏÃy0{Ë]AöçYÛXÃ÷>º/ü2	 ¿–=»ãGÖ^Æ|feİÍvuêoÕyzşÕ-Á­ış¼ëÿ]O›·„ÿEy«û›×ÑöúÖmÆ–jáÛØ(ïç/k÷ÿEãÿ·]yÏÇü‹ùMì¦k­½öşşç_÷t¯õ™÷÷RÿÛşÇ;)»êËË¬Ğ~«¶óÿ1ıêÜ¯vÅó·%¾öûcÿU×¦ÿVÚeÿîç=½—¶ş>ı/³WKïÇ{?e0'Ï5o?o*“Ãş¿Ê„O'ç1ÿfï{—ß?÷·ãÛîûÛ7ïà­8Ê¹ù{üƒıÿÂãWŸÇİ*ŒíOÖ_mÍÿŠ_¿ıø>»ãô¾îWÒ×÷õ¥ÿçéfkşÿı®İÏ~–;şÜãÓ__:ó‹¿nåÏm=Ñ.Õ÷€è®Í~Ï¿ı¿İjîôòÕµêÛ»·í«ıo>üâı'‰û7ÿ»î‹ööÿ‡ªßuşm9zŸ[‘/ş]åÉïşè×ïûlæà{şr5ã%ÃÿÑÿßÒ±şö~_Û¾³‹Ê~[Îë½?ëó™KW¿qÿ§çì·_FÏV·ÚÏÿ>ˆ|c‡Çí¾ûúã+ıõ¿<¿×ó}ÿöÿó»Ş¨¿?kšz]‹Û¹ÿÕúOöş¾šz÷QÏ}éñ}¯¯ÿıwı~}°wçşn¯Ñ¸ğ³Ç·}÷ÿÿ_ù.ò{ó+ÛZ}•[Áîÿï>ízÿè4–Å}úÉÏÿ‹ş?ÿKÿ{È¼³»§şÏúçÿÏ`;÷Æ/óúVµØ-›U._§İ[¶Vìß±¿ÖÙÛfÇkëyN¿ê#şw’ŞóÍTd÷ûvçîÇÃs¬•_Ïò.ß)qÿÍÃ…æóßT–Ù±?‡áÃ×¿ÿ¶_w«aöÔÑnUo=?şÅıbçm=~M ô—ôm×«q´öüşDjåo±ßîöç…ØîwêÜßÿ^ó¼q=ïßzâÏûñÿùıüÿsÛf»÷¼¯Ûüúï_/úü¯êşv÷âêG}ßO’ßëŠTo”ëéş‹öæîÿYç»¿Ë{æk~ôÙòŸí]óßUıxşù·½î«OùœœûöÊ÷®Í¯o‚ínƒı¾o?·{}êŸõWQ¯=UÒaï^çsó±Cüö{¿{jöw÷s÷ïy¬'åjëIí~îM_+§RŸûUî¹ûfbN”ÿæW±Ì¿­úëïî9r?µËİOx©ğ_<şÒïï?WWi–Y"~l:Ò_Î[õ·PïïisŞ}¿ëo¿8¾½|–Oeş_şÖ{mù9×©/[`-ú¯Ÿ+oìŸ7ï=9Wòšºü––ZJ¿ß·ßò¶`?})¿¿/çóËï«^EóO0ƒç¸_Nö_íOcï;ı~õw»VAÑÿ'o–ßõÍÖğvFÀq—;Aÿ·¦9÷~÷­÷/|jßï¿Ü‹gpg—ıûËÇ«ÑÍ±¿İ.î½Wÿ3å|ùê·ÿUí¿öîûuí‡ôvß¼ãiKş{ï×ïÖş5{Ë}.Õí¿Ÿ]Ûíı½·ôÆÚùÿÛÿï÷£Ìvæı³Û?§ÓõúÿfÿxG¿ßıï_?öÍı.ûğòÍ_ÿxÿ9¶×gøÒ¿œ7ıåó½×¥¯¿§ı=ÿs›×c—ïçï½Sã7oºßrò—hMóÜ±¹¼%ãu¾ß=GüWÇW-şz²cÇë¾H/f—%.nÌÏö—O¸Î­_Î}%#ş=ş-'ÿÏ–ºßÿšŒò¾î×Ù”S×Vîç•Êú:8s¿Çó‡ó9?îú_?úòØw_ºÿöëü«ãB¬ÿyû¿ñ{ÿkw½÷şş®çû«kÇÎ~½ù%îö‰¹Å]{õ÷øÇğ×»-w»Ô‘Ï»ûÛ}¿öÙY¿İV»úè:§¾OfşÓK_i¦Ìóçêgòı­çÌş;û—½†v}³>|×/ß/û8Kö}?İÛn%’ÿÛ×Ôÿèí»èz§ïÉÇ†îúÿßo¹Uÿ§^ÖaoÛ¾œö
¿}Iœş;ÃİÖÿ›ÿúïZLáç­çİşö¶çø÷zı†+»;úÛñf>ÅdKen–ÏO»üßêë÷eşu×¹ıÚßöèûÖ]&)ïö?Áó¾Îöÿ÷[÷÷¯Önó%ßşùßnÌª5¶s^~€+Qæ<Få‡&ôzÿ3»Wo‹_E}lßşqu÷ÿÚ3P/ùş¬_Z¤æñ·}Šù»-¿ÏŞ!{Ïöçÿ_‡´—z`Ë3˜ÔıÖÊ;–Ø&ùÇÿ[Ü?½ÿÿW÷WrÒÿÇ¡0†ii×sçÿ°ÅÓP÷ÏW·¯úòÏnşå:mïÓÅîæ¸úüf~yŸßøÕ>ú¹ûÿÏøçv>_ß»9½¿ó/÷“ko/Ÿ§|×ãÖ«î©œÿE·üâŸ¶{şö_“o/s_‡Ùûâån*éh¿IqÄ{Ò¹»ÿ×-ğîßŒ­·ÆÇÙ¹Ş[ÓñËÍ›öOÕåûœŞşëşU%•^ÕïÈzá8{ã¬¶X­]p¹³k5ŞÙ¿a•Ñå¿<C?·F­æéû•áúNÕó,ïöWnÓ…Âò~;“ËÏÿöíSùÚºÏ_x•ƒoWµû8W†Í¹»OÍ{uYmÓ/kÚ‡Ö
Õ*¹İ^5"{Íğ¿?õ©ïÎµÍß±jLŸ«õànîŸùÍ/5[€S6Åûæ?¯Ñz~û“ûîiÃõ6ıÑñB'³rø)¼×5çò¿/Ñ¿Û§—éşú¥_³}£¾oºıššå_;»ö³rƒzÙñú®èK{•·±ßÙÛõãŞ]/õ?uµşşµÊÑ#‚üıy½û5›÷‡¿_ÊO+îS®ôã¯ múü^Nğ¥ªùé¯¿÷¥M¾ú6óÕ¬ùÍO]qOïåı#|÷¿Ğ\ÿm»çØÅ”-í®¨ûı¯ş_ïV¦W='wÿïÛÿ³ı›÷©mÇíÖ=ş×ÿ¿İôå÷=Ç½¹×ıøßµñ»:ı¿ÿô_s‹ßù€{îı;ßËÜtºµÖÿŒoñõ+í¯?Ÿûú½¼ëÿÛïõıÙïÇæÅ~³©·åëãHÛ?}ıw~ŞóıÙ¿uİå×îíà¿¯WõÛ«_ù›öµwë‰—Ï7üêN]ÿ$Hm}­İï5Ú¿+¡ò7æÿ"»·Œú¾ß×?yæÈôÅÿ7É±ôğ¿£şÿüOkærkgÏ?·+»÷X/YûÜòœ==öãcí©òÛ³šàß{ä—|Kÿ¶`›jéÙÏõ#ı•Ğ×úÆ^ğòß|ëÿÊ±¢iïÏ÷ûœ1ÿÎówËÔ[ó¿ôş–Í5û3w¿ãò€Tf[ŞÑó¾ë®ğ6@õ¿tÜ»¢åI»ï½ÊèÚÆÉö~ùÏ…ÿ0ß%ÇûsV]‹%úÿÜvgÆ¹JôL×%ß×vÿşè—µ{ªù5¤ç¥»ß¼·ÿ»»³²İÀeşó›wœo’¶œ]ó[ÅÙ•×FÆ×ınù¾ÿàúr:ºÍ¬Vú}Ğ_^×ı2®3ÊÑuİ/³~²Tpÿÿş+ıšÜÏ®Ÿy¶óv©´÷Í×ÿı­Onó¼›ßî}}÷ÿîFûkùk¾ºlÿ››yşäúü]ö½¾n7~[¯|–‡½{öß-ú¾ŞßŞ³ÿù8û§½Sû­3ßÿÿ ú+Küñ?ú®¥Ó×[·6ûÿßŞÿí[üy²ÕIºæûó&}·á}³Gzõ±&v]İéæG¿!}µ_Şßu2,aíÏò9ü¶Úê¯»÷È*l-¿»Şõï?kØ:^f|¯m—ó›#ûÇví)ÿ•×”ŸOòß÷²RzF·¿»W\\ğ§ÿæşö­äAsÿĞ÷øk‘Í)öÛºäÁÌº×®oçÑLßªz¿›ÏuO¹ø¨¦ë
çÎ÷g–ºy˜æ{îg¿›ıçû'¾í½w[‰ùvÕß’ûÖ¶ü8Üg¯Û,¿oïıáŸ«ã=åîçyö¿ÿóuçï?Û½¯½Şm)iÒ¯'Íåù>oeÇ÷óvï×¯ä?f{×ñ_wÿ|O|cûíéYÍ—uÿ%÷¿/µ}£õ±[»şçÜÃıº×Çö®}>Şëù»èf´ÛÙ=µ©Ü×ñÂlñYüŸş·¶¿ÓÌM? í½½+óİıú­s¯Ÿ¿{?çö
[\?£îÕÿöoªººŞ÷'ÃÔ
Öêú>e}¿ş·ªš_>ç¶ÕßŸòŠßºÖËêß"cW_îw»+şgpŞÍ§‘ÿŞxşŒQ»ô®ËYáùàßóOlOö—êw¶¯
MWn>àû²Nò6«qf¤(ÿ-xùı¶şy¿ıGó'm·Û>ºá³ïö<µøã_j¥ûaêö„î_ÿd”Œó3ç{×_éW`ÇõÛ“—Šÿ••ªóÏülv¾ß´?K¶ùûîîÿo®Wÿg»ïÏ)˜Õ}óÓ·¨·ışœ+àßßœÁ?ÿ gÿ6ûKıù¾¶÷¶ú™ÈßèpeUv½ºÑ—›ç’şOcëÃ«Íæßÿ_ÓÖôîß§³uÃÎûxxôí|ıš¬rÛŞùÉJÜ{Kû^[XÛŒŞgy¬pGçÙ£fñU;÷vœÉyjê×3[u¶×Ãº·Ä{•ùª|ÿfü^òÿ-ï›–‚ÏşÙ`ÿÓ§mW?n‘ùi¬Õo[Òç³şFvf­=×ùşŞÇórİõÏy,vfÑíĞ Ï¹cúÏz¾ÇG,¿ã¯»+§ıçvşp¸œóMÍ[|âmõİ÷à#N' 28°:´şÎb5{ÏMMßÃùõûöã ®‰Ïn¸&•|ï¶Ç¯‡6µr4WÂ¿eè6¹Ë¥ßqŞ4õ<fu…Ïo>ÎÍŞş<z½pÑÿõ]AÖ ÃÄâßÍûûØ‘4äŸÎÊ·º4L/ïåO®F{›ú÷eŞi×jÇ×ÕíÿèÇÃZõÛw?ü|ÿgúwã}›#ÏW¯U?}—ÿ—u¿·û»[³êÊs´¿ô~ù®ü^ÓÎ•ÒÿŸ_{?[·Û×ı0oYïmï¬}Ï,òêµó+üz[©ïÿ«í;òs÷ÚıÈx\_ûúw°¿¯öüîj¥÷}¼fı¯krşòßÿõW-kØùİ&÷dëÔÃïÿ5¶˜¿toZÿOÓ|xSrxz?²õËÚºåÍ¸?{bEş÷<ÛÓ÷Ø:á¯uœu«÷¯¹)pëâ¥XU³½löÜÇëòq,´ww=ödÏq:ÜwºÕ|¾ïëKqÎÿ…Õ7S÷}¥OMfÚ[o~ÛQ—éyy¡ÚJßUL‡wè_·4Ÿá÷ogüŸµ—ùŞ£ÿwe­^÷?»7ÚùY_^?m¿µ?~»4ë¸º»òàM¿Oë¼İ4¹vî§ÿ×ºÿŸYwŸüÿÏá^g”ü«Çùÿ½ôË,—§­ö
_¿´¾¥O¼ş‹åîşü6İ±KŞ>g›ş­Ñ’?ÿVv–¶ÇÇ|×ò½û^pK?¹oöûåó„:ï}}{}ı}­ú¾ò>½eşßÕ•ïk|‹ı÷Ïãóş–Ñ-ù}ıkşÇÛİñÕî/û¿²×ë—ûíÛ™$ûıUçëŞ“¼íyÿÔÿZv›}¤¯ô6ÿø¹ıu}‡×½óı…Û¿¿¶ñZÿl ÷“íÜgø¿ÒõæÖ?|¹×}ÊEâ¬½Í¶z\fî˜.ÍÓ6ğãsó™ëÎ›Ûr÷=ëIÿşvèî[NÓ/WıósÖ]ç>9&ûşó£–Éşoüp‘Wù$Û1?¹õÃCÆñ÷?G±U´¤ú®ù½r‡Bïü/}Ú^…·Û%œw^ÿßíÿòß=1ñŒÿ¯¿&ü;öşÍı£Ë·ÿöç÷Wk{]å¿··ò/|zM{»ã;Ã.óåÏ×/¹ÏûõÙëş~Õ÷öóû¡–}¯£kÇ£ŞïëõwÒûıaÿÕ³|¯–÷Ëú»‡¿u÷ıÏí<V¶ùŞßÛ·ïKåşûö¶ğz§ßÿ?ó—>¶Şûvó÷¯~Ï·JÚEo6V½ã}ŸOëÅr_9AøÆFµ£œÊ‰ãXrLIJ^<_ÿõ=Ê,XÜ©ÔWŸÚh}=sŒôß(íÛq¹¶p›şæp7àOŞáv½^®öñ$;!I}Ö»]ó^÷ŠøöuüÜĞÿ*ñÓèË }gu÷õÿŸëóŸ“º~Ÿ¯ÈwÁÿHrù)ÿ`—ÙùùõqÁr¿Ô<Ì2è×ŸÑ_ƒñ ÷ŞŞŸºÌÚ'¼A¿Çnü”]·ÃğÊ“¼ÔÚù›zm¯ãùŸ34ü4îeß—´ŸÃşÕôÇö/z·ø›ït×˜E“?UÃãf”Gßı£qW;“á|üŠ×£?çÎ_»×êş_/¬ö¤Më[ßşªkıÏŞıÕî¿/ï¯ïşÚı×ÿùëîÛŞû–Ï×s/ôıyûyûßO»Ã÷k¹ÛŸK£Ş½¯ËäîÙ³-9ÉÓ_ßŞ¯¿^V¿Ù¿êß¾™œo×nûx¬íÿÿ“¨~äÒÎsŞÿºãêæû\ït¯~xïL¾ôßxÿæÿÜ3±ñl–êáşø7õñ]/Ï‘á×y9î[æ×ûóv9rÛß´û×}…U|ÇËÓ=˜Oëtv2xŸvÓ¶ÿ®Ì?_ı]Ù³pŞ÷¤|Gâ¯â·ëÆ÷Ÿ±ßË÷~^ÓÓ?.×ıß¶ñŸşÙïíÛüáq„HÒşen×ï÷—?_º¿¾|Qc«{8ª~l²Vògÿ×szë»«xµÑl×ÿü¿wo›–İÏ§?~›ö¸z}£Ö=¯—?JË›ş|ÍÛ}êı–nÿ^×-ş·½	vÿÖËë¿ÿÏµï&ÿŸîõÅÇ¹îêçótmÛ_é¯ó½Ã¿á;»÷8>êşı3şÂçÜnöK:ûŸÿûü³¯u7ÿ˜ÿŒíú,æ®Ú·Şî»Õ?íüÓæ`ıöŞıÙ"êzq-Ò¦ÛC‚;·ş~MÛûıÿsà§óúÿZ÷ÿù}»ñO]•Ítä{şâ¿ïùÓİãÆËgOû±¾wî×’të±ÛfoÿŸ_Ñå^ÁN™ûÕ”GÿÄå÷ë·ié^|{÷Ï÷õ­òô{Õ._Õêß¯ÖÖ;ë“cpÇNv;y+lß nßEu·åê÷Yqmç÷ı1{xú…úûJí±júÑíÜÌé¿oÖD—G÷½Îã(‚û}É«ö{Ê¸ù’åÿ?İ=×ÂÿşËúWÿ«¯VUºóÂtyÍÎ¼ÿÍëÙ±kJïÿñ¡Ş¯ëİæ±^ëş>ügSèøkU}ï’¾tÿZçğşçìÿ:9ûÑğß½7¾üÉ¿[ÇÏägswÖÑÿù÷öív8×CvõWş™ßã:ƒi!‰ôºª…¶¥÷ŸñÆïº8ÛİZvñ¸/ÿ^Ê ‹»Õ?Óì=oúi–/¿™/P›e:NR\—ÛÛl^uÏ®½çFõRı°\‘Æğ•˜¶%-tçªì+ÏÏôëñ®.wñëıÂó·‡ûPŸvŞ4×CuÊĞ»RtåvMôS¼µÃ|½¿z»ÿÊZ¶7Um?¸¤wñ7W«ùÙè.ïÕú‡ì>Í,1-£ ÿRQæ•Ïƒşùç²o¯ü}gfÔxvàùö~øWç«N^÷İ®jıûÏç£«{ÈÿIfy¯};ßŸz¯¸>}É”ÿ®Ş½Æùyï_mşE’;ÃÃêS|û¯ºîú®‹··‹ïï´Ëö9->şEïyi†?åOó-YùşøúäÓñ›÷±ÿ[ó¿eü¶§ûS­õövHùşb¿÷Ï]ıù¼o´¼õ›ñçwO
ÿã*{OU÷úÿ;rSÆıöaşöïS[Úi›ÿşÚó•şx¿/èşµ~Şù‘"»åß·ûÕ—|ëïÛ’ßìw¢‘¯ZÙºÛ±Şû¸\üøã÷=Xé÷“[¿ëç;âÿ7õöå v•º_}îLíÍ5ÿ·­·jın£uÍû]iÅqü_ë¹·ÿî‹zß·3ù·n±«M+åO˜~?ö_¹Ãÿï2ÿÈõ~fÛ#ñ9¼{^Ö¯¶[ñ6Kâ?¿›œ¿7{õWë|^q6³æÿÍKFš_¾mœÍUÈ,RzeùÏß1ïíSõööçÒËô×ıøfõlO©Xû{*¨î]@Óşé÷—ÿ~ÿ}ı/Éóš§®íô÷òyÓß^Ò{]ÿ®¾óÓÕ¹÷Ûúö/¶ìƒñšâS»Š[Çœóg»½=¿n°ŸÂüêËóme]Qÿ×éğ²İûûÿ*_ø\ùÿM¯ş}Õı}íïÿ¹ÜÛ^¾‹9÷‡±ınïùû§Ûüÿ;©İúíü¯v}ÿWz{¯ßÄ£“p¿(ù1‡Xş÷mK¹ïíÍÿ¦µ'ÓSVç iôó=?¿ô­}ÿÓû;mšßÙô]Û¡¹½ò¿ïíÿër…¿ò{÷t¯õ_Ü¬¶öÏÈöÑş§ğßå½q_‡ıoMÌ¿oİ5÷nZ'­Oûªı÷Ü?ı#|rÇ¾ÖëÿE‹÷†ïq>»íh-yMÉÈÊËÏíéŞÒ^¶ı4|Ü`Î½qŞæÏ÷a?_Ó«À;÷Œ~†îµcŸĞgÖ?ì”Zâfğ¤b÷R—]Şpõ½Ëÿ¼ïöï×ôû¦û{R§{ßıçÿ={ûåßûuûšk—vÿ>¹tó¹ë±ı-SÏ}¸cªŸ=·ıÿÿß¯»¹÷¾ÿ/Oğê¿1ŸÁ_¿³Í£áŸÁïçïıoºêm§‹¿{ŸŞõ~I¿~¿Òÿº¹ÿÖ÷>—~Úÿ7ïûüÿÏj_üW$’“…€H®J\Pà(¤IIÒbŸTe¸c½}` h&Ê @XcF Àƒ ÂU,V)ˆ	æ$s—õEQDBÔS)ìëH˜
X—QKÀièˆÕ…@F$
DƒTÏØo`~˜ƒ´È€‘
7R¢0ŸFaP ²´†Rvº(¾·V_Pœ„†“ğTš€€—RˆRDÁ…¿Â @ Â0ğe J‚åøGˆX†‹ŠµT.CDÓà…y$ Î¦Q+ T!ÿqR½to—	Á€%&IEZˆ€0$«M"£Ñ”F@d1zÊÄÇKôMÂ,@ËdkÏŸ-Æÿöoq&™û¿…wuVì{‘md³Vı_õ÷ÿéŞí¿ÔıÚ—§l+ï×uÿß¶’}|Ïöo}õºõı-İïofEú{ÏÙ2ó…ÿ]–ïŸgø¿ÆÓõ§Ÿİ¿ßÿÿ¡[şö¿ş«§˜şüßÿÿ¦{RÛÇOø¶ëÕUıû[vã¼Îlœ b-ñ `R /4,‘dŒÄGñ1B2¤QÅ¸Ñ‹@-ò 
Òm$Hlˆğñ’¼‰if66@Ä™ÁYIl‰bRAãè±ËÄP³zA>¡Ï2Ã1ˆ¡oîà%o`Wø¨ÍƒH	EÛ?Âk÷¬\{¶·şF€²©]Ûş÷!}WkÚúöúYk®ü²„äßÿø;xÿ+»ü®÷ıŸu;._áÛ²ßL­iwıÓºsŞÌëğ†¬;z‡¸ñuÿ}O?"ıûg¶Û”¸æ}ÿ?^b…øûßO[ùÜ>_>ôyûşÅ?Oöş·ıİÅŠŸõtşş'ëß2nwŸó~Û“ÿ•cıÚÛõÿİÕîûFóß¶¯şeO{İßî×ÓwüßÏĞ£½—ış@×è¯+²¸¯üàŞâ?6÷ÿ·ë«Å{ş¶ÿ¾çÛî»{‡¯?éÍ¼ïóŞuÒ¿¤{ş]ûŸËÿ¿s‡ìßß-ÿVèŞ¼U_¶·×Aiâ@b'àDè¯ ÃÒ;„8åâH†ªü%…'znˆ)û LVHÀd m»@/@­ró$
"’0„è‰"l)œ‚	zJpŒ @€(ˆµ‚ô!²ù]¤ˆL„¡Ä$G…Ì?€2ÀQºòb,¤!¥S/ºß\¶·[¿ÏJçfııû¤¼íQûÇ<U½Ûz©÷FkùUööMş¬¶»ëŸŞMxl¾ÎÕ^|wïú×Ö¡hüÕ·ß!®+ñçûÿ+;ÛÏ?ÍÿVÿş¿ä·ît\?vùÿ›İëãe+]üßqïÿÆ·Wâu»mËéñ^ù÷mşÛ"\šÙF´j’D€€S A¶¦ÇED•+  ÂhB0 Ê„Éá¨Ê
O( „°4JÑ½’€xÔÖ ä’ƒ7
–e>ÃÆ{UÁ(<2'Œ Å¦Ñ)Š29 )Q1/üX,€îš ¬±É PĞ€4 r<‹t	(a0¢Sf„J²FQ/°‚`T‘2á4ÒqiBS[A| f4P° Ø¡¡_W³Éª–ÅrÀE'úÆîB	`‹›2Xš%¶.å Á À>|\¨à°Ac`—h´q5¼•R•W%ößïvêEn·‡¸vùœÒ“,™%ãì/tVY>?êQ½m÷ë€Ú®µ×U7Ö¿d®÷º}ÿúÏé:ÖŸÿfçM»òş0ÿşÿ†wûŸëyïş—Ÿ~Wëâ7ıãoOÿkKÿæ>şgß–­şªÇ÷ıÿvØ÷¼nšô§İ·WoÃëûó¤gÿuÆôï'àşQv  B6Â!M@i>¯c‹Ù°’‘6†VJHVşâÈKÜÕê"u'¦ß	ğq2.’+)$‘{•@)LAÛnWS<DñBAV "»b–	 ÌD„úÚ(I¸NÒ¸0ÉÔşşÂ€à$¬Q—ph€óÜßŸçyêGéç>îõÏ;æû9}û§ZÿÏ»jÉû­ël—ß¶™Ûœ]Æv Öúx3~ùÖû­ß«óŞÿö—ş¿æ37ùîû×şùºoõüÏåáß‡İ'¹Îó˜i×ÿ¿ş¿ÿ»›¬?¿³ı¥ü¦Ä¯ÀLï½¹S6ÏÖ[î÷ôïß¶ø¶ó}õô~ÿ¼x_§™W§ş»ù¼·©~^ø/_xÔŞ=½İõñï{¿›†Ë[—è£7o¬.şv‹o_¯1¤¼ßé{ÛŞÏ¥Şöxå^ëı§úÿş$ÿÒ£Ÿİ¾?vwıµ}¯Oÿñ³¼ÁúôÛ5ÔÒùJ²Ùï~ëÛ£ô*]$À,b±!Bàî2 ˆ8„ p$È(µ0Ú@@ ™!pëK2šÆnÈf@{%!;³²é=QbTn¢tÒBÏV˜›‚z 4 )‚-&Aš… 1‹„„—jÃ	BbÏ‚± a?ÃŒ]d	-!iS¿â®¿[;né|·ıËÿºÛÿ÷ÿûñ»÷oİ·íû¿0
+öÓ÷oûw•Ë›¥zíß«­­ßuç­ëÏÿ£ç[óå÷ÇûšıÜI&g‘ÛÿÊ]§ÕÖmû»å¿’ÿûkßóïp¹ıûİèûêu=Œ­¶`¯^^zÂyøÿâYdûÍõu @"@Ññ¬„°R‚6‚ã¢KÄ$å°SèF#A2/5C$cP'(¸D	¦º¿”M…R Bs ’SAN)¸|à×©€%ÀR»Ğ!0ó(4ûXL1,÷V2T¨FS­àaÊ˜Ä}ÊœIch{3]Œµ‹SFB2vÆYR”†¢Pl’JiH.(
¦Œ•2ÍC3`‘E@dË¤±D'ÈŠ¡0cD	DI6 ¦QHŠd.À¬@OiaÃ­
Ğ{@&W/ÉaÈD,"( ´àU¸€  }ÿÏŒsï×ÎŠê_gåïíµ·ÿ,öÈ]=uúÿOiößÑµûQËYu>âÌ·÷ÿ
ømÒ{Øãí{øªBOÚ¼Ãıéïú¹·Ş¨ÉûzõÈ»;Ôëæ"N²R+íû¼ğÃ¿­n÷7õO™Ûw|çŞtÊMÿßçi÷}Ë“{şÏ4Àâ ¤z‚X
R”€„I ³ÇÈY ´pP© D‘ãÄ³èÈ:¶	²âu C'ÂÔ˜¥#T„b2´xÆ-	€˜G” R òpCA†B¼•	1Á£L­…Š¸N2!G)¨Œ`—ÔµªP½ym×^nüİËîåş»óışÌ[ß[S^÷ç¥ıÿK¿»Ñß>Ÿ3ßëªü7ÏÏŸì¸ızã¿şü&ÖıwÃÛÎîAçÖ›ëûı›ù~ªún¿4«ÿ3Ü¹¬ÿ<¿"Êuêk³æ:¶|Û—oÆÿô½o“üyğ¾ùÕ»¬oö|ÓşOUş³¾?òù¿~v¿ï}çıfíŸùÃ}ó
fsÿ~Ôßÿnßyöwïÿ5Óísi¿Cİ¿ïí¿_ö×³×ê£¾nsËº_W¹»ùòêÏöºoó4µïİ­»Û­!å÷¾»ÊŸ´øÛÛ[S½Ô]üß:ÃêŸßñŸóªÓÎ¾Ÿ_»:ıó`~Ÿùï5ãD2TÆíİûDD£´$ ²X¬ ŠŸ ğÁŸH0“6 ²Cbd`fP$ÀÙáQÚ±U,Cé.ÈF P"/ä0¿k4$=àLR¤I9ôGD$xpğ (·~‡‘Ğ ‘3€²À\RÔ1;€x4hZ•ãïì¯{ãë9{µ?÷q	û~ÿøï±sÆRêÇ=õwÿûûşì«/½··ßµğÛùïğ˜ßï5}Îã7í6Nÿúnò¥êşK{ÎùçCçì÷ÇõMsMŸ¬õ3:ıÜİ/ï†êø7mø¯ş#oï}Ïÿ·Å»¿jÏÏÿõîÿ½ßê~¦¨k‰0x¶ÒQsvš.À(Š@4|Eô“¥I# ' 6 £"%H 0E"‰0=ÒGƒ 5ßyšŸ@€&3€¡D¬[ p"]°`‚µ€S
r$RèÏuBBá![$C8k@	…ÂÚ…¥²† b;R=A…°Ğp e†"9Â49ï?
à ¢†/fDˆ!f>ÂS˜AašÆB´Ón¾
6ÖD ¨-UÂ6À$f$è¸`@e†Š	@ÚRF @D¤€„³	=	Ğ *dF… pÈRe„CS0(fT¨B¤ÙÏ-Km}µÿo¿_‹öøŞ]¤÷’½çnÅZ¿ºÙ¢‹ú“c¦­ûÇèÜ®şn/æ¢»|ßßEÅ/×í[cû¯ÿ¹çşÒ®¾ÏÏûŞùûûÑÓŸnşùòh˜ú¯¸¥ã…«óu†ş××êìûÓË¾şæÿÿÿşı8PßÖïOö[?GnwûUtHBÂ02!B8¡JÌLãPÃY–R	xÉ|Š©{ „Hö/¦!€18 é¡( ğ`E•¬X°„%)4P	@c¬E'íÍSJ‡AÈÀ7(d‚Ğ &¡@ÎeåápQµÕÒ nöö_Ÿë›O
ı
ßŸÿúîÿ-ü_{tÎÉ½ü¿µÿãù:õ_OèwŒ®;İûÊşzxo¼Wuçæ}`ÿ8/ì&Í¹ÏúŞwú[üêç±ş]ßí{]qäRöo*ó½Ëø»tL÷·?Ÿİçÿè~Ê¾j…ÿÜõÛ)ÿìßvŠV5ıı^ĞRŞø|c®Õ;ÔîéÆG·–‹•í¹¿eÿßeÆQÿÑgÄ/*½ô~söj,ëßŸ‘úó»ÍûÏçÿŸïGNïFÿo=õt§oÿë?ıóóüúÿ_]‰ûšçiÿßÿµußÿıôÆqùîù{îMy€şÏMéı?÷ú½Ø×Î£»{¯uÿú`7¼ribE;$(N(ÈI
ò@oåBz0ÛŒÊvg®Š¬^<ÀJ¤ _ÉÉ0Š'Ô-¡Á^,FCÛ;ŠAb&ˆ‹Ş3V‹@Âƒb¶$ğGd4‚¨h@Rè§Cu¯‰¤‡P)è©hYW ô `7 CÈ
T™>Fs_visible = true;
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
						// Ğ¿Ñ€ĞµĞ¼Ğ°Ñ…Ğ½Ğ°Ñ‚Ğ¾ Ğ·Ğ°Ñ€Ğ°Ğ´Ğ¸ delegate mouseleave Ğ¿Ğ¾-Ğ´Ğ¾Ğ»Ñƒ
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
				// Ñ‚ĞµÑÑ‚Ğ¾Ğ²Ğ¾ - Ğ´Ğ°Ğ»Ğ¸ Ğ½Ğµ Ğ½Ğ°Ñ‚Ğ¾Ğ²Ğ°Ñ€Ğ²Ğ°?
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
										data.event.ori¤xÿ~ç:,oöXÏş÷)¶/s¹g5Çh~f]–¹óª¥â3wûjŸyü›ãoÁtNs×?GûÎNî_UË…Áşos“à¬%¿Ç‹Ø·#8şŸqe¯7e½-û×¤íwG¤Ï‰Æ›|uÙ†úòGıÿúÿø•…ğmÖ/³¹¼Czøêçûï§¬g<¦·õ­•øÅwïİÍ»ô/ÒöKOÿŠÏ?æöï™¾ªÕRèÙyßÌ¸ı‘^¯—Òşÿºº³\ÛıÏõÙùéæ{ÏÕõ&‰QY&¸óNíıîLÏ'x=¼çé‡ã<«İo«õ/ß^)ï¾õ{Vê9ÁÖÿÍ<óZÇ~oß‹8{nDöy¾ªÿıßìü¿çÿçWÒ>÷Ì¿zçüûãÿ÷)¶óò«Æôİö»«õ3İ¦¶
—=ûÚÆ?7|ïÿÿÚÿËtn^ıìÛßÿ®ÄÊïÿ¶ë»¸Ûh÷â©yû8òìü¿s3ÃŞÏCÓLk‹_£ñİñû¨éà6î]õhÔß¸¾­²ªşË2üÚ–ÈiSw§Òî«öª‡}ó_¿YWyß7ìH¯÷e§›¨‹
<ÕÏoyûÏ¯?Ï]şÖ_ÛŞ®‹[eİëÇæë_Şk~:{‘ë¿üwÉºò­×~ä^vZö3,«?q_}š«ÔË`÷º—÷_R­÷Üß¯?±Ü_cëÿ÷½Î¾2?êı;Î?ùÏº§v®ıËKÏï™×¹ÔàmöìbjºVÎwW¿Kÿ¿ıÚ©¹~×ÜúİíšÖìñÜ¹z÷×>_±—PZ·;ù{±/sñìÿoÃO?ŸÏÿúşëäk{§§Î÷ÿ­»êßfwÿóñ«ëısßßşşŞ=¯'_ø9B÷Ùîç§ì{ãÕÓM?Ïª)áÛºLÇÒ¿»/‡eÎSz¹wÙÎ]õ«¸ŞDËwùaî(ÜóİÜÿÖ._şwk¸å·³}½µ{µ™±=·	ë§¸ù§z}{[}¨û¿oÛ¿õ«R÷åÔÏ[{v­QûŸ_Œ(SšõöúşºOÇÒ¿m°ãy7û\Ş+ê¶g“û\İßço7ÕÕ³b_¿±¢Ÿöş6CO‡¾}”|ŞÏ4šÍï7]úg·(õŸWígvûí=UóÚ®ãwzÎ_×ùÎßGN©ïï¼wCm|>~ä¾õHìÔßSsçoğYíö:uï¾ÇŞıWÙÏÿŸW¿¾~ß«õøÜ?P÷·Şå\İß—(qåÑ{|¤Î×şÅÿN¿x—ñ¥¿_Yî:‘ºÇFEëëüšïÖ«úÙyÕß÷/õöê]ªgŞ™ßÙï.Ù­FeËı—¿_ıügéü®VßïïÕö÷ë|µ³öÂå	½õ¯l‹ÿ?Úı9F÷¤ßÜ·ñ{÷ó¿K•ùËït_ûñ<ÿwgõ÷nfÏw¯x¶îp—~Ô~ïr³{’üWì÷w{s×Õ×ÚıèÓßØ³şÿT}:é“gã^í/õû›8lÚ‡Ukv÷gÒ“îÛëwiÿˆué8ï‡w†5üœTœîx£ëë|£3åş·6ô¾úÿ…Õßş(UşùGÔ÷®õö¿ÃøÊ×¶Şëó¼ªß4]7ó¦ãW_çıÑëì¹ôÙwK{ı/!ëâø»‘ºî»îÎ·ıü6³2n¯æ{ÿŸ}'Á¸_Ö³Íü{qhŞ‰ßé|´Ãï×?ÏŞ¿t×û…¿Íê¿çoÚî;Ó¾·½IûîSÿwŸö¯÷ÏûŞE~x·S&ûÅwpQwùpºßÿ{_rüôN/?7}²{A®õÍÈÿWâÿ÷Çù»£¿<ÿo8¹Y¬[+nîo‚Şÿ™¼-bv÷Û÷gK?Z'÷/tõ=¹ÄòÜ÷öù/ıo†ÊŸ±Ë¯µ‡İ{ú².ØŞ¤ıy½İ÷¿Ë¾¯ãØï›{ÄîÓ±€ûóvF]áu×wn?72}‹ùé;æ_fşÀîóºcxĞŸş|	*š¶¨ÏÊ‘ÃË{ëÕïÇ^ûOÒM¼VZÏÓ½}ÿæS÷ù3‡ëşyKgnŞúoM³ğßì˜=µõÿÅ×t¿á?Ä®¬ì¶¾Õ]ëcëHİ÷³íŞ“éºÛuÃÿ<{şÿŞ¿×jÙí²ëÿÆÆ[eçÿ÷v¹ÍCöœê~ó5ùÂ%³ë?ÜÿhÉçşş?ú›»áqÛLå®ÉÃõ‡kßÛËßü÷şÿ÷wÎÿ½×G[´ãÿ¾Îúİ ÷†l<¸ÿaü‹ü`›]ßÅıwöqûúsÿœÏõ·Ï~*×÷|ïî})_ñğFxÒ3¾ÓŞ;d^·_tz[¶xëg¨…áû›ö¯ûÈ3÷›ÜşìQÅ´WÿŠÌkÛ­ß³·í÷îŸßÉ}}Ä>İ£Î}ñË¿ç—2Ï–ì·ÖGö)Œå¼·¯æ7¯7}%ùu]Í·”÷ğŞÿö»¿m[ûıû“sÕŞ3Şyÿ³û—×§óÜ_ïı0şw¸¿Æß
ww±cfßàÏoÊr¯û¿İ…Ÿ›í«ûşúÂûÕ÷ë×|+¬îGòF^<¥Ów¯âßÖı«ï…¾÷ï/—'=Kx=Õt‰~Mì¹ÚmKàŸµ›oŠş'ı–müòà{ÖM,İ—?Å{~ïÌìÛ÷ç7÷ş¼Ğ¶Ov¿î½VÍÿûœ—«äß¢)º¾ù§Õ×ÛÑ¾nê¿wç¿µO!ö7Ãe—ß¨»¾÷Á{JSÿ÷ÿ¿S/ãO“÷œ÷öõş×ÊÎ Ù§Ï½·îŒ­oÛışŞû>†Ç½?·¥=şÂË2»;4İWŸw‰XşÓûå¿¼{{¬¦ıy´ÂøÇó÷÷¾{‰´½Côÿ¿šU£İ*÷ø{IÅµ>!µGÛü;N3åS*‡Rª:Ç¥{ûPñg·jàÿâo[¦şAwş«‚'¸ğ9 ²ª¯ßã­~?´MÍ^«ËÃóÙÿDÖOGë"uğUÿïòÑ£Ê¾Ó-Zç¿GôÅrÛÕßï÷fómÕßÏïşî=dúÊ9ño|¾
u“_¯i·öşEöÁ¹ÿîáu‡¿…Ï÷ÿÃ/ŸŸïã¹kïk¾¿¥½ÿ(ã~¿­÷öÃ}ê—ßşî‡3ïÿ:mÿûÎ[ÕÿÛ3Nßá»Ûöwiïş_sf6{&6çÿÓ{æÒÎï·õÚuÌ­—³Nÿÿuÿ_S¿ÏşŸƒW½ü×¹¿­ºİ’÷r½ÿÿ^£o¹X‹Ë»
¿âfo—ÿîs3İÿdÇÓNñßOx«fîgãü{ÇşõçwıûÉ3É;õÅ×ß	íıõ—¹×Ø§²ü?Æyü7ó÷©ÏÿõëüS1ûªş»îß|õÒ·Ş9Ö¯•‚î~5ŸÜæµÿY¿üöŸx?–Ëş¬¦ÀÙZÁ}ÿ—ßk½Í­ç<ÿ¿4ÜLË»VËG™¿WŸşíwÇäßîÏµü~nñõ`ÏáìşÏp½>ÊÕüÙoåı»PJ‹/Ş]7MëÇÕ—\âûu?à“²gË4ô|ùf¾ú?bÇçı¾tîï÷fÿœ?§éî¯§eïO³r4äg§S§¿ÿ;{¿sûçİ¹7a~Âï¿ÿ›AÿôöÚüøŸZÌÓûíÿ}SS}uvºŞs×ñ_åß3ƒıïYš×º¿Üù^WaŞş¶¼?}ï—xñ½ÏçïOï÷ùÍwßï_˜Òÿ¿½»|§×>îÓôİš‡t×ß7wåu‡ÅÏdw?=›\Ó·uW±~ê²ÿ[õæì¼­¨÷Ëó‹»uÜ¾)û_öìïµ.ûÀ/´Ë<-×<ø.s3×5vwÖüÓÖÏaö±şáf/õTÓ1ÎÓ~Î£¹¯şìÑ£Ú{«ôïïKb¶£¾ÿ5#ú×ãÿuc}×{”÷EÖà6g—„\ßà‡˜eßv8•Jó]øôéÇÿ8ÇÖÜWìFpÓHıõHÍ°dÉ–7J·7ş¿á“?à}ÿ
şWsòñ·?ç!=jçj.İ³Ø¬­W·ëÔ?"ô?¦AÂk4öÜ}Tİıñ|oÙÿ¹êbä7ó_cŠoßCcşòÛ{jı ıÿÖæ“¬®ïÿö÷Š{ô?çtïqzû7ş÷wx7sûòßõùêóu·ïŞô™ÿÜõËßØ¦ŸƒİeúşSË5”—;nÿóú,©qwömÎ_÷uôWneËÿ¶Û{fïç÷ôÿlÍ›—ûSùê*ÿıöË§ëùåşgöí³5çï}ÿ:Ic/sø<êw¶so÷gøT½]O¿`Wò×¿TÿtÙ¬ºvb@úïÂ´]g©¾[Ÿëœ_Ïé…şÉ{¸OÊ±3{Ï—óÖœƒb—;Ø>Ş÷[š3wp:`ö/« -Ñşübõëi2ÓòyQ]§}!MQWeıõ&™Bğëûmmÿ÷{»=ûô_÷—\Ş*yÑõÎVIŠÏÏÿ½}Û°k»ñJ]j-ÚŠm_õ–¥¾Ûÿ¸:ÑŸg¿ğÍgzÜİşìz7Ï¬ÆëÜè÷W¬o%ô:ú_Û} )ûùû_şï­çëgXoëGyµï|Sıó7töÿ›m«şu·Emëğÿ9|zƒ¾öÿsNú·†÷cõªİ½½´óï‰øÕ»Üıâÿ[¸úk©i<Ş_ÏíoíÎ±û{CWÿ;ßƒúíëÿıßÿ§»k™NÿY·õiıGü–ü~ûØgzİşú^×÷Çæÿ_+ßÏYx§ÙôâÃòNÇ×÷+ÿ2Ø7íü’u¨¯^ı÷·øîæùı?ş3l&v<NWPYO/Nşkì3xŞiÔ/÷®\§/®Âh? {uî5?5o`ªo1|×ÿEüÒòô+-oü‹¥ÜÊõ¼MWç¼^væ}‡W?Ïô3ËÿşWÛàcõ£êuÿ:á-»xê½M]ÔÏóëšİßóÇÕ’õİ¿ê~câñ­½·'Šlfnİo™÷-aˆİ÷½=ûõi¥¯¿¼ÿØÿévÙG^·ıí¾ùØõ‡î_µÛÿÚ=šUş™çg®ıãÛ;åïA?ßÍ…+WüÙo»}ëóòû\Ö¿®—çñL3íë•Öß;ú+ïR[øE¼+gÌ2—}UOÿüø?ÕøŠÏoëş»é¿ âÉìÚæõe÷‘KIïâ~ªåEŞç¯şNzÔïÏå‰æöÈıæ	üY¾z®Îıø‡å·%İÿëß ‹õö&çöµ3š5}æçoiï÷óµşrİm¶Û½ÒÅTù'“·ÊñÎî¯¦g^µÎ§Ã{ùÿgû¦ú·úZ¯;¸Ìå·İ?ºİ›¼zpıÍ_íJİfyg~®Û^OüP·›Ç÷jÕßüKßù#æ—i\‡	w“ö(·İ‰óàûşªûü6æóî_”üW}î¾×ûQ³ç»ûë¤J<ıØ£wêÿåWw­ÄáÜ‚×í».¿¾ïı*‚}y>Mv#‰ÿ+:çÿ!o¯¿ÙCİ=yûO»{óŠg}qñû}ÏïØÒm¶ùëî[?ûŞíµÕ—íoíg=/Óç¯ó¶{ßÍÿ¿÷hãğî™_¾ãÎ¢~_ÿ?õ×y½ÿ´oá÷µÎ^{ôş®Üõ;ùœyë÷.É/z_wçµQëæ}çİÃjîÿÃ¿ıÏçáàoôêş£®¨—uŒ @ I0ÁI¸DAMAH¨«vÊä€€¼3PDpÌHR“¢µn. !%ş((
("@ À@#*†‰Æ 0P”°" fƒ…µÂ{ 	„€ PÌRÀŒ
€R E(K@ì €Á:(@y€	è @*™R\Èé2è¡ø“5°›r–¡HÔG3±U¥ ÉÉìDq É	0 Q0-a aø1õM Ã H.“b8¤M§BEÊ_PàF$Ô))!5(Y)Š2´É}bˆ$“@T‡D	"À‚ š¬ d“I¨IÊH@ ÁxQƒ:9ˆCèÒGà(× ‘14ˆ lğŠ@ !Œ•ÌBB+Š@°jCª#Š
›ô$’TAÀª«	„Ú¥ä-Õ'ô ¢40LqšGCt!
ƒrÊÁƒÅ^ØH$±(A+ö…+–C¡Ã‡³!ƒ…h!‡Çà ÀR É(RlPz+HH ˆ¸ &B1
DXa+   Á¢ j1‰mŠQ ¦ ÁCx~š PH!jf{*ƒ$¢ç0 0P}à!¾ 2W–˜=H'´Ä¨¡ Ä@G d0ãD’•`*!4 Ê…-A 3ˆè"Š™ìàIøv ŒRP´ d®°ßäé‚8`-…çU iHtàQk²Ô [4ÎPYU(°¥05±ˆ'µ4àÁ˜0% luÌ¸ …H¡2­ÀG‚HVhe¾ÌàĞOëêˆSàÈ&	À‰…':ÇäDÑ@µ ,aV,Ã€ P4HÌƒ@ @è_"!f(2 $±¶ñD4Â‰()xÔÑsš	8‹ ‰ª'`Çáƒ 0AŠ%,¤¢Ø ?€ªÄ00â @³f#Q¦ÈquJğ+ áÆ„°}¨Ábp«ˆPáqp0 i ñ2COÀ¦8AP‚ ¸@ƒĞ@”eXÆŞ&A ,	À Ê2¹ˆkR<hY/- ËPUn ‚	õBĞñX€9ŒLt‘‰ø°v@‰ƒš Ar p8*LII qò& xDŠX@#¼Q{f@©)ÙR$âi/qKÖ5ò’$Ï€ˆnĞ`,HÃ•†!P®ádJM	İâÏPX„@#Òå¾B©ŠZŸ€ƒ(4a-T@øÈÀÖ+Ğ¿ğOéº0E€A(a#Y%†(Á ` à°ùàÔfƒI’¡»¨Ä`hy8-iÆR*¥” ÈĞ%»]@ú%yH‚@c1aS•“Ê“VˆCPœ¨_ –À„ ÄÈ%!r "‚p d6QU°à¢0ÂR5@„É¡%Áå µ& =Äğ•X Pˆ q:ä€àÈÂÈğ,JKB‘#µ,ò¢OÙf DRB‹ÄB4 Hp#8¢ƒ"ŠÀ€~2hÄÑÔ€‚D„2Ã â•¬ht!0U4ç  CpAô`´¢[0ò‚b€ƒD@ª 0ÌP„ş°ã-MaI€Ææ…C$@•b4°¦èÇ€0 DtŒ <µ8G“
‡/=‡t#FÇ … p„QJ Â!ñn2ÎºJ3¡PKPX+`š{¡~'KÄˆ	M¤Æ61 “
ÕB# gÔ6 7TMFNa°
 ÂJî`d	JIÀB $Z˜ì¸º*DX :`	A‡ƒ @¢4ú0`Š V"’¨d<qFh€!2@Ö 	©Ì¥Á–0<Ã	 j“æ1¼Í@&„	,éDB@€N2½aI ª	hV¬ÅÄ™ ŠÀE˜l)¦¡$ È‚¢áCrÆµHDCV ˆî1¨Tü¢VjNBĞÛ' R˜‡„@@H§ACk²öÄ$†   {´“2adXN‹]Ÿd@Á i&"% ¥ç2$"‚3- 87 Ğ‡CLS‚A"øAƒé x‚ Ğ€#H … ¢J& „À³ P$‘ˆ0 [© *4ÙgL°¤`Ä9—%Ó©bm E–Îã %‡Mµ‰ŒÄ1› p ¦jTØ‘TT°ĞI€%EÈX™T7Á @ "˜Õ@?UÀĞ¥"	|	PS‚$@#e@8yÂ çÈ˜(X`‚‚À†z ‰,0 ĞL0˜È0P€Ì‚& Q*X²
Ï2¤0æ"³|C ! #è0`x£˜2»Vh€Ìƒ€*¼¸fà@Ã`ƒw˜h`ØBP–hI\GJàpMz$ d
’ z‹3AT‘Ø‰Q8 Œ‰ˆÀqÀOA"…BÔ)
£ ^ D!up3CPÒv‘Eik CDĞÀV¢¤æBƒ›4€hƒ*a$ñ‡ÁĞÒVˆ¨&,A[!ùçšh1p„ q0€ À!©T(HD`¦@3A‘XK2 rˆ 
i`@`LÏEŒàà'
+ÏJ Šv(^`@ ÿ‘"!¡DJ£ˆ“Ì 	G €ì§Ø Bğ% ˆ¼›Pâ  JB±  hØá
LN£¢ˆÀÆ90Ä˜#RÒ`€ÂFL@)48ò"
•‰g‚ev$ #Iá¨Dg;“#“ é4AæÖ€àÙ€şŒƒÁ¶¡4D`,Ø(ØSñxf‚@A²@Ô*fRC4ÉY<Ë	—4Ä9*ÆV€`R¿ B@ÅP `W D0B$@EB°¡ÁÈdÖ
Hø* HÁ¡8cK¢ÕÔ#h0
˜•pe€š@2É¥´@XH“9D’D ğW¡GK…y˜1„rú `ÀOˆdZD6 Á@R€„„€
VÚá0A@ÎJ€£`H `DYkcÆü€*5< 1QÆE€A7‚€@ÙÊ5f@ÀBC@€'àsØ‚ˆ&B$ ˆˆQCDI !J r•Ğy´X­L„¬ş€®r0”IW‚Bz |XB Ar!\ 
¢‰paˆ¾”3¼–móÜ$ÀI"% T\”\v˜1D"  X‚
5æîšh	HhĞ`UGD‡á$Ä± Ş 4EGh0ªÒ–‹çPpFb‹‡Ü6&Lâ ôEoØ
ˆ&%¨†8€ß0ĞPCâœ\BRnDÀ2°D41\ïà6D5APWæ €hÀTDQ Ù1J@
"Æ¤@% !ˆ|dã„˜Y˜†	ˆ‰lÀ(Cƒ5‚†	1€Y(¨: 2U_ nh‰ËL9‚” ’Œ©€(f9ÄFñĞ*êDfd i´’’† “€J&bì  D…¸g±$ŠPVT!‡  A6À€R £„,…‘T7± !PƒŠ
 /ƒº"P’dÃÓ‰‰Pf…´ ˜AÂ@r Àd´+²¬“Š Â“A"E=†Å ‰He…†1r„>pÈar!š2¹! …ï‘ÒF2•‚	Ø‘/o“Êİ
aÂ	 ÀfÌšè])Ñ‰n0­i€E 'Øª0a6˜«Ê·&RSåÇ"pÔ‚‹pÑh$$±( aDuˆ€ú‰´»@cVä”à@jR“ Ä,€@((ãû
ú
Ãå¡†L0¤ŒI‚!‚DI"@Hé¦,‘´jZQ°BÈeN¤"ƒØQÀ@¯Â8ˆ˜PBKÂ addX-˜ˆC	 {slÂÛ³G! /£ Ä  K`4˜ Ç¡ğ©™à‰ÆÇ*Hy®‘®ÁÓH 0´2˜G€ÂC2ÃƒŸ§ÀÔ U»Ò‚MŒ­êÙ;ä„&  ¢ä&0­pŸ9¹à ¬
HøÖ…ĞÆhÂ4P€ lM:¹R…,$Ò´4”(…L¡QcCı`zJ‘$” ÀW@ıâC!`bv_;9 Eem1Ú€ö
3B¥Çˆo‰FL8aHU†^ é DMp‚Sè!UAHf,„îƒMlF7ŒMYØá @ªˆCM0Šæ3§¡LË	pTÆsY€ @B†Cp!‘ Ï&D$#6  Aû4 4²Â‡°2;t¡ÀA$'C)ª	˜Jd $HrC¡
€ P%ÙiÀÛ´JÀx2ˆ@@`ÌäA&ìàŠ#D !Ô©CˆVÜ(ƒTB²˜6ƒ†„À…€q²Ò#0èŒ@A§‘C¢<š¬ *álI¼œÁ1ˆ 9á„+ ä`94"zN òuĞç¢«JRİ§¨NÉ€t°"º©³D­§*-|MDQ©W².Ö9@£Ì²¢-"
 1¤¬OœD6&ÖÆå	h‘@~´a  ’
0y¥H¸`]D$KŒ%ğE‚p±…@À°ÈcKFÆ†@ 6ê(01áĞX9¼h†6¤ŒJ @ 84È-¤Ä…b dÀ~ 1x ' €v6ÁÒÃ ¨áÁh	öIä%¢qÜˆ
¸C€Ã  ‚@ª€M˜z˜ •”!\`“( 24€B
U4À  q‚ˆI‚ 5°Ú„àD$B\E£Œ°‘€hD˜Ì,D P€ÀŠx6Ğ

Fˆ¨ÀpÄ#ŒY˜¢	Aæ a–5ÀJ›nq€lóÁa‚I"¢‚ƒ"‚øÕl(x›Ë ÕZ‚NÁœF(U¼œ@Èpa¤¾JÀLÔ—²™°Ö&hA¨­câpƒûHùŞ•„(°¦L$‚Ì0 A£yzaÙHÈ L@Pƒ€c2s†Vûªö†šFyÛïs²ôÑlQŞˆÿïO•³ñ¾ş÷bõiqòÖvÛ‡G×şæşû-—®¿÷Û»)îûÿvüûï}Ïúÿæş­[dw™*åöÅ±0éğÜg¥‡Kicÿ«Gù$ú¹,¿ñÜ6\úÅá}>òKØÖÿXWÖjÿÿ²Í®OHŞ#Å@#E‚P)±… Dbğ(ÂhèT‘OiÄ%‘¨`F<…E†<Ò À† M yIfCÒ* ´L;PTÖchÄ< b”¤  €	C6Q¦d4DR ‘Ax8ÁZ"b"LÊ.<Ë¨¨a (T´F)€ƒUI±Êá™™‘ˆ  ÉFh$Ä{Æ"h´ f§€ ET‡
P¤›° ô1) N˜ tPIè ‹ô1$´C°  ^„8ŠŠ0Êš JY¬(`	‰
 ˜ÉAû¶O}’j:¾ª‚q;á·ÿÃêû»î·½ÂR¹÷½JÉ¦òÅñîëê×ë#ü‹íòï¾øwùw[×ğÕuB”ìò~Ñ–s±mú¿wl-÷NÊ7ñ^ïU™Îöí£–÷uı’{–t,›!üÓ~øİK¸W?ö~¼Šz¶K‚÷á;º‹ñİ;I‰+/&‚ 3p0«‰,B €;:[¡ Ql†Ä
À’@Ö¸8P”€§!ˆbR”•³S¢!ó§DDS1b@’‰¸€<E7(@ALÀ‡0;ÇEÉ‹¡À2l €.Š,J?Á*Cß}ùÛ?ÃÿK	ñ¿|Á+_U6¨Bú?Û²¾}·.fKz7ƒŸ»?q‡ŞŞaj_§f÷ËÛV?òäÑ"ãw´ÿ4§_µõäúó­ÑÍ­¦ìşØşŠ\ï1˜öpÏfÎáHó—!Z„Ğß¾SÛ¨¶²İıû—ëÿVo·Çúÿø m/ğîÃÍñÚ³ñÀ·»/n¯{÷ÜåÒotşù‰äñïé;ıIİÊ~VT¹ëo-kênq%‡¼t%¯£İ)ßÊ¢œèWRÏÉ_¢å·UçÎÊÿÿËdûïí½á;ûíûş~ûšÊÜ÷›İïŞŸÄ	tÿGv®ÖÎKâd«ÿoD` B	4‚äjEÒ …QAh!h€ &Ïz8™U5\  P²N[#Dƒ`„àÁ½X\*:  @•€7*FD!ĞÌ$Ø*ÁÀ€´  j 1 yºÑÄ•4‡£ó‘a)FB€«€€ÄÈ¨óô c¾Èÿoú_Ì>\óâ·üÖèw=~yŞ]÷~÷B]&MR$ßî?1ü}c~ù=?çÿØûõü¾©}s§C¦;Gş3ûü9kúÍ×;×™ïzí|[î½û6~ú•½G§QäñóÎßŞµt_€¾«z§Å]î€fÛÑ.âš³-·Ù˜!A,€J $Æ.Dî'i[‡¡,Š…C> AÀg C€
4Éˆ"Ji† €$–	(* ‚S&ïğ„(K€4$<À(@‡˜ÉP*‹( ’B$e @$™-R @pY0aÀ&,c0Ù3E€&0ÓÀ F!¤!»P-ÃH¨‡ à%„ Í &ÀB©Àbé€è`xÂbda‚%çéV
àĞC (JãF@¨ Â2 Úe¸Hğ¸ˆDPb
C!" a#Md  ±Œ
 	’İ4ß–æº—ñ_äû»~ëûMnWèVzUñßÏzEG±ï´÷×~7ÅÙDéwö.ÖüÙ³ŞÕoÔYpÿõ:nµŸı7¶òÚ¯ê>Äùş~h[?îÅõ~îóİüÍfşd¿'‰+öŞ×Hõ÷exîvæ„õÓ8ÕZ¢©r!=é‚•ÂÄP…‚7)¡D	400˜à!…$°¤"Dİà”„àd 2‰Å ´	ic€@dE
 }ª€E ’4Ì"©`B?Ğf8ÎßÓ°¨d°…¢¦0w‚4A×O@2°Á‚; !Ôc¢ë>/b+yK[ÅoîL^÷Wlÿvı;ÿ{ÁıÇ×LRyËJ3~ˆÍ¦<\ònşôÉöKñu]O6)³YşœQéõ¯-ºn~Âşıù‹ñ›w7aØÛ¹¢—çPÎ¯×q2Gh_¯İ×Û´>³u%ß3xûÄÛ Ç¼j½·<­§V?÷gT…¼?åôíuÖÙ.÷·şú#Í6kıÙñB(]ocnO_æ_%Ï6F­¿'ú÷ş¿ç.İ·×·§œüo_Ñ2ã>s£Û^ú¶«c¿n]dÃ%v·÷™J>3×w‹q‡ıªç[‡›_è‡Üÿ2[°†çš¿z¾ròœåg²o±®æé?Öäó73– 2îÒØ@r S†48	›B¡)-‰ñ<-`d@ÄĞT  €Ğ@¡ä@'` ²@0…€ ˆ#„FĞD ÈCÀÑ0‹*¢SB>LWú9IŠeª‰¸„(·2`0Xµ)ĞÀ9¦/	b ø ĞX˜¢`x´ñÚ8Ş-»Qö@ŒÉ•Ï˜•onqy_¯øŸ„kêõÅ»÷—Ø­ßåÿø'Ö»¯Wÿ•ßa~Eæ><ı÷wÿİüûãßG¸ŞNf•Ïö^şzUâïBÆèU¿ßeÏ°õŞ¾e^úq&Y?¯~õù¿ºËúüs“v¦õpgÀ €ÇCšÀ À„HQIˆ! ‚‘¨˜@Ô#-Ì3 O9,Ä<E!xf[T,² 8Ì-
# 2%Q$0LÙ†lÂ	ì$Ä\äÁ$Fuã€éC"(°P8Æ#%pÉdÊ" 
€‚à²em †º¼€‹²•BŒI $(Ød¤¢ø*Á Àf±pÊ‘áÕIAä†€ r°„Ä!ôC-`†Le „Z SĞ@EDâ‚˜Hw ‚ ‚ K $„!‚‘_¬hğÏá%”0¤²À	{«õÉø)¿ºÕR©(W÷¯õÆÙ'CŸi¦³	½:/úøŞ¸9´Â¾ÌF5–ù—5ĞW›¨¥hÙBÙø»ªWíÿÿ·—3I¶;ı{gü±İct WDÙİ÷ı…ªÿ¾|_À\š12ÒîÎëÆ»åoúì[<?7Ï:½»[ÁŞşıOoµ€B–…D E 	` „b)@KPˆln 'ÊV
ÚNnÀ$@€€!g“6¡¨ñ9E„ 1 jğA1€d‹Ì”%"É€QˆCxvA ¡iÂÚĞj$Ax€`"G¯Ea¥Aa-µ›¤(‘p® ˆ4_wÉ 5a?û]õ%Boó«òO†ğ»µû2Yü+3Æ|Öœø‹_}VÍo&;K.üÿDæiïÏ‡·Ä¶]Æ¢¦'zŸÍægüû%¸'İßï›Ÿ wIƒÈÒ»ûØI?{µ»ÒeÿÇ~~×UÇæÛ%“Kñ¯óOmÂLW-õ—YQqıÓµ‰ïçşnmlÿúÓc}S¼ïOÿi¾eßê*ù‘ÚgïÕtışåÜ‹~Ó]Lû%õ~½íÚ“sO}¯o]gş³‡nô…úáá)şÿ²TÏ2êZ¿ıæy¿6Üæ›ö¦İVJí]÷ßŸGšîæV›[«íoé÷ıUÁ¾›ğ¹ş®5Çî7óüÿûß"@btÌ0I !<  J(d,0¥&ˆÈ,¡¢€ö”©l‚bRà+Ìa&„HŒ	)€!•äØ²€%´eÄøDpP ©
ˆ(¥€²¦nmÀACy ZâA§‘0¢%ˆB˜ä4¥	[Ê€4¡ª [n}÷Ì\Jğ…ÿÊr«{Álïü^¯º¹zÅß-³ã}½ví^b€ÛÑ^Í{@‡íNõÏC¯¡ÕÛIoïWÌ]aïïW4Svzº‘Å,^ê}^“ñ©Ÿ½è¯uWËÌ´–¢Õ³ßŸÛ}wåG¾—qÓzNåÇ_Ós^Áõ5÷§ àÂ@h&
$!lÃ! !±ˆ¤
 &L’x2`$
 !`¡"¹Mí2X!– ’$@„{ª#Ş€HÌB$B£ØÔ2lÒÌÀA  
4Ğ„ ‡00ÄEgd,@3À­	›!ˆÆc•„\ˆ•p„ŒÁ»h:E‚0IA68Ç#ø á‡^¨@iA’K 0`H QD$$@í„¨’è dĞ( Q`ÈH€[‘ s ,0@Á®0	ˆ-dd¤ C]äƒèÈh ‘j‚fxl FCÒ€``&wk_Éÿ<ïõÒ{Ï¾Oy…¶“­Úº§u~ıÛö_/½ùëí«em­ıg]wzQü|õ~Ğ¿{ÕåÕï±ì ò´ñ·Ë¿ÛFÉ’,÷/ÁÂ÷ÚòQ²?ê_ÿoÏïn–RgwnOßwúÍ6È“ë¥ïoMÀ¿³ûªÍûFŒ&rÁBP Æ@²5 @¢ˆafâ	Z$ aÇ`€ e(ˆPaÁ9*q ³€ƒJ 	Ğ‘G ¨
M  p Íˆœ ˆ6 eŠz <nØÂ”ÅLş¹C¥ÄÆ04x€Z{„W´„Ò  ¸¿â¶nV­ñÙºÛ
Ã¾
Şcojö·ŸrÜyŸ÷¹=g|áŸÃÓ÷ ÿ­ıûßMeş´-Ö¦Ê3ûm¶ÒãìuüıAj—/ç:×¢”mâWûw¿5ŞGmG8ö‡õ—ã~ä6_Ï¹É(şÿ—AIc¥vŒ=¤ß´÷§ó$~ôëüú‰7œ=êùmé±KèÿÍùzö!_¢-àœ{Áˆ*·û¿^ö†\µ;×>lîqù›=Wl †İµT³¾˜.¯|·7NúÏ8¹6Ü¦Ø£4ù÷ñ½èo
@ŸÏı[í#ş  wæíUw:rç‚Ş;´Ó§·ìp¥j¬q§)ÿ¾ êŠt:ä@$HTÀ& í ƒ ­„·‚F˜ ¬°= d	ƒQ(p
   Ï²8™H
^$Y>&È†`¸ 9Ä€ÀANé €¨C¦€™„`8!Z€0dÀ"å¡X"[Rlìx¢
 $‚¦ÂQ0( AIC,ÄÍ+`@%Ô E©¸TŒÆ¨PÂa àŞE
RvÕ
ƒ$rÕCX€fGˆ %Nx0Gs HÒ )x@Š+2‚Í@Z*Óˆ 5©nğ–-LÛY"B„Î™Ml¡   Ğı—Àu&HKÂ˜n@ãMé•Œ¹ş6®÷Õy¬ûï½-İQ&^½ŞöŠ÷¿í½eOıW¡ÿåÿäğç?ñğK¼1¯ì~Š³Ù­o®í»|êVóIéù÷ÿÙ×¸ìïä…—]Yúw{Föÿ'³å¿ûK_û<ŸgãnykùøÍ½n¿Å€ÛZÕH6“î³ß>¿>ÿı\Y­îó{Ş~Ùıÿ7İÌvüİ½?·Í™şÿ?ªşÏ¦ı/µ©í¯Ö~+g÷{ï¾ı_zÿw¼í†Qæ9ÿOßßy¬{Õß~Øßßı£ıíó.ĞõıÕ~Ï|ğ·wÿàİÚê¦{·ÅÎ~¿Û}óı ³íÖîÓ¿Ó»©Ó?Ózıî¾\ïºò}µ­ŸÓa}œ)[".°@<O¤°I*!-WC‰£ (!*ğT 	Ø\Ç(ÍÑ8LÁœÚ ±Ø„*OÍ@t» ÀW1L)-k!eÏJ…‚B—xS @m€‘¯¤€%i`˜õJ@!@ÇÀ1$êHZ ?{şàæï—öıû~_7ş?ë›âêwµ\‹V=õ†u÷Ÿêß[4Ï¹÷/—»ŸÙ»¾xq‡½·\®«å5üÿfÿúw/_ß‡âûŒ´ª»Õß9gsø¿ûk½o¼_×(ûßí»{³›şí·q]¥º¯oÍqŞÿı÷ısİ¿æÿb¿ÿÿyĞ$ "MÈ!_“X‚Ò€ „ÃĞ€ VÄƒx.ÇD{Òı4’B0FİaË:hàä‚J›†pB2	äª23…U„)*| l6°Bªˆ:b B ÆÃ 	å`D-•ÀGdœc è$0pì@T)¨ÀÓ\ğº“T	

p“Ğdh°d£'+PR˜|àC€UW‰…M|äÀ9|§HPV’56$’†¦R<® HµD£
¬’‹B¤¸3ƒ$	J4ÒËÓª¦‡FÂD´‹¡ğ€»qÀ¢	ÚS ›şïÕ¿3ñë¾²o–uÏ}İm¼ú£’yÊÿßkš|¿Ÿé.ë×è¿›üøû¯Õ_şK÷fNÿïcò‰ç>ûî²÷Êœ=ÕY¶‚í¿§ò›íõbïÿéúOŸ–¿Ã÷÷ê7?ùm?›ÿÿoÚyıó-ßîı_ÚùÆjœİÿØN¦q=½÷æ+¹sı|÷ëùACÙûÅh„j²—±€íCs /[JG¥ƒj!%›—LÈ%€wŞ‚Y‚MGBìj¸U $Ş›a@€1”§ĞSSjÉ¬³›bú"F0‰V§† ZÂ3K‘@„!L  ÇĞaÑœÀÖ$L¡"+¿óß{âßíÿùÿÎzõs¿İï×¹ç¿øù±İ£f{ëûùŞÿûK÷~·ıVò?í}úşıÿûúû>|£íµ»z;6~ïgoËşş¯ÕÃï>ŸŠ×Ìß’kÿQ»íß?»ÿò÷ï·ÿ5­¾oİõÎ¦1>ıé;îÿëÜ¦my¿}áû®o~³]{‹×_û~÷#y?ı}›=»üVÛ÷íQgŞ}ë/”÷»½ïÍÂ››ƒş}Û9¿_~ç}ßÿ‹òÿëıé4Ù¿q"*ùV_ßòßöïêû¹—ooït§ÿzøû\¿í£m¶ßù÷~Q¥>Gúï¯Û?õÿzİ¾¾½®}éùÙ;åGMïùÜÿ€Ö˜1–h FØ¢Ô@*°'PŠ-†4GÂŒÃ×pG¦ ˆâ!
D	œ£ígq¿@+Š™"JŠ‚WñEˆa%.&pá•€vkx®jë	P@	$c‚¨A¨,/ @„ll Aa¡•=”ÎÈa€’$o…ëç»~kıõÿûÿrŞñÿµşÿ²ß|ÿ‹Z¹ûÛ_Şóëú»şÃ'ûóKÿìıê¾÷¥§ï÷¥ëçWYÑf·¶÷­cÿ~½ï÷{¿÷ÓÙøÿû·÷_ÿ¤Ÿvÿ³ßÂsÄ»íâíyììê¿¶ÿßmqù¯ı·'ÿş×Öö»ÿ¶îßæ-:bÀ¢$@ BP,Š,Lîó€¢ (P÷h à¦Nd4R}x|º¡a* %h¢FJI€R!İÄãT@ZEà…ÒPd£kXˆÌ0 á2O
w7wØYá@*¸¼(4ÒH¢2ÙìEA0P–	X"$0±An… Ş9"E ƒ(aæ*õ–¹	8E¥€HêµT&¢U:,8s ,z4``¦PŠÅg¨¡pŒ x±U-o@	‡À #¤É80%Ã…8Á Õ@f
˜„‰¡Y",0v2º’Î"ñHsíú=æ~¿ÿı}VÜ[ïÊ×ûÿı=»üü?)™BÚ»UûMÛ³óÏşÿÏ¼ş-ıë/}Ùßîó½ş›«ü¸ÿóş}¨Ü9ï¬İôÈë·òÿ5ÿÏÿÀógçŞ¶{}×Ó×ÿ—èõwøÿ=¯xßÕl²ü¶x¶¡kÿruşş÷Ïùööø¹ñy0´b!'7@BÀ¡” $A
@GÄ
X$'@³‰ -˜‹BTSE¡v÷•5$ù-!![<P8àƒ#
H)á¦4bã¹ € ÄEªî‚‰€XIfu$i@ÇıL…CTøÀbŠ}}TòE˜*s‡ 53ûıúÿ²÷ñßÿéı¿e»ÿú/û¼ıhÿà§÷~ù®"İ;›Ç]óÿşÄìw{&gîïİùfÿRù¯lŞ8üÃŞø}ßÏuäëõÓ¾ÿî¿gáÿÆıf]sõøÆ—ıø½Wö~¥Çÿ|]û"oÿ¦¾ïı6ÃõøréÇ÷ÿÍ±íŒÏ|oêéÿ-]íùÿıî|îÿ³`ù>¿}ÿ·—ŸwÈ}úîşÖË³­¸µkÿ}íîúùÿÿ­-ÿ¼;ï_Ÿ/ûëKåûï\¿ù·»ŠİÇ»k{Ë¥«ÆóUÿíşß»´}ÙÿîêùcïŸşı7Ó’OïgîèİÇŞ½®úæo®qß»ÛùïëêÿÛåN#€t@(âªƒV„Ã¨ƒ†İ5	Û&¶ ­€eƒxé1€…8TJeTµnX	$$$ ”‚”šEXH E è5
}-@he0€HBáù@‘ÌÉ
 TÄI8@	YM+»Q€J" j£Ãßc¹Í~q,ÿ—ÇÎ=¿Uu–Ÿù?&úºÎ´?—ôŸøŠş¿ßÿ÷kû½ÿçßæî6Ë_şQv?éoö-Ù€ùØ\àë™ùíÓ:µÿ{xëù×#ÕeO*_÷o—#ö¿‰oºŞıó®ıùkï“O·¯ôç{ÿ÷Í@wÛûßÖ[Jåúú»@$€¯MˆÈ"H‘,Õûd‚ TG‚5„|DÎÀà'AÏvV_X PP€R@4ˆUjÕPÀ‚ê3H@T1Ò…’«  Âa‚”H,¡šØ)„ˆ
ø³s q’Ø
€± –Š! @ Ê;*äGÊAòq†ÕË&° WÁè£ÈÒ ø4›™>V»Hø`ì Â3Á4h–DzbÂ#b5ÕYvF$A©¹Ào J?sLIƒäí¡BÃd2R×¤<@ é­±ÔNçp ’1	â+p0HQE°š2Dnß›9¶ßı×ãÙøÜé£öÿ/Ÿ¯ûüÛ]¿‡·_Ú÷õğkúÖæÔò¿®÷İîzŞ÷¥os{Íùs÷Ûı-üÿo9×BúöjÃıu_´Ëº+îşw²ß?¿ùĞ¼O­åÿö¼«?_-ù.çS¼¶?­²qÿÿùÿ>öX›¼kïÉÿ×ñ˜ÿîF$!iiP@*‘Š" C Î\J9 ‚ãï+&FĞf5³(5Ñ×6¨é†m€ %`1²(”‚YMY½‚M’€Ç  ¼ ”4f ¢¤š(×­ 4¢Æ ½A$À AÈLƒ01à¥ÈáG¨Gh0•µW|»[ßmØG~rÏÏ¬¤ú®Æµùâßôÿõ8Ï¯í:k¼wJæ·sº}êøŸçh¿^›¶ÇŸO;mgº«-³§ÿìÿéL—{eà^û»ÿ¿=:k³êÿŸqóól‹Ïí«Ó&³?Îéï{?ç©ÿÿoß³-ü+º¿÷ºuMÕÿıÊ”ºòğç½Ôù ßÿ7ÿÙ¬?Ï¥Ï¯û¯²hïÎWº¿¯ëâşÖ×º¿Í§öİìÏxú¾_ÿô7v–ÓÃ™{sñöå¯u{yßéÜõ_Ó|›×‘ûõ-6\ú¹üéâé»+Şşÿù‡«Ÿ¯ù½·ınñ¨÷Û?şĞõ”3{ôf³ûÌ¿¿÷ë×ú¾wœEƒ” T#.280à)—”€ Ù0D`$f $
˜õ…<ZaÀ
‹p¤dMƒÂp“ ÑÈÉÀVõ@` &àh‚pÈ.h„eÀĞr!*&Í Ää#MD¢E¶€$Â8\DPÁpæÊaE’AFğRóßß}+ªÍòü[Ÿæí{÷ŸıÕCØüEk¾îk/×ûéÆ[ä¶mÿ×üÿd^ÿ÷İ°Ş|]}ÿrù×v´+oÿñoò¥¿mëü÷¿S÷û“2ı®ÿTOëùß‡Ÿ¼.é~>C—¯>ß?¢9‡¨-]?ï÷ÓïÿÎÖç»~@œä'€@ Ed
’!d@”Q”0Ø€ø0DElhj›ÅE €áØæ‚§1Ò0•w	€^²Â¥¢@¸sqŒR¢D²ÔI…fÑ~	E¢PZZMªæB`d! 	À1j	a#¢01%%	&¹ƒ@E€ï‹®ôCÁ@ƒà^X4Aš *#È{v½ğ„&¦¨‰Â ó
¥jğ9 0å›´±@FÀ½wÂ
›<
¾
33í ” ØP›Bä¨JÀİ’°@!©",¨”Àr,ÊKHª ô‡Á… ç§”£ëÿAÏÓğú½ÿ5ßßeù‹kï[ÓKg_şŞÍßÖcé;¾x]wÿ¯üşpÿ¹{ı?ëêûûÜy|şg¯vÅÈŞ»÷›fG_uqWÃÏî}ıó©çí½­ãg[şj®×åù>ùùÛsÚ~îİÛ{×şŸéî½éi¯¾İ¹¼=ÿ¹r‡ş×õ—ı®é]cƒú7Şíİï¶ÿåŞóÿsöß&ó/-oçß\úİ}ÿEñõo[ßóÿÆåÏÿº÷~ÚyŞwÙ½ÿuFñ­üÿßÇŸûõom>OÿŸOdïŒşºÏï¼{}9ïûïWş_{9Çï÷³õ/ßú†§gÿüÍ9Íïïkì¹ïÛÂ|Ş¢e­I¬Şı×Îsÿ×Œ·âKÿŸ¾eÑØo³¯ı6¾_öwŞoñ(şLòõ<õ]hßì¿-Õ×µï>ı{ß
S«ûïV_À¿Ê:Ø„Âm‡!YÙÛ´I[çGVF•¾¸‹6Ñ–Ì|¤Şsóz}mö÷3ÿ|zcG¡Gn‡³†²Úmé	1q‡KìoºæE£Wşœß«ßW§{:Éùå»)İç ¥Ì÷ï—ÿ~ÇOùWy2öÇv—öªŸ&}¡->4¤ËM­Álï»Lßíı;­Ôç·Ñ4v¾•úu¿­nÿŸ»>süwÊôãŒ<¯÷`½is½~½8|¾j¯Nşr·×ß{;£.’}Í×©íÖÆïé/ù¿İOš{÷ÿï?¾İÛ~¤¹9”òËş×ñ•ı¼ÌvÆÿY}OÇwíÿÿ~û÷×ÛóßÎ7‹ 5«öïÅ)‡E2¿÷İÔ9÷üvÄU»ÿµ=[£w]ßoøºÿ³—Ì=×Gskâ¿÷ï¿ßõÙ§Ã«ş½lŸ6mo™ó‹ß?¿ğ»Ç«‹R»Ã½ïïç,ßì¿Çoçu:®ÿĞş£³²/·¿2ÿ;e‘gqúÿ#d%İ>Zœ®_+:ë·çV·;å‘µïqq§å}«¼îâ«m?»ÿaÏ—1ÕmÅÒL¿î»üøVŸÏß¸;ÕşwßÂù÷WâÆÛáêÿ=:¹ÇµöªºÍë_ò¾Õô½Vë{Ñ>ïÑsßÄí÷oÕ½{n>#?.Ü?ê_şşçŞ—ş³ß´Ø×o§ïÜÿ­hÌ½Ùô—ï¼eŞ™í}Öûÿ××{¿ÿ¿Şúû7>Bøü–nŒ·yÿË¿/y=æõŞNWM¿¼şëo?[tn{	’<{¿÷hä¹ûqÿŸ{vü}ò{=×7ÿßïõÛûêÿÿÙú}ûúxÕó¹;OêÍûçò=ÍÿŞ-§_ıû?ï~ßéèèå‡îÆh7ğ/ßo‹/±½³ß{a­>ÿ/c~kÌÿíï[÷Ÿ²|j¾?ê÷ï?¤+¾ÿt}´ÕK—İÎé7wR÷‹'wïº¯ûúŸyÔ/ş¯âßS-¦s	ÿ‹ù_İ’ıx©‡è]sú{óó7wz?%Ù{YŞô—/£oŸÿ»¼Gßÿ3§ß‘÷êVór,è¡_Ï‚ú¶>»O­ëğ·ÌÆ©Ø{õ7ßT¶‡Î¯ômöóıM¹§ç®óT§üÃéüYRº ÖÛíì3Ôòó][óÅëù~—õ\'ï}wßß+Oƒÿ2Ò‰´¢¿ÿı÷ÿï}v½ÿ£ÕÿöŞÿ¦ò?™õÿ?ÑØßôoº¸ûºŞ×{·K÷§ß
?ÿÿã=Ïù{Ê/>†>ÿç-ş»ú9òÒĞ¿ß_ó—ğö=ÿŞ_÷\oÏ·µ_ß}Ï«~=ê¿Ë~ß*~ïãÎøÿloY¿Û¹ï»aû›óß|§¯/³ê3ÿiÆ[\ÿGdÂ»Ùş›»W­å{_î÷™³§ŠüÿÆV‹úk(ı??çëÏ~?Ûä®oÓŞmèüdC®„rıïªô°¼óŞ«íYÆkwûõ¿½–ÚZ•Ş›Ç‘Szq¼÷WrsñÏìÿ¹4ÙÎŸXÎù'xbÜ9®x[¾¶—úşAÕÛÿ÷2†¼¦Ùæ­ë“^yçÒÏû·üÖ6³gïèİş~Wjtc’‹Y:õ}½Ñ×}«;×tœ€Ó8ûÛ}{îã¿Şü¼Â÷÷´TÀbw¾wŞçÓ­¾ç®¤ü~{(¾?×åIç}oçòuË²ÿFm?â…çÏg†şz–3ò÷»­oòÿì»+÷ÿûZ²i½3¤¿]Ûÿ½Øñ“·R·İ×X¯ı¿ı¶¯Ëõ¯ÿ<×ûKgÚùß?äõşo÷¾ÿçËşcJ7—Íï|;_tŸşùQN^ïå—ıÿùÿ=Î­?ÿÿİ«™»ı¶}ı/ßNâ_äÏĞöíÕöK×“Ï·gïï¿ï3;Ÿ£î7ûÿËKırÿ™wd®¿šÓsÀ‹6X²N¶ÏÛÿO[Yûçû]‡¾øêÙ1¡ôç´ÌşuşÿßùÅ×ËÖ}ş­÷æ6÷·ñç¡Üvl¯áöÿš¹^öÏö{gµo	ıWñüçşççÿßzçşşŞ½¼İûoÍºwt»ËèWK´‡}©ëüßÃşí¯í·İvwı÷ãÿ^~ú{ÓŠ+KaİçÕ=ÿknz¯İïW^å×íÕ·ı¿÷ÿ^ÍUïŸ÷ÑÅq»Ùıoÿ¿ŞÇ_ñ¿ÿw÷æ~İÿæwÜé7?¯Íš¾[¯·ßK¸r{ö÷¿w{(†ş<åÿßLvŸ úùú"ÿO,ş<ïçõ>ûİ¯Ş›¾ÿıwÎï}¿åÊîı×û÷zrxî×µòÿ+TvFè¯ş¹¯Wÿ«óBßZ½‹Ú÷ıo»ıö>·ùsşúÿwIvH}şåöÇ×ëïñóÒöïÏ:ÿ[í|¼ë{ëßô¿[w8›ÿ…%ûùÏ¨ù·.KItuÔ¿ÿ¾àuİ~ñwÚÜ¿}'¯YØ¿>îä¸ÿ5»gü?pÿ×­Ú á'ôıç9Ÿ¿İÏü]Îş	`üöi·¿¯•ÏtĞºÿÛ¾÷ú«´o§îËîûÇÿUoUŸ¸îéøÏÌñıı)ØÕèóGÏ_ÿß»IÍ&Öìöïé}çsë'İ®şñ=@oõ~ÜK.¬ßı—©ÍŠÌıÿ´¿ñ|áÎhİgûş÷{férùštşÖÙçßö{›ï İõ×·sûÍ»—úŞÿwŞ×osÇÿğ‹ÿÿÏãÿ¾ï¥Ï_¿ÿû¿ı[­Õ=ş¿Y^çôÆÅxı¯>÷çï]çêó[}ç©ÛçóÜ÷—ıÙoŞ÷ ÿúï©óùè–ï<{±°§_£·?wZ~Õâ·7lkÇälßoğ¾ÿË{ÂwùoëMUŞoŸÿĞ]ûÿVã÷îÿÏMMõ9Z“¿]7ÿppóŠ«îúwØ¾Ñ[	ıëWrS+‰ww³_ÿ.>¢xu³èê¾¬-íïÔ÷íßÿ—Ò~Ÿü›ÎsÕñ¯)_ãñóß‹¬ÖûÿÿñŞşìòñıõí™«ö®úş=µí;ÇoÎÛïkÏüL/Äşy±}+Ş’¯ı{²íng†ä%µ·şoë‡X›Uù›oÌ"kbzu_ªîôjõK£ë}A|¥ãî®ß|+mÿæ®÷Ş?Ë^÷ûÛß¶·ÚßØÇû…cüçõøøwÿTù¯ÿ-}sş/¿ïöÿ¿ıü{£çP~nöÎñ¿ÿõ6_^öõÿ¿2‹XKu½g–ĞùWë9Ÿ÷¿¡ù?ÿ}êÿu´çı¿ŞÛR})àß.k+»$?[ßÿ}ÿoõßO×Gãe7î›+ôwë!Çíb|5oöÎy÷{ıñÛí”Ñë_İg‡}åş¥Æ\w¶m×#Ş;rŞß6-=Ÿwïı³O’™òyá9n~‹°ßqİ±şX­àÂz·CûåïÒªƒŞ×ó¿ñŞ÷ÓË7·éÂÂx¸ßW¶W³Çÿı÷ôy}ë¿÷Ñû_ÖŞÑ®ñW}Ú^;#|¾²ÿÿ?®õ÷nyoû?íù½7_—æh—¿Ÿ_œïŞ{gÿí;ÿÿşß}‹g]oúÿÜ×ãÇÛÿP¶­Ş[Šÿïçıg¬÷Üüñ¹0c3;ŸnO­[ïÓ¹ÊMüÛ¾z)–ëÍ_>.ßÏY§ÿ6ÕÎ»½ŸÉgØW¶}_îï=õ1OÏëŞ>¾kßş}y+şŞÊÏı÷wÚO~~ş÷Öi×fÁOÛÓ÷qñÿb~ÿ>Ëau?û±¿wŸßú_>íw¯Öö½ó¾³¾İ8ëïé?ğmüÚÇ[İdø÷Ëş{nùÏ©Y»şşaæ×»Êëÿ?Û<İöİY*?5ºüİÆ6ù<_­+ó®ûß­ÛşİË~hå^;åôïå½g:Ø ¬>,ÌKWº¾ß.uwÆÖË‡µFê¹½í~æ¸=Ä²0:?¾÷ç9¹!ÿNÚ«‡‰O¼jy·¯{ûüo©ù]ûCşçŞ÷sÁÌoî¾U—Òoÿãgï-ƒÛëÄıænæß÷iöïßûê=~éŸ?Ï\ß·ûÿ–íõúÆsuÅ'÷×ÿÿ?Œë»»ÿ×Ş×¿n¾÷•wßò*móÏË?'ÜØõg7nvı¹ÿéÍ¿ı¿ûÜ¯î½ßyÕ~­´.÷™½îí½ñ>mşï6~{.¿»~ÿ×ş½çñn¾•µÊÕû½·%öÿñWYæ´%ÉªNóùÙĞ¹›Å´ÕúßXwê¥Şı±½á7©¿½û·ƒÌ]É×ÿßw3w£òİïYªu_m·<ìÇ¼ƒõ»7å¥ñï~¶×ïÜôöÍ¼ªûïö?îoå# 1ƒ¸ò”«×Õã¿6Lƒ·{Nü25W¯3Sú½§¯ÅÕŞœœáÍì¤ï×Ît»gıúvgó¿Z}ôÒÔÇ«ßæÃÕ«?[›ıÜíÜüsı¼>r]§ıåÛê×wÚ|6Y—w^Æ?]Ïæ·w}R#=3w·?ZÍ‡B×Â^ÉşõËo—Ÿ«Ï>ßí(ol›ñîú?Wï=U ¼ô$ûºÿÕüü÷¿®{¹ı‘–¥?ûÛïöæg¿©ö†öµüÚ£'»ùönïİ½£'tò—×ì½ÎRUÅ«¿ŸüîğÇø_}_
¦Ówn»=n¡±{¿½#××¿ÿ¯½´û¬óıä?{ßz;?ÚÛ=¿wüœÿ$çñ>ÿó§ànxyjqÚ»{×ò}_ìàÓF¾û½Î±àG¿¯_‹×ßln×«İ|‡ıö¯iÜF_[Å—‰ï=^¼Şõì>M[½lÉñõ)«l“î~Ïïû!ÿÑ3.W ¾c>¾n¸çõ×–ŸOnËW7©ï@ÿwÍ}ë±~?h}¹_¯ÙñG÷ëaÛê‡¾([íŸrüÆ¿ıøX~şşkºoø¯İïÓÿâúû+—ÿã¾ùÀ¦ıı¼>ş?ãt¯öünM½Şç[¿£°úo½½‹ú&6}ôWò~¿çÿºvÙçö»¬{ÓÚÍ4®’»±ıwŞŞø½˜/ó»>Ÿæõî­åm§Eïñ¿ÿ]k¿ŞòwN?¤Ï¿{»/œöóÏîÿï}ßâæÒªGWÚÏ[ÿÿöÿ®šéO>'ÿXşÿ
îñ½ÿéÇüq+ÿy7¿İ-ù³1s\í½ñm›wwÇë?ÿë)÷òs_Êÿù÷póÿ¼ûŞ~:+glîñşww€İ«~ßôÍöÚß?ÇWê^u÷¯ıwÉÿ9z—İû÷Ú¸ôRòê§Å¶/qIÿëëùÔ±¯}âıym×7ÕMÉ·ßìîW¯Cô½ÒïxõíÎäw/¿qQoıü¿ÿ«ş—Ú›åŸß}Ş÷VİW‡ö¼Tí™IÇöñ#İíûÏßëÏ…¿¦^E—>ë×¿÷QsûF‰?Ó·şDÖßÛõs×kü‹Ï?F^¿åv.ù]ÑÛ 1I “•‘–à\‰EFB!UXA*@¼3ŒbÀˆ,¡PŠÉœÀzEi Ôh(@ˆ
€ˆd"DÜaG¥­à@Ä‚ğe<Š‚ @’IH ,¥#€ÊB‘Tp” ‘ƒ2ÕXÃÆ  HG!DAJÑ2ŒŒÁŒ§$ H‰'`ˆ(JD|€0‰šdX˜ T’m•iŠ€r1¦èH™Ñ…ôfJ€AŠŒ0!ñXF, šCBP,B oÀ ‚ 2áÁ ğé#ePA1’àK ]6M0Ù#H À¸0B°†¬ŠƒÚ…
 ^ÅŠ„K2Äk@*²²xHJ,„""˜5$C!D<4 DÂ"pÄ—R( ĞÅ¡!Ç•ÀÑ°ÏğŒ®†JB’E6h€>7@	„Œñ¨BÂÄ5AÙ`‰Q(`/È	IåPQ$»‚M@˜5±FF6&˜D0 s9ì„ ë°B0'È®‘œ”"„C„ 1B:şŒpv1ûQÈ8B ÉÙ…Â€§@Q*I ‘6pä@ æ
"€ÔjöÀÑ4ó @#$ÀJÚ+#I p°’’"Â¨ ¥rÈpÎ(!]*( €€ bÀ[	8 àJd¨!)g	¸1h#Äµ"1`ÈDQŠ¨! X
Ê¥&4È@"P¢%+È j a‚B5©J¿p!/C£À	K‘ %²Xw’Cƒ0Ù`*6+QAb’Õn8sL¤6¦£0Œdh$¿b (3Õ¾¡-<  †`3p²xC‰D ¢‰ÄAÄÔÈN©–hó¤Dèìö ŠøElĞÆ@zà°ª|ôÂV&©²ˆ@Gl	$†¶År%lÑÀV%È ¤¢AD  €P.8Œ†!¦8R ÄãbPpNè˜È(4æR(‹ØÒÄHˆI‘ş ‡‚Á¡°V#DÊRèQ	À€, Ã¬Í®- XAˆ´´*b(,P‹’A"2 ĞÎ€PITA« I" È 2HëÁ
ŠØOµ
E H¢†pB(B<	 ÀijÓA$-ÀrŒØ¡\ğ“
ÓQ±ƒ¢Ä@	v@bdC°`lb¹PPE@‘R€¬ 6  .ƒA ¦5FD€r„tŠÀFäp äa	• ZˆÄ hğ	5$ğ€¨bI¹X°äI :r¢¨N Ñ‡á„ `¢@ˆ°À©q	x£”•0Æ€ [c0ÀØ	À¡¨€¸Ä&FÓ	APDqFhA3(EÁ0	dxÁšI±¸–`°M3‰R81CpC ˆÈvÀ €AN°F‚ª0Ç †Œ #    (=8D(pĞh°x€<¥ D0A±æE„ˆ€Qá ¨ˆĞrP	Yä4)&˜BS ø	Õ2c0Øˆ’3@YÀIC’´ˆ¡¶%A7b~a L]Z=	Å”ˆ^·d:p!Q	H @+@¤
DJ Hİ&ªXJ$ELP  l„‚HHAƒr™@XÅĞ¶•h@ºÀqF€ &+0€ˆ4á ¬« `„ ÀÀ‚`(ˆ@ä]@\fÁ”“V“%’%™©’ÊT]é¸‘–¦‘\ˆÂÅV8Ø¡f „0H"’rÏs²« w,QÂÖ• Œ@"C& ('thA— ˆFd 0"D=-%º<B Á ˆ´KÑ¦4¨DÿP0	¡4w¢	B™ÁQÀZ± p¡‚&
5‚0]‡-„Ğ‹ØĞ(" ƒ e!€Z  ¨’€Cğ˜:ˆŠÑ| ñ¢‘ P ` üA`€8 ª³Ê„ìZD!“D BLl—à áHTI¡0…Êd1Íƒb`‹A &4ª
BĞ‚ˆ¢Âˆ€‹0À€ÊAõ"9ç
…eaíĞW¦¢K@"=P w
äÁ@@!Ar¶Ğ,<¦
pÒ\ˆN`E¨#¡dÆ €01¤w€sçÄF°É¡Pä‰‚ “dDB•‹¥$#"p =h|C @#p0ì	Ä1‡©q: ,`+8*¬“Q"L#`hp„ÏGğ'@'›'hI`dÄ²PEh
*°"DAHª(@S`¢]¤xÄm€C$´Q'²QDt@‘3Q*À0à ‡L‚JaÀ
hƒğÈ E’!–KĞ"ˆp|Àq edÀ6Ğ£@ØÏ8 {" ‚€E†ˆ	PˆÊÅÀ5X@ ¤ÀEÌ >œÒ.(dè"
(dÁƒZ%M¤$@C†äJØÂ­Ì@1!Á	»aàYt "©(«ƒ	w,„$GH˜@õĞ

(À‚Ø,P L. eòÂWL™QP L6A/qÀJ€ªSğè]
€leU!‚^†IÀÖ 
å%€¾ÄTD fˆÙÍˆ0Ä2š!@¼(Œ0‰j±b€ "Àğ‘Ø`XºÀ” à‘ùÀ!hC‰¨„*/	R @„C€)¸ ˆdĞ àK²º&$ d¡XBa À	’
Ä"$ˆ
beb$ 
R äÒNC!ó‘• „0Ä\&2Áa°1†")€š*Iœ Äš€I2	â+´Ê% 
¤½aƒ€%"ÀPå )@±0¤	­$P â‘’š‰
Ho@@ó ãZ )YUĞLU€† b¤  ˆ5@0ˆ9 LFÀc–@@@LŒ¼ 8ŠÁ C4•øô6;¤È°N‘P€!r	ª|) Ša¨)ôB™1*‚9 Y 8ÖOê%¬‡@'g†[@
 ’€ Fü<@ÕÂÎ 4ˆ½€ ¤hoXF%¬ÀN ŠØ¸G‚‚bAa«U‘Dp…’©H	hÅjVïp“ƒŒŒ›
¼@2D«D@²l%IÀ¡ø€-5ì@bÈ„fçË "A‰	 ª‹‚m9ŠD !äàI@ <@Oq3Œ4@ø 	HQ°«@ ‰Œˆ@à"DàDR À` H@ˆ@  B À€…‘°€Š	€
Ä •f	Â‚3Ë¡	ˆ ä@À¹A >ƒ%Ñ¨†º2?ˆ C xÒ‚9iiÖa²”wgY »Œm‰F1W`
4"$T.™ ôÑA…l¡E /‚Q+W0†ò ùà½	IY™Ğu U²[*‰¥=Ç5<}D…FÀÓ@háçñ0D£Ä )€C ±C8lÓ¿"mÃXƒÀõó%\P#Rš
ƒ¡5aE â[Õfe6vx8`›¤2ğY±Ô^Å8€FŠb´,„Eå† &}    	¼PğğÍÒ-0@Á' „`‰ÁŒ`[`,	4B`@ª °Q’Ğ1€8
Qe B“>Ch@
„aB–  @ÊáØAa‹ĞP 
\&+A f„`)a¹B°¬*«)E„LÂl*E¡ÁÉ¬‚‹@€( „ªâz÷aB„Ğ8l0ŒK0¹|M‚
°Ò‹€¦Ô„ÈR`ƒ!¨€Z…JX  "†A¸
]E»c@:"¤'s˜ø 
C´äƒñD)Ø S‡oB‹{Ğ G"8à°¨¡Áv¡r’ FÔM®B,0™M E@CEBB  ŠS b,$Ò ‚( (4ROŒA€â H&v‹G ÂA „®D‰ÆâD B ÍË@@)xš†¹	ˆ
™º© Â H «$€P‚`ÈP"D  A "”©U €P ‘¢ @!œ !JğX@
NÊ Èb”ê•‡iô¢Œt:€]0( *)Œá½ ‚¦Èh$@QAS 1@EPU
Ô„0ø$¡Ä[K J„	$HšAn@p  -‰e X"2!Ä QP‡(@¦]€(`%‰Ä@A¡`‚«"ÉÙ@Š(	ö°@"„Ò4¡œrA# †1„¹0  Áª[€"²Æ­ ÈI0‰¦ bÆ NƒzÆW“Á€‚0 ˜p	ÉP•”áC¨ ÀƒÀL `Q(DEQS1P´ğ!@’V €^!*œZÉBU€ï¬P’R–×O@"HBB¡æ„ PI˜TsÁ¸ Éqƒ ‚EOÀPPÃ©0Bh.‚N ÁM%   _4¬ . Š@–¨«0‚àˆbP†I˜!@aÀ D†˜Ğ+ 8Ä jA  ( + Œ
ıÆBb)ƒJHxDeLx0‚ˆ8F E£jå`P³D &XŒõ"F`1(4Á DQjœs GÂ#!WĞ&Ü/¥ J9[ *Ø@|a‡!4Oe1  ( ‘€%+VU N1~À€¬b*{ÚØÀØñ	ˆÄ»€ªiÑZÈpÑ© º(•y €0„ DƒÈA 0
€z#2…Bc&©#¢€&E8FÒ X  ›@
!ÀÅŠà 4¹3ğ²X0èpI¨€(ƒ
”È’Bm0Uq‚‚BÄ˜9f±­\94a °nª6L `v¹H@*À@ŒJ"ˆR­' Ğ­•. Q3¨$d$ \³ ¬0D€ÀÌJ± Yh¥FĞ"H®  A%¨A	 
@PYM°é .ƒx"P ¤HÀP‘°
 „=™¦Ê`p-$ç@f
s$V *€ +@bä`@ê™² a„–@Éø @#Ë:P &ã ÎWÀ8å’!ìfDu2C“@¨„©C° (Œ BHT–N´$]Z),ˆ‘­	w E1`• ‰¤	 [Dlt0€Æ,I°‘ÏdZè)è“B A €ÏD¢‰ÛŠ5)  L P¨
@X P
 $Rã„²aPUGó°hTìÎP³&P@I¦Àc w-„&ƒ¬P  Q"â(© ­ä^!H"ĞD˜VŞ ‘@@[
!	èá0WF!-)AP¢‚Dè•\@´Ü ­œQmŒ² —”¡D0‚€Š’ å<@˜ $ ]RÈ`¹€( QÀD‡€ Ä)Ae	kÁ‚dÀ€Hğ‰ @`¡IP"‹Yƒ   ‰-"IDOOÂ( a0ÒŸ p±€{î!  € ƒ˜ á+À…"6  ø<Bö¦° xhr”c$(@q°­‚3@ À ² ¦!€è	ˆ. G` 1dB7¸Â„³°d%h!–¸£Ğ‚8”Œ>n+ÈŠ¸@„Tš‘ÁgÑP‡Ñ'†i	`YMÏ*"­€ ¨	ñ€!H êÁC‰ˆ@’ƒ ‰;d‡˜Œ'´UYEt‚©AF	
_Í-#5 ˆä4 ì370Dá, º È@˜A•„8Q"Ğ›E†Dpä]È Pª€É‚€ "±à*êBÄŒ4@‰v„I†#¦`’ AîJ5	“áRÀ# ‰å$N D i€EC‚5 Œ‚ ` 4 %xä5¡$b z	Â :Š`ø9`\@cqÌ¢êq¨B 
0@  “£Q@0q–#v €
 }²&`ù*`pÔd!—W¦M$v`Ñ` ‹&µ.x )UG2`¸ 8Ú°&‚¸@(°b–`QÀ€FN ¹ˆ„GÀ€¶ÂBV?±Dˆ†#ƒ	1hÈ%FË·Ò%pD€ ‚ĞñpBgÉ 'CÔ±
ˆ  (‘B„(ã¢É™ì2”Æ1
d @$LàÉcD ÓD6©08V’H`¨À¨¡K$!
,BÒ€¤´Â ƒ#WC„€.Ÿ`ÈÄ Àˆ  iH àTˆ€O@¸.RdÁt0ˆñd‹áÓm¿XÀÀæÕ ú$y#&a¦HP] D ¤	‘´8`’rp° !1$  ÚcïŒ[Ù  ´LB‘Ä  A$ä˜C2ÅX§8=ÑTj!aˆ ‚ò"/<“¥‚3•0İ0 æIqi µP€¡‚gVÈ¸yI6¥`L¨	GÀ À™ Fº$ €0‚Xé“02@˜á%Š   A`OD8•€:B#HJ(u Ø j,| Œ”’‚qğ …S (5 Tc@@JAè	ˆ´˜EÁÄ‚ğ°CbvR…‰¥Œ’d8hU¦Ğ ©@8 0
@ *5,14( «ƒXb‰ ))Sê °@ „€‹&	€0¿ ²¤G
"ªA‚A`C€à` ´J	 °!
PpÑ xB3—ˆaĞ)’ŠÜH¹ƒ¨WÆDÈ€z"«}Ğ¢qÊI–1PA„BR"@PÈ©v|R`I@¡ I„K V`A7q;‚ ÒI€4VaEìÑA“M`¸6’!hÆĞ2›r/b7 ±r€«  °…€&#¬¨A‰h–0‹¡‹aAS€:F€„&ï ¢ƒà™ \ĞQUÔ D œ´@  À†X¨nÁ`
‚wA(¦~"  §01ˆ=@‘@H $0¢ˆä@dØ@‹‰'™Fp…¡€¢H©Äˆ8­€JÁ ´ –I	<2¡ 0€’ ` *)yJK
hAAˆè0…e’'º{Å’²‚PO,ŒQ#‘6Jª x ¹"Ú &‹!R‚HW9ªÍÂÜE¯M“'PñşQ*`zÂê+0}$Ù:Crb  vƒ=IƒZ+%B%NA€£Pğ	’„˜‡"@¢ ¶Ç@ƒ¦‚&¡qVAL@€j„ DH2‚"E •)#À£ˆÀ’’h€™ ƒ<"{$
5l¥€¢ t„@)¤*)L€©€9œˆQ `†Ä ÕA¹ LIÀªX…ÃŠã8@X\ ‹âê<Í €²dÄ ‰8B0@8æ^Fè(@ #PHhbTB"S`4³Ä‰£YBT‘]p`†ZD˜gU0;BÈC˜JoƒP"†	JPĞ´`š «£’4 ¬(B@ÅP%Œ€J -P¨Ls@T—L˜@bö€à†TÈDDàB¥Àˆ!9 †0 Ö"®]q°
È–XÑ‚Rˆ¹Q ,›0N@ ¢ g´•1$"R¡À #HÀ…bB   €a$!B(± 	 €&	ÁB¡²:¦ìd° È#{"	 
Ã¨Mb‘Š…†%€V  C  ¥s¤:DÉÃ4B êâ’bël 9Á=‡©ˆÈ0H(ÇÊ
Gªš«%Æà ,f ©°Åj0’Š+Ñ‚¨ƒ³P±a@(PiĞH
Q€ §
!@’QÀaQˆÄ0’„ö P€D ÒA&"‡!^… à8È-rƒC ‘(JXÁ,   "–X € €è 2dÀU Gö ™$«Ë’Z±(q @f"’abR¤X A$Ø@d>V(Ä"0‘ œP¤r`sR	şÔ  D1ré†S F/âJ@ŒàĞD 	#"¡‚’BB²@	S”0`/È	–ş¨Ì˜at0<!¢`&ZCb,$#!a¤’ 9ÙA‘
º#a¨A•!Ø	ˆD† ‘  U H †  0N¡„5@ÂHth)ƒ…*õ’ô‰éŒ8$@	`›%Â@h€L $€vÆ@`@ƒ
ĞDktmPÊ2PŠQa—XB%€]1rŠªŒ&ƒ[MP”PL:0 †e@aB€X¢ŒP>‚²02Y{Y	p‰)ˆvc@‚$¤Dã !B`üB ÀâDCá )àWÊ	Ñàâ@d:"”öøEN€dğV«D ¤‚eH J`LÀ¦bNPb€
Y` %(" )e §†B¢X€$94
@9@8’
t)é°QolPHCS(&¡`ƒ
PxS4Æv@	’HŒ¥á6ş½ ”'Q%`(Ã–ä, üˆ¢êíbÀlUˆ	V LxdbƒÈiH&‚<&2’Œ½H Ğ€$A2 £B2™ $ ’Æ€=h‰ÔI1@x^Å8†Fğ°HƒêQMiÈ"°JX î"BP
02H(€ A¨‡ö*A”°†CqCK)GÀ(”e"°²döOún‰óW† Nîé¦q‚44– hnÂ èõ`I ,+)Ñ€Ñ.C 	\ƒK	¡d‘åÆ
'àU$@ÀDîà ƒÀ,jRö‚B‡ 4‹FxA B@@ˆİˆ«	e‚ Œ œ CF ˜$”ádA@A°<PV4	 À `š6È°,è1B ½ôCà–G@ Pa€!‹§ZÁ$  “\Th (-0éåPÀÄ¢t@A€2 E€½
 aX¤`–4 D†øÅ  @
âŠAAoB@€8†©”D„•Œ h Â˜€Œâ Ià	„×†T ˆÏÎ B€¦XK0”BÌRT (±BH d 5 @qB Dˆ9‰# .L¨  …€Á
 g] 4Å~E/J”:qƒ!(`:“Ú
äÄªBy±€*`DVda$€1ÈÔ'Vx„P	˜!ÊL^0Š±M”u¡„üáµ fPAr´k=1(Z) ¡Q€(ĞÀ‚Âj	¢4I¢‚€U „Ö0‚> Å$q‰TO€ wDR &… §×8†D h°EŠrˆ€ŒĞN +zRh	À¶" 	 ˜T
f (J§‘ğYœC ‚@T’DG4)I$‚`f€¨,(ŒØ€9R©	03PWÒWAB‚¡PÑPˆÒ&*F £cE$@ĞH.dHk“1ƒh;(B€†¨¢	é!B–A¡-Ø  ’bÀß±ËrRARGĞŒ àÃW¯àR€D  YIˆ‘à   'Ê"@ƒÌÉXG``S-j°±cÅ‰7•@ b!• 3mh€¬E$ã b!êZP¨ÈP@äHPÈ! %¡(H
–„¤5/gp>‹¶”bƒ˜1êƒ!ˆ.ûŒ†DCT@
²"À;È#4[VÀc»4b‘ ’  ÂÂŠp»º  JÔÔ4$ 2;:2tl 6.@ `áüŞ¥¡Ğ$ À
EÂ¨@$2(SD à† -	%D@(Õ( ’80B "˜‡(X àÑ‚(@µ@GP@Ò P
 `D%aB!*j 	°6·5 0à%€ D( P†  J*=!0ÌIÉDâK Šˆ"QY!Œ P  Š5@Â	
¨„@D‡AID€’¨ˆ( „"I €nÀd ŸL`Da bÀ¨ É)¡Ä8È0•áXàŒDIŠ“H„¢J°µ‚‹,uÀ6$J1¶‰7É‰Ñ3@eI²€š 3aÊB
A 1&S£@ ­Q³ƒJ€FS`‰  *4k	Œ lŒ‚°dúÈE1DaL©E"iˆ4µ ”(ôÄ‚@r"0%Â! Å€`p ‚D ê4E²BÄF“R‡á  E ùĞDŠ•¾ÒBüb #3†‘ëMhšÄäE˜A(€š ÁÑ@[Ëˆ–bpŠb°%`:. )
§`¤GHåtFp‰9wè¥„¡0¥*EÁcÜHô ¬`iÌ\Œ
L-!m„2!$ƒ0Í†A!Hº¡"gœC!MC@Ee¡¢àD€B@ –2@B"EF‘@E 2‚1 ¨´`…‚Y8í„_6L(DA±HÈ-€# T„ Ää£àXC@’ È1R KÑQ 
•À bÀH0$ï¡Œ Dd¬ˆ,ô…†,DJGí4c ad©P7"kl@ú÷3¨ÿ¢$€¶ ¡,˜Ü2d! 0ip¢‹pÕÌÜ(MÀc(#@@–A¤U@2X0–ò« 	ß@Ù$Áğ˜¬Ø)xÖ€W„«(æ  2D.ÉR2.B0‚¸(1"„‚¥€	“° €8Ğ$ ±$Gœpj@0Á°i Á0#„hH( !ÃÓ8àÀ@`ƒXÒ ÙÉB0(BT2,€ `Ë	RE„ 2•(àššP`C‰ˆ^#ËÈĞ¡<˜1’.)n XñÍ ”BA’$rŠáA
€P  ``r€@Ñ– X   *Ë”Ñ$  dH!0!Åp*Ä@„äD€+06@S‹à`ĞÊâˆ`äR‘ÑÉ—-EÑÎĞ&HŠLq‰EbX—!‚#@`aP	¡B$`Du
Q˜î`Dª¤0%Äc$Ü±(\*„›Bm²-ã… ÄAE	êÌVB ôÀOà4ğ’åÚ¬ K ‚@¥1 šfp	’3A0á‚…€ˆJfn¥h% `‘HxFA¢ @)Bâ* Ñ„ä¢Š,† "À.@¥E ºÖ³‚@Š4L €ğEÄ ‚hràX ˆÀ R€S=0P¨€!TA=”@“"È	@¥ à2…D„ig j’Jä †Q0lp(ÊÈ ".QYM`Ä¶rØ`7T1ıEH	ìÕjˆ‘% Ì" ß†¾BÀeˆBR"8e8‰3'‚b²k IM¢"S´Ø™B@ØŒäˆ
@ ¨ğâ Pa‚c8AaO³„">‚Ó˜ƒ€4w.’”T"Å…<`ğŠÈkÓ0¨Zc„:DÍ,JO€	¾l3Ë’
pĞĞ 	Ê@](å Á1Rñ­İ·üÕ\C”F†	oÍ$Ğ8Pk(,
ÑGÈ!@ãŠà" P	Ú‚@€²
 …€Ê£Í¦ˆ0‡Åˆ""è-"~ƒDĞêË¤Î€Ğ  ¤H Üj‡…R±ò&‚‚Ğ +!… šBYÀ 0
ÁPŒ	ÀŒ 8$B< `5 
Á ’ W¦NàDE‡U
¢	 
ò5’ Ô¦KÊšKÀ‚Ñ@(pB± ° p@ ş šÜá¼' !@I ,ŸY‘K@*œÀA!
%1
à‚D@SX@Z‘1 °
DCP/ S8«8‰j ›“ĞRB"fÀ\Ã‰EPÂ@ ¶H%hpCA Ã¢À…˜©  Ap @     @9‚dqW0„¤`dhC°¬à@ G@€©Ğğ"sÄŞâ(’¥EÙŠp‘B@d$ œà
´À-ŒÀ€$( > €±´êêè’° "¤,¨ôB I† !P2¦ DÃa €	TŒ  ˆP.€N”œ"[!† ‚1± YDTB
Œ  ¤À€“ğ ¤°Á€ÌÀQ)<m GL+) €OW¿	CË€`…A Ààh`äè $J°htY+ ñŒÚüás„ @
g 	gŒp.VX ¯¨g idÓ"€¨' Ğ“²ê…‘  ¤ˆ¯"ÖqE°ÊÈ‚0°F‡² € È@fib‚Õˆaˆ0¬Pˆˆ’4 ‚°FÉZ#œØE„€PÈ3H ƒğ €LÃ $„ô˜&ò”
®†£¨ä˜@MŞ¹I@"”@ú±ØB˜‡ˆ 0$ %(²td´@@ŠÀ5Cb Šæ· Œ@1†ˆ,ÔÀ ¢Ö„„¥@8U"f‰Šˆ@•‚i ¡˜4Å0%  R£#‚ˆF³‡ˆ… )x ªE"°ĞAs 
1*4 „D@¸­D¦êÂC"ŒH !	…¨’ ¤“‡Å€"2RI°"éjÍBÀ8q‡…Â’!ˆP	D`¶e {°^G5° ¬4uØ@É)ÖƒĞ  ANA(B`mL¢À@DóÙN¢ˆêBàŠ&ä†DQ˜‚`0èh ˆ"øĞ¨ì062 IŠÀâ# ËD¡™Ñ,Aˆ€D€0%Ï"¡€2#¶	0@O À“‰¶r„à‰ !`u:ÈŠaXA°`0B!ÎbÚ±@ÏÂ>0È ªˆQ×€ 5Á  *ñÄPp€Œ @P… D„„qRAŠˆĞ'8TECBÄÄH âNBà$ °+ÂÜö „p  PÈy  @(;™ ŒˆcJ á.L `’áYè$)	 	ÄR DÂ f›cƒG(™H@  J¯vŒ=cˆ
¢`¥@>pi FDbD€aŠ(”GEÂ2@Q“ÇÑMSÑ”¨±"S ’  ‚’ -%ñYp< &•‡$ğ pH“,A DØpH$p”R¸IéH ˆ„A ”B[ ¨%š7"' ©I‚¢U`Vò C„@DER‰P@Pˆ&Q¨( p¨Å— V…<°8@ IbÍ‰à`	nA §eFqG¨€H0Šbˆ$S@
ÀÀ¨ $¢AĞÃ_{À‰  šˆ®Éä¡-9 ›,è¢ƒ¤@¨CH"#`tF"ZXŞ%(iZ8QE$¢	 ¨4‘b Â!0e@T@B#‰J Ì1_¬¦Ñ aèZJ!¼€Ô$,A°€Ğ°¦Ğ4Ğ’¨‘†.
!Á)›¬ÂJV"" œâˆĞB€”Â9Ú¤ĞÁ!§˜’"Ø¢j©ˆH€(Î…äSà6#‚” …ßcÆ¢ˆ©ª¾N‹B£hğQV’ ¢!DÁD¢¡°’Éié¬	)Hy‰µĞ©cXÀd0E0L	L 1*
ŠÄ&„….°L‰$ª‘a(gÍ	ÙGÈÄ€˜ ` Dt Ê`)    DYøAƒK$0T aZ"€ !^‚
U €iP3RŒˆcM0W#Á¦1UÀ	¥ÁP V $ÁNàÓ aĞ†È—ÕÂMd’À–„`ÑVÌ Çx8Eß š£Å:	‚– P2 ) ¸ ¬ŒHº‘Œ€d$R¡DDçR'Ä•BRwRÀa†uAFDPFK  SÕ‡àã€2 d†¤H†€‰nNÍÀ%×T•BI)Î²Ó¡‡ğ7+ ‰ÜÀ6bVOU˜ºâ±‚€€l2‚+ ¬”‰RAC'Dr0d 0AØâpI‰6H*G`“ dEléD	·Ô&0*¨Š¨Ö€ %”– @FbŒĞ Ú„ Bà8xN! ,ÊÁ#D6 €KÂh ı¢ DÍ8 Ã@sP„h¨Ä ÂV×¨ @BÆ «…è0°‚(à
 p\€¤H ‚hĞƒ“„ ŠÈl‚Æä)ñ +XB4 ¡¨l2 €¡”á9ˆ/ÂE$¡DZOŒÄ·*E€* ˆ&`H“D† P„ D$-ql‹µI@ÁÍP– Sd$"-¢£ ‚R£òÓµÀæ”!áŠ/$Æ6.b8Ğ,!aÅ'†U‡€uo%J0WQ°— •J4@	! (-A$VYÂ:  `)W¡	Øè5l!EƒH¨Afİ(jŒÄĞs ²0¨H•X6(A€`‘„ •a€I Ê¤>C(X0%!,¤¨ ¤d$ @12Ã@Ä» ĞA1µ	
$”&Q„ºDäRpÀQ%@¡ „	·‰C¸¢â80 ¦ˆ€b#Æ„P¡7¨ 7¡˜^³B i€« ÄèA
ÇA
]`ğ…%€€šŒâhh¡ÂY—@@cÂ‚0 ˜X 2a%D6‚ FÈ)¸ª¦0s¨A¨ UÀàDDÑ" èüÈ>1 T,â@!*èÅ9&ğ˜‚Å
.‚
P,BF&Pt'¤ÀPq*È?ôÃÀ18¤°'" Pd	%Õx¤ U°î$ÀD€U7R‰E8 4  â ”­!³³tÏ üBš”7à.+Ã€™øÀ@­óT ).	ä&U(T¥Ò %€*ŒÄƒDA|@ ÒµA &HÀ °!˜9(1¼… : &Š‘f¶“*•
P+_#XÀ «F‡ĞPĞ“ˆ¶#`@†à(²ˆ0*0–-J‹¿šÈXx
™Ä9P8·,		@İ(Œ .…
D!A@
°Hœ€0%ĞD* °8
U@À"€€¤@ @!7(  eàQoH!H¡ ‚#úfÆPV`@LàI 8šœ¤ƒÁÓ‚D’"&„’ÃŒˆIAjéÀ) @±°€¤È€"ª !é$Â„úhøSe¬ xˆ2Hˆ €¬º@ óîDè¬+F€¸ÈRc¢Q *`Â8ƒ°  bC`€ƒ Àt’ÀŒPĞB„˜‚ª°*² ş¨ˆÌˆ$\ˆƒ À QÜm–ˆ‰å/g(„€JÁI U9Â4#äA ¡€Œ PD"Š­0h LÆ “Á2aP"y&BILªPEˆÍPÈ¤aÚa!àÔ „ô BiH}A¦€çà RD <
D¤ÁS"ˆ£`¢¢PŸlñ+S$=BEÄÇæà$­|Dâ9¼ ±áÒA…Ï$Š™‰D"f@SVˆUE` äX–‰D9ÇM$6€úFÉƒ
šÿ „Â,

©ˆA†X¦‚*1pB‘p A’"º0™ PĞ,á0Z:„ AĞ8 0b:‘	ªğÀ2$I¨¡ ‚Ñ…B4
šr¼$@„àÆˆpÚÀB„¡d%2t@%ÓğÂN+D DÃ@*¢$ \:¶ÁÔ „˜ŒÒ3ç#Ñ ğp“a S‚ÖÔ FR sØò` R0ÄL	ş&±	TÈĞnA–åK.†Ä¨ DùÀ 3L  @sğ ,	€™	SpXÃ_‰ôBNe
P”€J€ù¾¤)ŠÁ¢°PËêKL"MaŠ%\+NpÔbH8àÉ„c¤h’‘öåÒÃ"š|‰G€ 
  ˆ  ”*dÉ!³*†Pá xÔ@¢DJtˆ¹'š¢!ˆŒb­°-f2Ò=ŒÅ Æ(@‚d&ˆxƒ`HĞW‰¨	m"¨ÁYµˆzEafğ„Àª°	ÃÀ¡t€@-(À¸D-’„@°D€ª$ ‚^% ˆ
P»¡D¯!° a<“ÛÈ Ín)" ’PI5 k#a-PT\‚°ÎC—A\P!§†TÀ …8t8SĞÁ(aC¢ëY¡ 3NÄ
0Ñp€È"™@‘ pÂº„U1C3²Â@™~¢‚dB!%‘ˆ¤@®*p°@ †‘
[D„ HïA
C $•„¤¸á€‹,$¢€	E‘„(@¼  ä2ÒbGe¥ œ0J€!y J Z ´$"¤ˆ† BA¤ ¤q	¡ˆh@â2À@”şÛ9 ‰!­*° ‚„À ,BA¸N(‰ƒ €AP
 ¦£5WÒ@6Ã(Pd„‚Ø É 	P‚ >Î÷‰$€a…&€Aèd·–A–™0FqˆÚLÙ0 ò¬		AxCuqd	
?, !‚Àà»(%CPša=˜…2Œ ’ƒN ˆ"ä ›!¨¨ğÉPƒ%j‘ ğ1†©d:P7Ö0 `ğ§(0 Ô)¨H¢áV‚4†@€ÔxhÃ0@	Ñ€$¬P	Ğ ¸ !_=QìÕD +d	Ş"€ ŒĞ„€† Q¨  D ¢r¤0€Àp«	.ƒ¡Í& j©†‚D€˜Íˆ‘
m` × h9İLj‚@À¡™5 ]—á 	b<šIØ qPšD\øàœÿ” B €
NÒÑ‚hB³è—I{!ŠCÔ¢„]FŞ"8„ÈB±ğ€¤Y!<Â¦èÀ…R)"À>À
(4PÌÓ¤Ò	‚Ø0D£ ¡:FKIa„ÀEDHÇ9!baBJOD
I Î6D3Ì‚ /I @¡Ä>…„-¸@¡2@Xac˜5ƒ0ä<Ğ°(W@:JA‹P#Ğb" D¬2T@Ò‘Và“]ÒR†¸½CB@¢Bô‚ÕH¨)@Hæ©X&€0ƒ`ì‘ÕÀƒó‚T1ƒ-l) j¨°Š•0BhL\XCSd €.’!ÒGœXÇ¢	ƒµ2„ ‚à‘p¶‚˜ ‚$^Ê B(™U@‚KHd‚lÅ¥&ÉM¥@D €H  !h¿h 0HBõ*‚!YdJ`9€ˆ&PÄùŸB< S (ƒUˆ ¨Á…©‘xá%0ppØ0£C"xº1`D°4Pl d€à  ¦@Á•±E†, m $`‚!ğÀ© –,c„È0™—àĞw„‘gñ¡¨iÀMÁ ¨°†( € ä´5À0! F°â4L5S(¬Œ@L® !¬…J… d‘ÄÅ‚]@*  ÀôŠÀÒ@$)6ØHFÁ‰ 8â8B$ H˜ËbÔI*Œâ’<€ Ü‚ : ¨‰€ ä¢†n„
¤v ÈJ@Ğ€&pR 0Dº‚P+1$Ñk¤[ØˆÀ’>T€>2ˆN°c°„BUb.ğB,Vr‹ „Ö„‚h4wK€a6e(F"£ P˜ÙÀ€hA¯A	)€bc 92)pVp¢‘&Â8˜”° ¨ P9âE6
NAh2œÂ‘Y4‹¡@A sæÂÅŠ&Bè[²]!ÂA¡*&E…ˆ.rÈ!A`âğÀNzHèD.UÒF¦ƒéq FZ l¿‰Ti@I%£$Ñ(Å0%Æ0ÓSPÙ
 @&B )Âƒ"¾ŠÁ„j"AÅ2Aˆ!Ä…£ADØ€$	4È ˆ+(J hV€„„„¼æØIa(XCØd@0H,”†ØÈBÍà ²° ³€1Y :Ã°ÀmLb ¥! ¾aˆä0T2D%9B€I¨  $‘%*#ÿIAdØõ±$±+ ğ …H†Â*^E$¶^‹ Å¸Ì!Š!‰©D«Ô€ ""º¼  hAG*@â €èÅĞ"T"&A1rµ]–CE©@ S¡Q(D0(D!@H =¢1%¸ÊĞC d§BŒG}
DAhèR@‚ ¤ƒ …$ Å AyUÀR‹¬apÉh+ „L¸6i‚’…E
t’N"$Ã’ív¡E+-9!0!Âoaˆ J0š!PĞc€P1ABåP€©XP @J”4@9 Æ¢ÔBAÄpš"( ˆáš‚( (a„0¸.„›Á‡4†  FpÃ ™%J’DI#Õ4éÒ€@ M˜D]ĞD*@Í@àa“Ö¸ÒôD@Dp Œ ,‚0 $,ôÊ¡(Å BCÙPI¨$˜D6ƒæBXl‰rÒ ÑJ° £t1Dˆ ‡y&H0‘Ô0€H@¶4 e	ZR ¤ ÁT% C)jıÀ‰@"ˆjD±NBR8™B¨~70a,T8™r«8t9¼Óg0:‚6’€¢UN)x‘p< Ácå „QERBcà8œ
¨ILSä{±ÆÑÃ
@$˜ àŒÀ ° @ne°ÈP@b@(–õñ„ä@0 d) èÅ¨’	"œ LÎ€F•€à"§Ã¦óğ.f" Ç#¼p‰qÀEP,†y”HÄ@ºD~ 6qjHUÀd¡ %‚`C[wÜSÔ $ÊP±G@qh¸P 	/:šP …’ °(˜æìK”¨˜IH(iJãgD˜R2ÕĞw À‚˜ñ† <€¢CÀ” & ,ƒ1Õ'ÂÆN„L< 4¢ ïà@Ä°¾ZP Ÿyb&Fex(vØu«‡˜œ‰…Kàbƒ  Dè€¤
%@¤Adb ¶…ÈĞ PDA›$(4„‚AC5À±ÁUİ@D¹ˆ`
 PDH‡‘mLïG-,B,AŠ…D¡
MLÓÀII£–CS™¹#µ (8$X.¼  €
¨„-P•°ˆ"@P8A@ "H20† À 5R:€|! d$D À €’€Á ˆú{IÁZ €À R¡‰‹-J@G@&› Gq‚"5ÄV$H†¨$Ì 6áD0”R0
hï€àÀ8¡*DÀã€r pŒ0&h”e
„2PCƒ "„ EIèL€¨˜°”#ĞD7]É Èœ"4ô 0fD0!@Á‹üÊwƒMU†p@"” éæ ÓM0Bdà  TÎ¸=Ì ´"â˜ØœMPRµ­iT'H2ƒƒJŠ–À› ùL½NQŒFÕ"‚‘Ë†¢ŒÀ†p|@tZ‡"mäY@!)ÑÊ Ğè> B8èTVğ 8’kPV’(¡ +2VP€$¹…a"T$% ²‡I C“(A^N€R h
p$3@™”±"–0‡M”Q{‚Ğ
×$äÙrŸPÇA–A)Š©‚FC˜ ŠœàØ4ª #,*ğ%`
Œ@( œ°Q€‡J,€
˜İ" å…ƒ„òßôWvÿŞÿøîÊïøQûcÚşß-Óÿëƒô¦ÌÈkúMöİ¾×Ç¥ôï|¿Ñş6¿¶¬^½ÏËDß»±ó¶é÷ş¼Ößó÷»·—ë÷^½¿Wı¿oiğ¿oúõé«¥§ÿÿşKOİÖßßÙÜê{ÔŞöëÓW'»«CVéİ£µ{ûÎ{j’åg¶w¢¿ö?ÿ·Óÿ}íMÆ~ğ_ò¶Wö¯o™½5­ùŸ…ı~OïÖ8Ÿõ4´¿<—¶ı³µ·Ùãg_áÃŠÖÁ/ù¾¶{¿İßÿßãÿ†şMÿçŞcdïİ_½ÛÌ;òİ¯-ô5Ïıãòù÷ßï·ºşs'{OŞ¯÷ç7·70¹î´üÜ÷»nøõk²—^É_ú.ô;Æ^c÷ÿ€ßæè…ße»Ïjğ¿êz/£+F¿ŞuÍ¶ÇiÔÜ	úŸŸÅ½;jŞx×~iü=T“ÿßÇ>?!¿ÿºy?ö[ÜÍç¼nŞÚÄósÉæş|uÿå¿ßÛÊrŞûíŸÚgGAÿïf—TÖ—ûÔ%Ü–ßN…½=7¿¯û.oö¾ùÏ_›?×û5÷{¡6ïâıÿ>óo3‹úÛzÖœ¿ì^Î÷õ·/=¾Ïû»Ù2úLç;íöÆæÚ½~ï—Æyûµ:ËÛı]ßçÇ}¿k£=]Uof«gß}ñÚïêïº47[şÿÛ"-[ß¹ô×]İ¿_W×_Rÿÿï
Ÿç.‰WûÍş|×?ıkH¸ÿún÷<ÿ’Tûoÿ8×Oİ}N«lÜRÜÔ—mñ÷‰lıÑtßÙ2mı³µÊÖ‰jåğß]S¾£ße÷qôúÇÅàOGì%f5°“M¿ü}ßû›g…ıŞ‡ª¾÷ÛmLfeî»÷ãUøW_¼Ÿ'ùËx­şÃ¿Ÿ3mbWşç/ÿ¹ù>ıüGûR×_.ï×¾Ş«Oú?âV~ÿ#÷ŸÚwtÑÚ¢Šôş÷ş×çx]§êÍá¿Ğbù×ÿÓ[ÿÛ§Ÿu×ñj¡¾ï.«Ø]T~]²x¾®ÍşúËşêç¥b«æ–·­øg…İî¯}õÎø¿zöß¿³Ôíşì{o3İóînãïŸŞy¯½Ú¶Lñ«ï*uëÿ}ïÜõŞ{ıÓ×ÿêÿç{œ¢ı}™ß?¯ı=uşIEÕ½ñ«ş[¶9Ó×·×òş+U[£ß«‘í¾¬Çßûë_ıã—÷¾;wÜ© ÑìËŒñ[Ïü{ÚûÇ'&ĞîµW­(IÎf¾ã_oïş&’9ÿµç½ûì?÷»®»ÍP}3¥Îï{ô«:×İ!ûâÔÌggIÎßŒÿ×{»åœTöû+8YÔÿÎ§û}kãìz—êĞ]ÏNó{ï›0İÈ`Ñõ4úq§Ö¯Ñ*X[¦6÷ÕW7~ÓEífõüøÏä»–l{ç?U»Vï9µÄÙ‡9W³§Ñ·>6ù¿=¹ú~¸á¼="ë¿{µŞÿü¸ß½¹oüßÿ—ÿ÷8Êxwo÷¢¶ÿõçâ¿¾¯÷N‰à›¿æõ.7ó}Z¿Ÿ{îç{c™k}Îô	ßËÿ?İ³ïÿ\¯)¿ÿå§ïj—~¿z½ÿä–‰ÏøŞ£ıõJû~~u|kÿû§íİ³¼wêWíîgóÄµæË­G¼CÎ?ê³wå³îôï}ı}×öÌw´Óÿ6³rŠËŞ4úÏİ5ì}:ÙŠ0ğÎ?3Ow.Œî/Uû·¿¾İ·Ş›ÿ[­üÑq}j^ß}ù×Ûöwû§ôçu®¶3¿¾¼¦ıÿõ¹¹ôÇç-ÿwì,ÿŞ–z^ş÷[é5÷î—×{?ì«1û\s¿’OöR]—>4÷|{©1?/{óí_oÇätÏ»Z§Q’o/Qkf`ŞrŸ»¥ÿ5‹Ö*>Ğ¾aßXôd—¶:‹Óî—¾ş¶×kû;ûÖQçVWqßÖ}Ïş®?³ò¾ÛŞ–¿/ûçÿOöåÖ³ûğC÷şÖÿÓ}_\ı‘×
j©OÃ!¹ÿ~êŠ?ƒqŸ÷ÿjgßÿúşã^û¼şÓ—7_ÒÿşãİÙŞsãŸ|{¿Õ½kşnûæ[ç>s®·İoóyûrŞóå{úû_@¡.o~Ú~5¦|qØl•Ú'ğé¡kõ9ï®¶îê;ÎoÔ÷T+m'r?§{tÏö÷ë–^mæï÷:ÿc^§_§+ûk=…®où¾“viç»yÛª[Ü¦µí¾¸S¶şkŸwç_9hguíÓ¯¯|nr¿ÚltÚíÒø»ø_×·åÔµ–w[{&•øVı»o¹ÿıÙC}gJŸí8Ş]÷VÏ7·<Übı‡¾*Ÿÿ‘¿¹ë—j÷9–û]÷ò|Ä/Ë÷RÛ>şï[>yùÿ|ø¶ú{®õÔŞókÿàºôï:õş’o»zæßö±ş¿×ÿúïŞ¿~‰oÿÙrÿ¹ì3÷ïç¿®ö¾íºØ÷ıÙ%îÿº|†õ÷¯LûXïkmŞğOÔ\F×—;¡úıuS
Á¯WNï¾UG¿ï?¯İô¿ÿ/òyşşüÚô—eÛ-=ˆ5övï÷÷î›ªÿrŞïóîß".=O~™¿îç±øËÇLÎz±_Ô·ÚmYgö»Àp»ËW‘ßşòóã«í;E­ïùéWôµÏï^ïßÖÕışËu­ÿm×^XşûåwOì?
ß>ïéU¿ìW’óúo÷vÆ‚îÜº_æ…‘Nûíûñ+s£÷t×Ìİ]º®ò6ôsñyÖ0ß÷yÍªzÔş2×Wüg¯[oÏÁ¸^v|î÷ô«şoşï~OÔï÷ñ÷jıóÃMÛß{3¿÷¿¾¤¿]½üÌ=q}y/%î]ï÷G¹óğıüoå·ù<ßåİ½ÿç¾·¯µùáçîŸÿñöı×+|×«¾ô8ÿ³æ·Ëï~ôñ¼ìô_|î¿ƒñSï³üÏøõ*ÿ¾ÿjÏ¥ûòş§UeöÍ®|sş¹¿¸Øq	›fÉö q4ûöÓZ¼3åÿïñÿ¥s¯eS÷ÿÖOÿ÷‰Æÿ9ØOo{£ş?ñ}Šßë­í"¹[oÅY£­Á¿÷æNW^b<æïôåığÇ]÷¶môêZióÛ´¦Â°/[w·©çïûs®­Bö¿¼¾şâİÏı¥İLì#½È?ôøWÛ/EIæ»æ,şã•;ÅÖäÇóOÓ®ãy‘?Û‡ÿšOØ½ßÑüæ¦r¿}ùv®0¬°şo÷&Y|¿wGÿG–¿y¼÷İ¿şô·¶ÿîå¶1)?eâù‰2ÇÈßK÷ïooùãò{s§¦r»êş¿ÿ¿?fùĞÿßÿ—ŞÚ6÷…sïßŸæ®Ş¶›õ-×/¿ü¿Ï·×÷]İ_¾î½Ûê5ıÎŸşœçän’ş×n}u·ÿ¿ä?}¾oM÷³Ï¸şÇÓ·Œ?—éTÈºóŞûw}Ó»¯ç³Ípû]±OZşókköŞëßÚş“ÿXÎ—õSówİåg·´sŠ½ÿ)tÿÈœ-l©½³—İyÿç{K¬ù»±³¾õµï·ø¾ü;½9ãa¿xøİ‰Òá:Û»ÛSS;&İøŠ_ÇQÎôÏ;IB)Kïú¾qÃ.ı©ïÚú¯3ÑoZİ_Öç÷All²6ï'e9Çó·Ÿ%.í³ş#ôF~ÿ»ÇMkïÿûõÎşË÷3÷sış™Ôê+ıÓ_ßşó‡ï¸×“½§¯ïıß¸vw³«åş2{{9›Og¾ÿıîŸ+ÿ>nŸŞû¿ø^Çîë?ßü¿õãùôKş|æ·—wwíó·—wøŸ·«õŸÓíö×Òïlù{ş]şùù¼oï¶_ğ{uKma«¿w[Üg—¿şÿt«øúÿïıèõ­¯éúš½ûlñí¿íôní{|ÿôÏùş¡¥ŞÏm{ğî™œş¯Vùí¾ü‹Wòû¶Ó÷?·îş•³ıßõ¾¿úãé`âs¯¾e—Òí¿‹¶7^räÿ;ı÷*òiïÜ¿oóşıí{Ö{;?¾,÷´œ£µ4`öÔ3½¤¿».Zÿ3ÿ;86?ö=şÇã·§ç:ç'ñhßöÿw¼|Û»>İï"·Ïäÿ­İß¹Q™ñO”vö™ãô˜ŸäË”3‡yÔq5ıÕÒ*Jÿ'§9¦#}µó¯Ù­x3Ò?Ëu÷çùOÂ¯æßÅ¿•3¸ş©?ÆşqÜçíµé–ï^½õ¿µİ<3Ä›Z<æûû^ûmŞ¢ÏÇIóüÓeŒï¹©.şÍãªV¿wzÏİ©íş·ƒ÷ş¹Êé~?¿ÿg}öo¹ñùı}Tvëµ±ùn†måSd¯ïüêÏ»Ó×ç÷Ÿ|Œ,î¾vßa9‹øtÉÓG»äZÿíîï×Úùçû¥ûüö¿~œıwQ÷¬T•ÓBs|ÅŞ1×¶E´~ß‹¼„s÷Ûoæ3ø¤SüZİÇŞk-åô‡ÿ!v5Íßæví§±ïºæ¶4hGõÿoÿ±ÿãnÒ‡w¿™ë×é¿õõĞ±¬İöÿßaÿZgÜ«–m§¥7æ¯ıøÓ¯ï]9Lğò-§éKÊ7²<MîızÎoïœ_ÚşÛ‡Ç²W·½³ğßxnóßíßV¹ûç'ÿ¯çKöOÏWo3Mã{»ıÿùÇrÓË¾}?×ò·Ûÿ¾ï¾_ø±O»úğÓ½MíKræ:¿×ö™Îx“†Æ»¿ßîk¯ó¥Úƒ^ooÏ¡ûç³Öß-ıöÃccÿËû¿ußõøÅß=µ¯ºç¼}ßëwkˆA¿ÿ?Ó»Çïû7{êß&ØóŸs­{-#õ>ŞóŞ­ßŒ¯ÿÏ K­{+¦qİÿı»Öì¿ÌÖ[ù¢çe_³¹¹Gÿ·ûÎ©Ö¯»{¿v¾mßıE÷ú·†·÷¯ù{»ıƒÛaŞÛûêG»+zü|OûŞnÿ›îıo¨8”J÷ãøáûıxZ{~—_Ÿıqß÷ß;k·íÏV{½4öVW÷®ú®îÏ{r~xuôKèØõé¿êd¡·‡×¿÷\ºg¶ÿ;º÷¦ÖÙı-³ÿéù¿×Âj“çg_~ô‹¿ö÷“ı|_(/ÒkØeş_7œî9÷•­Kï½sÏÿÑï¿ëâ¯wçÿ‹ôşKş×ş—zòŸ&¡ ûÿ~»¿¿©è·ë6ı³¿Í:ö¿àuß2›ıî÷Ü¯ñÌßüİÆÓıß«êıé$fÕ]Ğ¼éúºÌÿ·ï÷ß±ßW5kóÖšñéw~Ö×ù[ÿÉıŞËæ^¿~ÁÿT•rvËİ½Ümí¹qù:÷—÷r›$Úéø÷v›îÆ|ùøw7GùzQ·=ï· ïKÿ‡âÆ÷¶.Â`—ÚÿåíŠİWÿÖü÷í^}çÚşû¿¸¿ê¿´O¿ş¿Á‚¾¯¡x×_7EW+Qşzw6ûr¹’»ü¹ĞñCö3º÷ÂÛïnüì*;§ùùW5Ï¾›tÙdÕ"ğ·§÷vp¯íï™÷İşÔÖæ¦Ÿ~ÿõûó§cYÿYe÷åÈ«ï›úO§v-ÛîóÏöïßdĞşíÕä—gù.ÿ÷ÌßŞ|ÎÎ„ü9İï»Ìÿ}ş«Vsòkùå÷ŸÖïÿğ}^İ¾Şğ(Ê€ÔFƒä¨Œh$‚š¼ …)ˆKI0H i AÓ8¨ $Tt	`R``à @ü@{L€‚ N (˜ÅÂÀH7À  »’²!8 "d D)I
æ[‚1 €Èˆ(ÀP€&L.`&Ğ· ÀE¨ ƒàoG)I8¯}%«¿yÿZûâ3?É9­?ï:ãïv~şïÿ§e»^öÛcn—gó†™›6d\ïö÷çy®Î/mß«ä'¶kåsuÒ%µwwsåıÉÿ­mşÔĞyKÏÜîãß÷îçß¯úcß}míÿ¶şÿ÷æ[ş¹íºÏ¶íw·ÚÌcÙ¹ÿ?qÜÓÿİ…©ŞŸ]=èıÙz˜‘õ:÷Îõóı­¾$Q÷Ì´Ó~ş¿œ=ÿÒ9ƒJ)~·îëòõ?˜ø_sßZú=İÿ± ?´†åİ¹®‰‘Š~æô‹oíŒs=³-Ë®››íl­÷{>›aç÷Õ¼Ó›ÏwåÃm¿?xRüŸÑ»3İ„@  ±¥2á€šÜ -ÒCĞ>ƒ %€‚«_ÀD¬¹àºD4D!Ñ*V,BhB A d)bF$€tK
 4@Œèğ bh¢%„œ$Ô@	(&D¼ C-È‘AJ„@	1dÈ$S€€À €eÂ£€EjàøÃgöc¯¯{¾ŞèöŸîmñ‡c.¤¤¾D÷ËLì¢³¿Ï7áÜ|éößW¼Ín{ï{sı÷÷¦v+ÆµkËïÿnù°ò+¥ı×u>å»6jÔ¿Ÿ÷©Êõ°ÿwO?Ór¼³ıÚv/õ?æûîú:«^÷mö–T6n¾ßõ˜òmS»HL5¡¤™€€˜ 	 rÊ%Ø@‚al…daB†B ÒIZ €‚ á¹­R>Eğ‡Pd_ c"0rS	
 x;¾iG@9 €”­€¿ ¢@0’„ÁEhä.F4  @ @‚V.@ c@–æ	€›B‚hˆ de`‡Ò@À	M`…3(' °›	!À r (E„cT<–BÎ`„pA
:Q„B#”B‚
+Hp‘Ä`!‚);A\²>p0 ˆ"ğ àE!‹HS PFÒ 2pê­Ø˜œ;%@¸DŸ ›™w°»)ÉõÚm1÷ÖŸ˜¾@'íÔ{[éiüÕüÏMß)ÿBİ(ñW›Ï6Û6v«{M-ŸÓÊımDïÏUëFÿûI}l8|¼[Û¤”ŸßëéÛ{E²÷|şºìgì-	¿îÛÉ·mõ»İØvjÓ‡µõÿ´;çVt¥Îş"ıú_Œæ$%)*&K„€ØÏV¸Æ3‚Ã¹„),ø)Ü€ƒ€ fF80$ I
<À0P
3< "¹EB
Áxì¡ ˆ0 ËrğDì0¤@N™4‡Ä”$L„¡¥ãl.‘è	D#O…¨$b„  ¡f¶@¡¸+1iÒ|å¬şİÌ>:w?tëş³–ı<ÿÖÿ3ö‘lºô;jÍşÖ]×şı÷PÿjNç¾U•óşõ¾òL¿Sü_ÿ):2ŸQå§ÿ Ïâ§öëÛíÖ\ümñ/;½ÿÿ\¿d–×£²>Óù5?ÏƒÙû±ñ*œßı¿ÿ<üéÿ_˜ûkş±Ú?ïêßÇŞ~wGşD½×¨[ûÊæÊp‡?óÿ§¿Æ1·ëíaİİ¬±Û¥ÿóúó•“nïó­Ùã$s¯cæ¯úôaÚÅù¹ÑzÏ?â,Øí˜‡Ï¾Ÿ7¶mv÷ßÇ¢Šçwı¯é¾è»ù÷±<E¶Óo¹yâ$YÎ·Š¾±[İÜ:q=7î{ÒöVò#…€l0ˆ”J%V†`ÄXa0ŠR A	x¦
 ‚¥(,Âğ
 †/€À‘Â
H	` ´lZ1p8df2v É€0Ã¸Èğ4 ”å‡
,ëĞpPÉS$…Ì1IúlÄL(¼ìˆB€%è3@ïhşg«òæz	âfMå­Sk8[ÛEĞÿõƒşÿ×$/sşyÎŞÌsÛ[µ=·küßVü:yœÓÛ²õßİmû_şşşÒØ•ïù·ù7:Üİµúz¬¿uïÒŸ÷¨Îµæ¹­mGİ:«¿ùänéşq¹²óÜÑ¡ìık¿ï¨sâï²WÙÿÿÿ E5@R½’¨  x)$€(3²‘‘ „LBü  ‚®! ¢£' ‡Åf’ /€E¹€	 ÍT†‘$¥X€lªÁ@FCäB!ğ€YD$ €°, EÀ!\²@("À@ ™¬ØMƒA"%gb@
ƒÀ"àÁ@ÖğLM$,ĞŠ¸D	J! CP A	Xä¢™á ­£U4§h°2@tÎDàEPq¬ySD
€Ù6/"$@á äX(p> àeØb¡!ªˆH‚´„&< l¸‚Â%Ö$°ŒĞ ¥²( ˜(€´?V·êßZ5_Ççr}èäóŸouyªÚw}€?ó*ÚòüÙÎÏªäæ·¿;Ë†{ìÚ°5[¨ÍŞ£å!Ïv\şàÿ4~‹ßµ1ı+I}'·–x-ö'}üä³è£×İÎ»«ywZ8şNîOÖÍõ7àû­
ÓÿkFô¥ ÏH ì 	ÀÑ„H@: •€€€) Mdƒè4¸`®>‹È‚L•Heˆˆá PZ#@"ˆ#£Û*¶S$-¾‚P£˜XêXÈŒ~@E!Ê !¡8€  †¡N|¹‚¢0ÀA¤`Š³çÏ¶íùUİÕ¢ù
_6#ÿÁw÷«Ì¬7O°Ïôg}M;,~œ·êÇoökó7G­‡>~Å¿=ü7Ü|ï½'ª¯v5§ó»ÕB®Û½—ıô÷p‹/æ×ô¿Ï’Ïê¿ıÓ÷ÿÙü¥·¶«ùSÿı®-óUcsÕ›kDë¿‘çnvoÛslÎËr•o­J–•|Eàÿ÷ë\@võ]‚ÌÏ/7V±ûô³ê¤Ü}ÏÚZ-/çï|	g®ÈŸç“ÛÆ>¡úâ»o_tHŸ§n¶ıÿnÏ¹¾v­ızûÊ#ê}†e»vä~•»/¶xıyù>õ^±c½›ß³–²ûº™æº7cü¿ÓÔrí¹ù}İ6ÍBÌ(j™¤E1y–D	ËJÖ˜èäA€PÇÛe°[@ÌŠĞ0@P  À†€Œƒ¸…`0Œ! €ÀÎ€@°Yd‚@Ô&%µd	@28L(@ ÀF@ ‡åDVx 
(@šRŠcbÁ6ûï4S²ø·z¡É¿æÂö"ıy¯Ù»ú‡…4Ù°ÒŸü_±§ªOÒHœf²WH{ùÿó·îûyíÛs÷Ş=í‡¶53ç÷ùõ¨êŞY”¢»ıwiüŸø/µBpu·üo÷¿ÖÍ¼ıc_é¿Z¬Ì]ı¸¿_>ä•_ùóõuv×Zo~QI@B‚PAAğLK 1X„!R'.°$-CA D<23E2%¢Â9	Ácâ€B•‰
	­ 8 ¨E/PTŠØBfL @‚RAHO„ZĞ ¸ªJ$1$€Å&IÔ@  	””B`
Tè¨!¹(…A¼''J1+Œ ZB4@€=ĞÜbLãd$j "2ƒ F	‚° 1€Å‹ºCH <‚ A°BL I8‘(€GFˆ(pĞd (AäaD !˜˜<Œ ˜)dDD(D¢KHÇd{åWí³÷›ÌÅ\î§Å×Ò/Xs.õÊöı`íµ”ú‹kŠvV·mÜÓë[ø|½}å¼ø¹çe·_å¯ÃöBç~/ı÷şÓî¹å‡©G÷æúûÿ®­õ—>ÓÑëã¿Mî…âÿ¼«ÿ—¾~y×÷éÎß!üğÜh·öóîç»}üùûİlö ˜!(… 62@<È.ê€„’4B…„’”‚b ’T	ÄD ‘DàF
ƒ2„ ¨²‡P0AQ8Rvc¦HAd¤MÂD„ ¡‰qG8 FFr"2Ô± œ)ÀHp\T•fRà"Yé(˜‰)mİĞŸèÓí´Ä×½Û™Ê?ÿ·j££Å/·Ïwÿ¯ÇûK?&|¼¨ızVÕ½n­«ìİÃt–é˜Ïú¿ò}¿½{ïœœ[m~Ùößô­¿ıÿ¥¦ô.ş'Ÿ²soçÚ
ı~GŸ÷	·|yaLÓÙîÕàóØ\c½­ıßW7‡N¹ßvïZyÉ=¼[÷¿tLÑ8Ÿ=FuúûÑµ´3]ş}ïóuõ_Ÿ/Ìšê	şÓ«GaÅt
æÍ`ÙãåmïUrµwøÛıÆêõ_iõñú~µ~Õzzë–Ê~ÊœYÿ?\¿}»V‚×ë†f>·ósvÎ}·±—†F¾Ï¿Í"rD` ÁÁ
f4@)‘hÏşy 0„‘á8„FàBÓĞ(’lF@p?^
¨J€2p€@„-„ä®'M§a@€r©È)å%„Â` ˜PÁ5‰ GV!á("¹%
8G“~jgí§÷°ˆ¯gcøíä3ı‡÷¥åJ½›Hƒï=Ö­kßö¥ê3Û:^æ|eùz¯‡«¿÷»_R}ºßõ¼,FÿİÜ¥W÷}ı»î¼fúy›)¸ıœGoôïîÔ)»óõüŸÕÏÜ
TMÙçV]İÃ¿Ã›ùŠEVÏûÏßÎı®KO°„HˆˆD@ D„ €_B$¹ óHp“01Ñ!@ÂCc(2/¦e	c@.“(O  ÚÁ¬÷`­EÁN àë Q¢	 m)Fw`ŠB) 5ŠHQ"Âp†Pƒ"6Iò@*0f€%„ 8«>VP @ Ö8ŒaO@†4	B!Jg	!=€ˆ BEzÃæ{ZAš1Ğ `Š	(ƒL4²a˜)(dÃ<Z’ğJ4¤$ÄBÀÉ(&d ÓXÊJx•Å
Hx¤‚˜Ğ0,Cup£äRĞ†úë (@ èBAV‰$ÿ”ù~õ7Íıu¹ÿªú“­\öõæYÎÿº>¿¿×’ù¿m®ô#{÷İ¯ÿ>ëÓ÷uÛ|6ıŒ+ß¶®VşºËvœVSòsgÛwªç¶y·Êşš¼>ô•wîi;÷?ÿÍı‘½ßoíUÕİ½¼©|GÏ³‹_fıOç»½Çå“¦–³>Ï~    ı²˜íıu
şV~6kàwÎ	™ßq9ş·Éí½şÆw|ï›<ë‹ÿ³™=>@<«ì\¯V»ş›OÎÿ3=Şêoş#ÎŸÎëmwoó=^WŸ¾Î¯s&÷÷^íî_‡_¯óû¤µqº%îËO6%rÿßö ½ºŠ-û®ú5gŸ?\¡’@†Pˆ#0á
¾0Ä‚¬ZÀDR-a9C Í0
1Åà€!™´ÈÌĞ &  x &‰H!‰3´dàÀdkA k!LŠ‚Š$ 1J(2$€ ¨š‰€@ YP‰ñ‹
ğ	BHA¬b20CP*4‚Ê„ #PK¢C”‹‡¦”`R6Z4À	@éà°Q‚`"B+Y:H%`€|ŠC…* QÉ(q&‚“B f(è2‚
TEŒ!¤ƒÁÈ‘à„ªƒ€ùÊp€b‹} 
Ö  hTMû—±½>ŸÚ ÎÌ7ñêñïç÷·¿_®ióÅ³ÿ³·’ûe¶6­õ¯ÆêçDŸŸj4}mW¯ÿ=Ë¿Î­â¼ü¯—s7İSuÒıo{7ÒeÿöüôEïx^ÇÿızWßbh7ÛÆ3|wYûü·ã‚{[iÆfïŸp/û]5Ô—i‡ø’€ˆ 
”TR(4 Afd¾ğrÄ#€:,BDÙ	¡$ZAF* ‘
Tt$ À«^Û¢$	 ‘Bƒ@£ 3‡,V Í&Øò ô€…"‚	 8d@	‰gD ™ v€	ˆ œ]ºuM¾[¾:eÿ[Y»{õ÷©yí½w»í¨ğßÓ¶†-Ú¢öÖÕîl©Û¿’œúG¯ÍŞóWKà~ïIÕ¾Ü/>¾¾{ûùÿ]º®0ÿÖ¹®][ô§oÿ–è¬àÿŒóÕßÆ¸TéÑu/â÷ãòŞâüeál-ÿ?Ç»vsàïê>+’\g+‘|Ô
cc4?¦rïn“Oí¾şG>Ó¾¯~Ï,Ü>°ßóÎÆÜíÙıEƒş_ÃŸOÿ§İşR…ë†Ş_ã½éı(Û‰|ñÿö__/ì–?ÉåßâŞ¦¾§~şùïV·şİ÷){ïé÷önW×ñãĞÛÏ¯º•|*Â6 Œ±O²
 43Œ^	
%@5 ‰¤™$0pƒ „6 JH†èØ‰(†ÕD	( 'D#€Lˆø!Š ˆCµ`
PÀ€’ÒˆÁªpÚYY\  ÀÈ8 Š”D4N ¢3ÔŒğÀ, ‚ô$ÄLPƒÿçßÕÿ|ÛŸ¡Ç=m:ã~ïx‡Óıìç/ëıt,gzÿ2'x!›Óş²½¥‹>vş˜Ùh~2aáüñÚëÖG^dÍèkûÿïŸ|ÕõV&Î×_x	d[_î™/‰oßn³<îòŞÈ>}ëÿôµ'LŸ-£óøõ&Ooot-P½?-ÄŠy8MDCwES T¨£X DL‰9ˆ™@mBÃNÆxs	Äx5"Rº-QIjŒÒûèh	`P‘‚ g@@Ø"£P å±¡ Ñ@`ƒ„ ¤„ƒ80Ø   dŒ˜àg‹&„BŒ@ 9
  H(	Ã#A(Y*Fz+4*F1`)%ÑL‡>ĞšÈÂÊˆ©åÕ `JŠQM®q’ " É^ #¾å¡…º@"Å@BIĞËîCJ€  >Ğ˜29™F¬2`A%"øbNˆ `€r¢õëö5?‰}xş¯‹·ãûİßŞ?íËö„>WZÏ‡ï¿§ı*š6c[Ş·¯›ª«wWµ[ğôér‡˜û®_á»ÉÜÇÇûçÿı¾*ÿéñ?¾×·—ÿ:÷v<ïõV­”?ßúŸ¦ô½r?Şæ—¾Ÿcµ.ŸuÅ"øßw7÷<¶~Ú{Km÷×ô­@v`xÒôHPnH@ 0AN“ `‰ ƒsB Ë¢	Å`X€$€ètB„\  0D)Â¡‹`+  €X’À#ËIZ³`€F%ŠHç…±©HŠ RÓ" P«@@P #DøD¥\ı`t í¢åëúÍ‹GAŸìÚf:Ü-B·Üw¶İ›¬Çõõ6/íıg¯õÜÏNÓåš»¤Æ×G:yŸ·Ÿ÷ıÙÿh—üüÿN±o3wÖÏ÷~D˜Í­ÕN§İ?sı=‚™oWºt—¿šgÿ²ÍóË÷ÿÅ_W#Ø–>2ÿŞÈ¤^‚†¼`G›u÷ıßí~?ØwRë×Vöáš³ÿy¹{}Ş{Z6ªúAïvûÿxô¼qå¯gı?ş Îñ,Kşiª÷ï·.S7Ÿõ_ÿ³ıü/÷ïë°^_ÛÙÖ2õPæ-ÚıÃü÷şİì Úç÷×}8äç£«sOßwñóÏ¾şñíW}éé2kÉ­Ãßİ}T'l.I	9ˆ\ÁB1ynô’’”Å ¸TEA`v	 D3d¦*" -Ö€~.FÈ0€ ”“†„„0 1@â
$lI$ •PÁ@<,8Ì„É (À@*€¨ˆ€† t D £–è ^üÍcÎoy4EfÙ$}|E¼åÿ[û÷ºûŞ^×Vÿ?µúØ'?ÿ¢Ö~öüÎdæâQìö	§Ü¯İksCÿcœÇ6×Ïş¹nÙ¼ní· úï»ä÷x¯¢¿İw™ö×[İÒâx]Šy¹ëùü¯›™İê®øÿçãÿÉül±—¡X 	 8@"™¢”@ÏØX	 €SA‘J(Š¤H†† j!-m‹#6Ñª LˆZÈƒK˜*¨’š ¹˜Uˆ’‚ @~™¨ÉJ$T4á	‚•B p@B$²P!FXVAp€ Ø•8’Ù!$!NMR x`›€ŠJQ^<ÂfÂ0
JaTÀ 
“ p@EÉ AZäÔ! ,`#0@p` 2vàS° TœÅS¢ÊM³  ²ÕQŒ€1
D€ËQ)à!+Pb¢u	‚€§ P¸
TdÆïğ7kë_ÿÖórÖM}¯ùÎÿ[ÙÙûÙ_ZtË3ğÅótèb ÿ¨ÜİuË¶øìî³}Íğ—h¹yß=¾mó.¯Àx_ße×qâÛşxçöl>ıÛUÜo—<ğíj—É»oÚ ·¾Ãèo®ïóş-{÷õ”÷öüÖô;«+’,PA… M D‰<€ÀLB7D–TVÈ œÄ ±	¨¿È„
  8¬“HÎ¡År½„Y	B„AFL‰H°üf˜/¨úQ$ 	€°¤• !4°A…@&m¡ jğ”ï¾6;ßşsşâmú\_ì·×ûé)V¾ß_$wy—7ZÇoÖßß(ÿvŞÏ½ÿ¶ÖjµşµóïyÛ°f?Çúsg•µo‡Ÿoú¯S¦Ü˜ç#O~û÷“Yx·WHëO=S÷‘ïûŸëÿ¿zğ¿éÿÚë»êÈP¯ïy¹½ÑFGŞú9Ú7yr[÷Kpçß¶ş{m-µ½ ñŞ÷ïÏğ;57PØóßó6G™äeM·ÿzô«ÿ=åÓÉ‘y'ç~ ßÁùvîísÛËS[à,crî´^®nw»×ıìşEË®ıW÷ÿ7åã“ë½6ÿÑø	t_ÿƒŞ3Éµ!ãk¿¨·u¯ıÓoî³³¸¶>^8ˆ‰HHÃt©Da 2P
Hª¦-E% Â5jT$d”  Â™Ğ LàÈP‚B¢$0\`‹¦0 @  ˆ-XT„¸è)²	„H#* Œ
Å@'ú  ·IŠ¬ 0 Sƒi†;P:@
ä‹ß;Ÿÿ9ìöOfÃF¿÷õİ!£úOúŞüòıö÷ïf“Ö­içıüşqşİÓôÇ}ßFM},éÚ
r—ÿ³×o»ÑğUk}ùõwk'·wôï¼µ´ßúÚfg˜çV…æ{Ü³èíkW—SûÜüá«nWÙÿï×¬÷ßomÜ!@`, QQÒàŠUi„ÅëAE¢ •P‰ÃÂ†[F°
BÃ¡ª¢AB~’ '¾‚ 	S   ‚„ Á à@€D}› €Œ0(“x pÑ
°# Q8¨D‘ ZB]Š‡2ˆ°†’¨¦-„€Ÿ@‘Š*§*lH¨%Â1‚DF ‚8J@D1¨Ğé 2‡ÚÒÒä¢ ˜"²€° >‹,ëhJ `Ú:JÑbÂa€À&€Z-D@HDAW `¤‘¥ ¦Rl' ArDR …TZ‚
ÂKJ$ˆUõ_îı8ß§«Ş¸ı—ÏÍG=ï÷S›êw´jû=?=­æWÿ{é-Å«¼¿c÷vn¿?¹Ú‰ÄsOõ³ÿ—eMïE=»Ğâ·{¥ÍÙ"ßìãÌıõ¹·ş?1ßåY_9ÿÇ»‡ÍœŸzK×ìúo»íÿ­AÿkWxøKÿºb{şh¶ÿí£†B¢ˆ!A!¥ÀLå>¦4 D@ eB’    Sã,–@’•3B„=@Ã0C FÙ)DXMN$bAÖ€’*öˆ `Á¡54$Áà@!6Ğ(Ì JIŠQC$€Àq]±M(1p±è€).Îwÿ•]ş?#®ïyüîÀşó-óû›Ó?õ3‹ûş4µîj»š¦ßí}uöL‹oú¾±õö¬¼ûß°¿gVçßÎE½ªÓî^˜wıË4Í¯jíÜZtĞîlmÑ
íjş,—¬•}/“M7ëÿP4íıñk¿®“ã‰»i‡\>VÆéq/no6Ê†çıÍÙi~îš?eöåo¾çaí}½¼9Í÷Ú‚Ímrvw€fÛ×Ö†.²ßÌùö‡iYö·ß¿F/ùïÿÜ½ÿ×nûüEæ÷Õê¦òûoæİ®½ëîdW%ky_µ_s›ò]û)ø²Ö9NşÔógıÿ'³óÓ}&y–×‘&0yC  @€‡tT´  ÒÊU"šL«Â‚¡ŠæEÚ8IÀ¨çŠF2R‘ƒ„@B¤€ŠÀ1ƒJ ¨	Ø•€u	ˆjeâm²4"H!¤O†TK:¸ ’
‰ZŒ@Ò„OeHÃÀÅHƒTd› h ¡Å„±‘ôšíä À@‚£Â‡ñJ· à)Ä `*±XH§;3F='25´ÁE<
²:à#Ğ Ö…–¢ â0 d’”T†”†Š‚4" Š©ğß!°B$ç¨ğ¡†¡† ¢bb‚PG˜ $ˆ\€Š³cÇ"™'CHäŒˆp €>€˜È(X„„$„Å ”`Å™Ô ğÔ	‘Æ&Ø˜‘â0¦€PØL(gn€p‡„Ô  ¼„Ú(T( £P¿B«"B
X¨C¡.BA0áˆ
ì @„0†¸0m0ŒÂî!2Š * P(C-Á@a! €Ğ‘iL	;ÃW"2˜¤&â3™!¡”J€	‚PÂddH¨­ZHDŸÀÄËB€‡¥ŒñªD
‚3CD€È …Šá@z‹ `&‘Ä-hÁDÂ€}P'@P”…ã!ú§~sÕ*ì[èÊW0±H@„"À€	Â	Rµ‘*¨cL¨€v±NBn UÈ*`ƒÉGŒˆtã01R³lP2„Œ²ŠQ0…;¢Y$ğ`›(Í(@!èJ	*|Gˆ °ÈáBh
§0ê3&ğ$ˆ'Ød
 CdƒbDHbˆ‚—`RŞ€€¸Ğ,@„ƒ¤‚A™:
 ˆ6ˆ™qÀJ0 ´0 … %‰ ‚€á	>p!¡Ã5@+Q €C…ÀcÎ E‚–àb€àËÜ³°’“psÁ†cƒ ¨dÆÜ‚• xG®.@T1 ‘@ÀÄÜ´„Å)D9DéAML»Ğ<$00‡	ĞO%­+‘Pñxšº?¦v/§=¥ñDDºMĞUÃfBƒ©Ôhg4Ãºq8ğdBAÕrÂ °	Ñ­80ÇVò—¬D#XEVeQ‚Ağ&ù\Ê‘ƒ$©$A¢D ¼€¤±¶jÆĞâ´ˆó¤(*2âf($
0”TL)S€€ÚRQ" :‚ÍRYØÑdPÈ´Ûš<ˆ¬°…„@vM@2*¸À Â°:¢Ì0¤pE ¹T †Q Ãd”[Hs¨ƒ ƒy@IL€DW Ô@ÔÅˆ€=0$L6 ªÆP @DDYÂtğa©
Î„   ’ƒ®È ¼‘!€P‚àH °p§Ò+ğL@ ©ğu1pÈVÁp"@PŠ¢4`‚3BÅE%k e4bÂR !ğÙŠ-¼0B	=/ÌğAÀ%†äRœ*[
aDĞpp!ô‚DÚèt”›ÇÉ@,‘€aÎuÀÅ;ıO SK™*‡òÎPD²ª …ĞÀL¹¹{  ÀC   „HFC¦EÄìZr¯ c *äÀ$@@tÀÀhPÜ! „Ñªj SˆÄ°Bğ`@™›t8©£z5…`„€¨+è%N —°"‚0°’O¨c†Lj  ;JE´AD!@S!x‹aÅÓ%*9d 5D”àr8ZPQ°QQ€‚ ‰Èˆ "‚!Ùğà4$P'l!‹ğ‚D ÀEtp€(  „Bb0„#¨A ¤÷«$Œi* a— 
8‡„äŞåB7üP¢,%@0`šJH9°Û J9
«™Cç,hyàT¡˜ƒ)ÜôÓ£¤	qnüF’O@8„Øq¦dŒ(2Dh õ_°ŒgMX†à x´	Ba9U É“Ûİ‚iu™a´`€S‘Âu‚i9DB„äÃ U bÑ¢C@@A†(eQOµå!—–¤6( dÁ€sŠ  …ÊHXpÀˆ7“#€B ˜5’” EŠI§C$ ˜ª€ÔyA4`°Q°± ¼Ç!BÕŠ'
È¥0ˆû(YQ$ĞùKÑ6Ş¦`-’ºPá"a´„·„Fœ$¢e%¼Mñ	TdH$*(8X{{ø.& H2![–p @€:
$àázc$ÔOåPp€KØ	“ãQGPÉ-“à ˜µ‰T›A’àäŠBÙœ6t’Š à  S%ËÁF5b
ĞJyE8!XÓŒè¢«=`AWŸ& Å*ND€*! 3D	1)La “*P¢lÌPLOÅ+íÀnÔÄøˆ 0,±ä‚.¸Şeá À ¡Á ¢Œ„¥E‘†D ±CvDE"l–	!]z+ã:Ağ5’;‚hdL  ¦G€ –

‘QH\—iBºE  Á‚`èHW0Åùª&™È›00€°@a Pš(<dÄ
Ö,Nä

ÅøfP*> œŒ‡ÁB‚Ø d Œ)‚ DB­B ¬Ğ# L3"‚pH1ÛĞ8 F¢àB–|'P£(á>"W9 ±½K0¤¸$ñIrŒ!uØ¿>nDH@$Ò‚ Ö›ÔP§`ALi´1¶Z$}Nğ\tnËpºòTÔê¤V	xvÒÉ‡¸²(.œX ¸øÀà DHŠÌ $(H‰#à {& 2Ğ  ®…!¢I
¢’ø	ÀˆÀZÀFp—ÌšÆF8è Ñ0xC,Êxf9!‰8Tşˆãä˜‘
 2iªS@Ğ9AD1­R Ú‘6x%1Z4
ø
h œ Ÿ˜ÊÁ
28üà0	O 0µE™@Y °dF ¦¸€  0‚¦ê Î  / ˜ 8¶<ğ€P‘ è…Gh£Â=Œ €c€(KÈ‚ÒH M”n¬ Ğ\ ‡:jÅÂÒ!tE T…âÙ:Şµ´Éh€dD–A€é­%f¹ADD 9‡ … D#?ƒ1u»'ä 9¢¸N€0K[
Ğ"²=H&H«PÈ¨C1¢PPÙ… ±07"”ACDø%-f¸	‚ ©")e Z"hˆ€9bĞ`Ø€DPpxZÇTTC„Š   ‹ 	&J 	Nä	X
!0 ¥Ğ@2ğD„Å!¬ˆ@DÂÒrhS ğ´²	",I àR¨!Œ1“]i ­Q˜ZÇSP2šA—Á4˜à9J£çÓP‰Az D`T#BD”¯SZ¨æîóá%£AD,8ê.35&E%P”Ã; pm¬(9Jˆˆ‹¶QòàH1Ìà,:b#EæŒA8%9H-‘Á$6_Eg´§ğú6Ï r†ÄÃ”:…]R…,(FC£t  ”qeàÒ”:‘D#[DE',ÀÂGMF 7±¬ıd¬ dBŠ„	Pˆ 7¤«sDq	 PÊg3ÇòÂJ ±€"BDÅ)ó\FA‚@¶ÃPG †ñ!ç¶Á?Pup),¯ \d9Ù-[0¬ïb’ Q@À@,Pbœ Àˆ*1	$ R"ÄÆ”è˜JB(™‹¡Ö¹ 	2cC”@¼)Ğ@ƒ +b`¢¨HDPñ£± 
¸ËÀ<8ŒYø˜Ğ„#€ßA­4f< 6¼D0)  # ±Š ›…'ÃMĞ)$¸À€(*A@ ¤%P¼ğ4J ¢.0TF˜øˆ‘TâtÏBbAkº,‡bÀèi—åQ#+!"ÀŠHá"‘@%&êpE 0±°Sbƒ€‚FœDÂØQÀ çc¹ÀrÀÊ3àYDìÒm	€ ˜¸!0	¢-‚Àµ0ó–@o*D	á& D€BH!„rCÀ
¹pq]•MK©’‹G
.ÉL$5€Ì8Î †  â 	¡¢P˜"Á¨…®!¤Tü†°Ç£!á”	…#$ÁÁ‚EN @BoAÑ  `:%©v0$ÒÄ 
!R¤„B Q" ÔdŸ€#`PB”%ÎÉM\Â Å ‹œS˜–ø"JÔªA¤`óaøš eÂª€’H‡(Ê "xlpK6ƒMa
£¸ °$b‰ÔÂé(E†@`(xúà¡`E,*d€“0
Ê€‘saAœb‚y€°°$ˆD-¡v()Ó¥P%¢¬@‚KO F˜MÔ S6G.Ne¢x\‚‡$£"àîÈ@€ìP— AQ$D1ş'‰& .ƒH‰hˆÀaI
¼EX ei¹ä  Ğ¬³°:ñBŒ1£¡q Q<Õ$DT£$”B@
Ì\ ˜’ˆ´„š´‚C0 AJ#T¸ Ğk 	`A ÀYZ RÂ>öù([Ug„Êe˜JÀğMZÀ™À¶¬? A†,ÆPO«€)`Š ˆ@•âHb6ì@•i
T–Ïğ0d¦u%ÙËg@‘8#=ñ‰Œ\$ eÒˆ‚ 1nT@ i`ÒvÔ(OêS–x%¿AíARfj ‘ñ'EP„ ‹è8Æf¥"+.Øb(æ%$4xÃvx¦"95b¶"%¨•$  ‚3À“|š	"X†FÀQÑŠ•°OP ¢B&å€"ƒ(’„	#Şæ@$…€J¥P 	`@™ùe>²pÁ	N2‚AÁa1ª’`‚ÀğÍ™6‹„¨‰MĞ 8Ç
L ’˜é¾e@¡˜!+	 ‰€X¨”!x  Ğ$€:°†Í ÜàXI-¤0–Ó°@ 	ØA„ÀGÉ º «Ft‘DL‡à|rĞ¨—8`JùU«(Am‚Ğº4‡ OÓP°'à`Ğ#¹„‚§hPâ• ÂDÂ1($6W ´PÁˆ†ˆN0 áˆD¥ N¦8H ZùPšà¢ öR…d…" †Q0@(B£&HÀÑHÖx RÜ!PO ¬2
 0hàxË@ê,ÄGg$‚!* €­`!TĞ.C`aâ©PºD‘81
ƒ`ëÈL&‹PPÑEÌI ôÁã ’  ÂÊDI0 öK”#‚‰Ô`uh–0@pÄ9éÅc`‡Ğ ’(®  © €‹@L(¨JB _PDQ	 ƒñ‡¸ê €á¨!›a µÈ`ë I€H‘mĞ‡İ!¨)ñ)B$P—A dAR& 	¡YÈ¦›“	ı I@…áW¸ d!3Ò7	%häĞ hXBN‡  P% ÂH”ñ5 «Ğ&™À ó¢­¯Ùn@KÒ6¨ €QH|fè¢ACçFÅ@t(€#[Ã 5P@ï*ÒD@UsÀÈ´@€ô3HPBøDI4•A( IŞÅ¤Hƒ°¶J¬eH—Ã– !„äàD„ü`CÌ2`¶Œ;í€E°„  > 9òÂ,H0Ö)¡Ğ0,R4D’ä²‰VHkÜÔŠ‚	‚ Á,Š‚p(ƒ'G¥ (À"	4 Á)"$(AJ”E  ƒEOx b!W‡XÒ€\°‚ P-¥,°+@Æ%VElĞ¤ ]$Ä	q!„l ±6
0º)/ætàòE€‚£
8A„NX-L¬ ğ ¶}à
`˜3a/(œ€U•'8àAÊf&0 ¦¾)6¤Ò!Œ%ÎLÄ„æc$¤¤d ‚q	DZ# ‰]!x*2‹/ ¤¶ (P8Vp‚Eğ L€!,¦, ƒ‚$ ûI¼%¦› ƒ@ªhUi$LÀğ^j£ CARf š°X˜8BH  Dæ1\‹¢,L¥0À€@€/èk^á1œ+ €ÀÀ™(0h`[ĞB€PxˆÈ JÂ6 "Aˆ¦ ‚C!èY B à ™À”¤rH‰ƒ"J€ç€8BCeJcá2A< 7bÒ$^›8 €
’
”€À¸Œ3É"QÈ ª¡
RG±(	ˆÁ@€…`Ö@± IL©„ÛÁ˜Ì€\äóbE*h  à˜YäP%|€€ „oâ€â€ÓÛ! €1
&ş¼Nç	;ˆB,"Ç0ÑÒ"HIkBH/€jáŒB!S‚$AÖš¸H¨»k©„bmÔ  ”8IBB0
àÀ%Õ†0 * ‘öL(Êh4¡´'dÀ‡äP´]©0 à …K@H H@€)İ2"HDÀRê  Db@@n)ñ¹MB§À[Ù Ú	¤[(©£	íª¡
^PÌ q(k0 fP!@àp¸(p ¢dBR£å¬€:üµr¸Lˆ)´À¤ 6 b‡‚ª€È¤3	6 ¨aáG""	ñˆ ,­3¨ˆJPfO3U@ Ó	¢	´„ Q¨qŒH€4‚#¢Ù` G1U€­ ĞÀ%×'„Ş¤5å…o¨%†È~ ZbšP9Ø¡ È5`HÁ¡UAİ›¨N
-JPÖ)¨¡%ù£c~3Œ0HŠ“ÉA–@¦Òç@Š…yÍƒÄ˜ÛGˆbY€PX!“` C¨‡€o@ 2@AÓÄ“ÊH  „ƒ?Q¶€ğ¨Jı@CÚ0 "”D ¹m+$D@‘€HÒItÌ‚èˆ!Açw¦ i”b[ !š„§E!“BCaŒ¢PAvƒQQä9`‚H˜~‰PEÃ
éY´@P!P @0PR$(ª%jLKxf,˜"D…ğFk E¡@iò`¤K1µ%¨ç\  3*è¤Åƒp0¬ğÆ  ÅaŒÉ°‚Š!Àè 2€@òŠq
.ì,1Æ¼B %D$èPHÌ”¨†,…” ”ÁTÑ ˆa"ÉhØP 6@ß€fDÄ7&€& ÀN
N<Ä€sÀ°m AU$…—æœ‘2’Ö'E Y#C‡ Ä ,Ä<`PBdBlAv6P@ vTÈ@RøE§e I¡!SŞ†ÛP |44QÉÒ€@"K@”(GÊÃ@¨â @ÁÀİ@”„‘ÑK ±ÙÀ
ƒ`Q±Ò"¡äŒ¨Ë`ÒPâ ÂÌ„À|X‚ù
ƒ±0`M€HhhR\+`9r  $"!¬0e› å(ˆ :€™a
‚`H¸Daé 5J†´ «	A@àÂ²#
A4†@ˆ `N8 Ì!  IÀ)@™È›
R
9c™êÀr4ÊÎD~cVê•@« ÌA¦Z3 BXf 
Kq°%"°È¡Ú¢j.IRo6‹ €0†RĞ&e‰ß@W‘Œ“Óõ{@PTY 4¤˜`À–D‚'F@À RD)Hƒ"à(ˆé u  •ôD ĞP‰¤(Æ± uÑ @ñ †W9Ì•	‚F&,p@.å†Œ’¢¼ä€(e¢Hˆ@´‚‰%Pà2ÒH9br ¬bu(Ê%C`@à¸fPŒŠ–d ¡d
8	`4P¥IX×â<P5@ ‚¥(€p¢$¥àà¢Ä Àb„€PR"À§
áH„ƒ`
Ğ€
 ‡(èÄ h)ÈA$(„€ñ
4‘O  @ê¼=$Y2ÆD
„W`¹w3Ä26ò-ğ‹)],nXĞ›“¥w¸lÈÍX’`§-)ÏŞU,0³‚¢ 1†I‚nä-Ò0€ÈD!H¼	 lãPÁÄ]YrÑ B$`ì,6& @ç©| Á~BÂ,`B…CJa…€BÈQ (&v2sl¸ƒ@0# äXSx‚¶ G4  \‰Ñ˜ {ĞR*ä2$š¨ "f„fM…©À8É:@9C ‘ ¸’2 °²z ¤%€ Á'
ˆ  	Ø8JR9ú€ ÚˆQ%¥J@X°²¡ƒd* Ë‘0ÂR?#î‘ƒ‚ 	4§x.ÇÒ'Çd“AJH *‘òæMÀ
 µ$F(S‚'S='%6
ŠaÊ¢RÅ8h‚µ¸¦]¨`%”Q¼©@ƒ$/Ÿˆ†mÁ‡¥P€*TÀbøØ¦a ]Àá²E$ÂX ‰¸C6€ f~`JAÂTJäÆmpB¸§àÅàÅt8D ETb×À]òI'!@AYŠğˆ¥3T >e  ÎeT«¹ am¥Í„{± 	ğ µ& ¬¢aóCD 0‚£Î˜iQ@HB`z>`dŠĞ˜j%ÕšÁHK`4‡ a‚p€A 5' `˜€ø0À™r€ò(A®1¼ªM#€ÀG•PtĞ½‹S$` 1@6€]@@B€Ãœüã0¡˜+À#`¨h¸"D0Ä“¥3 ŞÛ	µĞlš)NĞ9°CJixhUN†H Á N+(f`ÖRñ vğ0q
±Cşâ³F¦„8 n€fD$‘nRŒ@9B` €B˜ƒË ˆ§PsÀö!ÔÑR(áç)ğ€Y  *ÎÂĞÀ¦ °	R×ĞFt‰„d@$ tÌ	pòì—‰€­ .•/ÖÆ‰ é„‘R!À¥À# ‚’DÂ$ Á ‹*œ1@ ¢€¡"¼' Ğ¨ E ‡"Z 4²‰é!ğ!R@D"ñ¤(|
P‚Â Šh†…°E	!ì€q1 ĞÎ€ˆ¥< 
.{–Ó»aJâÅD °Qš•pTì¸€:& ’ 4<ˆ•@ÀĞ!	
Š¢$Tä½¼…R`U!q) DÂ˜B
lP€‡ ÇNMA´f EĞ"P¤$‚
)‹!A˜ğ$8Ó&aÖƒ
%  E´1è +@í,=ğ¢PA¹˜B Ùb§(’ˆ4¦¾ÑÒú#¥ø	ë%6—¢Q .êP. ‡£cÜdëpF„£XÀp™0‚$ IDts‡×p“& —•
ÚzR „ÀyÄxQ‹0
IPb` RÒ¨	¡ÄÀâ(HE„ÂœB2 [Â¯€% €0 	 ° $Áˆ4ˆ	QA°Ab´€8˜™  ¢ˆ;H†BtTƒ€-@
%ô¹^ †$ñ YPò4«¢o¨…:jSŒÄd1©À“ RhYKP"‘Rh L+O'Œ”l² Fb1Qƒ&\R
K4 €€(xˆ©4ZÏˆ&B(HÎ“„F P× +€Ës
@™ÊB^¿«‚BF£‰»ÍI5‘!	¢$eøCò¨„`‹ ˆ##ƒj¸0,0™c(b½¢€AèHDHÎ@¼	G“a722á 0%Œ€+C?sÄ0Xw£åó–‘0˜ZZà¢ µ!Cš#Š	d¨@˜p	8Q”àUĞI°†å”¨ŠˆF"Ì‰,’P$A‚@LÀÙ9„”(A6°	  Y@’
Ò˜ r0Lòb	 ¬"*L @Á(@¨ Õ‚9‰„å^%0	2¤C(< p“aGÁ‰ •”iÈ}†A€ +)&±€PœŠÁ Ì˜UT@]1¡„€ Ë˜( 0e™ ÂÁ°€DæŠE¿9 €	 ×¢*‹Ä JæàBˆÂáSP¨€$8— Â
0]\È9BÈ #Ò ŠpëgÂ%XXGwèfHºÿû{³pÑ7P¯võ­¿ùË9ò{ãã•é?Û¤eò_ñŸíÓ¼İá¾ú¼f+ĞøöÑÿ&ÉÉo¶Ÿv{>K9eÛï|÷ıZ˜Ä³ù~ûOÕñ§ôÛõ¯wöuÕsZóc÷×†ãk“ù6ïş?ø_µõå9wï.ıÚ=½4§ÿOïË¼ê{ÏşíÆŞß^–¯¯§«Øùıà&9'İ3ş+şºÿ[ö®ô‰©'ïñ‰«ïª]¾Üßûía¥÷ŞóÎŞo!PóÅuq¿şo¾Nçì¯W}_3.îÖ*ø¯?/úOö¯ó;±ø.ùû	œ³ãv½éŒ¿Ÿ+lıÿ°  h I‡E5  P‚d”
…7€ À%Äq(0ˆÙ-ğ`¢B S 0¡dl   ÄD@ „c@„H"Y¥„@=ixbyP˜@ A\r+j( €ÙsH$e@DC¬¢€ğ& %F¹ÖÿämlÎÇãô¶vOÍşìx»z~ß‘ë¡¿ÿ?ôº{÷WÑãÖÿ5!N{£½šÒıëç±wü¿ïÂÒ«¾ÛûòO~›6µk¯/~»Vş³·ôsgœ¡êv· b7]õçŸßïoí}NÎ;¬«ş/ÃX^ø¶­}øº÷*zşg¿{pHL* )Ëƒ ˆ$ ñé¦DŒ‹AÆ² RI  A A‡È™"±P r€•JÀ LQ"Ú  Û ¨Àh€P¢Z	­Ò,‘ .BÀq ‰&S	@aÈ¡9l"‚ G	IŒE)"M Œ-TäÁ@„cÛ@è
DE!`†[$Hi"f™+'GJ 1•æP8‡l"çÜ@ à¼’M@2ñ	¤@ Bïè`¨’JŒ¢Rˆ‡Äz€¸Â …œ#ò¬A€$’ö™©ÊÍ
!ó@ phŠ{e¿ïßmµ{Í¿½¾{>İöpwgß¯™5¾w²}í·Ïú…ûÉ\o”|h…®¿ººÿ{¶İ•¡µ}Vm¯oîíø·›µöÓşû÷‡6Ÿ‘Bğÿéìb=úµ¸uú¶÷ß’å>sgÏ#ıúÛÏåXœüÁnrÖËİÍØçõkHU;ú§™×õŞÎ0‹Ç	0RZ< #AG`(u	A¶ ÂP  @È ‰  ²€@LI |0,J€cA0	Bæ
€)ƒB€€œObÀ€IF=d† ÁEB£ t) ZD W%€ÙQ€ĞØ$ÁÕà4 5ØşZoêwFñÿ~;{¿üô_Âl}úÿ:?ë‡S'qÿí?ì~)ÔŸ¥·»îÁÛMÖMMûå
uuôÙ¨üŸ\Ûâ–}¾­ü²çıö¿<ª×ù}^çì5óí×7r¦^¶\ç¾êZÿ¿ıEû¶×}–÷u*Ş¿]Ï¿§šŒûªy7§ŸİÓMÿ=^½÷Âv—¸ï·E¾÷t¿È•Ê×÷ãöõ¿ùïGs#Î?]K~Ïšuú×½x¾ÿsÏc¡êŸşî¿_|¯ıOOí×óã¿©¯ş«¿±k Ö¿åÛ7ş‹¾­õìÔyßO©åÛ£¿Üj³ö‹4İø–üNğ—£–>ãŠZ(7 aƒ Ğ € Yàc	J¢aÆ œ\
cm£a"ˆ ÁTDxC°ç0X@U
dR
I@Å>ĞaÔ€ ÕØĞXšcØ €À à`zQ
An„Ù˜$!2 )`Š& 2   ,‹  ¹ò±_ÁÉ{½õ¿}mò3¼<eeN½}{á×î—¯w[øÿÃòYÙoƒıOTò¿5¦Åı,ÜOï7Ò¿>ëëæ/ûşÿ©uÿÃ•{Ô{{{ü‘¼Û¹GşUw[•w÷ûßŞ<^<:ßRú-¦í:}õŞÇ_›ûí”ÏãòkówØxö;?„à*`Në ¥	Ò¡BaàØX !~’"³‘t+åxã A TğT) bê0#phK p¡€åèá:Ÿ`Á 5èCŒBrV1 ( °Ì Ä€Ëè”
H‚-¼ª–IØ‚—2&ˆ"6VeI<ÁP"%C›Ò€hÄÈ‰Ğ¨¬!¹ &á%Mi ¢¨8(Ã!ØˆPN	Âh @ÊHKP<jD 3Æ0dJà3L1”àÃAC ´X%KH $ Ç(@ * € x’ĞÀ $€FäË:R`8ã¦gÇó;ßu¶uPÅï»Âçÿi¿Ï;÷òıtWãGû>»w½&/óşÎê|©ÉcĞÿf»‡’å¬òã²/Ş¹Fjnı›Ólå8&uÜş.ã—ë·Î½]İG)ãXél»Õ?n~aªwÒ×Dß-{ü?¶NÅ/şş~Ç6¦÷ê÷­éhdŠà\À°æF
"Œ  ëS¸8Z‚6!T b€) §*O¤D¸ (€YØBÂ Òˆ “"†6"N9@(ÀĞ)P .×€ ˜%IÀ@Y˜Ä„œ*£x R£  A(Ÿ+ä‘7O‘€„ÀAŠ¤¬/sòx÷£ëií~&#åBú'ö§ı;ŸÂ•oİ]¤åjñ:Á;oÏ_s¹I§{w>m?¿ûiój'şvÑıUÆıÓŞú^¿/3_yëßIç3ç/ï}£õ?=ô÷Aßdû]íaÂ²KÙİ½˜æğœÏ—ıUş¡;_Fõ°p¾uÙG‹ƒù·cŠ;÷Œ¶í?ßŸ{-	ó_Ç’õğéû_^†™/¿¼v®qÿÕ·ùëM{ÊNÛŒñ¾v×ê;»¶sÌL?ûÍWoùŸU;ÇëÇ_ı»çûÎZAŞy/İ«^³?ß÷k«u·üü|ö­=×?Ï6rëğUxÿ®û^™v³×®_ßëæ#aA‹É%@+‰b ‡XRY< GOf… )šA5`  Œ˜`n” !BÑ Xv`AK A,äB @-B2ÂŠS€Aq¢ÔHlÈ5r…‹  87€¦†È)S¢!83ğ›K .·Ï:^vÅ#å»íZû.şû˜»K#iÉG¿®ÿŸ¿ë`ãùÿışÔ£¿Šº®İì_Ğáş×ÛÏïŸî~jöLÊïóy¯_×}ÿûÇoUzï…×ÿİo-Ûç_3O¾®V}İÅ®w§ë¾|é7z7î–ã†9çC÷ŸÏ¸w®z•÷1PtA “EÆ:c e‚ $T@4!‚–! Á”Rz‘ /Q É% •"	c"€„Y`ğ&‹¤
HÛĞ„ 	ñ*N@“‰ —öĞ†H0&FBBMY.5@$ D‹@xH‚J©ÓPqd	€A(AŒ"f@P "¦‡ (Ty4AGŒC @
  ( ÂÎà’e‘L©  é@†, @’ (€à&«XÂ "ŒYÁ"6b
Ğ`‚RD ƒ ]A@‚†Y@qŞ@"Ëˆ©‡A\ OÈPE\_ ‡A&Ëw–ûKİzİâ¿ÇVqÿ6Oğ–õ7ú_v¯öŞ×¼ãÿôÃïwÜ¦{÷µƒşşxo~í×ë]öö—%ı/•Ş½?Å£¿}ÿ£úcƒ/w6ÿ·ß²SÎÿĞ¾>†‡ov®ôçşoúGíïWGÌïcw[Û·‹zï§}òWRËsıÏ¦_ÏfÍ»¼h¬B×ÀAP@Ğ&CP@†Ê6ASâA1‹ ˜ƒã P ´™Ğ Œ Ø J$?™ ·%@Æò"Šb4ÁKP!X¨„§’! @ÃA €…  H™c„Ô(†¿ÁC±o©
³<BS
‚‰²Dû8  =ó¥îªo„G>LÇ÷ışéûu}ï»…®ıw¿Ÿù©øS¶?ÓmâÆŸ²ûmï<z¾Ÿ€Ò/Tæ'İ„gon}œ¾øûß·mw—Ñ±goGËİ=ÿı-»ûw·kÏ{Wyy÷Ïkû~^ŒßúşWİøıòûÿ?ûÿØ£fØéc©ôÖæÔıŸÃüVÉÿZ½]ö}QÏÿMòÔWmÅÿùßıjè"­ÿ­güoıÕ›Ú¾Ë7±ü_Íbw¿3)ïÛßÿù 'ş]Í~~÷Ş‹Üüš~û}«İÍ÷×ï™ş/·ÎI=Ó?;·¯÷áû?÷ƒßİ6;ºúyooô?Â]ÔüŸxò¾sõÿÏ@<58b <8z+€1¨ˆ`’™	xÁğBMHT\ÎÀ€  A‘+apÀÀ†° $h P©)	†Æ(@¢KI ‰	\|ÂEÀ“,Bèà”¤ 4›Hh€BH(8  à¡š§Æ0sŠà¹†  b"C­[åı?Ïÿßw»Æ%ßw?5UÁï»Uÿä±ŒñÊûûÊUÿ‡ÕÆİüñßlF>õQıè4º·ü›¿g‡V=<¸–{zF^ÖëÊ‡¼?æº¿¶ÕæwQ~Oÿß­µóêvŸBÿ¥Ç;ûÙökTşÿ'éÅ›ÖÚ«¶ÙVşñü¯%€ à#rĞ@à©ñJE„IPLÁ°¼#Æ1‚S Pó     ¢`PŠ ÁÍAbY’b($0F('…,@ >Í‚ & "e¨Ã ¸dPˆ` ˆ°ä'Ì
   èÇ&Wªd	šÂ·€äÉÔ@@ ‚^ ]	˜©°QA€‰fjx 0Æ#fA„ FsœC ùD: æI	 ÂHü€Z …PD$`Q ® ½ŒJ˜[n ‚ T" €	
d  )Z”Aá–Ô((&Š¦	
$‹–
à@€ÈŠ>€”$.„?]â›åÑºù¿oÃ©Šs6~e·@®¥kùÄm¾ø´<Ÿ˜î›Bû°±úçßîÿÃîe÷óëKw+GÓj»5ÉUwùá¯û{cÏÿ©y=ú÷çûñ?áÜ{S»-üÍ©o×cMünÿ{ıÿşx÷õ_QÚSôÿoçû: ş|y±{>WûÓÿöÖş^8»öşQX‡ü?oÿ«Óò~İÊãæ»ïß5üy¼¿Fs¯8÷êwİ÷v¸‘Ï{Ì{¹Ş÷şÿxkÉR¾¯×ÛäŞ&÷şşvÎçÿè¿·½½Yøæùà—µíı÷ß©aºë÷úK_WYÿ}æÃÑ÷Åû÷«¤óÓ†=âûïxğŞı ´Dì€¼
ŠTR'2„vc’˜Jô xÖNGlÛ4B#rpaà+AhI"„`è¼¸QòfSÓB€…-ÒÆ† 
o‚bcIÑ!MNb!h bòòAèDTBµÊÒ¦"CF  ÔÄ_UˆÄ3HÁ ²’00i‚õšÀÖRù&(Zta¨È<4×Jé ƒs"@ea	C($CA	A¸æá•8dB–#B{ ğ·81%&	ë TZIŒxÃ"0MäD4Î…Ö¥ä8™š‰4‰„OÅ²‚è€ˆºÏ¸÷ş”Óó_lóéù÷^Ù¯Û?üïXéHÿ.›×Ğ½ü¼»öû×qæßÎ?ßbgÅúÎ×.ûÌ½ÛÜRŸfšó°w¨ŞßİŞ½×ÿÃı÷<ùyyê³Û[vÿìÔ½§ô¿ÿïÙ%<¬Şßv¿_{ú¿İßoïşÑŠòıë=ùï¹û¾›8‰°‰™ˆ…Õc¼¸‘8
¡‰…êÂ®Z Œ)&€€L£6JÈLFŠ(DÄä*;$£ m%<‘† @(•…A,ˆ•Œ„\h €À&0dÊ%²~XÑÍ…D&ƒ `¾ù 3ÔÌ´a¨¬ğŠMìa€ÿìÛ™ÿ~ıÏ÷w'õ|·º¿Åµ›ÿöqË‚¦#ûw¾õ+ü÷S¯«X7÷Ì™FñïŸ{ëâ2³¾Ã¿O}k^ø»ï¯®ówÜùj­ÿ¥Ï?×ıaI=¾¿ıæí½ïÿ<ÕíçÛyí'ÎïC9İôWë´ÿ·¿Îÿ=«ë”÷ÿ?÷ãÉƒøçºlúû®ò|_eÇ×øÇ]ÓîÕëúËû÷~®v¥{ï,ªù>ÿæw}úº×Ò÷_û¾Õ¡íÿ™iŸ›tY¯ÿ‘Ô}Å{¸ú¼|µ>m©û·¯Ë¿ÿß|Şzß£]§~¼÷^?şı¶©öÿòı·ÿôíëY^–·İâÏGÎ|zßõë,=äg¿¨jK&ÄÅìP5†ˆ ğAÁøñÉLD 7X ƒ@òÈ‘T˜DN(D48f¤…€Í âŞ!`DÓ)±B@‹pì•
MI®¼@‚X‚gJQ¤¥i-!L"€1¸˜ds6ã{f»p¡ePÊ¤Á 	êÛ¿Öİk÷¾Êÿ}^w¹¦T»Ÿ·F2ŞS¸û'HÎr¯›ëÙTœì›îµl"ö
ÿÔœ¯ïíEÿ[|9o²¯•nì÷î?Ûı?oşşU»[êÔåç}ÿî÷ùööú~óÿ³çşûşÿ£Øå?r=¿¹ÿ×wj$9?ûFIAøPPJ§¦¬dˆH¤()hÃ€F“¤7µS(¬à2 ÑXÁJ/3V@ªXƒQpWĞRòIX¡2 oôeÊœğPX–ì!©Ş— $‡p¤LdMÕDÈDTë@ğo@èAÄ;PATÀL¡s!Ä‘&ørØ¥Š#	«ŒäØ DŠZ÷0€7A˜¨;À%… e@Í´"E°X‚0)6å1$ERÅÂlO‘`ŸÑ?*öâH’k6'Ô°‚¿•T
²„(ç‚¡$·¼	ÄQøR i’€áá  ñDá[TšÑ"À2„F£Ûÿæÿÿ»çyëû	y[·=ò³çırŞ¾Óİï~ß“©˜ı~ş’Ößâ~}ÌıWµûùîvğ[»wı÷Ù¾ëïÛ¿“×%²îùëÄ"ù^ªß¿¾ı>