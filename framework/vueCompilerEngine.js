const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const browserify = require('browserify');
const vueify = require('vueify');
const esprima = require('./esprima');
const estraverse = require('estraverse');
const esquery = require('esquery');
const escodegen = require('escodegen');
const crypto = require('crypto');
const Engine = require('velocity').Engine;

const memoryFileSymbol = Symbol('memoryFile');

class vueCompilerEngine {
	
	constructor(builds = []) {
		process.env.NODE_ENV = 'production';
		this.basePath = path.join(__dirname, '../views');
		this.buildQueue = [];
		this.building = false;
		this.config = {
			template: path.join(__dirname, './template/index.html'),
			path: this.basePath,
			hotsuffix: /\.(?:js|vue|css|tpl)$/i,
			suffix: /\.(?:js|vue)$/i,
			alias: {
				'@client': '../framework/WebSocket/client.js',
				'@utils': './utils/index.js'
			},
			minify: false
		};
		for (let alias in this.config.alias)
			this.config.alias[alias] = path.join(this.basePath, this.config.alias[alias]).replace(/\\/g, '/');
		
		this.babelConfig = {
			presets: ['latest', 'stage-0', 'stage-1', 'stage-2', 'stage-3'],
			plugins: [
				['transform-async-to-generator'], ['transform-regenerator'], ['syntax-async-functions'],
				['transform-runtime', { 'helpers': false, 'polyfill': false, 'regenerator': true, 'moduleName': 'babel-runtime' }]
			]
		};
		vueify.compiler.applyConfig({ babel:this.babelConfig });
		this.__StartWatcher();
		setInterval(this.__BuildQueueInterval.bind(this), 500);
		for (let f of builds) this.__Build(f);
	}
	
	/**
	 * 内存文件缓存
	 * @returns {*}
	 */
	get memoryFile() {
		if (!this[memoryFileSymbol])
			this[memoryFileSymbol] = {};
		return this[memoryFileSymbol];
	}
	
	/**
	 * 开启目录监控
	 * @private
	 */
	__StartWatcher() {
		try {
			let self = this;
			this.watcher = chokidar.watch(this.config.path);
			this.watcher.on('all', function (event, pathx) {
				if (event === 'unlink' && fs.existsSync(pathx))
					self.watcher.add(pathx);
			});
			this.watcher.on('change', function (filePath) {
				try {
					if (!this.config.hotsuffix.test(filePath)) return;
					this.buildQueue.push(filePath);
				} catch (e) {}
			}.bind(this)).on('error', function (e) {
				try { self.watcher.close(); } catch (e) {}
				self.__StartWatcher();
			});
		} catch (e) {}
	}
	
	async __BuildQueueInterval() {
		if (this.buildQueue.length < 1 || this.building) return;
		this.building = true;
		await this.__Build(this.buildQueue.splice(0, 1)[0]);
		this.building = false;
	}
	
	/**
	 * 编译
	 */
	async __Build(buildPath) {
		let self = this;
		if (!fs.existsSync(buildPath)) buildPath = path.join(this.basePath, buildPath);
		buildPath = buildPath.replace(/\\/g, '/');
		console.log(`开始编译文件[${ buildPath }]`);
		let lable = `文件[${buildPath}]编译完成...耗时`;
		console.time(lable);
		
		return new Promise(r => {
			try {
				browserify(buildPath, {basedir: path.dirname(buildPath)}).
				transform(require('shortify')(self.config.alias)).
				transform(require('browserify-css'), { inlineImages: true, minify: true, global: true }).
				transform(vueify).
				transform(require('babelify'), Object.assign({ minified: true }, self.babelConfig)).
				bundle(function (err, buf) {
					if (err){
						console.error(`编译文件[${buildPath}]失败...错误信息:${err}`);
						return r(undefined);
					}
					let Ast = esprima.parse(buf.toString()).body[0].expression.arguments;
					if (self.__GenerateCode(eval('(' + escodegen.generate(Ast[0]) + ')'), Ast[2].elements[0].value, buildPath, true)){
						console.timeEnd(lable);
						return r(self.memoryFile[buildPath].hash);
					}
				});
			} catch (e) {
				console.error(`编译文件[${ buildPath }]失败...错误信息:${ e }`);
				r(undefined);
			}
		});
	}
	
	/**
	 * 生成代码
	 * @param modules   模块列表
	 * @param index     序号
	 * @param moduleName    函数名称
	 * @param isMain
	 * @returns {*}
	 * @private
	 */
	__GenerateCode(modules, index, moduleName = '', isMain = false) {
		try {
			let self = this;
			let memoryFile = this.memoryFile;
			moduleName = moduleName.replace(/\\/g, '/');
			if (memoryFile[moduleName] && !isMain) return true;
			
			let module = modules[index];
			let funCode = module[0].toString();
			let rely = module[1];
			let req = memoryFile[moduleName] = { hash: crypto.createHash('md5').update(moduleName).digest('hex'), name: moduleName, code: '', relys: [] };
			let funcAst = esprima.parse('var ___code = ' + funCode).body['0'].declarations['0'].init;
			//  修改了browserify入口方法...
			funcAst.params.push({ type: 'Identifier', name: 'store' });
			estraverse.traverse(funcAst, { enter(node) {
				if (node.type !== 'CallExpression' || node.callee.name !== 'require') return;
				let mn = node.arguments[0].value;
				let mName = mn;
				if (mName.startsWith('.'))
					mName = path.join(path.dirname(moduleName), mName).replace(/\\/g, '/');
				req.relys.push(mName);
				self.__GenerateCode(modules, rely[mn], mName);
				node.arguments[0].value = node.arguments[0].raw = self.memoryFile[mName].hash;
			}});
			req.code = escodegen.generate(funcAst, self.config.minify ? { format:{ compact: true } }: {});
			return true;
		} catch (e) {
			console.log(e);
		}
		return false;
	}
	
	handlerRelys(file, modules = {}){
		for (let r of file.relys){
			let mFile = this.memoryFile[r];
			this.handlerRelys(mFile, modules);
			modules[mFile.hash] = mFile.code;
		}
		return modules;
	}
	
	async router(cPath, params){
		if (!path.extname(cPath)) cPath += '.js';
		cPath = path.join(this.basePath, cPath).replace(/\\/g, '/');

		let file = this.memoryFile[cPath];
		if (!file) {
			if (!await this.__Build(cPath)) return 'not find page';
			file = this.memoryFile[cPath];
		}
		let modules = this.handlerRelys(file);
		modules[file.hash] = file.code;
		let $html = {};
		try{
			eval('$html=' + escodegen.generate(esquery(esprima.parse('var $code=' + file.code), '[id.name="$html"]')[0].init, { format:{ compact: true } }));
		}catch(e){}
		let moduleCode = '{';
		for (let key in modules) moduleCode += `'${key}': ${modules[key]},`;
		moduleCode = moduleCode.substring(0, moduleCode.length - 1) + "}";
		return new Engine({ template: this.config.template }).render({ modules: moduleCode, mainID: file.hash, html: $html, params: params ? JSON.stringify(params) : "{}" });
	}
}

exports = module.exports = vueCompilerEngine;