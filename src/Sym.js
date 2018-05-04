define(["util", "CodeLine"], function($, CodeLine) {

function Symbol(coder, name, builtin, nativehtml)
{
	this.name = name;
	this.coder = coder;
	this.editable = !nativehtml;
	this.builtin = builtin;
	this.saved_lines = null;
	this.lines = [];
	this.cur = 0;
	
	this.el = $.DIV("Symbol");
	this.title = $.DIV("name", this.name);
	this.el.append(this.title);
	
	if (this.editable) {
		this.lines_el = $.DIV("lines");
		this.el.append(this.lines_el);
	} else {
		this.el.append($.DIV("guts", nativehtml));
	}  
		
}

Symbol.prototype.get_line_mark = function(x,y, target)
{
	function search_sub(el, markin) {
		//~ console.log("SEARCH "+markin+"<"+el.textContent+">  ("+el.nodeType+")");
		if (el.nodeType == 3)
			return el.textContent.length + markin;
		//search sub children
		while (el) {
			if (el.contains(target))
				return search_sub(el.firstChild, markin);
			markin += el.textContent.length;
			el = el.nextSibling;
		}
		return 0;
	}
	
	for (var i = 0; i < this.lines.length; ++i) {
		if (this.lines[i].el.contains(target))
			return [i, search_sub(this.lines[i].el.firstChild.nextSibling, 0)];
	}
	
	return [0, 100000];
}

Symbol.prototype.focus = function(get, line, mark)
{
	if (!this.editable)
		return;
	this.lines_el.className = "lines" + (get ? " focus" : "");
	if (get) {
		if (!this.lines.length) 
			this.insert_line("", 0);
		this.cur = line < 0 ? 0 : line;
		this.lines[this.cur].nav(mark);
		this.lines[this.cur].redraw();
		
	} else if (this.lines.length) {
		if (this.lines.length == 1 && this.lines[0].txt == "") {
			this.remove_line(0);
		} else {
			this.lines[this.cur].nav(-1);
			this.lines[this.cur].redraw();
		}
	}
}

Symbol.prototype.is_blank = function()
{
	return this.lines.length==0 || this.lines.length == 1 && this.lines[0].txt == "";
}

Symbol.prototype.insert_line = function(txt, index)
{
	var newline = new CodeLine(this, index);
	this.lines_el.insertBefore(newline.el, (index < this.lines.length) ? this.lines[index].el : null);
	this.lines.splice(index, 0, newline);
	newline.nav(0);
	newline.insert(txt);
	newline.nav(-1);
	newline.tokenize();
}

Symbol.prototype.remove_line = function(index)
{
	this.lines_el.removeChild(this.lines[index].el);
	this.lines.splice(index, 1);
}

Symbol.prototype.compile = function()
{
	var valid = true;
	for (var i = 0; i < this.lines.length; ++i) 
		valid &= this.lines[i].compile();
	//~ console.log("COMPILE "+this.name + " : " +this.lines.length + " -- "+valid);
	return valid;
}

Symbol.prototype.renumber = function(idx)
{
	while (idx < this.lines.length) {
		this.lines[idx].renumber(idx);
		idx++;
	}
}

Symbol.prototype.save_lines = function()
{
	if (this.saved_lines == null) {
		this.saved_lines = [];
		for (var i = 0; i < this.lines.length; ++i)
			this.saved_lines.push(this.lines[i].txt);
	}
}

Symbol.prototype.reset = function()
{
	this.el.className = this.el.className.replace(" running", "");
	if (!this.editable)
		return;
	//~ console.log("RESET "+this.name + " : "+this.saved_lines);
	if (this.saved_lines == null) {
		for (var i = 0; i < this.lines.length; ++i) {
			this.lines[i].hilite("");
			this.lines[i].tokenize();
		}
	} else {
		this.lines = [];
		while (this.lines_el.firstChild)
			this.lines_el.removeChild(this.lines_el.firstChild);
		this.cur = 0;
		for (var i =0; i < this.saved_lines.length; ++i)
			this.insert_line(this.saved_lines[i], i);
		this.renumber(0);
	}
	this.saved_lines = null;
}

Symbol.prototype.extract_symbols = function()
{
	var symbols = [];
	if (this.builtin)
		symbols.push(this.name)
	for (var i = 0; i < this.lines.length; ++i)
		Array.prototype.push.apply(symbols, this.lines[i].syms);
	return symbols;
}




Symbol.prototype.scroll_into_view = function()
{
	if (!this.lines.length)
		return;
	var cur = this.lines[this.cur];
	var vis_off = cur.el.offsetTop - this.lines_el.scrollTop;
	var bottom = cur.el.offsetParent.clientHeight-cur.el.clientHeight;
	
	//console.log("SCROLL "+this.lines_el.scrollTop +"/"+this.lines_el.scrollHeight+ " voff " +vis_off + " end "+());
	
	if (vis_off < 0) 
		this.lines_el.scrollTop = cur.el.offsetTop;
	
	if (vis_off > bottom)
		this.lines_el.scrollTop = cur.el.offsetTop-cur.el.offsetParent.clientHeight+cur.el.clientHeight;
		
}

/* ============================== CUR ================================================ */

Symbol.prototype.cur_merge_up = function()
{
	if (this.cur == 0)
		return;
	var prev = this.lines[this.cur-1];
	var cur = this.lines[this.cur];
	var mark = prev.txt.length;
	prev.mark = mark;
	if (cur.txt) {
		prev.insert(cur.txt);
		prev.tokenize();
	}
	prev.nav(mark);
	this.remove_line(this.cur);
	this.cur = this.cur-1;
	this.lines[this.cur].redraw();
	this.renumber(this.cur);
	return true;
}

Symbol.prototype.cur_delete = function()
{
	if (!this.lines[this.cur].txt) { // remove line
		if (this.cur_down()) {
			this.cur_merge_up();
		} else {
			this.lines[this.cur].nav(0);
			if (this.cur > 0)
				this.cur_merge_up();
		} 
	} else {
		this.lines[this.cur].clear();
		this.lines[this.cur].tokenize();
	}
	this.coder.refresh_symbols();
}

Symbol.prototype.cur_bksp = function()
{
	if (this.cur == 0 && this.lines[0].mark == 0 && !this.lines[0].txt)
		return this.cur_delete();
	
	if (!this.lines[this.cur].bksp())	
		this.cur_merge_up();
	else
		this.lines[this.cur].tokenize();
	this.coder.refresh_symbols();
}

Symbol.prototype.cur_insert = function(txt)
{
	this.lines[this.cur].insert(txt);
	this.lines[this.cur].tokenize();
	this.coder.refresh_symbols();
}

Symbol.prototype.cur_enter = function()
{			
	var prev = this.cur?this.lines[this.cur-1]:null;
	var cur = this.lines[this.cur];
	if (prev && !prev.txt && !cur.txt.slice(0, cur.mark) )
		return false;
	this.insert_line(cur.chop(), this.cur+1);
	this.renumber(this.cur);
	this.lines[this.cur].tokenize();
	this.coder.refresh_symbols();
	return this.cur_down(0);
}

Symbol.prototype.cur_left = function()
{
	var cur = this.lines[this.cur];
	cur.nav(cur.mark - 1);
	this.lines[this.cur].redraw();
	return cur.mark >= 0;
}

Symbol.prototype.cur_right = function()
{
	var cur = this.lines[this.cur];
	cur.nav( (cur.mark == cur.txt.length) ? -1 : cur.mark+1);
	this.lines[this.cur].redraw();
	return cur.mark >= 0;
}

Symbol.prototype.cur_down = function(mark=this.lines[this.cur].mark)
{
	var cur = this.lines[this.cur];
	cur.nav(-1);
	this.lines[this.cur].redraw();

	if (this.cur == this.lines.length-1)
		return false;
	this.cur ++;
	this.lines[this.cur].nav(mark);
	this.lines[this.cur].redraw();
	return true;
}

Symbol.prototype.cur_up = function(mark = this.lines[this.cur].mark)
{
	var cur = this.lines[this.cur];
	cur.nav(-1);
	this.lines[this.cur].redraw();
	
	if (this.cur == 0)
		return false;
	this.cur --;
	this.lines[this.cur].nav(mark);
	this.lines[this.cur].redraw();

	return true;
}

/* ============================== DO ================================================ */

Symbol.prototype.do_pause = function* ()
{
	while(this.coder.wait)
		yield;
	this.coder.wait = true;
}

Symbol.prototype.do_error = function* ()
{
	while (true) {
		this.lines[this.cur].hilite("error");
		yield* $.DELAY(15);
		this.lines[this.cur].hilite("");
		yield* $.DELAY(15);
	}
}


Symbol.prototype.do_expr_pause = function* (expr)
{
	expr.hilite("ready");
	expr.op.hilite("readyop");
	yield* this.do_pause();
	expr.op.hilite("");
	expr.hilite("");
}

Symbol.prototype.expr_substitute = function(expr, val)
{
	while(expr.el.firstChild)
		expr.el.removeChild(expr.el.firstChild);
	expr.el.append($.DIV("Token TSub", val.toString()));
	//var w = expr.el.scrollWidth;
	//~ if (w > expr.el.clientWidth) 
		//~ expr.el.style.width = (w<100? w : 100)+'px';
	
}

Symbol.prototype.do_expr_TNul = function* (expr)
{
	return [0, false];
}

Symbol.prototype.do_expr_TPos = function* (expr)
{
	return [parseInt(expr.txt), false];
}

Symbol.prototype.do_expr_TNeg = function* (expr)
{
	return [-parseInt(expr.args[0].txt), false];
}

Symbol.prototype.do_expr_TSym = function* (expr)
{
	var val, sym = this.coder.lookup(expr.txt);
	expr.hilite("ready");
	yield* this.do_pause();
	var index = expr.args.length?parseInt(expr.args[0].txt) : 0;
	if (!sym.editable) {
		expr.hilite("readyop");
		sym.el.className += " running";
		val = yield* this.coder.bot['get_'+sym.name](this, index);
		sym.el.className = sym.el.className.replace(" running","");
		expr.hilite("");
	} else {
		expr.hilite("");
		val = yield* sym.do_from(index);
	}
	this.expr_substitute(expr, val);
	return [val, false];
}

Symbol.prototype.do_expr_TExpr = function* ( expr)
{
	// Fetch operands
	var a = (yield* this.do_expr(expr.args[0]))[0];
	var b = (yield* this.do_expr(expr.args[1]))[0];

	yield* this.do_expr_pause(expr);
	
	// Execute
	var c;
	switch (expr.op.type) {
		case 'TAdd': c = a+b; break;
		case 'TSub': c = a-b; break;
		case 'TLt': c = (a<b)?1:0; break;
		case 'TGt': c = (a>b)?1:0; break;
		case 'TEq': c = (a==b)?1:0; break;
		case 'TMul': c = a*b; break;
		case 'TDiv': c = (b == 0? Math.floor(Math.random()*100000): Math.floor(a/b)); break;
		case 'TMod': c=  (b == 0? Math.floor(Math.random()*100000): a%b); break;
	}
	// Hide ourselves and show the answer
	this.expr_substitute(expr, c);
	return [c, false];
}

Symbol.prototype.do_expr_TExprIf = function* (expr)
{
	var pred = yield* this.do_expr(expr.args[0]);
	var ret = [0, false];
	if (pred[0]==0) {
		expr.op.hilite("false");
		expr.args[0].hilite("false");
		expr.args[1].hilite("strike");
		yield* this.do_pause();
		this.lines[this.cur].redraw();
	} else {
		expr.op.hilite("readyop");
		expr.args[0].hilite("readyop");
		//~ expr.args[2].hilite("ready");
		yield* this.do_pause();
		this.lines[this.cur].redraw();
		ret = yield* this.do_expr(expr.args[1]);
	}
	return ret;
}

Symbol.prototype.do_store = function (index, value, push)
{	
	while (index < 0)
		index += this.lines.length+(push?1:0);
	
	if (push || index >= this.lines.length)
		this.save_lines();
	while (index > this.lines.length-(push?0:1)) 
		this.insert_line("", this.lines.length);
	if (push) {
		this.insert_line("", index);
		this.renumber(index);
	}
	this.cur = index;
	this.scroll_into_view();
	this.lines[index].set(value, push);
	return value;
}


Symbol.prototype.do_expr_TExprSto = function* (expr)
{
	// Eval left
	var pred = yield* this.do_expr(expr.args[0]);
	
	yield* this.do_expr_pause(expr);
	
	// Store
	var sym = this.coder.lookup(expr.args[1].txt);
	var index = expr.args[1].args.length ? parseInt(expr.args[1].args[0].txt) : 0;
	var ret;
	if (!sym.editable) {
		ret = yield *this.coder.bot['set_'+sym.name](this, index, pred[0], expr.op.type=='TPush');
	} else {
		ret = sym.do_store(index, pred[0], expr.op.type=='TPush');
	}
	return [ret, false];
}

Symbol.prototype.do_expr_TExprRet = function* (expr)
{
	var pred = yield* this.do_expr(expr.args[0]);
	yield* this.do_expr_pause(expr);
	if (expr.op.type == 'TPop') {
		this.save_lines();	
		this.lines_el.removeChild(this.lines[this.cur].el);
		this.lines.splice(this.cur, 1);
	}
	return [pred[0], true];
}

Symbol.prototype.do_expr = function* (expr)
{
	//~ console.log("DO "+expr.type + " : "+expr.toString());
	return yield* this['do_expr_'+expr.type](expr);
}

Symbol.prototype.do_from = function* (index)
{
	var sym = this;
	for (var i = index; i < sym.lines.length; ++i) {
		sym.lines[i].hilite("run");
		sym.cur = i;
		sym.scroll_into_view();
		if (sym.lines[i].is_tail()) {
			yield* this.do_expr_pause(sym.lines[i].toks.next);
			sym.lines[i].hilite("");
			var tsym = sym.lines[i].toks.next.args[0];
			sym = this.coder.lookup(tsym.txt);
			i = tsym.args.length ? parseInt(tsym.args[0].txt)-1 : -1;
			continue;
		}
		var ret = yield* sym.do_expr(sym.lines[i].toks.next);
		if (i < sym.lines.length) {
			sym.lines[i].redraw();
			sym.lines[i].hilite("");
		}
		if (ret[1])
			return ret[0];
	}
	return Math.floor(Math.random()*1000);
}


return Symbol;
});

