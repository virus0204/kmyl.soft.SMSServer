# 昆明衍蓝快速WEB开发框架

## 原基于egg的框架依赖太多，并且完善度不够。。为应付需要快速搭建的vue.iview平台，，故抽离出该框架。。。。

## 该框架用于美工组完成效果图后的快速原型搭建。。。建议只在原型搭建时使用

### 使用技术: babel、browserify、escodegen、express、less、vue、iview、velocity、websocket

## 文件目录：
```
kmyl.soft.WEBSFFrame
│  .gitignore					        git提交过滤清单
│  index.js					        程序入口
│  package.json				        node配置文件
│  README.md					        说明文件
│
├─controller					        controller层
│  └─database				        一级controller目录
│          index.js
│
├─framework					        框架
│  │  esprima.js				        AST分析
│  │  vueCompilerEngine.js			vue编译引擎
│  │
│  ├─template				        html模板
│  │      index.html
│  │
│  └─WebSocket				        websocket封装
│          client.js
│          index.js
│          server.js
│
├─page					            前台页面
│  ├─components				        vue公共组件
│  │      treeGrid.vue
│  │      YLMenu.vue
│  │
│  ├─index					        index初始页
│  │  │  index.js				    页面入口
│  │  │  index.vue				    页面
│  │  │  router.js				    前台单页路由配置
│  │  │
│  │  │
│  │  ├─page				        index页具体页面
│  │  │  ├─数据库管理
│  │  │  │  │  中间件管理.vue
│  │  │  │  │  接入库管理.vue
│  │  │  │  │  数据源管理.vue
│  │  │  │  │
│  │  │  │  └─components
│  │  │  │          dataSourceModal.vue
│  │  │  │          dataSourceTree.vue
│  │  │  │          sourceTable.vue
│  │  │  │
│  │  │  └─日志
│  │  │          系统日志.vue
│  │  │
│  │  └─components				    初始页组件
│  │          sidebarMenu.vue
│  │          tagsPageOpened.vue
│  │
│  └─utils					        前台工具类
│          index.js				    工具类引导脚本
│          md5.js
│          validate.js
│
└─static					            前台静态目录
    │  favicon.ico				        网站图标
    │  logo.jpg				        前台logo
    │
    └─lib					            前台lib包
            jquery-3.2.1.min.js

```
## 在前台引入js、css时可使用node_modules目录..node_modules目录和static享有相同的映射.都可以使用/static/? 进行访问

## 因使用express作为底层web框架...并实现多页和单页两种前台路由方式...若需要添加多页路由...可在根目录下的index.js文件中添加一条路由即可..