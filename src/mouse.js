
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
	this.el = $.DIV('Robot');
	this.lvl_el = $.DIV('Levels');
	for (var i =0; i < 3; ++i) {
		var lvl = $.DIV('lvl', "Level "+i);
		lvl.i =i;
		$.LISTEN(this, lvl, 'click', function(e) {this.change_level(e.target);});
		this.lvl_el.appendChild(lvl);
	}

	this.canvas = make_canvas(550,340);
	this.canvbg = make_canvas(550,340);
	
	this.tiles = new Image();
	$.LISTEN(this, this.tiles, 'load', function(e) {this.reset_bg();});
	this.tiles.src = 'mousetiles.jpg';
	
	this.cheese = new Image();
	$.LISTEN(this, this.cheese, 'load', function(e) {this.reset_bg();});
	this.cheese.src = 'cheese.png';
	
	this.splash = new Image();
	$.LISTEN(this, this.splash, 'load', function(e) {this.reset_bg();});
	this.splash.src = 'splash.png';


	this.mouseimg = new Image();
	$.LISTEN(this, this.mouseimg, 'load', function(e) {this.reset_bg();});
	this.mouseimg.src = 'mouse.png';
	
	this.splash_sound = new Howl({src: ['splash.mp3']});
	this.eat_sound = new Howl({src: ['eat.mp3']});
	
	this.el.append(this.lvl_el);
	this.el.append(this.canvas);
	
	// commands
	this.coder.sym_add('water', true, "");
	this.coder.sym_add('walk', true, "Move straight");
	this.coder.sym_add('right', true, "Turn this way ↻");
	this.coder.sym_add('left', true, "Turn this way ↺");

}

Robot.prototype = Object.create(RobotBase.prototype);

Robot.prototype.redraw = function()
{
	var ctx = this.canvas.getContext("2d");
	ctx.drawImage(this.canvbg, 0, 0);
	
	ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);
	
	var ang = 90*this.mouse.d;
	
	var cosa = Math.cos(ang*Math.PI/180.0);
	var sina = Math.sin(ang*Math.PI/180.0);
	
	if (this.maze[this.mouse.r][this.mouse.c]) {
		ctx.transform(this.size/90, 0, 0, this.size/90, this.x0+this.mouse.c*this.size+this.size/2, this.y0+this.mouse.r*this.size+this.size/2);
		ctx.transform(cosa, sina,-sina, cosa,0,0);
		ctx.transform(1,0,0,1,-72, -59);
		ctx.drawImage(this.mouseimg, 0,0);
		ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);
	} else {
		ctx.drawImage(this.splash, this.x0 + this.mouse.c*this.size, this.y0+this.mouse.r*this.size, this.size, this.size);
	}
}

Robot.prototype.wall = function (ctx, x1,y1, x2,y2)
{
	ctx.beginPath();
	ctx.moveTo(x1,y1);//,75);
	ctx.lineTo(x2,y2);
	ctx.stroke(); // Draw it
}

