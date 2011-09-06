var Router = (function() {
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
		
		var fields = query.split(fieldSeparator);
		if(fields.length == 1) {
			fields.unshift("default");
		}
		return fields;
	}
	
	function registerRoute(name, params, handler, obj) {
		handlers[name] = [handler, obj, params.split(fieldSeparator)];
	}
	
	function redirect(module, action, params) {
		if(typeof(handlers[module]) !== "undefined") {
			var paramsIds = handlers[module][2];
			var paramsStr = [];
			
			paramsIds.forEach(function(name) {
				if(typeof params[name] !== "undefined") {
					paramsStr.push(params[name]);
				}
			});
			
			paramsStr = paramsStr.join(fieldSeparator);
			
			var url = "#/" + module + fieldSeparator + action;
			if(paramsStr.length > 0) {
				url += fieldSeparator + paramsStr;
			}
			
			window.location.href = url;
			
			throw new Error("StopProcessingHandlerException");
		} else {
			forward("page", "notfound");
		}
	}
	
	function forward(module, action, params) {
		if(typeof(handlers[module]) !== "undefined") {
			var handler = handlers[module];
			handler[0].call(handler[1], action, params);
			throw new Error("StopProcessingHandlerException");
		} else {
			forward("page", "notfound");
		}
	}
	
	/**
	 * Analyse the current URL, check for changes and act accordingly.
	 */
	function checkURL() {
		var url = window.location.href;
		
		if(url != lastQuery) {
			var info = parseURL(url);
			
			if(info.length >= 2) {
				if(typeof(handlers[info[0]]) !== "undefined") {
					var module = info.shift();
					var action = info.shift();
					var handler = handlers[module];
					var handlerParams = handler[2];
					var params = {};
					
					info.forEach(function(e, i) {
						if(typeof(handlerParams[i]) !== "undefined" && handlerParams[i].length > 0 && e.length > 0) {
							params[handlerParams[i]] = e;
						}
					});
					
					try {
						handler[0].call(handler[1], action, params);
					} catch(e) {
						if(e.message != "StopProcessingHandlerException") {
							throw e;
						}
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
	if(typeof(Router_disable_autostart) === "undefined")
		registerEvent('load', installRouter);
	
	return {
		install : installRouter,
		registerRoute : registerRoute,
		forward : forward,
		redirect : redirect
	};
})();
