<template>
	<div class="login" @keydown.enter="handleSubmit">
		<div class="login-con">
			<Card :bordered="false">
				<p slot="title">
					<Icon type="log-in"></Icon>
					欢迎登录
				</p>
				<div class="form-con">
					<Form ref="loginForm" :model="form" :rules="rules">
						<FormItem prop="userName">
							<Input v-model="form.userName" placeholder="请输入用户名">
							<span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
							</Input>
						</FormItem>
						<FormItem prop="password">
							<Input type="password" v-model="form.password" placeholder="请输入密码">
							<span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
							</Input>
						</FormItem>
						<FormItem>
							<Button @click="handleSubmit" type="primary" long :loading="loading" :disabled="disabled">登录</Button>
						</FormItem>
					</Form>
					<p class="login-tip">请输入用户名/密码</p>
				</div>
			</Card>
		</div>
	</div>
</template>

<script type="text/babel">
	import * as utils from '@utils';
	export default {
		data() {
			return {
				form: { userName: '18183701769', password: 'qjgaqbpt@2015' },
				rules: {
					userName: [{ required: true, message: '账号不能为空', trigger: 'blur' }],
					password: [{ required: true, message: '密码不能为空', trigger: 'blur' }]
				},
				loading: false,
				disabled: false
			};
		},
		created(){
			let time = "";
			try {
				time = localStorage.getItem('time');
				if (!time) return;
				if (new Date().getTime() - parseInt(time) < 1000 * 60 * 60 * 2){  //  距离上次登录超过2小时.则不在自动登录
					let pwd = localStorage.getItem('pwd');
					if (!pwd){
						localStorage.removeItem('time');
						localStorage.removeItem('pwd');
						return;
					}
					this.login(pwd);
				}
			}catch (e) {
				this.disabled = true;
				return this.$Message.error({ content: '当前浏览器不支持ES6语法，请使用google chrome 55以上版本以获得最优体验...', duration: 3, closable: true });
			}
		},
		methods: {
			login(pwd){
				let self = this;
				this.loading = true;
				$.ajax({ type: 'post', url: '/login', data: { pwd }, dataType: 'json',
					success: (data) => {
						self.loading = false;
						if (data.success){
							localStorage.setItem('pwd', pwd);
							localStorage.setItem('time', new Date().getTime());
							window.location.reload();
						}else {
							self.$Message.error({ content: '登录失败:' + data.message, duration: 3, closable: true });
						}
					},
					error: (e) => {
						self.loading = false;
						self.$Message.error({ content: '登录失败...' + e, duration: 3, closable: true });
					}
				});
			},
			handleSubmit () {
				this.$refs.loginForm.validate((valid) => {
					valid && this.login(utils.MD5(this.form.userName + utils.MD5(this.form.password || "")));
				});
			}
		}
	};
</script>


<style lang="less">
.login{
	width: 100%;
	height: 100%;
	background-image: url('/static/login_bg.jpg');
	background-size: cover;
	background-position: center;
	position: relative;
	
	&-con{
		position: absolute;
		right: 160px;
		top: 50%;
		transform: translateY(-60%);
		width: 300px;
	
		&-header{
			font-size: 16px;
			font-weight: 300;
			text-align: center;
			padding: 30px 0;
		}
		.form-con{
			padding: 10px 0 0;
		}
		.login-tip{
			font-size: 10px;
			text-align: center;
			color: #c3c3c3;
		}
	}
}
</style>