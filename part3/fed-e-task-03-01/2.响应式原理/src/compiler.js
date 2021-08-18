class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    this.compile(this.el)
  }

  // 编译模版，处理文本节点和元素节点
  compile (el) {
    const childNodes = el.childNodes
    Array.from(childNodes).forEach((node) => {
      if (this.isTextNode(node)) {
        // 处理文本节点
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }

      // 判断 node 节点，是否有子节点，如果有子节点，要递归调用 compile 方法
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  // 编译元素节点，处理指令
  compileElement (node) {
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach((attr)=> {
      // 判断是否为指令
      let attrName = attr.name
      let eventName
      if (this.isDirective(attrName)) {
        // v-text -> text
        attrName = attrName.substr(2)
        const key = attr.value
        // 处理 v-on 指令
        if (attrName.startsWith('on')) {
          eventName = attrName.substr(3)
          attrName = attrName.substr(0, 2)
        }
        this.update(node, key, attrName, eventName)
      }
    })
  }

  update (node, key, attrName, eventName) {
    // 更改 this 指向
    const updateFn = this[`${attrName}Updater`].bind(this)
    updateFn(node, key, this.vm[key], eventName)
  }

  // 处理 v-text 指令
  textUpdater (node, key, value) {
    node.textContent = value

    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }

  //处理 v-html 指令
  htmlUpdater (node, key, value,) {
    node.innerHTML = value

    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }

  //处理 v-on 指令
  onUpdater (node, key, value, eventName) {
    node.addEventListener(eventName, () => {
      this.vm[key].bind(this.vm)()
    })
  }

  // 处理 v-model 指令
  modelUpdater (node, key, value) {
    node.value = value

    // 实现双向绑定
    node.addEventListener('input', (e) => {
      this.vm[key] = node.value
    })

    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
  }

  // 编译文本节点，处理差值表达式
  compileText (node) {
    const reg = /\{\{(.+?)\}\}/
    const value = node.textContent
    if (reg.test(value)) {
      const key = RegExp.$1.trim()
      node.textContent = value.replace(reg, this.vm[key])

      // 创建 watcher 对象，当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
  }

  // 判断元素属性是否为指令
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }

  // 判断节点是否为文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }

  // 判断节点是否为元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}