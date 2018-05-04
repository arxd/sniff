
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
	this.levels = [ // 1:car 0:cone,   distance, lane, speed
		[[1,600,1, 1], [0, 1000, 4, 0], [0, 1200, 0, 0],[2,800,3, 2],[0, 4000, 4, 0], [0, 3900, 0, 0], [2, 2000, 1, 1], [3, 2500, 3, 1], [4, 3000, 1, 1]],
		[[1,600,2, 2], [0, 1400, 4, 0], [5, 800, 1, 2],  [3, 2000, 3, 1],[0, 1400, 3, 0],[2, 2800, 1, 1],[0, 4000, 4, 0], [0, 3500, 2, 0],],
		[[1,600,2, 2],  [0, 1200, 1, 0], [0, 1800, 4, 0],[0, 2800, 0, 0], [2,2000,2, 2],[0, 32000, 1, 0], [0, 3500, 2, 0],],
		
		
	];
	
	
	this.el = $.DIV('Game');
	this.lvl_el = $.DIV('Levels');
	for (var i=0; i < this.levels.length; ++i) {
		var lvl = $.DIV('lvl', "Level "+i);
		lvl.lvl_id = i;
		$.LISTEN(this, lvl, 'click', function(e) {this.change_level(e.target);});
		this.lvl_el.appendChild(lvl);
	}
	this.canvas = make_canvas(550, 340);
	this.el.append(this.lvl_el);
	this.el.append(this.canvas);
	this.road = new Image();
	$.LISTEN(this, this.road, 'load', function(e) {this.loaded++; this.reset();});
	this.car = new Image();
	$.LISTEN(this, this.car, 'load', function(e) {this.loaded++; this.reset();});
	this.cone = new Image();
	$.LISTEN(this, this.cone, 'load', function(e) {this.loaded++; this.reset();});
	//~ this.scoops = new Image();
	//~ $.LISTEN(this, this.scoops, 'load', function(e) {this.loaded++;});
	//~ this.cone = new Image();
	//~ $.LISTEN(this, this.cone, 'load', function(e) {this.loaded++;});
	
	this.loaded = 0;
	this.road.src = 'road.jpg';
	this.car.src = 'car.png';
	this.cone.src = 'cone.png';
	
	this.posx = 0;
	this.posy = 0;
	this.end = 4000;
	this.origin = 30;
	this.cars = [];
	this.ctx = this.canvas.getContext("2d")

	
	this.coder.sym_add('fast', true, "Go fast!");
	this.coder.sym_add('slow', true, "Go slow");
	this.coder.sym_add('left', true, "Change left");
	this.coder.sym_add('right', true, "Change right");
	this.coder.sym_add('radar', true, "" );

}

Robot.prototype = Object.create(RobotBase.prototype);

Robot.prototype.change_level = function(lvl)
{
	if (this.cur_level) 
		this.cur_level.className = 'lvl';
	this.cur_level = lvl;
	this.cur_level.className = "lvl cur";
	this.reset_cars();

}

Robot.prototype.reset_cars = function()
{
	this.cars = JSON.parse(JSON.stringify(this.levels[this.cur_level.lvl_id]));
	
}

Robot.prototype.draw_cars = function()
{
	for (var i = 0; i < this.cars.length; ++i) {
		if (this.cars[i][0]) {
			this.draw_car(this.cars[i][1], this.cars[i][2], 0, this.cars[i][0]);
		} else {
			this.ctx.filter =  "hue-rotate(0deg)";
			this.ctx.drawImage(this.cone, this.cars[i][1]-this.posx+30, this.cars[i][2]*68);
		}
	}	
}

Robot.prototype.move_cars = function()
{
	for (var i = 0; i < this.cars.length; ++i) {
		this.cars[i][1] += this.cars[i][3];
		if (this.cars[i][2] == Math.round(this.posy) && 
			this.cars[i][1] < this.posx+135 &&
			this.cars[i][1] > this.posx-100)
			return false;
	}
	this.draw_cars();
	return true;
}

Robot.prototype.reset_bg = function()
{
	//~ this.bg.getContext("2d").drawImage(this.bgimg, 0, 0);
	
	for (var t=0; t < 5; ++t)
		this.ctx.drawImage(this.road, t*150-(this.posx%150), 0);
	
	var x = this.end - this.posx;
	if (x > 540)
		return;
	this.ctx.setLineDash([15, 15]);
	this.ctx.lineWidth = 15;
	
	this.ctx.strokeStyle="white";
	this.ctx.beginPath();
	this.ctx.moveTo(x+this.origin, 68);
	this.ctx.lineTo(x+this.origin, 272);
	this.ctx.moveTo(x+15+this.origin, 83);
	this.ctx.lineTo(x+15+this.origin, 272);
	this.ctx.stroke();
	
	this.ctx.strokeStyle="black";
	this.ctx.beginPath();
	this.ctx.moveTo(x+15+this.origin, 68);
	this.ctx.lineTo(x+15+this.origin, 272);
	this.ctx.moveTo(x+this.origin, 83);
	this.ctx.lineTo(x+this.origin, 272);
	this.ctx.stroke();
		
}

