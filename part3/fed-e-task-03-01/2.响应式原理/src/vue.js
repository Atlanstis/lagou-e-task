class Vue {
  constructor (options) {
    // 1. 通过属性保存选项中的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把 data 中的成员转换成 geter 和 setter，注入到 Vue 实例中
    this._proxyData(this.$data)
    // 将 methods 成员 注入 Vue 实例
    this._proxyMethod(options.methods || {})
    // 3. 调用 Observer 对象，监听数据的变化
    new Observer(this.$data)
    // 4. 调用 Compiler 对象，解析指令和差值表达式
    new Compiler(this)
  }

  _proxyData (data) {
    // 遍历 data 中的所有属性
    Object.keys(data).forEach((key) => {
      // 把 data 的属性注入到 vue 实例中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newVal) {
          if (newVal === data[key]) {
            return
          }
          data[key] = newVal
        }
      })
    })
  }

  _proxyMethod (methods) {
    Object.keys(methods).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return methods[key]
        }
      })
    })
  }
}