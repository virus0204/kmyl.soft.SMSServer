<template>
	<div class="main main-hide-text">
		<div class="sidebar-menu-con" :style="{width: '200px', overflow: 'auto', background: 'rgb(73, 80, 96)'}">
			<div class="logo-con" style="font-size: 30px;color: white">
				短信管理平台
			</div>
			<sidebar-menu></sidebar-menu>
		</div>
		<div class="main-header-con" :style="{paddingLeft: '200px'}">
			<div class="main-header">
				<div class="header-middle-con">
					<div class="main-breadcrumb">
						<!--通知提示-->
						<template v-for="n in notices" :key="n">
							<Poptip trigger="hover" :content="n.data || n.title" placement="bottom" :key="n">
								<Tag type="dot" closable :color="{ 'i': 'blue', 's': 'green', 'e': 'red', 'w': 'yellow'  }[n.type]" @on-close="noticeClose" :name="n.id">{{ n.title }}</Tag>
							</Poptip>
						</template>
					</div>
				</div>
				<div class="header-avator-con">
					<!--<Tag type="dot" color="green">当前数据量: {{ (sData.total + '').replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g,'$&,') }}</Tag>
					<Tag type="dot" color="green">当前占用磁盘空间: {{ fromat_byte_size(sData.byteSize) }}</Tag>-->
					<div class="user-dropdown-menu-con">
						<Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
							<Dropdown transfer @on-click="dropdown_click">
								<Avatar icon="happy-outline" style="margin-left: 10px; background:#2d8cf0;"></Avatar>
								<DropdownMenu slot="list">
									<DropdownItem name="userinfo">{{ currentUser.user_name + (currentUser.root ? '(管理员)': '') }}</DropdownItem>
									<DropdownItem name="opinion" divided>意见反馈</DropdownItem>
									<DropdownItem name="loginout" divided>退出登录</DropdownItem>
								</DropdownMenu>
							</Dropdown>
							
						</Row>
					</div>
				</div>
			</div>
			<div class="tags-con">
				<tags-page-opened></tags-page-opened>
			</div>
		</div>
		<div class="single-page-con" :style="{left: '200px'}">
			<div class="single-page" v-if="currentPage.id">
				<component :is="currentPage.id" :params="currentPage.params" keep-alive></component>
			</div>
		</div>
	</div>
</template>

<script type="text/babel">
	
	import sidebarMenu from './components/sidebarMenu.vue';
	import tagsPageOpened from './components/tagsPageOpened.vue';
	let noticeIndex = 0;
	export default {
		components: { sidebarMenu, tagsPageOpened },
		data() {
			return {
				notices: [],
				currentUser: store.user,
				currentPage: store.currentPage,
				serverClose: false,
				sData: { total: 0, byteSize: 0 }
			};
		},
		methods: {
			addNotice(title, data, type = 'i'){
				if (this.notices.length >= 4) this.notices.shift();
				let dt = new Date();
				title = `[${ dt.getHours().toString().padStart(2, '0') }:${ dt.getMinutes().toString().padStart(2, '0') }:${ dt.getSeconds().toString().padStart(2, '0') }]:${ title }`;
				this.notices.push({ title, data: data || title, type, id: noticeIndex++ });
			},
			noticeClose(event, id){
				let index = this.notices.findIndex(n => n.id === id);
				if (index >= 0) this.notices.splice(index, 1);
			},
			alert(context, type = 'i'){
				let action = { 'i': 'info', 's': 'success', 'w': 'warning', 'e': 'error' };
				this.$Message[action[type]]({ content: context, duration: 3, closable: true });
			},
			async wsReady(){
				let self = this;
				this.serverClose = false;
				this.notice(`服务器连接成功!`, null, 's');
				this.$Spin.hide();
				//  订阅密码修改推送
				store.ws.subscribe('pwd.change', (id) => {
					if (id !== store.user.user_name) return;
					self.alert('当前用户密码已修改..请重新登录!');
					self.logout();
				});
				//  订阅状态修改推送
				store.ws.subscribe('state.change', (data) => {
					if (data.id !== store.user.user_name) return;
					switch (data.state) {
						case '正常':return self.notice(`当前用户短信发送限制已清零!!`, null, 's');
						case '已超限':return self.notice(`当前发送短信数已超限...限制每日0点清零!`, null, 'w');
						case '已停用':
							self.alert('当前用户已被管理员禁用...!');
							self.logout();
					}
				});
				//  订阅用户删除推送
				store.ws.subscribe('delete.users', (un) => {
					if (un !== store.user.user_name) return;
					self.alert('当前用户已被管理员删除..请重新登录!');
					self.logout();
				});
				
				if (!this.currentUser.root) return;
				//  订阅用户登录推送
				store.ws.subscribe('admin.user.login', (user) => self.notice(`用户[${ user.user_name }]登陆!`, null, 'i'));
			},
			wsClose(){
				if (this.serverClose) return;
				this.serverClose = true;
				this.notice(`服务器连接断开!`, null, 'w');
				this.$Spin.show({
					render: (h) => h('div', [
						h('Icon', { style: { 'animation': 'ani-demo-spin 1s linear infinite' }, props: { type: 'load-c', size: 60 } }),
						h('div', { style: { 'font-size': '25px'} }, '服务器连接断开,正在尝试重连...')
					])
				});
			},
			fromat_byte_size(bytes){
				if (bytes === 0) return '0 B';
				let k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'], i = Math.floor(Math.log(bytes) / Math.log(k));
				return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
			},
			dropdown_click(name){
				if (name === 'loginout')
					this.logout();
			},
			logout(){
				let self = this;
				$.ajax({ type: 'get', url: '/logout',
					success: (data) => {
						localStorage.removeItem('time');
						localStorage.removeItem('tid');
						window.location.reload();
					},
					error: (e) => {
						self.$Message.error({ content: '退出登录失败...' + e, duration: 3, closable: true });
					}
				});
			}
		},
		created(){
			let self = this;
			this.$store.sourceData = {};
			store.notice = Vue.prototype.notice = this.addNotice.bind(this);
			store.alert = Vue.prototype.alert = this.alert.bind(this);
			store.request = async (action, data) => {
				try{
				    let result = await store.ws.send(action, data);
					if (!result.error) return result.data;
					self.alert(result.msg, 'e');
				}catch(e){}
				return undefined;
			};
			store.ws.onReady('index', this.wsReady.bind(this)).onClose('index', this.wsClose.bind(this)).start();
		}
	};
