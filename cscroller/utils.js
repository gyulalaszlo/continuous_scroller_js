    // These three functions are taken from code displayed on
    // http://www.netspade.com/articles/2005/11/16/javascript-cookies/

    /**
     * Sets a Cookie with the given name and value.
     *
     * name       Name of the cookie
     * value      Value of the cookie
     * [expires]  Expiration date of the cookie (default: end of current session)
     * [path]     Path where the cookie is valid (default: path of calling document)
     * [domain]   Domain where the cookie is valid
     *              (default: domain of calling document)
     * [secure]   Boolean value indicating if the cookie transmission requires a
     *              secure transmission
     */
    function setCookie(name, value, expires, path, domain, secure) {
        document.cookie= name + "=" + escape(value) +
            ((expires) ? "; expires=" + expires.toGMTString() : "") +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            ((secure) ? "; secure" : "");
    }

    /**
     * Gets the value of the specified cookie.
     *
     * name  Name of the desired cookie.
     *
     * Returns a string containing value of specified cookie,
     *   or null if cookie does not exist.
     */
    function getCookie(name) {
        var dc = document.cookie;
        var prefix = name + "=";
        var begin = dc.indexOf("; " + prefix);
        if (begin == -1) {
            begin = dc.indexOf(prefix);
            if (begin != 0) return null;
        } else {
            begin += 2;
        }
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
        return unescape(dc.substring(begin + prefix.length, end));
    }

/**
 * Deletes the specified cookie.
 *
 * name      name of the cookie
 * [path]    path of the cookie (must be same as path used to create cookie)
 * [domain]  domain of the cookie (must be same as domain used to create cookie)
 */
function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
        document.cookie = name + "=" +
            ((path) ? "; path=" + path : "") +
            ((domain) ? "; domain=" + domain : "") +
            "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

    // These two functions are based on code from
    // http://www.quirksmode.org/viewport/compatibility.html

    function getPageHeight(){
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
    }

    function _getWindowHeight(){
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
    }


    function getScrollHeight(){
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
        return parseInt(y)+_getWindowHeight();
    }
    
