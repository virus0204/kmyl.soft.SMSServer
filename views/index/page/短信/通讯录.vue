<template>
	<Row style="position: absolute;top: 0;left:0;right: 0;bottom: 0;overflow: hidden;z-index: 9999;transition: left .3s;" :gutter="10" ref="_row">
		<Col span="5">
			<Card>
				<p slot="title" ref="group_head" style="display: inline-block;width: 100%;height: 20px;line-height: 20px;font-size: 14px;color: #1c2438;font-weight: 700;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">
					<Icon type="person-stalker" style="padding-right: 6px;"></Icon>群组
				</p>
				<ButtonGroup slot="extra">
					<Tooltip content="添加至我的群组" placement="bottom">
						<Button type="primary" shape="circle" icon="plus-round" @click="show_new_group_modal" size="small"></Button>
					</Tooltip>
					<Tooltip content="删除当前选择群组" placement="bottom">
						<Button type="error" shape="circle" icon="trash-a" @click="delete_group" size="small" v-if="当前选择群组 && 当前选择群组.group_id"></Button>
					</Tooltip>
				</ButtonGroup>
				<Tree :data.sync="分组列表树" ref="group_tree" style="margin-top: -16px;border-left: 1px solid #dddee1;border-right: 1px solid #dddee1;border-bottom: 1px solid #dddee1;border-radius: 0 0 3px 3px;padding: 10px;overflow: auto;" @on-select-change="change_group"></Tree>
			</Card>
		</Col>
		<Col  span="19">
			<Card>
				<!-- 头部 -->
				<p slot="title" ref="contacts_head" style="display: inline-block;width: 100%;height: 20px;line-height: 20px;font-size: 14px;color: #1c2438;font-weight: 700;overflow: hidden;text-overflow: ellipsis; white-space: nowrap;">
					<Icon type="person" style="padding-right: 6px;"></Icon>
					联系人
				</p>
				<!-- 顶部工具 -->
				<Row ref="top_tools" style="padding-bottom: 16px;">
					<Col span="18">
						<Button type="success" icon="person-add" @click="show_contacts_modal('new')">添加联系人</Button>
						<Button type="info" icon="edit" @click="show_contacts_modal('update')" v-if="当前联系人">修改联系人</Button>
						<Button type="error" icon="trash-a" @click="delete_contacts" v-if="当前联系人 || 当前勾选的联系人.length > 0">删除联系人</Button>
						<Dropdown transfer="true" trigger="click" v-if="当前联系人 || 当前勾选的联系人.length > 0">
							<Button type="primary" icon="navicon">设置群组</Button>
							<DropdownMenu slot="list">
								<DropdownItem>我的联系人</DropdownItem>
								<DropdownItem v-for="item in 分组列表">{{ item.name }}</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</Col>
					<Col span="6" style="text-align: right;">
						<Input placeholder="联系人检索..." clearable style="width: 250px;" icon="ios-search" v-model="联系人搜索内容" @on-change="search_contacts"></Input>
					</Col>
				</Row>
				<!-- 联系人列表 -->
				<Table :columns="columns" :data.sync="联系人列表" :height="表格高度" border highlight-row ref="contacts_table" @on-current-change="change_one_contacts" @on-selection-change="select_contacts"></Table>
				<!-- 底部工具 分页 -->
				<div class="fn-clearfix tools" style="border: none; padding-top: 16px;" ref="bottom_tools">
					<ul>
						<li>
							<Page :total="查询结果.total" :current="当前页" :page-size="当前每页数" show-total show-sizer :page-size-opts="[30, 50, 100, 200, 1000]" @on-page-size-change="change_contacts_page_size" @on-change="change_contacts_page"></Page>
						</li>
						<li v-if="查询结果.took > 0" style="padding-top: 6px;">
							<span>查询耗时: {{ 查询结果.took }}毫秒</span>
						</li>
					</ul>
				</div>
				<!-- 联系人添加Modal -->
				<Modal v-model="是否显示联系人对话框" width="450">
					<p slot="header" style="padding-left: 8px;">
						<Icon :type="联系人对话框类型 ? 'person-add' : 'edit'"></Icon>
						<span>{{ 联系人对话框类型 ? '添加' : '修改' }}联系人</span>
						<span style="padding-left: 8px; color: rgb(148, 41, 41);" v-if="!联系人对话框类型 && 当前联系人">({{ 当前联系人.name }})</span>
					</p>
					<Form ref='contacts_form' :model="对话框联系人属性" :label-width="100" v-if="是否显示联系人对话框">
						<FormItem label="联系人" prop="name" :rules="{ required: true, message: '请输入联系人名称', trigger: 'blur' }">
							<Input v-model="对话框联系人属性.name" placeholder="请输入联系人..."></Input>
						</FormItem>
						<FormItem label="手机号"  prop="phone" :rules="{ required: true, message: '请正确输入11位手机号码', trigger: 'blur', pattern: /^1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/ig }">
							<Input v-model="对话框联系人属性.phone" placeholder="请输入手机号..." :disabled="!联系人对话框类型"></Input>
							<b v-if="联系人对话框类型">手机号添加后不可修改</b>
						</FormItem>
						<FormItem label="群组">
							<Select v-model="对话框联系人属性.group_id" style="width:200px">
								<Option value="我的联系人">我的联系人</Option>
								<Option v-for="item in 分组列表" :value="item._id" :key="item._id">{{ item.name }}</Option>
							</Select>
						</FormItem>
						<FormItem label="联系人说明">
							<Input v-model="对话框联系人属性.info" type="textarea" :autosize="{minRows: 3, maxRows: 10}" placeholder="请输入联系人说明..."></Input>
						</FormItem>
					</Form>
					<div slot="footer">
						<Button type="primary" @click="save_contacts">{{ 联系人对话框类型 ? '添加' : '修改' }}</Button>
						<Button type="ghost" style="margin-left: 8px" @click="是否显示联系人对话框 = false">取消</Button>
					</div>
				</Modal>
				<!-- 群组添加Modal -->
				<Modal v-model="是否显示群组对话框" width="300" class-name="vertical-center-modal">
					<p slot="header" style="padding-left: 8px;"><Icon type="person-add"></Icon><span>添加联系人群组</span></p>
					<Form ref='new_group_form' v-if="是否显示群组对话框" :model="群组表单对象" :label-width="70" @submit.native.prevent>
						<FormItem label="群组名"  prop="name" :rules="{ required: true, message: '请输入群组名', trigger: 'blur' }">
							<Input v-model="群组表单对象.name" placeholder="请输入群组名..." autofocus="true" @on-enter="new_group"></Input>
						</FormItem>
					</Form>
					<div slot="footer">
						<Button type="primary" @click="new_group">添加</Button>
						<Button type="ghost" style="margin-left: 8px" @click="是否显示群组对话框 = false">取消</Button>
					</div>
				</Modal>
			</Card>
		</Col>
	</Row>
	
