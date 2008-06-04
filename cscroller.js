/*
    InfinityScroller
    
    Create the Google Reader-type of endless scrolling on (almost) any pages.
    
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

thepaw = {}


thepaw.ContinousScroller = Class.create()
thepaw.ContinousScroller.prototype = { 
    
    /**
        Create a continous scroller. Only one instance per page...
        Parameters:
        
            uid:   A unique ID to identify this scroller. Used to store
                   the scroll state to restore after the back button is pressed.
                   
            content_div_id:   The div to serve the content into.
            
            url:   The url to go for updates. Like "/top10/$page_num$" . 
                   $page_num$ gets replaced with the page index (starting from 0)
                   
        
        Options:
        
            check_interval:     The interval between checks (seconds). Default is 0.2
            
            trigger_height:     The maximum distance from the bottom where the
                                content update gets triggered (pixels). Default is 1000
            
            failiure_message:   The message to show on the bottom when the
                                scroller can't load the next page.
            
            loading_placeholder:    The placeholder text to show when the loading is 
                                    still in progress.
                                    
            next_segment_id_generator:    The function to get the next segment's id (the one
                                          in the url)   from the current id.
                                          The default is 
                                            function(idx) { return idx + 1 }
        Example:
        
        new thepaw.ContinousScroller("personal_programs", "recommended_programs", "/my_top10/$page_num$", {
			"loading_placeholder":'<div class="white_box">'+
					'<img src="/images/ajax-loader.gif" style="vertical-align:middle;"/>' +
					'<b>One moment, loading the page/b>'+
					'</div>'
			"failiure_notice":"An error occured. Check your connection...",
			"next_segment_id_generator":function(idx) { return idx + 10 }
		})
    */
    initialize: function(uid, content_div_id, url, options) {
        
        options = $H({
            "check_interval":0.2,
            "trigger_height":1000,
            "failiure_message": "Error while trying to fetch the new items." +
                                "Check your internet connection...",
            "loading_placeholder": "Loading newer items...",
            "next_segment_id_generator": function(idx) { return idx + 1 }
        }).merge(options)
        
        this.scroller_uid = "cont_scroll_" + String(uid)
        this.div_id = content_div_id
        this.url = url
        this.options = options
        this.updateInProgress = false
        this.next_segment_id_generator = options.next_segment_id_generator
        
        new Insertion.Before( this.div_id, 
            '<input type="hidden" id="continous_scroll_index" name="scroll_index" value="0"/>')

        new Insertion.After( this.div_id, "<div id=\"continous_scroller_loading_placeholder\" stlye\"display:none;\">" +
            options.loading_placeholder + "</div>")

        
        this.updater = new PeriodicalExecuter(function(pe) {
            var t = pe.target_obj
            if (t == null) return
            if (!t.updateInProgress && 
                getPageHeight() - getScrollHeight() < t.options.trigger_height) {
                    // Set a cookie to store for later viewing. Is this necessary?
                    setCookie(t.scroller_uid, $F("continous_scroll_index") );
            	    t.updateInProgress = true;
            	    t.getMoreContent();          
            }
        }, this.options.check_interval);
        this.updater.target_obj = this
    }, 
    
    getMoreContent: function(){
        var t = this
        var next_page_idx = this.next_segment_id_generator(Math.round($F('continous_scroll_index')))
        $('continous_scroller_loading_placeholder').show()
        new Ajax.Request(this.url.replace('$page_num$', next_page_idx), {
            method: 'get', 
            onSuccess: function(transport) {
                // No more elements for us. Stop.
                if (transport.responseText.length < 300) {
                    t.updater.stop()
                }
                
                // Update the content
                new Insertion.Bottom(t.div_id, transport.responseText)
                $('continous_scroll_index').value = next_page_idx
                $('continous_scroller_loading_placeholder').hide()
                t.updateInProgress = false;
            }, 
            
            onFailure: function(transport) {
                new Insertion.bottom( t.div_id, 
                    "<div id='continous_scroll_failiure_notice'>" + t.options.failiure_message 
                    + "</div>"
                )
            }

        })
    }
}