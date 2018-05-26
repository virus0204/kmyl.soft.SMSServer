exports = module.exports = async (app) => {
	let client = app.client;
	app.用户 = await (require('./modules/用户管理.js'))(client, app.wss);
	if (!app.用户) process.exit();
	
	app.日志 = await (require('./modules/系统日志.js'))(client, app.wss);
	if (!app.日志) process.exit();
	
	app.通讯录 = await (require('./modules/通讯录.js'))(client, app.wss);
	if (!app.通讯录) process.exit();
};