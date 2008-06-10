# CScroller

#### An JavaScript Continous/Endless/Infinite scroller

CScroller enables you to add endless (infinite) scrolling to almost 
any webpage, without the need to generate special url-s or rewriting
the existing code. All this niceness with only a few lines of Javascript.


### Requirements:

*	__Prototype__: [http://prototypejs.org](http://prototypejs.org)
	Some recent version of prototype.js (probably any prototype.js you can find 
	lying around).

### Targeted platforms

CScroller runs on any browser, where Prototype works:

* Microsoft Internet Explorer for Windows, version 6.0 and higher
	(probably 5.5)
* Mozilla Firefox 1.5 and higher
* Apple Safari 2.0 and higher
* Opera 9.25 and higher
	(also confirmed working with Opera 9.20 bundled with Adobe CS3)

### Licence

The MIT License

(c) Copyright 2008 Gyula László

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Using CScroller

To use CScroller in your application, download the latest release from the 
[CScroller source site](http://github.com/gyulalaszlo/continuous_scroller_js) and copy 
<tt>cscroller.js</tt> to a suitable location. Then include it in your HTML
like so:

		<script type="text/javascript" src="/path/to/prototype.js"></script>
		<script type="text/javascript" src="/path/to/cscroller.js"></script>


#### Usage by example:

		new thepaw.ContinousScroller("recommended_programs",{ url:"/top10/$page_num$" }, {
			loading_placeholder:'<div class="white_box">Blah-blah</div>',
			check_interval:0.5,
			failiure_message:'<b>Something terrible happened.</b><br/>'+
			    'We cannot help you get any more content. Check your internet connection.'
		})

		new thepaw.ContinousScroller("recommended_programs", { url:"?page=$page_num$"}, {
			onSegmentLoadComplete:function(transport) {
				alert("downloaded stuff :" + transport)
			},
			loading_placeholder: "Loading more content, please wait..."
		})

For a live example, go to ["sziget.FM"](http://sziget.fm/top10).

## Constructor

	    new thepaw.ContinousScroller(content_div_id, url_generator, options)

Create a continous scroller. Only one instance per page...

### Parameters:


* __content_div_id:__
	The div to serve the content into.
* __url_generator:___
	The url generator to use. See "The default url generator"
	bit bellow.


### Options:

* __check_interval:__     
      The interval between checks (seconds). Default is 0.2

* __trigger_height:__     
      The maximum distance from the bottom where the content 
      update gets triggered (pixels). Default is 1000

* __failiure_message:__   
      The message to show on the bottom when the scroller 
      can't load the next page.

* __loading_placeholder:__    
	  The placeholder text to show when the loading is still
	  in progress.
	
#### Callbacks:

* __onSegmentLoadStart:__    
		<code> function() { ... } </code>    	
		Callback before starting to load a new segment.

* __onSegmentLoadComplete:__    
		<code> function(transport) { ... } </code>    
		Called after the AJAX request completed. The transport is the
		raw Protype transport. (use <code>transport.responseText</code>
		to get the raw response text)

* __onSegmentInsertComplete:__ <code>function() { }</code>    
		Called after the new contents have been inserted at the bottom.

* __onSegmentLoadFaliure:__    
		<code> function(transport) { ... } </code>    
		Called if the AJAX request fails. The transport is the
		raw Protype transport. (use <code>transport.responseText</code>
		to get the raw response text)
	

### The default url generator

A generator is a hash with a next() function which returns
the url of the next segment to load. The second parameter of
the ContinousScroller accepts hash or a custom url generator:

#### Examples:


	// Using the default url generator
	// we don't define next()

	{  url:"/pages/$page_num$.html"  } 
	    // => '/pages/1.html', '/pages/2.html', ....

	{  start_index:10, url:"/pages/$page_num$"  } 
	    // => '/pages/10', '/pages/11', '/pages/12', ...

	{  start_index:10, default_spacing:20, url:"/pages/$page_num$"  } 
	    // => '/pages/10', '/pages/20', '/pages/30', ...

	// Using a custom url generator
	// we simply define next()

	{  next:function() { return "?page_idx=" + Math.round(Math.random() * 100) } } 
	    // => '?page_idx=57', '?page_idx=19', '/pages/81', ...

	{  
	    idx = 0,
	    next:function() {
	        return "items?from=" + this.idx + "&until=" + (this.idx += 10) 
	    }
	} 
	    // => 'items?from=0&until=10', 'items?from=10&until=20', ...


### Credits

* [Aza Raskin](http://azarask.in/blog/):
 	* for the original implementation at [Humanized reader](http://humanized.com/reader)
	* parts of the code: the <code>thepaw.third_party</code> module
