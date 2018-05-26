<template>
	<Row style="position: absolute;top: 0;left:0;right: 0;bottom: 0;overflow: hidden;z-index: 9999;transition: left .3s;" :gutter="10" ref="dbRow">
		<Col>
			<Card shadow="true">
				<Row ref="dbRowHead" style="padding-bottom: 16px;">
					<Col span="18">
						<Button type="success" icon="person-add" @click="add_modal_show" v-if="isRoot">添加用户</Button>
						<Button type="info" icon="key" @click="update_pwd_modal = true" v-if="cur_user && isRoot">修改密码</Button>
						<Button icon="power" @click="change_user_state('stop')" v-if="cur_user && (cur_user.state === '正常' || cur_user.state === '已超限') && !cur_user.root">停用账号</Button>
						<Button type="success" icon="play" @click="change_user_state('start')" v-if="cur_user && (cur_user.state === '已停用') && !cur_user.root">启用账号</Button>
						<Button type="error" icon="android-delete" @click="delete_user" v-if="cur_user && !cur_user.root">删除用户</Button>
					</Col>
					<Col span="6" style="text-align: right;">
						<Input placeholder="检索用户..." clearable style="width: 250px;" icon="ios-search" v-model="val_data_search" @on-change="search_data"></Input>
					</Col>
				</Row>
				<Table :columns="columns" :data.sync="cur_rows" :height="data_table_h" border highlight-row ref="user_table" @on-current-change="change_user"></Table>
				<Modal v-model="add_modal" width="450">
					<p slot="header" style="padding-left: 8px;"><Icon type="person-add"></Icon><span>添加用户</span><span style="padding-left: 8px; color: rgb(148, 41, 41);">(初始密码为:123456)</span></p>
					<Form ref='add_modal_user_info' :model="add_modal_user_info" :label-width="100" v-if="add_modal">
						<FormItem label="用户名"  prop="user_name" :rules="{ required: true, message: '请输入用户名', trigger: 'blur' }">
							<Input v-model="add_modal_user_info.user_name" placeholder="请输入用户名...">
								<Tooltip slot="append" content="自动生成" placement="top">
									<Button  icon="ios-play" @click="generate_user_name"></Button>
								</Tooltip>
							</Input>
						</FormItem>
						<FormItem label="单日发送次数">
							<InputNumber :max="99999" :min="0" :step="10" v-model="add_modal_user_info.single_day_limit"></InputNumber><b style="padding-left: 8px;">该用户每天最大发送短信数，0为无限制</b>
						</FormItem>
						<FormItem label="是否启用">
							<i-switch v-model="add_modal_user_info.state" size="large">
								<span slot="open">启用</span>
								<span slot="close">禁用</span>
							</i-switch>
							<b style="padding-left: 24px;">禁用后该用户无法登陆</b>
						</FormItem>
						<FormItem label="用户信息" prop="info" :rules="{ required: true, message: '请填写用户信息已表明该用户的身份', trigger: 'blur' }">
							<Input v-model="add_modal_user_info.info" type="textarea" :autosize="{minRows: 3, maxRows: 10}" placeholder="请输入用户信息..."></Input>
						</FormItem>
					</Form>
					<div slot="footer">
						<Button type="primary" @click="add_user">添加</Button>
						<Button type="ghost" style="margin-left: 8px" @click="add_modal = false">取消</Button>
					</div>
				</Modal>
				<Modal v-model="update_pwd_modal" width="350" class-name="vertical-center-modal">
					<p slot="header" style="padding-left: 8px;"><Icon type="person-add"></Icon><span>修改用户密码</span></p>
					<Form ref='update_pwd_modal' v-if="update_pwd_modal" :model="cur_user" :label-width="70" @submit.native.prevent>
						<FormItem label="新密码" prop="newPasswd" :rules="{ required: true, message: '请输入用户密码', trigger: 'blur' }">
							<Input v-model="cur_user.newPasswd" placeholder="请输入新密码..." autofocus="true" @on-enter="update_pwd"></Input>
						</FormItem>
						<FormItem style="padding-top: 12px;">
							<b>注：若该用户处于登录时，修改密码后该用户将被强制登出</b>
						</FormItem>
					</Form>
					<div slot="footer">
						<Button type="primary" @click="update_pwd">修改</Button>
						<Button type="ghost" style="margin-left: 8px" @click="update_pwd_modal = false">取消</Button>
					</div>
				</Modal>
			</Card>
		</Col>
	</Row>
</template>

