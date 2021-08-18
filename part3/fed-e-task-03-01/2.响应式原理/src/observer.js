class Observer {
  constructor (data) {
    this.walk(data)
  }

  walk (data) {
    // 1. 判断 data 是不是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历 data 的所有属性
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key])
    })
  }

  defineReactive (data, key, value) {
    const _this = this
    // 负责收集依赖，并发送通知
    const dep = new Dep()
    // 当 value 为对象格式时，将 value 内的属性转化为响应式数据
    this.walk(value)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get () {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        // 不使用 data[key] 获取 val， 是为了防止递归调用，堆栈溢出
        return value
      },
      set (newValue) {
        if (newValue === value) {
          return
        }
        value = newValue
        // 新赋值的属性为对象时，将其转换为响应式对象
        _this.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}