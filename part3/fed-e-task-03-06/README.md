## 新作业

#### 解答题：

**1.说说 application/json 和 application/x-www-form-urlencoded 二者之间的区别。**

- application/json 是 JSON 格式提交的一种方式，序列化后的 JSON 字符串形式。
- application/x-www-form-urlencoded 是 form 表单提交的方式，name=value 的形式。



**2.说一说在前端这块，角色管理你是如何设计的。**

以后台管理系统为例，首先会存在一个超级管理员的账户，该账户可以对该管理系统下的账户进行菜单页面，角色权限的分配。

预设一些，具有特色功能的角色，不同的角色具有访问不同菜单页面的权限。同时也可根据需要新增不同的角色。

针对系统的用户账号，对其进行觉得的分配，一个账号可分配不同的角色，对所有角色所包含的菜单页面进行并集操作，即可得到该账户可访问的菜单页面。



**３.@vue/cli 跟 vue-cli 相比，@vue/cli 的优势在哪？**

- vue-cli 是指脚手架 2.0 版本，新发布的版本是 3.0 即 @vue/cli。
- @vue/cli 优势
  - 目录更加的精简，移除了配置文件目录 config 和 build。
  - 移除了 webpack 生产环境和开发环境的配置，改为了 vue.config.js。
  - 新增了 vue ui 可视化搭建项目界面。
  - 更强大的自定义功能，可以根据需要进行选择。



**４.详细讲一讲生产环境下前端项目的自动化部署的流程。**

1. 在服务器上创建 Jenkins 项目。
2. 将代码推送到 gitLab 服务器上。
3. 通过编写 Jenkins 脚本的方式，创建自动化构建流程，进行打包等一系列操作。



**５.你在开发过程中，遇到过哪些问题，又是怎样解决的？请讲出两点。**

- 针对一些小众的插件，例如 hightopo 等，在开发过程中，遇到问题时，很难通过 google，百度等查询到相应问题的解决方案，此时应该做的是，仔细查询插件所提供的文档，明白插件能够做什么，怎么做。面对示例，了解其实现方式。
- 多个项目中，存在重复封装组件的问题，开发属于自身项目组的组件库，进行版本的统一管理。



**６.针对新技术，你是如何过渡到项目中？**

针对对外的项目，自我感觉稳定是最重要的因素。而针对新技术的发展，其在性能方面的提升是毋庸置疑的，但在稳定性方面必然会有所欠缺。如果，盲目的将新技术，引入项目中，必然会引起一些无法预知的问题。

因此，针对一些市面上，已经较为成熟的新技术，我们可以先在对内的项目中，进行实践。并且对新技术也一定要用较为充分的理解。对团队内部的人员，也可通过分享的方式，共同促进。一步一步的将新技术，引入项目里。

