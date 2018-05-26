const $html = {
	title: "曲靖市公安局短信管理平台 - v1.7",
	scripts: [
		'/static/lib/jquery-3.2.1.min.js',
		'/static/lib/pinyin.js',
		'/static/vue/dist/vue.min.js',
		'/static/iview/dist/iview.min.js'
	],
	links: [
		'/static/iview/dist/styles/iview.css'
	]
};
//'/static/lib/echarts/dist/echarts.min.js',

import App from './index.vue';
import './router';

new Vue({
	el: '#app',
	render: h => h(App)
});