const elasticsearch = require('elasticsearch');

exports = module.exports = async (client, wss) => {
	let client_81 = new elasticsearch.Client({ hosts: ['http://127.0.0.1:9200'] });
	const index = '.sms.contacts';
	const index_group = '.sms.contacts.group';
	const defType = '_doc';
	
	//  region mappings
	if(!await client.indices.exists({ index:index_group })){
		let result = await client.indices.create({ index: index_group, body: {
				"mappings": {
					'_doc':{
						"properties": {
							"name": { "type": "keyword" },
							"uid": { "type": "keyword" },
							"create_time": { "type": "long" }
						}
					}
				}
			}});
		if (!result.acknowledged) {
			console.log('初始化通讯录分组表时失败...');
			return undefined;
		}
	}
	if(!await client.indices.exists({ index })){
		let result = await client.indices.create({ index, body: {
			"mappings": {
				'_doc':{
					"properties": {
						"uid": { "type": "keyword" },
						"group_id": { "type": "keyword" },
						"name": { "type": "keyword" },
						"name_py": { "type": "keyword" },
						"phone": { "type": "keyword" },
						"info": { "type": "text" },
						"create_time": { "type": "long" }
					}
				}
			}
		}});
		if (!result.acknowledged) {
			console.log('初始化联系人表时失败...');
			return undefined;
		}
	}
	// endregion
	
	let find_by_id = async (cIndex, id) =>{
		try{
		    let result = await client.get({ index: cIndex, type: defType, id });
		    return Object.assign({ _id: result._id, _version: result._version }, result._source);
		}catch(e){}
		return undefined;
	};
	
	let 限制对象属性 = (obj, attributes) => {
		let skeys = Object.keys(obj);
		for (let k of skeys){
			if (!attributes.find(a => a === k))
				delete obj[k];
		}
	};

	return {
		async 获取分组列表(uid = ''){
			try{
				let body = uid ? { query: { term: { uid: uid } } }: undefined;
				let result = await client.search({ index: index_group, type: defType, body: body, size: 10000, sort: 'create_time:desc' });
				if (result.hits.total > 0 && result.hits.hits.length > 0)
					return result.hits.hits.map(h => Object.assign({ _id: h._id }, h._source));
			}catch(e){}
			return [];
		},
		async 添加分组(uid = '', name = ''){
			if (!uid) throw '未识别的用户...';
			if (!name) throw '分组名称为空,请验证后重试...';
			let id = `${ uid }_${ name }`;
			if (await find_by_id(index_group, id)) throw '该分组已存在';
			try{
				let body = { uid, name, create_time: new Date().getTime() };
				await client.create({ index: index_group, type: defType, id: id,  body, refresh: true });
				wss.push('contacts', { action: 'new.group', uid, name });
				body._id = id;
				return body;
			}catch(e){
				throw '该分组已存在';
			}
		},
		async 删除分组(gid = ''){
			if (!gid) throw '未知的分组';
			let group = await find_by_id(index_group, gid);
			if (!group) throw '该分组不存在';
			let result = (await client.delete({ index: index_group, type: defType, id: gid, refresh: true }))._id === gid;
			result && wss.push('contacts', { action: 'delete.group', uid: group.uid, name:group.name });
			return result;
		},
		async 获取联系人列表(uid = '', group_id = '', search = '', page = 0, size = 30){
			try{
				let q = uid ? `uid: ${ uid }`: undefined;
				if (group_id) q = (q ? q + ' && ' : '') + `group_id: ${ group_id }`;
				
				if (search){
					let val = `name: *${ search }* || name_py: *${ search }* || phone: *${search}* || info: *${ search }*`;
					if (q) q += ` && (${ val })`;
					else q = val;
				}
				let result = await client.search({ index, type: defType, q, from: (page - 1) * size, size: size, sort: 'create_time:desc' });
				if (result.hits.total > 0 && result.hits.hits.length > 0)
					return { total: result.hits.total, took: result.took, list: result.hits.hits.map(h => Object.assign({ _id: h._id, _version: h._version }, h._source)) };
			}catch(e){
				console.log(e);
			}
			return { total: 0, took: 0, list: [] };
		},
		async 添加联系人(uid, contacts){
			if (!uid) throw '异常...请验证后重试...';
			if (!contacts.name) throw '联系人名称不可为空...';
			if (!contacts.phone) throw '联系人手机号不可为空...';
			let id = `${uid}_${contacts.phone}`;
			if (await find_by_id(index, id)) throw '该号码已添加...';
			try{
				contacts.uid = uid;
				contacts.create_time = new Date().getTime();
				//  将不在mapping中的属性删除
				限制对象属性(contacts, ['uid', 'group_id', 'name', 'name_py', 'phone', 'info', 'create_time']);
				await client.create({ index, type: defType, id: id,  body: contacts, refresh: true });
				wss.push('contacts', { action: 'new', uid, name: contacts.name });
				return contacts;
			}catch(e){
				throw '该分组已存在';
			}
		},
		async 修改联系人(contacts){
			if (!contacts._id) throw '异常...请验证后重试...';
			let c = await find_by_id(index, contacts._id);
			if (!c) throw '该联系人不存在';
			限制对象属性(contacts, ['uid', 'group_id', 'name', 'name_py', 'phone', 'info', 'create_time']);
			let result = (await client.update({ index, type: defType, id: c._id, body:{ doc: contacts }, refresh: true }))._version > c._version;
			result && wss.push('contacts', { action: 'update', uid: c.uid, name:c.name });
			return result;
		},
		async 删除联系人(cid){
			if (!cid) throw '未知的联系人...';
			try{
				let c = await find_by_id(index, cid);
				if (!c) throw '该联系人不存在';
				let result = (await client.delete({ index, type: defType, id: cid, refresh: true }))._id === cid;
				result && wss.push('contacts', { action: 'delete', uid: c.uid, cid });
				return result;
			}catch(e){
				throw '该联系人不存在...';
			}
		},
		async 获取全省手机号码库(search, form = 0, size = 30){
			try{
				let q = undefined;
				if (search) q = `手机号码: *${ search }* || 身份证号码: *${ search }* || 姓名: *${ search }*`;
				let result = await client_81.search({ index: '全省手机号码库', type: 'doc', q, form, size, sort: '创建时间:asc' });
				if (result.hits.total > 0 && result.hits.hits.length > 0)
					return { total: result.hits.total, took: result.took, list: result.hits.hits.map(h => Object.assign({ _id: h._id }, h._source)) };
			}catch(e){}
			return { total: 0, took: 0, list: [] };
		}
	};
};