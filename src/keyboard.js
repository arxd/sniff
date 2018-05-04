define(["util"], function($) {

	
function Osk(coder)
{
	this.coder = coder;
	this.el = $.DIV("OSK");
	this.key_code = [
		55,56,57,43,1027, 1046,
		52,53,54,45,1009,1008,
		49,50,51,59,39, 1032,
		48,62,61,60,63, 1013];
	var key_txt = [
		"7", "8", "9", "+","ESC", "DEL",
		"4", "5", "6", "-", "RUN", "BS", 
		"1", "2", "3", "↔", "↕", "␣",
		"0", ">", "=", "<", "?", "↵"];
	
	for (var k=0; k < key_txt.length; ++k) {
		var key = $.DIV("key", key_txt[k]);
		key.key_code = this.key_code[k];
		//this.keys.push(key);
		this.el.append(key);
	}
	$.LISTEN(this, this.el, "mousedown", {capture:true});

}

Osk.prototype.lock_bottom = function()
{
	this.el.style.position = "fixed";
	this.el.style.bottom = 0;
	this.el.style.top = 0;
	this.el.style.right = 0;
}

Osk.prototype.on_mousedown = function(e)
{
	e.preventDefault();
	e.stopPropagation();
	var x = ( e.clientX- this.el.offsetLeft) / this.el.clientWidth*6;
	var y = (e.clientY- this.el.offsetTop) / this.el.clientHeight*4;
	console.log(x+ " "+ y + "  "+e.clientY + "  "+this.el.offsetTop);
	this.coder.inject_key(this.key_code[Math.floor(x)*6+Math.floor(y)]);
}

return Osk;
});
