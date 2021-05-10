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
