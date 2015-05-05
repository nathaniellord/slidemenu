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
(function( $ ) {
	'use strict';	
	var SlideMenu = function(element,options) {
		this.element = null;
		this.options = null;
		this.init('slideMenu',element,options);
	}
	
	SlideMenu.VERSION='0.0.1';
	SlideMenu.SLIDE_SPEED=0.5;
	SlideMenu.DEFAULTS={
		side:"right",
		panelDirection:"vertical",
		iconWidth:"",
		panelWidth:"",
		autoIconWidth:true,
		autoPanelWidth:true,
		initialized:false,
		enabled:true,
		show:false,
		top:"",
		bottom:""
	}
	
	SlideMenu.prototype.init=function(type, element, options) {
		this.$element = $(element);
		this.options = this.getOptions(options);
		
		if(this.options.initialized) {
			console.log("Menu is already initialized. Destroy the menu before trying to initialize again.");
			return;	
		}
		if(this.$element.hasClass("left-side")) this.options.side="left";
		if(this.$element.hasClass("horizontal-open")) this.options.panelDirection="horizontal";
		
		if(document.readyState !== 'complete') $(document).on("ready",this.resize());
		else this.resize();
		var instance=this;
		$(window).resize(function(event) {
			SlideMenu.prototype.resize.apply(instance); 
		});
		
		var top=0;
		$(".menu-item",this.$element).each(function(index, element) {
			$(element).css("position","absolute");  
			$(element).attr("data-index",index);              
			$(element).css("top",top + "px");
			top+=$(element).height();
		});
		
		this.$element.off("click").on("click",".menu-item",this,this.menuClick);		
	}
	SlideMenu.prototype.menuClick = function(event) {		
		var instance=event.data;
		if($(event.currentTarget).hasClass("active")) {//Close this menu item since it's the only one open
			instance.close(event,instance);
		} else if($(event.currentTarget).parents(".slide-menu").hasClass("active")) { //Close open menu and move new menu into place
			instance.switchMenus(event,instance);
		} else {//Open the menu that was selected
			instance.openMenu(event,instance);
		}		
	}
	SlideMenu.prototype.getDefaults = function () {
		return SlideMenu.DEFAULTS
	}	
	SlideMenu.prototype.getOptions = function (options) {
		options = $.extend({}, this.getDefaults(), this.$element.data(), options);		
		if(options.iconWidth!=="") {
			options.autoIconWidth=false;
		}
		if(options.panelWidth!=="") {
			options.autoPanelWidth=false;	
		}
		return options;
	}
	SlideMenu.prototype.resize = function() {
		var changed=false;
		//Perform calculations
		var topOffset=0;
		if(typeof(this.options.top)=="number") {
			topOffset=this.options.top;
			this.$element.css("top",this.options.top + "px");
		}
		var bottomOffset=0;
		if(typeof(this.options.bottom)=="number") {
			bottomOffset=this.options.bottom;
		}
		var menuHeight=$(window).height()-topOffset-bottomOffset;
		if(menuHeight != this.$element.height()) {
			changed=true;	
		}
		if(this.options.autoIconWidth && $(".menu-icon",this.$element).outerWidth(true)>this.options.iconWidth) {
			this.options.iconWidth=$(".menu-icon",this.$element).outerWidth(true);
			changed=true;
		}
		if(this.options.autoPanelWidth && $(".menu-panels",this.$element).width() != this.options.panelWidth) {
			this.options.panelWidth=$(".menu-panels",this.$element).width();
			changed=true;				
		}
		this.options.width=this.options.panelWidth+this.options.iconWidth;
		//Init Once
		
		if(this.options.show==false) this.show();
		
		if(changed) {				
			this.$element.width(this.options.width);
			this.$element.height(menuHeight).css("top",topOffset);
			$(".menu-panels",this.$element).height(menuHeight);
			if(this.options.side=="right") {
				var itemsLeft = -this.options.iconWidth - parseInt($(".menu-items",this.$element).css("border-left-width"));
				$(".menu-items",this.$element).css("left",itemsLeft + "px");
				if(this.$element.hasClass("active")) {
					$(".menu-panels",this.$element).css("left",-this.options.width + "px");
				} else {
					if(this.options.panelDirection=="vertical") {
						$(".menu-panels",this.$element).css("left",-this.options.width + "px").css("bottom","100%");
					} else {
						$(".menu-panels",this.$element).css("left","0px");
					}
				}
			} else {
				
			}
			$(".menu-close",this.$element).css("width",this.options.iconWidth + "px");
		}
	}
	SlideMenu.prototype.openMenu=function(event,instance) {
		instance.$element.trigger("slidemenu.beforeOpen");
		instance.$element.addClass("active");
		$(event.currentTarget).addClass("active");
		
		var movement={};
		if(instance.options.side == "right") {
			var leftBorder=parseInt($(".menu-items",instance.$element).css("border-left-width"));
			var left=parseInt($(".menu-items",instance.$element).css("left"));
			movement={left:parseInt(-instance.options.width-left-leftBorder) + "px"};
		} else if(instance.options.side=="left") {
			var left=parseInt($(".menu-items",instance.$element).css("left"));				
			movement={right:parseInt(-instance.options.width+instance.options.iconWidth) + "px"};
		}
		var optionObj={
			duration:250,
			complete:function() {
				if($(".menu-item.active",instance.$element).css("top")!="0px") {
					instance.reorder(function() {
						instance.$element.trigger("slidemenu.opened");
						instance.openPanel($(event.currentTarget).data("target"));
					});
				} else {
					instance.$element.trigger("slidemenu.opened");
					instance.openPanel($(event.currentTarget).data("target"));
				}
			}
		};
		$(".menu-item.active",instance.$element).animate(movement,optionObj);	
	}
	SlideMenu.prototype.switchMenus = function(event, instance) {
		instance.closePanel();
		//Slide new menu out
		var movement={};
		if(instance.options.side == "right") {
			var leftBorder=parseInt($(".menu-items",instance.$element).css("border-left-width"));
			var left=parseInt($(".menu-items",instance.$element).css("left"));
			movement={left:parseInt(-instance.options.width-left-leftBorder) + "px"};
		} else if(instance.options.side=="left") {
			var left=parseInt($(".menu-items",instance.$element).css("left"));				
			movement={right:parseInt(-instance.options.width+instance.options.iconWidth) + "px"};
		}
		var switchOpts={
			duration:250,
			complete:function() {
				instance.reorder(function() {
					instance.openPanel($(event.currentTarget).data("target"));
				});
			}
		}
		$(event.currentTarget).stop().animate(movement,switchOpts);
		//Slide current menu in
		var movement={};
		if(instance.options.side == "right") {
			movement={left:"0px"};
		} else if(instance.options.side=="left") {
			movement={right:"0px"};
		}
		$(".menu-item.active",instance.$element).animate(movement,250,function() {
			$(this).removeClass("active");
		});
		$(".menu-item.active",instance.$element).removeClass("active");
		$(event.currentTarget).addClass("active");
	}
	SlideMenu.prototype.close = function(callback) {
		this.$element.trigger("slidemenu.beforeClose");
		var instance=this;
		var movement={};
		if(instance.options.side == "right") {
			movement={left:"0px"};
		} else if(this.options.side=="left") {
			movement={right:"0px"};
		}
		this.closePanel();
		var closeOpts={
			duration:250,
			complete:function() {
				instance.$element.removeClass("active");
				instance.$element.trigger("slidemenu.closed");
				if(typeof(callback)=="function") callback();
				$(".menu-item.active",instance.$element).removeClass("active");
				//Move tiles back to their places
				instance.reorder();
			}
		};
		$(".menu-item.active",instance.$element).stop().animate(movement,closeOpts);
	}
	SlideMenu.prototype.openPanel = function(target) {
		$(".menu-panel.active",this.$element).removeClass("active");
		$(target,this.$element).addClass("active");
		$(".menu-panel.active",this.$element).css("padding-top",$(".menu-item.active",this.$element).outerHeight(true) + "px");
		if(this.options.panelDirection=="vertical") {
			$(".menu-panels",this.$element).animate({bottom:"0%"},250,'linear');
		} else if(this.options.panelDirection=="horizontal") {
			var movement={};
			if(this.options.side == "right") {
				movement={left:parseInt(-this.options.width) + "px"};
			} else if(this.options.side=="left") {			
				movement={left:this.options.iconWidth + "px"};
			}
			$(".menu-panels",this.$element).stop().animate(movement,250,'linear');
		}
	}
	SlideMenu.prototype.closePanel = function(callback) {
		var movement={};
		var instance=this;
		if(this.options.side == "right") {
			movement={left:parseInt(-this.options.iconWidth) + "px"};
		} else if(this.options.side == "left") {			
			movement={left:parseInt(-this.options.panelWidth + this.options.iconWidth) + "px"};	
		}
		var closeOpts={
			duration:250,
			complete:function() {
				$(".menu-panel.active",instance.$element).removeClass("active");
				if(instance.options.panelDirection=="vertical") {
					var left=0;
					if(instance.options.side == "right") {
						$(this).css("bottom","100%").css("left",-instance.options.width + "px");
					} else if(instance.options.side=="left") {			
						$(this).css("bottom","100%").css("left",instance.options.iconWidth + "px");
					}					
				}	
			}
		};
		$(".menu-panels",instance.$element).stop().animate(movement,closeOpts);
	}
	SlideMenu.prototype.open = function(target) {
		$(".menu-item[data-target='" + target + "']",this.$element).click();
	}
	SlideMenu.prototype.hide = function(callback) {
		//Slide the menu out the side
		var instance=this;
		if(this.isOpen()) instance.close(
			function() {
				hideSlideMenu();
			}
		);
		else hideSlideMenu();
		
		function hideSlideMenu() {
			if(instance.options.side=="right") {
				$(".menu-panels",instance.$element).css("left","0px");
				$(".menu-items",instance.$element).animate({left:"0px"},250);					
			} else {
				$(".menu-panels",instance.$element).css("left","0px")
				$(".menu-items",instance.$element).animate({left:-instance.options.width + "px"},250);
			}
			instance.options.show=false;
		}
	}
	SlideMenu.prototype.show = function(callback) {
		if(this.options.show==true) return;
		var instance=this;
		//Slide the menu in from the side
		if(parseInt($(".menu-items",instance.$element).css("right")) == 0 || parseInt($(".menu-items",instance.$element).css("left")) == 0) {
			if(this.options.side=="right") {
				var itemsLeft = -instance.options.iconWidth - parseInt($(".menu-items",instance.$element).css("border-left-width"));
				var animateOptions={
					duration:250,
					complete:function() {
						if(instance.options.panelDirection=="vertical") {
							$(".menu-panels",instance.$element).css("left",-instance.options.width + "px").css("bottom","100%");
						} else if(instance.options.panelDirection=="horizontal") {
							$(".menu-panels",instance.$element).css("left",itemsLeft + "px").css("top","0px");
						}
						instance.options.show=true;
						instance.resize();
						if(typeof(callback)=="function") callback();
					}
				}
				$(".menu-items",instance.$element).css("left","0px").animate({left:itemsLeft + "px"},animateOptions);
			} else {
				var itemsLeft = -instance.options.width+instance.options.iconWidth;
				var animateOptions={
					duration:250,
					complete:function() {
						if(instance.options.panelDirection=="vertical") {
							$(".menu-panels",instance.$element).css("left",instance.options.iconWidth + "px").css("bottom","100%");
						} else if(options.panelDirection=="horizontal") {
							$(".menu-panels",instance.$element).css("left",itemsLeft + "px").css("top","0px");
						}
						instance.options.show=true;
						instance.resize();
						if(typeof(callback)=="function") callback();
					}
				}
				$(".menu-items",instance.$element).css("left",-instance.options.width + "px").animate({left:itemsLeft + "px"},animateOptions);					
			}
		}
		instance.options.initialized=true;		
	}
	SlideMenu.prototype.generateID=function() {
		var prefix="slidemenu-panel-";
		var counter=1;
		var panelID=prefix + counter;
		while($("#" + panelID).length>0) {
			counter++;
			panelID=prefix + counter;
		}
		return panelID;
	}
	SlideMenu.prototype.addTab = function(args) {
		//Get ID from content
		var tab=$(args.tab);
		var content=$(args.content);
		var id=$(content).attr("id");
		if(id===undefined) {
			$(content).attr("id",this.generateID());
		}
		$(tab).attr("data-target",$(content).attr("id"));
		if($(tab).hasClass("menu-item")==false) $(tab).addClass("menu-item");
		if($(content).hasClass("menu-panel")==false) $(content).addClass("menu-panel");
		$(".menu-items",this.$element).append(tab);
		$(".menu-panels",this.$element).append(content);
		this.reorder();		
	}
	SlideMenu.prototype.removeTab = function(target) {
		$(".menu-item[data-target='" + target + "']",this.$element).replaceWith("");
		$(target,this.$element).replaceWith("");
		this.reorder();
	}
	SlideMenu.prototype.hideTab = function(target) {
		if($(".menu-item[data-target='" + target + "']",this.$element).hasClass("active")) {
			//If panel is open then close the menu
			var instance=this;
			this.close(function() {
				$(".menu-item[data-target='" + target + "']",instance.$element).hide();
			});
		} else {
			$(".menu-item[data-target='" + target + "']",this.$element).hide();
			//Rearrange tiles
			this.reorder();
		}
	}
	SlideMenu.prototype.showTab = function(target) {
		$(".menu-item[data-target='" + target + "']",this.$element).show();
		//Rearrange tiles
		this.reorder();
	}
	SlideMenu.prototype.changePosition = function(args) {
		var target=args.target;
		var position=args.position;
		var item=$(".menu-item[data-target='" + target + "']",this.$element);
		$(".menu-item[data-target='" + target + "']",this.$element).replaceWith("");
		if(position==1) {
			$(".menu-items",this.$element).prepend(item);
		} else {
			$(".menu-item:nth-child(" + parseInt(position-1) + ")",this.$element).after(item);
		}
		this.reorder();
	}
	SlideMenu.prototype.reorder = function(callback) {
		var top=0;		
		if($(".menu-item.active",this.$element).css("top")=="0px") {
			if(typeof(callback)==="function") callback();
		} else {		
			if($(".menu-item.active",this.$element).length>0) {
				var animateOptions={
					duration:250,
					complete: function() {
						if(typeof(callback)==="function") callback();
					}
				};
				$(".menu-item.active",this.$element).animate({top: top + "px"},animateOptions);
				top+=$(".menu-item.active",this.$element).height();
			}
		}
		//If there is an open tab then move the first element below it
		if($(".menu-item.active").length) top = $(".menu-item.active").height();
		$(".menu-item:visible",this.$element).each(function(index, element) {
			if($(element).hasClass("active")==false) {
				$(element).animate({top: top + "px"},250);
				top+=$(element).height();
			}
		});
	}
	SlideMenu.prototype.disable = function(target) {
		this.options.enabled=false;
	}
	SlideMenu.prototype.enable = function(target) {
		this.options.enabled=true;
	}
	SlideMenu.prototype.isOpen = function() {
		return this.$element.hasClass("active");
	}
	SlideMenu.prototype.destroy = function() {
		this.$element.css("width","").css("height","").css("top","");
		this.$element.find(".menu-items").css("left","");
		this.$element.find(".menu-panels").css("height","").css("left","").css("bottom","");
		this.$element.find(".menu-item").css("position","").css("top","").css("left","");
		this.$element.find(".menu-close").css("width","");
		this.$element.find(".menu-panel").css("padding-top","");
		delete this.options;
		delete this.$element;
	}

	function Plugin(option,args) {
		return this.each(function () {
			var $this   = $(this);
			var data    = $this.data('slidemenu');
			var options = typeof option == 'object' && option;
			
			if (!data) $this.data('slidemenu', (data = new SlideMenu(this, options)));
			if (typeof option == 'string') data[option](args);
		});
	}
	
	var old = $.fn.slidemenu;
	
	$.fn.slidemenu = Plugin;
	$.fn.slidemenu.Constructor = SlideMenu;	
	
	// Slidemenu NO CONFLICT
	// ===================	
	$.fn.slidemenu.noConflict = function () {
		$.fn.slidemenu = old
		return this
	}
	
}( jQuery ));