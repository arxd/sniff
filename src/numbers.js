
requirejs(['util', 'robot', 'Coder', 'keyboard', 'bar'], function ($, RobotBase, Coder, Osk, Bar) {

function make_canvas(w,h)
{
	var canvas = $.EL('canvas');
	canvas.width = w;
	canvas.height = h;
	return canvas;
}


function SkyObj(imgsrc)
{
	this.img = new Image();
	this.img.src = imgsrc;
	$.LISTEN(this, this.img, "load", function(){
		console.log("LOADED " +imgsrc + " "+this.img.width + " "+this.img.height);
		//~ this.cnvs = make_canvas(this.img.width,this.img.height);
		//~ this.cnvs.getContext("2d").drawImage(this.img, 0, 0);
	});
	this.reset();
}

SkyObj.prototype.draw = function(ctx)
{	
	for (var i =0; i < this.alive.length; ++i) {
		var d = this.alive[i];
		if (d.clr==0) {
			ctx.drawImage( this.img, d.x, d.y, d.w, d.h);
		} else {
			ctx.filter = "hue-rotate("+d.clr+"deg)";
			ctx.drawImage( this.img, d.x, d.y, d.w, d.h);
			ctx.filter = "hue-rotate(0deg)";
		}
	}
}

SkyObj.prototype.update = function(frame)
{
	if (this.make_more && frame - this.last_make > 10) {
		this.alive.push (this.make_one());
		this.last_make = frame;
		this.make_more -= 1;
	}
	
	for (var i =this.alive.length-1; i >=0; --i) {
		if (! this.update_one(this.alive[i]) ) {
			this.alive.splice(i, 1);
		}
	}
}

SkyObj.prototype.reset = function()
{
	this.make_more = 0;
	this.alive = [];
}

SkyObj.prototype.start = function (num)
{
	this.make_more = num;
	this.last_make = -10000;
}

function Balloons()
{
	SkyObj.call(this, "balloon.png");
}
Balloons.prototype = Object.create(SkyObj.prototype);

Balloons.prototype.update_one = function(obj) 
{
	obj.y -= obj.v;
	if (obj.y < -obj.h)
		return false;
	return true;
}

Balloons.prototype.make_one = function() 
{
	var size =Math.random()*70+30;
	obj = {
		x:Math.random()*(550-size), 
		y:340, 
		clr:Math.floor(Math.random()*360), 
		w:size, 
		h:size*1.35, 
		v:(Math.random()*4 + 4.0)*(size/150.0)
	};
	return obj;
}


function Bees()
{
	SkyObj.call(this, "bee.png");
}
Bees.prototype = Object.create(SkyObj.prototype);

Bees.prototype.update_one = function(obj) 
{
	function x(t) {
		return t*5;
	}
	
	function y(t) {
		return obj.y0+obj.wiggle*Math.sin(t/5);
	}
	
	
	obj.x = x(obj.t);
	obj.y = y(obj.t);
	obj.t += obj.v;
	if (obj.x > 550)
		return false;
	return true;
}

Bees.prototype.make_one = function()
{
	var size =Math.random()*30+30;
	var wig = Math.random()*10+10;	
	obj = {
		clr:0,
		t:-10,
		w:size,
		h:size,
		v: Math.random()*0.5+0.5,
		y0: Math.random()*(340-size-2*wig)+ wig,
		wiggle:wig,
	};
	return obj;
}

function Hoppers()
{
	SkyObj.call(this, "grasshopper.png");
	//~ this.tmp = make_canvas(550,340);

}
Hoppers.prototype = Object.create(SkyObj.prototype);

Hoppers.prototype.update_one = function(obj) 
{
	function x(t) {
		return 550-t*5;
	}
	
	function y(t) {
		return obj.y0+obj.wiggle*-Math.abs(Math.sin(t/5));
	}
	
	
	obj.x = x(obj.t);
	obj.y = y(obj.t);
	obj.t += obj.v;
	if (obj.x < -obj.w) {
		//~ var ctx = window.robot.canvas.getContext("2d");
		//~ ctx.drawImage( this.img, obj.x, obj.y, obj.w, obj.h);
		return false;
	}
	return true;
}

Hoppers.prototype.make_one = function()
{
	var size =Math.random()*30+30;
	var wig = Math.random()*20+20;	
	obj = {
		clr:0,
		t:-10,
		w:size,
		h:size,
		v: Math.random()*0.5+0.5,
		y0: Math.random()*50+250,
		wiggle:wig,
	};
	return obj;
}
	
var Robot = function(coder)
{
	RobotBase.call(this, coder);
	this.el = $.DIV('Robot');
	this.canvas = make_canvas(550, 340);
	this.el.append(this.canvas);
	this.bgimg = new Image();
	this.loaded = 0;
	$.LISTEN(this, this.bgimg, 'load', function(e) {this.loaded++; this.reset();});
	this.bgimg.src = "numbers-bg.jpg";
	this.lipimg = new Image();
	this.lipimg.src = "lips.png";
	
	this.balloons = new Balloons();
	this.bees = new Bees();
	this.grasshoppers = new Hoppers();
	
	// commands
	this.coder.sym_add('sun', true, "Send me a number");
	this.coder.sym_add('sky', true, "Send me a number");
	this.coder.sym_add('flowers', true, "Send me a number");
	this.coder.sym_add('grass', true, "Send me a number");
	
	
	this.lips = {
		'0': [4,2,2,3,1,1],
		'1': [1,1,3,3,4,4,4],
		'x1':[1,3,4,4],
		'100':[1,3,4,4, 2,3,4,2,4],
		'2': [4,4,1,1,1,1],
		'x2':[4,1,1,1],
		'200':[4,1,1, 2,3,4,2,4],
		'3': [4,4,6,6,0,0,2,2],
		'x3': [4,6,0,2,2],
		'300':[4,2, 2,3,4,2,4],
		'4': [8,8,6,6,3,3],
		'x4': [8,8,6,3],
		'400':[8,1, 2,3,4,2,4],
		'5': [8,8,0,0,8,8],
		'x5': [8,8,0,8],
		'500':[8,0,8, 2,3,4,2,4],
		'6': [4,4,2,2,2,4,4,4],
		'x6': [4,2,2,4,4],
		'600':[4,2,4, 2,3,4,2,4],
		'7': [4,4,2,8,8,2,4],
		'x7': [4,2,8,2,4],
		'700':[4,2,8,2,4, 2,3,4,2,4],
		'8': [0,0,2,2,2,4],
		'x8': [0,2,4,4],
		'800':[0,2,4, 2,3,4,2,4],
		'9': [4,2,2,0,0,2,4,4],
		'x9': [4,2,0,4],
		'900':[4,2,0,4, 2,3,4,2,4],
		'10': [4,4,2,2,2,4,4,4],
		'11': [2,2,5,5,2,8,8,4],
		'12': [4,1,2,2,5,5,8,8],
		'13': [2,2,4,4,2,2,4,4],
		'14': [8,8,1,1,2,4,2,4],
		'15': [8,2,8,4,2,2,4,4],
		'16': [4,4,2,2,4,4,2,2,4],
		'17': [4,4,2,8,2,4,4,2,2,4],
		'18': [2,0,2,4,2,2,2,4,4],
		'19': [4,4,2,2,4,4,2,2,4],
		'20': [4,1,1,2,2,4],
		'x20': [4,1,2,4],
		'30': [4,4,0,0,2,4,4,2],
		'x30': [4,2,4],
		'40': [8,1,2,4,2,2],
		'x40': [8,1,2],
		'50': [8,2,8,4,2,2],
		'x50':[8,2,4],
		'60':[4,2,2,4,4,2,2,4],
		'x60':[4,2,4,2,4],
		'70': [4,2,8,2,4,4,2,2],
		'x70': [4,2,8,2,4],
		'80': [2,2,0,4,2,2],
		'x80': [2,0,4,2],
		'90': [4,2,0,2,4,4,2,2],
		'x90': [4,2,0,4,2],
		
		'thou':[5,3,1,4,4],
		'mil':[7,2,5,2,1,4],
		'bil':[7,2,5,2,4],

	};
	
	window.sound = new Howl({
		src: ['numbers.wav'],
		sprite: {
		'0':		[000, 661],
		'1': 		[1000, 703],
		'2': 		[2000, 655],
		'3': 		[3000,757],
		'4': 		[4000,697],
		'5': 		[5000,699],
		'6':		[6000,867],
		'7':		[7000,725],
		'8':		[8000,687],
		'9':		[9000,767],
		'10':		[10000,797],
		'11':		[11000,769],
		'12':		[12000,839],
		'13':		[13000,765],
		'14':		[14000,815],
		'15':		[15000,755],
		'16':		[16000,927],
		'17':		[17000,969],
		'18':		[18000,936],
		'19':		[19000,875],
		'20':		[20000,571],
		'30':		[21000,757],
		'40':		[22000,591],
		'50':		[23000,655],
		'60':		[24000,759],
		'70':		[25000,771],
		'80':		[26000,629],
		'90':		[27000,755],
		'100':	[28000,957],
		'200':	[29000,793],
		'300':	[30000,736],
		'400':	[31000,743],
		'500':	[32000,815],
		'600':	[33000,808],
		'700':	[34000,980],
		'800':	[35000,807],
		'900':	[36000,939],
		'1000':	[37000,166],
		'1000000':	[38000,827],
		'x1':		[39000,393],
		'x2':		[39500,424],
		'x3':		[40000,455],
		'x4':		[40500,447],
		'x5':		[41000,460],
		'x6':		[41500,499],
		'x7':		[42000,498],
		'x8':		[42500,408],
		'x9':		[43000,408],
		'x20':	[43500,390],
		'x30':	[44000,310],
		'x40':	[44500,296],
		'x50':	[45000,326],
		'x60':	[45500,499],
		'x70':	[46000,500],
		'x80':	[46500, 422],
		'x90':	[47000, 473],
		'x100':	[47500, 495],
		'thou':	[48000, 500],
		'mil':	[49000, 552],
		'bil':	[50000, 492],
		}
	});

}

Robot.prototype = Object.create(RobotBase.prototype);

Robot.prototype.reset = function()
{
	this.balloons.reset();
	this.bees.reset();
	this.canvas.getContext("2d").drawImage(this.bgimg, 0, 0);
}




Robot.prototype.set_sky = function* (sym, index, value, push)
{
	yield* this.draw_objs(this.balloons, value);
}

Robot.prototype.set_grass = function* (sym, index, value, push)
{
	yield* this.draw_objs(this.grasshoppers, value);
}

Robot.prototype.set_flowers = function* (sym, index, value, push)
{
	yield* this.draw_objs(this.bees, value);
}

Robot.prototype.draw_objs = function* (gfx, num)
{	
	gfx.start(num);
	var frame = 1;
	var ctx = this.canvas.getContext("2d");
	while (gfx.make_more || gfx.alive.length) {
		gfx.update(frame++);
		ctx.drawImage(this.bgimg, 0, 0);
		gfx.draw(ctx);
		yield;
	}
	
	//~ yield* $.DELAY(say(value));
	return 0;
}

Robot.prototype.get_flowers = function* (sym, index)
{
	return 0;
}
Robot.prototype.get_grass = function* (sym, index)
{
	return 0;
}

Robot.prototype.get_sky = function* (sym, index)
{
	return 0;
}

function say_chain(x)
{		
	if (x >= 0 && x <= 20 || (x <= 100 && x%10==0) || (x < 1000 && x%100==0)) {
		return [""+x];
		
		//~ window.sound.play(""+x);
		//~ return 30;
		
	} else if (x < 100) {
		var ones = x % 10;
		var tens = x - ones;
		return ["x"+tens, "x"+ones];
		
		//~ console.log (tens + " + " + ones);
		//~ var id = window.sound.play("x"+tens);
		//~ window.sound.once('end', function() {window.sound.play("x"+ones);}, id);
		//~ return 40;
		
	} else if (x < 1000) {
		var lower = x %100;
		var hundreds = x - lower;
		return [""+hundreds].concat(say_chain(lower));
		
		
		//~ console.log (hundreds + " + " + tens + " + " + ones);
		//~ var id = window.sound.play(""+hundreds);
		//~ window.sound.once('end', function() {
			//~ say (tens+ones);
		//~ }, id);
		//~ return 50;
		
	} else if (x < 1000000) {
		var hundreds = x%1000;
		var thous = (x - hundreds) / 1000;
		var chain = say_chain(thous);
		chain.push("thou");
		
		return hundreds?chain.concat(say_chain(hundreds)):chain;
		
	} else if (x < 1000000000) {
		var thous = x%1000000;
		var mil = (x-thous) / 1000000;
		var chain = say_chain(mil);
		chain.push("mil");
		return thous?chain.concat(say_chain(thous)):chain;
		
	} else {
		var mil = x%1000000000;
		var bil = (x-mil) / 1000000000;
		var chain = say_chain(bil);
		chain.push("bil");
		return mil?chain.concat(say_chain(mil)):chain;
	}
	
	return [];
}





Robot.prototype.set_sun = function* (sym, index, value, push)
{
	function playsound(snds) {
		if (!snds.length)
			return;
		var id = window.sound.play(snds.shift());
		window.sound.once('end', function() {playsound(snds);}, id);
	}
	
	var chain = say_chain(value);	
	playsound(chain.slice(0));
	var ctx = this.canvas.getContext("2d");
	for( var i=0; i < chain.length; ++i) {
		var lips = this.lips[chain[i]];
		if (!lips) {
			yield* $.DELAY(Math.floor(window.sound._sprite[chain[i]][1]/17));
			continue;
		}
		
		for (var j =0; j < lips.length;++j) {
			ctx.drawImage(this.bgimg, 0, 0);
			ctx.drawImage(this.lipimg, lips[j]*50, 0, 50,60, 54,60, 50,60);
			
			yield;yield;yield;yield;yield;yield;
		}
	}
	ctx.drawImage(this.bgimg, 0, 0);
	
	
	
	
	return 0;
}


Robot.prototype.get_sun = function* (sym, index)
{
	return 0;
}


/// INIT
var bar = new Bar("Sunny Day");
var coder = new Coder();
window.robot = new Robot(coder);
//~ var osk = new Osk(coder);
coder.reset();

document.body.append(bar.el);
document.body.append(window.robot.el);
document.body.append(coder.el);
//~ document.body.append(osk.el);

coder.focus('main');
function frame_update() {
	coder.update();
	window.requestAnimationFrame(frame_update);
}
window.requestAnimationFrame(frame_update);

});


