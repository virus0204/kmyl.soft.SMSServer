<template>
	<div class="home-main">
		建设中...!
		<!--<Row :gutter="10">
			<Col :md="24" :lg="16">
				<Row :gutter="5">
					<Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
						<infor-card id-name="user_created_count" :end-val="count.createUser" iconType="android-person-add" color="#2d8cf0" intro-text="今日新增用户"></infor-card>
					</Col>
					<Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
						<infor-card id-name="visit_count" :end-val="count.visit" iconType="ios-eye" color="#64d572" :iconSize="50" intro-text="今日浏览量"></infor-card>
					</Col>
					<Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
						<infor-card id-name="collection_count" :end-val="count.collection" iconType="upload" color="#ffd572" intro-text="今日数据采集量"></infor-card>
					</Col>
					<Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
						<infor-card id-name="transfer_count" :end-val="count.transfer" iconType="shuffle" color="#f25e43" intro-text="今日服务调用量"></infor-card>
					</Col>
				</Row>
			</Col>
		</Row>
		<Row :gutter="10" class="margin-top-10">
			<Col :md="24" :lg="8" :style="{marginBottom: '10px'}">
				<Card>
					<p slot="title" class="card-title">
						<Icon type="android-map"></Icon>
						上周每日来访量统计
					</p>
					<div class="data-source-row">
						<div style="width:100%;height:100%;" id="visite_volume_con"></div>
					</div>
				</Card>
			</Col>
			<Col :md="24" :lg="8" :style="{marginBottom: '10px'}">
				<Card>
					<p slot="title" class="card-title">
						<Icon type="ios-pulse-strong"></Icon>
						数据来源统计
					</p>
					<div class="data-source-row">
						<div style="width:100%;height:100%;" id="data_source_con"></div>
					</div>
				</Card>
			</Col>
			<Col :md="24" :lg="8">
				<Card>
					<p slot="title" class="card-title">
						<Icon type="android-wifi"></Icon>
						各类用户服务调用变化统计
					</p>
					<div class="data-source-row">
						<div style="width:100%;height:100%;" id="user_flow"></div>
					</div>
				</Card>
			</Col>
		</Row>
		<Row class="margin-top-10">
			<Card>
				<p slot="title" class="card-title">
					<Icon type="ios-shuffle-strong"></Icon>
					上周每日服务调用量(万)
				</p>
				<div class="line-chart-con">
					<div style="width:100%;height:100%;" id="service_request_con"></div>
				</div>
			</Card>
		</Row>-->
	</div>
</template>

