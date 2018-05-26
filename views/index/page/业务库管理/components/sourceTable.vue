<template>
	<div>
		<div>
			<span style="font-weight: bold; font-size: 12px;">Command:</span>
			<Input v-model="command" type="textarea" placeholder="请输入Sql语句..."></Input>
		</div>
		<Table border highlight-row :columns="columns" :data="rows" style="margin-top: 8px;"></Table>
	</div>
</template>

<script>
	export default {
		props: ['cid'],
		data(){
			return {
				columns: [],
				rows: [],
				database: undefined,
				tableName: "",
				command: ""
			}
		},
		mounted(){
			let self = this;
			store['sourceTable.' + this.cid] = {
				show(db, table){
					self.database = db;
					self.tableName = table;
					self.getTableList();
				}
			};
			if (!store.getTable){
				store.getTable = function(id){
					return store['sourceTable.' + id];
				}
			}
		},
		methods:{
			async getTableList(){
				this.columns.splice(0, this.columns.length);
				this.rows.splice(0, this.rows.length);
				let data = { db: this.database, table: this.tableName, command: this.command };
				let result = await store.ws.send('db.search', data);
				if (result.error) return this.alert(result.msg, 'e');
				if (result.data.length < 1) return;
				this.columns.push(...Object.keys(result.data[0]).sort().map(k => { return { title:k, key:k }; }));
				this.rows.push(...result.data);
				console.log(JSON.stringify(result.data));
			}
		}
	}

</script>