var Gretel = (function() {
	// The timer used to monitor the URL
	var tmr = 0;
	var fieldSeparator = "/";
	var handlers = { };
	var lastQuery = null;
		
	function parseURL(url) {
		var questionMarkPos = url.indexOf("#");
		var query = "";
		
		if(questionMarkPos > 0) {
			query = url.substr(questionMarkPos + 1);
			if(query[0] == '/')
				query = query.substr(1);
		}

		return query;
	}
	
	/** 
	 * Try to find a route that matches the given url
	 * @returns The matching route info or false if none was found.
	 */
	function findMatchingRoute(url) {
		// Split the URL by the separators
		var urlParams = url.split(fieldSeparator);
		
		// Check if a set of possible matches exist
		if(typeof(handlers[urlParams[0]]) !== "undefined") {
			var variables = {};
			
			// Try to match the URL to each rule
			for(var j = 0, len = handlers[urlParams[0]].length; j < len; ++j) {
				var route = handlers[urlParams[0]][j];
				var routeParams = route[0];
				var optionalCount = route[1];
				
				if(routeParams.length - optionalCount > urlParams.length) {
					continue;
				}
				
				var isAMatch = true;
				var passed = 0;
				
				for(var i = 0; i < routeParams.length; ++i) {
					var p = routeParams[i];
					
					if(p['variable']) {
						variables[p['name']] = urlParams[i - passed];
					} else {
						if(p['name'] !== urlParams[i - passed]) {
							if(!p['optional']) {
								isAMatch = false;
								continue;
							} else {
								++passed;
							}
						}
					}
				}
				
				if(isAMatch) {
					return [route, variables];
				}
			}
			
			return false;
		} else {
			// No possible matches found
			return false;
		}
	}
	
	function registerRoute(route, handler, obj) {
		if(!route) {
			return false;
		}
		
		var params = route.split(fieldSeparator);
		
		if(typeof(handlers[params[0]]) === "undefined") {
			handlers[params[0]] = [];
		}
		
		var paramInfo = [];
		var optionalCount = 0;
		
		params.forEach(function(param) {
			var pI = {};
			
			// Is the parameter optional?
			if(param[0] === '[' && param[param.length - 1] === ']') {
				pI['optional'] = true;
				++optionalCount;
				// Remove the optionality chars
				param = param.substr(1, param.length - 2);
			} else {
				pI['optional'] = false;
			}
			
			// Is the parameter constant or a variable?
			if(param[0] === '{' && param[param.length - 1] === '}') {
				pI['variable'] = true;
				// Remove the optionality chars
				param = param.substr(1, param.length - 2);
			} else {
				pI['variable'] = false;
			}
			
			pI['name'] = param;
			paramInfo.push(pI);
		});
		
		handlers[params[0]].push([paramInfo, optionalCount, handler, obj]);
		
		return handler;
	}
	
	function redirect(url) {
		var routeAndParams = findMatchingRoute(url);
		
		if(routeAndParams !== false) {
			window.location.href = "#/" + url;
			throw new Error("StopProcessingHandlerException");
		} else {
			throw new Error("PageNotFound");
		}
	}
	
	function forward(url) {
		var routeAndParams = findMatchingRoute(url);
		
		if(routeAndParams !== false) {
			var route = routeAndParams[0];
			var params = routeAndParams[1];
			route[2].call(route[3], params);
			throw new Error("StopProcessingHandlerException");
		} else {
			throw new Error("PageNotFound");
		}
	}
	
	/**
	 * Analyse the current URL, check for changes and act accordingly.
	 */
	function checkURL() {
		var url = window.location.href;
		
		if(url != lastQuery) {
			var parsedURL = parseURL(url);
			
			var routeAndParams = findMatchingRoute(parsedURL);
			
			if(routeAndParams !== false) {
				try {
					var route = routeAndParams[0];
					var params = routeAndParams[1];
					
					route[2].call(route[3], params);
				} catch(e) {
					if(e.message != "StopProcessingHandlerException") {
						throw e;
					}
				}
			}
			
			lastQuery = url;
		}
	}
	
	/** 
	 * Install the router event handlers
	 */
	function installRouter() {
		registerRoute("page", "", function(action, params) {
			if(action == "notfound") {
				console.log("Page not found!");
			}
		});
		
		tmr = window.setInterval(checkURL, 250);
	}
	
	/** 
	 * Cross-browser function to register browser event handlers
	 */
	function registerEvent(event, callback) {
		if(window.addEventListener) {
			window.addEventListener(event, callback, false);
		} else if(window.attachEvent) {
			window.attachEvent('on' + event, callback);
		} else {
			window['on'+event] = callback;
		}
	}
	
	// Install the router
	if(typeof(Gretel_disable_autostart) === "undefined")
		registerEvent('load', installRouter);
	
	return {
		install : installRouter,
		registerRoute : registerRoute,
		forward : forward,
		redirect : redirect
	};
})();
