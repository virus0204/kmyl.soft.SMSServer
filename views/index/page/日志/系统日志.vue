<template>
	<Row style="position: absolute;top: 0;left:0;right: 0;bottom: 0;overflow: hidden;z-index: 9999;transition: left .3s;" :gutter="10" ref="dbRow">
		<Col>
			<Card shadow="true">
				
				<Row ref="dbRowHead" style="padding-bottom: 16px;">
					<Col span="18">
						<Button type="success" icon="person-add">添加用户</Button>
					</Col>
					<Col span="6" style="text-align: right;">
						<Input placeholder="日志检索..." clearable style="width: 250px;" icon="ios-search" v-model="val_data_search" @on-change="search_data" disabled></Input>
					</Col>
				</Row>
				
				<Table :columns="columns" :data.sync="rows" :height="data_table_h" border size="small" :disabled-hover="true"></Table>
				<div class="fn-clearfix tools" style="border: none; padding-top: 16px;" ref="dTools">
					<ul>
						<li>
							<Page :total="search_result.total" :current="current_page" :page-size="15" show-total @on-change="change_data_page"></Page>
						</li>
						<li v-if="search_result.took > 0" style="padding-top: 6px;">
							<span>查询耗时: {{ search_result.took }}毫秒</span>
						</li>
					</ul>
				</div>
			</Card>
		</Col>
	</Row>
</template>

<script type="text/babel">
	
	export default {
		components: {},
		data() {
			return {
				data_table_h: 300,
				columns: [
					{ title: 'KEY', key: 'userName', width: 250 },
					{ title: '通讯录数量', key: 'user_count', width: 150 },
					{ title: '发送短信数', key: 'sms_count', width: 150 },
					{ title: '用户说明', key: 'userInfo' },
					{ title: '上次登录时间', key: 'last_login_time', width: 200 }
				],
				rows: [],
				val_data_search: "",
				current_page: 1,
				search_result: { took: 0, total: 0 }
			};
		},
		mounted(){
			let self = this;
			this.reWindowSize();
			window.onresize = this.reWindowSize;
		},
		methods: {
			reWindowSize(){
				let row = $(this.$refs.dbRow.$el).outerHeight();
				console.log($(this.$refs.dbRowHead.$el).outerHeight(), $(this.$refs.dTools).outerHeight());
				let head = $(this.$refs.dbRowHead.$el).outerHeight() + $(this.$refs.dTools).outerHeight() + 16 * 2;    //  head + tools
				this.data_table_h = row - head;
			},
			search_data(event){
				this.current_page = 1;
				//this.search_index_data();
			},
			change_data_page(page){
				/*if (page > 100){
					store.alert('抱歉...系统不允许分页超过100页...', 'w');
					page = this.current_page === 1 ? 2: 1;
				}*/
				this.current_page = page;
				//this.search_index_data();
				return page;
			},
		}
	};
</script>


<style>
	dl,ul,ol { list-style-type:none; }
	.ivu-card-head p, .ivu-card-head-inner {
		display: inline-block;
		width: 100%;
		height: 35px;
		line-height: 35px;
		font-size: 14px;
		color: #1c2438;
		font-weight: 700;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>