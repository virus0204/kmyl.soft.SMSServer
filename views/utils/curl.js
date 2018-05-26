export class curl {
	
	constructor() {
		this.methods = ['POST', 'GET', 'PUT', 'HEAD', 'PATCH', 'DELETE'];
		
	}
	__ProxyHandle(name = "", parent = undefined, object = {}) {
		let self = this;
		object.__parent = parent;
		object.__name = name;
		object.__currentUrl = parent ? `${ parent.__currentUrl }${ name }/` : `/${ name }`;
		
		return new Proxy(object, {
			get(target, propKey) {
				if (!object[propKey]) {
					for (let method of self.methods) {
						if (method.toLocaleLowerCase() === propKey.toLocaleLowerCase()) {
							object[propKey] = self.__Request.bind(self, method, object.__currentUrl.substr(0, object.__currentUrl.length - 1));
							break;
						}
					}
					if (!object[propKey]) object[propKey] = self.__ProxyHandle(propKey, object);
				}
				return object[propKey];
			}
		});
	}
	
	/**
	 * 拦截 GET、POST、PUT、PATCH、DELETE、HEAD操作
	 * @param method
	 * @param url
	 * @param data  post、put、patch提交时的参数
	 * @returns {Promise.<{success: boolean, message: string, status: number, data: {}}>}
	 * @private
	 */
	async __Request(method = "GET", url = "", data = {}) {
		return new Promise(r => {
			$.ajax({ url, type: method, data, async: true, dataType: "json",
				success: function (data, textStatus) {
					r(data);
				},
				error: function (XMLHttpRequest, textStatus, errorThrown) {
					r(undefined);
				}
			});
		});
	}
	
	__getCURL(){
		return this.__ProxyHandle(undefined, undefined, { self: this });
	}
}
/**
 post /users/login
 this.loopback.users.login.POST("token", { username, password });
 this.loopback.users.logout.POST(token);
 this.loopback.users[userId].accessTokens.count.GET(token, { where: JSON.stringify({ id: token }) });
 */