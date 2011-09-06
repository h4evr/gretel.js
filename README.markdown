# gretel.js

*An HTTP request routing library for javascript*

**Author:** Diogo Costa (<costa.h4evr@gmail.com>)  
**Date:** 6 September 2011

## Goal

gretel.js is a javascript micro-library that targets the simplification of the routing of requests in an all-in-one-page application. 
Meaning that the developer will be able to simply define routes and what to do when a URL matches the route.

## Usage

1. **Include the gretel.js script in the head section of your page:**

        <script src="gretel.js"></script>

   If you do not wish the library to auto-install itself, define the variable `Gretel_disable_autostart`. You can install the router by manually calling `Gretel.install()`.

2. **Register your routes:**

        Gretel.registerRoute("module_name", "params_separated_by_/", handler);

## Example

    <html>
    <head>
        <title></title>
        <meta charset="utf8">
        <script src="gretel.js"></script>
        <script>
            var User = (function() {
                var actions = {
                    "new" : function(params) {
                        
                    },
                    
                    "edit" : function(params) {
                        
                    }
                };
                
                return function(action, params) {
                    if(typeof(actions[action]) !== "undefined")
                        (actions[action])(params);
                    else
                        Gretel.forward("page", "notfound");
                };
            })();

            Gretel.registerRoute("user", "id", User);
        </script>
    </head>
    <body>
    </body>
    </html> 