Robot.prototype.draw_car = function(x, y, angle, hue=0)
{
	y = y*68;
	x = x-this.posx + this.origin;
	//~ console.log("DRAW "+x +","+y);
	if (x >610 || x < -150)
		return;
	this.ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);
	var cosa = Math.cos(angle*Math.PI/180.0);
	var sina = Math.sin(angle*Math.PI/180.0);
	
	this.ctx.transform(1, 0, 0, 1,x,y);
	this.ctx.transform(cosa, sina,-sina, cosa,70,35);
	this.ctx.filter = "hue-rotate("+hue*60+"deg)";
	this.ctx.drawImage(this.car, -70, -35);
	
	this.ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);

}

Robot.prototype.check_win = function* ()
{
	if (this.posx < this.end)
		return;
	var dy = this.posy > 2 ? -0.01:0.01;
	var dx = this.posx;
	while(this.angle > -200) {
		this.angle -= 5;
		dx += 5;
		this.posy += dy;
		this.reset_bg();
		this.draw_cars();
		this.draw_car(dx, this.posy, this.angle*100*dy);
		yield;
	}
	while(true)
		yield;
	
}

Robot.prototype.crash = function* ()
{
	this.angle=8000;
	var da = 200;
	while(this.angle > 0) {
		this.reset_bg();
		this.draw_cars();
		this.draw_car(this.posx, this.posy, this.angle);
		this.angle -= da;
		da *= 0.9;
		yield;
	}
	while(true)
		yield;
}

Robot.prototype.update_radar = function()
{
	var range = -1;
	for (var i=0; i < this.cars.length; ++i) {
		if (this.cars[i][2] != this.posy)
			continue;
		
		var r = this.cars[i][1]-this.posx-199;
		console.log(i+ " " + r);
		if (r > 380 || r < 0)
			continue;
		range = r / (this.cars[i][3] - 5)/-20;
		range = range < 0 ? 0 : range;
		console.log(this.cars[i][1] + "  " + this.posx + "   " + r +"/"+range);
		
	}
	console.log("========== "+Math.floor(range));
	
	this.coder.lookup('radar').do_store(0, Math.floor(range), false);
}


Robot.prototype.change_lanes = function* (dy)
{
	for (var sub = 1 ; sub <= 32; ++sub) {
		this.posx += 5;
		var pct = sub / 32.0;
		//~ console.log(this.posy);
		if (dy<0?this.posy > 0 : this.posy < 4) {
			this.posy += dy*0.03125;
			this.angle = dy*(Math.cos(pct*Math.PI*2+Math.PI)+1.0)*10;
		}
		this.reset_bg();
		if (!this.move_cars())
			yield* this.crash();
		this.draw_car(this.posx, this.posy, this.angle);
		yield* this.check_win();
		yield;
	}
	this.posy = Math.round(this.posy);
	this.update_radar();
	return 0;
}

Robot.prototype.set_left = function* (sym, index, value, push)
{
	return yield *this.get_left(sym,index);
}

Robot.prototype.get_left = function* (sym, index)
{
	yield *this.change_lanes(-1);
	return 0;
}

Robot.prototype.set_right = function* (sym, index, value, push)
{
	return yield *this.get_right(sym,index);
}

Robot.prototype.get_right = function* (sym, index)
{
	yield *this.change_lanes(1);
	return 0;
}

Robot.prototype.set_slow = function* (sym, index, value, push)
{
	return yield *this.get_slow(sym,index);
}

Robot.prototype.get_slow = function* (sym, index)
{
	for (var sub = 0 ; sub < 20; ++sub) {
		this.posx += 5;
		this.reset_bg();
		if (!this.move_cars())
			yield* this.crash();
		this.draw_car(this.posx, this.posy, this.angle);
		yield* this.check_win();
		yield;
	}
	this.update_radar();
	return 0;
}

Robot.prototype.set_fast = function* (sym, index, value, push)
{
	return yield *this.get_fast(sym,index);
}

Robot.prototype.get_fast = function* (sym, index)
{
	for (var sub = 0 ; sub < 20; ++sub) {
		this.posx += 10;
		this.reset_bg();
		if (!this.move_cars())
			yield* this.crash();
		this.draw_car(this.posx, this.posy, this.angle);
		yield* this.check_win();
		yield;
	}
	this.update_radar();
	return 0;
}

Robot.prototype.reset = function()
{
	this.posx = 0;
	this.posy = 2;
	this.angle = 0;
	this.reset_bg();
	this.draw_car(this.posx, this.posy, this.angle);
	this.reset_cars();
	this.update_radar();
}



/// INIT
var bar = new Bar("Car");
var coder = new Coder();
var robot = new Robot(coder);
var osk = new Osk(coder);
coder.reset();
robot.change_level(robot.lvl_el.firstChild);

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