<script>
	import inforCard from './components/inforCard.vue';
	
	export default {
		name: 'home',
		components: {
			inforCard
		},
		data () {
			return {
				count: {
					createUser: 496,
					visit: 3264,
					collection: 24389305,
					transfer: 39503498
				}
			};
		},
		created() {
			/*this.visiteVolume();
			this.dataSourcePie();
			this.serviceRequests();
			this.userFlow();*/
		},
		methods: {
			/*visiteVolume(){
				this.$nextTick(() => {
					let visiteVolume = echarts.init(document.getElementById('visite_volume_con'));
					let xAxisData = [];
					let data1 = [];
					let data2 = [];
					for (let i = 0; i < 20; i++) {
						xAxisData.push('类目' + i);
						data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6) * 5);
						data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6) * 5);
					}
					const option = {
						tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
						grid: { top: 0, left: '2%', right: '4%', bottom: '3%', containLabel: true },
						xAxis: { type: 'value', boundaryGap: [0, 0.01] },
						yAxis: { type: 'category', data: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'], nameTextStyle: { color: '#c3c3c3' } },
						series: [
							{
								name: '访问量', type: 'bar',
								data: [
									{value: 453682, name: 'Mon', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 879545, name: 'Tues', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 2354678, name: 'Wed', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 1598403, name: 'Thur', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 543250, name: 'Fri', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 1305923, name: 'Sat', itemStyle: {normal: {color: '#2d8cf0'}}},
									{value: 1103456, name: 'Sun', itemStyle: {normal: {color: '#2d8cf0'}}}
								]
							}
						]
					};
					visiteVolume.setOption(option);
					window.addEventListener('resize', () => visiteVolume.resize());
				});
			},
			dataSourcePie(){
				this.$nextTick(() => {
					var dataSourcePie = echarts.init(document.getElementById('data_source_con'));
					const option = {
						tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
						legend: { orient: 'vertical', left: 'right', data: ['本地数据', '省厅推送', '社会数据', '其他'] },
						series: [
							{ name: '访问来源', type: 'pie', radius: '66%', center: ['50%', '60%'],
								data: [
									{value: 2103456, name: '省厅推送', itemStyle: {normal: {color: '#9bd598'}}},
									{value: 1305923, name: '本地数据', itemStyle: {normal: {color: '#ffd58f'}}},
									{value: 543250, name: '社会数据', itemStyle: {normal: {color: '#abd5f2'}}},
									{value: 798403, name: '其他', itemStyle: {normal: {color: '#ab8df2'}}}
								],
								itemStyle: {emphasis: {shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)'}}
							}
						]
					};
					dataSourcePie.setOption(option);
					window.addEventListener('resize', () => dataSourcePie.resize());
				});
			},
			userFlow(){
				this.$nextTick(() => {
					let option = {
						tooltip: {
							formatter: '{a} <br/>{b} : {c}%'
						},
						series: [
							{
								name: '入流量',
								type: 'gauge',
								min: 0,
								max: 1000,
								detail: {formatter: '{value}Mb+', fontSize: 18, offsetCenter: [0, '50px']},
								data: [{value: 50, name: '当前入流量'}],
								center: ['25%', '50%'],
								radius: '80%',
								title: {offsetCenter: [0, '80px']},
								axisLine: {lineStyle: {width: 20}},
								splitLine: {length: 20}
							},
							{
								name: '出流量',
								type: 'gauge',
								min: 0,
								max: 1000,
								detail: {formatter: '{value}Mb+', fontSize: 18, offsetCenter: [0, '50px']},
								data: [{value: 50, name: '当前出流量'}],
								center: ['75%', '50%'],
								radius: '80%',
								title: {offsetCenter: [0, '80px']},
								axisLine: {lineStyle: {width: 20}},
								splitLine: {length: 20}
							}
						]
					};
					let userFlow = echarts.init(document.getElementById('user_flow'));
					option.series[0].data[0].value = (Math.random() * 1000).toFixed(2) - 0;
					option.series[1].data[0].value = (Math.random() * 1000).toFixed(2) - 0;
					userFlow.setOption(option);
					window.addEventListener('resize', () => userFlow.resize());
				});
			},
			serviceRequests(){
				this.$nextTick(() => {
					const option = {
						tooltip: {trigger: 'axis', axisPointer: {type: 'cross', label: {backgroundColor: '#6a7985'}}},
						grid: {top: '3%', left: '1.2%', right: '1%', bottom: '3%', containLabel: true},
						xAxis: [{type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']}],
						yAxis: [{type: 'value'}],
						series: [
							{
								name: '运营商/网络服务',
								type: 'line',
								stack: '总量',
								areaStyle: {normal: {color: '#2d8cf0'}},
								data: [120, 132, 101, 134, 90, 230, 210]
							},
							{
								name: '银行/证券',
								type: 'line',
								stack: '总量',
								areaStyle: {normal: {color: '#10A6FF'}},
								data: [257, 358, 278, 234, 290, 330, 310]
							},
							{
								name: '游戏/视频',
								type: 'line',
								stack: '总量',
								areaStyle: {normal: {color: '#0C17A6'}},
								data: [379, 268, 354, 269, 310, 478, 358]
							},
							{
								name: '餐饮/外卖',
								type: 'line',
								stack: '总量',
								areaStyle: {normal: {color: '#4608A6'}},
								data: [320, 332, 301, 334, 390, 330, 320]
							},
							{
								name: '快递/电商',
								type: 'line',
								stack: '总量',
								label: {normal: {show: true, position: 'top'}},
								areaStyle: {normal: {color: '#398DBF'}},
								data: [820, 645, 546, 745, 872, 624, 258]
							}
						]
					};
					const serviceRequestCharts = echarts.init(document.getElementById('service_request_con'));
					serviceRequestCharts.setOption(option);
					window.addEventListener('resize', function () {
						serviceRequestCharts.resize();
					});
				});
			},*/
		}
	};
</script>

<style lang="less">
	.user-infor{height: 135px;}
	.avator-img{display: block;width: 80%;max-width: 100px;height: auto;}
	.card-user-infor-name{font-size: 2em;color: #2d8cf0;}
	.card-title{color: #abafbd;}
	.made-child-con-middle{height: 100%;}
	.to-do-list-con{height: 145px;overflow: auto;}
	.to-do-item{padding: 2px;}
	.infor-card-icon-con{height: 100%;color: white;border-radius: 3px 0 0 3px;}
	.map-con{height: 305px;}
	.map-incon{height: 100%;}
	.data-source-row{height: 200px;}
	.line-chart-con{height: 250px;}
	
	.margin-top-8{margin-top: 8px;}
	.margin-top-10{margin-top: 10px;}
	.margin-top-20{margin-top: 20px;}
	.margin-left-10{margin-left: 10px;}
	.margin-bottom-10{margin-bottom: 10px;}
	.margin-bottom-100{margin-bottom: 100px;}
	.margin-right-10{margin-right: 10px;}
	.padding-left-6{padding-left: 6px;}
	.padding-left-8{padding-left: 5px;}
	.padding-left-10{padding-left: 10px;}
	.padding-left-20{padding-left: 20px;}
	.height-100{height: 100%;}
	.height-120px{height: 100px;}
	.height-200px{height: 200px;}
	.height-492px{height: 492px;}
	.height-460px{height: 460px;}
	.line-gray{height: 0;border-bottom: 2px solid #dcdcdc;}
	.notwrap{word-break:keep-all;white-space:nowrap;overflow: hidden;text-overflow: ellipsis;}
	.padding-left-5{padding-left: 10px;}
	[v-cloak]{display: none;}
</style>