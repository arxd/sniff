
requirejs(['util', 'robot', 'Coder', 'keyboard', 'bar'], function ($, RobotBase, Coder, Osk, Bar) {

	
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
	
	var toss = this.coder.sym_add('toss', true, "Yummmy!");
	var flavor = this.coder.sym_add('flavor', true, "");
	var angle = this.coder.sym_add('angle', true, "");
	var power = this.coder.sym_add('power', true, "");
	
	this.el = $.DIV('Canvas');
	this.canvas = make_canvas(550, 340);
	this.hitmap = make_canvas(550,340);
	this.bg = make_canvas(550, 340);
	this.scoop = make_canvas(100,100);
	this.el.append(this.canvas);
	this.bgimg = new Image();
	$.LISTEN(this, this.bgimg, 'load', function(e) {this.loaded++; this.reset_bg();});
	this.scoops = new Image();
	$.LISTEN(this, this.scoops, 'load', function(e) {this.loaded++;});
	//~ this.cone = new Image();
	//~ $.LISTEN(this, this.cone, 'load', function(e) {this.loaded++;});
	
	this.loaded = 0;
	this.bgimg.src = 'ice_bg.jpg';
	//~ this.cone.src = 'ice_cone.png';
	this.scoops.src = 'ice_scoops.png';
}

Robot.prototype = Object.create(RobotBase.prototype);

Robot.prototype.reset_bg = function()
{
	this.bg.getContext("2d").drawImage(this.bgimg, 0, 0);
	this.canvas.getContext("2d").drawImage(this.bg, 0, 0);
	
	var hitmap = this.hitmap.getContext("2d");
	hitmap.clearRect(0, 0, 550, 340);
	hitmap.beginPath();
	hitmap.arc(248, 204, 30, 0, 2 * Math.PI);
	hitmap.fill();
	hitmap.beginPath();
	hitmap.arc(390, 270, 30, 0, 2 * Math.PI);
	hitmap.fill();
	hitmap.beginPath();
	hitmap.arc(484, 115, 30, 0, 2 * Math.PI);
	hitmap.fill();

}

Robot.prototype.draw_scoop = function(a, flavor)
{
	var ctx = this.scoop.getContext("2d");
	ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);
	ctx.clearRect(0, 0, 100, 100);

	var cosa = Math.cos(a*Math.PI/180.0);
	var sina = Math.sin(a*Math.PI/180.0);
	
	ctx.transform(1, 0, 0, 1, 50,50);
	ctx.transform(cosa, sina,-sina, cosa,0,0);
	ctx.transform(1,0,0,1,-30, -22);
	ctx.drawImage(this.scoops, 0, flavor*45, 60, 45, 0,0, 60,45);
}

Robot.prototype.set_toss = function* (sym, index, value, push)
{
	return yield *this.get_toss(sym,index);
}

Robot.prototype.get_toss = function* (sym, index)
{
	var power = yield* coder.lookup("power").do_from(0);
	var angle = yield* coder.lookup("angle").do_from(0);
	var flavor = yield* coder.lookup("flavor").do_from(0);
	flavor = flavor < 0 ? 0 : flavor%8;
	angle = angle < 0 ? 0 : angle%90;
	power = power < 0 ? 0 : (power>110?(power%100)+10:power);

	
	// figure out where we hit and when
	var ystart = 60;
	var hitctx = this.hitmap.getContext("2d");
	var x=1;
	var y=ystart;
	var dy = 0.1*Math.sin(Math.PI*angle/180.0)*power;
	var dx = 0.1*Math.cos(Math.PI*angle/180.0)*power;
	var t=0;
	while (true) {
		var pxl = hitctx.getImageData(x, 340-y, 1, 1).data[3];
		if (pxl || x+dx > 540 || y+dy < 10 || y+dy > 330)
			break;
		x += dx;
		y += dy;
		dy -= 0.05;
		t += 1;
	}
	
	hitctx.beginPath();
	hitctx.arc(x, 340-y, 30, 0, 2 * Math.PI);
	hitctx.fill();

	// animate the flying icecream
	
	var ctx = this.canvas.getContext("2d");
	x = 1;
	y = ystart;
	var spin = dy>0?180:270;
	
	dy = 0.1*Math.sin(Math.PI*angle/180.0)*power;
	spin += 180*Math.atan(dy/dx)/Math.PI;
	var dspin = 720.0/t;
	
	while (t) {
		x += dx;
		y += dy;
		ctx.drawImage(this.bg, 0, 0);
		this.draw_scoop(spin, flavor);
		ctx.drawImage(this.scoop, x-50, 340-y-50);
		dy -= 0.05;
		yield;
		spin += dspin;
		t-=1
	}
	
	this.bg.getContext("2d").drawImage(this.scoop, x-50, 340-y-50);
	return 0;
}

Robot.prototype.reset = function()
{
	this.reset_bg();
}



/// INIT
var bar = new Bar("Ice Cream");
var coder = new Coder();
var robot = new Robot(coder);
var osk = new Osk(coder);
coder.reset();

document.body.append(bar.el);
document.body.append(robot.el);
document.body.append(coder.el);
//~ document.body.append(osk.el);
coder.focus('main');
function frame_update() {
	coder.update();
	window.requestAnimationFrame(frame_update);
}
window.requestAnimationFrame(frame_update);

});


