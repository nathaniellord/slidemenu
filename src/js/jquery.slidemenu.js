/**
 * @preserve Copyright 2014 Nathaniel Lord
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Nathaniel Lord http://www.nathaniellord.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/*
Slide Menu
 CSS Structure as follows:
 	.slide-menu
		.menu-items
			.menu-item
		.menu-panels
			.menu-panel

*/
(function($) {
	'use strict';
	var SlideMenu = function(element, options) {
		this.element = element;
		this.$element = $(element);
		this.options = options;
		this.state = {
			openTimeout: undefined,
			closeTimeout: undefined
		};
		if (this.$element.hasClass("left-side")) {
			this.options.side = "left";
		}
		if (this.$element.hasClass("horizontal-open")) {
			this.options.panelDirection = "horizontal";
		}
		var context = this;
		if (document.readyState !== 'complete') {
			$(document).on("ready", this.resize.apply(context));
		} else {
			this.resize.apply(context);
		}
		$(window).resize(function() {
			SlideMenu.prototype.resize.apply(context);
		});

		var top = 0;
		$(".menu-panel", this.$element).each(function(index, element) {
			$(element).css("position", "absolute");
			$(element).attr("data-index", index);
			$(element).css("top", top + "px");
			top += $(element).height();
		});

		this.$element.on("click", ".menu-panel-header", function(event) {
			context.menuClick.call(context, event);
		});
	};

	SlideMenu.VERSION = '2.0.0';
	SlideMenu.DEFAULTS = {
		side: "right",
		panelDirection: "vertical",
		iconWidth: "",
		panelWidth: "",
		autoIconWidth: true,
		autoPanelWidth: true,
		initialized: false,
		enabled: true,
		show: false,
		top: "",
		bottom: "",
		openSpeed: 250
	};

	SlideMenu.prototype.menuClick = function(event) {
		var $panel = $(event.currentTarget).parents(".menu-panel");
		if ($panel.hasClass("active")) { //Close this menu item since it's the only one open
			this.close.apply(this);
		} else if ($panel.parents(".slide-menu").hasClass("active")) { //Close open menu and move new menu into place
			this.switchMenus.apply(this, $panel);
		} else { //Open the menu that was selected
			this.openMenu.apply(this, $panel);
		}
	};

	SlideMenu.prototype.getDefaults = function() {
		return SlideMenu.DEFAULTS;
	};

	SlideMenu.prototype.getOptions = function(options) {
		options = $.extend({}, this.getDefaults(), this.$element.data(), options);
		if (options.iconWidth !== "") {
			options.autoIconWidth = false;
		}
		if (options.panelWidth !== "") {
			options.autoPanelWidth = false;
		}
		return options;
	};

	SlideMenu.prototype.resize = function() {
		var changed = false;
		//Perform calculations
		var topOffset = 0;
		if (typeof(this.options.top) === "number") {
			topOffset = this.options.top;
			this.$element.css("top", this.options.top + "px");
		}
		var bottomOffset = 0;
		if (typeof(this.options.bottom) === "number") {
			bottomOffset = this.options.bottom;
		}
		var menuHeight = $(window).height() - topOffset - bottomOffset;
		if (menuHeight !== this.$element.height()) {
			changed = true;
		}
		if (this.options.autoIconWidth && $(".menu-panels", this.$element).outerWidth(true) > this.options.iconWidth) {
			this.options.iconWidth = $(".menu-panels", this.$element).outerWidth(true);
			changed = true;
		}
		if (this.options.autoPanelWidth && $(".menu-panel-body", this.$element).width() !== this.options.panelWidth) {
			this.options.panelWidth = $(".menu-panel-body", this.$element).width();
			changed = true;
		}
		this.options.width = this.options.panelWidth + this.options.iconWidth;
		//Init Once

		if (this.options.show === false) {
			this.show();
		}


		$(".menu-panel", this.$element).each(function(index, element) {
			var newHeight = $(".menu-panel-header", $(element)).height();
			$(element).css("height", newHeight + "px");
			$(".menu-panel-body", $(element)).css("height", menuHeight - newHeight + "px");
		});

		if (changed) {
			//this.$element.width(this.options.width);
			this.$element.height(menuHeight).css("top", topOffset);
			this.$element.find(".menu-close").css("width", this.options.iconWidth);
			//$(".menu-panels", this.$element).height(menuHeight);
			if (this.options.side === "right") {
				var itemsLeft = -this.options.iconWidth - parseInt($(".menu-items", this.$element).css("border-left-width"));
				//$(".menu-panels", this.$element).css("left", itemsLeft + "px");
				if (this.$element.hasClass("active")) {
					//$(".menu-panels", this.$element).css("left", -this.options.width + "px");
				} else {
					if (this.options.panelDirection === "vertical") {
						//$(".menu-panels", this.$element).css("left", -this.options.width + "px").css("bottom", "100%");
					} else {
						//$(".menu-panels", this.$element).css("left", "0px");
					}
				}
			} else {

			}
			$(".menu-close", this.$element).css("width", this.options.iconWidth + "px");
		}
	};

	SlideMenu.prototype.openMenu = function(menu) {
		var context = this;
		this.state.currentPanel = menu;
		context.$element.trigger("slidemenu.beforeOpen").addClass("active").css("width", "300px");
		$(menu).addClass("active");
		var left;

		if (context.options.side === "right") {
			left = -context.options.panelWidth;
			$(".menu-panel.active", context.$element).css({
				width: context.options.width + "px"
			});
		} else if (context.options.side === "left") {
			left = parseInt($(".menu-items", context.$element).css("left"));
			$(".menu-panel.active", context.$element).css({
				right: parseInt(-context.options.width + context.options.iconWidth) + "px"
			});
		}
		this.state.timeout = window.setTimeout(function() {
			if ($(".menu-panel.active", context.$element).css("top") !== "0px") {
				context.reorder(function() {
					context.$element.trigger("slidemenu.opened");
					context.openPanel($(menu).data("target"));
				});
			} else {
				context.$element.trigger("slidemenu.opened");
				context.openPanel($(menu).data("target"));
			}
		}, this.options.openSpeed);

	};

	SlideMenu.prototype.switchMenus = function(newMenu) {
		var context = this;
		//Switch Selected Panel
		var oldPanel = this.state.currentPanel;
		this.state.currentPanel = $(newMenu);

		//Slide old menu in
		if (context.options.side === "right") {
			$(oldPanel).css("width", context.options.iconWidth);
			context.state.openTimeout = window.setTimeout(function() {
				context.closePanel.call(context, oldPanel);
			}, context.options.closeSpeed);
		} else if (context.options.side === "left") {

		}

		//Slide new menu out
		this.state.currentPanel.addClass("active").css("width", context.options.width + "px");
		context.state.openTimeout = window.setTimeout(function() {
			context.reorder.call(context, function() {
				context.openPanel.call(context, context.state.currentPanel);
			});
		}, context.options.closeSpeed);
	};

	SlideMenu.prototype.close = function(callback) {
		var oldPanel = this.state.currentPanel;
		this.state.currentPanel = undefined;
		this.$element.trigger("slidemenu.beforeClose");
		var instance = this;
		if (instance.options.side === "right") {
			$(oldPanel).css({
				width: this.options.iconWidth
			});
		} else if (this.options.side === "left") {
			$(".menu-panel.active", instance.$element).css({
				right: "0px"
			});
		}
		this.state.timeout = window.setTimeout(function() {
			instance.closePanel(oldPanel);
			instance.$element.removeClass("active").css("width", "50px");
			instance.$element.trigger("slidemenu.closed");
			if (typeof(callback) === "function") {
				callback();
			}
			$(".menu-panel.active", instance.$element).removeClass("active");
			//Move tiles back to their places
			instance.reorder();
		}, this.options.openSpeed);
	};

	SlideMenu.prototype.openPanel = function(target) {
		if (this.options.panelDirection === "vertical") {
			$(".menu-panel.active").css("height", "100%");
		} else if (this.options.panelDirection === "horizontal") {
			var movement = {};
			if (this.options.side === "right") {
				movement = {
					left: parseInt(-this.options.width) + "px"
				};
			} else if (this.options.side === "left") {
				movement = {
					left: this.options.iconWidth + "px"
				};
			}
			$(".menu-panels", this.$element).stop().animate(movement, 250, 'linear');
		}
	};

	SlideMenu.prototype.closePanel = function(element) {
		var currentPanel, instance = this;
		if (this.options.side === "right") {
			$(".menu-panels", this.$element).css("width", "50px");
		} else if (this.options.side === "left") {
			$(".menu-panels", this.$element).css("width", "50px");
		}

		this.state.timeout = window.setTimeout(function() {
			if (element !== undefined) {
				currentPanel = $(element);
			} else {
				currentPanel = $(".menu-panel.active", instance.$element);
			}
			currentPanel.removeClass("active");
			if (instance.options.panelDirection === "vertical") {
				var newHeight = $(".menu-panel-header", currentPanel).height();
				currentPanel.css("height", newHeight + "px");
			}
		}, this.options.closeSpeed);
	};

	SlideMenu.prototype.open = function(target) {
		$(".menu-item[data-target='" + target + "']", this.$element).click();
	};

	SlideMenu.prototype.hide = function() {
		//Slide the menu out the side
		var instance = this;
		if (this.isOpen()) {
			instance.close(
				function() {
					hideSlideMenu();
				}
			);
		} else {
			hideSlideMenu();
		}

		function hideSlideMenu() {
			if (instance.options.side === "right") {
				//$(".menu-panels", instance.$element).css("left", "0px");
				$(".menu-items", instance.$element).animate({
					left: "0px"
				}, 250);
			} else {
				//$(".menu-panels", instance.$element).css("left", "0px");
				$(".menu-items", instance.$element).animate({
					left: -instance.options.width + "px"
				}, 250);
			}
			instance.options.show = false;
		}
	};

	SlideMenu.prototype.show = function(callback) {
		if (this.options.show === true) {
			return;
		}
		var instance = this;
		var itemsLeft, animateOptions;
		//Slide the menu in from the side
		if (parseInt($(".menu-items", instance.$element).css("right")) === 0 || parseInt($(".menu-items", instance.$element).css("left")) === 0) {
			if (this.options.side === "right") {
				itemsLeft = -instance.options.iconWidth - parseInt($(".menu-items", instance.$element).css("border-left-width"));
				animateOptions = {
					duration: 250,
					complete: function() {
						if (instance.options.panelDirection === "vertical") {
							//$(".menu-panels", instance.$element).css("left", -instance.options.width + "px").css("bottom", "100%");
						} else if (instance.options.panelDirection === "horizontal") {
							//$(".menu-panels", instance.$element).css("left", itemsLeft + "px").css("top", "0px");
						}
						instance.options.show = true;
						instance.resize();
						if (typeof(callback) === "function") {
							callback();
						}
					}
				};
				$(".menu-items", instance.$element).css("left", "0px").animate({
					left: itemsLeft + "px"
				}, animateOptions);
			} else {
				itemsLeft = -instance.options.width + instance.options.iconWidth;
				animateOptions = {
					duration: 250,
					complete: function() {
						if (instance.options.panelDirection === "vertical") {
							//$(".menu-panels", instance.$element).css("left", instance.options.iconWidth + "px").css("bottom", "100%");
						} else if (instance.options.panelDirection === "horizontal") {
							//$(".menu-panels", instance.$element).css("left", itemsLeft + "px").css("top", "0px");
						}
						instance.options.show = true;
						instance.resize();
						if (typeof(callback) === "function") {
							callback();
						}
					}
				};
				$(".menu-items", instance.$element).css("left", -instance.options.width + "px").animate({
					left: itemsLeft + "px"
				}, animateOptions);
			}
		}
		instance.options.initialized = true;
	};

	SlideMenu.prototype.generateID = function() {
		var prefix = "slidemenu-panel-";
		var counter = 1;
		var panelID = prefix + counter;
		while ($("#" + panelID).length > 0) {
			counter++;
			panelID = prefix + counter;
		}
		return panelID;
	};

	SlideMenu.prototype.addTab = function(args) {
		//Get ID from content
		var tab = $(args.tab);
		var content = $(args.content);
		var id = $(content).attr("id");
		if (id === undefined) {
			$(content).attr("id", this.generateID());
		}
		$(tab).attr("data-target", $(content).attr("id"));
		if ($(tab).hasClass("menu-item") === false) {
			$(tab).addClass("menu-item");
		}
		if ($(content).hasClass("menu-panel") === false) {
			$(content).addClass("menu-panel");
		}
		$(".menu-items", this.$element).append(tab);
		$(".menu-panels", this.$element).append(content);
		this.reorder();
	};

	SlideMenu.prototype.removeTab = function(target) {
		$(".menu-item[data-target='" + target + "']", this.$element).replaceWith("");
		$(target, this.$element).replaceWith("");
		this.reorder();
	};

	SlideMenu.prototype.hideTab = function(target) {
		if ($(".menu-item[data-target='" + target + "']", this.$element).hasClass("active")) {
			//If panel is open then close the menu
			var instance = this;
			this.close(function() {
				$(".menu-item[data-target='" + target + "']", instance.$element).hide();
			});
		} else {
			$(".menu-item[data-target='" + target + "']", this.$element).hide();
			//Rearrange tiles
			this.reorder();
		}
	};

	SlideMenu.prototype.showTab = function(target) {
		$(".menu-item[data-target='" + target + "']", this.$element).show();
		//Rearrange tiles
		this.reorder();
	};

	SlideMenu.prototype.changePosition = function(args) {
		var target = args.target;
		var position = args.position;
		var item = $(".menu-item[data-target='" + target + "']", this.$element);
		$(".menu-item[data-target='" + target + "']", this.$element).replaceWith("");
		if (position === 1) {
			$(".menu-items", this.$element).prepend(item);
		} else {
			$(".menu-item:nth-child(" + parseInt(position - 1) + ")", this.$element).after(item);
		}
		this.reorder();
	};

	SlideMenu.prototype.reorder = function(callback) {
		var top = 0,
			context = this;
		if ($(this.state.currentPanel).css("top") === "0px") {
			if (typeof(callback) === "function") {
				callback();
			}
		} else {
			if ($(this.state.currentPanel).length > 0) {
				if (typeof(callback) === "function") {
					this.state.timeout = window.setTimeout(function() {
						callback();
					}, this.options.openSpeed);
				}
				$(this.state.currentPanel).css("top", "0px");
				top += $(".menu-panel-header", this.state.currentPanel).height();
			}
		}
		//If there is an open tab then move the first element below it
		if (this.state.currentPanel !== undefined) {
			top = $(".menu-panel-header", $(this.state.currentPanel)).height();
		}
		var panels = $(".menu-panel:visible", this.$element);
		panels.sort(function(a, b) {
			if ($(b)[0] === $(context.state.currentPanel)[0]) {
				return 1;
			} else {
				return parseInt($(a).attr("data-index")) - parseInt($(b).attr("data-index"));
			}
		});
		console.log(panels);
		$(panels).each(function(index, element) {
			if ($(element)[0] !== $(context.state.currentPanel)[0]) {
				$(element).css({
					top: top + "px"
				});
				top += $(".menu-panel-header", $(element)).height();
			}
		});
		context.state.moveTimeout = window.setTimeout(function() {
			$(panels).each(function(index, element) {
				context.$element.find(".menu-panels").append(element);
			});
		}, context.options.openSpeed);
	};

	SlideMenu.prototype.disable = function() {
		this.options.enabled = false;
	};

	SlideMenu.prototype.enable = function() {
		this.options.enabled = true;
	};

	SlideMenu.prototype.isOpen = function() {
		return this.$element.hasClass("active");
	};

	SlideMenu.prototype.destroy = function() {
		this.$element.css("width", "").css({
			"height": "",
			"top": ""
		});
		this.$element.find(".menu-items").css({
			"left": ""
		});
		/*this.$element.find(".menu-panels").css({
			"height": "",
			"left": "",
			"bottom": ""
		});*/
		this.$element.find(".menu-item").css({
			"position": "",
			"top": "",
			"left": ""
		});
		this.$element.find(".menu-close").css({
			"width": ""
		});
		this.$element.find(".menu-panel").css({
			"padding-top": ""
		});
		delete this.options;
		delete this.$element;
	};

	function Plugin(option, args) {
		return this.each(function() {
			var $this = $(this);
			var data = $this.data('slidemenu');
			var options = $.extend({}, SlideMenu.DEFAULTS, $this.data(), typeof option === 'object' && option);

			if (!data) {
				$this.data('slidemenu', (data = new SlideMenu(this, options)));
			}
			if (typeof option === 'string') {
				data[option](args);
			}
		});
	}

	var old = $.fn.slidemenu;

	$.fn.slidemenu = Plugin;
	$.fn.slidemenu.Constructor = SlideMenu;

	// Slidemenu NO CONFLICT
	// ===================	
	$.fn.slidemenu.noConflict = function() {
		$.fn.slidemenu = old;
		return this;
	};

}(jQuery));
