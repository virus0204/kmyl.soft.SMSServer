(async () => {
	const fs = require('fs');
	const path = require('path');
	const app = require('express')();
	const session = require('express-session');
	const bodyParser = require('body-parser');
	const staticPath = [path.join(__dirname, './static'), path.join(__dirname, './node_modules')];
	const elasticsearch = require('elasticsearch');
	
	process.on('uncaughtException', (err) => { });
	
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(session({secret: 'KMYLQJGA'}));
	
	const port = 1024;
	app.client = new elasticsearch.Client({ hosts: ['http://127.0.0.1:9200'] });
	app.wss = new (require('./framework/WebSocket').server)();
	app.vueEngine = new (require('./framework/vueCompilerEngine'))(['login/index.js', 'index/index.js']);
	
	app.use('/static', function (req, res) {
		try{
			if (req.method === 'GET' || req.method === 'HEAD'){
				for (let s of staticPath.map(x => path.join(x, '.' + req.path))){
					if (fs.existsSync(s)) return fs.ReadStream(s).pipe(res);
				}
			}
		}catch(e){}
		res.status(405).end('not find resources...');
	});
	
	for (let m of ['./controller/系统初始化', './controller/用户登录', './controller/短信平台'])
		await require(m)(app);
	
	app.listen(port, function () {
		console.log(`web服务启动完成....地址: http://localhost:${port}/`)
	});
})();