<script type="text/babel">
	const default_user = { user_name: '', password: '123456', single_day_limit: 200, state: true, info: ''};
	
	export default {
		components: {},
		data() {
			return {
				isRoot: store.user.root,
				data_table_h: 300,
				columns: [
					{ title: '用户名', key: 'user_name', width: 260 },
					{ title: 'KEY', key: 'pwd', width: 260 },
					{ title: '发送限制(单日)', key: 'single_day_limit', width: 150 },
					{ title: '共发短信量(条)', key: 'sms_count', width: 150 },
					{ title: '用户信息', key: 'info' },
					{ title: '用户状态', key: 'state', width: 100 },
					{ title: '上次登录时间', key: 'last_login_time', width: 120 },
					{ title: '创建时间', key: 'create_time', width: 200 }
				],
				rows: [],
				cur_rows: [],
				val_data_search: "",
				current_page: 1,
				search_result: { took: 0, total: 0 },
				cur_user: undefined,
				add_modal: false,
				add_modal_user_info: JSON.parse(JSON.stringify(default_user)),
				update_pwd_modal: false
			};
		},
		mounted() {
			let self = this;
			this.reWindowSize();
			window.onresize = this.reWindowSize;
			store.ws.onReady('user.manage', function () {
				self.search_user_list();
				//  订阅用户创建、密码修改、状态修改、用户删除推送，，有推送消息时重新查询用户列表
				store.ws.subscribe(['user.create', 'pwd.change', 'state.change', 'delete.users'], self.search_user_list.bind(self));
			});
		},
		methods: {
			generate_user_name(){
				this.add_modal_user_info.user_name = store.utils.UUID();
			},
			reWindowSize() {
				let row = $(this.$refs.dbRow.$el).outerHeight();
				let head = $(this.$refs.dbRowHead.$el).outerHeight() + 16 * 2;    //  head + pd
				this.data_table_h = row - head;
			},
			async search_user_list() {
				let result = await store.request('get.users');
				if (!result) return;
				this.rows.splice(0, this.rows.length);
				for (let item of result) {
					item.user_name = item.user_name + (item.root ? '(超级管理员)': '');
					item.last_login_time = store.utils.time_to_sub_str(item.last_login_time);
					item.create_time = store.utils.date_format(new Date(item.create_time));
					item.single_day_limit = item.single_day_limit === 0 ? "无限制" : item.single_day_limit;
					item.sms_count = item.sms_count || 0;
					this.rows.push(item);
				}
				this.cur_rows = this.rows;
				this.cur_user = undefined;
				this.val_data_search = "";
			},
			change_user(currentRow){
				this.cur_user = currentRow;
			},
			search_data(){
				if (!this.val_data_search) {
					this.cur_rows = this.rows;
					return;
				}
				let val = this.val_data_search.toLowerCase();
				this.cur_rows = this.rows.filter(c => c.user_name.indexOf(val) >= 0 || c.pwd.indexOf(val) >= 0 || c.info.indexOf(val) >= 0 || c.state.indexOf(val) >= 0);
			},
			add_modal_show(){
				this.add_modal_user_info = JSON.parse(JSON.stringify(default_user));
				this.add_modal = true;
			},
			add_user(){
				this.$refs.add_modal_user_info.validate(async (valid) => {
					if (!valid) return;
					let user = JSON.parse(JSON.stringify(this.add_modal_user_info));
					user.state = user.state ? '正常': '已停用';
					await store.request('new.users', user);
					this.add_modal = false;
				});
			},
			update_pwd(){
				if (!this.cur_user) return;
				this.$refs.update_pwd_modal.validate(async (valid) => {
					if (!valid) return;
					await store.request('update.user.pwd', { pwd: this.cur_user.pwd, newPasswd: this.cur_user.newPasswd });
					this.update_pwd_modal = false;
					store.alert('密码修改成功...!', 's');
				});
			},
			async change_user_state(state){
				if (!this.cur_user) return;
				let self = this;
				if (state === 'stop'){
					this.$Modal.confirm({ title: '确认', content: '<p>是否确认停用该账户?</p><br/><p style="color: red"><b>停用该用户后，该用户将无法登录并且无法使用任何接口</b></p><br/><p style="color: red"><b>若该用户正在登录，停用后将强制登出</b></p>',
						onOk: () => store.request('set.user.state', { pwd: self.cur_user.pwd, state: '已停用' }), onCancel: () => {}
					});
				}else {
					await store.request('set.user.state', { pwd: self.cur_user.pwd, state: '正常' });
				}
			},
			delete_user(){
				if (!this.cur_user) return;
				let self = this;
				this.$Modal.confirm({ title: '确认', content: '<p>是否确认删除该账户?</p><br/><p style="color: red"><b>若该用户正在登录，删除后将强制登出</b></p><br/><p style="color: red"><b>删除后该用户对应的群组、联系人、日志等都将删除。</b></p>',
					onOk: () => store.request('delete.user', self.cur_user.pwd), onCancel: () => {}
				});
			}
		}
	};
</script>

<style>
	dl, ul, ol {list-style-type: none;}
	.ivu-card-head p, .ivu-card-head-inner {display: inline-block;width: 100%;height: 35px;line-height: 35px;font-size: 14px;color: #1c2438;font-weight: 700;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;}
	.vertical-center-modal {display: flex;align-items: center;justify-content: center;}
	.vertical-center-modal .ivu-modal {top: 0;}
	.vertical-center-modal .ivu-form-item {margin-bottom: 0;vertical-align: top;zoom: 1;}

</style>