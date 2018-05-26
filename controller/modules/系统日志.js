exports = module.exports = async (client, wss) => {
	const logIndex = '.sms.log';
	const defType = '_doc';
	
	const __NewGuid = () =>
	{
		let S4 = ()=> (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
	};
	
	if(!await client.indices.exists({ index: logIndex })){
		let result = await client.indices.create({ index: logIndex, body: { "mappings": { '_doc':{ "properties": { "user": { "type": "keyword" }, "msg": { "type": "text" }, "createTime": { "type": "long" } } } } }});
		if (!result.acknowledged) {
			console.log('初始化系统日志表时失败...');
			process.exit();
		}
	}
	
	return {
		async 添加日志(user, msg, tag = {}){
			if (!user || !msg) return undefined;
			try{
				let body = { user, msg, createTime: new Date().getTime(), tag };
				await client.create({ index: logIndex, type: defType, id: __NewGuid(),  body});
				wss.push('system.log', body);
			}catch(e){}
		}
	};
};