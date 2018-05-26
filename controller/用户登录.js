const login_users = {  };
exports = module.exports = async (app) => {
	let wss = app.wss;
	
	app.wss.on('access', function (client) {
		//  该用户未登录则断开socket连接
		if(!client.id || !login_users[client.id]) return wss.__clientExits(client);
		client.session = login_users[client.id];
		login_users[client.id].client = client;
	});
	
	app.use('/login', async function (req, res) {
		try{
			if (req.method !== 'POST') return res.json({ success: false, message: '未识别的通讯协议...' });
			let pwd = req.body.pwd;
			if (!pwd) return res.json({ success: false, message: '未识别的用户...' });
			let user = await app.用户.登录(pwd);
			if (!user) return res.json({ success: false, message: '用户名/密码不正确...' });
			req.session.user = user;
			login_users[pwd] = { user, session: req.session, time: new Date().getTime() };
			res.json({ success: true });
		}catch (e){
			res.status(404).end('' + e);
		}
	});
	
	app.get('/logout', async function (req, res) {
		try{
			if (!req.session.user) throw '当前并未登录..';
			let t = login_users[req.session.user.pwd];
			wss.__clientExits(t.client);
			delete login_users[req.session.user.pwd];
			req.session.destroy();
			res.end();
		}catch (e){
			res.status(404).end('' + e);
		}
	});
	
	app.get('/', async function (req, res) {
		try{
			res.end(await app.vueEngine.router(req.session.user ? 'index/index.js' : 'login/index.js', req.session.user || {}));
		}catch (e){
			res.status(404).end('请联系管理员...! 异常原因:' + e);
		}
	});
};