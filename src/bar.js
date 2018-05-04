define(["util"], function($) {

function Bar(game_name)
{
	this.el = $.DIV("Bar");
	//~ this.el.append($.DIV("Menu", ""));
	var logo = $.EL('a', "Logo");
	logo.innerHTML = "Sniff";
	logo.href = "/";
	this.el.append(logo);
	this.el.append($.DIV("Prog", game_name));
	//~ this.el.append($.DIV("Debug", ""));
	this.el.append($.DIV("User",""));
	
	
	//~ var mediaQueryList = window.matchMedia("(orientation: portrait)"); // Create the query list.
	//~ function handleOrientationChange(mql) { ... } // Define a callback function for the event listener.

	//~ handleOrientationChange(); // Run the orientation change handler once.
		
	//~ return Bar;	
	
}
	
	
	return Bar;	
});
