
define([], function() {
	
function RPC(method, args, callback, url="/rpc/play")
{
	var xhr = new XMLHttpRequest();
	xhr.open("POST",url, true);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
	xhr.onreadystatechange = function () {
		if(xhr.readyState === XMLHttpRequest.DONE) {
			if( xhr.status === 200) {
				resp = JSON.parse(xhr.responseText)
				callback(resp.result);
			} else {
				alert(xhr.responseText);
			}
		}
	};
	xhr.send(JSON.stringify({method:method, params:args}));	

}

	
var DELAY = function* (clks)
{
	while(clks--)
		yield;
}
	
var DO = function(self, func)
{
	return function(e){func.call(self, e);}
};

var EL = function(type, className="", ns=null)
{
	var el = ns?document.createElementNS(ns, type) : document.createElement(type);
	if (className)
		el.setAttribute("class",className);
	return el;
};

var DIV =  function(className="", txt)
{
	var el = EL('div', className);
	if (Array.isArray(txt)) {
		for (var e=0; e < txt.length; ++e)
			el.appendChild(txt[e]);
	} else if (typeof txt === "string") {
		el.innerHTML = txt;
	}
	return el;
};

var TXT = function(txt)
{
	return document.createTextNode(txt);
};


var LISTEN = function(self, el, event, opts_func=null, func=null)
{
	var options = null;
	if (typeof opts_func === "function") {
		func = opts_func;
		options = {}
	} else {
		options = opts_func? opts_func : {};
	}
	func = func? func : self['on_'+event];
	el.addEventListener(event, DO(self, func), options);
};

return {RPC:RPC, LISTEN:LISTEN, EL:EL, DIV:DIV, TXT:TXT, DELAY:DELAY};
});

