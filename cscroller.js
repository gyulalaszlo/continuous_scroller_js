/*
    InfinityScroller
    
    Create the Google Reader-type of endless scrolling on (almost) any page.
    
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
*/


/**
    See README for more info or go to 
                
        http://github.com/gyulalaszlo/csscroller
        
    to obtain your copy.
*/

thepaw = {}

thepaw.ContinousScroller = Class.create()
thepaw.ContinousScroller.prototype = { 
    

    initialize: function(content_div_id, url_generator, options) {
        
        this.options = $H( thepaw.ContinousScroller.DefaultConfiguration ).merge(options)
        this.url_generator = (typeof url_generator.next == 'undefined' ?
            $H(thepaw.ContinousScroller.DefaultUrlGenerator ).merge(url_generator) : url_generator)
        
        this.div_id = content_div_id
        this.updateInProgress = false
        
        new Insertion.After( this.div_id, 
            "<div id=\"continous_scroller_loading_placeholder\" stlye\"display:none;\">" +
            options.loading_placeholder + "</div>")

        this.updater = new PeriodicalExecuter( function(pe) {
            var t = pe.target_obj
            if (t == null) return
            if (!t.updateInProgress && 
                    (thepaw.third_party.getPageHeight() - 
                    thepaw.third_party.getScrollHeight()) < t.options.trigger_height) {
            	    t.updateInProgress = true;
            	    t.getMoreContent();
            }
        }, this.options.check_interval );
        this.updater.target_obj = this
      	            
    }, 
    
    getMoreContent: function(){
        var t = this
		var placeholder_div = $( this.placeholderDivId )
		placeholder_div.show()

		// LoadStart Callback
		this.options.onSegmentLoadStart()
		
        new Ajax.Request(this.url_generator.next()  , {
            method: 'get', 
            onSuccess: function(transport) {
				t.options.onSegmentLoadComplete( transport )

                // No more elements for us. Stop.
                if (transport.responseText.length < 300) t.updater.stop()
                
                // Update the content
                new Insertion.Bottom(t.div_id, transport.responseText)
                placeholder_div.hide()
                t.updateInProgress = false;
				t.options.onSegmentInsertComplete()

            }, 
            
            onFailure: function(transport) {
				t.options.onSegmentLoadFaliure( transport )	
                new Insertion.bottom( t.div_id, 
                    "<div id='continous_scroll_failiure_notice'>" + t.options.failiure_message 
                    + "</div>"
                )
            }

        })
    },
    
    placeholderDivId:'continous_scroller_loading_placeholder'
    
}


thepaw.ContinousScroller.DefaultConfiguration = {
    check_interval:0.2,
    trigger_height:1000,
    failiure_message: "Error while trying to fetch the new items." +
                        "Check your internet connection...",
    loading_placeholder: "Loading newer items...",
    uid:"continous_scroller_uid",

	onSegmentLoadStart:function() { },
	onSegmentLoadComplete:function(transport) { },
	onSegmentInsertComplete:function() { },
	onSegmentLoadFaliure:function(transport) { }
}

thepaw.ContinousScroller.DefaultUrlGenerator = {
    url:null,
    start_index:1,
    default_spacing:1,
    
    next: function() {
        if (typeof this.current_index == "undefined") this.current_index = this.start_index
        this.current_index += this.default_spacing
                
        var tmp_url = ( this.url == null ? "?page=$page_num$" : this.url )
        return tmp_url.replace('$page_num$', this.current_index)
    }
    

}



/*
	The third_party module contains code originally developed by:
	
	[ Aza Raskin ](http://azarask.in/blog/)
	
	for:
	
	[ Humanized reader ](http://humanized.com/reader)
	
*/
thepaw.third_party = {

    getPageHeight: function (){
        var y;
        var test1 = document.body.scrollHeight;
        var test2 = document.body.offsetHeight
        if (test1 > test2) // all but Explorer Mac
        {
            y = document.body.scrollHeight;
        }
        else // Explorer Mac;
             //would also work in Explorer 6 Strict, Mozilla and Safari
        {
            y = document.body.offsetHeight;
        }
        return parseInt(y);
    },

    _getWindowHeight: function (){
        if (self.innerWidth)
        {
            frameWidth = self.innerWidth;
            frameHeight = self.innerHeight;
        }
        else if (document.documentElement && document.documentElement.clientWidth)
        {
            frameWidth = document.documentElement.clientWidth;
            frameHeight = document.documentElement.clientHeight;
        }
        else if (document.body)
        {
            frameWidth = document.body.clientWidth;
            frameHeight = document.body.clientHeight;
        }
        return parseInt(frameHeight);
    },


    getScrollHeight: function (){
        var y;
        // all except Explorer
        if (self.pageYOffset)
        {
            y = self.pageYOffset;
        }
        else if (document.documentElement && document.documentElement.scrollTop)   
        {
            y = document.documentElement.scrollTop;
        }
        else if (document.body) // all other Explorers
        {
            y = document.body.scrollTop;
        }
        return parseInt(y)+thepaw.third_party._getWindowHeight();
    }

}