const crypto = require('crypto');

exports = module.exports = async (client, wss) => {
	const userIndex = '.sms.user';
	const defType = '_doc';
	const MD5 = (data) => crypto.createHash('md5').update(data).digest('hex');
	
	if(!await client.indices.exists({ index: userIndex })){
		let result = await client.indices.create({ index: userIndex, body: {
			"mappings": {
				'_doc':{
					"properties": {
						"user_name": { "type": "keyword" },
						"pwd": { "type": "keyword" },
						"root": { "type": "boolean" },
						"single_day_limit": { "type": "integer" },
						"info": { "type": "text" },
						"state": { "type": "keyword" },
						"last_login_time": { "type": "long" },
						"create_time": { "type": "long" },
					}
				}
			}
		}});
		if (!result.acknowledged) {
			console.log('初始化用户表时失败...');
			return undefined;
		}
		//  注册系统管理员
		client.create({ index: userIndex, type: defType, id: '18183701769', body: { "root": true, "last_login_time": 0, "single_day_limit": 0, "create_time": 1527043247187, "state": "正常", "user_name": "18183701769", "info": "系统管理员", "pwd": "0ec75c4105abf5b133614d5d285a5c2a" }, refresh: true});
	}
	
	let find_user = async (pwd) => {
		let result = await client.search({ index: userIndex, type: defType, body: { query: { term: { pwd } } }, size: 1, version: true });
		if (result.hits.total > 0 && result.hits.hits.length > 0){
			let user = result.hits.hits[0]._source;
			user._version = result.hits.hits[0]._version;
			user._id = result.hits.hits[0]._id;
			return user;
		}
		throw '未找到该用户...';
	};
	
	let update_user = async (user, doc) => {
		return (await client.update({ index: userIndex, type: defType, id: user._id, body:{ doc }, refresh: true }))._version > user._version;
	};
	
	return {
		async 登录(pwd = ""){
			if (!pwd) throw '登陆信息不存在,请验证后重试...';
			let user = await find_user(pwd);
			if (user.state === '已停用') throw '当前用户已被停用...';
			if (await update_user(user, { last_login_time: new Date().getTime() })){
				wss.push('admin.user.login', user);
				return user;
			}else {
				throw '更新用户信息失败...请联系管理员...';
			}
		},
		async 注册(userInfo){
			if (!userInfo.user_name) throw '用户名不可为空';
			if (!userInfo.password) throw '密码不可为空';
			try{
				userInfo.pwd = MD5(userInfo.user_name + MD5(userInfo.password));
				delete userInfo.password;
				delete userInfo.root;
				userInfo = Object.assign({ root: false, last_login_time: 0, single_day_limit: -1, create_time: new Date().getTime(), state: '正常' }, userInfo);
				await client.create({ index: userIndex, type: defType, id: userInfo.user_name,  body: userInfo, refresh: true });
				wss.push('user.create', userInfo);
				return userInfo;
			}catch(e){
				throw '该用户已存在';
			}
		},
		async 修改密码(pwd, newPasswd){
			if (!pwd || !newPasswd) return false;
			let user = await find_user(pwd);
			let result = await update_user(user, { pwd: MD5(user.user_name + MD5(newPasswd)) });
			result && wss.push('pwd.change', user.user_name );
			return result;
		},
		async 设置状态(pwd, state){
			if (!pwd || !state) return false;
			let user = await find_user(pwd);
			if (!['正常', '已停用', '已超限'].find(p => p === state)) throw '状态码错误...请勿非法操作...';
			let result = await update_user(user, { state });
			result && wss.push('state.change', { id: user.user_name, state });
			return result;
		},
		async 删除用户(pwd){
			if (!pwd) return false;
			let user = await find_user(pwd);
			let result = (await client.delete({ index: userIndex, type: defType, id: user._id, refresh: true }))._id === user._id;
			result && wss.push('delete.users', user.user_name);
			return result;
		},
		async 获取用户列表(){
			try{
				let result = await client.search({ index: userIndex, type: defType, size: 10000, sort: 'create_time:asc' });
				if (result.hits.total > 0 && result.hits.hits.length > 0)
					return result.hits.hits.map(h => h._source);
			}catch(e){}
			return [];
		}
	};
	/*let xxxxx = await c.注册({ user_name: '18183701769', password: 'qjgaqbpt@2015', info: '系统管理员' });
	console.log(xxxxx);*/
	//console.log(await c.删除用户('5cb9b79e1517d41db2a30ce735792c1f'))
};