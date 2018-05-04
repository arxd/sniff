
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
	
	this.coder.sym_add('dot', true, "Draw a dot, return a point");
	this.coder.sym_add('line', true, "Draw a line, return a point");
	this.coder.sym_add('circle', true, "Draw a circle, return a point");
	this.coder.sym_add('color', true, "");
	this.coder.sym_add('radius', true, "");
	this.coder.sym_add('points', true, "");
	this.el = $.DIV('Canvas');
	this.canvas = make_canvas(550, 340);
	this.el.append(this.canvas);
}

Robot.prototype = Object.create(RobotBase.prototype);



Robot.prototype.reset = function()
{
	var ctx = this.canvas.getContext("2d");
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, 550, 340);
	ctx.lineWidth=5;
	ctx.lineCap = "round";
	this.randseed = 1000;
}

Robot.prototype.pop = function* (num)
{
	stack = this.coder.lookup("stack");
	var pts = [];
	while (num--) {
		if (stack.lines.length)
			pts.push(this.xy(yield* stack.do_from(0)));
		else
			pts.push(this.xy(Math.floor(Math.random()*1000)));
	}
	return pts;
}

Robot.prototype.xy = function(i)
{
	var x = Math.sin(i+this.randseed) * 10000;
	var y  = Math.cos(i+this.randseed) * 10000;
	x = (x-Math.floor(x))*550;
	y = (y-Math.floor(y))*340;
	return [x,y];
}



Robot.prototype.set_dot = function* (sym, index, value, push)
{
	return yield* this.get_dot(sym, value);
}

Robot.prototype.get_dot = function* (sym, index)
{
	var pt = index?index:Math.floor(Math.random()*1000);
	//~ var pt = yield* this.coder.lookup("points").do_from(0);
	var pointxy = this.xy(pt);

	var clr = yield* this.coder.lookup("color").do_from(0);
	var ctx = this.canvas.getContext("2d");
	ctx.fillStyle = "hsl("+((clr*59)%360)+", 100%, 60%)";
	ctx.beginPath();
	ctx.arc(pointxy[0], pointxy[1], 5, 0, 2 * Math.PI);
	ctx.fill();
	
	return pt;//this.coder.lookup("points").do_store(0, point, true);
}

Robot.prototype.set_circle = function* (sym, index, value, push)
{
	return yield* this.get_circle(sym, index);
}

Robot.prototype.get_circle = function* (sym, index)
{
	var pt = yield* this.coder.lookup("points").do_from(0);
	var ptxy = this.xy(pt);
	var clr = yield* this.coder.lookup("color").do_from(0);
	var radius = yield* this.coder.lookup("radius").do_from(0);
	radius = radius < 0 ? 0 : (radius > 110? radius%60+2 : radius);
	var ctx = this.canvas.getContext("2d");
	ctx.beginPath();
	ctx.arc(ptxy[0], ptxy[1], radius*6, 0, 2 * Math.PI);
	ctx.strokeStyle = "hsl("+((clr*59)%360)+", 100%, 60%)";
	ctx.stroke();
	
	return pt;
}

Robot.prototype.set_line = function* (sym, index, value, push)
{
	return yield* this.get_line(sym, index);
}

Robot.prototype.get_line = function* (sym, index)
{
	var ctx = this.canvas.getContext("2d");
	var points = this.coder.lookup("points");
	var clr = yield* this.coder.lookup("color").do_from(0);
	var pt1 = yield* points.do_from(0);
	var pt1xy = this.xy(pt1);

	ctx.beginPath();
	ctx.arc(pt1xy[0], pt1xy[1],2.5, 0, 2 * Math.PI);
	ctx.fillStyle = "hsl("+((clr*59)%360)+", 100%, 60%)";
	ctx.fill();

	var pt2 = yield* points.do_from(0);
	var pt2xy = this.xy(pt2);

	ctx.beginPath();
	ctx.arc(pt2xy[0], pt2xy[1], 2.5, 0, 2 * Math.PI);
	ctx.fill();

	ctx.strokeStyle = "hsl("+((clr*59)%360)+", 100%, 60%)";

	ctx.beginPath();
	ctx.moveTo(pt1xy[0], pt1xy[1]);
	for (i=1; i <= 8; ++i) {
		ctx.lineTo((pt2xy[0]-pt1xy[0])*i/8+pt1xy[0], (pt2xy[1]-pt1xy[1])*i/8+pt1xy[1]);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo((pt2xy[0]-pt1xy[0])*i/8+pt1xy[0], (pt2xy[1]-pt1xy[1])*i/8+pt1xy[1]);
		yield;
	}
	return pt2;
}


/// INIT
var bar = new Bar("Art");
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


