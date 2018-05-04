
requirejs(['util', 'robot', 'editor'], function ($, Robot, Coder)
{
	
	var DrawRobot = function()
	{
		Robot.call(this);
		this.el = $.EL("svg", "canvas", "http://www.w3.org/2000/svg");
		this.commands = [['dot', 1], ['line', 0], ['color', 0], ['circle', 0]];
	}

	DrawRobot.prototype = Object.create(Robot.prototype);
	
	DrawRobot.prototype.push_random_dot = function()
	{
		this.dot_history.push( [Math.random()*400, Math.random()*300] );
	}

	DrawRobot.prototype.reset = function ()
	{
		while (this.el.firstChild) 
			this.el.removeChild(this.el.firstChild);
		this.dot_history = []
		this.push_random_dot();
		this.push_random_dot();
		this.cur_radius = 10;
		this.cur_color = "red";
	}

	
	DrawRobot.prototype.draw_circle = function(pt, r=2.0)
	{
		var shape = $.EL("circle", "", "http://www.w3.org/2000/svg");
		shape.setAttributeNS(null, "cx", pt[0]);
		shape.setAttributeNS(null, "cy", pt[1]);
		shape.setAttributeNS(null, "r", r);
		shape.setAttributeNS(null, "stroke", this.cur_color);
		shape.setAttributeNS(null, "fill", "none");
		shape.setAttributeNS(null, "stroke-width", "3");
		this.el.appendChild(shape);
	}

	DrawRobot.prototype.draw_line = function(pt1, pt2) {
		var shape = $.EL("line", "", "http://www.w3.org/2000/svg");
		shape.setAttributeNS(null, "x1", pt1[0]);
		shape.setAttributeNS(null, "y1", pt1[1]);
		shape.setAttributeNS(null, "x2", pt2[0]);
		shape.setAttributeNS(null, "y2", pt2[1]);
		shape.setAttributeNS(null, "stroke", this.cur_color);
		shape.setAttributeNS(null, "stroke-width", "3");
		this.el.appendChild(shape);
	}
	

	DrawRobot.prototype.do_cmd_dot = function* (cmd)
	{
		console.log("DOT " + cmd);
		var times = 1;
		if (cmd[2][0] == 'n' && cmd[2][1] > 0 && cmd[2][1] <= 100)
			times = cmd[2][1];
		while(times--) {
			this.push_random_dot();
			var pt = this.dot_history[this.dot_history.length-1];
			this.draw_circle(pt);
			this.cur_radius = 5;
		}
	}
	
	DrawRobot.prototype.do_cmd_circle = function* (cmd)
	{
		var pt = this.dot_history[this.dot_history.length-1];
		this.draw_circle(pt, this.cur_radius);
		this.cur_radius += 5;
	}
	
	DrawRobot.prototype.do_cmd_line = function* (cmd)
	{
		pt1 = this.dot_history[this.dot_history.length-2];
		pt2 = this.dot_history[this.dot_history.length-1];
		this.draw_line(pt1, pt2);
		this.push_random_dot();
		this.dot_history.push( [pt1[0] + (pt2[0] - pt1[0])/2.0, pt1[1] + (pt2[1] - pt1[1])/2.0]);
		var dx = pt1[0] - pt2[0];
		var dy = pt1[1] - pt2[1];
		this.cur_radius = Math.sqrt(dx*dx+dy*dy)/2.0;
	}
	
	DrawRobot.prototype.do_cmd_color = function* (cmd)
	{
		this.cur_color = "hsl("+(Math.random()*360)+", 100%, 60%)";
	}
	
	
	var bot = new DrawRobot();
	var editor = new Coder(bot);
	document.body.append(editor.el_vars);
	document.body.appendChild(bot.el);
	document.body.append(editor.el_funcs);

	
	function frame_update() {
		editor.update();
		window.requestAnimationFrame(frame_update);
	}
	window.requestAnimationFrame(frame_update);

});


