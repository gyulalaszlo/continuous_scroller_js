/*
    InfinityScroller
    
    Create the Google Reader-type of endless scrolling on (almost) any page.
    
    (c) Copyright 2008 Gyula László. All Rights Reserved.
    
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA    
*/


/**
    See README for more info or go to 
        
        http://psinc.wordpress.com/cscroller_js
        
        or
        
        http://github.com/gyulalaszlo/csscroller
        
    to obtain your copy.
    
    Usage by example:
    
    <pre>
	new thepaw.ContinousScroller("recommended_programs",{ url:"/top10/$page_num$" }, {
		loading_placeholder:'<div class="white_box">Blah-blah</div>',
		check_interval:0.5,
		failiure_message:'<b>Something terrible happened.</b><br/>'+
		    'We cannot help you get any more content. Check your internet connection.'
	})
	</pre>
*/

thepaw = {}

thepaw.ContinousScroller = Class.create()
thepaw.ContinousScroller.prototype = { 
    
    /**
    new thepaw.ContinousScroller(content_div_id, url_generator, options)
    
    Create a continous scroller. Only one instance per page...
    
    Parameters:
    
               
        content_div_id:   
            The div to serve the content into.
        url_generator:
            The url generator to use. See "The default url generator"
            bit bellow.
    
    */
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
        $( this.placeholderDivId ).show()
        new Ajax.Request(this.url_generator.next()  , {
            method: 'get', 
            onSuccess: function(transport) {
                // No more elements for us. Stop.
                if (transport.responseText.length < 300) t.updater.stop()
                
                // Update the content
                new Insertion.Bottom(t.div_id, transport.responseText)
                $( t.placeholderDivId ).hide()
                t.updateInProgress = false;
            }, 
            
            onFailure: function(transport) {
                new Insertion.bottom( t.div_id, 
                    "<div id='continous_scroll_failiure_notice'>" + t.options.failiure_message 
                    + "</div>"
                )
            }

        })
    },
    
    placeholderDivId:'continous_scroller_loading_placeholder'
    
}



/**
    The default options
    =========================
    
    Options:
    
        check_interval:     
            The interval between checks (seconds). Default is 0.2
        
        trigger_height:     
            The maximum distance from the bottom where the content 
            update gets triggered (pixels). Default is 1000
        
        failiure_message:   
            The message to show on the bottom when the scroller 
            can't load the next page.
        
        loading_placeholder:    
            The placeholder text to show when the loading is still
            in progress.
                                
*/

thepaw.ContinousScroller.DefaultConfiguration = {
    check_interval:0.2,
    trigger_height:1000,
    failiure_message: "Error while trying to fetch the new items." +
                        "Check your internet connection...",
    loading_placeholder: "Loading newer items...",
    uid:"continous_scroller_uid"
}

/**
    The default url generator
    =========================
    
    A generator is a hash with a next() function which returns
    the url of the next segment to load. The second parameter of
    the ContinousScroller accepts hash or a custom url generator:
    
    Examples:
    
    <pre>
    
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
        // => 'items?from=0&until=10', 'items?from=0&until=10', '/pages/30'
        
    
        
    </pre>
*/

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



// These two functions are based on code from
// http://www.quirksmode.org/viewport/compatibility.html
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