</script>


<style>
	html, body {width: 100%;height: 100%;background: #f0f0f0;overflow: hidden;}
	.lock-screen-back {border-radius: 50%;z-index: -1;box-shadow: 0 0 0 0 #667aa6 inset;position: fixed;left: 50%;top: 50%;transform: translate(-50%, -50%);transition: all 3s;}
	.main {position: absolute;width: 100%;height: 100%;}
	.main .unlock-con {width: 0;height: 0;position: absolute;left: 50%;top: 50%;z-index: 11000;}
	.main .sidebar-menu-con {height: 100%;position: fixed;top: 0;left: 0;z-index: 21;transition: width .3s;}
	.main .layout-text {display: inline-block;white-space: nowrap;position: absolute;}
	.main .main-hide-text .layout-text {display: none;}
	.main-content-container {position: relative;}
	.main-header-con {box-sizing: border-box;position: fixed;display: block;padding-left: 200px;width: 100%;height: 100px;z-index: 20;box-shadow: 0 2px 1px 1px rgba(100, 100, 100, 0.1);transition: padding .3s;}
	.main-breadcrumb {padding-top: 3px;}
	.main-menu-left {background: #464c5b;height: 100%;}
	.main .tags-con {height: 40px;z-index: -1;overflow: hidden;background: #f0f0f0;}
	.main .tags-con .tags-outer-scroll-con {position: relative;box-sizing: border-box;padding-right: 120px;width: 100%;height: 100%;}
	.main .tags-con .tags-outer-scroll-con .tags-inner-scroll-body {position: absolute;padding: 2px 10px;overflow: visible;white-space: nowrap;transition: left .3s ease;}
	.main .tags-con .tags-outer-scroll-con .close-all-tag-con {position: absolute;right: 0;top: 0;box-sizing: border-box;padding-top: 8px;text-align: center;width: 110px;height: 100%;background: white;box-shadow: -3px 0 15px 3px rgba(0, 0, 0, 0.1);z-index: 10;}
	.main-header {height: 60px;background: #fff;box-shadow: 0 2px 1px 1px rgba(100, 100, 100, 0.1);position: relative;z-index: 11;}
	.main-header .navicon-con {margin: 6px;display: inline-block;}
	.main-header .header-middle-con {position: absolute;left: 0;top: 0;right: 100px;bottom: 0;padding: 10px;overflow: hidden;}
	.main-header .header-avator-con {position: absolute;right: 0;top: 0;padding: 10px; height: 100%;width: 100px;}
	.main-header .header-avator-con .switch-theme-con {display: inline-block;width: 40px;height: 100%;}
	.main-header .header-avator-con .message-con {display: inline-block;width: 30px;padding: 18px 0;text-align: center;cursor: pointer;}
	.main-header .header-avator-con .message-con i {vertical-align: middle;}
	.main-header .header-avator-con .change-skin {font-size: 14px;font-weight: 500;padding-right: 5px;}
	.main-header .header-avator-con .switch-theme {height: 100%;}
	.main-header .header-avator-con .user-dropdown-menu-con {position: absolute;right: 0;top: 0;width: 100px;height: 100%;}
	.main-header .header-avator-con .user-dropdown-menu-con .main-user-name {display: inline-block;width: 100px;word-break: keep-all;white-space: nowrap;vertical-align: middle;overflow: hidden;text-overflow: ellipsis;text-align: right;}
	.main-header .header-avator-con .user-dropdown-innercon {height: 100%;padding-right: 14px;}
	.main-header .header-avator-con .full-screen-btn-con {display: inline-block;width: 30px;padding: 18px 0;text-align: center;cursor: pointer;}
	.main-header .header-avator-con .full-screen-btn-con i {vertical-align: middle;}
	.main-header .header-avator-con .lock-screen-btn-con {display: inline-block;width: 30px;padding: 18px 0;text-align: center;cursor: pointer;}
	.main-header .header-avator-con .lock-screen-btn-con i {vertical-align: middle;}
	.main .single-page-con {position: absolute;top: 100px;right: 0;bottom: 0;overflow: auto;background-color: #F0F0F0;z-index: 1;transition: left .3s;}
	.main .single-page-con .single-page {margin: 10px;position: absolute;top: 0;left:0;right: 0;bottom: 0;overflow: hidden;z-index: 999;transition: left .3s;}
	.main-copy {text-align: center;padding: 10px 0 20px;color: #9ea7b4;}
	.taglist-moving-animation-move {transition: transform .3s;}
	.logo-con {padding: 8px;text-align: center;}
	.logo-con img {height: 44px;width: auto;}

</style>