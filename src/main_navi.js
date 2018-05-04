
requirejs(['util', 'robot', 'editor'], function ($, Robot, Coder)
{
	var levels = [
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
			[1,0,3,0,6],
			[0,1,0,6,0]],
		home: [1,3,0]
		}
	];
	
	var robot_beep = new Howl({
		src: ['beep.wav', 'beep.mp3', 'beep.webm'],
		sprite: {
			s0: [0, 250],
			s1: [250, 250],
			s2: [500, 250],
			s3: [750, 250],
			s4: [1000, 250],
			s5: [1250, 250],
			s6: [1500, 250],
			s7: [1750, 250],
		}
	});
		
		
		
	var NaviRobot = function()
	{
		Robot.call(this);
		this.commands = [['go', 1], ['turn', 1],  ];
		
			//~ ['te', ['n', 1, 10, 1], null],
			//~ ['turn', ['n', -10, 10, 1], null],
			//~ ['beep', ['n', 0, 15, 1], null],
			//~ ['color', ['n', 0, 8, -1], null],
			//~ ['say', ['n', 0, 32, null], null]];

	}
	NaviRobot.prototype = Object.create(Robot.prototype);


 
function create_level_buttons()
{
	
	lvls = $.DIV('levels');
	for (i in levels) {
		lvl = document.createElement('span');
		lvl.innerHTML = "Level "+i;
		lvl.id = "L"+i;
		var q = i;
		(function(lvi) {
			lvl.addEventListener('mousedown',function() {set_level(lvi);});
		})(i);
		lvls.appendChild(lvl);
	}
}

function create_tiles()
{
	var map_area = document.getElementById("map-area");
	map_area.style.width = (map_size*120)+'px';
	map_area.style.height = (map_size*70+35)+'px';
	var r, c;
	for (r = 0; r < map_size; r+=1) {
		for ( c=0; c < map_size; c+=1) {
			var div = document.createElement("div");
			div.id = 'm_'+r+'_'+c
			div.className = 'g0';
			div.style.left=(c-r +map_size-1)*60 + 'px';
			div.style.top = (r+c)*35 + 'px';
			map_area.appendChild(div);
		}
	}
}



	var editor = new Coder(new MadRobot());
	
	document.body.append(editor.el_vars);
	document.body.append(editor.el_funcs);

	
	function frame_update() {
		editor.update();
		window.requestAnimationFrame(frame_update);
	}
	window.requestAnimationFrame(frame_update);

	
	
	

});