Robot.prototype.reset_bg = function() 
{	
	var ctx = this.canvbg.getContext("2d");
	//~ ctx.drawImage(this.bgimg, 0, 0);
	var as = 550/340;
	var am = (this.maze[0].length-2) / (this.maze.length-2);
	this.size = Math.floor((am > as) ? 540/(this.maze[0].length-2) : 330 / (this.maze.length-2));
	//~ //console.log("REBG : "+as + "/"+am+"   " +this.size);
	this.x0 = Math.floor((550 - (this.maze[0].length-2)*this.size)/2-this.size);
	this.y0 = Math.floor((340 - (this.maze.length-2)*this.size)/2-this.size);
	
	var tsize = 128;
	
	
	ctx.fillStyle = "rgba(12, 52,217, 1)";
	//~ ctx.lineWidth="3";
	//~ ctx.lineCap = "square";
	//~ ctx.strokeStyle="black"; // Green path
	ctx.clearRect(0,0,550,340);
	for(r=0; r < this.maze.length; ++r) {
		for(c=0; c < this.maze[0].length;++c) {
			var i = this.maze[r][c];
			
			ctx.drawImage(this.tiles, i*tsize, 0, tsize, tsize, this.x0+this.size*c, this.y0+this.size*r, this.size, this.size);
			
			ctx.setTransform(1,0, 0,1, 0, 0);//20, 80);

			//~ ctx.fillRect(this.x0+c*this.size, this.y0+r*this.size, this.size, this.size);
			//~ if (this.maze[r][c] % 2)
				//~ this.wall(ctx, this.x0+c*this.size, this.y0+r*this.size, this.x0+(c+1)*this.size, this.y0+r*this.size);
			//~ if (Math.floor(this.maze[r][c]/2)) 
				//~ this.wall(ctx, this.x0+c*this.size, this.y0+r*this.size, this.x0+c*this.size, this.y0+(r+1)*this.size);
		}
	}
	
	ctx.drawImage(this.cheese, this.x0+this.mouse.endc*this.size,  this.y0+this.mouse.endr*this.size, this.size*0.8, this.size*0.8);
	
	//~ this.wall(ctx,this.x0, this.y0, this.x0, this.y0+this.maze.length*this.size);
	//~ this.wall(ctx,this.x0, this.y0, this.x0 + this.maze[0].length*this.size, this.y0);
	//~ this.wall(ctx,this.x0 + this.maze[0].length*this.size,this.y0+this.maze.length*this.size, this.x0, this.y0+this.maze.length*this.size);
	//~ this.wall(ctx,this.x0 + this.maze[0].length*this.size,this.y0+this.maze.length*this.size, this.x0 + this.maze[0].length*this.size, this.y0);
	
				
	
	this.redraw();
}

Robot.prototype.generate_generic = function(pct, numr, numc)
{
	
	this.maze = [];
	for(var r=0; r < numr; ++r) {
		var row = [];
		for(var c=0; c < numc; ++c) {
			if(Math.random()*100 > pct || (r ==0 || c ==0 || r == numr-1 || c == numc-1) ) {
				row.push(0);
			} else {
				row.push(Math.floor(Math.random()*3)+1);
			}
		}
		this.maze.push(row);
	}
	
	
}

Robot.prototype.generate_cleanup = function(numr, numc)
{
	for(var r=0; r < numr; ++r) {
		for(var c=0; c < numc; ++c) {
			if (r ==0 || c ==0 || r == numr-1 || c == numc-1) {
				this.maze[r][c] = 0;
			}
			if (this.maze[r][c] && (c==0 || this.maze[r][c-1]==0))
				this.maze[r][c] = 2;
		}
	}
	this.mouse.startr = this.mouse.r;
	this.mouse.startc = this.mouse.c;
	this.mouse.startd = this.mouse.d;
}

Robot.prototype.on_edge = function(r, c)
{
	var numr = this.maze.length;
	var numc = this.maze[0].length;
	return r==1 || r == numr-2 || c == 1 || c == numc-2;
}

Robot.prototype.rotate_delta = function(delta, left)
{
	if(left)
		return [-delta[1], delta[0]];
	return [delta[1], -delta[0]];
}


Robot.prototype.generate_lev0 = function()
{
	var numr = Math.floor(Math.random()*10) + 5;
	var numc = Math.floor(numr*550/340) + 1;
	this.generate_generic(10, numr, numc);
	
	this.mouse = {r:Math.floor(Math.random()*(this.maze.length-4))+2,
				c:Math.floor(Math.random()*(this.maze[0].length-4))+2,
				d:Math.floor(Math.random()*2)};
	
	if (this.mouse.d && this.mouse.c < numc/2)
		this.mouse.d = 3;
	if (!this.mouse.d && this.mouse.r > numr/2)
		this.mouse.d = 2;
	
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	var len = Math.floor(Math.random()*(this.maze.length-3));			
	
	this.mouse.endr = this.mouse.r;
	this.mouse.endc = this.mouse.c;
	
	while (!this.on_edge(this.mouse.endr, this.mouse.endc)) {
		this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
		this.mouse.endr += delta[0];
		this.mouse.endc += delta[1];
	}
	this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
	
	this.generate_cleanup(numr,numc);
	this.reset_bg();
}

