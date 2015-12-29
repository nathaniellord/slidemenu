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
		if (this.options.autoIconWidth && $(".menu-icon", this.$element).outerWidth(true) > this.options.iconWidth) {
			this.options.iconWidth = $(".menu-icon", this.$element).outerWidth(true);
			changed = true;
		}
		if (this.options.autoPanelWidth && $(".menu-panels", this.$element).width() !== this.options.panelWidth) {
			this.options.panelWidth = $(".menu-panels", this.$element).width();
			changed = true;
		}
		this.options.width = this.options.panelWidth + this.options.iconWidth;
		//Init Once

		if (this.options.show === false) {
			this.show();
		}

		if (changed) {
			this.$element.width(this.options.width);
			this.$element.height(menuHeight).css("top", topOffset);
			//$(".menu-panels", this.$element).height(menuHeight);
			if (this.options.side === "right") {
				var itemsLeft = -this.options.iconWidth - parseInt($(".menu-items", this.$element).css("border-left-width"));
				$(".menu-items", this.$element).css("left", itemsLeft + "px");
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
		context.$element.trigger("slidemenu.beforeOpen");
		context.$element.addClass("active");
		$(menu).addClass("active");
		var left, leftBorder;

		var movement = {};
		if (context.options.side === "right") {
			leftBorder = parseInt($(".menu-items", context.$element).css("border-left-width"));
			left = parseInt($(".menu-items", context.$element).css("left"));
			$(".menu-item.active", context.$element).css({
				left: parseInt(-context.options.width - left - leftBorder) + "px"
			});
		} else if (context.options.side === "left") {
			left = parseInt($(".menu-items", context.$element).css("left"));
			$(".menu-item.active", context.$element).css({
				right: parseInt(-context.options.width + context.options.iconWidth) + "px"
			});
		}
		this.state.timeout = window.setTimeout(function() {
			if ($(".menu-item.active", context.$element).css("top") !== "0px") {
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

	SlideMenu.prototype.switchMenus = function(event) {
		var context = this;
		context.closePanel();
		//Slide new menu out
		var movement = {},
			left, leftBorder;
		if (context.options.side === "right") {
			leftBorder = parseInt($(".menu-items", context.$element).css("border-left-width"));
			left = parseInt($(".menu-items", context.$element).css("left"));
			movement = {
				left: parseInt(-context.options.width - left - leftBorder) + "px"
			};
		} else if (context.options.side === "left") {
			left = parseInt($(".menu-items", context.$element).css("left"));
			movement = {
				right: parseInt(-context.options.width + context.options.iconWidth) + "px"
			};
		}
		var switchOpts = {
			duration: 250,
			complete: function() {
				context.reorder(function() {
					context.openPanel($(event.currentTarget).data("target"));
				});
			}
		};
		$(event.currentTarget).stop().animate(movement, switchOpts);
		//Slide current menu in
		movement = {};
		if (context.options.side === "right") {
			movement = {
				left: "0px"
			};
		} else if (context.options.side === "left") {
			movement = {
				right: "0px"
			};
		}
		$(".menu-item.active", context.$element).animate(movement, 250, function() {
			$(this).removeClass("active");
		});
		$(".menu-item.active", context.$element).removeClass("active");
		$(event.currentTarget).addClass("active");
	};

	SlideMenu.prototype.close = function(callback) {
		this.$element.trigger("slidemenu.beforeClose");
		var instance = this;
		if (instance.options.side === "right") {
			$(".menu-item.active", instance.$element).css({
				left: "0px"
			});
		} else if (this.options.side === "left") {
			$(".menu-item.active", instance.$element).css({
				right: "0px"
			});
		}
		this.closePanel();
		this.state.timeout = window.setTimeout(function() {
			instance.$element.removeClass("active");
			instance.$element.trigger("slidemenu.closed");
			if (typeof(callback) === "function") {
				callback();
			}
			$(".menu-item.active", instance.$element).removeClass("active");
			//Move tiles back to their places
			instance.reorder();
		}, this.options.openSpeed);
	};

	SlideMenu.prototype.openPanel = function(target) {
		$(".menu-panel.active", this.$element).removeClass("active");
		$(target, this.$element).addClass("active");
		$(".menu-panel.active", this.$element).css("padding-top", $(".menu-item.active", this.$element).outerHeight(true) + "px");
		if (this.options.panelDirection === "vertical") {
			$(".menu-panels", this.$element).animate({
				bottom: "0%"
			}, 250, 'linear');
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

	SlideMenu.prototype.closePanel = function() {
		var movement = {},
			left;
		var instance = this;
		if (this.options.side === "right") {
			movement = {
				left: parseInt(-this.options.iconWidth) + "px"
			};
		} else if (this.options.side === "left") {
			movement = {
				left: parseInt(-this.options.panelWidth + this.options.iconWidth) + "px"
			};
		}
		var closeOpts = {
			duration: 250,
			complete: function() {
				$(".menu-panel.active", instance.$element).removeClass("active");
				if (instance.options.panelDirection === "vertical") {
					left = 0;
					if (instance.options.side === "right") {
						$(this).css("bottom", "100%").css("left", -instance.options.width + "px");
					} else if (instance.options.side === "left") {
						$(this).css("bottom", "100%").css("left", instance.options.iconWidth + "px");
					}
				}
			}
		};
		$(".menu-panels", instance.$element).stop().animate(movement, closeOpts);
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
		var top = 0;
		if ($(".menu-item.active", this.$element).css("top") === "0px") {
			if (typeof(callback) === "function") {
				callback();
			}
		} else {
			if ($(".menu-item.active", this.$element).length > 0) {
				var animateOptions = {
					duration: 250,
					complete: function() {
						if (typeof(callback) === "function") {
							callback();
						}
					}
				};
				$(".menu-item.active", this.$element).animate({
					top: top + "px"
				}, animateOptions);
				top += $(".menu-item.active", this.$element).height();
			}
		}
		//If there is an open tab then move the first element below it
		if ($(".menu-item.active").length) {
			top = $(".menu-item.active").height();
		}
		$(".menu-item:visible", this.$element).each(function(index, element) {
			if ($(element).hasClass("active") === false) {
				$(element).animate({
					top: top + "px"
				}, 250);
				top += $(element).height();
			}
		});
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
