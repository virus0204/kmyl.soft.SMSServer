<template>
	<Modal v-model="showOpDatabaseModal" :title="opDatabaseTitle">
        <Row type="flex">
            <Col span="6" class="modal-title">数据源别名：</Col>
            <Col span="18"><Input ref="opDBname" v-model="opDataBaseFrom.name" placeholder="请输入数据源别名..." style="width: 300px" autofocus/></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">数据源类型：</Col>
            <Col span="18">
                <Select ref="opDBtype" v-model="opDataBaseFrom.type" style="width:300px" @on-change="changeDBType">
                    <Option v-for="item in dataBaseTypes" :value="item.name" :key="item.name">{{ item.label }}</Option>
                </Select>
            </Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">数据源名：</Col>
            <Col span="18"><Input ref="opDBdatabase" v-model="opDataBaseFrom.database" placeholder="请输入数据源名称..." style="width: 300px" /></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">连接地址：</Col>
            <Col span="18"><Input ref="opDBhost" v-model="opDataBaseFrom.host" placeholder="请输入数据源HOST..." style="width: 300px" /></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">端口：</Col>
            <Col span="18"><Input ref="opDBport" v-model="opDataBaseFrom.port" placeholder="请输入数据源PORT..."  style="width: 300px" number/></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;" v-if="opDataBaseFrom.type === 'oracle'">
            <Col span="6" class="modal-title">SID：</Col>
            <Col span="18"><Input v-model="opDataBaseFrom.sid" placeholder="请输入oracle SID..." style="width: 300px" /></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">用户名：</Col>
            <Col span="18"><Input v-model="opDataBaseFrom.user" placeholder="请输入数据源用户名..." style="width: 300px" /></Col>
        </Row>
        <Row type="flex" style="margin-top: 8px;">
            <Col span="6" class="modal-title">密码：</Col>
            <Col span="18"><Input v-model="opDataBaseFrom.passwd" placeholder="请输入数据源密码..." style="width: 300px" type="password"/></Col>
        </Row>
        
        <Row slot="footer">
            <Col span="6" style="text-align: left;">
                <Button type="info" @click="testConnection" :loading="testloading">测试连接</Button>
            </Col>
            <Col span="18">
                <Button type="text" @click="cancelOpDatabase">取消</Button>
                <Button type="primary" @click="changeOpDatabase">确定</Button>
            </Col>
        </Row>
    </Modal>
</template>

<script type="text/babel">
    let dafaultDBFrom = { name: '', type: "", host: "", port: undefined, sid: "" , user: "", passwd: "", database: "" };
    
	export default {
        props: ['cid'],
		data() {
			return {
				testloading: false,
				//  数据源类型以及默认端口
				dataBaseTypes: [
					{ name: 'mysql', dafaultPort: 3306, label: 'MySQL/Mariadb' },
					{ name: 'mssql', dafaultPort: 1433, label: 'SQL Server' },
					{ name: 'oracle', dafaultPort: 1521, label: 'Oracle' },
					{ name: 'pgsql', dafaultPort: 5432, label: 'PostgreSQL' },
					{ name: 'db2', dafaultPort: 50000, label: 'DB2' },
					{ name: 'redis', dafaultPort: 6379, label: 'Redis' },
					{ name: 'mongo', dafaultPort: 27017, label: 'MongoDB' },
					{ name: 'elastic', dafaultPort: 9200, label: 'ElasticSearch' }
				],
				//  数据源modal标题
				opDatabaseTitle: "",
				//  数据源from
				opDataBaseFrom: { },
				//  是否显示dbModal
				showOpDatabaseModal: false
			}
		},
		mounted(){
            this.opDataBaseFrom = JSON.parse(JSON.stringify(dafaultDBFrom));
            let self = this;
            store['modal.' + this.cid] = {
                show(data){
                    self.showOpDataBase(data);
                }
            };
            if (!store.getModal){
                store.getModal = function(id){
                    return store['modal.' + id];
                }
            }
		},
		methods: {
			/**
			 * 显示数据源添加、修改Modal
			 * @param data 数据库对象
			 */
			showOpDataBase(data){
				this.opDataBaseFrom = data ? data : JSON.parse(JSON.stringify(dafaultDBFrom));
				this.opDatabaseTitle = (data ? `修改${ data.name }` : `添加`) + '数据源';
				this.showOpDatabaseModal = true;
			},
			/**
			 *   添加、修改数据源
			 */
			async changeOpDatabase(){
				let result = this.check();
				if (!result) return;
				result = await store.client.send('db.save', this.opDataBaseFrom);
				if (result.error) return this.alert(`保存数据源信息失败...错误消息:${ result.msg }`, 'e');
				this.showOpDatabaseModal = false;
			},
			/**
			 *   取消添加、修改数据源
			 */
			cancelOpDatabase(){
				this.showOpDatabaseModal = false;
			},
			/**
			 *  检查参数
			 */
			check(){
				let result = undefined;
				if (!this.opDataBaseFrom.name) result = { msg: '请给该数据源添加一个名称', id: 'name' };
				if (!this.opDataBaseFrom.type) result = { msg: '请选择数据源类型', id: 'type' };
				if (!this.opDataBaseFrom.host) result = { msg: '请填写数据源IP地址', id: 'host' };
				if (!this.opDataBaseFrom.port) result = { msg: '请填写数据源端口', id: 'port' };
				if (!this.opDataBaseFrom.database) result = { msg: '请填写数据源名称', id: 'database' };
				if (result){
					try{
						this.alert(result.msg, 'e');
						this.$refs[`opDB${result.id}`].focus();
					}catch (e){}
					return false;
				}
				return true;
			},
			/**
			 *  测试连接
			 */
			async testConnection(){
				let result = this.check();
				if (!result) return;
				this.testloading = true;
				result = await store.client.send('db.test', this.opDataBaseFrom);
				this.testloading = false;
				result = !result.error && result.data;
				this.alert(`连接数据源${ result ? '成功' : '失败' }`, result ? 's' : 'e');
			},
			/**
			 *  选择数据源类型
			 * @param typeName 数据源类型
			 */
			changeDBType(typeName){
				if (!this.opDataBaseFrom.port)
					this.opDataBaseFrom.port = this.dataBaseTypes.find(p => p.name === typeName).dafaultPort;
			}
		}
	};
</script>

<style>
	.modal-title{
		text-align: right;
		font-weight: bold;
		font-size: 15px;
		margin-top: 6px;
	}
</style>