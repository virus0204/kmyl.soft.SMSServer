const $html = {
	title: "曲靖市公安局数据管理平台 - v1.0",
	scripts: [
		'/static/lib/jquery-3.2.1.min.js',
		'/static/vue/dist/vue.min.js',
		'/static/iview/dist/iview.min.js'
	],
	links: [
		'/static/iview/dist/styles/iview.css'
	]
};

import App from './index.vue';

new Vue({
	el: '#app',
	render: h => h(App)
});