define(["util"], function($) {

function Token(line, type='TNul', txt="\u00a0")
{
	this.el = $.DIV();
	this.type = type;
	this.line = line;
	this.txt = txt;
	this.args = [];
	this.prev = this;
	this.next = this;
	
}
Token.prototype.char_class = {
	'TSym': "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	'TAdd': "+",
	'TMul':"*",
	'TDiv':"/",
	'TMod':"%",
	'TSub':"-",
	'TEq':"=",
	'TLt':"<",
	'TGt':">",
	'TSto': ";",
	'TPush': "'",
	'TPos': "0123456789",
	'TIf': "?"};



Token.prototype.toString = function()
{
	function t_to_s(t){
		var s = "";
		s = t.type+'/'+t.txt + (t.args.length?"(":"");
		for (var a in t.args)
			s += t.args[a].toString() + " " ;
		return s+(t.args.length?")":"");
	}
	
	var count = 0;
	var t = this.next;
	var s = t_to_s(this);
	while (t !== this) {
		s+= ', '+t_to_s(t);
		count ++;
		t = t.next;
	}
	return count?s+"["+count+"]":s;
}

Token.prototype.hilite = function(cls)
{
	this.el.className = "Token "+this.type + " "+cls;
}


Token.prototype.insertBefore = function(xpr)
{
	xpr.prev = this.prev;
	xpr.next = this;
	xpr.next.prev = xpr;
	xpr.prev.next = xpr;
}

Token.prototype.remove = function()
{
	this.next.prev = this.prev;
	this.prev.next = this.next;	
	this.next = this.prev = this;
}

Token.prototype.isa = function(types)
{
	for (var t in types) 
		if (this.type == types[t])
			return true;
	return false;
	
}

Token.prototype.parse = function(txt, prevc)
{
	var t = 0;
	if (this.type == "TNul") {
		this.txt = txt[0];
		for (var type in this.char_class) {
			if (this.char_class[type].indexOf(txt[0]) >= 0)
				this.type = type;
		}
		return this.parse(txt.slice(1), prevc) + 1;
	
	} else if (this.type == "TMul") {
		this.txt = "⋅";
		
	} else if (this.type == "TSto") {
		this.txt = "→";
		if (prevc == '\n' || prevc=='?') {
			this.type = 'TRet';
			this.txt = "←";
		}
		
	} else if (this.type == "TPush") {
		this.txt = "↓";
		if (prevc == '\n' || prevc=='?') {
			this.type = 'TPop';
			this.txt = "↑";
		} 
		
	} else if (this.type == "TSym") {
		while (this.char_class['TSym'].indexOf(txt[t]) >= 0 || txt[t] == '_')
			t++;
		this.txt += txt.slice(0,t);
	
	} else if (this.type == "TPos") {
		while (this.char_class['TPos'].indexOf(txt[t]) >= 0)
			t++;
		this.txt += txt.slice(0,t);

	}
		
	return t;
}

Token.prototype.append_txt = function(parent, txt, mark)
{
	if (mark >=0 && mark < txt.length) {
		parent.append($.TXT(txt.slice(0, mark)));
		parent.append($.DIV("caret", [$.DIV("","|")]));
		parent.append($.TXT(txt.slice(mark)));
	} else {
		parent.append($.TXT(txt));
	}
	return mark - txt.length;
}

Token.prototype.append_to = function(parent, mark)
{
	this.el.className = "Token " + this.type;
	// remove children
	while(this.el.firstChild)
		this.el.removeChild(this.el.firstChild);
	// Add children
	switch (this.type) {
		case 'TPos': case 'TSub': case 'TAdd': case 'TIf':
		case 'TEq': case 'TGt': case 'TLt': case 'TSto':
		case 'TPush': case 'TPop': case 'TRet': case 'TNul':
		case 'TMul': case 'TDiv': case 'TMod':
			mark = this.append_txt(this.el, this.txt, mark);
			break;
		
		case 'TSym':
			mark = this.append_txt(this.el, this.txt, mark);
			if (this.args.length)
				mark = this.args[0].append_to(this.el, mark);
			break;
		
		case 'TNeg':
			mark = this.append_txt(this.el, '-'+this.args[0].txt, mark);
			break;
		
		case 'TExpr': case 'TExprSto': case 'TExprIf':
			mark = this.args[0].append_to(this.el, mark);
			mark = this.op.append_to(this.el, mark);
			mark = this.args[1].append_to(this.el, mark);
			break;
		
		case 'TExprRet':
			mark = this.op.append_to(this.el, mark);
			mark = this.args[0].append_to(this.el, mark);
			break;
			
	}
	parent.append(this.el);
	return mark;
}

Token.prototype.search = function (types, prevs, nexts)
{
	var x = this.next;
	while (x !== this) {
		if (types.indexOf(x.type) >= 0 && 
		(!prevs || prevs.indexOf(x.prev.type)>=0) && 
		(!nexts || nexts.indexOf(x.next.type)>=0))
			return x;
		x = x.next;
	}
	return null;
}

Token.prototype.fold_unary = function(ops, prevs, nexts, rename)
{
	var op = this.search(ops, prevs, nexts);
	if (!op)
		return false;
	op.op = new Token(this.line, op.type, op.txt);
	op.args = [op.next];
	op.next.remove();
	op.type = rename;
	return true;
}

Token.prototype.fold_binary = function(ops, prevs, nexts, rename)
{
	var op = this.search(ops, prevs, nexts);
	if (!op)
		return false;
	op.op = new Token(this.line, op.type, op.txt);
	op.type = rename
	op.args = [op.prev, op.next];
	op.prev.remove();
	op.next.remove();
	return true;
}


Token.prototype.foldup = function()
{
	while (this.fold_unary(['TSym'], ['TNul', 'TAdd', 'TSub', 'TMul', 'TDiv', 'TMod', 'TEq', 'TLt', 'TGt', 'TIf', 'TRet', 'TPush', 'TPop', 'TSto'], ['TPos'], 'TSym'));
	while (this.fold_unary(['TSub'], ['TAdd', 'TSub', 'TMul', 'TDiv', 'TMod', 'TIf', 'TRet', 'TPop', 'TEq', 'TLt', 'TGt', 'TNul'], ['TPos'], 'TNeg'));
	while (this.fold_binary(['TMul', 'TDiv', 'TMod'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TPos', 'TNeg', 'TSym', 'TExpr'], 'TExpr'));
	while (this.fold_binary(['TAdd', 'TSub'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TPos', 'TNeg', 'TSym', 'TExpr'], 'TExpr'));
	while (this.fold_binary(['TLt', 'TGt'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TPos', 'TNeg', 'TSym', 'TExpr'], 'TExpr'));
	while (this.fold_binary(['TEq'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TPos', 'TNeg', 'TSym', 'TExpr'], 'TExpr'));
	// you only get one return statement
	var TExprRet = this.fold_unary(['TRet', 'TPop'], ['TNul', 'TIf'], ['TPos', 'TNeg', 'TSym', 'TExpr'], 'TExprRet');
	if (!TExprRet) // cant return and store in the same line
		this.fold_binary(['TPush', 'TSto'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TSym'], 'TExprSto');
	// you only get one if statement
	this.fold_binary(['TIf'], ['TPos', 'TNeg', 'TSym', 'TExpr'], ['TPos', 'TNeg', 'TSym', 'TExpr', 'TExprRet', 'TExprSto'], 'TExprIf');
}

return Token;
});

