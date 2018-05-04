
requirejs(['util', 'robot', 'Coder', 'keyboard', 'bar'], function ($, RobotBase, Coder, Osk, Bar) {

	
	
var Robot = function(coder)
{
	RobotBase.call(this, coder);
	this.levels = [
		{
		home: [2,2,0],
		map: [
			[0,1,0,0,0],
			[0,0,0,1,1],
			[1,1,0,1,4],
			[1,0,0,0,1],
			[0,1,0,0,0]]
		},
		{
		home: [2,2,0],
		map: [
			[0,1,0,0,0],
			[0,0,0,1,1],
			[0,1,0,1,0],
			[1,0,0,0,1],
			[0,1,4,0,0]]
		},
		{
		home: [2,2,0],
		map: [
			[0,1,4,0,0],
			[0,0,0,1,1],
			[1,1,0,1,0],
			[1,0,0,0,1],
			[0,1,0,0,0]]
		},
		{
		home: [2,2,0],
		map: [
			[0,1,0,0,0],
			[0,0,0,1,1],
			[1,1,0,5,4],
			[1,0,0,0,1],
			[0,1,0,0,0]]
		},
		{map: [
			[0, 1, 0, 0, 0],
			[0,5,6,1,1],
			[1,1,4,5,6],
			[1,0,7,0,6],
			[0,1,0,6,0]],
		home: [1,3,0]
		}
	];

	this.el = $.DIV('Robot');
	this.lvl_el = $.DIV('Levels');
	for (i in this.levels) {
		var lvl = $.DIV('lvl', "Level "+i);
		lvl.lvl_id = i;
		$.LISTEN(this, lvl, 'click', function(e) {this.change_level(e.target);});
		this.lvl_el.appendChild(lvl);
	}
	this.map_size = 5;
	this.map = $.DIV("map-area");
	this.map.style.width = (this.map_size*120)+'px';
	this.map.style.height = (this.map_size*70+35)+'px';
	var r, c;
	for (r = 0; r < this.map_size; r+=1) {
		for ( c=0; c < this.map_size; c+=1) {
			var div = $.DIV('g0');
			div.id = 'm_'+r+'_'+c;
			div.style.left=(c-r +this.map_size-1)*60 + 'px';
			div.style.top = (r+c)*35 + 'px';
			this.map.appendChild(div);
		}
	}
	this.el.append(this.lvl_el);
	this.el.append(this.map);
	
	// robot
	this.bob = $.DIV('r0');
	this.map.appendChild(this.bob);
	
	// commands
	this.coder.sym_add('color', true, "Spoooky.");
	this.coder.sym_add('go', true, "One space");
	this.coder.sym_add('turn', true, "Turn this way ↻");

}

Robot.prototype = Object.create(RobotBase.prototype);

Robot.prototype.change_level = function(lvl)
{
	// unhilite old level
	if (this.cur_level) 
		this.cur_level.className = 'lvl';
	this.cur_level = lvl;
	this.cur_level.className = "lvl cur";
	var map = this.levels[this.cur_level.lvl_id].map;
	var r,c;
	for (r = 0; r < map.length; r+=1) {
		for ( c=0; c < map.length; c+=1) {
			var div = document.getElementById( 'm_'+r+'_'+c);
			div.className = 'g'+map[r][c];
		}
	}
	this.reset();
}

Robot.prototype.change_pos = function(row, col)
{
	var l = (col - row +this.levels[this.cur_level.lvl_id].map.length-1)*60+10;
	var t = (row + col)*35-5;
	
	this.bob.style.left = l + 'px';
	this.bob.style.top = t + 'px';
}

Robot.prototype.change_dir = function(dir)
{
	while(dir < 0)
		dir += 8;
	dir = dir%8;
	this.dir = dir;
	this.bob.className = 'r' + this.dir;

}


Robot.prototype.win = function* ()
{
	while(true) {
		yield* $.DELAY(5);
		this.change_dir(this.dir+1);
	}
}

Robot.prototype.crash = function* ()
{
	this.change_dir(1);
	var frame = 0;
	while (true) {
		deg = ((frame%2)*2.0-1.0)*15;
		this.bob.style.transform  = 'rotate('+deg+'deg)';
		yield* $.DELAY(15);
		frame ++;
	}
}

Robot.prototype.set_turn = function* (sym, index, value, push)
{
	return yield* this.get_turn(sym, index);
}

Robot.prototype.get_turn = function* (sym, index)
{
	yield* $.DELAY(5);
	this.change_dir(this.dir+1);
	yield* $.DELAY(5);
	this.change_dir(this.dir+1);
	return 0;
}

Robot.prototype.set_go = function* (sym, index, value, push)
{
	return yield* this.get_go(sym, index);
}

Robot.prototype.get_go = function* (sym, index)
{
	var dr = (this.dir == 2 ? 1.0 : (this.dir == 6 ? -1.0 : 0.0));
	var dc = (this.dir == 0 ? 1.0 : (this.dir == 4 ? -1.0 : 0.0));
	
	var nr = this.r + dr;
	var nc = this.c + dc;
	
	var crash =  (nr == 5 || nc == 5 || nr < 0 || nc < 0 || this.levels[this.cur_level.lvl_id].map[nr][nc] > 4);
	var frame = 0;
	while (frame < 6) {
		this.change_pos(this.r+(frame/6.0)*dr, this.c+(frame/6.0)*dc);
		if (frame == 3 && crash)
			yield* this.crash();
		yield* $.DELAY(5);
		frame++;
	}
	this.r = this.r+dr;
	this.c = this.c+dc;
	this.change_pos(this.r, this.c);
	if (this.levels[this.cur_level.lvl_id].map[this.r][this.c] == 4)
		yield* this.win();
	return 0;
}

Robot.prototype.reset = function()
{
	this.r = this.levels[this.cur_level.lvl_id].home[0];
	this.c = this.levels[this.cur_level.lvl_id].home[1];
	this.change_pos(this.r, this.c);
	this.change_dir(this.levels[this.cur_level.lvl_id].home[2]);
	this.change_color(0);
	this.bob.style.transform = "";
}

Robot.prototype.change_color = function (clr)
{
	this.color = clr%8;
	var filter = "";
	switch(this.color) {
		case 0: filter = "sepia(100)"; break;
		case 1: filter = "grayscale(100) opacity(70%)"; break;
		case 2: case 3: case 4: case 5:
		filter =  "hue-rotate("+this.color*60+"deg)";
		break;
		case 6: filter = "blur(3px)"; break;
		case 7: filter = "brightness(30%)"; break;
	}
	this.bob.style.webkitFilter = filter;
	this.bob.style.filter = filter;
}

Robot.prototype.set_color = function* (sym, index, value, push)
{
	this.change_color(value);
	yield* $.DELAY(5);
	return this.color;
}


Robot.prototype.get_color = function* (sym, index)
{
	return yield* this.set_color(sym, index, Math.floor(Math.random()*8), false);
}


/// INIT
var bar = new Bar("Robot");
var coder = new Coder();
var robot = new Robot(coder);
var osk = new Osk(coder);
coder.reset();

document.body.append(bar.el);
document.body.append(robot.el);
document.body.append(coder.el);
//~ document.body.append(osk.el);
robot.change_level(robot.lvl_el.firstChild);

coder.focus('main');
function frame_update() {
	coder.update();
	window.requestAnimationFrame(frame_update);
}
window.requestAnimationFrame(frame_update);

});


