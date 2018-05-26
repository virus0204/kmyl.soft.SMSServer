let routers = {
	sys:[
		{
			icon:"android-home",
			name:"首页",
			component: require('./page/首页/首页.vue')
		},
		{
			icon:"person",
			name:"用户管理",
			component: require('./page/管理/用户管理.vue')
		},
		{
			icon:"person-stalker",
			name:"通讯录管理",
			component: require('./page/短信/通讯录.vue')
		},
		{
			icon:"paper-airplane",
			name:"短信发送",
			component: require('./page/短信/短信发送.vue')
		},
		{
			icon:"document-text",
			name:"系统日志",
			component: require('./page/日志/系统日志.vue')
		}
	],
	user: [
		{
			icon:"android-home",
			name:"首页",
			component: require('./page/首页/首页.vue')
		},
		{
			icon:"person-stalker",
			name:"通讯录",
			component: require('./page/短信/通讯录.vue')
		},
		{
			icon:"paper-airplane",
			name:"短信发送",
			component: require('./page/短信/短信发送.vue')
		},
		{
			icon:"document-text",
			name:"日志",
			component: require('./page/日志/系统日志.vue')
		}
	]
};


let router = ___params.root ? routers.sys : routers.user;

import * as utils from '@utils';
import { curl } from '../utils/curl.js';
import client from '@client';

store.utils = utils;
store.user = ___params;
store.routerList = router;
store.routerHashs = {};
store.events = new (require('events').EventEmitter)();
store.currentPage = { id:"", component:"", name:"", label: "", icon:"", children:undefined, params: {} };
store.ws = Vue.prototype.ws = new client();

for (let r of router){
	r.label = r.name;
	r.id = utils.MD5(r.name);
	store.routerHashs[r.id] = r;
	if (r.component) r.component = Vue.component(r.id, r.component);
	if (!r.children) continue;
	for (let c of r.children){
		c.label = c.name;
		c.id = utils.MD5(r.name + c.name);
		store.routerHashs[c.id] = c;
		c.component = Vue.component(c.id, c.component);
	}
}
Vue.prototype.$store = store;
store.router = Vue.prototype.$router = function (page, params = undefined) {
	store.events.emit("$.system.router", page, params);
};
store.router.on = (cb) => store.events.on("$.system.router", cb);

//store.defaultPage = router.length > 0 ? router[1].children[0] : {};
store.defaultPage = router.length > 0 ? router[2] : {};
store.curl = Vue.prototype.$curl = new curl().__getCURL();