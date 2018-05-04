
requirejs(['util', 'robot', 'Coder', 'keyboard', 'bar', 'howler'], function ($, RobotBase, Coder, Osk, Bar) {

function make_canvas(w,h)
{
	var canvas = $.EL('canvas');
	canvas.width = w;
	canvas.height = h;
	return canvas;
}
	
	
var Robot = function(coder)
{
	RobotBase.call(this, coder);
	this.el = $.DIV('Robot');
	//~ this.lvl_el = $.DIV('Levels');
	//~ for (var i =0; i < 3; ++i) {
		//~ var lvl = $.DIV('lvl', "Level "+i);
		//~ lvl.i =i;
		//~ $.LISTEN(this, lvl, 'click', function(e) {this.change_level(e.target);});
		//~ this.lvl_el.appendChild(lvl);
	//~ }

	this.canvas = make_canvas(550,340);
	//~ this.canvbg = make_canvas(550,340);
	
	//~ this.tiles = new Image();
	//~ $.LISTEN(this, this.tiles, 'load', function(e) {this.reset_bg();});
	//~ this.tiles.src = 'mousetiles.jpg';
	
	//~ this.cheese = new Image();
	//~ $.LISTEN(this, this.cheese, 'load', function(e) {this.reset_bg();});
	//~ this.cheese.src = 'cheese.png';
	
	//~ this.splash = new Image();
	//~ $.LISTEN(this, this.splash, 'load', function(e) {this.reset_bg();});
	//~ this.splash.src = 'splash.png';


	//~ this.mouseimg = new Image();
	//~ $.LISTEN(this, this.mouseimg, 'load', function(e) {this.reset_bg();});
	//~ this.mouseimg.src = 'mouse.png';
	
	//~ this.splash_sound = new Howl({src: ['splash.mp3']});
	//~ this.eat_sound = new Howl({src: ['eat.mp3']});
	
	//~ this.el.append(this.lvl_el);
	//~ this.el.append(this.canvas);
	
	// commands
	//~ this.coder.sym_add('slider', true, "");
	this.coder.sym_add('beep', true, "Make a beep");
	this.coder.sym_add('light', true, "Turn on a light");
	//this.coder.sym_add('left', true, "Turn this way ↺");

}

Robot.prototype = Object.create(RobotBase.prototype);



Robot.prototype.set_light = function* (sym, index, value, push)
{
	console.log("Light "+index+" : "+value);
	
	//this.change_color(value);
	//yield* $.DELAY(5);
	
	$.RPC("light", [index, value], function() {});
	
	return 0;
//	return yield* this.get_right(sym, index);
}

Robot.prototype.get_light = function* (sym, index)
{
	$.RPC("light", [0, Math.floor(Math.random()*256)], function() {});
	//~ this.mouse.d = (this.mouse.d+1)%4;
	//~ this.redraw();
	//~ this.update_radar();
	return 0;
}

Robot.prototype.set_beep = function* (sym, index, value, push)
{
	$.RPC("beep", [value], function() {});
	yield;
	yield;
	return 0;
}

Robot.prototype.get_beep = function* (sym, index)
{
	$.RPC("beep", [1], function() {});
	yield;
	yield;
	return 0;
}

Robot.prototype.pre_run = function()
{
	//~ this.mouse.r = this.mouse.startr;
	//~ this.mouse.c = this.mouse.startc;
	//~ this.mouse.d = this.mouse.startd;
	//~ this.update_radar();
	//~ this.redraw();
	console.log("PreRun");
	
	$.RPC("light", [0, 0], function() {});

}

Robot.prototype.reset = function()
{
	//~ this['generate_lev'+this.cur_level.i]();
	//~ this.redraw();
	console.log("Reset");
	
	$.RPC("light", [0, 0], function() {});
}


/// INIT
var bar = new Bar();
var coder = new Coder();
var robot = new Robot(coder);
var osk = new Osk(coder);
coder.reset();

document.body.append(bar.el);
document.body.append(robot.el);
document.body.append(coder.el);
//~ document.body.append(osk.el);
//~ robot.change_level(robot.lvl_el.firstChild);

coder.focus('main');
function frame_update() {
	coder.update();
	window.requestAnimationFrame(frame_update);
}
window.requestAnimationFrame(frame_update);

});


