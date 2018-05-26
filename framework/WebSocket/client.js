class client{
	
	constructor(host = "127.0.0.1", port = 56676){
		this.host = host;
		this.port = port;
		this.cid = localStorage.getItem('pwd') || "";
		this.messageQueue = {};
		this.conn = false;
		this.uclose = false;
		this.ws = undefined;
		this.interval = undefined;
		this.readyAndCloseEvents = { };
	}
	
	__NewGuid()
	{
		let S4 = ()=> (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
	}
	
	__start(){
		try{
			let self = this;
			let ws = this.ws = new WebSocket(`ws://${this.host}:${this.port}`);
			ws.onopen = async function () {
				self.conn = true;
				let result = await self.send('server.register');
				if (!result || result !== self.cid)
					return ws.close();
				//  2秒发送一次心跳包
				if (self.readyAndCloseEvents['ready']){
					for (let k of Object.keys(self.readyAndCloseEvents['ready'])){
						self.readyAndCloseEvents['ready'][k]();
					}
				}
				self.interval = setInterval(() => self.send('server.heartbeat'), 2000);
			};
			
			ws.onmessage = function (event) {
				try{
					if (!event.data) return;
					let json = JSON.parse(event.data);
					if (!json.sid || !json.data) return;
					let queue = self.messageQueue[json.sid];
					if (!queue) return;
					if (Array.isArray(queue)){
						for (let cb of queue)
							try{ cb(json.data); }catch(e){}
					}else {
						clearTimeout(queue.time);
						delete self.messageQueue[json.sid];
						queue.cb(json.data);
					}
				}catch(e){}
			};
			
			ws.onclose = function () {
				self.conn = false;
				clearInterval(self.interval);
				self.interval = undefined;
				self.messageQueue = {};
				if (self.readyAndCloseEvents['close']){
					for (let k of Object.keys(self.readyAndCloseEvents['close'])){
						self.readyAndCloseEvents['close'][k]();
					}
				}
				if (self.uclose) return;
				setTimeout(self.__start.bind(self), 1000 * 10);
			};
		}catch(e){}
	}
	
	__send(action, data, cb){
		if (!this.conn || !action) return;
		try{
			let msg = { sid: cb && typeof cb === 'function' ? this.__NewGuid() : undefined, cid: this.cid, action, data };
			if (msg.sid) {
				this.messageQueue[msg.sid] = { cb, time: setTimeout(() => {
					try {
						this.messageQueue[msg.sid](undefined);
						delete this.messageQueue[msg.sid];
					}catch (e) {}
				}, 1000 * 10)};
			}
			this.ws.send(JSON.stringify(msg));
		}catch(e){
		}
	}
	
	start(){
		this.__start();
		return this;
	}
	
	close(){
		try{
			this.uclose = true;
			this.ws && this.ws.close();
		}catch(e){}
	}
	
	send(action = "", data = "", cb = undefined){
		if (!this.conn || !action) return;
		if (cb) this.__send(action, data, cb);
		else return new Promise(r => this.__send(action, data, r));
	}
	
	subscribe(topic, cb){
		if (!this.conn) return this;
		if (Array.isArray(topic)){
			for (let key of topic)
				this.subscribe(key, cb);
		}
		else if (topic && cb) {
			let self = this;
			if (!self.messageQueue[topic]) {
				self.messageQueue[topic] = [];
				this.send('server.topic.subscribe', topic);
			}
			self.messageQueue[topic].push(cb);
		}
		return this;
	}
	
	onReady(name, cb){
		if (!this.readyAndCloseEvents['ready']){
			this.readyAndCloseEvents['ready'] = {};
		}
		this.readyAndCloseEvents['ready'][name] = cb;
		this.conn && cb();
		return this;
	}
	
	onClose(name, cb){
		if (!this.readyAndCloseEvents['close']){
			this.readyAndCloseEvents['close'] = {};
		}
		this.readyAndCloseEvents['close'][name] = cb;
		return this;
	}
}
exports = module.exports = client;