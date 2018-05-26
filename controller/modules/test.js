const elasticsearch = require('elasticsearch');
let client = new elasticsearch.Client({ hosts: ['http://127.0.0.1:9200'] });



(async () => {
	//await (require('./用户管理'))(client);
	
	console.log(await client.get({ index: '.sms.user', type: '_doc', id: '181837017691' }));
})();
