# Slidemenu

Slidemenu is a jquery menu plugin for side menus with fun slide interactions. The project was inspired by the UX designs of [Rob Thomas](http://robbiethomas.me/).


## Usage

For an example of how to use slide menu open up the index.html file in the examples directory.


The html structure consists of:


```
div.slide-menu
  ul.menu-items
    li.menu-item
	  div.menu-icon
	  div.menu-content
	  div.menu-close
  div.menu-panels
    div.menu-panel
```


Include the following files on your page:

 * jQuery
 * jQueryUI (Used for animation)
 * dist/js/jquery.slidemenu.min.js
 * dist/css/slidemenu.min.css


Then initialize the menu using the following script

```js
$(function() {
  $(".slide-menu").slidemenu();
});
```


## Development



## Dist Directory

All dist versions of the code are produced in the [grunt](gruntjs.com) task named 'compile'. Ensure all dependencies are installed using [npm](https://npmjs.org/). Once all dependencies have been installed populate the dist folder using the command "grunt compile" using the command line.


The Javascript is minified using [Google's Closure Compiler](https://developers.google.com/closure/compiler/).


The css is produced using the [Grunt less compiler](https://github.com/gruntjs/grunt-contrib-less).


## License

Slidemenu is currently distributed using the MIT license