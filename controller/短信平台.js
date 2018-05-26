exports = module.exports = async (app) => {
	let wss = app.wss;
	let client = app.client;
	
	wss.register('get.users', async function () {
		let list = await app.用户.获取用户列表();
		for (let item of list){
		
		}
		return list;
	});
	
	wss.register('new.users', async function (data) {
		return await app.用户.注册(data);
	});
	
	wss.register('update.user.pwd', async function (data) {
		return await app.用户.修改密码(data.pwd, data.newPasswd);
	});
	
	wss.register('delete.user', async function (pwd) {
		return await app.用户.删除用户(pwd);
	});
	
	wss.register('set.user.state', async function (data) {
		return await app.用户.设置状态(data.pwd, data.state);
	});
	
	wss.register('get.group.list', async function (data, c) {
		if (!c.session) throw '请先登录...';
		return await app.通讯录.获取分组列表(c.session.user.root ? '' : c.user._id);
	});
	
	wss.register('add.group', async function (name, c) {
		if (!c.session) throw '请先登录...';
		return await app.通讯录.添加分组(c.session.user._id, name);
	});
	
	wss.register('delete.group', async function (id, c) {
		return await app.通讯录.删除分组(id);
	});
	
	wss.register('get.contacts.list', async function (data) {
		return await app.通讯录.获取联系人列表(data.uid, data.gid, data.q, data.page, data.size);
	});
	
	wss.register('add.contacts', async function (contacts, c) {
		if (!c.session) throw '请先登录...';
		return await app.通讯录.添加联系人(c.session.user._id, contacts);
	});
	
	wss.register('update.contacts', async function (contacts, c) {
		if (!c.session) throw '请先登录...';
		return await app.通讯录.修改联系人(contacts);
	});
	
	wss.register('delete.contacts', async function (cid, c) {
		if (!c.session) throw '请先登录...';
		return await app.通讯录.删除联系人(cid);
	});
	
	wss.register('get.phone.list', async function (data) {
		return await app.通讯录.获取全省手机号码库(data.q, data.page, data.size);
	});
};