Robot.prototype.generate_lev1 = function()
{
	var numr = Math.floor(Math.random()*10) + 5;
	var numc = Math.floor(numr*550/340) + 1;
	this.generate_generic(10, numr, numc);
	
	this.mouse = {r:Math.floor(Math.random()*(this.maze.length-4))+2,
				c:Math.floor(Math.random()*(this.maze[0].length-4))+2,
				d:Math.floor(Math.random()*2)};
	
	if (this.mouse.d && this.mouse.c < numc/2)
		this.mouse.d = 3;
	if (!this.mouse.d && this.mouse.r > numr/2)
		this.mouse.d = 2;
	
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	var len = Math.floor(Math.random()*(this.maze.length-3));			
	
	this.mouse.endr = this.mouse.r;
	this.mouse.endc = this.mouse.c;
	
	var state = 0;
	while (!this.on_edge(this.mouse.endr, this.mouse.endc)) {
		this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
		switch (state) {
			case 0: case 2:
				this.mouse.endr += delta[0];
				this.mouse.endc += delta[1];
				break;
			case 1:
				delta = this.rotate_delta(delta, 1);
				break;
			case 3:
				delta = this.rotate_delta(delta, 0);
				break;
		}
		state = (state+1)%4;
	}
	this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
	
	this.generate_cleanup(numr,numc);
	this.reset_bg();
}


Robot.prototype.generate_lev2 = function()
{
	var numr = Math.floor(Math.random()*10) + 5;
	var numc = Math.floor(numr*550/340) + 1;
	this.generate_generic(30, numr, numc);
	
	this.mouse = {r:Math.floor(Math.random()*(this.maze.length-4))+2,
				c:Math.floor(Math.random()*(this.maze[0].length-4))+2,
				d:Math.floor(Math.random()*2)};
	
	if (this.mouse.d && this.mouse.c < numc/2)
		this.mouse.d = 3;
	if (!this.mouse.d && this.mouse.r > numr/2)
		this.mouse.d = 2;
	
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	var len = Math.floor(Math.random()*(this.maze.length-3));			
	
	this.mouse.endr = this.mouse.r;
	this.mouse.endc = this.mouse.c;
	
	var state = 0;
	var randlen = Math.floor(Math.random()*5);
	console.log(randlen);
	while (state < 3 && !this.on_edge(this.mouse.endr, this.mouse.endc)) {
		this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
		switch (state) {
			case 0: 
				if (!(randlen--) || this.on_edge(this.mouse.endr+delta[0], this.mouse.endc+delta[1])) {
					this.maze[this.mouse.endr+delta[0]][this.mouse.endc+delta[1]] = 0;
					state = 1;
					delta = this.rotate_delta(delta, 1);
					randlen = Math.floor(Math.random()*5)+2;
					console.log(randlen);
				} else {
					this.mouse.endr += delta[0];
					this.mouse.endc += delta[1];
				}
				break;
			case 1:
				if (!(randlen--)) {
					this.maze[this.mouse.endr+delta[0]][this.mouse.endc+delta[1]] = 0;
					state = 2;
					delta = this.rotate_delta(delta, 1);
					randlen = Math.floor(Math.random()*5);
				} else {
					this.mouse.endr += delta[0];
					this.mouse.endc += delta[1];
				}
				break;
			case 2:
				if (!(randlen --))
					state = 3;
				this.mouse.endr += delta[0];
				this.mouse.endc += delta[1];
				break;
		}
	}
	this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
	
	this.generate_cleanup(numr,numc);
	this.reset_bg();
}

