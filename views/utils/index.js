

function pluralize(time, label) {
    return time + label;
}
export function clone(origin) {
    let originProto = Object.getPrototypeOf(origin);
    return Object.assign(Object.create(originProto), origin);
}
export const strlen = str => {
    let charCode = -1;
	let len = str.length;
    let realLength = 0;
    for (let i = 0; i < len; i++) {
        charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128) realLength += 1;
        else realLength += 2;
    }
    return realLength;
};

export function date_format(dt, fmt = 'yyyy年MM月dd日 hh:mm:ss') {
	let o = {
		"M+" : dt.getMonth()+1,                 //月份
		"d+" : dt.getDate(),                    //日
		"h+" : dt.getHours(),                   //小时
		"m+" : dt.getMinutes(),                 //分
		"s+" : dt.getSeconds(),                 //秒
		"q+" : Math.floor((dt.getMonth() + 3) / 3), //季度
		"S"  : dt.getMilliseconds()             //毫秒
	};
	if(/(y+)/.test(fmt)) {
		fmt=fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for(let k in o) {
		if(new RegExp("("+ k +")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
	}
	return fmt;
}

export function time_to_sub_str(atime) {
	if (atime === 0) return '从未';
	let byTime = [365 * 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 60 * 60 * 1000, 60 * 1000, 1000];
	let unit = ['年', '天', '小时', '分钟', '秒钟'];
	let ct = new Date().getTime() - atime;
	if (ct < 0) return '表闹...!';
	let sb = [];
	for (let i = 0; i < byTime.length; i++) {
		if (ct < byTime[i]) continue;
		let temp = Math.floor(ct / byTime[i]);
		ct = ct % byTime[i];
		if (temp > 0) sb.push(temp + unit[i]);
		if (sb.length >= 1) break;
	}
	sb = sb.join('');
	return sb ? sb + '前' : '刚刚';
}


function padLeftZero (str) {
	return ('00' + str).substr(str.length);
}

import md5 from './md5.js';
export const MD5 = (str) => md5.hex_md5(str);

export const UUID = () => {
	function S4() {return (((1+Math.random())*0x10000)|0).toString(16).substring(1);}
	return MD5(S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
};


import * as validate1 from './validate.js';
export const validate = validate1;