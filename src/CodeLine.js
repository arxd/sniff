define(["util", "Token"], function($, Token) {

function CodeLine(func, lineno)
{
	this.el = $.DIV("CodeLine");
	this.sym = func;
	this.next  = null;
	this.prev = null;
	this.txt = "";
	this.lineno = lineno;
	this.mark = -1;
	this.toks = null;
}

CodeLine.prototype.is_valid = function()
{
	return (this.toks.next.next === this.toks);
}

CodeLine.prototype.is_tail = function()
{
	return (this.toks.next.type == 'TExprRet' && this.toks.next.args[0].type == 'TSym');	
	
}

CodeLine.prototype.redraw = function(hard_error=false)
{
	while(this.el.firstChild)
		this.el.removeChild(this.el.firstChild);
	
	var style = "CodeLine";
	style += (this.mark >= 0) ? " focus" : "";
	style += this.is_valid() ? "" : " soft-error";
	style += hard_error ? " hard-error" :"";
	this.el.className = style;
	
	//~ console.log(this.sym.name+":"+this.lineno+": '"+this.txt+"' :"+this.toks.toString());
	
	this.el.appendChild($.DIV("l", [$.DIV("n", this.lineno.toString())]));
	var tok = this.toks.next;
	var mark = this.mark;
	while (tok !== this.toks) {
		mark = tok.append_to(this.el, mark);
		tok = tok.next;
	}
	tok.append_to(this.el, mark);
}

CodeLine.prototype.renumber = function(idx)
{
	this.lineno = idx;
	this.el.firstChild.firstChild.innerHTML = idx;
}

CodeLine.prototype.tokenize = function()
{
	this.toks = new Token(this);
	this.syms = [];
	var txt = this.txt+'\n'
	var off, tok, prevc='\n';
	while (txt[0] != '\n') {
		tok = new Token(this.line);
		off = tok.parse(txt, prevc);
		prevc = txt[off-1];
		txt = txt.slice(off);
		this.toks.insertBefore(tok);
		if (tok.type == 'TSym')
			this.syms.push(tok.txt);
	}
	this.toks.foldup();
	//~ console.log(this.sym.name + ": "+this.lineno+": Tokenize");
	this.redraw();
}

CodeLine.prototype.chop = function()
{
	var tail = this.txt.slice(this.mark);
	this.txt = this.txt.slice(0, this.mark);
	this.mark = -1;
	this.toks = null;
	return tail;
}

CodeLine.prototype.insert = function(c)
{
	this.txt = this.txt.slice(0, this.mark) + c + this.txt.slice(this.mark);
	this.mark += c.length;
	this.toks = null;
}

CodeLine.prototype.clear = function()
{
	this.txt = "";
	this.mark = 0;
	this.toks = null;
	return true;
}

CodeLine.prototype.bksp = function()
{
	if (this.mark == 0)
		return false;
	this.txt = this.txt.slice(0, this.mark-1) + this.txt.slice(this.mark);
	this.mark -= 1;
	this.toks = null;
	return true;
}

CodeLine.prototype.nav = function(index)
{
	if (index > this.txt.length)
		index = this.txt.length;
	this.mark = index;
}

CodeLine.prototype.set = function(value, pop=false)
{
	this.toks = new Token(this);
	var expr = new Token(this, 'TExprRet');
	expr.op = new Token(this, pop?'TPop':'TRet', pop? '↑': '←');
	if (value < 0) {
		expr.args = [new Token(this, 'TNeg', '')];
		expr.args[0].args = [new Token(this, 'TPos', (-value).toString())];
	} else {
		expr.args = [new Token(this, 'TPos', value.toString())];
	}
	this.toks.insertBefore(expr);
	this.redraw();
}

CodeLine.prototype.hilite = function(cls)
{
	this.el.className = "CodeLine "+cls;
}

CodeLine.prototype.compile = function()
{
	var valid = this.is_valid();
	this.redraw(!valid);
	return valid;
}

return CodeLine;
});
