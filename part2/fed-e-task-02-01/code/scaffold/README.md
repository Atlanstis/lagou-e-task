# 简易前端脚手架

## 基本运行 

首先我们在 `package.json`中,添加 bin 属性，指向我们的 `cli.js`文件，该文件是这个检疫 cli 的入口文件。

```json
{
  "bin": "cli.js"
}
```

在根目录下，创建 `cli.js`。

`cli.js`文件与其它文件不同的时，在文件头部必须有特定的文件头 `\#!/usr/bin/env node`。

```js
// cli.js
#!/usr/bin/env node

// Node ClI 应用入口文件必须有这样的文件头
// 如果时 Linux 或者 macOS 系统下，还需要修改此文件的读写权限为 755
// 具体是通过 chmod 755 cli.js 实现修改

console.log('cli working')
```

通过 `yarn link`，将这个包链接到全局后，执行命令 `easy-scaffoldm`，发现控制台输出，CLI 正常运行。

> macOS 下，执行命令 `easy-scaffoldm` 前，需执行 `chmod 755 cli.js` 提升权限。

## 工作过程

脚手架的工作过程分为以下几步。

1. 通过命令行交互询问用户问题。
2. 根据用户回答的结果生成文件。

### inquirer

通过这个模块，我们可以通过命令行，发起询问。

#### 安装

```shell
$ yarn add inquirer
```

#### 使用

通过 `inquirer` 的 `prompt` 的方法，发去命令行询问。

#### 实现，修改 cli.js

```js
// cli.js
const inquirer = require('inquirer')

inquirer
  .prompt([
    {
      type: 'input', // 问题方式
      name: 'name', // 返回的键
      message: 'project name?' // 问题描述
    }
  ])
  .then((answer) => {
    console.log(answer)
  })
```

执行命令 `easy-scaffoldm`，输出输入内容。

通过以上方式，我们就可以可获取到，命令行输入的内容。

### 创建模版

接下来，在项目里，新建模板内容，供脚手架通过 CLI 快速生成。

在根目录下，新建 `templates/index.html` 作为模版。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= name %></title>
  </head>
  <body></body>
</html>
```

对于动态内容，通过 `<%= name %>` 的方式，进行占位。

### ejs

模版引擎，用于脚手架生成过程中，替换模板中的可变内容。

#### 安装

```shell
$ yarn add ejs
```

### 模板复制

在用户输入完成之后，就执行以下几步操作。

1. 遍历模板目录
2. 通过 `ejs` 重新渲染模板，并输出到目标目录

### 最终 cli.js

```js
#!/usr/bin/env node

// Node ClI 应用入口文件必须有这样的文件头
// 如果时 Linux 或者 macOS 系统下，还需要修改此文件的读写权限为 755
// 具体是通过 chmod 755 cli.js 实现修改

// 脚手架的工作过程分为以下几步
// 1. 通过命令行交互询问用户问题
// 2. 根据用户回答的结果生成文件

const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')
const ejs = require('ejs')

inquirer
  .prompt([
    {
      type: 'input', // 问题方式
      name: 'name', // 返回的键
      message: 'project name?' // 问题描述
    }
  ])
  .then((answer) => {
    // 根据用户回答的结果生成目录

    // 模板目录
    const temlDir = path.join(__dirname, 'templates')
    //目标目录，命令执行目录
    const destDir = process.cwd()

    // 将模板下的文件全部转换到目标目录
    fs.readdir(temlDir, (err, files) => {
      if (err) throw err
      files.forEach((file) => {
        // 通过模板引擎渲染文件
        ejs.renderFile(path.join(temlDir, file), answer, (err, result) => {
          if (err) throw err
          // 将结果写入目标文件路径
          fs.writeFileSync(path.join(destDir, file), result)
        })
      })
    })
  })
```

最后，通过执行命令 `easy-scaffoldm` ，就可以快速生成我们的模板。