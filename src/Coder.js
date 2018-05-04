define(["util", "Sym"], function($, Symbol) {

function Coder()
{
	this.el = $.DIV("Symbols");
	this.bot = null;
	this.syms = [];
	this.sym = null;
	this.sym_add("main",true,"");
	$.LISTEN(this, this.el, "mousedown", {capture:true});
	$.LISTEN(this, this.el, "mouseup", {capture:true});
	$.LISTEN(this, this.el, "mousemove", {capture:true});
	$.LISTEN(this, document.body, "keydown", {capture:true});

}

Coder.prototype.focus = function(symname)
{
	for (var s = 0; s < this.syms.length; ++s)
		this.syms[s].focus(false);
	
	this.sym = this.lookup(symname);
	if (this.sym)
		this.sym.focus(true, 0, 100000);
}

Coder.prototype.on_mousedown = function(e)
{
	//~ console.log("DOWN: "+e.button+" @ "+e.screenX + ", "+e.screenY+" / "+e.clientX + ", "+e.clientY + "  "+e.target);
	if (e.button != 0 || this.cur_state != null)
		return;
	var sym = null;
	for (var s = 0; s < this.syms.length; ++s) {
		if (this.syms[s].editable && this.syms[s].lines_el.contains(e.target))
			sym = this.syms[s];
		if (this.syms[s].title.contains(e.target)) {
			this.sym.cur_insert(this.syms[s].name);
			this.sym.scroll_into_view();

		}
	}
	
	if (sym) {
		this.sym.focus(false);
		this.sym = sym;
		var linemark = sym.get_line_mark(e.clientX, e.clientY, e.target);
		//~ console.log("LINEMARK "+linemark);
		this.sym.focus(true, linemark[0], linemark[1]);
	}
	
	e.stopPropagation();
	e.preventDefault();
}

Coder.prototype.on_mousemove = function(e)
{
	//~ if (e.buttons)
		//~ console.log("DRAG: "+e.buttons+" @ "+e.screenX + ", "+e.screenY+" / "+e.clientX + ", "+e.clientY + "  "+e.target);
}

Coder.prototype.on_mouseup = function(e)
{
	//~ console.log("UP  : "+e.button+" @ "+e.screenX + ", "+e.screenY+" / "+e.clientX + ", "+e.clientY + "  "+e.target);

}

Coder.prototype.on_keydown = function(e)
{
	var x = e.which || e.keyCode ;
	var key = e.key;
	//~ console.log(x + " "+key+ "  "+(e.repeat?"repeat ":"") + (e.ctrlKey?"ctrl ":"") + (e.altKey?"alt ":"") + (e.shiftKey?"shift ":""));
	if (x!=9 && e.repeat || e.ctrlKey || e.altKey)
		return;
	if (x==9 && e.shiftKey)
		x = 1009;
	if (x == 9 && e.repeat)
		x=999;
	if (/^[a-zA-Z0-9 <>?,;.*/%= '+-]$/.exec(key)) {
		this.inject_key(key.charCodeAt(0));
	} else {
		this.inject_key(x+1000);
	}
	e.preventDefault();
	
}

Coder.prototype.inject_key = function(key)
{
	//~ console.log("INJECT "+key);
	if (this.cur_state) {
		// we are running
		if (key == 1009 || key == 1999) { // Run
			this.wait = false;
			
		} else if (key == 1027) {
			this.stop();
		}
		
	} else if (
		key >= 42 && key < 58 || 
		key >= 65 && key < 91 || 
		key >= 97 && key < 123 ||
		key >= 59 && key < 64 ||
		key == 39 || key == 37) {

		this.sym.cur_insert(String.fromCharCode(key));
		
	} else if (key == 32) {
		this.sym.cur_insert('_');
		
	} else switch(key) {
		case 1009: { //run
			this.run(this.lookup('main'), 0);
		}break;
		
		case 2009: { // run line
			this.run(this.sym, this.sym.cur);
		} break;
		
		case 1027: {//excape
			this.bot.reset();
		} break;
		
		case 1046: { // Delete
			this.sym.cur_delete();
		}break;
		
		case 1008: { // Backspace
			this.sym.cur_bksp();
		} break;
		
		case 1013: { // Enter
			this.sym.cur_enter();
		}break;
		
		case 1037: { // Left
			if (!this.sym.cur_left()) {
				this.sym.lines[this.sym.cur].nav(0);
				this.sym.lines[this.sym.cur].redraw();
			}
		} break;
		
		case 1039:{ // Right
			if(!this.sym.cur_right())
			if (!this.sym.cur_left()) {
				this.sym.lines[this.sym.cur].nav(1000000);
				this.sym.lines[this.sym.cur].redraw();
			}
		} break;
		
		case 1038: { // Up
			if (!this.sym.cur_up()) {
				this.sym.focus(false);
				var symid = (this.syms.indexOf(this.sym) + this.syms.length-1)%this.syms.length;
				while (!this.syms[symid].editable)
					symid = (symid+this.syms.length-1)%this.syms.length;
				this.sym = this.syms[symid];
				this.sym.focus(true, this.sym.lines.length-1, 0);
			}				
		}break;
		
		case 1040: { // Down
			if (!this.sym.cur_down()) {
				this.sym.focus(false);
				var symid = (this.syms.indexOf(this.sym) + 1)%this.syms.length;
				while (!this.syms[symid].editable)
					symid = (symid+1)%this.syms.length;
				this.sym = this.syms[symid];
				this.sym.focus(true, 0, 0);
			}
		} break;
	}
	this.sym.scroll_into_view();
	
}

Coder.prototype.lookup = function(sym_name)
{
	for (var s = 0; s < this.syms.length; ++s) {
		if (this.syms[s].name.toLowerCase() == sym_name.toLowerCase())
			return this.syms[s];
	}
	return null;
}


Coder.prototype.reset = function()
{
	//this.el.style.backgroundImage="";
	document.body.style.backgroundImage="";
	this.cur_state = null;
	for(var s = 0; s < this.syms.length; ++s)
		this.syms[s].reset();
	this.wait=true;
}

Coder.prototype.stop = function()
{
	this.reset();
	this.sym = this.last_pos[0];
	this.sym.focus(true, this.last_pos[1], 1000000);
	this.last_pos = null;
}


Coder.prototype.refresh_symbols = function()
{
	var s;
	var referenced_syms = [];
	// collect referenced symbols
	for (s = 0; s < this.syms.length; ++s) {
		var esyms = this.syms[s].extract_symbols();
		for (var s2 = 0; s2 < esyms.length; ++s2) {
			if (referenced_syms.indexOf(esyms[s2])<0)
				referenced_syms.push(esyms[s2]);
		}
	}
	
	// remove symbols that are not referenced
	for (s = 0; s < this.syms.length; s++) {
		var ref = referenced_syms.indexOf(this.syms[s].name);
		if (ref < 0 && this.syms[s].is_blank()) {
			if (this.syms[s].editable)
				this.el.removeChild(this.syms[s].el);
			this.syms.splice(s--, 1);
		} else {
			referenced_syms.splice(ref, 1);
		}
	}
	
	// create new symbols
	for (s = 0; s < referenced_syms.length; ++s) 
		this.sym_add(referenced_syms[s], false, "");
}


Coder.prototype.compile = function()
{
	// Compile
	var valid = true;
	for (var s=0; s < this.syms.length; ++s)
		valid &= this.syms[s].compile();
	
	return valid;
}


Coder.prototype.do_run = function* (fsym, index)
{
	this.last_pos = [this.sym, this.sym.cur];
	yield* fsym.do_from(index);
	this.stop();
}

Coder.prototype.run = function (fsym, index)
{
	this.reset();
	if (!this.compile()) 
		return;
	document.body.style.backgroundImage='url("giphy.gif")';
	if ('pre_run' in this.bot)
		this.bot.pre_run();
	else
		this.bot.reset();
	this.sym.focus(false);
	this.cur_state = this.do_run(fsym,index);
}

Coder.prototype.update = function ()
{
	if (this.cur_state) {
		this.frame ++;
		//~ document.getElementById("ctr").innerHTML = this.frame;
		var r = this.cur_state.next();
		//~ if (r.done) {
			//~ this.cur_state = null;
		//~ }
	}
}


//~ Coder.prototype.sym_remove = function(sym)
//~ {
	//~ this.syms.splice(this.syms.indexOf(sym), 1);
	//~ if (sym.type == "func")
	//~ if (sym.visible)
		//~ this.el.removeChild(sym.el);
	//~ if (sym.type == "var")
		//~ this.el_vars.removeChild(sym.el);
//~ }

Coder.prototype.sym_add = function(name, builtin, nativeHTML)
{
	var sym = new Symbol(this, name, builtin, nativeHTML);
	this.syms.push(sym);
	//~ if (sym.type == "func")
		//~ this.el_funcs.appendChild(sym.el);
	//~ if (sym.type == "var")
	//if (sym.visible) {
		this.el.appendChild(sym.el);
	//} else {
		
	//}
	return sym;
}


return Coder;
});
