<template>
	<Tree :data="treeData" style="overflow: auto;"></Tree>
</template>

<script type="text/babel">

	export default {
        components: { },
		data() {
			return {
				currentSelected: undefined,
				treeData: []
			}
		},
		mounted(){
			store.ws.subscribe('db.change', this.getAllDataSource.bind(this));
			store.ws.onReady('dst', this.getAllDataSource.bind(this));
			this.getAllDataSource();
		},
		methods: {
			render(h, x){
				let type = undefined;
				switch(x.data.type){
					case 'r': type = { icon: 'soup-can', style: { color: 'rgb(165, 122, 122)', marginRight: '8px' } }; break; //	db
					case 's': type = { icon: 'folder', style: { color: 'rgba(3,47,98,0.5)', marginRight: '8px' } }; break; //	已接入数据源
					case 't': type = { icon: 'grid', style: { color: 'rgb(45, 140, 240)', marginRight: '8px' } }; break; //	原始数据源
					case 'u': type = { icon: 'link', style: { color: '#ccc', marginRight: '8px' }  }; break; //	url
				}
				return h('span', { attrs:{ sid:'db.span', stype: x.data.type }, class: 'db-tree', on: {
                        click: (e) => { this.dbTreeClick(x.data, e, x) }, dblclick: (e) => { this.dbTreeDBClick(x.data, e, x) }
                    }}, 
                    [
                        h('Icon', { props: { type: type.icon }, style: type.style } ),
                        h('span', x.data.title)
                    ]
                );
			},
			async getAllDataSource(result){
				if (!result) {
					result = await store.ws.send('db.list', 'data');
					if (!result || !result.data) return this.alert('获取数据库信息失败...');
					result = result.data;
				}
				this.treeData.splice(0, this.treeData.length);
				for (let key in result){
					let db = result[key];
					let root = { title: db.name, expand: true, db, render: this.render, type: 'r', 
						children: [ {title: `${db.type}://${db.host}:${db.port}/${db.database}`, render: this.render, type: 'u' }]
					};
					this.treeData.push(root);
					
					root.children.push({ title: `已接入表(${ db.table ? db.table.length : 0 })`, expand: true, render: this.render, type: 's', 
						children: [...(db.table ? db.table.map(t => { return { title: t.name, table: { table: t, db: db }, render: this.render, type: 't' }; }):[])] 
					});

					root.children.push({ title: `原始表(${ db.sourceTable.length })`, expand: true, render: this.render, type: 's',
						children: [...(db.sourceTable ? db.sourceTable.map(t => { return { title: t, sourceTable: { name: t, db: db }, render: this.render, type: 't' }; }): [])]
					});
				}
				this.$nextTick(function(){
					let sp = $("span[sid='db.span']");
					for (let s of sp){
						s = $(s);
						let t = s.attr('stype');
                        let p = s.parent();
                        if (t === 'r') {
                            s.css({'font-weight': 'bolder'});
                            p.css({'font-size': '14px'});
                        }
						s.width((p.outerWidth() - p.find('span').first().outerWidth() - 4) + "px");
					}
				});
			},
			dbTreeClick(data, event){
				if (this.currentSelected){
					this.currentSelected.removeClass('db-tree-selection');
					this.currentSelected = undefined;
				}
				this.currentSelected = $(event.target);
                while(!this.currentSelected.attr('sid')) 
                    this.currentSelected = this.currentSelected.parent();
				this.currentSelected.addClass('db-tree-selection');
				if (data.db){
					this.$emit('click', data.db, 'd');
				}else if (data.table){
					this.$emit('click', data.table, 't');
				}else if (data.sourceTable){
					this.$emit('click', data.sourceTable, 's');
				}
            },
            dbTreeDBClick(data, event, oData){
                if (data.db){
	                this.$emit('dbClick', data.db, 'd');
                }else if (data.table){
	                this.$emit('dbClick', data.table, 't');
                }else if (data.sourceTable){
	                this.$emit('dbClick', data.sourceTable, 's');
                }
            }
		}
	};
</script>

<style>
	.ivu-tree ul li{
		margin: 0;
	}

	.db-tree{
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		display: inline-block;
		cursor: pointer;
	}

	.db-tree:active{
		background-color:#90bbe8;
		font-weight: bold;
	}
	.db-tree:hover{
		background-color:#d5e8fc;
	}
	.db-tree-selection{
		background-color:#d5e8fc;
		font-weight: bold;
	}
</style>