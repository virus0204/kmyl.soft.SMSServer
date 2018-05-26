<template>
	<Row style="position: absolute;top: 0;left:0;right: 0;bottom: 0;overflow: hidden;z-index: 9999;transition: left .3s;" :gutter="10" ref="dbRow">
		<Col span="5" ref="dbCol">
			<Card>
				<p slot="title" ref="dbRowHead">
					<Icon type="briefcase"></Icon>
					数据源
				</p>
				<Input v-model="val_dbs_search" placeholder="数据源检索(支持拼音)" clearable style="width: 150px;" slot="extra" icon="ios-search" size="small"></Input>
				<Table ref="dbs" :columns="columns_dbs" :data.sync="get_dbs_Data" :height="db_table_h" border highlight-row @on-current-change="change_dbs"></Table>
			</Card>
		</Col>
		<Col span="19">
			<Card>
				<p slot="title" ref="dbRowHead">
					<Icon type="briefcase"></Icon>
					数据查看
				</p>
				<Input placeholder="优化中..暂停使用.." clearable style="width: 250px;" slot="extra" icon="ios-search" size="small" v-model="val_data_search" @on-change="search_data" disabled></Input>
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
		components: { },
		data() {
			return {
				db_table_h: 100,
				columns: [],
				rows: [],
				val_dbs_search: "",
				data_table_h: 100,
				columns_dbs: [{ type: 'index', width: 60, align: 'center' }, { title: '库名', key: 'name' }, { title: '大小', key: 'total' }, { title: '源库', key: 'indexName' }],//
				rows_dbs: [],
				val_data_search: "",
				current_index: "",
				current_page: 1,
				search_result: { took: 0, total: 0 }
			}
		},
		mounted(){
			let self = this;
			this.reWindowSize();
			window.onresize = this.reWindowSize;
			store.ws.onReady('业务库', async () => {
				store.ws.subscribe('business.db.info', (data) => {
					for (let item of data.list.filter(x => x.total > 0)){
						let rs = self.rows_dbs.find(x => x.indexName === item.indexName);
						if (!rs){
							self.rows_dbs.push(item);
							continue;
						}
						if (JSON.stringify(rs) !== JSON.stringify(item))
							Object.assign(rs, item);
					}
				});
				let rs = await store.ws.send('business.db.get.info');
				if (rs.error) return this.alert(rs.msg, e);
				self.rows_dbs.splice(0, self.rows_dbs.length);
				self.rows_dbs.push(...rs.data.list.filter(x => x.total > 0));
				self.reWindowSize();
			});
		},
		computed:{
			get_dbs_Data(){
				if (!this.val_dbs_search) return this.rows_dbs;
				let val = this.val_dbs_search.toLowerCase();
				return this.rows_dbs.filter(c => {
					return c.name.indexOf(val) >= 0 ||
						c.indexName.indexOf(val) >= 0 ||
						c.name_py.indexOf(val) >= 0 ||
						c.name_py_szm.indexOf(val) >= 0;
				});
			}
		},
		methods: {
			reWindowSize(){
				let row = $(this.$refs.dbRow.$el).outerHeight();
				let head = $(this.$refs.dbRowHead).parent().outerHeight() + 16 * 2;
				let tools = $(this.$refs.dTools).outerHeight();
				this.db_table_h = row - head;
				this.data_table_h = row - head - tools;
			},
			change_dbs(currentRow){
				if (currentRow){
					this.current_page = 1;
					this.current_index = currentRow.indexName;
					this.search_index_data();
				}
			},
			search_data(event){
				this.current_page = 1;
				this.search_index_data();
			},
			change_data_page(page){
				if (page > 100){
					store.alert('抱歉...系统不允许分页超过100页...', 'w');
					page = this.current_page === 1 ? 2: 1;
				}
				this.current_page = page;
				this.search_index_data();
				return page;
			},
			async search_index_data(){
				console.log(this.current_page);
				let result = await store.ws.send('business.db.search', { index: this.current_index, val: this.val_data_search, page: this.current_page - 1 });
				if (result.error) return this.alert(result.msg, 'e');
				result = result.data;
				this.columns.splice(0, this.columns.length);
				let cols = [];// [{ type: 'index', width: 60, align: 'center' }];
				for (let c of result.list){
					delete c['同步时间'];
					delete c['_id'];
					for (let k in c){
						if (c[k + "_源数据"])
							c[k] = c[k + "_源数据"];
						if (cols.find(c => c.key === k)) continue;
						cols.push({ title: k, key: k, width: 180 });
					}
				}
				this.columns.push(...cols.filter(p => p.key.indexOf('_源数据') === -1));
				this.rows.splice(0, this.rows.length);
				this.rows.push(...result.list);
				delete result.list;
				Object.assign(this.search_result, result);
			}
		}
	};
</script>

<style>
	.ivu-table-row { cursor: pointer; }
	.fn-clearfix:after{ display:block; visibility:hidden; content:"\0020"; clear:both; height:0; font-size:0; }
	.fn-clearfix{ display:block; }
	dl,ul,ol { list-style-type:none; }
	.tools > ul > li { list-style: none; float: left; padding: 0 8px 0 0; }
	* html .fn-clearfix{ height:1%; zoom:1; }
	* { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
	*:before, *:after { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }
</style>