Robot.prototype.generate_lev3 = function()
{
	var numr = Math.floor(Math.random()*10) + 5;
	var numc = Math.floor(numr*550/340) + 1;
	this.generate_generic(30, numr, numc);
	
	this.mouse = {r:Math.floor(Math.random()*(this.maze.length-4))+2,
				c:Math.floor(Math.random()*(this.maze[0].length-4))+2,
				d:Math.floor(Math.random()*2)};
	
	if (this.mouse.d && this.mouse.c < numc/2)
		this.mouse.d = 3;
	if (!this.mouse.d && this.mouse.r > numr/2)
		this.mouse.d = 2;
	
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	var len = Math.floor(Math.random()*(this.maze.length-3));			
	
	this.mouse.endr = this.mouse.r;
	this.mouse.endc = this.mouse.c;
	
	var state = 0;
	var randlen = Math.floor(Math.random()*5);
	console.log(randlen);
	while (state < 3 && !this.on_edge(this.mouse.endr, this.mouse.endc)) {
		this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
		switch (state) {
			case 0: 
				if (!(randlen--) || this.on_edge(this.mouse.endr+delta[0], this.mouse.endc+delta[1])) {
					this.maze[this.mouse.endr+delta[0]][this.mouse.endc+delta[1]] = 0;
					state = 1;
					delta = this.rotate_delta(delta, 1);
					randlen = Math.floor(Math.random()*5)+2;
					console.log(randlen);
				} else {
					this.mouse.endr += delta[0];
					this.mouse.endc += delta[1];
				}
				break;
			case 1:
				if (!(randlen--)) {
					this.maze[this.mouse.endr+delta[0]][this.mouse.endc+delta[1]] = 0;
					state = 2;
					delta = this.rotate_delta(delta, 1);
					randlen = Math.floor(Math.random()*5);
				} else {
					this.mouse.endr += delta[0];
					this.mouse.endc += delta[1];
				}
				break;
			case 2:
				if (!(randlen --))
					state = 3;
				this.mouse.endr += delta[0];
				this.mouse.endc += delta[1];
				break;
		}
	}
	this.maze[this.mouse.endr][this.mouse.endc] = Math.floor(Math.random()*3)+1;
	
	this.generate_cleanup(numr,numc);
	this.reset_bg();
}

Robot.prototype.change_level = function(lvl)
{
	// unhilite old level
	if (this.cur_level) 
		this.cur_level.className = 'lvl';
	this.cur_level = lvl;
	this.cur_level.className = "lvl cur";

	this.reset();
}

Robot.prototype.update_radar = function()
{
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	var water = this.maze[this.mouse.r+delta[0]][this.mouse.c+delta[1]] ? 0:1;
	this.coder.lookup('water').do_store(0, water, false);
	delta = this.rotate_delta(delta, 1);
	water = this.maze[this.mouse.r+delta[0]][this.mouse.c+delta[1]] ? 0:1;
	this.coder.lookup('water').do_store(1, water, false);
	delta = this.rotate_delta(delta, 1);
	delta = this.rotate_delta(delta, 1);
	water = this.maze[this.mouse.r+delta[0]][this.mouse.c+delta[1]] ? 0:1;
	this.coder.lookup('water').do_store(2, water, false);
	
}

Robot.prototype.set_right = function* (sym, index, value, push)
{
	return yield* this.get_right(sym, index);
}

Robot.prototype.get_right = function* (sym, index)
{
	this.mouse.d = (this.mouse.d+1)%4;
	this.redraw();
	this.update_radar();
	return 0;
}


Robot.prototype.set_left = function* (sym, index, value, push)
{
	return yield* this.get_left(sym, index);
}

Robot.prototype.get_left = function* (sym, index)
{
	this.mouse.d = (this.mouse.d+3)%4;
	this.redraw();
	this.update_radar();
	return 0;
}

Robot.prototype.set_walk = function* (sym, index, value, push)
{
	return yield* this.get_walk(sym, index);
}

Robot.prototype.get_walk = function* (sym, index)
{
	var delta = [ this.mouse.d==0?1:(this.mouse.d==2?-1:0), this.mouse.d==1?-1:(this.mouse.d==3?1:0)];
	this.mouse.r += delta[0];
	this.mouse.c += delta[1];
	this.redraw();
	if (!this.maze[this.mouse.r][this.mouse.c]) {
		this.splash_sound.play();
		while(1)
			yield;
	} else if (this.mouse.r == this.mouse.endr && this.mouse.c == this.mouse.endc) {
		this.eat_sound.play();
		while(1)
			yield;
	}
	
	this.update_radar();
	return 0;
}

Robot.prototype.pre_run = function()
{
	this.mouse.r = this.mouse.startr;
	this.mouse.c = this.mouse.startc;
	this.mouse.d = this.mouse.startd;
	this.update_radar();
	this.redraw();
}

Robot.prototype.reset = function()
{
	this['generate_lev'+this.cur_level.i]();
	this.redraw();
}


/// INIT
var bar = new Bar("Mouse");
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