</template>

<script type="text/babel">
	
	let 默认联系人属性 = {
		"group_id": '我的联系人',
		"name": '',
		"name_py": '',
		"phone": '',
		"info": ''
	};
	
	export default {
		components: {},
		data() {
			return {
				是否为管理员: store.user.root,
				表格高度: 300,
				当前页: 1,
				当前每页数: 30,
				columns: [
					{ type: 'selection', width: 60, align: 'center' },
					{ title: '所属用户', key: 'uid', width: 250 },
					{ title: '所属群组', key: 'group', width: 150 },
					{ title: '联系人名称', key: 'name', width: 150 },
					{ title: '联系人电话', key: 'phone', width: 150 },
					{ title: '联系人说明', key: 'info' },
					{ title: '创建时间', key: 'cTime', width: 200 }
				],
				联系人列表: [],
				分组列表: [],
				分组列表树: [],
				联系人搜索内容: "",
				查询结果: { took: 0, total: 0 },
				当前联系人: undefined,
				是否显示联系人对话框: false,
				联系人对话框类型: true,
				对话框联系人属性: JSON.parse(JSON.stringify(默认联系人属性)),
				是否显示群组对话框: false,
				群组表单对象:{ name: '' },
				当前选择群组: undefined,
				当前勾选的联系人: []
			};
		},
		mounted(){
			let self = this;
			this.reWindowSize();
			window.onresize = this.reWindowSize;
			//  注册ws初始化事件
			store.ws.onReady('通讯录.ws.初始化', async () => {
				self.获取群组列表();
				self.获取联系人列表();
				//  订阅通讯录推送消息
				store.ws.subscribe('contacts', (msg) => {
					if (!self.是否为管理员 && store.user._id !== msg.uid) return;
					//  消息为群组消息并且用户为当前用户或root时，更新群组列表
					if (msg.action.indexOf('.group') >= 0){
						self.获取群组列表();
						if (msg.action !== 'delete.group') return;
					}
					self.当前页 = 1;
					self.当前每页数 = 30;
					self.获取联系人列表();
				});
			});
		},
		methods: {
			reWindowSize(){
				let div_height = $(this.$refs._row.$el).outerHeight();
				$(this.$refs.group_tree.$el).height(div_height - ($(this.$refs.group_head).outerHeight() + 16 * 4));
				this.表格高度 = div_height - ($(this.$refs.contacts_head).outerHeight() + $(this.$refs.top_tools.$el).outerHeight() + $(this.$refs.bottom_tools).outerHeight() + 16 * 4);
			},
			async 获取群组列表(){
				this.当前选择群组 = undefined;
				this.分组列表.splice(0, this.分组列表.length);
				this.分组列表树.splice(0, this.分组列表树.length);
				let result = await store.request('get.group.list');
				if (result.length < 1) return;
				this.分组列表.push(...result);
				let root = [];
				if (this.是否为管理员){
					root.push({ title: 'ALL', expand: true, group_id: '', uid: '' }, { title: store.user.user_name + `(当前用户)`, expand: true, group_id: '',uid: store.user._id, children: [] });
					for(let item of result){
						let user = root.find(x => x.uid === item.uid);
						if (!user){
							user = { title: item.uid, expand: true, group_id: '',uid: item.uid, children: [] };
							root.push(user);
						}
						user.children.push({ title: item.name, expand: true, group_id: item._id, uid: item.uid });
					}
				}else {
					root.push({ title: '我的联系人', expand: true, group_id: '', uid: store.user._id });
					root.push(...result.map(item => { return { title: item.name, expand: true, group_id: item._id, uid: store.user._id }; }));
				}
				this.分组列表树.push(...root);
			},
			show_new_group_modal(){
				this.群组表单对象.name = '';
				this.是否显示群组对话框 = true;
			},
			async new_group(){
				this.$refs.new_group_form.validate(async (valid) => {
					if (!valid) return;
					await store.request('add.group', this.群组表单对象.name);
					this.是否显示群组对话框 = false;
				});
			},
			async delete_group(){
				let self = this;
				this.$Modal.confirm({ title: '确认', content: '<p><b>是否确认删除该群组?</b></p><br/><p style="color: red"><b>删除该群组后，群组中的所有联系人都将删除，是否删除?</b></p>',
					onOk: () => store.request('delete.group', self.当前选择群组.group_id), onCancel: () => {}});
			},
			change_group(row){
				this.当前选择群组 = row[0];
				this.获取联系人列表();
			},
			async 获取联系人列表(){
				console.log(new Error('e'))
				this.当前联系人 = undefined;
				this.当前勾选的联系人 = [];
				this.联系人列表.splice(0, this.联系人列表.length);
				let uid = this.当前选择群组 ?  this.当前选择群组.uid || '' : (this.是否为管理员 ? '' : store.user._id);
				let gid = this.当前选择群组 ? this.当前选择群组.group_id || '' : '';
				let result = await store.request('get.contacts.list', { uid, gid, q: this.联系人搜索内容, page: this.当前页, size: this.当前每页数 });
				//  因page组件在初始化的时候会自动调用一次该方法，，若此处不在一次清空，，则可能出现重复数据
				this.联系人列表.splice(0, this.联系人列表.length);
				if (!result || !result.list || result.list.length < 1) return;
				for (let k of result.list){
					k.group = k.group_id ? this.分组列表.find(g => g._id === k.group_id).name : '我的联系人';
					k.cTime = store.utils.date_format(new Date(k.create_time));
					this.联系人列表.push(k);
				}
				this.查询结果.took = result.took === 0 ? 1 : result.took;
				this.查询结果.total = result.total;
			},
			show_contacts_modal(type){
				this.联系人对话框类型 = type === 'new';
				this.对话框联系人属性 = type === 'new' ? JSON.parse(JSON.stringify(默认联系人属性)) : this.当前联系人;
				if (!this.对话框联系人属性.group_id) this.对话框联系人属性.group_id = "我的联系人";
				this.是否显示联系人对话框 = true;
			},
			save_contacts(){
				this.$refs.contacts_form.validate(async (valid) => {
					if (!valid) return;
					if (this.对话框联系人属性.group_id === '我的联系人') this.对话框联系人属性.group_id = '';
					this.对话框联系人属性.name_py = window.pinyinUtil.getFirstLetter(this.对话框联系人属性.name).toLocaleLowerCase();
					await store.request((this.联系人对话框类型 ? 'add' : 'update') + '.contacts', this.对话框联系人属性);
					this.是否显示联系人对话框 = false;
				});
			},
			delete_contacts(){
				let self = this;
				this.$Modal.confirm({ title: '确认', content: '<p><b>是否确认删除该联系人?</b></p>', onOk: () => store.request('delete.contacts', self.当前联系人._id), onCancel: () => {}});
			},
			search_contacts(){
				this.当前页 = 1;
				this.当前每页数 = 30;
				this.获取联系人列表();
			},
			change_contacts_page_size(size){
				this.当前页 = 1;
				this.当前每页数 = size;
				this.获取联系人列表();
			},
			change_contacts_page(page){
				this.当前页 = page;
				this.获取联系人列表();
			},
			change_one_contacts(row){
				this.当前联系人 = row;
			},
			select_contacts(selection){
				this.$refs.contacts_table.clearCurrentRow();
				this.当前联系人 = undefined;
				this.当前勾选的联系人 = selection;
			},
		}
	};
</script>


<style>
	.fn-clearfix:after{ display:block; visibility:hidden; content:"\0020"; clear:both; height:0; font-size:0; }
	.fn-clearfix{ display:block; }
	dl,ul,ol { list-style-type:none; }
	.tools > ul > li { list-style: none; float: left; padding: 0 8px 0 0; }
	.vertical-center-modal {display: flex;align-items: center;justify-content: center;}
	.vertical-center-modal .ivu-modal {top: 0;}
	.vertical-center-modal .ivu-form-item {margin-bottom: 0;vertical-align: top;zoom: 1;}
</style>