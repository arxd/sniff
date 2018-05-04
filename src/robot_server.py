

from BaseHTTPServer import HTTPServer, BaseHTTPRequestHandler

import serial, time, sys, json, os


STATICDIR='./'


class Handler(BaseHTTPRequestHandler):
	def resp(self, code, type):
		self.send_response(code)
		self.send_header("Content-Type", type)
		self.send_header("Cache-Control","no-cache, must-revalidate")
		self.send_header("Pragma", "no-cache")
		self.send_header("Expires", "Sat, 26 Jul 1997 05:00:00 GMT")
		self.end_headers()
	
	def load_app(self, title, jsmain, css, js=""):
		self.resp(200, "text/html")
		html = """<!DOCTYPE html>
				<html>
				<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>%s</title>
				"""%(title)
		for c in css:
			html+= '<link rel="stylesheet" type="text/css" href="%s.css">\n'%c
		
		html+='<script data-main="%s" src="require.js"></script>'%jsmain
		html+='</head><body><script>%s</script></body></html>'%(js)
		self.wfile.write(html.encode('utf8'))
		
	def get_refresh(self):
		print("----------- Refresh ----------------")
		global PLAYS 
		PLAYS = RPC('get_plays', [])
		#~ with open(DATADIR+'/all_plays.json', 'w', encoding="utf8") as f:
		with open(DATADIR+'/all_plays.json', 'w') as f:
			f.write(json.dumps(PLAYS, indent=4))
		self.resp(200, "application/json")
		self.wfile.write(json.dumps(PLAYS).encode('utf8'))
	
	def redirect(self, to):
		self.send_response(301)
		self.send_header("Location", to)
		self.end_headers()
		
	
	def error(self):
		self.resp(400, "text/html")
		self.wfile.write("Nothing to see here.  Move along.".encode('utf8'))
	
	def a_file(self, filename):
		ext = filename[filename.rfind('.')+1:]
		print("Load %s (%s)"%(filename, ext))
		print(os.path.exists('.'+filename))
		try:
			type = {
			'js':'application/javascript', 
			'css':'text/css', 
			'png':'image/png',
			'jpg':'image/jpeg',
			'gif':'image/gif',
			'mp3':'audio/mpeg'}[ext]
		except:
			return self.error()
			
		f=open('.'+filename,'rb')
		print(f)
		self.resp(200, type)
		self.wfile.write(f.read())
		f.close()
		#~ except:
			#~ return self.error()
	
	
	def do_GET(self):
		print("GET: "+self.path)
		if self.path == '/':
			return self.load_app('', 'devboard', ['devboard', 'bar', 'editor', 'keyboard'])
		return self.a_file(self.path)
		
			
	def do_POST(self):
		r = self.rfile.read(int(self.headers['Content-Length'])).decode('utf-8')
		args = json.loads(r)
		rpc_func =  getattr(self, 'rpc_%s'%(args[u"method"]))
		#~ if not hasattr(rpc_func,'is_rpc'):
			#~ logging.error("Tried to call '%s'.  Not an RPC function"%(args[u"method"]))
			#~ return
		params = args[u"params"]
		args["result"] = rpc_func(*params)
		args.pop(u"method")
		args["error"] = None # IMPORTANT!!
		self.resp(200, "application/json")
		resp = json.dumps(args)
		self.wfile.write(resp.encode())

	def rpc_light(self, index, value):
		print("Set light %d : %d"%(index, value))
		ser.write(b'L')
		ser.write(chr(index%256))
		ser.write(chr(value%256))

	def rpc_beep(self, value):
		print("Set beep %d : %d"%(0, value))
		ser.write(b'B')
		ser.write(chr(value%256))
		#ser.write(chr(value%256))

	def rpc_volume_change(self, sname, db):
		print("VOLUME:%s: %d"%(sname,db))
		SOUNDS[sname].change_volume(db)# = db-15;
	
ser = serial.Serial('/dev/ttyUSB'+sys.argv[3], 115200)  # open serial port
print(ser.name)         # check which port was really used

print("Connecting")
x = ser.read()
while(x!='R'):
	print(x)
	x = ser.read()
ser.write(b'r')

#bytearray([76,3]))


try:
	print("Serving from %s:%d"%(sys.argv[1], int(sys.argv[2])))
	server = HTTPServer( (sys.argv[1],int(sys.argv[2])), Handler)
	server.serve_forever()
except KeyboardInterrupt:
	pass



ser.close()
