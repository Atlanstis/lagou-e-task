class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm
    // data 中的属性名称
    this.key = key
    // 回调函数，负责更新视图
    this.cb = cb

    // 把 watcher 对象记录到 Dep 类的静态属性 target 中
    Dep.target = this
    // 触发 get 方法，在 get 方法中会调用 addSub 方法
    this.oldValue = vm[key]
    // 添加完后清除
    Dep.target = null
  }

  // 当数据发生变化时，更新视图
  update () {
    const newValue = this.vm[this.key]
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue)
  }
}
