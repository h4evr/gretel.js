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

        Gretel.registerRoute("this/is/a/route/with/a/{param}/and/an/[{optionalid}]", handler, thisObj);

## Example

See `index.html` for an usage example.
