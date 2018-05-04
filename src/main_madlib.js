
requirejs(['util', 'robot', 'Coder'], function ($, Robot, Coder)
{
	
	var MadRobot = function()
	{
		Robot.call(this);
		this.story = "I am a [color] [noun].  I have [number] arms.  I like to [verb]";
		this.commands = [['tell', false], ['verb', true], ['noun', true]];
		
			//~ ['te', ['n', 1, 10, 1], null],
			//~ ['turn', ['n', -10, 10, 1], null],
			//~ ['beep', ['n', 0, 15, 1], null],
			//~ ['color', ['n', 0, 8, -1], null],
			//~ ['say', ['n', 0, 32, null], null]];

	}
	
	MadRobot.prototype = Object.create(Robot.prototype);
	
	MadRobot.prototype.do_tell = function* (line, args)
	{
		alert(args[0]);
	}
	
	
	var editor = new Coder(new MadRobot());
	
	document.body.append(editor.el);
	
	function frame_update() {
		editor.update();
		window.requestAnimationFrame(frame_update);
	}
	window.requestAnimationFrame(frame_update);

	
	
	

});


