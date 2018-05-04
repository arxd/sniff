
define(["util"], function($) {

	
var Robot = function(coder)
{
	this.coder = coder;  // we should break this cycle when destructing
	coder.bot = this; // we should break this cycle when destructing
	this.el = $.DIV("Robot");
	this.state = 'idle';
	this.frame = 0;
	this.time = 0;
	this.idle_func = null;
}


Robot.prototype.new_state = function(state)
{
	this.frame = 0;
	this.state = state;
}

Robot.prototype.set_idle = function()
{
	this.state = "idle";
	this.idle_func();
}

Robot.prototype.reset = function()
{
	this.state="idle";
	this.idle_func = null;
}

Robot.prototype.next_time = function(factor=1.0)
{
	this.time += 1;
	if (this.time > window.world_delay*factor) {
		this.time = 0;
		this.frame += 1;
		return 1;
	}
	return 0;
}

Robot.prototype.update_pause = function()
{
	if (this.next_time(1.0)) {
		this.set_idle();
	}
}


Robot.prototype.run = function(cmd, idle_func)
{
	this.idle_func = idle_func;
	if (this.state != "idle") {
		console.log("Run cmd "+cmd+" inturrupts "+this.state);
	}
	this['command_'+cmd[0]](cmd[1]);
}


Robot.prototype.update = function ()
{
	this['update_'+this.state]();	
}

return Robot;
});
