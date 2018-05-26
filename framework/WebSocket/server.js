const EventEmitter = require('events').EventEmitter;
const WebSocket = require('ws');

class server extends EventEmitter{
	
	constructor(port = 56676){
		super();
		this.port = port;
		this.clientList = {};
		this.actionList = {};
		this.__start();
	}
	
	__start(){
		try{
			let self = this;
			let wss = this.wss = new WebSocket.Server({ port: this.port });
			wss.on('connection', function (ws) {
				ws.on('message', self.__clientMessage.bind(self, ws));
			});
			setInterval(function () {
				for (let k of Object.keys(self.clientList)){
					let c = self.clientList[k];
					if (new Date().getTime() - c.last > 1000*30)
						self.__clientExits(c);
				}
			}, 1000);
		}catch(e){
			this.__start();
		}
	}
	
	async __clientMessage(ws, data){
		try{
			let self = this;
			let json = JSON.parse(data);
			if (!json.cid || !json.action) return;
			let client = this.clientList[json.cid];
			switch (json.action){
				case 'server.register':
					if (!json.sid) return;
					client = this.clientList[json.cid] = {
						ws, id: json.cid, topic: {},
						create: new Date().getTime(),
						last: new Date().getTime(),
						send(data, sid = ""){
							try{
								this.ws.send(JSON.stringify({ sid, data }));
							}catch(e){
								self.__clientExits(this);
							}
						},
						push(topic, data){
							client.send(data, topic);
						}
					};
					client.send(client.id, json.sid);
					this.emit('access', client);
					break;
				case 'server.topic.subscribe':
					//  用户未注册或未设置要注册的topic..直接断开用户
					if (!client || !json.data) return self.__clientExits(this);
					client.last = new Date().getTime();
					client.topic[json.data] = true;
					break;
				case 'server.heartbeat':
					if (!client) {
						try{ ws.terminate(); }catch(e){}
						return;
					}
					client.last = new Date().getTime();
					break;
				default:
					if (!client) return;
					client.last = new Date().getTime();
					//  action未注册则直接返回
					let action = this.actionList[json.action];
					if (!action) return;
					try{
						//  带了sid说明需要返回值...使用await去调用方法
						if (json.sid){
							try{
								let result = await action.call(json, json.data, client);
								result && client.send({ error: false, data: result }, json.sid);
							}catch(e){
								client.send({ error: true, msg: e + '' }, json.sid);
							}
						}else {
							action.call(json, json.data, client);
						}
					}catch(e){}
			}

		}catch(e){
			try{ ws.terminate(); }catch(e){}
		}
	}
	
	__clientExits(client){
		try{ client.ws.terminate(); }catch(e){}
		try{
			delete this.clientList[client.id];
			this.emit('exits', client);
		}catch (e){}
	}
	
	/**
	 * 注册Action
	 * @param action
	 * @param cb
	 * @returns {server}
	 * @constructor
	 */
	register(action, cb){
		if (action && Array.isArray(action)){
			for (let key in action)
				this.actionList[key] = action[key];
			return this;
		}
		if (action && cb && typeof cb === 'function')
			this.actionList[action] = cb;
		return this;
	}
	
	/**
	 * 用户进入
	 * @param cb
	 * @returns {server}
	 * @constructor
	 */
	onAccess(cb){
		this.on('access', cb);
		return this;
	}
	
	/**
	 * 用户退出
	 * @param cb
	 * @returns {server}
	 * @constructor
	 */
	onExits(cb){
		this.on('exits', cb);
		return this;
	}
	
	/**
	 * 推送消息
	 * @param topic 主题
	 * @param data 内容
	 * @param cid 制定用户
	 * @returns {boolean}
	 */
	push(topic = '', data = undefined, cid = ''){
		try{
			if (cid){
				if (!this.clientList[cid] || !this.clientList[cid].topic[topic]) return false;
				this.clientList[cid].push(topic, data);
				return true;
			}
			for (let k in this.clientList){
				let c = this.clientList[k];
				if (!c.topic[topic]) continue;
				c.push(topic, data);
			}
			return true;
		}catch(e){}
		return false;
	}
}

exports = module.exports = server;