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
	
	var options={
		side:"right",
		panelDirection:"vertical",
		iconWidth:"",
		panelWidth:"",
	};
	
	var settings={
		autoIconWidth:true,
		autoPanelWidth:true
	}
	
	var initialized=false;
	
	var methods={
		init : function( opts ) { 
			var $this=$(this.selector,$(this.context));
			if($this.data("initialized")===true) {
				console.log("Menu is already initialized. Destroy the menu before trying to initialize again.");
				return;	
			} else {
				$this.data("initialized",true);	
			}
			if($this.hasClass("left-side")) options.side="left";
			if($this.hasClass("horizontal-open")) options.panelDirection="horizontal";
			//Set options
			if(opts !== undefined) {
				if(opts.iconWidth !== undefined) {
					options.iconWidth=opts.iconWidth;
					settings.autoIconWidth=false;	
				}
				if(opts.panelWidth !== undefined) {
					options.panelWidth=opts.panelWidth;
					settings.autoPanelWidth=false;	
				}
			}
			if(document.readyState !== 'complete') {
				$(document).ready(function() {
					methods.resize($this);	
				});
			} else {
				methods.resize($this);	
			}
			$(window).on("resize",function(event) {
				methods.resize($this)	
			});
			methods.resetMenus($this);
			$this.off("click").on("click",".menu-item",methods.menuHeaderClick);			
		},
		initOnce : function($this) {
			initialized=true;
			if(parseInt($(".menu-items",$this).css("right")) == 0 || parseInt($(".menu-items",$this).css("left")) == 0) {
				if(options.side=="right") {
					var itemsLeft = -options.iconWidth - parseInt($(".menu-items",$this).css("border-left-width"));
					$(".menu-items",$this).css("left","0px").animate({left:itemsLeft + "px"},500, function() {
						if(options.panelDirection=="vertical") {
							$(".menu-panels",$this).css("left",-options.width + "px").css("bottom","100%");
						} else if(options.panelDirection=="horizontal") {
							$(".menu-panels",$this).css("left",itemsLeft + "px").css("top","0px");
						}
						methods.resize($this);
					});					
				} else {
					var itemsLeft = -options.width+options.iconWidth ;
					$(".menu-items",$this).css("left",-options.width + "px").animate({left:itemsLeft + "px"},500, function() {
						if(options.panelDirection=="vertical") {
							$(".menu-panels",$this).css("left",options.iconWidth + "px").css("bottom","100%");
						} else if(options.panelDirection=="horizontal") {
							$(".menu-panels",$this).css("left",itemsLeft + "px").css("top","0px");
						}
						methods.resize($this)
					});					
				}
			}			
		},
		resize : function($this) {
			var changed=false;
			//Perform calculations
			var topOffset=0;
			if($this.prev().length!=0) {
				var topOffset=$this.prev().offset().top+$this.prev().height();
			}
			var menuHeight=$(window).height()-topOffset;
			if(menuHeight != $this.height()) {
				changed=true;	
			}
			if(settings.autoIconWidth && $(".menu-icon",$this).outerWidth(true)>options.iconWidth) {
				options.iconWidth=$(".menu-icon",$this).outerWidth(true);
				changed=true;
			}
			if(settings.autoPanelWidth && $(".menu-panels",$this).width() != options.panelWidth) {
				options.panelWidth=$(".menu-panels",$this).width();
				changed=true;				
			}
			options.width=options.panelWidth+options.iconWidth;
			if(initialized==false) methods.initOnce($this);
			if(changed) {				
				$this.width(options.width);
				$this.height(menuHeight).css("top",topOffset);
				if(options.side=="right") {
					var itemsLeft = -options.iconWidth - parseInt($(".menu-items",$this).css("border-left-width"));
					$(".menu-items",$this).css("left",itemsLeft + "px");
					if($this.hasClass("active")) {
						$(".menu-panels",$this).css("left",-options.width + "px");
					} else {
						if(options.panelDirection=="vertical") {
							$(".menu-panels",$this).css("left",-options.width + "px").css("bottom","100%");
						} else {
							$(".menu-panels",$this).css("left","0px");
						}
					}
				} else {
					
				}
				$(".menu-close",$this).css("width",options.iconWidth + "px");
			}
			
		},
		resetMenus:function($this) {
			var top=0;
			$this.find(".menu-item").each(function(index, element) {
				$(element).css("position","absolute");  
				$(element).attr("data-index",index);              
				$(element).css("top",top + "px");
				top+=$(element).height();
            });
		},
		menuHeaderClick:function(e) {			
			if($(e.currentTarget).hasClass("active")) {//Close this menu item since it's the only one open
				methods.closeMenu(e);
			} else if($(e.currentTarget).parents(".slide-menu").hasClass("active")) { //Close open menu and move new menu into place
				methods.switchMenus(e);
			} else {//Open the menu that was selected
				methods.showMenu(e);
			}
		},
		closeMenu:function(e) {
			var element=$(e.currentTarget);
			var $this=$(element).parents(".slide-menu");
			$this.trigger("slidemenu.beforeClose");
			var movement={};
			if(options.side == "right") {
				movement={left:"0px"};
			} else if(options.side=="left") {
				movement={right:"0px"};
			}
			methods.closePanel($this);
			$(".menu-item.active",$this).stop().animate(movement,250,function() {
				$this.removeClass("active");
				$this.trigger("slidemenu.closed");
				$(".menu-item.active",$this).removeClass("active");
				//Move tiles back to their places
				var top=0;
				$this.find(".menu-item").each(function(index, element) {
					$(element).animate({top: top + "px"},250);
					top+=$(element).height();
				});
			});
		},
		switchMenus:function(event) {
			var $this=$(event.currentTarget).parents(".slide-menu");
			methods.closePanel($this);
			//Slide new menu out
			var movement={};
			if(options.side == "right") {
				var leftBorder=parseInt($(".menu-items",$this).css("border-left-width"));
				var left=parseInt($(".menu-items",$this).css("left"));
				movement={left:parseInt(-options.width-left-leftBorder) + "px"};
			} else if(options.side=="left") {
				var left=parseInt($(".menu-items",$this).css("left"));				
				movement={right:parseInt(-options.width+options.iconWidth) + "px"};
			}
			$(event.currentTarget).stop().animate(movement,250,function() {
				//Adjust position of menus
				$(event.currentTarget).animate({top:"0px"},250,function() {
					//Show Panel
					methods.openPanel($this,$(event.currentTarget).data("target"));
				});
				var itemIndex=$(event.currentTarget).data("index");
				var top=$(event.currentTarget).height();
				$(".menu-item",$this).each(function(index, element) {
                    if(parseInt($(element).data("index"))!=itemIndex) {
						$(element).animate({top: top + "px"},250);
						top+=$(element).height();
					}
                });
			});
			//Slide current menu in
			var movement={};
			if(options.side == "right") {
				movement={left:"0px"};
			} else if(options.side=="left") {
				movement={right:"0px"};
			}
			$(".menu-item.active",$this).animate(movement,250,function(ui) {
				$(this).removeClass("active");
			});
			
			$(event.currentTarget).addClass("active");	
		},
		showMenu:function(event) {
			var $this=$(event.currentTarget).parents(".slide-menu");
			$this.trigger("slidemenu.beforeOpen");
			$this.addClass("active");
			$(event.currentTarget).addClass("active");
			
			var movement={};
			if(options.side == "right") {
				var leftBorder=parseInt($(".menu-items",$this).css("border-left-width"));
				var left=parseInt($(".menu-items",$this).css("left"));
				movement={left:parseInt(-options.width-left-leftBorder) + "px"};
			} else if(options.side=="left") {
				var left=parseInt($(".menu-items",$this).css("left"));				
				movement={right:parseInt(-options.width+options.iconWidth) + "px"};
			}
			
			$(".menu-item.active",$this).animate(movement,250,function() {
				//shift other menu items down
				var itemIndex=parseInt($(".menu-item.active").data("index"));
				var height=$(".menu-item.active").height();
				$(".menu-item",$this).each(function(index, element) {
                    if(parseInt($(element).data("index"))<itemIndex) {
						var currentTop=parseInt($(element).css("top"));
						$(element).animate({top: currentTop + height},250);
					}
                });
				if($(".menu-item.active",$this).css("top")!="0px") {
					$(".menu-item.active",$this).animate({top:"0px"},250,function() {
						$this.trigger("slidemenu.opened");
						methods.openPanel($this,$(event.currentTarget).data("target"));
					});
				} else {
					$this.trigger("slidemenu.opened");
					methods.openPanel($this,$(event.currentTarget).data("target"));
				}
			});			
		},
		openPanel:function($this,target) {
			$(".menu-panel.active",$this).removeClass("active");
			$(target,$this).addClass("active");
			if(options.panelDirection=="vertical") {
				$(".menu-panels",$this).animate({bottom:"0%"},250,'linear');
			} else if(options.panelDirection=="horizontal") {
				var movement={};
				if(options.side == "right") {
					movement={left:parseInt(-options.width) + "px"};
				} else if(options.side=="left") {			
					movement={left:options.iconWidth + "px"};
				}
				$(".menu-panels",$this).stop().animate(movement,250,'linear');
			}
		},
		closePanel:function($this) {
			var movement={};
			if(options.side == "right") {
				movement={left:parseInt(-options.iconWidth) + "px"};
			} else if(options.side == "left") {			
				movement={left:parseInt(-options.panelWidth + options.iconWidth) + "px"};	
			}
			$(".menu-panels",$this).stop().animate(movement,250,function() {
				$(".menu-panel.active",$this).removeClass("active");
				if(options.panelDirection=="vertical") {
					var left=0;
					if(options.side == "right") {
						$(this).css("bottom","100%").css("left",-options.width + "px");
					} else if(options.side=="left") {			
						$(this).css("bottom","100%").css("left",options.iconWidth + "px");
					}					
				}			
			});
		},
		isOpen:function(e) {
			return $(event.currentTarget).parents(".slide-menu").hasClass("active");
		}
	};

    $.fn.slideMenu = function(method) { 
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.slideMenu' );
		} 
    }; 
}( jQuery ));